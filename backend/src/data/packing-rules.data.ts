import { PackingCategory, TripType } from '@prisma/client';

export type QuantityScope = 'PER_PERSON' | 'SHARED' | 'NONE';

export type ActivityTag =
  | 'beach'
  | 'waterpark'
  | 'sightseeing'
  | 'hiking'
  | 'cycling'
  | 'winter_sport'
  | 'pool_spa'
  | 'business'
  | 'camping'
  | 'flight'
  | 'car_travel'
  | 'evening_out';

export type ClimateHint =
  | 'tropical_warm'
  | 'warm_season'
  | 'cool_season'
  | 'shoulder_or_uncertain';

export interface PackingRuleContext {
  durationDays: number;
  effectiveTravelers: number;
  confirmedTravelersCount: number | null;
  travelersAssumed: boolean;
  climateHint: ClimateHint;
  climateLabelRu: string;
  activities: Set<ActivityTag>;
  activityReasons: Partial<Record<ActivityTag, string>>;
  hasSnorkelOrDiving: boolean;
  hasAscentOrMountainTrail: boolean;
  tripType: TripType | null;
}

export interface PackingRuleDefinition {
  ruleKey: string;
  category: PackingCategory;
  name: string;
  quantityScope: QuantityScope;
  /**
   * Optional dynamic resolver when quantityScope depends on trip context
   * (e.g., activity type and trip duration).
   */
  resolveQuantityScope?: (ctx: PackingRuleContext) => QuantityScope;
  sortOrder: number;
  /**
   * Returns true if the rule should be included for the given normalized context.
   */
  matches: (ctx: PackingRuleContext) => boolean;
  /**
   * Returns base quantity before PER_PERSON multiplication (or fixed quantity for SHARED).
   * Ignored when quantityScope === 'NONE'.
   */
  computeBaseQuantity?: (ctx: PackingRuleContext) => number;
  /**
   * Returns a human-readable explanation in Russian.
   */
  buildReason: (ctx: PackingRuleContext, finalQuantity: number | null) => string;
}

function formatPeopleNote(ctx: PackingRuleContext): string {
  if (ctx.travelersAssumed) {
    return 'ориентировочно на 1 чел., т.к. число участников не указано';
  }
  if (ctx.effectiveTravelers > 1) {
    return `на ${ctx.effectiveTravelers} чел.`;
  }
  return 'индивидуально';
}

function joinReasons(parts: Array<string | undefined | null | false>): string {
  return parts.filter((p): p is string => Boolean(p && p.trim())).join('; ');
}

function hasAnyActivity(ctx: PackingRuleContext, tags: ActivityTag[]): boolean {
  return tags.some((tag) => ctx.activities.has(tag));
}

function collectActivityReasons(ctx: PackingRuleContext, tags: ActivityTag[]): string {
  const unique = new Set<string>();
  for (const tag of tags) {
    const r = ctx.activityReasons[tag];
    if (r) unique.add(r);
  }
  return Array.from(unique).join(', ');
}

