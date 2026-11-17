import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { CountryData } from '../data/countries.data';
import { ClimateHint } from '../data/packing-rules.data';
import { CountryService } from './country.service';
import { formatDateOnly, TripService } from './trip.service';

export type WeatherSourceMode = 'forecast' | 'seasonal_reference';

export type WeatherIconType =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherSummaryDto {
  avgTempMin: number;
  avgTempMax: number;
  minTemp: number;
  maxTemp: number;
  totalPrecipitationMm: number;
  rainyDaysCount: number;
  maxWindKmh: number;
  hasSnow: boolean;
  hasHeavyRain: boolean;
}

export interface WeatherDailyItemDto {
  date: string;
  weatherCode: number;
  conditionRu: string;
  iconType: WeatherIconType;
  tempMin: number;
  tempMax: number;
  precipitationMm: number;
  precipitationProbMax: number | null;
  windSpeedMaxKmh: number;
}

export interface TripWeatherResponseDto {
  tripId?: string;
  resolvedCity: string;
  resolvedCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
  sourceMode: WeatherSourceMode;
  sourceLabelRu: string;
  disclaimerRu: string | null;
  climateHint: ClimateHint;
  climateLabelRu: string;
  summary: WeatherSummaryDto;
  daily: WeatherDailyItemDto[];
  fromCache: boolean;
  fetchedAt: string;
  expiresAt: string;
}

export interface DestinationWeatherPreviewParams {
  country: string;
  city?: string;
  startDate?: string;
  endDate?: string;
}

export interface WeatherPackingContext {
  sourceMode: WeatherSourceMode;
  climateHint: ClimateHint;
  climateLabelRu: string;
  resolvedCity: string;
  resolvedCountry: string;
  summary: WeatherSummaryDto;
}

interface ResolvedLocation {
  resolvedCity: string;
  resolvedCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
  fromCountryFallback: boolean;
}

interface OpenMeteoGeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

interface OpenMeteoDailyPayload {
  time?: string[];
  weather_code?: Array<number | null>;
  temperature_2m_max?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  precipitation_sum?: Array<number | null>;
  precipitation_probability_max?: Array<number | null>;
  wind_speed_10m_max?: Array<number | null>;
}

interface OpenMeteoForecastResponse {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  daily?: OpenMeteoDailyPayload;
  error?: boolean;
  reason?: string;
}

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const FORECAST_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const ARCHIVE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PREVIEW_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const PREVIEW_CACHE_MAX_ENTRIES = 200;
const HTTP_TIMEOUT_MS = 8000;
const MAX_ARCHIVE_DAYS = 60;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface PreviewCacheEntry {
  expiresAtMs: number;
  data: TripWeatherResponseDto;
}

const destinationPreviewCache = new Map<string, PreviewCacheEntry>();

