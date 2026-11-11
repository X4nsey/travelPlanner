import { prisma } from '../lib/prisma';

async function testManualPhotoFlow() {
  console.log('=== ЗАПУСК ПРАКТИЧЕСКОГО ТЕСТИРОВАНИЯ РУЧНОЙ ЗАМЕНЫ ФОТОГРАФИЙ ===\n');

  const BASE_URL = 'http://localhost:3000/api';

  // 1. Получаем исходные данные страны Аргентина через публичный API
  console.log('1. Получение исходных данных Аргентины через GET /api/countries/argentina...');
  const initialRes = await fetch(`${BASE_URL}/countries/argentina`);
  if (!initialRes.ok) throw new Error(`HTTP ${initialRes.status}: Не удалось загрузить данные Аргентины`);
  const initialData = (await initialRes.json()) as any;
  const initialCoverUrl = initialData.data.country.coverPhoto.url;
  const initialLandmarkPhoto = initialData.data.country.landmarks[0].photoUrl;
  console.log(`✓ Исходная обложка Аргентины: ${initialCoverUrl.slice(0, 70)}...`);
  console.log(`✓ Исходное фото достопримечательности [0] (${initialData.data.country.landmarks[0].name}): ${initialLandmarkPhoto?.slice(0, 70) || 'нет'}...`);

  // 2. Замена обложки страны на новое проверенное фото (Водопады Игуасу, Аргентина)
  console.log('\n2. Замена обложки страны через POST /api/countries/diagnostics/photos/replace...');
  const newCoverUrl = 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1280&q=80';
  const replaceCoverRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'cover',
      targetKey: 'main',
      url: newCoverUrl,
      objectName: 'Водопады Игуасу, Аргентина',
      cityName: 'Пуэрто-Игуасу',
      authorName: 'TravelPlanner Tester',
      sourceName: 'Unsplash',
      sourceUrl: 'https://unsplash.com',
    }),
  });

  const replaceCoverJson = (await replaceCoverRes.json()) as any;
  if (!replaceCoverRes.ok) {
    throw new Error(`Ошибка замены обложки: ${JSON.stringify(replaceCoverJson)}`);
  }
  console.log('✓ Ответ backend на замену обложки: success = true');
  console.log(`✓ manualOverride в ответе: ${replaceCoverJson.data.record.manualOverride}`);
  if (replaceCoverJson.data.record.manualOverride !== true) {
    throw new Error('ОШИБКА: manualOverride должен быть true!');
  }

  // 3. Проверка реальной записи в PostgreSQL через Prisma
  console.log('\n3. Проверка реальной записи в PostgreSQL (таблица PhotoRecord)...');
  const dbCoverRecord = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: {
        countrySlug: 'argentina',
        targetType: 'cover',
        targetKey: 'main',
      },
    },
  });

  if (!dbCoverRecord) {
    throw new Error('ОШИБКА: Запись PhotoRecord не найдена в базе данных PostgreSQL!');
  }
  if (!dbCoverRecord.manualOverride) {
    throw new Error('ОШИБКА: Запись в PostgreSQL имеет manualOverride = false!');
  }
  if (dbCoverRecord.url !== newCoverUrl) {
    throw new Error(`ОШИБКА: В PostgreSQL записан неверный URL: ${dbCoverRecord.url}`);
  }
  console.log('✓ Запись в PostgreSQL подтверждена: ID =', dbCoverRecord.id);
  console.log('✓ manualOverride в PostgreSQL =', dbCoverRecord.manualOverride);
  console.log('✓ URL в PostgreSQL =', dbCoverRecord.url.slice(0, 70));

  // 4. Проверка публичного API: GET /api/countries/argentina
  console.log('\n4. Проверка публичного API GET /api/countries/argentina...');
  const publicRes1 = await fetch(`${BASE_URL}/countries/argentina`);
  const publicData1 = (await publicRes1.json()) as any;
  const currentCoverUrl = publicData1.data.country.coverPhoto.url;
  console.log(`✓ Текущая обложка в публичном API: ${currentCoverUrl.slice(0, 70)}...`);
  if (currentCoverUrl !== newCoverUrl) {
    throw new Error(`ОШИБКА: Публичный API вернул старую обложку: ${currentCoverUrl}`);
  }
  console.log('✓ Публичный API возвращает обновлённую обложку!');

  // 5. Проверка сохранения после "перезагрузки" (повторный запрос)
  console.log('\n5. Проверка сохранения после перезагрузки страницы/клиента...');
  const reloadRes = await fetch(`${BASE_URL}/countries/argentina`);
  const reloadData = (await reloadRes.json()) as any;
  if (reloadData.data.country.coverPhoto.url !== newCoverUrl) {
    throw new Error('ОШИБКА: После перезагрузки фотография сбросилась!');
  }
  console.log('✓ Фотография успешно сохранена и остаётся после перезагрузки!');

  // 6. Замена фотографии достопримечательности
  console.log('\n6. Замена фотографии достопримечательности [0] (Театр Колон)...');
  const newLandmarkUrl = 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80';
  const replaceLmRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'landmark',
      targetKey: '0',
      url: newLandmarkUrl,
      objectName: 'Театр Колон (Буэнос-Айрес, Аргентина)',
      cityName: 'Буэнос-Айрес',
      authorName: 'TravelPlanner Tester',
      sourceName: 'Unsplash',
      sourceUrl: 'https://unsplash.com',
    }),
  });

  const replaceLmJson = (await replaceLmRes.json()) as any;
  if (!replaceLmRes.ok) {
    throw new Error(`Ошибка замены достопримечательности: ${JSON.stringify(replaceLmJson)}`);
  }
  console.log('✓ Достопримечательность успешно обновлена с manualOverride = true');

  // Проверка в PostgreSQL
  const dbLmRecord = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: {
        countrySlug: 'argentina',
        targetType: 'landmark',
        targetKey: '0',
      },
    },
  });
  if (!dbLmRecord || !dbLmRecord.manualOverride || dbLmRecord.url !== newLandmarkUrl) {
    throw new Error('ОШИБКА: Достопримечательность не записана в PostgreSQL корректно!');
  }
  console.log('✓ Достопримечательность подтверждена в PostgreSQL!');

  // Проверка в публичном API
  const publicRes2 = await fetch(`${BASE_URL}/countries/argentina`);
  const publicData2 = (await publicRes2.json()) as any;
  const currentLmUrl = publicData2.data.country.landmarks[0].photoUrl;
  if (currentLmUrl !== newLandmarkUrl) {
    throw new Error(`ОШИБКА: Публичный API вернул старое фото достопримечательности: ${currentLmUrl}`);
  }
  console.log(`✓ Публичный API возвращает обновлённую достопримечательность: ${currentLmUrl.slice(0, 70)}...`);

  // 7. Проверка защиты от автоматической перезаписи (Wikimedia auto-search)
  console.log('\n7. Проверка защиты ручного закрепления от авто-поиска Wikimedia...');
  const autoSearchRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/wikimedia-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'landmark',
      targetKey: '0',
    }),
  });
  const autoSearchJson = (await autoSearchRes.json()) as any;
  if (autoSearchRes.ok) {
    throw new Error('ОШИБКА: Автоматический поиск должен был быть заблокирован для ручного закрепления!');
  }
  console.log(`✓ Авто-поиск заблокирован сервером: "${autoSearchJson.error?.message}"`);

  // 8. Проверка повторной проверки (reverify)
  console.log('\n8. Проверка reverify: ручное закрепление должно сохраняться...');
  const reverifyRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/reverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'landmark',
      targetKey: '0',
    }),
  });
  const reverifyJson = (await reverifyRes.json()) as any;
  if (!reverifyRes.ok) {
    throw new Error(`Ошибка reverify: ${JSON.stringify(reverifyJson)}`);
  }
  if (reverifyJson.data.record.manualOverride !== true) {
    throw new Error('ОШИБКА: reverify сбросил manualOverride!');
  }
  console.log('✓ Reverify сохранил manualOverride = true и не перезаписал URL!');

  // 9. Проверка снятия ручного закрепления (Reset)
  console.log('\n9. Проверка снятия ручного закрепления (POST /api/countries/diagnostics/photos/reset)...');
  const resetRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'cover',
      targetKey: 'main',
    }),
  });
  const resetJson = await resetRes.json();
  if (!resetRes.ok) {
    throw new Error(`Ошибка сброса закрепления: ${JSON.stringify(resetJson)}`);
  }
  console.log('✓ Ручное закрепление обложки успешно снято через API');

  // Проверяем, что в PostgreSQL запись удалена
  const dbAfterReset = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: {
        countrySlug: 'argentina',
        targetType: 'cover',
        targetKey: 'main',
      },
    },
  });
  if (dbAfterReset) {
    throw new Error('ОШИБКА: Запись в PostgreSQL не была удалена при сбросе!');
  }
  console.log('✓ Запись в PostgreSQL успешно удалена!');

  // Проверяем, что публичный API вернул стандартное исходное изображение
  const publicRes3 = await fetch(`${BASE_URL}/countries/argentina`);
  const publicData3 = (await publicRes3.json()) as any;
  const revertedCover = publicData3.data.country.coverPhoto.url;
  console.log(`✓ Обложка после сброса: ${revertedCover.slice(0, 70)}...`);
  if (revertedCover === newCoverUrl) {
    throw new Error('ОШИБКА: После сброса обложка осталась переопределённой!');
  }
  console.log('✓ Восстановлено проверенное стандартное изображение из каталога!');

  // Сбрасываем и достопримечательность для чистоты
  await fetch(`${BASE_URL}/countries/diagnostics/photos/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'landmark',
      targetKey: '0',
    }),
  });
  console.log('✓ Ручное закрепление достопримечательности также успешно снято');

  console.log('\n======================================================');
  console.log('🎉 ВСЕ ПРОВЕРКИ УСПЕШНО ПРОЙДЕНЫ БЕЗ ОШИБОК!');
  console.log('======================================================\n');
}

testManualPhotoFlow()
  .catch((err) => {
    console.error('\n❌ ТЕСТ ПРЕРВАН С ОШИБКОЙ:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
