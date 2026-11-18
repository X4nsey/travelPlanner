<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import {
  Map,
  Globe2,
  CalendarDays,
  MapPin,
  Briefcase,
  FileCheck2,
  ArrowRight,
  Clock,
  Users,
  Compass,
  Plus,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { getTripTypeLabelRu } from '@/constants/packing';
import {
  formatDateRange,
  formatDaysLabel,
  formatTravelersLabel,
  pluralizeRu,
} from '@/composables/useFormatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const emit = defineEmits<{
  (e: 'open-templates'): void;
}>();

const tripStore = useTripStore();
const countryStore = useCountryStore();

onMounted(() => {
  countryStore.ensureCountriesLoaded().catch(() => {});
  if (!tripStore.stats && !tripStore.isLoadingStats) {
    tripStore.fetchStats().catch(() => {});
  }
});

const stats = computed(() => tripStore.stats);
const featuredTrip = computed(() => stats.value?.featuredTrip ?? null);

const tripsSubtitle = computed(() => {
  if (!stats.value) return '';
  const parts: string[] = [];
  if (stats.value.ongoingTripsCount > 0) {
    parts.push(`Идёт сейчас: ${stats.value.ongoingTripsCount}`);
  }
  parts.push(`Предстоящих: ${stats.value.upcomingTripsCount}`);
  parts.push(`Завершённых: ${stats.value.completedTripsCount}`);
  return parts.join(' · ');
});

const geographyHeadline = computed(() => {
  if (!stats.value) return '0 стран · 0 городов';
  const c = stats.value.uniqueCountriesCount;
  const ci = stats.value.uniqueCitiesCount;
  const countriesLabel = `${c} ${pluralizeRu(c, ['страна', 'страны', 'стран'])}`;
  const citiesLabel = `${ci} ${pluralizeRu(ci, ['город', 'города', 'городов'])}`;
  return `${countriesLabel} · ${citiesLabel}`;
});

const countryChips = computed(() => {
  if (!stats.value) return [];
  return stats.value.countries.map((item) => {
    const matched = countryStore.findCountryByQuery(item.country);
    return {
      ...item,
      flagUrl: matched?.flagUrl || '',
      slug: matched?.slug || null,
    };
  });
});

const featuredCountry = computed(() => {
  if (!featuredTrip.value) return undefined;
  return countryStore.findCountryByQuery(featuredTrip.value.country);
});

const featuredCountdownBadge = computed(() => {
  const ft = featuredTrip.value;
  if (!ft) return null;

  if (ft.timingStatus === 'ongoing') {
    return {
      label: 'Идёт сейчас',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pulse: true,
    };
  }
  if (ft.daysUntilStart === 1) {
    return {
      label: 'Старт завтра',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      pulse: false,
    };
  }
  return {
    label: `Через ${ft.daysUntilStart} дн.`,
    classes: 'bg-teal-50 text-teal-700 border-teal-200',
    pulse: false,
  };
});

const featuredEventsLabel = computed(() => {
  const count = featuredTrip.value?.eventsCount ?? 0;
  return `${count} ${pluralizeRu(count, ['событие', 'события', 'событий'])}`;
});

const packingHint = computed(() => {
  const p = featuredTrip.value?.packing;
  if (!p || p.totalCount === 0) {
    return 'Список вещей ещё не составлен';
  }
  if (p.packedCount >= p.totalCount) {
    return 'Все вещи собраны и отмечены';
  }
  const remaining = p.totalCount - p.packedCount;
  return `Осталось собрать: ${remaining} ${pluralizeRu(remaining, ['позиция', 'позиции', 'позиций'])}`;
});

const documentsHint = computed(() => {
  const d = featuredTrip.value?.documents;
  if (!d || d.totalCount === 0) {
    return 'Добавьте билеты, отели и страховку';
  }
  if (d.readyCount >= d.totalCount) {
    return 'Все брони и документы готовы';
  }
  const remaining = d.totalCount - d.readyCount;
  return `Осталось подготовить: ${remaining} ${pluralizeRu(remaining, ['пункт', 'пункта', 'пунктов'])}`;
});

function retryLoad() {
  tripStore.fetchStats().catch(() => {});
}
</script>

