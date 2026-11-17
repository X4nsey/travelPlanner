import {
  ORDERED_PACKING_CATEGORIES,
  PACKING_CATEGORY_META,
  getTripTypeLabelRu,
} from '@/constants/packing';
import {
  formatCurrency,
  formatDateRange,
  formatDaysLabel,
  formatRussianDate,
  formatTravelersLabel,
  getTripTimingStatus,
} from '@/composables/useFormatters';
import {
  formatSignedTemperature,
  formatTemperatureRange,
  formatWeatherDecimal,
  formatWeatherShortDate,
} from '@/utils/weatherFormatters';
import type {
  CountryTravelInfo,
  Currency,
  ExpenseCategoryStat,
  GuideExportOptions,
  GuidePreset,
  ItineraryEvent,
  PackingCategory,
  PackingItem,
  PackingSummary,
  TravelInfoSection,
  Trip,
  TripExpense,
  TripExpenseSummary,
  TripGuideDataPayload,
  WeatherIconType,
} from '@/types';

const TOOLBAR_MARKER = 'data-tp-offline-toolbar="true"';

interface TravelSectionMeta {
  key: keyof CountryTravelInfo;
  title: string;
  accent: string;
}

const TRAVEL_INFO_SECTIONS: readonly TravelSectionMeta[] = [
  { key: 'entryRules', title: 'Правила въезда и визы', accent: '#4f46e5' },
  { key: 'moneyAndPayments', title: 'Валюта и оплата', accent: '#059669' },
  { key: 'transport', title: 'Транспорт', accent: '#0d9488' },
  { key: 'cultureAndEtiquette', title: 'Культура и этикет', accent: '#d97706' },
  { key: 'telecomAndInternet', title: 'Связь и интернет', accent: '#0284c7' },
  { key: 'safetyAndEmergency', title: 'Безопасность и экстренные службы', accent: '#e11d48' },
  { key: 'practicalTips', title: 'Практические советы', accent: '#7c3aed' },
];

const WEATHER_SVG_PATHS: Record<WeatherIconType, string> = {
  sunny:
    '<circle cx="12" cy="12" r="4.5" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" stroke="#d97706" stroke-width="1.6" stroke-linecap="round"/>',
  partly_cloudy:
    '<circle cx="9" cy="8.5" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1.3"/><path d="M7.5 19h9.2a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 7.9 11.1a3.9 3.9 0 0 0-.4 7.9Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.4" stroke-linejoin="round"/>',
  cloudy:
    '<path d="M6.8 18.5h10.4a3.6 3.6 0 0 0 .5-7.16A5.2 5.2 0 0 0 7.6 10a4.2 4.2 0 0 0-.8 8.5Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5" stroke-linejoin="round"/>',
  fog:
    '<path d="M6.5 14h11a3.2 3.2 0 0 0 .4-6.38A4.6 4.6 0 0 0 8.8 6.4 3.8 3.8 0 0 0 6.5 14Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.4"/><path d="M4.5 17.2h15M6.5 20h11" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>',
  drizzle:
    '<path d="M6.5 14.5h10.8a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 8.4 6.7a3.9 3.9 0 0 0-1.9 7.8Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.4"/><path d="M8.5 17.5l-.8 2M12.5 17.5l-.8 2M16.5 17.5l-.8 2" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>',
  rain:
    '<path d="M6.5 14.2h10.8a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 8.4 6.4a3.9 3.9 0 0 0-1.9 7.8Z" fill="#cbd5e1" stroke="#475569" stroke-width="1.4"/><path d="M8.5 17l-1.2 3.3M12.5 17l-1.2 3.3M16.5 17l-1.2 3.3" stroke="#0284c7" stroke-width="1.7" stroke-linecap="round"/>',
  heavy_rain:
    '<path d="M6.5 13.8h10.8a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 8.4 6a3.9 3.9 0 0 0-1.9 7.8Z" fill="#94a3b8" stroke="#334155" stroke-width="1.4"/><path d="M7.5 16.5l-1.5 4M11.2 16.5l-1.5 4M14.8 16.5l-1.5 4M18 16.5l-1.5 4" stroke="#0369a1" stroke-width="1.7" stroke-linecap="round"/>',
  snow:
    '<path d="M6.5 14.2h10.8a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 8.4 6.4a3.9 3.9 0 0 0-1.9 7.8Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.4"/><circle cx="8.5" cy="18.2" r="1.1" fill="#0ea5e9"/><circle cx="12.2" cy="19.2" r="1.1" fill="#0ea5e9"/><circle cx="15.8" cy="18.2" r="1.1" fill="#0ea5e9"/>',
  thunderstorm:
    '<path d="M6.5 13.8h10.8a3.3 3.3 0 0 0 .4-6.58A4.8 4.8 0 0 0 8.4 6a3.9 3.9 0 0 0-1.9 7.8Z" fill="#94a3b8" stroke="#334155" stroke-width="1.4"/><path d="M13 14.2l-2.5 3.6h2.4l-1.4 3.4 4-4.5h-2.4l1.4-2.5Z" fill="#f59e0b" stroke="#d97706" stroke-width="0.9" stroke-linejoin="round"/>',
};

/**
 * Escapes HTML special characters to protect rendered guide output against XSS.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes URLs for img/a attributes, allowing only http(s) and root-relative paths.
 */
function sanitizeSafeUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${trimmed}`;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

function renderWeatherSvg(iconType: WeatherIconType): string {
  const paths = WEATHER_SVG_PATHS[iconType] ?? WEATHER_SVG_PATHS.partly_cloudy;
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style="display:block;flex-shrink:0;">${paths}</svg>`;
}

function formatMonthYearRu(value?: string): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const date = new Date(Date.UTC(year, monthIdx, 1));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function formatEventTimeLabel(ev: ItineraryEvent): string {
  if (ev.startTime && ev.endTime) {
    return `${ev.startTime} – ${ev.endTime}`;
  }
  if (ev.startTime) {
    return `с ${ev.startTime}`;
  }
  if (ev.endTime) {
    return `до ${ev.endTime}`;
  }
  return 'Весь день';
}

function buildFallbackExpenseSummary(
  trip: Trip,
  expenses: TripExpense[]
): TripExpenseSummary {
  const totalSpent = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * 100) / 100;
  const plannedBudget = Number(trip.budget || 0);
  const remainingBudget = Math.round((plannedBudget - totalSpent) * 100) / 100;
  const spentPercentage =
    plannedBudget > 0 ? Math.round((totalSpent / plannedBudget) * 1000) / 10 : 0;

  let status: TripExpenseSummary['status'] = 'under_budget';
  if (totalSpent > plannedBudget && plannedBudget > 0) {
    status = 'over_budget';
  } else if (spentPercentage >= 80) {
    status = 'near_budget';
  }

  return {
    plannedBudget,
    totalSpent,
    remainingBudget,
    spentPercentage,
    status,
    currency: trip.currency,
    byCategory: [],
  };
}

function computePackingTotals(items: PackingItem[], summary: PackingSummary | null) {
  if (summary && (summary.total > 0 || items.length === 0)) {
    return {
      total: summary.total,
      packed: summary.packed,
      unpacked: summary.unpacked,
      progressPercentage: summary.progressPercentage,
    };
  }
  const total = items.length;
  const packed = items.filter((item) => item.isPacked).length;
  return {
    total,
    packed,
    unpacked: total - packed,
    progressPercentage: total > 0 ? Math.round((packed / total) * 1000) / 10 : 0,
  };
}

