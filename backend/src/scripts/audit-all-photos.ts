import { FULL_COUNTRIES_CATALOG } from '../data/world-atlas-lookup.data';
import { prisma } from '../lib/prisma';

interface PhotoItem {
  countrySlug: string;
  countryName: string;
  targetType: string;
  targetKey: string;
  objectName: string;
  url: string;
  thumbUrl: string;
  sourceName: string;
  isDbOverride?: boolean;
}

function extractFingerprint(rawUrl: string): { type: string; id: string } {
  if (!rawUrl) return { type: 'empty', id: '' };
  const url = rawUrl.trim();

  // Unsplash ID
  const unsplashMatch = url.match(/photo-([a-zA-Z0-9-]+?)(?:\?|$)/);
  if (unsplashMatch) {
    return { type: 'unsplash', id: unsplashMatch[1] };
  }

  // Wikimedia Commons filename
  const wikimediaMatch = url.match(/\/commons\/(?:thumb\/[a-f0-9]\/[a-f0-9]{2}\/|)([^\/]+?)(?:\/\d+px-[^\/]+|\?|$)/i);
  if (wikimediaMatch) {
    try {
      const decoded = decodeURIComponent(wikimediaMatch[1]);
      return { type: 'wikimedia', id: decoded.toLowerCase() };
    } catch {
      return { type: 'wikimedia', id: wikimediaMatch[1].toLowerCase() };
    }
  }

  // General URL
  try {
    const parsed = new URL(url);
    return { type: 'url', id: `${parsed.origin}${parsed.pathname.toLowerCase()}` };
  } catch {
    return { type: 'raw', id: url.split('?')[0].toLowerCase() };
  }
}

