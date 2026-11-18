import type {
  CountryData,
  CountryTravelInfo,
  ItineraryEvent,
  PackingItem,
  PackingSummary,
  Trip,
  TripDocumentDto,
  TripDocumentsSummaryDto,
  TripExpense,
  TripExpenseSummary,
  TripWeatherResponseDto,
} from './index';

export type GuidePreset = 'guidebook' | 'compact' | 'detailed';

export interface GuideSectionsConfig {
  includeCoverPhoto: boolean;
  includeOverviewAndNotes: boolean;
  includeWeather: boolean;
  includeItinerary: boolean;
  includeAllCalendarDays: boolean;
  includeBudgetSummary: boolean;
  includeExpensesTable: boolean;
  includePackingList: boolean;
  onlyUnpackedItems: boolean;
  includeDocuments: boolean;
  includeCountryInfo: boolean;
}

export interface GuideExportOptions {
  preset: GuidePreset;
  sections: GuideSectionsConfig;
  includeToolbar?: boolean;
}

export interface GuideCalendarDay {
  dayNumber: number;
  date: string;
  label: string;
}

export interface TripGuideDataPayload {
  trip: Trip;
  calendarDays: GuideCalendarDay[];
  eventsByDate: Record<string, ItineraryEvent[]>;
  totalEstimatedEventsCost: number;
  expenses: TripExpense[];
  expenseSummary: TripExpenseSummary | null;
  packingItems: PackingItem[];
  packingSummary: PackingSummary | null;
  documents?: TripDocumentDto[];
  documentsSummary?: TripDocumentsSummaryDto | null;
  weather: TripWeatherResponseDto | null;
  matchedCountry: CountryData | null;
  travelInfo: CountryTravelInfo | null;
}

export interface GuidePresetMeta {
  id: GuidePreset;
  title: string;
  description: string;
  badge: string;
  defaultSections: GuideSectionsConfig;
}

export const GUIDE_PRESET_CONFIGS: Record<GuidePreset, GuidePresetMeta> = {
  guidebook: {
    id: 'guidebook',
    title: 'Красивый путеводитель',
    description:
      'Обложка с фото, паспорт поездки, погода, маршрут по дням с событиями, бюджет, вещи, брони и ключевая памятка.',
    badge: 'Рекомендуем',
    defaultSections: {
      includeCoverPhoto: true,
      includeOverviewAndNotes: true,
      includeWeather: true,
      includeItinerary: true,
      includeAllCalendarDays: false,
      includeBudgetSummary: true,
      includeExpensesTable: false,
      includePackingList: true,
      onlyUnpackedItems: false,
      includeDocuments: true,
      includeCountryInfo: true,
    },
  },
  compact: {
    id: 'compact',
    title: 'Компактный маршрут',
    description:
      'Минимум страниц: компактная шапка без обложки, события по дням, краткий бюджет, чек-лист вещей и броней.',
    badge: 'Экономно',
    defaultSections: {
      includeCoverPhoto: false,
      includeOverviewAndNotes: false,
      includeWeather: false,
      includeItinerary: true,
      includeAllCalendarDays: false,
      includeBudgetSummary: true,
      includeExpensesTable: false,
      includePackingList: true,
      onlyUnpackedItems: false,
      includeDocuments: true,
      includeCountryInfo: false,
    },
  },
  detailed: {
    id: 'detailed',
    title: 'Подробный план поездки',
    description:
      'Полный отчёт: все календарные дни, посуточная погода, таблица всех расходов, вещи, брони и 7 секций памятки со ссылками.',
    badge: 'Максимум',
    defaultSections: {
      includeCoverPhoto: true,
      includeOverviewAndNotes: true,
      includeWeather: true,
      includeItinerary: true,
      includeAllCalendarDays: true,
      includeBudgetSummary: true,
      includeExpensesTable: true,
      includePackingList: true,
      onlyUnpackedItems: false,
      includeDocuments: true,
      includeCountryInfo: true,
    },
  },
};

export const ORDERED_GUIDE_PRESETS: readonly GuidePresetMeta[] = [
  GUIDE_PRESET_CONFIGS.guidebook,
  GUIDE_PRESET_CONFIGS.compact,
  GUIDE_PRESET_CONFIGS.detailed,
];

/**
 * Returns a fresh copy of default section toggles for a given guide preset.
 */
export function getDefaultGuideSections(preset: GuidePreset): GuideSectionsConfig {
  return { ...GUIDE_PRESET_CONFIGS[preset].defaultSections };
}
