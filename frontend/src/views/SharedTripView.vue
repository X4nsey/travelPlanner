<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  AlertCircle,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  BookmarkPlus,
  Briefcase,
  Calendar,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Globe2,
  Home,
  Hotel,
  Link2Off,
  LogIn,
  MapPin,
  MoreHorizontal,
  Receipt,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  StickyNote,
  Ticket,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
} from 'lucide-vue-next';
import { tripService } from '@/services/trip.service';
import { ApiClientError } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import {
  getTripTypeLabelRu,
  ORDERED_PACKING_CATEGORIES,
  PACKING_CATEGORY_META,
} from '@/constants/packing';
import {
  formatCurrency,
  formatDateRange,
  formatDaysLabel,
  formatRussianDate,
  formatTravelersLabel,
  generateCalendarDays,
  getTripTimingStatus,
} from '@/composables/useFormatters';
import type {
  EventCategory,
  ExpenseCategory,
  PackingCategory,
  SharedItineraryEvent,
  SharedPackingItem,
  SharedTripResponse,
} from '@/types';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const CountryTravelInfoSection = defineAsyncComponent(
  () => import('@/components/countries/CountryTravelInfoSection.vue')
);

const ExpenseCategoryChart = defineAsyncComponent(
  () => import('@/components/trips/ExpenseCategoryChart.vue')
);

type SharedTabKey = 'itinerary' | 'packing' | 'country' | 'expenses';
type PackingFilter = 'all' | 'remaining' | 'packed';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();

const token = computed(() => String(route.params.token || '').trim());

const sharedData = ref<SharedTripResponse | null>(null);
const isLoading = ref(true);
const isNotFound = ref(false);
const loadError = ref<string | null>(null);

const isCloning = ref(false);
const activeTab = ref<SharedTabKey>('itinerary');

// Local interactive packing checklist state stored in localStorage under `shared_packing_${token}`
const localPackedMap = ref<Record<string, boolean>>({});
const packingFilter = ref<PackingFilter>('all');

// Expenses category filter (read-only view when showExpenses === true)
const selectedExpenseCategory = ref<ExpenseCategory | null>(null);

function getPackingStorageKey(shareToken: string): string {
  return `shared_packing_${shareToken}`;
}

function loadLocalPackingState(shareToken: string) {
  if (!shareToken || typeof window === 'undefined') {
    localPackedMap.value = {};
    return;
  }
  try {
    const raw = window.localStorage.getItem(getPackingStorageKey(shareToken));
    if (!raw) {
      localPackedMap.value = {};
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const next: Record<string, boolean> = {};
      for (const key of parsed) {
        if (typeof key === 'string') next[key] = true;
      }
      localPackedMap.value = next;
    } else if (parsed && typeof parsed === 'object') {
      const next: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (v === true) next[k] = true;
      }
      localPackedMap.value = next;
    } else {
      localPackedMap.value = {};
    }
  } catch {
    localPackedMap.value = {};
  }
}