async function auditAllPhotos() {
  console.log('=== АУДИТ ВСЕХ ФОТОГРАФИЙ В КАТАЛОГЕ И БАЗЕ ДАННЫХ POSTGRESQL ===\n');

  // Читаем базу данных
  let dbRecords: any[] = [];
  try {
    dbRecords = await prisma.photoRecord.findMany();
  } catch (err) {
    console.warn('Не удалось прочитать PhotoRecord:', err);
  }

  console.log(`Записей в PostgreSQL (PhotoRecord): ${dbRecords.length}`);

  const allPhotos: PhotoItem[] = [];

  // Собираем все фото из каталога
  for (const country of FULL_COUNTRIES_CATALOG) {
    if (country.coverPhoto?.url) {
      allPhotos.push({
        countrySlug: country.slug,
        countryName: country.nameRu,
        targetType: 'cover',
        targetKey: 'main',
        objectName: country.coverPhoto.alt || country.nameRu,
        url: country.coverPhoto.url,
        thumbUrl: country.coverPhoto.thumbUrl || country.coverPhoto.url,
        sourceName: country.coverPhoto.sourceName || 'Unsplash',
      });
    }

    (country.gallery || []).forEach((g, idx) => {
      if (g.url) {
        allPhotos.push({
          countrySlug: country.slug,
          countryName: country.nameRu,
          targetType: 'gallery',
          targetKey: String(idx),
          objectName: g.alt || `Галерея ${idx}`,
          url: g.url,
          thumbUrl: g.thumbUrl || g.url,
          sourceName: g.sourceName || 'Unsplash',
        });
      }
    });

    (country.popularCities || []).forEach((ci, idx) => {
      if (ci.photoUrl) {
        allPhotos.push({
          countrySlug: country.slug,
          countryName: country.nameRu,
          targetType: 'city',
          targetKey: String(idx),
          objectName: ci.name,
          url: ci.photoUrl,
          thumbUrl: ci.thumbUrl || ci.photoUrl,
          sourceName: ci.sourceName || 'Unsplash',
        });
      }
    });

    (country.landmarks || []).forEach((lm, idx) => {
      if (lm.photoUrl) {
        allPhotos.push({
          countrySlug: country.slug,
          countryName: country.nameRu,
          targetType: 'landmark',
          targetKey: String(idx),
          objectName: lm.name,
          url: lm.photoUrl,
          thumbUrl: lm.thumbUrl || lm.photoUrl,
          sourceName: lm.sourceName || 'Wikimedia',
        });
      }
    });
  }

  console.log(`Всего фотографий в каталоге: ${allPhotos.length}\n`);

  // 1. Поиск дубликатов (одинаковый fingerprint у разных объектов)
  const fingerprintMap = new Map<string, PhotoItem[]>();
  for (const p of allPhotos) {
    const fp = extractFingerprint(p.url);
    if (!fp.id) continue;
    const key = `${fp.type}::${fp.id}`;
    if (!fingerprintMap.has(key)) {
      fingerprintMap.set(key, []);
    }
    fingerprintMap.get(key)!.push(p);
  }

  const duplicates: Array<{ key: string; items: PhotoItem[] }> = [];
  for (const [key, items] of fingerprintMap.entries()) {
    if (items.length > 1) {
      duplicates.push({ key, items });
    }
  }

  console.log(`========================================`);
  console.log(`1. ОБНАРУЖЕНО ДУБЛИКАТОВ ИЗОБРАЖЕНИЙ: ${duplicates.length}`);
  console.log(`========================================`);
  for (const dup of duplicates) {
    console.log(`\n❌ Идентификатор файла: ${dup.key} (используется ${dup.items.length} раз):`);
    for (const item of dup.items) {
      console.log(`   - [${item.countryName} (${item.countrySlug})] ${item.targetType}:${item.targetKey} — «${item.objectName}»`);
    }
  }

  // 2. Поиск известных чужих фото (например, немецкий замок 1518709268805-4e9042af9f23)
  console.log(`\n========================================`);
  console.log(`2. ПРОВЕРКА ИЗВЕСТНЫХ ЧУЖИХ/НЕМЕЦКИХ ФОТО:`);
  console.log(`========================================`);
  const KNOWN_MISASSIGNMENTS: Record<string, { trueCountry: string; truePlace: string }> = {
    '1518709268805-4e9042af9f23': { trueCountry: 'germany', truePlace: 'Замок Эльц (Германия)' },
    '1589909202802-8f4aadce1849': { trueCountry: 'argentina', truePlace: 'Буэнос-Айрес, проспект 9 Июля (Аргентина)' },
    '1520106212299-d99c443e4568': { trueCountry: 'russia', truePlace: 'Красная площадь, Москва' },
    '1583422409516-2895a77efded': { trueCountry: 'spain', truePlace: 'Барселона, Парк Гуэль' },
  };

  for (const p of allPhotos) {
    const fp = extractFingerprint(p.url);
    if (fp.type === 'unsplash' && KNOWN_MISASSIGNMENTS[fp.id]) {
      const known = KNOWN_MISASSIGNMENTS[fp.id];
      if (known.trueCountry !== p.countrySlug) {
        console.log(`❌ ГЕО-НЕСООТВЕТСТВИЕ: [${p.countryName}] ${p.targetType}:${p.targetKey} «${p.objectName}» использует фото «${known.truePlace}» (${fp.id})!`);
      }
    }
  }

  // 3. Анализ записей в PostgreSQL
  console.log(`\n========================================`);
  console.log(`3. АНАЛИЗ ЗАПИСЕЙ В POSTGRESQL (PhotoRecord):`);
  console.log(`========================================`);
  for (const r of dbRecords) {
    const urlFp = extractFingerprint(r.url);
    const thumbFp = extractFingerprint(r.thumbUrl);
    const isMismatchedThumb = urlFp.id !== thumbFp.id && Boolean(thumbFp.id);
    console.log(`- [${r.countrySlug}] ${r.targetType}:${r.targetKey} «${r.objectName}»`);
    console.log(`  manualOverride: ${r.manualOverride}, status: ${r.verificationStatus}`);
    console.log(`  URL: ${r.url.slice(0, 70)}...`);
    console.log(`  Thumb: ${r.thumbUrl.slice(0, 70)}...`);
    if (isMismatchedThumb) {
      console.log(`  ⚠️ ВНИМАНИЕ: URL и ThumbUrl ведут на РАЗНЫЕ файлы! URL=${urlFp.id}, Thumb=${thumbFp.id}`);
    }
    if (urlFp.id === '1518709268805-4e9042af9f23' || thumbFp.id === '1518709268805-4e9042af9f23') {
      console.log(`  ❌ ОШИБКА: Запись содержит немецкий замок Burg Eltz (1518709268805-4e9042af9f23)!`);
    }
  }

  await prisma.$disconnect();
}

auditAllPhotos().catch(console.error);