function groupPackingItems(items: PackingItem[]): Array<{
  category: PackingCategory;
  nameRu: string;
  items: PackingItem[];
}> {
  const grouped: Record<PackingCategory, PackingItem[]> = {
    DOCUMENTS: [],
    CLOTHING: [],
    FOOTWEAR: [],
    TECH: [],
    HYGIENE: [],
    PERSONAL: [],
    MEDICINE: [],
    ACTIVITY: [],
    OTHER: [],
  };

  for (const item of items) {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    } else {
      grouped.OTHER.push(item);
    }
  }

  return ORDERED_PACKING_CATEGORIES.map((category) => ({
    category,
    nameRu: PACKING_CATEGORY_META[category].nameRu,
    items: grouped[category],
  })).filter((group) => group.items.length > 0);
}

function renderStandaloneToolbar(tripTitle: string): string {
  return `
    <div class="tp-offline-toolbar no-print" ${TOOLBAR_MARKER}>
      <div class="tp-offline-toolbar-inner">
        <div class="tp-offline-brand">
          <span class="tp-offline-dot"></span>
          <span>TravelPlanner · Офлайн-путеводитель: <strong>${escapeHtml(tripTitle)}</strong></span>
        </div>
        <button type="button" class="tp-offline-print-btn" onclick="window.print()">
          Сохранить в PDF / Печать
        </button>
      </div>
    </div>
  `;
}

function renderHeaderSection(
  payload: TripGuideDataPayload,
  includeCoverPhoto: boolean,
  preset: GuidePreset
): string {
  const { trip, matchedCountry } = payload;
  const timing = getTripTimingStatus(trip.startDate, trip.endDate);
  const coverUrl = includeCoverPhoto ? sanitizeSafeUrl(matchedCountry?.coverPhoto?.url) : '';
  const flagUrl = sanitizeSafeUrl(matchedCountry?.flagUrl);
  const flagEmoji = matchedCountry?.flagEmoji || '';
  const tripTypeLabel = trip.tripType ? getTripTypeLabelRu(trip.tripType) : '';

  const flagMarkup = flagUrl
    ? `<img class="tp-flag" src="${escapeHtml(flagUrl)}" alt="${escapeHtml(trip.country)}" onerror="this.style.display='none'" />`
    : flagEmoji
      ? `<span class="tp-flag-emoji" aria-hidden="true">${escapeHtml(flagEmoji)}</span>`
      : '';

  const passportGrid = `
    <div class="tp-passport-grid">
      <div class="tp-passport-cell">
        <span class="tp-meta-label">Даты поездки</span>
        <strong class="tp-meta-value">${escapeHtml(formatDateRange(trip.startDate, trip.endDate))}</strong>
      </div>
      <div class="tp-passport-cell">
        <span class="tp-meta-label">Длительность</span>
        <strong class="tp-meta-value">${escapeHtml(formatDaysLabel(trip.durationDays))}</strong>
      </div>
      <div class="tp-passport-cell">
        <span class="tp-meta-label">Путешественники</span>
        <strong class="tp-meta-value">${escapeHtml(formatTravelersLabel(trip.travelersCount))}</strong>
      </div>
      <div class="tp-passport-cell">
        <span class="tp-meta-label">Плановый бюджет</span>
        <strong class="tp-meta-value">${escapeHtml(formatCurrency(trip.budget, trip.currency))}</strong>
      </div>
    </div>
  `;

  if (!includeCoverPhoto) {
    return `
      <header class="tp-compact-header avoid-break ${preset === 'compact' ? 'is-compact' : ''}">
        <div class="tp-compact-top">
          <div class="tp-compact-title-wrap">
            <div class="tp-badges-row">
              <span class="tp-badge tp-badge-brand">TravelPlanner</span>
              <span class="tp-badge tp-badge-neutral">${escapeHtml(timing.label)}</span>
              ${tripTypeLabel ? `<span class="tp-badge tp-badge-accent">${escapeHtml(tripTypeLabel)}</span>` : ''}
            </div>
            <h1 class="tp-title-compact">${escapeHtml(trip.title)}</h1>
            <div class="tp-location-row">
              ${flagMarkup}
              <span>${escapeHtml(trip.country)}, ${escapeHtml(trip.city)}</span>
            </div>
          </div>
        </div>
        ${passportGrid}
      </header>
    `;
  }

  const authorCredit =
    coverUrl && matchedCountry?.coverPhoto?.authorName
      ? `<div class="tp-cover-credit">Фото: ${escapeHtml(matchedCountry.coverPhoto.authorName)}</div>`
      : '';

  return `
    <header class="tp-hero-wrap avoid-break">
      <div class="tp-hero">
        ${
          coverUrl
            ? `<img class="tp-hero-img" src="${escapeHtml(coverUrl)}" alt="${escapeHtml(trip.country)}" onerror="this.style.display='none'" />`
            : ''
        }
        <div class="tp-hero-overlay"></div>
        <div class="tp-hero-content">
          <div class="tp-badges-row">
            <span class="tp-badge tp-badge-glass">TravelPlanner · Путеводитель</span>
            <span class="tp-badge tp-badge-glass">${escapeHtml(timing.label)}</span>
            ${tripTypeLabel ? `<span class="tp-badge tp-badge-glass">${escapeHtml(tripTypeLabel)}</span>` : ''}
          </div>
          <h1 class="tp-hero-title">${escapeHtml(trip.title)}</h1>
          <div class="tp-hero-bottom">
            <div class="tp-hero-location">
              ${flagMarkup}
              <span>${escapeHtml(trip.country)}, ${escapeHtml(trip.city)}</span>
            </div>
            ${authorCredit}
          </div>
        </div>
      </div>
      ${passportGrid}
    </header>
  `;
}

