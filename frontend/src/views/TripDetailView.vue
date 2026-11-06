<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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
} from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useToastStore } from '@/stores/toast.store';
import type { EventFormPayload, ItineraryEvent } from '@/types';
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
import EventFormModal from '@/components/trips/EventFormModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const toastStore = useToastStore();

const tripId = computed(() => route.params.id as string);
const activeTab = ref<'overview' | 'itinerary'>('overview');

// Trip deletion state
const showDeleteTripConfirm = ref(false);
const isDeletingTrip = ref(false);

// Event modal state
const eventModalOpen = ref(false);
const selectedDayDate = ref('');
const editingEvent = ref<ItineraryEvent | null>(null);
const isSavingEvent = ref(false);
const eventModalRef = ref<InstanceType<typeof EventFormModal> | null>(null);

// Event deletion state
const eventToDelete = ref<ItineraryEvent | null>(null);
const isDeletingEvent = ref(false);

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

function loadTrip() {
  if (tripId.value) {
    tripStore.fetchTripById(tripId.value).catch(() => {
      // Handled via tripStore.detailError
    });
  }
}

onMounted(() => {
  loadTrip();
});

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
            <div class="flex items-center justify-between py-2">
              <dt class="text-slate-500">Расходы по плану</dt>
              <dd class="font-semibold text-slate-900">
                {{ formatCurrency(totalEstimatedEventsCost, trip.currency) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- TAB 2: ITINERARY BY DAYS -->
      <div v-else class="space-y-6">
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
    </div>

    <!-- Event Add/Edit Modal -->
    <EventFormModal
      v-if="trip"
      ref="eventModalRef"
      :open="eventModalOpen"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      :currency="trip.currency"
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
