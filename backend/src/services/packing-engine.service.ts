import { PackingCategory, TripType } from '@prisma/client';
import { CountryService } from './country.service';
import { calculateDurationDays, formatDateOnly } from './trip.service';
import {
  ActivityTag,
  ClimateHint,
  PACKING_RULES_CATALOG,
  PackingRuleContext,
  QuantityScope,
} from '../data/packing-rules.data';

export interface EngineEventInput {
  title: string;
  description?: string | null;
  location?: string | null;
  note?: string | null;
  date?: Date | string | null;
}

export interface EngineTripInput {
  title: string;
  country: string;
  city: string;
  startDate: Date | string;
  endDate: Date | string;
  travelersCount?: number | null;
  tripType?: TripType | null;
  description?: string | null;
  events?: EngineEventInput[];
}

export interface GeneratedPackingCandidate {
  ruleKey: string;
  category: PackingCategory;
  name: string;
  quantity: number | null;
  quantityScope: QuantityScope;
  reason: string;
  sortOrder: number;
}

export interface DetectedActivityInfo {
  tag: ActivityTag;
  labelRu: string;
  confidence: number;
  reason: string;
  sources: string[];
}

export interface PackingEngineContextSummary {
  version: number;
  durationDays: number;
  confirmedTravelersCount: number | null;
  assumedTravelersCount: number;
  travelersAssumed: boolean;
  climateHint: ClimateHint;
  climateLabelRu: string;
  countryMatchedSlug: string | null;
  detectedActivities: DetectedActivityInfo[];
  lowConfidenceSignals: ActivityTag[];
  eventsAnalyzedCount: number;
}

export interface PackingGenerationResult {
  items: GeneratedPackingCandidate[];
  context: PackingEngineContextSummary;
}

interface TextSegment {
  text: string;
  sourceLabel: string;
  weight: number;
}

interface ActivityPatternSpec {
  regex: RegExp;
  strength: 'strong' | 'medium';
}

interface ActivityDetectorConfig {
  tag: ActivityTag;
  labelRu: string;
  tripTypes?: TripType[];
  patterns: ActivityPatternSpec[];
}

const ACTIVITY_LABELS_RU: Record<ActivityTag, string> = {
  beach: 'Пляж и купание',
  waterpark: 'Аквапарк',
  sightseeing: 'Пешие экскурсии',
  hiking: 'Походы и горный туризм',
  cycling: 'Велосипедные прогулки',
  winter_sport: 'Зимние виды спорта',
  pool_spa: 'Бассейн и SPA',
  business: 'Деловые мероприятия',
  camping: 'Кемпинг и природа',
  flight: 'Авиаперелёт',
  car_travel: 'Поездка на авто',
  evening_out: 'Вечерний выход',
};

const CONFIDENCE_THRESHOLD = 0.7;

const NEGATION_TOKENS = new Set([
  'без',
  'не',
  'нет',
  'никаких',
  'никакого',
  'никакой',
  'исключая',
  'кроме',
  'отмена',
  'отменили',
  'отказ',
  'отказались',
  'вместо',
  'without',
  'no',
  'not',
  'skip',
  'avoid',
]);

const NEGATION_STOP_TOKENS = new Set([
  'но',
  'однако',
  'зато',
  'а',
  'только',
  'but',
  'however',
  'only',
]);

/**
 * Устойчивые метафоры и нерелевантные бытовые выражения, которые маскируются
 * перед поиском активностей, чтобы исключить ложные срабатывания.
 */
