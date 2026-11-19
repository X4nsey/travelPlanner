<script setup lang="ts">
import { Droplets, Wind, Calendar } from 'lucide-vue-next';
import type { WeatherDailyItemDto } from '@/types/weather';
import { formatDaysLabel } from '@/composables/useFormatters';
import {
  formatSignedTemperature,
  formatWeatherDecimal,
  formatWeatherShortDate,
} from '@/utils/weatherFormatters';
import WeatherIcon from './WeatherIcon.vue';

interface Props {
  daily: WeatherDailyItemDto[];
}

defineProps<Props>();
</script>

<template>
  <section class="space-y-3.5">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
        <Calendar class="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span>Погода по дням</span>
      </h3>
      <span
        v-if="daily.length > 0"
        class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        {{ formatDaysLabel(daily.length) }}
      </span>
    </div>

    <div
      v-if="daily.length === 0"
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 text-center text-sm text-slate-500 dark:text-slate-400"
    >
      Посуточные данные о погоде для выбранного диапазона дат недоступны.
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
    >
      <article
        v-for="day in daily"
        :key="day.date"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-4 flex flex-col justify-between gap-3.5 hover:border-teal-200 dark:hover:border-teal-500/40 transition-colors"
      >
        <!-- Header: Date & Weather Icon -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {{ formatWeatherShortDate(day.date) }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {{ day.conditionRu }}
            </p>
          </div>

          <WeatherIcon
            :type="day.iconType"
            size="md"
            :with-background="true"
            :title="day.conditionRu"
          />
        </div>

        <!-- Temperatures: Day (Max) / Night (Min) -->
        <div class="flex items-baseline gap-2 pt-1">
          <span
            class="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums"
            title="Максимальная температура днём"
          >
            {{ formatSignedTemperature(day.tempMax, true) }}
          </span>
          <span
            class="text-sm font-semibold text-slate-400 dark:text-slate-500 tabular-nums"
            title="Минимальная температура ночью"
          >
            / {{ formatSignedTemperature(day.tempMin, true) }}
          </span>
        </div>

        <!-- Precipitation & Wind Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div class="inline-flex items-center gap-1.5 min-w-0">
            <Droplets
              :class="[
                'w-3.5 h-3.5 shrink-0',
                day.precipitationMm > 0 || (day.precipitationProbMax ?? 0) >= 40
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500',
              ]"
            />
            <span class="tabular-nums truncate">
              {{ formatWeatherDecimal(day.precipitationMm) }} мм
              <template v-if="day.precipitationProbMax !== null">
                · {{ day.precipitationProbMax }}%
              </template>
            </span>
          </div>

          <div class="inline-flex items-center gap-1 shrink-0 text-slate-500 dark:text-slate-400 tabular-nums">
            <Wind class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{{ formatWeatherDecimal(day.windSpeedMaxKmh) }} км/ч</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