function renderOverviewSection(payload: TripGuideDataPayload): string {
  const { trip, totalEstimatedEventsCost } = payload;
  const totalEventsCount = (trip.events || []).length;
  const hasDescription = Boolean(trip.description && trip.description.trim());

  return `
    <section class="tp-section avoid-break">
      <div class="tp-section-header">
        <h2 class="tp-section-title">Обзор поездки и заметки</h2>
        <span class="tp-section-pill">${escapeHtml(formatDaysLabel(trip.durationDays))}</span>
      </div>
      <div class="tp-card">
        ${
          hasDescription
            ? `<p class="tp-description">${escapeHtml(trip.description)}</p>`
            : `<p class="tp-muted-note">Описание и личные заметки к поездке не добавлены.</p>`
        }
        <div class="tp-overview-kpis">
          <div class="tp-mini-kpi">
            <span class="tp-meta-label">Мероприятий в плане</span>
            <strong>${totalEventsCount}</strong>
          </div>
          <div class="tp-mini-kpi">
            <span class="tp-meta-label">Оценка затрат по плану</span>
            <strong>${escapeHtml(formatCurrency(totalEstimatedEventsCost, trip.currency))}</strong>
          </div>
          <div class="tp-mini-kpi">
            <span class="tp-meta-label">Направление</span>
            <strong>${escapeHtml(trip.city)}, ${escapeHtml(trip.country)}</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderWeatherSection(payload: TripGuideDataPayload, preset: GuidePreset): string {
  const { weather } = payload;

  if (!weather) {
    return `
      <section class="tp-section avoid-break">
        <div class="tp-section-header">
          <h2 class="tp-section-title">Погода в поездке</h2>
        </div>
        <div class="tp-empty-card">Данные о погоде для поездки ещё не загружены.</div>
      </section>
    `;
  }

  const summary = weather.summary;
  const tempRange = formatTemperatureRange(summary.minTemp, summary.maxTemp);
  const avgDay = formatSignedTemperature(summary.avgTempMax);
  const avgNight = formatSignedTemperature(summary.avgTempMin);
  const totalPrecip = `${formatWeatherDecimal(summary.totalPrecipitationMm)} мм`;
  const maxWind = `${formatWeatherDecimal(summary.maxWindKmh)} км/ч`;
  const modeClass = weather.sourceMode === 'forecast' ? 'tp-pill-emerald' : 'tp-pill-amber';

  const dailyCards = (weather.daily || [])
    .map(
      (day) => `
      <div class="tp-weather-day avoid-break">
        <div class="tp-weather-day-top">
          <div>
            <div class="tp-weather-date">${escapeHtml(formatWeatherShortDate(day.date))}</div>
            <div class="tp-weather-cond">${escapeHtml(day.conditionRu)}</div>
          </div>
          ${renderWeatherSvg(day.iconType)}
        </div>
        <div class="tp-weather-temps">
          <span class="tp-temp-max">${escapeHtml(formatSignedTemperature(day.tempMax, true))}</span>
          <span class="tp-temp-min">/ ${escapeHtml(formatSignedTemperature(day.tempMin, true))}</span>
        </div>
        <div class="tp-weather-foot">
          <span>Осадки: ${escapeHtml(formatWeatherDecimal(day.precipitationMm))} мм${
            day.precipitationProbMax !== null ? ` (${day.precipitationProbMax}%)` : ''
          }</span>
          <span>Ветер: ${escapeHtml(formatWeatherDecimal(day.windSpeedMaxKmh))} км/ч</span>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <section class="tp-section">
      <div class="tp-section-header avoid-break">
        <div>
          <h2 class="tp-section-title">Погода в поездке</h2>
          <p class="tp-section-sub">
            ${escapeHtml(weather.resolvedCity)}, ${escapeHtml(weather.resolvedCountry)} · ${escapeHtml(weather.climateLabelRu)}
          </p>
        </div>
        <span class="tp-section-pill ${modeClass}">${escapeHtml(weather.sourceLabelRu)}</span>
      </div>

      <div class="tp-weather-summary avoid-break">
        <div class="tp-weather-stat">
          <span class="tp-meta-label">Диапазон температур</span>
          <strong>${escapeHtml(tempRange)}</strong>
          <small>Ср. днём ${escapeHtml(avgDay)} / ночью ${escapeHtml(avgNight)}</small>
        </div>
        <div class="tp-weather-stat">
          <span class="tp-meta-label">Дождливых дней</span>
          <strong>${summary.rainyDaysCount}</strong>
          <small>За период поездки</small>
        </div>
        <div class="tp-weather-stat">
          <span class="tp-meta-label">Сумма осадков</span>
          <strong>${escapeHtml(totalPrecip)}</strong>
          <small>${summary.hasHeavyRain ? 'Возможны ливни' : summary.hasSnow ? 'Ожидается снег' : 'Умеренно'}</small>
        </div>
        <div class="tp-weather-stat">
          <span class="tp-meta-label">Макс. ветер</span>
          <strong>${escapeHtml(maxWind)}</strong>
          <small>${escapeHtml(weather.timezone)}</small>
        </div>
      </div>

      ${
        weather.disclaimerRu
          ? `<div class="tp-callout tp-callout-info avoid-break">${escapeHtml(weather.disclaimerRu)}</div>`
          : ''
      }

      ${
        dailyCards
          ? `<div class="tp-weather-grid ${preset === 'compact' ? 'is-compact' : ''}">${dailyCards}</div>`
          : ''
      }
    </section>
  `;
}

function renderItinerarySection(
  payload: TripGuideDataPayload,
  includeAllCalendarDays: boolean,
  preset: GuidePreset
): string {
  const { trip, calendarDays, eventsByDate } = payload;

  const visibleDays = includeAllCalendarDays
    ? calendarDays
    : calendarDays.filter((day) => (eventsByDate[day.date] || []).length > 0);

  const totalEventsCount = (trip.events || []).length;

  if (visibleDays.length === 0) {
    return `
      <section class="tp-section avoid-break">
        <div class="tp-section-header">
          <h2 class="tp-section-title">План поездки по дням</h2>
          <span class="tp-section-pill">0 мероприятий</span>
        </div>
        <div class="tp-empty-card">
          ${
            totalEventsCount === 0
              ? 'Мероприятия в маршрут пока не добавлены.'
              : 'Дни с запланированными мероприятиями не найдены.'
          }
        </div>
      </section>
    `;
  }

  const dayBlocks = visibleDays
    .map((day) => {
      const dayEvents = eventsByDate[day.date] || [];

      const eventsMarkup =
        dayEvents.length === 0
          ? `<div class="tp-day-empty">Свободный день — запланированных мероприятий нет</div>`
          : dayEvents
              .map((ev) => {
                const timeLabel = formatEventTimeLabel(ev);
                const costMarkup =
                  ev.estimatedCost !== null && ev.estimatedCost !== undefined
                    ? `<span class="tp-event-cost">${escapeHtml(formatCurrency(ev.estimatedCost, trip.currency))}</span>`
                    : '';

                return `
                  <article class="tp-event-row avoid-break">
                    <div class="tp-event-time-col">
                      <span class="tp-event-time">${escapeHtml(timeLabel)}</span>
                      ${costMarkup}
                    </div>
                    <div class="tp-event-body">
                      <div class="tp-event-title">${escapeHtml(ev.title)}</div>
                      ${
                        ev.location
                          ? `<div class="tp-event-location">📍 ${escapeHtml(ev.location)}</div>`
                          : ''
                      }
                      ${
                        ev.description
                          ? `<p class="tp-event-desc">${escapeHtml(ev.description)}</p>`
                          : ''
                      }
                      ${
                        ev.note
                          ? `<div class="tp-event-note"><strong>Заметка:</strong> ${escapeHtml(ev.note)}</div>`
                          : ''
                      }
                    </div>
                  </article>
                `;
              })
              .join('');

      return `
        <div class="tp-day-card ${preset === 'compact' ? 'is-compact' : ''}">
          <div class="tp-day-header avoid-break">
            <div class="tp-day-header-left">
              <span class="tp-day-badge">День ${day.dayNumber}</span>
              <h3 class="tp-day-title">${escapeHtml(day.label)}</h3>
            </div>
            <span class="tp-day-count">${dayEvents.length} ${dayEvents.length === 1 ? 'событие' : dayEvents.length >= 2 && dayEvents.length <= 4 ? 'события' : 'событий'}</span>
          </div>
          <div class="tp-day-events">
            ${eventsMarkup}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="tp-section">
      <div class="tp-section-header avoid-break">
        <div>
          <h2 class="tp-section-title">План поездки по дням</h2>
          <p class="tp-section-sub">
            ${includeAllCalendarDays ? 'Все календарные дни маршрута' : 'Дни с запланированными мероприятиями'}
          </p>
        </div>
        <span class="tp-section-pill">${totalEventsCount} мероприятий</span>
      </div>
      <div class="tp-days-stack">
        ${dayBlocks}
      </div>
    </section>
  `;
}

function getBudgetStatusMeta(status: TripExpenseSummary['status']): {
  label: string;
  badgeClass: string;
  barColor: string;
} {
  if (status === 'over_budget') {
    return { label: 'Превышен', badgeClass: 'tp-pill-rose', barColor: '#e11d48' };
  }
  if (status === 'near_budget') {
    return { label: 'Близко к лимиту', badgeClass: 'tp-pill-amber', barColor: '#d97706' };
  }
  return { label: 'В норме', badgeClass: 'tp-pill-emerald', barColor: '#0d9488' };
}

function renderBudgetSummaryBlock(
  trip: Trip,
  summary: TripExpenseSummary,
  expensesCount: number,
  preset: GuidePreset
): string {
  const statusMeta = getBudgetStatusMeta(summary.status);
  const activeCategories: ExpenseCategoryStat[] = (summary.byCategory || []).filter(
    (c) => c.totalAmount > 0 || c.count > 0
  );

  if (preset === 'compact') {
    const categoryChips = activeCategories
      .map(
        (cat) => `
          <span class="tp-cat-chip">
            <span class="tp-dot" style="background:${escapeHtml(cat.color)};"></span>
            <span>${escapeHtml(cat.nameRu)}: <strong>${escapeHtml(formatCurrency(cat.totalAmount, summary.currency))}</strong> (${cat.percentage}%)</span>
          </span>
        `
      )
      .join('');

    return `
      <div class="tp-budget-compact avoid-break">
        <div class="tp-budget-compact-line">
          <span><strong>План:</strong> ${escapeHtml(formatCurrency(summary.plannedBudget, summary.currency))}</span>
          <span><strong>Потрачено:</strong> ${escapeHtml(formatCurrency(summary.totalSpent, summary.currency))}</span>
          <span><strong>Остаток:</strong> <span class="${summary.remainingBudget < 0 ? 'tp-text-rose' : 'tp-text-emerald'}">${escapeHtml(formatCurrency(summary.remainingBudget, summary.currency))}</span></span>
          <span><strong>Освоено:</strong> ${summary.spentPercentage}%</span>
          <span class="tp-section-pill ${statusMeta.badgeClass}">${escapeHtml(statusMeta.label)}</span>
        </div>
        ${categoryChips ? `<div class="tp-cat-chips-row">${categoryChips}</div>` : ''}
      </div>
    `;
  }

  const categoryRows = activeCategories
    .map(
      (cat) => `
        <div class="tp-cat-row">
          <div class="tp-cat-name">
            <span class="tp-dot" style="background:${escapeHtml(cat.color)};"></span>
            <span>${escapeHtml(cat.nameRu)}</span>
            <small>(${cat.count})</small>
          </div>
          <div class="tp-cat-bar-track">
            <div class="tp-cat-bar-fill" style="width:${Math.min(100, Math.max(0, cat.percentage))}%;background:${escapeHtml(cat.color)};"></div>
          </div>
          <div class="tp-cat-amount">
            <strong>${escapeHtml(formatCurrency(cat.totalAmount, summary.currency))}</strong>
            <small>${cat.percentage}%</small>
          </div>
        </div>
      `
    )
    .join('');

  return `
    <div class="tp-budget-kpis avoid-break">
      <div class="tp-kpi-box">
        <span class="tp-meta-label">План бюджета</span>
        <strong>${escapeHtml(formatCurrency(summary.plannedBudget, summary.currency))}</strong>
      </div>
      <div class="tp-kpi-box">
        <span class="tp-meta-label">Фактически потрачено</span>
        <strong>${escapeHtml(formatCurrency(summary.totalSpent, summary.currency))}</strong>
        <small>Операций: ${expensesCount}</small>
      </div>
      <div class="tp-kpi-box">
        <span class="tp-meta-label">Остаток бюджета</span>
        <strong class="${summary.remainingBudget < 0 ? 'tp-text-rose' : 'tp-text-emerald'}">
          ${escapeHtml(formatCurrency(summary.remainingBudget, summary.currency))}
        </strong>
      </div>
      <div class="tp-kpi-box">
        <div class="tp-kpi-top">
          <span class="tp-meta-label">Освоение</span>
          <span class="tp-section-pill ${statusMeta.badgeClass}">${escapeHtml(statusMeta.label)}</span>
        </div>
        <strong>${summary.spentPercentage}%</strong>
        <div class="tp-progress-track">
          <div class="tp-progress-fill" style="width:${Math.min(100, Math.max(0, summary.spentPercentage))}%;background:${statusMeta.barColor};"></div>
        </div>
      </div>
    </div>

    ${
      categoryRows
        ? `
          <div class="tp-card tp-cat-breakdown avoid-break">
            <h3 class="tp-subcard-title">Структура расходов по категориям (${escapeHtml(trip.currency)})</h3>
            <div class="tp-cat-list">${categoryRows}</div>
          </div>
        `
        : `<div class="tp-empty-card avoid-break">Расходы ещё не зафиксированы — статистика по категориям появится после добавления трат.</div>`
    }
  `;
}

function renderExpensesTableBlock(tripCurrency: Currency, expenses: TripExpense[]): string {
  if (expenses.length === 0) {
    return `<div class="tp-empty-card avoid-break">Детальный список операций пуст.</div>`;
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a.expenseDate !== b.expenseDate) {
      return a.expenseDate.localeCompare(b.expenseDate);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  const hasMixedCurrencies = sortedExpenses.some((e) => e.currency !== tripCurrency);

  const rows = sortedExpenses
    .map(
      (exp) => `
        <tr>
          <td class="tp-col-date">${escapeHtml(formatRussianDate(exp.expenseDate))}</td>
          <td>
            <span class="tp-table-cat">
              <span class="tp-dot" style="background:${escapeHtml(exp.categoryColor)};"></span>
              <span>${escapeHtml(exp.categoryNameRu)}</span>
            </span>
          </td>
          <td>${exp.description ? escapeHtml(exp.description) : '<span class="tp-muted-text">—</span>'}</td>
          <td class="tp-col-amount">${escapeHtml(formatCurrency(exp.amount, exp.currency))}</td>
        </tr>
      `
    )
    .join('');

  return `
    <div class="tp-card tp-table-wrap">
      <h3 class="tp-subcard-title">Все операции расходов (${sortedExpenses.length})</h3>
      <table class="tp-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Категория</th>
            <th>Описание</th>
            <th class="tp-col-amount">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      ${
        hasMixedCurrencies
          ? `<p class="tp-table-footnote">Примечание: суммы указаны в исходной валюте каждой операции.</p>`
          : ''
      }
    </div>
  `;
}

function renderBudgetAndExpensesSection(
  payload: TripGuideDataPayload,
  includeBudgetSummary: boolean,
  includeExpensesTable: boolean,
  preset: GuidePreset
): string {
  const { trip, expenses } = payload;
  const summary = payload.expenseSummary ?? buildFallbackExpenseSummary(trip, expenses);

  return `
    <section class="tp-section">
      <div class="tp-section-header avoid-break">
        <h2 class="tp-section-title">Бюджет и расходы</h2>
        <span class="tp-section-pill">${escapeHtml(formatCurrency(summary.totalSpent, summary.currency))} / ${escapeHtml(formatCurrency(summary.plannedBudget, summary.currency))}</span>
      </div>
      ${includeBudgetSummary ? renderBudgetSummaryBlock(trip, summary, expenses.length, preset) : ''}
      ${includeExpensesTable ? renderExpensesTableBlock(trip.currency, expenses) : ''}
    </section>
  `;
}

function renderPackingSection(
  payload: TripGuideDataPayload,
  onlyUnpackedItems: boolean,
  preset: GuidePreset
): string {
  const allItems = payload.packingItems || [];
  const totals = computePackingTotals(allItems, payload.packingSummary);
  const visibleItems = onlyUnpackedItems ? allItems.filter((item) => !item.isPacked) : allItems;
  const groups = groupPackingItems(visibleItems);

  let contentMarkup = '';

  if (allItems.length === 0) {
    contentMarkup = `<div class="tp-empty-card avoid-break">Список вещей для этой поездки ещё не сформирован.</div>`;
  } else if (visibleItems.length === 0 && onlyUnpackedItems) {
    contentMarkup = `<div class="tp-empty-card avoid-break">Все вещи из списка уже собраны (${totals.packed} из ${totals.total})!</div>`;
  } else if (preset === 'compact') {
    const columnsMarkup = groups
      .map(
        (group) => `
          <div class="tp-pack-compact-group avoid-break">
            <div class="tp-pack-cat-head">
              <span>${escapeHtml(group.nameRu)}</span>
              <small>${group.items.length}</small>
            </div>
            <ul class="tp-pack-compact-list">
              ${group.items
                .map(
                  (item) => `
                    <li class="${item.isPacked ? 'is-packed' : ''}">
                      <span class="tp-checkbox">${item.isPacked ? '☑&#xFE0E;' : '☐&#xFE0E;'}</span>
                      <span class="tp-pack-name">${escapeHtml(item.name)}${
                        item.quantity && item.quantity > 1 ? ` <em>×${item.quantity}</em>` : ''
                      }</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        `
      )
      .join('');

    contentMarkup = `<div class="tp-pack-compact-grid">${columnsMarkup}</div>`;
  } else {
    const showReason = preset === 'detailed';
    const groupsMarkup = groups
      .map((group) => {
        const groupPacked = group.items.filter((i) => i.isPacked).length;
        return `
          <div class="tp-pack-card avoid-break">
            <div class="tp-pack-card-head">
              <strong>${escapeHtml(group.nameRu)}</strong>
              <span>${groupPacked}/${group.items.length}</span>
            </div>
            <ul class="tp-pack-list">
              ${group.items
                .map((item) => {
                  const qtyMarkup =
                    item.quantity && item.quantity > 1
                      ? `<span class="tp-pack-qty">×${item.quantity}</span>`
                      : '';
                  const tagMarkup =
                    showReason && item.source === 'CUSTOM'
                      ? `<span class="tp-pack-tag">Своё</span>`
                      : showReason && item.isOutdated
                        ? `<span class="tp-pack-tag tp-pack-tag-warn">Устарело</span>`
                        : '';
                  const reasonMarkup =
                    showReason && item.reason
                      ? `<div class="tp-pack-reason">${escapeHtml(item.reason)}</div>`
                      : '';

                  return `
                    <li class="tp-pack-item ${item.isPacked ? 'is-packed' : ''}">
                      <span class="tp-checkbox">${item.isPacked ? '☑&#xFE0E;' : '☐&#xFE0E;'}</span>
                      <div class="tp-pack-item-body">
                        <div class="tp-pack-item-line">
                          <span class="tp-pack-name">${escapeHtml(item.name)}</span>
                          ${qtyMarkup}
                          ${tagMarkup}
                        </div>
                        ${reasonMarkup}
                      </div>
                    </li>
                  `;
                })
                .join('')}
            </ul>
          </div>
        `;
      })
      .join('');

    contentMarkup = `<div class="tp-pack-grid">${groupsMarkup}</div>`;
  }

  return `
    <section class="tp-section">
      <div class="tp-section-header avoid-break">
        <div>
          <h2 class="tp-section-title">Список вещей</h2>
          <p class="tp-section-sub">
            Собрано ${totals.packed} из ${totals.total} (${totals.progressPercentage}%)${
              onlyUnpackedItems ? ' · Показаны только несобранные вещи' : ''
            }
          </p>
        </div>
        <span class="tp-section-pill">${totals.packed}/${totals.total}</span>
      </div>
      ${
        totals.total > 0
          ? `
            <div class="tp-progress-track tp-pack-progress avoid-break">
              <div class="tp-progress-fill" style="width:${Math.min(100, Math.max(0, totals.progressPercentage))}%;background:#0d9488;"></div>
            </div>
          `
          : ''
      }
      ${contentMarkup}
    </section>
  `;
}

