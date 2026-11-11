<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import Globe from 'globe.gl';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pause,
  Play,
  Sparkles,
  Heart,
  PlaneTakeoff,
} from 'lucide-vue-next';
import type { CountryData } from '@/types';
import {
  getWorldGeoFeatures,
  computeFeatureCentroid,
  type GlobePolygonFeature,
} from '@/services/geo.service';
import {
  GLOBE_COLORS,
  GLOBE_LEGEND_ITEMS,
  type GlobeColorState,
} from '@/constants/globe-colors';
import GlobeLegend from './GlobeLegend.vue';

interface Props {
  countries: CountryData[];
  selectedCountry: CountryData | null;
  favoriteSlugs?: string[];
  plannedCountryNames?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  favoriteSlugs: () => [],
  plannedCountryNames: () => [],
});

const emit = defineEmits<{
  (e: 'select-country', featureOrCountry: GlobePolygonFeature): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const globeInstance = shallowRef<any>(null);
const hoveredFeature = shallowRef<GlobePolygonFeature | null>(null);
const activeLegendHighlight = ref<GlobeColorState | null>(null);
const isAutoRotating = ref(true);
const isWebGlSupported = ref(true);

let resizeObserver: ResizeObserver | null = null;
let cachedOceanTextureUrl: string | null = null;

// Fast normalized lookup sets for favorites and planned trips
const favoriteLookup = computed(() => {
  const slugs = new Set<string>();
  const isos = new Set<string>();
  const names = new Set<string>();

  for (const rawSlug of props.favoriteSlugs) {
    const clean = rawSlug.trim().toLowerCase();
    if (!clean) continue;
    slugs.add(clean);
    const matched = props.countries.find((c) => c.slug.toLowerCase() === clean);
    if (matched) {
      isos.add(matched.isoNumeric.padStart(3, '0'));
      names.add(matched.nameRu.toLowerCase());
      names.add(matched.nameEn.toLowerCase());
    }
  }

  return { slugs, isos, names };
});

const plannedLookup = computed(() => {
  const slugs = new Set<string>();
  const isos = new Set<string>();
  const names = new Set<string>();

  for (const rawName of props.plannedCountryNames) {
    const clean = rawName.trim().toLowerCase();
    if (!clean) continue;
    names.add(clean);
    const matched = props.countries.find(
      (c) =>
        c.nameRu.toLowerCase() === clean ||
        c.nameEn.toLowerCase() === clean ||
        c.slug.toLowerCase() === clean
    );
    if (matched) {
      slugs.add(matched.slug.toLowerCase());
      isos.add(matched.isoNumeric.padStart(3, '0'));
      names.add(matched.nameRu.toLowerCase());
      names.add(matched.nameEn.toLowerCase());
    }
  }

  return { slugs, isos, names };
});

function isFeatureSelected(feat: GlobePolygonFeature): boolean {
  if (!props.selectedCountry) return false;
  const selIso = props.selectedCountry.isoNumeric.padStart(3, '0');
  if (feat.properties.isoNumeric === selIso) return true;
  if (feat.properties.slug && feat.properties.slug === props.selectedCountry.slug) return true;
  if (feat.properties.nameRu.toLowerCase() === props.selectedCountry.nameRu.toLowerCase()) return true;
  return feat.properties.name.toLowerCase() === props.selectedCountry.nameEn.toLowerCase();
}

function isFeatureHovered(feat: GlobePolygonFeature): boolean {
  return Boolean(hoveredFeature.value && hoveredFeature.value.id === feat.id);
}

function isFeaturePlanned(feat: GlobePolygonFeature): boolean {
  const { slugs, isos, names } = plannedLookup.value;
  if (isos.size === 0 && names.size === 0) return false;
  const iso = feat.properties.isoNumeric.padStart(3, '0');
  if (isos.has(iso)) return true;
  if (feat.properties.slug && slugs.has(feat.properties.slug.toLowerCase())) return true;
  if (names.has(feat.properties.nameRu.toLowerCase())) return true;
  return names.has(feat.properties.name.toLowerCase());
}

function isFeatureFavorite(feat: GlobePolygonFeature): boolean {
  const { slugs, isos, names } = favoriteLookup.value;
  if (slugs.size === 0 && isos.size === 0) return false;
  const iso = feat.properties.isoNumeric.padStart(3, '0');
  if (isos.has(iso)) return true;
  if (feat.properties.slug && slugs.has(feat.properties.slug.toLowerCase())) return true;
  if (names.has(feat.properties.nameRu.toLowerCase())) return true;
  return names.has(feat.properties.name.toLowerCase());
}

function isCountryPlanned(country: CountryData | null): boolean {
  if (!country) return false;
  const { slugs, isos, names } = plannedLookup.value;
  return (
    slugs.has(country.slug.toLowerCase()) ||
    isos.has(country.isoNumeric.padStart(3, '0')) ||
    names.has(country.nameRu.toLowerCase()) ||
    names.has(country.nameEn.toLowerCase())
  );
}

function isCountryFavorite(country: CountryData | null): boolean {
  if (!country) return false;
  const { slugs, isos, names } = favoriteLookup.value;
  return (
    slugs.has(country.slug.toLowerCase()) ||
    isos.has(country.isoNumeric.padStart(3, '0')) ||
    names.has(country.nameRu.toLowerCase())
  );
}

function doesFeatureMatchLegendState(feat: GlobePolygonFeature, state: GlobeColorState): boolean {
  switch (state) {
    case 'selected':
      return isFeatureSelected(feat);
    case 'hovered':
      return isFeatureHovered(feat);
    case 'planned':
      return isFeaturePlanned(feat);
    case 'favorite':
      return isFeatureFavorite(feat);
    case 'default':
      return !isFeatureSelected(feat) && !isFeaturePlanned(feat) && !isFeatureFavorite(feat);
  }
}

/**
 * Resolves the polygon color according to the required color system and priority rules:
 * 1. Selected country -> Orange (#f97316). Retains selection even when cursor moves over other countries or itself.
 * 2. Hovered country -> Sky Blue (#38bdf8).
 * 3. Planned trip country -> Green (#22c55e). Takes priority over Favorite color.
 * 4. Favorite country -> Purple (#a855f7).
 * 5. Normal country -> Gray (#94a3b8).
 */
function resolvePolygonCapColor(feat: GlobePolygonFeature): string {
  const highlight = activeLegendHighlight.value;
  if (highlight) {
    if (doesFeatureMatchLegendState(feat, highlight)) {
      return GLOBE_COLORS[highlight];
    }
    // Keep selected country subtly recognizable even while previewing another legend filter
    if (isFeatureSelected(feat)) {
      return GLOBE_COLORS.selected;
    }
    return 'rgba(71, 85, 105, 0.38)';
  }

  if (isFeatureSelected(feat)) return GLOBE_COLORS.selected;
  if (isFeatureHovered(feat)) return GLOBE_COLORS.hovered;
  if (isFeaturePlanned(feat)) return GLOBE_COLORS.planned;
  if (isFeatureFavorite(feat)) return GLOBE_COLORS.favorite;
  return GLOBE_COLORS.default;
}

function resolvePolygonAltitude(feat: GlobePolygonFeature): number {
  const highlight = activeLegendHighlight.value;
  if (highlight) {
    if (doesFeatureMatchLegendState(feat, highlight)) {
      return 0.052;
    }
    if (isFeatureSelected(feat)) {
      return 0.035;
    }
    return 0.007;
  }

  if (isFeatureSelected(feat)) return 0.05;
  if (isFeatureHovered(feat)) return 0.032;
  if (isFeaturePlanned(feat)) return 0.022;
  if (isFeatureFavorite(feat)) return 0.018;
  return 0.01;
}

const plannedCountriesCount = computed(() => {
  const features = getWorldGeoFeatures(props.countries);
  return features.filter((f) => isFeaturePlanned(f)).length;
});

const favoriteCountriesCount = computed(() => {
  const features = getWorldGeoFeatures(props.countries);
  return features.filter((f) => isFeatureFavorite(f)).length;
});

const bothPlannedAndFavoriteFeatures = computed(() => {
  const features = getWorldGeoFeatures(props.countries);
  return features.filter((f) => isFeaturePlanned(f) && isFeatureFavorite(f));
});

const activeLegendMeta = computed(() => {
  if (!activeLegendHighlight.value) return null;
  return GLOBE_LEGEND_ITEMS.find((i) => i.id === activeLegendHighlight.value) || null;
});

function getOceanTextureDataUrl(): string {
  if (cachedOceanTextureUrl) return cachedOceanTextureUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.22, '#0c4a6e');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(0.78, '#0c4a6e');
    grad.addColorStop(1, '#082f49');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

function buildPolygonTooltipHtml(d: GlobePolygonFeature): string {
  const selected = isFeatureSelected(d);
  const planned = isFeaturePlanned(d);
  const favorite = isFeatureFavorite(d);

  const badges: string[] = [];
  if (selected) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;background:rgba(249,115,22,0.22);border:1px solid rgba(249,115,22,0.6);color:#fdba74;font-size:10px;font-weight:700;">● Выбрана</span>`
    );
  }
  if (planned) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;background:rgba(34,197,94,0.22);border:1px solid rgba(34,197,94,0.6);color:#86efac;font-size:10px;font-weight:700;">✈ Запланирована поездка</span>`
    );
  }
  if (favorite) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;background:rgba(168,85,247,0.25);border:1px solid rgba(168,85,247,0.65);color:#d8b4fe;font-size:10px;font-weight:700;">♥ В избранном</span>`
    );
  }

  const badgesRow =
    badges.length > 0
      ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${badges.join('')}</div>`
      : '';

  const borderColor = selected
    ? GLOBE_COLORS.selected
    : planned
      ? GLOBE_COLORS.planned
      : favorite
        ? GLOBE_COLORS.favorite
        : GLOBE_COLORS.hovered;

  return `
    <div style="background: rgba(15, 23, 42, 0.94); color: #fff; padding: 9px 13px; border-radius: 12px; font-family: Inter, system-ui, sans-serif; font-size: 13px; box-shadow: 0 10px 25px rgba(0,0,0,0.35); border: 1px solid ${borderColor}; max-width: 260px;">
      <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
        <span>${d.properties.flagEmoji}</span>
        <span>${d.properties.nameRu}</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
        ${d.properties.name} • ${selected ? 'Текущий выбор' : 'Нажмите для выбора'}
      </div>
      ${badgesRow}
    </div>
  `;
}

function updateMarkersForCombinedStates() {
  const g = globeInstance.value;
  if (!g || typeof g.htmlElementsData !== 'function') return;

  // Show an unobtrusive floating ♥ badge over countries that have BOTH a planned trip (green) and are in favorites
  const markers = bothPlannedAndFavoriteFeatures.value.map((feat) => {
    const matchedCatalog = props.countries.find(
      (c) =>
        c.isoNumeric.padStart(3, '0') === feat.properties.isoNumeric ||
        (feat.properties.slug && c.slug === feat.properties.slug)
    );
    const coords = matchedCatalog?.coordinates || computeFeatureCentroid(feat);
    return {
      id: feat.id,
      lat: coords.lat,
      lng: coords.lng,
      nameRu: feat.properties.nameRu,
      flagEmoji: feat.properties.flagEmoji,
    };
  });

  g.htmlElementsData(markers)
    .htmlLat((m: any) => m.lat)
    .htmlLng((m: any) => m.lng)
    .htmlAltitude(0.055)
    .htmlElement((m: any) => {
      const el = document.createElement('div');
      el.style.pointerEvents = 'none';
      el.innerHTML = `
        <div title="${m.nameRu}: запланирована поездка + в избранном" style="display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:999px;background:rgba(15,23,42,0.88);border:1.5px solid ${GLOBE_COLORS.favorite};color:#e9d5ff;font-size:10px;font-weight:700;box-shadow:0 4px 10px rgba(0,0,0,0.35);transform:translate(-50%,-50%);white-space:nowrap;">
          <span style="color:${GLOBE_COLORS.planned};font-size:10px;">✈</span>
          <span style="color:${GLOBE_COLORS.favorite};font-size:11px;">♥</span>
        </div>
      `;
      return el;
    });
}

function updatePolygonsVisuals() {
  const g = globeInstance.value;
  if (!g) return;

  g.polygonAltitude((d: GlobePolygonFeature) => resolvePolygonAltitude(d))
    .polygonCapColor((d: GlobePolygonFeature) => resolvePolygonCapColor(d))
    .polygonLabel((d: GlobePolygonFeature) => buildPolygonTooltipHtml(d));

  updateMarkersForCombinedStates();
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
    const height = el.clientHeight || 500;

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
      .polygonsTransitionDuration(240)
      .polygonSideColor(() => 'rgba(15, 23, 42, 0.38)')
      .polygonStrokeColor(() => '#0f172a')
      .polygonLabel((d: GlobePolygonFeature) => buildPolygonTooltipHtml(d))
      .onPolygonHover((hoverD: GlobePolygonFeature | null) => {
        hoveredFeature.value = hoverD;
        if (el) {
          el.style.cursor = hoverD ? 'pointer' : 'grab';
        }
        const controls = instance.controls();
        if (controls) {
          controls.autoRotate = isAutoRotating.value && !hoverD && !activeLegendHighlight.value;
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
  () => [props.countries, props.favoriteSlugs, props.plannedCountryNames],
  () => {
    if (globeInstance.value && props.countries.length > 0) {
      const features = getWorldGeoFeatures(props.countries);
      globeInstance.value.polygonsData(features);
      updatePolygonsVisuals();
    }
  },
  { deep: true }
);

watch(activeLegendHighlight, (state) => {
  const controls = globeInstance.value?.controls?.();
  if (controls) {
    controls.autoRotate = isAutoRotating.value && !state && !hoveredFeature.value;
  }
  updatePolygonsVisuals();
});

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
    class="w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 border border-slate-800/80 shadow-xl flex flex-col justify-between select-none"
  >
    <!-- 3D Globe Viewport Section -->
    <div class="relative w-full h-[380px] sm:h-[460px] lg:h-[510px] overflow-hidden">
      <!-- Decorative Starry/Atmospheric Backdrop -->
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.16)_0%,_rgba(15,23,42,0)_70%)]"
      />

      <!-- Top Hovered / Selected Status Pill -->
      <div class="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div
          class="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 shadow-lg"
        >
          <Sparkles class="w-3.5 h-3.5 text-sky-400 shrink-0" />

          <template v-if="activeLegendMeta">
            <span>
              Подсветка категории:
              <strong class="text-white">{{ activeLegendMeta.colorName }} — {{ activeLegendMeta.label }}</strong>
            </span>
          </template>

          <template v-else-if="hoveredFeature">
            <span>
              Курсор:
              <strong class="text-sky-300">
                {{ hoveredFeature.properties.flagEmoji }} {{ hoveredFeature.properties.nameRu }}
              </strong>
            </span>
            <span
              v-if="isFeaturePlanned(hoveredFeature)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
            >
              <PlaneTakeoff class="w-3 h-3" />
              Поездка
            </span>
            <span
              v-if="isFeatureFavorite(hoveredFeature)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/25 text-purple-300 border border-purple-400/40"
            >
              <Heart class="w-3 h-3 fill-current" />
              В избранном
            </span>
          </template>

          <template v-else-if="selectedCountry">
            <span>
              Выбрано:
              <strong class="text-orange-300">
                {{ selectedCountry.flagEmoji }} {{ selectedCountry.nameRu }}
              </strong>
            </span>
            <span
              v-if="isCountryPlanned(selectedCountry)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
            >
              <PlaneTakeoff class="w-3 h-3" />
              Запланирована поездка
            </span>
            <span
              v-if="isCountryFavorite(selectedCountry)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/25 text-purple-300 border border-purple-400/40"
            >
              <Heart class="w-3 h-3 fill-current" />
              В избранном
            </span>
          </template>

          <span v-else>
            Вращайте глобус и нажмите на любую страну
          </span>
        </div>

        <!-- Always-visible persistent Selected Country Badge when hovering other countries -->
        <div
          v-if="selectedCountry && hoveredFeature && !isFeatureSelected(hoveredFeature)"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-orange-500/50 text-[11px] text-orange-200 shadow"
        >
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: GLOBE_COLORS.selected }"
          />
          <span>Активный выбор:</span>
          <strong class="text-white">{{ selectedCountry.flagEmoji }} {{ selectedCountry.nameRu }}</strong>
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
      <div class="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div class="text-[11px] text-slate-400 hidden sm:block bg-slate-900/65 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800">
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

    <!-- Visual Interactive Globe Legend (Bottom of the Globe) -->
    <GlobeLegend
      v-model:activeHighlight="activeLegendHighlight"
      :plannedCount="plannedCountriesCount"
      :favoriteCount="favoriteCountriesCount"
      :bothPlannedAndFavoriteCount="bothPlannedAndFavoriteFeatures.length"
      :hasSelectedCountry="Boolean(selectedCountry)"
    />
  </div>
</template>
