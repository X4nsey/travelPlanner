import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';
import { prisma } from '../lib/prisma';
import { addDaysToDateOnly, getTodayDateOnlyStr } from '../services/trip.service';

interface TestResponse {
  status: number;
  body: any;
  cookies: Record<string, string>;
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

  const res = await fetch(`${baseUrl}${path}`, {
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
  console.log('🧪 [Traveler Stats] Инициализация БД и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const userEmail = `stats.user.${suffix}@example.com`;
  const emptyUserEmail = `stats.empty.${suffix}@example.com`;
  const today = getTodayDateOnlyStr();

  try {
    // 1. Проверка требования авторизации (401)
    const unauthRes = await request(baseUrl, 'GET', '/api/trips/stats');
    assert.equal(unauthRes.status, 401, 'Неавторизованный запрос GET /api/trips/stats должен вернуть 401');
    console.log('✅ 1. Неавторизованный GET /api/trips/stats корректно возвращает 401');

    // 2. Новый пользователь без поездок -> нулевые метрики и featuredTrip: null
    const regEmpty = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Новый Путешественник',
        email: emptyUserEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(regEmpty.status, 201);
    const emptyCookies = regEmpty.cookies;

    const emptyStatsRes = await request(baseUrl, 'GET', '/api/trips/stats', {
      cookies: emptyCookies,
    });
    assert.equal(emptyStatsRes.status, 200);
    assert.equal(emptyStatsRes.body?.success, true);

    const emptyStats = emptyStatsRes.body.data.stats;
    assert.equal(emptyStats.totalTrips, 0);
    assert.equal(emptyStats.upcomingTripsCount, 0);
    assert.equal(emptyStats.ongoingTripsCount, 0);
    assert.equal(emptyStats.completedTripsCount, 0);
    assert.equal(emptyStats.uniqueCountriesCount, 0);
    assert.equal(emptyStats.uniqueCitiesCount, 0);
    assert.equal(emptyStats.totalTravelDays, 0);
    assert.equal(emptyStats.totalEventsCount, 0);
    assert.deepEqual(emptyStats.countries, []);
    assert.equal(emptyStats.featuredTrip, null);
    console.log('✅ 2. Для нового пользователя без поездок возвращаются нули и featuredTrip: null');

    // 3. Основной пользователь с завершённой, двумя предстоящими и затем текущей поездкой
    const regMain = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Опытный Путешественник',
        email: userEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(regMain.status, 201);
    const cookies = regMain.cookies;

    // 3a. Завершённая поездка в Италию (Рим), 5 дней (today-20 .. today-16), 2 события
    const completedStart = addDaysToDateOnly(today, -20);
    const completedEnd = addDaysToDateOnly(today, -16);
    const completedTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Римские каникулы',
        country: 'Италия',
        city: 'Рим',
        startDate: completedStart,
        endDate: completedEnd,
        travelersCount: 2,
        budget: 120000,
        currency: 'RUB',
        tripType: 'SIGHTSEEING',
        description: 'Прошлая поездка в Рим',
      },
    });
    assert.equal(completedTripRes.status, 201);
    const completedTrip = completedTripRes.body.data.trip;

    await request(baseUrl, 'POST', `/api/trips/${completedTrip.id}/events`, {
      cookies,
      body: { title: 'Колизей', date: completedStart, description: 'Экскурсия' },
    });
    await request(baseUrl, 'POST', `/api/trips/${completedTrip.id}/events`, {
      cookies,
      body: { title: 'Ватикан', date: addDaysToDateOnly(today, -19), description: 'Музеи' },
    });

    // Проверка при наличии только завершённой поездки: featuredTrip === null
    const onlyCompletedStatsRes = await request(baseUrl, 'GET', '/api/trips/stats', { cookies });
    assert.equal(onlyCompletedStatsRes.status, 200);
    assert.equal(onlyCompletedStatsRes.body.data.stats.completedTripsCount, 1);
    assert.equal(onlyCompletedStatsRes.body.data.stats.featuredTrip, null);

    // 3b. Дальняя предстоящая поездка в Италию (Милан), 4 дня (today+30 .. today+33), 1 событие
    const farStart = addDaysToDateOnly(today, 30);
    const farEnd = addDaysToDateOnly(today, 33);
    const farTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Осенний Милан',
        country: 'Италия',
        city: 'Милан',
        startDate: farStart,
        endDate: farEnd,
        travelersCount: 1,
        budget: 90000,
        currency: 'RUB',
        tripType: 'SIGHTSEEING',
        description: 'Дальняя поездка',
      },
    });
    assert.equal(farTripRes.status, 201);
    const farTrip = farTripRes.body.data.trip;

    await request(baseUrl, 'POST', `/api/trips/${farTrip.id}/events`, {
      cookies,
      body: { title: 'Дуомо', date: farStart, description: 'Собор' },
    });

    // 3c. Ближайшая предстоящая поездка в Японию (Токио), 6 дней (today+5 .. today+10), 3 события
    const nearStart = addDaysToDateOnly(today, 5);
    const nearEnd = addDaysToDateOnly(today, 10);
    const nearTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Весна в Токио',
        country: 'Япония',
        city: 'Токио',
        startDate: nearStart,
        endDate: nearEnd,
        travelersCount: 2,
        budget: 250000,
        currency: 'RUB',
        tripType: 'SIGHTSEEING',
        description: 'Ближайшее путешествие',
      },
    });
    assert.equal(nearTripRes.status, 201);
    const nearTrip = nearTripRes.body.data.trip;

    for (let i = 0; i < 3; i += 1) {
      const evRes = await request(baseUrl, 'POST', `/api/trips/${nearTrip.id}/events`, {
        cookies,
        body: {
          title: `Локация Токио ${i + 1}`,
          date: addDaysToDateOnly(nearStart, i),
          description: 'План дня',
        },
      });
      assert.equal(evRes.status, 201);
    }

    // Добавляем 4 вещи в список вещей для nearTrip и отмечаем 3 собранными -> 75%
    const packingNames = ['Паспорт', 'Адаптер розетки', 'Кроссовки', 'Пауэрбанк'];
    const createdPackingIds: string[] = [];
    for (const name of packingNames) {
      const itemRes = await request(baseUrl, 'POST', `/api/trips/${nearTrip.id}/packing/items`, {
        cookies,
        body: { name, category: 'PERSONAL', quantity: 1 },
      });
      assert.equal(itemRes.status, 201);
      createdPackingIds.push(itemRes.body.data.item.id);
    }
    for (let i = 0; i < 3; i += 1) {
      const patchRes = await request(baseUrl, 'PATCH', `/api/packing/${createdPackingIds[i]}`, {
        cookies,
        body: { isPacked: true },
      });
      assert.equal(patchRes.status, 200);
    }

    // Добавляем 3 документа для nearTrip: 2 READY, 1 REQUIRED -> 67%
    const docStatuses = ['READY', 'READY', 'REQUIRED'] as const;
    for (let i = 0; i < docStatuses.length; i += 1) {
      const docRes = await request(baseUrl, 'POST', `/api/trips/${nearTrip.id}/documents`, {
        cookies,
        body: {
          title: `Документ Токио ${i + 1}`,
          category: 'OTHER',
          status: docStatuses[i],
        },
      });
      assert.equal(docRes.status, 201);
    }

    // Проверяем агрегаты и выбор ближайшей будущей поездки (nearTrip)
    const upcomingStatsRes = await request(baseUrl, 'GET', '/api/trips/stats', { cookies });
    assert.equal(upcomingStatsRes.status, 200);
    const stats1 = upcomingStatsRes.body.data.stats;

    assert.equal(stats1.totalTrips, 3);
    assert.equal(stats1.upcomingTripsCount, 2);
    assert.equal(stats1.ongoingTripsCount, 0);
    assert.equal(stats1.completedTripsCount, 1);
    assert.equal(stats1.uniqueCountriesCount, 2, 'Италия + Япония = 2 уникальные страны');
    assert.equal(stats1.uniqueCitiesCount, 3, 'Рим + Милан + Токио = 3 уникальных города');
    assert.equal(stats1.totalTravelDays, 5 + 4 + 6, '5 + 4 + 6 = 15 дней');
    assert.equal(stats1.totalEventsCount, 2 + 1 + 3, '2 + 1 + 3 = 6 событий');

    const italyEntry = stats1.countries.find((c: any) => c.country === 'Италия');
    const japanEntry = stats1.countries.find((c: any) => c.country === 'Япония');
    assert.ok(italyEntry, 'Италия должна быть в массиве countries');
    assert.equal(italyEntry.tripsCount, 2);
    assert.equal(italyEntry.isCompleted, true, 'У Италии есть завершённая поездка');
    assert.ok(japanEntry, 'Япония должна быть в массиве countries');
    assert.equal(japanEntry.tripsCount, 1);
    assert.equal(japanEntry.isCompleted, false, 'Япония только предстоит');

    assert.ok(stats1.featuredTrip, 'featuredTrip должен быть выбран');
    assert.equal(stats1.featuredTrip.id, nearTrip.id, 'Должна выбираться ближайшая предстоящая поездка');
    assert.equal(stats1.featuredTrip.timingStatus, 'upcoming');
    assert.equal(stats1.featuredTrip.daysUntilStart, 5);
    assert.equal(stats1.featuredTrip.durationDays, 6);
    assert.equal(stats1.featuredTrip.eventsCount, 3);
    assert.deepEqual(stats1.featuredTrip.packing, {
      totalCount: 4,
      packedCount: 3,
      percentage: 75,
    });
    assert.deepEqual(stats1.featuredTrip.documents, {
      totalCount: 3,
      readyCount: 2,
      percentage: 67,
    });
    console.log('✅ 3. Агрегаты, страны, ближайшая предстоящая поездка и проценты готовности рассчитаны точно');

    // 4. Добавляем текущую (ongoing) поездку (today-1 .. today+2, 4 дня) и проверяем приоритет ongoing
    const ongoingStart = addDaysToDateOnly(today, -1);
    const ongoingEnd = addDaysToDateOnly(today, 2);
    const ongoingTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies,
      body: {
        title: 'Стамбул прямо сейчас',
        country: 'Турция',
        city: 'Стамбул',
        startDate: ongoingStart,
        endDate: ongoingEnd,
        travelersCount: 2,
        budget: 80000,
        currency: 'RUB',
        tripType: 'MIXED',
        description: 'Активное путешествие',
      },
    });
    assert.equal(ongoingTripRes.status, 201);
    const ongoingTrip = ongoingTripRes.body.data.trip;

    // 1 событие для ongoingTrip
    const ongoingEvRes = await request(baseUrl, 'POST', `/api/trips/${ongoingTrip.id}/events`, {
      cookies,
      body: { title: 'Прогулка по Босфору', date: today, description: 'Теплоход' },
    });
    assert.equal(ongoingEvRes.status, 201);

    // 2 вещи в списке (1 собрана -> 50%) и 2 документа (2 READY -> 100%)
    const p1 = await request(baseUrl, 'POST', `/api/trips/${ongoingTrip.id}/packing/items`, {
      cookies,
      body: { name: 'Зонт', category: 'OTHER', quantity: 1 },
    });
    const p2 = await request(baseUrl, 'POST', `/api/trips/${ongoingTrip.id}/packing/items`, {
      cookies,
      body: { name: 'Очки', category: 'PERSONAL', quantity: 1 },
    });
    assert.equal(p1.status, 201);
    assert.equal(p2.status, 201);

    await request(baseUrl, 'PATCH', `/api/packing/${p1.body.data.item.id}`, {
      cookies,
      body: { isPacked: true },
    });

    // Сгенерированный и затем скрытый (dismissed) пункт не должен учитываться в статистике
    const genRes = await request(baseUrl, 'POST', `/api/trips/${ongoingTrip.id}/packing/generate`, {
      cookies,
    });
    assert.equal(genRes.status, 200);
    const generatedItems = (genRes.body.data.items as any[]).filter(
      (it) => it.source === 'GENERATED'
    );
    // Скрываем все сгенерированные пункты, чтобы остались только 2 кастомных (1/2 = 50%)
    for (const gItem of generatedItems) {
      const delRes = await request(baseUrl, 'DELETE', `/api/packing/${gItem.id}`, { cookies });
      assert.equal(delRes.status, 200);
    }

    for (let i = 0; i < 2; i += 1) {
      const dRes = await request(baseUrl, 'POST', `/api/trips/${ongoingTrip.id}/documents`, {
        cookies,
        body: {
          title: `Ваучер Стамбул ${i + 1}`,
          category: 'HOTEL_BOOKING',
          status: 'READY',
        },
      });
      assert.equal(dRes.status, 201);
    }

    const ongoingStatsRes = await request(baseUrl, 'GET', '/api/trips/stats', { cookies });
    assert.equal(ongoingStatsRes.status, 200);
    const stats2 = ongoingStatsRes.body.data.stats;

    assert.equal(stats2.totalTrips, 4);
    assert.equal(stats2.upcomingTripsCount, 2);
    assert.equal(stats2.ongoingTripsCount, 1);
    assert.equal(stats2.completedTripsCount, 1);
    assert.equal(stats2.uniqueCountriesCount, 3, 'Италия + Япония + Турция = 3 страны');
    assert.equal(stats2.uniqueCitiesCount, 4, 'Рим + Милан + Токио + Стамбул = 4 города');
    assert.equal(stats2.totalTravelDays, 15 + 4, '15 + 4 = 19 дней');
    assert.equal(stats2.totalEventsCount, 6 + 1, '6 + 1 = 7 событий');

    assert.ok(stats2.featuredTrip, 'featuredTrip должен быть выбран');
    assert.equal(
      stats2.featuredTrip.id,
      ongoingTrip.id,
      'Текущая (ongoing) поездка должна иметь приоритет над предстоящей'
    );
    assert.equal(stats2.featuredTrip.timingStatus, 'ongoing');
    assert.equal(stats2.featuredTrip.daysUntilStart, 0);
    assert.equal(stats2.featuredTrip.durationDays, 4);
    assert.equal(stats2.featuredTrip.eventsCount, 1);
    assert.deepEqual(stats2.featuredTrip.packing, {
      totalCount: 2,
      packedCount: 1,
      percentage: 50,
    });
    assert.deepEqual(stats2.featuredTrip.documents, {
      totalCount: 2,
      readyCount: 2,
      percentage: 100,
    });
    console.log('✅ 4. Приоритет текущей (ongoing) поездки, игнорирование dismissed-вещей и расчёт процентов подтверждены');

    console.log('\n🎉 Все интеграционные тесты статистики путешественника (Этап 12) успешно пройдены!');
  } finally {
    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, emptyUserEmail] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах статистики путешественника:', err);
  process.exit(1);
});
