import { randomUUID } from 'node:crypto';
import {
  CountryData,
  CountryPhoto,
  PhotoEntityType,
  PhotoVerificationStatus,
} from '../data/countries.data';
import { FULL_COUNTRIES_CATALOG } from '../data/world-atlas-lookup.data';
import { prisma } from '../lib/prisma';

export interface StoredPhotoRecord {
  id: string;
  countrySlug: string;
  targetType: string;
  targetKey: string;
  objectName: string;
  countryName: string;
  cityName: string | null;
  entityType: string;
  url: string;
  thumbUrl: string;
  authorName: string;
  authorUrl: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  verified: boolean;
  manualOverride: boolean;
  verificationStatus: string;
  verificationNotes: string;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

let tableInitialized = false;

async function ensurePhotoRecordTable(): Promise<void> {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PhotoRecord" (
        "id" TEXT NOT NULL,
        "countrySlug" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetKey" TEXT NOT NULL,
        "objectName" TEXT NOT NULL,
        "countryName" TEXT NOT NULL,
        "cityName" TEXT,
        "entityType" TEXT NOT NULL DEFAULT 'landmark',
        "url" TEXT NOT NULL,
        "thumbUrl" TEXT NOT NULL,
        "authorName" TEXT NOT NULL DEFAULT 'Wikimedia Commons',
        "authorUrl" TEXT NOT NULL DEFAULT '',
        "sourceName" TEXT NOT NULL DEFAULT 'Wikimedia Commons',
        "sourceUrl" TEXT NOT NULL DEFAULT '',
        "license" TEXT NOT NULL DEFAULT 'CC BY-SA',
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "manualOverride" BOOLEAN NOT NULL DEFAULT false,
        "verificationStatus" TEXT NOT NULL DEFAULT 'verified',
        "verificationNotes" TEXT NOT NULL DEFAULT '',
        "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PhotoRecord_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "PhotoRecord_countrySlug_targetType_targetKey_key" ON "PhotoRecord"("countrySlug", "targetType", "targetKey")`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "PhotoRecord" ADD COLUMN IF NOT EXISTS "manualOverride" BOOLEAN NOT NULL DEFAULT false;`
    );
    tableInitialized = true;
  } catch (err) {
    console.error('[PhotoService] Ошибка инициализации таблицы PhotoRecord:', err);
    throw new Error(`База данных недоступна: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function fetchAllPhotoRecords(): Promise<StoredPhotoRecord[]> {
  await ensurePhotoRecordTable();
  return await prisma.photoRecord.findMany();
}

async function upsertPhotoRecord(data: {
  countrySlug: string;
  targetType: string;
  targetKey: string;
  objectName: string;
  countryName: string;
  cityName: string | null;
  entityType: string;
  url: string;
  thumbUrl: string;
  authorName: string;
  authorUrl?: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  verified: boolean;
  manualOverride: boolean;
  verificationStatus: string;
  verificationNotes: string;
}): Promise<StoredPhotoRecord> {
  await ensurePhotoRecordTable();
  const now = new Date();
  try {
    const record = await prisma.photoRecord.upsert({
      where: {
        countrySlug_targetType_targetKey: {
          countrySlug: data.countrySlug,
          targetType: data.targetType,
          targetKey: data.targetKey,
        },
      },
      create: {
        id: randomUUID(),
        countrySlug: data.countrySlug,
        targetType: data.targetType,
        targetKey: data.targetKey,
        objectName: data.objectName,
        countryName: data.countryName,
        cityName: data.cityName,
        entityType: data.entityType,
        url: data.url,
        thumbUrl: data.thumbUrl,
        authorName: data.authorName,
        authorUrl: data.authorUrl || data.sourceUrl,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        license: data.license,
        verified: data.verified,
        manualOverride: data.manualOverride,
        verificationStatus: data.verificationStatus,
        verificationNotes: data.verificationNotes,
        lastCheckedAt: now,
      },
      update: {
        objectName: data.objectName,
        countryName: data.countryName,
        cityName: data.cityName,
        entityType: data.entityType,
        url: data.url,
        thumbUrl: data.thumbUrl,
        authorName: data.authorName,
        authorUrl: data.authorUrl || data.sourceUrl,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        license: data.license,
        verified: data.verified,
        manualOverride: data.manualOverride,
        verificationStatus: data.verificationStatus,
        verificationNotes: data.verificationNotes,
        lastCheckedAt: now,
        updatedAt: now,
      },
    });

    return record;
  } catch (err: any) {
    console.error('[PhotoService] Ошибка сохранения PhotoRecord в PostgreSQL:', err);
    throw new Error(`Не удалось сохранить фотографию в базу данных: ${err?.message || err}`);
  }
}

async function deletePhotoRecord(
  countrySlug: string,
  targetType: string,
  targetKey: string
): Promise<boolean> {
  await ensurePhotoRecordTable();
  try {
    await prisma.photoRecord.deleteMany({
      where: {
        countrySlug,
        targetType,
        targetKey,
      },
    });
    return true;
  } catch (err: any) {
    console.error('[PhotoService] Ошибка удаления PhotoRecord из PostgreSQL:', err);
    throw new Error(`Не удалось удалить переопределение из базы данных: ${err?.message || err}`);
  }
}

export interface GeoVerificationInput {
  url: string;
  thumbUrl?: string;
  objectName: string;
  description?: string;
  categories?: string;
  countrySlug: string;
  countryNameRu: string;
  countryNameEn: string;
  cityName?: string;
  entityType: PhotoEntityType;
  sourceName?: string;
}

export interface GeoVerificationResult {
  verified: boolean;
  status: PhotoVerificationStatus;
  notes: string;
}

export interface PhotoDiagnosticItemDto {
  id: string;
  countrySlug: string;
  countryNameRu: string;
  countryNameEn: string;
  flagEmoji: string;
  targetType: 'cover' | 'gallery' | 'city' | 'landmark';
  targetKey: string;
  sectionLabel: string;
  objectName: string;
  cityName: string;
  entityType: PhotoEntityType;
  url: string;
  thumbUrl: string;
  authorName: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  verified: boolean;
  manualOverride: boolean;
  verificationStatus: PhotoVerificationStatus;
  verificationNotes: string;
  hasDbOverride: boolean;
  isDuplicate?: boolean;
  duplicateOf?: string;
  lastCheckedAt: string;
}

export interface PhotoDiagnosticsReportDto {
  summary: {
    totalImages: number;
    verifiedCount: number;
    missingCount: number;
    errorCount: number;
    needsReviewCount: number;
    duplicateCount: number;
    dbOverridesCount: number;
    manualOverridesCount: number;
    bySection: {
      cover: number;
      gallery: number;
      city: number;
      landmark: number;
    };
  };
  items: PhotoDiagnosticItemDto[];
  generatedAt: string;
}

// Known Unsplash IDs that belong strictly to a single country (prevents cross-country reuse)
const EXCLUSIVE_UNSPLASH_COUNTRY_OWNER: Record<string, { slug: string; label: string }> = {
  '1518709268805-4e9042af9f23': { slug: 'germany', label: 'Замок Эльц, Виршем (Германия)' },
  '1520106212299-d99c443e4568': { slug: 'russia', label: 'Красная площадь, Москва (Россия)' },
  '1583422409516-2895a77efded': { slug: 'spain', label: 'Парк Гуэль, Барселона (Испания)' },
  '1506744038136-46273834b3fb': { slug: 'usa', label: 'Национальный парк Йосемити (США)' },
  '1508804185872-d7badad00f7d': { slug: 'china', label: 'Великая Китайская стена (Китай)' },
  '1533105079780-92b9be482077': { slug: 'greece', label: 'Санторини (Греция)' },
  '1513635269975-59663e0ac1ad': { slug: 'united-kingdom', label: 'Биг-Бен и Вестминстер, Лондон (Великобритания)' },
  '1517935706615-2717063c2225': { slug: 'canada', label: 'Торонто и Си-Эн Тауэр (Канада)' },
  '1541849546-216549ae216d': { slug: 'czechia', label: 'Карлов мост, Прага (Чехия)' },
  '1519677100203-a0e668c92439': { slug: 'czechia', label: 'Староместская площадь, Прага (Чехия)' },
  '1539020140153-e479b8c22e70': { slug: 'morocco', label: 'Шефшауэн (Марокко)' },
  '1580060839134-75a5edca2e99': { slug: 'south-africa', label: 'Кейптаун (ЮАР)' },
  '1516426122078-c23e76319801': { slug: 'tanzania', label: 'Серенгети (Танзания)' },
  '1509316975850-ff9c5deb0cd9': { slug: 'morocco', label: 'Пустыня Сахара (Марокко)' },
  '1502602898657-3e91760cbb34': { slug: 'france', label: 'Эйфелева башня, Париж (Франция)' },
  '1552832230-c0197dd311b5': { slug: 'italy', label: 'Колизей, Рим (Италия)' },
};

// Exclusive famous landmarks / cities mapped to their true country slug to detect foreign photos
const EXCLUSIVE_GEO_MARKERS: Array<{ slug: string; tokens: string[]; label: string }> = [
  { slug: 'germany', tokens: ['burg eltz', 'замок эльц', 'eltz castle', 'neuschwanstein', 'нойшванштайн', 'brandenburg gate', 'бранденбургские ворота', 'cologne cathedral', 'кёльнский собор', 'reichstag', 'рейхстаг'], label: 'Германия' },
  { slug: 'austria', tokens: ['schonbrunn', 'шенбрунн', 'hallstatt', 'хальштатт', 'st stephen cathedral', 'собор святого стефана'], label: 'Австрия' },
  { slug: 'switzerland', tokens: ['matterhorn', 'маттерхорн', 'jungfrau', 'юнгфрау', 'zermatt', 'церматт'], label: 'Швейцария' },
  { slug: 'russia', tokens: ['red square', 'красная площадь', 'moscow kremlin', 'московский кремль', 'saint basil', 'храм василия блаженного', 'hermitage', 'эрмитаж'], label: 'Россия' },
  { slug: 'italy', tokens: ['colosseum', 'колизей', 'trevi fountain', 'фонтан треви', 'rialto bridge', 'ponte vecchio'], label: 'Италия' },
  { slug: 'france', tokens: ['eiffel tower', 'эйфелева башня', 'tour eiffel', 'mont saint-michel', 'мон-сен-мишель', 'promenade des anglais'], label: 'Франция' },
  { slug: 'spain', tokens: ['sagrada familia', 'саграда фамилия', 'park güell', 'park guell', 'парк гуэль', 'alhambra', 'альгамбра'], label: 'Испания' },
  { slug: 'greece', tokens: ['parthenon', 'парфенон', 'santorini', 'санторини', 'navagio', 'meteora'], label: 'Греция' },
  { slug: 'usa', tokens: ['yosemite', 'йосемити', 'grand canyon', 'гранд-каньон', 'statue of liberty', 'статуя свободы', 'golden gate bridge'], label: 'США' },
  { slug: 'china', tokens: ['great wall of china', 'великая китайская стена', 'forbidden city', 'запретный город', 'terracotta army'], label: 'Китай' },
  { slug: 'india', tokens: ['taj mahal', 'тадж-махал', 'hawa mahal', 'qutb minar'], label: 'Индия' },
  { slug: 'peru', tokens: ['machu picchu', 'мачу-пикчу', 'vinicunca'], label: 'Перу' },
  { slug: 'argentina', tokens: ['perito moreno', 'перито-морено', 'teatro colón', 'teatro colon', 'театр колон', 'la boca', 'ла-бока', 'caminito', 'каминито', 'fitz roy', 'фицрой'], label: 'Аргентина' },
  { slug: 'brazil', tokens: ['cristo redentor', 'christ the redeemer', 'христос-искупитель', 'copacabana', 'sugarloaf'], label: 'Бразилия' },
  { slug: 'australia', tokens: ['sydney opera house', 'сиднейский оперный театр', 'great barrier reef', 'twelve apostles'], label: 'Австралия' },
  { slug: 'egypt', tokens: ['giza pyramids', 'пирамиды гизы', 'abu simbel', 'абу-симбел', 'karnak temple'], label: 'Египет' },
  { slug: 'uae', tokens: ['burj khalifa', 'бурдж-халифа', 'sheikh zayed mosque'], label: 'ОАЭ' },
  { slug: 'japan', tokens: ['fushimi inari', 'фусими инари', 'kinkaku-ji', 'mount fuji', 'гора фудзи'], label: 'Япония' },
];

function stripHtml(raw = ''): string {
  return String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractUnsplashId(url: string): string | null {
  const match = url.match(/photo-([a-zA-Z0-9-]+?)(?:\?|$|&)/i);
  return match ? match[1] : null;
}

/**
 * Нормализованный отпечаток изображения для точного обнаружения дубликатов
 * с учётом разных параметров качества/размера Unsplash и разных разрешений превью Wikimedia.
 */
export function extractPhotoFingerprint(rawUrl: string): string {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (!url) return '';

  // 1. Unsplash ID (отбрасывает любые query параметры ?w=700, ?w=1280, &auto=format...)
  const unsplashId = extractUnsplashId(url);
  if (unsplashId) {
    return `unsplash:${unsplashId.toLowerCase()}`;
  }

  // 2. Wikimedia Commons (извлекает каноническое имя файла из пути thumb/a/ab/File.ext/1280px-File.ext)
  const wikimediaMatch = url.match(/\/commons\/(?:thumb\/[a-f0-9]\/[a-f0-9]{2}\/|)([^\/?#]+?)(?:\/\d+px-[^\/?#]+|\?|#|$)/i);
  if (wikimediaMatch) {
    try {
      const decoded = decodeURIComponent(wikimediaMatch[1]).replace(/\s+/g, '_').toLowerCase();
      return `wikimedia:${decoded}`;
    } catch {
      return `wikimedia:${wikimediaMatch[1].toLowerCase()}`;
    }
  }

  // 3. Общий URL (хост + нормализованный путь без query params и хэша)
  try {
    const parsed = new URL(url);
    const cleanPath = parsed.pathname.replace(/\/+$/, '').toLowerCase();
    return `url:${parsed.hostname.toLowerCase()}${cleanPath}`;
  } catch {
    return `raw:${url.split('?')[0].toLowerCase()}`;
  }
}

export class PhotoService {
  /**
   * Строгая проверка соответствия фотографии географическому объекту (страна, город, достопримечательность).
   */
  static verifyPhotoGeoMatch(input: GeoVerificationInput): GeoVerificationResult {
    const url = (input.url || '').trim();
    if (!url) {
      return {
        verified: false,
        status: 'missing',
        notes: 'Фотография отсутствует (пустой URL).',
      };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      return {
        verified: false,
        status: 'broken',
        notes: 'Некорректный протокол URL изображения.',
      };
    }

    const decodedUrl = decodeURIComponent(url).toLowerCase();

    // 1. Запрет карт, флагов, гербов, схем, банкнот и локальных en.wikipedia ссылок
    if (
      decodedUrl.endsWith('.svg') ||
      decodedUrl.includes('.svg.png') ||
      decodedUrl.includes('coat_of_arms') ||
      decodedUrl.includes('locator_map') ||
      decodedUrl.includes('_location.') ||
      decodedUrl.includes('.lippu.') ||
      decodedUrl.includes('canales_concentricos') ||
      decodedUrl.includes('/wikipedia/en/')
    ) {
      return {
        verified: false,
        status: 'broken',
        notes: 'Изображение является картой, гербом, схемой или недоступным локальным файлом Wikipedia.',
      };
    }

    // 2. Проверка известных Unsplash ID на принадлежность чужой стране
    const unsplashId = extractUnsplashId(url);
    if (unsplashId && EXCLUSIVE_UNSPLASH_COUNTRY_OWNER[unsplashId]) {
      const owner = EXCLUSIVE_UNSPLASH_COUNTRY_OWNER[unsplashId];
      if (owner.slug !== input.countrySlug) {
        return {
          verified: false,
          status: 'rejected',
          notes: `Отклонено: фотография изображает «${owner.label}» и не относится к стране ${input.countryNameRu}.`,
        };
      }
    }

    // 3. Проверка метаданных САМОГО ИЗОБРАЖЕНИЯ на конфликт с известными объектами чужих стран
    // Важно: input.objectName намеренно НЕ включается в photoMeta, так как это целевой объект, а не метаданные фото!
    const photoMeta = `${decodedUrl} ${input.description || ''} ${input.categories || ''}`.toLowerCase();

    for (const marker of EXCLUSIVE_GEO_MARKERS) {
      if (marker.slug === input.countrySlug) continue;
      const matchedToken = marker.tokens.find((t) => photoMeta.includes(t));
      if (matchedToken) {
        return {
          verified: false,
          status: 'rejected',
          notes: `Отклонено: обнаружен маркер чужой страны «${matchedToken}» (${marker.label}) в объекте страны ${input.countryNameRu}.`,
        };
      }
    }

    // 4. Проверка подтверждения страны/города/объекта
    const countryTokens = [
      input.countryNameRu.toLowerCase(),
      input.countryNameEn.toLowerCase(),
      input.countrySlug.toLowerCase(),
    ].filter(Boolean);

    // Основы названий стран для гибкого поиска (например, 'argentin', 'russi', 'ital', 'franc')
    const countryRootTokens = countryTokens
      .map((t) => (t.length > 5 ? t.slice(0, t.length - 2) : t))
      .filter((t) => t.length >= 4);

    const stopWords = new Set([
      'фотография', 'фото', 'обзор', 'вид', 'центр', 'город', 'улица', 'площадь',
      'собор', 'храм', 'музей', 'парк', 'национальный', 'гора', 'озеро', 'река',
      'главный', 'красивый', 'старый', 'исторический', 'квартал', 'район',
      'city', 'park', 'national', 'museum', 'street', 'square', 'church', 'cathedral', 'view',
    ]);

    const cityTokens = (input.cityName || '')
      .toLowerCase()
      .split(/[\s,()—–-]+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w));

    const objectTokens = (input.objectName || '')
      .toLowerCase()
      .split(/[\s,()—–-]+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    const hasCountryMatch =
      countryTokens.some((t) => photoMeta.includes(t)) ||
      countryRootTokens.some((t) => photoMeta.includes(t));

    const hasCityMatch = cityTokens.some((t) => photoMeta.includes(t));
    const hasObjectMatch = objectTokens.some((t) => photoMeta.includes(t));

    if (hasCountryMatch || hasCityMatch || hasObjectMatch) {
      return {
        verified: true,
        status: 'verified',
        notes: `Подтверждено соответствие: ${input.countryNameRu}${input.cityName ? ` (${input.cityName})` : ''} — «${input.objectName}».`,
      };
    }

    return {
      verified: false,
      status: 'needs_review',
      notes: `Требуется проверка: в метаданных и URL изображения нет подтверждения принадлежности к стране ${input.countryNameRu}.`,
    };
  }

  /**
   * Поиск верифицированной фотографии через Wikimedia Commons API (Приоритет 1).
   */
  static async searchWikimediaCommons(params: {
    objectName: string;
    countrySlug: string;
    countryNameRu: string;
    countryNameEn: string;
    cityName?: string;
    entityType?: PhotoEntityType;
    customQuery?: string;
  }): Promise< {
    url: string;
    thumbUrl: string;
    authorName: string;
    authorUrl: string;
    sourceName: 'Wikimedia Commons';
    sourceUrl: string;
    license: string;
    description: string;
    verified: boolean;
    verificationStatus: PhotoVerificationStatus;
    verificationNotes: string;
  } | null> {
    const queryTerms = params.customQuery
      ? `filetype:bitmap ${params.customQuery}`
      : `filetype:bitmap ${params.objectName} ${params.cityName || ''} ${params.countryNameEn}`.trim();

    const encoded = encodeURIComponent(queryTerms);
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encoded}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata|dimensions|mime&iiurlwidth=1280&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    try {
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'TravelPlannerGeoVerifier/1.0 (https://travelplanner.local)',
        },
        signal: controller.signal,
      });

      if (!res.ok) return null;
      const data: any = await res.json();
      const pages: any[] = Object.values(data?.query?.pages || {});
      pages.sort((a, b) => (a.index || 99) - (b.index || 99));

      for (const page of pages) {
        const ii = page.imageinfo?.[0];
        if (!ii?.thumburl) continue;
        const mime = String(ii.mime || '');
        if (!mime.includes('jpeg') && !mime.includes('png') && !mime.includes('webp')) continue;
        if ((ii.width || 0) < 600 || (ii.height || 0) < 400) continue;

        const lowerTitle = String(page.title || '').toLowerCase();
        if (
          lowerTitle.endsWith('.svg') ||
          lowerTitle.includes('map') ||
          lowerTitle.includes('flag') ||
          lowerTitle.includes('coat_of_arms') ||
          lowerTitle.includes('locator') ||
          lowerTitle.includes('diagram') ||
          lowerTitle.includes('stamp') ||
          lowerTitle.includes('coin')
        ) {
          continue;
        }

        const meta = ii.extmetadata || {};
        const desc = stripHtml(meta.ImageDescription?.value || '');
        const objMeta = stripHtml(meta.ObjectName?.value || '');
        const categories = stripHtml(meta.Categories?.value || '');

        const check = this.verifyPhotoGeoMatch({
          url: ii.thumburl,
          objectName: `${params.objectName} ${page.title} ${objMeta}`,
          description: desc,
          categories,
          countrySlug: params.countrySlug,
          countryNameRu: params.countryNameRu,
          countryNameEn: params.countryNameEn,
          cityName: params.cityName,
          entityType: params.entityType || 'landmark',
          sourceName: 'Wikimedia Commons',
        });

        // Require positive country match in Wikimedia title/description/categories
        const metaCombined = `${page.title} ${desc} ${objMeta} ${categories}`.toLowerCase();
        const confirmsCountry =
          metaCombined.includes(params.countryNameEn.toLowerCase()) ||
          metaCombined.includes(params.countryNameRu.toLowerCase()) ||
          (params.cityName && metaCombined.includes(params.cityName.toLowerCase()));

        if (!check.verified || !confirmsCountry) continue;

        const artist = stripHtml(meta.Artist?.value || '') || 'Wikimedia Commons';
        const license = stripHtml(meta.LicenseShortName?.value || 'CC BY-SA');
        const sourceUrl =
          ii.descriptionurl ||
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`;

        return {
          url: ii.thumburl,
          thumbUrl: ii.thumburl.replace('/1280px-', '/640px-'),
          authorName: artist.length > 50 ? `${artist.slice(0, 47)}...` : artist,
          authorUrl: sourceUrl,
          sourceName: 'Wikimedia Commons',
          sourceUrl,
          license,
          description: desc.slice(0, 220),
          verified: true,
          verificationStatus: 'verified',
          verificationNotes: `Проверено через Wikimedia Commons API (${page.title}).`,
        };
      }

      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Загрузка пользовательских/административных переопределений фотографий из БД (PhotoRecord)
   * и применение строгой гео-верификации ко всем объектам страны.
   */
  static async applyVerifiedPhotosAndOverrides(
    countries: CountryData[]
  ): Promise<CountryData[]> {
    const dbRecords = await fetchAllPhotoRecords();

    const overrideMap = new Map<string, any>();
    for (const rec of dbRecords) {
      overrideMap.set(`${rec.countrySlug}::${rec.targetType}::${rec.targetKey}`, rec);
    }

    // Отслеживаем уникальность отпечатков фото между странами и внутри одной страны
    const usedFingerprints = new Map<
      string,
      {
        countrySlug: string;
        countryNameRu: string;
        objectName: string;
        targetType: string;
        targetKey: string;
      }
    >();

    // Сначала регистрируем ручные переопределения (manualOverride = true), так как они имеют высший приоритет
    for (const rec of dbRecords) {
      if (rec.manualOverride && rec.url) {
        const fp = extractPhotoFingerprint(rec.url);
        if (fp && !usedFingerprints.has(fp)) {
          usedFingerprints.set(fp, {
            countrySlug: rec.countrySlug,
            countryNameRu: rec.countryName,
            objectName: rec.objectName,
            targetType: rec.targetType,
            targetKey: rec.targetKey,
          });
        }
      }
    }

    return countries.map((country) => {
      const sanitizePhoto = (
        photo: CountryPhoto,
        targetType: 'cover' | 'gallery',
        targetKey: string,
        objectName: string,
        cityName: string,
        entityType: PhotoEntityType
      ): CountryPhoto => {
        const override = overrideMap.get(`${country.slug}::${targetType}::${targetKey}`);
        if (override?.manualOverride && override.url) {
          const manualUrl = override.url.trim();
          const fp = extractPhotoFingerprint(manualUrl);
          if (fp && !usedFingerprints.has(fp)) {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: override.objectName || objectName,
              targetType,
              targetKey,
            });
          }
          return {
            ...photo,
            url: manualUrl,
            thumbUrl: override.thumbUrl?.trim() || manualUrl,
            alt: override.objectName || photo.alt,
            objectName: override.objectName || objectName,
            country: country.nameRu,
            city: override.cityName || cityName,
            entityType: (override.entityType as PhotoEntityType) || entityType,
            authorName: override.authorName || photo.authorName,
            authorUrl: override.authorUrl || photo.authorUrl,
            sourceName: (override.sourceName as any) || 'Wikimedia Commons',
            sourceUrl: override.sourceUrl || photo.sourceUrl,
            license: override.license || photo.license,
            verified: Boolean(override.verified),
            verificationStatus: (override.verificationStatus as PhotoVerificationStatus) || 'verified',
            verificationNotes: override.verificationNotes || 'Закреплено пользователем вручную.',
          };
        }

        const candidate: CountryPhoto = override
          ? {
              ...photo,
              url: override.url,
              thumbUrl: override.thumbUrl || override.url,
              alt: override.objectName || photo.alt,
              objectName: override.objectName || objectName,
              country: country.nameRu,
              city: override.cityName || cityName,
              entityType: (override.entityType as PhotoEntityType) || entityType,
              authorName: override.authorName || photo.authorName,
              authorUrl: override.authorUrl || photo.authorUrl,
              sourceName: (override.sourceName as any) || 'Wikimedia Commons',
              sourceUrl: override.sourceUrl || photo.sourceUrl,
              license: override.license || photo.license,
              verified: override.verified,
              verificationStatus: override.verificationStatus as PhotoVerificationStatus,
              verificationNotes: override.verificationNotes,
            }
          : {
              ...photo,
              objectName: photo.objectName || objectName,
              country: country.nameRu,
              city: photo.city || cityName,
              entityType: photo.entityType || entityType,
            };

        const check = this.verifyPhotoGeoMatch({
          url: candidate.url,
          thumbUrl: candidate.thumbUrl,
          objectName: candidate.objectName || candidate.alt,
          description: candidate.alt,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          cityName: candidate.city || country.capital,
          entityType,
          sourceName: candidate.sourceName,
        });

        // Проверка на дубликат (межстрановой или внутри страны)
        const fp = extractPhotoFingerprint(candidate.url);
        let duplicateConflict = false;
        let conflictNotes = '';

        if (fp) {
          const existing = usedFingerprints.get(fp);
          if (existing) {
            const isSelf =
              existing.countrySlug === country.slug &&
              existing.targetType === targetType &&
              existing.targetKey === targetKey;

            if (!isSelf) {
              duplicateConflict = true;
              conflictNotes =
                existing.countrySlug !== country.slug
                  ? `Дубликат: это фото уже привязано к стране «${existing.countryNameRu}» (${existing.objectName}). Заменено на заглушку.`
                  : `Дубликат: это фото уже используется в этой же стране для объекта «${existing.objectName}». Заменено на заглушку.`;
            }
          } else {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: candidate.objectName || objectName,
              targetType,
              targetKey,
            });
          }
        }

        if (
          duplicateConflict ||
          (!check.verified &&
            (check.status === 'rejected' ||
              check.status === 'broken' ||
              check.status === 'missing'))
        ) {
          return {
            ...candidate,
            url: '',
            thumbUrl: '',
            verified: false,
            verificationStatus: duplicateConflict ? 'rejected' : check.status,
            verificationNotes: duplicateConflict ? conflictNotes : check.notes,
          };
        }

        return {
          ...candidate,
          verified: check.verified,
          verificationStatus: check.status,
          verificationNotes: check.notes,
        };
      };

      const coverPhoto = sanitizePhoto(
        country.coverPhoto,
        'cover',
        'main',
        country.coverPhoto.alt || `${country.nameRu} — ${country.capital}`,
        country.capital,
        'country'
      );

      const gallery = country.gallery.map((item, idx) =>
        sanitizePhoto(
          item,
          'gallery',
          String(idx),
          item.alt,
          country.capital,
          item.entityType || 'landmark'
        )
      );

      const popularCities = country.popularCities.map((cityItem, idx) => {
        const override = overrideMap.get(`${country.slug}::city::${idx}`);
        if (override?.manualOverride && override.url) {
          const manualUrl = override.url.trim();
          const fp = extractPhotoFingerprint(manualUrl);
          if (fp && !usedFingerprints.has(fp)) {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: cityItem.name,
              targetType: 'city',
              targetKey: String(idx),
            });
          }
          return {
            ...cityItem,
            photoUrl: manualUrl,
            thumbUrl: override.thumbUrl?.trim() || manualUrl,
            authorName: override.authorName || cityItem.authorName,
            authorUrl: override.authorUrl || cityItem.authorUrl,
            sourceName: override.sourceName || cityItem.sourceName,
            sourceUrl: override.sourceUrl || cityItem.sourceUrl,
            license: override.license || cityItem.license,
            verified: Boolean(override.verified),
            verificationStatus: (override.verificationStatus as any) || 'verified',
          };
        }

        const rawUrl = override ? override.url : cityItem.photoUrl;
        const rawThumb = override ? override.thumbUrl || override.url : cityItem.thumbUrl || cityItem.photoUrl;

        const check = this.verifyPhotoGeoMatch({
          url: rawUrl,
          thumbUrl: rawThumb,
          objectName: `${cityItem.name} (${country.nameRu})`,
          description: cityItem.description,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          cityName: cityItem.name,
          entityType: 'city',
          sourceName: override?.sourceName || cityItem.sourceName,
        });

        const fp = extractPhotoFingerprint(rawUrl);
        let duplicateConflict = false;
        if (fp) {
          const existing = usedFingerprints.get(fp);
          if (existing) {
            const isSelf =
              existing.countrySlug === country.slug &&
              existing.targetType === 'city' &&
              existing.targetKey === String(idx);

            if (!isSelf) {
              duplicateConflict = true;
            }
          } else {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: cityItem.name,
              targetType: 'city',
              targetKey: String(idx),
            });
          }
        }

        if (duplicateConflict || !check.verified) {
          if (duplicateConflict || check.status === 'rejected' || check.status === 'broken' || check.status === 'missing') {
            return {
              ...cityItem,
              photoUrl: '',
              thumbUrl: '',
              verified: false,
              verificationStatus: duplicateConflict ? ('rejected' as const) : check.status,
            };
          }
        }

        return {
          ...cityItem,
          photoUrl: rawUrl,
          thumbUrl: rawThumb,
          authorName: override?.authorName || cityItem.authorName,
          authorUrl: override?.authorUrl || cityItem.authorUrl,
          sourceName: override?.sourceName || cityItem.sourceName,
          sourceUrl: override?.sourceUrl || cityItem.sourceUrl,
          license: override?.license || cityItem.license,
          verified: check.verified,
          verificationStatus: check.status,
        };
      });

      const landmarks = country.landmarks.map((lm, idx) => {
        const override = overrideMap.get(`${country.slug}::landmark::${idx}`);
        if (override?.manualOverride && override.url) {
          const manualUrl = override.url.trim();
          const fp = extractPhotoFingerprint(manualUrl);
          if (fp && !usedFingerprints.has(fp)) {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: lm.name,
              targetType: 'landmark',
              targetKey: String(idx),
            });
          }
          return {
            ...lm,
            photoUrl: manualUrl,
            thumbUrl: override.thumbUrl?.trim() || manualUrl,
            authorName: override.authorName || lm.authorName,
            authorUrl: override.authorUrl || lm.authorUrl,
            sourceName: override.sourceName || lm.sourceName,
            sourceUrl: override.sourceUrl || lm.sourceUrl,
            license: override.license || lm.license,
            verified: Boolean(override.verified),
            verificationStatus: (override.verificationStatus as any) || 'verified',
          };
        }

        const rawUrl = override ? override.url : lm.photoUrl || '';
        const rawThumb = override ? override.thumbUrl || override.url : lm.thumbUrl || lm.photoUrl || '';

        const check = this.verifyPhotoGeoMatch({
          url: rawUrl,
          thumbUrl: rawThumb,
          objectName: `${lm.name} (${lm.city}, ${country.nameRu})`,
          description: lm.description,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          cityName: lm.city,
          entityType: 'landmark',
          sourceName: override?.sourceName || lm.sourceName,
        });

        const fp = extractPhotoFingerprint(rawUrl);
        let duplicateConflict = false;
        if (fp) {
          const existing = usedFingerprints.get(fp);
          if (existing) {
            const isSelf =
              existing.countrySlug === country.slug &&
              existing.targetType === 'landmark' &&
              existing.targetKey === String(idx);

            if (!isSelf) {
              duplicateConflict = true;
            }
          } else {
            usedFingerprints.set(fp, {
              countrySlug: country.slug,
              countryNameRu: country.nameRu,
              objectName: lm.name,
              targetType: 'landmark',
              targetKey: String(idx),
            });
          }
        }

        if (duplicateConflict || !check.verified) {
          if (duplicateConflict || check.status === 'rejected' || check.status === 'broken' || check.status === 'missing') {
            return {
              ...lm,
              photoUrl: '',
              thumbUrl: '',
              verified: false,
              verificationStatus: duplicateConflict ? ('rejected' as const) : check.status,
            };
          }
        }

        return {
          ...lm,
          photoUrl: rawUrl,
          thumbUrl: rawThumb,
          authorName: override?.authorName || lm.authorName,
          authorUrl: override?.authorUrl || lm.authorUrl,
          sourceName: override?.sourceName || lm.sourceName,
          sourceUrl: override?.sourceUrl || lm.sourceUrl,
          license: override?.license || lm.license,
          verified: check.verified,
          verificationStatus: check.status,
        };
      });

      return {
        ...country,
        coverPhoto,
        gallery,
        popularCities,
        landmarks,
      };
    });
  }

  /**
   * Полный отчёт административной диагностики всех фотографий стран, галерей, городов и достопримечательностей.
   */
  static async getDiagnosticsReport(filters?: {
    countrySlug?: string;
    status?: string;
    targetType?: string;
    search?: string;
  }): Promise<PhotoDiagnosticsReportDto> {
    const dbRecords = await fetchAllPhotoRecords();

    const overrideMap = new Map<string, any>();
    for (const rec of dbRecords) {
      overrideMap.set(`${rec.countrySlug}::${rec.targetType}::${rec.targetKey}`, rec);
    }

    const enrichedCatalog = await this.applyVerifiedPhotosAndOverrides(FULL_COUNTRIES_CATALOG);
    const allItems: PhotoDiagnosticItemDto[] = [];
    const nowIso = new Date().toISOString();

    for (const country of enrichedCatalog) {
      // 1. Cover photo
      const coverOverride = overrideMap.get(`${country.slug}::cover::main`);
      allItems.push({
        id: `${country.slug}::cover::main`,
        countrySlug: country.slug,
        countryNameRu: country.nameRu,
        countryNameEn: country.nameEn,
        flagEmoji: country.flagEmoji,
        targetType: 'cover',
        targetKey: 'main',
        sectionLabel: 'Главная обложка страны',
        objectName: country.coverPhoto.objectName || country.coverPhoto.alt || country.nameRu,
        cityName: country.capital,
        entityType: 'country',
        url: country.coverPhoto.url,
        thumbUrl: country.coverPhoto.thumbUrl || country.coverPhoto.url,
        authorName: country.coverPhoto.authorName || 'Wikimedia Commons',
        sourceName: country.coverPhoto.sourceName || 'Wikimedia',
        sourceUrl: country.coverPhoto.sourceUrl || '',
        license: country.coverPhoto.license || 'CC BY-SA 4.0',
        verified: Boolean(country.coverPhoto.verified),
        verificationStatus: country.coverPhoto.verificationStatus || 'verified',
        verificationNotes:
          country.coverPhoto.verificationNotes ||
          `Подтверждено соответствие стране ${country.nameRu}.`,
        hasDbOverride: Boolean(coverOverride),
        manualOverride: Boolean(coverOverride?.manualOverride),
        lastCheckedAt: coverOverride?.lastCheckedAt
          ? new Date(coverOverride.lastCheckedAt).toISOString()
          : nowIso,
      });

      // 2. Gallery photos
      country.gallery.forEach((gPhoto, idx) => {
        const gOverride = overrideMap.get(`${country.slug}::gallery::${idx}`);
        allItems.push({
          id: `${country.slug}::gallery::${idx}`,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          flagEmoji: country.flagEmoji,
          targetType: 'gallery',
          targetKey: String(idx),
          sectionLabel: `Галерея страны (${gPhoto.category || 'Фото'})`,
          objectName: gPhoto.objectName || gPhoto.alt,
          cityName: gPhoto.city || country.capital,
          entityType: gPhoto.entityType || 'landmark',
          url: gPhoto.url,
          thumbUrl: gPhoto.thumbUrl || gPhoto.url,
          authorName: gPhoto.authorName || 'Wikimedia Commons',
          sourceName: gPhoto.sourceName || 'Wikimedia',
          sourceUrl: gPhoto.sourceUrl || '',
          license: gPhoto.license || 'CC BY-SA 4.0',
          verified: Boolean(gPhoto.verified),
          verificationStatus: gPhoto.verificationStatus || 'verified',
          verificationNotes:
            gPhoto.verificationNotes ||
            `Подтверждено соответствие стране ${country.nameRu}.`,
          hasDbOverride: Boolean(gOverride),
          manualOverride: Boolean(gOverride?.manualOverride),
          lastCheckedAt: gOverride?.lastCheckedAt
            ? new Date(gOverride.lastCheckedAt).toISOString()
            : nowIso,
        });
      });

      // 3. Popular cities
      country.popularCities.forEach((cityItem, idx) => {
        const cOverride = overrideMap.get(`${country.slug}::city::${idx}`);
        allItems.push({
          id: `${country.slug}::city::${idx}`,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          flagEmoji: country.flagEmoji,
          targetType: 'city',
          targetKey: String(idx),
          sectionLabel: 'Популярные города',
          objectName: cityItem.name,
          cityName: cityItem.name,
          entityType: 'city',
          url: cityItem.photoUrl,
          thumbUrl: cityItem.thumbUrl || cityItem.photoUrl,
          authorName: cityItem.authorName || 'Wikimedia Commons',
          sourceName: cityItem.sourceName || 'Wikimedia Commons',
          sourceUrl: cityItem.sourceUrl || '',
          license: cityItem.license || 'CC BY-SA 4.0',
          verified: Boolean(cityItem.verified),
          verificationStatus: cityItem.verificationStatus || 'verified',
          verificationNotes:
            cOverride?.verificationNotes ||
            `Город ${cityItem.name} верифицирован для страны ${country.nameRu}.`,
          hasDbOverride: Boolean(cOverride),
          manualOverride: Boolean(cOverride?.manualOverride),
          lastCheckedAt: cOverride?.lastCheckedAt
            ? new Date(cOverride.lastCheckedAt).toISOString()
            : nowIso,
        });
      });

      // 4. Landmarks (Что посетить)
      country.landmarks.forEach((lm, idx) => {
        const lOverride = overrideMap.get(`${country.slug}::landmark::${idx}`);
        allItems.push({
          id: `${country.slug}::landmark::${idx}`,
          countrySlug: country.slug,
          countryNameRu: country.nameRu,
          countryNameEn: country.nameEn,
          flagEmoji: country.flagEmoji,
          targetType: 'landmark',
          targetKey: String(idx),
          sectionLabel: 'Что посетить (достопримечательности)',
          objectName: lm.name,
          cityName: lm.city,
          entityType: 'landmark',
          url: lm.photoUrl || '',
          thumbUrl: lm.thumbUrl || lm.photoUrl || '',
          authorName: lm.authorName || 'Wikimedia Commons',
          sourceName: lm.sourceName || 'Wikimedia Commons',
          sourceUrl: lm.sourceUrl || '',
          license: lm.license || 'CC BY-SA 4.0',
          verified: Boolean(lm.verified),
          verificationStatus: lm.verificationStatus || (lm.photoUrl ? 'verified' : 'missing'),
          verificationNotes:
            lOverride?.verificationNotes ||
            (lm.photoUrl
              ? `Достопримечательность «${lm.name}» (${lm.city}) подтверждена для страны ${country.nameRu}.`
              : 'Фотография отсутствует.'),
          hasDbOverride: Boolean(lOverride),
          manualOverride: Boolean(lOverride?.manualOverride),
          lastCheckedAt: lOverride?.lastCheckedAt
            ? new Date(lOverride.lastCheckedAt).toISOString()
            : nowIso,
        });
      });
    }

    // Проверяем все элементы на дубликаты (межстрановые и внутристрановые)
    const usedFingerprintsInReport = new Map<string, PhotoDiagnosticItemDto>();
    let duplicateCount = 0;

    for (const item of allItems) {
      if (!item.url) continue;
      const fp = extractPhotoFingerprint(item.url);
      if (!fp) continue;

      const existing = usedFingerprintsInReport.get(fp);
      if (existing) {
        item.isDuplicate = true;
        item.duplicateOf = `${existing.countryNameRu}: ${existing.objectName} (${existing.sectionLabel})`;
        item.verificationStatus = 'rejected';
        if (existing.countrySlug !== item.countrySlug) {
          item.verificationNotes = `Межстрановой дубликат: это фото уже используется для страны «${existing.countryNameRu}» (${existing.objectName}). Запрещено использовать одинаковые фото для разных стран.`;
        } else {
          item.verificationNotes = `Внутристрановой дубликат: это фото уже используется в этой же стране для объекта «${existing.objectName}» (${existing.sectionLabel}). Повторное использование запрещено.`;
        }
        duplicateCount++;
      } else {
        usedFingerprintsInReport.set(fp, item);
      }
    }

    const summary = {
      totalImages: allItems.length,
      verifiedCount: allItems.filter((i) => i.verificationStatus === 'verified' && Boolean(i.url) && !i.isDuplicate).length,
      missingCount: allItems.filter((i) => i.verificationStatus === 'missing' || !i.url).length,
      errorCount: allItems.filter((i) => (i.verificationStatus === 'broken' || i.verificationStatus === 'rejected') && !i.isDuplicate).length,
      needsReviewCount: allItems.filter((i) => i.verificationStatus === 'needs_review').length,
      duplicateCount,
      dbOverridesCount: dbRecords.length,
      manualOverridesCount: allItems.filter((i) => i.manualOverride).length,
      bySection: {
        cover: allItems.filter((i) => i.targetType === 'cover').length,
        gallery: allItems.filter((i) => i.targetType === 'gallery').length,
        city: allItems.filter((i) => i.targetType === 'city').length,
        landmark: allItems.filter((i) => i.targetType === 'landmark').length,
      },
    };

    let filtered = allItems;
    if (filters?.countrySlug && filters.countrySlug !== 'all') {
      filtered = filtered.filter((i) => i.countrySlug === filters.countrySlug);
    }
    if (filters?.targetType && filters.targetType !== 'all') {
      filtered = filtered.filter((i) => i.targetType === filters.targetType);
    }
    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'duplicate') {
        filtered = filtered.filter((i) => i.isDuplicate);
      } else {
        filtered = filtered.filter((i) => i.verificationStatus === filters.status);
      }
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.countryNameRu.toLowerCase().includes(q) ||
          i.countryNameEn.toLowerCase().includes(q) ||
          i.objectName.toLowerCase().includes(q) ||
          i.cityName.toLowerCase().includes(q)
      );
    }

    return {
      summary,
      items: filtered,
      generatedAt: nowIso,
    };
  }

  /**
   * Ручная замена фотографии с обязательной предварительной гео-проверкой перед сохранением в БД.
   */
  static async replacePhoto(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
    url: string;
    thumbUrl?: string;
    objectName?: string;
    cityName?: string;
    authorName?: string;
    sourceName?: string;
    sourceUrl?: string;
    license?: string;
  }) {
    const country = FULL_COUNTRIES_CATALOG.find((c) => c.slug === payload.countrySlug);
    if (!country) {
      throw new Error(`Страна "${payload.countrySlug}" не найдена в каталоге.`);
    }

    const cleanUrl = (payload.url || '').trim();
    if (!cleanUrl) {
      throw new Error('URL фотографии не может быть пустым.');
    }

    const objectName = payload.objectName?.trim() || `${country.nameRu} — ${payload.targetType}`;
    const cityName = payload.cityName?.trim() || country.capital;

    const check = this.verifyPhotoGeoMatch({
      url: cleanUrl,
      thumbUrl: payload.thumbUrl || cleanUrl,
      objectName,
      description: '',
      countrySlug: country.slug,
      countryNameRu: country.nameRu,
      countryNameEn: country.nameEn,
      cityName,
      entityType: payload.targetType === 'city' ? 'city' : payload.targetType === 'cover' ? 'country' : 'landmark',
      sourceName: payload.sourceName || 'Wikimedia Commons',
    });

    if (check.status === 'rejected' || check.status === 'broken') {
      throw new Error(check.notes);
    }

    // Проверка на использование того же фото для другой страны (межстрановой дубликат)
    const fp = extractPhotoFingerprint(cleanUrl);
    if (fp) {
      const allRecords = await fetchAllPhotoRecords();
      const foreignRecord = allRecords.find(
        (r) => r.countrySlug !== country.slug && extractPhotoFingerprint(r.url) === fp
      );
      if (foreignRecord) {
        throw new Error(
          `Дубликат: это фото уже привязано к другой стране (${foreignRecord.countryName}). Запрещено использовать одинаковые изображения для разных стран.`
        );
      }
    }

    const isVerified = check.status === 'verified';
    const status = isVerified ? 'verified' : 'needs_review';
    const notes = isVerified
      ? `Закреплено вручную: ${check.notes}`
      : `Закреплено вручную (требует подтверждения): ${check.notes}`;

    const record = await upsertPhotoRecord({
      countrySlug: country.slug,
      targetType: payload.targetType,
      targetKey: String(payload.targetKey),
      objectName,
      countryName: country.nameRu,
      cityName,
      entityType:
        payload.targetType === 'city'
          ? 'city'
          : payload.targetType === 'cover'
          ? 'country'
          : 'landmark',
      url: cleanUrl,
      thumbUrl: payload.thumbUrl?.trim() || cleanUrl,
      authorName: payload.authorName?.trim() || 'Wikimedia Commons',
      sourceName: payload.sourceName?.trim() || 'Wikimedia Commons',
      sourceUrl: payload.sourceUrl?.trim() || cleanUrl,
      license: payload.license?.trim() || 'CC BY-SA 4.0',
      verified: isVerified,
      manualOverride: true,
      verificationStatus: status,
      verificationNotes: notes,
    });

    return record;
  }

  /**
   * Снятие ручного закрепления фотографии и возврат к проверенному стандартному изображению.
   */
  static async resetPhotoOverride(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
  }) {
    const country = FULL_COUNTRIES_CATALOG.find((c) => c.slug === payload.countrySlug);
    if (!country) {
      throw new Error(`Страна "${payload.countrySlug}" не найдена в каталоге.`);
    }

    await deletePhotoRecord(country.slug, payload.targetType, String(payload.targetKey));
    return {
      countrySlug: country.slug,
      targetType: payload.targetType,
      targetKey: String(payload.targetKey),
      reset: true,
    };
  }

  /**
   * Повторная проверка соответствия и доступности уже сохранённого изображения.
   */
  static async reverifyPhoto(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
  }) {
    const report = await this.getDiagnosticsReport({ countrySlug: payload.countrySlug });
    const item = report.items.find(
      (i) =>
        i.countrySlug === payload.countrySlug &&
        i.targetType === payload.targetType &&
        i.targetKey === String(payload.targetKey)
    );

    if (!item) {
      throw new Error('Запись изображения не найдена.');
    }

    const check = this.verifyPhotoGeoMatch({
      url: item.url,
      thumbUrl: item.thumbUrl,
      objectName: item.objectName,
      description: item.sourceName === 'Wikimedia' || item.sourceName === 'Wikimedia Commons' ? item.verificationNotes : '',
      countrySlug: item.countrySlug,
      countryNameRu: item.countryNameRu,
      countryNameEn: item.countryNameEn,
      cityName: item.cityName,
      entityType: item.entityType,
      sourceName: item.sourceName,
    });

    // Дополнительно проверяем HTTP-доступность, если сеть доступна
    let reachabilityNote = '';
    if (item.url && (check.verified || item.manualOverride)) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const headRes = await fetch(item.url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'TravelPlannerGeoVerifier/1.0' },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (headRes.status === 404 || headRes.status === 410) {
          check.verified = false;
          check.status = 'broken';
          reachabilityNote = ` (HTTP ${headRes.status}: файл недоступен)`;
        } else {
          reachabilityNote = ' (URL проверен и доступен)';
        }
      } catch {
        // В изолированной среде без внешнего интернета полагаемся на структурную и гео-проверку
      }
    }

    const isManual = Boolean(item.manualOverride);
    const finalVerified = check.verified;
    const finalStatus = check.status;
    const manualPrefix = isManual ? 'Ручное закрепление: ' : '';

    const record = await upsertPhotoRecord({
      countrySlug: item.countrySlug,
      targetType: item.targetType,
      targetKey: item.targetKey,
      objectName: item.objectName,
      countryName: item.countryNameRu,
      cityName: item.cityName,
      entityType: item.entityType,
      url: item.url,
      thumbUrl: item.thumbUrl,
      authorName: item.authorName,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      license: item.license,
      verified: finalVerified,
      manualOverride: isManual,
      verificationStatus: finalStatus,
      verificationNotes: `${manualPrefix}${check.notes}${reachabilityNote}`,
    });

    return record;
  }

  /**
   * Автоматический подбор проверенной фотографии из Wikimedia Commons API для объекта.
   */
  static async autoSearchAndSaveWikimediaPhoto(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
    customQuery?: string;
  }) {
    const report = await this.getDiagnosticsReport({ countrySlug: payload.countrySlug });
    const item = report.items.find(
      (i) =>
        i.countrySlug === payload.countrySlug &&
        i.targetType === payload.targetType &&
        i.targetKey === String(payload.targetKey)
    );

    if (!item) {
      throw new Error('Целевой объект не найден.');
    }

    if (item.manualOverride) {
      throw new Error(
        `Для объекта «${item.objectName}» установлено ручное закрепление фотографии. Автоматический поиск заблокирован во избежание перезаписи. Сначала снимите ручное закрепление.`
      );
    }

    const found = await this.searchWikimediaCommons({
      objectName: item.objectName,
      countrySlug: item.countrySlug,
      countryNameRu: item.countryNameRu,
      countryNameEn: item.countryNameEn,
      cityName: item.cityName,
      entityType: item.entityType,
      customQuery: payload.customQuery,
    });

    if (!found) {
      throw new Error(
        `Wikimedia Commons не вернул подтверждённого результата для «${item.objectName}» (${item.countryNameRu}). Случайные фотографии не подставляются.`
      );
    }

    return this.replacePhoto({
      countrySlug: item.countrySlug,
      targetType: item.targetType,
      targetKey: item.targetKey,
      url: found.url,
      thumbUrl: found.thumbUrl,
      objectName: item.objectName,
      cityName: item.cityName,
      authorName: found.authorName,
      sourceName: found.sourceName,
      sourceUrl: found.sourceUrl,
      license: found.license,
    });
  }
}
