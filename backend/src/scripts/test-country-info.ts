import assert from 'node:assert/strict';
import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import {
  CountryData,
  CountryTravelInfo,
  FEATURED_COUNTRIES,
  TravelInfoSection,
} from '../data/countries.data';
import { ALL_COUNTRIES, EXTENDED_COUNTRIES } from '../data/countries-catalog-extended.data';
import { FULL_COUNTRIES_CATALOG } from '../data/world-atlas-lookup.data';
import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';
import { CountryService } from '../services/country.service';

const TRAVEL_INFO_KEYS: Array<keyof CountryTravelInfo> = [
  'entryRules',
  'moneyAndPayments',
  'transport',
  'cultureAndEtiquette',
  'telecomAndInternet',
  'safetyAndEmergency',
  'practicalTips',
];

function assertValidSection(
  section: TravelInfoSection | undefined,
  countryLabel: string,
  sectionName: string
) {
  assert.ok(section, `[${countryLabel}] Секция ${sectionName} не должна быть undefined`);
  assert.equal(
    typeof section.summary,
    'string',
    `[${countryLabel}] ${sectionName}.summary должен быть строкой`
  );
  assert.ok(
    section.summary.trim().length >= 15,
    `[${countryLabel}] ${sectionName}.summary слишком короткий`
  );
  assert.ok(
    Array.isArray(section.details) && section.details.length >= 2,
    `[${countryLabel}] ${sectionName}.details должен содержать минимум 2 пункта`
  );
  for (const [idx, item] of section.details.entries()) {
    assert.equal(
      typeof item,
      'string',
      `[${countryLabel}] ${sectionName}.details[${idx}] должен быть строкой`
    );
    assert.ok(
      item.trim().length > 10,
      `[${countryLabel}] ${sectionName}.details[${idx}] не должен быть пустым`
    );
  }
  if (section.officialLinks !== undefined) {
    assert.ok(
      Array.isArray(section.officialLinks),
      `[${countryLabel}] ${sectionName}.officialLinks должен быть массивом`
    );
    for (const link of section.officialLinks) {
      assert.ok(link.title.trim().length > 0, `[${countryLabel}] link.title не должен быть пустым`);
      assert.ok(
        link.url.startsWith('https://'),
        `[${countryLabel}] link.url должен начинаться с https://`
      );
    }
  }
  if (section.lastUpdated !== undefined) {
    assert.match(
      section.lastUpdated,
      /^\d{4}-\d{2}$/,
      `[${countryLabel}] ${sectionName}.lastUpdated должен иметь формат YYYY-MM`
    );
  }
}

function assertValidTravelInfo(travelInfo: CountryTravelInfo | undefined, countryLabel: string) {
  assert.ok(travelInfo, `[${countryLabel}] travelInfo не должен быть undefined`);
  for (const key of TRAVEL_INFO_KEYS) {
    assertValidSection(travelInfo[key], countryLabel, key);
  }
}

function assertCountryCatalogIntegrity(countries: CountryData[], label: string) {
  assert.ok(countries.length > 0, `${label}: каталог не должен быть пустым`);
  for (const country of countries) {
    assertValidTravelInfo(country.travelInfo, `${label}:${country.slug}`);
  }
}

async function requestJson(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  const body: any = await res.json().catch(() => null);
  return { status: res.status, body };
}

function runCatalogAndServiceUnitTests() {
  console.log('🔎 [Unit] Проверка travelInfo в каталогах и синхронных методах CountryService...');

  const expectedFeaturedSlugs = [
    'russia',
    'france',
    'italy',
    'japan',
    'turkey',
    'spain',
    'thailand',
    'uae',
    'egypt',
    'usa',
    'brazil',
    'australia',
  ];

  assert.equal(FEATURED_COUNTRIES.length, 12, 'Ожидается 12 стран в FEATURED_COUNTRIES');
  for (const slug of expectedFeaturedSlugs) {
    const found = FEATURED_COUNTRIES.find((c) => c.slug === slug);
    assert.ok(found, `Страна ${slug} должна присутствовать в FEATURED_COUNTRIES`);
    assertValidTravelInfo(found.travelInfo, `FEATURED:${slug}`);
    assert.ok(
      found.travelInfo!.entryRules.officialLinks &&
        found.travelInfo!.entryRules.officialLinks.length > 0,
      `[${slug}] Для основной страны ожидаются officialLinks в entryRules`
    );
  }
  console.log(`✅ 1. Проверены все ${FEATURED_COUNTRIES.length} стран из FEATURED_COUNTRIES.`);

  assertCountryCatalogIntegrity(EXTENDED_COUNTRIES, 'EXTENDED_COUNTRIES');
  assertCountryCatalogIntegrity(ALL_COUNTRIES, 'ALL_COUNTRIES');
  assertCountryCatalogIntegrity(FULL_COUNTRIES_CATALOG, 'FULL_COUNTRIES_CATALOG');
  console.log(
    `✅ 2. Проверено отсутствие undefined и полнота 7 секций во всех ${FULL_COUNTRIES_CATALOG.length} странах каталога.`
  );

  const listAll = CountryService.listCountries();
  assert.equal(listAll.length, FULL_COUNTRIES_CATALOG.length);
  assertCountryCatalogIntegrity(listAll, 'CountryService.listCountries');

  const listAsia = CountryService.listCountries({ continent: 'Азия', sort: 'desc' });
  assert.ok(listAsia.length > 0);
  assertCountryCatalogIntegrity(listAsia, 'CountryService.listCountries(Азия)');

  const identifiers = [
    { query: 'japan', expectedSlug: 'japan' },
    { query: 'JP', expectedSlug: 'japan' },
    { query: '392', expectedSlug: 'japan' },
    { query: 'Япония', expectedSlug: 'japan' },
    { query: 'Japan', expectedSlug: 'japan' },
    { query: 'germany', expectedSlug: 'germany' },
    { query: 'DE', expectedSlug: 'germany' },
    { query: 'iceland', expectedSlug: 'iceland' },
    { query: 'Исландия', expectedSlug: 'iceland' },
  ];

  for (const { query, expectedSlug } of identifiers) {
    const found = CountryService.findCountryByIdentifier(query);
    assert.ok(found, `findCountryByIdentifier("${query}") должен найти страну`);
    assert.equal(found.slug, expectedSlug);
    assertValidTravelInfo(found.travelInfo, `find(${query})`);
  }
  console.log('✅ 3. Проверены CountryService.listCountries и findCountryByIdentifier по slug/ISO/имени.');
}

