<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  Plus,
  Compass,
  Globe2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import type { DuplicateTripPayload, Trip } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import TripCard from '@/components/trips/TripCard.vue';
import TravelerDashboardStats from '@/components/trips/TravelerDashboardStats.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const DuplicateTripModal = defineAsyncComponent(
  () => import('@/components/trips/DuplicateTripModal.vue')
);

const TripTemplatesModal = defineAsyncComponent(
  () => import('@/components/trips/TripTemplatesModal.vue')
);

const authStore = useAuthStore();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();
const router = useRouter();

const tripToDelete = ref<Trip | null>(null);
const isDeleting = ref(false);
const tripToDuplicate = ref<Trip | null>(null);
const isDuplicating = ref(false);
const duplicateModalRef = ref<{ setError: (msg: string | null) => void } | null>(null);
const templatesModalOpen = ref(false);

onMounted(() => {
  tripStore.fetchTrips().catch(() => {
    // Error handled in tripStore.listError
  });
  tripStore.fetchStats().catch(() => {
    // Error handled in tripStore.statsError
  });
  countryStore.ensureCountriesLoaded().catch(() => {});
  countryStore.fetchFavorites().catch(() => {});
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

function promptDuplicateTrip(trip: Trip) {
  tripToDuplicate.value = trip;
}

async function handleDuplicateSubmit(payload: DuplicateTripPayload) {
  if (!tripToDuplicate.value) return;
  isDuplicating.value = true;
  try {
    const res = await tripStore.duplicateTrip(tripToDuplicate.value.id, payload);
    toastStore.success('Копия поездки успешно создана');
    tripToDuplicate.value = null;
    router.push(`/trips/${res.trip.id}`);
  } catch (err: any) {
    duplicateModalRef.value?.setError(err?.message || 'Не удалось дублировать поездку');
  } finally {
    isDuplicating.value = false;
  }
}

function handleTemplateCreated(trip: Trip) {
  templatesModalOpen.value = false;
  router.push(`/trips/${trip.id}`);
}

async function confirmDeleteTrip() {
  if (!tripToDelete.value) return;
  isDeleting.value = true;
  try {
    await tripStore.deleteTrip(tripToDelete.value.id);
    toastStore.success('Поездка удалена');
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
    <div class="space-y-8 animate-fade-in">
      <!-- Welcome Header -->
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
      >
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Личный кабинет
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Здравствуйте, {{ authStore.user?.name }}!
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Управляйте своими маршрутами, исследуйте 3D-глобус и планируйте новые путешествия в одном месте.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <RouterLink to="/explore">
            <BaseButton variant="secondary" size="lg">
              <Globe2 class="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Исследовать 3D-глобус</span>
            </BaseButton>
          </RouterLink>

          <RouterLink to="/trips/new">
            <BaseButton variant="primary" size="lg">
              <Plus class="w-5 h-5" />
              <span>Создать поездку</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Traveler Aggregated Stats & Featured Trip Command Center -->
      <TravelerDashboardStats @open-templates="templatesModalOpen = true" />

      <!-- Interactive World Banner -->
      <div
        class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 dark:border dark:border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-soft dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div class="space-y-1.5 max-w-2xl">
          <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300">
            <Globe2 class="w-4 h-4" />
            <span>Интерактивный 3D-глобус и каталог стран мира</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-white">
            Не знаете, куда отправиться дальше?
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Покрутите трёхмерную модель Земли, изучите фотографии, столицы, валюты и популярные города стран мира или выберите направление в каталоге.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <RouterLink to="/explore">
            <BaseButton
              variant="primary"
              size="md"
              class="!bg-teal-600 hover:!bg-teal-500 !text-white font-semibold"
            >
              <Globe2 class="w-4 h-4" />
              <span>Открыть 3D-глобус</span>
            </BaseButton>
          </RouterLink>

          <RouterLink to="/countries">
            <BaseButton
              variant="outline"
              size="md"
              class="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
            >
              <BookOpen class="w-4 h-4" />
              <span>Каталог стран</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Loading State -->
      <BaseSpinner
        v-if="tripStore.isLoadingList"
        label="Загружаем ваши поездки..."
      />

      <!-- Error State -->
      <div v-else-if="tripStore.listError" class="space-y-4">
        <BaseAlert
          type="error"
          title="Ошибка загрузки данных"
          :message="tripStore.listError"
        />
        <BaseButton variant="outline" @click="tripStore.fetchTrips()">
          <RefreshCw class="w-4 h-4" />
          <span>Повторить попытку</span>
        </BaseButton>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="tripStore.trips.length === 0"
        title="У вас пока нет запланированных поездок"
        description="Создайте свою первую поездку, выберите страну на 3D-глобусе, укажите даты и начните составлять удобный план мероприятий по дням."
      >
        <template #icon>
          <Compass class="w-7 h-7" />
        </template>
        <template #action>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <RouterLink to="/trips/new">
              <BaseButton variant="primary" size="lg">
                <Plus class="w-5 h-5" />
                <span>Создать первую поездку</span>
              </BaseButton>
            </RouterLink>
            <BaseButton variant="secondary" size="lg" @click="templatesModalOpen = true">
              <Sparkles class="w-5 h-5" />
              <span>Готовые маршруты</span>
            </BaseButton>
            <RouterLink to="/explore">
              <BaseButton variant="outline" size="lg">
                <Globe2 class="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Выбрать страну на глобусе</span>
              </BaseButton>
            </RouterLink>
          </div>
        </template>
      </EmptyState>

      <!-- Recent Trips Section -->
      <section v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Последние поездки</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Быстрый доступ к недавно добавленным маршрутам
            </p>
          </div>

          <RouterLink to="/trips">
            <BaseButton variant="ghost" size="sm" class="text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
              <span>Все поездки</span>
              <ArrowRight class="w-4 h-4" />
            </BaseButton>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TripCard
            v-for="trip in tripStore.recentTrips"
            :key="trip.id"
            :trip="trip"
            @open="handleOpenTrip"
            @edit="handleEditTrip"
            @duplicate="promptDuplicateTrip"
            @delete="promptDeleteTrip"
          />
        </div>
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(tripToDelete)"
      title="Удалить поездку?"
      :message="`Вы действительно хотите удалить поездку «${tripToDelete?.title}»? Все связанные с ней мероприятия также будут безвозвратно удалены.`"
      confirmText="Да, удалить"
      :loading="isDeleting"
      @confirm="confirmDeleteTrip"
      @cancel="tripToDelete = null"
    />

    <DuplicateTripModal
      ref="duplicateModalRef"
      :open="Boolean(tripToDuplicate)"
      :trip="tripToDuplicate"
      :loading="isDuplicating"
      @close="tripToDuplicate = null"
      @submit="handleDuplicateSubmit"
    />

    <TripTemplatesModal
      :open="templatesModalOpen"
      @close="templatesModalOpen = false"
      @created="handleTemplateCreated"
    />
  </DashboardLayout>
</template>
