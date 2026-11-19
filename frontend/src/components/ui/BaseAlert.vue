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
        ? 'bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-500/30 dark:text-rose-200'
        : type === 'success'
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-500/30 dark:text-emerald-200'
          : 'bg-sky-50/90 border-sky-200 text-sky-800 dark:bg-sky-950/50 dark:border-sky-500/30 dark:text-sky-200',
    ]"
  >
    <AlertCircle v-if="type === 'error'" class="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
    <CheckCircle2 v-else-if="type === 'success'" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
    <Info v-else class="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />

    <div class="flex-1">
      <p v-if="title" class="font-semibold mb-0.5">{{ title }}</p>
      <p class="leading-relaxed">{{ message }}</p>
    </div>
  </div>
</template>
