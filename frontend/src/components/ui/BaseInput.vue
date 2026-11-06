<script setup lang="ts">
interface Props {
  modelValue?: string | number | null;
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autocomplete?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: FocusEvent): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
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

    <div class="relative">
      <div
        v-if="$slots.icon"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"
      >
        <slot name="icon" />
      </div>

      <input
        :id="id || name"
        :name="name"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        @input="onInput"
        @blur="emit('blur', $event)"
        :class="[
          'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500',
          $slots.icon ? 'pl-10' : '',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-teal-500/20',
        ]"
      />
    </div>

    <p v-if="error" class="mt-1.5 text-xs font-medium text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>
