<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import Globe from 'globe.gl';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pause,
  Play,
  Sparkles,
} from 'lucide-vue-next';
import type { CountryData } from '@/types';
import {
  getWorldGeoFeatures,
  computeFeatureCentroid,
  type GlobePolygonFeature,
} from '@/services/geo.service';

interface Props {
  countries: CountryData[];
  selectedCountry: CountryData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-country', featureOrCountry: GlobePolygonFeature): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const globeInstance = shallowRef<any>(null);
const hoveredFeature = shallowRef<GlobePolygonFeature | null>(null);
const isAutoRotating = ref(true);
const isWebGlSupported = ref(true);

let resizeObserver: ResizeObserver | null = null;
let cachedOceanTextureUrl: string | null = null;

function getOceanTextureDataUrl(): string {
  if (cachedOceanTextureUrl) return cachedOceanTextureUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Rich oceanic gradient from polar deep navy to tropical azure
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.22, '#0c4a6e');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(0.78, '#0c4a6e');
    grad.addColorStop(1, '#082f49');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle latitude & longitude graticule lines
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.12)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  cachedOceanTextureUrl = canvas.toDataURL('image/png');
  return cachedOceanTextureUrl;
}

function isFeatureSelected(feat: GlobePolygonFeature): boolean {
  if (!props.selectedCountry) return false;
  const selIso = props.selectedCountry.isoNumeric.padStart(3, '0');
  if (feat.properties.isoNumeric === selIso) return true;
  if (feat.properties.slug && feat.properties.slug === props.selectedCountry.slug) return true;
  return feat.properties.name.toLowerCase() === props.selectedCountry.nameEn.toLowerCase();
}

function updatePolygonsVisuals() {
  const g = globeInstance.value;
  if (!g) return;

  g.polygonAltitude((d: GlobePolygonFeature) => {
    if (isFeatureSelected(d)) return 0.048;
    if (hoveredFeature.value && hoveredFeature.value.id === d.id) return 0.028;
    return 0.01;
  }).polygonCapColor((d: GlobePolygonFeature) => {
    if (isFeatureSelected(d)) return '#f59e0b'; // Bright warm amber-gold for selected country
    if (hoveredFeature.value && hoveredFeature.value.id === d.id) return '#2dd4bf'; // Bright teal on hover
    if (d.properties.slug) return '#a7f3d0'; // Soft mint-emerald for featured catalog countries
    return '#cbd5e1'; // Calm slate for other countries
  });
}

function focusOnCoordinates(lat: number, lng: number, altitude = 1.75, duration = 900) {
  const g = globeInstance.value;
  if (!g) return;
  g.pointOfView({ lat, lng, altitude }, duration);
}

function initGlobe() {
  const el = containerRef.value;
  if (!el) return;

  try {
    const features = getWorldGeoFeatures(props.countries);
    const width = el.clientWidth || 600;
    const height = el.clientHeight || 520;

    const instance = new (Globe as any)(el, {
      waitForGlobeReady: false,
      animateIn: true,
      rendererConfig: { antialias: true, alpha: true, powerPreference: 'default' },
    })
      .width(width)
      .height(height)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(getOceanTextureDataUrl())
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.16)
      .polygonsData(features)
      .polygonsTransitionDuration(260)
      .polygonSideColor(() => 'rgba(15, 23, 42, 0.35)')
      .polygonStrokeColor(() => '#0f172a')
      .polygonLabel((d: GlobePolygonFeature) => {
        return `
          <div style="background: rgba(15, 23, 42, 0.92); color: #fff; padding: 8px 12px; border-radius: 10px; font-family: Inter, sans-serif; font-size: 13px; box-shadow: 0 8px 20px rgba(0,0,0,0.25); border: 1px solid rgba(45, 212, 191, 0.4);">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>${d.properties.flagEmoji}</span>
              <span>${d.properties.nameRu}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${d.properties.name} • Нажмите для выбора</div>
          </div>
        `;
      })
      .onPolygonHover((hoverD: GlobePolygonFeature | null) => {
        hoveredFeature.value = hoverD;
        if (el) {
          el.style.cursor = hoverD ? 'pointer' : 'grab';
        }
        const controls = instance.controls();
        if (controls) {
          controls.autoRotate = isAutoRotating.value && !hoverD;
        }
        updatePolygonsVisuals();
      })
      .onPolygonClick((clickedD: GlobePolygonFeature) => {
        if (!clickedD) return;
        isAutoRotating.value = false;
        const controls = instance.controls();
        if (controls) {
          controls.autoRotate = false;
        }
        emit('select-country', clickedD);
        const centroid = computeFeatureCentroid(clickedD);
        focusOnCoordinates(centroid.lat, centroid.lng, 1.65, 850);
      });

    // Limit pixel ratio to max 2 for smooth performance on standard GPUs
    const renderer = instance.renderer?.();
    if (renderer && typeof renderer.setPixelRatio === 'function') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    const controls = instance.controls?.();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.75;
      controls.zoomSpeed = 0.9;
      controls.minDistance = 145;
      controls.maxDistance = 420;
      controls.autoRotate = isAutoRotating.value;
      controls.autoRotateSpeed = 0.45;
    }

    globeInstance.value = instance;
    updatePolygonsVisuals();

    // Focus initial country if selected
    if (props.selectedCountry) {
      focusOnCoordinates(
        props.selectedCountry.coordinates.lat,
        props.selectedCountry.coordinates.lng,
        1.85,
        0
      );
    } else {
      focusOnCoordinates(38, 25, 2.0, 0);
    }

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (globeInstance.value && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          globeInstance.value
            .width(entry.contentRect.width)
            .height(entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(el);
  } catch (err) {
    console.error('[WorldGlobe] Ошибка инициализации WebGL:', err);
    isWebGlSupported.value = false;
  }
}