function renderCountryInfoSection(payload: TripGuideDataPayload, preset: GuidePreset): string {
  const { trip, matchedCountry, travelInfo } = payload;

  if (!matchedCountry && !travelInfo) {
    return `
      <section class="tp-section avoid-break">
        <div class="tp-section-header">
          <h2 class="tp-section-title">Памятка о стране</h2>
        </div>
        <div class="tp-empty-card">
          Для направления «${escapeHtml(trip.country)}» справочная памятка не найдена.
        </div>
      </section>
    `;
  }

  const factsMarkup = matchedCountry
    ? `
      <div class="tp-country-facts avoid-break">
        <div class="tp-passport-cell">
          <span class="tp-meta-label">Столица</span>
          <strong>${escapeHtml(matchedCountry.capital)}</strong>
        </div>
        <div class="tp-passport-cell">
          <span class="tp-meta-label">Валюта страны</span>
          <strong>${escapeHtml(matchedCountry.currency)}</strong>
        </div>
        <div class="tp-passport-cell">
          <span class="tp-meta-label">Языки</span>
          <strong>${escapeHtml((matchedCountry.languages || []).join(', ') || '—')}</strong>
        </div>
        <div class="tp-passport-cell">
          <span class="tp-meta-label">Часовой пояс</span>
          <strong>${escapeHtml(matchedCountry.timezone || '—')}</strong>
        </div>
      </div>
    `
    : '';

  if (!travelInfo) {
    return `
      <section class="tp-section">
        <div class="tp-section-header avoid-break">
          <h2 class="tp-section-title">Памятка о стране: ${escapeHtml(matchedCountry?.nameRu || trip.country)}</h2>
        </div>
        ${factsMarkup}
        <div class="tp-empty-card avoid-break">Подробные разделы памятки путешественника ещё не загружены.</div>
      </section>
    `;
  }

  const isDetailed = preset === 'detailed';

  const sectionsMarkup = TRAVEL_INFO_SECTIONS.map((meta) => {
    const sectionData = travelInfo[meta.key] as TravelInfoSection | undefined;
    if (!sectionData) return '';

    const detailsList = isDetailed
      ? sectionData.details || []
      : (sectionData.details || []).slice(0, 2);

    const detailsMarkup =
      detailsList.length > 0
        ? `<ul class="tp-country-bullets">${detailsList
            .map((d) => `<li>${escapeHtml(d)}</li>`)
            .join('')}</ul>`
        : '';

    const updatedLabel = formatMonthYearRu(sectionData.lastUpdated);
    const linksMarkup =
      isDetailed && sectionData.officialLinks && sectionData.officialLinks.length > 0
        ? `
          <div class="tp-official-links">
            <span class="tp-meta-label">Полезные ссылки:</span>
            ${sectionData.officialLinks
              .map((link) => {
                const safeHref = sanitizeSafeUrl(link.url);
                if (!safeHref) return '';
                return `<a class="tp-link-chip" href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title)} ↗</a>`;
              })
              .filter(Boolean)
              .join('')}
          </div>
        `
        : '';

    return `
      <article class="tp-country-card avoid-break" style="border-left-color:${meta.accent};">
        <div class="tp-country-card-head">
          <h3>${escapeHtml(meta.title)}</h3>
          ${isDetailed && updatedLabel ? `<span class="tp-updated-badge">Актуально: ${escapeHtml(updatedLabel)}</span>` : ''}
        </div>
        <p class="tp-country-summary">${escapeHtml(sectionData.summary)}</p>
        ${detailsMarkup}
        ${linksMarkup}
      </article>
    `;
  })
    .filter(Boolean)
    .join('');

  return `
    <section class="tp-section">
      <div class="tp-section-header avoid-break">
        <div>
          <h2 class="tp-section-title">Памятка о стране: ${escapeHtml(matchedCountry?.nameRu || trip.country)}</h2>
          <p class="tp-section-sub">
            ${isDetailed ? 'Все 7 разделов с деталями и официальными источниками' : 'Ключевые рекомендации перед поездкой'}
          </p>
        </div>
      </div>
      ${factsMarkup}
      <div class="tp-country-grid ${isDetailed ? 'is-detailed' : ''}">
        ${sectionsMarkup}
      </div>
    </section>
  `;
}

