<script setup lang="ts">
import { computed, onMounted, ref, defineAsyncComponent, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  ArrowLeft,
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
} from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useToastStore } from '@/stores/toast.store';
import { expenseService } from '@/services/expense.service';
import type {
  EventFormPayload,
  ItineraryEvent,
  TripExpense,
  ExpenseFormPayload,
  TripExpenseSummary,
  ExpenseCategory,
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
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const EventFormModal = defineAsyncComponent(
  () => import('@/components/trips/EventFormModal.vue')
);

const ExpenseCategoryChart = defineAsyncComponent(
  () => import('@/components/trips/ExpenseCategoryChart.vue')
);

const ExpenseFormModal = defineAsyncComponent(
  () => import('@/components/trips/ExpenseFormModal.vue')
);

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const toastStore = useToastStore();

const tripId = computed(() => route.params.id as string);
const activeTab = ref<'overview' | 'itinerary' | 'expenses'>('overview');

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

function loadTrip() {
  if (tripId.value) {
    tripStore.fetchTripById(tripId.value).catch(() => {
      // Handled via tripStore.detailError
    });
    loadTripExpenses();
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
  if (route.query.tab === 'expenses') {
    activeTab.value = 'expenses';
  } else if (route.query.tab === 'itinerary') {
    activeTab.value = 'itinerary';
  }
  loadTrip();
});

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'expenses' || newTab === 'itinerary' || newTab === 'overview') {
      activeTab.value = newTab;
    }
  }
);

