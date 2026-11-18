<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  FileText,
  HardDrive,
  Lock,
  Paperclip,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-vue-next';
import type {
  CreateTripDocumentPayload,
  DocumentCategory,
  DocumentStatus,
  TripDocumentItem,
  UpdateTripDocumentPayload,
} from '@/types';
import {
  DOCUMENT_CATEGORY_OPTIONS,
  DOCUMENT_STATUS_META,
  ORDERED_DOCUMENT_STATUSES,
} from '@/constants/documents';
import {
  formatAttachmentFileSize,
  validateLocalAttachmentFile,
} from '@/utils/localDocumentVault';
import { useDocumentStore } from '@/stores/document.store';
import { useToastStore } from '@/stores/toast.store';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Props {
  open: boolean;
  tripId: string;
  tripStartDate?: string;
  tripEndDate?: string;
  editingDocument?: TripDocumentItem | null;
}

const props = withDefaults(defineProps<Props>(), {
  tripStartDate: '',
  tripEndDate: '',
  editingDocument: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', doc: TripDocumentItem): void;
}>();

const documentStore = useDocumentStore();
const toastStore = useToastStore();

const title = ref('');
const category = ref<DocumentCategory>('FLIGHT_TICKET');
const status = ref<DocumentStatus>('READY');
const provider = ref('');
const referenceCode = ref('');
const eventDate = ref('');
const endDate = ref('');
const externalUrl = ref('');
const notes = ref('');

const selectedFile = ref<File | null>(null);
const selectedFileMeta = ref<{
  fileName: string;
  fileMimeType: string;
  fileSize: number;
} | null>(null);
const removeExistingAttachment = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref<string | null>(null);

const isSubmitting = ref(false);
const serverError = ref<string | null>(null);
const fieldErrors = ref<{
  title?: string;
  eventDate?: string;
  endDate?: string;
  externalUrl?: string;
  provider?: string;
  referenceCode?: string;
  notes?: string;
}>({});

const isEditMode = computed(() => Boolean(props.editingDocument));
const isVisaPassport = computed(() => category.value === 'VISA_PASSPORT');

const isBusy = computed(
  () =>
    isSubmitting.value ||
    (props.editingDocument ? documentStore.isDocumentMutating(props.editingDocument.id) : false)
);

const eventDateLabel = computed(() =>
  isVisaPassport.value
    ? 'Дата начала срока действия (для самоконтроля)'
    : 'Дата события / вылета / заезда'
);

const endDateLabel = computed(() =>
  isVisaPassport.value
    ? 'Дата окончания срока действия (для самоконтроля)'
    : 'Дата окончания / возврата / выезда'
);

const hasExistingRemoteAttachment = computed(
  () =>
    Boolean(props.editingDocument?.hasAttachment) &&
    !removeExistingAttachment.value &&
    !selectedFile.value
);

const hasExistingLocalOnDevice = computed(
  () =>
    Boolean(props.editingDocument?.hasLocalFileOnDevice) &&
    !removeExistingAttachment.value &&
    !selectedFile.value
);

const existingAttachmentLabel = computed(() => {
  if (!props.editingDocument) return '';
  const name =
    props.editingDocument.localFileMeta?.fileName ||
    props.editingDocument.fileName ||
    'Локальный файл';
  const size = props.editingDocument.localFileMeta?.fileSize ?? props.editingDocument.fileSize;
  return size ? `${name} (${formatAttachmentFileSize(size)})` : name;
});

function resetFileSelection() {
  selectedFile.value = null;
  selectedFileMeta.value = null;
  fileError.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

watch(
  () => [props.open, props.editingDocument?.id] as const,
  ([isOpen]) => {
    if (!isOpen) return;

    serverError.value = null;
    fieldErrors.value = {};
    removeExistingAttachment.value = false;
    resetFileSelection();

    if (props.editingDocument) {
      title.value = props.editingDocument.title;
      category.value = props.editingDocument.category;
      status.value = props.editingDocument.status;
      provider.value = props.editingDocument.provider || '';
      referenceCode.value =
        props.editingDocument.category === 'VISA_PASSPORT'
          ? ''
          : props.editingDocument.referenceCode || '';
      eventDate.value = props.editingDocument.eventDate || '';
      endDate.value = props.editingDocument.endDate || '';
      externalUrl.value = props.editingDocument.externalUrl || '';
      notes.value = props.editingDocument.notes || '';
    } else {
      title.value = '';
      category.value = 'FLIGHT_TICKET';
      status.value = 'READY';
      provider.value = '';
      referenceCode.value = '';
      eventDate.value = '';
      endDate.value = '';
      externalUrl.value = '';
      notes.value = '';
    }
  },
  { immediate: true }
);

watch(category, (nextCategory) => {
  if (nextCategory === 'VISA_PASSPORT') {
    fileError.value = null;
    fieldErrors.value = { ...fieldErrors.value, referenceCode: undefined };
  }
});

function handleCategoryChange(val: string) {
  category.value = val as DocumentCategory;
}

function triggerFilePicker() {
  if (isBusy.value || isVisaPassport.value) return;
  fileError.value = null;
  fileInputRef.value?.click();
}

function handleFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const validated = validateLocalAttachmentFile(file);
    selectedFile.value = file;
    selectedFileMeta.value = validated;
    removeExistingAttachment.value = false;
    fileError.value = null;
  } catch (err: any) {
    resetFileSelection();
    fileError.value = err?.message || 'Недопустимый файл';
  }
}