function getGuideStyles(preset: GuidePreset): string {
  const isCompact = preset === 'compact';

  return `
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #eef2f6;
      line-height: ${isCompact ? '1.38' : '1.48'};
      font-size: ${isCompact ? '11.5px' : '12.5px'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .tp-offline-toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(8px);
      color: #f8fafc;
      border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    }

    .tp-offline-toolbar-inner {
      max-width: 820px;
      margin: 0 auto;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tp-offline-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #e2e8f0;
    }

    .tp-offline-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #14b8a6;
      flex-shrink: 0;
    }

    .tp-offline-print-btn {
      appearance: none;
      border: 0;
      background: #0d9488;
      color: #ffffff;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
    }

    .tp-offline-print-btn:hover {
      background: #0f766e;
    }

    .tp-page {
      max-width: 820px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
      padding: ${isCompact ? '20px 24px' : '26px 30px'};
    }

    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    h1, h2, h3, p {
      margin: 0;
    }

    /* Hero Cover */
    .tp-hero-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: ${isCompact ? '14px' : '20px'};
      background: #ffffff;
    }

    .tp-hero {
      position: relative;
      min-height: 178px;
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 48%, #0369a1 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .tp-hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .tp-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.28) 0%, rgba(15, 23, 42, 0.78) 100%);
    }

    .tp-hero-content {
      position: relative;
      z-index: 2;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tp-badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .tp-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .tp-badge-glass {
      background: rgba(15, 23, 42, 0.48);
      border: 1px solid rgba(255, 255, 255, 0.28);
      color: #ffffff;
    }

    .tp-badge-brand {
      background: #ccfbf1;
      color: #0f766e;
    }

    .tp-badge-neutral {
      background: #f1f5f9;
      color: #334155;
    }

    .tp-badge-accent {
      background: #e0e7ff;
      color: #3730a3;
    }

    .tp-hero-title {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .tp-hero-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tp-hero-location {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      font-weight: 600;
      color: #f8fafc;
    }

    .tp-cover-credit {
      font-size: 10px;
      color: rgba(248, 250, 252, 0.8);
    }

    .tp-flag {
      width: 22px;
      height: 15px;
      object-fit: cover;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      flex-shrink: 0;
    }

    .tp-flag-emoji {
      font-size: 15px;
      line-height: 1;
    }

    /* Compact Header */
    .tp-compact-header {
      border: 1px solid #cbd5e1;
      border-top: 4px solid #0d9488;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: ${isCompact ? '14px' : '18px'};
      background: #ffffff;
    }

    .tp-compact-top {
      padding: ${isCompact ? '12px 16px' : '16px 18px'};
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .tp-title-compact {
      font-size: ${isCompact ? '19px' : '22px'};
      font-weight: 800;
      color: #0f172a;
      margin-top: 6px;
      line-height: 1.22;
    }

    .tp-location-row {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-top: 5px;
      font-size: 12.5px;
      font-weight: 600;
      color: #475569;
    }

    .tp-passport-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: stretch;
      background: #ffffff;
    }

    .tp-passport-cell {
      height: 100%;
      box-sizing: border-box;
      margin-bottom: 0;
      padding: ${isCompact ? '9px 12px' : '11px 14px'};
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 2px;
    }

    .tp-passport-cell:last-child {
      border-right: 0;
    }

    .tp-meta-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .tp-meta-value {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
    }

    /* Sections */
    .tp-section {
      margin-top: ${isCompact ? '14px' : '20px'};
    }

    .tp-section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 6px;
      margin-bottom: ${isCompact ? '8px' : '11px'};
      border-bottom: 2px solid #e2e8f0;
      break-after: avoid;
      page-break-after: avoid;
    }

    .tp-section-title {
      font-size: ${isCompact ? '14.5px' : '16px'};
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .tp-section-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .tp-section-pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      white-space: nowrap;
    }

    .tp-pill-emerald { background: #d1fae5; color: #065f46; }
    .tp-pill-amber { background: #fef3c7; color: #92400e; }
    .tp-pill-rose { background: #ffe4e6; color: #9f1239; }

    .tp-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: ${isCompact ? '11px 13px' : '14px 16px'};
    }

    .tp-empty-card {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 12px;
      color: #64748b;
    }

    .tp-description {
      white-space: pre-line;
      color: #334155;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .tp-muted-note {
      color: #94a3b8;
      font-style: italic;
      font-size: 12px;
    }

    .tp-overview-kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: stretch;
      gap: ${isCompact ? '10px' : '14px'};
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .tp-mini-kpi {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 4px;
      margin-bottom: 0;
      background: #f8fafc;
      border-radius: 8px;
      padding: 9px 11px;
      border: 1px solid #e2e8f0;
    }

    .tp-mini-kpi strong {
      font-size: 13px;
      color: #0f172a;
    }

    /* Weather */
    .tp-weather-summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: stretch;
      gap: ${isCompact ? '10px' : '14px'};
      margin-bottom: 14px;
    }

    .tp-weather-stat {
      height: 100%;
      box-sizing: border-box;
      margin-bottom: 0;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 3px;
    }

    .tp-weather-stat strong {
      font-size: 14px;
      color: #0f172a;
    }

    .tp-weather-stat small {
      font-size: 10.5px;
      color: #64748b;
    }

    .tp-callout {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 11px;
      margin-bottom: 12px;
    }

    .tp-callout-info {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .tp-weather-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: stretch;
      gap: ${isCompact ? '10px' : '14px'};
    }

    .tp-weather-grid.is-compact {
      grid-template-columns: repeat(5, minmax(0, 1fr));
      align-items: stretch;
      gap: 10px;
    }

    .tp-weather-day {
      height: 100%;
      box-sizing: border-box;
      margin-bottom: 0;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 11px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
    }

    .tp-weather-day-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
    }

    .tp-weather-date {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
      text-transform: capitalize;
    }

    .tp-weather-cond {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 1px;
    }

    .tp-weather-temps {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .tp-temp-max {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .tp-temp-min {
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
    }

    .tp-weather-foot {
      border-top: 1px solid #f1f5f9;
      padding-top: 5px;
      font-size: 10px;
      color: #475569;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    /* Itinerary */
    .tp-days-stack {
      display: flex;
      flex-direction: column;
      gap: ${isCompact ? '8px' : '12px'};
    }

    .tp-day-card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
    }

    .tp-day-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: ${isCompact ? '7px 12px' : '9px 14px'};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tp-day-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .tp-day-badge {
      background: #0d9488;
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .tp-day-title {
      font-size: ${isCompact ? '12.5px' : '13.5px'};
      font-weight: 700;
      color: #0f172a;
    }

    .tp-day-count {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }

    .tp-day-events {
      padding: ${isCompact ? '6px 12px' : '10px 14px'};
      display: flex;
      flex-direction: column;
      gap: ${isCompact ? '6px' : '9px'};
    }

    .tp-day-empty {
      font-size: 11.5px;
      color: #94a3b8;
      font-style: italic;
      padding: 4px 0;
    }

    .tp-event-row {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 10px;
      padding-bottom: ${isCompact ? '6px' : '9px'};
      border-bottom: 1px solid #f1f5f9;
    }

    .tp-event-row:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    .tp-event-time-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .tp-event-time {
      display: inline-block;
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #99f6e4;
      border-radius: 6px;
      padding: 2px 7px;
      font-size: 10.5px;
      font-weight: 700;
      white-space: nowrap;
    }

    .tp-event-cost {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 1px 6px;
      font-size: 10px;
      font-weight: 700;
    }

    .tp-event-title {
      font-size: ${isCompact ? '12px' : '13px'};
      font-weight: 700;
      color: #0f172a;
    }

    .tp-event-location {
      font-size: 11px;
      color: #0f766e;
      font-weight: 600;
      margin-top: 2px;
    }

    .tp-event-desc {
      font-size: 11.5px;
      color: #475569;
      margin-top: 3px;
      white-space: pre-line;
    }

    .tp-event-note {
      margin-top: 5px;
      padding: 5px 8px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      font-size: 11px;
      color: #78350f;
      white-space: pre-line;
    }

    /* Budget & Expenses */
    .tp-budget-compact {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }

    .tp-budget-compact-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }

    .tp-cat-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }

    .tp-cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      padding: 2px 8px;
    }

    .tp-budget-kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: stretch;
      gap: ${isCompact ? '10px' : '14px'};
      margin-bottom: 14px;
    }

    .tp-kpi-box {
      height: 100%;
      box-sizing: border-box;
      margin-bottom: 0;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 4px;
    }

    .tp-kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }

    .tp-kpi-box strong {
      font-size: 14.5px;
      color: #0f172a;
    }

    .tp-kpi-box small {
      font-size: 10.5px;
      color: #64748b;
    }

    .tp-text-rose { color: #e11d48 !important; }
    .tp-text-emerald { color: #059669 !important; }

    .tp-progress-track {
      width: 100%;
      height: 6px;
      border-radius: 999px;
      background: #e2e8f0;
      overflow: hidden;
      margin-top: 3px;
    }

    .tp-progress-fill {
      height: 100%;
      border-radius: 999px;
    }

    .tp-subcard-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 9px;
    }

    .tp-cat-breakdown {
      margin-bottom: 10px;
    }

    .tp-cat-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .tp-cat-row {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr) 130px;
      align-items: center;
      gap: 10px;
    }

    .tp-cat-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 600;
    }

    .tp-cat-name small {
      color: #64748b;
      font-weight: 500;
    }

    .tp-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      flex-shrink: 0;
      display: inline-block;
    }

    .tp-cat-bar-track {
      height: 7px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }

    .tp-cat-bar-fill {
      height: 100%;
      border-radius: 999px;
    }

    .tp-cat-amount {
      text-align: right;
      font-size: 11.5px;
    }

    .tp-cat-amount small {
      color: #64748b;
      margin-left: 4px;
    }

    /* Expenses Table */
    .tp-table-wrap {
      margin-top: 10px;
    }

    .tp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }

    .tp-table thead {
      display: table-header-group;
    }

    .tp-table th {
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      padding: 6px 8px;
      border-bottom: 1.5px solid #cbd5e1;
      background: #f8fafc;
    }

    .tp-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      color: #1e293b;
    }

    .tp-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .tp-col-date {
      white-space: nowrap;
      width: 115px;
      color: #475569;
    }

    .tp-col-amount {
      text-align: right !important;
      white-space: nowrap;
      font-weight: 700;
    }

    .tp-table-cat {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      white-space: nowrap;
    }

    .tp-muted-text {
      color: #94a3b8;
    }

    .tp-table-footnote {
      margin-top: 7px;
      font-size: 10.5px;
      color: #64748b;
      font-style: italic;
    }

    /* Packing */
    .tp-pack-progress {
      margin-bottom: 10px;
      height: 7px;
    }

    .tp-pack-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      align-items: stretch;
    }

    .tp-pack-card {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 11px 13px;
      background: #ffffff;
    }

    .tp-pack-grid > .tp-pack-card:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }

    .tp-pack-grid > .tp-pack-card:last-child:nth-child(odd) .tp-pack-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 16px;
    }

    .tp-pack-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 6px;
      margin-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #0f172a;
    }

    .tp-pack-card-head span {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f766e;
      background: #f0fdfa;
      padding: 1px 7px;
      border-radius: 999px;
    }

    .tp-pack-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tp-pack-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11.5px;
      color: #1e293b;
    }

    .tp-pack-item.is-packed .tp-pack-name {
      color: #64748b;
      text-decoration: line-through;
    }

    .tp-checkbox {
      font-family: 'Segoe UI Symbol', 'DejaVu Sans', 'Inter', sans-serif;
      font-size: 13px;
      line-height: 1.25;
      color: #0f766e;
      flex-shrink: 0;
    }

    .tp-pack-item:not(.is-packed) .tp-checkbox {
      color: #64748b;
    }

    .tp-pack-item-body {
      min-width: 0;
      flex: 1;
    }

    .tp-pack-item-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
    }

    .tp-pack-qty {
      font-size: 10px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 0 5px;
      border-radius: 4px;
    }

    .tp-pack-tag {
      font-size: 9.5px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0 5px;
      border-radius: 4px;
    }

    .tp-pack-tag-warn {
      background: #fef3c7;
      color: #92400e;
    }

    .tp-pack-reason {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 1px;
    }

    .tp-pack-compact-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      align-items: stretch;
    }

    .tp-pack-compact-group {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 8px 10px;
      background: #ffffff;
    }

    .tp-pack-cat-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
      margin-bottom: 5px;
    }

    .tp-pack-cat-head small {
      color: #64748b;
    }

    .tp-pack-compact-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 10.8px;
    }

    .tp-pack-compact-list li {
      display: flex;
      align-items: flex-start;
      gap: 5px;
    }

    .tp-pack-compact-list li.is-packed .tp-pack-name {
      color: #64748b;
      text-decoration: line-through;
    }

    .tp-pack-compact-list em {
      font-style: normal;
      font-weight: 700;
      color: #0f766e;
    }

    /* Country Travel Info */
    .tp-country-facts {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: stretch;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background: #f8fafc;
      margin-bottom: 14px;
    }

    .tp-country-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: ${isCompact ? '10px' : '14px'};
      align-items: stretch;
    }

    .tp-country-grid.is-detailed {
      grid-template-columns: 1fr;
    }

    .tp-country-card {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
      border: 1px solid #e2e8f0;
      border-left-width: 4px;
      border-radius: 10px;
      padding: 11px 13px;
      background: #ffffff;
    }

    .tp-country-grid:not(.is-detailed) > .tp-country-card:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }

    .tp-country-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .tp-country-card-head h3 {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .tp-updated-badge {
      font-size: 10px;
      color: #64748b;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 999px;
      white-space: nowrap;
    }

    .tp-country-summary {
      font-size: 11.5px;
      color: #334155;
      line-height: 1.45;
    }

    .tp-country-bullets {
      margin: 6px 0 0;
      padding-left: 16px;
      font-size: 11px;
      color: #475569;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .tp-official-links {
      margin-top: 7px;
      padding-top: 6px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }

    .tp-link-chip {
      font-size: 10.5px;
      font-weight: 600;
      color: #0f766e;
      text-decoration: none;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      padding: 2px 7px;
      border-radius: 6px;
    }

    /* Footer */
    .tp-doc-footer {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 10.5px;
      color: #94a3b8;
    }

    @media (max-width: 680px) {
      .tp-page {
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        padding: 14px;
      }

      .tp-passport-grid,
      .tp-overview-kpis,
      .tp-weather-summary,
      .tp-budget-kpis,
      .tp-country-facts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .tp-weather-grid,
      .tp-weather-grid.is-compact,
      .tp-pack-grid,
      .tp-pack-compact-grid,
      .tp-country-grid,
      .tp-pack-grid > .tp-pack-card:last-child:nth-child(odd) .tp-pack-list {
        grid-template-columns: 1fr;
      }

      .tp-pack-grid > .tp-pack-card:last-child:nth-child(odd),
      .tp-country-grid:not(.is-detailed) > .tp-country-card:last-child:nth-child(odd) {
        grid-column: auto;
      }

      .tp-passport-cell {
        border-bottom: 1px solid #e2e8f0;
      }

      .tp-passport-cell:nth-child(2n) {
        border-right: 0;
      }

      .tp-passport-cell:nth-last-child(-n + 2) {
        border-bottom: 0;
      }

      .tp-event-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }

      .tp-cat-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .tp-cat-amount {
        text-align: left;
      }
    }

    @media print {
      html, body {
        background: #ffffff !important;
      }

      .no-print {
        display: none !important;
      }

      .tp-page {
        max-width: none;
        margin: 0;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .tp-link-chip::after {
        content: " (" attr(href) ")";
        font-weight: 400;
        color: #64748b;
        font-size: 9px;
        word-break: break-all;
      }
    }
  `;
}

