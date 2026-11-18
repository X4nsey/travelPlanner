import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';
import { prisma } from '../lib/prisma';

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

function shiftIsoDate(dateStr: string, days: number): string {
  const baseMs = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  return new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function runTests() {
  console.log('🧪 [Templates & Duplication] Инициализация БД и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const user1Email = `templates.owner.${suffix}@example.com`;
  const user2Email = `templates.other.${suffix}@example.com`;

  try {
    // 1. Получение каталога готовых маршрутов (без авторизации)
    const templatesRes = await request(baseUrl, 'GET', '/api/trips/templates');
    assert.equal(templatesRes.status, 200);
    assert.equal(templatesRes.body?.success, true);

    const templates = templatesRes.body?.data?.templates as any[];
    assert.ok(Array.isArray(templates), 'templates должен быть массивом');
    assert.equal(templates.length, 7, 'В каталоге должно быть 7 готовых маршрутов');

    for (const tpl of templates) {
      assert.ok(tpl.id && tpl.slug && tpl.title && tpl.country && tpl.city);
      assert.ok(tpl.durationDays >= 1);
      assert.ok(Array.isArray(tpl.events) && tpl.events.length > 0);
      for (const ev of tpl.events) {
        assert.ok(
          ev.dayOffset >= 0 && ev.dayOffset < tpl.durationDays,
          `Некорректный dayOffset ${ev.dayOffset} в шаблоне ${tpl.id}`
        );
      }
    }
    console.log('✅ 1. GET /api/trips/templates вернул 7 валидных кураторских маршрутов');

    // Регистрация основного пользователя
    const reg1 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Тестер Шаблонов',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg1.status, 201);
    const user1Cookies = reg1.cookies;

    // 2. Создание поездки из шаблона
    const fromTemplateRes = await request(baseUrl, 'POST', '/api/trips/from-template', {
      cookies: user1Cookies,
      body: {
        templateId: 'istanbul-weekend-3d',
        startDate: '2026-05-10',
        travelersCount: 2,
        autoGeneratePacking: true,
        autoSeedDocuments: true,
      },
    });
    assert.equal(fromTemplateRes.status, 201);
    const createdTrip = fromTemplateRes.body.data.trip;

    assert.equal(createdTrip.title, 'Уикенд в Стамбуле: два континента');
    assert.equal(createdTrip.country, 'Турция');
    assert.equal(createdTrip.city, 'Стамбул');
    assert.equal(createdTrip.startDate, '2026-05-10');
    assert.equal(createdTrip.endDate, '2026-05-12');
    assert.equal(createdTrip.durationDays, 3);
    assert.equal(createdTrip.travelersCount, 2);
    assert.ok(Array.isArray(createdTrip.events) && createdTrip.events.length === 8);

    const allowedDates = new Set(['2026-05-10', '2026-05-11', '2026-05-12']);
    for (const ev of createdTrip.events) {
      assert.ok(allowedDates.has(ev.date), `Неожиданная дата события: ${ev.date}`);
    }

    // Проверка автогенерации списка вещей
    const packingRes = await request(baseUrl, 'GET', `/api/trips/${createdTrip.id}/packing`, {
      cookies: user1Cookies,
    });
    assert.equal(packingRes.status, 200);
    assert.equal(packingRes.body.data.exists, true);
    assert.ok(packingRes.body.data.items.length > 0, 'Список вещей должен быть сгенерирован');

    // Проверка базового чек-листа документов
    const docsRes = await request(baseUrl, 'GET', `/api/trips/${createdTrip.id}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(docsRes.status, 200);
    assert.equal(docsRes.body.data.documents.length, 4);
    for (const doc of docsRes.body.data.documents) {
      assert.equal(doc.status, 'REQUIRED');
    }
    console.log('✅ 2. POST /api/trips/from-template создал поездку, события, список вещей и чек-лист документов');

    // 3. Подготовка данных для проверки дублирования
    const originalPackingItems = packingRes.body.data.items as any[];
    assert.ok(originalPackingItems.length >= 2);

    // Отмечаем 2 вещи собранными
    const packPatch1 = await request(baseUrl, 'PATCH', `/api/packing/${originalPackingItems[0].id}`, {
      cookies: user1Cookies,
      body: { isPacked: true },
    });
    assert.equal(packPatch1.status, 200);

    const packPatch2 = await request(baseUrl, 'PATCH', `/api/packing/${originalPackingItems[1].id}`, {
      cookies: user1Cookies,
      body: { isPacked: true },
    });
    assert.equal(packPatch2.status, 200);

    // Добавляем кастомную вещь
    const customPackRes = await request(baseUrl, 'POST', `/api/trips/${createdTrip.id}/packing/items`, {
      cookies: user1Cookies,
      body: {
        name: 'Плёночный фотоаппарат',
        category: 'TECH',
        quantity: 1,
      },
    });
    assert.equal(customPackRes.status, 201);

    // Добавляем документ со статусом READY, referenceCode и вложением
    const customDocRes = await request(baseUrl, 'POST', `/api/trips/${createdTrip.id}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Посадочный талон Turkish Airlines',
        category: 'FLIGHT_TICKET',
        status: 'READY',
        provider: 'Turkish Airlines',
        referenceCode: 'PNR778899',
        eventDate: '2026-05-10',
        endDate: '2026-05-12',
        notes: 'Терминал 1',
        fileName: 'boarding-pass.pdf',
        fileMimeType: 'application/pdf',
        fileSize: 12345,
      },
    });
    assert.equal(customDocRes.status, 201);

    // Добавляем расход, который НЕ должен копироваться в дубликат
    const expenseRes = await request(baseUrl, 'POST', `/api/trips/${createdTrip.id}/expenses`, {
      cookies: user1Cookies,
      body: {
        category: 'TRANSPORT',
        amount: 15000,
        currency: 'RUB',
        expenseDate: '2026-05-10',
        description: 'Авиабилеты Москва — Стамбул',
      },
    });
    assert.equal(expenseRes.status, 201);

    // Дублируем поездку на новую дату 2026-08-20 (сдвиг +102 дня)
    const duplicateRes = await request(baseUrl, 'POST', `/api/trips/${createdTrip.id}/duplicate`, {
      cookies: user1Cookies,
      body: {
        startDate: '2026-08-20',
      },
    });
    assert.equal(duplicateRes.status, 201);
    const dupTrip = duplicateRes.body.data.trip;

    assert.equal(dupTrip.title, 'Уикенд в Стамбуле: два континента (копия)');
    assert.equal(dupTrip.startDate, '2026-08-20');
    assert.equal(dupTrip.endDate, '2026-08-22');
    assert.equal(dupTrip.durationDays, 3);
    assert.equal(dupTrip.events.length, createdTrip.events.length);

    const dayShiftMs =
      new Date('2026-08-20T00:00:00.000Z').getTime() -
      new Date('2026-05-10T00:00:00.000Z').getTime();
    const dayShiftDays = Math.round(dayShiftMs / (24 * 60 * 60 * 1000));

    for (let i = 0; i < createdTrip.events.length; i += 1) {
      const origEv = createdTrip.events[i];
      const dupEv = dupTrip.events[i];
      assert.equal(dupEv.title, origEv.title);
      assert.equal(dupEv.date, shiftIsoDate(origEv.date, dayShiftDays));
    }

    // Проверка сброса isPacked у списка вещей в дубликате
    const dupPackingRes = await request(baseUrl, 'GET', `/api/trips/${dupTrip.id}/packing`, {
      cookies: user1Cookies,
    });
    assert.equal(dupPackingRes.status, 200);
    assert.equal(dupPackingRes.body.data.exists, true);
    assert.equal(dupPackingRes.body.data.items.length, originalPackingItems.length + 1);
    assert.equal(dupPackingRes.body.data.summary.packed, 0);
    for (const item of dupPackingRes.body.data.items) {
      assert.equal(item.isPacked, false, `Вещь ${item.name} должна иметь isPacked=false`);
    }

    // Проверка Privacy-by-Design у скопированных документов
    const dupDocsRes = await request(baseUrl, 'GET', `/api/trips/${dupTrip.id}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(dupDocsRes.status, 200);
    assert.equal(dupDocsRes.body.data.documents.length, 5);
    for (const doc of dupDocsRes.body.data.documents) {
      assert.equal(doc.status, 'REQUIRED');
      assert.equal(doc.referenceCode, '');
      assert.equal(doc.eventDate, null);
      assert.equal(doc.endDate, null);
      assert.equal(doc.hasAttachment, false);
      assert.equal(doc.fileName, null);
      assert.equal(doc.fileMimeType, null);
      assert.equal(doc.fileSize, null);
    }

    // Проверка отсутствия копирования расходов
    const dupExpensesRes = await request(baseUrl, 'GET', `/api/trips/${dupTrip.id}/expenses`, {
      cookies: user1Cookies,
    });
    assert.equal(dupExpensesRes.status, 200);
    assert.equal(dupExpensesRes.body.data.expenses.length, 0);
    assert.equal(dupExpensesRes.body.data.summary.totalSpent, 0);
    console.log('✅ 3. POST /api/trips/:id/duplicate сдвинул даты, сбросил isPacked и очистил конфиденциальные данные документов');

    // 4. Проверка доступа чужого пользователя (403) и валидации дат (400)
    const reg2 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Посторонний Пользователь',
        email: user2Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg2.status, 201);
    const user2Cookies = reg2.cookies;

    const forbiddenDupRes = await request(
      baseUrl,
      'POST',
      `/api/trips/${createdTrip.id}/duplicate`,
      {
        cookies: user2Cookies,
        body: {
          startDate: '2026-09-01',
        },
      }
    );
    assert.equal(forbiddenDupRes.status, 403);

    const invalidDateDupRes = await request(
      baseUrl,
      'POST',
      `/api/trips/${createdTrip.id}/duplicate`,
      {
        cookies: user1Cookies,
        body: {
          startDate: '2026-02-30',
        },
      }
    );
    assert.equal(invalidDateDupRes.status, 400);

    const invalidDateTemplateRes = await request(baseUrl, 'POST', '/api/trips/from-template', {
      cookies: user1Cookies,
      body: {
        templateId: 'istanbul-weekend-3d',
        startDate: 'not-a-date',
      },
    });
    assert.equal(invalidDateTemplateRes.status, 400);

    const missingTemplateRes = await request(baseUrl, 'POST', '/api/trips/from-template', {
      cookies: user1Cookies,
      body: {
        templateId: 'non-existent-template',
        startDate: '2026-06-01',
      },
    });
    assert.equal(missingTemplateRes.status, 404);
    console.log('✅ 4. Защита от дублирования чужой поездки (403) и валидация дат/шаблона (400/404) проверены');

    console.log('\n🎉 Все интеграционные сценарии шаблонов маршрутов и дублирования поездок успешно пройдены!');
  } finally {
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах шаблонов и дублирования:', err);
  process.exit(1);
});
