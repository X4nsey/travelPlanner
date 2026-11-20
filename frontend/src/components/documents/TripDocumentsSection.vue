<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  HardDrive,
  Hotel,
  IdCard,
  Laptop,
  Lock,
  Paperclip,
  Pencil,
  Plane,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  StickyNote,
  Ticket,
  Trash2,
  Upload,
} from 'lucide-vue-next';
import type { DocumentCategory, DocumentStatus, TripDocumentItem } from '@/types';
import {
  ORDERED_DOCUMENT_CATEGORIES,
  ORDERED_DOCUMENT_STATUSES,
  getDocumentCategoryMeta,
  getDocumentStatusMeta,
} from '@/constants/documents';
import { formatDateRange, formatRussianDate } from '@/composables/useFormatters';
import {
  formatAttachmentFileSize,
  getLocalAttachment,
  validateLocalAttachmentFile,
} from '@/utils/localDocumentVault';
import { useDocumentStore } from '@/stores/document.store';
import { useToastStore } from '@/stores/toast.store';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import DocumentFormModal from './DocumentFormModal.vue';
import DocumentAttachmentPreviewModal from './DocumentAttachmentPreviewModal.vue';

interface Props {
  tripId: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

const props = defineProps<Props>();

const documentStore = useDocumentStore();
const toastStore = useToastStore();

const selectedStatusFilter = ref<'ALL' | DocumentStatus>('ALL');
const selectedCategoryFilter = ref<'ALL' | DocumentCategory>('ALL');

const formModalOpen = ref(false);
const editingDocument = ref<TripDocumentItem | null>(null);

const previewModalOpen = ref(false);
const previewDocument = ref<TripDocumentItem | null>(null);

const documentToDelete = ref<TripDocumentItem | null>(null);
const isDeletingDocument = ref(false);

const documentToDetach = ref<TripDocumentItem | null>(null);
const isDetachingFile = ref(false);

const copiedDocumentId = ref<string | null>(null);
let copyResetTimer: number | null = null;

const quickAttachInputRef = ref<HTMLInputElement | null>(null);
const quickAttachTargetDoc = ref<TripDocumentItem | null>(null);

const documents = computed(() => documentStore.getDocuments(props.tripId));
const summary = computed(() => documentStore.getSummary(props.tripId));
const isLoading = computed(() => documentStore.isLoading(props.tripId));
const isSeeding = computed(() => documentStore.isSeeding(props.tripId));
const hasLoaded = computed(() => documentStore.hasLoaded(props.tripId));
const storeError = computed(() => documentStore.getError(props.tripId));

const localFilesCount = computed(
  () => documents.value.filter((doc) => doc.hasLocalFileOnDevice).length
);

const showInitialLoading = computed(() => isLoading.value && !hasLoaded.value);

const isComplete = computed(
  () => summary.value.totalCount > 0 && summary.value.readyCount === summary.value.totalCount
);

const formattedReadinessPercentage = computed(() => {
  const val = summary.value.readinessPercentage;
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
});

const barWidthStyle = computed(() => {
  const clamped = Math.min(100, Math.max(0, summary.value.readinessPercentage));
  return `${clamped}%`;
});

const categoryCountsMap = computed(() => {
  const map: Record<DocumentCategory, number> = {
    FLIGHT_TICKET: 0,
    HOTEL_BOOKING: 0,
    INSURANCE: 0,
    VISA_PASSPORT: 0,
    EXCURSION_TICKET: 0,
    RENTAL_TRANSFER: 0,
    OTHER: 0,
  };
  for (const doc of documents.value) {
    map[doc.category] = (map[doc.category] || 0) + 1;
  }
  return map;
});

const visibleCategoryFilters = computed(() =>
  ORDERED_DOCUMENT_CATEGORIES.filter(
    (cat) => categoryCountsMap.value[cat] > 0 || selectedCategoryFilter.value === cat
  )
);

const filteredDocuments = computed(() =>
  documents.value.filter((doc) => {
    if (selectedStatusFilter.value !== 'ALL' && doc.status !== selectedStatusFilter.value) {
      return false;
    }
    if (selectedCategoryFilter.value !== 'ALL' && doc.category !== selectedCategoryFilter.value) {
      return false;
    }
    return true;
  })
);

const hasActiveFilters = computed(
  () => selectedStatusFilter.value !== 'ALL' || selectedCategoryFilter.value !== 'ALL'
);

watch(
  () => props.tripId,
  () => {
    selectedStatusFilter.value = 'ALL';
    selectedCategoryFilter.value = 'ALL';
    formModalOpen.value = false;
    editingDocument.value = null;
    previewModalOpen.value = false;
    previewDocument.value = null;
    documentToDelete.value = null;
    documentToDetach.value = null;
    quickAttachTargetDoc.value = null;
  }
);

onBeforeUnmount(() => {
  if (copyResetTimer !== null) {
    window.clearTimeout(copyResetTimer);
    copyResetTimer = null;
  }
});

function getCategoryIcon(category: DocumentCategory) {
  switch (category) {
    case 'FLIGHT_TICKET':
      return Plane;
    case 'HOTEL_BOOKING':
      return Hotel;
    case 'INSURANCE':
      return ShieldPlus;
    case 'VISA_PASSPORT':
      return IdCard;
    case 'EXCURSION_TICKET':
      return Ticket;
    case 'RENTAL_TRANSFER':
      return Car;
    default:
      return FileText;
  }
}

function getSafeExternalUrl(rawUrl: string): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function getDisplayHost(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./i, '');
  } catch {
    return 'Открыть ссылку';
  }
}