/**
 * Generates a standalone HTML5 travel guide document ready for iframe preview,
 * A4 browser printing/PDF export, or offline HTML download.
 */
export function buildTripGuideHtml(
  payload: TripGuideDataPayload,
  options: GuideExportOptions
): string {
  const { trip } = payload;
  const { preset, sections, includeToolbar = false } = options;

  const blocks: string[] = [
    renderHeaderSection(payload, sections.includeCoverPhoto, preset),
  ];

  if (sections.includeOverviewAndNotes) {
    blocks.push(renderOverviewSection(payload));
  }

  if (sections.includeWeather) {
    blocks.push(renderWeatherSection(payload, preset));
  }

  if (sections.includeItinerary) {
    blocks.push(renderItinerarySection(payload, sections.includeAllCalendarDays, preset));
  }

  if (sections.includeBudgetSummary || sections.includeExpensesTable) {
    blocks.push(
      renderBudgetAndExpensesSection(
        payload,
        sections.includeBudgetSummary,
        sections.includeExpensesTable,
        preset
      )
    );
  }

  if (sections.includePackingList) {
    blocks.push(renderPackingSection(payload, sections.onlyUnpackedItems, preset));
  }

  if (sections.includeCountryInfo) {
    blocks.push(renderCountryInfoSection(payload, preset));
  }

  const generatedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const documentTitle = `${trip.title} — Путеводитель TravelPlanner`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(documentTitle)}</title>
  <style>${getGuideStyles(preset)}</style>
