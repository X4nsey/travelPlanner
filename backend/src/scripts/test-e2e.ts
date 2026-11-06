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

async function runTests() {
  console.log('🧪 [E2E Test] Инициализация базы данных и запуск тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const testSuffix = Date.now();
  const user1Email = `ivan.${testSuffix}@example.com`;
  const user2Email = `maria.${testSuffix}@example.com`;

  try {
    // 1. Healthcheck
    const health = await request(baseUrl, 'GET', '/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.data.status, 'ok');
    console.log('✅ 1. Healthcheck пройден');

    // 2. Register User 1
    const reg1 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Иван Петров',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg1.status, 201);
    assert.equal(reg1.body.data.user.email, user1Email);
    assert.ok(reg1.cookies['travelplanner_session'], 'Должна быть установлена сессионная cookie');
    let user1Cookies = reg1.cookies;
    console.log('✅ 2. Регистрация пользователя 1 и выдача HttpOnly сессии пройдены');

    // 3. Duplicate email check
    const dupReg = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Дубликат',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(dupReg.status, 409);
    console.log('✅ 3. Защита от дублирования email (409) работает');

    // 4. Check /api/auth/me persistence
    const me1 = await request(baseUrl, 'GET', '/api/auth/me', { cookies: user1Cookies });
    assert.equal(me1.status, 200);
    assert.equal(me1.body.data.user.name, 'Иван Петров');
    console.log('✅ 4. Проверка текущей сессии (/api/auth/me) работает');

    // 5. CSRF Protection Check
    const csrfFail = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      includeCsrf: false,
      body: {
        title: 'CSRF Trip',
        country: 'Россия',
        city: 'Москва',
        startDate: '2026-06-10',
        endDate: '2026-06-12',
        travelersCount: 1,
        budget: 10000,
        currency: 'RUB',
      },
    });
    assert.equal(csrfFail.status, 403);
    console.log('✅ 5. Защита от CSRF для сессионных cookie (403 без заголовка) работает');

    // 6. Trip Validation Checks
    const invalidDatesTrip = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Неверные даты',
        country: 'Россия',
        city: 'Сочи',
        startDate: '2026-06-15',
        endDate: '2026-06-10',
        travelersCount: 2,
        budget: 50000,
        currency: 'RUB',
      },
    });
    assert.equal(invalidDatesTrip.status, 400);

    // 7. Create Valid Trip (10 to 12 June = 3 days)
    const createTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Летнее путешествие в Казань',
        country: 'Россия',
        city: 'Казань',
        startDate: '2026-06-10',
        endDate: '2026-06-12',
        travelersCount: 2,
        budget: 45000,
        currency: 'RUB',
        description: 'Знакомство с историческим центром и гастрономией',
      },
    });
    assert.equal(createTripRes.status, 201);
    const trip1 = createTripRes.body.data.trip;
    assert.equal(trip1.durationDays, 3, 'Поездка с 10 по 12 июня должна длиться 3 календарных дня');
    console.log('✅ 6. Создание поездки и расчёт длительности (3 дня) работают');

    // 8. Create Events & Test Chronological Sorting + Validation
    const outOfRangeEvent = await request(baseUrl, 'POST', `/api/trips/${trip1.id}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Событие вне дат поездки',
        date: '2026-06-15',
      },
    });
    assert.equal(outOfRangeEvent.status, 400);

    const invalidTimeEvent = await request(baseUrl, 'POST', `/api/trips/${trip1.id}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Событие с неверным временем',
        date: '2026-06-10',
        startTime: '15:00',
        endTime: '12:00',
      },
    });
    assert.equal(invalidTimeEvent.status, 400);

    // Create afternoon event first, then morning event on 2026-06-10
    const evAfternoon = await request(baseUrl, 'POST', `/api/trips/${trip1.id}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Обед на улице Баумана',
        date: '2026-06-10',
        startTime: '14:00',
        endTime: '15:30',
        location: 'ул. Баумана',
        estimatedCost: 3500,
        note: 'Попробовать эчпочмак и чак-чак',
      },
    });
    assert.equal(evAfternoon.status, 201);

    const evMorning = await request(baseUrl, 'POST', `/api/trips/${trip1.id}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Экскурсия в Казанский Кремль',
        date: '2026-06-10',
        startTime: '10:00',
        endTime: '12:30',
        location: 'Казанский Кремль',
        estimatedCost: 2000,
      },
    });
    assert.equal(evMorning.status, 201);

    const listEvents = await request(baseUrl, 'GET', `/api/trips/${trip1.id}/events`, {
      cookies: user1Cookies,
    });
    assert.equal(listEvents.status, 200);
    assert.equal(listEvents.body.data.events.length, 2);
    assert.equal(
      listEvents.body.data.events[0].title,
      'Экскурсия в Казанский Кремль',
      'Мероприятия должны возвращаться в хронологическом порядке (10:00 перед 14:00)'
    );
    console.log('✅ 7. Создание мероприятий, проверка дат/времени и хронологическая сортировка работают');

    // 9. Register User 2 & Verify Ownership Isolation (403 Forbidden)
    const reg2 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Мария Соколова',
        email: user2Email,
        password: 'password456',
        confirmPassword: 'password456',
      },
    });
    assert.equal(reg2.status, 201);
    const user2Cookies = reg2.cookies;

    const user2GetUser1Trip = await request(baseUrl, 'GET', `/api/trips/${trip1.id}`, {
      cookies: user2Cookies,
    });
    assert.equal(user2GetUser1Trip.status, 403, 'Чужая поездка должна возвращать 403');

    const user2PatchUser1Event = await request(
      baseUrl,
      'PATCH',
      `/api/events/${evMorning.body.data.event.id}`,
      {
        cookies: user2Cookies,
        body: { title: 'Взлом' },
      }
    );
    assert.equal(user2PatchUser1Event.status, 403, 'Чужое мероприятие должно возвращать 403');
    console.log('✅ 8. Защита от доступа к чужим поездкам и мероприятиям (403) работает');

    // 10. Profile Update & Password Change for User 1
    const updateProfile = await request(baseUrl, 'PATCH', '/api/users/me', {
      cookies: user1Cookies,
      body: { name: 'Иван Петров-Обновлённый' },
    });
    assert.equal(updateProfile.status, 200);
    assert.equal(updateProfile.body.data.user.name, 'Иван Петров-Обновлённый');

    const wrongPassChange = await request(baseUrl, 'PATCH', '/api/users/me/password', {
      cookies: user1Cookies,
      body: {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword789',
        confirmPassword: 'newpassword789',
      },
    });
    assert.equal(wrongPassChange.status, 400);

    const validPassChange = await request(baseUrl, 'PATCH', '/api/users/me/password', {
      cookies: user1Cookies,
      body: {
        currentPassword: 'password123',
        newPassword: 'newpassword789',
        confirmPassword: 'newpassword789',
      },
    });
    assert.equal(validPassChange.status, 200);

    // Login with new password
    const loginNewPass = await request(baseUrl, 'POST', '/api/auth/login', {
      body: {
        email: user1Email,
        password: 'newpassword789',
      },
    });
    assert.equal(loginNewPass.status, 200);
    user1Cookies = loginNewPass.cookies;
    console.log('✅ 9. Редактирование профиля и смена пароля с проверкой текущего пароля работают');

    // 11. Delete Trip & Verify Cascade Deletion of Events
    const deleteTripRes = await request(baseUrl, 'DELETE', `/api/trips/${trip1.id}`, {
      cookies: user1Cookies,
    });
    assert.equal(deleteTripRes.status, 200);

    const remainingEvents = await prisma.itineraryEvent.count({
      where: { tripId: trip1.id },
    });
    assert.equal(remainingEvents, 0, 'При удалении поездки её мероприятия должны удаляться каскадно');
    console.log('✅ 10. Удаление поездки и каскадное удаление мероприятий в PostgreSQL работают');

    // 12. Countries Catalog, Filter, Detail & Photos API
    const allCountriesRes = await request(baseUrl, 'GET', '/api/countries');
    assert.equal(allCountriesRes.status, 200);
    assert.ok(allCountriesRes.body.data.countries.length >= 30, 'Каталог должен содержать минимум 30 стран');

    const europeCountriesRes = await request(
      baseUrl,
      'GET',
      `/api/countries?continent=${encodeURIComponent('Европа')}&sort=desc`
    );
    assert.equal(europeCountriesRes.status, 200);
    assert.ok(
      europeCountriesRes.body.data.countries.every((c: any) => c.continent === 'Европа'),
      'Фильтрация по континенту Европа должна возвращать только европейские страны'
    );

    const franceDetailRes = await request(baseUrl, 'GET', '/api/countries/france');
    assert.equal(franceDetailRes.status, 200);
    assert.equal(franceDetailRes.body.data.country.nameRu, 'Франция');
    assert.equal(franceDetailRes.body.data.country.capital, 'Париж');
    assert.ok(franceDetailRes.body.data.country.gallery.length >= 4);

    const francePhotosRes = await request(baseUrl, 'GET', '/api/countries/france/photos');
    assert.equal(francePhotosRes.status, 200);
    assert.ok(francePhotosRes.body.data.coverPhoto.url);
    console.log('✅ 11. Каталог стран, фильтрация по континентам, детальная карточка и фото-сервис работают');

    // 13. Favorite Countries Persistence in PostgreSQL
    const addFav1 = await request(baseUrl, 'POST', '/api/favorites', {
      cookies: user1Cookies,
      body: { slug: 'france' },
    });
    assert.equal(addFav1.status, 201);

    const addFav2 = await request(baseUrl, 'POST', '/api/favorites/japan', {
      cookies: user1Cookies,
    });
    assert.equal(addFav2.status, 201);

    const listFavsUser1 = await request(baseUrl, 'GET', '/api/favorites', {
      cookies: user1Cookies,
    });
    assert.equal(listFavsUser1.status, 200);
    assert.deepEqual(listFavsUser1.body.data.slugs.sort(), ['france', 'japan']);

    const listFavsUser2 = await request(baseUrl, 'GET', '/api/favorites', {
      cookies: user2Cookies,
    });
    assert.equal(listFavsUser2.status, 200);
    assert.equal(listFavsUser2.body.data.slugs.length, 0, 'Избранные страны привязаны к конкретному пользователю');

    const removeFav1 = await request(baseUrl, 'DELETE', '/api/favorites/france', {
      cookies: user1Cookies,
    });
    assert.equal(removeFav1.status, 200);

    const listFavsAfterRemove = await request(baseUrl, 'GET', '/api/favorites', {
      cookies: user1Cookies,
    });
    assert.deepEqual(listFavsAfterRemove.body.data.slugs, ['japan']);
    console.log('✅ 12. Избранные страны в PostgreSQL (добавление, получение, удаление и изоляция пользователей) работают');

    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } },
    });

    console.log('\n🎉 Все 12 групп интеграционных тестов успешно пройдены!');
  } finally {
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в E2E тестах:', err);
  process.exit(1);
});
