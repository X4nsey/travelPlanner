<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info } from 'lucide-vue-next';

interface Props {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
}

withDefaults(defineProps<Props>(), {
  type: 'error',
});
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-4 flex items-start gap-3 text-sm',
      type === 'error'
        ? 'bg-rose-50/90 border-rose-200 text-rose-800'
        : type === 'success'
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
          : 'bg-sky-50/90 border-sky-200 text-sky-800',
    ]"
  >
    <AlertCircle v-if="type === 'error'" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
    <CheckCircle2 v-else-if="type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
    <Info v-else class="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />

    <div class="flex-1">
      <p v-if="title" class="font-semibold mb-0.5">{{ title }}</p>
      <p class="leading-relaxed">{{ message }}</p>
    </div>
  </div>
</template>