watch(
  () => props.selectedCountry,
  (newCountry) => {
    updatePolygonsVisuals();
    if (newCountry && globeInstance.value) {
      focusOnCoordinates(
        newCountry.coordinates.lat,
        newCountry.coordinates.lng,
        1.68,
        850
      );
    }
  }
);

watch(
  () => props.countries,
  (newList) => {
    if (globeInstance.value && newList.length > 0) {
      const features = getWorldGeoFeatures(newList);
      globeInstance.value.polygonsData(features);
      updatePolygonsVisuals();
    }
  }
);

function handleZoom(deltaAltitude: number) {
  const g = globeInstance.value;
  if (!g) return;
  const currentPov = g.pointOfView();
  const nextAlt = Math.min(3.0, Math.max(0.9, (currentPov.altitude || 1.8) + deltaAltitude));
  g.pointOfView({ ...currentPov, altitude: nextAlt }, 350);
}

function handleResetView() {
  isAutoRotating.value = true;
  const g = globeInstance.value;
  if (!g) return;
  const controls = g.controls?.();
  if (controls) {
    controls.autoRotate = true;
  }
  const lat = props.selectedCountry?.coordinates.lat ?? 35;
  const lng = props.selectedCountry?.coordinates.lng ?? 20;
  focusOnCoordinates(lat, lng, 1.95, 700);
}

function toggleAutoRotate() {
  isAutoRotating.value = !isAutoRotating.value;
  const controls = globeInstance.value?.controls?.();
  if (controls) {
    controls.autoRotate = isAutoRotating.value;
  }
}

function cleanupGlobe() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  const g = globeInstance.value;
  if (g) {
    try {
      g.pauseAnimation?.();
      const controls = g.controls?.();
      if (controls && typeof controls.dispose === 'function') {
        controls.dispose();
      }
      const scene = g.scene?.();
      if (scene && typeof scene.traverse === 'function') {
        scene.traverse((obj: any) => {
          if (obj.geometry && typeof obj.geometry.dispose === 'function') {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m?.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });
      }
      const renderer = g.renderer?.();
      if (renderer) {
        renderer.dispose?.();
        renderer.forceContextLoss?.();
      }
      g._destructor?.();
    } catch {
      // ignore cleanup errors
    }
    globeInstance.value = null;
  }

  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
}

onMounted(() => {
  initGlobe();
});

onBeforeUnmount(() => {
  cleanupGlobe();
});
</script>

<template>
  <div
    class="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 border border-slate-800/80 shadow-xl select-none"
  >
    <!-- Decorative Starry/Atmospheric Backdrop -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.16)_0%,_rgba(15,23,42,0)_70%)]"
    />

    <!-- Top Hovered / Selected Status Pill -->
    <div class="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
      <div
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 shadow-lg"
      >
        <Sparkles class="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span v-if="hoveredFeature">
          Наведено: <strong class="text-white">{{ hoveredFeature.properties.flagEmoji }} {{ hoveredFeature.properties.nameRu }}</strong>
        </span>
        <span v-else-if="selectedCountry">
          Выбрано: <strong class="text-amber-300">{{ selectedCountry.flagEmoji }} {{ selectedCountry.nameRu }}</strong>
        </span>
        <span v-else>
          Вращайте глобус и нажмите на любую страну
        </span>
      </div>

      <!-- Legend Badge (Desktop) -->
      <div
        class="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/70 text-[11px] text-slate-300"
      >
        <span class="inline-flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          Выбрана
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
          Курсор
        </span>
      </div>
    </div>

    <!-- 3D Globe Mount Container -->
    <div
      v-if="isWebGlSupported"
      ref="containerRef"
      class="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
    />

    <!-- Fallback if WebGL is disabled -->
    <div
      v-else
      class="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <p class="text-lg font-bold mb-2">3D-режим недоступен в текущем окружении</p>
      <p class="text-sm text-slate-300 max-w-md">
        Выберите интересующую вас страну из списка популярных направлений ниже или воспользуйтесь быстрым поиском.
      </p>
    </div>

    <!-- Bottom Interactive Controls HUD -->
    <div class="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
      <div class="text-[11px] text-slate-400 hidden sm:block bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800">
        Колёсико мыши или жест двумя пальцами — масштаб
      </div>

      <div class="flex items-center gap-1.5 ml-auto pointer-events-auto">
        <button
          type="button"
          @click="toggleAutoRotate"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors shadow-md"
          :title="isAutoRotating ? 'Остановить авто-вращение' : 'Включить авто-вращение'"
        >
          <Pause v-if="isAutoRotating" class="w-3.5 h-3.5 text-teal-400" />
          <Play v-else class="w-3.5 h-3.5 text-slate-400" />
          <span class="hidden xs:inline">{{ isAutoRotating ? 'Пауза' : 'Вращать' }}</span>
        </button>

        <button
          type="button"
          @click="handleZoom(-0.35)"
          class="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
          title="Приблизить"
          aria-label="Приблизить"
        >
          <ZoomIn class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="handleZoom(0.35)"
          class="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
          title="Отдалить"
          aria-label="Отдалить"
        >
          <ZoomOut class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="handleResetView"
          class="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
          title="Сбросить ракурс"
          aria-label="Сбросить ракурс"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
