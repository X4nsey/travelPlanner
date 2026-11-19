<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Calendar, Copy, Info } from 'lucide-vue-next';
import type { DuplicateTripPayload, Trip } from '@/types';
import {
  formatDateRange,
  formatDaysLabel,
  getTodayIso,
  parseIsoDateParts,
} from '@/composables/useFormatters';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Props {
  open: boolean;
  trip: Trip | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: DuplicateTripPayload): void;
}>();

const title = ref('');
const startDate = ref('');
const includeEvents = ref(true);
const includePackingList = ref(true);
const includeDocumentsChecklist = ref(true);
const validationError = ref<string | null>(null);
const serverError = ref<string | null>(null);

function addDaysIso(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const baseMs = parseIsoDateParts(dateStr).dateObj.getTime();
  return new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

watch(
  () => [props.open, props.trip] as const,
  ([isOpen, trip]) => {
    if (!isOpen || !trip) return;
    const today = getTodayIso();
    title.value = `${trip.title} (копия)`.slice(0, 150);
    startDate.value = trip.startDate >= today ? trip.startDate : today;
    includeEvents.value = true;
    includePackingList.value = true;
    includeDocumentsChecklist.value = true;
    validationError.value = null;
    serverError.value = null;
  },
  { immediate: true }
);

const durationDays = computed(() => Math.max(1, props.trip?.durationDays ?? 1));

const computedEndDate = computed(() => {
  if (!startDate.value) return '';
  return addDaysIso(startDate.value, durationDays.value - 1);
});

const dayShiftLabel = computed(() => {
  if (!props.trip || !startDate.value) return '';
  const origMs = parseIsoDateParts(props.trip.startDate).dateObj.getTime();
  const nextMs = parseIsoDateParts(startDate.value).dateObj.getTime();
  const diffDays = Math.round((nextMs - origMs) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'без сдвига дат';
  if (diffDays > 0) return `сдвиг на +${diffDays} дн.`;
  return `сдвиг на ${diffDays} дн.`;
});

function handleSubmit() {
  validationError.value = null;
  serverError.value = null;

  const trimmedTitle = title.value.trim();
  if (trimmedTitle.length < 2) {
    validationError.value = 'Название поездки должно содержать минимум 2 символа';
    return;
  }
  if (!startDate.value || !/^\d{4}-\d{2}-\d{2}$/.test(startDate.value)) {
    validationError.value = 'Выберите корректную дату начала поездки';
    return;
  }

  emit('submit', {
    startDate: startDate.value,
    title: trimmedTitle,
    includeEvents: includeEvents.value,
    includePackingList: includePackingList.value,
    includeDocumentsChecklist: includeDocumentsChecklist.value,
  });
}

function setError(msg: string | null) {
  serverError.value = msg;
}

defineExpose({
  setError,
});
</script>

<template>
  <BaseModal :open="open" title="Дублировать поездку" maxWidth="lg" @close="emit('close')">
    <form
      v-if="trip"
      id="duplicate-trip-form"
      class="space-y-5"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <BaseAlert v-if="serverError || validationError" type="error" :message="(serverError || validationError)!" />

      <!-- Source Trip Summary -->
      <div class="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 p-3.5 flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
          <Copy class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Исходный маршрут</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ trip.title }}</p>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {{ trip.country }}, {{ trip.city }} · {{ formatDaysLabel(durationDays) }}
            ({{ formatDateRange(trip.startDate, trip.endDate) }})
          </p>
        </div>
      </div>

      <BaseInput
        v-model="title"
        name="duplicateTitle"
        label="Название новой поездки"
        placeholder="Введите название копии"
        required
        :disabled="loading"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <BaseInput
          v-model="startDate"
          name="duplicateStartDate"
          type="date"
          label="Новая дата начала"
          required
          :disabled="loading"
        />

        <div class="rounded-xl bg-teal-50/70 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/30 px-3.5 py-2.5 text-xs text-teal-900 dark:text-teal-200">
          <div class="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
            <Calendar class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Новые даты поездки</span>
          </div>
          <p v-if="computedEndDate" class="mt-1 font-medium">
            {{ formatDateRange(startDate, computedEndDate) }}
          </p>
          <p class="text-[11px] text-teal-700 dark:text-teal-300/80 mt-0.5">
            {{ formatDaysLabel(durationDays) }} · {{ dayShiftLabel }}
          </p>
        </div>
      </div>

      <!-- Options Checkboxes -->
      <div class="space-y-2.5 pt-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Что перенести в копию
        </p>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            v-model="includeEvents"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            :disabled="loading"
          />
          <div>
            <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">Перенести план по дням</span>
            <span class="block text-xs text-slate-500 dark:text-slate-400">
              Все мероприятия маршрута будут скопированы со сдвигом на новые даты.
            </span>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            v-model="includePackingList"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            :disabled="loading"
          />
          <div>
            <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Скопировать список вещей (сбросив отметки сбора)
            </span>
            <span class="block text-xs text-slate-500 dark:text-slate-400">
              Сгенерированные и пользовательские позиции сохранятся с отметкой «не собрано».
            </span>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            v-model="includeDocumentsChecklist"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            :disabled="loading"
          />
          <div>
            <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">Перенести чек-лист документов</span>
            <span class="block text-xs text-slate-500 dark:text-slate-400">
              Сохранятся названия и категории со статусом «Нужно подготовить» (номера броней и файлы не копируются).
            </span>
          </div>
        </label>
      </div>

      <div class="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300">
        <Info class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
        <span>
          История расходов из исходной поездки не копируется — дубликат начинается с чистого бюджета.
        </span>
      </div>
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="loading" @click="emit('close')">
        Отмена
      </BaseButton>
      <BaseButton
        type="submit"
        form="duplicate-trip-form"
        variant="primary"
        :loading="loading"
      >
        <Copy class="w-4 h-4" />
        <span>Создать копию</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
