<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import type { TripFormPayload, Currency } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import TripForm from '@/components/trips/TripForm.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();

const tripId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => Boolean(tripId.value));

const isSubmitting = ref(false);
const serverError = ref<string | null>(null);
const loadError = ref<string | null>(null);
const initialFormValues = ref<Partial<TripFormPayload> | undefined>(undefined);

onMounted(async () => {
  await countryStore.ensureCountriesLoaded().catch(() => {});

  const { draft } = countryStore.consumeTripPickerDraft();
  const queryTitle = typeof route.query.title === 'string' ? route.query.title.trim() : '';
  const queryCountry = typeof route.query.country === 'string' ? route.query.country.trim() : '';
  const queryCity = typeof route.query.city === 'string' ? route.query.city.trim() : '';
  const queryBudget =
    typeof route.query.budget === 'string' && !isNaN(Number(route.query.budget))
      ? Number(route.query.budget)
      : undefined;
  const queryDescription =
    typeof route.query.description === 'string' ? route.query.description.trim() : '';
  const queryCurrency =
    typeof route.query.currency === 'string' &&
    ['RUB', 'USD', 'EUR'].includes(route.query.currency)
      ? (route.query.currency as Currency)
      : undefined;

  if (isEditMode.value && tripId.value) {
    try {
      const trip = await tripStore.fetchTripById(tripId.value);
      const baseValues: Partial<TripFormPayload> = {
        title: trip.title,
        country: trip.country,
        city: trip.city,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelersCount: trip.travelersCount,
        budget: trip.budget,
        currency: trip.currency,
        description: trip.description,
        ...(draft || {}),
      };

      if (queryTitle) {
        baseValues.title = queryTitle;
      }
      if (queryCountry) {
        baseValues.country = queryCountry;
      }
      if (queryCity) {
        baseValues.city = queryCity;
      }
      if (queryBudget !== undefined) {
        baseValues.budget = queryBudget;
      }
      if (queryCurrency) {
        baseValues.currency = queryCurrency;
      }
      if (queryDescription) {
        baseValues.description = queryDescription;
      }

      initialFormValues.value = baseValues;
    } catch (err: any) {
      loadError.value = err?.message || 'Не удалось загрузить поездку для редактирования';
    }
  } else {
    const baseValues: Partial<TripFormPayload> = {
      ...(draft || {}),
    };

    if (queryCountry) {
      baseValues.country = queryCountry;
    }

    const matchedCountry = baseValues.country
      ? countryStore.findCountryByQuery(baseValues.country)
      : undefined;

    if (queryCity) {
      baseValues.city = queryCity;
    } else if (!baseValues.city && matchedCountry?.capital) {
      baseValues.city = matchedCountry.capital;
    }

    if (queryCurrency) {
      baseValues.currency = queryCurrency;
    } else if (!baseValues.currency && matchedCountry?.defaultTripCurrency) {
      baseValues.currency = matchedCountry.defaultTripCurrency;
    }

    if (queryTitle) {
      baseValues.title = queryTitle;
    } else if (!baseValues.title && baseValues.country) {
      baseValues.title = `Путешествие: ${baseValues.country}`;
    }

    if (queryBudget !== undefined) {
      baseValues.budget = queryBudget;
    }

    if (queryDescription) {
      baseValues.description = queryDescription;
    }

    if (Object.keys(baseValues).length > 0) {
      initialFormValues.value = baseValues;
    }
  }
});

function handleOpenGlobe(currentDraft: Partial<TripFormPayload>) {
  countryStore.setTripPickerDraft(currentDraft, route.path);
  router.push({
    path: '/explore',
    query: {
      mode: 'pick',
      returnTo: route.path,
      ...(currentDraft.country ? { country: currentDraft.country } : {}),
    },
  });
}

async function handleSubmit(payload: TripFormPayload) {
  isSubmitting.value = true;
  serverError.value = null;

  try {
    if (isEditMode.value && tripId.value) {
      const res = await tripStore.updateTrip(tripId.value, payload);
      toastStore.success('Поездка успешно обновлена');
      router.push(`/trips/${res.trip.id}`);
    } else {
      const res = await tripStore.createTrip(payload);
      toastStore.success('Поездка успешно создана');
      router.push(`/trips/${res.trip.id}`);
    }
  } catch (err: any) {
    serverError.value = err?.message || 'Произошла ошибка при сохранении поездки';
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  if (isEditMode.value && tripId.value) {
    router.push(`/trips/${tripId.value}`);
  } else {
    router.push('/trips');
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <!-- Back link & Title -->
      <div>
        <button
          type="button"
          @click="handleCancel"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>{{ isEditMode ? 'Назад к поездке' : 'Назад к списку поездок' }}</span>
        </button>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {{ isEditMode ? 'Редактирование поездки' : 'Создание новой поездки' }}
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          {{
            isEditMode
              ? 'Обновите параметры маршрута, даты, бюджет или описание поездки.'
              : 'Заполните основную информацию о будущем путешествии или выберите страну на интерактивном 3D-глобусе.'
          }}
        </p>
      </div>

      <!-- Loading state in Edit Mode -->
      <BaseSpinner
        v-if="isEditMode && tripStore.isLoadingDetail"
        label="Загружаем данные поездки..."
      />

      <!-- Load Error in Edit Mode -->
      <div v-else-if="loadError" class="space-y-4">
        <BaseAlert type="error" title="Ошибка доступа или загрузки" :message="loadError" />
        <BaseButton variant="outline" @click="router.push('/trips')">
          Вернуться к списку поездок
        </BaseButton>
      </div>

      <!-- Form Card -->
      <div
        v-else
        class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8"
      >
        <TripForm
          :initialValues="initialFormValues"
          :loading="isSubmitting"
          :serverError="serverError"
          :submitLabel="isEditMode ? 'Сохранить изменения' : 'Создать поездку'"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @open-globe="handleOpenGlobe"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