function persistLocalPackingState(shareToken: string, map: Record<string, boolean>) {
  if (!shareToken || typeof window === 'undefined') return;
  try {
    const packedKeys = Object.entries(map)
      .filter(([, checked]) => checked)
      .map(([key]) => key);
    window.localStorage.setItem(getPackingStorageKey(shareToken), JSON.stringify(packedKeys));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

function toggleLocalPacked(itemKey: string) {
  const next = {
    ...localPackedMap.value,
    [itemKey]: !localPackedMap.value[itemKey],
  };
  if (!next[itemKey]) {
    delete next[itemKey];
  }
  localPackedMap.value = next;
  persistLocalPackingState(token.value, next);
}

function resetLocalPacking() {
  localPackedMap.value = {};
  persistLocalPackingState(token.value, {});
  toastStore.info('Локальные отметки сбора сброшены');
}

const availableTabs = computed<
  Array<{ key: SharedTabKey; label: string; badge?: string | number }>
>(() => {
  if (!sharedData.value) return [];
  const { permissions, events, packingList, expenses } = sharedData.value;
  const tabs: Array<{ key: SharedTabKey; label: string; badge?: string | number }> = [];

  if (permissions.showItinerary) {
    tabs.push({
      key: 'itinerary',
      label: 'План поездки',
      badge: events.length,
    });
  }

  if (permissions.showPackingList) {
    const total = packingList?.length ?? 0;
    tabs.push({
      key: 'packing',
      label: 'Список вещей',
      badge: total > 0 ? `${localPackedCount.value}/${total}` : undefined,
    });
  }

  if (permissions.showCountryInfo) {
    tabs.push({
      key: 'country',
      label: 'О стране',
    });
  }

  if (permissions.showExpenses && expenses) {
    tabs.push({
      key: 'expenses',
      label: 'Бюджет',
      badge: expenses.items.length > 0 ? expenses.items.length : undefined,
    });
  }

  return tabs;
});

function ensureValidActiveTab() {
  const tabs = availableTabs.value;
  if (tabs.length === 0) return;
  if (!tabs.some((t) => t.key === activeTab.value)) {
    activeTab.value = tabs[0].key;
  }
}

async function fetchSharedTrip() {
  const currentToken = token.value;
  if (!currentToken) {
    isLoading.value = false;
    isNotFound.value = true;
    sharedData.value = null;
    return;
  }

  isLoading.value = true;
  isNotFound.value = false;
  loadError.value = null;
  selectedExpenseCategory.value = null;
  packingFilter.value = 'all';

  loadLocalPackingState(currentToken);

  try {
    const data = await tripService.getSharedTripByToken(currentToken);
    sharedData.value = data;
    document.title = `${data.trip.title} — TravelPlanner`;
    ensureValidActiveTab();

    // Подгружаем каталог стран только если countryInfo скрыт, чтобы отобразить флаг в шапке
    if (!data.countryInfo && data.trip.country) {
      countryStore.ensureCountriesLoaded().catch(() => {});
    }
  } catch (err: any) {
    sharedData.value = null;
    if (
      (err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === 'SHARE_NOT_FOUND')) ||
      err?.statusCode === 404 ||
      err?.code === 'SHARE_NOT_FOUND'
    ) {
      isNotFound.value = true;
      document.title = 'Маршрут недоступен — TravelPlanner';
    } else {
      loadError.value = err?.message || 'Не удалось загрузить публичный маршрут';
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchSharedTrip();
});

watch(token, (next, prev) => {
  if (next !== prev) {
    fetchSharedTrip();
  }
});

const trip = computed(() => sharedData.value?.trip ?? null);

const fallbackCatalogCountry = computed(() => {
  if (sharedData.value?.countryInfo || !trip.value?.country) return undefined;
  return countryStore.findCountryByQuery(trip.value.country);
});

const headerFlagUrl = computed(
  () => sharedData.value?.countryInfo?.flagUrl || fallbackCatalogCountry.value?.flagUrl || ''
);

const headerFlagEmoji = computed(
  () => sharedData.value?.countryInfo?.flagEmoji || fallbackCatalogCountry.value?.flagEmoji || ''
);

const timing = computed(() => {
  if (!trip.value) return null;
  return getTripTimingStatus(trip.value.startDate, trip.value.endDate);
});

const calendarDays = computed(() => {
  if (!trip.value) return [];
  return generateCalendarDays(trip.value.startDate, trip.value.endDate);
});

const eventsByDate = computed<Record<string, SharedItineraryEvent[]>>(() => {
  const map: Record<string, SharedItineraryEvent[]> = {};
  const list = sharedData.value?.events || [];
  for (const ev of list) {
    if (!map[ev.date]) map[ev.date] = [];
    map[ev.date].push(ev);
  }
  return map;
});

// Visual event category inference (ItineraryEvent stores rich text; infer helpful pill badges)
const EVENT_CATEGORY_META: Record<EventCategory, { label: string; badgeClass: string }> = {
  SIGHTSEEING: {
    label: 'Достопримечательность',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/70',
  },
  CULTURE: {
    label: 'Культура',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/70',
  },
  FOOD: {
    label: 'Питание',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/70',
  },
  NATURE: {
    label: 'Природа',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  },
  TRANSPORT: {
    label: 'Транспорт',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/70',
  },
  LEISURE: {
    label: 'Отдых',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/70',
  },
};

function inferEventCategory(ev: SharedItineraryEvent): EventCategory {
  const haystack = `${ev.title} ${ev.description} ${ev.location || ''}`.toLowerCase();

  if (
    /(аэропорт|вылет|прилёт|прилет|перелёт|перелет|поезд|вокзал|трансфер|такси|паром|метро|автобус|аренда авто|дорога|рейс)/.test(
      haystack
    )
  ) {
    return 'TRANSPORT';
  }
  if (
    /(завтрак|обед|ужин|кафе|ресторан|кофейн|бар|траттор|пицц|суши|гастро|дегустац|рынок еды|бранч|паста)/.test(
      haystack
    )
  ) {
    return 'FOOD';
  }
  if (
    /(музей|галере|театр|опера|собор|храм|церков|выставк|дворец|замок|концерт|экскурси|ватикан|колизей|эрмитаж)/.test(
      haystack
    )
  ) {
    return 'CULTURE';
  }
  if (
    /(парк|пляж|море|гора|горы|озер|водопад|треккинг|поход|заповедник|сад|природ|лес|каньон|набережн)/.test(
      haystack
    )
  ) {
    return 'NATURE';
  }
  if (
    /(спа|spa|бассейн|шопинг|отдых|заселен|отель|чекин|check-in|вечеринк|аквапарк|терм|сауна)/.test(
      haystack
    )
  ) {
    return 'LEISURE';
  }
  return 'SIGHTSEEING';
}

// Packing List computeds
const packingItems = computed<SharedPackingItem[]>(() => sharedData.value?.packingList ?? []);

const localPackedCount = computed(() =>
  packingItems.value.reduce((acc, item) => acc + (localPackedMap.value[item.key] ? 1 : 0), 0)
);

const localPackingProgress = computed(() => {
  const total = packingItems.value.length;
  if (total === 0) return 0;
  return Math.round((localPackedCount.value / total) * 100);
});

const groupedPackingCategories = computed(() => {
  const filtered = packingItems.value.filter((item) => {
    const isChecked = Boolean(localPackedMap.value[item.key]);
    if (packingFilter.value === 'packed') return isChecked;
    if (packingFilter.value === 'remaining') return !isChecked;
    return true;
  });

  const byCat = new Map<PackingCategory, SharedPackingItem[]>();
  for (const item of filtered) {
    const list = byCat.get(item.category) ?? [];
    list.push(item);
    byCat.set(item.category, list);
  }

  return ORDERED_PACKING_CATEGORIES.filter((cat) => byCat.has(cat)).map((category) => {
    const items = byCat.get(category) || [];
    const packedInCategory = items.filter((it) => Boolean(localPackedMap.value[it.key])).length;
    return {
      category,
      nameRu: PACKING_CATEGORY_META[category].nameRu,
      items,
      packedCount: packedInCategory,
    };
  });
});

// Expenses computeds (read-only)
const expensesData = computed(() => sharedData.value?.expenses ?? null);

const filteredExpenses = computed(() => {
  const items = expensesData.value?.items ?? [];
  if (!selectedExpenseCategory.value) return items;
  return items.filter((e) => e.category === selectedExpenseCategory.value);
});

const maxDailyExpenseAmount = computed(() => {
  const days = expensesData.value?.summary.byDay ?? [];
  if (days.length === 0) return 1;
  return Math.max(1, ...days.map((d) => d.totalAmount));
});

const hasForeignCurrencyExpenses = computed(() => {
  const summary = expensesData.value?.summary;
  const items = expensesData.value?.items ?? [];
  if (!summary) return false;
  return items.some((exp) => exp.currency !== summary.currency);
});

function formatRateNumber(val: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: val >= 1 ? 2 : 4,
  }).format(val);
}

