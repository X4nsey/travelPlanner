<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Plus, Search, Compass, RefreshCw } from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useToastStore } from '@/stores/toast.store';
import type { Trip } from '@/types';
import { getTodayIso } from '@/composables/useFormatters';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import TripCard from '@/components/trips/TripCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const tripStore = useTripStore();
const toastStore = useToastStore();
const router = useRouter();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'upcoming' | 'past'>('all');
const tripToDelete = ref<Trip | null>(null);
const isDeleting = ref(false);

onMounted(() => {
  tripStore.fetchTrips().catch(() => {
    // Error stored in tripStore.listError
  });
});

const filteredTrips = computed(() => {
  const today = getTodayIso();
  const q = searchQuery.value.trim().toLowerCase();

  return tripStore.trips.filter((trip) => {
    if (statusFilter.value === 'upcoming' && trip.endDate < today) {
      return false;
    }
    if (statusFilter.value === 'past' && trip.endDate >= today) {
      return false;
    }
    if (!q) return true;
    return (
      trip.title.toLowerCase().includes(q) ||
      trip.country.toLowerCase().includes(q) ||
      trip.city.toLowerCase().includes(q)
    );
  });
});

function handleOpenTrip(id: string) {
  router.push(`/trips/${id}`);
}

function handleEditTrip(id: string) {
  router.push(`/trips/${id}/edit`);
}

function promptDeleteTrip(trip: Trip) {
  tripToDelete.value = trip;
}

async function confirmDeleteTrip() {
  if (!tripToDelete.value) return;
  isDeleting.value = true;
  try {
    await tripStore.deleteTrip(tripToDelete.value.id);
    toastStore.success('Поездка успешно удалена');
    tripToDelete.value = null;
  } catch (err: any) {
    toastStore.error('Ошибка удаления', err?.message || 'Не удалось удалить поездку');
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Мои поездки</h1>
          <p class="text-sm text-slate-500 mt-1">
            Список всех ваших запланированных и совершённых путешествий
          </p>
        </div>

        <RouterLink to="/trips/new" class="shrink-0">
          <BaseButton variant="primary" size="md">
            <Plus class="w-4 h-4" />
            <span>Создать поездку</span>
          </BaseButton>
        </RouterLink>
      </div>

      <!-- Filters Bar (only shown if user has at least 1 trip) -->
      <div
        v-if="tripStore.trips.length > 0"
        class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию, стране или городу..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            @click="statusFilter = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Все ({{ tripStore.trips.length }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'upcoming'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              statusFilter === 'upcoming'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Предстоящие ({{ tripStore.upcomingTripsCount }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'past'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              statusFilter === 'past'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Завершённые
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <BaseSpinner
        v-if="tripStore.isLoadingList"
        label="Загрузка списка поездок..."
      />

      <!-- Error State -->
      <div v-else-if="tripStore.listError" class="space-y-4">
        <BaseAlert
          type="error"
          title="Не удалось загрузить поездки"
          :message="tripStore.listError"
        />
        <BaseButton variant="outline" @click="tripStore.fetchTrips()">
          <RefreshCw class="w-4 h-4" />
          <span>Попробовать снова</span>
        </BaseButton>
      </div>

      <!-- Empty State (no trips at all) -->
      <EmptyState
        v-else-if="tripStore.trips.length === 0"
        title="Список поездок пуст"
        description="У вас пока нет ни одной поездки. Нажмите кнопку ниже, чтобы спланировать новое путешествие."
      >
        <template #icon>
          <Compass class="w-7 h-7" />
        </template>
        <template #action>
          <RouterLink to="/trips/new">
            <BaseButton variant="primary" size="lg">
              <Plus class="w-5 h-5" />
              <span>Создать новую поездку</span>
            </BaseButton>
          </RouterLink>
        </template>
      </EmptyState>

      <!-- Empty Search Results -->
      <EmptyState
        v-else-if="filteredTrips.length === 0"
        title="Поездки не найдены"
        description="По вашему запросу или выбранному фильтру ничего не найдено. Попробуйте сбросить параметры поиска."
      >
        <template #action>
          <BaseButton
            variant="outline"
            @click="
              searchQuery = '';
              statusFilter = 'all';
            "
          >
            Сбросить фильтры
          </BaseButton>
        </template>
      </EmptyState>

      <!-- Trips Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TripCard
          v-for="trip in filteredTrips"
          :key="trip.id"
          :trip="trip"
          @open="handleOpenTrip"
          @edit="handleEditTrip"
          @delete="promptDeleteTrip"
        />
      </div>
    </div>

    <ConfirmDialog
      :open="Boolean(tripToDelete)"
      title="Удалить поездку?"
      :message="`Вы действительно хотите удалить поездку «${tripToDelete?.title}»? Все мероприятия внутри этой поездки также будут удалены.`"
      confirmText="Да, удалить"
      :loading="isDeleting"
      @confirm="confirmDeleteTrip"
      @cancel="tripToDelete = null"
    />
  </DashboardLayout>
</template>
