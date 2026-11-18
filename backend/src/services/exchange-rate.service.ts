import { Currency } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['RUB', 'USD', 'EUR'] as const;

export const CBR_DAILY_JSON_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';
export const EXCHANGE_RATE_FETCH_TIMEOUT_MS = 4000;
export const EXCHANGE_RATE_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Built-in realistic fallback rates expressed in RUB per 1 unit of currency
export const FALLBACK_RUB_PER_UNIT: Record<Currency, number> = {
  RUB: 1,
  USD: 92.5,
  EUR: 99.0,
};

export interface ExchangeRatesResult {
  baseCurrency: Currency;
  rates: Record<Currency, number>;
  updatedAt: string;
  source: string;
  isFallback: boolean;
}

interface CbrValuteItem {
  CharCode?: string;
  Nominal?: number;
  Value?: number;
}

interface CbrDailyResponse {
  Date?: string;
  Timestamp?: string;
  Valute?: Record<string, CbrValuteItem>;
}

interface MemoryCacheEntry {
  expiresAtMs: number;
  result: ExchangeRatesResult;
}

const memoryCache = new Map<Currency, MemoryCacheEntry>();

function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildRatesMapForBase(
  baseCurrency: Currency,
  rubPerUnit: Record<Currency, number>
): Record<Currency, number> {
  const baseInRub = rubPerUnit[baseCurrency];
  return {
    RUB: baseCurrency === 'RUB' ? 1 : Number((baseInRub / rubPerUnit.RUB).toFixed(10)),
    USD: baseCurrency === 'USD' ? 1 : Number((baseInRub / rubPerUnit.USD).toFixed(10)),
    EUR: baseCurrency === 'EUR' ? 1 : Number((baseInRub / rubPerUnit.EUR).toFixed(10)),
  };
}

function parseRatesJson(raw: string): Record<Currency, number> | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const rub = Number(parsed.RUB);
    const usd = Number(parsed.USD);
    const eur = Number(parsed.EUR);

    if (
      !Number.isFinite(rub) || rub <= 0 ||
      !Number.isFinite(usd) || usd <= 0 ||
      !Number.isFinite(eur) || eur <= 0
    ) {
      return null;
    }

    return { RUB: rub, USD: usd, EUR: eur };
  } catch {
    return null;
  }
}

function extractCbrRubPerUnit(payload: CbrDailyResponse): Record<Currency, number> | null {
  const usd = payload?.Valute?.USD;
  const eur = payload?.Valute?.EUR;

  if (!usd || !eur) return null;

  const usdVal = Number(usd.Value);
  const usdNom = Number(usd.Nominal || 1);
  const eurVal = Number(eur.Value);
  const eurNom = Number(eur.Nominal || 1);

  if (
    !Number.isFinite(usdVal) || usdVal <= 0 ||
    !Number.isFinite(usdNom) || usdNom <= 0 ||
    !Number.isFinite(eurVal) || eurVal <= 0 ||
    !Number.isFinite(eurNom) || eurNom <= 0
  ) {
    return null;
  }

  return {
    RUB: 1,
    USD: usdVal / usdNom,
    EUR: eurVal / eurNom,
  };
}

async function fetchRatesFromCbr(baseCurrency: Currency): Promise<Record<Currency, number> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXCHANGE_RATE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(CBR_DAILY_JSON_URL, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as CbrDailyResponse;
    const rubPerUnit = extractCbrRubPerUnit(json);
    if (!rubPerUnit) {
      return null;
    }

    return buildRatesMapForBase(baseCurrency, rubPerUnit);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!Number.isFinite(fromRate) || fromRate <= 0 || !Number.isFinite(toRate) || toRate <= 0) {
    const fallbackRates = buildRatesMapForBase(toCurrency, FALLBACK_RUB_PER_UNIT);
    return Number((fallbackRates[toCurrency] / fallbackRates[fromCurrency]).toFixed(6));
  }

  return Number((toRate / fromRate).toFixed(6));
}

export function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount === 0) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return roundTo2(numericAmount);
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!Number.isFinite(fromRate) || fromRate <= 0 || !Number.isFinite(toRate) || toRate <= 0) {
    const fallbackRates = buildRatesMapForBase(toCurrency, FALLBACK_RUB_PER_UNIT);
    return roundTo2(numericAmount * (fallbackRates[toCurrency] / fallbackRates[fromCurrency]));
  }

  return roundTo2(numericAmount * (toRate / fromRate));
}

