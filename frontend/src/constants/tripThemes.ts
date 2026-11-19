import type { TripType } from '@/types';

export type TripThemeId = 'ocean' | 'mountain' | 'metropolis' | 'sunset' | 'classic';
export type TripThemePreference = TripThemeId | 'auto';

export interface TripThemePreset {
  id: TripThemeId;
  name: string;
  shortName: string;
  description: string;
  swatchClass: string;
  ringClass: string;
  heroBannerClass: string;
  heroAccentStripClass: string;
  heroGlowClass: string;
  cardTopBarClass: string;
  cardBorderClass: string;
  cardHoverBorderClass: string;
  headerBandClass: string;
  tabActiveClass: string;
  tabBadgeClass: string;
  badgeClass: string;
  progressFillClass: string;
  progressSecondaryFillClass: string;
  dayBadgeClass: string;
  accentTextClass: string;
  accentIconClass: string;
  accentHoverTitleClass: string;
  accentLinkHoverClass: string;
  accentGhostBtnClass: string;
  switcherActiveBgClass: string;
}

export const DEFAULT_TRIP_THEME_ID: TripThemeId = 'classic';

export const TRIP_THEME_IDS = [
  'ocean',
  'mountain',
  'metropolis',
  'sunset',
  'classic',
] as const satisfies readonly TripThemeId[];

/**
 * Полный словарь статических Tailwind-классов для каждой атмосферной палитры.
 * ВАЖНО: все классы прописаны полными строками без динамической конкатенации,
 * чтобы Tailwind CSS v3 корректно включал их в production-сборку.
 */
