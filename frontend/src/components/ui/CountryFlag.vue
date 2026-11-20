<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  buildFlagCdnUrl,
  extractIsoFromFlagUrl,
  isValidFlagUrl,
  normalizeIsoAlpha2,
} from '@/utils/countryFlag';

export type CountryFlagSize = 'xs' | 'sm' | 'md' | 'lg';

interface Props {
  code?: string | null;
  flagUrl?: string | null;
  name?: string;
  size?: CountryFlagSize;
  rounded?: boolean;
  eager?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  code: null,
  flagUrl: null,
  name: '',
  size: 'sm',
  rounded: true,
  eager: false,
});

const failedPrimary = ref(false);
const failedCdn = ref(false);

const normalizedCode = computed<string | null>(
  () => normalizeIsoAlpha2(props.code) || extractIsoFromFlagUrl(props.flagUrl)
);

const cdnUrl = computed<string>(() => {
  if (!normalizedCode.value) return '';
  const width = props.size === 'lg' ? 80 : 40;
  return buildFlagCdnUrl(normalizedCode.value, width);
});

const primaryUrl = computed<string>(() => {
  if (isValidFlagUrl(props.flagUrl)) {
    return props.flagUrl!.trim();
  }
  return cdnUrl.value;
});

const resolvedSrc = computed<string>(() => {
  if (!failedPrimary.value && primaryUrl.value) {
    return primaryUrl.value;
  }
  if (
    failedPrimary.value &&
    !failedCdn.value &&
    cdnUrl.value &&
    cdnUrl.value !== primaryUrl.value
  ) {
    return cdnUrl.value;
  }
  return '';
});

watch(
  () => [props.flagUrl, props.code, props.size],
  () => {
    failedPrimary.value = false;
    failedCdn.value = false;
  }
);

function handleError() {
  if (!failedPrimary.value) {
    failedPrimary.value = true;
    if (!cdnUrl.value || cdnUrl.value === primaryUrl.value) {
      failedCdn.value = true;
    }
    return;
  }
  failedCdn.value = true;
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-4 h-3';
    case 'sm':
      return 'w-5 h-3.5';
    case 'md':
      return 'w-6 h-4';
    case 'lg':
      return 'w-8 h-6';
  }
});

const fallbackTextClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-[7px]';
    case 'sm':
      return 'text-[8px]';
    case 'md':
      return 'text-[9px]';
    case 'lg':
      return 'text-[10px]';
  }
});

const roundedClass = computed(() => {
  if (!props.rounded) return 'rounded-none';
  return props.size === 'lg' ? 'rounded-md' : 'rounded-[3px]';
});

const fallbackLabel = computed(() => {
  if (normalizedCode.value) return normalizedCode.value;
  const cleanName = props.name.trim();
  if (cleanName.length >= 2) return cleanName.slice(0, 2).toUpperCase();
  return '--';
});

const altText = computed(() =>
  props.name ? `Флаг: ${props.name}` : normalizedCode.value ? `Флаг ${normalizedCode.value}` : 'Флаг страны'
);
</script>

<template>
  <img
    v-if="resolvedSrc"
    :src="resolvedSrc"
    :alt="altText"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    draggable="false"
    @error="handleError"
    :class="[
      'inline-block object-cover shrink-0 select-none ring-1 ring-black/10 dark:ring-white/15',
      sizeClasses,
      roundedClass,
    ]"
  />
  <span
    v-else
    :title="name || fallbackLabel"
    :aria-label="altText"
    :class="[
      'inline-flex items-center justify-center shrink-0 select-none font-bold uppercase leading-none tracking-tighter bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-black/10 dark:ring-white/15',
      sizeClasses,
      roundedClass,
      fallbackTextClasses,
    ]"
  >
    {{ fallbackLabel }}
  </span>
</template>
