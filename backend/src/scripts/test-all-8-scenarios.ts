import { prisma } from '../lib/prisma';
import { PhotoService } from '../services/photo.service';

async function runAll8Scenarios() {
  console.log('================================================================');
  console.log('   ПРОВЕРКА 8 СЦЕНАРИЕВ СИСТЕМЫ ФОТОГРАФИЙ TRAVELPLANNER');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:3000/api';

  // --- СЦЕНАРИЙ 1: Ручная замена фото страны -> отображение и сохранение в БД ---
  console.log('--- СЦЕНАРИЙ 1: Ручная замена главной обложки страны ---');
  const scenario1Url = 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1280&q=80';
  const res1 = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'cover',
      targetKey: 'main',
      url: scenario1Url,
      objectName: 'Водопады Игуасу (Аргентина)',
      cityName: 'Пуэрто-Игуасу',
      authorName: 'TravelPlanner Tester',
      sourceName: 'Unsplash',
    }),
  });
  const data1 = (await res1.json()) as any;
  if (!res1.ok || !data1.data?.record?.manualOverride) {
    throw new Error(`Сценарий 1 провален: ${JSON.stringify(data1)}`);
  }
  const dbRecord1 = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: { countrySlug: 'argentina', targetType: 'cover', targetKey: 'main' },
    },
  });
  if (!dbRecord1 || dbRecord1.url !== scenario1Url || !dbRecord1.manualOverride) {
    throw new Error('Сценарий 1 провален: в PostgreSQL запись отсутствует или manualOverride = false');
  }
  const publicApi1 = (await (await fetch(`${BASE_URL}/countries/argentina`)).json()) as any;
  if (publicApi1.data.country.coverPhoto.url !== scenario1Url) {
    throw new Error('Сценарий 1 провален: публичный API не возвращает обновлённую обложку');
  }
  console.log('✅ Сценарий 1 пройден: ручная замена обложки сохранена в PostgreSQL (manualOverride=true) и видна в публичном API.\n');

  // --- СЦЕНАРИЙ 2: Ручная замена фото достопримечательности -> отображение и сохранение в БД ---
  console.log('--- СЦЕНАРИЙ 2: Ручная замена фото достопримечательности ---');
  const scenario2Url = 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80';
  const res2 = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'landmark',
      targetKey: '0',
      url: scenario2Url,
      objectName: 'Ледник Перито-Морено (Аргентина)',
      cityName: 'Эль-Калафате',
      authorName: 'TravelPlanner Tester',
      sourceName: 'Unsplash',
    }),
  });
  const data2 = (await res2.json()) as any;
  if (!res2.ok || !data2.data?.record?.manualOverride) {
    throw new Error(`Сценарий 2 провален: ${JSON.stringify(data2)}`);
  }
  const dbRecord2 = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: { countrySlug: 'argentina', targetType: 'landmark', targetKey: '0' },
    },
  });
  if (!dbRecord2 || dbRecord2.url !== scenario2Url || !dbRecord2.manualOverride) {
    throw new Error('Сценарий 2 провален: в PostgreSQL запись достопримечательности отсутствует');
  }
  const publicApi2 = (await (await fetch(`${BASE_URL}/countries/argentina`)).json()) as any;
  if (publicApi2.data.country.landmarks[0].photoUrl !== scenario2Url) {
    throw new Error('Сценарий 2 провален: публичный API не возвращает обновлённую достопримечательность');
  }
  console.log('✅ Сценарий 2 пройден: достопримечательность успешно обновлена в PostgreSQL и публичном API.\n');

  // --- СЦЕНАРИЙ 3: Перезагрузка страницы -> сохранение нового фото ---
  console.log('--- СЦЕНАРИЙ 3: Проверка сохранения после перезагрузки страницы (холодный запрос) ---');
  const reloadRes = await fetch(`${BASE_URL}/countries/argentina`, { headers: { 'Cache-Control': 'no-cache' } });
  const reloadData = (await reloadRes.json()) as any;
  if (reloadData.data.country.coverPhoto.url !== scenario1Url) {
    throw new Error('Сценарий 3 провален: обложка сбросилась после перезагрузки!');
  }
  if (reloadData.data.country.landmarks[0].photoUrl !== scenario2Url) {
    throw new Error('Сценарий 3 провален: достопримечательность сбросилась после перезагрузки!');
  }
  console.log('✅ Сценарий 3 пройден: все ручные изменения сохраняются после перезагрузки страницы.\n');

  // --- СЦЕНАРИЙ 4: Повторный вход / новая сессия -> сохранение нового фото ---
  console.log('--- СЦЕНАРИЙ 4: Проверка сохранения в новой пользовательской сессии ---');
  const newSessionRes = await fetch(`${BASE_URL}/countries/argentina`, {
    headers: {
      'User-Agent': 'TravelPlannerNewSessionBrowser/2.0',
      'X-Session-ID': 'test-session-' + Date.now(),
    },
  });
  const newSessionData = (await newSessionRes.json()) as any;
  if (newSessionData.data.country.coverPhoto.url !== scenario1Url) {
    throw new Error('Сценарий 4 провален: в новой сессии фото не сохранилось!');
  }
  console.log('✅ Сценарий 4 пройден: новая сессия получает закреплённое фото из PostgreSQL.\n');

  // --- СЦЕНАРИЙ 5: Запуск автоматического поиска / синхронизации -> закреплённое фото НЕ перезаписывается ---
  console.log('--- СЦЕНАРИЙ 5: Защита ручного закрепления от авто-поиска и синхронизации ---');
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
    throw new Error('Сценарий 5 провален: сервер разрешил авто-поиск для объекта с ручным закреплением!');
  }
  console.log(`✓ Ответ сервера: HTTP ${autoSearchRes.status} — "${autoSearchJson.error?.message}"`);

  // Также проверяем reverify
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
  if (!reverifyRes.ok || reverifyJson.data?.record?.manualOverride !== true || reverifyJson.data?.record?.url !== scenario2Url) {
    throw new Error('Сценарий 5 провален: reverify сбросил или перезаписал закреплённое фото!');
  }
  console.log('✅ Сценарий 5 пройден: авто-поиск надёжно заблокирован, повторная проверка сохраняет manualOverride=true.\n');

  // --- СЦЕНАРИЙ 6: Попытка использовать одно фото для двух стран -> отклонено / rejected ---
  console.log('--- СЦЕНАРИЙ 6: Запрет межстранового дублирования изображений ---');
  // Пытаемся привязать то же самое фото (scenario1Url), закреплённое за Аргентиной, к Бразилии
  const dupRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'brazil',
      targetType: 'cover',
      targetKey: 'main',
      url: scenario1Url,
      objectName: 'Водопады Игуасу, Бразилия',
      cityName: 'Фос-ду-Игуасу',
      sourceName: 'Unsplash',
    }),
  });
  const dupJson = (await dupRes.json()) as any;
  if (dupRes.ok) {
    throw new Error('Сценарий 6 провален: сервер разрешил использовать одно и то же фото для Аргентины и Бразилии!');
  }
  console.log(`✓ Запрос отклонён сервером: HTTP ${dupRes.status} — "${dupJson.error?.message}"`);
  console.log('✅ Сценарий 6 пройден: межстрановой дубликат успешно отклонён.\n');

  // --- СЦЕНАРИЙ 7: Попытка привязать фото немецкого замка к Аргентине -> отклонено с ошибкой несоответствия страны ---
  console.log('--- СЦЕНАРИЙ 7: Попытка привязать фото немецкого замка Burg Eltz к Аргентине ---');
  const germanCastleUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80';
  const germanRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'gallery',
      targetKey: '1',
      url: germanCastleUrl,
      objectName: 'Голубой ледник Перито-Морено в Патагонии',
      cityName: 'Эль-Калафате',
    }),
  });
  const germanJson = (await germanRes.json()) as any;
  if (germanRes.ok) {
    throw new Error('Сценарий 7 провален: сервер разрешил привязать немецкий замок Burg Eltz к Аргентине!');
  }
  console.log(`✓ Немецкий замок отклонён сервером: HTTP ${germanRes.status} — "${germanJson.error?.message}"`);
  if (!germanJson.error?.message?.includes('Германия') && !germanJson.error?.message?.includes('Отклонено')) {
    throw new Error(`Сценарий 7 провален: сообщение об ошибке не указывает на причину отклонения: ${germanJson.error?.message}`);
  }
  console.log('✅ Сценарий 7 пройден: фото немецкого замка гарантированно отклоняется при попытке привязать его к Аргентине.\n');

  // --- СЦЕНАРИЙ 8: Фото без гео-метаданных -> статус "needs_review", не "verified" ---
  console.log('--- СЦЕНАРИЙ 8: Фото без подтверждённых гео-метаданных -> статус "needs_review" ---');
  // Прямая проверка метода verifyPhotoGeoMatch
  const unconfirmedCheck = PhotoService.verifyPhotoGeoMatch({
    url: 'https://images.unsplash.com/photo-1500000000000?auto=format&fit=crop&w=800',
    objectName: 'Случайное безымянное фото озера',
    countrySlug: 'argentina',
    countryNameRu: 'Аргентина',
    countryNameEn: 'Argentina',
    cityName: 'Барилоче',
    entityType: 'landmark',
  });
  console.log(`✓ Результат проверки безымянного фото: verified = ${unconfirmedCheck.verified}, status = "${unconfirmedCheck.status}"`);
  if (unconfirmedCheck.verified !== false || unconfirmedCheck.status !== 'needs_review') {
    throw new Error(`Сценарий 8 провален: статус должен быть 'needs_review' и verified = false, получено: ${JSON.stringify(unconfirmedCheck)}`);
  }

  // Проверка через API ручного сохранения: статус должен быть needs_review
  const genericPhotoUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';
  const saveUnconfirmedRes = await fetch(`${BASE_URL}/countries/diagnostics/photos/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countrySlug: 'argentina',
      targetType: 'gallery',
      targetKey: '2',
      url: genericPhotoUrl,
      objectName: 'Озеро Науэль-Уапи',
      cityName: 'Барилоче',
    }),
  });
  const saveUnconfirmedJson = (await saveUnconfirmedRes.json()) as any;
  if (!saveUnconfirmedRes.ok) {
    throw new Error(`Ошибка сохранения в сценарии 8: ${JSON.stringify(saveUnconfirmedJson)}`);
  }
  const dbUnconfirmed = await prisma.photoRecord.findUnique({
    where: {
      countrySlug_targetType_targetKey: { countrySlug: 'argentina', targetType: 'gallery', targetKey: '2' },
    },
  });
  if (!dbUnconfirmed || dbUnconfirmed.verificationStatus !== 'needs_review' || dbUnconfirmed.verified !== false) {
    throw new Error(`Сценарий 8 провален: в БД статус должен быть 'needs_review' и verified = false, получено: ${JSON.stringify(dbUnconfirmed)}`);
  }
  console.log(`✓ В базе данных PostgreSQL: status = "${dbUnconfirmed.verificationStatus}", verified = ${dbUnconfirmed.verified}`);
  console.log('✅ Сценарий 8 пройден: отсутствие гео-данных приводит исключительно к статусу "needs_review", но никогда не "verified".\n');

  // Очистка тестовых записей для чистоты базы данных
  console.log('--- Очистка тестовых записей ---');
  await fetch(`${BASE_URL}/countries/diagnostics/photos/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countrySlug: 'argentina', targetType: 'cover', targetKey: 'main' }),
  });
  await fetch(`${BASE_URL}/countries/diagnostics/photos/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countrySlug: 'argentina', targetType: 'landmark', targetKey: '0' }),
  });
  await fetch(`${BASE_URL}/countries/diagnostics/photos/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countrySlug: 'argentina', targetType: 'gallery', targetKey: '2' }),
  });
  console.log('✓ Все тестовые переопределения сброшены к стандартным проверенным значениям.');

  console.log('\n================================================================');
  console.log('🎉 ВСЕ 8 СЦЕНАРИЕВ УСПЕШНО И ПОЛНОСТЬЮ ПРОЙДЕНЫ!');
  console.log('================================================================\n');
}

runAll8Scenarios()
  .catch((err) => {
    console.error('\n❌ ТЕСТ ПРЕРВАН С ОШИБКОЙ:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
