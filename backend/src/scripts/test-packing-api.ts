import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import { PackingCategory, PackingItemSource, TripType } from '@prisma/client';
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
  console.log('🧪 [Smart Packing API] Инициализация базы данных и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const user1Email = `packing.u1.${suffix}@example.com`;
  const user2Email = `packing.u2.${suffix}@example.com`;

  try {
    // Регистрация двух пользователей
    const reg1 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Алексей Владелец',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg1.status, 201);
    const user1Cookies = reg1.cookies;
    const user1Id = reg1.body.data.user.id as string;

    const reg2 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Ольга ЧужойПользователь',
        email: user2Email,
        password: 'password456',
        confirmPassword: 'password456',
      },
    });
    assert.equal(reg2.status, 201);
    const user2Cookies = reg2.cookies;

    // Создаём поездку для User 1
    const tripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Осенний Рим',
        country: 'Италия',
        city: 'Рим',
        startDate: '2026-10-10',
        endDate: '2026-10-14',
        travelersCount: 2,
        budget: 120000,
        currency: 'RUB',
        description: 'Прогулки по городу и музеи',
      },
    });
    assert.equal(tripRes.status, 201);
    const tripId = tripRes.body.data.trip.id as string;

    // Проверка требования авторизации (401 без cookie)
    const unauthGet = await request(baseUrl, 'GET', `/api/trips/${tripId}/packing`);
    assert.equal(unauthGet.status, 401);

    // Проверка пустого состояния до генерации
    const emptyGet = await request(baseUrl, 'GET', `/api/trips/${tripId}/packing`, {
      cookies: user1Cookies,
    });
    assert.equal(emptyGet.status, 200);
    assert.equal(emptyGet.body.data.exists, false);
    assert.equal(emptyGet.body.data.packingList, null);
    assert.deepEqual(emptyGet.body.data.items, []);
    assert.equal(emptyGet.body.data.summary.total, 0);
    console.log('✅ 0. Авторизация (401) и пустое состояние до генерации проверены');

    // 1. Первичная генерация создаёт список и позиции
    const gen1 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen1.status, 200);
    assert.equal(gen1.body.data.exists, true);
    assert.ok(gen1.body.data.packingList?.id);
    assert.ok(gen1.body.data.packingList?.lastGeneratedAt);
    assert.ok(gen1.body.data.items.length > 10);
    const packingListId = gen1.body.data.packingList.id as string;

    const firstKeys = gen1.body.data.items.map((i: any) => i.ruleKey);
    assert.equal(new Set(firstKeys).size, firstKeys.length, 'Нет дублей ruleKey');

    const passportItem = gen1.body.data.items.find(
      (i: any) => i.ruleKey === 'doc:identity_passport'
    );
    assert.ok(passportItem);
    assert.equal(passportItem.quantity, 2);
    assert.equal(passportItem.source, 'GENERATED');
    console.log('✅ 1. Первичная генерация создаёт PackingList и позиции в БД');

    // 2. Повторная генерация не создаёт дубликаты
    const gen2 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen2.status, 200);
    assert.equal(gen2.body.data.items.length, gen1.body.data.items.length);
    assert.equal(gen2.body.data.mergeStats.addedCount, 0);
    console.log('✅ 2. Повторная генерация идемпотентна и не создаёт дубликаты');

    // 3. Отмеченная позиция остаётся отмеченной и НЕ ставит isEditedByUser
    const tshirtItem = gen2.body.data.items.find((i: any) => i.ruleKey === 'cloth:tshirts');
    assert.ok(tshirtItem);
    const packPatch = await request(baseUrl, 'PATCH', `/api/packing/${tshirtItem.id}`, {
      cookies: user1Cookies,
      body: { isPacked: true },
    });
    assert.equal(packPatch.status, 200);
    assert.equal(packPatch.body.data.item.isPacked, true);
    assert.equal(
      packPatch.body.data.item.isEditedByUser,
      false,
      'Изменение только isPacked не должно выставлять isEditedByUser'
    );

    const gen3 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen3.status, 200);
    const tshirtAfter = gen3.body.data.items.find((i: any) => i.id === tshirtItem.id);
    assert.equal(tshirtAfter.isPacked, true);
    assert.equal(tshirtAfter.isEditedByUser, false);
    console.log('✅ 3. Отметка isPacked сохраняется после генерации и не ставит isEditedByUser');

    // 4. Пользовательская позиция (source = CUSTOM) добавляется и сохраняется после генерации
    const invalidCustom = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/items`, {
      cookies: user1Cookies,
      body: { name: '   ', category: 'INVALID_CAT' },
    });
    assert.equal(invalidCustom.status, 400);

    const createCustom = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/items`, {
      cookies: user1Cookies,
      body: {
        name: 'Штатив для камеры',
        category: 'TECH',
        quantity: 1,
      },
    });
    assert.equal(createCustom.status, 201);
    const customItem = createCustom.body.data.item;
    assert.equal(customItem.source, 'CUSTOM');
    assert.equal(customItem.ruleKey, null);

    // Также создадим "старую/непривязанную" запись (GENERATED с ruleKey = null) напрямую в БД для проверки защиты
    const legacyNullRuleItem = await prisma.packingItem.create({
      data: {
        packingListId,
        category: PackingCategory.OTHER,
        name: 'Устаревшая запись без ruleKey',
        quantity: 1,
        source: PackingItemSource.GENERATED,
        ruleKey: null,
      },
    });

    const gen4 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen4.status, 200);
    assert.ok(gen4.body.data.items.find((i: any) => i.id === customItem.id));
    const legacyAfter = gen4.body.data.items.find((i: any) => i.id === legacyNullRuleItem.id);
    assert.ok(legacyAfter, 'Запись с ruleKey = null сохраняется');
    assert.equal(legacyAfter.isOutdated, false, 'Запись с ruleKey = null не помечается устаревшей');
    console.log('✅ 4. Пользовательская позиция (CUSTOM) и записи с ruleKey = null сохраняются');

    // 5. Отредактированная сгенерированная позиция не перезаписывается
    const powerbankItem = gen4.body.data.items.find((i: any) => i.ruleKey === 'tech:powerbank');
    assert.ok(powerbankItem);
    const editGen = await request(baseUrl, 'PATCH', `/api/packing/${powerbankItem.id}`, {
      cookies: user1Cookies,
      body: {
        name: 'Мощный Power Bank 20000 mAh',
        quantity: 1,
        category: 'PERSONAL',
      },
    });
    assert.equal(editGen.status, 200);
    assert.equal(editGen.body.data.item.isEditedByUser, true);

    const gen5 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen5.status, 200);
    const powerbankAfter = gen5.body.data.items.find((i: any) => i.id === powerbankItem.id);
    assert.equal(powerbankAfter.name, 'Мощный Power Bank 20000 mAh');
    assert.equal(powerbankAfter.quantity, 1);
    assert.equal(powerbankAfter.category, 'PERSONAL');
    assert.equal(powerbankAfter.isEditedByUser, true);
    console.log('✅ 5. Отредактированная сгенерированная позиция не перезаписывается при генерации');

    // 6. Новые рекомендации добавляются при изменении маршрута
    const waterparkEventRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Посещение аквапарка и пляжный клуб',
        date: '2026-10-11',
      },
    });
    assert.equal(waterparkEventRes.status, 201);
    const waterparkEventId = waterparkEventRes.body.data.event.id as string;

    const gen6 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen6.status, 200);
    const swimwearItem = gen6.body.data.items.find((i: any) => i.ruleKey === 'act:swimwear');
    const waterSlippersItem = gen6.body.data.items.find(
      (i: any) => i.ruleKey === 'foot:water_slippers'
    );
    assert.ok(swimwearItem && waterSlippersItem, 'Добавились рекомендации для аквапарка');
    assert.equal(swimwearItem.isOutdated, false);
    console.log('✅ 6. Новые рекомендации добавляются при изменении маршрута');

    // 8 & 10. Удаление сгенерированной позиции устанавливает isDismissed = true и она больше не появляется
    const dismissRes = await request(baseUrl, 'DELETE', `/api/packing/${waterSlippersItem.id}`, {
      cookies: user1Cookies,
    });
    assert.equal(dismissRes.status, 200);
    assert.equal(dismissRes.body.data.mode, 'dismissed');

    const dismissedDbRow = await prisma.packingItem.findUnique({
      where: { id: waterSlippersItem.id },
    });
    assert.equal(dismissedDbRow?.isDismissed, true);

    const gen7 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen7.status, 200);
    assert.equal(
      gen7.body.data.items.find((i: any) => i.ruleKey === 'foot:water_slippers'),
      undefined,
      'Отклонённая рекомендация не появляется после повторной генерации'
    );
    console.log('✅ 8 & 10. Удаление GENERATED-позиции ставит isDismissed=true и скрывает её навсегда');

    // 7. Больше не подходящие рекомендации получают isOutdated = true (а затем возвращаются, если снова подходят)
    const delEventRes = await request(baseUrl, 'DELETE', `/api/events/${waterparkEventId}`, {
      cookies: user1Cookies,
    });
    assert.equal(delEventRes.status, 200);

    const gen8 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen8.status, 200);
    const outdatedSwimwear = gen8.body.data.items.find((i: any) => i.ruleKey === 'act:swimwear');
    assert.ok(outdatedSwimwear, 'Устаревшая позиция не удаляется безвозвратно');
    assert.equal(outdatedSwimwear.isOutdated, true, 'Позиция помечена isOutdated = true');
    assert.equal(
      gen8.body.data.items.find((i: any) => i.id === customItem.id)?.isOutdated,
      false,
      'CUSTOM не помечается устаревшей'
    );

    // Проверим возврат из isOutdated при повторном добавлении события (но отклонённая water_slippers всё равно не вернётся!)
    const reAddEventRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/events`, {
      cookies: user1Cookies,
      body: {
        title: 'Снова аквапарк',
        date: '2026-10-12',
      },
    });
    assert.equal(reAddEventRes.status, 201);
    const reAddEventId = reAddEventRes.body.data.event.id as string;

    const gen9 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(gen9.status, 200);
    assert.equal(
      gen9.body.data.items.find((i: any) => i.ruleKey === 'act:swimwear')?.isOutdated,
      false,
      'Ранее устаревшая рекомендация возвращается из isOutdated'
    );
    assert.equal(
      gen9.body.data.items.find((i: any) => i.ruleKey === 'foot:water_slippers'),
      undefined,
      'Отклонённая пользователем рекомендация не возвращается даже при повторном появлении активности'
    );

    // Снова уберём событие, чтобы получить isOutdated = true для теста очистки
    await request(baseUrl, 'DELETE', `/api/events/${reAddEventId}`, { cookies: user1Cookies });
    const gen10 = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user1Cookies,
    });
    assert.equal(
      gen10.body.data.items.find((i: any) => i.ruleKey === 'act:swimwear')?.isOutdated,
      true
    );
    console.log('✅ 7. Не подходящие правила получают isOutdated = true и корректно возвращаются');

    // 11. Очистка устаревших позиций не затрагивает пользовательские и отклонённые
    const clearRes = await request(baseUrl, 'DELETE', `/api/trips/${tripId}/packing/outdated`, {
      cookies: user1Cookies,
    });
    assert.equal(clearRes.status, 200);
    assert.ok(clearRes.body.data.deletedCount >= 1);

    const afterClear = await request(baseUrl, 'GET', `/api/trips/${tripId}/packing`, {
      cookies: user1Cookies,
    });
    assert.equal(
      afterClear.body.data.items.find((i: any) => i.ruleKey === 'act:swimwear'),
      undefined,
      'Устаревшая GENERATED-позиция физически удалена'
    );
    assert.ok(
      afterClear.body.data.items.find((i: any) => i.id === customItem.id),
      'Пользовательская позиция сохранена после очистки'
    );
    assert.ok(
      afterClear.body.data.items.find((i: any) => i.id === legacyNullRuleItem.id),
      'Позиция без ruleKey сохранена после очистки'
    );
    const stillDismissed = await prisma.packingItem.findUnique({
      where: { id: waterSlippersItem.id },
    });
    assert.equal(stillDismissed?.isDismissed, true, 'Отклонённая позиция не удалена при очистке');
    console.log('✅ 11. Очистка устаревших не затрагивает CUSTOM и isDismissed-позиции');

    // 9. Удаление пользовательской позиции действительно удаляет запись из БД
    const delCustomRes = await request(baseUrl, 'DELETE', `/api/packing/${customItem.id}`, {
      cookies: user1Cookies,
    });
    assert.equal(delCustomRes.status, 200);
    assert.equal(delCustomRes.body.data.mode, 'hard');
    const customInDb = await prisma.packingItem.findUnique({ where: { id: customItem.id } });
    assert.equal(customInDb, null, 'CUSTOM-позиция физически удалена из БД');
    console.log('✅ 9. Удаление CUSTOM-позиции физически удаляет запись из БД');

    // 12. Нельзя получить или изменить список чужой поездки (403 Forbidden)
    const u2Get = await request(baseUrl, 'GET', `/api/trips/${tripId}/packing`, {
      cookies: user2Cookies,
    });
    const u2Gen = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/generate`, {
      cookies: user2Cookies,
    });
    const u2Add = await request(baseUrl, 'POST', `/api/trips/${tripId}/packing/items`, {
      cookies: user2Cookies,
      body: { name: 'Чужая вещь', category: 'OTHER' },
    });
    const u2Patch = await request(baseUrl, 'PATCH', `/api/packing/${tshirtItem.id}`, {
      cookies: user2Cookies,
      body: { isPacked: false },
    });
    const u2Del = await request(baseUrl, 'DELETE', `/api/packing/${tshirtItem.id}`, {
      cookies: user2Cookies,
    });
    const u2Clear = await request(baseUrl, 'DELETE', `/api/trips/${tripId}/packing/outdated`, {
      cookies: user2Cookies,
    });
    assert.equal(u2Get.status, 403);
    assert.equal(u2Gen.status, 403);
    assert.equal(u2Add.status, 403);
    assert.equal(u2Patch.status, 403);
    assert.equal(u2Del.status, 403);
    assert.equal(u2Clear.status, 403);

    // Несуществующий UUID возвращает 404
    const notFoundItem = await request(
      baseUrl,
      'PATCH',
      '/api/packing/00000000-0000-0000-0000-000000000000',
      { cookies: user1Cookies, body: { isPacked: true } }
    );
    assert.equal(notFoundItem.status, 404);
    console.log('✅ 12. Изоляция прав доступа (403 для чужой поездки, 404 для несуществующих)');

    // 13. Нельзя редактировать служебные поля через API
    const patchServiceFields = await request(baseUrl, 'PATCH', `/api/packing/${tshirtItem.id}`, {
      cookies: user1Cookies,
      body: {
        name: 'Футболка',
        source: 'CUSTOM',
        ruleKey: 'hacked:key',
        isDismissed: true,
        isOutdated: true,
        isEditedByUser: false,
      },
    });
    assert.equal(patchServiceFields.status, 400);

    const createWithServiceFields = await request(
      baseUrl,
      'POST',
      `/api/trips/${tripId}/packing/items`,
      {
        cookies: user1Cookies,
        body: {
          name: 'Фонарь',
          category: 'OTHER',
          source: 'GENERATED',
          ruleKey: 'doc:identity_passport',
        },
      }
    );
    assert.equal(createWithServiceFields.status, 400);

    const tshirtInDb = await prisma.packingItem.findUnique({ where: { id: tshirtItem.id } });
    assert.equal(tshirtInDb?.ruleKey, 'cloth:tshirts');
    assert.equal(tshirtInDb?.source, 'GENERATED');
    console.log('✅ 13. Запрет изменения служебных полей через API (400 VALIDATION_ERROR)');

    // 14. Параллельная генерация на новой поездке (включая tripType и concurrent INSERT PackingList)
    const mountainTrip = await prisma.trip.create({
      data: {
        userId: user1Id,
        title: 'Альпы на выходных',
        country: 'Австрия',
        city: 'Инсбрук',
        startDate: new Date('2026-01-15T00:00:00.000Z'),
        endDate: new Date('2026-01-18T00:00:00.000Z'),
        travelersCount: 3,
        tripType: TripType.WINTER_SPORT,
        description: 'Катание на лыжах',
      },
    });

    const parallelResults = await Promise.all([
      request(baseUrl, 'POST', `/api/trips/${mountainTrip.id}/packing/generate`, {
        cookies: user1Cookies,
      }),
      request(baseUrl, 'POST', `/api/trips/${mountainTrip.id}/packing/generate`, {
        cookies: user1Cookies,
      }),
      request(baseUrl, 'POST', `/api/trips/${mountainTrip.id}/packing/generate`, {
        cookies: user1Cookies,
      }),
      request(baseUrl, 'POST', `/api/trips/${mountainTrip.id}/packing/generate`, {
        cookies: user1Cookies,
      }),
    ]);

    for (const res of parallelResults) {
      assert.equal(res.status, 200, 'Все параллельные вызовы generate должны завершиться 200');
    }

    const dbParallelItems = await prisma.packingItem.findMany({
      where: { packingList: { tripId: mountainTrip.id } },
    });
    const parallelRuleKeys = dbParallelItems.map((i) => i.ruleKey);
    assert.equal(
      new Set(parallelRuleKeys).size,
      dbParallelItems.length,
      'Параллельная генерация не создаёт дубликаты в БД'
    );
    assert.ok(
      dbParallelItems.some((i) => i.ruleKey === 'act:ski_goggles' && i.quantity === 3),
      'tripType WINTER_SPORT из БД корректно передан в движок'
    );
    console.log('✅ 14. Параллельная генерация безопасна и не создаёт дубликаты');

    console.log('\n🎉 Все 14 сценариев Smart Packing List Service + API успешно пройдены!');
  } finally {
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах Smart Packing API:', err);
  process.exit(1);
});
