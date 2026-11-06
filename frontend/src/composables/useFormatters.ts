import type { Currency } from '@/types';

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

const WEEKDAYS_FULL = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export function parseIsoDateParts(dateStr: string): { year: number; month: number; day: number; dateObj: Date } {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const dateObj = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1));
  return { year: y || 2026, month: (m || 1) - 1, day: d || 1, dateObj };
}

export function formatRussianDate(dateStr: string, includeYear = true): string {
  if (!dateStr) return '';
  const { year, month, day } = parseIsoDateParts(dateStr);
  return includeYear ? `${day} ${MONTHS_GENITIVE[month]} ${year}` : `${day} ${MONTHS_GENITIVE[month]}`;
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = parseIsoDateParts(startDateStr);
  const end = parseIsoDateParts(endDateStr);

  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return `${start.day} ${MONTHS_GENITIVE[start.month]} ${start.year}`;
  }
  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${MONTHS_GENITIVE[start.month]} ${start.year}`;
  }
  if (start.year === end.year) {
    return `${start.day} ${MONTHS_SHORT[start.month]} — ${end.day} ${MONTHS_SHORT[end.month]} ${start.year}`;
  }
  return `${start.day} ${MONTHS_SHORT[start.month]} ${start.year} — ${end.day} ${MONTHS_SHORT[end.month]} ${end.year}`;
}

export function formatDayWithWeekday(dateStr: string): string {
  if (!dateStr) return '';
  const { month, day, dateObj } = parseIsoDateParts(dateStr);
  const weekday = WEEKDAYS_FULL[dateObj.getUTCDay()];
  return `${day} ${MONTHS_GENITIVE[month]}, ${weekday}`;
}

export function calculateInclusiveDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const startMs = parseIsoDateParts(startDateStr).dateObj.getTime();
  const endMs = parseIsoDateParts(endDateStr).dateObj.getTime();
  if (endMs < startMs) return 1;
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
}

export function generateCalendarDays(startDateStr: string, endDateStr: string): {
  dayNumber: number;
  date: string;
  label: string;
}[] {
  if (!startDateStr || !endDateStr) return [];
  const startMs = parseIsoDateParts(startDateStr).dateObj.getTime();
  const endMs = parseIsoDateParts(endDateStr).dateObj.getTime();
  if (endMs < startMs) return [];

  const totalDays = Math.min(366, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  const result = [];

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startMs + i * 24 * 60 * 60 * 1000);
    const iso = current.toISOString().slice(0, 10);
    result.push({
      dayNumber: i + 1,
      date: iso,
      label: formatDayWithWeekday(iso),
    });
  }

  return result;
}

export function pluralizeRu(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

export function formatDaysLabel(days: number): string {
  return `${days} ${pluralizeRu(days, ['день', 'дня', 'дней'])}`;
}

export function formatTravelersLabel(count: number): string {
  return `${count} ${pluralizeRu(count, ['путешественник', 'путешественника', 'путешественников'])}`;
}

export function formatCurrency(amount: number | null | undefined, currency: Currency = 'RUB'): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return '0 ₽';
  }
  const symbols: Record<Currency, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  };
  const formattedNumber = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
  }).format(Number(amount));

  return `${formattedNumber} ${symbols[currency] || currency}`;
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTripTimingStatus(startDate: string, endDate: string): {
  status: 'upcoming' | 'ongoing' | 'past';
  label: string;
  badgeClass: string;
} {
  const today = getTodayIso();
  if (endDate < today) {
    return {
      status: 'past',
      label: 'Завершена',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }
  if (startDate <= today && endDate >= today) {
    return {
      status: 'ongoing',
      label: 'Идёт сейчас',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  return {
    status: 'upcoming',
    label: 'Предстоит',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  };
}