function isValidIsoDateString(val: string): boolean {
  if (!ISO_DATE_REGEX.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

function prunePreviewCache(nowMs: number) {
  for (const [key, entry] of destinationPreviewCache.entries()) {
    if (entry.expiresAtMs <= nowMs) {
      destinationPreviewCache.delete(key);
    }
  }
}

function getCachedPreview(key: string, nowMs: number): TripWeatherResponseDto | null {
  const entry = destinationPreviewCache.get(key);
  if (!entry) return null;

  if (entry.expiresAtMs <= nowMs) {
    destinationPreviewCache.delete(key);
    return null;
  }

  // Refresh LRU order on cache hit
  destinationPreviewCache.delete(key);
  destinationPreviewCache.set(key, entry);
  return {
    ...entry.data,
    fromCache: true,
  };
}

function setCachedPreview(key: string, data: TripWeatherResponseDto, expiresAtMs: number, nowMs: number) {
  if (destinationPreviewCache.size >= PREVIEW_CACHE_MAX_ENTRIES) {
    prunePreviewCache(nowMs);
  }
  while (destinationPreviewCache.size >= PREVIEW_CACHE_MAX_ENTRIES) {
    const oldestKey = destinationPreviewCache.keys().next().value;
    if (oldestKey === undefined) break;
    destinationPreviewCache.delete(oldestKey);
  }
  destinationPreviewCache.set(key, { expiresAtMs, data });
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function addDaysIso(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

function enumerateDatesIso(startIso: string, endIso: string, maxDays = MAX_ARCHIVE_DAYS): string[] {
  const result: string[] = [];
  let current = startIso;
  while (current <= endIso && result.length < maxDays) {
    result.push(current);
    current = addDaysIso(current, 1);
  }
  return result;
}

export function shiftDateToHistoricalYear(isoDate: string, targetYear: number): string {
  const [, monthStr, dayStr] = isoDate.split('-');
  if (monthStr === '02' && dayStr === '29' && !isLeapYear(targetYear)) {
    return `${targetYear}-02-28`;
  }
  return `${targetYear}-${monthStr}-${dayStr}`;
}

export function mapWeatherCode(code: number): {
  conditionRu: string;
  iconType: WeatherIconType;
  isSnow: boolean;
  isHeavyRain: boolean;
} {
  switch (code) {
    case 0:
      return { conditionRu: 'Ясно', iconType: 'sunny', isSnow: false, isHeavyRain: false };
    case 1:
      return {
        conditionRu: 'Преимущественно ясно',
        iconType: 'sunny',
        isSnow: false,
        isHeavyRain: false,
      };
    case 2:
      return {
        conditionRu: 'Переменная облачность',
        iconType: 'partly_cloudy',
        isSnow: false,
        isHeavyRain: false,
      };
    case 3:
      return { conditionRu: 'Пасмурно', iconType: 'cloudy', isSnow: false, isHeavyRain: false };
    case 45:
    case 48:
      return { conditionRu: 'Туман', iconType: 'fog', isSnow: false, isHeavyRain: false };
    case 51:
    case 53:
    case 55:
      return { conditionRu: 'Морось', iconType: 'drizzle', isSnow: false, isHeavyRain: false };
    case 56:
    case 57:
      return {
        conditionRu: 'Ледяная морось',
        iconType: 'drizzle',
        isSnow: false,
        isHeavyRain: false,
      };
    case 61:
    case 63:
      return { conditionRu: 'Дождь', iconType: 'rain', isSnow: false, isHeavyRain: false };
    case 65:
      return {
        conditionRu: 'Сильный дождь',
        iconType: 'heavy_rain',
        isSnow: false,
        isHeavyRain: true,
      };
    case 66:
    case 67:
      return {
        conditionRu: 'Ледяной дождь',
        iconType: 'heavy_rain',
        isSnow: false,
        isHeavyRain: true,
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return { conditionRu: 'Снегопад', iconType: 'snow', isSnow: true, isHeavyRain: false };
    case 80:
    case 81:
      return {
        conditionRu: 'Ливневый дождь',
        iconType: 'rain',
        isSnow: false,
        isHeavyRain: false,
      };
    case 82:
      return {
        conditionRu: 'Сильный ливень',
        iconType: 'heavy_rain',
        isSnow: false,
        isHeavyRain: true,
      };
    case 85:
    case 86:
      return {
        conditionRu: 'Метель / снежные заряды',
        iconType: 'snow',
        isSnow: true,
        isHeavyRain: false,
      };
    case 95:
      return {
        conditionRu: 'Гроза',
        iconType: 'thunderstorm',
        isSnow: false,
        isHeavyRain: true,
      };
    case 96:
    case 99:
      return {
        conditionRu: 'Гроза с градом',
        iconType: 'thunderstorm',
        isSnow: false,
        isHeavyRain: true,
      };
    default:
      return {
        conditionRu: 'Переменная облачность',
        iconType: 'partly_cloudy',
        isSnow: false,
        isHeavyRain: false,
      };
  }
}

export function computeWeatherSummary(daily: WeatherDailyItemDto[]): WeatherSummaryDto {
  if (daily.length === 0) {
    return {
      avgTempMin: 0,
      avgTempMax: 0,
      minTemp: 0,
      maxTemp: 0,
      totalPrecipitationMm: 0,
      rainyDaysCount: 0,
      maxWindKmh: 0,
      hasSnow: false,
      hasHeavyRain: false,
    };
  }

  let sumMin = 0;
  let sumMax = 0;
  let minTemp = daily[0].tempMin;
  let maxTemp = daily[0].tempMax;
  let totalPrecip = 0;
  let rainyDaysCount = 0;
  let maxWind = 0;
  let hasSnow = false;
  let hasHeavyRain = false;

  for (const day of daily) {
    sumMin += day.tempMin;
    sumMax += day.tempMax;
    if (day.tempMin < minTemp) minTemp = day.tempMin;
    if (day.tempMax > maxTemp) maxTemp = day.tempMax;
    totalPrecip += day.precipitationMm;
    if (day.windSpeedMaxKmh > maxWind) maxWind = day.windSpeedMaxKmh;

    const isRainy =
      day.precipitationMm >= 1.0 ||
      day.iconType === 'rain' ||
      day.iconType === 'heavy_rain' ||
      day.iconType === 'thunderstorm';
    if (isRainy) {
      rainyDaysCount += 1;
    }

    if (day.iconType === 'snow') {
      hasSnow = true;
    }

    if (
      day.precipitationMm >= 10 ||
      day.iconType === 'heavy_rain' ||
      day.weatherCode === 95 ||
      day.weatherCode === 96 ||
      day.weatherCode === 99
    ) {
      hasHeavyRain = true;
    }
  }

  return {
    avgTempMin: round1(sumMin / daily.length),
    avgTempMax: round1(sumMax / daily.length),
    minTemp: round1(minTemp),
    maxTemp: round1(maxTemp),
    totalPrecipitationMm: round1(totalPrecip),
    rainyDaysCount,
    maxWindKmh: round1(maxWind),
    hasSnow,
    hasHeavyRain,
  };
}

function formatSignedTemp(temp: number): string {
  const rounded = Math.round(temp);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function deriveClimateFromSummary(
  summary: WeatherSummaryDto,
  sourceMode: WeatherSourceMode
): { climateHint: ClimateHint; climateLabelRu: string } {
  let climateHint: ClimateHint;
  if (summary.avgTempMax >= 27 && summary.minTemp >= 18) {
    climateHint = 'tropical_warm';
  } else if (summary.avgTempMax >= 20 && summary.minTemp >= 10) {
    climateHint = 'warm_season';
  } else if (summary.avgTempMax <= 10 || summary.minTemp <= 3) {
    climateHint = 'cool_season';
  } else {
    climateHint = 'shoulder_or_uncertain';
  }

  const prefix = sourceMode === 'forecast' ? 'прогноз погоды' : 'сезонный ориентир';
  const tempRange = `${formatSignedTemp(summary.avgTempMin)}…${formatSignedTemp(summary.avgTempMax)}°C`;

  let precipText: string;
  if (summary.hasSnow) {
    precipText = 'возможен снег';
  } else if (summary.hasHeavyRain) {
    precipText = `сильные осадки (дождливых дней: ${Math.max(1, summary.rainyDaysCount)})`;
  } else if (summary.rainyDaysCount > 0) {
    precipText = `дождливых дней: ${summary.rainyDaysCount}`;
  } else {
    precipText = 'без существенных осадков';
  }

  return {
    climateHint,
    climateLabelRu: `${prefix}: ${tempRange}, ${precipText}`,
  };
}

function normalizeLabel(value: string | undefined | null): string {
  return (value || '').trim().toLowerCase().replace(/ё/g, 'е');
}

function scoreGeocodingMatch(
  candidate: OpenMeteoGeocodingResult,
  cityQuery: string,
  countryQuery: string,
  countryData?: CountryData
): { score: number; matchesCountry: boolean } {
  let score = 0;
  let matchesCountry = false;

  const normCandidateCountry = normalizeLabel(candidate.country);
  const normCandidateCode = (candidate.country_code || '').trim().toUpperCase();
  const normCountryQuery = normalizeLabel(countryQuery);

  if (countryData) {
    if (normCandidateCode && normCandidateCode === countryData.isoAlpha2.toUpperCase()) {
      score += 100;
      matchesCountry = true;
    } else if (
      normCandidateCountry &&
      (normCandidateCountry === normalizeLabel(countryData.nameRu) ||
        normCandidateCountry === normalizeLabel(countryData.nameEn) ||
        normCandidateCountry === normCountryQuery)
    ) {
      score += 85;
      matchesCountry = true;
    }
  } else if (normCountryQuery) {
    if (
      normCandidateCountry &&
      (normCandidateCountry === normCountryQuery ||
        normCandidateCountry.includes(normCountryQuery) ||
        normCountryQuery.includes(normCandidateCountry))
    ) {
      score += 85;
      matchesCountry = true;
    }
  } else {
    matchesCountry = true;
  }

  const normCandidateName = normalizeLabel(candidate.name);
  const normCityQuery = normalizeLabel(cityQuery);
  if (normCityQuery && normCandidateName === normCityQuery) {
    score += 20;
  } else if (normCityQuery && normCandidateName.includes(normCityQuery)) {
    score += 10;
  }

  if (typeof candidate.population === 'number' && candidate.population > 0) {
    score += Math.min(10, candidate.population / 1_000_000);
  }

  return { score, matchesCountry };
}

function pickBestGeocodingResult(
  results: OpenMeteoGeocodingResult[] | undefined,
  cityQuery: string,
  countryQuery: string,
  countryData: CountryData | undefined,
  requireCountryMatch: boolean
): OpenMeteoGeocodingResult | null {
  if (!results || results.length === 0) return null;

  let best: OpenMeteoGeocodingResult | null = null;
  let bestScore = -1;

  for (const candidate of results) {
    const { score, matchesCountry } = scoreGeocodingMatch(
      candidate,
      cityQuery,
      countryQuery,
      countryData
    );
    if (requireCountryMatch && !matchesCountry) {
      continue;
    }
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = HTTP_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        `Погодный сервис временно недоступен (HTTP ${response.status})`,
        502,
        'WEATHER_PROVIDER_ERROR'
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    if (err?.name === 'AbortError') {
      throw new AppError(
        'Превышено время ожидания ответа от погодного сервиса',
        504,
        'WEATHER_PROVIDER_TIMEOUT'
      );
    }
    throw new AppError(
      'Не удалось подключиться к внешнему сервису погоды',
      502,
      'WEATHER_PROVIDER_UNAVAILABLE'
    );
  } finally {
    clearTimeout(timer);
  }
}

async function resolveDestinationLocation(
  city: string,
  country: string
): Promise<ResolvedLocation> {
  const cleanCity = city.trim();
  const cleanCountry = country.trim();
  const countryData = cleanCountry
    ? CountryService.findCountryByIdentifier(cleanCountry)
    : undefined;

  const fallbackFromCountry = (): ResolvedLocation | null => {
    if (!countryData?.coordinates) return null;
    return {
      resolvedCity: cleanCity
        ? `${cleanCity} (ориентир по стране ${countryData.nameRu})`
        : countryData.capital,
      resolvedCountry: countryData.nameRu,
      latitude: countryData.coordinates.lat,
      longitude: countryData.coordinates.lng,
      timezone: 'auto',
      fromCountryFallback: true,
    };
  };

  let allFallbackResults: OpenMeteoGeocodingResult[] = [];
  let hadProviderFailure = false;

  const queryGeocoding = async (nameQuery: string, language: 'ru' | 'en') => {
    const url = `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(nameQuery)}&count=10&language=${language}&format=json`;
    const data = await fetchJsonWithTimeout<OpenMeteoGeocodingResponse>(url);
    return Array.isArray(data.results) ? data.results : [];
  };

  if (cleanCity) {
    // 1. Поиск города с русским языком и фильтрацией по стране
    try {
      const ruResults = await queryGeocoding(cleanCity, 'ru');
      allFallbackResults = ruResults;
      const ruMatch = pickBestGeocodingResult(
        ruResults,
        cleanCity,
        cleanCountry,
        countryData,
        Boolean(cleanCountry)
      );
      if (ruMatch) {
        return {
          resolvedCity: ruMatch.name,
          resolvedCountry: countryData?.nameRu || ruMatch.country || cleanCountry,
          latitude: ruMatch.latitude,
          longitude: ruMatch.longitude,
          timezone: ruMatch.timezone || 'UTC',
          fromCountryFallback: false,
        };
      }
    } catch {
      hadProviderFailure = true;
    }

    // 2. Поиск на английском (включая связку с английским названием страны из CountryService)
    const englishQueries = countryData?.nameEn
      ? [cleanCity, `${cleanCity}, ${countryData.nameEn}`]
      : [cleanCity];

    for (const q of englishQueries) {
      try {
        const enResults = await queryGeocoding(q, 'en');
        if (allFallbackResults.length === 0) {
          allFallbackResults = enResults;
        }
        const enMatch = pickBestGeocodingResult(
          enResults,
          cleanCity,
          cleanCountry,
          countryData,
          Boolean(cleanCountry)
        );
        if (enMatch) {
          return {
            resolvedCity: enMatch.name,
            resolvedCountry: countryData?.nameRu || enMatch.country || cleanCountry,
            latitude: enMatch.latitude,
            longitude: enMatch.longitude,
            timezone: enMatch.timezone || 'UTC',
            fromCountryFallback: false,
          };
        }
      } catch {
        hadProviderFailure = true;
      }
    }

    // 3. Если страна не найдена в справочнике, но Open-Meteo вернул город по одному лишь названию
    if (!countryData) {
      const cityOnlyMatch = pickBestGeocodingResult(
        allFallbackResults,
        cleanCity,
        cleanCountry,
        undefined,
        false
      );
      if (cityOnlyMatch) {
        return {
          resolvedCity: cityOnlyMatch.name,
          resolvedCountry: cityOnlyMatch.country || cleanCountry,
          latitude: cityOnlyMatch.latitude,
          longitude: cityOnlyMatch.longitude,
          timezone: cityOnlyMatch.timezone || 'UTC',
          fromCountryFallback: false,
        };
      }
    }
  }

  // 4. Запасной вариант по координатам страны из CountryService
  const countryFallback = fallbackFromCountry();
  if (countryFallback) {
    return countryFallback;
  }

  if (hadProviderFailure) {
    throw new AppError(
      'Не удалось определить локацию из-за ошибки погодного сервиса',
      502,
      'WEATHER_PROVIDER_UNAVAILABLE'
    );
  }

  throw new AppError(
    'Не удалось определить координаты для указанного города и страны',
    422,
    'WEATHER_LOCATION_NOT_FOUND'
  );
}

function buildSourceLabelRu(sourceMode: WeatherSourceMode): string {
  return sourceMode === 'forecast'
    ? 'Прогноз погоды (Open-Meteo)'
    : 'Сезонный ориентир по данным прошлого года';
}

function buildDisclaimerRu(
  sourceMode: WeatherSourceMode,
  tripEndIso: string,
  forecastWindowEndIso: string,
  fromCountryFallback: boolean
): string | null {
  const notes: string[] = [];

  if (sourceMode === 'seasonal_reference') {
    notes.push(
      'Сезонный ориентир рассчитан по историческим метеоданным за аналогичные даты прошлого года и может отличаться от фактической погоды.'
    );
  } else if (tripEndIso > forecastWindowEndIso) {
    notes.push(
      'Прогноз погоды доступен на ближайшие 16 дней; показаны доступные дни в пределах окна прогноза.'
    );
  }

  if (fromCountryFallback) {
    notes.push('Точный город не найден в геокодинге, использованы ориентировочные координаты страны.');
  }

  return notes.length > 0 ? notes.join(' ') : null;
}

function parseDailyItemFromPayload(
  date: string,
  payload: OpenMeteoDailyPayload,
  idx: number
): WeatherDailyItemDto {
  const weatherCode = Number(payload.weather_code?.[idx] ?? 2);
  const mapped = mapWeatherCode(weatherCode);
  const tempMin = round1(Number(payload.temperature_2m_min?.[idx] ?? 0));
  const tempMax = round1(Number(payload.temperature_2m_max?.[idx] ?? tempMin));
  const precipitationMm = round1(Math.max(0, Number(payload.precipitation_sum?.[idx] ?? 0)));
  const rawProb = payload.precipitation_probability_max?.[idx];
  const precipitationProbMax =
    typeof rawProb === 'number' && Number.isFinite(rawProb) ? Math.round(rawProb) : null;
  const windSpeedMaxKmh = round1(Math.max(0, Number(payload.wind_speed_10m_max?.[idx] ?? 0)));

  return {
    date,
    weatherCode,
    conditionRu: mapped.conditionRu,
    iconType: mapped.iconType,
    tempMin,
    tempMax,
    precipitationMm,
    precipitationProbMax,
    windSpeedMaxKmh,
  };
}

export class WeatherService {
  static clearPreviewCache(): void {
    destinationPreviewCache.clear();
  }

  private static async fetchWeatherForPeriod(params: {
    country: string;
    city: string;
    startIso: string;
    endIso: string;
    now: Date;
  }) {
    const { country, city, startIso, endIso, now } = params;
    const todayIso = formatDateOnly(now);
    const todayPlus14Iso = addDaysIso(todayIso, 14);
    const todayPlus15Iso = addDaysIso(todayIso, 15);

    const location = await resolveDestinationLocation(city, country);
    const isForecastWindow = startIso <= todayPlus14Iso && endIso >= todayIso;
    const sourceMode: WeatherSourceMode = isForecastWindow ? 'forecast' : 'seasonal_reference';

    let daily: WeatherDailyItemDto[] = [];
    let resolvedTimezone = location.timezone;

    if (sourceMode === 'forecast') {
      const reqStart = startIso < todayIso ? todayIso : startIso;
      const reqEnd = endIso > todayPlus15Iso ? todayPlus15Iso : endIso;

      const forecastUrl =
        `${OPEN_METEO_FORECAST_URL}?latitude=${location.latitude}&longitude=${location.longitude}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto&start_date=${reqStart}&end_date=${reqEnd}`;

      const forecastData = await fetchJsonWithTimeout<OpenMeteoForecastResponse>(forecastUrl);
      if (forecastData.error) {
        throw new AppError(
          forecastData.reason || 'Ошибка получения прогноза погоды',
          502,
          'WEATHER_PROVIDER_ERROR'
        );
      }

      if (forecastData.timezone) {
        resolvedTimezone = forecastData.timezone;
      }

      const times = forecastData.daily?.time || [];
      if (times.length === 0) {
        throw new AppError(
          'Погодный сервис вернул пустой прогноз',
          502,
          'WEATHER_PROVIDER_ERROR'
        );
      }
      daily = times.map((dateStr, idx) =>
        parseDailyItemFromPayload(dateStr, forecastData.daily!, idx)
      );
    } else {
      const tripDates = enumerateDatesIso(startIso, endIso, MAX_ARCHIVE_DAYS);
      const maxArchiveSafeDate = addDaysIso(todayIso, -5);

      let yearOffset = 1;
      const shiftTripDate = (isoDate: string, offset: number) => {
        const year = Number(isoDate.slice(0, 4)) - offset;
        return shiftDateToHistoricalYear(isoDate, year);
      };

      const lastTripDate = tripDates[tripDates.length - 1] || endIso;
      while (shiftTripDate(lastTripDate, yearOffset) > maxArchiveSafeDate && yearOffset < 5) {
        yearOffset += 1;
      }

      const historicalDates = tripDates.map((d) => shiftTripDate(d, yearOffset));
      const archiveStart = historicalDates[0];
      const archiveEnd = historicalDates[historicalDates.length - 1];

      const archiveUrl =
        `${OPEN_METEO_ARCHIVE_URL}?latitude=${location.latitude}&longitude=${location.longitude}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
        `&timezone=auto&start_date=${archiveStart}&end_date=${archiveEnd}`;

      const archiveData = await fetchJsonWithTimeout<OpenMeteoForecastResponse>(archiveUrl);
      if (archiveData.error) {
        throw new AppError(
          archiveData.reason || 'Ошибка получения сезонного ориентира погоды',
          502,
          'WEATHER_PROVIDER_ERROR'
        );
      }

      if (archiveData.timezone) {
        resolvedTimezone = archiveData.timezone;
      }

      const archiveTimes = archiveData.daily?.time || [];
      if (archiveTimes.length === 0) {
        throw new AppError(
          'Погодный сервис вернул пустые архивные данные',
          502,
          'WEATHER_PROVIDER_ERROR'
        );
      }
      const indexByArchiveDate = new Map<string, number>();
      archiveTimes.forEach((d, idx) => indexByArchiveDate.set(d, idx));

      daily = tripDates.map((tripDate, i) => {
        const histDate = historicalDates[i];
        const matchedIdx = indexByArchiveDate.get(histDate) ?? i;
        return parseDailyItemFromPayload(tripDate, archiveData.daily || {}, matchedIdx);
      });
    }

    const summary = computeWeatherSummary(daily);
    const { climateHint, climateLabelRu } = deriveClimateFromSummary(summary, sourceMode);

    return {
      resolvedCity: location.resolvedCity,
      resolvedCountry: location.resolvedCountry,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: resolvedTimezone === 'auto' ? 'UTC' : resolvedTimezone,
      sourceMode,
      sourceLabelRu: buildSourceLabelRu(sourceMode),
      disclaimerRu: buildDisclaimerRu(
        sourceMode,
        endIso,
        todayPlus15Iso,
        location.fromCountryFallback
      ),
      climateHint,
      climateLabelRu,
      summary,
      daily,
    };
  }

  static async getDestinationWeatherPreview(
    params: DestinationWeatherPreviewParams,
    options: { now?: Date } = {}
  ): Promise<TripWeatherResponseDto> {
    const cleanCountry = (params.country || '').trim();
    if (!cleanCountry) {
      throw new AppError('Укажите страну для получения прогноза погоды', 400, 'VALIDATION_ERROR');
    }

    const matchedCountry = CountryService.findCountryByIdentifier(cleanCountry);
    const cleanCity = (params.city || '').trim();
    const effectiveCity = cleanCity || matchedCountry?.capital || cleanCountry;

    const now = options.now ?? new Date();
    const todayIso = formatDateOnly(now);

    const rawStart = (params.startDate || '').trim();
    const rawEnd = (params.endDate || '').trim();

    let startIso: string;
    let endIso: string;

    if (!rawStart && !rawEnd) {
      startIso = todayIso;
      endIso = addDaysIso(todayIso, 6);
    } else {
      if (!rawStart || !rawEnd) {
        throw new AppError(
          'Укажите обе даты (startDate и endDate) для прогноза на даты поездки',
          400,
          'VALIDATION_ERROR'
        );
      }
      if (!isValidIsoDateString(rawStart) || !isValidIsoDateString(rawEnd)) {
        throw new AppError(
          'Некорректный формат дат (ожидается ГГГГ-ММ-ДД)',
          400,
          'VALIDATION_ERROR'
        );
      }
      if (rawEnd < rawStart) {
        throw new AppError(
          'Дата окончания не может быть раньше даты начала',
          400,
          'VALIDATION_ERROR'
        );
      }
      startIso = rawStart;
      endIso = rawEnd;
    }

    const countryKey = normalizeLabel(matchedCountry?.slug || cleanCountry);
    const cityKey = normalizeLabel(effectiveCity);
    const cacheKey = `${countryKey}|${cityKey}|${startIso}|${endIso}`;

    const nowMs = now.getTime();
    const cached = getCachedPreview(cacheKey, nowMs);
    if (cached) {
      return cached;
    }

    const payload = await this.fetchWeatherForPeriod({
      country: cleanCountry,
      city: effectiveCity,
      startIso,
      endIso,
      now,
    });

    const expiresAtMs = nowMs + PREVIEW_CACHE_TTL_MS;
    const result: TripWeatherResponseDto = {
      ...payload,
      fromCache: false,
      fetchedAt: now.toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
    };

    setCachedPreview(cacheKey, result, expiresAtMs, nowMs);
    return result;
  }

  static async getTripWeather(
    tripId: string,
    userId: string,
    options: { forceRefresh?: boolean; now?: Date } = {}
  ): Promise<TripWeatherResponseDto> {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);
    const now = options.now ?? new Date();
    const startIso = formatDateOnly(trip.startDate);
    const endIso = formatDateOnly(trip.endDate);
    const todayIso = formatDateOnly(now);
    const todayPlus15Iso = addDaysIso(todayIso, 15);

    if (!options.forceRefresh) {
      const cached = await prisma.tripWeatherCache.findUnique({
        where: { tripId },
      });

      if (cached && cached.expiresAt > now) {
        const sourceMode =
          cached.sourceMode === 'forecast' ? 'forecast' : 'seasonal_reference';
        const daily = Array.isArray(cached.daily)
          ? (cached.daily as unknown as WeatherDailyItemDto[])
          : [];
        const summary = cached.summary as unknown as WeatherSummaryDto;
        const fromCountryFallback = cached.resolvedCity.includes('(ориентир по стране');

        return {
          tripId,
          resolvedCity: cached.resolvedCity,
          resolvedCountry: cached.resolvedCountry,
          latitude: cached.latitude,
          longitude: cached.longitude,
          timezone: cached.timezone,
          sourceMode,
          sourceLabelRu: buildSourceLabelRu(sourceMode),
          disclaimerRu: buildDisclaimerRu(
            sourceMode,
            endIso,
            todayPlus15Iso,
            fromCountryFallback
          ),
          climateHint: cached.climateHint as ClimateHint,
          climateLabelRu: cached.climateLabelRu,
          summary,
          daily,
          fromCache: true,
          fetchedAt: cached.fetchedAt.toISOString(),
          expiresAt: cached.expiresAt.toISOString(),
        };
      }
    }

    const weatherData = await this.fetchWeatherForPeriod({
      country: trip.country,
      city: trip.city,
      startIso,
      endIso,
      now,
    });

    const ttlMs =
      weatherData.sourceMode === 'forecast' ? FORECAST_CACHE_TTL_MS : ARCHIVE_CACHE_TTL_MS;
    const fetchedAt = now;
    const expiresAt = new Date(now.getTime() + ttlMs);

    const cachePayload = {
      resolvedCity: weatherData.resolvedCity,
      resolvedCountry: weatherData.resolvedCountry,
      latitude: weatherData.latitude,
      longitude: weatherData.longitude,
      timezone: weatherData.timezone,
      sourceMode: weatherData.sourceMode,
      climateHint: weatherData.climateHint,
      climateLabelRu: weatherData.climateLabelRu,
      summary: weatherData.summary as unknown as Prisma.InputJsonValue,
      daily: weatherData.daily as unknown as Prisma.InputJsonValue,
      fetchedAt,
      expiresAt,
    };

    let saved;
    try {
      saved = await prisma.tripWeatherCache.upsert({
        where: { tripId },
        create: {
          tripId,
          ...cachePayload,
        },
        update: cachePayload,
      });
    } catch (err: any) {
      // При конкурентных параллельных запросах повторно обновляем уже созданную запись
      if (err?.code === 'P2002') {
        saved = await prisma.tripWeatherCache.update({
          where: { tripId },
          data: cachePayload,
        });
      } else {
        throw err;
      }
    }

    return {
      tripId,
      resolvedCity: saved.resolvedCity,
      resolvedCountry: saved.resolvedCountry,
      latitude: saved.latitude,
      longitude: saved.longitude,
      timezone: saved.timezone,
      sourceMode: weatherData.sourceMode,
      sourceLabelRu: weatherData.sourceLabelRu,
      disclaimerRu: weatherData.disclaimerRu,
      climateHint: weatherData.climateHint,
      climateLabelRu: weatherData.climateLabelRu,
      summary: weatherData.summary,
      daily: weatherData.daily,
      fromCache: false,
      fetchedAt: saved.fetchedAt.toISOString(),
      expiresAt: saved.expiresAt.toISOString(),
    };
  }

  static async getWeatherContextForPacking(
    tripId: string,
    userId: string
  ): Promise<WeatherPackingContext | null> {
    try {
      const weather = await this.getTripWeather(tripId, userId, { forceRefresh: false });
      return {
        sourceMode: weather.sourceMode,
        climateHint: weather.climateHint,
        climateLabelRu: weather.climateLabelRu,
        resolvedCity: weather.resolvedCity,
        resolvedCountry: weather.resolvedCountry,
        summary: weather.summary,
      };
    } catch (err) {
      console.warn(
        `[WeatherService] Не удалось получить погоду для генерации списка вещей (tripId=${tripId}):`,
        err instanceof Error ? err.message : err
      );
      return null;
    }
  }
}
