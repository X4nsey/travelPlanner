<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

interface Props {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), {
  label: 'Загрузка данных...',
  size: 'md',
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <Loader2
      :class="[
        'animate-spin text-teal-600 mb-3',
        size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8',
      ]"
    />
    <p v-if="label" class="text-sm font-medium text-slate-500">
      {{ label }}
    </p>
  </div>
</template>
