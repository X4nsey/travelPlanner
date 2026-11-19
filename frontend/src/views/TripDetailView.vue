<script setup lang="ts">
import { computed, nextTick, onMounted, ref, defineAsyncComponent, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Wallet,
  Pencil,
  Trash2,
  Plus,
  FileText,
  CalendarDays,
  StickyNote,
  RefreshCw,
  Coins,
  Receipt,
  TrendingUp,
  AlertCircle,
  Filter,
  Car,
  Utensils,
  Hotel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  CheckCircle2,
  Briefcase,
  Compass,
  CloudSun,
  BookOpen,
  Globe2,
  FileDown,
  FileCheck2,
  ArrowRightLeft,
  BarChart3,
  Copy,
  Share2,
} from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { usePackingStore } from '@/stores/packing.store';
import { useDocumentStore } from '@/stores/document.store';
import { useWeatherStore } from '@/stores/weather.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import { expenseService } from '@/services/expense.service';
import { countryService } from '@/services/country.service';
import { getTripTypeLabelRu } from '@/constants/packing';
import { formatTemperatureRange } from '@/utils/weatherFormatters';
import type {
  EventFormPayload,
  ItineraryEvent,
  TripExpense,
  ExpenseFormPayload,
  TripExpenseSummary,
  ExpenseCategory,
  CountryTravelInfo,
  DuplicateTripPayload,
} from '@/types';
import {
  formatDateRange,
  formatRussianDate,
  formatDaysLabel,
  formatTravelersLabel,
  formatCurrency,
  generateCalendarDays,
  getTripTimingStatus,
} from '@/composables/useFormatters';
import { resolveTripTheme } from '@/composables/useTripTheme';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import TripThemeSwitcher from '@/components/trips/TripThemeSwitcher.vue';
import type { GuideReloadableSection } from '@/components/trips/TripGuideExportModal.vue';

const EventFormModal = defineAsyncComponent(
  () => import('@/components/trips/EventFormModal.vue')
);

const ExpenseCategoryChart = defineAsyncComponent(
  () => import('@/components/trips/ExpenseCategoryChart.vue')
);

const ExpenseFormModal = defineAsyncComponent(
  () => import('@/components/trips/ExpenseFormModal.vue')
);

const PackingListSection = defineAsyncComponent(
  () => import('@/components/packing/PackingListSection.vue')
);

const TripDocumentsSection = defineAsyncComponent(
  () => import('@/components/documents/TripDocumentsSection.vue')
);

const TripWeatherSection = defineAsyncComponent(
  () => import('@/components/weather/TripWeatherSection.vue')
);

const CountryTravelInfoSection = defineAsyncComponent(
  () => import('@/components/countries/CountryTravelInfoSection.vue')
);

const TripGuideExportModal = defineAsyncComponent(
  () => import('@/components/trips/TripGuideExportModal.vue')
);

const DuplicateTripModal = defineAsyncComponent(
  () => import('@/components/trips/DuplicateTripModal.vue')
);

const ShareTripModal = defineAsyncComponent(
  () => import('@/components/trips/ShareTripModal.vue')
);

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const packingStore = usePackingStore();
const documentStore = useDocumentStore();
const weatherStore = useWeatherStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();

type TripDetailTab =
  | 'overview'
  | 'itinerary'
  | 'expenses'
  | 'packing'
  | 'documents'
  | 'weather'
  | 'travel-info';

const tripId = computed(() => route.params.id as string);
const activeTab = ref<TripDetailTab>('overview');

// Scrollable tabs bar state (hidden native scrollbar + overflow-only chevron buttons)
const tabsScrollRef = ref<HTMLElement | null>(null);
const canScrollTabsLeft = ref(false);
const canScrollTabsRight = ref(false);

function updateTabsScrollState() {
  const el = tabsScrollRef.value;
  if (!el) {
    canScrollTabsLeft.value = false;
    canScrollTabsRight.value = false;
    return;
  }
  const maxScrollLeft = el.scrollWidth - el.clientWidth;
  if (maxScrollLeft <= 2) {
    canScrollTabsLeft.value = false;
    canScrollTabsRight.value = false;
    return;
  }
  canScrollTabsLeft.value = el.scrollLeft > 2;
  canScrollTabsRight.value = el.scrollLeft < maxScrollLeft - 2;
}

function scrollTabs(direction: 'left' | 'right') {
  const el = tabsScrollRef.value;
  if (!el) return;
  const step = Math.max(180, Math.round(el.clientWidth * 0.6));
  el.scrollBy({
    left: direction === 'left' ? -step : step,
    behavior: 'smooth',
  });
}

function selectTab(tab: TripDetailTab, event?: MouseEvent) {
  activeTab.value = tab;
  const target = event?.currentTarget as HTMLElement | null;
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }
}

// Country travel info state
const fetchedTravelInfo = ref<CountryTravelInfo | null>(null);
const fetchedTravelInfoSlug = ref<string | null>(null);
const isLoadingTravelInfo = ref(false);
const travelInfoError = ref<string | null>(null);

// Trip deletion state
const showDeleteTripConfirm = ref(false);
const isDeletingTrip = ref(false);

// Event modal state
const eventModalOpen = ref(false);
const selectedDayDate = ref('');
const editingEvent = ref<ItineraryEvent | null>(null);
const isSavingEvent = ref(false);
const eventModalRef = ref<{ setError: (msg: string | null) => void } | null>(null);

// Event deletion state
const eventToDelete = ref<ItineraryEvent | null>(null);
const isDeletingEvent = ref(false);

// Expenses state
const tripExpenses = ref<TripExpense[]>([]);
const expenseSummary = ref<TripExpenseSummary | null>(null);
const isLoadingExpenses = ref(false);
const expensesError = ref<string | null>(null);

const expenseModalOpen = ref(false);
const editingExpense = ref<TripExpense | null>(null);
const isSavingExpense = ref(false);
const expenseModalRef = ref<{ setError: (msg: string | null) => void } | null>(null);

const expenseToDelete = ref<TripExpense | null>(null);
const isDeletingExpense = ref(false);

const selectedCategoryFilter = ref<ExpenseCategory | null>(null);

const trip = computed(() => tripStore.currentTrip);

const tripTheme = computed(() =>
  resolveTripTheme(trip.value?.id ?? tripId.value, trip.value?.tripType)
);

const matchedCountry = computed(() => {
  if (!trip.value?.country) return undefined;
  return countryStore.findCountryByQuery(trip.value.country);
});

const resolvedTravelInfo = computed<CountryTravelInfo | null>(() => {
  if (!matchedCountry.value) return null;
  if (matchedCountry.value.travelInfo) {
    return matchedCountry.value.travelInfo;
  }
  if (fetchedTravelInfoSlug.value === matchedCountry.value.slug) {
    return fetchedTravelInfo.value;
  }
  return null;
});

