export type Currency = 'RUB' | 'USD' | 'EUR';

export type TripType =
  | 'BEACH'
  | 'SIGHTSEEING'
  | 'MOUNTAIN'
  | 'BUSINESS'
  | 'WINTER_SPORT'
  | 'WELLNESS_SPA'
  | 'MIXED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryEvent {
  id: string;
  tripId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  location: string | null;
  estimatedCost: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  country: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  travelersCount: number;
  budget: number;
  currency: Currency;
  tripType: TripType | null;
  description: string;
  eventsCount?: number;
  events?: ItineraryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TripFormPayload {
  title: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  budget: number;
  currency: Currency;
  tripType?: TripType | null;
  description: string;
}

export interface EventFormPayload {
  title: string;
  description: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  estimatedCost: number | null;
  note: string | null;
}

export type ExpenseCategory =
  | 'TRANSPORT'
  | 'FOOD'
  | 'LODGING'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'OTHER';

export interface TripExpense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  categoryNameRu: string;
  categoryColor: string;
  amount: number;
  currency: Currency;
  expenseDate: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryStat {
  category: ExpenseCategory;
  nameRu: string;
  color: string;
  icon: string;
  totalAmount: number;
  percentage: number;
  count: number;
}

export interface TripExpenseSummary {
  plannedBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
  status: 'under_budget' | 'near_budget' | 'over_budget';
  currency: Currency;
  byCategory: ExpenseCategoryStat[];
}

export interface ExpenseFormPayload {
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  expenseDate: string;
  description?: string;
}

export type PackingCategory =
  | 'DOCUMENTS'
  | 'CLOTHING'
  | 'FOOTWEAR'
  | 'TECH'
  | 'HYGIENE'
  | 'PERSONAL'
  | 'MEDICINE'
  | 'ACTIVITY'
  | 'OTHER';

export type PackingItemSource = 'GENERATED' | 'CUSTOM';

export type PackingActivityTag =
  | 'beach'
  | 'waterpark'
  | 'sightseeing'
  | 'hiking'
  | 'cycling'
  | 'winter_sport'
  | 'pool_spa'
  | 'business'
  | 'camping'
  | 'flight'
  | 'car_travel'
  | 'evening_out';

export type PackingClimateHint =
  | 'tropical_warm'
  | 'warm_season'
  | 'cool_season'
  | 'shoulder_or_uncertain';

export interface PackingDetectedActivity {
  tag: PackingActivityTag;
  labelRu: string;
  confidence: number;
  reason: string;
  sources: string[];
}

export interface PackingContextSnapshot {
  version: number;
  durationDays: number;
  confirmedTravelersCount: number | null;
  assumedTravelersCount: number;
  travelersAssumed: boolean;
  climateHint: PackingClimateHint;
  climateLabelRu: string;
  weatherSourceMode?: 'forecast' | 'seasonal_reference' | 'heuristic';
  countryMatchedSlug: string | null;
  detectedActivities: PackingDetectedActivity[];
  lowConfidenceSignals: PackingActivityTag[];
  eventsAnalyzedCount: number;
}