const FALSE_POSITIVE_PHRASES: RegExp[] = [
  /мор[ея]\s+(?:впечатлени[йя]|эмоци[йя]|позитива|радости|удовольстви[яй]|огне[йя]|цветов|улыбок|людей|времени|работы|идей|возможност(?:ей|и)|света|продуктов)/gi,
  /морск(?:ой|ого|ом)\s+(?:вокзал|порт|музе[йя]|бой)/gi,
  /музе[йя]\s+мирового\s+океана/gi,
  /океанариум[аеу]?/gi,
  /гор[аыу]\s+(?:дел|работы|вещей|сумок|покупок|посуды|проблем|планов)/gi,
  /золот(?:ые|ых)\s+гор[ы]?/gi,
  /пир\s+горой/gi,
  /не\s+за\s+горами/gi,
  /(?:с\s+видом|вид|панорама|из\s+окна)\s+на\s+гор[ыу]/gi,
  /поход(?:а|ов|ы)?\s+(?:в|по)\s+(?:магазин(?:ы|ам)?|супермаркет|торгов(?:ый|ом)\s+центр|тц|ресторан(?:ы|ам)?|кафе|театр|кино|музе[йяи]|выставк[уи]|аптек[уи]|банк|поликлиник[уи]|врач[уа]|салон|парикмахерск)/gi,
  /поход(?:а|ов|ы)?\s+за\s+(?:покупками|продуктами|сувенирами)/gi,
  /(?:речн(?:ой|ого)|угольн(?:ый|ого)|нефтегазов(?:ый|ого)|водосборн(?:ый|ого))\s+бассейн/gi,
  /бассейн(?:а|е)?\s+(?:рек[и]?|волг[и]?|дон[а]?|моря)/gi,
  /офис(?:а|е|ы)?\s+(?:продаж|банка|аренды|проката|турагентств|обмена|связи|мобильной|почт)/gi,
  /(?:туристическ(?:ий|ого)|визов(?:ый|ого)|информационн(?:ый|ого))\s+(?:офис|центр)/gi,
  /бизнес[-\s]?(?:зал|ланч|класс)/gi,
  /водн(?:ые|ых)\s+лыж(?:и|ах)/gi,
  /роликов(?:ые|ых)\s+коньк(?:и|ах)/gi,
  /(?:торгов(?:ая|ой|ые)|сувенирн(?:ая|ой|ые)|рыночн(?:ая|ой|ые))\s+палатк(?:а|и|у|е|ах)/gi,
  /палатк(?:а|и|е)\s+(?:у\s+дороги|с\s+мороженым|с\s+сувенирами|с\s+едой)/gi,
];

