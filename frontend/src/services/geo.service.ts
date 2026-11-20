import { feature, mesh } from 'topojson-client';
import worldAtlasTopology from 'world-atlas/countries-110m.json';
import type { CountryData } from '@/types';
import { lookupWorldCountryMeta } from '@/data/world-countries-meta';
import {
  buildFlagCdnUrl,
  flagEmojiToIsoAlpha2,
  normalizeIsoAlpha2,
} from '@/utils/countryFlag';

export interface GlobePolygonFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    isoNumeric: string;
    isoAlpha2: string;
    nameRu: string;
    flagEmoji: string;
    flagUrl: string;
    slug?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  bbox?: number[];
}

// Module-level singleton caches so TopoJSON is parsed only once per session
let cachedGeoFeatures: GlobePolygonFeature[] | null = null;
let cachedBorderLines: [number, number][][] | null = null;

function isAntarcticaGeometry(g: any): boolean {
  return String(g?.id || '') === '010' || g?.properties?.name === 'Antarctica';
}

export function getWorldGeoFeatures(catalogCountries: CountryData[]): GlobePolygonFeature[] {
  if (!cachedGeoFeatures) {
    const topology = worldAtlasTopology as any;
    const geojson = feature(topology, topology.objects.countries) as any;
    const rawFeatures: any[] = geojson.features || [];

    cachedGeoFeatures = rawFeatures
      .filter((f) => !isAntarcticaGeometry(f))
      .map((f) => {
        const isoNum = String(f.id || '').padStart(3, '0');
        const meta = lookupWorldCountryMeta(isoNum, f.properties?.name);
        const flagEmoji = meta?.flag || '🌍';
        const isoAlpha2 = flagEmojiToIsoAlpha2(flagEmoji) || '';
        return {
          type: 'Feature' as const,
          id:
            isoNum !== '000' && isoNum !== 'undefined'
              ? isoNum
              : f.properties?.name || 'country',
          geometry: f.geometry,
          properties: {
            name: f.properties?.name || 'Country',
            isoNumeric: isoNum,
            isoAlpha2,
            nameRu: meta?.nameRu || f.properties?.name || 'Страна',
            flagEmoji,
            flagUrl: isoAlpha2 ? buildFlagCdnUrl(isoAlpha2, 40) : '',
          },
        };
      });
  }

  // Enrich cached features with catalog slugs, ISO codes, flags, and Russian names
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
      const isoAlpha2 =
        normalizeIsoAlpha2(match.isoAlpha2) ||
        feat.properties.isoAlpha2 ||
        flagEmojiToIsoAlpha2(match.flagEmoji) ||
        '';
      return {
        ...feat,
        properties: {
          ...feat.properties,
          isoAlpha2,
          nameRu: match.nameRu,
          flagEmoji: match.flagEmoji,
          flagUrl: match.flagUrl || (isoAlpha2 ? buildFlagCdnUrl(isoAlpha2, 40) : ''),
          slug: match.slug,
        },
      };
    }
    return feat;
  });
}

/**
 * Returns deduplicated coastline & international border polylines via TopoJSON mesh()
 * (excluding Antarctica) so shared borders between adjacent countries are never drawn twice.
 */
export function getWorldBorderLines(): [number, number][][] {
  if (cachedBorderLines) return cachedBorderLines;

  const topology = worldAtlasTopology as any;
  const filteredCollection = {
    type: 'GeometryCollection',
    geometries: (topology.objects.countries.geometries || []).filter(
      (g: any) => !isAntarcticaGeometry(g)
    ),
  };

  const borderMultiLine = mesh(topology, filteredCollection as any);
  cachedBorderLines = (borderMultiLine?.coordinates as [number, number][][]) || [];
  return cachedBorderLines;
}

function unwrapRingForCentroid(ring: [number, number][]): [number, number][] {
  if (!ring || ring.length === 0) return [];
  const out: [number, number][] = [[ring[0][0], ring[0][1]]];
  let offset = 0;
  for (let i = 1; i < ring.length; i++) {
    let lng = ring[i][0] + offset;
    const prevLng = out[i - 1][0];
    if (lng - prevLng > 180) {
      offset -= 360;
      lng -= 360;
    } else if (lng - prevLng < -180) {
      offset += 360;
      lng += 360;
    }
    out.push([lng, ring[i][1]]);
  }
  return out;
}

export function computeFeatureCentroid(feat: GlobePolygonFeature): { lat: number; lng: number } {
  try {
    const geom = feat.geometry;
    if (!geom || !geom.coordinates) return { lat: 20, lng: 0 };

    const polygons: [number, number][][][] =
      geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

    let bestArea = -1;
    let bestLat = 20;
    let bestLng = 0;

    for (const poly of polygons) {
      const outerRaw = poly?.[0];
      if (!Array.isArray(outerRaw) || outerRaw.length < 3) continue;

      const ring = unwrapRingForCentroid(outerRaw);
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;
      let sumLng = 0;
      let sumLat = 0;

      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        sumLng += lng;
        sumLat += lat;
      }

      // Weight bbox area by cos(midLat) so high-latitude rings don't skew selection
      const midLat = (minLat + maxLat) * 0.5;
      const area =
        Math.max(0.01, maxLng - minLng) *
        Math.max(0.01, maxLat - minLat) *
        Math.max(0.2, Math.cos((midLat * Math.PI) / 180));

      if (area > bestArea) {
        bestArea = area;
        bestLat = sumLat / ring.length;
        bestLng = sumLng / ring.length;
      }
    }

    if (bestArea >= 0) {
      // Normalize longitude back to [-180, 180]
      while (bestLng > 180) bestLng -= 360;
      while (bestLng < -180) bestLng += 360;
      return { lat: bestLat, lng: bestLng };
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
  const flagEmoji = meta?.flag || feat.properties.flagEmoji || '🌍';
  const isoAlpha2 =
    normalizeIsoAlpha2(feat.properties.isoAlpha2) ||
    flagEmojiToIsoAlpha2(flagEmoji) ||
    '';
  const flagUrl =
    feat.properties.flagUrl || (isoAlpha2 ? buildFlagCdnUrl(isoAlpha2, 80) : '');

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
    isoAlpha2,
    nameRu,
    nameEn,
    flagEmoji,
    flagUrl,
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
