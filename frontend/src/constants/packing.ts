import type { PackingCategory, TripType } from '@/types';

export interface PackingCategoryMeta {
  category: PackingCategory;
  nameRu: string;
  order: number;
}

export const PACKING_CATEGORY_META: Record<PackingCategory, PackingCategoryMeta> = {
  DOCUMENTS: { category: 'DOCUMENTS', nameRu: 'Документы', order: 0 },
  CLOTHING: { category: 'CLOTHING', nameRu: 'Одежда', order: 1 },
  FOOTWEAR: { category: 'FOOTWEAR', nameRu: 'Обувь', order: 2 },
  TECH: { category: 'TECH', nameRu: 'Техника и связь', order: 3 },
  HYGIENE: { category: 'HYGIENE', nameRu: 'Гигиена и уход', order: 4 },
  PERSONAL: { category: 'PERSONAL', nameRu: 'Личные вещи', order: 5 },
  MEDICINE: { category: 'MEDICINE', nameRu: 'Аптечка', order: 6 },
  ACTIVITY: { category: 'ACTIVITY', nameRu: 'Для активностей', order: 7 },
  OTHER: { category: 'OTHER', nameRu: 'Прочее', order: 8 },
};

export const ORDERED_PACKING_CATEGORIES = [
  'DOCUMENTS',
  'CLOTHING',
  'FOOTWEAR',
  'TECH',
  'HYGIENE',
  'PERSONAL',
  'MEDICINE',
  'ACTIVITY',
  'OTHER',
] as const satisfies readonly PackingCategory[];

export const PACKING_CATEGORY_LABELS_RU: Record<PackingCategory, string> = {
  DOCUMENTS: PACKING_CATEGORY_META.DOCUMENTS.nameRu,
  CLOTHING: PACKING_CATEGORY_META.CLOTHING.nameRu,
  FOOTWEAR: PACKING_CATEGORY_META.FOOTWEAR.nameRu,
  TECH: PACKING_CATEGORY_META.TECH.nameRu,
  HYGIENE: PACKING_CATEGORY_META.HYGIENE.nameRu,
  PERSONAL: PACKING_CATEGORY_META.PERSONAL.nameRu,
  MEDICINE: PACKING_CATEGORY_META.MEDICINE.nameRu,
  ACTIVITY: PACKING_CATEGORY_META.ACTIVITY.nameRu,
  OTHER: PACKING_CATEGORY_META.OTHER.nameRu,
};

export const PACKING_CATEGORY_OPTIONS: Array<{
  value: PackingCategory;
  label: string;
  order: number;
}> = ORDERED_PACKING_CATEGORIES.map((category) => ({
  value: category,
  label: PACKING_CATEGORY_META[category].nameRu,
  order: PACKING_CATEGORY_META[category].order,
}));

export const TRIP_TYPE_VALUES = [
  'BEACH',
  'SIGHTSEEING',
  'MOUNTAIN',
  'BUSINESS',
  'WINTER_SPORT',
  'WELLNESS_SPA',
  'MIXED',
] as const satisfies readonly TripType[];

export const TRIP_TYPE_LABELS_RU: Record<TripType, string> = {
  BEACH: 'Пляжный отдых',
  SIGHTSEEING: 'Экскурсии и прогулки',
  MOUNTAIN: 'Горы и походы',
  BUSINESS: 'Деловая поездка',
  WINTER_SPORT: 'Зимний спорт и лыжи',
  WELLNESS_SPA: 'SPA и оздоровление',
  MIXED: 'Смешанный формат',
};

export const TRIP_TYPE_NULL_LABEL_RU = 'Не указан / Автоопределение';

export interface TripTypeOption {
  value: TripType | null;
  formValue: TripType | '';
  label: string;
}

export const TRIP_TYPE_OPTIONS: TripTypeOption[] = [
  {
    value: null,
    formValue: '',
    label: TRIP_TYPE_NULL_LABEL_RU,
  },
  ...TRIP_TYPE_VALUES.map((type) => ({
    value: type,
    formValue: type,
    label: TRIP_TYPE_LABELS_RU[type],
  })),
];

const PACKING_CATEGORY_SET = new Set<string>(ORDERED_PACKING_CATEGORIES);
const TRIP_TYPE_SET = new Set<string>(TRIP_TYPE_VALUES);

export function isValidPackingCategory(value: unknown): value is PackingCategory {
  return typeof value === 'string' && PACKING_CATEGORY_SET.has(value);
}

export function isValidTripType(value: unknown): value is TripType {
  return typeof value === 'string' && TRIP_TYPE_SET.has(value);
}

export function normalizeTripType(value: unknown): TripType | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toUpperCase();
  return isValidTripType(trimmed) ? trimmed : null;
}

export function getTripTypeLabelRu(tripType?: TripType | null): string {
  if (!tripType) return TRIP_TYPE_NULL_LABEL_RU;
  return TRIP_TYPE_LABELS_RU[tripType] ?? TRIP_TYPE_NULL_LABEL_RU;
}
