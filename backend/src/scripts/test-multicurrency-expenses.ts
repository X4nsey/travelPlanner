import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';
import { prisma } from '../lib/prisma';
import {
  CBR_DAILY_JSON_URL,
  convertAmount,
  ExchangeRateService,
  FALLBACK_RUB_PER_UNIT,
  getExchangeRate,
} from '../services/exchange-rate.service';

interface TestResponse {
  status: number;
  body: any;
  cookies: Record<string, string>;
}

const originalFetch = globalThis.fetch;

type CbrMockMode = 'success' | 'network_error' | 'http_500';
let cbrMockMode: CbrMockMode = 'success';
let cbrFetchCalls = 0;
let mockUsdRub = 90;
let mockEurRub = 100;

function installFetchMock() {
  globalThis.fetch = (async (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.startsWith(CBR_DAILY_JSON_URL)) {
      cbrFetchCalls += 1;

      if (cbrMockMode === 'network_error') {
        throw new Error('Mock network error: ECONNREFUSED');
      }

      if (cbrMockMode === 'http_500') {
        return new Response('Internal Server Error', { status: 500 });
      }

      const payload = {
        Date: new Date().toISOString(),
        Valute: {
          USD: {
            CharCode: 'USD',
            Nominal: 1,
            Value: mockUsdRub,
          },
          EUR: {
            CharCode: 'EUR',
            Nominal: 1,
            Value: mockEurRub,
          },
        },
      };

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  }) as typeof fetch;
}

async function request(
  baseUrl: string,
  method: string,
  path: string,
  options: {
    body?: any;
    cookies?: Record<string, string>;
    includeCsrf?: boolean;
  } = {}
): Promise<TestResponse> {
  const { body, cookies = {}, includeCsrf = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const cookieParts = Object.entries(cookies).map(([k, v]) => `${k}=${v}`);
  if (cookieParts.length > 0) {
    headers['Cookie'] = cookieParts.join('; ');
  }

  if (includeCsrf) {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    if (cookies['travelplanner_csrf']) {
      headers['X-CSRF-Token'] = cookies['travelplanner_csrf'];
    }
  }

  const res = await originalFetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const newCookies: Record<string, string> = { ...cookies };
  const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const sc of setCookieHeaders) {
    const firstPart = sc.split(';')[0];
    const eqIdx = firstPart.indexOf('=');
    if (eqIdx > 0) {
      const name = firstPart.slice(0, eqIdx).trim();
      const val = firstPart.slice(eqIdx + 1).trim();
      if (val === '') {
        delete newCookies[name];
      } else {
        newCookies[name] = val;
      }
    }
  }

  const json = await res.json().catch(() => null);
  return {
    status: res.status,
    body: json,
    cookies: newCookies,
  };
}

