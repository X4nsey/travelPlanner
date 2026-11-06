<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  Plus,
  Compass,
  CalendarClock,
  Map,
  Heart,
  Globe2,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import type { Trip } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import TripCard from '@/components/trips/TripCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const authStore = useAuthStore();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();
const router = useRouter();

const tripToDelete = ref<Trip | null>(null);
const isDeleting = ref(false);

onMounted(() => {
  tripStore.fetchTrips().catch(() => {
    // Error handled in tripStore.listError
  });
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
        class="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-teal-600">
            Личный кабинет
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Здравствуйте, {{ authStore.user?.name }}!
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Управляйте своими маршрутами, исследуйте 3D-глобус и планируйте новые путешествия в одном месте.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <RouterLink to="/explore">
            <BaseButton variant="secondary" size="lg">
              <Globe2 class="w-5 h-5" />
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

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex items-center gap-4"
        >
          <div class="w-13 h-13 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 p-3.5">
            <Map class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Всего созданных поездок</p>
            <p class="text-3xl font-extrabold text-slate-900 mt-0.5">
              {{ tripStore.totalTripsCount }}
            </p>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex items-center gap-4"
        >
          <div class="w-13 h-13 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 p-3.5">
            <CalendarClock class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Предстоящих и текущих</p>
            <p class="text-3xl font-extrabold text-slate-900 mt-0.5">
              {{ tripStore.upcomingTripsCount }}
            </p>
          </div>
        </div>

        <RouterLink
          to="/favorites"
          class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex items-center justify-between gap-4 hover:border-teal-200 hover:shadow-card transition-all group"
        >
          <div class="flex items-center gap-4">
            <div class="w-13 h-13 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 p-3.5">
              <Heart class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Избранных стран</p>
              <p class="text-3xl font-extrabold text-slate-900 mt-0.5">
                {{ countryStore.favoriteSlugs.length }}
              </p>
            </div>
          </div>
          <ArrowRight class="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-colors" />
        </RouterLink>
      </div>

      <!-- Interactive World Banner -->
      <div
        class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div class="space-y-1.5 max-w-2xl">
          <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300">
            <Globe2 class="w-4 h-4" />
            <span>Интерактивный 3D-глобус и каталог стран мира</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold">
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
              class="!bg-teal-500 hover:!bg-teal-400 !text-slate-950 font-bold"
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
            <RouterLink to="/explore">
              <BaseButton variant="outline" size="lg">
                <Globe2 class="w-5 h-5 text-teal-600" />
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
            <h2 class="text-xl font-bold text-slate-900">Последние поездки</h2>
            <p class="text-xs sm:text-sm text-slate-500">
              Быстрый доступ к недавно добавленным маршрутам
            </p>
          </div>

          <RouterLink to="/trips">
            <BaseButton variant="ghost" size="sm" class="text-teal-700">
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
  </DashboardLayout>
</template>
