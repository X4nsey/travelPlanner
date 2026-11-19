<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  AlertCircle,
  MapPinOff,
  RefreshCw,
  Pencil,
  Briefcase,
  Sparkles,
  ArrowRight,
} from 'lucide-vue-next';
import { useWeatherStore } from '@/stores/weather.store';
import { useToastStore } from '@/stores/toast.store';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import WeatherSummaryBanner from './WeatherSummaryBanner.vue';
import WeatherDailyGrid from './WeatherDailyGrid.vue';

interface Props {
  tripId: string;
  tripCity?: string;
  tripCountry?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'go-to-packing'): void;
}>();

const router = useRouter();
const weatherStore = useWeatherStore();
const toastStore = useToastStore();

const weather = computed(() => weatherStore.weatherByTripId[props.tripId] ?? null);
const isLoading = computed(() => Boolean(weatherStore.loadingByTripId[props.tripId]));
const isRefreshing = computed(() => Boolean(weatherStore.refreshingByTripId[props.tripId]));
const error = computed(() => weatherStore.errorByTripId[props.tripId] ?? null);
const errorCode = computed(() => weatherStore.errorCodeByTripId[props.tripId] ?? null);

const isLocationNotFound = computed(() => errorCode.value === 'WEATHER_LOCATION_NOT_FOUND');

const locationDisplay = computed(() =>
  [props.tripCountry, props.tripCity].filter(Boolean).join(', ')
);

onMounted(() => {
  if (!weather.value && !isLoading.value && !error.value) {
    weatherStore.fetchTripWeather(props.tripId).catch(() => {
      // Error is handled reactively via weatherStore.errorByTripId
    });
  }
});

async function handleRetry() {
  try {
    await weatherStore.fetchTripWeather(props.tripId, { force: true });
  } catch {
    // Error is stored in weatherStore
  }
}

async function handleRefresh() {
  try {
    await weatherStore.refreshTripWeather(props.tripId);
    toastStore.success('Прогноз погоды обновлён');
  } catch (err: any) {
    toastStore.error(
      'Не удалось обновить погоду',
      err?.message || 'Попробуйте повторить чуть позже'
    );
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading Skeleton State -->
    <div v-if="isLoading && !weather" class="space-y-6 animate-pulse" aria-busy="true">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6 space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3.5 flex-1">
            <div class="w-12 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-800 shrink-0" />
            <div class="space-y-2 flex-1 max-w-md">
              <div class="h-5 w-56 bg-slate-200/80 dark:bg-slate-800 rounded-lg" />
              <div class="h-3.5 w-40 bg-slate-100 dark:bg-slate-800/70 rounded-lg" />
            </div>
          </div>
          <div class="h-8 w-24 bg-slate-200/80 dark:bg-slate-800 rounded-xl shrink-0" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            v-for="i in 4"
            :key="i"
            class="h-24 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800"
          />
        </div>
      </div>

      <div class="h-20 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-500/20" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        <div
          v-for="i in 4"
          :key="i"
          class="h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1.5">
              <div class="h-4 w-24 bg-slate-200/80 dark:bg-slate-800 rounded" />
              <div class="h-3 w-32 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
          <div class="h-7 w-20 bg-slate-200/80 dark:bg-slate-800 rounded" />
          <div class="h-3 w-full bg-slate-100 dark:bg-slate-800/70 rounded" />
        </div>
      </div>
    </div>

    <!-- Error State (when no cached weather data is available) -->
    <div
      v-else-if="!weather && error"
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-8 max-w-2xl mx-auto text-center space-y-4"
    >
      <div
        :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto',
          isLocationNotFound
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
        ]"
      >
        <MapPinOff v-if="isLocationNotFound" class="w-7 h-7" />
        <AlertCircle v-else class="w-7 h-7" />
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          {{
            isLocationNotFound
              ? 'Город или направление не найдены на карте погоды'
              : 'Не удалось загрузить прогноз погоды'
          }}
        </h3>

        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <template v-if="isLocationNotFound">
            Погодный сервис не смог определить координаты
            <template v-if="locationDisplay">
              для направления «<strong>{{ locationDisplay }}</strong>»
            </template>
            . Проверьте корректность названия города и страны в параметрах поездки (например, укажите крупный город поблизости или уточните написание).
          </template>
          <template v-else>
            {{ error }}
          </template>
        </p>

        <p v-if="isLocationNotFound && error" class="text-xs text-slate-400 dark:text-slate-500">
          {{ error }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <BaseButton variant="primary" size="sm" :loading="isLoading" @click="handleRetry">
          <template #icon>
            <RefreshCw class="w-4 h-4" />
          </template>
          <span>Повторить</span>
        </BaseButton>

        <BaseButton
          v-if="isLocationNotFound"
          variant="outline"
          size="sm"
          @click="router.push(`/trips/${tripId}/edit`)"
        >
          <template #icon>
            <Pencil class="w-4 h-4" />
          </template>
          <span>Изменить город или страну</span>
        </BaseButton>
      </div>
    </div>

    <!-- Loaded Weather Content -->
    <template v-else-if="weather">
      <!-- Inline error if a subsequent refresh failed -->
      <BaseAlert
        v-if="error"
        type="error"
        title="Не удалось обновить данные о погоде"
        :message="error"
      />

      <!-- Summary Banner -->
      <WeatherSummaryBanner
        :weather="weather"
        :refreshing="isRefreshing"
        @refresh="handleRefresh"
      />

      <!-- Smart Packing List Integration Notice -->
      <div
        class="rounded-2xl border border-teal-200/80 dark:border-teal-500/30 bg-gradient-to-r from-teal-50/90 to-sky-50/70 dark:from-teal-950/50 dark:to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-white dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-200/70 dark:border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm dark:shadow-none">
            <Sparkles class="w-5 h-5" />
          </div>
          <div class="space-y-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold text-slate-900 dark:text-slate-100">
                Связь со списком вещей
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30">
                {{ weather.climateLabelRu }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              При генерации и обновлении списка вещей система автоматически учитывает этот погодный режим, вероятность осадков и силу ветра.
            </p>
          </div>
        </div>

        <BaseButton
          variant="primary"
          size="sm"
          class="shrink-0"
          @click="emit('go-to-packing')"
        >
          <template #icon>
            <Briefcase class="w-4 h-4" />
          </template>
          <span>Перейти к списку вещей</span>
          <ArrowRight class="w-4 h-4" />
        </BaseButton>
      </div>

      <!-- Daily Forecast Grid -->
      <WeatherDailyGrid :daily="weather.daily" />
    </template>
  </div>
</template>
