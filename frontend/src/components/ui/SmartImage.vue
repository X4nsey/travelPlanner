<script setup lang="ts">
import { ref, watch } from 'vue';
import { ImageOff } from 'lucide-vue-next';

interface Props {
  src?: string | null;
  alt: string;
  fallbackTitle?: string;
  fallbackFlag?: string;
  aspectClass?: string;
  imgClass?: string;
  authorName?: string;
  authorUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  showAttribution?: boolean;
  eager?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  fallbackTitle: '',
  fallbackFlag: '🌍',
  aspectClass: 'aspect-[16/10]',
  imgClass: 'object-cover',
  showAttribution: false,
  eager: false,
});

const isLoaded = ref(false);
const hasError = ref(false);

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    hasError.value = !props.src;
  },
  { immediate: true }
);

function handleLoad() {
  isLoaded.value = true;
}

function handleError() {
  hasError.value = true;
  isLoaded.value = true;
}
</script>

<template>
  <div :class="['relative overflow-hidden bg-slate-100 select-none', aspectClass]">
    <!-- Shimmer skeleton while image loads -->
    <div
      v-if="!isLoaded && !hasError"
      class="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 animate-pulse"
    />

    <!-- Actual Image -->
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
      :class="[
        'w-full h-full transition-all duration-500 ease-out',
        imgClass,
        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]',
      ]"
    />

    <!-- Scenic Fallback Placeholder if image fails or is unavailable -->
    <div
      v-else
      class="absolute inset-0 bg-gradient-to-br from-teal-700 via-sky-700 to-slate-800 flex flex-col items-center justify-center p-4 text-center text-white"
    >
      <div class="text-4xl mb-2 drop-shadow">{{ fallbackFlag }}</div>
      <p v-if="fallbackTitle || alt" class="text-sm font-bold tracking-wide text-white/95 line-clamp-1">
        {{ fallbackTitle || alt }}
      </p>
      <span class="mt-1 inline-flex items-center gap-1 text-[11px] text-teal-100/80">
        <ImageOff class="w-3 h-3" />
        <span>Иллюстрация направления</span>
      </span>
    </div>

    <!-- Optional Attribution Overlay -->
    <div
      v-if="showAttribution && authorName && !hasError"
      class="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-slate-900/55 backdrop-blur-sm text-[10px] text-white/90"
      @click.stop
    >
      <span>Фото: </span>
      <a
        v-if="authorUrl"
        :href="authorUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-teal-200"
      >
        {{ authorName }}
      </a>
      <span v-else>{{ authorName }}</span>
      <template v-if="sourceName">
        <span> / </span>
        <a
          v-if="sourceUrl"
          :href="sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-teal-200"
        >
          {{ sourceName }}
        </a>
        <span v-else>{{ sourceName }}</span>
      </template>
    </div>

    <slot />
  </div>
</template>