export interface PackingItem {
  id: string;
  packingListId: string;
  category: PackingCategory;
  categoryNameRu: string;
  name: string;
  quantity: number | null;
  isPacked: boolean;
  source: PackingItemSource;
  ruleKey: string | null;
  reason: string | null;
  isEditedByUser: boolean;
  isOutdated: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackingListMeta {
  id: string;
  tripId: string;
  lastGeneratedAt: string | null;
  contextSnapshot: PackingContextSnapshot | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackingCategorySummary {
  category: PackingCategory;
  nameRu: string;
  total: number;
  packed: number;
}

export interface PackingSummary {
  total: number;
  packed: number;
  unpacked: number;
  outdated: number;
  custom: number;
  generated: number;
  progressPercentage: number;
  byCategory: PackingCategorySummary[];
}

export interface PackingMergeStats {
  addedCount: number;
  updatedCount: number;
  outdatedCount: number;
  restoredFromOutdatedCount: number;
  preservedDismissedCount: number;
  preservedEditedCount: number;
}

export interface PackingListResponse {
  exists: boolean;
  packingList: PackingListMeta | null;
  items: PackingItem[];
  summary: PackingSummary;
}

export interface PackingGenerateResponse extends PackingListResponse {
  mergeStats: PackingMergeStats;
}

export interface CreatePackingItemPayload {
  name: string;
  category: PackingCategory;
  quantity?: number | null;
}

export interface UpdatePackingItemPayload {
  name?: string;
  category?: PackingCategory;
  quantity?: number | null;
  isPacked?: boolean;
}

export interface DeletePackingItemResponse {
  deleted: boolean;
  mode: 'hard' | 'dismissed';
  id: string;
}

export interface ClearOutdatedResponse {
  deletedCount: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ContinentName =
  | 'Европа'
  | 'Азия'
  | 'Африка'
  | 'Северная Америка'
  | 'Южная Америка'
  | 'Океания';

export type PhotoVerificationStatus =
  | 'verified'
  | 'needs_review'
  | 'missing'
  | 'broken'
  | 'rejected';

export type PhotoEntityType =
  | 'country'
  | 'city'
  | 'landmark'
  | 'nature'
  | 'architecture';

export interface CountryPhoto {
  url: string;
  thumbUrl: string;
  alt: string;
  category?: 'Города' | 'Природа' | 'Архитектура' | 'Туристические места' | 'Обложка';
  objectName?: string;
  country?: string;
  city?: string;
  entityType?: PhotoEntityType;
  authorName: string;
  authorUrl: string;
  sourceName: 'Unsplash' | 'Pexels' | 'Wikimedia' | 'Wikimedia Commons' | 'Local';
  sourceUrl: string;
  license?: string;
  verified?: boolean;
  verificationStatus?: PhotoVerificationStatus;
  verificationNotes?: string;
}

export interface CountryCityItem {
  name: string;
  description: string;
  photoUrl: string;
  thumbUrl?: string;
  authorName?: string;
  authorUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  verified?: boolean;
  verificationStatus?: PhotoVerificationStatus;
}

export interface CountryLandmarkItem {
  name: string;
  city: string;
  category: string;
  description: string;
  photoUrl?: string;
  thumbUrl?: string;
  authorName?: string;
  authorUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  verified?: boolean;
  verificationStatus?: PhotoVerificationStatus;
}

export interface PhotoDiagnosticItem {
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
  manualOverride?: boolean;
  verificationStatus: PhotoVerificationStatus;
  verificationNotes: string;
  hasDbOverride: boolean;
  isDuplicate?: boolean;
  duplicateOf?: string;
  lastCheckedAt: string;
}

export interface PhotoDiagnosticsSummary {
  totalImages: number;
  verifiedCount: number;
  missingCount: number;
  errorCount: number;
  needsReviewCount: number;
  duplicateCount?: number;
  dbOverridesCount: number;
  manualOverridesCount?: number;
  bySection: {
    cover: number;
    gallery: number;
    city: number;
    landmark: number;
  };
}

export interface PhotoDiagnosticsReport {
  summary: PhotoDiagnosticsSummary;
  items: PhotoDiagnosticItem[];
  generatedAt: string;
}

export interface TravelInfoSection {
  summary: string;
  details: string[];
  officialLinks?: Array<{ title: string; url: string }>;
  lastUpdated?: string; // YYYY-MM
}

export interface CountryTravelInfo {
  entryRules: TravelInfoSection; // Визы, правила въезда, паспорта
  moneyAndPayments: TravelInfoSection; // Валюта, карты, наличные, чаевые
  transport: TravelInfoSection; // Общественный транспорт, такси, аренда авто
  cultureAndEtiquette: TravelInfoSection; // Обычаи, дресс-код, правила поведения
  telecomAndInternet: TravelInfoSection; // SIM-карты, eSIM, Wi-Fi
  safetyAndEmergency: TravelInfoSection; // Экстренные номера, уровень безопасности
  practicalTips: TravelInfoSection; // Розетки, напряжение, розничные часы, вода
}

export interface CountryTravelInfoResponse extends CountryTravelInfo {
  slug: string;
  nameRu: string;
  nameEn: string;
  flagEmoji: string;
  flagUrl: string;
  capital: string;
  currency: string;
  languages: string[];
  timezone?: string;
  travelInfo: CountryTravelInfo;
}

export interface CountryData {
  slug: string;
  isoNumeric: string;
  isoAlpha2: string;
  nameRu: string;
  nameEn: string;
  flagEmoji: string;
  flagUrl: string;
  capital: string;
  continent: ContinentName;
  population: number;
  area: number;
  languages: string[];
  currency: string;
  defaultTripCurrency: Currency;
  timezone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  shortDescription: string;
  description: string;
  coverPhoto: CountryPhoto;
  gallery: CountryPhoto[];
  popularCities: CountryCityItem[];
  landmarks: CountryLandmarkItem[];
  travelInfo?: CountryTravelInfo;
  featured?: boolean;
  favoritedAt?: string;
}

export * from './weather';
export * from './guideExport';