function formatDocumentDates(doc: TripDocumentItem): string | null {
  if (doc.eventDate && doc.endDate) {
    if (doc.eventDate === doc.endDate) {
      return formatRussianDate(doc.eventDate);
    }
    return formatDateRange(doc.eventDate, doc.endDate);
  }
  if (doc.eventDate) {
    return formatRussianDate(doc.eventDate);
  }
  if (doc.endDate) {
    return `до ${formatRussianDate(doc.endDate)}`;
  }
  return null;
}

function resetFilters() {
  selectedStatusFilter.value = 'ALL';
  selectedCategoryFilter.value = 'ALL';
}

async function handleRetryFetch() {
  try {
    await documentStore.fetchTripDocuments(props.tripId, { force: true });
  } catch {
    // Error handled in store
  }
}

async function handleSeedDefaults() {
  try {
    const res = await documentStore.seedDefaultDocuments(props.tripId);
    if (res.addedCount > 0) {
      toastStore.success(
        'Базовый чек-лист заполнен',
        `Добавлено позиций: ${res.addedCount}`
      );
    } else {
      toastStore.info('Чек-лист уже заполнен', 'Все 4 базовых пункта уже добавлены.');
    }
  } catch (err: any) {
    toastStore.error('Не удалось заполнить чек-лист', err?.message || 'Попробуйте ещё раз');
  }
}

function openCreateModal() {
  editingDocument.value = null;
  formModalOpen.value = true;
}

function openEditModal(doc: TripDocumentItem) {
  editingDocument.value = doc;
  formModalOpen.value = true;
}

function openPreviewModal(doc: TripDocumentItem) {
  previewDocument.value = doc;
  previewModalOpen.value = true;
}

async function handleQuickStatusChange(doc: TripDocumentItem, nextStatus: DocumentStatus) {
  if (doc.status === nextStatus || documentStore.isDocumentMutating(doc.id)) return;
  try {
    await documentStore.updateDocument(doc.id, props.tripId, { status: nextStatus });
  } catch (err: any) {
    toastStore.error('Ошибка обновления статуса', err?.message || 'Не удалось изменить статус');
  }
}