<template>
  <section class="space-y-6">
    <!-- Loading Skeleton -->
    <template v-if="tripStore.isLoadingStats && !stats">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          v-for="idx in 4"
          :key="idx"
          class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft animate-pulse"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-24 bg-slate-100 rounded" />
              <div class="h-7 w-16 bg-slate-200 rounded" />
              <div class="h-3 w-32 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft animate-pulse space-y-4">
        <div class="h-4 w-40 bg-slate-100 rounded" />
        <div class="h-7 w-72 bg-slate-200 rounded" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div class="h-20 bg-slate-100 rounded-xl" />
          <div class="h-20 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else-if="tripStore.statsError && !stats" class="space-y-3">
      <BaseAlert
        type="error"
        title="Не удалось загрузить статистику путешественника"
        :message="tripStore.statsError"
      />
      <BaseButton variant="outline" size="sm" @click="retryLoad">
        <RefreshCw class="w-4 h-4" />
        <span>Повторить</span>
      </BaseButton>
    </div>

    <!-- Loaded Content -->
    <template v-else-if="stats">
      <!-- 1. Four Key Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Total Trips -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex items-start gap-4 hover:border-teal-200/80 transition-colors"
        >
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Map class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Всего поездок
            </p>
            <p class="text-3xl font-extrabold text-slate-900 mt-0.5 leading-tight">
              {{ stats.totalTrips }}
            </p>
            <p class="text-xs text-slate-500 mt-1 leading-snug">
              {{ tripsSubtitle }}
            </p>
          </div>
        </div>

        <!-- Geography -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex items-start gap-4 hover:border-sky-200/80 transition-colors"
        >
          <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Globe2 class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              География
            </p>
            <p class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              {{ geographyHeadline }}
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Уникальные направления маршрутов
            </p>
          </div>
        </div>

        <!-- Total Travel Days -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex items-start gap-4 hover:border-emerald-200/80 transition-colors"
        >
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarDays class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Дней в путешествиях
            </p>
            <p class="text-3xl font-extrabold text-slate-900 mt-0.5 leading-tight">
              {{ stats.totalTravelDays }}
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Суммарно по всем маршрутам
            </p>
          </div>
        </div>

        <!-- Planned Places & Events -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex items-start gap-4 hover:border-indigo-200/80 transition-colors"
        >
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Мест и событий
            </p>
            <p class="text-3xl font-extrabold text-slate-900 mt-0.5 leading-tight">
              {{ stats.totalEventsCount }}
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Запланировано по дням
            </p>
          </div>
        </div>
      </div>

      <!-- 2. Route Countries Flag Ribbon -->
      <div
        v-if="countryChips.length > 0"
        class="bg-white rounded-2xl border border-slate-200/80 px-5 py-4 shadow-soft space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Globe2 class="w-4 h-4 text-teal-600" />
            <h2 class="text-sm font-bold text-slate-800">Страны ваших маршрутов</h2>
          </div>
          <span class="text-xs font-medium text-slate-500">
            {{ countryChips.length }}
            {{ pluralizeRu(countryChips.length, ['направление', 'направления', 'направлений']) }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <template v-for="item in countryChips" :key="item.country">
            <RouterLink
              v-if="item.slug"
              :to="`/countries/${item.slug}`"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 text-xs font-semibold text-slate-800 transition-colors"
            >
              <img
                v-if="item.flagUrl"
                :src="item.flagUrl"
                :alt="item.country"
                loading="lazy"
                class="w-5 h-3.5 object-cover rounded-[3px] border border-slate-200/80 shrink-0"
              />
              <Globe2 v-else class="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{{ item.country }}</span>
              <CheckCircle2
                v-if="item.isCompleted"
                class="w-3.5 h-3.5 text-emerald-600 shrink-0"
                title="Поездка завершена"
              />
              <span
                class="px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 leading-none"
              >
                {{ item.tripsCount }}
              </span>
            </RouterLink>

            <div
              v-else
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
            >
              <img
                v-if="item.flagUrl"
                :src="item.flagUrl"
                :alt="item.country"
                loading="lazy"
                class="w-5 h-3.5 object-cover rounded-[3px] border border-slate-200/80 shrink-0"
              />
              <Globe2 v-else class="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{{ item.country }}</span>
              <CheckCircle2
                v-if="item.isCompleted"
                class="w-3.5 h-3.5 text-emerald-600 shrink-0"
                title="Поездка завершена"
              />
              <span
                class="px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 leading-none"
              >
                {{ item.tripsCount }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 3. Featured Trip Command Center Widget -->
      <div
        v-if="featuredTrip"
        class="bg-white rounded-2xl border border-teal-200/80 shadow-soft overflow-hidden"
      >
        <!-- Top Header Band -->
        <div
          class="px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-50/80 via-sky-50/50 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700"
            >
              <Compass class="w-4 h-4 text-teal-600" />
              <span>Ближайшая поездка · Командный центр</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="featuredTrip.tripType"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70"
            >
              {{ getTripTypeLabelRu(featuredTrip.tripType) }}
            </span>

            <span
              v-if="featuredCountdownBadge"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                featuredCountdownBadge.classes,
              ]"
            >
              <span
                v-if="featuredCountdownBadge.pulse"
                class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              />
              <Clock v-else class="w-3.5 h-3.5" />
              <span>{{ featuredCountdownBadge.label }}</span>
            </span>
          </div>
        </div>

        <!-- Main Body -->
        <div class="p-5 sm:p-6 space-y-6">
          <!-- Trip Title, Flag & Meta -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5 min-w-0">
              <div class="mt-1 shrink-0">
                <img
                  v-if="featuredCountry?.flagUrl"
                  :src="featuredCountry.flagUrl"
                  :alt="featuredTrip.country"
                  class="w-10 h-7 object-cover rounded-md shadow-sm border border-slate-200/90"
                />
                <div
                  v-else
                  class="w-10 h-7 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600"
                >
                  <Globe2 class="w-4 h-4" />
                </div>
              </div>

              <div class="min-w-0 space-y-1.5">
                <RouterLink
                  :to="`/trips/${featuredTrip.id}`"
                  class="block text-xl sm:text-2xl font-extrabold text-slate-900 hover:text-teal-700 transition-colors leading-tight"
                >
                  {{ featuredTrip.title }}
                </RouterLink>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600">
                  <span class="inline-flex items-center gap-1.5 font-semibold text-teal-700">
                    <MapPin class="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{{ featuredTrip.country }}, {{ featuredTrip.city }}</span>
                  </span>

                  <span class="inline-flex items-center gap-1.5">
                    <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{{ formatDateRange(featuredTrip.startDate, featuredTrip.endDate) }}</span>
                  </span>

                  <span class="inline-flex items-center gap-1.5">
                    <Clock class="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{{ formatDaysLabel(featuredTrip.durationDays) }}</span>
                  </span>

                  <span class="inline-flex items-center gap-1.5">
                    <Users class="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{{ formatTravelersLabel(featuredTrip.travelersCount) }}</span>
                  </span>
                </div>
              </div>
            </div>

            <RouterLink :to="`/trips/${featuredTrip.id}`" class="shrink-0">
              <BaseButton variant="primary" size="md">
                <span>Открыть поездку</span>
                <ArrowRight class="w-4 h-4" />
              </BaseButton>
            </RouterLink>
          </div>

          <!-- Two Readiness Progress Bars -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Packing Readiness -->
            <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Briefcase class="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Список вещей</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="font-semibold text-slate-600">
                    {{ featuredTrip.packing.packedCount }} / {{ featuredTrip.packing.totalCount }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200/70"
                  >
                    {{ featuredTrip.packing.percentage }}%
                  </span>
                </div>
              </div>

              <div class="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  :style="{ width: `${Math.min(100, Math.max(0, featuredTrip.packing.percentage))}%` }"
                />
              </div>

              <p class="text-xs text-slate-500">
                {{ packingHint }}
              </p>
            </div>

            <!-- Documents Readiness -->
            <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FileCheck2 class="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Брони и чек-лист</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="font-semibold text-slate-600">
                    {{ featuredTrip.documents.readyCount }} / {{ featuredTrip.documents.totalCount }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200/70"
                  >
                    {{ featuredTrip.documents.percentage }}%
                  </span>
                </div>
              </div>

              <div class="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                  :style="{ width: `${Math.min(100, Math.max(0, featuredTrip.documents.percentage))}%` }"
                />
              </div>

              <p class="text-xs text-slate-500">
                {{ documentsHint }}
              </p>
            </div>
          </div>

          <!-- Quick Navigation Buttons to Specific Trip Tabs -->
          <div class="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100">
            <span class="text-xs font-semibold text-slate-500 mr-1">Быстрый переход:</span>

            <RouterLink :to="{ path: `/trips/${featuredTrip.id}`, query: { tab: 'itinerary' } }">
              <BaseButton variant="outline" size="sm">
                <CalendarDays class="w-4 h-4 text-teal-600" />
                <span>План по дням</span>
                <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {{ featuredEventsLabel }}
                </span>
              </BaseButton>
            </RouterLink>

            <RouterLink :to="{ path: `/trips/${featuredTrip.id}`, query: { tab: 'packing' } }">
              <BaseButton variant="outline" size="sm">
                <Briefcase class="w-4 h-4 text-emerald-600" />
                <span>Список вещей</span>
              </BaseButton>
            </RouterLink>

            <RouterLink :to="{ path: `/trips/${featuredTrip.id}`, query: { tab: 'documents' } }">
              <BaseButton variant="outline" size="sm">
                <FileCheck2 class="w-4 h-4 text-sky-600" />
                <span>Брони и чек-лист</span>
              </BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 3b. Empty / Plan Next Trip Invitation (when featuredTrip === null) -->
      <div
        v-else
        class="bg-white rounded-2xl border border-dashed border-teal-300/90 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Compass class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <h2 class="text-base sm:text-lg font-bold text-slate-900">
              {{
                stats.totalTrips === 0
                  ? 'Спланируйте своё первое путешествие'
                  : 'Нет активных или предстоящих поездок'
              }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-xl">
              Создайте новый маршрут с нуля или выберите готовый кураторский план — здесь сразу появится обратный отсчёт и прогресс подготовки вещей и броней.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <BaseButton variant="secondary" size="md" @click="emit('open-templates')">
            <Sparkles class="w-4 h-4" />
            <span>Готовые маршруты</span>
          </BaseButton>

          <RouterLink to="/trips/new">
            <BaseButton variant="primary" size="md">
              <Plus class="w-4 h-4" />
              <span>Создать поездку</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </template>
  </section>
</template>