const ACTIVITY_DETECTORS: ActivityDetectorConfig[] = [
  {
    tag: 'beach',
    labelRu: ACTIVITY_LABELS_RU.beach,
    tripTypes: [TripType.BEACH],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(пляж(?:а|е|у|ем|и|ей|ах|ами|ам)?|пляжн(?:ый|ая|ое|ые|ого|ом|ой)|купани[еяию]|снорклинг[ае]?|дайвинг[ае]?|серфинг[ае]?|сапборд[ае]?|beach(?:es)?|snorkeling|diving|surfing)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])((?:на|у|к)\s+мор[ею]|побережь[ея]|кораллов(?:ый|ые)\s+риф(?:ы)?|лагун[аые])(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(мор[ея]|океан[ае]?|купаться|загорать|шезлонг[иа]?|бухт[аеуы])(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'waterpark',
    labelRu: ACTIVITY_LABELS_RU.waterpark,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(аквапарк(?:а|е|у|ом|и|ов)?|water\s?park|водн(?:ые|ых)\s+горк(?:и|ах)|аквазон[аеуы])(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
    ],
  },
  {
    tag: 'pool_spa',
    labelRu: ACTIVITY_LABELS_RU.pool_spa,
    tripTypes: [TripType.WELLNESS_SPA],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(бассейн(?:а|е|у|ом|ы)?|спа|spa|терм(?:ы|ах|альн(?:ый|ая|ое|ые))|купальн(?:я|и|ях)|саун[аеуы]|хаммам[ае]?|хамам[ае]?|горяч(?:ие|их)\s+источник(?:и|ах|ов)|swimming\s+pool|thermal\s+bath)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex: /(?:^|[^а-яa-z0-9_])(бан[яию]|велнес|wellness)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'sightseeing',
    labelRu: ACTIVITY_LABELS_RU.sightseeing,
    tripTypes: [TripType.SIGHTSEEING, TripType.MIXED],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(экскурси(?:я|и|ю|ей|ям|ях)|музе(?:й|я|е|ю|и|ев|ях)|галере(?:я|и|ю|е)|обзорн(?:ая|ой|ую)\s+(?:экскурсия|прогулка)|пеш(?:ая|ую|их)\s+(?:экскурси[яию]|прогулк[аиу])|достопримечательност(?:ь|и|ей)|старый\s+город|историческ(?:ий|ом)\s+центр|sightseeing|walking\s+tour|city\s+tour|museum)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(кремл[ьяе]|собор[ае]?|двор(?:ец|ца|це)|замок|замка|храм[ае]?|прогулк[аиуе]\s+по\s+городу)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'hiking',
    labelRu: ACTIVITY_LABELS_RU.hiking,
    tripTypes: [TripType.MOUNTAIN],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(треккинг[ае]?|трекинг[ае]?|хайкинг[ае]?|trekking|hiking|восхождени[еяи]|альпинизм[ае]?|скалолазани[еяи]|горн(?:ый|ая|ое|ые|ого|ому|ом)\s+(?:туризм|поход|маршрут|троп[аыу])|пеш(?:ий|его|ему)\s+маршрут\s+по\s+гор(?:ам|е)|(?:в|по)\s+гор(?:ы|ам)\s+(?:с\s+рюкзаком|пешком|в\s+поход)|поход(?:а|е|у|ом|ы|ов|ах|ами)?|перевал(?:а|е|у|ы|ов)?|каньон(?:а|е|у|ы)?|ущель[ея])(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(гор[ыах]|горн(?:ый|ая|ые)|троп[аеуы]|водопад[аеуы]?|вулкан[аеу]?|хреб(?:ет|та|те))(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'cycling',
    labelRu: ACTIVITY_LABELS_RU.cycling,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(велосипед(?:а|е|у|ом|ы|ов|ах|ами|ный|ная|ные)?|велопрогулк(?:а|и|у|е|ах)|велотур(?:а|е|ы|ах)?|веломаршрут(?:а|е|ы|ах)?|cycling|bike\s+tour|bicycle|mountain\s+bike)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex: /(?:^|[^а-яa-z0-9_])(велодорожк(?:а|е|и|ах)|мтб|mtb)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'winter_sport',
    labelRu: ACTIVITY_LABELS_RU.winter_sport,
    tripTypes: [TripType.WINTER_SPORT],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(горнолыжн(?:ый|ая|ое|ые|ом|ого)|лыж(?:и|ах|ам|ами|ный|ная|ные)|сноуборд(?:а|е|у|ом|инг|е)?|ски[-\s]?пасс|skipass|ski\s+pass|фрирайд[ае]?|snowboard(?:ing)?|ski(?:ing)?|катани[ея]\s+на\s+(?:лыжах|сноуборде|коньках))(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(горнолыжк[аеу]|подъемник[ае]?|склон[аеы]?)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'business',
    labelRu: ACTIVITY_LABELS_RU.business,
    tripTypes: [TripType.BUSINESS],
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(командировк(?:а|и|у|е)|делов(?:ая|ой|ые)\s+(?:поездк[аиуе]|встреч[аиуе]|переговоры|визит|форум)|бизнес[-\s]?(?:встреч[аиуе]|форум|саммит|поездк[аиуе])|конференци(?:я|и|ю|ей|ях)|переговор(?:ы|ов|ах)|саммит[ае]?|business\s+trip|conference|summit)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(совещани[еяи]|презентаци(?:я|и|ю)|нетворкинг[ае]?|форум[ае]?|воркшоп[ае]?|семинар[ае]?)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'camping',
    labelRu: ACTIVITY_LABELS_RU.camping,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(кемпинг(?:а|е|у|ом|и|ах)?|палатк(?:а|и|у|е|ой|ах|ами)?|с\s+палатками|ночевк[аиу]\s+на\s+природе|глэмпинг(?:а|е|у)?|спальн(?:ый|ом)\s+меш(?:ок|ке)|спальник(?:а|е|и)?|camping|campsite|tent)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(кост(?:ер|ра|ру|ре)|кострищ[еа]|лесн(?:ой|ая|ом)|пикник[ае]?)(?=$|[^а-яa-z0-9_])/g,
        strength: 'medium',
      },
    ],
  },
  {
    tag: 'flight',
    labelRu: ACTIVITY_LABELS_RU.flight,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(перелет(?:а|е|ы)?|авиарейс(?:а|е|ы)?|авиабилет(?:а|ы)?|аэропорт(?:а|у|е)?|вылет(?:а|е)?|прилет(?:а|е)?|рейс(?:а|е|ы)?|самолет(?:а|е|ом)?|flight|airport)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
    ],
  },
  {
    tag: 'car_travel',
    labelRu: ACTIVITY_LABELS_RU.car_travel,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(аренд(?:а|ы|у|овать)\s+(?:авто|машины|автомобиля)|прокат\s+(?:авто|машины|автомобиля)|каршеринг(?:а|е|ом)?|на\s+(?:автомобиле|машине|авто)|автопутешестви[ея]|road\s+trip|car\s+rental)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
    ],
  },
  {
    tag: 'evening_out',
    labelRu: ACTIVITY_LABELS_RU.evening_out,
    patterns: [
      {
        regex:
          /(?:^|[^а-яa-z0-9_])(дресс[-\s]?код|вечерн(?:ий|ее|яя)\s+(?:выход|ужин|платье|костюм)|опер(?:а|у|е|ы)|театр(?:а|е|у)?|гала[-\s]?ужин|dress\s?code|opera|theatre)(?=$|[^а-яa-z0-9_])/g,
        strength: 'strong',
      },
    ],
  },
];

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function maskFalsePositives(text: string): string {
  let masked = text;
  for (const phraseRegex of FALSE_POSITIVE_PHRASES) {
    masked = masked.replace(phraseRegex, (match) => ' '.repeat(match.length));
  }
  return masked;
}