const currentTripWeather = computed(
  () => weatherStore.weatherByTripId[tripId.value] ?? null
);

const currentTripDocuments = computed(
  () => documentStore.getDocuments(tripId.value)
);

const currentTripDocumentsSummary = computed(
  () => documentStore.getSummary(tripId.value)
);

const weatherTabTempRange = computed(() => {
  if (!currentTripWeather.value) return null;
  const { minTemp, maxTemp } = currentTripWeather.value.summary;
  return formatTemperatureRange(minTemp, maxTemp);
});

const tripWeatherContextKey = computed(() => {
  if (!trip.value) return null;
  return `${trip.value.id}|${trip.value.country.trim()}|${trip.value.city.trim()}|${trip.value.startDate}|${trip.value.endDate}`;
});

const timing = computed(() => {
  if (!trip.value) return null;
  return getTripTimingStatus(trip.value.startDate, trip.value.endDate);
});

const calendarDays = computed(() => {
  if (!trip.value) return [];
  return generateCalendarDays(trip.value.startDate, trip.value.endDate);
});

const eventsByDate = computed(() => {
  const map: Record<string, ItineraryEvent[]> = {};
  const list = trip.value?.events || [];
  for (const ev of list) {
    if (!map[ev.date]) {
      map[ev.date] = [];
    }
    map[ev.date].push(ev);
  }
  return map;
});

const totalEventsCount = computed(() => (trip.value?.events || []).length);

const totalEstimatedEventsCost = computed(() => {
  const list = trip.value?.events || [];
  return list.reduce((sum, ev) => sum + (ev.estimatedCost ? Number(ev.estimatedCost) : 0), 0);
});

const filteredExpenses = computed(() => {
  if (!selectedCategoryFilter.value) {
    return tripExpenses.value;
  }
  return tripExpenses.value.filter((e) => e.category === selectedCategoryFilter.value);
});

const hasForeignCurrencyExpenses = computed(() => {
  if (!trip.value) return false;
  return tripExpenses.value.some((exp) => exp.currency !== trip.value!.currency);
});

function formatRateNumber(val: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: val >= 1 ? 2 : 4,
  }).format(val);
}

const formattedExchangeRatesLine = computed(() => {
  const ratesInfo = expenseSummary.value?.exchangeRates;
  if (!ratesInfo || !trip.value) return '';
  const base = trip.value.currency;
  const rates = ratesInfo.rates;
  const otherCurrencies = (['USD', 'EUR', 'RUB'] as const).filter((c) => c !== base);

  return otherCurrencies
    .map((curr) => {
      const fromRate = rates[curr];
      const baseRate = rates[base];
      if (!fromRate || !baseRate) return '';
      const direct = baseRate / fromRate;
      if (direct < 0.1) {
        const inverse = fromRate / baseRate;
        return `1 ${base} = ${formatRateNumber(inverse)} ${curr}`;
      }
      return `1 ${curr} = ${formatRateNumber(direct)} ${base}`;
    })
    .filter(Boolean)
    .join(' · ');
});

const maxDailyExpenseAmount = computed(() => {
  const days = expenseSummary.value?.byDay || [];
  if (days.length === 0) return 1;
  return Math.max(1, ...days.map((d) => d.totalAmount));
});

async function loadCountryTravelInfo(force = false) {
  travelInfoError.value = null;
  try {
    await countryStore.ensureCountriesLoaded();
    const country = matchedCountry.value;
    if (!country) {
      fetchedTravelInfo.value = null;
      fetchedTravelInfoSlug.value = null;
      return;
    }
    if (country.travelInfo && !force) {
      fetchedTravelInfo.value = country.travelInfo;
      fetchedTravelInfoSlug.value = country.slug;
      return;
    }
    if (!force && fetchedTravelInfoSlug.value === country.slug && fetchedTravelInfo.value) {
      return;
    }
    isLoadingTravelInfo.value = true;
    const response = await countryService.getCountryTravelInfo(country.slug);
    fetchedTravelInfo.value = response.travelInfo;
    fetchedTravelInfoSlug.value = country.slug;
  } catch (err: any) {
    travelInfoError.value =
      err?.message || 'Не удалось загрузить памятку путешественника для выбранной страны';
  } finally {
    isLoadingTravelInfo.value = false;
  }
}

function loadTrip() {
  if (tripId.value) {
    tripStore.fetchTripById(tripId.value).catch(() => {
      // Handled via tripStore.detailError
    });
    packingStore.fetchPackingList(tripId.value).catch(() => {
      // Handled via packingStore.error
    });
    documentStore.fetchTripDocuments(tripId.value).catch(() => {
      // Handled via documentStore.errorByTripId
    });
    weatherStore.fetchTripWeather(tripId.value).catch(() => {
      // Handled via weatherStore.errorByTripId
    });
    loadTripExpenses();
    loadCountryTravelInfo().catch(() => {});
  }
}

function syncTabFromQuery(tabQuery: unknown) {
  const normalized = Array.isArray(tabQuery) ? tabQuery[0] : tabQuery;
  if (normalized === 'country') {
    activeTab.value = 'travel-info';
    return;
  }
  if (
    normalized === 'overview' ||
    normalized === 'itinerary' ||
    normalized === 'expenses' ||
    normalized === 'packing' ||
    normalized === 'documents' ||
    normalized === 'weather' ||
    normalized === 'travel-info'
  ) {
    activeTab.value = normalized;
  }
}

async function loadTripExpenses() {
  if (!tripId.value) return;
  isLoadingExpenses.value = true;
  expensesError.value = null;
  try {
    const data = await expenseService.getTripExpenses(tripId.value);
    tripExpenses.value = data.expenses;
    expenseSummary.value = data.summary;
  } catch (err: any) {
    expensesError.value = err?.message || 'Не удалось загрузить расходы поездки';
  } finally {
    isLoadingExpenses.value = false;
  }
}

onMounted(() => {
  syncTabFromQuery(route.query.tab);
  loadTrip();
});

watch(tripId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadTrip();
  }
});

watch(
  () => trip.value?.country,
  (newCountry) => {
    if (newCountry) {
      loadCountryTravelInfo().catch(() => {});
    }
  }
);

watch(tripWeatherContextKey, (nextKey, prevKey) => {
  if (!nextKey || !prevKey || nextKey === prevKey) return;
  const nextId = nextKey.split('|')[0];
  const prevId = prevKey.split('|')[0];
  if (nextId === prevId && tripId.value === nextId) {
    weatherStore.invalidateTripWeather(nextId);
    weatherStore.fetchTripWeather(nextId).catch(() => {});
  }
});

