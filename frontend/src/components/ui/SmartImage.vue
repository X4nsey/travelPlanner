<script lang="ts">
// Session-level cache of already loaded image URLs to avoid redundant skeleton flashes and duplicate fetches
const loadedImageUrls = new Set<string>();

export function clearSmartImageCache(url?: string): void {
  if (url) {
    loadedImageUrls.delete(url);
  } else {
    loadedImageUrls.clear();
  }
}

export function optimizeUnsplashUrl(
  rawUrl: string,
  width: number,
  quality = 76
): string {
  if (!rawUrl) return '';
  if (!rawUrl.includes('images.unsplash.com/')) {
    if (rawUrl.includes('flagcdn.com/') && rawUrl.endsWith('.png')) {
      return rawUrl.replace(/\.png$/, '.webp');
    }
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('fm', 'webp');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { ImageOff, RefreshCw } from 'lucide-vue-next';

export type ImageSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

interface Props {
  src?: string | null;
  thumbSrc?: string | null;
  alt: string;
  size?: ImageSizePreset;
  fallbackTitle?: string;
  fallbackFlag?: string;
  aspectClass?: string;
  imgClass?: string;
  authorName?: string;
  authorUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  showAttribution?: boolean;
  eager?: boolean;
  allowRetry?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  thumbSrc: '',
  size: 'md',
  fallbackTitle: '',
  fallbackFlag: '',
  aspectClass: 'aspect-[16/10]',
  imgClass: 'object-cover',
  license: '',
  showAttribution: false,
  eager: false,
  allowRetry: true,
});

const emit = defineEmits<{
  (e: 'retry'): void;
  (e: 'error'): void;
  (e: 'load'): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const isIntersecting = ref(false);
const isLoaded = ref(false);
const hasError = ref(false);
const triedSecondarySource = ref(false);
const retryCount = ref(0);

let observer: IntersectionObserver | null = null;

function areUrlsMatchingImage(urlA?: string | null, urlB?: string | null): boolean {
  if (!urlA || !urlB) return true;
  if (urlA === urlB) return true;
  const matchA = urlA.match(/photo-([a-zA-Z0-9-]+?)(?:\?|$)/);
  const matchB = urlB.match(/photo-([a-zA-Z0-9-]+?)(?:\?|$)/);
  if (matchA && matchB) {
    return matchA[1] === matchB[1];
  }
  if (Boolean(matchA) !== Boolean(matchB)) {
    return false;
  }
  try {
    const parsedA = new URL(urlA);
    const parsedB = new URL(urlB);
    return parsedA.hostname === parsedB.hostname;
  } catch {
    return false;
  }
}

const baseSourceUrl = computed(() => {
  if (triedSecondarySource.value) {
    return props.src || props.thumbSrc || '';
  }
  const hasMatchingThumb = Boolean(props.thumbSrc) && areUrlsMatchingImage(props.src, props.thumbSrc);
  if (hasMatchingThumb && (props.size === 'xs' || props.size === 'sm' || props.size === 'md')) {
    return props.thumbSrc!;
  }
  return props.src || props.thumbSrc || '';
});

function withRetryParam(url: string, count: number): string {
  if (!url || count <= 0) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('_retry', String(count));
    return parsed.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_retry=${count}`;
  }
}

const resolvedSrc = computed(() => {
  const raw = baseSourceUrl.value;
  if (!raw) return '';
  let optimized = raw;
  switch (props.size) {
    case 'xs':
      optimized = optimizeUnsplashUrl(raw, 120, 70);
      break;
    case 'sm':
      optimized = optimizeUnsplashUrl(raw, 480, 74);
      break;
    case 'md':
      optimized = optimizeUnsplashUrl(raw, 520, 75);
      break;
    case 'lg':
      optimized = optimizeUnsplashUrl(raw, 800, 78);
      break;
    case 'hero':
      optimized = optimizeUnsplashUrl(raw, 1280, 80);
      break;
  }
  return withRetryParam(optimized, retryCount.value);
});

const resolvedSrcSet = computed(() => {
  const raw = baseSourceUrl.value;
  if (!raw || !raw.includes('images.unsplash.com/')) return undefined;

  switch (props.size) {
    case 'xs':
      return `${optimizeUnsplashUrl(raw, 96, 68)} 96w, ${optimizeUnsplashUrl(raw, 160, 72)} 160w`;
    case 'sm':
    case 'md':
      return [
        `${optimizeUnsplashUrl(raw, 360, 72)} 360w`,
        `${optimizeUnsplashUrl(raw, 520, 75)} 520w`,
        `${optimizeUnsplashUrl(raw, 720, 76)} 720w`,
      ].join(', ');
    case 'lg':
      return [
        `${optimizeUnsplashUrl(raw, 520, 75)} 520w`,
        `${optimizeUnsplashUrl(raw, 800, 78)} 800w`,
        `${optimizeUnsplashUrl(raw, 1080, 80)} 1080w`,
      ].join(', ');
    case 'hero':
      return [
        `${optimizeUnsplashUrl(raw, 640, 76)} 640w`,
        `${optimizeUnsplashUrl(raw, 960, 78)} 960w`,
        `${optimizeUnsplashUrl(raw, 1280, 80)} 1280w`,
      ].join(', ');
  }
});

const resolvedSizes = computed(() => {
  if (!resolvedSrcSet.value) return undefined;
  switch (props.size) {
    case 'xs':
      return '48px';
    case 'sm':
      return '(max-width: 640px) 92vw, 340px';
    case 'md':
      return '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 320px';
    case 'lg':
      return '(max-width: 1024px) 94vw, 520px';
    case 'hero':
      return '(max-width: 640px) 100vw, 1200px';
  }
});

const shouldRenderImg = computed(
  () => Boolean(resolvedSrc.value) && !hasError.value && (props.eager || isIntersecting.value)
);

watch(
  () => [props.src, props.thumbSrc],
  () => {
    triedSecondarySource.value = false;
    retryCount.value = 0;
  }
);

watch(
  resolvedSrc,
  (url) => {
    hasError.value = !url;
    if (url && loadedImageUrls.has(url)) {
      isLoaded.value = true;
      isIntersecting.value = true;
    } else {
      isLoaded.value = false;
    }
  },
  { immediate: true }
);

function handleLoad() {
  isLoaded.value = true;
  hasError.value = false;
  if (resolvedSrc.value) {
    loadedImageUrls.add(resolvedSrc.value);
  }
  emit('load');
}

function handleError() {
  // If thumbSrc failed and a distinct full src exists, try full src before showing placeholder
  if (
    !triedSecondarySource.value &&
    props.thumbSrc &&
    props.src &&
    props.thumbSrc !== props.src
  ) {
    triedSecondarySource.value = true;
    return;
  }
  hasError.value = true;
  isLoaded.value = true;
  emit('error');
}

function handleRetry(event?: MouseEvent) {
  event?.stopPropagation();
  event?.preventDefault();
  triedSecondarySource.value = false;
  retryCount.value += 1;
  hasError.value = !(props.src || props.thumbSrc);
  isLoaded.value = false;
  isIntersecting.value = true;
  emit('retry');
}

onMounted(() => {
  if (props.eager || isIntersecting.value) {
    isIntersecting.value = true;
    return;
  }

  if (typeof IntersectionObserver !== 'undefined' && rootRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isIntersecting.value = true;
            observer?.disconnect();
            observer = null;
            break;
          }
        }
      },
      { rootMargin: '220px 0px' }
    );
    observer.observe(rootRef.value);
  } else {
    isIntersecting.value = true;
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>
  <div ref="rootRef" :class="['relative overflow-hidden bg-slate-100 select-none', aspectClass]">
    <!-- Shimmer skeleton while image loads -->
    <div
      v-if="!isLoaded && !hasError"
      class="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 animate-pulse"
    />

    <!-- Actual Image (mounted lazily on viewport approach or eagerly for hero images) -->
    <img
      v-if="shouldRenderImg"
      :src="resolvedSrc"
      :srcset="resolvedSrcSet"
      :sizes="resolvedSizes"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
      :class="[
        'w-full h-full object-cover transition-all duration-500 ease-out',
        imgClass,
        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]',
      ]"
    />

    <!-- Clean Placeholder when image fails or is unavailable (Never shows random/foreign photos) -->
    <div
      v-else-if="hasError"
      class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-900 flex flex-col items-center justify-center p-3 text-center text-white"
    >
      <div
        :class="[
          'rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-teal-200',
          size === 'xs' ? 'w-7 h-7' : 'w-10 h-10 mb-2',
        ]"
      >
        <ImageOff :class="size === 'xs' ? 'w-3.5 h-3.5' : 'w-5 h-5'" />
      </div>

      <template v-if="size !== 'xs'">
        <p
          v-if="fallbackTitle || alt"
          class="text-xs sm:text-sm font-bold tracking-wide text-white/95 line-clamp-2 max-w-[90%]"
        >
          {{ fallbackTitle || alt }}
        </p>
        <span class="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-teal-100/90">
          <span>Фотография пока недоступна</span>
        </span>
        <button
          v-if="allowRetry && (src || thumbSrc)"
          type="button"
          @click="handleRetry"
          class="mt-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-semibold text-white transition"
        >
          <RefreshCw class="w-3 h-3" />
          <span>Повторить загрузку</span>
        </button>
      </template>
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
      <span v-if="license" class="text-white/75"> ({{ license }})</span>
    </div>

    <slot />
  </div>
</template>
