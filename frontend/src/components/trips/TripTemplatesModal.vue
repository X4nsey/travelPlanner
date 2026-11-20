<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  Sparkles,
  Tag,
  Wallet,
} from 'lucide-vue-next';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import { lookupIsoAlpha2ByCountryName } from '@/data/world-countries-meta';
import { getTripTypeLabelRu } from '@/constants/packing';
import {
  formatCurrency,
  formatDateRange,
  formatDaysLabel,
  getTodayIso,
  parseIsoDateParts,
} from '@/composables/useFormatters';
import type { Currency, EventCategory, Trip, TripTemplate, TripType } from '@/types';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import CountryFlag from '@/components/ui/CountryFlag.vue';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', trip: Trip): void;
}>();

const tripStore = useTripStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();

function resolveTemplateFlag(countryName: string) {
  const matched = countryStore.findCountryByQuery(countryName);
  return {
    code:
      matched?.isoAlpha2 ||
      matched?.flagEmoji ||
      lookupIsoAlpha2ByCountryName(countryName),
    flagUrl: matched?.flagUrl || null,
  };
}

const selectedTripType = ref<'ALL' | TripType>('ALL');
const selectedTemplateId = ref<string>('');
const activeDayOffset = ref<number>(0);

// Creation form fields
const startDate = ref(getTodayIso());
const customTitle = ref('');
const travelersCount = ref<number>(1);
const budget = ref<number>(0);
const currency = ref<Currency>('RUB');
const autoGeneratePacking = ref(true);
const autoSeedDocuments = ref(true);

const isCreating = ref(false);
const createError = ref<string | null>(null);

