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
  rawBuffer: Buffer;
  headers: Headers;
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

  const arrayBuffer = await res.arrayBuffer();
  const rawBuffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get('content-type') || '';

  let parsedBody: any = null;
  if (contentType.includes('application/json')) {
    try {
      parsedBody = JSON.parse(rawBuffer.toString('utf8'));
    } catch {
      parsedBody = null;
    }
  }

  return {
    status: res.status,
    body: parsedBody,
    rawBuffer,
    headers: res.headers,
    cookies: newCookies,
  };
}

async function runTests() {
  console.log('🧪 [Trip Documents API] Инициализация базы данных и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const suffix = Date.now();
  const user1Email = `docs.u1.${suffix}@example.com`;
  const user2Email = `docs.u2.${suffix}@example.com`;

  try {
    // Регистрация двух пользователей
    const reg1 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Анна Документова',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg1.status, 201);
    const user1Cookies = reg1.cookies;

    const reg2 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Пётр Посторонний',
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
        title: 'Путешествие в Барселону',
        country: 'Испания',
        city: 'Барселона',
        startDate: '2026-11-10',
        endDate: '2026-11-17',
        travelersCount: 2,
        budget: 180000,
        currency: 'RUB',
        description: 'Архитектура Гауди и море',
      },
    });
    assert.equal(tripRes.status, 201);
    const tripId = tripRes.body.data.trip.id as string;

    // 1. Проверка авторизации (401) и пустого списка
    const unauthList = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`);
    assert.equal(unauthList.status, 401);

    const unauthSeed = await request(
      baseUrl,
      'POST',
      `/api/trips/${tripId}/documents/seed-defaults`
    );
    assert.equal(unauthSeed.status, 401);

    const emptyListRes = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(emptyListRes.status, 200);
    assert.deepEqual(emptyListRes.body.data.documents, []);
    assert.equal(emptyListRes.body.data.summary.totalCount, 0);
    assert.equal(emptyListRes.body.data.summary.readyCount, 0);
    assert.equal(emptyListRes.body.data.summary.requiredCount, 0);
    assert.equal(emptyListRes.body.data.summary.withAttachmentCount, 0);
    console.log('✅ 1. Проверка 401 и пустого начального списка пройдена');

    // 2. Создание базового чек-листа (seed-defaults) + защита от дублей (повторно и параллельно)
    const parallelSeedResults = await Promise.all([
      request(baseUrl, 'POST', `/api/trips/${tripId}/documents/seed-defaults`, {
        cookies: user1Cookies,
      }),
      request(baseUrl, 'POST', `/api/trips/${tripId}/documents/seed-defaults`, {
        cookies: user1Cookies,
      }),
    ]);

    for (const res of parallelSeedResults) {
      assert.equal(res.status, 200);
    }

    const totalAddedAcrossParallel =
      parallelSeedResults[0].body.data.addedCount + parallelSeedResults[1].body.data.addedCount;
    assert.equal(
      totalAddedAcrossParallel,
      4,
      'Параллельный seed-defaults должен суммарно добавить ровно 4 базовых документа'
    );

    const afterSeedRes = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(afterSeedRes.status, 200);
    assert.equal(afterSeedRes.body.data.documents.length, 4);
    assert.equal(afterSeedRes.body.data.summary.totalCount, 4);
    assert.equal(afterSeedRes.body.data.summary.requiredCount, 4);
    assert.equal(afterSeedRes.body.data.summary.pendingCount, 0);
    assert.equal(afterSeedRes.body.data.summary.readyCount, 0);
    assert.equal(afterSeedRes.body.data.summary.withAttachmentCount, 0);

    const seededCategories = afterSeedRes.body.data.documents.map((d: any) => d.category);
    assert.deepEqual(seededCategories, [
      'FLIGHT_TICKET',
      'HOTEL_BOOKING',
      'INSURANCE',
      'VISA_PASSPORT',
    ]);
    for (const doc of afterSeedRes.body.data.documents) {
      assert.equal(doc.status, 'REQUIRED');
      assert.equal(doc.hasAttachment, false);
      assert.equal('fileDataBase64' in doc, false);
    }

    // Повторный вызов seed-defaults не добавляет дубли
    const seedAgain = await request(
      baseUrl,
      'POST',
      `/api/trips/${tripId}/documents/seed-defaults`,
      { cookies: user1Cookies }
    );
    assert.equal(seedAgain.status, 200);
    assert.equal(seedAgain.body.data.addedCount, 0);
    assert.equal(seedAgain.body.data.documents.length, 4);
    console.log('✅ 2. Seed-defaults создаёт 4 базовых документа и защищён от дублей');

    // 3. Создание документа с номером PNR и прикреплённым PDF в Base64 (с кириллическим именем)
    const samplePdfBytes = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n',
      'utf8'
    );
    const samplePdfBase64 = samplePdfBytes.toString('base64');

    const createFlightRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Перелёт Москва — Барселона (туда)',
        category: 'FLIGHT_TICKET',
        status: 'READY',
        provider: 'Turkish Airlines',
        referenceCode: 'TK9X7M',
        eventDate: '2026-11-10',
        externalUrl: 'https://www.turkishairlines.com/booking/TK9X7M',
        notes: 'Терминал B, вылет в 08:25, багаж 23 кг',
        fileName: 'Авиабилет_Барселона_TK9X7M.pdf',
        fileMimeType: 'application/pdf',
        fileDataBase64: samplePdfBase64,
      },
    });
    assert.equal(createFlightRes.status, 201);
    const flightDoc = createFlightRes.body.data.document;
    assert.equal(flightDoc.referenceCode, 'TK9X7M');
    assert.equal(flightDoc.provider, 'Turkish Airlines');
    assert.equal(flightDoc.status, 'READY');
    assert.equal(flightDoc.hasAttachment, true);
    assert.equal(flightDoc.fileName, 'Авиабилет_Барселона_TK9X7M.pdf');
    assert.equal(flightDoc.fileMimeType, 'application/pdf');
    assert.equal(flightDoc.fileSize, samplePdfBytes.length);
    assert.equal('fileDataBase64' in flightDoc, false, 'fileDataBase64 не должен возвращаться в DTO');

    // Создадим также бронь отеля с изображением в формате Data URL
    const samplePngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const samplePngDataUrl = `data:image/png;base64,${samplePngBytes.toString('base64')}`;

    const createHotelRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Отель Casa Barcelona',
        category: 'HOTEL_BOOKING',
        status: 'PENDING',
        provider: 'Booking.com',
        referenceCode: 'BK-442190',
        eventDate: '2026-11-10',
        endDate: '2026-11-17',
        notes: 'Оплата при заселении, код домофона #142',
        fileName: 'hotel-voucher.png',
        fileDataBase64: samplePngDataUrl,
      },
    });
    assert.equal(createHotelRes.status, 201);
    const hotelDoc = createHotelRes.body.data.document;
    assert.equal(hotelDoc.hasAttachment, true);
    assert.equal(hotelDoc.fileMimeType, 'image/png');
    assert.equal(hotelDoc.fileSize, samplePngBytes.length);
    console.log('✅ 3. Создание броней с PNR и вложениями (Base64 и Data URL) проверено');

    // 4. Получение списка документов и проверка summary и отсутствия fileDataBase64
    const listRes = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(listRes.status, 200);
    const { documents, summary } = listRes.body.data;
    assert.equal(documents.length, 6);
    assert.equal(summary.totalCount, 6);
    assert.equal(summary.readyCount, 1);
    assert.equal(summary.pendingCount, 1);
    assert.equal(summary.requiredCount, 4);
    assert.equal(summary.withAttachmentCount, 2);

    const flightInList = documents.find((d: any) => d.id === flightDoc.id);
    assert.ok(flightInList);
    assert.equal(flightInList.hasAttachment, true);
    assert.equal('fileDataBase64' in flightInList, false);

    const flightCategorySummary = summary.byCategory.find(
      (c: any) => c.category === 'FLIGHT_TICKET'
    );
    assert.equal(flightCategorySummary.count, 2);
    assert.equal(flightCategorySummary.readyCount, 1);
    assert.equal(flightCategorySummary.requiredCount, 1);
    assert.equal(flightCategorySummary.withAttachmentCount, 1);
    console.log('✅ 4. Получение списка, hasAttachment, отсутствие fileDataBase64 и summary проверены');

    // 5. Получение/скачивание вложения через GET /api/documents/:id/attachment
    const attachmentInlineRes = await request(
      baseUrl,
      'GET',
      `/api/documents/${flightDoc.id}/attachment`,
      { cookies: user1Cookies }
    );
    assert.equal(attachmentInlineRes.status, 200);
    assert.equal(attachmentInlineRes.headers.get('content-type'), 'application/pdf');
    const inlineDisposition = attachmentInlineRes.headers.get('content-disposition') || '';
    assert.ok(inlineDisposition.startsWith('inline;'));
    assert.ok(
      inlineDisposition.includes(encodeURIComponent('Авиабилет_Барселона_TK9X7M.pdf')),
      'Заголовок Content-Disposition содержит UTF-8 имя файла'
    );
    assert.deepEqual(attachmentInlineRes.rawBuffer, samplePdfBytes);

    const attachmentDownloadRes = await request(
      baseUrl,
      'GET',
      `/api/documents/${hotelDoc.id}/attachment?download=1`,
      { cookies: user1Cookies }
    );
    assert.equal(attachmentDownloadRes.status, 200);
    assert.equal(attachmentDownloadRes.headers.get('content-type'), 'image/png');
    assert.ok(
      (attachmentDownloadRes.headers.get('content-disposition') || '').startsWith('attachment;')
    );
    assert.deepEqual(attachmentDownloadRes.rawBuffer, samplePngBytes);

    const attachmentJsonRes = await request(
      baseUrl,
      'GET',
      `/api/documents/${flightDoc.id}/attachment?format=json`,
      { cookies: user1Cookies }
    );
    assert.equal(attachmentJsonRes.status, 200);
    assert.equal(attachmentJsonRes.body.data.attachment.fileDataBase64, samplePdfBase64);
    assert.equal(attachmentJsonRes.body.data.attachment.fileName, 'Авиабилет_Барселона_TK9X7M.pdf');

    // Документ без вложения возвращает 404
    const insuranceSeeded = documents.find((d: any) => d.category === 'INSURANCE');
    assert.ok(insuranceSeeded);
    const missingAttachmentRes = await request(
      baseUrl,
      'GET',
      `/api/documents/${insuranceSeeded.id}/attachment`,
      { cookies: user1Cookies }
    );
    assert.equal(missingAttachmentRes.status, 404);
    console.log('✅ 5. Скачивание/предпросмотр вложения (/attachment inline, download, json и 404) проверены');

    // 6. Смена статуса (REQUIRED -> PENDING -> READY), замена и удаление вложения, удаление документа
    const toPending = await request(baseUrl, 'PATCH', `/api/documents/${insuranceSeeded.id}`, {
      cookies: user1Cookies,
      body: {
        status: 'PENDING',
        provider: 'АльфаСтрахование',
        referenceCode: 'POL-778899',
      },
    });
    assert.equal(toPending.status, 200);
    assert.equal(toPending.body.data.document.status, 'PENDING');
    assert.equal(toPending.body.data.document.provider, 'АльфаСтрахование');

    const toReady = await request(baseUrl, 'PATCH', `/api/documents/${insuranceSeeded.id}`, {
      cookies: user1Cookies,
      body: {
        status: 'READY',
      },
    });
    assert.equal(toReady.status, 200);
    assert.equal(toReady.body.data.document.status, 'READY');

    // Удаление вложения у отеля через removeAttachment: true
    const removeAttachmentRes = await request(baseUrl, 'PATCH', `/api/documents/${hotelDoc.id}`, {
      cookies: user1Cookies,
      body: {
        removeAttachment: true,
        status: 'READY',
      },
    });
    assert.equal(removeAttachmentRes.status, 200);
    assert.equal(removeAttachmentRes.body.data.document.hasAttachment, false);
    assert.equal(removeAttachmentRes.body.data.document.fileName, null);
    assert.equal(removeAttachmentRes.body.data.document.fileMimeType, null);
    assert.equal(removeAttachmentRes.body.data.document.fileSize, null);

    const hotelAttachmentAfterRemove = await request(
      baseUrl,
      'GET',
      `/api/documents/${hotelDoc.id}/attachment`,
      { cookies: user1Cookies }
    );
    assert.equal(hotelAttachmentAfterRemove.status, 404);

    // Удаление документа
    const deleteDocRes = await request(baseUrl, 'DELETE', `/api/documents/${hotelDoc.id}`, {
      cookies: user1Cookies,
    });
    assert.equal(deleteDocRes.status, 200);
    assert.equal(deleteDocRes.body.data.deleted, true);

    const listAfterDelete = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
    });
    assert.equal(listAfterDelete.status, 200);
    assert.equal(listAfterDelete.body.data.documents.length, 5);
    assert.equal(listAfterDelete.body.data.summary.withAttachmentCount, 1);
    console.log('✅ 6. Смена статуса (REQUIRED -> PENDING -> READY), удаление вложения и удаление документа проверены');

    // 7. Защита от доступа чужого пользователя (403) и 404 для несуществующих записей
    const u2List = await request(baseUrl, 'GET', `/api/trips/${tripId}/documents`, {
      cookies: user2Cookies,
    });
    const u2Create = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user2Cookies,
      body: { title: 'Чужой документ', category: 'OTHER' },
    });
    const u2Seed = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents/seed-defaults`, {
      cookies: user2Cookies,
    });
    const u2Patch = await request(baseUrl, 'PATCH', `/api/documents/${flightDoc.id}`, {
      cookies: user2Cookies,
      body: { status: 'REQUIRED' },
    });
    const u2GetAttachment = await request(
      baseUrl,
      'GET',
      `/api/documents/${flightDoc.id}/attachment`,
      { cookies: user2Cookies }
    );
    const u2Delete = await request(baseUrl, 'DELETE', `/api/documents/${flightDoc.id}`, {
      cookies: user2Cookies,
    });

    assert.equal(u2List.status, 403);
    assert.equal(u2Create.status, 403);
    assert.equal(u2Seed.status, 403);
    assert.equal(u2Patch.status, 403);
    assert.equal(u2GetAttachment.status, 403);
    assert.equal(u2Delete.status, 403);

    const missingDocPatch = await request(
      baseUrl,
      'PATCH',
      '/api/documents/00000000-0000-0000-0000-000000000000',
      { cookies: user1Cookies, body: { status: 'READY' } }
    );
    assert.equal(missingDocPatch.status, 404);
    console.log('✅ 7. Изоляция прав доступа (403 для чужого пользователя, 404 для несуществующих) проверена');

    // 8. Валидация размера файла (> 4 МБ), MIME-типа, дат и URL
    const oversizedBytes = Buffer.alloc(4 * 1024 * 1024 + 512, 0x41);
    const oversizedRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Слишком большой скан паспорта',
        category: 'VISA_PASSPORT',
        fileName: 'huge.pdf',
        fileMimeType: 'application/pdf',
        fileDataBase64: oversizedBytes.toString('base64'),
      },
    });
    assert.equal(oversizedRes.status, 400);
    assert.equal(oversizedRes.body.error.code, 'FILE_TOO_LARGE');

    const badMimeRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Скрипт',
        category: 'OTHER',
        fileName: 'script.txt',
        fileMimeType: 'text/plain',
        fileDataBase64: Buffer.from('hello world').toString('base64'),
      },
    });
    assert.equal(badMimeRes.status, 400);

    const badBase64Res = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Битый файл',
        category: 'OTHER',
        fileName: 'broken.pdf',
        fileMimeType: 'application/pdf',
        fileDataBase64: 'not-valid-base64!!!',
      },
    });
    assert.equal(badBase64Res.status, 400);

    const badDatesRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Страховка с неверными датами',
        category: 'INSURANCE',
        eventDate: '2026-11-20',
        endDate: '2026-11-10',
      },
    });
    assert.equal(badDatesRes.status, 400);

    const badUrlRes = await request(baseUrl, 'POST', `/api/trips/${tripId}/documents`, {
      cookies: user1Cookies,
      body: {
        title: 'Небезопасная ссылка',
        category: 'OTHER',
        externalUrl: 'javascript:alert(1)',
      },
    });
    assert.equal(badUrlRes.status, 400);
    console.log('✅ 8. Валидация размера (>4 МБ), MIME-типа, Base64, дат и URL проверена');

    // 9. Проверка, что частичная смена дат (PATCH endDate < existing.eventDate) тоже валидируется
    const partialDateViolation = await request(baseUrl, 'PATCH', `/api/documents/${flightDoc.id}`, {
      cookies: user1Cookies,
      body: { endDate: '2026-11-01' },
    });
    assert.equal(partialDateViolation.status, 400);

    // Проверка каскадного удаления при удалении поездки
    const delTripRes = await request(baseUrl, 'DELETE', `/api/trips/${tripId}`, {
      cookies: user1Cookies,
    });
    assert.equal(delTripRes.status, 200);
    const orphanDocsCount = await prisma.tripDocument.count({ where: { tripId } });
    assert.equal(orphanDocsCount, 0, 'Документы поездки должны удаляться каскадно');
    console.log('✅ 9. Частичная валидация дат и каскадное удаление документов при удалении поездки проверены');

    console.log('\n🎉 Все 9 интеграционных сценариев Trip Documents & Bookings API успешно пройдены!');
  } finally {
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

runTests().catch((err) => {
  console.error('❌ Ошибка в тестах Trip Documents API:', err);
  process.exit(1);
});
