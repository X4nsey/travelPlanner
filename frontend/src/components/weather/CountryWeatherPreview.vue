<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  CloudSun,
  Droplets,
  Info,
  Landmark,
  MapPin,
  RefreshCw,
  Thermometer,
  Umbrella,
  Wind,
} from 'lucide-vue-next';
import type { CountryData, TripWeatherResponseDto } from '@/types';
import { weatherService } from '@/services/weather.service';
import { pluralizeRu } from '@/composables/useFormatters';
import {
  formatSignedTemperature,
  formatTemperatureRange,
  formatWeatherDecimal,
  formatWeatherShortDate,
  formatWeatherUpdatedAt,
} from '@/utils/weatherFormatters';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import WeatherIcon from './WeatherIcon.vue';

interface Props {
  country: CountryData;
}

const props = defineProps<Props>();

interface CityOption {
  name: string;
  isCapital: boolean;
}

const cityOptions = computed<CityOption[]>(() => {
  const result: CityOption[] = [];
  const seen = new Set<string>();

  const capital = props.country.capital?.trim();
  if (capital) {
    seen.add(capital.toLowerCase());
    result.push({ name: capital, isCapital: true });
  }

  for (const city of props.country.popularCities || []) {
    const clean = city.name?.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name: clean, isCapital: false });
  }

  if (result.length === 0 && props.country.nameRu?.trim()) {
    result.push({ name: props.country.nameRu.trim(), isCapital: false });
  }

  return result;
});

const selectedCity = ref<string>(cityOptions.value[0]?.name || '');
const weather = ref<TripWeatherResponseDto | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const localCache = new Map<string, TripWeatherResponseDto>();
let requestSeq = 0;
let activeController: AbortController | null = null;

function cancelActiveRequest() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

async function fetchCityWeather(cityName: string, force = false) {
  if (!cityName || !props.country.slug) return;

  const cacheKey = `${props.country.slug}|${cityName.toLowerCase()}`;
  if (!force && localCache.has(cacheKey)) {
    weather.value = localCache.get(cacheKey)!;
    error.value = null;
    isLoading.value = false;
    return;
  }

  cancelActiveRequest();
  const controller = new AbortController();
  activeController = controller;
  const seq = ++requestSeq;

  isLoading.value = true;
  error.value = null;

  try {
    const result = await weatherService.getDestinationWeatherPreview(
      {
        country: props.country.slug,
        city: cityName,
      },
      { signal: controller.signal }
    );

    if (seq !== requestSeq || controller.signal.aborted) return;

    localCache.set(cacheKey, result);
    weather.value = result;
  } catch (err: any) {
    if (seq !== requestSeq || controller.signal.aborted || err?.code === 'ERR_CANCELED') {
      return;
    }
    error.value = err?.message || 'Не удалось загрузить прогноз погоды';
  } finally {
    if (seq === requestSeq) {
      isLoading.value = false;
      if (activeController === controller) {
        activeController = null;
      }
    }
  }
}

watch(
  () => props.country.slug,
  () => {
    const firstCity = cityOptions.value[0]?.name || '';
    selectedCity.value = firstCity;
    weather.value = null;
    error.value = null;
    if (firstCity) {
      fetchCityWeather(firstCity);
    }
  },
  { immediate: true }
);

function selectCity(cityName: string) {
  if (cityName === selectedCity.value && weather.value && !error.value) {
    return;
  }
  selectedCity.value = cityName;
  fetchCityWeather(cityName);
}

onBeforeUnmount(() => {
  cancelActiveRequest();
});

const tempRangeLabel = computed(() => {
  if (!weather.value) return '';
  return formatTemperatureRange(weather.value.summary.minTemp, weather.value.summary.maxTemp);
});

const avgDayLabel = computed(() =>
  weather.value ? formatSignedTemperature(weather.value.summary.avgTempMax) : ''
);

const avgNightLabel = computed(() =>
  weather.value ? formatSignedTemperature(weather.value.summary.avgTempMin) : ''
);

const rainyDaysLabel = computed(() => {
  if (!weather.value) return '';
  const count = weather.value.summary.rainyDaysCount;
  return `${count} ${pluralizeRu(count, ['день', 'дня', 'дней'])}`;
});

const updatedAtLabel = computed(() =>
  weather.value ? formatWeatherUpdatedAt(weather.value.fetchedAt) : ''
);

const dailyPreview = computed(() => (weather.value?.daily || []).slice(0, 7));
</script>

