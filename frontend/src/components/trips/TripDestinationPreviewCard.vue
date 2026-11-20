<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  BookOpen,
  CloudSun,
  Coins,
  Droplets,
  ExternalLink,
  Info,
  LayoutGrid,
  Lightbulb,
  Loader2,
  MapPin,
  PanelTopClose,
  Plane,
  RefreshCw,
  Thermometer,
  Umbrella,
} from 'lucide-vue-next';
import type { CountryData, TripWeatherResponseDto, WeatherDailyItemDto } from '@/types';
import { useCountryStore } from '@/stores/country.store';
import { weatherService } from '@/services/weather.service';
import { formatDaysLabel, pluralizeRu } from '@/composables/useFormatters';
import {
  formatSignedTemperature,
  formatTemperatureRange,
  formatWeatherDecimal,
  formatWeatherShortDate,
} from '@/utils/weatherFormatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import CountryFlag from '@/components/ui/CountryFlag.vue';
import CountryTravelInfoSection from '@/components/countries/CountryTravelInfoSection.vue';
import WeatherIcon from '@/components/weather/WeatherIcon.vue';

interface Props {
  country: string;
  city: string;
  startDate: string;
  endDate: string;
}

const props = defineProps<Props>();

const countryStore = useCountryStore();

const detailsModalOpen = ref(false);
const showAllDailyGrid = ref(false);
const weather = ref<TripWeatherResponseDto | null>(null);
const isLoadingWeather = ref(false);
const weatherError = ref<string | null>(null);

const localWeatherCache = new Map<string, TripWeatherResponseDto>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeController: AbortController | null = null;
let requestSeq = 0;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(val: string): boolean {
  if (!ISO_DATE_RE.test(val)) return false;
  const [y, m, d] = val.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    !Number.isNaN(dt.getTime()) &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

const cleanCountry = computed(() => props.country.trim());
const matchedCountry = computed<CountryData | undefined>(() => {
  if (!cleanCountry.value) return undefined;
  return countryStore.findCountryByQuery(cleanCountry.value);
});

const effectiveCity = computed(
  () => props.city.trim() || matchedCountry.value?.capital?.trim() || ''
);

const hasValidDates = computed(
  () =>
    isValidIsoDate(props.startDate) &&
    isValidIsoDate(props.endDate) &&
    props.startDate <= props.endDate
);

const hasCountryInput = computed(() => cleanCountry.value.length >= 2);
const hasTravelInfo = computed(() => Boolean(matchedCountry.value?.travelInfo));

const weatherQuerySignature = computed(() => {
  if (cleanCountry.value.length < 2 || effectiveCity.value.length < 2 || !hasValidDates.value) {
    return null;
  }
  return `${cleanCountry.value}|${effectiveCity.value}|${props.startDate}|${props.endDate}`;
});

function clearPendingTimersAndRequests() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

async function fetchWeatherPreview(force = false) {
  const sig = weatherQuerySignature.value;
  if (!sig) {
    weather.value = null;
    weatherError.value = null;
    isLoadingWeather.value = false;
    return;
  }

  const normalizedKey = sig.toLowerCase();
  if (!force && localWeatherCache.has(normalizedKey)) {
    weather.value = localWeatherCache.get(normalizedKey)!;
    weatherError.value = null;
    isLoadingWeather.value = false;
    return;
  }

  if (activeController) {
    activeController.abort();
  }
  const controller = new AbortController();
  activeController = controller;
  const seq = ++requestSeq;

  isLoadingWeather.value = true;
  weatherError.value = null;

  try {
    const result = await weatherService.getDestinationWeatherPreview(
      {
        country: cleanCountry.value,
        city: effectiveCity.value,
        startDate: props.startDate,
        endDate: props.endDate,
      },
      { signal: controller.signal }
    );

    if (seq !== requestSeq || controller.signal.aborted) return;

    localWeatherCache.set(normalizedKey, result);
    weather.value = result;
  } catch (err: any) {
    if (seq !== requestSeq || controller.signal.aborted || err?.code === 'ERR_CANCELED') {
      return;
    }
    weather.value = null;
    weatherError.value = err?.message || 'Не удалось получить прогноз погоды для выбранных дат';
  } finally {
    if (seq === requestSeq) {
      isLoadingWeather.value = false;
      if (activeController === controller) {
        activeController = null;
      }
    }
  }
}

watch(
  weatherQuerySignature,
  (newSig) => {
    clearPendingTimersAndRequests();

    if (!newSig) {
      weather.value = null;
      weatherError.value = null;
      isLoadingWeather.value = false;
      return;
    }

    const normalizedKey = newSig.toLowerCase();
    if (localWeatherCache.has(normalizedKey)) {
      weather.value = localWeatherCache.get(normalizedKey)!;
      weatherError.value = null;
      isLoadingWeather.value = false;
      return;
    }

    isLoadingWeather.value = true;
    weatherError.value = null;

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      fetchWeatherPreview();
    }, 500);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearPendingTimersAndRequests();
});

