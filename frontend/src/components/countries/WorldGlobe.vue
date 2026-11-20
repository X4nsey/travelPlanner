<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  shallowRef,
  nextTick,
} from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  GLOBE_RADIUS,
  COUNTRIES_RADIUS,
  PIN_RADIUS,
  ATMOSPHERE_RADIUS,
  SELECTED_OUTLINE_INITIAL_VERTEX_CAPACITY,
  getCountriesSurfaceData,
  getWorldBordersPositions,
  getFeatureOutlinePositions,
  pickCountryIdByRay,
  createOceanCanvasTexture,
  createAtmosphereMaterial,
  latLngToVec3,
  vec3ToLatLng,
  type CachedCountriesSurfaceData,
} from '@/services/globeMeshBuilder';
import {
  GLOBE_COLORS,
  GLOBE_LEGEND_ITEMS,
  type GlobeColorState,
} from '@/constants/globe-colors';
import CountryFlag from '@/components/ui/CountryFlag.vue';
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

const MIN_CAMERA_DISTANCE = 145;
const MAX_CAMERA_DISTANCE = 420;
const POINTER_PICK_THROTTLE_MS = 40;
const WHEEL_COOLDOWN_MS = 140;
const DRAG_THRESHOLD_PX = 5;
const MAX_FRAME_DELTA_SEC = 0.05;
const DIMMED_LEGEND_COLOR = '#334155';

// Lightweight Vue reactive UI state (NO Three.js objects in Vue reactivity)
const viewportRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const hoveredFeature = shallowRef<GlobePolygonFeature | null>(null);
const activeLegendHighlight = ref<GlobeColorState | null>(null);
const isAutoRotating = ref(true);
const isWebGlSupported = ref(true);
const isPointerInteracting = ref(false);

// Plain non-reactive Three.js & runtime state (completely outside Vue reactivity; never read refs in tick)
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let oceanTexture: THREE.CanvasTexture | null = null;
let countriesMesh: THREE.Mesh | null = null;
let countriesColorAttr: THREE.BufferAttribute | null = null;
let bordersLines: THREE.LineSegments | null = null;
let selectedOutlineLines: THREE.LineSegments | null = null;
let selectedOutlinePosAttr: THREE.BufferAttribute | null = null;
let atmosphereMesh: THREE.Mesh | null = null;
let surfaceData: CachedCountriesSurfaceData | null = null;
let featureById = new Map<string, GlobePolygonFeature>();
let currentSelectedFeatureId: string | null = null;
let currentHoveredFeatureId: string | null = null;

// Plain non-reactive mirrors of UI flags for zero-reactivity access inside tick()
let autoRotateEnabled = true;
let hasLegendHighlight = false;

// Reusable scratch objects (zero per-frame / per-move allocations)
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const pickSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), COUNTRIES_RADIUS);
const hitScratch = new THREE.Vector3();
const colorScratch = new THREE.Color();
const pinWorldScratch = new THREE.Vector3();
const pinNdcScratch = new THREE.Vector3();
const camDirScratch = new THREE.Vector3();
const flightDirScratch = new THREE.Vector3();
const lastCameraMatrix = new Float32Array(16);
let hasCameraMatrixSnapshot = false;

// Single-rAF render loop & lifecycle state (strictly at most ONE active rAF at any time)
let rafId: number | null = null;
let isInsideFrame = false;
let lastFrameTime: number | null = null;
let needsRender = false;
let dampingTailFrames = 0;
let isInViewport = true;
let isPageVisible = typeof document !== 'undefined' ? !document.hidden : true;
let containerWidth = 600;
let containerHeight = 500;
let cachedContainerRect: DOMRect | null = null;
let cachedTooltipWidth = 220;
let cachedTooltipHeight = 72;

// Pointer interaction & throttling state
let isPointerDown = false;
let isDragging = false;
let isControlsActive = false;
let isWheelZooming = false;
let pointerDownX = 0;
let pointerDownY = 0;
let lastPickTimestamp = 0;
let wheelCooldownTimer: ReturnType<typeof setTimeout> | null = null;

// Single unified camera flight state (stepped inside tick(), never spawns its own rAF)
interface CameraFlight {
  startTime: number | null;
  duration: number;
  startDir: THREE.Vector3;
  endDir: THREE.Vector3;
  startDist: number;
  endDist: number;
  angle: number;
  fallbackAxis: THREE.Vector3;
}
let activeFlight: CameraFlight | null = null;

// Observers & direct-DOM 2D pin cache (no layout thrashing or redundant style writes)
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
const pinElementMap = new Map<string, HTMLElement>();

interface CombinedPinMeta {
  id: string;
  nameRu: string;
  worldPos: THREE.Vector3;
  unitNormal: THREE.Vector3;
  lastVisible: boolean;
  lastOpacity: string;
  lastX: number;
  lastY: number;
}
let combinedPinMetas: CombinedPinMeta[] = [];

