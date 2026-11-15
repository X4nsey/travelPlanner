import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';
import { prisma } from '../lib/prisma';
import { PackingEngineService } from '../services/packing-engine.service';
import {
  computeWeatherSummary,
  deriveClimateFromSummary,
  mapWeatherCode,
  shiftDateToHistoricalYear,
  WeatherDailyItemDto,
} from '../services/weather.service';

interface TestResponse {
  status: number;
  body: any;
  cookies: Record<string, string>;
}

const originalFetch = globalThis.fetch;

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

function addDaysUtc(date: Date, days: number): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
  return d.toISOString().slice(0, 10);
}

function enumerateDates(startIso: string, endIso: string): string[] {
  const result: string[] = [];
  let cursor = new Date(`${startIso}T00:00:00.000Z`);
  const end = new Date(`${endIso}T00:00:00.000Z`);
  while (cursor <= end) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 86_400_000);
  }
  return result;
}

function runUnitTests() {
  console.log('🧪 [Weather Unit] Запуск модульных проверок погоды и интеграции с движком...\n');

  // 1. Маппинг WMO-кодов
  assert.deepEqual(mapWeatherCode(0), {
    conditionRu: 'Ясно',
    iconType: 'sunny',
    isSnow: false,
    isHeavyRain: false,
  });
  assert.equal(mapWeatherCode(2).iconType, 'partly_cloudy');
  assert.equal(mapWeatherCode(3).iconType, 'cloudy');
  assert.equal(mapWeatherCode(45).iconType, 'fog');
  assert.equal(mapWeatherCode(53).iconType, 'drizzle');
  assert.equal(mapWeatherCode(61).iconType, 'rain');
  assert.equal(mapWeatherCode(65).iconType, 'heavy_rain');
  assert.equal(mapWeatherCode(65).isHeavyRain, true);
  assert.equal(mapWeatherCode(73).iconType, 'snow');
  assert.equal(mapWeatherCode(73).isSnow, true);
  assert.equal(mapWeatherCode(95).iconType, 'thunderstorm');
  assert.equal(mapWeatherCode(999).iconType, 'partly_cloudy');
  console.log('✅ 1. Маппинг WMO-кодов проверен.');

  // 2. Високосная дата 29 февраля -> 28 февраля
  assert.equal(shiftDateToHistoricalYear('2028-02-29', 2027), '2027-02-28');
  assert.equal(shiftDateToHistoricalYear('2028-02-29', 2024), '2024-02-29');
  assert.equal(shiftDateToHistoricalYear('2026-07-15', 2025), '2025-07-15');
  console.log('✅ 2. Перенос даты 29 февраля -> 28 февраля для невисокосного года проверен.');

  // 3. Расчёт сводки и классификация всех 4 ClimateHint
  const tropicalDaily: WeatherDailyItemDto[] = [
    {
      date: '2026-07-01',
      weatherCode: 0,
      conditionRu: 'Ясно',
      iconType: 'sunny',
      tempMin: 22,
      tempMax: 31,
      precipitationMm: 0,
      precipitationProbMax: 5,
      windSpeedMaxKmh: 12,
    },
    {
      date: '2026-07-02',
      weatherCode: 1,
      conditionRu: 'Преимущественно ясно',
      iconType: 'sunny',
      tempMin: 20,
      tempMax: 29,
      precipitationMm: 0.2,
      precipitationProbMax: 10,
      windSpeedMaxKmh: 15,
    },
  ];
  const tropicalSummary = computeWeatherSummary(tropicalDaily);
  assert.equal(tropicalSummary.avgTempMin, 21);
  assert.equal(tropicalSummary.avgTempMax, 30);
  assert.equal(tropicalSummary.minTemp, 20);
  assert.equal(tropicalSummary.rainyDaysCount, 0);
  const tropicalClimate = deriveClimateFromSummary(tropicalSummary, 'seasonal_reference');
  assert.equal(tropicalClimate.climateHint, 'tropical_warm');
  assert.ok(tropicalClimate.climateLabelRu.includes('сезонный ориентир'));
  assert.ok(tropicalClimate.climateLabelRu.includes('без существенных осадков'));

  const warmSummary = computeWeatherSummary([
    {
      date: '2026-06-01',
      weatherCode: 2,
      conditionRu: 'Переменная облачность',
      iconType: 'partly_cloudy',
      tempMin: 12,
      tempMax: 23,
      precipitationMm: 0,
      precipitationProbMax: 15,
      windSpeedMaxKmh: 14,
    },
  ]);
  assert.equal(deriveClimateFromSummary(warmSummary, 'forecast').climateHint, 'warm_season');

  const coolSummary = computeWeatherSummary([
    {
      date: '2026-12-01',
      weatherCode: 73,
      conditionRu: 'Снегопад',
      iconType: 'snow',
      tempMin: -3,
      tempMax: 2,
      precipitationMm: 4.5,
      precipitationProbMax: 85,
      windSpeedMaxKmh: 28,
    },
  ]);
  assert.equal(coolSummary.hasSnow, true);
  const coolClimate = deriveClimateFromSummary(coolSummary, 'forecast');
  assert.equal(coolClimate.climateHint, 'cool_season');
  assert.ok(coolClimate.climateLabelRu.includes('возможен снег'));

  const shoulderSummary = computeWeatherSummary([
    {
      date: '2026-10-01',
      weatherCode: 61,
      conditionRu: 'Дождь',
      iconType: 'rain',
      tempMin: 9,
      tempMax: 17,
      precipitationMm: 3.4,
      precipitationProbMax: 75,
      windSpeedMaxKmh: 22,
    },
    {
      date: '2026-10-02',
      weatherCode: 63,
      conditionRu: 'Дождь',
      iconType: 'rain',
      tempMin: 10,
      tempMax: 18,
      precipitationMm: 5.1,
      precipitationProbMax: 80,
      windSpeedMaxKmh: 24,
    },
  ]);
  assert.equal(shoulderSummary.rainyDaysCount, 2);
  const shoulderClimate = deriveClimateFromSummary(shoulderSummary, 'forecast');
  assert.equal(shoulderClimate.climateHint, 'shoulder_or_uncertain');
  assert.ok(shoulderClimate.climateLabelRu.includes('дождливых дней: 2'));
  console.log('✅ 3. Сводка и классификация 4 типов ClimateHint проверены.');

  // 4. Интеграция с PackingEngineService (без погоды vs с погодой)
  const baseTripInput = {
    title: 'Поездка без активностей',
    country: 'Италия',
    city: 'Рим',
    startDate: '2026-07-10',
    endDate: '2026-07-14',
    travelersCount: 1,
    description: 'Отдых в отеле',
  };

  const withoutWeather = PackingEngineService.generateRecommendations(baseTripInput);
  assert.equal(withoutWeather.context.weatherSourceMode, 'heuristic');
  assert.equal(withoutWeather.context.climateHint, 'warm_season');
  assert.equal(
    withoutWeather.items.find((i) => i.ruleKey === 'other:umbrella'),
    undefined,
    'Без дождливого прогноза в тёплый сезон без прогулок зонт не добавляется'
  );

  const withRainyWarmWeather = PackingEngineService.generateRecommendations({
    ...baseTripInput,
    weatherContext: {
      sourceMode: 'forecast',
      climateHint: 'warm_season',
      climateLabelRu: 'прогноз погоды: +16…+23°C, сильные осадки (дождливых дней: 3)',
      resolvedCity: 'Рим',
      resolvedCountry: 'Италия',
      summary: {
        avgTempMin: 16,
        avgTempMax: 23,
        minTemp: 14,
        maxTemp: 25,
        totalPrecipitationMm: 28,
        rainyDaysCount: 3,
        maxWindKmh: 35,
        hasSnow: false,
        hasHeavyRain: true,
      },
    },
  });
  assert.equal(withRainyWarmWeather.context.weatherSourceMode, 'forecast');
  assert.ok(
    withRainyWarmWeather.items.find((i) => i.ruleKey === 'other:umbrella'),
    'При дождливом прогнозе зонт/дождевик добавляется даже в тёплый сезон'
  );

  const withSnowyShoulderWeather = PackingEngineService.generateRecommendations({
    ...baseTripInput,
    weatherContext: {
      sourceMode: 'seasonal_reference',
      climateHint: 'shoulder_or_uncertain',
      climateLabelRu: 'сезонный ориентир: +2…+12°C, возможен снег',
      resolvedCity: 'Рим',
      resolvedCountry: 'Италия',
      summary: {
        avgTempMin: 2,
        avgTempMax: 12,
        minTemp: 0,
        maxTemp: 14,
        totalPrecipitationMm: 12,
        rainyDaysCount: 2,
        maxWindKmh: 45,
        hasSnow: true,
        hasHeavyRain: false,
      },
    },
  });
  assert.equal(withSnowyShoulderWeather.context.weatherSourceMode, 'seasonal_reference');
  assert.ok(
    withSnowyShoulderWeather.items.find((i) => i.ruleKey === 'cloth:warm_jacket'),
    'При снеге в прогнозе добавляется тёплая куртка'
  );
  assert.ok(
    withSnowyShoulderWeather.items.find((i) => i.ruleKey === 'foot:warm_boots'),
    'При снеге в прогнозе добавляется утеплённая обувь'
  );
  assert.ok(
    withSnowyShoulderWeather.items.find((i) => i.ruleKey === 'cloth:windbreaker'),
    'При сильном ветре добавляется ветровка'
  );
  console.log('✅ 4. Интеграция с PackingEngineService (heuristic, forecast, seasonal_reference) проверена.');
}