async function runTests() {
  console.log('🧪 [Multicurrency & Analytics] Инициализация БД и тестового сервера...');
  await ensureDatabaseReady();

  // Save existing ExchangeRateCache rows to restore cleanly after tests
  const existingCacheRows = await prisma.exchangeRateCache.findMany();

  installFetchMock();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const userEmail = `multicurrency.${suffix}@example.com`;

  try {
    // 1. Модульная проверка convertAmount и getExchangeRate
    const sampleRates = { RUB: 1, USD: 1 / 90, EUR: 1 / 100 };
    assert.equal(convertAmount(100, 'USD', 'RUB', sampleRates), 9000);
    assert.equal(convertAmount(50, 'EUR', 'RUB', sampleRates), 5000);
    assert.equal(convertAmount(123.456, 'RUB', 'RUB', sampleRates), 123.46);
    assert.equal(getExchangeRate('RUB', 'RUB', sampleRates), 1);
    assert.equal(getExchangeRate('USD', 'RUB', sampleRates), 90);
    console.log('✅ 1. Модульные функции convertAmount и getExchangeRate проверены');

    // Регистрация тестового пользователя
    const regRes = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Алексей Мультивалютный',
        email: userEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(regRes.status, 201);
    const cookies = regRes.cookies;

    // Создаём поездку в RUB: 5 дней (2026-09-01 — 2026-09-05), 2 путешественника, бюджет 50000 RUB
    const tripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Европейский маршрут',
        country: 'Италия',
        city: 'Рим',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        travelersCount: 2,
        budget: 50000,
        currency: 'RUB',
        description: 'Проверка мультивалютных расходов',
      },
    });
    assert.equal(tripRes.status, 201);
    const rubTripId = tripRes.body.data.trip.id as string;

    // 2. Fallback без кэша в БД при ошибке сети
    await prisma.exchangeRateCache.deleteMany();
    ExchangeRateService.clearMemoryCache();
    cbrMockMode = 'network_error';
    cbrFetchCalls = 0;

    const fallbackResult = await ExchangeRateService.getRatesForBase('RUB');
    assert.equal(fallbackResult.baseCurrency, 'RUB');
    assert.equal(fallbackResult.isFallback, true);
    assert.equal(fallbackResult.source, 'fallback');
    assert.equal(cbrFetchCalls, 1);
    assert.equal(
      convertAmount(10, 'USD', 'RUB', fallbackResult.rates),
      Math.round(10 * FALLBACK_RUB_PER_UNIT.USD * 100) / 100
    );

    // Проверим API расходов при полном отсутствии сети и кэша
    const fallbackApiRes = await request(baseUrl, 'GET', `/api/trips/${rubTripId}/expenses`, {
      cookies,
    });
    assert.equal(fallbackApiRes.status, 200);
    assert.equal(fallbackApiRes.body.data.summary.exchangeRates.isFallback, true);
    console.log('✅ 2. Резервные курсы (fallback) при отсутствии кэша и ошибке сети работают');

    // 3. Загрузка курсов от ЦБ (мок: 1 USD = 90 RUB, 1 EUR = 100 RUB) и расчёт сводки
    await prisma.exchangeRateCache.deleteMany();
    ExchangeRateService.clearMemoryCache();
    cbrMockMode = 'success';
    mockUsdRub = 90;
    mockEurRub = 100;
    cbrFetchCalls = 0;

    // Создаём смесь трат в RUB, USD, EUR
    const exp1 = await request(baseUrl, 'POST', `/api/trips/${rubTripId}/expenses`, {
      cookies,
      body: {
        category: 'TRANSPORT',
        amount: 10000,
        currency: 'RUB',
        expenseDate: '2026-09-01',
        description: 'Авиабилеты',
      },
    });
    assert.equal(exp1.status, 201);
    assert.equal(exp1.body.data.expense.convertedAmount, 10000);
    assert.equal(exp1.body.data.expense.exchangeRateUsed, 1);

    const exp2 = await request(baseUrl, 'POST', `/api/trips/${rubTripId}/expenses`, {
      cookies,
      body: {
        category: 'LODGING',
        amount: 100,
        currency: 'USD',
        expenseDate: '2026-09-01',
        description: 'Отель (1-й взнос)',
      },
    });
    assert.equal(exp2.status, 201);
    assert.equal(exp2.body.data.expense.convertedAmount, 9000);
    assert.equal(exp2.body.data.expense.exchangeRateUsed, 90);

    const exp3 = await request(baseUrl, 'POST', `/api/trips/${rubTripId}/expenses`, {
      cookies,
      body: {
        category: 'FOOD',
        amount: 50,
        currency: 'EUR',
        expenseDate: '2026-09-02',
        description: 'Ужин в траттории',
      },
    });
    assert.equal(exp3.status, 201);
    assert.equal(exp3.body.data.expense.convertedAmount, 5000);
    assert.equal(exp3.body.data.expense.exchangeRateUsed, 100);

    const exp4 = await request(baseUrl, 'POST', `/api/trips/${rubTripId}/expenses`, {
      cookies,
      body: {
        category: 'ENTERTAINMENT',
        amount: 20,
        currency: 'USD',
        expenseDate: '2026-09-04',
        description: 'Билеты в музей',
      },
    });
    assert.equal(exp4.status, 201);
    assert.equal(exp4.body.data.expense.convertedAmount, 1800);
    assert.equal(exp4.body.data.expense.exchangeRateUsed, 90);

    assert.equal(
      cbrFetchCalls,
      1,
      'Курс должен загрузиться один раз и закэшироваться в памяти/БД'
    );

    const summaryRes = await request(baseUrl, 'GET', `/api/trips/${rubTripId}/expenses`, {
      cookies,
    });
    assert.equal(summaryRes.status, 200);
    const { expenses, summary } = summaryRes.body.data;

    assert.equal(expenses.length, 4);
    assert.equal(summary.currency, 'RUB');
    assert.equal(summary.plannedBudget, 50000);
    assert.equal(summary.totalSpent, 25800); // 10000 + 9000 + 5000 + 1800
    assert.equal(summary.remainingBudget, 24200);
    assert.equal(summary.spentPercentage, 51.6);
    assert.equal(summary.status, 'under_budget');
    assert.equal(summary.dailyAverage, 5160); // 25800 / 5 days
    assert.equal(summary.perTravelerAverage, 12900); // 25800 / 2 travelers
    assert.equal(summary.exchangeRates.baseCurrency, 'RUB');
    assert.equal(summary.exchangeRates.isFallback, false);
    assert.equal(summary.exchangeRates.source, 'cbr');

    assert.deepEqual(summary.byDay, [
      { date: '2026-09-01', totalAmount: 19000, count: 2 },
      { date: '2026-09-02', totalAmount: 5000, count: 1 },
      { date: '2026-09-04', totalAmount: 1800, count: 1 },
    ]);

    const byCatMap = Object.fromEntries(summary.byCategory.map((c: any) => [c.category, c]));
    assert.equal(byCatMap.TRANSPORT.totalAmount, 10000);
    assert.equal(byCatMap.LODGING.totalAmount, 9000);
    assert.equal(byCatMap.FOOD.totalAmount, 5000);
    assert.equal(byCatMap.ENTERTAINMENT.totalAmount, 1800);
    assert.equal(byCatMap.SHOPPING.totalAmount, 0);
    console.log('✅ 3. Мультивалютный пересчёт, dailyAverage, perTravelerAverage, byDay и byCategory проверены');

    // 4. Проверка кэша ExchangeRateCache в PostgreSQL после сброса in-memory кэша
    const cachedDbRow = await prisma.exchangeRateCache.findUnique({
      where: { baseCurrency: 'RUB' },
    });
    assert.ok(cachedDbRow, 'Запись для RUB должна быть сохранена в ExchangeRateCache');
    assert.equal(cachedDbRow.source, 'cbr');

    ExchangeRateService.clearMemoryCache();
    const callsBeforeDbHit = cbrFetchCalls;
    const dbCacheApiRes = await request(baseUrl, 'GET', `/api/trips/${rubTripId}/expenses`, {
      cookies,
    });
    assert.equal(dbCacheApiRes.status, 200);
    assert.equal(dbCacheApiRes.body.data.summary.totalSpent, 25800);
    assert.equal(
      cbrFetchCalls,
      callsBeforeDbHit,
      'После очистки in-memory кэша свежий кэш должен читаться из PostgreSQL без обращения к API'
    );
    console.log('✅ 4. Кэш PostgreSQL ExchangeRateCache корректно перехватывает запросы без сетевого вызова');

    // 5. Проверка использования устаревшего кэша из БД при сбое внешнего API
    await prisma.exchangeRateCache.update({
      where: { baseCurrency: 'RUB' },
      data: { fetchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    ExchangeRateService.clearMemoryCache();
    cbrMockMode = 'http_500';
    const callsBeforeStaleFallback = cbrFetchCalls;

    const staleFallbackRes = await request(baseUrl, 'GET', `/api/trips/${rubTripId}/expenses`, {
      cookies,
    });
    assert.equal(staleFallbackRes.status, 200);
    assert.equal(
      cbrFetchCalls,
      callsBeforeStaleFallback + 1,
      'При устаревшем кэше сервис должен попытаться обновить курсы по сети'
    );
    assert.equal(staleFallbackRes.body.data.summary.totalSpent, 25800);
    assert.equal(staleFallbackRes.body.data.summary.exchangeRates.isFallback, false);
    assert.equal(staleFallbackRes.body.data.summary.exchangeRates.source, 'cbr');
    console.log('✅ 5. При ошибке внешнего API используется последний сохранённый кэш из БД');

    // 6. Проверка поездки с базовой валютой EUR
    cbrMockMode = 'success';
    ExchangeRateService.clearMemoryCache();

    const eurTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Уикенд в Париже',
        country: 'Франция',
        city: 'Париж',
        startDate: '2026-10-10',
        endDate: '2026-10-13',
        travelersCount: 3,
        budget: 500,
        currency: 'EUR',
      },
    });
    assert.equal(eurTripRes.status, 201);
    const eurTripId = eurTripRes.body.data.trip.id as string;

    await request(baseUrl, 'POST', `/api/trips/${eurTripId}/expenses`, {
      cookies,
      body: { category: 'LODGING', amount: 100, currency: 'EUR', expenseDate: '2026-10-10' },
    });
    await request(baseUrl, 'POST', `/api/trips/${eurTripId}/expenses`, {
      cookies,
      body: { category: 'FOOD', amount: 100, currency: 'USD', expenseDate: '2026-10-11' }, // 9000 RUB = 90 EUR
    });
    await request(baseUrl, 'POST', `/api/trips/${eurTripId}/expenses`, {
      cookies,
      body: { category: 'TRANSPORT', amount: 5000, currency: 'RUB', expenseDate: '2026-10-11' }, // 50 EUR
    });

    const eurListRes = await request(baseUrl, 'GET', `/api/trips/${eurTripId}/expenses`, {
      cookies,
    });
    assert.equal(eurListRes.status, 200);
    const eurSummary = eurListRes.body.data.summary;
    assert.equal(eurSummary.currency, 'EUR');
    assert.equal(eurSummary.totalSpent, 240);
    assert.equal(eurSummary.remainingBudget, 260);
    assert.equal(eurSummary.spentPercentage, 48);
    assert.equal(eurSummary.dailyAverage, 60); // 240 / 4 days
    assert.equal(eurSummary.perTravelerAverage, 80); // 240 / 3 travelers
    assert.equal(eurSummary.exchangeRates.baseCurrency, 'EUR');
    assert.deepEqual(eurSummary.byDay, [
      { date: '2026-10-10', totalAmount: 100, count: 1 },
      { date: '2026-10-11', totalAmount: 140, count: 2 },
    ]);
    console.log('✅ 6. Конвертация RUB/USD/EUR в базовую валюту поездки EUR проверена');

    console.log('\n🎉 Все 6 интеграционных сценариев мультивалютного пересчёта и финансовой аналитики успешно пройдены!');
  } finally {
    globalThis.fetch = originalFetch;
    ExchangeRateService.clearMemoryCache();

    await prisma.user.deleteMany({
      where: { email: userEmail },
    });

    await prisma.exchangeRateCache.deleteMany();
    for (const row of existingCacheRows) {
      await prisma.exchangeRateCache.create({
        data: {
          baseCurrency: row.baseCurrency,
          ratesJson: row.ratesJson,
          source: row.source,
          fetchedAt: row.fetchedAt,
        },
      });
    }

    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах мультивалютных расходов:', err);
  process.exit(1);
});