async function handleDeleteTrip() {
  if (!trip.value) return;
  isDeletingTrip.value = true;
  try {
    await tripStore.deleteTrip(trip.value.id);
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
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Все мои поездки</span>
        </RouterLink>
      </div>

      <!-- Trip Hero Header Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div class="space-y-3">
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

              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
                <MapPin class="w-3.5 h-3.5" />
                {{ trip.country }}, {{ trip.city }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {{ trip.title }}
            </h1>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Calendar class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Даты поездки</p>
              <p class="text-sm font-bold text-slate-900">
                {{ formatDateRange(trip.startDate, trip.endDate) }}
              </p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Продолжительность</p>
              <p class="text-sm font-bold text-slate-900">
                {{ formatDaysLabel(trip.durationDays) }}
              </p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Участники</p>
              <p class="text-sm font-bold text-slate-900">
                {{ formatTravelersLabel(trip.travelersCount) }}
              </p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Планируемый бюджет</p>
              <p class="text-sm font-bold text-slate-900">
                {{ formatCurrency(trip.budget, trip.currency) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Switcher -->
      <div class="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          @click="activeTab = 'overview'"
          :class="[
            'inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800',
          ]"
        >
          <FileText class="w-4 h-4" />
          <span>Обзор</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'itinerary'"
          :class="[
            'inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
            activeTab === 'itinerary'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800',
          ]"
        >
          <CalendarDays class="w-4 h-4" />
          <span>План поездки</span>
          <span
            class="ml-1 px-2 py-0.5 text-xs rounded-full bg-teal-50 text-teal-700 font-bold"
          >
            {{ totalEventsCount }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'expenses'"
          :class="[
            'inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
            activeTab === 'expenses'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800',
          ]"
        >
          <Coins class="w-4 h-4" />
          <span>Расходы и бюджет</span>
          <span
            v-if="tripExpenses.length > 0"
            class="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-bold"
          >
            {{ tripExpenses.length }}
          </span>
        </button>
      </div>

      <!-- TAB 1: OVERVIEW -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Описание поездки</h2>
          <p
            v-if="trip.description"
            class="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line"
          >
            {{ trip.description }}
          </p>
          <p v-else class="text-sm text-slate-400 italic">
            Описание к этой поездке пока не добавлено. Вы можете добавить его, нажав кнопку «Редактировать».
          </p>

          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              В плане поездки: <strong class="text-slate-800">{{ totalEventsCount }}</strong> мероприятий на
              <strong class="text-slate-800">{{ formatDaysLabel(trip.durationDays) }}</strong>
            </div>

            <BaseButton variant="secondary" size="sm" @click="activeTab = 'itinerary'">
              <CalendarDays class="w-4 h-4" />
              <span>Перейти к плану по дням</span>
            </BaseButton>
          </div>
        </div>

        <!-- Summary Sidebar Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-4">
          <h3 class="text-base font-bold text-slate-900">Сводка по маршруту</h3>

          <dl class="space-y-3 text-sm">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Направление</dt>
              <dd class="font-semibold text-slate-900 text-right">{{ trip.country }}, {{ trip.city }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Дата начала</dt>
              <dd class="font-semibold text-slate-900">{{ formatRussianDate(trip.startDate) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Дата окончания</dt>
              <dd class="font-semibold text-slate-900">{{ formatRussianDate(trip.endDate) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Длительность</dt>
              <dd class="font-semibold text-teal-700">{{ formatDaysLabel(trip.durationDays) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Общий бюджет</dt>
              <dd class="font-semibold text-slate-900">{{ formatCurrency(trip.budget, trip.currency) }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Фактические траты</dt>
              <dd class="font-semibold text-slate-900">
                {{ formatCurrency(expenseSummary?.totalSpent || 0, trip.currency) }}
              </dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <dt class="text-slate-500">Остаток бюджета</dt>
              <dd
                class="font-semibold"
                :class="(expenseSummary?.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'"
              >
                {{ formatCurrency(expenseSummary?.remainingBudget || 0, trip.currency) }}
              </dd>
            </div>
            <div class="flex items-center justify-between py-2">
              <dt class="text-slate-500">Оценка по плану</dt>
              <dd class="font-semibold text-slate-900">
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
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Расписание по дням поездки</h2>
            <p class="text-xs sm:text-sm text-slate-500">
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
            class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden"
          >
            <!-- Day Header -->
            <div class="px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  День {{ day.dayNumber }}
                </span>
                <h3 class="text-base font-bold text-slate-900">
                  {{ day.label }}
                </h3>
              </div>

              <BaseButton
                variant="ghost"
                size="sm"
                class="text-teal-700 hover:bg-teal-50"
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
                class="py-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40"
              >
                <p class="text-sm text-slate-500 mb-3">
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
                  class="group rounded-xl border border-slate-200/80 p-4 sm:p-5 hover:border-teal-200 hover:bg-slate-50/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div class="space-y-2 flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        v-if="ev.startTime || ev.endTime"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-semibold"
                      >
                        <Clock class="w-3.5 h-3.5 text-teal-600" />
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
                        class="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                      >
                        Весь день / без времени
                      </span>

                      <span
                        v-if="ev.estimatedCost !== null && ev.estimatedCost !== undefined"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-semibold"
                      >
                        <Wallet class="w-3 h-3" />
                        {{ formatCurrency(ev.estimatedCost, trip.currency) }}
                      </span>
                    </div>

                    <h4 class="text-base font-bold text-slate-900">
                      {{ ev.title }}
                    </h4>

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
                      class="mt-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2"
                    >
                      <StickyNote class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span class="whitespace-pre-line">{{ ev.note }}</span>
                    </div>
                  </div>

                  <!-- Event Actions -->
                  <div class="flex items-center gap-1 self-end sm:self-start shrink-0">
                    <button
                      type="button"
                      @click="openEditEventModal(ev)"
                      class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                      title="Редактировать мероприятие"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      @click="eventToDelete = ev"
                      class="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
            <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Coins class="w-5 h-5 text-teal-600" />
              <span>Финансовый помощник</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
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
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">План бюджета</span>
              <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Wallet class="w-4 h-4" />
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
              {{ formatCurrency(trip.budget, trip.currency) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              Запланировано на поездку
            </p>
          </div>

          <!-- Total Spent -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Фактически потрачено</span>
              <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Receipt class="w-4 h-4" />
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
              {{ formatCurrency(expenseSummary?.totalSpent || 0, trip.currency) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              Всего по {{ tripExpenses.length }} {{ tripExpenses.length === 1 ? 'операции' : tripExpenses.length < 5 ? 'операциям' : 'операциям' }}
            </p>
          </div>

          <!-- Remaining Budget -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Остаток бюджета</span>
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :class="
                  (expenseSummary?.remainingBudget || 0) < 0
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
                (expenseSummary?.remainingBudget || 0) < 0
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              "
            >
              {{ formatCurrency(expenseSummary?.remainingBudget || 0, trip.currency) }}
            </p>
            <p
              class="text-xs font-medium mt-1"
              :class="(expenseSummary?.remainingBudget || 0) < 0 ? 'text-rose-500 font-bold' : 'text-slate-400'"
            >
              {{
                (expenseSummary?.remainingBudget || 0) < 0
                  ? 'Внимание: бюджет превышен!'
                  : 'Доступно для трат'
              }}
            </p>
          </div>

          <!-- Spent % Progress -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Освоение бюджета</span>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="
                  expenseSummary?.status === 'over_budget'
                    ? 'bg-rose-100 text-rose-800'
                    : expenseSummary?.status === 'near_budget'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
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
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900">
              {{ expenseSummary?.spentPercentage || 0 }}%
            </p>
            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: Math.min(expenseSummary?.spentPercentage || 0, 100) + '%' }"
                :class="
                  expenseSummary?.status === 'over_budget'
                    ? 'bg-rose-500'
                    : expenseSummary?.status === 'near_budget'
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                "
              ></div>
            </div>
          </div>
        </div>

        <!-- Over-budget warning banner if budget exceeded -->
        <div
          v-if="expenseSummary?.status === 'over_budget'"
          class="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div class="text-xs sm:text-sm">
            <strong class="font-bold">Предупреждение о перерасходе средств:</strong>
            Текущие расходы превышают запланированный бюджет на {{ formatCurrency(Math.abs(expenseSummary.remainingBudget), trip.currency) }}. Рекомендуем скорректировать дальнейшие траты.
          </div>
        </div>

        <!-- Expenses Grid: Donut Chart on Left, Expenses History on Right -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Category Breakdown Chart Component -->
          <div class="lg:col-span-5">
            <ExpenseCategoryChart
              :summary="expenseSummary"
              :selected-category="selectedCategoryFilter"
              @select-category="selectedCategoryFilter = $event"
            />
          </div>

          <!-- History of Expenses List -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 class="font-extrabold text-slate-900 text-lg sm:text-xl">История расходов</h3>
                <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Все зафиксированные траты в хронологическом порядке
                </p>
              </div>

              <!-- Quick Reset Filter Button -->
              <div v-if="selectedCategoryFilter" class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="selectedCategoryFilter = null"
                  class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700',
                ]"
              >
                <span>Все</span>
                <span
                  class="px-1.5 py-0.5 rounded-md text-[11px]"
                  :class="selectedCategoryFilter === null ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50',
                ]"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: catItem.color }"
                ></span>
                <span>{{ catItem.nameRu }}</span>
                <span
                  class="text-xs font-semibold opacity-75"
                  :class="selectedCategoryFilter === catItem.category ? 'text-white' : 'text-slate-500'"
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
              <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Receipt class="w-7 h-7" />
              </div>
              <p class="text-base font-bold text-slate-800">
                {{ selectedCategoryFilter ? 'В этой категории пока нет расходов' : 'Расходы ещё не зафиксированы' }}
              </p>
              <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
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
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-sm transition-all duration-150 gap-4 group"
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
                      <span class="text-base sm:text-lg font-bold text-slate-900">
                        {{ exp.categoryNameRu }}
                      </span>
                      <span class="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                        {{ formatRussianDate(exp.expenseDate) }}
                      </span>
                    </div>

                    <p
                      v-if="exp.description"
                      class="text-sm text-slate-600 mt-1 leading-relaxed"
                    >
                      {{ exp.description }}
                    </p>
                    <p v-else class="text-xs text-slate-400 italic mt-1">
                      Без описания
                    </p>
                  </div>
                </div>

                <!-- Right: Amount and Action Buttons -->
                <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {{ formatCurrency(exp.amount, exp.currency) }}
                  </span>

                  <!-- Actions -->
                  <div class="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      @click="openEditExpenseModal(exp)"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                      title="Редактировать расход"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="expenseToDelete = exp"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
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
  </DashboardLayout>
</template>
