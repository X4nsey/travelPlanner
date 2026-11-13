import assert from 'node:assert/strict';
import { PackingCategory, TripType } from '@prisma/client';
import {
  PackingEngineService,
  PackingGenerationResult,
} from '../services/packing-engine.service';
import { PACKING_RULES_CATALOG } from '../data/packing-rules.data';

function findByKey(res: PackingGenerationResult, ruleKey: string) {
  return res.items.find((item) => item.ruleKey === ruleKey);
}

function hasActivity(res: PackingGenerationResult, tag: string): boolean {
  return res.context.detectedActivities.some((a) => a.tag === tag);
}

function assertNoDuplicatesOrMedicalViolations(res: PackingGenerationResult) {
  const keys = new Set<string>();
  const names = new Set<string>();
  for (const item of res.items) {
    assert.ok(item.ruleKey, 'У каждой сгенерированной вещи должен быть ruleKey');
    assert.ok(!keys.has(item.ruleKey), `Дубль ruleKey: ${item.ruleKey}`);
    keys.add(item.ruleKey);

    const normName = item.name.trim().toLowerCase();
    assert.ok(!names.has(normName), `Дубль названия: ${item.name}`);
    names.add(normName);

    assert.ok(item.reason && item.reason.trim().length > 5, `Пустое пояснение для ${item.ruleKey}`);
    assert.ok(
      !/рецепт|антибиотик|дозировк|аспирин|ибупрофен|парацетамол/i.test(item.name),
      `Запрещённое медицинское назначение в названии: ${item.name}`
    );
  }
}

