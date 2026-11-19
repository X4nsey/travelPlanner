import { reactive } from 'vue';
import {
  DEFAULT_TRIP_THEME_ID,
  TRIP_THEMES,
  TRIP_THEME_LIST,
  TRIP_TYPE_ALIAS_TO_THEME_ID,
  isValidTripThemeId,
  type TripThemeId,
  type TripThemePreference,
  type TripThemePreset,
} from '@/constants/tripThemes';

export const TRIP_THEMES_STORAGE_KEY = 'travelplanner_trip_themes_v1';

const tripThemeOverrides = reactive<Record<string, TripThemeId>>({});

let isInitialized = false;

function parseStoredThemes(raw: string | null): Record<string, TripThemeId> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, TripThemeId> = {};
    for (const [tripId, value] of Object.entries(parsed)) {
      if (tripId && isValidTripThemeId(value)) {
        result[tripId] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function syncReactiveOverrides(nextMap: Record<string, TripThemeId>): void {
  for (const existingKey of Object.keys(tripThemeOverrides)) {
    if (!(existingKey in nextMap)) {
      delete tripThemeOverrides[existingKey];
    }
  }
  for (const [tripId, themeId] of Object.entries(nextMap)) {
    if (tripThemeOverrides[tripId] !== themeId) {
      tripThemeOverrides[tripId] = themeId;
    }
  }
}

function persistOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: Record<string, TripThemeId> = {};
    for (const [tripId, themeId] of Object.entries(tripThemeOverrides)) {
      if (tripId && isValidTripThemeId(themeId)) {
        payload[tripId] = themeId;
      }
    }
    if (Object.keys(payload).length === 0) {
      window.localStorage.removeItem(TRIP_THEMES_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TRIP_THEMES_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function handleStorageSync(event: StorageEvent): void {
  if (event.key !== TRIP_THEMES_STORAGE_KEY) return;
  syncReactiveOverrides(parseStoredThemes(event.newValue));
}

function ensureInitialized(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(TRIP_THEMES_STORAGE_KEY);
    syncReactiveOverrides(parseStoredThemes(raw));
  } catch {
    // Ignore restricted storage access
  }

  window.addEventListener('storage', handleStorageSync);
}

export function getDefaultTripThemeId(tripType?: string | null): TripThemeId {
  if (!tripType || typeof tripType !== 'string') {
    return DEFAULT_TRIP_THEME_ID;
  }
  const normalized = tripType.trim().toUpperCase();
  return TRIP_TYPE_ALIAS_TO_THEME_ID[normalized] ?? DEFAULT_TRIP_THEME_ID;
}

export function getTripThemePreference(tripId: string): TripThemeId | 'auto' {
  ensureInitialized();
  if (!tripId) return 'auto';
  const stored = tripThemeOverrides[tripId];
  return isValidTripThemeId(stored) ? stored : 'auto';
}

export function resolveTripTheme(
  tripId: string | undefined,
  tripType?: string | null
): TripThemePreset {
  ensureInitialized();
  if (tripId) {
    const preference = getTripThemePreference(tripId);
    if (preference !== 'auto') {
      return TRIP_THEMES[preference];
    }
  }
  return TRIP_THEMES[getDefaultTripThemeId(tripType)];
}

export function setTripThemePreference(
  tripId: string,
  theme: TripThemeId | 'auto'
): void {
  ensureInitialized();
  if (!tripId) return;

  if (theme === 'auto') {
    if (tripId in tripThemeOverrides) {
      delete tripThemeOverrides[tripId];
      persistOverrides();
    }
    return;
  }

  if (!isValidTripThemeId(theme)) return;

  if (tripThemeOverrides[tripId] !== theme) {
    tripThemeOverrides[tripId] = theme;
    persistOverrides();
  }
}

export function useTripTheme() {
  ensureInitialized();

  return {
    themes: TRIP_THEME_LIST,
    themesMap: TRIP_THEMES,
    getDefaultTripThemeId,
    getTripThemePreference,
    resolveTripTheme,
    setTripThemePreference,
  };
}

export type { TripThemeId, TripThemePreference, TripThemePreset };
