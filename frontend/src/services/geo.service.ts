import { feature } from 'topojson-client';
import worldAtlasTopology from 'world-atlas/countries-110m.json';
import type { CountryData, ContinentName } from '@/types';

export interface GlobePolygonFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    isoNumeric: string;
    nameRu: string;
    flagEmoji: string;
    slug?: string;
  };
  geometry: any;
  bbox?: number[];
}

// Module-level singleton cache so TopoJSON is parsed only once per session
let cachedGeoFeatures: GlobePolygonFeature[] | null = null;

// Russian names & basic fallback info for world-atlas polygons not in the 42-country catalog
const EXTRA_ISO_META: Record<
  string,
  {
    nameRu: string;
    flag: string;
    capital: string;
    continent: ContinentName;
    currency: string;
    languages: string[];
  }
> = {
  '004': { nameRu: 'Афганистан', flag: '🇦🇫', capital: 'Кабул', continent: 'Азия', currency: 'Афгани (AFN)', languages: ['Пушту', 'Дари'] },
  '008': { nameRu: 'Албания', flag: '🇦🇱', capital: 'Тирана', continent: 'Европа', currency: 'Лек (ALL)', languages: ['Албанский'] },
  '012': { nameRu: 'Алжир', flag: '🇩🇿', capital: 'Алжир', continent: 'Африка', currency: 'Алжирский динар (DZD)', languages: ['Арабский'] },
  '024': { nameRu: 'Ангола', flag: '🇦🇴', capital: 'Луанда', continent: 'Африка', currency: 'Кванза (AOA)', languages: ['Португальский'] },
  '031': { nameRu: 'Азербайджан', flag: '🇦🇿', capital: 'Баку', continent: 'Азия', currency: 'Азербайджанский манат (AZN)', languages: ['Азербайджанский'] },
  '050': { nameRu: 'Бангладеш', flag: '🇧🇩', capital: 'Дакка', continent: 'Азия', currency: 'Така (BDT)', languages: ['Бенгальский'] },
  '056': { nameRu: 'Бельгия', flag: '🇧🇪', capital: 'Брюссель', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Нидерландский', 'Французский'] },
  '068': { nameRu: 'Боливия', flag: '🇧🇴', capital: 'Сукре / Ла-Пас', continent: 'Южная Америка', currency: 'Боливиано (BOB)', languages: ['Испанский'] },
  '070': { nameRu: 'Босния и Герцеговина', flag: '🇧🇦', capital: 'Сараево', continent: 'Европа', currency: 'Конвертируемая марка (BAM)', languages: ['Боснийский', 'Сербский', 'Хорватский'] },
  '072': { nameRu: 'Ботсвана', flag: '🇧🇼', capital: 'Габороне', continent: 'Африка', currency: 'Пула (BWP)', languages: ['Английский', 'Тсвана'] },
  '100': { nameRu: 'Болгария', flag: '🇧🇬', capital: 'София', continent: 'Европа', currency: 'Болгарский лев (BGN)', languages: ['Болгарский'] },
  '104': { nameRu: 'Мьянма', flag: '🇲🇲', capital: 'Нейпьидо', continent: 'Азия', currency: 'Кьят (MMK)', languages: ['Бирманский'] },
  '116': { nameRu: 'Камбоджа', flag: '🇰🇭', capital: 'Пномпень', continent: 'Азия', currency: 'Риель (KHR)', languages: ['Кхмерский'] },
  '120': { nameRu: 'Камерун', flag: '🇨🇲', capital: 'Яунде', continent: 'Африка', currency: 'Франк КФА (XAF)', languages: ['Французский', 'Английский'] },
  '144': { nameRu: 'Шри-Ланка', flag: '🇱🇰', capital: 'Коломбо / Шри-Джаяварденепура-Котте', continent: 'Азия', currency: 'Рупия Шри-Ланки (LKR)', languages: ['Сингальский', 'Тамильский'] },
  '170': { nameRu: 'Колумбия', flag: '🇨🇴', capital: 'Богота', continent: 'Южная Америка', currency: 'Колумбийское песо (COP)', languages: ['Испанский'] },
  '188': { nameRu: 'Коста-Рика', flag: '🇨🇷', capital: 'Сан-Хосе', continent: 'Северная Америка', currency: 'Колон (CRC)', languages: ['Испанский'] },
  '196': { nameRu: 'Кипр', flag: '🇨🇾', capital: 'Никосия', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Греческий', 'Турецкий'] },
  '208': { nameRu: 'Дания', flag: '🇩🇰', capital: 'Копенгаген', continent: 'Европа', currency: 'Датская крона (DKK)', languages: ['Датский'] },
  '214': { nameRu: 'Доминиканская Республика', flag: '🇩🇴', capital: 'Санто-Доминго', continent: 'Северная Америка', currency: 'Доминиканское песо (DOP)', languages: ['Испанский'] },
  '218': { nameRu: 'Эквадор', flag: '🇪🇨', capital: 'Кито', continent: 'Южная Америка', currency: 'Доллар США (USD, $)', languages: ['Испанский'] },
  '231': { nameRu: 'Эфиопия', flag: '🇪🇹', capital: 'Аддис-Абеба', continent: 'Африка', currency: 'Быр (ETB)', languages: ['Амхарский'] },
  '233': { nameRu: 'Эстония', flag: '🇪🇪', capital: 'Таллин', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Эстонский'] },
  '304': { nameRu: 'Гренландия', flag: '🇬🇱', capital: 'Нуук', continent: 'Северная Америка', currency: 'Датская крона (DKK)', languages: ['Гренландский', 'Датский'] },
  '348': { nameRu: 'Венгрия', flag: '🇭🇺', capital: 'Будапешт', continent: 'Европа', currency: 'Форинт (HUF)', languages: ['Венгерский'] },
  '364': { nameRu: 'Иран', flag: '🇮🇷', capital: 'Тегеран', continent: 'Азия', currency: 'Иранский риал (IRR)', languages: ['Персидский'] },
  '368': { nameRu: 'Ирак', flag: '🇮🇶', capital: 'Багдад', continent: 'Азия', currency: 'Иракский динар (IQD)', languages: ['Арабский', 'Курдский'] },
  '372': { nameRu: 'Ирландия', flag: '🇮🇪', capital: 'Дублин', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Ирландский', 'Английский'] },
  '376': { nameRu: 'Израиль', flag: '🇮🇱', capital: 'Иерусалим', continent: 'Азия', currency: 'Новый шекель (ILS)', languages: ['Иврит', 'Арабский'] },
  '400': { nameRu: 'Иордания', flag: '🇯🇴', capital: 'Амман', continent: 'Азия', currency: 'Иорданский динар (JOD)', languages: ['Арабский'] },
  '417': { nameRu: 'Кыргызстан', flag: '🇰🇬', capital: 'Бишкек', continent: 'Азия', currency: 'Сом (KGS)', languages: ['Кыргызский', 'Русский'] },
  '418': { nameRu: 'Лаос', flag: '🇱🇦', capital: 'Вьентьян', continent: 'Азия', currency: 'Кип (LAK)', languages: ['Лаосский'] },
  '428': { nameRu: 'Латвия', flag: '🇱🇻', capital: 'Рига', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Латышский'] },
  '440': { nameRu: 'Литва', flag: '🇱🇹', capital: 'Вильнюс', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Литовский'] },
  '450': { nameRu: 'Мадагаскар', flag: '🇲🇬', capital: 'Антананариву', continent: 'Африка', currency: 'Ариари (MGA)', languages: ['Малагасийский', 'Французский'] },
  '458': { nameRu: 'Малайзия', flag: '🇲🇾', capital: 'Куала-Лумпур', continent: 'Азия', currency: 'Ринггит (MYR)', languages: ['Малайский'] },
  '496': { nameRu: 'Монголия', flag: '🇲🇳', capital: 'Улан-Батор', continent: 'Азия', currency: 'Тугрик (MNT)', languages: ['Монгольский'] },
  '499': { nameRu: 'Черногория', flag: '🇲🇪', capital: 'Подгорица', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Черногорский'] },
  '516': { nameRu: 'Намибия', flag: '🇳🇦', capital: 'Виндхук', continent: 'Африка', currency: 'Намибийский доллар (NAD)', languages: ['Английский'] },
  '524': { nameRu: 'Непал', flag: '🇳🇵', capital: 'Катманду', continent: 'Азия', currency: 'Непальская рупия (NPR)', languages: ['Непальский'] },
  '566': { nameRu: 'Нигерия', flag: '🇳🇬', capital: 'Абуджа', continent: 'Африка', currency: 'Найра (NGN)', languages: ['Английский'] },
  '512': { nameRu: 'Оман', flag: '🇴🇲', capital: 'Маскат', continent: 'Азия', currency: 'Оманский риал (OMR)', languages: ['Арабский'] },
  '586': { nameRu: 'Пакистан', flag: '🇵🇰', capital: 'Исламабад', continent: 'Азия', currency: 'Пакистанская рупия (PKR)', languages: ['Урду', 'Английский'] },
  '591': { nameRu: 'Панама', flag: '🇵🇦', capital: 'Панама', continent: 'Северная Америка', currency: 'Бальбоа / Доллар США (USD)', languages: ['Испанский'] },
  '608': { nameRu: 'Филиппины', flag: '🇵🇭', capital: 'Манила', continent: 'Азия', currency: 'Филиппинское песо (PHP)', languages: ['Филиппинский', 'Английский'] },
  '634': { nameRu: 'Катар', flag: '🇶🇦', capital: 'Доха', continent: 'Азия', currency: 'Катарский риал (QAR)', languages: ['Арабский'] },
  '642': { nameRu: 'Румыния', flag: '🇷🇴', capital: 'Бухарест', continent: 'Европа', currency: 'Румынский лей (RON)', languages: ['Румынский'] },
  '682': { nameRu: 'Саудовская Аравия', flag: '🇸🇦', capital: 'Эр-Рияд', continent: 'Азия', currency: 'Саудовский риял (SAR)', languages: ['Арабский'] },
  '703': { nameRu: 'Словакия', flag: '🇸🇰', capital: 'Братислава', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Словацкий'] },
  '705': { nameRu: 'Словения', flag: '🇸🇮', capital: 'Любляна', continent: 'Европа', currency: 'Евро (EUR, €)', languages: ['Словенский'] },
  '762': { nameRu: 'Таджикистан', flag: '🇹🇯', capital: 'Душанбе', continent: 'Азия', currency: 'Сомони (TJS)', languages: ['Таджикский'] },
  '788': { nameRu: 'Тунис', flag: '🇹🇳', capital: 'Тунис', continent: 'Африка', currency: 'Тунисский динар (TND)', languages: ['Арабский'] },
  '795': { nameRu: 'Туркменистан', flag: '🇹🇲', capital: 'Ашхабад', continent: 'Азия', currency: 'Манат (TMT)', languages: ['Туркменский'] },
  '804': { nameRu: 'Украина', flag: '🇺🇦', capital: 'Киев', continent: 'Европа', currency: 'Гривна (UAH)', languages: ['Украинский'] },
  '858': { nameRu: 'Уругвай', flag: '🇺🇾', capital: 'Монтевидео', continent: 'Южная Америка', currency: 'Уругвайское песо (UYU)', languages: ['Испанский'] },
  '862': { nameRu: 'Венесуэла', flag: '🇻🇪', capital: 'Каракас', continent: 'Южная Америка', currency: 'Боливар (VES)', languages: ['Испанский'] },
};

export function getWorldGeoFeatures(catalogCountries: CountryData[]): GlobePolygonFeature[] {
  if (!cachedGeoFeatures) {
    const topology = worldAtlasTopology as any;
    const geojson = feature(topology, topology.objects.countries) as any;
    const rawFeatures: any[] = geojson.features || [];

    cachedGeoFeatures = rawFeatures
      .filter((f) => f.id !== '010' && f.properties?.name !== 'Antarctica') // Skip Antarctica for cleaner travel globe
      .map((f) => {
        const isoNum = String(f.id || '').padStart(3, '0');
        const extra = EXTRA_ISO_META[isoNum];
        return {
          type: 'Feature' as const,
          id: isoNum,
          geometry: f.geometry,
          properties: {
            name: f.properties?.name || 'Country',
            isoNumeric: isoNum,
            nameRu: extra?.nameRu || f.properties?.name || 'Страна',
            flagEmoji: extra?.flag || '🌍',
          },
        };
      });
  }

  // Enrich cached features with catalog slugs and Russian names
  const byIso = new Map<string, CountryData>();
  const byNameEn = new Map<string, CountryData>();
  for (const c of catalogCountries) {
    byIso.set(c.isoNumeric.padStart(3, '0'), c);
    byNameEn.set(c.nameEn.toLowerCase(), c);
  }

  return cachedGeoFeatures.map((feat) => {
    const match =
      byIso.get(feat.properties.isoNumeric) ||
      byNameEn.get(feat.properties.name.toLowerCase());

    if (match) {
      return {
        ...feat,
        properties: {
          ...feat.properties,
          nameRu: match.nameRu,
          flagEmoji: match.flagEmoji,
          slug: match.slug,
        },
      };
    }
    return feat;
  });
}

export function computeFeatureCentroid(feat: GlobePolygonFeature): { lat: number; lng: number } {
  try {
    const geom = feat.geometry;
    if (!geom || !geom.coordinates) return { lat: 20, lng: 0 };

    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    const visitCoords = (coords: any) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        sumLng += coords[0];
        sumLat += coords[1];
        count++;
      } else {
        for (const child of coords) {
          visitCoords(child);
        }
      }
    };

    visitCoords(geom.coordinates);
    if (count > 0) {
      return { lat: sumLat / count, lng: sumLng / count };
    }
  } catch {
    // ignore
  }
  return { lat: 20, lng: 0 };
}

export function buildFallbackCountryFromFeature(feat: GlobePolygonFeature): CountryData {
  const isoNum = feat.properties.isoNumeric;
  const extra = EXTRA_ISO_META[isoNum];
  const centroid = computeFeatureCentroid(feat);
  const nameRu = extra?.nameRu || feat.properties.nameRu || feat.properties.name;
  const nameEn = feat.properties.name;
  const capital = extra?.capital || 'Столичный регион';
  const continent = extra?.continent || 'Европа';

  const fallbackPhoto = {
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=75',
    alt: `${nameRu} — путешествие`,
    category: 'Обложка' as const,
    authorName: 'Unsplash Travel',
    authorUrl: 'https://unsplash.com',
    sourceName: 'Unsplash' as const,
    sourceUrl: 'https://unsplash.com',
  };

  return {
    slug: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    isoNumeric: isoNum,
    isoAlpha2: 'UN',
    nameRu,
    nameEn,
    flagEmoji: extra?.flag || feat.properties.flagEmoji || '🌍',
    flagUrl: '',
    capital,
    continent,
    population: 0,
    area: 0,
    languages: extra?.languages || ['Официальный государственный язык'],
    currency: extra?.currency || 'Национальная валюта',
    defaultTripCurrency: continent === 'Европа' ? 'EUR' : 'USD',
    coordinates: centroid,
    shortDescription: `Увлекательное направление для путешествия в регионе ${continent} со столицей в городе ${capital}.`,
    description: `${nameRu} (${nameEn}) — государство в регионе ${continent}. Откройте для себя культуру, природные ландшафты и атмосферу столицы (${capital}), спланировав маршрут в TravelPlanner.`,
    coverPhoto: fallbackPhoto,
    gallery: [fallbackPhoto],
    popularCities: [
      {
        name: capital,
        description: `Главный культурный и деловой центр страны (${nameRu}).`,
        photoUrl: fallbackPhoto.thumbUrl,
      },
    ],
    landmarks: [],
    featured: false,
  };
}