function runTests() {
  console.log('🧪 [Smart Packing Engine] Запуск тестирования движка...\n');

  // Проверка целостности самого каталога правил (покрытие 9 категорий и уникальность ruleKey)
  const catalogCategories = new Set(PACKING_RULES_CATALOG.map((r) => r.category));
  for (const cat of Object.values(PackingCategory)) {
    assert.ok(catalogCategories.has(cat), `В каталоге отсутствует категория ${cat}`);
  }
  const catalogKeys = new Set<string>();
  for (const r of PACKING_RULES_CATALOG) {
    assert.ok(!catalogKeys.has(r.ruleKey), `Дубль ruleKey в каталоге: ${r.ruleKey}`);
    catalogKeys.add(r.ruleKey);
  }
  console.log('✅ Каталог правил: покрыты все 9 категорий, все ruleKey уникальны.');

  // 1. Обычная экскурсионная поездка
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Выходные в Риме',
      country: 'Италия',
      city: 'Рим',
      startDate: '2026-05-10',
      endDate: '2026-05-13',
      travelersCount: 2,
      tripType: TripType.SIGHTSEEING,
      description: 'Обзорная прогулка по историческому центру и музеям.',
      events: [
        { title: 'Экскурсия в Колизей', location: 'Колизей' },
        { title: 'Музей Ватикана', description: 'Пешая экскурсия с аудиогидом' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'sightseeing'), 'Должны распознаваться пешие экскурсии');
    assert.ok(!hasActivity(res, 'beach'), 'Не должно быть ложного пляжа');
    assert.ok(!hasActivity(res, 'hiking'), 'Не должно быть ложного похода');
    assert.ok(findByKey(res, 'foot:walking_shoes'), 'Должна быть удобная обувь');
    assert.ok(findByKey(res, 'pers:daypack'), 'Должен быть городской рюкзак/сумка');
    assert.ok(findByKey(res, 'tech:camera'), 'Должен быть фотоаппарат');
    assert.equal(findByKey(res, 'med:basic_first_aid')?.quantity, 1, 'Аптечка SHARED = 1 даже при 2 чел.');
    assert.equal(findByKey(res, 'doc:identity_passport')?.quantity, 2, 'Документ PER_PERSON = 2 при 2 чел.');
    assert.equal(findByKey(res, 'doc:visa_entry_check')?.quantity, null, 'Проверка визы NONE = null');
    console.log('✅ Сценарий 1: Обычная экскурсионная поездка — пройдено.');
  }

  // 2. Пляжный отдых
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Отпуск на море в Анталье',
      country: 'Турция',
      city: 'Анталья',
      startDate: '2026-07-10',
      endDate: '2026-07-17',
      travelersCount: 2,
      tripType: TripType.BEACH,
      description: 'Пляжный отдых, купание и снорклинг у побережья.',
      events: [
        { title: 'Пляж Лара', description: 'Купание и отдых на шезлонгах' },
        { title: 'Морская прогулка и снорклинг в бухте' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'beach'));
    assert.ok(findByKey(res, 'act:swimwear'));
    assert.ok(findByKey(res, 'act:quick_dry_towel'));
    assert.ok(findByKey(res, 'foot:water_slippers'));
    assert.ok(findByKey(res, 'hyg:sunscreen'));
    assert.ok(findByKey(res, 'act:snorkel_gear'));
    assert.equal(findByKey(res, 'hyg:sunscreen')?.quantity, 1, 'Крем SPF (SHARED) = 1');
    console.log('✅ Сценарий 2: Пляжный отдых — пройдено.');
  }

  // 3. Поездка с аквапарком
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Семейные каникулы в Дубае',
      country: 'ОАЭ',
      city: 'Дубай',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      travelersCount: 3,
      events: [
        { title: 'Посещение аквапарка Aquaventure', location: 'Atlantis' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'waterpark'), 'Должен распознаться аквапарк');
    assert.ok(findByKey(res, 'act:swimwear'), 'Должен добавиться купальник/плавки');
    assert.ok(findByKey(res, 'foot:water_slippers'), 'Должны добавиться сланцы/тапочки');
    assert.ok(findByKey(res, 'pers:waterproof_pouch'), 'Должен добавиться водонепроницаемый чехол');
    console.log('✅ Сценарий 3: Поездка с аквапарком — пройдено.');
  }

  // 4. Поход в горы
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Треккинг на Алтае',
      country: 'Россия',
      city: 'Горно-Алтайск',
      startDate: '2026-08-05',
      endDate: '2026-08-11',
      travelersCount: 2,
      tripType: TripType.MOUNTAIN,
      events: [
        { title: 'Восхождение к перевалу и горному озеру', description: 'Пеший горный маршрут' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'hiking'));
    assert.ok(findByKey(res, 'foot:hiking_boots'));
    assert.ok(findByKey(res, 'act:hiking_backpack'));
    assert.ok(findByKey(res, 'act:trekking_poles'));
    assert.ok(findByKey(res, 'act:thermos'));
    assert.ok(findByKey(res, 'med:repellent'));
    console.log('✅ Сценарий 4: Поход в горы — пройдено.');
  }

  // 5. Деловая поездка
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Командировка в Берлин',
      country: 'Германия',
      city: 'Берлин',
      startDate: '2026-11-18',
      endDate: '2026-11-20',
      travelersCount: 1,
      tripType: TripType.BUSINESS,
      events: [
        { title: 'Деловые переговоры с партнёрами' },
        { title: 'Технологическая конференция', note: 'Взять презентацию и пропуск' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'business'));
    assert.ok(findByKey(res, 'cloth:business_attire'));
    assert.ok(findByKey(res, 'foot:business_shoes'));
    assert.ok(findByKey(res, 'tech:laptop_charger'));
    assert.ok(findByKey(res, 'doc:business_materials'));
    console.log('✅ Сценарий 5: Деловая поездка — пройдено.');
  }

  // 6. Поездка без явно указанного типа (tripType: null)
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Осенний уикенд',
      country: 'Венгрия',
      city: 'Будапешт',
      startDate: '2026-11-01',
      endDate: '2026-11-04',
      travelersCount: 2,
      tripType: null,
      events: [
        { title: 'Термальные купальни Сечени', description: 'Отдых в термах и СПА' },
        { title: 'Велопрогулка по острову Маргит' },
        { title: 'Авиарейс домой', location: 'Аэропорт' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(hasActivity(res, 'pool_spa'), 'Термы должны распознаться без tripType');
    assert.ok(hasActivity(res, 'cycling'), 'Велопрогулка должна распознаться без tripType');
    assert.ok(hasActivity(res, 'flight'), 'Авиарейс должен распознаться без tripType');
    assert.ok(findByKey(res, 'act:swim_cap_goggles'));
    assert.ok(findByKey(res, 'act:cycling_gear'));
    assert.ok(findByKey(res, 'pers:neck_pillow'));
    console.log('✅ Сценарий 6: Поездка без явно указанного типа — пройдено.');
  }

  // 7. Отрицания и метафоры
  {
    const res = PackingEngineService.generateRecommendations({
      title: 'Городские выходные: море впечатлений и гора дел',
      country: 'Чехия',
      city: 'Прага',
      startDate: '2026-06-05',
      endDate: '2026-06-08',
      travelersCount: 1,
      description:
        'Отель с видом на горы, но без походов и без велосипеда. Планируется поход по магазинам и зайти в офис аренды авто по пути на обзорную экскурсию.',
      events: [
        { title: 'Поход в музей и театр', note: 'Без пляжа и без посещения бассейна' },
        { title: 'Бизнес-ланч в центре' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(res);
    assert.ok(!hasActivity(res, 'beach'), '«Море впечатлений» и «без пляжа» не должны включать пляж');
    assert.ok(!hasActivity(res, 'hiking'), '«Гора дел», «вид на горы», «без походов», «поход в музей» не должны включать поход');
    assert.ok(!hasActivity(res, 'cycling'), '«без велосипеда» не должно включать велопрогулку');
    assert.ok(!hasActivity(res, 'pool_spa'), '«без посещения бассейна» не должно включать бассейн');
    assert.ok(!hasActivity(res, 'business'), '«офис аренды авто» и «бизнес-ланч» не должны включать деловую поездку');
    assert.ok(hasActivity(res, 'sightseeing'), 'Обзорная экскурсия и музей должны распознаться');
    assert.ok(hasActivity(res, 'evening_out'), 'Театр должен распознать вечерний выход');
    console.log('✅ Сценарий 7: Отрицания и метафоры — пройдено.');
  }

  // 8. Различная продолжительность путешествия (2 дня vs 14 дней)
  {
    const shortTrip = PackingEngineService.generateRecommendations({
      title: 'Короткая поездка',
      country: 'Россия',
      city: 'Казань',
      startDate: '2026-06-10',
      endDate: '2026-06-11',
      travelersCount: 1,
    });
    const longTrip = PackingEngineService.generateRecommendations({
      title: 'Длительное путешествие',
      country: 'Япония',
      city: 'Токио',
      startDate: '2026-05-01',
      endDate: '2026-05-14',
      travelersCount: 1,
    });
    assertNoDuplicatesOrMedicalViolations(shortTrip);
    assertNoDuplicatesOrMedicalViolations(longTrip);

    const shortTshirts = findByKey(shortTrip, 'cloth:tshirts')?.quantity ?? 0;
    const longTshirts = findByKey(longTrip, 'cloth:tshirts')?.quantity ?? 0;
    const longUnderwear = findByKey(longTrip, 'cloth:underwear')?.quantity ?? 0;
    const longSocks = findByKey(longTrip, 'cloth:socks')?.quantity ?? 0;

    assert.equal(shortTrip.context.durationDays, 2);
    assert.equal(longTrip.context.durationDays, 14);
    assert.ok(shortTshirts < longTshirts, 'В длинной поездке футболок больше, чем в 2-дневной');
    assert.ok(longTshirts <= 7, `Для 14 дней не должно быть > 7 футболок (получено ${longTshirts})`);
    assert.ok(longUnderwear <= 8, `Для 14 дней белья не должно быть > 8 (получено ${longUnderwear})`);
    assert.ok(longSocks <= 8, `Для 14 дней носков не должно быть > 8 (получено ${longSocks})`);
    assert.ok(findByKey(longTrip, 'hyg:laundry_detergent'), 'Для 14 дней рекомендуется средство для стирки');
    assert.ok(!findByKey(shortTrip, 'hyg:laundry_detergent'), 'Для 2 дней средство для стирки не нужно');
    console.log('✅ Сценарий 8: Различная продолжительность (2 дня vs 14 дней) — пройдено.');
  }

  // 9. Неизвестное количество путешественников vs группа
  {
    const unknownTravelers = PackingEngineService.generateRecommendations({
      title: 'Поездка без указания числа участников',
      country: 'Франция',
      city: 'Париж',
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      travelersCount: null,
    });
    assertNoDuplicatesOrMedicalViolations(unknownTravelers);
    assert.equal(unknownTravelers.context.confirmedTravelersCount, null);
    assert.equal(unknownTravelers.context.assumedTravelersCount, 1);
    assert.equal(unknownTravelers.context.travelersAssumed, true);
    const docItem = findByKey(unknownTravelers, 'doc:identity_passport');
    assert.equal(docItem?.quantity, 1);
    assert.ok(
      docItem?.reason.includes('число участников не указано'),
      'Должно явно отделять предположение от подтверждённых данных'
    );

    const groupTrip = PackingEngineService.generateRecommendations({
      title: 'Семейная поездка',
      country: 'Греция',
      city: 'Афины',
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      travelersCount: 4,
    });
    assert.equal(groupTrip.context.confirmedTravelersCount, 4);
    assert.equal(groupTrip.context.travelersAssumed, false);
    assert.equal(findByKey(groupTrip, 'doc:identity_passport')?.quantity, 4, 'PER_PERSON масштабируется на 4');
    assert.equal(findByKey(groupTrip, 'med:basic_first_aid')?.quantity, 1, 'SHARED аптечка не умножается на 4');
    assert.equal(findByKey(groupTrip, 'tech:powerbank')?.quantity, 4, 'PER_PERSON powerbank масштабируется на 4');
    console.log('✅ Сценарий 9: Неизвестное vs подтверждённое количество путешественников — пройдено.');
  }

  // Сценарий 11 (Аудит quantityScope): 1 vs 2 vs 4 путешественника и инварианты всех 51 правил
  {
    const ruleKeys = PACKING_RULES_CATALOG.map((r) => r.ruleKey);
    const ruleNames = PACKING_RULES_CATALOG.map((r) => r.name);
    assert.equal(new Set(ruleKeys).size, PACKING_RULES_CATALOG.length, 'Нет дублей ruleKey в каталоге');
    assert.equal(new Set(ruleNames).size, PACKING_RULES_CATALOG.length, 'Нет дублей name в каталоге');

    const scopeCounts = {
      PER_PERSON: PACKING_RULES_CATALOG.filter((r) => r.quantityScope === 'PER_PERSON').length,
      SHARED: PACKING_RULES_CATALOG.filter((r) => r.quantityScope === 'SHARED').length,
      NONE: PACKING_RULES_CATALOG.filter((r) => r.quantityScope === 'NONE').length,
    };
    console.log(
      `📊 Распределение каталога (${PACKING_RULES_CATALOG.length} правил): PER_PERSON=${scopeCounts.PER_PERSON}, SHARED=${scopeCounts.SHARED}, NONE=${scopeCounts.NONE}`
    );

    const baseEvents = [
      {
        title: 'Перелёт и аренда авто',
        description: 'Вылет в аэропорт, трансфер и аренда автомобиля',
      },
      {
        title: 'Пешая экскурсия по центру и музеям',
        description: 'Долгая прогулка по старому городу',
      },
      {
        title: 'Пляж, снорклинг и аквапарк',
        description: 'Купание в море, аквапарк и спа-бассейн',
      },
      {
        title: 'Треккинг на перевал, восхождение на вершину и кемпинг в палатке',
        description: 'Горный поход по крутому маршруту, ночёвка на природе у костра',
      },
      {
        title: 'Велопрогулка по набережной',
        description: 'Аренда велосипеда на полдня',
      },
    ];

    const trip1 = PackingEngineService.generateRecommendations({
      title: 'Аудит 1 путешественник',
      tripType: TripType.MIXED,
      country: 'Турция',
      city: 'Анталья',
      startDate: new Date('2026-07-01T00:00:00Z'),
      endDate: new Date('2026-07-08T00:00:00Z'),
      travelersCount: 1,
      events: baseEvents,
    });
    const trip2 = PackingEngineService.generateRecommendations({
      title: 'Аудит 2 путешественника',
      tripType: TripType.MIXED,
      country: 'Турция',
      city: 'Анталья',
      startDate: new Date('2026-07-01T00:00:00Z'),
      endDate: new Date('2026-07-08T00:00:00Z'),
      travelersCount: 2,
      events: baseEvents,
    });
    const trip4 = PackingEngineService.generateRecommendations({
      title: 'Аудит 4 путешественника',
      tripType: TripType.MIXED,
      country: 'Турция',
      city: 'Анталья',
      startDate: new Date('2026-07-01T00:00:00Z'),
      endDate: new Date('2026-07-08T00:00:00Z'),
      travelersCount: 4,
      events: baseEvents,
    });

    assert.equal(new Set(trip4.items.map((i) => i.ruleKey)).size, trip4.items.length, 'Нет дублей ruleKey в выдаче');
    assert.equal(new Set(trip4.items.map((i) => i.name)).size, trip4.items.length, 'Нет дублей name в выдаче');

    const ruleMap = new Map(PACKING_RULES_CATALOG.map((r) => [r.ruleKey, r]));
    for (const item1 of trip1.items) {
      const rule = ruleMap.get(item1.ruleKey);
      assert.ok(rule, `Правило ${item1.ruleKey} найдено в каталоге`);
      const item2 = findByKey(trip2, item1.ruleKey);
      const item4 = findByKey(trip4, item1.ruleKey);
      assert.ok(item2 && item4, `Правило ${item1.ruleKey} присутствует для 1, 2 и 4 путешественников`);
      assert.equal(item2.quantityScope, item1.quantityScope);
      assert.equal(item4.quantityScope, item1.quantityScope);

      if (item1.quantityScope === 'PER_PERSON') {
        assert.ok(typeof item1.quantity === 'number' && item1.quantity >= 1);
        assert.equal(item2.quantity, item1.quantity * 2, `${item1.ruleKey} должен удваиваться для 2 чел.`);
        assert.equal(item4.quantity, item1.quantity * 4, `${item1.ruleKey} должен учетверяться для 4 чел.`);
      } else if (item1.quantityScope === 'SHARED') {
        assert.ok(typeof item1.quantity === 'number' && item1.quantity >= 1);
        assert.equal(item2.quantity, item1.quantity, `${item1.ruleKey} (SHARED) не умножается для 2 чел.`);
        assert.equal(item4.quantity, item1.quantity, `${item1.ruleKey} (SHARED) не умножается для 4 чел.`);
      } else {
        assert.equal(item1.quantity, null, `${item1.ruleKey} (NONE) имеет null для 1 чел.`);
        assert.equal(item2.quantity, null, `${item1.ruleKey} (NONE) имеет null для 2 чел.`);
        assert.equal(item4.quantity, null, `${item1.ruleKey} (NONE) имеет null для 4 чел.`);
      }
    }

    // Точечная проверка ключевых позиций аудита для 1 / 2 / 4 чел.
    const checkCounts = (key: string, q1: number | null, q2: number | null, q4: number | null) => {
      assert.equal(findByKey(trip1, key)?.quantity, q1, `${key} (1 чел.)`);
      assert.equal(findByKey(trip2, key)?.quantity, q2, `${key} (2 чел.)`);
      assert.equal(findByKey(trip4, key)?.quantity, q4, `${key} (4 чел.)`);
    };

    checkCounts('tech:powerbank', 1, 2, 4);
    checkCounts('pers:waterproof_pouch', 1, 2, 4);
    checkCounts('other:umbrella', 1, 2, 4);
    checkCounts('other:luggage_lock', 1, 2, 4);
    checkCounts('act:sleeping_bag', 1, 2, 4);
    checkCounts('act:thermal_mug', 1, 2, 4);
    checkCounts('act:headlamp', 1, 2, 4);

    checkCounts('hyg:sunscreen', 1, 1, 1);
    checkCounts('tech:camera', 1, 1, 1);
    checkCounts('tech:outlet_adapter', 1, 1, 1);
    checkCounts('med:basic_first_aid', 1, 1, 1);
    checkCounts('med:blister_plasters', 1, 1, 1);
    checkCounts('med:repellent', 1, 1, 1);
    checkCounts('act:thermos', 1, 1, 1);
    checkCounts('act:camping_tent', 1, 1, 1);
    checkCounts('other:zip_bags', 1, 1, 1);
    checkCounts('other:laundry_bags', 1, 1, 1);

    checkCounts('tech:outlet_type_check', null, null, null);
    checkCounts('med:personal_meds', null, null, null);
    checkCounts('doc:visa_entry_check', null, null, null);

    // Дополнительный зимне-деловой маршрут, чтобы покрыть оставшиеся правила (итого все 70 правил) в сравнении 1 / 2 / 4 чел.
    const winterBusinessEvents = [
      { title: 'Конференция, деловая встреча и ужин в ресторане', description: 'Командировка и вечерний выход' },
      { title: 'Катание на лыжах и сноуборде на склоне', description: 'Горнолыжный курорт' },
    ];
    const wb1 = PackingEngineService.generateRecommendations({
      title: 'Зима и бизнес 1 чел.',
      tripType: TripType.MIXED,
      country: 'Австрия',
      city: 'Инсбрук',
      startDate: new Date('2026-01-10T00:00:00Z'),
      endDate: new Date('2026-01-15T00:00:00Z'),
      travelersCount: 1,
      events: winterBusinessEvents,
    });
    const wb2 = PackingEngineService.generateRecommendations({
      title: 'Зима и бизнес 2 чел.',
      tripType: TripType.MIXED,
      country: 'Австрия',
      city: 'Инсбрук',
      startDate: new Date('2026-01-10T00:00:00Z'),
      endDate: new Date('2026-01-15T00:00:00Z'),
      travelersCount: 2,
      events: winterBusinessEvents,
    });
    const wb4 = PackingEngineService.generateRecommendations({
      title: 'Зима и бизнес 4 чел.',
      tripType: TripType.MIXED,
      country: 'Австрия',
      city: 'Инсбрук',
      startDate: new Date('2026-01-10T00:00:00Z'),
      endDate: new Date('2026-01-15T00:00:00Z'),
      travelersCount: 4,
      events: winterBusinessEvents,
    });

    assert.equal(findByKey(wb1, 'tech:laptop_charger')?.quantity, 1, 'tech:laptop_charger (1 чел.)');
    assert.equal(findByKey(wb2, 'tech:laptop_charger')?.quantity, 2, 'tech:laptop_charger (2 чел.)');
    assert.equal(findByKey(wb4, 'tech:laptop_charger')?.quantity, 4, 'tech:laptop_charger (4 чел.)');

    // Проверка контекстного переключения act:headlamp (однодневный поход vs многодневный поход vs кемпинг)
    const oneDayHike = PackingEngineService.generateRecommendations({
      title: 'Однодневный поход',
      tripType: TripType.MOUNTAIN,
      country: 'Грузия',
      city: 'Тбилиси',
      startDate: '2026-06-10',
      endDate: '2026-06-10',
      travelersCount: 4,
      events: [{ title: 'Пеший треккинг и прогулка по горной тропе' }],
    });
    const multiDayHike = PackingEngineService.generateRecommendations({
      title: 'Многодневный поход',
      tripType: TripType.MOUNTAIN,
      country: 'Грузия',
      city: 'Степанцминда',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      travelersCount: 4,
      events: [{ title: 'Пеший треккинг по горному маршруту' }],
    });
    const campingShort = PackingEngineService.generateRecommendations({
      title: 'Кемпинг с ночёвкой',
      country: 'Россия',
      city: 'Сортавала',
      startDate: '2026-07-10',
      endDate: '2026-07-10',
      travelersCount: 4,
      events: [{ title: 'Выезд с палаткой и кемпингом у озера' }],
    });
    assert.equal(findByKey(oneDayHike, 'act:headlamp')?.quantityScope, 'SHARED');
    assert.equal(findByKey(oneDayHike, 'act:headlamp')?.quantity, 1, 'Однодневный поход: общий фонарик = 1');
    assert.equal(findByKey(multiDayHike, 'act:headlamp')?.quantityScope, 'PER_PERSON');
    assert.equal(findByKey(multiDayHike, 'act:headlamp')?.quantity, 4, 'Многодневный поход: индивидуальный фонарь = 4');
    assert.equal(findByKey(campingShort, 'act:headlamp')?.quantityScope, 'PER_PERSON');
    assert.equal(findByKey(campingShort, 'act:headlamp')?.quantity, 4, 'Кемпинг: индивидуальный фонарь = 4');

    const coveredRuleKeys = new Set<string>();
    for (const item1 of trip1.items) coveredRuleKeys.add(item1.ruleKey);
    for (const item1 of wb1.items) {
      coveredRuleKeys.add(item1.ruleKey);
      const rule = ruleMap.get(item1.ruleKey);
      assert.ok(rule);
      const item2 = findByKey(wb2, item1.ruleKey);
      const item4 = findByKey(wb4, item1.ruleKey);
      assert.ok(item2 && item4);
      assert.equal(item2.quantityScope, item1.quantityScope);
      assert.equal(item4.quantityScope, item1.quantityScope);
      if (item1.quantityScope === 'PER_PERSON') {
        assert.ok(typeof item1.quantity === 'number' && item1.quantity >= 1);
        assert.equal(item2.quantity, item1.quantity * 2);
        assert.equal(item4.quantity, item1.quantity * 4);
      } else if (item1.quantityScope === 'SHARED') {
        assert.ok(typeof item1.quantity === 'number' && item1.quantity >= 1);
        assert.equal(item2.quantity, item1.quantity);
        assert.equal(item4.quantity, item1.quantity);
      } else {
        assert.equal(item1.quantity, null);
        assert.equal(item2.quantity, null);
        assert.equal(item4.quantity, null);
      }
    }
    const missingKeys = PACKING_RULES_CATALOG.map((r) => r.ruleKey).filter(
      (k) => !coveredRuleKeys.has(k)
    );
    assert.equal(
      coveredRuleKeys.size,
      PACKING_RULES_CATALOG.length,
      `Все правила каталога покрыты проверкой масштабирования 1 / 2 / 4 чел. Не покрыты: ${missingKeys.join(', ')}`
    );

    console.log(
      `✅ Сценарий 11: Полный аудит quantityScope (1 / 2 / 4 чел., проверены все ${coveredRuleKeys.size} из ${PACKING_RULES_CATALOG.length} правил) — пройдено.`
    );
  }

  // 10. Отсутствие ложных срабатываний при слабой / неоднозначной активности + зимний спорт + кемпинг
  {
    const ambiguous = PackingEngineService.generateRecommendations({
      title: 'Выходные весной',
      country: 'Неизвестная страна',
      city: 'Неизвестный город',
      startDate: '2026-04-10',
      endDate: '2026-04-12',
      travelersCount: 1,
      description: 'Просто отдых: возможно горы, море или лес',
    });
    assertNoDuplicatesOrMedicalViolations(ambiguous);
    // Одиночные «горы», «море», «лес» в описании имеют вес 0.45 * 0.75 = 0.34 < 0.7 — не активируют спецснаряжение!
    assert.ok(!hasActivity(ambiguous, 'hiking'), 'Неоднозначное слово «горы» не должно активировать горный поход');
    assert.ok(!hasActivity(ambiguous, 'beach'), 'Неоднозначное слово «море» не должно активировать пляжное снаряжение');
    assert.ok(!hasActivity(ambiguous, 'camping'), 'Одиночное «лес» не должно автоматически добавлять палатку');
    assert.ok(
      ambiguous.context.lowConfidenceSignals.length > 0,
      'Слабые сигналы должны фиксироваться в lowConfidenceSignals без генерации лишних вещей'
    );

    // Дополнительно проверим явный зимний спорт и кемпинг
    const winterAndCamping = PackingEngineService.generateRecommendations({
      title: 'Горнолыжный выезд и кемпинг',
      country: 'Австрия',
      city: 'Инсбрук',
      startDate: '2026-01-10',
      endDate: '2026-01-15',
      travelersCount: 2,
      events: [
        { title: 'Катание на лыжах и сноуборде', location: 'Склон' },
        { title: 'Ночёвка в кемпинге с палатками' },
      ],
    });
    assertNoDuplicatesOrMedicalViolations(winterAndCamping);
    assert.ok(hasActivity(winterAndCamping, 'winter_sport'));
    assert.ok(hasActivity(winterAndCamping, 'camping'));
    assert.ok(findByKey(winterAndCamping, 'act:ski_goggles'));
    assert.ok(findByKey(winterAndCamping, 'act:camping_tent'));
    assert.equal(findByKey(winterAndCamping, 'act:camping_tent')?.quantity, 1, 'Палатка SHARED = 1');
    assert.equal(findByKey(winterAndCamping, 'act:sleeping_bag')?.quantity, 2, 'Спальник PER_PERSON = 2');
    console.log('✅ Сценарий 10: Отсутствие ложных срабатываний + зимний спорт и кемпинг — пройдено.');
  }

  console.log('\n🎉 Все 11 тестовых сценариев движка Smart Packing List успешно пройдены!');
}

runTests();