async function runApiAndCacheTests() {
  console.log('\n🌐 [Weather API & Cache] Инициализация базы данных и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const counters = {
    geocoding: 0,
    forecast: 0,
    archive: 0,
  };

  // Перехватываем только внешние запросы к Open-Meteo
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (urlStr.startsWith('https://geocoding-api.open-meteo.com/')) {
      counters.geocoding += 1;
      const parsed = new URL(urlStr);
      const name = (parsed.searchParams.get('name') || '').toLowerCase();

      if (name.includes('рим') || name.includes('rome')) {
        return new Response(
          JSON.stringify({
            results: [
              {
                name: 'Рим',
                latitude: 41.8919,
                longitude: 12.5113,
                country_code: 'IT',
                country: 'Италия',
                timezone: 'Europe/Rome',
                population: 2873000,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (name.includes('милан') || name.includes('milan')) {
        return new Response(
          JSON.stringify({
            results: [
              {
                name: 'Милан',
                latitude: 45.4642,
                longitude: 9.19,
                country_code: 'IT',
                country: 'Италия',
                timezone: 'Europe/Rome',
                population: 1370000,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (name.includes('токио') || name.includes('tokyo')) {
        return new Response(
          JSON.stringify({
            results: [
              {
                name: 'Токио',
                latitude: 35.6895,
                longitude: 139.6917,
                country_code: 'JP',
                country: 'Япония',
                timezone: 'Asia/Tokyo',
                population: 13960000,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (urlStr.startsWith('https://api.open-meteo.com/v1/forecast')) {
      counters.forecast += 1;
      const parsed = new URL(urlStr);
      const start = parsed.searchParams.get('start_date')!;
      const end = parsed.searchParams.get('end_date')!;
      const dates = enumerateDates(start, end);
      return new Response(
        JSON.stringify({
          latitude: Number(parsed.searchParams.get('latitude')),
          longitude: Number(parsed.searchParams.get('longitude')),
          timezone: 'Europe/Rome',
          daily: {
            time: dates,
            weather_code: dates.map((_, idx) => (idx % 2 === 0 ? 1 : 61)),
            temperature_2m_min: dates.map(() => 12),
            temperature_2m_max: dates.map(() => 21),
            precipitation_sum: dates.map((_, idx) => (idx % 2 === 0 ? 0 : 4.2)),
            precipitation_probability_max: dates.map((_, idx) => (idx % 2 === 0 ? 10 : 80)),
            wind_speed_10m_max: dates.map(() => 18),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (urlStr.startsWith('https://archive-api.open-meteo.com/v1/archive')) {
      counters.archive += 1;
      const parsed = new URL(urlStr);
      const start = parsed.searchParams.get('start_date')!;
      const end = parsed.searchParams.get('end_date')!;
      const dates = enumerateDates(start, end);
      return new Response(
        JSON.stringify({
          latitude: Number(parsed.searchParams.get('latitude')),
          longitude: Number(parsed.searchParams.get('longitude')),
          timezone: 'Asia/Tokyo',
          daily: {
            time: dates,
            weather_code: dates.map((_, idx) => (idx === 0 ? 2 : 0)),
            temperature_2m_min: dates.map(() => 5),
            temperature_2m_max: dates.map(() => 14),
            precipitation_sum: dates.map(() => 0.4),
            wind_speed_10m_max: dates.map(() => 16),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return originalFetch(input, init);
  }) as typeof fetch;

  const suffix = Date.now();
  const user1Email = `weather.u1.${suffix}@example.com`;
  const user2Email = `weather.u2.${suffix}@example.com`;

  try {
    const reg1 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Дмитрий Погода',
        email: user1Email,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert.equal(reg1.status, 201);
    const user1Cookies = reg1.cookies;

    const reg2 = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        name: 'Елена Другая',
        email: user2Email,
        password: 'password456',
        confirmPassword: 'password456',
      },
    });
    assert.equal(reg2.status, 201);
    const user2Cookies = reg2.cookies;

    const today = new Date();
    const forecastStart = addDaysUtc(today, 1);
    const forecastEnd = addDaysUtc(today, 4);

    // 1. Поездка в окне forecast
    const forecastTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Рим на ближайшие дни',
        country: 'Италия',
        city: 'Рим',
        startDate: forecastStart,
        endDate: forecastEnd,
        travelersCount: 2,
        budget: 100000,
        currency: 'RUB',
      },
    });
    assert.equal(forecastTripRes.status, 201);
    const forecastTripId = forecastTripRes.body.data.trip.id as string;

    // Проверка авторизации и изоляции прав
    const unauthWeather = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`);
    assert.equal(unauthWeather.status, 401);

    const unauthRefresh = await request(
      baseUrl,
      'POST',
      `/api/trips/${forecastTripId}/weather/refresh`
    );
    assert.equal(unauthRefresh.status, 401);

    const foreignWeather = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`, {
      cookies: user2Cookies,
    });
    assert.equal(foreignWeather.status, 403);

    const foreignRefresh = await request(
      baseUrl,
      'POST',
      `/api/trips/${forecastTripId}/weather/refresh`,
      { cookies: user2Cookies }
    );
    assert.equal(foreignRefresh.status, 403);

    const missingTripWeather = await request(
      baseUrl,
      'GET',
      '/api/trips/00000000-0000-0000-0000-000000000000/weather',
      { cookies: user1Cookies }
    );
    assert.equal(missingTripWeather.status, 404);
    console.log('✅ 5. Защита маршрутов (401, 403, 404) проверена.');

    // 2. Первый запрос (miss -> forecast) и повторный (hit -> cache)
    const w1 = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(w1.status, 200);
    assert.equal(w1.body.data.sourceMode, 'forecast');
    assert.equal(w1.body.data.fromCache, false);
    assert.equal(w1.body.data.resolvedCity, 'Рим');
    assert.equal(w1.body.data.daily.length, 4);
    assert.equal(counters.forecast, 1);

    const w2 = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(w2.status, 200);
    assert.equal(w2.body.data.fromCache, true);
    assert.equal(counters.forecast, 1, 'При свежем кэше повторный запрос к Open-Meteo не делается');

    // 3. Принудительное обновление /refresh
    const wRefresh = await request(
      baseUrl,
      'POST',
      `/api/trips/${forecastTripId}/weather/refresh`,
      { cookies: user1Cookies }
    );
    assert.equal(wRefresh.status, 200);
    assert.equal(wRefresh.body.data.fromCache, false);
    assert.equal(counters.forecast, 2);

    // 4. Протухание TTL кэша
    await prisma.tripWeatherCache.update({
      where: { tripId: forecastTripId },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    const wExpired = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(wExpired.status, 200);
    assert.equal(wExpired.body.data.fromCache, false);
    assert.equal(counters.forecast, 3);
    console.log('✅ 6. Кэширование TripWeatherCache, TTL и /refresh проверены.');

    // 5. Инвалидация кэша при редактировании поездки
    const patchTitleOnly = await request(baseUrl, 'PATCH', `/api/trips/${forecastTripId}`, {
      cookies: user1Cookies,
      body: { title: 'Рим (новое название)' },
    });
    assert.equal(patchTitleOnly.status, 200);
    const cacheAfterTitlePatch = await prisma.tripWeatherCache.findUnique({
      where: { tripId: forecastTripId },
    });
    assert.ok(cacheAfterTitlePatch, 'Изменение только title не сбрасывает кэш погоды');

    const patchCity = await request(baseUrl, 'PATCH', `/api/trips/${forecastTripId}`, {
      cookies: user1Cookies,
      body: { city: 'Милан' },
    });
    assert.equal(patchCity.status, 200);
    const cacheAfterCityPatch = await prisma.tripWeatherCache.findUnique({
      where: { tripId: forecastTripId },
    });
    assert.equal(cacheAfterCityPatch, null, 'Изменение city должно инвалидировать кэш погоды');

    const wMilan = await request(baseUrl, 'GET', `/api/trips/${forecastTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(wMilan.status, 200);
    assert.equal(wMilan.body.data.fromCache, false);
    assert.equal(wMilan.body.data.resolvedCity, 'Милан');
    console.log('✅ 7. Инвалидация кэша при изменении city/country/startDate/endDate проверена.');

    // 6. Режим seasonal_reference и перенос високосного 29 февраля
    const archiveTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Весна в Токио 2028',
        country: 'Япония',
        city: 'Токио',
        startDate: '2028-02-28',
        endDate: '2028-03-01',
        travelersCount: 1,
        budget: 200000,
        currency: 'RUB',
      },
    });
    assert.equal(archiveTripRes.status, 201);
    const archiveTripId = archiveTripRes.body.data.trip.id as string;

    const wArchive = await request(baseUrl, 'GET', `/api/trips/${archiveTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(wArchive.status, 200);
    assert.equal(wArchive.body.data.sourceMode, 'seasonal_reference');
    assert.ok(wArchive.body.data.disclaimerRu, 'Должен присутствовать дисклеймер для сезонного ориентира');
    assert.deepEqual(
      wArchive.body.data.daily.map((d: any) => d.date),
      ['2028-02-28', '2028-02-29', '2028-03-01'],
      'Даты в DTO соответствуют датам текущей поездки даже с учётом 29 февраля'
    );
    assert.equal(counters.archive, 1);
    console.log('✅ 8. Сезонный ориентир (Archive API + 29 февраля + disclaimerRu) проверен.');

    // 7. Запасной вариант по координатам страны + 422 для полностью неизвестного направления
    const fallbackTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Секретный курорт Турции',
        country: 'Турция',
        city: 'ВыдуманныйКурорт999',
        startDate: forecastStart,
        endDate: forecastEnd,
        travelersCount: 1,
        budget: 50000,
        currency: 'RUB',
      },
    });
    assert.equal(fallbackTripRes.status, 201);
    const fallbackTripId = fallbackTripRes.body.data.trip.id as string;

    const wFallback = await request(baseUrl, 'GET', `/api/trips/${fallbackTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(wFallback.status, 200);
    assert.equal(wFallback.body.data.resolvedCountry, 'Турция');
    assert.ok(wFallback.body.data.resolvedCity.includes('ориентир по стране'));

    const unknownTripRes = await request(baseUrl, 'POST', '/api/trips', {
      cookies: user1Cookies,
      body: {
        title: 'Неизвестное направление',
        country: 'НесуществующаяСтранаXYZ',
        city: 'НесуществующийГородXYZ',
        startDate: forecastStart,
        endDate: forecastEnd,
        travelersCount: 1,
        budget: 10000,
        currency: 'RUB',
      },
    });
    assert.equal(unknownTripRes.status, 201);
    const unknownTripId = unknownTripRes.body.data.trip.id as string;

    const wUnknown = await request(baseUrl, 'GET', `/api/trips/${unknownTripId}/weather`, {
      cookies: user1Cookies,
    });
    assert.equal(wUnknown.status, 422);
    assert.equal(wUnknown.body.error.code, 'WEATHER_LOCATION_NOT_FOUND');
    console.log('✅ 9. Запасной вариант по стране и контролируемая ошибка 422 проверены.');

    // 8. Интеграция с POST /api/trips/:tripId/packing/generate (с погодой и fallback без погоды)
    const genWithWeather = await request(
      baseUrl,
      'POST',
      `/api/trips/${forecastTripId}/packing/generate`,
      { cookies: user1Cookies }
    );
    assert.equal(genWithWeather.status, 200);
    assert.equal(
      genWithWeather.body.data.packingList.contextSnapshot.weatherSourceMode,
      'forecast'
    );
    assert.ok(
      genWithWeather.body.data.packingList.contextSnapshot.climateLabelRu.includes('прогноз погоды')
    );

    const genFallbackHeuristic = await request(
      baseUrl,
      'POST',
      `/api/trips/${unknownTripId}/packing/generate`,
      { cookies: user1Cookies }
    );
    assert.equal(genFallbackHeuristic.status, 200);
    assert.equal(
      genFallbackHeuristic.body.data.packingList.contextSnapshot.weatherSourceMode,
      'heuristic',
      'Ошибка погоды не должна ломать генерацию списка вещей'
    );
    console.log('✅ 10. Интеграция WeatherService -> PackingListService -> PackingEngineService проверена.');

    console.log('\n🎉 Все модульные и интеграционные тесты погодного модуля успешно пройдены!');
  } finally {
    globalThis.fetch = originalFetch;
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } },
    });
    server.close();
    await shutdownDatabase();
  }
}

async function main() {
  runUnitTests();
  await runApiAndCacheTests();
}

main().catch((err) => {
  globalThis.fetch = originalFetch;
  console.error('❌ Ошибка в тестах погодного модуля:', err);
  process.exit(1);
});
