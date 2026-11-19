<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Check, ChevronDown, Palette, Sparkles } from 'lucide-vue-next';
import {
  TRIP_THEMES,
  TRIP_THEME_LIST,
  type TripThemeId,
  type TripThemePreference,
} from '@/constants/tripThemes';
import {
  getDefaultTripThemeId,
  getTripThemePreference,
  resolveTripTheme,
  setTripThemePreference,
} from '@/composables/useTripTheme';
import { getTripTypeLabelRu, isValidTripType } from '@/constants/packing';
import type { TripType } from '@/types';

interface Props {
  tripId: string;
  tripType?: TripType | string | null;
}

const props = defineProps<Props>();

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const isOpen = ref(false);
const popoverAlign = ref<'left' | 'right'>('right');

const preference = computed<TripThemePreference>(() =>
  getTripThemePreference(props.tripId)
);

const isAuto = computed(() => preference.value === 'auto');

const defaultThemeId = computed<TripThemeId>(() =>
  getDefaultTripThemeId(props.tripType)
);

const defaultTheme = computed(() => TRIP_THEMES[defaultThemeId.value]);

const activeTheme = computed(() =>
  resolveTripTheme(props.tripId, props.tripType)
);

const tripTypeLabel = computed(() => {
  if (!props.tripType || !isValidTripType(props.tripType)) return null;
  return getTripTypeLabelRu(props.tripType);
});

const buttonTitle = computed(() =>
  isAuto.value
    ? `Атмосфера поездки: ${activeTheme.value.name} (Авто)`
    : `Атмосфера поездки: ${activeTheme.value.name}`
);

function updatePopoverAlignment() {
  if (typeof window === 'undefined' || !triggerRef.value) {
    popoverAlign.value = 'right';
    return;
  }
  const rect = triggerRef.value.getBoundingClientRect();
  const estimatedWidth = 312;
  const margin = 16;
  const spaceRight = window.innerWidth - rect.left;
  const spaceLeft = rect.right;

  if (spaceLeft >= estimatedWidth + margin && spaceRight < estimatedWidth + margin) {
    popoverAlign.value = 'right';
  } else if (spaceRight >= estimatedWidth + margin) {
    popoverAlign.value = 'left';
  } else {
    popoverAlign.value = spaceLeft >= spaceRight ? 'right' : 'left';
  }
}

function togglePopover() {
  if (!isOpen.value) {
    updatePopoverAlignment();
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
}

function closePopover() {
  isOpen.value = false;
}

function selectPreference(next: TripThemePreference) {
  setTripThemePreference(props.tripId, next);
  closePopover();
}

function handleDocumentPointerDown(event: PointerEvent) {
  const root = rootRef.value;
  if (!root) return;
  if (!root.contains(event.target as Node)) {
    closePopover();
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePopover();
    triggerRef.value?.focus();
  }
}

function attachGlobalListeners() {
  if (typeof document === 'undefined') return;
  document.addEventListener('pointerdown', handleDocumentPointerDown);
  document.addEventListener('keydown', handleDocumentKeydown);
}

function detachGlobalListeners() {
  if (typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  document.removeEventListener('keydown', handleDocumentKeydown);
}

watch(isOpen, (opened) => {
  if (opened) {
    attachGlobalListeners();
  } else {
    detachGlobalListeners();
  }
});

onBeforeUnmount(() => {
  detachGlobalListeners();
});
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <!-- Compact Pill Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      :title="buttonTitle"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      aria-label="Переключить атмосферу поездки"
      @click="togglePopover"
      :class="[
        'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
        'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-sm',
        'dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600 dark:shadow-none',
        isOpen ? activeTheme.ringClass : '',
      ]"
    >
      <span
        :class="[
          'w-3 h-3 rounded-full shrink-0 shadow-sm ring-1 ring-black/10 dark:ring-white/25 transition-all duration-300',
          activeTheme.swatchClass,
        ]"
        aria-hidden="true"
      />
      <Palette :class="['w-3.5 h-3.5 shrink-0', activeTheme.accentIconClass]" />
      <span>Атмосфера</span>
      <ChevronDown
        class="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Dropdown Popover -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-[0.98]"
    >
      <div
        v-if="isOpen"
        role="dialog"
        aria-label="Выбор атмосферы поездки"
        :class="[
          'absolute top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)]',
          'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 shadow-xl dark:shadow-2xl dark:shadow-black/50 p-3',
          popoverAlign === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        ]"
      >
        <!-- Header & Auto Hint -->
        <div class="px-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              Атмосфера поездки
            </h3>
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
                activeTheme.badgeClass,
              ]"
            >
              {{ isAuto ? 'Авто' : activeTheme.shortName }}
            </span>
          </div>

          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug flex flex-wrap items-center gap-1">
            <span>Автоподбор{{ tripTypeLabel ? ` (${tripTypeLabel})` : '' }}:</span>
            <span class="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span
                :class="['w-2 h-2 rounded-full shrink-0', defaultTheme.swatchClass]"
                aria-hidden="true"
              />
              {{ defaultTheme.name }}
            </span>
          </p>
        </div>

        <!-- Auto Mode Button -->
        <div class="pt-2.5 pb-2">
          <button
            type="button"
            @click="selectPreference('auto')"
            :class="[
              'w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all duration-150',
              isAuto
                ? [defaultTheme.switcherActiveBgClass, defaultTheme.ringClass]
                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              >
                <Sparkles :class="['w-3.5 h-3.5', defaultTheme.accentIconClass]" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Авто (по типу поездки)
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {{ defaultTheme.name }}
                </p>
              </div>
            </div>

            <span
              v-if="isAuto"
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                defaultTheme.dayBadgeClass,
              ]"
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </span>
          </button>
        </div>

        <!-- 5 Palette Presets -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <button
            v-for="preset in TRIP_THEME_LIST"
            :key="preset.id"
            type="button"
            @click="selectPreference(preset.id)"
            :class="[
              'w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all duration-150',
              !isAuto && preference === preset.id
                ? [preset.switcherActiveBgClass, preset.ringClass]
                : isAuto && activeTheme.id === preset.id
                  ? 'border-slate-200/90 dark:border-slate-700/90 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  : 'border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                :class="[
                  'w-7 h-7 rounded-full shrink-0 shadow-sm ring-1 ring-black/10 dark:ring-white/20',
                  preset.swatchClass,
                ]"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {{ preset.name }}
                  </span>
                  <span
                    v-if="preset.id === defaultThemeId"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0"
                  >
                    авто
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {{ preset.description }}
                </p>
              </div>
            </div>

            <span
              v-if="!isAuto && preference === preset.id"
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                preset.dayBadgeClass,
              ]"
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </span>
            <span
              v-else-if="isAuto && activeTheme.id === preset.id"
              class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0"
            >
              активна
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
