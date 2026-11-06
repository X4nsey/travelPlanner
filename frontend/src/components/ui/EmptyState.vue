<script setup lang="ts">
import { Compass } from 'lucide-vue-next';

interface Props {
  title: string;
  description: string;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-soft max-w-xl mx-auto">
    <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
      <slot name="icon">
        <Compass class="w-7 h-7" />
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-slate-900 mb-2">
      {{ title }}
    </h3>
    <p class="text-sm text-slate-500 leading-relaxed mb-6">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="flex justify-center">
      <slot name="action" />
    </div>
  </div>
</template>