const isForecastMode = computed(() => weather.value?.sourceMode === 'forecast');

const primaryIconType = computed(() => {
  if (!weather.value) return 'partly_cloudy' as const;
  if (weather.value.summary.hasSnow) return 'snow' as const;
  if (weather.value.summary.hasHeavyRain) return 'heavy_rain' as const;
  return weather.value.daily[0]?.iconType ?? ('partly_cloudy' as const);
});

const tempRangeLabel = computed(() =>
  weather.value
    ? formatTemperatureRange(weather.value.summary.minTemp, weather.value.summary.maxTemp)
    : ''
);

const avgDayTempLabel = computed(() =>
  weather.value ? formatSignedTemperature(weather.value.summary.avgTempMax) : ''
);

const avgNightTempLabel = computed(() =>
  weather.value ? formatSignedTemperature(weather.value.summary.avgTempMin) : ''
);

const rainyDaysLabel = computed(() => {
  if (!weather.value) return '';
  const count = weather.value.summary.rainyDaysCount;
  return `${count} ${pluralizeRu(count, ['день', 'дня', 'дней'])}`;
});

const dailyItems = computed<WeatherDailyItemDto[]>(() => weather.value?.daily ?? []);
const hasManyDailyItems = computed(() => dailyItems.value.length > 6);
const isDailyGridExpanded = computed(() => hasManyDailyItems.value && showAllDailyGrid.value);

function hasDayPrecipitation(day: WeatherDailyItemDto): boolean {
  return (
    day.precipitationMm > 0 ||
    (day.precipitationProbMax !== null && day.precipitationProbMax >= 30)
  );
}

function formatDayPrecipitationBadge(day: WeatherDailyItemDto): string {
  const mmText = `${formatWeatherDecimal(day.precipitationMm)} мм`;
  if (day.precipitationProbMax !== null) {
    return `${mmText} · ${day.precipitationProbMax}%`;
  }
  return mmText;
}
</script>

