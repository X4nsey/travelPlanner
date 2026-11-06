<script setup lang="ts">
import { computed, ref } from 'vue';
import { Heart } from 'lucide-vue-next';
import type { CountryData } from '@/types';
import { useCountryStore } from '@/stores/country.store';

interface Props {
  country: CountryData;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabel: false,
});

const emit = defineEmits<{
  (e: 'auth-required'): void;
}>();

const countryStore = useCountryStore();
const isBusy = ref(false);

const active = computed(() => countryStore.isFavorite(props.country.slug));

async function onClick(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  if (isBusy.value) return;

  isBusy.value = true;
  try {
    const res = await countryStore.toggleFavorite(props.country);
    if (res.requiresAuth) {
      emit('auth-required');
    }
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <button
    type="button"
    @click="onClick"
    :disabled="isBusy"
    :title="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    :aria-label="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none active:scale-95',
      showLabel
        ? active
          ? 'px-4 py-2.5 text-sm bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
          : 'px-4 py-2.5 text-sm bg-white/95 text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
        : size === 'sm'
          ? 'w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm border border-slate-200/70'
          : size === 'lg'
            ? 'w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-slate-200/70'
            : 'w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm border border-slate-200/70',
    ]"
  >
    <Heart
      :class="[
        'transition-transform duration-200',
        size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
        active ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600 hover:text-rose-500',
      ]"
    />
    <span v-if="showLabel">
      {{ active ? 'В избранном' : 'В избранное' }}
    </span>
  </button>
</template>