const EVENT_CATEGORY_META: Record<EventCategory, { label: string; badgeClass: string }> = {
  SIGHTSEEING: {
    label: 'Достопримечательности',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  },
  CULTURE: {
    label: 'Культура',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  FOOD: {
    label: 'Гастрономия',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  NATURE: {
    label: 'Природа',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  TRANSPORT: {
    label: 'Транспорт',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  },
  LEISURE: {
    label: 'Отдых',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  },
};

const currencyOptions = [
  { value: 'RUB', label: 'RUB (₽)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

const availableTripTypes = computed<TripType[]>(() => {
  const seen = new Set<TripType>();
  for (const tpl of tripStore.templates) {
    seen.add(tpl.tripType);
  }
  return Array.from(seen);
});

const filteredTemplates = computed<TripTemplate[]>(() => {
  if (selectedTripType.value === 'ALL') {
    return tripStore.templates;
  }
  return tripStore.templates.filter((t) => t.tripType === selectedTripType.value);
});

const selectedTemplate = computed<TripTemplate | null>(() => {
  if (filteredTemplates.value.length === 0) return null;
  const found = filteredTemplates.value.find((t) => t.id === selectedTemplateId.value);
  return found ?? filteredTemplates.value[0];
});

const dayOffsets = computed<number[]>(() => {
  if (!selectedTemplate.value) return [];
  return Array.from({ length: selectedTemplate.value.durationDays }, (_, idx) => idx);
});

const activeDayEvents = computed(() => {
  if (!selectedTemplate.value) return [];
  return selectedTemplate.value.events.filter((ev) => ev.dayOffset === activeDayOffset.value);
});

function addDaysIso(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const baseMs = parseIsoDateParts(dateStr).dateObj.getTime();
  return new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const computedEndDate = computed(() => {
  if (!selectedTemplate.value || !startDate.value) return '';
  return addDaysIso(startDate.value, selectedTemplate.value.durationDays - 1);
});

function syncFormFromTemplate(tpl: TripTemplate | null) {
  if (!tpl) return;
  activeDayOffset.value = 0;
  customTitle.value = tpl.title;
  budget.value = tpl.recommendedBudget;
  currency.value = tpl.currency;
  createError.value = null;
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    createError.value = null;
    startDate.value = getTodayIso();
    travelersCount.value = 1;
    autoGeneratePacking.value = true;
    autoSeedDocuments.value = true;

    try {
      countryStore.ensureCountriesLoaded().catch(() => {});
      const list = await tripStore.fetchTemplates();
      if (list.length > 0 && !selectedTemplateId.value) {
        selectedTemplateId.value = list[0].id;
      }
      syncFormFromTemplate(selectedTemplate.value);
    } catch {
      // Handled via tripStore.templatesError
    }
  },
  { immediate: true }
);

watch(filteredTemplates, (list) => {
  if (list.length > 0 && !list.some((t) => t.id === selectedTemplateId.value)) {
    selectedTemplateId.value = list[0].id;
  }
});

watch(selectedTemplate, (tpl) => {
  syncFormFromTemplate(tpl);
});

function selectTemplate(tpl: TripTemplate) {
  selectedTemplateId.value = tpl.id;
}

async function handleCreateFromTemplate() {
  if (!selectedTemplate.value) return;
  createError.value = null;

  if (!startDate.value || !/^\d{4}-\d{2}-\d{2}$/.test(startDate.value)) {
    createError.value = 'Укажите корректную дату начала поездки';
    return;
  }
  const travelers = Number(travelersCount.value);
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 100) {
    createError.value = 'Количество путешественников должно быть целым числом от 1 до 100';
    return;
  }
  const parsedBudget = Number(budget.value);
  if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
    createError.value = 'Укажите корректный бюджет поездки';
    return;
  }

  isCreating.value = true;
  try {
    const trimmedTitle = customTitle.value.trim();
    const res = await tripStore.createTripFromTemplate({
      templateId: selectedTemplate.value.id,
      startDate: startDate.value,
      ...(trimmedTitle.length >= 2 ? { title: trimmedTitle } : {}),
      travelersCount: travelers,
      budget: parsedBudget,
      currency: currency.value,
      autoGeneratePacking: autoGeneratePacking.value,
      autoSeedDocuments: autoSeedDocuments.value,
    });
    toastStore.success('Поездка создана по готовому маршруту');
    emit('created', res.trip);
    emit('close');
  } catch (err: any) {
    createError.value = err?.message || 'Не удалось создать поездку по шаблону';
  } finally {
    isCreating.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Библиотека готовых маршрутов"
    maxWidth="4xl"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <!-- Loading -->
      <BaseSpinner
        v-if="tripStore.isLoadingTemplates && tripStore.templates.length === 0"
        label="Загружаем кураторские маршруты..."
      />

      <!-- Error -->
      <div v-else-if="tripStore.templatesError && tripStore.templates.length === 0" class="space-y-3">
        <BaseAlert
          type="error"
          title="Не удалось загрузить готовые маршруты"
          :message="tripStore.templatesError"
        />
        <BaseButton variant="outline" @click="tripStore.fetchTemplates(true)">
          <RefreshCw class="w-4 h-4" />
          <span>Повторить</span>
        </BaseButton>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Filter Pills -->
        <div class="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="selectedTripType = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              selectedTripType === 'ALL'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300',
            ]"
          >
            Все маршруты ({{ tripStore.templates.length }})
          </button>

          <button
            v-for="tType in availableTripTypes"
            :key="tType"
            type="button"
            @click="selectedTripType = tType"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              selectedTripType === tType
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300',
            ]"
          >
            {{ getTripTypeLabelRu(tType) }}
          </button>
        </div>

        <!-- Two-Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- Left: Template List -->
          <div class="lg:col-span-5 space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
            <button
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              type="button"
              @click="selectTemplate(tpl)"
              :class="[
                'w-full text-left p-4 rounded-2xl border transition-colors duration-150',
                selectedTemplate?.id === tpl.id
                  ? 'bg-teal-50/70 dark:bg-teal-500/15 border-teal-400 dark:border-teal-500/60 shadow-sm ring-1 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-slate-50/70 dark:hover:bg-slate-800',
              ]"
            >
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <CountryFlag
                    v-if="resolveTemplateFlag(tpl.country).code || resolveTemplateFlag(tpl.country).flagUrl"
                    :code="resolveTemplateFlag(tpl.country).code"
                    :flagUrl="resolveTemplateFlag(tpl.country).flagUrl"
                    :name="tpl.country"
                    size="xs"
                  />
                  <MapPin v-else class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ tpl.country }}, {{ tpl.city }}</span>
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                  <Clock class="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  {{ formatDaysLabel(tpl.durationDays) }}
                </span>
              </div>

              <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
                {{ tpl.title }}
              </h4>

              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-md font-medium">
                  <Compass class="w-3 h-3" />
                  {{ getTripTypeLabelRu(tpl.tripType) }}
                </span>

                <span class="font-semibold text-slate-700 dark:text-slate-200">
                  ~ {{ formatCurrency(tpl.recommendedBudget, tpl.currency) }}
                </span>
              </div>
            </button>
          </div>

          <!-- Right: Template Details & Form -->
          <div
            v-if="selectedTemplate"
            class="lg:col-span-7 space-y-5 bg-slate-50/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5"
          >
            <!-- Template Overview -->
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 px-2.5 py-1 rounded-full">
                  <CountryFlag
                    v-if="resolveTemplateFlag(selectedTemplate.country).code || resolveTemplateFlag(selectedTemplate.country).flagUrl"
                    :code="resolveTemplateFlag(selectedTemplate.country).code"
                    :flagUrl="resolveTemplateFlag(selectedTemplate.country).flagUrl"
                    :name="selectedTemplate.country"
                    size="xs"
                  />
                  <MapPin v-else class="w-3.5 h-3.5" />
                  <span>{{ selectedTemplate.country }}, {{ selectedTemplate.city }}</span>
                </span>
                <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                  <Clock class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {{ formatDaysLabel(selectedTemplate.durationDays) }}
                </span>
                <span class="inline-flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-full">
                  Темп: {{ selectedTemplate.paceLabel }}
                </span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {{ selectedTemplate.title }}
              </h3>

              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {{ selectedTemplate.summary }}
              </p>

              <!-- Highlights -->
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                <li
                  v-for="(item, idx) in selectedTemplate.highlights"
                  :key="idx"
                  class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{{ item }}</span>
                </li>
              </ul>

              <!-- Tags -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  v-for="tag in selectedTemplate.tags"
                  :key="tag"
                  class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md"
                >
                  <Tag class="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Day-by-Day Program -->
            <div class="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Программа маршрута по дням
                </h4>
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  Событий: {{ selectedTemplate.events.length }}
                </span>
              </div>

              <!-- Day Tabs -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="offset in dayOffsets"
                  :key="offset"
                  type="button"
                  @click="activeDayOffset = offset"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                    activeDayOffset === offset
                      ? 'bg-slate-900 dark:bg-teal-600 text-white border-slate-900 dark:border-teal-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300',
                  ]"
                >
                  День {{ offset + 1 }}
                </button>
              </div>

              <!-- Events for Active Day -->
              <div class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                <div
                  v-for="(ev, idx) in activeDayEvents"
                  :key="idx"
                  class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3 space-y-1.5"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs font-bold text-teal-700 dark:text-teal-400">
                      {{ ev.startTime }} – {{ ev.endTime }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <span
                        :class="[
                          'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                          EVENT_CATEGORY_META[ev.category]?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                        ]"
                      >
                        {{ EVENT_CATEGORY_META[ev.category]?.label || ev.category }}
                      </span>
                      <span
                        v-if="ev.estimatedCost > 0"
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                      >
                        <Wallet class="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {{ formatCurrency(ev.estimatedCost, selectedTemplate.currency) }}
                      </span>
                    </div>
                  </div>

                  <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ ev.title }}</p>

                  <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin class="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{{ ev.location }}</span>
                  </p>

                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {{ ev.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Creation Parameters Form -->
            <form
              id="template-create-form"
              class="space-y-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80"
              novalidate
              @submit.prevent="handleCreateFromTemplate"
            >
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Параметры вашей поездки
              </h4>

              <BaseAlert v-if="createError" type="error" :message="createError" />

              <BaseInput
                v-model="customTitle"
                name="templateTripTitle"
                label="Название поездки"
                placeholder="Название маршрута"
                :disabled="isCreating"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                <BaseInput
                  v-model="startDate"
                  name="templateStartDate"
                  type="date"
                  label="Дата начала"
                  required
                  :disabled="isCreating"
                />

                <div class="rounded-xl bg-teal-50/80 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/30 px-3 py-2 text-xs text-teal-900 dark:text-teal-200">
                  <div class="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
                    <Calendar class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Даты поездки</span>
                  </div>
                  <p v-if="computedEndDate" class="mt-0.5 font-medium">
                    {{ formatDateRange(startDate, computedEndDate) }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <BaseInput
                  v-model="travelersCount"
                  name="templateTravelers"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  label="Участников"
                  required
                  :disabled="isCreating"
                />

                <BaseInput
                  v-model="budget"
                  name="templateBudget"
                  type="number"
                  min="0"
                  step="100"
                  label="Бюджет"
                  required
                  :disabled="isCreating"
                />

                <BaseSelect
                  v-model="currency"
                  name="templateCurrency"
                  label="Валюта"
                  :options="currencyOptions"
                  required
                  :disabled="isCreating"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors">
                  <input
                    v-model="autoGeneratePacking"
                    type="checkbox"
                    class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
                    :disabled="isCreating"
                  />
                  <span>Сгенерировать умный список вещей</span>
                </label>

                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors">
                  <input
                    v-model="autoSeedDocuments"
                    type="checkbox"
                    class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
                    :disabled="isCreating"
                  />
                  <span>Добавить базовый чек-лист документов</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <BaseButton variant="outline" :disabled="isCreating" @click="emit('close')">
        Закрыть
      </BaseButton>
      <BaseButton
        v-if="selectedTemplate"
        type="submit"
        form="template-create-form"
        variant="primary"
        :loading="isCreating"
      >
        <Sparkles class="w-4 h-4" />
        <span>Создать поездку по шаблону</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