// Memoized world features
const worldFeatures = computed(() => getWorldGeoFeatures(props.countries));

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
  return currentHoveredFeatureId !== null && currentHoveredFeatureId === feat.id;
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
 * Resolves the polygon color according to the color priority system:
 * 1. Selected country -> Orange (#f97316)
 * 2. Hovered country -> Sky Blue (#38bdf8)
 * 3. Planned trip country -> Green (#22c55e)
 * 4. Favorite country -> Purple (#a855f7)
 * 5. Normal country -> Gray (#94a3b8)
 */
function resolvePolygonHexColor(feat: GlobePolygonFeature): string {
  const highlight = activeLegendHighlight.value;
  if (highlight) {
    if (doesFeatureMatchLegendState(feat, highlight)) {
      return GLOBE_COLORS[highlight];
    }
    if (isFeatureSelected(feat)) {
      return GLOBE_COLORS.selected;
    }
    return DIMMED_LEGEND_COLOR;
  }

  if (isFeatureSelected(feat)) return GLOBE_COLORS.selected;
  if (isFeatureHovered(feat)) return GLOBE_COLORS.hovered;
  if (isFeaturePlanned(feat)) return GLOBE_COLORS.planned;
  if (isFeatureFavorite(feat)) return GLOBE_COLORS.favorite;
  return GLOBE_COLORS.default;
}

const plannedCountriesCount = computed(() =>
  worldFeatures.value.filter((f) => isFeaturePlanned(f)).length
);

const favoriteCountriesCount = computed(() =>
  worldFeatures.value.filter((f) => isFeatureFavorite(f)).length
);

const bothPlannedAndFavoriteFeatures = computed(() =>
  worldFeatures.value.filter((f) => isFeaturePlanned(f) && isFeatureFavorite(f))
);

const activeLegendMeta = computed(() => {
  if (!activeLegendHighlight.value) return null;
  return GLOBE_LEGEND_ITEMS.find((i) => i.id === activeLegendHighlight.value) || null;
});

const tooltipBorderColor = computed(() => {
  const feat = hoveredFeature.value;
  if (!feat) return GLOBE_COLORS.hovered;
  if (isFeatureSelected(feat)) return GLOBE_COLORS.selected;
  if (isFeaturePlanned(feat)) return GLOBE_COLORS.planned;
  if (isFeatureFavorite(feat)) return GLOBE_COLORS.favorite;
  return GLOBE_COLORS.hovered;
});

function setPinElementRef(id: string, el: unknown) {
  if (el instanceof HTMLElement) {
    pinElementMap.set(id, el);
  } else {
    pinElementMap.delete(id);
  }
}

function rebuildCombinedPinMetas() {
  combinedPinMetas = bothPlannedAndFavoriteFeatures.value.map((feat) => {
    const matchedCatalog = props.countries.find(
      (c) =>
        c.isoNumeric.padStart(3, '0') === feat.properties.isoNumeric ||
        (feat.properties.slug && c.slug === feat.properties.slug)
    );
    const coords = matchedCatalog?.coordinates || computeFeatureCentroid(feat);
    const worldPos = latLngToVec3(coords.lat, coords.lng, PIN_RADIUS, new THREE.Vector3());
    const unitNormal = worldPos.clone().normalize();
    return {
      id: feat.id,
      nameRu: feat.properties.nameRu,
      worldPos,
      unitNormal,
      lastVisible: false,
      lastOpacity: '0',
      lastX: NaN,
      lastY: NaN,
    };
  });

  nextTick(() => {
    update2DPinTransforms(true);
  });
}

function update2DPinTransforms(force = false) {
  if (!camera || combinedPinMetas.length === 0) return;

  camDirScratch.copy(camera.position).normalize();
  const halfW = containerWidth * 0.5;
  const halfH = containerHeight * 0.5;

  for (let i = 0; i < combinedPinMetas.length; i++) {
    const pin = combinedPinMetas[i];
    const el = pinElementMap.get(pin.id);
    if (!el) continue;

    const facingDot = pin.unitNormal.dot(camDirScratch);
    const visible = facingDot >= 0.12;

    if (!visible) {
      if (force || pin.lastVisible) {
        pin.lastVisible = false;
        pin.lastOpacity = '0';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
      }
      continue;
    }

    pinNdcScratch.copy(pinWorldScratch.copy(pin.worldPos)).project(camera);
    const x = Math.round((pinNdcScratch.x + 1) * halfW * 2) * 0.5;
    const y = Math.round((-pinNdcScratch.y + 1) * halfH * 2) * 0.5;
    const opacity =
      facingDot < 0.25 ? ((facingDot - 0.12) / 0.13).toFixed(2) : '1';

    if (force || !pin.lastVisible) {
      pin.lastVisible = true;
      el.style.visibility = 'visible';
    }
    if (force || opacity !== pin.lastOpacity) {
      pin.lastOpacity = opacity;
      el.style.opacity = opacity;
    }
    if (force || x !== pin.lastX || y !== pin.lastY) {
      pin.lastX = x;
      pin.lastY = y;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }
  }
}

function paintFeatureColor(featureId: string | null): boolean {
  if (!featureId || !countriesColorAttr || !surfaceData) return false;
  const feat = featureById.get(featureId);
  const range = surfaceData.featureVertexRanges.get(featureId);
  if (!feat || !range) return false;

  colorScratch.set(resolvePolygonHexColor(feat));
  const arr = countriesColorAttr.array as Float32Array;
  const end = range.start + range.count;
  for (let v = range.start; v < end; v++) {
    const idx = v * 3;
    arr[idx] = colorScratch.r;
    arr[idx + 1] = colorScratch.g;
    arr[idx + 2] = colorScratch.b;
  }
  return true;
}

function paintAllFeaturesColors() {
  if (!countriesColorAttr || !surfaceData) return;

  const arr = countriesColorAttr.array as Float32Array;
  let nextSelectedId: string | null = null;

  for (const [id, feat] of featureById) {
    if (isFeatureSelected(feat)) {
      nextSelectedId = id;
    }
    const range = surfaceData.featureVertexRanges.get(id);
    if (!range) continue;

    colorScratch.set(resolvePolygonHexColor(feat));
    const end = range.start + range.count;
    for (let v = range.start; v < end; v++) {
      const idx = v * 3;
      arr[idx] = colorScratch.r;
      arr[idx + 1] = colorScratch.g;
      arr[idx + 2] = colorScratch.b;
    }
  }

  currentSelectedFeatureId = nextSelectedId;
  countriesColorAttr.needsUpdate = true;
  updateSelectedCountryOutline(nextSelectedId);
  requestRender();
}

/**
 * Reuses the single pre-allocated selectedOutlineLines mesh & dynamic GPU buffer
 * via setDrawRange() — zero geometry/material creation or disposal on country clicks.
 */
function updateSelectedCountryOutline(selectedId: string | null) {
  if (!selectedOutlineLines || !selectedOutlinePosAttr) return;

  if (!selectedId) {
    selectedOutlineLines.visible = false;
    selectedOutlineLines.geometry.setDrawRange(0, 0);
    return;
  }

  const feat = featureById.get(selectedId);
  if (!feat) {
    selectedOutlineLines.visible = false;
    selectedOutlineLines.geometry.setDrawRange(0, 0);
    return;
  }

  const positions = getFeatureOutlinePositions(feat);
  const vertexCount = positions.length / 3;
  if (vertexCount === 0) {
    selectedOutlineLines.visible = false;
    selectedOutlineLines.geometry.setDrawRange(0, 0);
    return;
  }

  // Grow buffer only in the unlikely event a feature exceeds pre-allocated capacity
  if (positions.length > (selectedOutlinePosAttr.array as Float32Array).length) {
    const nextArray = new Float32Array(positions.length);
    nextArray.set(positions);
    selectedOutlinePosAttr = new THREE.BufferAttribute(nextArray, 3);
    selectedOutlinePosAttr.setUsage(THREE.DynamicDrawUsage);
    selectedOutlineLines.geometry.setAttribute('position', selectedOutlinePosAttr);
  } else {
    (selectedOutlinePosAttr.array as Float32Array).set(positions);
    selectedOutlinePosAttr.needsUpdate = true;
  }

  selectedOutlineLines.geometry.setDrawRange(0, vertexCount);
  selectedOutlineLines.visible = true;
}

// Pure non-reactive check (safe to call inside tick() every frame)
function shouldAutoRotateNow(): boolean {
  return (
    autoRotateEnabled &&
    currentHoveredFeatureId === null &&
    !hasLegendHighlight &&
    !isControlsActive &&
    activeFlight === null
  );
}

function syncAutoRotate() {
  if (!controls) return;
  const active = shouldAutoRotateNow();
  controls.autoRotate = active;
  if (active) {
    scheduleFrame();
  }
}

function hasCameraMatrixChanged(): boolean {
  if (!camera) return false;
  const elems = camera.matrixWorldInverse.elements;
  if (!hasCameraMatrixSnapshot) {
    lastCameraMatrix.set(elems);
    hasCameraMatrixSnapshot = true;
    return true;
  }

  let changed = false;
  for (let i = 0; i < 16; i++) {
    if (Math.abs(elems[i] - lastCameraMatrix[i]) > 1e-6) {
      changed = true;
      break;
    }
  }
  if (changed) {
    lastCameraMatrix.set(elems);
  }
  return changed;
}

function updateDynamicControlSpeeds() {
  if (!camera || !controls) return;
  const dist = camera.position.length();
  const altitude = Math.max(0.25, (dist - GLOBE_RADIUS) / GLOBE_RADIUS);
  controls.rotateSpeed = Math.max(0.32, Math.min(0.85, altitude * 0.42));
  controls.zoomSpeed = Math.max(0.55, Math.min(1.05, Math.sqrt(altitude) * 0.65));
}

// Flight step status codes (avoids per-frame object allocation in tick)
const FLIGHT_IDLE = 0;
const FLIGHT_ACTIVE = 1;
const FLIGHT_FINISHED = 2;

function syncControlsToCameraWithoutInertia() {
  if (!controls || !camera) return;
  const savedX = camera.position.x;
  const savedY = camera.position.y;
  const savedZ = camera.position.z;
  const prevDamping = controls.enableDamping;
  const prevAutoRotate = controls.autoRotate;
  const prevInside = isInsideFrame;

  isInsideFrame = true;
  try {
    // First update(0) with damping=false flushes any residual _sphericalDelta / _panOffset
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.update(0);
    // Restore exact camera position and sync OrbitControls internal spherical state to it
    camera.position.set(savedX, savedY, savedZ);
    camera.lookAt(0, 0, 0);
    controls.update(0);
  } finally {
    controls.enableDamping = prevDamping;
    controls.autoRotate = prevAutoRotate;
    isInsideFrame = prevInside;
  }
}

function stepCameraFlight(now: number): number {
  if (!activeFlight || !camera) return FLIGHT_IDLE;

  if (activeFlight.startTime === null) {
    activeFlight.startTime = now;
  }

  const elapsed = Math.max(0, now - activeFlight.startTime);
  const rawT = activeFlight.duration <= 0 ? 1 : Math.min(1, elapsed / activeFlight.duration);
  // Cubic ease-in-out
  const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

  const dist = activeFlight.startDist + (activeFlight.endDist - activeFlight.startDist) * t;

  if (activeFlight.angle < 1e-4) {
    flightDirScratch.copy(activeFlight.endDir);
  } else if (activeFlight.angle > Math.PI - 0.02) {
    flightDirScratch
      .copy(activeFlight.startDir)
      .applyAxisAngle(activeFlight.fallbackAxis, activeFlight.angle * t)
      .normalize();
  } else {
    const sinA = Math.sin(activeFlight.angle);
    const w0 = Math.sin((1 - t) * activeFlight.angle) / sinA;
    const w1 = Math.sin(t * activeFlight.angle) / sinA;
    flightDirScratch
      .set(
        activeFlight.startDir.x * w0 + activeFlight.endDir.x * w1,
        activeFlight.startDir.y * w0 + activeFlight.endDir.y * w1,
        activeFlight.startDir.z * w0 + activeFlight.endDir.z * w1
      )
      .normalize();
  }

  camera.position.copy(flightDirScratch).multiplyScalar(dist);
  camera.lookAt(0, 0, 0);

  if (rawT >= 1) {
    activeFlight = null;
    return FLIGHT_FINISHED;
  }
  return FLIGHT_ACTIVE;
}

function tick(now: number) {
  // Always clear rafId first before doing any work
  rafId = null;

  if (!renderer || !scene || !camera || !controls) {
    lastFrameTime = null;
    return;
  }
  if (!isInViewport || !isPageVisible) {
    lastFrameTime = null;
    return;
  }

  const deltaSec =
    lastFrameTime === null
      ? 1 / 60
      : Math.min(Math.max((now - lastFrameTime) / 1000, 0), MAX_FRAME_DELTA_SEC);
  lastFrameTime = now;

  let flightState = FLIGHT_IDLE;
  let controlsMoved = false;

  // Guard against re-entrant scheduleFrame() calls (e.g. from OrbitControls 'change' event)
  isInsideFrame = true;
  try {
    flightState = stepCameraFlight(now);

    if (flightState === FLIGHT_FINISHED) {
      // Flush stale OrbitControls damping velocity and sync spherical state cleanly to landed camera
      syncControlsToCameraWithoutInertia();
      controls.autoRotate = shouldAutoRotateNow();
    } else if (flightState === FLIGHT_IDLE) {
      controls.autoRotate = shouldAutoRotateNow();
      controlsMoved = controls.update(deltaSec);
    }

    camera.updateMatrixWorld();

    const camChanged = hasCameraMatrixChanged();
    if (camChanged) {
      updateDynamicControlSpeeds();
    }

    if (camChanged || needsRender || flightState !== FLIGHT_IDLE) {
      renderer.render(scene, camera);
      if (camChanged) {
        update2DPinTransforms();
      }
      needsRender = false;
    }

    if (camChanged || controlsMoved) {
      dampingTailFrames = 3;
    } else if (dampingTailFrames > 0) {
      dampingTailFrames -= 1;
    }
  } finally {
    isInsideFrame = false;
  }

  const shouldKeepRunning =
    shouldAutoRotateNow() ||
    flightState === FLIGHT_ACTIVE ||
    isControlsActive ||
    dampingTailFrames > 0 ||
    needsRender;

  if (shouldKeepRunning) {
    scheduleFrame();
  } else {
    lastFrameTime = null;
  }
}

/**
 * Strictly schedules at most ONE requestAnimationFrame callback at any time.
 */
function scheduleFrame() {
  if (!renderer || !isInViewport || !isPageVisible) return;
  if (isInsideFrame || rafId !== null) return;
  rafId = requestAnimationFrame(tick);
}

function requestRender() {
  needsRender = true;
  scheduleFrame();
}

function stopRenderLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastFrameTime = null;
}

function focusOnCoordinates(lat: number, lng: number, altitude = 1.75, duration = 850) {
  if (!camera) return;

  const clampedLat = Math.max(-85, Math.min(85, lat));
  const targetDist = Math.min(
    MAX_CAMERA_DISTANCE,
    Math.max(MIN_CAMERA_DISTANCE, GLOBE_RADIUS * (1 + altitude))
  );
  const endDir = latLngToVec3(clampedLat, lng, 1, new THREE.Vector3()).normalize();

  if (duration <= 0) {
    activeFlight = null;
    camera.position.copy(endDir).multiplyScalar(targetDist);
    camera.lookAt(0, 0, 0);
    syncControlsToCameraWithoutInertia();
    requestRender();
    return;
  }

  const startDist = camera.position.length() || targetDist;
  const startDir = camera.position.clone().normalize();
  const dot = Math.max(-1, Math.min(1, startDir.dot(endDir)));
  const angle = Math.acos(dot);

  const fallbackAxis = new THREE.Vector3(0, 1, 0).cross(startDir);
  if (fallbackAxis.lengthSq() < 1e-4) {
    fallbackAxis.set(1, 0, 0);
  } else {
    fallbackAxis.normalize();
  }

  activeFlight = {
    startTime: null,
    duration,
    startDir,
    endDir,
    startDist,
    endDist: targetDist,
    angle,
    fallbackAxis,
  };

  if (controls) {
    controls.autoRotate = false;
  }
  requestRender();
}

function getContainerRect(): DOMRect | null {
  if (!containerRef.value) return null;
  if (!cachedContainerRect) {
    cachedContainerRect = containerRef.value.getBoundingClientRect();
  }
  return cachedContainerRect;
}

function invalidateContainerRect() {
  cachedContainerRect = null;
}

function pickCountryIdAtClientCoords(clientX: number, clientY: number): string | null {
  if (!camera || !surfaceData) return null;
  const rect = getContainerRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) return null;

  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
    return null;
  }

  pointerNdc.set((localX / rect.width) * 2 - 1, -(localY / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointerNdc, camera);
  return pickCountryIdByRay(raycaster.ray, pickSphere, surfaceData.pickData, hitScratch);
}

function measureTooltipSizeOnce() {
  const tipEl = tooltipRef.value;
  if (!tipEl) return;
  if (tipEl.offsetWidth > 0) cachedTooltipWidth = tipEl.offsetWidth;
  if (tipEl.offsetHeight > 0) cachedTooltipHeight = tipEl.offsetHeight;
}

function positionTooltipDirect(clientX: number, clientY: number) {
  const tipEl = tooltipRef.value;
  const rect = getContainerRect();
  if (!tipEl || !rect) return;

  const localX = clientX - rect.left;
  const localY = clientY - rect.top;

  let tx = localX + 16;
  let ty = localY + 16;

  if (tx + cachedTooltipWidth + 12 > rect.width) {
    tx = Math.max(12, localX - cachedTooltipWidth - 16);
  }
  if (ty + cachedTooltipHeight + 12 > rect.height) {
    ty = Math.max(12, localY - cachedTooltipHeight - 16);
  }

  tipEl.style.transform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`;
}

function applyHoveredCountryId(nextId: string | null) {
  if (nextId === currentHoveredFeatureId) return;

  const prevId = currentHoveredFeatureId;
  currentHoveredFeatureId = nextId;

  const nextFeat = nextId ? featureById.get(nextId) ?? null : null;
  hoveredFeature.value = nextFeat;

  if (containerRef.value) {
    containerRef.value.style.cursor = nextFeat ? 'pointer' : 'grab';
  }

  // O(1) incremental vertex-color repaint: ONLY touch previous & newly hovered country
  let dirty = false;
  if (prevId && paintFeatureColor(prevId)) dirty = true;
  if (nextId && paintFeatureColor(nextId)) dirty = true;
  if (dirty && countriesColorAttr) {
    countriesColorAttr.needsUpdate = true;
    requestRender();
  }

  syncAutoRotate();
}

function handlePointerDown(event: PointerEvent) {
  invalidateContainerRect();
  isPointerDown = true;
  isDragging = false;
  pointerDownX = event.clientX;
  pointerDownY = event.clientY;
  activeFlight = null;
}

function handlePointerMove(event: PointerEvent) {
  if (isPointerDown) {
    const dx = event.clientX - pointerDownX;
    const dy = event.clientY - pointerDownY;
    if (!isDragging && dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      isDragging = true;
      isPointerInteracting.value = true;
      if (currentHoveredFeatureId !== null) {
        applyHoveredCountryId(null);
      }
    }
    return;
  }

  // Disable raycasting completely during active OrbitControls drag or wheel zoom
  if (isControlsActive || isWheelZooming) {
    return;
  }

  // Track cursor smoothly via direct DOM transform (no layout reads on pointermove)
  if (currentHoveredFeatureId !== null) {
    positionTooltipDirect(event.clientX, event.clientY);
  }

  // Throttle country picking to ~40ms
  const now = performance.now();
  if (now - lastPickTimestamp < POINTER_PICK_THROTTLE_MS) {
    return;
  }
  lastPickTimestamp = now;

  const prevHoveredId = currentHoveredFeatureId;
  const hitId = pickCountryIdAtClientCoords(event.clientX, event.clientY);
  applyHoveredCountryId(hitId);
  if (hitId !== null && hitId !== prevHoveredId) {
    const cx = event.clientX;
    const cy = event.clientY;
    nextTick(() => {
      measureTooltipSizeOnce();
      positionTooltipDirect(cx, cy);
    });
  }
}

function handlePointerUp(event: PointerEvent) {
  const wasDragging = isDragging;
  const wasDown = isPointerDown;
  isPointerDown = false;
  isDragging = false;
  isPointerInteracting.value = false;

  if (!wasDown || wasDragging || event.button !== 0) {
    return;
  }

  const clickedId = pickCountryIdAtClientCoords(event.clientX, event.clientY);
  if (!clickedId) return;

  const clickedFeat = featureById.get(clickedId);
  if (!clickedFeat) return;

  autoRotateEnabled = false;
  isAutoRotating.value = false;
  if (currentHoveredFeatureId !== null) {
    applyHoveredCountryId(null);
  }
  syncAutoRotate();

  // Avoid double camera flight: if selecting a new country, watch(selectedCountry) will start the single flight;
  // if clicking the already-selected country, focus smoothly once directly.
  if (clickedId === currentSelectedFeatureId) {
    const centroid = computeFeatureCentroid(clickedFeat);
    focusOnCoordinates(centroid.lat, centroid.lng, 1.68, 750);
  }
  emit('select-country', clickedFeat);
}

function handlePointerLeave() {
  isPointerDown = false;
  isDragging = false;
  isPointerInteracting.value = false;
  applyHoveredCountryId(null);
}

function handleWheel() {
  activeFlight = null;
  isWheelZooming = true;
  isPointerInteracting.value = true;
  if (currentHoveredFeatureId !== null) {
    applyHoveredCountryId(null);
  }
  if (wheelCooldownTimer !== null) {
    clearTimeout(wheelCooldownTimer);
  }
  wheelCooldownTimer = setTimeout(() => {
    wheelCooldownTimer = null;
    isWheelZooming = false;
    if (!isControlsActive && !isDragging) {
      isPointerInteracting.value = false;
    }
  }, WHEEL_COOLDOWN_MS);
}

function handleControlsStart() {
  isControlsActive = true;
  isPointerInteracting.value = true;
  activeFlight = null;
  if (currentHoveredFeatureId !== null) {
    applyHoveredCountryId(null);
  }
  requestRender();
}

function handleControlsChange() {
  // Ignore synthetic 'change' dispatched by our own controls.update(deltaSec) inside tick()
  if (!isInsideFrame) {
    requestRender();
  }
}

function handleControlsEnd() {
  isControlsActive = false;
  if (!isWheelZooming && !isDragging) {
    isPointerInteracting.value = false;
  }
  dampingTailFrames = 14;
  syncAutoRotate();
  requestRender();
}

function handleVisibilityChange() {
  isPageVisible = !document.hidden;
  if (!isPageVisible) {
    stopRenderLoop();
  } else {
    requestRender();
  }
}

function handleWindowScroll() {
  invalidateContainerRect();
}

function syncFeatureMap() {
  const nextMap = new Map<string, GlobePolygonFeature>();
  for (const feat of worldFeatures.value) {
    nextMap.set(feat.id, feat);
  }
  featureById = nextMap;
}

function initGlobe() {
  const el = containerRef.value;
  if (!el) return;

  // Guard against duplicate initialization (e.g. HMR or remount edge cases)
  if (renderer) {
    cleanupGlobe();
  }

  try {
    syncFeatureMap();
    const features = worldFeatures.value;
    surfaceData = getCountriesSurfaceData(features);

    containerWidth = el.clientWidth || 600;
    containerHeight = el.clientHeight || 500;

    scene = new THREE.Scene();

    // Narrow near/far frustum (15..900 vs camera distance 145..420) maximizes Z-buffer precision
    camera = new THREE.PerspectiveCamera(42, containerWidth / containerHeight, 15, 900);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(containerWidth, containerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    el.innerHTML = '';
    el.appendChild(canvas);

    // Balanced lighting: uniform ambient + camera-attached key light so every hemisphere is bright
    const ambientLight = new THREE.AmbientLight(0xffffff, Math.PI * 0.78);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, Math.PI * 0.34);
    keyLight.position.set(140, 120, 160);
    camera.add(keyLight);
    scene.add(camera);

    // 1. Ocean Sphere (radius = R, polygonOffset = 2 to sit strictly behind land & borders)
    oceanTexture = createOceanCanvasTexture(renderer.capabilities.getMaxAnisotropy());
    const oceanGeom = new THREE.SphereGeometry(GLOBE_RADIUS, 56, 36);
    const oceanMat = new THREE.MeshLambertMaterial({
      map: oceanTexture,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });
    const oceanMesh = new THREE.Mesh(oceanGeom, oceanMat);
    oceanMesh.renderOrder = 0;
    scene.add(oceanMesh);

    // 2. Country Polygons (single merged draw call at R * 1.003, ~15k tris, polygonOffset = 1)
    const countriesGeom = new THREE.BufferGeometry();
    countriesGeom.setAttribute('position', new THREE.BufferAttribute(surfaceData.positions, 3));
    countriesGeom.setAttribute('normal', new THREE.BufferAttribute(surfaceData.normals, 3));
    const colorsArray = new Float32Array(surfaceData.vertexCount * 3);
    countriesColorAttr = new THREE.BufferAttribute(colorsArray, 3);
    countriesColorAttr.setUsage(THREE.DynamicDrawUsage);
    countriesGeom.setAttribute('color', countriesColorAttr);

    const countriesMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    countriesMesh = new THREE.Mesh(countriesGeom, countriesMat);
    countriesMesh.renderOrder = 1;
    scene.add(countriesMesh);

    // 3. Deduplicated Country Borders (single draw call at R * 1.007 via topojson.mesh())
    const borderPositions = getWorldBordersPositions();
    const bordersGeom = new THREE.BufferGeometry();
    bordersGeom.setAttribute('position', new THREE.BufferAttribute(borderPositions, 3));
    const bordersMat = new THREE.LineBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    bordersLines = new THREE.LineSegments(bordersGeom, bordersMat);
    bordersLines.renderOrder = 2;
    scene.add(bordersLines);

    // 4. Single Reusable Selected-Country Highlight Outline (pre-allocated dynamic GPU buffer)
    const selectedOutlineGeom = new THREE.BufferGeometry();
    selectedOutlinePosAttr = new THREE.BufferAttribute(
      new Float32Array(SELECTED_OUTLINE_INITIAL_VERTEX_CAPACITY * 3),
      3
    );
    selectedOutlinePosAttr.setUsage(THREE.DynamicDrawUsage);
    selectedOutlineGeom.setAttribute('position', selectedOutlinePosAttr);
    selectedOutlineGeom.setDrawRange(0, 0);
    const selectedOutlineMat = new THREE.LineBasicMaterial({
      color: 0xfff7ed,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    selectedOutlineLines = new THREE.LineSegments(selectedOutlineGeom, selectedOutlineMat);
    selectedOutlineLines.visible = false;
    selectedOutlineLines.frustumCulled = false;
    selectedOutlineLines.renderOrder = 3;
    scene.add(selectedOutlineLines);

    // 5. Atmospheric Fresnel Halo (BackSide at R * 1.14)
    const atmoGeom = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 40, 24);
    const atmoMat = createAtmosphereMaterial('#38bdf8');
    atmosphereMesh = new THREE.Mesh(atmoGeom, atmoMat);
    atmosphereMesh.renderOrder = 4;
    scene.add(atmosphereMesh);

    // OrbitControls tuned for smooth delta-time auto-rotate & damped manual rotation
    controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controls.minDistance = MIN_CAMERA_DISTANCE;
    controls.maxDistance = MAX_CAMERA_DISTANCE;
    controls.autoRotate = autoRotateEnabled;
    controls.autoRotateSpeed = 0.55;

    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('change', handleControlsChange);
    controls.addEventListener('end', handleControlsEnd);

    // Pointer & wheel event listeners (registered strictly once)
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    canvas.addEventListener('wheel', handleWheel, { passive: true });

    // Initial paint & camera placement
    paintAllFeaturesColors();
    rebuildCombinedPinMetas();

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

    // ResizeObserver updates cached canvas dimensions without polling DOM inside tick()
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w > 0 && h > 0 && camera && renderer) {
          containerWidth = w;
          containerHeight = h;
          invalidateContainerRect();
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          hasCameraMatrixSnapshot = false;
          requestRender();
        }
      }
    });
    resizeObserver.observe(el);

    // IntersectionObserver pauses WebGL loop completely when globe scrolls out of viewport
    if (typeof IntersectionObserver !== 'undefined' && viewportRef.value) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          isInViewport = visible;
          if (!visible) {
            stopRenderLoop();
          } else {
            invalidateContainerRect();
            requestRender();
          }
        },
        { threshold: 0.02 }
      );
      intersectionObserver.observe(viewportRef.value);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    requestRender();
  } catch (err) {
    console.error('[WorldGlobe] Ошибка инициализации WebGL:', err);
    isWebGlSupported.value = false;
  }
}

watch(
  () => props.selectedCountry,
  (newCountry) => {
    const prevSelectedId = currentSelectedFeatureId;
    let nextSelectedId: string | null = null;
    if (newCountry) {
      for (const [id, feat] of featureById) {
        if (isFeatureSelected(feat)) {
          nextSelectedId = id;
          break;
        }
      }
    }

    currentSelectedFeatureId = nextSelectedId;
    if (hasLegendHighlight) {
      paintAllFeaturesColors();
    } else {
      let dirty = false;
      if (prevSelectedId && paintFeatureColor(prevSelectedId)) dirty = true;
      if (nextSelectedId && paintFeatureColor(nextSelectedId)) dirty = true;
      if (dirty && countriesColorAttr) {
        countriesColorAttr.needsUpdate = true;
      }
      updateSelectedCountryOutline(nextSelectedId);
      requestRender();
    }

    if (newCountry && camera) {
      focusOnCoordinates(
        newCountry.coordinates.lat,
        newCountry.coordinates.lng,
        1.68,
        850
      );
    }
  }
);

// Flat primitive signature avoids deep-watching arrays on every parent update
watch(
  () =>
    `${props.countries.length}|${props.favoriteSlugs.join(',')}|${props.plannedCountryNames.join(',')}`,
  () => {
    syncFeatureMap();
    if (countriesColorAttr) {
      paintAllFeaturesColors();
      rebuildCombinedPinMetas();
    }
  }
);

watch(activeLegendHighlight, (state) => {
  hasLegendHighlight = Boolean(state);
  syncAutoRotate();
  paintAllFeaturesColors();
});

function handleZoom(deltaAltitude: number) {
  if (!camera) return;
  const currentDist = camera.position.length() || GLOBE_RADIUS * 2.8;
  const { lat, lng } = vec3ToLatLng(camera.position);
  const currentAlt = (currentDist - GLOBE_RADIUS) / GLOBE_RADIUS;
  const nextAlt = Math.min(3.0, Math.max(0.55, currentAlt + deltaAltitude));
  focusOnCoordinates(lat, lng, nextAlt, 320);
}

function handleResetView() {
  autoRotateEnabled = true;
  isAutoRotating.value = true;
  const lat = props.selectedCountry?.coordinates.lat ?? 35;
  const lng = props.selectedCountry?.coordinates.lng ?? 20;
  focusOnCoordinates(lat, lng, 1.95, 700);
}

function toggleAutoRotate() {
  autoRotateEnabled = !autoRotateEnabled;
  isAutoRotating.value = autoRotateEnabled;
  syncAutoRotate();
  requestRender();
}

function cleanupGlobe() {
  stopRenderLoop();

  if (wheelCooldownTimer !== null) {
    clearTimeout(wheelCooldownTimer);
    wheelCooldownTimer = null;
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('scroll', handleWindowScroll);

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  if (renderer?.domElement) {
    const canvas = renderer.domElement;
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('wheel', handleWheel);
  }

  if (controls) {
    controls.removeEventListener('start', handleControlsStart);
    controls.removeEventListener('change', handleControlsChange);
    controls.removeEventListener('end', handleControlsEnd);
    controls.dispose();
    controls = null;
  }

  if (scene) {
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
    scene = null;
  }

  if (oceanTexture) {
    oceanTexture.dispose();
    oceanTexture = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  camera = null;
  countriesMesh = null;
  countriesColorAttr = null;
  bordersLines = null;
  selectedOutlineLines = null;
  selectedOutlinePosAttr = null;
  atmosphereMesh = null;
  activeFlight = null;
  hasCameraMatrixSnapshot = false;
  pinElementMap.clear();

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
    ref="viewportRef"
    class="w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 border border-slate-800/80 shadow-xl flex flex-col justify-between select-none"
  >
    <!-- 3D Globe Viewport Section -->
    <div class="relative w-full h-[380px] sm:h-[460px] lg:h-[510px] overflow-hidden">
      <!-- Decorative Atmospheric Backdrop -->
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.16)_0%,_rgba(15,23,42,0)_70%)]"
      />

      <!-- Top Hovered / Selected Status Pill -->
      <div class="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div
          class="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/92 border border-slate-700/80 text-xs text-slate-200 shadow-lg"
        >
          <Sparkles class="w-3.5 h-3.5 text-sky-400 shrink-0" />

          <template v-if="activeLegendMeta">
            <span>
              Подсветка категории:
              <strong class="text-white">{{ activeLegendMeta.colorName }} — {{ activeLegendMeta.label }}</strong>
            </span>
          </template>

          <template v-else-if="hoveredFeature">
            <span class="inline-flex items-center gap-1.5">
              <span>Курсор:</span>
              <CountryFlag
                :code="hoveredFeature.properties.isoAlpha2"
                :flagUrl="hoveredFeature.properties.flagUrl"
                :name="hoveredFeature.properties.nameRu"
                size="xs"
              />
              <strong class="text-sky-300">{{ hoveredFeature.properties.nameRu }}</strong>
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
            <span class="inline-flex items-center gap-1.5">
              <span>Выбрано:</span>
              <CountryFlag
                :code="selectedCountry.isoAlpha2"
                :flagUrl="selectedCountry.flagUrl"
                :name="selectedCountry.nameRu"
                size="xs"
              />
              <strong class="text-orange-300">{{ selectedCountry.nameRu }}</strong>
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
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/92 border border-orange-500/50 text-[11px] text-orange-200 shadow"
        >
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: GLOBE_COLORS.selected }"
          />
          <span>Активный выбор:</span>
          <CountryFlag
            :code="selectedCountry.isoAlpha2"
            :flagUrl="selectedCountry.flagUrl"
            :name="selectedCountry.nameRu"
            size="xs"
          />
          <strong class="text-white">{{ selectedCountry.nameRu }}</strong>
        </div>
      </div>

      <!-- 3D Globe Mount Container -->
      <div
        v-if="isWebGlSupported"
        ref="containerRef"
        class="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
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

      <!-- Direct-DOM 2D Pins Layer (combined Planned + Favorite badges, updated only on camera matrix change) -->
      <div
        v-if="isWebGlSupported && bothPlannedAndFavoriteFeatures.length > 0"
        class="pointer-events-none absolute inset-0 overflow-hidden z-[5]"
        aria-hidden="true"
      >
        <div
          v-for="feat in bothPlannedAndFavoriteFeatures"
          :key="feat.id"
          :ref="(el) => setPinElementRef(feat.id, el)"
          class="absolute top-0 left-0 will-change-transform"
          style="opacity: 0; visibility: hidden;"
        >
          <div
            :title="`${feat.properties.nameRu}: запланирована поездка + в избранном`"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950/90 border border-purple-500/80 text-[10px] font-bold shadow-md whitespace-nowrap"
          >
            <PlaneTakeoff class="w-2.5 h-2.5 text-emerald-400" />
            <Heart class="w-2.5 h-2.5 text-purple-400 fill-current" />
          </div>
        </div>
      </div>

      <!-- Direct-DOM Hover Tooltip (positioned via translate3d without reactive cursor state) -->
      <div
        v-show="hoveredFeature && !isPointerInteracting"
        ref="tooltipRef"
        class="pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
        style="transform: translate3d(-9999px, -9999px, 0);"
      >
        <div
          v-if="hoveredFeature"
          class="bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-xl max-w-[260px] border"
          :style="{ borderColor: tooltipBorderColor }"
        >
          <div class="font-bold flex items-center gap-2">
            <CountryFlag
              :code="hoveredFeature.properties.isoAlpha2"
              :flagUrl="hoveredFeature.properties.flagUrl"
              :name="hoveredFeature.properties.nameRu"
              size="sm"
            />
            <span class="truncate">{{ hoveredFeature.properties.nameRu }}</span>
          </div>
          <div class="text-[11px] text-slate-400 mt-0.5">
            {{ hoveredFeature.properties.name }} •
            {{ isFeatureSelected(hoveredFeature) ? 'Текущий выбор' : 'Нажмите для выбора' }}
          </div>
          <div
            v-if="
              isFeatureSelected(hoveredFeature) ||
              isFeaturePlanned(hoveredFeature) ||
              isFeatureFavorite(hoveredFeature)
            "
            class="flex flex-wrap gap-1 mt-1.5"
          >
            <span
              v-if="isFeatureSelected(hoveredFeature)"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/60 text-orange-300 text-[10px] font-bold"
            >
              ● Выбрана
            </span>
            <span
              v-if="isFeaturePlanned(hoveredFeature)"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold"
            >
              <PlaneTakeoff class="w-2.5 h-2.5" />
              Запланирована поездка
            </span>
            <span
              v-if="isFeatureFavorite(hoveredFeature)"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/65 text-purple-300 text-[10px] font-bold"
            >
              <Heart class="w-2.5 h-2.5 fill-current" />
              В избранном
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Interactive Controls HUD -->
      <div class="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div class="text-[11px] text-slate-300 hidden sm:block bg-slate-900/85 px-3 py-1.5 rounded-xl border border-slate-800">
          Колёсико мыши или жест двумя пальцами — масштаб
        </div>

        <div class="flex items-center gap-1.5 ml-auto pointer-events-auto">
          <button
            type="button"
            @click="toggleAutoRotate"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors shadow-md"
            :title="isAutoRotating ? 'Остановить авто-вращение' : 'Включить авто-вращение'"
          >
            <Pause v-if="isAutoRotating" class="w-3.5 h-3.5 text-teal-400" />
            <Play v-else class="w-3.5 h-3.5 text-slate-400" />
            <span class="hidden xs:inline">{{ isAutoRotating ? 'Пауза' : 'Вращать' }}</span>
          </button>

          <button
            type="button"
            @click="handleZoom(-0.35)"
            class="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
            title="Приблизить"
            aria-label="Приблизить"
          >
            <ZoomIn class="w-4 h-4" />
          </button>

          <button
            type="button"
            @click="handleZoom(0.35)"
            class="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
            title="Отдалить"
            aria-label="Отдалить"
          >
            <ZoomOut class="w-4 h-4" />
          </button>

          <button
            type="button"
            @click="handleResetView"
            class="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
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