const formattedExchangeRatesLine = computed(() => {
  const summary = expensesData.value?.summary;
  const ratesInfo = summary?.exchangeRates;
  if (!summary || !ratesInfo) return '';
  const base = summary.currency;
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

function getExpenseCategoryIcon(cat: ExpenseCategory) {
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

async function handleCloneTrip() {
  if (!token.value || isCloning.value) return;
  isCloning.value = true;
  try {
    const res = await tripService.cloneSharedTrip(token.value);
    toastStore.success(
      'Маршрут сохранён в ваш аккаунт!',
      'Вы можете редактировать даты, события и свой личный чек-лист.'
    );
    router.push(`/trips/${res.trip.id}`);
  } catch (err: any) {
    toastStore.error(
      'Не удалось сохранить маршрут',
      err?.message || 'Попробуйте повторить действие позже'
    );
  } finally {
    isCloning.value = false;
  }
}

function goToLoginWithRedirect() {
  router.push({
    path: '/login',
    query: { redirect: `/shared/${token.value}` },
  });
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Public Header Bar -->
    <header
      class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
    >
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
      >
        <RouterLink to="/" class="flex items-center gap-2.5 shrink-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-sm"
          >
            <Compass class="w-5 h-5" />
          </div>
          <div class="leading-tight">
            <span class="block text-lg font-extrabold tracking-tight text-slate-900">
              Travel<span class="text-teal-600">Planner</span>
            </span>
          </div>
        </RouterLink>

        <!-- Primary Action Button -->
        <div v-if="sharedData && !isNotFound" class="flex items-center gap-2.5">
          <BaseButton
            v-if="authStore.isAuthenticated"
            variant="primary"
            size="sm"
            :loading="isCloning"
            @click="handleCloneTrip"
          >
            <BookmarkPlus class="w-4 h-4" />
            <span>Сохранить маршрут себе</span>
          </BaseButton>

          <BaseButton
            v-else
            variant="primary"
            size="sm"
            @click="goToLoginWithRedirect"
          >
            <LogIn class="w-4 h-4" />
            <span>Войти, чтобы сохранить себе</span>
          </BaseButton>
        </div>

        <div v-else class="flex items-center gap-2.5">
          <RouterLink
            :to="authStore.isAuthenticated ? '/dashboard' : '/'"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
          >
            <Home class="w-4 h-4" />
            <span>{{ authStore.isAuthenticated ? 'Личный кабинет' : 'На главную' }}</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-20">
        <BaseSpinner label="Загружаем публичный маршрут..." />
      </div>

      <!-- 404 / Link Revoked or Disabled Screen -->
      <div
        v-else-if="isNotFound"
        class="max-w-xl mx-auto my-10 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-8 sm:p-12 text-center space-y-6 animate-fade-in"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto"
        >
          <Link2Off class="w-8 h-8" />
        </div>

        <div class="space-y-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/70"
          >
            Ошибка 404 · Доступ недоступен
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-1">
            Публичный маршрут не найден
          </h1>
          <p class="text-sm text-slate-500 leading-relaxed">
            Ссылка недействительна, устарела или владелец поездки закрыл публичный доступ. Попросите организатора прислать актуальную ссылку.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <BaseButton variant="primary" size="md" @click="router.push('/')">
            <Home class="w-4 h-4" />
            <span>На главную</span>
          </BaseButton>
          <BaseButton variant="outline" size="md" @click="router.push('/countries')">
            <Globe2 class="w-4 h-4" />
            <span>Каталог стран</span>
          </BaseButton>
        </div>
      </div>

      <!-- Generic Network / Server Error -->
      <div v-else-if="loadError || !sharedData || !trip" class="max-w-xl mx-auto py-10 space-y-4">
        <BaseAlert
          type="error"
          title="Не удалось загрузить маршрут"
          :message="loadError || 'Произошла ошибка при получении данных'"
        />
        <BaseButton variant="secondary" @click="fetchSharedTrip">
          <RefreshCw class="w-4 h-4" />
          <span>Повторить</span>
        </BaseButton>
      </div>

      <!-- Shared Trip Content -->
      <div v-else class="space-y-6 animate-fade-in">
        <!-- Trip Hero Card -->
        <section
          class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6"
        >
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div class="flex items-start gap-4 min-w-0">
              <!-- Country Flag -->
              <img
                v-if="headerFlagUrl"
                :src="headerFlagUrl"
                :alt="trip.country"
                loading="lazy"
                decoding="async"
                class="w-16 h-11 object-cover rounded-xl border border-slate-200/80 shadow-sm shrink-0 mt-1"
              />
              <div
                v-else-if="headerFlagEmoji"
                class="w-16 h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-3xl shrink-0 mt-1 shadow-sm"
                aria-hidden="true"
              >
                {{ headerFlagEmoji }}
              </div>
              <div
                v-else
                class="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0"
              >
                <Globe2 class="w-7 h-7" />
              </div>

              <div class="min-w-0 space-y-2.5">
                <!-- Badges -->
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                  >
                    <Users class="w-3.5 h-3.5" />
                    <span>Публичный маршрут для попутчиков</span>
                  </span>

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
                    v-if="trip.tripType"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70"
                  >
                    <Compass class="w-3.5 h-3.5 text-teal-600" />
                    <span>{{ getTripTypeLabelRu(trip.tripType) }}</span>
                  </span>
                </div>

                <!-- Title & Location -->
                <div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {{ trip.title }}
                  </h1>
                  <p
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 mt-1.5"
                  >
                    <MapPin class="w-4 h-4 shrink-0" />
                    <span>{{ trip.country }}, {{ trip.city }}</span>
                  </p>
                </div>

                <!-- Optional Trip Description -->
                <p
                  v-if="trip.description"
                  class="text-sm text-slate-600 leading-relaxed whitespace-pre-line max-w-3xl"
                >
                  {{ trip.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-100"
            :class="
              sharedData.permissions.showExpenses && expensesData
                ? 'lg:grid-cols-4'
                : 'lg:grid-cols-3'
            "
          >
            <div
              class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5"
            >
              <div
                class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"
              >
                <Calendar class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500">Даты поездки</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ formatDateRange(trip.startDate, trip.endDate) }}
                </p>
              </div>
            </div>

            <div
              class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5"
            >
              <div
                class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"
              >
                <Clock class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500">Продолжительность</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ formatDaysLabel(trip.durationDays) }}
                </p>
              </div>
            </div>

            <div
              class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5"
            >
              <div
                class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"
              >
                <Users class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500">Участники</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ formatTravelersLabel(trip.travelersCount) }}
                </p>
              </div>
            </div>

            <div
              v-if="sharedData.permissions.showExpenses && expensesData"
              class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5"
            >
              <div
                class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"
              >
                <Wallet class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-slate-500">Планируемый бюджет</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ formatCurrency(expensesData.summary.plannedBudget, expensesData.summary.currency) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Compact Privacy Notice -->
          <div
            class="flex items-center gap-2 text-xs text-slate-500 pt-1"
          >
            <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Режим «только чтение»: личные брони, документы и контакты организатора скрыты.
            </span>
          </div>
        </section>

        <!-- Empty State if owner disabled all detail tabs -->
        <div
          v-if="availableTabs.length === 0"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-8 sm:p-12 text-center space-y-3"
        >
          <p class="text-base font-bold text-slate-900">
            Подробные разделы скрыты организатором
          </p>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            Владелец маршрута открыл общую карточку поездки и ограничил отображение детальных вкладок.
          </p>
        </div>

        <template v-else>
          <!-- Section Tabs Navigation -->
          <div
            class="flex items-stretch gap-1 overflow-x-auto bg-[linear-gradient(to_top,#e2e8f0_1px,transparent_1px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <button
              v-for="tab in availableTabs"
              :key="tab.key"
              type="button"
              @click="activeTab = tab.key"
              :class="[
                'inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors shrink-0 whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              ]"
            >
              <CalendarDays v-if="tab.key === 'itinerary'" class="w-4 h-4 shrink-0" />
              <Briefcase v-else-if="tab.key === 'packing'" class="w-4 h-4 shrink-0" />
              <BookOpen v-else-if="tab.key === 'country'" class="w-4 h-4 shrink-0" />
              <Coins v-else-if="tab.key === 'expenses'" class="w-4 h-4 shrink-0" />

              <span>{{ tab.label }}</span>

              <span
                v-if="tab.badge !== undefined"
                class="px-2 py-0.5 text-[11px] rounded-full font-bold"
                :class="
                  activeTab === tab.key
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ tab.badge }}
              </span>
            </button>
          </div>

          <!-- TAB: ITINERARY -->
          <div v-if="activeTab === 'itinerary' && sharedData.permissions.showItinerary" class="space-y-5">
            <div
              v-if="sharedData.events.length === 0"
              class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-10 text-center space-y-2"
            >
              <CalendarDays class="w-8 h-8 text-slate-300 mx-auto" />
              <p class="text-base font-bold text-slate-800">План по дням пока не заполнен</p>
              <p class="text-sm text-slate-500">
                Организатор ещё не добавил мероприятия в расписание поездки.
              </p>
            </div>

            <div v-else class="space-y-5">
              <section
                v-for="day in calendarDays"
                :key="day.date"
                class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden"
              >
                <!-- Day Header -->
                <div
                  class="px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-bold"
                    >
                      День {{ day.dayNumber }}
                    </span>
                    <h2 class="text-base font-bold text-slate-900">
                      {{ day.label }}
                    </h2>
                  </div>

                  <span class="text-xs font-semibold text-slate-500">
                    {{ (eventsByDate[day.date] || []).length }}
                    {{ (eventsByDate[day.date] || []).length === 1 ? 'мероприятие' : 'мероприятий' }}
                  </span>
                </div>

                <!-- Day Events -->
                <div class="p-5 sm:p-6">
                  <div
                    v-if="!eventsByDate[day.date] || eventsByDate[day.date].length === 0"
                    class="py-5 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 text-sm text-slate-500"
                  >
                    Свободный день — мероприятий не запланировано
                  </div>

                  <div v-else class="space-y-3.5">
                    <article
                      v-for="(ev, evIdx) in eventsByDate[day.date]"
                      :key="`${day.date}-${evIdx}`"
                      class="rounded-xl border border-slate-200/80 p-4 sm:p-5 bg-white hover:border-teal-200/90 transition-colors space-y-2.5"
                    >
                      <div class="flex flex-wrap items-center gap-2">
                        <!-- Time -->
                        <span
                          v-if="ev.startTime || ev.endTime"
                          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-semibold"
                        >
                          <Clock class="w-3.5 h-3.5 text-teal-600" />
                          <span v-if="ev.startTime && ev.endTime">
                            {{ ev.startTime }} — {{ ev.endTime }}
                          </span>
                          <span v-else-if="ev.startTime">с {{ ev.startTime }}</span>
                          <span v-else>до {{ ev.endTime }}</span>
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                        >
                          Весь день / без времени
                        </span>

                        <!-- Category Badge -->
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-semibold"
                          :class="EVENT_CATEGORY_META[inferEventCategory(ev)].badgeClass"
                        >
                          {{ EVENT_CATEGORY_META[inferEventCategory(ev)].label }}
                        </span>

                        <!-- Optional Estimated Cost (only if showExpenses is true) -->
                        <span
                          v-if="
                            sharedData.permissions.showExpenses &&
                            expensesData &&
                            ev.estimatedCost !== null &&
                            ev.estimatedCost !== undefined
                          "
                          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-semibold"
                        >
                          <Wallet class="w-3 h-3" />
                          <span>{{ formatCurrency(ev.estimatedCost, expensesData.summary.currency) }}</span>
                        </span>
                      </div>

                      <h3 class="text-base font-bold text-slate-900">
                        {{ ev.title }}
                      </h3>

                      <p
                        v-if="ev.location"
                        class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600"
                      >
                        <MapPin class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{{ ev.location }}</span>
                      </p>

                      <p
                        v-if="ev.description"
                        class="text-sm text-slate-600 leading-relaxed whitespace-pre-line"
                      >
                        {{ ev.description }}
                      </p>

                      <div
                        v-if="ev.note"
                        class="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2"
                      >
                        <StickyNote class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span class="whitespace-pre-line">{{ ev.note }}</span>
                      </div>
                    </article>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- TAB: LOCAL INTERACTIVE PACKING LIST -->
          <div
            v-else-if="activeTab === 'packing' && sharedData.permissions.showPackingList"
            class="space-y-6"
          >
            <!-- Companion Progress Card -->
            <div
              class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 sm:p-6 space-y-4"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-lg font-extrabold text-slate-900">
                      Ваш личный чек-лист сборов
                    </h2>
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/70"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5" />
                      <span>Сохраняется в вашем браузере</span>
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-500 mt-1">
                    Отмечайте собранные вещи самостоятельно — ваши галочки видны только на этом устройстве и не влияют на список организатора.
                  </p>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <div class="text-right">
                    <p class="text-xl font-black text-slate-900 tabular-nums">
                      {{ localPackedCount }} / {{ packingItems.length }}
                    </p>
                    <p class="text-xs font-semibold text-teal-700">
                      {{ localPackingProgress }}% собрано
                    </p>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="
                    localPackingProgress === 100 && packingItems.length > 0
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-teal-500 to-sky-500'
                  "
                  :style="{ width: `${localPackingProgress}%` }"
                />
              </div>

              <!-- Filter & Reset Controls -->
              <div
                v-if="packingItems.length > 0"
                class="flex flex-wrap items-center justify-between gap-3 pt-1"
              >
                <div class="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    @click="packingFilter = 'all'"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                      packingFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
                    ]"
                  >
                    Все ({{ packingItems.length }})
                  </button>
                  <button
                    type="button"
                    @click="packingFilter = 'remaining'"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                      packingFilter === 'remaining'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
                    ]"
                  >
                    Осталось ({{ packingItems.length - localPackedCount }})
                  </button>
                  <button
                    type="button"
                    @click="packingFilter = 'packed'"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                      packingFilter === 'packed'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
                    ]"
                  >
                    Собрано ({{ localPackedCount }})
                  </button>
                </div>

                <button
                  v-if="localPackedCount > 0"
                  type="button"
                  @click="resetLocalPacking"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>Сбросить отметки</span>
                </button>
              </div>
            </div>

            <!-- Empty Packing List -->
            <div
              v-if="packingItems.length === 0"
              class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-10 text-center space-y-2"
            >
              <Briefcase class="w-8 h-8 text-slate-300 mx-auto" />
              <p class="text-base font-bold text-slate-800">Список вещей пока пуст</p>
              <p class="text-sm text-slate-500">
                Организатор ещё не сформировал список вещей для этой поездки.
              </p>
            </div>

            <!-- Empty Filter Result -->
            <div
              v-else-if="groupedPackingCategories.length === 0"
              class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-10 text-center space-y-3"
            >
              <CheckCircle2 class="w-9 h-9 text-emerald-500 mx-auto" />
              <p class="text-base font-bold text-slate-800">
                {{
                  packingFilter === 'remaining'
                    ? 'Все вещи собраны! Отличная подготовка.'
                    : 'Вы пока не отметили ни одной вещи.'
                }}
              </p>
              <BaseButton variant="outline" size="sm" @click="packingFilter = 'all'">
                Показать весь список
              </BaseButton>
            </div>

            <!-- Grouped Packing Categories -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section
                v-for="group in groupedPackingCategories"
                :key="group.category"
                class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col"
              >
                <div
                  class="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2"
                >
                  <h3 class="text-sm font-extrabold text-slate-900">
                    {{ group.nameRu }}
                  </h3>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :class="
                      group.packedCount === group.items.length
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-200/70 text-slate-700'
                    "
                  >
                    {{ group.packedCount }} / {{ group.items.length }}
                  </span>
                </div>

                <ul class="divide-y divide-slate-100">
                  <li v-for="item in group.items" :key="item.key">
                    <label
                      class="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                    >
                      <input
                        type="checkbox"
                        :checked="Boolean(localPackedMap[item.key])"
                        class="sr-only"
                        @change="toggleLocalPacked(item.key)"
                      />
                      <span
                        class="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all"
                        :class="
                          localPackedMap[item.key]
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        "
                      >
                        <Check class="w-3.5 h-3.5 stroke-[3]" />
                      </span>

                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span
                            class="text-sm font-semibold transition-colors"
                            :class="
                              localPackedMap[item.key]
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            "
                          >
                            {{ item.name }}
                          </span>
                          <span
                            v-if="item.quantity && item.quantity > 1"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600"
                          >
                            ×{{ item.quantity }}
                          </span>
                        </div>

                        <p
                          v-if="item.reason"
                          class="text-xs text-slate-400 mt-0.5 leading-snug"
                        >
                          {{ item.reason }}
                        </p>
                      </div>
                    </label>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <!-- TAB: COUNTRY INFO (REUSES CountryTravelInfoSection.vue) -->
          <div v-else-if="activeTab === 'country' && sharedData.permissions.showCountryInfo">
            <CountryTravelInfoSection
              v-if="sharedData.countryInfo && sharedData.countryInfo.travelInfo"
              :country="sharedData.countryInfo"
              :travelInfo="sharedData.countryInfo.travelInfo"
              :tripCity="trip.city"
            />

            <div
              v-else
              class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-teal-600 flex items-center justify-center mx-auto"
              >
                <Globe2 class="w-7 h-7" />
              </div>
              <h2 class="text-lg font-extrabold text-slate-900">
                Памятка для направления «{{ trip.country }}» не найдена в справочнике
              </h2>
              <p class="text-sm text-slate-500">
                Страна указана организатором вручную и не сопоставлена с каталогом TravelPlanner.
              </p>
            </div>
          </div>

          <!-- TAB: EXPENSES / BUDGET (READ-ONLY, ONLY WHEN showExpenses === true) -->
          <div
            v-else-if="activeTab === 'expenses' && sharedData.permissions.showExpenses && expensesData"
            class="space-y-6"
          >
            <!-- KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    План бюджета
                  </span>
                  <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Wallet class="w-4 h-4" />
                  </div>
                </div>
                <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {{ formatCurrency(expensesData.summary.plannedBudget, expensesData.summary.currency) }}
                </p>
                <p class="text-xs text-slate-400 mt-1">Запланировано на поездку</p>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Потрачено
                  </span>
                  <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Receipt class="w-4 h-4" />
                  </div>
                </div>
                <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {{ formatCurrency(expensesData.summary.totalSpent, expensesData.summary.currency) }}
                </p>
                <p class="text-xs text-slate-400 mt-1">
                  Операций: {{ expensesData.items.length }}
                </p>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Остаток
                  </span>
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center"
                    :class="
                      expensesData.summary.remainingBudget < 0
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-emerald-50 text-emerald-600'
                    "
                  >
                    <TrendingUp class="w-4 h-4" />
                  </div>
                </div>
                <p
                  class="text-xl sm:text-2xl font-extrabold"
                  :class="
                    expensesData.summary.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'
                  "
                >
                  {{ formatCurrency(expensesData.summary.remainingBudget, expensesData.summary.currency) }}
                </p>
                <p
                  class="text-xs font-medium mt-1"
                  :class="
                    expensesData.summary.remainingBudget < 0
                      ? 'text-rose-500 font-bold'
                      : 'text-slate-400'
                  "
                >
                  {{
                    expensesData.summary.remainingBudget < 0
                      ? 'Бюджет превышен'
                      : 'Доступно по плану'
                  }}
                </p>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Освоение
                  </span>
                  <span
                    class="text-xs font-bold px-2 py-0.5 rounded-full"
                    :class="
                      expensesData.summary.status === 'over_budget'
                        ? 'bg-rose-100 text-rose-800'
                        : expensesData.summary.status === 'near_budget'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                    "
                  >
                    {{
                      expensesData.summary.status === 'over_budget'
                        ? 'Превышен'
                        : expensesData.summary.status === 'near_budget'
                          ? 'Внимание'
                          : 'В норме'
                    }}
                  </span>
                </div>
                <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {{ expensesData.summary.spentPercentage }}%
                </p>
                <div class="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :style="{ width: Math.min(expensesData.summary.spentPercentage, 100) + '%' }"
                    :class="
                      expensesData.summary.status === 'over_budget'
                        ? 'bg-rose-500'
                        : expensesData.summary.status === 'near_budget'
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Averages Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-soft flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <CalendarDays class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      В среднем в день
                    </p>
                    <p class="text-xs text-slate-400 mt-0.5 truncate">
                      За {{ formatDaysLabel(trip.durationDays) }}
                    </p>
                  </div>
                </div>
                <p class="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums shrink-0">
                  {{ formatCurrency(expensesData.summary.dailyAverage, expensesData.summary.currency) }}
                </p>
              </div>

              <div
                class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-soft flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      На 1 путешественника
                    </p>
                    <p class="text-xs text-slate-400 mt-0.5 truncate">
                      Участников: {{ trip.travelersCount }}
                    </p>
                  </div>
                </div>
                <p class="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums shrink-0">
                  {{ formatCurrency(expensesData.summary.perTravelerAverage, expensesData.summary.currency) }}
                </p>
              </div>
            </div>

            <!-- Exchange Rates Bar -->
            <div
              v-if="formattedExchangeRatesLine"
              class="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600"
            >
              <div class="flex flex-wrap items-center gap-2">
                <ArrowRightLeft class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span class="font-semibold text-slate-700">Курс пересчёта:</span>
                <span class="font-medium text-slate-800 tabular-nums">{{ formattedExchangeRatesLine }}</span>
                <span v-if="hasForeignCurrencyExpenses" class="text-slate-400">
                  (пересчитано в {{ expensesData.summary.currency }})
                </span>
              </div>
            </div>

            <!-- Over-budget banner -->
            <div
              v-if="expensesData.summary.status === 'over_budget'"
              class="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs sm:text-sm"
            >
              <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong class="font-bold">Превышение бюджета:</strong>
                расходы превышают план на
                {{ formatCurrency(Math.abs(expensesData.summary.remainingBudget), expensesData.summary.currency) }}.
              </span>
            </div>

            <!-- Chart + Read-Only Expenses List -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div class="lg:col-span-5 space-y-6">
                <ExpenseCategoryChart
                  :summary="expensesData.summary"
                  :selected-category="selectedExpenseCategory"
                  @select-category="selectedExpenseCategory = $event"
                />

                <!-- Daily Dynamics -->
                <div
                  v-if="expensesData.summary.byDay.length > 0"
                  class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-4"
                >
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BarChart3 class="w-5 h-5" />
                      </div>
                      <div>
                        <h3 class="font-bold text-slate-900 text-base">Динамика по дням</h3>
                        <p class="text-xs text-slate-500">В валюте {{ expensesData.summary.currency }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div
                      v-for="day in expensesData.summary.byDay"
                      :key="day.date"
                      class="space-y-1.5"
                    >
                      <div class="flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span class="font-semibold text-slate-800 truncate">
                          {{ formatRussianDate(day.date) }}
                        </span>
                        <span class="font-extrabold text-slate-900 tabular-nums shrink-0">
                          {{ formatCurrency(day.totalAmount, expensesData.summary.currency) }}
                        </span>
                      </div>
                      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                          :style="{
                            width: Math.max(4, Math.round((day.totalAmount / maxDailyExpenseAmount) * 100)) + '%',
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Read-only Expense Items -->
              <div
                class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5"
              >
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="font-extrabold text-slate-900 text-lg">История расходов</h3>
                    <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Просмотр трат, которыми поделился организатор
                    </p>
                  </div>

                  <button
                    v-if="selectedExpenseCategory"
                    type="button"
                    @click="selectedExpenseCategory = null"
                    class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Сбросить фильтр
                  </button>
                </div>

                <!-- Category Filter Pills -->
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    @click="selectedExpenseCategory = null"
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      selectedExpenseCategory === null
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700',
                    ]"
                  >
                    <span>Все</span>
                    <span class="opacity-75">({{ expensesData.items.length }})</span>
                  </button>

                  <button
                    v-for="catItem in expensesData.summary.byCategory"
                    :key="catItem.category"
                    type="button"
                    @click="
                      selectedExpenseCategory =
                        selectedExpenseCategory === catItem.category ? null : catItem.category
                    "
                    :class="[
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all',
                      selectedExpenseCategory === catItem.category
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300',
                    ]"
                  >
                    <span
                      class="w-2.5 h-2.5 rounded-full shrink-0"
                      :style="{ backgroundColor: catItem.color }"
                    />
                    <span>{{ catItem.nameRu }}</span>
                    <span class="opacity-75">({{ catItem.count }})</span>
                  </button>
                </div>

                <div
                  v-if="filteredExpenses.length === 0"
                  class="py-12 text-center text-sm text-slate-500"
                >
                  {{
                    selectedExpenseCategory
                      ? 'В выбранной категории нет расходов'
                      : 'Расходы пока не зафиксированы'
                  }}
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="(exp, idx) in filteredExpenses"
                    :key="`${exp.expenseDate}-${exp.category}-${idx}`"
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white gap-3"
                  >
                    <div class="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div
                        class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm"
                        :style="{ backgroundColor: exp.categoryColor }"
                      >
                        <component :is="getExpenseCategoryIcon(exp.category)" class="w-5 h-5" />
                      </div>
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="text-sm sm:text-base font-bold text-slate-900">
                            {{ exp.categoryNameRu }}
                          </span>
                          <span
                            class="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
                          >
                            {{ formatRussianDate(exp.expenseDate) }}
                          </span>
                        </div>
                        <p v-if="exp.description" class="text-xs sm:text-sm text-slate-600 mt-1">
                          {{ exp.description }}
                        </p>
                      </div>
                    </div>

                    <div class="sm:text-right shrink-0">
                      <span class="block text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                        {{ formatCurrency(exp.amount, exp.currency) }}
                      </span>
                      <span
                        v-if="exp.currency !== expensesData.summary.currency"
                        class="block text-xs font-semibold text-teal-700 tabular-nums"
                      >
                        ≈ {{ formatCurrency(exp.convertedAmount, expensesData.summary.currency) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Subtle Footer -->
    <footer class="border-t border-slate-200/70 bg-white/80 py-5 mt-8">
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500"
      >
        <span>TravelPlanner · Умное планирование совместных путешествий</span>
        <RouterLink to="/" class="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
          Создать свой маршрут в TravelPlanner →
        </RouterLink>
      </div>
    </footer>
  </div>
</template>
