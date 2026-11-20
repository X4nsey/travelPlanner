<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import {
  BookOpen,
  Check,
  Download,
  Eye,
  FileSpreadsheet,
  Info,
  ListChecks,
  Loader2,
  Printer,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-vue-next';
import {
  ORDERED_GUIDE_PRESETS,
  getDefaultGuideSections,
  type CountryData,
  type CountryTravelInfo,
  type GuideCalendarDay,
  type GuidePreset,
  type GuideSectionsConfig,
  type ItineraryEvent,
  type PackingItem,
  type PackingSummary,
  type Trip,
  type TripDocumentDto,
  type TripDocumentsSummaryDto,
  type TripExpense,
  type TripExpenseSummary,
  type TripGuideDataPayload,
  type TripWeatherResponseDto,
} from '@/types';
import { formatCurrency } from '@/composables/useFormatters';
import { useToastStore } from '@/stores/toast.store';
import {
  buildTripGuideFilename,
  buildTripGuideHtml,
  downloadTripGuideHtml,
  printTripGuideToPdf,
} from '@/utils/tripGuideGenerator';
import BaseButton from '@/components/ui/BaseButton.vue';

export type GuideReloadableSection = 'expenses' | 'packing' | 'documents' | 'weather' | 'travelInfo';

interface Props {
  open: boolean;
  trip: Trip;
  calendarDays: GuideCalendarDay[];
  eventsByDate: Record<string, ItineraryEvent[]>;
  totalEstimatedEventsCost: number;
  expenses: TripExpense[];
  expenseSummary: TripExpenseSummary | null;
  packingItems: PackingItem[];
  packingSummary: PackingSummary | null;
  documents?: TripDocumentDto[];
  documentsSummary?: TripDocumentsSummaryDto | null;
  weather: TripWeatherResponseDto | null;
  matchedCountry: CountryData | null;
  travelInfo: CountryTravelInfo | null;
  loadingStates?: {
    expenses?: boolean;
    packing?: boolean;
    documents?: boolean;
    weather?: boolean;
    travelInfo?: boolean;
  };
  errorStates?: {
    expenses?: string | null;
    packing?: string | null;
    documents?: string | null;
    weather?: string | null;
    travelInfo?: string | null;
  };
}

const props = withDefaults(defineProps<Props>(), {
  documents: () => [],
  documentsSummary: null,
  loadingStates: () => ({}),
  errorStates: () => ({}),
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'reload-section', section: GuideReloadableSection): void;
}>();

const toastStore = useToastStore();

const GUIDE_PREFS_STORAGE_KEY = 'travelplanner.guideExportPrefs.v1';
const VALID_PRESETS: readonly GuidePreset[] = ['guidebook', 'compact', 'detailed'];
const SECTION_KEYS: readonly (keyof GuideSectionsConfig)[] = [
  'includeCoverPhoto',
  'includeOverviewAndNotes',
  'includeWeather',
  'includeItinerary',
  'includeAllCalendarDays',
  'includeBudgetSummary',
  'includeExpensesTable',
  'includePackingList',
  'onlyUnpackedItems',
  'includeDocuments',
  'includeCountryInfo',
];

function createDefaultSectionsByPreset(): Record<GuidePreset, GuideSectionsConfig> {
  return {
    guidebook: getDefaultGuideSections('guidebook'),
    compact: getDefaultGuideSections('compact'),
    detailed: getDefaultGuideSections('detailed'),
  };
}

function isValidPreset(value: unknown): value is GuidePreset {
  return typeof value === 'string' && (VALID_PRESETS as readonly string[]).includes(value);
}

function sanitizeStoredSections(raw: unknown, preset: GuidePreset): GuideSectionsConfig {
  const defaults = getDefaultGuideSections(preset);
  if (!raw || typeof raw !== 'object') return defaults;

  const candidate = raw as Record<string, unknown>;
  for (const key of SECTION_KEYS) {
    if (typeof candidate[key] === 'boolean') {
      defaults[key] = candidate[key] as boolean;
    }
  }
  return defaults;
}

function loadStoredGuidePreferences(): {
  activePreset: GuidePreset;
  sectionsByPreset: Record<GuidePreset, GuideSectionsConfig>;
} {
  const fallback = {
    activePreset: 'guidebook' as GuidePreset,
    sectionsByPreset: createDefaultSectionsByPreset(),
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(GUIDE_PREFS_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as {
      activePreset?: unknown;
      sectionsByPreset?: Record<string, unknown>;
    };

    const nextPreset = isValidPreset(parsed?.activePreset)
      ? parsed.activePreset
      : fallback.activePreset;

    const rawMap =
      parsed?.sectionsByPreset && typeof parsed.sectionsByPreset === 'object'
        ? parsed.sectionsByPreset
        : {};

    return {
      activePreset: nextPreset,
      sectionsByPreset: {
        guidebook: sanitizeStoredSections(rawMap.guidebook, 'guidebook'),
        compact: sanitizeStoredSections(rawMap.compact, 'compact'),
        detailed: sanitizeStoredSections(rawMap.detailed, 'detailed'),
      },
    };
  } catch {
    return fallback;
  }
}

function saveGuidePreferences(
  preset: GuidePreset,
  map: Record<GuidePreset, GuideSectionsConfig>
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      GUIDE_PREFS_STORAGE_KEY,
      JSON.stringify({
        activePreset: preset,
        sectionsByPreset: {
          guidebook: { ...map.guidebook },
          compact: { ...map.compact },
          detailed: { ...map.detailed },
        },
      })
    );
  } catch {
    // Ignore storage quota or private-mode access errors
  }
}

