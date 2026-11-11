import { feature } from 'topojson-client';
import worldAtlasTopology from 'world-atlas/countries-110m.json';
import type { CountryData, ContinentName } from '@/types';
import { lookupWorldCountryMeta } from '@/data/world-countries-meta';

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

export function getWorldGeoFeatures(catalogCountries: CountryData[]): GlobePolygonFeature[] {
  if (!cachedGeoFeatures) {
    const topology = worldAtlasTopology as any;
    const geojson = feature(topology, topology.objects.countries) as any;
    const rawFeatures: any[] = geojson.features || [];

    cachedGeoFeatures = rawFeatures
      .filter((f) => f.id !== '010' && f.properties?.name !== 'Antarctica') // Skip Antarctica for cleaner travel globe
      .map((f) => {
        const isoNum = String(f.id || '').padStart(3, '0');
        const meta = lookupWorldCountryMeta(isoNum, f.properties?.name);
        return {
          type: 'Feature' as const,
          id: isoNum !== '000' && isoNum !== 'undefined' ? isoNum : (f.properties?.name || 'country'),
          geometry: f.geometry,
          properties: {
            name: f.properties?.name || 'Country',
            isoNumeric: isoNum,
            nameRu: meta?.nameRu || f.properties?.name || 'Страна',
            flagEmoji: meta?.flag || '🌍',
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
  const nameEn = feat.properties.name;
  const meta = lookupWorldCountryMeta(isoNum, nameEn);
  const centroid = computeFeatureCentroid(feat);
  const nameRu = meta?.nameRu || feat.properties.nameRu || nameEn;
  const capital = meta?.capital || 'Столичный регион';
  const continent = meta?.continent || 'Европа';

  const fallbackPhoto = {
    url: '',
    thumbUrl: '',
    alt: `${nameRu} — ${capital}`,
    category: 'Обложка' as const,
    objectName: nameRu,
    country: nameRu,
    city: capital,
    entityType: 'country' as const,
    authorName: '',
    authorUrl: '',
    sourceName: 'Local' as const,
    sourceUrl: '',
    verified: false,
    verificationStatus: 'missing' as const,
  };

  return {
    slug: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    isoNumeric: isoNum,
    isoAlpha2: 'UN',
    nameRu,
    nameEn,
    flagEmoji: meta?.flag || feat.properties.flagEmoji || '🌍',
    flagUrl: '',
    capital,
    continent,
    population: 0,
    area: 0,
    languages: meta?.languages || ['Официальный государственный язык'],
    currency: meta?.currency || 'Национальная валюта',
    defaultTripCurrency: meta?.defaultTripCurrency || (continent === 'Европа' ? 'EUR' : 'USD'),
    coordinates: centroid,
    shortDescription: `Увлекательное направление для путешествия в регионе ${continent} со столицей в городе ${capital}.`,
    description: `${nameRu} (${nameEn}) — государство в регионе ${continent}. Откройте для себя культуру, природные ландшафты и атмосферу столицы (${capital}), спланировав маршрут в TravelPlanner.`,
    coverPhoto: fallbackPhoto,
    gallery: [fallbackPhoto],
    popularCities: [
      {
        name: capital,
        description: `Главный культурный и деловой центр страны (${nameRu}).`,
        photoUrl: '',
        verified: false,
      },
    ],
    landmarks: [],
    featured: false,
  };
}