async function handleCopyReferenceCode(doc: TripDocumentItem) {
  if (!doc.referenceCode || doc.category === 'VISA_PASSPORT' || doc.category === 'INSURANCE') return;

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(doc.referenceCode);
    } else {
      const textarea = window.document.createElement('textarea');
      textarea.value = doc.referenceCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      window.document.body.appendChild(textarea);
      textarea.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(textarea);
    }

    copiedDocumentId.value = doc.id;
    if (copyResetTimer !== null) {
      window.clearTimeout(copyResetTimer);
    }
    copyResetTimer = window.setTimeout(() => {
      copiedDocumentId.value = null;
      copyResetTimer = null;
    }, 2000);
  } catch {
    toastStore.error('Не удалось скопировать код', 'Скопируйте код бронирования вручную.');
  }
}

function triggerQuickAttach(doc: TripDocumentItem) {
  if (doc.category === 'VISA_PASSPORT' || documentStore.isDocumentMutating(doc.id)) return;
  quickAttachTargetDoc.value = doc;
  if (quickAttachInputRef.value) {
    quickAttachInputRef.value.value = '';
    quickAttachInputRef.value.click();
  }
}

async function handleQuickAttachChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const targetDoc = quickAttachTargetDoc.value;
  quickAttachTargetDoc.value = null;
  input.value = '';

  if (!file || !targetDoc || targetDoc.category === 'VISA_PASSPORT') return;

  try {
    validateLocalAttachmentFile(file);
    await documentStore.attachLocalFile(targetDoc.id, props.tripId, file);
    toastStore.success(
      'Файл сохранён локально',
      'Файл сохранён в IndexedDB этого браузера и не передан на сервер.'
    );
  } catch (err: any) {
    toastStore.error(
      'Не удалось прикрепить файл',
      err?.message || 'Проверьте формат (PDF/JPG/PNG/WEBP) и размер (до 10 МБ).'
    );
  }
}