export const PACKING_RULES_CATALOG: PackingRuleDefinition[] = [
  // =========================================================================
  // 1. DOCUMENTS (Документы)
  // =========================================================================
  {
    ruleKey: 'doc:identity_passport',
    category: PackingCategory.DOCUMENTS,
    name: 'Документ, удостоверяющий личность / загранпаспорт',
    quantityScope: 'PER_PERSON',
    sortOrder: 10,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons(['Обязательно для любой поездки', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'doc:visa_entry_check',
    category: PackingCategory.DOCUMENTS,
    name: 'Проверить документы для поездки и необходимость визы',
    quantityScope: 'NONE',
    sortOrder: 20,
    matches: () => true,
    buildReason: () =>
      'Рекомендуется заранее уточнить правила въезда и срок действия документов по маршруту',
  },
  {
    ruleKey: 'doc:insurance_check',
    category: PackingCategory.DOCUMENTS,
    name: 'Проверить полис медицинского страхования',
    quantityScope: 'NONE',
    sortOrder: 30,
    matches: () => true,
    buildReason: (ctx) =>
      hasAnyActivity(ctx, ['hiking', 'winter_sport', 'cycling'])
        ? 'Для активного отдыха стоит проверить покрытие спортивных рисков в страховке'
        : 'Для спокойного путешествия и непредвиденных ситуаций в дороге',
  },
  {
    ruleKey: 'doc:tickets_bookings',
    category: PackingCategory.DOCUMENTS,
    name: 'Билеты и подтверждения бронирований (отель, трансфер, экскурсии)',
    quantityScope: 'NONE',
    sortOrder: 40,
    matches: () => true,
    buildReason: () => 'Сохраните копии в телефоне офлайн и при необходимости в распечатке',
  },
  {
    ruleKey: 'doc:bank_cards',
    category: PackingCategory.DOCUMENTS,
    name: 'Банковские карты и резервные наличные',
    quantityScope: 'NONE',
    sortOrder: 50,
    matches: () => true,
    buildReason: () => 'Для оплаты транспорта, питания и непредвиденных расходов',
  },
  {
    ruleKey: 'doc:driver_license',
    category: PackingCategory.DOCUMENTS,
    name: 'Водительское удостоверение',
    quantityScope: 'NONE',
    sortOrder: 60,
    matches: (ctx) => ctx.activities.has('car_travel'),
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.car_travel || 'Запланирована поездка или аренда авто',
        'при поездке за границу проверьте, требуется ли МВУ',
      ]),
  },
  {
    ruleKey: 'doc:business_materials',
    category: PackingCategory.DOCUMENTS,
    name: 'Рабочие документы, пропуск и материалы для встреч',
    quantityScope: 'NONE',
    sortOrder: 70,
    matches: (ctx) => ctx.activities.has('business'),
    buildReason: (ctx) =>
      ctx.activityReasons.business || 'Запланированы деловые мероприятия',
  },

  // =========================================================================
  // 2. CLOTHING (Одежда)
  // =========================================================================
  {
    ruleKey: 'cloth:tshirts',
    category: PackingCategory.CLOTHING,
    name: 'Футболки / базовый верх',
    quantityScope: 'PER_PERSON',
    sortOrder: 100,
    matches: () => true,
    computeBaseQuantity: (ctx) => {
      // Разумное ограничение: до 5 дней берём с небольшим запасом, далее ограничиваем 7 шт. с учётом стирки
      if (ctx.durationDays <= 5) {
        return ctx.durationDays + 1;
      }
      return Math.min(7, 5 + Math.floor((ctx.durationDays - 4) / 3));
    },
    buildReason: (ctx) =>
      joinReasons([
        ctx.durationDays >= 7
          ? `Длительность ${ctx.durationDays} дн. (ограничено с учётом стирки)`
          : `На ${ctx.durationDays} дн. поездки`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:underwear',
    category: PackingCategory.CLOTHING,
    name: 'Нижнее бельё',
    quantityScope: 'PER_PERSON',
    sortOrder: 110,
    matches: () => true,
    computeBaseQuantity: (ctx) => {
      // Максимум 8 комплектов на человека, даже для длительных поездок
      if (ctx.durationDays <= 7) {
        return ctx.durationDays + 1;
      }
      return 8;
    },
    buildReason: (ctx) =>
      joinReasons([
        ctx.durationDays >= 8
          ? `На ${ctx.durationDays} дн. (не более 8 комплектов на чел. с расчётом на стирку)`
          : `На ${ctx.durationDays} дн. с запасом на 1 смену`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:socks',
    category: PackingCategory.CLOTHING,
    name: 'Носки',
    quantityScope: 'PER_PERSON',
    sortOrder: 120,
    matches: () => true,
    computeBaseQuantity: (ctx) => {
      if (ctx.durationDays <= 7) {
        return ctx.durationDays + 1;
      }
      return 8;
    },
    buildReason: (ctx) =>
      joinReasons([
        ctx.durationDays >= 8
          ? `На ${ctx.durationDays} дн. (не более 8 пар на чел. с расчётом на стирку)`
          : `На ${ctx.durationDays} дн. поездки`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:bottoms',
    category: PackingCategory.CLOTHING,
    name: 'Брюки / джинсы / шорты',
    quantityScope: 'PER_PERSON',
    sortOrder: 130,
    matches: () => true,
    computeBaseQuantity: (ctx) => {
      if (ctx.durationDays <= 3) return 1;
      if (ctx.durationDays <= 7) return 2;
      return 3;
    },
    buildReason: (ctx) =>
      joinReasons([`Базовый низ на ${ctx.durationDays} дн.`, formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'cloth:sleepwear',
    category: PackingCategory.CLOTHING,
    name: 'Одежда для сна и отдыха в номере',
    quantityScope: 'PER_PERSON',
    sortOrder: 140,
    matches: (ctx) => ctx.durationDays >= 2,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([`Поездка от 2 дней (${ctx.durationDays} дн.)`, formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'cloth:midlayer',
    category: PackingCategory.CLOTHING,
    name: 'Свитер, худи или флисовая кофта (многослойный слой)',
    quantityScope: 'PER_PERSON',
    sortOrder: 150,
    matches: () => true,
    computeBaseQuantity: (ctx) => (ctx.durationDays >= 7 ? 2 : 1),
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('hiking') || ctx.activities.has('camping')
          ? 'Утепляющий слой для маршрутов и прохладных вечеров'
          : `Универсальный тёплый слой (${ctx.climateLabelRu})`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:windbreaker',
    category: PackingCategory.CLOTHING,
    name: 'Лёгкая ветровка или непромокаемая куртка',
    quantityScope: 'PER_PERSON',
    sortOrder: 160,
    matches: (ctx) => ctx.climateHint !== 'cool_season',
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        `Защита от ветра и осадков (${ctx.climateLabelRu})`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:warm_jacket',
    category: PackingCategory.CLOTHING,
    name: 'Тёплая верхняя куртка / пуховик',
    quantityScope: 'PER_PERSON',
    sortOrder: 170,
    matches: (ctx) =>
      ctx.climateHint === 'cool_season' || ctx.activities.has('winter_sport'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('winter_sport')
          ? ctx.activityReasons.winter_sport
          : ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:winter_accessories',
    category: PackingCategory.CLOTHING,
    name: 'Шапка, перчатки и шарф / бафф',
    quantityScope: 'PER_PERSON',
    sortOrder: 180,
    matches: (ctx) =>
      ctx.climateHint === 'cool_season' ||
      ctx.activities.has('winter_sport') ||
      (ctx.activities.has('hiking') && ctx.hasAscentOrMountainTrail),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('winter_sport')
          ? ctx.activityReasons.winter_sport
          : ctx.hasAscentOrMountainTrail
            ? 'Для прохладной и ветреной погоды на высоте'
            : ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:thermal_underwear',
    category: PackingCategory.CLOTHING,
    name: 'Термобельё',
    quantityScope: 'PER_PERSON',
    sortOrder: 190,
    matches: (ctx) =>
      ctx.activities.has('winter_sport') ||
      (ctx.climateHint === 'cool_season' &&
        hasAnyActivity(ctx, ['hiking', 'camping'])),
    computeBaseQuantity: (ctx) => (ctx.durationDays >= 6 ? 2 : 1),
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['winter_sport', 'hiking', 'camping']) ||
          ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:sun_hat',
    category: PackingCategory.CLOTHING,
    name: 'Головной убор от солнца (кепка / панама)',
    quantityScope: 'PER_PERSON',
    sortOrder: 200,
    matches: (ctx) =>
      ctx.climateHint === 'tropical_warm' ||
      ctx.climateHint === 'warm_season' ||
      hasAnyActivity(ctx, ['beach', 'hiking', 'cycling', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'hiking', 'cycling', 'camping']) ||
          ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:sportswear',
    category: PackingCategory.CLOTHING,
    name: 'Спортивная / быстросохнущая одежда для активностей',
    quantityScope: 'PER_PERSON',
    sortOrder: 210,
    matches: (ctx) => hasAnyActivity(ctx, ['hiking', 'cycling', 'camping']),
    computeBaseQuantity: (ctx) => Math.min(3, Math.max(1, Math.ceil(ctx.durationDays / 3))),
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['hiking', 'cycling', 'camping']),
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:business_attire',
    category: PackingCategory.CLOTHING,
    name: 'Деловая одежда (рубашка / блуза / пиджак / костюм)',
    quantityScope: 'PER_PERSON',
    sortOrder: 220,
    matches: (ctx) => ctx.activities.has('business'),
    computeBaseQuantity: (ctx) => Math.min(3, Math.max(1, ctx.durationDays)),
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.business || 'Деловые мероприятия в поездке',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'cloth:smart_casual',
    category: PackingCategory.CLOTHING,
    name: 'Комплект одежды для вечернего выхода (smart casual)',
    quantityScope: 'PER_PERSON',
    sortOrder: 230,
    matches: (ctx) => ctx.activities.has('evening_out'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.evening_out || 'Запланирован вечерний выход / театр / ресторан',
        formatPeopleNote(ctx),
      ]),
  },

  // =========================================================================
  // 3. FOOTWEAR (Обувь)
  // =========================================================================
  {
    ruleKey: 'foot:walking_shoes',
    category: PackingCategory.FOOTWEAR,
    name: 'Удобная разношенная обувь для прогулок',
    quantityScope: 'PER_PERSON',
    sortOrder: 300,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('sightseeing')
          ? ctx.activityReasons.sightseeing
          : 'Для комфортных городских прогулок и дороги',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'foot:water_slippers',
    category: PackingCategory.FOOTWEAR,
    name: 'Сланцы / шлёпанцы / нескользящие тапочки',
    quantityScope: 'PER_PERSON',
    sortOrder: 310,
    matches: (ctx) => hasAnyActivity(ctx, ['beach', 'waterpark', 'pool_spa']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'waterpark', 'pool_spa']),
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'foot:hiking_boots',
    category: PackingCategory.FOOTWEAR,
    name: 'Треккинговая обувь или кроссовки с рельефным протектором',
    quantityScope: 'PER_PERSON',
    sortOrder: 320,
    matches: (ctx) => ctx.activities.has('hiking'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.hiking || 'Для безопасного передвижения по тропам',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'foot:warm_boots',
    category: PackingCategory.FOOTWEAR,
    name: 'Утеплённая непромокаемая обувь',
    quantityScope: 'PER_PERSON',
    sortOrder: 330,
    matches: (ctx) =>
      ctx.climateHint === 'cool_season' || ctx.activities.has('winter_sport'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('winter_sport')
          ? ctx.activityReasons.winter_sport
          : ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'foot:business_shoes',
    category: PackingCategory.FOOTWEAR,
    name: 'Классическая обувь для деловых встреч',
    quantityScope: 'PER_PERSON',
    sortOrder: 340,
    matches: (ctx) => ctx.activities.has('business'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.business || 'Деловые встречи',
        formatPeopleNote(ctx),
      ]),
  },

  // =========================================================================
  // 4. TECH (Техника и гаджеты)
  // =========================================================================
  {
    ruleKey: 'tech:phone_charger',
    category: PackingCategory.TECH,
    name: 'Смартфон и зарядный кабель / адаптер питания',
    quantityScope: 'PER_PERSON',
    sortOrder: 400,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons(['Связь, навигация и электронные билеты', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'tech:powerbank',
    category: PackingCategory.TECH,
    name: 'Внешний аккумулятор (Power Bank)',
    quantityScope: 'PER_PERSON',
    sortOrder: 410,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Индивидуальный запас заряда для смартфона и навигатора в течение дня',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'tech:headphones',
    category: PackingCategory.TECH,
    name: 'Наушники',
    quantityScope: 'PER_PERSON',
    sortOrder: 420,
    matches: (ctx) =>
      ctx.durationDays >= 2 ||
      hasAnyActivity(ctx, ['flight', 'sightseeing', 'business']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('sightseeing')
          ? 'Для дороги и аудиогидов на экскурсиях'
          : 'Для комфорта в дороге',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'tech:outlet_type_check',
    category: PackingCategory.TECH,
    name: 'Проверить тип розеток и напряжение по маршруту',
    quantityScope: 'NONE',
    sortOrder: 425,
    matches: (ctx) => ctx.durationDays >= 2 || ctx.activities.has('flight'),
    buildReason: () =>
      'Стандарты розеток и напряжение отличаются в разных странах и регионах — проверьте перед выездом',
  },
  {
    ruleKey: 'tech:outlet_adapter',
    category: PackingCategory.TECH,
    name: 'Универсальный сетевой адаптер (переходник для розеток)',
    quantityScope: 'SHARED',
    sortOrder: 430,
    matches: (ctx) => ctx.durationDays >= 2 || ctx.activities.has('flight'),
    computeBaseQuantity: () => 1,
    buildReason: () =>
      'Один общий переходник на номер или группу для подключения зарядок при другом типе розеток',
  },
  {
    ruleKey: 'tech:camera',
    category: PackingCategory.TECH,
    name: 'Фотоаппарат / экшн-камера и карты памяти',
    quantityScope: 'SHARED',
    sortOrder: 440,
    matches: (ctx) =>
      hasAnyActivity(ctx, ['sightseeing', 'hiking', 'winter_sport', 'cycling']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'По желанию для съёмки маршрута',
        collectActivityReasons(ctx, ['sightseeing', 'hiking', 'winter_sport', 'cycling']),
      ]),
  },
  {
    ruleKey: 'tech:laptop_charger',
    category: PackingCategory.TECH,
    name: 'Ноутбук / планшет и зарядное устройство',
    quantityScope: 'PER_PERSON',
    sortOrder: 450,
    matches: (ctx) => ctx.activities.has('business'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.business || 'Для работы в деловой поездке',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'tech:car_charger',
    category: PackingCategory.TECH,
    name: 'Автомобильное зарядное устройство и держатель для телефона',
    quantityScope: 'SHARED',
    sortOrder: 460,
    matches: (ctx) => ctx.activities.has('car_travel'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      ctx.activityReasons.car_travel || 'Удобно для навигации в автомобиле',
  },

  // =========================================================================
  // 5. HYGIENE (Гигиена и уход)
  // =========================================================================
  {
    ruleKey: 'hyg:toothbrush_paste',
    category: PackingCategory.HYGIENE,
    name: 'Зубная щётка и зубная паста',
    quantityScope: 'PER_PERSON',
    sortOrder: 500,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) => joinReasons(['Базовая гигиена', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'hyg:deodorant',
    category: PackingCategory.HYGIENE,
    name: 'Дезодорант',
    quantityScope: 'PER_PERSON',
    sortOrder: 510,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) => joinReasons(['Базовая гигиена', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'hyg:wet_wipes',
    category: PackingCategory.HYGIENE,
    name: 'Влажные и бумажные салфетки, антисептик для рук',
    quantityScope: 'SHARED',
    sortOrder: 520,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: () => 'Универсально для дороги, перекусов и прогулок (общий набор)',
  },
  {
    ruleKey: 'hyg:shower_kit',
    category: PackingCategory.HYGIENE,
    name: 'Гель для душа и шампунь в дорожном формате',
    quantityScope: 'SHARED',
    sortOrder: 530,
    matches: (ctx) =>
      ctx.durationDays >= 2 || hasAnyActivity(ctx, ['waterpark', 'pool_spa', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      hasAnyActivity(ctx, ['waterpark', 'pool_spa'])
        ? 'После посещения воды и душа (общий набор)'
        : `Поездка на ${ctx.durationDays} дн. (общий дорожный набор)`,
  },
  {
    ruleKey: 'hyg:comb',
    category: PackingCategory.HYGIENE,
    name: 'Расчёска',
    quantityScope: 'PER_PERSON',
    sortOrder: 540,
    matches: (ctx) => ctx.durationDays >= 2,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) => joinReasons(['Повседневный уход', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'hyg:sunscreen',
    category: PackingCategory.HYGIENE,
    name: 'Солнцезащитный крем (SPF)',
    quantityScope: 'SHARED',
    sortOrder: 550,
    matches: (ctx) =>
      ctx.climateHint === 'tropical_warm' ||
      ctx.climateHint === 'warm_season' ||
      hasAnyActivity(ctx, ['beach', 'winter_sport', 'hiking', 'cycling']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      ctx.activities.has('winter_sport')
        ? 'Защита кожи от яркого горного солнца (общий тюбик)'
        : joinReasons([
            'Защита от ультрафиолета (общий тюбик)',
            collectActivityReasons(ctx, ['beach', 'hiking', 'cycling']) || ctx.climateLabelRu,
          ]),
  },
  {
    ruleKey: 'hyg:lip_balm',
    category: PackingCategory.HYGIENE,
    name: 'Защитный бальзам для губ',
    quantityScope: 'PER_PERSON',
    sortOrder: 560,
    matches: (ctx) =>
      ctx.climateHint !== 'shoulder_or_uncertain' ||
      hasAnyActivity(ctx, ['winter_sport', 'hiking', 'beach']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons(['Защита от ветра, солнца или мороза', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'hyg:laundry_detergent',
    category: PackingCategory.HYGIENE,
    name: 'Дорожное средство для стирки (капсулы или листы)',
    quantityScope: 'SHARED',
    sortOrder: 570,
    matches: (ctx) => ctx.durationDays >= 7,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      `Поездка на ${ctx.durationDays} дн. — удобно освежить часть одежды вместо лишнего багажа`,
  },

  // =========================================================================
  // 6. PERSONAL (Личные вещи)
  // =========================================================================
  {
    ruleKey: 'pers:daypack',
    category: PackingCategory.PERSONAL,
    name: 'Компактный городской рюкзак или сумка на каждый день',
    quantityScope: 'PER_PERSON',
    sortOrder: 600,
    matches: (ctx) =>
      !ctx.activities.has('hiking') || ctx.activities.has('sightseeing'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('sightseeing')
          ? ctx.activityReasons.sightseeing
          : 'Для воды, документов и мелочей на прогулках',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'pers:sunglasses',
    category: PackingCategory.PERSONAL,
    name: 'Солнцезащитные очки',
    quantityScope: 'PER_PERSON',
    sortOrder: 610,
    matches: (ctx) =>
      ctx.climateHint === 'tropical_warm' ||
      ctx.climateHint === 'warm_season' ||
      hasAnyActivity(ctx, ['beach', 'winter_sport', 'cycling', 'car_travel']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'winter_sport', 'cycling', 'car_travel']) ||
          ctx.climateLabelRu,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'pers:reusable_bottle',
    category: PackingCategory.PERSONAL,
    name: 'Многоразовая бутылка для воды',
    quantityScope: 'PER_PERSON',
    sortOrder: 620,
    matches: (ctx) =>
      ctx.durationDays >= 2 ||
      hasAnyActivity(ctx, ['sightseeing', 'hiking', 'cycling', 'beach', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons(['Удобно на прогулках и маршрутах', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'pers:sleep_mask_earplugs',
    category: PackingCategory.PERSONAL,
    name: 'Маска для сна и беруши',
    quantityScope: 'PER_PERSON',
    sortOrder: 630,
    matches: (ctx) => ctx.activities.has('flight') || ctx.durationDays >= 4,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activities.has('flight')
          ? ctx.activityReasons.flight
          : 'Для спокойного сна в дороге и отеле',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'pers:neck_pillow',
    category: PackingCategory.PERSONAL,
    name: 'Дорожная подушка для шеи',
    quantityScope: 'PER_PERSON',
    sortOrder: 640,
    matches: (ctx) => ctx.activities.has('flight'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([ctx.activityReasons.flight || 'Перелёт по маршруту', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'pers:waterproof_pouch',
    category: PackingCategory.PERSONAL,
    name: 'Водонепроницаемый чехол для телефона и документов',
    quantityScope: 'PER_PERSON',
    sortOrder: 650,
    matches: (ctx) => hasAnyActivity(ctx, ['beach', 'waterpark', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'waterpark', 'camping']),
        formatPeopleNote(ctx),
      ]),
  },

  // =========================================================================
  // 7. MEDICINE (Лекарства и аптечка — строго нейтральные рекомендации)
  // =========================================================================
  {
    ruleKey: 'med:basic_first_aid',
    category: PackingCategory.MEDICINE,
    name: 'Базовая дорожная аптечка (пластыри, бинт, антисептик)',
    quantityScope: 'SHARED',
    sortOrder: 700,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: () =>
      'Общий набор первой помощи на поездку (без привязки к числу участников)',
  },
  {
    ruleKey: 'med:personal_meds',
    category: PackingCategory.MEDICINE,
    name: 'Личные необходимые лекарства и средства (по вашим потребностям)',
    quantityScope: 'NONE',
    sortOrder: 710,
    matches: () => true,
    buildReason: () =>
      'Возьмите препараты, которые вы принимаете постоянно или держите при себе в поездках',
  },
  {
    ruleKey: 'med:blister_plasters',
    category: PackingCategory.MEDICINE,
    name: 'Пластыри от мозолей и натираний',
    quantityScope: 'SHARED',
    sortOrder: 720,
    matches: (ctx) => hasAnyActivity(ctx, ['sightseeing', 'hiking', 'cycling']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Для длительной ходьбы и активных маршрутов (общая упаковка)',
        collectActivityReasons(ctx, ['sightseeing', 'hiking', 'cycling']),
      ]),
  },
  {
    ruleKey: 'med:repellent',
    category: PackingCategory.MEDICINE,
    name: 'Репеллент от насекомых',
    quantityScope: 'SHARED',
    sortOrder: 730,
    matches: (ctx) => hasAnyActivity(ctx, ['hiking', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Для отдыха на природе и лесных троп (общий флакон)',
        collectActivityReasons(ctx, ['hiking', 'camping']),
      ]),
  },

  // =========================================================================
  // 8. ACTIVITY (Вещи для конкретных активностей)
  // =========================================================================
  {
    ruleKey: 'act:swimwear',
    category: PackingCategory.ACTIVITY,
    name: 'Купальник / плавки',
    quantityScope: 'PER_PERSON',
    sortOrder: 800,
    matches: (ctx) => hasAnyActivity(ctx, ['beach', 'waterpark', 'pool_spa']),
    computeBaseQuantity: (ctx) =>
      ctx.activities.has('beach') && ctx.durationDays >= 5 ? 2 : 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'waterpark', 'pool_spa']),
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:quick_dry_towel',
    category: PackingCategory.ACTIVITY,
    name: 'Полотенце (пляжное или быстросохнущее из микрофибры)',
    quantityScope: 'PER_PERSON',
    sortOrder: 810,
    matches: (ctx) => hasAnyActivity(ctx, ['beach', 'waterpark', 'pool_spa', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        collectActivityReasons(ctx, ['beach', 'waterpark', 'pool_spa', 'camping']),
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:swim_cap_goggles',
    category: PackingCategory.ACTIVITY,
    name: 'Шапочка и очки для плавания (при требованиях бассейна)',
    quantityScope: 'PER_PERSON',
    sortOrder: 820,
    matches: (ctx) => ctx.activities.has('pool_spa'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.pool_spa || 'Во многих бассейнах требуется шапочка',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:snorkel_gear',
    category: PackingCategory.ACTIVITY,
    name: 'Маска и трубка для снорклинга',
    quantityScope: 'PER_PERSON',
    sortOrder: 830,
    matches: (ctx) => ctx.hasSnorkelOrDiving,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons(['В маршруте упомянут снорклинг / дайвинг', formatPeopleNote(ctx)]),
  },
  {
    ruleKey: 'act:hiking_backpack',
    category: PackingCategory.ACTIVITY,
    name: 'Треккинговый рюкзак (20–35 л)',
    quantityScope: 'PER_PERSON',
    sortOrder: 840,
    matches: (ctx) => ctx.activities.has('hiking'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.hiking || 'Для воды, перекуса и тёплого слоя на маршруте',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:thermos',
    category: PackingCategory.ACTIVITY,
    name: 'Термос',
    quantityScope: 'SHARED',
    sortOrder: 850,
    matches: (ctx) => hasAnyActivity(ctx, ['hiking', 'camping', 'winter_sport']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Общий термос для горячих напитков на группу на маршруте',
        collectActivityReasons(ctx, ['hiking', 'camping', 'winter_sport']),
      ]),
  },
  {
    ruleKey: 'act:thermal_mug',
    category: PackingCategory.ACTIVITY,
    name: 'Термокружка',
    quantityScope: 'PER_PERSON',
    sortOrder: 855,
    matches: (ctx) => hasAnyActivity(ctx, ['hiking', 'camping', 'winter_sport']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Индивидуальная кружка для горячих напитков на привале и в дороге',
        collectActivityReasons(ctx, ['hiking', 'camping', 'winter_sport']),
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:trekking_poles',
    category: PackingCategory.ACTIVITY,
    name: 'Треккинговые палки (складные)',
    quantityScope: 'PER_PERSON',
    sortOrder: 860,
    matches: (ctx) => ctx.activities.has('hiking') && ctx.hasAscentOrMountainTrail,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Для разгрузки коленей на горных подъёмах и спусках',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:cycling_gear',
    category: PackingCategory.ACTIVITY,
    name: 'Велоперчатки и лёгкая ветровка / велобутылка',
    quantityScope: 'PER_PERSON',
    sortOrder: 870,
    matches: (ctx) => ctx.activities.has('cycling'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.cycling || 'Для комфортной велопрогулки',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:ski_goggles',
    category: PackingCategory.ACTIVITY,
    name: 'Горнолыжная маска / очки и защита для катания',
    quantityScope: 'PER_PERSON',
    sortOrder: 880,
    matches: (ctx) => ctx.activities.has('winter_sport'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.winter_sport || 'Для защиты глаз от ветра и отражённого света',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:ski_socks',
    category: PackingCategory.ACTIVITY,
    name: 'Высокие горнолыжные / треккинговые термоноски',
    quantityScope: 'PER_PERSON',
    sortOrder: 890,
    matches: (ctx) => ctx.activities.has('winter_sport'),
    computeBaseQuantity: (ctx) => Math.min(3, Math.max(1, ctx.durationDays)),
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.winter_sport || 'Для ботинок и активного катания',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:camping_tent',
    category: PackingCategory.ACTIVITY,
    name: 'Палатка и туристическое снаряжение для стоянки',
    quantityScope: 'SHARED',
    sortOrder: 900,
    matches: (ctx) => ctx.activities.has('camping'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.camping || 'Запланирован кемпинг / ночёвка на природе',
        'общее снаряжение (если не арендуется на месте)',
      ]),
  },
  {
    ruleKey: 'act:sleeping_bag',
    category: PackingCategory.ACTIVITY,
    name: 'Спальный мешок и туристический коврик',
    quantityScope: 'PER_PERSON',
    sortOrder: 910,
    matches: (ctx) => ctx.activities.has('camping'),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        ctx.activityReasons.camping || 'Для сна в кемпинге',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'act:headlamp',
    category: PackingCategory.ACTIVITY,
    name: 'Налобный или карманный фонарик',
    quantityScope: 'PER_PERSON',
    resolveQuantityScope: (ctx) =>
      ctx.activities.has('camping') ||
      (ctx.activities.has('hiking') && ctx.durationDays >= 2)
        ? 'PER_PERSON'
        : 'SHARED',
    sortOrder: 920,
    matches: (ctx) => hasAnyActivity(ctx, ['camping', 'hiking']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) => {
      const isPerPerson =
        ctx.activities.has('camping') ||
        (ctx.activities.has('hiking') && ctx.durationDays >= 2);
      return joinReasons([
        isPerPerson
          ? 'Для кемпинга и многодневных походов удобнее индивидуальный налобный фонарь'
          : 'Запасной свет для однодневного похода (достаточно одного общего на группу)',
        collectActivityReasons(ctx, ['camping', 'hiking']),
        isPerPerson ? formatPeopleNote(ctx) : undefined,
      ]);
    },
  },

  // =========================================================================
  // 9. OTHER (Прочее)
  // =========================================================================
  {
    ruleKey: 'other:umbrella',
    category: PackingCategory.OTHER,
    name: 'Компактный зонт или дождевик',
    quantityScope: 'PER_PERSON',
    sortOrder: 1000,
    matches: (ctx) =>
      ctx.climateHint !== 'warm_season' ||
      hasAnyActivity(ctx, ['sightseeing', 'hiking', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        hasAnyActivity(ctx, ['hiking', 'camping'])
          ? 'На случай внезапного дождя (дождевик удобнее зонта на тропе)'
          : `На случай переменчивой погоды (${ctx.climateLabelRu})`,
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'other:zip_bags',
    category: PackingCategory.OTHER,
    name: 'Дорожные органайзеры и пакеты для жидкостей / мелочей',
    quantityScope: 'SHARED',
    sortOrder: 1010,
    matches: () => true,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      ctx.activities.has('flight')
        ? 'Удобно для организации багажа и провоза жидкостей в ручной клади'
        : 'Для аккуратного разделения вещей и защиты от протекания',
  },
  {
    ruleKey: 'other:luggage_lock',
    category: PackingCategory.OTHER,
    name: 'Багажная бирка и кодовый замок',
    quantityScope: 'PER_PERSON',
    sortOrder: 1020,
    matches: (ctx) => ctx.activities.has('flight') || ctx.durationDays >= 4,
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      joinReasons([
        'Для сохранности и быстрой идентификации багажа каждого путешественника',
        formatPeopleNote(ctx),
      ]),
  },
  {
    ruleKey: 'other:laundry_bags',
    category: PackingCategory.OTHER,
    name: 'Пакеты или мешок для сменной и влажной одежды',
    quantityScope: 'SHARED',
    sortOrder: 1030,
    matches: (ctx) =>
      ctx.durationDays >= 3 ||
      hasAnyActivity(ctx, ['beach', 'waterpark', 'pool_spa', 'camping']),
    computeBaseQuantity: () => 1,
    buildReason: (ctx) =>
      hasAnyActivity(ctx, ['beach', 'waterpark', 'pool_spa'])
        ? 'Для мокрого купальника и полотенца после воды'
        : 'Для отделения использованной одежды в чемодане',
  },
];