watch(
  () => route.query.tab,
  (newTab) => {
    syncTabFromQuery(newTab);
  }
);

watch(
  tabsScrollRef,
  (el, _prev, onCleanup) => {
    if (!el) {
      canScrollTabsLeft.value = false;
      canScrollTabsRight.value = false;
      return;
    }

    nextTick(() => updateTabsScrollState());

    const handleResize = () => updateTabsScrollState();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateTabsScrollState());
      observer.observe(el);
    }

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    });
  },
  { flush: 'post' }
);

watch(
  [
    totalEventsCount,
    () => tripExpenses.value.length,
    () => packingStore.totalCount,
    () => currentTripDocumentsSummary.value.totalCount,
    weatherTabTempRange,
    matchedCountry,
  ],
  () => {
    nextTick(() => updateTabsScrollState());
  }
);

async function handleDeleteTrip() {
  if (!trip.value) return;
  const deletedTripId = trip.value.id;
  isDeletingTrip.value = true;
  try {
    await tripStore.deleteTrip(deletedTripId);
    await documentStore.clearTripLocalFiles(deletedTripId).catch(() => {});
    toastStore.success('Поездка удалена');
    showDeleteTripConfirm.value = false;
    router.push('/trips');
  } catch (err: any) {
    toastStore.error('Ошибка удаления', err?.message || 'Не удалось удалить поездку');
  } finally {
    isDeletingTrip.value = false;
  }
}

function openAddEventModal(dateStr?: string) {
  editingEvent.value = null;
  selectedDayDate.value = dateStr || trip.value?.startDate || '';
  eventModalOpen.value = true;
}

function openEditEventModal(ev: ItineraryEvent) {
  editingEvent.value = ev;
  selectedDayDate.value = ev.date;
  eventModalOpen.value = true;
}

async function handleSaveEvent(payload: EventFormPayload) {
  if (!trip.value) return;
  isSavingEvent.value = true;
  try {
    if (editingEvent.value) {
      await tripStore.updateEventInCurrentTrip(editingEvent.value.id, payload);
      toastStore.success('Мероприятие обновлено');
    } else {
      await tripStore.addEventToCurrentTrip(trip.value.id, payload);
      toastStore.success('Мероприятие добавлено в план');
    }
    eventModalOpen.value = false;
  } catch (err: any) {
    eventModalRef.value?.setError(err?.message || 'Не удалось сохранить мероприятие');
  } finally {
    isSavingEvent.value = false;
  }
}

async function confirmDeleteEvent() {
  if (!eventToDelete.value) return;
  isDeletingEvent.value = true;
  try {
    await tripStore.deleteEventFromCurrentTrip(eventToDelete.value.id);
    toastStore.success('Мероприятие удалено');
    eventToDelete.value = null;
  } catch (err: any) {
    toastStore.error('Ошибка удаления', err?.message || 'Не удалось удалить мероприятие');
  } finally {
    isDeletingEvent.value = false;
  }
}

// Expenses handlers
function openAddExpenseModal() {
  editingExpense.value = null;
  expenseModalOpen.value = true;
}

function openEditExpenseModal(exp: TripExpense) {
  editingExpense.value = exp;
  expenseModalOpen.value = true;
}

async function handleSaveExpense(payload: ExpenseFormPayload) {
  if (!trip.value) return;
  isSavingExpense.value = true;
  try {
    if (editingExpense.value) {
      await expenseService.updateExpense(editingExpense.value.id, payload);
      toastStore.success('Расход успешно обновлен');
    } else {
      await expenseService.createExpense(trip.value.id, payload);
      toastStore.success('Расход добавлен');
    }
    expenseModalOpen.value = false;
    await loadTripExpenses();
  } catch (err: any) {
    expenseModalRef.value?.setError(err?.message || 'Не удалось сохранить расход');
  } finally {
    isSavingExpense.value = false;
  }
}

async function confirmDeleteExpense() {
  if (!expenseToDelete.value) return;
  isDeletingExpense.value = true;
  try {
    await expenseService.deleteExpense(expenseToDelete.value.id);
    toastStore.success('Расход удален');
    expenseToDelete.value = null;
    await loadTripExpenses();
  } catch (err: any) {
    toastStore.error('Ошибка удаления', err?.message || 'Не удалось удалить расход');
  } finally {
    isDeletingExpense.value = false;
  }
}

function getCategoryIcon(cat: ExpenseCategory) {
  switch (cat) {
    case 'TRANSPORT':
      return Car;
    case 'FOOD':
      return Utensils;
    case 'LODGING':
      return Hotel;
    case 'ENTERTAINMENT':
      return Ticket;
    case 'SHOPPING':
      return ShoppingBag;
    default:
      return MoreHorizontal;
  }
}

// Guide PDF / HTML export modal state
const guideExportModalOpen = ref(false);

// Share trip modal state
const shareModalOpen = ref(false);

// Duplicate trip modal state
const duplicateModalOpen = ref(false);
const isDuplicatingTrip = ref(false);
const duplicateModalRef = ref<{ setError: (msg: string | null) => void } | null>(null);

async function handleDuplicateTrip(payload: DuplicateTripPayload) {
  if (!trip.value) return;
  isDuplicatingTrip.value = true;
  try {
    const res = await tripStore.duplicateTrip(trip.value.id, payload);
    toastStore.success('Копия поездки успешно создана');
    duplicateModalOpen.value = false;
    router.push(`/trips/${res.trip.id}`);
  } catch (err: any) {
    duplicateModalRef.value?.setError(err?.message || 'Не удалось создать копию поездки');
  } finally {
    isDuplicatingTrip.value = false;
  }
}

const guideLoadingStates = computed(() => ({
  expenses: isLoadingExpenses.value,
  packing: packingStore.isLoading,
  documents: documentStore.isLoading(tripId.value),
  weather: Boolean(weatherStore.loadingByTripId[tripId.value]),
  travelInfo:
    (countryStore.isLoadingCatalog && !countryStore.isCatalogLoaded) ||
    isLoadingTravelInfo.value,
}));

const guideErrorStates = computed(() => ({
  expenses: expensesError.value,
  packing: packingStore.error,
  documents: documentStore.getError(tripId.value),
  weather: weatherStore.errorByTripId[tripId.value] ?? null,
  travelInfo:
    travelInfoError.value ||
    (countryStore.catalogError && !countryStore.isCatalogLoaded
      ? countryStore.catalogError
      : null),
}));