const initialPrefs = loadStoredGuidePreferences();
const activePreset = ref<GuidePreset>(initialPrefs.activePreset);
const sectionsByPreset = reactive<Record<GuidePreset, GuideSectionsConfig>>(
  initialPrefs.sectionsByPreset
);
const activeSections = computed(() => sectionsByPreset[activePreset.value]);
const isPrinting = ref(false);
const printError = ref<string | null>(null);

const presetIcons: Record<GuidePreset, typeof BookOpen> = {
  guidebook: BookOpen,
  compact: ListChecks,
  detailed: FileSpreadsheet,
};

function selectPreset(preset: GuidePreset) {
  activePreset.value = preset;
}

function resetToPresetDefaults() {
  Object.assign(
    sectionsByPreset[activePreset.value],
    getDefaultGuideSections(activePreset.value)
  );
}

const isCustomizedFromPreset = computed(() => {
  const defaults = getDefaultGuideSections(activePreset.value);
  const current = activeSections.value;
  return SECTION_KEYS.some((key) => current[key] !== defaults[key]);
});

watch(
  [activePreset, sectionsByPreset],
  () => {
    saveGuidePreferences(activePreset.value, sectionsByPreset);
  },
  { deep: true }
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      printError.value = null;
    }
  }
);

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !isPrinting.value) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const totalEventsCount = computed(() => (props.trip.events || []).length);

const packingTotals = computed(() => {
  if (props.packingSummary && (props.packingSummary.total > 0 || props.packingItems.length === 0)) {
    return {
      total: props.packingSummary.total,
      packed: props.packingSummary.packed,
      unpacked: props.packingSummary.unpacked,
    };
  }
  const total = props.packingItems.length;
  const packed = props.packingItems.filter((item) => item.isPacked).length;
  return { total, packed, unpacked: total - packed };
});

const documentsTotals = computed(() => {
  if (props.documentsSummary && (props.documentsSummary.totalCount > 0 || props.documents.length === 0)) {
    return {
      totalCount: props.documentsSummary.totalCount,
      readyCount: props.documentsSummary.readyCount,
    };
  }
  const totalCount = props.documents.length;
  const readyCount = props.documents.filter((d) => d.status === 'READY').length;
  return { totalCount, readyCount };
});

const anySectionLoading = computed(() =>
  Boolean(
    props.loadingStates.weather ||
      props.loadingStates.packing ||
      props.loadingStates.documents ||
      props.loadingStates.expenses ||
      props.loadingStates.travelInfo
  )
);

const loadingLabels = computed(() => {
  const labels: string[] = [];
  if (props.loadingStates.weather) labels.push('погода');
  if (props.loadingStates.packing) labels.push('список вещей');
  if (props.loadingStates.documents) labels.push('брони и документы');
  if (props.loadingStates.expenses) labels.push('расходы');
  if (props.loadingStates.travelInfo) labels.push('памятка о стране');
  return labels.join(', ');
});

const activeSectionsCount = computed(() => {
  const current = activeSections.value;
  let count = 0;
  if (current.includeCoverPhoto) count += 1;
  if (current.includeOverviewAndNotes) count += 1;
  if (current.includeWeather) count += 1;
  if (current.includeItinerary) count += 1;
  if (current.includeBudgetSummary || current.includeExpensesTable) count += 1;
  if (current.includePackingList) count += 1;
  if (current.includeDocuments) count += 1;
  if (current.includeCountryInfo) count += 1;
  return count;
});

