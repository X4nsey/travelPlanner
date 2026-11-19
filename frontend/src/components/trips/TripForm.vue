<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { CalendarDays, MapPin, Sparkles } from 'lucide-vue-next';
import { tripValidationSchema } from '@/schemas/validation';
import type { Trip, TripFormPayload, Currency, CountryData, TripType } from '@/types';
import { TRIP_TYPE_OPTIONS, normalizeTripType } from '@/constants/packing';
import { calculateInclusiveDays, formatDaysLabel, getTodayIso } from '@/composables/useFormatters';
import { useCountryStore } from '@/stores/country.store';
import CountrySelect from '@/components/countries/CountrySelect.vue';
import TripDestinationPreviewCard from '@/components/trips/TripDestinationPreviewCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const TripTemplatesModal = defineAsyncComponent(
  () => import('@/components/trips/TripTemplatesModal.vue')
);

interface Props {
  initialValues?: Partial<TripFormPayload>;
  loading?: boolean;
  serverError?: string | null;
  submitLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  serverError: null,
  submitLabel: 'Сохранить поездку',
});

const emit = defineEmits<{
  (e: 'submit', payload: TripFormPayload): void;
  (e: 'cancel'): void;
  (e: 'open-globe', currentDraft: Partial<TripFormPayload>): void;
}>();

const router = useRouter();
const countryStore = useCountryStore();
const defaultStart = getTodayIso();
const templatesModalOpen = ref(false);

function handleTemplateCreated(trip: Trip) {
  templatesModalOpen.value = false;
  router.push(`/trips/${trip.id}`);
}

const { handleSubmit, errors, setValues, setFieldError } = useForm({
  validationSchema: toTypedSchema(tripValidationSchema),
  initialValues: {
    title: props.initialValues?.title ?? '',
    country: props.initialValues?.country ?? '',
    city: props.initialValues?.city ?? '',
    startDate: props.initialValues?.startDate ?? defaultStart,
    endDate: props.initialValues?.endDate ?? defaultStart,
    travelersCount: props.initialValues?.travelersCount ?? 1,
    budget: props.initialValues?.budget ?? 0,
    currency: (props.initialValues?.currency ?? 'RUB') as Currency,
    tripType: (props.initialValues?.tripType ?? '') as TripType | '',
    description: props.initialValues?.description ?? '',
  },
});

watch(
  () => props.initialValues,
  (vals) => {
    if (vals) {
      setValues({
        title: vals.title ?? '',
        country: vals.country ?? '',
        city: vals.city ?? '',
        startDate: vals.startDate ?? defaultStart,
        endDate: vals.endDate ?? defaultStart,
        travelersCount: vals.travelersCount ?? 1,
        budget: vals.budget ?? 0,
        currency: (vals.currency ?? 'RUB') as Currency,
        tripType: (vals.tripType ?? '') as TripType | '',
        description: vals.description ?? '',
      });
    }
  },
  { deep: true }
);

const { value: title } = useField<string>('title');
const { value: country } = useField<string>('country');
const { value: city } = useField<string>('city');
const { value: startDate } = useField<string>('startDate');
const { value: endDate } = useField<string>('endDate');
const { value: travelersCount } = useField<number>('travelersCount');
const { value: budget } = useField<number>('budget');
const { value: currency } = useField<Currency>('currency');
const { value: tripType } = useField<TripType | '' | null>('tripType');
const { value: description } = useField<string>('description');

const tripTypeSelectValue = computed({
  get: () => (tripType.value ?? '') as string,
  set: (val: string) => {
    tripType.value = (val || '') as TripType | '';
  },
});

const tripTypeOptions = TRIP_TYPE_OPTIONS.map((opt) => ({
  value: opt.formValue,
  label: opt.label,
}));

const selectedCountryData = computed<CountryData | undefined>(() => {
  if (!country.value) return undefined;
  return countryStore.findCountryByQuery(country.value);
});

const suggestedCities = computed<string[]>(() => {
  const c = selectedCountryData.value;
  if (!c) return [];
  const names = new Set<string>();
  if (c.capital) names.add(c.capital);
  for (const item of c.popularCities || []) {
    if (item.name) names.add(item.name);
  }
  return Array.from(names).slice(0, 5);
});

function handleCountryObjectSelected(selected: CountryData | null) {
  if (!selected) return;
  if (!city.value && selected.capital) {
    city.value = selected.capital;
  }
}

function handleOpenGlobePicker() {
  emit('open-globe', {
    title: title.value ?? '',
    country: country.value ?? '',
    city: city.value ?? '',
    startDate: startDate.value ?? defaultStart,
    endDate: endDate.value ?? defaultStart,
    travelersCount: Number(travelersCount.value ?? 1),
    budget: Number(budget.value ?? 0),
    currency: (currency.value ?? 'RUB') as Currency,
    tripType: normalizeTripType(tripType.value),
    description: description.value ?? '',
  });
}

const currencyOptions = [
  { value: 'RUB', label: 'RUB (₽ — Российский рубль)' },
  { value: 'USD', label: 'USD ($ — Доллар США)' },
  { value: 'EUR', label: 'EUR (€ — Евро)' },
];