export const TRIP_THEMES: Record<TripThemeId, TripThemePreset> = {
  ocean: {
    id: 'ocean',
    name: 'Океан и побережье',
    shortName: 'Океан',
    description: 'Лазурный бриз, морская волна и солнечный берег',
    swatchClass: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600',
    ringClass:
      'ring-2 ring-cyan-500/70 dark:ring-cyan-400/70 border-cyan-400/80 dark:border-cyan-400/60',
    heroBannerClass:
      'bg-gradient-to-br from-cyan-50/95 via-sky-50/55 to-white dark:from-cyan-950/60 dark:via-slate-900 dark:to-sky-950/35 border-cyan-200/80 dark:border-cyan-500/30',
    heroAccentStripClass: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
    heroGlowClass:
      'bg-gradient-to-br from-cyan-300/35 via-sky-300/25 to-transparent dark:from-cyan-500/20 dark:via-sky-500/10 dark:to-transparent',
    cardTopBarClass: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
    cardBorderClass: 'border-cyan-200/80 dark:border-cyan-500/30',
    cardHoverBorderClass: 'hover:border-cyan-300/90 dark:hover:border-cyan-500/50',
    headerBandClass:
      'bg-gradient-to-r from-cyan-50/90 via-sky-50/55 to-white dark:from-cyan-950/60 dark:via-slate-900 dark:to-sky-950/30',
    tabActiveClass: 'border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300',
    tabBadgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    badgeClass:
      'bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    progressFillClass: 'bg-gradient-to-r from-cyan-500 to-sky-500',
    progressSecondaryFillClass: 'bg-gradient-to-r from-sky-500 to-blue-500',
    dayBadgeClass: 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm',
    accentTextClass: 'text-cyan-700 dark:text-cyan-300',
    accentIconClass: 'text-cyan-600 dark:text-cyan-400',
    accentHoverTitleClass: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300',
    accentLinkHoverClass: 'hover:text-cyan-700 dark:hover:text-cyan-300',
    accentGhostBtnClass:
      'text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50/80 dark:text-cyan-300 dark:hover:text-cyan-200 dark:hover:bg-cyan-500/15',
    switcherActiveBgClass: 'bg-cyan-50/80 dark:bg-cyan-500/15',
  },

  mountain: {
    id: 'mountain',
    name: 'Горный рассвет',
    shortName: 'Горы',
    description: 'Хвойные склоны, чистый альпийский воздух и вершины',
    swatchClass: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600',
    ringClass:
      'ring-2 ring-emerald-500/70 dark:ring-emerald-400/70 border-emerald-400/80 dark:border-emerald-400/60',
    heroBannerClass:
      'bg-gradient-to-br from-emerald-50/95 via-teal-50/45 to-sky-50/55 dark:from-emerald-950/55 dark:via-slate-900 dark:to-sky-950/35 border-emerald-200/80 dark:border-emerald-500/30',
    heroAccentStripClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500',
    heroGlowClass:
      'bg-gradient-to-br from-emerald-300/35 via-sky-300/20 to-transparent dark:from-emerald-500/20 dark:via-sky-500/10 dark:to-transparent',
    cardTopBarClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500',
    cardBorderClass: 'border-emerald-200/80 dark:border-emerald-500/30',
    cardHoverBorderClass: 'hover:border-emerald-300/90 dark:hover:border-emerald-500/50',
    headerBandClass:
      'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-sky-50/40 dark:from-emerald-950/60 dark:via-slate-900 dark:to-sky-950/35',
    tabActiveClass:
      'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300',
    tabBadgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    badgeClass:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    progressFillClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    progressSecondaryFillClass: 'bg-gradient-to-r from-teal-500 to-sky-500',
    dayBadgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm',
    accentTextClass: 'text-emerald-700 dark:text-emerald-300',
    accentIconClass: 'text-emerald-600 dark:text-emerald-400',
    accentHoverTitleClass: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    accentLinkHoverClass: 'hover:text-emerald-700 dark:hover:text-emerald-300',
    accentGhostBtnClass:
      'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/15',
    switcherActiveBgClass: 'bg-emerald-50/80 dark:bg-emerald-500/15',
  },

  metropolis: {
    id: 'metropolis',
    name: 'Огни мегаполиса',
    shortName: 'Мегаполис',
    description: 'Глубокий индиго, вечерние проспекты, музеи и деловой ритм',
    swatchClass: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600',
    ringClass:
      'ring-2 ring-indigo-500/70 dark:ring-indigo-400/70 border-indigo-400/80 dark:border-indigo-400/60',
    heroBannerClass:
      'bg-gradient-to-br from-indigo-50/95 via-violet-50/50 to-white dark:from-indigo-950/60 dark:via-slate-900 dark:to-violet-950/35 border-indigo-200/80 dark:border-indigo-500/30',
    heroAccentStripClass: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500',
    heroGlowClass:
      'bg-gradient-to-br from-indigo-300/35 via-violet-300/25 to-transparent dark:from-indigo-500/20 dark:via-violet-500/15 dark:to-transparent',
    cardTopBarClass: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500',
    cardBorderClass: 'border-indigo-200/80 dark:border-indigo-500/30',
    cardHoverBorderClass: 'hover:border-indigo-300/90 dark:hover:border-indigo-500/50',
    headerBandClass:
      'bg-gradient-to-r from-indigo-50/90 via-violet-50/50 to-white dark:from-indigo-950/60 dark:via-slate-900 dark:to-violet-950/35',
    tabActiveClass: 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300',
    tabBadgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    badgeClass:
      'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    progressFillClass: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    progressSecondaryFillClass: 'bg-gradient-to-r from-violet-500 to-purple-500',
    dayBadgeClass: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm',
    accentTextClass: 'text-indigo-700 dark:text-indigo-300',
    accentIconClass: 'text-indigo-600 dark:text-indigo-400',
    accentHoverTitleClass: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300',
    accentLinkHoverClass: 'hover:text-indigo-700 dark:hover:text-indigo-300',
    accentGhostBtnClass:
      'text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50/80 dark:text-indigo-300 dark:hover:text-indigo-200 dark:hover:bg-indigo-500/15',
    switcherActiveBgClass: 'bg-indigo-50/80 dark:bg-indigo-500/15',
  },

  sunset: {
    id: 'sunset',
    name: 'Тёплый закат',
    shortName: 'Закат',
    description: 'Терракота, янтарный свет, SPA-релакс и тёплые вечера',
    swatchClass: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    ringClass:
      'ring-2 ring-amber-500/70 dark:ring-amber-400/70 border-amber-400/80 dark:border-amber-400/60',
    heroBannerClass:
      'bg-gradient-to-br from-amber-50/95 via-orange-50/50 to-rose-50/45 dark:from-amber-950/50 dark:via-slate-900 dark:to-rose-950/35 border-amber-200/80 dark:border-amber-500/30',
    heroAccentStripClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    heroGlowClass:
      'bg-gradient-to-br from-amber-300/35 via-rose-300/20 to-transparent dark:from-amber-500/20 dark:via-rose-500/10 dark:to-transparent',
    cardTopBarClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    cardBorderClass: 'border-amber-200/80 dark:border-amber-500/30',
    cardHoverBorderClass: 'hover:border-amber-300/90 dark:hover:border-amber-500/50',
    headerBandClass:
      'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-rose-50/40 dark:from-amber-950/50 dark:via-slate-900 dark:to-rose-950/30',
    tabActiveClass: 'border-orange-600 text-orange-700 dark:border-amber-400 dark:text-amber-300',
    tabBadgeClass: 'bg-amber-50 text-orange-700 dark:bg-amber-500/15 dark:text-amber-300',
    badgeClass:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    progressFillClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
    progressSecondaryFillClass: 'bg-gradient-to-r from-orange-500 to-rose-500',
    dayBadgeClass: 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-sm',
    accentTextClass: 'text-orange-700 dark:text-amber-300',
    accentIconClass: 'text-orange-600 dark:text-amber-400',
    accentHoverTitleClass: 'group-hover:text-orange-700 dark:group-hover:text-amber-300',
    accentLinkHoverClass: 'hover:text-orange-700 dark:hover:text-amber-300',
    accentGhostBtnClass:
      'text-orange-700 hover:text-orange-800 hover:bg-amber-50/80 dark:text-amber-300 dark:hover:text-amber-200 dark:hover:bg-amber-500/15',
    switcherActiveBgClass: 'bg-amber-50/80 dark:bg-amber-500/15',
  },

  classic: {
    id: 'classic',
    name: 'Классический',
    shortName: 'Классика',
    description: 'Фирменный бирюзово-изумрудный стиль TravelPlanner',
    swatchClass: 'bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600',
    ringClass:
      'ring-2 ring-teal-500/70 dark:ring-teal-400/70 border-teal-400/80 dark:border-teal-400/60',
    heroBannerClass:
      'bg-gradient-to-br from-teal-50/90 via-emerald-50/40 to-white dark:from-teal-950/55 dark:via-slate-900 dark:to-emerald-950/25 border-teal-200/80 dark:border-teal-500/30',
    heroAccentStripClass: 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500',
    heroGlowClass:
      'bg-gradient-to-br from-teal-300/30 via-emerald-300/20 to-transparent dark:from-teal-500/20 dark:via-emerald-500/10 dark:to-transparent',
    cardTopBarClass: 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500',
    cardBorderClass: 'border-teal-200/80 dark:border-teal-500/30',
    cardHoverBorderClass: 'hover:border-teal-300/90 dark:hover:border-teal-500/50',
    headerBandClass:
      'bg-gradient-to-r from-teal-50/85 via-emerald-50/40 to-white dark:from-teal-950/55 dark:via-slate-900 dark:to-slate-900',
    tabActiveClass: 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300',
    tabBadgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    badgeClass:
      'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
    progressFillClass: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    progressSecondaryFillClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    dayBadgeClass: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm',
    accentTextClass: 'text-teal-700 dark:text-teal-300',
    accentIconClass: 'text-teal-600 dark:text-teal-400',
    accentHoverTitleClass: 'group-hover:text-teal-700 dark:group-hover:text-teal-300',
    accentLinkHoverClass: 'hover:text-teal-700 dark:hover:text-teal-300',
    accentGhostBtnClass:
      'text-teal-700 hover:text-teal-800 hover:bg-teal-50/80 dark:text-teal-300 dark:hover:text-teal-200 dark:hover:bg-teal-500/15',
    switcherActiveBgClass: 'bg-teal-50/80 dark:bg-teal-500/15',
  },
};

