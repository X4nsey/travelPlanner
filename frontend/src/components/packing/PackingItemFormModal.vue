<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CreatePackingItemPayload, PackingCategory, PackingItem } from '@/types';
import { PACKING_CATEGORY_OPTIONS } from '@/constants/packing';
import {
  createPackingItemValidationSchema,
  updatePackingItemValidationSchema,
} from '@/schemas/validation';
import { normalizePackingQuantity } from '@/services/packing.service';
import { usePackingStore } from '@/stores/packing.store';
import { useToastStore } from '@/stores/toast.store';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Props {
  open: boolean;
  tripId: string;
  editingItem?: PackingItem | null;
  defaultCategory?: PackingCategory;
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null,
  defaultCategory: 'CLOTHING',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', item: PackingItem): void;
}>();

const packingStore = usePackingStore();
const toastStore = useToastStore();

const name = ref('');
const category = ref<PackingCategory>('CLOTHING');
const quantityInput = ref('');
const serverError = ref<string | null>(null);
const fieldErrors = ref<{
  name?: string;
  category?: string;
  quantity?: string;
}>({});
const isSubmitting = ref(false);

const isEditMode = computed(() => Boolean(props.editingItem));

const isBusy = computed(
  () =>
    isSubmitting.value ||
    packingStore.isAdding ||
    (props.editingItem ? packingStore.isItemMutating(props.editingItem.id) : false)
);

const categorySelectOptions = PACKING_CATEGORY_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

watch(
  () => [props.open, props.editingItem?.id, props.defaultCategory] as const,
  ([isOpen]) => {
    if (!isOpen) return;

    serverError.value = null;
    fieldErrors.value = {};

    if (props.editingItem) {
      name.value = props.editingItem.name;
      category.value = props.editingItem.category;
      quantityInput.value =
        props.editingItem.quantity !== null && props.editingItem.quantity !== undefined
          ? String(props.editingItem.quantity)
          : '';
    } else {
      name.value = '';
      category.value = props.defaultCategory || 'CLOTHING';
      quantityInput.value = '';
    }
  },
  { immediate: true }
);

function parseQuantityForValidation(raw: string): number | null | string {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return trimmed;
  }

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 999) {
    return parsed;
  }

  return normalizePackingQuantity(parsed);
}

function handleCategoryChange(val: string) {
  category.value = val as PackingCategory;
  if (fieldErrors.value.category) {
    fieldErrors.value = { ...fieldErrors.value, category: undefined };
  }
}

function handleNameInput(val: string) {
  name.value = val;
  if (fieldErrors.value.name) {
    fieldErrors.value = { ...fieldErrors.value, name: undefined };
  }
}

function handleQuantityInput(val: string) {
  quantityInput.value = val;
  if (fieldErrors.value.quantity) {
    fieldErrors.value = { ...fieldErrors.value, quantity: undefined };
  }
}

function handleClose() {
  if (isBusy.value) return;
  emit('close');
}

async function handleSubmit() {
  if (isBusy.value) return;

  serverError.value = null;
  fieldErrors.value = {};

  const preparedQuantity = parseQuantityForValidation(quantityInput.value);
  const rawCandidate = {
    name: name.value,
    category: category.value,
    quantity: preparedQuantity,
  };

  const schema = isEditMode.value
    ? updatePackingItemValidationSchema
    : createPackingItemValidationSchema;

  const parsed = schema.safeParse(rawCandidate);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    fieldErrors.value = {
      name: flattened.fieldErrors.name?.[0],
      category: flattened.fieldErrors.category?.[0],
      quantity: flattened.fieldErrors.quantity?.[0],
    };
    if (flattened.formErrors.length > 0) {
      serverError.value = flattened.formErrors[0];
    }
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value && props.editingItem) {
      const res = await packingStore.updateItem(props.editingItem.id, parsed.data);
      toastStore.success('Позиция обновлена');
      if (res?.item) {
        emit('saved', res.item);
      }
      emit('close');
    } else {
      const createPayload = parsed.data as CreatePackingItemPayload;
      const res = await packingStore.addCustomItem(props.tripId, createPayload);
      toastStore.success('Вещь добавлена в список');
      emit('saved', res.item);
      emit('close');
    }
  } catch (err: any) {
    serverError.value =
      err?.message ||
      (isEditMode.value
        ? 'Не удалось сохранить изменения'
        : 'Не удалось добавить вещь в список');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Редактировать вещь' : 'Добавить вещь в список'"
    maxWidth="md"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <BaseAlert v-if="serverError" type="error" :message="serverError" />

      <BaseInput
        :modelValue="name"
        @update:modelValue="handleNameInput"
        name="packingItemName"
        label="Название вещи"
        placeholder="Например: Пауэрбанк, Солнцезащитный крем, Зарядка"
        :error="fieldErrors.name"
        required
        :disabled="isBusy"
      />

      <BaseSelect
        :modelValue="category"
        @update:modelValue="handleCategoryChange"
        name="packingItemCategory"
        label="Категория"
        :options="categorySelectOptions"
        :error="fieldErrors.category"
        required
        :disabled="isBusy"
      />

      <BaseInput
        :modelValue="quantityInput"
        @update:modelValue="handleQuantityInput"
        name="packingItemQuantity"
        type="number"
        min="1"
        max="999"
        step="1"
        label="Количество (необязательно)"
        placeholder="Оставьте пустым, если количество не важно"
        hint="Укажите целое число от 1 до 999 или оставьте поле пустым"
        :error="fieldErrors.quantity"
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
          {{ isEditMode ? 'Сохранить' : 'Добавить' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