const guidePayload = computed<TripGuideDataPayload>(() => ({
  trip: props.trip,
  calendarDays: props.calendarDays,
  eventsByDate: props.eventsByDate,
  totalEstimatedEventsCost: props.totalEstimatedEventsCost,
  expenses: props.expenses,
  expenseSummary: props.expenseSummary,
  packingItems: props.packingItems,
  packingSummary: props.packingSummary,
  documents: props.documents,
  documentsSummary: props.documentsSummary,
  weather: props.weather,
  matchedCountry: props.matchedCountry,
  travelInfo: props.travelInfo,
}));

const previewHtml = computed(() => {
  if (!props.open) return '';
  return buildTripGuideHtml(guidePayload.value, {
    preset: activePreset.value,
    sections: { ...activeSections.value },
    includeToolbar: false,
  });
});

async function handlePrintPdf() {
  if (isPrinting.value) return;
  printError.value = null;
  isPrinting.value = true;

  try {
    const printableHtml = buildTripGuideHtml(guidePayload.value, {
      preset: activePreset.value,
      sections: { ...activeSections.value },
      includeToolbar: false,
    });
    await printTripGuideToPdf(printableHtml);
    toastStore.info(
      'Окно печати открыто',
      'Выберите принтер «Сохранить как PDF», чтобы сохранить файл на устройство.'
    );
  } catch (err: any) {
    printError.value = err?.message || 'Не удалось подготовить документ к печати';
    toastStore.error('Ошибка печати', printError.value || 'Попробуйте скачать HTML-файл');
  } finally {
    isPrinting.value = false;
  }
}

