<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  Download,
  Eye,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-vue-next';
import type { TripDocumentItem } from '@/types';
import { formatAttachmentFileSize, getLocalAttachment } from '@/utils/localDocumentVault';
import BaseButton from '@/components/ui/BaseButton.vue';

interface Props {
  open: boolean;
  document: TripDocumentItem | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const objectUrl = ref<string | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const fileMeta = ref<{
  fileName: string;
  fileMimeType: string;
  fileSize: number;
} | null>(null);

let loadSequence = 0;

function revokeCurrentUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
}

const isPdf = computed(() => fileMeta.value?.fileMimeType === 'application/pdf');
const isImage = computed(() => Boolean(fileMeta.value?.fileMimeType?.startsWith('image/')));

const displayTitle = computed(() => props.document?.title || 'Просмотр документа');
const displayFileName = computed(
  () =>
    fileMeta.value?.fileName ||
    props.document?.localFileMeta?.fileName ||
    props.document?.fileName ||
    'Документ'
);

async function loadPreview() {
  const currentSeq = ++loadSequence;
  revokeCurrentUrl();
  loadError.value = null;
  fileMeta.value = null;

  if (!props.open || !props.document) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const record = await getLocalAttachment(props.document.id);
    if (currentSeq !== loadSequence || !props.open) {
      return;
    }

    if (!record) {
      loadError.value =
        'Локальный файл не найден в памяти этого браузера (IndexedDB). Возможно, он был прикреплён на другом устройстве или очищен.';
      return;
    }

    fileMeta.value = {
      fileName: record.fileName,
      fileMimeType: record.fileMimeType,
      fileSize: record.fileSize,
    };
    objectUrl.value = URL.createObjectURL(record.blob);
  } catch (err: any) {
    if (currentSeq !== loadSequence) return;
    loadError.value =
      err?.message || 'Не удалось прочитать локальный файл из IndexedDB этого браузера.';
  } finally {
    if (currentSeq === loadSequence) {
      isLoading.value = false;
    }
  }
}

watch(
  () => [props.open, props.document?.id] as const,
  ([isOpen]) => {
    if (isOpen) {
      loadPreview();
    } else {
      loadSequence += 1;
      revokeCurrentUrl();
      loadError.value = null;
      fileMeta.value = null;
      isLoading.value = false;
    }
  },
  { immediate: true }
);

function handleDownload() {
  if (!objectUrl.value || !fileMeta.value) return;
  const link = window.document.createElement('a');
  link.href = objectUrl.value;
  link.download = fileMeta.value.fileName;
  link.style.display = 'none';
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  revokeCurrentUrl();
});
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
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-4xl h-[88vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-preview-modal-title"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div class="min-w-0 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-200/70 dark:border-teal-500/30 flex items-center justify-center shrink-0">
                <FileText v-if="isPdf" class="w-5 h-5" />
                <ImageIcon v-else-if="isImage" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <h3
                  id="doc-preview-modal-title"
                  class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
                >
                  {{ displayTitle }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span class="truncate max-w-[260px] sm:max-w-md font-medium text-slate-700 dark:text-slate-300">
                    {{ displayFileName }}
                  </span>
                  <span v-if="fileMeta">· {{ formatAttachmentFileSize(fileMeta.fileSize) }}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/30 font-semibold text-[11px]">
                    <HardDrive class="w-3 h-3" />
                    Локально (IndexedDB)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="emit('close')"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Закрыть предпросмотр"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Preview Viewport -->
          <div class="flex-1 min-h-0 bg-slate-100/80 dark:bg-slate-950/90 p-3 sm:p-5 flex items-center justify-center overflow-auto">
            <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 class="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
              <p class="text-sm font-medium">Читаем файл из локального хранилища браузера...</p>
            </div>

            <div
              v-else-if="loadError"
              class="max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-500/40 p-6 text-center space-y-3 shadow-sm"
            >
              <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle class="w-6 h-6" />
              </div>
              <h4 class="text-base font-bold text-slate-900 dark:text-slate-100">Файл недоступен для просмотра</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {{ loadError }}
              </p>
            </div>

            <iframe
              v-else-if="objectUrl && isPdf"
              :src="objectUrl"
              :title="displayFileName"
              class="w-full h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white shadow-sm"
            />

            <div
              v-else-if="objectUrl && isImage"
              class="w-full h-full flex items-center justify-center overflow-auto"
            >
              <img
                :src="objectUrl"
                :alt="displayFileName"
                loading="lazy"
                decoding="async"
                class="max-w-full max-h-full rounded-xl shadow-md object-contain bg-white dark:bg-slate-900"
              />
            </div>

            <div
              v-else-if="objectUrl"
              class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-3"
            >
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Предпросмотр этого типа файла не поддерживается. Вы можете скачать его на устройство.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Файл открыт напрямую из памяти вашего браузера без передачи на сервер.
            </p>
            <div class="flex items-center gap-2.5 ml-auto">
              <BaseButton
                v-if="objectUrl && fileMeta"
                variant="secondary"
                size="sm"
                @click="handleDownload"
              >
                <Download class="w-4 h-4" />
                <span>Скачать файл</span>
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="emit('close')">
                Закрыть
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
