<script setup lang="ts">
import { computed } from 'vue';
import {
  MapPin,
  Thermometer,
  Umbrella,
  Droplets,
  Wind,
  RefreshCw,
  Clock,
  Info,
  AlertTriangle,
  CloudSnow,
  CloudRainWind,
} from 'lucide-vue-next';
import type { TripWeatherResponseDto } from '@/types/weather';
import { pluralizeRu } from '@/composables/useFormatters';
import {
  formatSignedTemperature,
  formatTemperatureRange,
  formatWeatherDecimal,
  formatWeatherUpdatedAt,
} from '@/utils/weatherFormatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import WeatherIcon from './WeatherIcon.vue';

interface Props {
  weather: TripWeatherResponseDto;
  refreshing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  refreshing: false,
});

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const isForecastMode = computed(() => props.weather.sourceMode === 'forecast');

const primaryIconType = computed(() => {
  if (props.weather.summary.hasSnow) return 'snow';
  if (props.weather.summary.hasHeavyRain) return 'heavy_rain';
  return props.weather.daily[0]?.iconType ?? 'partly_cloudy';
});

const tempRangeLabel = computed(() =>
  formatTemperatureRange(props.weather.summary.minTemp, props.weather.summary.maxTemp)
);

const avgTempDayLabel = computed(() =>
  formatSignedTemperature(props.weather.summary.avgTempMax)
);

const avgTempNightLabel = computed(() =>
  formatSignedTemperature(props.weather.summary.avgTempMin)
);

const rainyDaysLabel = computed(() => {
  const count = props.weather.summary.rainyDaysCount;
  return `${count} ${pluralizeRu(count, ['день', 'дня', 'дней'])}`;
});

const formattedUpdatedAt = computed(() => formatWeatherUpdatedAt(props.weather.fetchedAt));
</script>

<template>
  <section class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 sm:p-6 space-y-5">
    <!-- Top Header: Location, Mode Badge & Refresh Action -->
    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
      <div class="flex items-start gap-3.5 min-w-0">
        <WeatherIcon
          :type="primaryIconType"
          size="lg"
          :with-background="true"
        />

        <div class="space-y-1.5 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 inline-flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-teal-600 shrink-0" />
              <span class="truncate">{{ weather.resolvedCity }}, {{ weather.resolvedCountry }}</span>
            </h2>

            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                isForecastMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-800 border-amber-200/80',
              ]"
            >
              {{ weather.sourceLabelRu }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span v-if="formattedUpdatedAt" class="inline-flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              <span>Обновлено: {{ formattedUpdatedAt }}</span>
            </span>
            <span v-if="weather.timezone" class="text-slate-400">
              Часовой пояс: {{ weather.timezone }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          :loading="refreshing"
          @click="emit('refresh')"
        >
          <template #icon>
            <RefreshCw class="w-4 h-4" />
          </template>
          <span>{{ refreshing ? 'Обновление...' : 'Обновить' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Disclaimer Banner (Seasonal reference / partial forecast window / country fallback) -->
    <div
      v-if="weather.disclaimerRu"
      :class="[
        'rounded-xl border p-3.5 flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed',
        isForecastMode
          ? 'bg-sky-50/80 border-sky-200/80 text-sky-900'
          : 'bg-amber-50/85 border-amber-200/80 text-amber-900',
      ]"
    >
      <Info v-if="isForecastMode" class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
      <AlertTriangle v-else class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p>{{ weather.disclaimerRu }}</p>
    </div>

    <!-- Weather Summary KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Temperature Range & Average -->
      <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Thermometer class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500">Температура</p>
          <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
            {{ tempRangeLabel }}
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            Средняя: {{ avgTempDayLabel }} днём · {{ avgTempNightLabel }} ночью
          </p>
        </div>
      </div>

      <!-- Rainy Days -->
      <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <Umbrella class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500">Дождливые дни</p>
          <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
            {{ rainyDaysLabel }}
          </p>
          <div
            v-if="weather.summary.hasSnow || weather.summary.hasHeavyRain"
            class="flex flex-wrap items-center gap-1.5 mt-1"
          >
            <span
              v-if="weather.summary.hasHeavyRain"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200/70"
            >
              <CloudRainWind class="w-3 h-3" />
              Сильные осадки
            </span>
            <span
              v-if="weather.summary.hasSnow"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-semibold border border-cyan-200/70"
            >
              <CloudSnow class="w-3 h-3" />
              Снег
            </span>
          </div>
          <p v-else class="text-[11px] text-slate-500 mt-0.5">
            Из {{ weather.daily.length }} {{ pluralizeRu(weather.daily.length, ['дня', 'дней', 'дней']) }} в выборке
          </p>
        </div>
      </div>

      <!-- Total Precipitation -->
      <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Droplets class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500">Сумма осадков</p>
          <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
            {{ formatWeatherDecimal(weather.summary.totalPrecipitationMm) }} мм
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Суммарно за период
          </p>
        </div>
      </div>

      <!-- Max Wind -->
      <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Wind class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500">Макс. ветер</p>
          <p class="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
            {{ formatWeatherDecimal(weather.summary.maxWindKmh) }} км/ч
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Максимальная скорость за день
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