<template>
  <section class="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-5">
    <!-- Section Header + Refresh -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
          <CloudSun class="w-4 h-4" />
          <span>Прогноз на ближайшие 7 дней</span>
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
            Погода в стране «{{ country.nameRu }}»
          </h2>
          <span
            v-if="weather"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          >
            {{ weather.sourceLabelRu }}
          </span>
        </div>
      </div>

      <BaseButton
        variant="outline"
        size="sm"
        class="self-start sm:self-auto shrink-0"
        :loading="isLoading"
        @click="fetchCityWeather(selectedCity, true)"
      >
        <template #icon>
          <RefreshCw class="w-3.5 h-3.5" />
        </template>
        <span>Обновить</span>
      </BaseButton>
    </div>

    <!-- City Switcher Pills -->
    <div v-if="cityOptions.length > 0" class="flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-slate-500 mr-1">Город:</span>
      <button
        v-for="city in cityOptions"
        :key="city.name"
        type="button"
        @click="selectCity(city.name)"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
          selectedCity === city.name
            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
            : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200',
        ]"
      >
        <Landmark v-if="city.isCapital" class="w-3.5 h-3.5 shrink-0" />
        <MapPin v-else class="w-3.5 h-3.5 shrink-0" />
        <span>{{ city.name }}</span>
        <span
          v-if="city.isCapital"
          :class="[
            'text-[10px] px-1.5 py-0.2 rounded-md font-bold',
            selectedCity === city.name
              ? 'bg-white/20 text-white'
              : 'bg-teal-100/80 text-teal-700',
          ]"
        >
          столица
        </span>
      </button>
    </div>

    <!-- Initial Loading Skeleton -->
    <div v-if="isLoading && !weather" class="space-y-4 animate-pulse" aria-busy="true">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="i in 4"
          :key="i"
          class="h-20 rounded-2xl bg-slate-100/80 border border-slate-100"
        />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
        <div
          v-for="i in 7"
          :key="i"
          class="h-32 rounded-2xl bg-slate-100/70 border border-slate-100"
        />
      </div>
    </div>

    <!-- Error State without cached data -->
    <div v-else-if="error && !weather" class="space-y-3">
      <BaseAlert
        type="error"
        title="Не удалось загрузить предпросмотр погоды"
        :message="error"
      />
      <BaseButton variant="outline" size="sm" @click="fetchCityWeather(selectedCity, true)">
        <template #icon>
          <RefreshCw class="w-3.5 h-3.5" />
        </template>
        <span>Повторить запрос</span>
      </BaseButton>
    </div>

    <!-- Loaded Weather Content -->
    <div
      v-else-if="weather"
      :class="['space-y-4 transition-opacity duration-150', isLoading ? 'opacity-65' : 'opacity-100']"
    >
      <BaseAlert
        v-if="error"
        type="error"
        title="Не удалось обновить прогноз"
        :message="error"
      />

      <div
        v-if="weather.disclaimerRu"
        class="rounded-xl border bg-sky-50/80 border-sky-200/80 text-sky-900 p-3 flex items-start gap-2 text-xs leading-relaxed"
      >
        <Info class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p>{{ weather.disclaimerRu }}</p>
      </div>

      <!-- Compact Summary Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Thermometer class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500">Температура</p>
            <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
              {{ tempRangeLabel }}
            </p>
            <p class="text-[11px] text-slate-500 tabular-nums">
              Днём {{ avgDayLabel }} · Ночью {{ avgNightLabel }}
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Umbrella class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500">Осадки за неделю</p>
            <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
              {{ formatWeatherDecimal(weather.summary.totalPrecipitationMm) }} мм
            </p>
            <p class="text-[11px] text-slate-500">
              Дождливых дней: {{ rainyDaysLabel }}
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Wind class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500">Макс. ветер</p>
            <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
              {{ formatWeatherDecimal(weather.summary.maxWindKmh) }} км/ч
            </p>
            <p class="text-[11px] text-slate-500 truncate" :title="weather.climateLabelRu">
              {{ weather.climateLabelRu }}
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500">Локация прогноза</p>
            <p class="text-sm font-bold text-slate-900 truncate mt-0.5" :title="weather.resolvedCity">
              {{ weather.resolvedCity }}
            </p>
            <p class="text-[11px] text-slate-500 truncate">
              <template v-if="updatedAtLabel">{{ updatedAtLabel }} · </template>
              {{ weather.timezone }}
            </p>
          </div>
        </div>
      </div>

      <!-- 7-Day Weather Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
        <article
          v-for="day in dailyPreview"
          :key="day.date"
          class="rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-200 transition-colors p-3 flex flex-col justify-between gap-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-900 capitalize truncate">
                {{ formatWeatherShortDate(day.date) }}
              </p>
              <p
                class="text-[11px] text-slate-500 mt-0.5 line-clamp-2 min-h-[2rem]"
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

          <div class="flex items-baseline gap-1.5">
            <span class="text-lg font-extrabold text-slate-900 tabular-nums">
              {{ formatSignedTemperature(day.tempMax, true) }}
            </span>
            <span class="text-xs font-semibold text-slate-400 tabular-nums">
              / {{ formatSignedTemperature(day.tempMin, true) }}
            </span>
          </div>

          <div class="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1 text-[11px] text-slate-600 tabular-nums">
            <span class="inline-flex items-center gap-1 truncate">
              <Droplets
                :class="[
                  'w-3 h-3 shrink-0',
                  day.precipitationMm > 0 || (day.precipitationProbMax ?? 0) >= 40
                    ? 'text-blue-500'
                    : 'text-slate-400',
                ]"
              />
              <span>{{ formatWeatherDecimal(day.precipitationMm) }} мм</span>
            </span>
            <span class="inline-flex items-center gap-0.5 text-slate-500 shrink-0">
              <Wind class="w-3 h-3 text-slate-400" />
              <span>{{ formatWeatherDecimal(day.windSpeedMaxKmh) }}</span>
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