</head>
<body>
  ${includeToolbar ? renderStandaloneToolbar(trip.title) : ''}
  <main class="tp-page">
    ${blocks.join('\n')}
    <footer class="tp-doc-footer avoid-break">
      <span>TravelPlanner · Персональный путеводитель: ${escapeHtml(trip.title)}</span>
      <span>Сформировано ${escapeHtml(generatedDate)}</span>
    </footer>
  </main>
</body>
</html>`;
}

function waitForDocumentImages(doc: Document, timeoutMs = 2500): Promise<void> {
  const images = Array.from(doc.images || []);
  const pendingImages = images.filter((img) => !img.complete);

  const imagesPromise =
    pendingImages.length === 0
      ? Promise.resolve()
      : Promise.all(
          pendingImages.map(
            (img) =>
              new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
              })
          )
        ).then(() => undefined);

  const fontsPromise =
    doc.fonts && typeof doc.fonts.ready?.then === 'function'
      ? doc.fonts.ready.then(() => undefined).catch(() => undefined)
      : Promise.resolve();

  const timeoutPromise = new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });

  return Promise.race([Promise.all([imagesPromise, fontsPromise]).then(() => undefined), timeoutPromise]);
}

/**
 * Renders the guide HTML inside a hidden iframe, waits for images (up to 2.5s),
 * triggers the browser print dialog for PDF saving, and cleans up safely.
 */
export async function printTripGuideToPdf(html: string): Promise<void> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('Печать доступна только в браузере');
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  let cleaned = false;
  let fallbackTimer: number | null = null;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  try {
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument || win?.document;
    if (!win || !doc) {
      throw new Error('Не удалось инициализировать область печати');
    }

    doc.open();
    doc.write(html);
    doc.close();

    await waitForDocumentImages(doc, 2500);

    win.addEventListener('afterprint', cleanup, { once: true });
    fallbackTimer = window.setTimeout(cleanup, 60_000);

    win.focus();
    win.print();
  } catch (err) {
    cleanup();
    throw err;
  }
}

/**
 * Injects the no-print offline toolbar if absent and downloads a standalone .html file.
 */
export function downloadTripGuideHtml(html: string, filename: string, tripTitle = 'Путеводитель'): void {
  if (typeof document === 'undefined') return;

  let standaloneHtml = html;
  if (!standaloneHtml.includes(TOOLBAR_MARKER)) {
    const toolbar = renderStandaloneToolbar(tripTitle);
    if (standaloneHtml.includes('<body>')) {
      standaloneHtml = standaloneHtml.replace('<body>', `<body>\n${toolbar}`);
    } else {
      standaloneHtml = `${toolbar}\n${standaloneHtml}`;
    }
  }

  const safeFilename = sanitizeDownloadFilename(filename);
  const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Produces a filesystem-safe .html filename for a trip guide.
 */
export function buildTripGuideFilename(trip: Pick<Trip, 'title' | 'city' | 'startDate'>): string {
  const baseName = `Путеводитель — ${trip.city || trip.title} (${trip.startDate})`;
  return sanitizeDownloadFilename(`${baseName}.html`);
}

function sanitizeDownloadFilename(name: string): string {
  const cleaned = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
  const base = cleaned || 'travel-guide.html';
  return base.toLowerCase().endsWith('.html') ? base : `${base}.html`;
}
