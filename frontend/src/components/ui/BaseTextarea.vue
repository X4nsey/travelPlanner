<script setup lang="ts">
interface Props {
  modelValue?: string | null;
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: FocusEvent): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id || name"
      class="block text-sm font-medium text-slate-700 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500 ml-0.5">*</span>
    </label>

    <textarea
      :id="id || name"
      :name="name"
      :rows="rows"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @blur="emit('blur', $event)"
      :class="[
        'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 resize-y',
        error
          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-teal-500/20',
      ]"
    />

    <p v-if="error" class="mt-1.5 text-xs font-medium text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>