async function runApiIntegrationTests() {
  console.log('\n🌐 [API] Инициализация базы данных и тестового сервера...');
  await ensureDatabaseReady();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Проверка асинхронных методов CountryService
    const asyncList = await CountryService.listCountriesAsync();
    assert.equal(asyncList.length, FULL_COUNTRIES_CATALOG.length);
    assertCountryCatalogIntegrity(asyncList, 'CountryService.listCountriesAsync');

    const japanDetail = await CountryService.getCountryDetail('japan');
    assertValidTravelInfo(japanDetail.travelInfo, 'getCountryDetail(japan)');

    const icelandDetail = await CountryService.getCountryDetail('iceland');
    assertValidTravelInfo(icelandDetail.travelInfo, 'getCountryDetail(iceland)');
    assert.ok(
      icelandDetail.travelInfo!.transport.summary.includes('Рейкьявик'),
      'Дефолтный шаблон должен учитывать столицу страны (Рейкьявик)'
    );

    const fijiInfo = await CountryService.getCountryTravelInfo('fiji');
    assert.equal(fijiInfo.slug, 'fiji');
    assertValidTravelInfo(fijiInfo.travelInfo, 'getCountryTravelInfo(fiji)');
    console.log('✅ 4. Проверены асинхронные методы CountryService (listCountriesAsync, getCountryDetail, getCountryTravelInfo).');

    // 2. GET /api/countries
    const listRes = await requestJson(baseUrl, '/api/countries');
    assert.equal(listRes.status, 200);
    assert.equal(listRes.body?.success, true);
    const countries = listRes.body?.data?.countries as CountryData[];
    assert.equal(countries.length, FULL_COUNTRIES_CATALOG.length);
    assertCountryCatalogIntegrity(countries, 'GET /api/countries');
    console.log(`✅ 5. GET /api/countries возвращает ${countries.length} стран с заполненным travelInfo.`);

    // 3. GET /api/countries/:slug для featured и extended/compact стран
    for (const slug of ['russia', 'japan', 'uae', 'germany', 'iceland']) {
      const detailRes = await requestJson(baseUrl, `/api/countries/${slug}`);
      assert.equal(detailRes.status, 200, `GET /api/countries/${slug} должен вернуть 200`);
      assert.equal(detailRes.body?.success, true);
      assertValidTravelInfo(detailRes.body?.data?.country?.travelInfo, `GET /api/countries/${slug}`);
    }
    console.log('✅ 6. GET /api/countries/:slug возвращает travelInfo для featured и расширенных стран.');

    // 4. GET /api/countries/:slug/travel-info
    for (const slug of ['france', 'thailand', 'usa', 'belarus', 'fiji']) {
      const infoRes = await requestJson(baseUrl, `/api/countries/${slug}/travel-info`);
      assert.equal(infoRes.status, 200, `GET /api/countries/${slug}/travel-info должен вернуть 200`);
      assert.equal(infoRes.body?.success, true);
      assert.equal(infoRes.body?.data?.slug, slug);
      assert.ok(infoRes.body?.data?.capital, `[${slug}] должно присутствовать поле capital`);
      assert.ok(infoRes.body?.data?.currency, `[${slug}] должно присутствовать поле currency`);
      assertValidTravelInfo(infoRes.body?.data?.travelInfo, `GET /api/countries/${slug}/travel-info`);

      for (const key of TRAVEL_INFO_KEYS) {
        assertValidSection(infoRes.body?.data?.[key], `top-level:${slug}`, key);
      }
    }
    console.log('✅ 7. GET /api/countries/:slug/travel-info возвращает корректный блок travelInfo и секции.');

    // 5. Проверка 404 для несуществующей страны
    const notFoundRes = await requestJson(baseUrl, '/api/countries/atlantis-unknown/travel-info');
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.body?.success, false);
    assert.equal(notFoundRes.body?.error?.code, 'COUNTRY_NOT_FOUND');
    console.log('✅ 8. Корректный ответ 404 COUNTRY_NOT_FOUND для несуществующей страны проверен.');

    console.log('\n🎉 Все тесты модуля памятки путешественника (Этап 7.1) успешно пройдены!');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await shutdownDatabase();
  }
}

async function main() {
  runCatalogAndServiceUnitTests();
  await runApiIntegrationTests();
}

main().catch((err) => {
  console.error('❌ Ошибка при выполнении test-country-info:', err);
  process.exit(1);
});
