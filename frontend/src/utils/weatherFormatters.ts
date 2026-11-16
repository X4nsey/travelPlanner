import { parseIsoDateParts } from '@/composables/useFormatters';

const WEEKDAYS_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;

const MONTHS_SHORT_WEATHER_RU = [
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
] as const;

export function formatSignedTemperature(temp: number, includeUnit = true): string {
  const rounded = Math.round(temp) || 0;
  const prefix = rounded > 0 ? '+' : '';
  return includeUnit ? `${prefix}${rounded}°C` : `${prefix}${rounded}°`;
}

export function formatTemperatureRange(minTemp: number, maxTemp: number): string {
  const rMin = Math.round(minTemp) || 0;
  const rMax = Math.round(maxTemp) || 0;
  if (rMin === rMax) {
    return formatSignedTemperature(rMin, true);
  }
  const minStr = `${rMin > 0 ? '+' : ''}${rMin}`;
  const maxStr = `${rMax > 0 ? '+' : ''}${rMax}`;
  return `${minStr}…${maxStr}°C`;
}

export function formatWeatherDecimal(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',');
}

export function formatWeatherShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const { month, day, dateObj } = parseIsoDateParts(dateStr);
  const weekday = WEEKDAYS_SHORT_RU[dateObj.getUTCDay()];
  const monthLabel = MONTHS_SHORT_WEATHER_RU[month] ?? '';
  return `${weekday}, ${day} ${monthLabel}`;
}

export function formatWeatherUpdatedAt(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