export class ExchangeRateService {
  static clearMemoryCache(): void {
    memoryCache.clear();
  }

  static getFallbackRatesForBase(baseCurrency: Currency): ExchangeRatesResult {
    return {
      baseCurrency,
      rates: buildRatesMapForBase(baseCurrency, FALLBACK_RUB_PER_UNIT),
      updatedAt: new Date().toISOString(),
      source: 'fallback',
      isFallback: true,
    };
  }

  static convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    rates: Record<Currency, number>
  ): number {
    return convertAmount(amount, fromCurrency, toCurrency, rates);
  }

  static getExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency,
    rates: Record<Currency, number>
  ): number {
    return getExchangeRate(fromCurrency, toCurrency, rates);
  }

  static async getRatesForBase(baseCurrency: Currency): Promise<ExchangeRatesResult> {
    const nowMs = Date.now();

    // 1. Fast in-memory cache
    const cachedMemory = memoryCache.get(baseCurrency);
    if (cachedMemory && cachedMemory.expiresAtMs > nowMs) {
      return {
        ...cachedMemory.result,
        rates: { ...cachedMemory.result.rates },
      };
    }

    // 2. Check PostgreSQL ExchangeRateCache
    let dbRecord: { baseCurrency: Currency; ratesJson: string; source: string; fetchedAt: Date } | null = null;
    let parsedDbRates: Record<Currency, number> | null = null;

    try {
      dbRecord = await prisma.exchangeRateCache.findUnique({
        where: { baseCurrency },
      });
      if (dbRecord) {
        parsedDbRates = parseRatesJson(dbRecord.ratesJson);
        if (parsedDbRates) {
          const fetchedAtMs = dbRecord.fetchedAt.getTime();
          const ageMs = nowMs - fetchedAtMs;
          if (ageMs >= 0 && ageMs < EXCHANGE_RATE_CACHE_TTL_MS) {
            const result: ExchangeRatesResult = {
              baseCurrency,
              rates: parsedDbRates,
              updatedAt: dbRecord.fetchedAt.toISOString(),
              source: dbRecord.source,
              isFallback: false,
            };
            memoryCache.set(baseCurrency, {
              expiresAtMs: fetchedAtMs + EXCHANGE_RATE_CACHE_TTL_MS,
              result,
            });
            return {
              ...result,
              rates: { ...result.rates },
            };
          }
        }
      }
    } catch {
      // Proceed to fetch or fallback if DB lookup fails unexpectedly
    }

    // 3. Fetch fresh rates from CBR daily JSON API
    const liveRates = await fetchRatesFromCbr(baseCurrency);
    if (liveRates) {
      const fetchedAt = new Date();
      const source = 'cbr';

      try {
        await prisma.exchangeRateCache.upsert({
          where: { baseCurrency },
          update: {
            ratesJson: JSON.stringify(liveRates),
            source,
            fetchedAt,
          },
          create: {
            baseCurrency,
            ratesJson: JSON.stringify(liveRates),
            source,
            fetchedAt,
          },
        });
      } catch {
        // Non-fatal: still return live rates and store in memory
      }

      const result: ExchangeRatesResult = {
        baseCurrency,
        rates: liveRates,
        updatedAt: fetchedAt.toISOString(),
        source,
        isFallback: false,
      };
      memoryCache.set(baseCurrency, {
        expiresAtMs: fetchedAt.getTime() + EXCHANGE_RATE_CACHE_TTL_MS,
        result,
      });

      return {
        ...result,
        rates: { ...result.rates },
      };
    }

    // 4. Stale DB cache fallback if API is unreachable
    if (dbRecord && parsedDbRates) {
      return {
        baseCurrency,
        rates: { ...parsedDbRates },
        updatedAt: dbRecord.fetchedAt.toISOString(),
        source: dbRecord.source,
        isFallback: false,
      };
    }

    // 5. Built-in realistic fallback rates
    return this.getFallbackRatesForBase(baseCurrency);
  }
}

export const getRatesForBase = (baseCurrency: Currency) =>
  ExchangeRateService.getRatesForBase(baseCurrency);