const previewDuration = computed(() => {
  if (!startDate.value || !endDate.value || endDate.value < startDate.value) {
    return null;
  }
  return calculateInclusiveDays(startDate.value, endDate.value);
});

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title.trim(),
    country: values.country.trim(),
    city: values.city.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    travelersCount: Number(values.travelersCount),
    budget: Number(values.budget),
    currency: values.currency as Currency,
    tripType: normalizeTripType(values.tripType),
    description: values.description?.trim() ?? '',
  });
});

defineExpose({
  setFieldError,
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6" novalidate>
    <div class="rounded-2xl bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-indigo-50/60 dark:from-teal-950/50 dark:via-slate-800/80 dark:to-slate-900 border border-teal-200/70 dark:border-teal-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles class="w-4 h-4" />
        </div>
        <div>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
            Не знаете, с чего начать? Выберите готовый маршрут
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Готовые кураторские программы по дням с умным списком вещей и чек-листом документов.
          </p>
        </div>
      </div>

      <BaseButton
        type="button"
        variant="secondary"
        size="sm"
        class="shrink-0"
        :disabled="loading"
        @click="templatesModalOpen = true"
      >
        <Sparkles class="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span>Готовые маршруты</span>
      </BaseButton>
    </div>

    <BaseAlert v-if="serverError" type="error" :message="serverError" />

    <div class="grid grid-cols-1 gap-5">
      <BaseInput
        v-model="title"
        name="title"
        label="Название поездки"
        placeholder="Например: Летний отпуск на Алтае или Выходные в Стамбуле"
        :error="errors.title"
        required
        :disabled="loading"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
      <CountrySelect
        v-model="country"
        label="Страна"
        :error="errors.country"
        required
        :disabled="loading"
        @select-country-object="handleCountryObjectSelected"
        @open-globe-picker="handleOpenGlobePicker"
      />

      <div class="space-y-2">
        <BaseInput
          v-model="city"
          name="city"
          label="Город или регион"
          placeholder="Например: Горно-Алтайск, Стамбул, Рим"
          :error="errors.city"
          required
          :disabled="loading"
        />

        <!-- Quick-pick popular cities for selected country -->
        <div v-if="suggestedCities.length > 0" class="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span class="text-[11px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1 mr-0.5">
            <MapPin class="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Популярные:
          </span>
          <button
            v-for="cityName in suggestedCities"
            :key="cityName"
            type="button"
            :disabled="loading"
            @click="city = cityName"
            :class="[
              'px-2 py-0.5 rounded-lg text-xs font-medium border transition-colors',
              city === cityName
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-500/15 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-200 dark:hover:border-teal-500/30',
            ]"
          >
            {{ cityName }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-1.5">
      <BaseSelect
        v-model="tripTypeSelectValue"
        name="tripType"
        label="Тип поездки"
        :options="tripTypeOptions"
        :error="errors.tripType"
        :disabled="loading"
      />
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Тип поездки помогает точнее сформировать список вещей. Если тип не указан, система попробует определить его автоматически.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <BaseInput
        v-model="startDate"
        name="startDate"
        type="date"
        label="Дата начала"
        :error="errors.startDate"
        required
        :disabled="loading"
      />

      <BaseInput
        v-model="endDate"
        name="endDate"
        type="date"
        label="Дата окончания"
        :min="startDate"
        :error="errors.endDate"
        required
        :disabled="loading"
      />
    </div>

    <div
      v-if="previewDuration"
      class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-teal-50/70 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-sm"
    >
      <CalendarDays class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
      <span>
        Продолжительность поездки: <strong>{{ formatDaysLabel(previewDuration) }}</strong> (включая день начала и окончания)
      </span>
    </div>

    <TripDestinationPreviewCard
      :country="country || ''"
      :city="city || ''"
      :startDate="startDate || ''"
      :endDate="endDate || ''"
    />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <BaseInput
        v-model="travelersCount"
        name="travelersCount"
        type="number"
        min="1"
        max="100"
        step="1"
        label="Путешественников"
        :error="errors.travelersCount"
        required
        :disabled="loading"
      />

      <BaseInput
        v-model="budget"
        name="budget"
        type="number"
        min="0"
        step="100"
        label="Планируемый бюджет"
        placeholder="0"
        :error="errors.budget"
        required
        :disabled="loading"
      />

      <BaseSelect
        v-model="currency"
        name="currency"
        label="Валюта бюджета"
        :options="currencyOptions"
        :error="errors.currency"
        required
        :disabled="loading"
      />
    </div>

    <BaseTextarea
      v-model="description"
      name="description"
      label="Описание поездки"
      placeholder="Опишите цели поездки, идеи мест для посещения, важные детали или пожелания..."
      :rows="4"
      :error="errors.description"
      :disabled="loading"
    />

    <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
      <BaseButton
        type="button"
        variant="outline"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Отмена
      </BaseButton>

      <BaseButton
        type="submit"
        variant="primary"
        :loading="loading"
      >
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>

  <TripTemplatesModal
    :open="templatesModalOpen"
    @close="templatesModalOpen = false"
    @created="handleTemplateCreated"
  />
</template>