async function handleDownloadLocalFile(doc: TripDocumentItem) {
  try {
    const record = await getLocalAttachment(doc.id);
    if (!record) {
      toastStore.error(
        'Файл не найден на устройстве',
        'Привяжите файл повторно в этом браузере.'
      );
      await documentStore.fetchTripDocuments(props.tripId, { force: true }).catch(() => {});
      return;
    }

    const url = URL.createObjectURL(record.blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = record.fileName;
    link.style.display = 'none';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err: any) {
    toastStore.error('Ошибка скачивания', err?.message || 'Не удалось прочитать файл из IndexedDB.');
  }
}

async function confirmDetachFile() {
  if (!documentToDetach.value) return;
  isDetachingFile.value = true;
  try {
    await documentStore.detachLocalFile(documentToDetach.value.id, props.tripId);
    toastStore.success('Файл откреплён', 'Файл удалён из локального хранилища этого браузера.');
    documentToDetach.value = null;
  } catch (err: any) {
    toastStore.error('Ошибка открепления', err?.message || 'Не удалось открепить файл');
  } finally {
    isDetachingFile.value = false;
  }
}

async function confirmDeleteDocument() {
  if (!documentToDelete.value) return;
  isDeletingDocument.value = true;
  try {
    await documentStore.deleteDocument(documentToDelete.value.id, props.tripId);
    toastStore.success('Карточка удалена');
    documentToDelete.value = null;
  } catch (err: any) {
    toastStore.error('Ошибка удаления', err?.message || 'Не удалось удалить карточку');
  } finally {
    isDeletingDocument.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Hidden file input for quick per-card local attach -->
    <input
      ref="quickAttachInputRef"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleQuickAttachChange"
    />

    <!-- Privacy-by-Design Architecture Banner -->
    <div class="rounded-2xl border border-teal-200/80 dark:border-teal-500/30 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-emerald-50/70 dark:from-teal-950/60 dark:via-slate-900 dark:to-emerald-950/40 p-4 sm:p-5 shadow-soft dark:shadow-none">
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div class="space-y-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Хранение документов по принципу Privacy-by-Design
            </h3>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/80 dark:bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30">
              <Lock class="w-3 h-3" />
              Local-First (IndexedDB)
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Сервис <strong>не запрашивает и не хранит на сервере</strong> сканы паспортов, удостоверений личности, паспортные номера и номера страховых полисов.
            Прикреплённые файлы билетов, полисов и ваучеров сохраняются <strong>исключительно локально в браузере на этом устройстве</strong> (IndexedDB) и не передаются по сети на сервер.
          </p>
        </div>
      </div>
    </div>

    <!-- Initial Loading -->
    <BaseSpinner
      v-if="showInitialLoading"
      label="Загружаем брони и чек-лист документов..."
    />

    <!-- Initial Error -->
    <div v-else-if="storeError && !hasLoaded" class="space-y-4 max-w-2xl">
      <BaseAlert
        type="error"
        title="Не удалось загрузить документы и брони"
        :message="storeError"
      />
      <BaseButton variant="secondary" size="sm" @click="handleRetryFetch">
        <RefreshCw class="w-4 h-4" />
        <span>Повторить попытку</span>
      </BaseButton>
    </div>

    <!-- Main Content -->
    <template v-else>
      <BaseAlert v-if="storeError" type="error" :message="storeError" />

      <!-- Summary & Readiness Progress Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6 space-y-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                isComplete ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
              ]"
            >
              <CheckCircle2 v-if="isComplete" class="w-6 h-6" />
              <FileCheck2 v-else class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Готовность документов и броней
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <template v-if="summary.totalCount === 0">
                  Чек-лист пока пуст — добавьте базовый набор или создайте первую бронь
                </template>
                <template v-else-if="isComplete">
                  Все {{ summary.totalCount }} пунктов полностью готовы к поездке
                </template>
                <template v-else>
                  Готово {{ summary.readyCount }} из {{ summary.totalCount }} · процент готовности:
                  <strong class="text-teal-700 dark:text-teal-400">{{ formattedReadinessPercentage }}%</strong>
                </template>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <BaseButton
              variant="secondary"
              size="sm"
              :loading="isSeeding"
              @click="handleSeedDefaults"
            >
              <Sparkles v-if="!isSeeding" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Заполнить базовый чек-лист</span>
            </BaseButton>

            <BaseButton
              variant="primary"
              size="sm"
              @click="openCreateModal"
            >
              <Plus class="w-4 h-4" />
              <span>Добавить бронь или пункт</span>
            </BaseButton>
          </div>
        </div>

        <!-- Readiness Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-500 dark:text-slate-400">Прогресс оформления</span>
            <span :class="isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-700 dark:text-teal-400'">
              {{ formattedReadinessPercentage }}%
            </span>
          </div>
          <div
            class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden"
            role="progressbar"
            :aria-valuenow="Math.round(summary.readinessPercentage)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              :class="[
                'h-full rounded-full transition-[width] duration-300',
                isComplete ? 'bg-emerald-500' : 'bg-teal-600 dark:bg-teal-500',
              ]"
              :style="{ width: barWidthStyle }"
            />
          </div>
        </div>

        <!-- Counters Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div class="px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Всего</p>
            <p class="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{{ summary.totalCount }}</p>
          </div>

          <div class="px-3.5 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/25">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400">
              Готово
            </p>
            <p class="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{{ summary.readyCount }}</p>
          </div>

          <div class="px-3.5 py-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/25">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-700/80 dark:text-amber-400">
              В процессе
            </p>
            <p class="text-lg font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">{{ summary.pendingCount }}</p>
          </div>

          <div class="px-3.5 py-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/25">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-rose-700/80 dark:text-rose-400">
              Нужно оформить
            </p>
            <p class="text-lg font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">{{ summary.requiredCount }}</p>
          </div>

          <div class="col-span-2 sm:col-span-1 px-3.5 py-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/25">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-sky-700/80 dark:text-sky-400 inline-flex items-center gap-1">
              <HardDrive class="w-3 h-3" />
              <span>Локальных файлов</span>
            </p>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <p class="text-lg font-extrabold text-sky-800 dark:text-sky-300">{{ localFilesCount }}</p>
              <span
                v-if="summary.withAttachmentCount > localFilesCount"
                class="text-[11px] text-sky-700/75 dark:text-sky-400/80"
                title="Общее число карточек с прикреплёнными файлами на этом и других устройствах"
              >
                (всего {{ summary.withAttachmentCount }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="documents.length === 0"
        title="Органайзер документов пока пуст"
        description="Добавьте базовый чек-лист (билеты, отель, страховка, паспорт и виза) в один клик или создайте собственную карточку бронирования."
      >
        <template #icon>
          <FileCheck2 class="w-7 h-7" />
        </template>
        <template #action>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <BaseButton variant="secondary" :loading="isSeeding" @click="handleSeedDefaults">
              <Sparkles v-if="!isSeeding" class="w-4 h-4" />
              <span>Заполнить базовый чек-лист</span>
            </BaseButton>
            <BaseButton variant="primary" @click="openCreateModal">
              <Plus class="w-4 h-4" />
              <span>Добавить бронь или пункт</span>
            </BaseButton>
          </div>
        </template>
      </EmptyState>

      <!-- Filters & Document Cards -->
      <template v-else>
        <!-- Filter Bar -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft dark:shadow-none space-y-3">
          <!-- Status Filter -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                @click="selectedStatusFilter = 'ALL'"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                  selectedStatusFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700',
                ]"
              >
                <span>Все статусы</span>
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded-md text-[11px]',
                    selectedStatusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  ]"
                >
                  {{ summary.totalCount }}
                </span>
              </button>

              <button
                v-for="st in ORDERED_DOCUMENT_STATUSES"
                :key="st"
                type="button"
                @click="selectedStatusFilter = selectedStatusFilter === st ? 'ALL' : st"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors',
                  selectedStatusFilter === st
                    ? getDocumentStatusMeta(st).activeButtonClass
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800',
                ]"
              >
                <span>{{ getDocumentStatusMeta(st).nameRu }}</span>
                <span class="opacity-80">
                  ({{
                    st === 'READY'
                      ? summary.readyCount
                      : st === 'PENDING'
                        ? summary.pendingCount
                        : summary.requiredCount
                  }})
                </span>
              </button>
            </div>

            <button
              v-if="hasActiveFilters"
              type="button"
              @click="resetFilters"
              class="text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 px-2.5 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/15 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>

          <!-- Category Filter -->
          <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="selectedCategoryFilter = 'ALL'"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                selectedCategoryFilter === 'ALL'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700',
              ]"
            >
              <span>Все категории</span>
            </button>

            <button
              v-for="cat in visibleCategoryFilters"
              :key="cat"
              type="button"
              @click="selectedCategoryFilter = selectedCategoryFilter === cat ? 'ALL' : cat"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                selectedCategoryFilter === cat
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800',
              ]"
            >
              <component :is="getCategoryIcon(cat)" class="w-3.5 h-3.5" />
              <span>{{ getDocumentCategoryMeta(cat).nameRu }}</span>
              <span class="opacity-75">({{ categoryCountsMap[cat] }})</span>
            </button>
          </div>
        </div>

        <!-- Filtered Empty State -->
        <div
          v-if="filteredDocuments.length === 0"
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-3 shadow-soft dark:shadow-none"
        >
          <p class="text-base font-bold text-slate-800 dark:text-slate-100">
            По выбранным фильтрам ничего не найдено
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Сбросьте фильтр или добавьте новую карточку в выбранную категорию.
          </p>
          <div class="pt-1">
            <BaseButton variant="outline" size="sm" @click="resetFilters">
              Сбросить фильтры
            </BaseButton>
          </div>
        </div>

        <!-- Documents & Bookings Cards Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div class="space-y-3.5">
              <!-- Card Top: Category + Edit/Delete -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
                      getDocumentCategoryMeta(doc.category).iconBgClass,
                    ]"
                  >
                    <component :is="getCategoryIcon(doc.category)" class="w-5 h-5" />
                  </div>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                          getDocumentCategoryMeta(doc.category).badgeClass,
                        ]"
                      >
                        {{ getDocumentCategoryMeta(doc.category).nameRu }}
                      </span>
                    </div>

                    <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                      {{ doc.title }}
                    </h3>

                    <p v-if="doc.provider" class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ doc.provider }}
                    </p>
                  </div>
                </div>

                <!-- Card Edit / Delete Buttons -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    :disabled="documentStore.isDocumentMutating(doc.id)"
                    @click="openEditModal(doc)"
                    class="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                    title="Редактировать"
                    aria-label="Редактировать карточку"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    :disabled="documentStore.isDocumentMutating(doc.id)"
                    @click="documentToDelete = doc"
                    class="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors disabled:opacity-40"
                    title="Удалить"
                    aria-label="Удалить карточку"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 1-Click Status Switcher -->
              <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                <button
                  v-for="st in ORDERED_DOCUMENT_STATUSES"
                  :key="st"
                  type="button"
                  :disabled="documentStore.isDocumentMutating(doc.id)"
                  @click="handleQuickStatusChange(doc, st)"
                  :class="[
                    'px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors border text-center truncate disabled:opacity-60',
                    doc.status === st
                      ? getDocumentStatusMeta(st).activeButtonClass
                      : 'bg-transparent border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/70',
                  ]"
                >
                  {{ getDocumentStatusMeta(st).nameRu }}
                </button>
              </div>

              <!-- Booking / Order Reference Code (Hidden for VISA_PASSPORT and INSURANCE) -->
              <div
                v-if="doc.category !== 'VISA_PASSPORT' && doc.category !== 'INSURANCE' && doc.referenceCode"
                class="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Код брони / номер заказа
                  </p>
                  <p class="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wide truncate mt-0.5">
                    {{ doc.referenceCode }}
                  </p>
                </div>

                <div class="relative shrink-0">
                  <button
                    type="button"
                    @click="handleCopyReferenceCode(doc)"
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                      copiedDocumentId === doc.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700',
                    ]"
                  >
                    <Check v-if="copiedDocumentId === doc.id" class="w-3.5 h-3.5" />
                    <Copy v-else class="w-3.5 h-3.5" />
                    <span>{{ copiedDocumentId === doc.id ? 'Скопировано!' : 'Копировать' }}</span>
                  </button>
                </div>
              </div>

              <!-- Dates & External Link -->
              <div
                v-if="formatDocumentDates(doc) || getSafeExternalUrl(doc.externalUrl)"
                class="flex flex-wrap items-center gap-2 text-xs"
              >
                <span
                  v-if="formatDocumentDates(doc)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <Calendar class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>
                    {{ doc.category === 'VISA_PASSPORT' ? 'Срок действия: ' : '' }}{{ formatDocumentDates(doc) }}
                  </span>
                </span>

                <a
                  v-if="getSafeExternalUrl(doc.externalUrl)"
                  :href="getSafeExternalUrl(doc.externalUrl)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200/70 dark:border-sky-500/30 font-semibold transition-colors"
                >
                  <ExternalLink class="w-3.5 h-3.5 shrink-0" />
                  <span class="truncate max-w-[180px]">{{ getDisplayHost(doc.externalUrl) }}</span>
                </a>
              </div>

              <!-- Notes -->
              <div
                v-if="doc.notes"
                class="rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30 p-3 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2"
              >
                <StickyNote class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p class="leading-relaxed whitespace-pre-line break-words">{{ doc.notes }}</p>
              </div>
            </div>

            <!-- Local File Block -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
              <!-- VISA_PASSPORT privacy bar -->
              <div
                v-if="doc.category === 'VISA_PASSPORT'"
                class="rounded-xl bg-violet-50/70 dark:bg-violet-500/10 border border-violet-200/70 dark:border-violet-500/30 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-violet-900 dark:text-violet-200"
              >
                <Lock class="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                <span class="font-medium">
                  Только чек-лист готовности (без загрузки файлов и паспортных данных)
                </span>
              </div>

              <!-- File exists in IndexedDB of this device -->
              <div
                v-else-if="doc.hasLocalFileOnDevice"
                class="rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 p-3 space-y-2.5"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <Paperclip class="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                      {{ doc.localFileMeta?.fileName || doc.fileName || 'Прикреплённый файл' }}
                    </span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {{ formatAttachmentFileSize(doc.localFileMeta?.fileSize ?? doc.fileSize) }}
                    </span>
                  </div>

                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    <HardDrive class="w-3 h-3" />
                    Локально в этом браузере
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    @click="openPreviewModal(doc)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Открыть файл</span>
                  </BaseButton>

                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="handleDownloadLocalFile(doc)"
                  >
                    <Download class="w-3.5 h-3.5" />
                    <span>Скачать</span>
                  </BaseButton>

                  <BaseButton
                    variant="ghost"
                    size="sm"
                    class="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 ml-auto"
                    :disabled="documentStore.isDocumentMutating(doc.id)"
                    @click="documentToDetach = doc"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>Открепить файл</span>
                  </BaseButton>
                </div>
              </div>

              <!-- File attached on another device (metadata on server, not in this browser's IndexedDB) -->
              <div
                v-else-if="doc.hasAttachment && !doc.hasLocalFileOnDevice"
                class="rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 p-3 space-y-2.5"
              >
                <div class="flex items-start gap-2.5">
                  <Laptop class="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div class="min-w-0 text-xs">
                    <p class="font-bold text-amber-950 dark:text-amber-200">
                      Файл хранится локально на том устройстве, где был прикреплён
                    </p>
                    <p v-if="doc.fileName" class="text-amber-800 dark:text-amber-300/90 mt-0.5 truncate">
                      {{ doc.fileName }}
                      <span v-if="doc.fileSize">· {{ formatAttachmentFileSize(doc.fileSize) }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    :disabled="documentStore.isDocumentMutating(doc.id)"
                    @click="triggerQuickAttach(doc)"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    <span>Привязать файл на этом устройстве</span>
                  </BaseButton>

                  <BaseButton
                    variant="ghost"
                    size="sm"
                    class="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15 ml-auto"
                    :disabled="documentStore.isDocumentMutating(doc.id)"
                    @click="documentToDetach = doc"
                  >
                    <span>Открепить</span>
                  </BaseButton>
                </div>
              </div>

              <!-- No attachment yet -->
              <button
                v-else
                type="button"
                :disabled="documentStore.isDocumentMutating(doc.id)"
                @click="triggerQuickAttach(doc)"
                class="w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500/50 hover:bg-teal-50/40 dark:hover:bg-teal-500/10 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
              >
                <span class="inline-flex items-center gap-2">
                  <Paperclip class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Прикрепить локальный файл (PDF / фото)</span>
                </span>
                <span class="text-[11px] font-normal text-slate-400 dark:text-slate-500">до 10 МБ · IndexedDB</span>
              </button>
            </div>
          </article>
        </div>
      </template>
    </template>

    <!-- Create / Edit Document Modal -->
    <DocumentFormModal
      :open="formModalOpen"
      :tripId="tripId"
      :tripStartDate="tripStartDate"
      :tripEndDate="tripEndDate"
      :editingDocument="editingDocument"
      @close="formModalOpen = false"
    />

    <!-- Local Attachment Preview Modal -->
    <DocumentAttachmentPreviewModal
      :open="previewModalOpen"
      :document="previewDocument"
      @close="previewModalOpen = false"
    />

    <!-- Confirm Detach Local File Modal -->
    <ConfirmDialog
      :open="Boolean(documentToDetach)"
      title="Открепить локальный файл?"
      :message="`Файл для карточки «${documentToDetach?.title}» будет удалён из локального хранилища этого браузера (IndexedDB). Сама карточка сохранится.`"
      confirmText="Открепить файл"
      :loading="isDetachingFile"
      @confirm="confirmDetachFile"
      @cancel="documentToDetach = null"
    />

    <!-- Confirm Delete Document Card Modal -->
    <ConfirmDialog
      :open="Boolean(documentToDelete)"
      title="Удалить карточку?"
      :message="`Вы действительно хотите удалить «${documentToDelete?.title}» и привязанный к ней локальный файл (если он был)?`"
      confirmText="Удалить"
      :loading="isDeletingDocument"
      @confirm="confirmDeleteDocument"
      @cancel="documentToDelete = null"
    />
  </div>
</template>
