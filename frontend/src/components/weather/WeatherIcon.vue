<script setup lang="ts">
import { computed, type Component } from 'vue';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
} from 'lucide-vue-next';
import type { WeatherIconType } from '@/types/weather';

interface Props {
  type: WeatherIconType;
  size?: 'sm' | 'md' | 'lg';
  withBackground?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  withBackground: false,
});

interface IconVisualConfig {
  component: Component;
  iconClass: string;
  bgClass: string;
}

const ICON_CONFIG_MAP: Record<WeatherIconType, IconVisualConfig> = {
  sunny: {
    component: Sun,
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50 border-amber-200/70',
  },
  partly_cloudy: {
    component: CloudSun,
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50/70 border-amber-200/60',
  },
  cloudy: {
    component: Cloud,
    iconClass: 'text-slate-500',
    bgClass: 'bg-slate-100 border-slate-200/80',
  },
  fog: {
    component: CloudFog,
    iconClass: 'text-slate-400',
    bgClass: 'bg-slate-100/80 border-slate-200/80',
  },
  drizzle: {
    component: CloudDrizzle,
    iconClass: 'text-sky-500',
    bgClass: 'bg-sky-50 border-sky-200/70',
  },
  rain: {
    component: CloudRain,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200/70',
  },
  heavy_rain: {
    component: CloudRainWind,
    iconClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200/70',
  },
  snow: {
    component: CloudSnow,
    iconClass: 'text-cyan-500',
    bgClass: 'bg-cyan-50 border-cyan-200/70',
  },
  thunderstorm: {
    component: CloudLightning,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-50 border-violet-200/70',
  },
};

const visualConfig = computed<IconVisualConfig>(
  () => ICON_CONFIG_MAP[props.type] ?? ICON_CONFIG_MAP.partly_cloudy
);

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4';
    case 'lg':
      return 'w-7 h-7';
    default:
      return 'w-5 h-5';
  }
});

const boxSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-7 h-7 rounded-lg';
    case 'lg':
      return 'w-12 h-12 rounded-2xl';
    default:
      return 'w-10 h-10 rounded-xl';
  }
});
</script>

<template>
  <span
    v-if="withBackground"
    :class="[
      'inline-flex items-center justify-center border shrink-0',
      boxSizeClass,
      visualConfig.bgClass,
    ]"
    :title="title"
    aria-hidden="true"
  >
    <component :is="visualConfig.component" :class="[iconSizeClass, visualConfig.iconClass]" />
  </span>

  <component
    v-else
    :is="visualConfig.component"
    :class="[iconSizeClass, visualConfig.iconClass, 'shrink-0']"
    :title="title"
    aria-hidden="true"
  />
</template>