export const TRIP_THEME_LIST: TripThemePreset[] = TRIP_THEME_IDS.map((id) => TRIP_THEMES[id]);

/**
 * Автоподбор палитры для всех реальных значений TripType из types/index.ts.
 */
export const TRIP_TYPE_TO_THEME_ID: Record<TripType, TripThemeId> = {
  BEACH: 'ocean',
  MOUNTAIN: 'mountain',
  WINTER_SPORT: 'mountain',
  SIGHTSEEING: 'metropolis',
  BUSINESS: 'metropolis',
  WELLNESS_SPA: 'sunset',
  MIXED: 'classic',
};

/**
 * Расширенный словарь с поддержкой дополнительных алиасов на случай будущих типов поездок.
 */
export const TRIP_TYPE_ALIAS_TO_THEME_ID: Record<string, TripThemeId> = {
  ...TRIP_TYPE_TO_THEME_ID,
  COASTAL: 'ocean',
  SEA: 'ocean',
  ACTIVE: 'mountain',
  HIKING: 'mountain',
  SKI: 'mountain',
  CITY: 'metropolis',
  URBAN: 'metropolis',
  CULTURAL: 'metropolis',
  GASTRO: 'sunset',
  GASTRONOMIC: 'sunset',
  EXOTIC: 'sunset',
  ROAD_TRIP: 'sunset',
  ROMANTIC: 'sunset',
};

const TRIP_THEME_ID_SET = new Set<string>(TRIP_THEME_IDS);

export function isValidTripThemeId(value: unknown): value is TripThemeId {
  return typeof value === 'string' && TRIP_THEME_ID_SET.has(value);
}
