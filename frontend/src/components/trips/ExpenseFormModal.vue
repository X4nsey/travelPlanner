<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  Car,
  Utensils,
  Hotel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Coins,
  Calendar,
  FileText,
} from 'lucide-vue-next';
import { expenseValidationSchema } from '@/schemas/validation';
import type { ExpenseFormPayload, TripExpense, Currency, ExpenseCategory } from '@/types';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Props {
  open: boolean;
  tripCurrency: Currency;
  tripStartDate?: string;
  defaultDate?: string;
  editingExpense?: TripExpense | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultDate: '',
  editingExpense: null,
  loading: false,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: ExpenseFormPayload): void;
}>();

const serverError = ref<string | null>(null);

const categories: { key: ExpenseCategory; label: string; icon: any; color: string }[] = [
  { key: 'TRANSPORT', label: 'Транспорт', icon: Car, color: '#0284c7' },
  { key: 'FOOD', label: 'Питание', icon: Utensils, color: '#10b981' },
  { key: 'LODGING', label: 'Жильё', icon: Hotel, color: '#8b5cf6' },
  { key: 'ENTERTAINMENT', label: 'Развлечения', icon: Ticket, color: '#f59e0b' },
  { key: 'SHOPPING', label: 'Покупки', icon: ShoppingBag, color: '#ec4899' },
  { key: 'OTHER', label: 'Прочее', icon: MoreHorizontal, color: '#64748b' },
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'RUB', label: '₽ (RUB)' },
  { value: 'USD', label: '$ (USD)' },
  { value: 'EUR', label: '€ (EUR)' },
];

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const validationSchema = computed(() => toTypedSchema(expenseValidationSchema));

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    category: 'TRANSPORT' as ExpenseCategory,
    amount: undefined as unknown as number,
    currency: props.tripCurrency,
    expenseDate: props.defaultDate || props.tripStartDate || getTodayIso(),
    description: '',
  },
});

const { value: category } = useField<ExpenseCategory>('category');
const { value: amount } = useField<number | string>('amount');
const { value: currency } = useField<Currency>('currency');
const { value: expenseDate } = useField<string>('expenseDate');
const { value: description } = useField<string>('description');

watch(
  () => [props.open, props.editingExpense, props.defaultDate],
  () => {
    if (!props.open) return;
    serverError.value = null;

    if (props.editingExpense) {
      resetForm({
        values: {
          category: props.editingExpense.category,
          amount: props.editingExpense.amount,
          currency: props.editingExpense.currency,
          expenseDate: props.editingExpense.expenseDate,
          description: props.editingExpense.description || '',
        },
      });
    } else {
      resetForm({
        values: {
          category: 'TRANSPORT',
          amount: undefined as unknown as number,
          currency: props.tripCurrency,
          expenseDate: props.defaultDate || props.tripStartDate || getTodayIso(),
          description: '',
        },
      });
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit((values) => {
  serverError.value = null;
  emit('submit', {
    category: values.category as ExpenseCategory,
    amount: Number(values.amount),
    currency: values.currency as Currency,
    expenseDate: values.expenseDate,
    description: values.description ? values.description.trim() : '',
  });
});

defineExpose({
  setError: (msg: string | null) => {
    serverError.value = msg;
  },
});
</script>

<template>
  <BaseModal
    :open="open"
    :title="editingExpense ? 'Редактировать расход' : 'Добавить расход'"
    @close="emit('close')"
  >
    <form @submit.prevent="onSubmit" class="space-y-5">
      <BaseAlert
        v-if="serverError"
        type="error"
        :message="serverError"
      />

      <!-- Category Selector Grid -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Категория расхода <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            @click="category = cat.key"
            :class="[
              'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 text-left',
              category === cat.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            ]"
          >
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              :style="{
                backgroundColor: category === cat.key ? 'rgba(255,255,255,0.2)' : cat.color + '18',
                color: category === cat.key ? '#fff' : cat.color,
              }"
            >
              <component :is="cat.icon" class="w-3.5 h-3.5" />
            </div>
            <span class="truncate">{{ cat.label }}</span>
          </button>
        </div>
        <p v-if="errors.category" class="text-xs text-rose-500 mt-1 font-medium">
          {{ errors.category }}
        </p>
      </div>

      <!-- Amount and Currency Row -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        <div class="sm:col-span-8">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Сумма <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <BaseInput
              v-model="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              :error="errors.amount"
              required
            />
          </div>
        </div>

        <div class="sm:col-span-4">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Валюта
          </label>
          <div class="relative">
            <select
              v-model="currency"
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            >
              <option
                v-for="curr in currencies"
                :key="curr.value"
                :value="curr.value"
              >
                {{ curr.label }}
              </option>
            </select>
          </div>
          <p v-if="errors.currency" class="text-xs text-rose-500 mt-1 font-medium">
            {{ errors.currency }}
          </p>
        </div>
      </div>

      <!-- Expense Date -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Дата расхода <span class="text-rose-500">*</span>
        </label>
        <BaseInput
          v-model="expenseDate"
          type="date"
          :error="errors.expenseDate"
          required
        />
      </div>

      <!-- Description / Note -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Описание расхода
        </label>
        <BaseTextarea
          v-model="description"
          placeholder="Например: Билеты на скоростной поезд, обед в ресторане, сувениры..."
          :rows="2"
          :error="errors.description"
        />
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <BaseButton
          variant="outline"
          type="button"
          :disabled="loading"
          @click="emit('close')"
        >
          Отмена
        </BaseButton>

        <BaseButton
          type="submit"
          variant="primary"
          :loading="loading"
        >
          {{ editingExpense ? 'Сохранить изменения' : 'Добавить расход' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