function handleReloadGuideSection(section: GuideReloadableSection) {
  if (!tripId.value) return;
  if (section === 'expenses') {
    loadTripExpenses();
  } else if (section === 'packing') {
    packingStore.fetchPackingList(tripId.value, { force: true }).catch(() => {});
  } else if (section === 'documents') {
    documentStore.fetchTripDocuments(tripId.value, { force: true }).catch(() => {});
  } else if (section === 'weather') {
    weatherStore.fetchTripWeather(tripId.value, { force: true }).catch(() => {});
  } else if (section === 'travelInfo') {
    loadCountryTravelInfo(true).catch(() => {});
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Loading State -->
    <BaseSpinner
      v-if="tripStore.isLoadingDetail"
      label="Загружаем подробности поездки..."
    />

    <!-- Error State -->
    <div v-else-if="tripStore.detailError || !trip" class="space-y-4 max-w-2xl mx-auto py-6">
      <BaseAlert
        type="error"
        title="Не удалось открыть поездку"
        :message="tripStore.detailError || 'Поездка не найдена или у вас нет прав доступа'"
      />
      <div class="flex items-center gap-3">
        <BaseButton variant="outline" @click="router.push('/trips')">
          <ArrowLeft class="w-4 h-4" />
          <span>К списку поездок</span>
        </BaseButton>
        <BaseButton variant="secondary" @click="loadTrip">
          <RefreshCw class="w-4 h-4" />
          <span>Повторить</span>
        </BaseButton>
      </div>
    </div>

    <!-- Trip Content -->
    <div v-else class="space-y-6 animate-fade-in">
      <!-- Top Back Navigation -->
      <div>
        <RouterLink
          to="/trips"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Все мои поездки</span>
        </RouterLink>
      </div>

      <!-- Trip Hero Header Card -->
      <div
        :class="[
          'relative z-20 rounded-2xl border shadow-soft dark:shadow-none transition-colors duration-300',
          tripTheme.heroBannerClass,
        ]"
      >
        <!-- Decorative Top Accent Strip & Soft Atmospheric Glow -->
        <div
          class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          <div
            :class="['h-1.5 w-full transition-all duration-300', tripTheme.heroAccentStripClass]"
          />
          <div
            :class="[
              'absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl opacity-80 dark:opacity-70 transition-all duration-500',
              tripTheme.heroGlowClass,
            ]"
          />
          <div
            :class="[
              'absolute -bottom-28 -left-20 w-64 h-64 rounded-full blur-3xl opacity-45 dark:opacity-35 transition-all duration-500',
              tripTheme.heroGlowClass,
            ]"
          />
        </div>

        <div class="relative p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div class="space-y-3 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <span
                  v-if="timing"
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                    timing.badgeClass,
                  ]"
                >
                  {{ timing.label }}
                </span>

                <span
                  :class="[
                    'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-colors',
                    tripTheme.badgeClass,
                  ]"
                >
                  <MapPin class="w-3.5 h-3.5" />
                  {{ trip.country }}, {{ trip.city }}
                </span>

                <span
                  v-if="trip.tripType"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/85 dark:bg-slate-800/85 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700"
                >
                  <Compass :class="['w-3.5 h-3.5', tripTheme.accentIconClass]" />
                  {{ getTripTypeLabelRu(trip.tripType) }}
                </span>
              </div>

              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {{ trip.title }}
              </h1>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              <TripThemeSwitcher
                :trip-id="trip.id"
                :trip-type="trip.tripType"
              />

              <BaseButton
                variant="primary"
                size="sm"
                @click="shareModalOpen = true"
              >
                <Share2 class="w-4 h-4" />
                <span>Поделиться</span>
              </BaseButton>

              <BaseButton
                variant="secondary"
                size="sm"
                @click="guideExportModalOpen = true"
              >
                <FileDown class="w-4 h-4" />
                <span>Путеводитель / PDF</span>
              </BaseButton>

              <BaseButton
                variant="outline"
                size="sm"
                @click="duplicateModalOpen = true"
              >
                <Copy class="w-4 h-4" />
                <span>Дублировать</span>
              </BaseButton>

              <BaseButton
                variant="outline"
                size="sm"
                @click="router.push(`/trips/${trip.id}/edit`)"
              >
                <Pencil class="w-4 h-4" />
                <span>Редактировать</span>
              </BaseButton>

              <BaseButton
                variant="danger"
                size="sm"
                @click="showDeleteTripConfirm = true"
              >
                <Trash2 class="w-4 h-4" />
                <span>Удалить</span>
              </BaseButton>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
            <div class="p-4 rounded-xl bg-white/80 dark:bg-slate-900/75 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/90 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Calendar class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Даты поездки</p>
                <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {{ formatDateRange(trip.startDate, trip.endDate) }}
                </p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-white/80 dark:bg-slate-900/75 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/90 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Clock class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Продолжительность</p>
                <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {{ formatDaysLabel(trip.durationDays) }}
                </p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-white/80 dark:bg-slate-900/75 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/90 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Участники</p>
                <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {{ formatTravelersLabel(trip.travelersCount) }}
                </p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-white/80 dark:bg-slate-900/75 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/90 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Планируемый бюджет</p>
                <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {{ formatCurrency(trip.budget, trip.currency) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Switcher -->
      <div class="relative z-10">
        <div
          v-if="canScrollTabsLeft"
          class="absolute left-0 top-0 bottom-px z-10 flex items-center pr-5 bg-gradient-to-r from-slate-50 via-slate-50/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent"
        >
          <button
            type="button"
            @click="scrollTabs('left')"
            class="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Прокрутить вкладки влево"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
        </div>

        <div
          ref="tabsScrollRef"
          @scroll="updateTabsScrollState"
          class="flex items-stretch gap-1 overflow-x-auto overflow-y-hidden scroll-smooth border-b border-slate-200 dark:border-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <button
            type="button"
            @click="selectTab('overview', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'overview'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <FileText class="w-4 h-4 shrink-0" />
            <span>Обзор</span>
          </button>

          <button
            type="button"
            @click="selectTab('itinerary', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'itinerary'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <CalendarDays class="w-4 h-4 shrink-0" />
            <span>План поездки</span>
            <span
              :class="[
                'ml-0.5 px-1.5 py-0.5 text-[11px] rounded-full font-bold transition-colors',
                tripTheme.tabBadgeClass,
              ]"
            >
              {{ totalEventsCount }}
            </span>
          </button>

          <button
            type="button"
            @click="selectTab('expenses', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'expenses'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <Coins class="w-4 h-4 shrink-0" />
            <span>Бюджет</span>
            <span
              v-if="tripExpenses.length > 0"
              :class="[
                'ml-0.5 px-1.5 py-0.5 text-[11px] rounded-full font-bold transition-colors',
                tripTheme.tabBadgeClass,
              ]"
            >
              {{ tripExpenses.length }}
            </span>
          </button>

          <button
            type="button"
            @click="selectTab('packing', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'packing'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <Briefcase class="w-4 h-4 shrink-0" />
            <span>Вещи</span>
            <span
              v-if="packingStore.totalCount > 0"
              :class="[
                'ml-0.5 px-1.5 py-0.5 text-[11px] rounded-full font-bold transition-colors',
                packingStore.packedCount === packingStore.totalCount
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : tripTheme.tabBadgeClass,
              ]"
            >
              {{ packingStore.packedCount }}/{{ packingStore.totalCount }}
            </span>
          </button>

          <button
            type="button"
            @click="selectTab('documents', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'documents'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <FileCheck2 class="w-4 h-4 shrink-0" />
            <span>Брони</span>
            <span
              v-if="currentTripDocumentsSummary.totalCount > 0"
              :class="[
                'ml-0.5 px-1.5 py-0.5 text-[11px] rounded-full font-bold transition-colors',
                currentTripDocumentsSummary.readyCount === currentTripDocumentsSummary.totalCount
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : tripTheme.tabBadgeClass,
              ]"
            >
              {{ currentTripDocumentsSummary.readyCount }}/{{ currentTripDocumentsSummary.totalCount }}
            </span>
          </button>

          <button
            type="button"
            @click="selectTab('weather', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'weather'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <CloudSun class="w-4 h-4 shrink-0" />
            <span>Погода</span>
            <span
              v-if="weatherTabTempRange"
              class="ml-0.5 px-1.5 py-0.5 text-[11px] rounded-full bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 font-bold tabular-nums"
            >
              {{ weatherTabTempRange }}
            </span>
          </button>

          <button
            type="button"
            @click="selectTab('travel-info', $event)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-3 text-[13px] xl:text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
              activeTab === 'travel-info'
                ? tripTheme.tabActiveClass
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <BookOpen class="w-4 h-4 shrink-0" />
            <span>О стране</span>
            <img
              v-if="matchedCountry?.flagUrl"
              :src="matchedCountry.flagUrl"
              :alt="matchedCountry.nameRu"
              loading="lazy"
              decoding="async"
              class="w-5 h-3.5 object-cover rounded-[3px] border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0"
            />
            <span
              v-else-if="matchedCountry"
              class="ml-0.5 text-sm leading-none"
              aria-hidden="true"
            >
              {{ matchedCountry.flagEmoji }}
            </span>
          </button>
        </div>

        <div
          v-if="canScrollTabsRight"
          class="absolute right-0 top-0 bottom-px z-10 flex items-center pl-5 bg-gradient-to-l from-slate-50 via-slate-50/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent"
        >
          <button
            type="button"
            @click="scrollTabs('right')"
            class="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Прокрутить вкладки вправо"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- TAB 1: OVERVIEW -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-8 space-y-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Описание поездки</h2>
          <p
            v-if="trip.description"
            class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line"
          >
            {{ trip.description }}
          </p>
          <p v-else class="text-sm text-slate-400 dark:text-slate-500 italic">
            Описание к этой поездке пока не добавлено. Вы можете добавить его, нажав кнопку «Редактировать».
          </p>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div class="text-xs text-slate-500 dark:text-slate-400">
              В плане поездки: <strong class="text-slate-800 dark:text-slate-100">{{ totalEventsCount }}</strong> мероприятий на
              <strong class="text-slate-800 dark:text-slate-100">{{ formatDaysLabel(trip.durationDays) }}</strong>
            </div>

            <BaseButton variant="secondary" size="sm" @click="activeTab = 'itinerary'">
              <CalendarDays class="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Перейти к плану по дням</span>
            </BaseButton>
          </div>
        </div>

        <!-- Summary Sidebar Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 space-y-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Сводка по маршруту</h3>

          <dl class="space-y-3 text-sm">
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Направление</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100 text-right">{{ trip.country }}, {{ trip.city }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Дата начала</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ formatRussianDate(trip.startDate) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Дата окончания</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ formatRussianDate(trip.endDate) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Длительность</dt>
              <dd class="font-semibold text-teal-700 dark:text-teal-400">{{ formatDaysLabel(trip.durationDays) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Общий бюджет</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ formatCurrency(trip.budget, trip.currency) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Фактические траты</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100">
                {{ formatCurrency(expenseSummary?.totalSpent || 0, trip.currency) }}
              </dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <dt class="text-slate-500 dark:text-slate-400">Остаток бюджета</dt>
              <dd
                class="font-semibold"
                :class="(expenseSummary?.remainingBudget || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
              >
                {{ formatCurrency(expenseSummary?.remainingBudget || 0, trip.currency) }}
              </dd>
            </div>
            <div class="flex items-center justify-between py-2">
              <dt class="text-slate-500 dark:text-slate-400">Оценка по плану</dt>
              <dd class="font-semibold text-slate-900 dark:text-slate-100">
                {{ formatCurrency(totalEstimatedEventsCost, trip.currency) }}
              </dd>
            </div>
          </dl>

          <BaseButton
            variant="outline"
            size="sm"
            class="w-full mt-2"
            @click="activeTab = 'expenses'"
          >
            <Coins class="w-4 h-4 mr-1.5" />
            <span>Управление расходами</span>
          </BaseButton>
        </div>
      </div>

      <!-- TAB 2: ITINERARY BY DAYS -->
      <div v-else-if="activeTab === 'itinerary'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft dark:shadow-none">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Расписание по дням поездки</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Календарные дни сформированы автоматически с {{ formatRussianDate(trip.startDate) }} по {{ formatRussianDate(trip.endDate) }}
            </p>
          </div>

          <BaseButton variant="primary" size="md" @click="openAddEventModal(trip.startDate)">
            <Plus class="w-4 h-4" />
            <span>Добавить мероприятие</span>
          </BaseButton>
        </div>

        <!-- Day Cards -->
        <div class="space-y-5">
          <section
            v-for="day in calendarDays"
            :key="day.date"
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none overflow-hidden"
          >
            <!-- Day Header -->
            <div class="px-5 sm:px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold transition-all duration-300',
                    tripTheme.dayBadgeClass,
                  ]"
                >
                  День {{ day.dayNumber }}
                </span>
                <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                  {{ day.label }}
                </h3>
              </div>

              <BaseButton
                variant="ghost"
                size="sm"
                :class="tripTheme.accentGhostBtnClass"
                @click="openAddEventModal(day.date)"
              >
                <Plus class="w-4 h-4" />
                <span>Добавить мероприятие</span>
              </BaseButton>
            </div>

            <!-- Events List for this Day -->
            <div class="p-5 sm:p-6">
              <div
                v-if="!eventsByDate[day.date] || eventsByDate[day.date].length === 0"
                class="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30"
              >
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  На этот день пока не запланировано мероприятий
                </p>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openAddEventModal(day.date)"
                >
                  <Plus class="w-4 h-4" />
                  <span>Добавить мероприятие</span>
                </BaseButton>
              </div>

              <div v-else class="space-y-3.5">
                <div
                  v-for="ev in eventsByDate[day.date]"
                  :key="ev.id"
                  class="group rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/50 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div class="space-y-2 flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        v-if="ev.startTime || ev.endTime"
                        :class="[
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-colors',
                          tripTheme.badgeClass,
                        ]"
                      >
                        <Clock class="w-3.5 h-3.5" />
                        <span v-if="ev.startTime && ev.endTime">
                          {{ ev.startTime }} — {{ ev.endTime }}
                        </span>
                        <span v-else-if="ev.startTime">
                          с {{ ev.startTime }}
                        </span>
                        <span v-else>
                          до {{ ev.endTime }}
                        </span>
                      </span>

                      <span
                        v-else
                        class="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                      >
                        Весь день / без времени
                      </span>

                      <span
                        v-if="ev.estimatedCost !== null && ev.estimatedCost !== undefined"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/30 text-xs font-semibold"
                      >
                        <Wallet class="w-3 h-3" />
                        {{ formatCurrency(ev.estimatedCost, trip.currency) }}
                      </span>
                    </div>

                    <h4 class="text-base font-bold text-slate-900 dark:text-slate-100">
                      {{ ev.title }}
                    </h4>

                    <p
                      v-if="ev.location"
                      class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      <MapPin :class="['w-3.5 h-3.5 shrink-0', tripTheme.accentIconClass]" />
                      <span>{{ ev.location }}</span>
                    </p>

                    <p
                      v-if="ev.description"
                      class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
                    >
                      {{ ev.description }}
                    </p>

                    <div
                      v-if="ev.note"
                      class="mt-2 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
                    >
                      <StickyNote class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span class="whitespace-pre-line">{{ ev.note }}</span>
                    </div>
                  </div>

                  <!-- Event Actions -->
                  <div class="flex items-center gap-1 self-end sm:self-start shrink-0">
                    <button
                      type="button"
                      @click="openEditEventModal(ev)"
                      class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                      title="Редактировать мероприятие"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      @click="eventToDelete = ev"
                      class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors"
                      title="Удалить мероприятие"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- TAB 3: EXPENSES & BUDGET TRACKER -->
      <div v-if="activeTab === 'expenses'" class="space-y-6">
        <!-- Header & Action Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coins class="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Финансовый помощник</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Контролируйте расходы, следите за остатком бюджета и анализируйте структуру трат
            </p>
          </div>

          <BaseButton
            variant="primary"
            size="sm"
            @click="openAddExpenseModal"
          >
            <Plus class="w-4 h-4" />
            <span>Добавить расход</span>
          </BaseButton>
        </div>

        <!-- KPI Budget Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Planned Budget -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft dark:shadow-none">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">План бюджета</span>
              <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Wallet class="w-4 h-4" />
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {{ formatCurrency(trip.budget, trip.currency) }}
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Запланировано на поездку
            </p>
          </div>

          <!-- Total Spent -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft dark:shadow-none">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Фактически потрачено</span>
              <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Receipt class="w-4 h-4" />
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {{ formatCurrency(expenseSummary?.totalSpent || 0, trip.currency) }}
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Всего по {{ tripExpenses.length }} {{ tripExpenses.length === 1 ? 'операции' : tripExpenses.length < 5 ? 'операциям' : 'операциям' }}
            </p>
          </div>

          <!-- Remaining Budget -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft dark:shadow-none">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Остаток бюджета</span>
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :class="
                  (expenseSummary?.remainingBudget || 0) < 0
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                "
              >
                <TrendingUp class="w-4 h-4" />
              </div>
            </div>
            <p
              class="text-xl sm:text-2xl font-extrabold"
              :class="
                (expenseSummary?.remainingBudget || 0) < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
            >
              {{ formatCurrency(expenseSummary?.remainingBudget || 0, trip.currency) }}
            </p>
            <p
              class="text-xs font-medium mt-1"
              :class="(expenseSummary?.remainingBudget || 0) < 0 ? 'text-rose-500 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-slate-500'"
            >
              {{
                (expenseSummary?.remainingBudget || 0) < 0
                  ? 'Внимание: бюджет превышен!'
                  : 'Доступно для трат'
              }}
            </p>
          </div>

          <!-- Spent % Progress -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft dark:shadow-none">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Освоение бюджета</span>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="
                  expenseSummary?.status === 'over_budget'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
                    : expenseSummary?.status === 'near_budget'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                "
              >
                {{
                  expenseSummary?.status === 'over_budget'
                    ? 'Превышен'
                    : expenseSummary?.status === 'near_budget'
                      ? 'Внимание'
                      : 'В норме'
                }}
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {{ expenseSummary?.spentPercentage || 0 }}%
            </p>
            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: Math.min(expenseSummary?.spentPercentage || 0, 100) + '%' }"
                :class="
                  expenseSummary?.status === 'over_budget'
                    ? 'bg-rose-500'
                    : expenseSummary?.status === 'near_budget'
                      ? 'bg-amber-500'
                      : tripTheme.progressFillClass
                "
              ></div>
            </div>
          </div>
        </div>

        <!-- Analytical Mini-Cards: Daily Average & Per Traveler Average -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-soft dark:shadow-none flex items-center justify-between gap-4">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <CalendarDays class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">В среднем в день</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  За {{ formatDaysLabel(trip.durationDays) }} поездки
                </p>
              </div>
            </div>
            <p class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
              {{ formatCurrency(expenseSummary?.dailyAverage || 0, trip.currency) }}
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-soft dark:shadow-none flex items-center justify-between gap-4">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">На 1 путешественника</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  Участников: {{ trip.travelersCount }}
                </p>
              </div>
            </div>
            <p class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
              {{ formatCurrency(expenseSummary?.perTravelerAverage || 0, trip.currency) }}
            </p>
          </div>
        </div>

        <!-- Compact Exchange Rate Info Bar -->
        <div
          v-if="expenseSummary?.exchangeRates && formattedExchangeRatesLine"
          class="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300"
        >
          <div class="flex flex-wrap items-center gap-2">
            <ArrowRightLeft class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span class="font-semibold text-slate-700 dark:text-slate-300">Курс пересчёта:</span>
            <span class="font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formattedExchangeRatesLine }}</span>
            <span v-if="hasForeignCurrencyExpenses" class="text-slate-400 dark:text-slate-500">
              (траты в других валютах пересчитаны в {{ trip.currency }})
            </span>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
            :class="
              expenseSummary.exchangeRates.isFallback
                ? 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                : 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30'
            "
          >
            {{
              expenseSummary.exchangeRates.isFallback
                ? 'Резервный курс'
                : expenseSummary.exchangeRates.source === 'cbr'
                  ? 'Курс ЦБ РФ'
                  : 'Кэш курсов'
            }}
          </span>
        </div>

        <!-- Over-budget warning banner if budget exceeded -->
        <div
          v-if="expenseSummary?.status === 'over_budget'"
          class="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-500/30 text-rose-900 dark:text-rose-200"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div class="text-xs sm:text-sm">
            <strong class="font-bold">Предупреждение о перерасходе средств:</strong>
            Текущие расходы превышают запланированный бюджет на {{ formatCurrency(Math.abs(expenseSummary.remainingBudget), trip.currency) }}. Рекомендуем скорректировать дальнейшие траты.
          </div>
        </div>

        <!-- Expenses Grid: Donut Chart + Daily Dynamics on Left, Expenses History on Right -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Category Breakdown Chart & Daily Dynamics Column -->
          <div class="lg:col-span-5 space-y-6">
            <ExpenseCategoryChart
              :summary="expenseSummary"
              :selected-category="selectedCategoryFilter"
              @select-category="selectedCategoryFilter = $event"
            />

            <!-- Daily Expenses Dynamics -->
            <div
              v-if="expenseSummary?.byDay && expenseSummary.byDay.length > 0"
              class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 space-y-4"
            >
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <BarChart3 class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 dark:text-slate-100 text-base">Динамика расходов по дням</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Все суммы приведены к {{ trip.currency }}</p>
                  </div>
                </div>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {{ formatDaysLabel(expenseSummary.byDay.length) }}
                </span>
              </div>

              <div class="space-y-3">
                <div
                  v-for="day in expenseSummary.byDay"
                  :key="day.date"
                  class="space-y-1.5"
                >
                  <div class="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {{ formatRussianDate(day.date) }}
                      </span>
                      <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                        ({{ day.count }} опер.)
                      </span>
                    </div>
                    <span class="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                      {{ formatCurrency(day.totalAmount, trip.currency) }}
                    </span>
                  </div>
                  <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-300',
                        tripTheme.progressFillClass,
                      ]"
                      :style="{
                        width: Math.max(4, Math.round((day.totalAmount / maxDailyExpenseAmount) * 100)) + '%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- History of Expenses List -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 class="font-extrabold text-slate-900 dark:text-slate-100 text-lg sm:text-xl">История расходов</h3>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Все зафиксированные траты в хронологическом порядке
                </p>
              </div>

              <!-- Quick Reset Filter Button -->
              <div v-if="selectedCategoryFilter" class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="selectedCategoryFilter = null"
                  class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Сбросить фильтр
                </button>
              </div>
            </div>

            <!-- Category Pills Filter Bar (No ugly horizontal scrollbar, wraps neatly) -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="selectedCategoryFilter = null"
                :class="[
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all',
                  selectedCategoryFilter === null
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300',
                ]"
              >
                <span>Все</span>
                <span
                  class="px-1.5 py-0.5 rounded-md text-[11px]"
                  :class="selectedCategoryFilter === null ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'"
                >
                  {{ tripExpenses.length }}
                </span>
              </button>

              <button
                v-for="catItem in expenseSummary?.byCategory || []"
                :key="catItem.category"
                type="button"
                @click="selectedCategoryFilter = selectedCategoryFilter === catItem.category ? null : catItem.category"
                :class="[
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all',
                  selectedCategoryFilter === catItem.category
                    ? 'bg-slate-900 dark:bg-teal-600 text-white border-slate-900 dark:border-teal-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800',
                ]"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: catItem.color }"
                ></span>
                <span>{{ catItem.nameRu }}</span>
                <span
                  class="text-xs font-semibold opacity-75"
                  :class="selectedCategoryFilter === catItem.category ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
                >
                  ({{ catItem.count }})
                </span>
              </button>
            </div>

            <!-- Empty List State -->
            <div
              v-if="filteredExpenses.length === 0"
              class="flex flex-col items-center justify-center py-14 px-4 text-center"
            >
              <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                <Receipt class="w-7 h-7" />
              </div>
              <p class="text-base font-bold text-slate-800 dark:text-slate-100">
                {{ selectedCategoryFilter ? 'В этой категории пока нет расходов' : 'Расходы ещё не зафиксированы' }}
              </p>
              <p class="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-1 max-w-sm">
                {{
                  selectedCategoryFilter
                    ? 'Сбросьте фильтр или добавьте новый расход в эту категорию'
                    : 'Внесите первую трату, чтобы отслеживать фактический бюджет поездки'
                }}
              </p>
              <div class="flex items-center gap-2 mt-4">
                <BaseButton
                  v-if="selectedCategoryFilter"
                  variant="outline"
                  size="sm"
                  @click="selectedCategoryFilter = null"
                >
                  Сбросить фильтр
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="openAddExpenseModal"
                >
                  <Plus class="w-4 h-4" />
                  <span>Добавить расход</span>
                </BaseButton>
              </div>
            </div>

            <!-- Expenses Items List (Larger, prominent typography & clear structure) -->
            <div v-else class="space-y-3">
              <div
                v-for="exp in filteredExpenses"
                :key="exp.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50/60 dark:hover:bg-slate-800 shadow-sm dark:shadow-none transition-all duration-150 gap-4 group"
              >
                <!-- Left: Category Icon, Title, Date, Description -->
                <div class="flex items-start sm:items-center gap-4 min-w-0">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm"
                    :style="{ backgroundColor: exp.categoryColor }"
                  >
                    <component :is="getCategoryIcon(exp.category)" class="w-6 h-6" />
                  </div>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <span class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {{ exp.categoryNameRu }}
                      </span>
                      <span class="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        {{ formatRussianDate(exp.expenseDate) }}
                      </span>
                    </div>

                    <p
                      v-if="exp.description"
                      class="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed"
                    >
                      {{ exp.description }}
                    </p>
                    <p v-else class="text-xs text-slate-400 dark:text-slate-500 italic mt-1">
                      Без описания
                    </p>
                  </div>
                </div>

                <!-- Right: Amount and Action Buttons -->
                <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700/80">
                  <div class="sm:text-right">
                    <span class="block text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {{ formatCurrency(exp.amount, exp.currency) }}
                    </span>
                    <span
                      v-if="exp.currency !== trip.currency"
                      class="block text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5 tabular-nums"
                      :title="`Курс: 1 ${exp.currency} = ${exp.exchangeRateUsed} ${trip.currency}`"
                    >
                      ≈ {{ formatCurrency(exp.convertedAmount, trip.currency) }}
                    </span>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      @click="openEditExpenseModal(exp)"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                      title="Редактировать расход"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="expenseToDelete = exp"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/30 transition-colors"
                      title="Удалить расход"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PACKING LIST -->
      <div v-else-if="activeTab === 'packing'">
        <PackingListSection
          :tripId="trip.id"
          :tripType="trip.tripType"
        />
      </div>

      <!-- TAB 5: DOCUMENTS & BOOKINGS -->
      <div v-else-if="activeTab === 'documents'">
        <TripDocumentsSection
          :tripId="trip.id"
          :tripStartDate="trip.startDate"
          :tripEndDate="trip.endDate"
        />
      </div>

      <!-- TAB 6: WEATHER -->
      <div v-else-if="activeTab === 'weather'">
        <TripWeatherSection
          :tripId="trip.id"
          :tripCity="trip.city"
          :tripCountry="trip.country"
          @go-to-packing="activeTab = 'packing'"
        />
      </div>

      <!-- TAB 6: COUNTRY TRAVEL INFO -->
      <div v-else-if="activeTab === 'travel-info'" class="space-y-6">
        <BaseSpinner
          v-if="(countryStore.isLoadingCatalog && !countryStore.isCatalogLoaded) || isLoadingTravelInfo"
          label="Загружаем памятку о стране..."
        />

        <div
          v-else-if="(countryStore.catalogError && !countryStore.isCatalogLoaded) || travelInfoError"
          class="space-y-4 max-w-2xl"
        >
          <BaseAlert
            type="error"
            title="Не удалось загрузить памятку путешественника"
            :message="travelInfoError || countryStore.catalogError || 'Попробуйте повторить запрос'"
          />
          <BaseButton variant="secondary" size="sm" @click="loadCountryTravelInfo(true)">
            <RefreshCw class="w-4 h-4" />
            <span>Повторить</span>
          </BaseButton>
        </div>

        <CountryTravelInfoSection
          v-else-if="matchedCountry && resolvedTravelInfo"
          :country="matchedCountry"
          :travelInfo="resolvedTravelInfo"
          :tripCity="trip.city"
        />

        <!-- Fallback for custom / manually typed country -->
        <div
          v-else
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5"
        >
          <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto">
            <Globe2 class="w-8 h-8" />
          </div>

          <div class="space-y-2">
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Памятка для направления «{{ trip.country }}» пока не найдена
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Похоже, страна указана вручную или отсутствует в нашем справочнике стран.
              Выберите страну из каталога в настройках поездки, чтобы автоматически получить подробную памятку о визах, оплате, транспорте, связи и безопасности.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <BaseButton
              variant="primary"
              size="md"
              @click="router.push(`/trips/${trip.id}/edit`)"
            >
              <Pencil class="w-4 h-4" />
              <span>Выбрать страну в поездке</span>
            </BaseButton>

            <BaseButton
              variant="outline"
              size="md"
              @click="router.push('/countries')"
            >
              <Compass class="w-4 h-4" />
              <span>Открыть каталог стран</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Expense Add/Edit Modal -->
    <ExpenseFormModal
      v-if="trip"
      ref="expenseModalRef"
      :open="expenseModalOpen"
      :tripCurrency="trip.currency"
      :tripStartDate="trip.startDate"
      :editingExpense="editingExpense"
      :loading="isSavingExpense"
      @close="expenseModalOpen = false"
      @submit="handleSaveExpense"
    />

    <!-- Confirm Delete Expense Modal -->
    <ConfirmDialog
      :open="Boolean(expenseToDelete)"
      title="Удалить расход?"
      :message="`Вы действительно хотите удалить расход на сумму ${formatCurrency(expenseToDelete?.amount || 0, expenseToDelete?.currency || 'RUB')}?`"
      confirmText="Удалить"
      :loading="isDeletingExpense"
      @confirm="confirmDeleteExpense"
      @cancel="expenseToDelete = null"
    />

    <!-- Event Add/Edit Modal -->
    <EventFormModal
      v-if="trip"
      ref="eventModalRef"
      :open="eventModalOpen"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      :currency="trip.currency"
      :country="trip.country"
      :city="trip.city"
      :defaultDate="selectedDayDate"
      :editingEvent="editingEvent"
      :loading="isSavingEvent"
      @close="eventModalOpen = false"
      @submit="handleSaveEvent"
    />

    <!-- Confirm Delete Trip Modal -->
    <ConfirmDialog
      :open="showDeleteTripConfirm"
      title="Удалить поездку?"
      :message="`Вы действительно хотите удалить поездку «${trip?.title}»? Все запланированные мероприятия будут удалены.`"
      confirmText="Да, удалить поездку"
      :loading="isDeletingTrip"
      @confirm="handleDeleteTrip"
      @cancel="showDeleteTripConfirm = false"
    />

    <!-- Confirm Delete Event Modal -->
    <ConfirmDialog
      :open="Boolean(eventToDelete)"
      title="Удалить мероприятие?"
      :message="`Удалить мероприятие «${eventToDelete?.title}» из плана поездки?`"
      confirmText="Удалить"
      :loading="isDeletingEvent"
      @confirm="confirmDeleteEvent"
      @cancel="eventToDelete = null"
    />

    <!-- Guide Export & PDF Modal -->
    <TripGuideExportModal
      v-if="trip"
      :open="guideExportModalOpen"
      :trip="trip"
      :calendarDays="calendarDays"
      :eventsByDate="eventsByDate"
      :totalEstimatedEventsCost="totalEstimatedEventsCost"
      :expenses="tripExpenses"
      :expenseSummary="expenseSummary"
      :packingItems="packingStore.items"
      :packingSummary="packingStore.summary"
      :documents="currentTripDocuments"
      :documentsSummary="currentTripDocumentsSummary"
      :weather="currentTripWeather"
      :matchedCountry="matchedCountry || null"
      :travelInfo="resolvedTravelInfo"
      :loadingStates="guideLoadingStates"
      :errorStates="guideErrorStates"
      @close="guideExportModalOpen = false"
      @reload-section="handleReloadGuideSection"
    />

    <!-- Duplicate Trip Modal -->
    <DuplicateTripModal
      v-if="trip"
      ref="duplicateModalRef"
      :open="duplicateModalOpen"
      :trip="trip"
      :loading="isDuplicatingTrip"
      @close="duplicateModalOpen = false"
      @submit="handleDuplicateTrip"
    />

    <!-- Share Trip Modal -->
    <ShareTripModal
      v-if="trip"
      :open="shareModalOpen"
      :trip="trip"
      @close="shareModalOpen = false"
    />
  </DashboardLayout>
</template>
