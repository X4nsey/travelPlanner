<script setup lang="ts">
import { ref } from 'vue';
import { Heart, PlaneTakeoff, Info } from 'lucide-vue-next';
import {
  GLOBE_LEGEND_ITEMS,
  GLOBE_COLORS,
  type GlobeColorState,
} from '@/constants/globe-colors';

interface Props {
  activeHighlight?: GlobeColorState | null;
  plannedCount?: number;
  favoriteCount?: number;
  bothPlannedAndFavoriteCount?: number;
  hasSelectedCountry?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activeHighlight: null,
  plannedCount: 0,
  favoriteCount: 0,
  bothPlannedAndFavoriteCount: 0,
  hasSelectedCountry: false,
});

const emit = defineEmits<{
  (e: 'update:activeHighlight', state: GlobeColorState | null): void;
}>();

const openTooltipId = ref<GlobeColorState | null>(null);

function handleMouseEnter(id: GlobeColorState) {
  openTooltipId.value = id;
  emit('update:activeHighlight', id);
}

function handleMouseLeave() {
  openTooltipId.value = null;
  emit('update:activeHighlight', null);
}

function handleToggleMobile(id: GlobeColorState) {
  if (openTooltipId.value === id) {
    openTooltipId.value = null;
    emit('update:activeHighlight', null);
  } else {
    openTooltipId.value = id;
    emit('update:activeHighlight', id);
  }
}

function getCountBadge(id: GlobeColorState): number | null {
  if (id === 'planned' && props.plannedCount > 0) return props.plannedCount;
  if (id === 'favorite' && props.favoriteCount > 0) return props.favoriteCount;
  return null;
}
</script>

<template>
  <div
    class="bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-3.5 py-3 sm:px-5 sm:py-3.5 text-slate-200 select-none"
    role="region"
    aria-label="Легенда цветов интерактивного глобуса"
  >
    <!-- Header row with title & combined-priority hint -->
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
      <div class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Info class="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>Цветовая легенда глобуса (наведите на пункт для подсветки стран)</span>
      </div>

      <!-- Priority rule indicator: Planned trip (green) + Favorite icon (heart) -->
      <div
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px] text-slate-300"
        title="Если страна одновременно добавлена в избранное и содержит запланированную поездку, используется зелёный цвет поездки и иконка сердечка"
      >
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
          :style="{ backgroundColor: GLOBE_COLORS.planned }"
        />
        <span>+</span>
        <span
          class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0"
          :style="{ backgroundColor: GLOBE_COLORS.favorite }"
        >
          <Heart class="w-2.5 h-2.5 fill-current" />
        </span>
        <span class="text-slate-300">
          Поездка + избранное
          <strong v-if="bothPlannedAndFavoriteCount > 0" class="text-white ml-0.5">
            ({{ bothPlannedAndFavoriteCount }})
          </strong>
        </span>
      </div>
    </div>

    <!-- 5 Color States Grid / Flex -->
    <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      <div
        v-for="item in GLOBE_LEGEND_ITEMS"
        :key="item.id"
        class="relative"
        @mouseenter="handleMouseEnter(item.id)"
        @mouseleave="handleMouseLeave"
      >
        <button
          type="button"
          @click="handleToggleMobile(item.id)"
          @focus="handleMouseEnter(item.id)"
          @blur="handleMouseLeave"
          :title="`${item.colorName} — ${item.label}: ${item.tooltip}`"
          :class="[
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all duration-150',
            activeHighlight === item.id
              ? 'bg-slate-800 border-sky-400/70 shadow-md ring-1 ring-sky-400/30 scale-[1.01]'
              : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700',
          ]"
        >
          <!-- Exact Globe Color Indicator -->
          <span class="relative flex items-center justify-center shrink-0">
            <span
              class="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-white/15"
              :style="{ backgroundColor: item.color }"
            />
            <PlaneTakeoff
              v-if="item.id === 'planned'"
              class="w-2.5 h-2.5 text-emerald-300 absolute -top-1 -right-1 drop-shadow"
            />
            <Heart
              v-else-if="item.id === 'favorite'"
              class="w-2.5 h-2.5 text-purple-300 fill-purple-300 absolute -top-1 -right-1 drop-shadow"
            />
          </span>

          <!-- Text Label + Short Explanation -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs font-bold text-white truncate">
                {{ item.label }}
              </span>
              <span
                v-if="getCountBadge(item.id) !== null"
                class="px-1.5 py-0.2 rounded-md bg-slate-700/90 text-[10px] font-bold text-slate-200 shrink-0"
              >
                {{ getCountBadge(item.id) }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
              {{ item.colorName }} • {{ item.shortDesc }}
            </p>
          </div>
        </button>

        <!-- Floating Popover Tooltip on Hover / Focus -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="openTooltipId === item.id"
            class="pointer-events-none absolute bottom-full left-0 right-0 sm:w-64 mb-2 z-30 p-3 rounded-xl bg-slate-950/95 border border-slate-700 text-xs text-slate-200 shadow-xl backdrop-blur-md"
          >
            <div class="flex items-center gap-2 font-bold text-white mb-1">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: item.color }"
              />
              <span>{{ item.colorName }} — {{ item.label }}</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
              {{ item.tooltip }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
