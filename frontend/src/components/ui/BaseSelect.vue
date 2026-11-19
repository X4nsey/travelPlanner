<script setup lang="ts">
export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  modelValue?: string;
  label?: string;
  id?: string;
  name?: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: FocusEvent): void;
}>();

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id || name"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>
    </label>

    <select
      :id="id || name"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
      @blur="emit('blur', $event)"
      :class="[
        'block w-full rounded-xl border bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900/70 dark:disabled:text-slate-500',
        error
          ? 'border-rose-300 dark:border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-slate-200 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-teal-500/20 dark:focus:ring-teal-400/20',
      ]"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
      >
        {{ opt.label }}
      </option>
    </select>

    <p v-if="error" class="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
      {{ error }}
    </p>
  </div>
</template>