<template>
  <div
    v-if="hasCountryInput"
    class="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4 animate-fade-in"
  >
    <!-- Part 1: Quick Country Travel Memo -->
    <div v-if="matchedCountry && hasTravelInfo" class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5 min-w-0">
          <CountryFlag
            :code="matchedCountry.isoAlpha2 || matchedCountry.flagEmoji"
            :flagUrl="matchedCountry.flagUrl"
            :name="matchedCountry.nameRu"
            size="md"
            class="!w-7 !h-5 shadow-sm"
          />
          <div class="min-w-0">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <BookOpen class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Памятка по стране «{{ matchedCountry.nameRu }}»</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Столица: {{ matchedCountry.capital }} · Валюта: {{ matchedCountry.currency }}
            </p>
          </div>
        </div>

        <BaseButton
          type="button"
          variant="outline"
          size="sm"
          @click="detailsModalOpen = true"
        >
          <span>Подробнее о стране</span>
        </BaseButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div class="inline-flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400">
            <Plane class="w-3.5 h-3.5 shrink-0" />
            <span>Виза и въезд</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {{ matchedCountry.travelInfo!.entryRules.summary }}
          </p>
        </div>

        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div class="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <Coins class="w-3.5 h-3.5 shrink-0" />
            <span>Валюта и карты</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {{ matchedCountry.travelInfo!.moneyAndPayments.summary }}
          </p>
        </div>

        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div class="inline-flex items-center gap-1.5 font-bold text-violet-700 dark:text-violet-400">
            <Lightbulb class="w-3.5 h-3.5 shrink-0" />
            <span>Розетки и советы</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {{ matchedCountry.travelInfo!.practicalTips.summary }}
          </p>
        </div>
      </div>
    </div>

    <!-- Part 2: Weather Preview for Future Trip Dates -->
    <div
      v-if="weatherQuerySignature"
      :class="[
        'space-y-3',
        matchedCountry && hasTravelInfo ? 'pt-4 border-t border-slate-200/80 dark:border-slate-800' : '',
      ]"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
          <CloudSun class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Ожидаемая погода на даты поездки</span>
        </div>

        <span
          v-if="weather"
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
            isForecastMode
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
              : 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
          ]"
        >
          {{ isForecastMode ? 'Прогноз' : 'Сезонный ориентир' }}
        </span>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoadingWeather && !weather"
        class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400"
      >
        <Loader2 class="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin shrink-0" />
        <span>Определяем прогноз погоды для {{ effectiveCity }} ({{ startDate }} — {{ endDate }})...</span>
      </div>

      <!-- Error State (non-blocking) -->
      <div
        v-else-if="weatherError && !weather"
        class="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200"
      >
        <div class="flex items-start gap-2">
          <Info class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{{ weatherError }}</span>
        </div>
        <BaseButton
          type="button"
          variant="outline"
          size="sm"
          class="shrink-0 self-start sm:self-auto"
          @click="fetchWeatherPreview(true)"
        >
          <template #icon>
            <RefreshCw class="w-3.5 h-3.5" />
          </template>
          <span>Повторить</span>
        </BaseButton>
      </div>

      <!-- Loaded Weather Preview -->
      <div
        v-else-if="weather"
        class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <WeatherIcon
              :type="primaryIconType"
              size="md"
              :with-background="true"
            />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{{ weather.resolvedCity }}, {{ weather.resolvedCountry }}</span>
                </span>
                <Loader2
                  v-if="isLoadingWeather"
                  class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-spin shrink-0"
                />
              </div>
              <p class="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                {{ weather.climateLabelRu }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs shrink-0">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <Thermometer class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ tempRangeLabel }}</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums hidden sm:inline">
                ({{ avgDayTempLabel }} / {{ avgNightTempLabel }})
              </span>
            </div>

            <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <Umbrella class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-300">
                Дождливых дней: <strong class="text-slate-900 dark:text-slate-100 tabular-nums">{{ rainyDaysLabel }}</strong>
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                ({{ formatWeatherDecimal(weather.summary.totalPrecipitationMm) }} мм)
              </span>
            </div>
          </div>
        </div>

        <p
          v-if="weather.disclaimerRu"
          class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800"
        >
          {{ weather.disclaimerRu }}
        </p>

        <!-- Daily Weather Breakdown -->
        <div
          v-if="dailyItems.length > 0"
          class="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Погода по дням ({{ formatDaysLabel(dailyItems.length) }})
            </span>

            <button
              v-if="hasManyDailyItems"
              type="button"
              @click="showAllDailyGrid = !showAllDailyGrid"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-500/15 border border-slate-200/80 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500/40 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              <PanelTopClose v-if="isDailyGridExpanded" class="w-3.5 h-3.5" />
              <LayoutGrid v-else class="w-3.5 h-3.5" />
              <span>{{ isDailyGridExpanded ? 'Свернуть в ленту' : 'Развернуть все дни сеткой' }}</span>
            </button>
          </div>

          <div
            :class="
              isDailyGridExpanded
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5'
                : 'flex gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory'
            "
          >
            <article
              v-for="day in dailyItems"
              :key="day.date"
              :class="[
                'rounded-xl border p-2.5 flex flex-col justify-between gap-2 transition-colors',
                isDailyGridExpanded ? '' : 'w-[142px] sm:w-[148px] shrink-0 snap-start',
                hasDayPrecipitation(day)
                  ? 'bg-sky-50/40 dark:bg-sky-500/10 border-sky-200/90 dark:border-sky-500/30 hover:border-sky-300'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500/40',
              ]"
            >
              <div class="flex items-start justify-between gap-1.5">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
                    {{ formatWeatherShortDate(day.date) }}
                  </p>
                  <p
                    class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 min-h-[1.9rem] mt-0.5"
                    :title="day.conditionRu"
                  >
                    {{ day.conditionRu }}
                  </p>
                </div>

                <WeatherIcon
                  :type="day.iconType"
                  size="sm"
                  :with-background="true"
                  :title="day.conditionRu"
                />
              </div>

              <div class="flex items-baseline gap-1">
                <span class="text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ formatSignedTemperature(day.tempMax, true) }}
                </span>
                <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                  / {{ formatSignedTemperature(day.tempMin, true) }}
                </span>
              </div>

              <div class="pt-1 border-t border-slate-200/60 dark:border-slate-700/80">
                <span
                  v-if="hasDayPrecipitation(day)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100/90 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-[11px] font-semibold tabular-nums max-w-full truncate"
                  :title="formatDayPrecipitationBadge(day)"
                >
                  <Droplets class="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span class="truncate">{{ formatDayPrecipitationBadge(day) }}</span>
                </span>

                <span
                  v-else
                  class="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500"
                >
                  <Droplets class="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                  <span>Без осадков</span>
                </span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- Hint when country entered without city/valid dates yet -->
    <div
      v-else-if="hasCountryInput && !weatherQuerySignature"
      class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1"
    >
      <CloudSun class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
      <span>Укажите город и корректные даты поездки, чтобы увидеть прогноз погоды на период поездки.</span>
    </div>

    <!-- Full Country Guide Modal -->
    <BaseModal
      v-if="matchedCountry && matchedCountry.travelInfo"
      :open="detailsModalOpen"
      :title="`${matchedCountry.nameRu} — памятка путешественника`"
      maxWidth="xl"
      @close="detailsModalOpen = false"
    >
      <CountryTravelInfoSection
        v-if="detailsModalOpen"
        :country="matchedCountry"
        :travelInfo="matchedCountry.travelInfo"
        :tripCity="effectiveCity"
        :showCountryLink="false"
      />

      <template #footer>
        <a
          :href="`/countries/${matchedCountry.slug}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-teal-700 dark:text-teal-400 transition-colors"
        >
          <span>Открыть страницу страны в новой вкладке</span>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
        <BaseButton
          type="button"
          variant="primary"
          size="sm"
          @click="detailsModalOpen = false"
        >
          Закрыть
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