function handleDetachInForm() {
  resetFileSelection();
  if (props.editingDocument?.hasAttachment || props.editingDocument?.hasLocalFileOnDevice) {
    removeExistingAttachment.value = true;
  }
}

function isValidIsoDateStr(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

function isValidHttpUrl(val: string): boolean {
  if (!val) return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateForm(): boolean {
  const errors: typeof fieldErrors.value = {};

  const trimmedTitle = title.value.trim();
  if (!trimmedTitle) {
    errors.title = 'Укажите название документа или брони';
  } else if (trimmedTitle.length > 200) {
    errors.title = 'Название не должно превышать 200 символов';
  }

  if (provider.value.trim().length > 150) {
    errors.provider = 'Название компании или сервиса не должно превышать 150 символов';
  }

  if (!isVisaPassport.value && referenceCode.value.trim().length > 100) {
    errors.referenceCode = 'Код брони не должен превышать 100 символов';
  }

  const startVal = eventDate.value.trim();
  const endVal = endDate.value.trim();

  if (startVal && !isValidIsoDateStr(startVal)) {
    errors.eventDate = 'Укажите корректную дату';
  }
  if (endVal && !isValidIsoDateStr(endVal)) {
    errors.endDate = 'Укажите корректную дату';
  }
  if (startVal && endVal && isValidIsoDateStr(startVal) && isValidIsoDateStr(endVal) && endVal < startVal) {
    errors.endDate = 'Дата окончания не может быть раньше даты начала';
  }

  const trimmedUrl = externalUrl.value.trim();
  if (trimmedUrl) {
    if (trimmedUrl.length > 2000) {
      errors.externalUrl = 'Ссылка слишком длинная (максимум 2000 символов)';
    } else if (!isValidHttpUrl(trimmedUrl)) {
      errors.externalUrl = 'Ссылка должна начинаться с http:// или https://';
    }
  }

  if (notes.value.trim().length > 2000) {
    errors.notes = 'Заметки не должны превышать 2000 символов';
  }

  fieldErrors.value = errors;
  return Object.keys(errors).length === 0;
}

function handleClose() {
  if (isBusy.value) return;
  emit('close');
}

async function handleSubmit() {
  if (isBusy.value) return;

  serverError.value = null;
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const startVal = eventDate.value.trim() || null;
    const endVal = endDate.value.trim() || null;

    if (isEditMode.value && props.editingDocument) {
      const payload: UpdateTripDocumentPayload = {
        title: title.value.trim(),
        category: category.value,
        status: status.value,
        provider: provider.value.trim(),
        referenceCode: isVisaPassport.value ? '' : referenceCode.value.trim(),
        eventDate: startVal,
        endDate: endVal,
        externalUrl: externalUrl.value.trim(),
        notes: notes.value.trim(),
      };

      const shouldRemoveFile =
        isVisaPassport.value || (removeExistingAttachment.value && !selectedFile.value);

      if (shouldRemoveFile) {
        payload.removeAttachment = true;
      }

      const res = await documentStore.updateDocument(
        props.editingDocument.id,
        props.tripId,
        payload,
        {
          localFile: isVisaPassport.value ? null : selectedFile.value,
          removeLocalFile: shouldRemoveFile,
        }
      );

      toastStore.success('Карточка обновлена');
      emit('saved', res.document);
      emit('close');
    } else {
      const payload: CreateTripDocumentPayload = {
        title: title.value.trim(),
        category: category.value,
        status: status.value,
        provider: provider.value.trim(),
        referenceCode: isVisaPassport.value ? '' : referenceCode.value.trim(),
        eventDate: startVal,
        endDate: endVal,
        externalUrl: externalUrl.value.trim(),
        notes: notes.value.trim(),
      };

      const res = await documentStore.createDocument(
        props.tripId,
        payload,
        isVisaPassport.value ? null : selectedFile.value
      );

      toastStore.success('Пункт добавлен в органайзер');
      emit('saved', res.document);
      emit('close');
    }
  } catch (err: any) {
    serverError.value =
      err?.message ||
      (isEditMode.value
        ? 'Не удалось сохранить изменения карточки'
        : 'Не удалось создать карточку документа');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Редактировать бронь / документ' : 'Добавить бронь или пункт чек-листа'"
    maxWidth="xl"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <BaseAlert v-if="serverError" type="error" :message="serverError" />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseSelect
          :modelValue="category"
          @update:modelValue="handleCategoryChange"
          name="docCategory"
          label="Категория"
          :options="DOCUMENT_CATEGORY_OPTIONS"
          required
          :disabled="isBusy"
        />

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Статус готовности
          </label>
          <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/70">
            <button
              v-for="st in ORDERED_DOCUMENT_STATUSES"
              :key="st"
              type="button"
              :disabled="isBusy"
              @click="status = st"
              :class="[
                'px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center truncate border',
                status === st
                  ? DOCUMENT_STATUS_META[st].activeButtonClass
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/70',
              ]"
            >
              {{ DOCUMENT_STATUS_META[st].nameRu }}
            </button>
          </div>
        </div>
      </div>

      <BaseInput
        v-model="title"
        name="docTitle"
        label="Название"
        :placeholder="
          isVisaPassport
            ? 'Например: Проверка срока загранпаспорта и шенгенской визы'
            : 'Например: Перелёт Москва — Барселона, Отель Casa Barcelona, Страховка'
        "
        :error="fieldErrors.title"
        required
        :disabled="isBusy"
      />

      <div :class="['grid grid-cols-1 gap-4', !isVisaPassport ? 'sm:grid-cols-2' : '']">
        <BaseInput
          v-model="provider"
          name="docProvider"
          :label="isVisaPassport ? 'Орган / визовый центр (необязательно)' : 'Компания / сервис'"
          :placeholder="
            isVisaPassport
              ? 'Например: Консульство Испании / Визовый центр'
              : 'Например: Turkish Airlines, Booking.com, АльфаСтрахование'
          "
          :error="fieldErrors.provider"
          :disabled="isBusy"
        />

        <BaseInput
          v-if="!isVisaPassport"
          v-model="referenceCode"
          name="docReferenceCode"
          label="Код брони / номер заказа"
          placeholder="Например: TK9X7M, BK-442190, POL-7788"
          :error="fieldErrors.referenceCode"
          :disabled="isBusy"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput
          v-model="eventDate"
          name="docEventDate"
          type="date"
          :label="eventDateLabel"
          :error="fieldErrors.eventDate"
          :disabled="isBusy"
        />

        <BaseInput
          v-model="endDate"
          name="docEndDate"
          type="date"
          :label="endDateLabel"
          :min="eventDate || undefined"
          :error="fieldErrors.endDate"
          :disabled="isBusy"
        />
      </div>

      <BaseInput
        v-model="externalUrl"
        name="docExternalUrl"
        type="url"
        label="Ссылка на бронь или официальный сервис (необязательно)"
        placeholder="https://..."
        :error="fieldErrors.externalUrl"
        :disabled="isBusy"
      />

      <!-- Privacy-by-Design notice OR Local File Picker -->
      <div
        v-if="isVisaPassport"
        class="rounded-xl border border-violet-200/80 bg-violet-50/70 p-4 flex items-start gap-3 text-xs sm:text-sm text-violet-950"
      >
        <div class="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
          <Lock class="w-4 h-4" />
        </div>
        <div class="space-y-1">
          <p class="font-bold text-violet-900">
            Защита персональных данных (Privacy-by-Design)
          </p>
          <p class="text-xs text-violet-800 leading-relaxed">
            Для категории «Паспорт и виза» поля для серии/номера паспорта и прикрепления сканов отключены намеренно.
            Используйте эту карточку только как чек-лист готовности и самоконтроль сроков действия.
          </p>
        </div>
      </div>

      <div v-else class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">
          Локальный файл билета, полиса или ваучера (необязательно)
        </label>

        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          class="hidden"
          @change="handleFileInputChange"
        />

        <!-- Selected new file preview -->
        <div
          v-if="selectedFile && selectedFileMeta"
          class="rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <FileText class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ selectedFileMeta.fileName }}
              </p>
              <p class="text-xs text-teal-800 flex items-center gap-1.5">
                <span>{{ formatAttachmentFileSize(selectedFileMeta.fileSize) }}</span>
                <span>·</span>
                <span>Сохранится локально в IndexedDB</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <BaseButton type="button" variant="outline" size="sm" :disabled="isBusy" @click="triggerFilePicker">
              Заменить
            </BaseButton>
            <BaseButton type="button" variant="ghost" size="sm" :disabled="isBusy" @click="handleDetachInForm">
              <Trash2 class="w-4 h-4 text-rose-600" />
            </BaseButton>
          </div>
        </div>

        <!-- Existing local file on this device -->
        <div
          v-else-if="hasExistingLocalOnDevice"
          class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <HardDrive class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ existingAttachmentLabel }}
              </p>
              <p class="text-xs text-emerald-800">
                Файл уже сохранён локально в этом браузере
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <BaseButton type="button" variant="outline" size="sm" :disabled="isBusy" @click="triggerFilePicker">
              Заменить файл
            </BaseButton>
            <BaseButton
              type="button"
              variant="outline"
              size="sm"
              class="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
              :disabled="isBusy"
              @click="handleDetachInForm"
            >
              Открепить
            </BaseButton>
          </div>
        </div>

        <!-- Existing file attached on another device -->
        <div
          v-else-if="hasExistingRemoteAttachment"
          class="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Paperclip class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ existingAttachmentLabel }}
              </p>
              <p class="text-xs text-amber-800">
                Файл прикреплён на другом устройстве. Вы можете привязать копию на этом устройстве.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <BaseButton type="button" variant="outline" size="sm" :disabled="isBusy" @click="triggerFilePicker">
              Привязать здесь
            </BaseButton>
            <BaseButton
              type="button"
              variant="ghost"
              size="sm"
              class="text-rose-600 hover:bg-rose-50"
              :disabled="isBusy"
              @click="handleDetachInForm"
            >
              Открепить
            </BaseButton>
          </div>
        </div>

        <!-- Empty file picker trigger -->
        <button
          v-else
          type="button"
          :disabled="isBusy"
          @click="triggerFilePicker"
          class="w-full rounded-xl border border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/40 px-4 py-4 transition-colors flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left disabled:opacity-50"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-100 text-teal-600 flex items-center justify-center shrink-0">
            <Upload class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">
              Выбрать локальный файл (PDF, JPG, PNG, WEBP · до 10 МБ)
            </p>
            <p class="text-xs text-slate-500 mt-0.5">
              Файл хранится только в IndexedDB этого браузера и никогда не загружается на сервер.
            </p>
          </div>
        </button>

        <p v-if="fileError" class="text-xs font-medium text-rose-600">
          {{ fileError }}
        </p>
        <p class="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>На сервер передаются только метаданные карточки без содержимого файла.</span>
        </p>
      </div>

      <BaseTextarea
        v-model="notes"
        name="docNotes"
        label="Заметки (необязательно)"
        :rows="3"
        placeholder="Терминал, время регистрации, правила тарифа, адрес заселения, телефон поддержки..."
        :error="fieldErrors.notes"
        :disabled="isBusy"
      />

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <BaseButton
          type="button"
          variant="outline"
          :disabled="isBusy"
          @click="handleClose"
        >
          Отмена
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="isBusy"
        >
          {{ isEditMode ? 'Сохранить изменения' : 'Добавить' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
