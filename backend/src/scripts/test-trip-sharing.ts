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
  console.log('🧪 [Trip Sharing] Инициализация БД и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const ownerEmail = `share.owner.${suffix}@example.com`;
  const ownerName = `Приватный Владелец ${suffix}`;
  const companionEmail = `share.companion.${suffix}@example.com`;
  const today = getTodayDateOnlyStr();

  try {
    // 1. Регистрация владельца и попутчика
    const regOwner = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: ownerName,
        email: ownerEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(regOwner.status, 201, 'Регистрация владельца должна вернуть 201');
    const ownerCookies = regOwner.cookies;
    const ownerId = regOwner.body.data.user.id as string;

    const regCompanion = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Попутчик Тестовый',
        email: companionEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(regCompanion.status, 201, 'Регистрация попутчика должна вернуть 201');
    const companionCookies = regCompanion.cookies;
    const companionId = regCompanion.body.data.user.id as string;

    // 2. Владелец создаёт поездку с событиями, списком вещей, расходами и приватными документами
    const startDate = addDaysToDateOnly(today, 14);
    const endDate = addDaysToDateOnly(today, 17);

    const createTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: ownerCookies,
      body: {
        title: 'Римский уикенд с друзьями',
        country: 'Италия',
        city: 'Рим',
        startDate,
        endDate,
        travelersCount: 3,
        budget: 180000,
        currency: 'RUB',
        tripType: 'SIGHTSEEING',
        description: 'Совместная прогулка по историческому центру Рима',
      },
    });
    assert.equal(createTripRes.status, 201);
    const trip = createTripRes.body.data.trip;

    // События маршрута
    const ev1Res = await request(baseUrl, 'POST', `/api/trips/${trip.id}/events`, {
      cookies: ownerCookies,
      body: {
        title: 'Экскурсия в Колизей',
        date: startDate,
        startTime: '10:00',
        endTime: '12:30',
        location: 'Piazza del Colosseo, 1',
        estimatedCost: 4500,
        description: 'Утренний вход без очереди',
        note: 'Взять воду и удобную обувь',
      },
    });
    assert.equal(ev1Res.status, 201);

    const ev2Res = await request(baseUrl, 'POST', `/api/trips/${trip.id}/events`, {
      cookies: ownerCookies,
      body: {
        title: 'Ужин в Трастевере',
        date: addDaysToDateOnly(startDate, 1),
        startTime: '19:30',
        endTime: '21:30',
        location: 'Trastevere, Roma',
        description: 'Паста и тирамису',
      },
    });
    assert.equal(ev2Res.status, 201);

    // Список вещей: генерируем и добавляем пользовательскую вещь, отмечаем одну собранной, одну скрываем
    const genPackingRes = await request(baseUrl, 'POST', `/api/trips/${trip.id}/packing/generate`, {
      cookies: ownerCookies,
    });
    assert.equal(genPackingRes.status, 200);
    const generatedItems = genPackingRes.body.data.items as any[];
    assert.ok(generatedItems.length >= 2, 'Должны быть сгенерированы базовые вещи');

    const packedItem = generatedItems[0];
    const dismissedItem = generatedItems[1];

    const packPatchRes = await request(baseUrl, 'PATCH', `/api/packing/${packedItem.id}`, {
      cookies: ownerCookies,
      body: { isPacked: true },
    });
    assert.equal(packPatchRes.status, 200);

    const dismissRes = await request(baseUrl, 'DELETE', `/api/packing/${dismissedItem.id}`, {
      cookies: ownerCookies,
    });
    assert.equal(dismissRes.status, 200);
    assert.equal(dismissRes.body.data.mode, 'dismissed');

    const customPackRes = await request(baseUrl, 'POST', `/api/trips/${trip.id}/packing/items`, {
      cookies: ownerCookies,
      body: { name: 'Зонт складной для Рима', category: 'PERSONAL', quantity: 1 },
    });
    assert.equal(customPackRes.status, 201);

    // Расходы (приватные по умолчанию)
    const expRes = await request(baseUrl, 'POST', `/api/trips/${trip.id}/expenses`, {
      cookies: ownerCookies,
      body: {
        category: 'LODGING',
        amount: 450,
        currency: 'EUR',
        expenseDate: startDate,
        description: 'Секретная оплата апартаментов владельца',
      },
    });
    assert.equal(expRes.status, 201);

    // Приватные документы и брони (Privacy-by-Design: НИКОГДА не должны попадать наружу)
    const docRes = await request(baseUrl, 'POST', `/api/trips/${trip.id}/documents`, {
      cookies: ownerCookies,
      body: {
        title: 'Секретный авиабилет владельца',
        category: 'FLIGHT_TICKET',
        status: 'READY',
        provider: 'ITA Airways',
        referenceCode: 'SECRET-PNR-999',
        notes: 'Личная бронь с данными паспорта',
      },
    });
    assert.equal(docRes.status, 201);

    console.log('✅ 1. Подготовлена поездка с событиями, списком вещей, расходами и приватными бронями');

    // 3. Проверка прав доступа к настройкам шаринга
    const unauthShareGet = await request(baseUrl, 'GET', `/api/trips/${trip.id}/share`);
    assert.equal(unauthShareGet.status, 401, 'Без авторизации GET /api/trips/:id/share -> 401');

    const forbiddenShareGet = await request(baseUrl, 'GET', `/api/trips/${trip.id}/share`, {
      cookies: companionCookies,
    });
    assert.equal(forbiddenShareGet.status, 403, 'Чужой пользователь GET /api/trips/:id/share -> 403');

    const initialShareRes = await request(baseUrl, 'GET', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
    });
    assert.equal(initialShareRes.status, 200);
    assert.equal(initialShareRes.body.data.share, null, 'До создания ссылки share должен быть null');

    // 4. Создание публичной ссылки (PUT /api/trips/:id/share)
    const createShareRes = await request(baseUrl, 'PUT', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
      body: { isActive: true },
    });
    assert.equal(createShareRes.status, 200);
    const createdShare = createShareRes.body.data.share;
    assert.ok(createdShare, 'Объект share должен быть создан');
    assert.match(createdShare.token, /^[0-9a-f]{32}$/, 'Токен должен быть 32-символьной hex-строкой');
    assert.equal(createdShare.isActive, true);
    assert.equal(createdShare.showItinerary, true);
    assert.equal(createdShare.showPackingList, true);
    assert.equal(createdShare.showCountryInfo, true);
    assert.equal(createdShare.showExpenses, false, 'showExpenses должен быть false по умолчанию');
    assert.equal(createdShare.viewsCount, 0);
    console.log('✅ 2. Создана публичная ссылка с криптостойким токеном и приватными настройками по умолчанию');

    // 5. Публичное чтение БЕЗ авторизации + жёсткая проверка Privacy-by-Design
    const publicRes = await request(baseUrl, 'GET', `/api/shared/trips/${createdShare.token}`);
    assert.equal(publicRes.status, 200, 'Публичный маршрут должен открываться без авторизации');
    assert.equal(publicRes.body?.success, true);

    const publicData = publicRes.body.data;
    const rawPayloadJson = JSON.stringify(publicRes.body);

    // Гарантия отсутствия утечек приватных данных и внутренних ID
    assert.ok(!rawPayloadJson.includes(ownerId), 'В публичном ответе не должно быть userId владельца');
    assert.ok(!rawPayloadJson.includes(ownerEmail), 'В публичном ответе не должно быть email владельца');
    assert.ok(!rawPayloadJson.includes(ownerName), 'В публичном ответе не должно быть имени владельца');
    assert.ok(!rawPayloadJson.includes(trip.id), 'В публичном ответе не должно быть внутреннего trip.id');
    assert.ok(!rawPayloadJson.includes('SECRET-PNR-999'), 'В публичном ответе не должно быть номеров броней');
    assert.ok(
      !rawPayloadJson.includes('Секретный авиабилет владельца'),
      'В публичном ответе не должно быть TripDocument'
    );
    assert.ok(
      !rawPayloadJson.includes('Секретная оплата апартаментов владельца'),
      'При showExpenses: false расходы не должны попадать в ответ'
    );
    assert.equal('documents' in publicData, false, 'Поле documents не должно существовать в публичном ответе');
    assert.equal('id' in publicData.trip, false, 'trip.id не должен передаваться');
    assert.equal('userId' in publicData.trip, false, 'trip.userId не должен передаваться');
    assert.equal('budget' in publicData.trip, false, 'trip.budget не должен передаваться в объекте trip');

    assert.equal(publicData.trip.title, 'Римский уикенд с друзьями');
    assert.equal(publicData.trip.country, 'Италия');
    assert.equal(publicData.trip.city, 'Рим');
    assert.equal(publicData.trip.durationDays, 4);
    assert.equal(publicData.trip.travelersCount, 3);
    assert.equal(publicData.trip.tripType, 'SIGHTSEEING');

    assert.deepEqual(publicData.permissions, {
      showItinerary: true,
      showPackingList: true,
      showCountryInfo: true,
      showExpenses: false,
    });

    assert.equal(publicData.events.length, 2, 'Должны вернуться оба события маршрута');
    assert.equal(
      publicData.events[0].estimatedCost,
      null,
      'При showExpenses: false ориентировочная стоимость события должна скрываться'
    );
    assert.equal('id' in publicData.events[0], false, 'Внутренний ID события не должен передаваться');

    assert.ok(Array.isArray(publicData.packingList), 'packingList должен быть массивом');
    const packingNames = publicData.packingList.map((i: any) => i.name);
    assert.ok(packingNames.includes('Зонт складной для Рима'), 'Пользовательская вещь должна присутствовать');
    assert.ok(
      !packingNames.includes(dismissedItem.name),
      'Скрытая (isDismissed: true) вещь не должна попадать в публичный список'
    );
    assert.equal(
      'isPacked' in publicData.packingList[0],
      false,
      'Личные отметки сбора владельца не должны передаваться'
    );

    assert.ok(publicData.countryInfo, 'countryInfo для Италии должен быть загружен');
    assert.equal(publicData.countryInfo.slug, 'italy');
    assert.ok(publicData.countryInfo.travelInfo?.entryRules?.summary);
    assert.equal(publicData.expenses, null, 'При showExpenses: false поле expenses должно быть null');

    // Проверка счётчика просмотров
    const afterViewShareRes = await request(baseUrl, 'GET', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
    });
    assert.equal(afterViewShareRes.body.data.share.viewsCount, 1, 'viewsCount должен увеличиться до 1');
    console.log('✅ 3. Публичное чтение без авторизации, санитизация, Privacy-by-Design и viewsCount подтверждены');

    // 6. Включение showExpenses: true и скрытие showItinerary: false
    const toggleRes = await request(baseUrl, 'PUT', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
      body: { showExpenses: true, showItinerary: false },
    });
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleRes.body.data.share.showExpenses, true);
    assert.equal(toggleRes.body.data.share.showItinerary, false);

    const publicWithExpensesRes = await request(baseUrl, 'GET', `/api/shared/trips/${createdShare.token}`);
    assert.equal(publicWithExpensesRes.status, 200);
    assert.deepEqual(publicWithExpensesRes.body.data.events, [], 'При showItinerary: false события должны быть []');
    assert.ok(publicWithExpensesRes.body.data.expenses, 'При showExpenses: true расходы должны возвращаться');
    assert.equal(publicWithExpensesRes.body.data.expenses.items.length, 1);
    assert.equal(publicWithExpensesRes.body.data.expenses.summary.plannedBudget, 180000);
    assert.ok(publicWithExpensesRes.body.data.expenses.summary.totalSpent > 0);
    console.log('✅ 4. Переключение видимости разделов (showExpenses / showItinerary) работает корректно');

    // Возвращаем showItinerary: true и showExpenses: false перед проверкой отзыва и клонирования
    await request(baseUrl, 'PUT', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
      body: { showItinerary: true, showExpenses: false },
    });

    // 7. Отзыв ссылки через POST /api/trips/:id/share/regenerate
    const oldToken = createdShare.token;
    const regenRes = await request(baseUrl, 'POST', `/api/trips/${trip.id}/share/regenerate`, {
      cookies: ownerCookies,
    });
    assert.equal(regenRes.status, 200);
    const newToken = regenRes.body.data.share.token as string;
    assert.notEqual(newToken, oldToken, 'Новый токен должен отличаться от старого');
    assert.match(newToken, /^[0-9a-f]{32}$/);

    const oldTokenRead = await request(baseUrl, 'GET', `/api/shared/trips/${oldToken}`);
    assert.equal(oldTokenRead.status, 404, 'Старый токен после регенерации должен вернуть 404');
    assert.equal(oldTokenRead.body?.error?.code, 'SHARE_NOT_FOUND');

    const newTokenRead = await request(baseUrl, 'GET', `/api/shared/trips/${newToken}`);
    assert.equal(newTokenRead.status, 200, 'Новый токен после регенерации должен вернуть 200');
    console.log('✅ 5. Отзыв ссылки (regenerate) делает старый токен недействительным (404), а новый активным (200)');

    // 8. Выключение доступа (isActive: false) -> 404
    const disableRes = await request(baseUrl, 'PUT', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
      body: { isActive: false },
    });
    assert.equal(disableRes.status, 200);
    assert.equal(disableRes.body.data.share.isActive, false);

    const disabledRead = await request(baseUrl, 'GET', `/api/shared/trips/${newToken}`);
    assert.equal(disabledRead.status, 404, 'Выключенная ссылка должна возвращать 404');
    assert.equal(disabledRead.body?.error?.code, 'SHARE_NOT_FOUND');

    const disabledClone = await request(baseUrl, 'POST', `/api/shared/trips/${newToken}/clone`, {
      cookies: companionCookies,
    });
    assert.equal(disabledClone.status, 404, 'Клонирование выключенной ссылки должно возвращать 404');
    console.log('✅ 6. Отключение isActive: false закрывает доступ на просмотр и клонирование (404)');

    // 9. Повторное включение и клонирование маршрута вторым пользователем
    await request(baseUrl, 'PUT', `/api/trips/${trip.id}/share`, {
      cookies: ownerCookies,
      body: { isActive: true },
    });

    const unauthClone = await request(baseUrl, 'POST', `/api/shared/trips/${newToken}/clone`);
    assert.equal(unauthClone.status, 401, 'Клонирование без авторизации должно вернуть 401');

    const cloneRes = await request(baseUrl, 'POST', `/api/shared/trips/${newToken}/clone`, {
      cookies: companionCookies,
    });
    assert.equal(cloneRes.status, 201, 'Клонирование авторизованным попутчиком должно вернуть 201');
    const clonedTrip = cloneRes.body.data.trip;
    assert.ok(clonedTrip.id, 'У клонированной поездки должен быть свой ID');
    assert.notEqual(clonedTrip.id, trip.id, 'ID клонированной поездки должен отличаться от оригинала');
    assert.equal(clonedTrip.userId, companionId, 'Владельцем клонированной поездки должен быть попутчик');
    assert.equal(clonedTrip.title, trip.title);
    assert.equal(clonedTrip.country, 'Италия');
    assert.equal(clonedTrip.city, 'Рим');
    assert.equal(clonedTrip.budget, 0, 'При showExpenses: false бюджет владельца не должен копироваться');
    assert.equal(clonedTrip.events.length, 2, 'События маршрута должны быть скопированы');
    assert.equal(clonedTrip.events[0].estimatedCost, null);

    // Проверяем скопированный список вещей попутчика: все isPacked === false, dismissed не скопирован
    const clonedPackingRes = await request(baseUrl, 'GET', `/api/trips/${clonedTrip.id}/packing`, {
      cookies: companionCookies,
    });
    assert.equal(clonedPackingRes.status, 200);
    const clonedItems = clonedPackingRes.body.data.items as any[];
    assert.ok(clonedItems.length > 0, 'Список вещей должен быть скопирован');
    assert.ok(
      clonedItems.every((it) => it.isPacked === false),
      'Все скопированные вещи должны иметь isPacked: false'
    );
    assert.ok(
      clonedItems.some((it) => it.name === 'Зонт складной для Рима'),
      'Пользовательские вещи должны быть скопированы'
    );
    assert.ok(
      !clonedItems.some((it) => it.name === dismissedItem.name),
      'Скрытые вещи не должны копироваться'
    );

    // Проверяем документы попутчика: только базовый чек-лист (4 пункта), без секретных броней владельца
    const clonedDocsRes = await request(baseUrl, 'GET', `/api/trips/${clonedTrip.id}/documents`, {
      cookies: companionCookies,
    });
    assert.equal(clonedDocsRes.status, 200);
    const clonedDocs = clonedDocsRes.body.data.documents as any[];
    assert.equal(clonedDocs.length, 4, 'Должен быть создан базовый чек-лист из 4 документов');
    assert.ok(
      clonedDocs.every((d) => d.status === 'REQUIRED' && d.referenceCode === ''),
      'Базовые документы должны быть со статусом REQUIRED и без чужих кодов'
    );
    assert.ok(
      !JSON.stringify(clonedDocs).includes('SECRET-PNR-999'),
      'Чужие брони не должны копироваться'
    );

    // Проверяем расходы попутчика: 0 (расходы не копируются)
    const clonedExpensesRes = await request(baseUrl, 'GET', `/api/trips/${clonedTrip.id}/expenses`, {
      cookies: companionCookies,
    });
    assert.equal(clonedExpensesRes.status, 200);
    assert.equal(clonedExpensesRes.body.data.expenses.length, 0, 'Чужие расходы не должны копироваться');

    console.log('✅ 7. Клонирование маршрута вторым пользователем (201) с Privacy-by-Design полностью подтверждено');
    console.log('\n🎉 Все интеграционные тесты публичного шаринга маршрутов (Этап 13) успешно пройдены!');
  } finally {
    await prisma.user.deleteMany({
      where: { email: { in: [ownerEmail, companionEmail] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах публичного шаринга маршрутов:', err);
  process.exit(1);
});