function handleDownloadHtml() {
  const standaloneHtml = buildTripGuideHtml(guidePayload.value, {
    preset: activePreset.value,
    sections: { ...activeSections.value },
    includeToolbar: true,
  });
  const filename = buildTripGuideFilename(props.trip);
  downloadTripGuideHtml(standaloneHtml, filename, props.trip.title);
  toastStore.success('Офлайн-путеводитель скачан', `Файл «${filename}» готов к просмотру без интернета.`);
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-sm"
        @click.self="!isPrinting && emit('close')"
      >
        <div
          class="relative w-full max-w-6xl h-[94vh] lg:h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-export-modal-title"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2
                  id="guide-export-modal-title"
                  class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate"
                >
                  Конструктор путеводителя и экспорт в PDF
                </h2>
                <span class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-500/30">
                  A4
                </span>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ trip.title }} · {{ trip.country }}, {{ trip.city }}
              </p>
            </div>

            <button
              type="button"
              :disabled="isPrinting"
              @click="emit('close')"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              aria-label="Закрыть конструктор путеводителя"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Two-Column Workspace -->
          <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <!-- Left Panel: Presets & Section Toggles -->
            <aside class="lg:col-span-5 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 overflow-y-auto p-4 sm:p-5 space-y-5 max-h-[44vh] lg:max-h-none">
              <!-- Live Loading Notice -->
              <div
                v-if="anySectionLoading"
                class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200/80 dark:border-sky-500/30 text-xs text-sky-900 dark:text-sky-200"
              >
                <Loader2 class="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
                <span>Догружаются данные: <strong>{{ loadingLabels }}</strong>…</span>
              </div>

              <div
                v-if="printError"
                class="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-200"
              >
                {{ printError }}
              </div>

              <!-- Presets Selector -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    1. Формат путеводителя
                  </h3>
                  <button
                    v-if="isCustomizedFromPreset"
                    type="button"
                    @click="resetToPresetDefaults"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                  >
                    <RotateCcw class="w-3 h-3" />
                    <span>Сбросить по умолчанию</span>
                  </button>
                </div>

                <div class="space-y-2">
                  <button
                    v-for="preset in ORDERED_GUIDE_PRESETS"
                    :key="preset.id"
                    type="button"
                    @click="selectPreset(preset.id)"
                    :class="[
                      'w-full text-left p-3 rounded-xl border transition-colors flex items-start gap-3',
                      activePreset === preset.id
                        ? 'bg-white dark:bg-slate-800 border-teal-500 ring-2 ring-teal-500/15 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800',
                    ]"
                  >
                    <div
                      :class="[
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        activePreset === preset.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300',
                      ]"
                    >
                      <component :is="presetIcons[preset.id]" class="w-4 h-4" />
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {{ preset.title }}
                        </span>
                        <span
                          :class="[
                            'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                            activePreset === preset.id
                              ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                          ]"
                        >
                          {{ preset.badge }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {{ preset.description }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Section Checkboxes -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    2. Разделы документа
                  </h3>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Выбрано: {{ activeSectionsCount }}
                  </span>
                </div>

                <div class="bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/80">
                  <!-- Cover Photo -->
                  <label class="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <input
                      v-model="activeSections.includeCoverPhoto"
                      type="checkbox"
                      class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Обложка с фото направления</span>
                        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {{ matchedCountry?.coverPhoto?.url ? 'Фото готово' : 'Градиент' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-400 dark:text-slate-400">
                        Баннер с названием, флагом и паспортом поездки
                      </p>
                    </div>
                  </label>

                  <!-- Overview & Notes -->
                  <label class="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <input
                      v-model="activeSections.includeOverviewAndNotes"
                      type="checkbox"
                      class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Обзор и заметки</span>
                        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {{ trip.description?.trim() ? 'Есть текст' : 'KPI плана' }}
                        </span>
                      </div>
                    </div>
                  </label>

                  <!-- Weather -->
                  <div class="p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includeWeather"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Погода</span>
                          <span
                            v-if="loadingStates.weather"
                            class="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium"
                          >
                            <Loader2 class="w-3 h-3 animate-spin" />
                            Загрузка
                          </span>
                          <span
                            v-else-if="weather"
                            class="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-full"
                          >
                            {{ weather.daily.length }} дн.
                          </span>
                          <span v-else class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            Нет данных
                          </span>
                        </div>
                        <div
                          v-if="!loadingStates.weather && (!weather || errorStates.weather)"
                          class="mt-1.5 flex items-center justify-between gap-2"
                        >
                          <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {{ errorStates.weather || 'Прогноз не загружен' }}
                          </span>
                          <button
                            type="button"
                            @click.prevent="emit('reload-section', 'weather')"
                            class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                          >
                            <RefreshCw class="w-3 h-3" />
                            Догрузить
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>

                  <!-- Itinerary -->
                  <div class="p-3 space-y-2 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includeItinerary"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">План поездки</span>
                          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {{ totalEventsCount }} событий
                          </span>
                        </div>
                      </div>
                    </label>

                    <label
                      :class="[
                        'flex items-center gap-2.5 pl-7 text-xs',
                        activeSections.includeItinerary ? 'cursor-pointer text-slate-600 dark:text-slate-300' : 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500',
                      ]"
                    >
                      <input
                        v-model="activeSections.includeAllCalendarDays"
                        :disabled="!activeSections.includeItinerary"
                        type="checkbox"
                        class="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Включать свободные дни без событий ({{ calendarDays.length }} дн.)</span>
                    </label>
                  </div>

                  <!-- Budget & Expenses -->
                  <div class="p-3 space-y-2 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includeBudgetSummary"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Бюджет и категории</span>
                          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {{ formatCurrency(expenseSummary?.totalSpent ?? 0, trip.currency) }}
                          </span>
                        </div>
                      </div>
                    </label>

                    <label class="flex items-center justify-between gap-2 pl-7 text-xs cursor-pointer text-slate-600 dark:text-slate-300">
                      <span class="inline-flex items-center gap-2.5">
                        <input
                          v-model="activeSections.includeExpensesTable"
                          type="checkbox"
                          class="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Детальная таблица расходов</span>
                      </span>
                      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {{ expenses.length }} записей
                      </span>
                    </label>

                    <div
                      v-if="!loadingStates.expenses && errorStates.expenses"
                      class="pl-7 flex items-center justify-between gap-2"
                    >
                      <span class="text-[11px] text-rose-600 dark:text-rose-400 truncate">{{ errorStates.expenses }}</span>
                      <button
                        type="button"
                        @click.prevent="emit('reload-section', 'expenses')"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                      >
                        <RefreshCw class="w-3 h-3" />
                        Повторить
                      </button>
                    </div>
                  </div>

                  <!-- Packing List -->
                  <div class="p-3 space-y-2 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includePackingList"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Список вещей</span>
                          <span
                            v-if="loadingStates.packing"
                            class="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium"
                          >
                            <Loader2 class="w-3 h-3 animate-spin" />
                            Загрузка
                          </span>
                          <span
                            v-else
                            class="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-full"
                          >
                            {{ packingTotals.packed }}/{{ packingTotals.total }}
                          </span>
                        </div>
                      </div>
                    </label>

                    <label
                      :class="[
                        'flex items-center gap-2.5 pl-7 text-xs',
                        activeSections.includePackingList ? 'cursor-pointer text-slate-600 dark:text-slate-300' : 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500',
                      ]"
                    >
                      <input
                        v-model="activeSections.onlyUnpackedItems"
                        :disabled="!activeSections.includePackingList"
                        type="checkbox"
                        class="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Только несобранные вещи (осталось {{ packingTotals.unpacked }})</span>
                    </label>

                    <div
                      v-if="!loadingStates.packing && errorStates.packing"
                      class="pl-7 flex items-center justify-between gap-2"
                    >
                      <span class="text-[11px] text-rose-600 dark:text-rose-400 truncate">{{ errorStates.packing }}</span>
                      <button
                        type="button"
                        @click.prevent="emit('reload-section', 'packing')"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                      >
                        <RefreshCw class="w-3 h-3" />
                        Повторить
                      </button>
                    </div>
                  </div>

                  <!-- Documents & Bookings -->
                  <div class="p-3 space-y-2 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includeDocuments"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Брони и чек-лист документов</span>
                          <span
                            v-if="loadingStates.documents"
                            class="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium"
                          >
                            <Loader2 class="w-3 h-3 animate-spin" />
                            Загрузка
                          </span>
                          <span
                            v-else
                            class="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-full"
                          >
                            {{ documentsTotals.readyCount }}/{{ documentsTotals.totalCount }}
                          </span>
                        </div>
                      </div>
                    </label>

                    <div
                      v-if="!loadingStates.documents && errorStates.documents"
                      class="pl-7 flex items-center justify-between gap-2"
                    >
                      <span class="text-[11px] text-rose-600 dark:text-rose-400 truncate">{{ errorStates.documents }}</span>
                      <button
                        type="button"
                        @click.prevent="emit('reload-section', 'documents')"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                      >
                        <RefreshCw class="w-3 h-3" />
                        Повторить
                      </button>
                    </div>
                  </div>

                  <!-- Country Travel Info -->
                  <div class="p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="activeSections.includeCountryInfo"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Памятка о стране</span>
                          <span
                            v-if="loadingStates.travelInfo"
                            class="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium"
                          >
                            <Loader2 class="w-3 h-3 animate-spin" />
                            Загрузка
                          </span>
                          <span
                            v-else-if="travelInfo"
                            class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full"
                          >
                            <Check class="w-3 h-3" />
                            7 разделов
                          </span>
                          <span v-else class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {{ matchedCountry ? 'Нет текста' : 'Не в каталоге' }}
                          </span>
                        </div>

                        <div
                          v-if="!loadingStates.travelInfo && matchedCountry && (!travelInfo || errorStates.travelInfo)"
                          class="mt-1.5 flex items-center justify-between gap-2"
                        >
                          <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {{ errorStates.travelInfo || 'Памятка не загружена' }}
                          </span>
                          <button
                            type="button"
                            @click.prevent="emit('reload-section', 'travelInfo')"
                            class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                          >
                            <RefreshCw class="w-3 h-3" />
                            Догрузить
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Right Panel: Live Preview Iframe -->
            <section class="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 bg-slate-200/70 dark:bg-slate-950">
              <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shrink-0">
                <div class="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Eye class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Предпросмотр путеводителя</span>
                </div>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Формат печати: A4 · поля 12 мм · цветная графика включена
                </span>
              </div>

              <div class="flex-1 min-h-[260px] p-2 sm:p-4 overflow-hidden">
                <iframe
                  :srcdoc="previewHtml"
                  title="Предпросмотр персонального путеводителя"
                  sandbox=""
                  class="w-full h-full rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white shadow-inner"
                />
              </div>
            </section>
          </div>

          <!-- Modal Footer -->
          <div class="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Info class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>В открывшемся окне выберите принтер «Сохранить как PDF».</span>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
              <BaseButton
                variant="outline"
                size="md"
                :disabled="isPrinting"
                @click="handleDownloadHtml"
              >
                <Download class="w-4 h-4" />
                <span>Скачать офлайн-путеводитель (.html)</span>
              </BaseButton>

              <BaseButton
                variant="primary"
                size="md"
                :loading="isPrinting"
                @click="handlePrintPdf"
              >
                <Printer v-if="!isPrinting" class="w-4 h-4" />
                <span>Сохранить в PDF (A4)</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
