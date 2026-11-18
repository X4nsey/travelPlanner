import type { DocumentCategory, DocumentStatus } from '@/types';

export interface DocumentCategoryMeta {
  category: DocumentCategory;
  nameRu: string;
  shortNameRu: string;
  order: number;
  badgeClass: string;
  iconBgClass: string;
}

export const DOCUMENT_CATEGORY_META: Record<DocumentCategory, DocumentCategoryMeta> = {
  FLIGHT_TICKET: {
    category: 'FLIGHT_TICKET',
    nameRu: 'Авиабилеты и проезд',
    shortNameRu: 'Перелёт и проезд',
    order: 0,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    iconBgClass: 'bg-sky-50 text-sky-600 border-sky-200/70',
  },
  HOTEL_BOOKING: {
    category: 'HOTEL_BOOKING',
    nameRu: 'Проживание и отели',
    shortNameRu: 'Проживание',
    order: 1,
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    iconBgClass: 'bg-indigo-50 text-indigo-600 border-indigo-200/70',
  },
  INSURANCE: {
    category: 'INSURANCE',
    nameRu: 'Страховка',
    shortNameRu: 'Страховка',
    order: 2,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    iconBgClass: 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
  },
  VISA_PASSPORT: {
    category: 'VISA_PASSPORT',
    nameRu: 'Паспорт и виза',
    shortNameRu: 'Паспорт и виза',
    order: 3,
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80',
    iconBgClass: 'bg-violet-50 text-violet-600 border-violet-200/70',
  },
  EXCURSION_TICKET: {
    category: 'EXCURSION_TICKET',
    nameRu: 'Билеты и экскурсии',
    shortNameRu: 'Экскурсии',
    order: 4,
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
    iconBgClass: 'bg-teal-50 text-teal-600 border-teal-200/70',
  },
  RENTAL_TRANSFER: {
    category: 'RENTAL_TRANSFER',
    nameRu: 'Аренда авто и трансфер',
    shortNameRu: 'Авто и трансфер',
    order: 5,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    iconBgClass: 'bg-amber-50 text-amber-600 border-amber-200/70',
  },
  OTHER: {
    category: 'OTHER',
    nameRu: 'Прочее',
    shortNameRu: 'Прочее',
    order: 6,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
    iconBgClass: 'bg-slate-100 text-slate-600 border-slate-200/70',
  },
};

export const ORDERED_DOCUMENT_CATEGORIES = [
  'FLIGHT_TICKET',
  'HOTEL_BOOKING',
  'INSURANCE',
  'VISA_PASSPORT',
  'EXCURSION_TICKET',
  'RENTAL_TRANSFER',
  'OTHER',
] as const satisfies readonly DocumentCategory[];

export const DOCUMENT_CATEGORY_OPTIONS: Array<{
  value: DocumentCategory;
  label: string;
}> = ORDERED_DOCUMENT_CATEGORIES.map((category) => ({
  value: category,
  label: DOCUMENT_CATEGORY_META[category].nameRu,
}));

export interface DocumentStatusMeta {
  status: DocumentStatus;
  nameRu: string;
  order: number;
  pillClass: string;
  activeButtonClass: string;
}

export const DOCUMENT_STATUS_META: Record<DocumentStatus, DocumentStatusMeta> = {
  REQUIRED: {
    status: 'REQUIRED',
    nameRu: 'Нужно оформить',
    order: 0,
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    activeButtonClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
  },
  PENDING: {
    status: 'PENDING',
    nameRu: 'В процессе',
    order: 1,
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    activeButtonClass: 'bg-amber-500 text-white border-amber-500 shadow-sm',
  },
  READY: {
    status: 'READY',
    nameRu: 'Готово',
    order: 2,
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    activeButtonClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
  },
};

export const ORDERED_DOCUMENT_STATUSES = [
  'REQUIRED',
  'PENDING',
  'READY',
] as const satisfies readonly DocumentStatus[];

export function getDocumentCategoryMeta(category: DocumentCategory): DocumentCategoryMeta {
  return DOCUMENT_CATEGORY_META[category] ?? DOCUMENT_CATEGORY_META.OTHER;
}

export function getDocumentStatusMeta(status: DocumentStatus): DocumentStatusMeta {
  return DOCUMENT_STATUS_META[status] ?? DOCUMENT_STATUS_META.READY;
}