function splitIntoClauses(text: string): string[] {
  return text
    .split(/[.!?;,\n()[\]/—–]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Проверяет, находится ли найденное совпадение под действием отрицания в пределах той же клаузы.
 */
function isNegatedInClause(clause: string, matchIndex: number): boolean {
  const prefix = clause.slice(0, matchIndex).trim();
  if (!prefix) return false;

  const tokens = prefix.split(/[^а-яa-z0-9-]+/).filter(Boolean);
  const windowTokens = tokens.slice(-4);

  for (let i = windowTokens.length - 1; i >= 0; i -= 1) {
    const token = windowTokens[i];
    if (NEGATION_STOP_TOKENS.has(token)) {
      return false;
    }
    if (NEGATION_TOKENS.has(token)) {
      return true;
    }
  }

  return false;
}

function toIsoDateString(value: Date | string): string {
  if (value instanceof Date) {
    return formatDateOnly(value);
  }
  return String(value).slice(0, 10);
}

function collectMonthsInRange(startIso: string, endIso: string): number[] {
  const start = new Date(`${startIso}T00:00:00.000Z`);
  const end = new Date(`${endIso}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }

  const months = new Set<number>();
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const endMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  let safety = 0;
  while (cursor <= endMonth && safety < 24) {
    months.add(cursor.getUTCMonth() + 1); // 1..12
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    safety += 1;
  }

  return Array.from(months);
}

function estimateClimateHeuristic(
  lat: number | null,
  startIso: string,
  endIso: string
): { climateHint: ClimateHint; climateLabelRu: string } {
  const months = collectMonthsInRange(startIso, endIso);

  if (lat === null || months.length === 0) {
    return {
      climateHint: 'shoulder_or_uncertain',
      climateLabelRu: 'сезон/климат требуют уточнения по прогнозу погоды',
    };
  }

  const absLat = Math.abs(lat);
  if (absLat < 23.5) {
    return {
      climateHint: 'tropical_warm',
      climateLabelRu:
        'ориентировочно: тропическая широта (уточните прогноз погоды и осадки)',
    };
  }

  const isNorthern = lat >= 0;
  const warmMonths = isNorthern ? new Set([6, 7, 8]) : new Set([12, 1, 2]);
  const coolMonths = isNorthern
    ? absLat >= 55
      ? new Set([11, 12, 1, 2, 3])
      : new Set([12, 1, 2])
    : absLat >= 55
      ? new Set([5, 6, 7, 8, 9])
      : new Set([6, 7, 8]);

  const allWarm = months.every((m) => warmMonths.has(m)) && absLat < 55;
  const allCool = months.every((m) => coolMonths.has(m));

  if (allWarm) {
    return {
      climateHint: 'warm_season',
      climateLabelRu:
        'ориентировочно: тёплый сезон для выбранной широты (проверьте прогноз перед выездом)',
    };
  }

  if (allCool) {
    return {
      climateHint: 'cool_season',
      climateLabelRu:
        'ориентировочно: прохладный сезон для выбранной широты (проверьте прогноз перед выездом)',
    };
  }

  return {
    climateHint: 'shoulder_or_uncertain',
    climateLabelRu:
      'ориентировочно: переменчивый / переходный сезон (рекомендуется многослойная одежда и проверка прогноза)',
  };
}

function buildSegments(input: EngineTripInput): TextSegment[] {
  const segments: TextSegment[] = [];

  if (input.title?.trim()) {
    segments.push({
      text: input.title,
      sourceLabel: 'название поездки',
      weight: 0.95,
    });
  }

  if (input.description?.trim()) {
    segments.push({
      text: input.description,
      sourceLabel: 'описание поездки',
      weight: 0.75,
    });
  }

  if (input.city?.trim()) {
    segments.push({
      text: input.city,
      sourceLabel: 'город маршрута',
      weight: 0.7,
    });
  }

  const events = input.events || [];
  for (const ev of events) {
    const titleLabel = ev.title?.trim()
      ? `мероприятие «${ev.title.trim()}»`
      : 'мероприятие маршрута';

    if (ev.title?.trim()) {
      segments.push({
        text: ev.title,
        sourceLabel: titleLabel,
        weight: 1.0,
      });
    }
    if (ev.location?.trim()) {
      segments.push({
        text: ev.location,
        sourceLabel: titleLabel,
        weight: 0.9,
      });
    }
    if (ev.description?.trim()) {
      segments.push({
        text: ev.description,
        sourceLabel: titleLabel,
        weight: 0.8,
      });
    }
    if (ev.note?.trim()) {
      segments.push({
        text: ev.note,
        sourceLabel: titleLabel,
        weight: 0.8,
      });
    }
  }

  return segments;
}

function scanNonNegatedSignal(segments: TextSegment[], regex: RegExp): boolean {
  for (const seg of segments) {
    const normalized = maskFalsePositives(normalizeText(seg.text));
    const clauses = splitIntoClauses(normalized);
    for (const clause of clauses) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null = regex.exec(clause);
      while (match !== null) {
        const idx = match.index + (match[0].length - (match[1]?.length ?? match[0].length));
        if (!isNegatedInClause(clause, idx)) {
          return true;
        }
        match = regex.exec(clause);
      }
    }
  }
  return false;
}

export class PackingEngineService {
  static generateRecommendations(input: EngineTripInput): PackingGenerationResult {
    const startIso = toIsoDateString(input.startDate);
    const endIso = toIsoDateString(input.endDate);
    const durationDays = calculateDurationDays(startIso, endIso);

    // Разделяем подтверждённое число участников и безопасное значение по умолчанию
    const rawTravelers = input.travelersCount;
    const hasConfirmedTravelers =
      typeof rawTravelers === 'number' &&
      Number.isFinite(rawTravelers) &&
      Math.trunc(rawTravelers) >= 1;

    const confirmedTravelersCount = hasConfirmedTravelers
      ? Math.min(100, Math.trunc(rawTravelers!))
      : null;
    const effectiveTravelers = confirmedTravelersCount ?? 1;
    const travelersAssumed = !hasConfirmedTravelers;

    // Справочная информация о стране из существующего каталога (не падает, если страна введена вручную)
    const countryData = input.country?.trim()
      ? CountryService.findCountryByIdentifier(input.country)
      : undefined;

    const { climateHint, climateLabelRu } = estimateClimateHeuristic(
      countryData?.coordinates?.lat ?? null,
      startIso,
      endIso
    );

    const segments = buildSegments(input);
    const tripType = input.tripType ?? null;

    const activities = new Set<ActivityTag>();
    const activityReasons: Partial<Record<ActivityTag, string>> = {};
    const detectedActivities: DetectedActivityInfo[] = [];
    const lowConfidenceSignals: ActivityTag[] = [];

    for (const detector of ACTIVITY_DETECTORS) {
      let score = 0;
      const sources = new Set<string>();
      let hasExplicitType = false;

      if (tripType && detector.tripTypes?.includes(tripType)) {
        score += 1.0;
        hasExplicitType = true;
        sources.add('тип поездки');
      }

      for (const seg of segments) {
        const normalized = maskFalsePositives(normalizeText(seg.text));
        const clauses = splitIntoClauses(normalized);

        for (const clause of clauses) {
          const matchedRanges: Array<{ start: number; end: number }> = [];

          for (const spec of detector.patterns) {
            spec.regex.lastIndex = 0;
            let match: RegExpExecArray | null = spec.regex.exec(clause);
            while (match !== null) {
              const captured = match[1] ?? match[0];
              const capturedIndex = match.index + (match[0].length - captured.length);
              const capturedEnd = capturedIndex + captured.length;

              const overlapsExisting = matchedRanges.some(
                (r) => capturedIndex < r.end && capturedEnd > r.start
              );

              if (!overlapsExisting && !isNegatedInClause(clause, capturedIndex)) {
                const baseWeight = spec.strength === 'strong' ? 1.0 : 0.45;
                score += baseWeight * seg.weight;
                sources.add(seg.sourceLabel);
                matchedRanges.push({ start: capturedIndex, end: capturedEnd });
              }

              match = spec.regex.exec(clause);
            }
          }
        }
      }

      if (score >= CONFIDENCE_THRESHOLD) {
        activities.add(detector.tag);
        const sourceList = Array.from(sources);
        const reason = hasExplicitType
          ? `${detector.labelRu} (${sourceList.slice(0, 2).join(', ')})`
          : `${detector.labelRu}: ${sourceList.slice(0, 2).join(', ')}`;

        activityReasons[detector.tag] = reason;
        detectedActivities.push({
          tag: detector.tag,
          labelRu: detector.labelRu,
          confidence: Math.min(1, Math.round(score * 100) / 100),
          reason,
          sources: sourceList,
        });
      } else if (score > 0) {
        lowConfidenceSignals.push(detector.tag);
      }
    }

    const hasSnorkelOrDiving =
      activities.has('beach') &&
      scanNonNegatedSignal(
        segments,
        /(?:^|[^а-яa-z0-9_])(снорклинг[ае]?|дайвинг[ае]?|кораллов(?:ый|ые)\s+риф(?:ы)?|snorkeling|diving)(?=$|[^а-яa-z0-9_])/g
      );

    const hasAscentOrMountainTrail =
      activities.has('hiking') &&
      scanNonNegatedSignal(
        segments,
        /(?:^|[^а-яa-z0-9_])(восхождени[еяи]|перевал[аеу]?|альпинизм[ае]?|горн(?:ый|ая|ое|ые|ом)|хреб(?:ет|та|те)|в\s+гор(?:ы|ах)|треккинг[ае]?|трекинг[ае]?)(?=$|[^а-яa-z0-9_])/g
      );

    const ruleContext: PackingRuleContext = {
      durationDays,
      effectiveTravelers,
      confirmedTravelersCount,
      travelersAssumed,
      climateHint,
      climateLabelRu,
      activities,
      activityReasons,
      hasSnorkelOrDiving,
      hasAscentOrMountainTrail,
      tripType,
    };

    const items: GeneratedPackingCandidate[] = [];
    const seenRuleKeys = new Set<string>();
    const seenNormalizedNames = new Set<string>();

    for (const rule of PACKING_RULES_CATALOG) {
      if (seenRuleKeys.has(rule.ruleKey)) {
        continue;
      }

      if (!rule.matches(ruleContext)) {
        continue;
      }

      const normalizedName = rule.name.trim().toLowerCase();
      if (seenNormalizedNames.has(normalizedName)) {
        continue;
      }

      const resolvedScope = rule.resolveQuantityScope?.(ruleContext) ?? rule.quantityScope;

      let quantity: number | null = null;
      if (resolvedScope === 'PER_PERSON') {
        const perPersonBase = Math.max(1, rule.computeBaseQuantity?.(ruleContext) ?? 1);
        quantity = perPersonBase * ruleContext.effectiveTravelers;
      } else if (resolvedScope === 'SHARED') {
        quantity = Math.max(1, rule.computeBaseQuantity?.(ruleContext) ?? 1);
      }

      const reason = rule.buildReason(ruleContext, quantity);

      seenRuleKeys.add(rule.ruleKey);
      seenNormalizedNames.add(normalizedName);

      items.push({
        ruleKey: rule.ruleKey,
        category: rule.category,
        name: rule.name,
        quantity,
        quantityScope: resolvedScope,
        reason,
        sortOrder: rule.sortOrder,
      });
    }

    items.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      items,
      context: {
        version: 1,
        durationDays,
        confirmedTravelersCount,
        assumedTravelersCount: effectiveTravelers,
        travelersAssumed,
        climateHint,
        climateLabelRu,
        countryMatchedSlug: countryData?.slug ?? null,
        detectedActivities,
        lowConfidenceSignals,
        eventsAnalyzedCount: (input.events || []).length,
      },
    };
  }
}
