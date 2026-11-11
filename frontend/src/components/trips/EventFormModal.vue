<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { buildEventValidationSchema } from '@/schemas/validation';
import type { EventFormPayload, ItineraryEvent, Currency } from '@/types';
import { getLocationPlaceholder } from '@/utils/locationPlaceholders';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Props {
  open: boolean;
  tripStartDate: string;
  tripEndDate: string;
  currency: Currency;
  country?: string;
  city?: string;
  defaultDate?: string;
  editingEvent?: ItineraryEvent | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  country: '',
  city: '',
  defaultDate: '',
  editingEvent: null,
  loading: false,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: EventFormPayload): void;
}>();

const serverError = ref<string | null>(null);

const validationSchema = computed(() =>
  toTypedSchema(buildEventValidationSchema(props.tripStartDate, props.tripEndDate))
);

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    title: '',
    description: '',
    date: props.defaultDate || props.tripStartDate,
    startTime: '',
    endTime: '',
    location: '',
    estimatedCost: '' as string | number,
    note: '',
  },
});

const { value: title } = useField<string>('title');
const { value: description } = useField<string>('description');
const { value: date } = useField<string>('date');
const { value: startTime } = useField<string>('startTime');
const { value: endTime } = useField<string>('endTime');
const { value: location } = useField<string>('location');
const { value: estimatedCost } = useField<string | number>('estimatedCost');
const { value: note } = useField<string>('note');

watch(
  () => [props.open, props.editingEvent, props.defaultDate],
  () => {
    if (!props.open) return;
    serverError.value = null;

    if (props.editingEvent) {
      resetForm({
        values: {
          title: props.editingEvent.title,
          description: props.editingEvent.description || '',
          date: props.editingEvent.date,
          startTime: props.editingEvent.startTime || '',
          endTime: props.editingEvent.endTime || '',
          location: props.editingEvent.location || '',
          estimatedCost:
            props.editingEvent.estimatedCost !== null && props.editingEvent.estimatedCost !== undefined
              ? props.editingEvent.estimatedCost
              : '',
          note: props.editingEvent.note || '',
        },
      });
    } else {
      resetForm({
        values: {
          title: '',
          description: '',
          date: props.defaultDate || props.tripStartDate,
          startTime: '',
          endTime: '',
          location: '',
          estimatedCost: '',
          note: '',
        },
      });
    }
  },
  { immediate: true }
);

const modalTitle = computed(() =>
  props.editingEvent ? 'Редактировать мероприятие' : 'Добавить мероприятие'
);

const locationPlaceholder = computed(() => {
  return getLocationPlaceholder(props.country, props.city);
});

const onSubmit = handleSubmit((values) => {
  serverError.value = null;
  const parsedCost =
    values.estimatedCost === '' || values.estimatedCost === null || values.estimatedCost === undefined
      ? null
      : Number(values.estimatedCost);

  emit('submit', {
    title: values.title.trim(),
    description: values.description?.trim() || '',
    date: values.date,
    startTime: values.startTime?.trim() ? values.startTime.trim() : null,
    endTime: values.endTime?.trim() ? values.endTime.trim() : null,
    location: values.location?.trim() ? values.location.trim() : null,
    estimatedCost: parsedCost,
    note: values.note?.trim() ? values.note.trim() : null,
  });
});

function setError(msg: string) {
  serverError.value = msg;
}

defineExpose({
  setError,
});
</script>

<template>
  <BaseModal :open="open" :title="modalTitle" maxWidth="lg" @close="emit('close')">
    <form id="event-modal-form" @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <BaseAlert v-if="serverError" type="error" :message="serverError" />

      <BaseInput
        v-model="title"
        name="title"
        label="Название мероприятия"
        placeholder="Например: Экскурсия в музей, Заселение в отель, Ужин на набережной"
        :error="errors.title"
        required
        :disabled="loading"
      />

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BaseInput
          v-model="date"
          name="date"
          type="date"
          label="Дата"
          :min="tripStartDate"
          :max="tripEndDate"
          :error="errors.date"
          required
          :disabled="loading"
        />

        <BaseInput
          v-model="startTime"
          name="startTime"
          type="time"
          label="Время начала"
          :error="errors.startTime"
          :disabled="loading"
        />

        <BaseInput
          v-model="endTime"
          name="endTime"
          type="time"
          label="Время окончания"
          :error="errors.endTime"
          :disabled="loading"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput
          v-model="location"
          name="location"
          label="Место проведения"
          :placeholder="locationPlaceholder"
          :error="errors.location"
          :disabled="loading"
        />

        <BaseInput
          v-model="estimatedCost"
          name="estimatedCost"
          type="number"
          min="0"
          step="50"
          :label="`Предполагаемая стоимость (${currency})`"
          placeholder="Необязательно"
          :error="errors.estimatedCost"
          :disabled="loading"
        />
      </div>

      <BaseTextarea
        v-model="description"
        name="description"
        label="Описание"
        placeholder="Что планируется делать на мероприятии..."
        :rows="2"
        :error="errors.description"
        :disabled="loading"
      />

      <BaseTextarea
        v-model="note"
        name="note"
        label="Дополнительная заметка"
        placeholder="Номер брони, дресс-код, ссылка на билеты или напоминание..."
        :rows="2"
        :error="errors.note"
        :disabled="loading"
      />
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="loading" @click="emit('close')">
        Отмена
      </BaseButton>
      <BaseButton
        type="submit"
        form="event-modal-form"
        variant="primary"
        :loading="loading"
      >
        {{ editingEvent ? 'Сохранить изменения' : 'Добавить мероприятие' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
