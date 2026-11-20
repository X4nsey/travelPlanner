<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Shirt,
  Footprints,
  Smartphone,
  Droplets,
  Wallet,
  Pill,
  Compass,
  Package,
} from 'lucide-vue-next';
import type { PackingCategory, PackingItem } from '@/types';
import {
  ORDERED_PACKING_CATEGORIES,
  PACKING_CATEGORY_META,
} from '@/constants/packing';
import PackingItemRow from './PackingItemRow.vue';

interface Props {
  category: PackingCategory;
  items: PackingItem[];
  totalInCategory?: number;
  packedInCategory?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'toggle-item', item: PackingItem): void;
  (e: 'edit-item', item: PackingItem): void;
  (e: 'delete-item', item: PackingItem): void;
  (e: 'add-to-category', category: PackingCategory): void;
}>();

const isExpanded = ref(true);

const categoryIcons: Record<PackingCategory, Component> = {
  DOCUMENTS: FileText,
  CLOTHING: Shirt,
  FOOTWEAR: Footprints,
  TECH: Smartphone,
  HYGIENE: Droplets,
  PERSONAL: Wallet,
  MEDICINE: Pill,
  ACTIVITY: Compass,
  OTHER: Package,
};

const resolvedCategory = computed<PackingCategory>(() =>
  ORDERED_PACKING_CATEGORIES.includes(props.category) ? props.category : 'OTHER'
);

const categoryMeta = computed(() => PACKING_CATEGORY_META[resolvedCategory.value]);
const categoryIcon = computed(() => categoryIcons[resolvedCategory.value] || Package);

const totalCount = computed(() =>
  props.totalInCategory !== undefined ? props.totalInCategory : props.items.length
);

const packedCount = computed(() =>
  props.packedInCategory !== undefined
    ? props.packedInCategory
    : props.items.filter((item) => item.isPacked).length
);

const progressPercent = computed(() => {
  if (totalCount.value <= 0) return 0;
  return Math.min(100, Math.round((packedCount.value / totalCount.value) * 100));
});

const isCategoryComplete = computed(
  () => totalCount.value > 0 && packedCount.value === totalCount.value
);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <section
    class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none overflow-hidden transition-colors"
  >
    <!-- Category Header -->
    <div
      class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800"
    >
      <button
        type="button"
        @click="toggleExpanded"
        :aria-expanded="isExpanded"
        class="flex items-center gap-3 min-w-0 flex-1 text-left focus:outline-none group"
      >
        <div
          :class="[
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isCategoryComplete
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
          ]"
        >
          <component :is="categoryIcon" class="w-4 h-4" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {{ categoryMeta.nameRu }}
            </h3>
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold',
                isCategoryComplete
                  ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-slate-200/70 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
              ]"
            >
              {{ packedCount }} / {{ totalCount }}
            </span>
          </div>

          <!-- Category mini progress bar -->
          <div class="mt-1.5 flex items-center gap-2 max-w-[180px]">
            <div class="flex-1 bg-slate-200/70 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
              <div
                :class="[
                  'h-full rounded-full transition-[width] duration-300',
                  isCategoryComplete ? 'bg-emerald-500' : 'bg-teal-600 dark:bg-teal-500',
                ]"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-400 tabular-nums">
              {{ progressPercent }}%
            </span>
          </div>
        </div>
      </button>

      <!-- Right Controls: Quick Add + Collapse -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          @click="emit('add-to-category', resolvedCategory)"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/15 transition-colors"
          :title="`Добавить вещь в категорию «${categoryMeta.nameRu}»`"
          :aria-label="`Добавить вещь в категорию «${categoryMeta.nameRu}»`"
        >
          <Plus class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="toggleExpanded"
          :aria-expanded="isExpanded"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          :title="isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'"
          :aria-label="isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'"
        >
          <ChevronUp v-if="isExpanded" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Category Items List -->
    <div v-show="isExpanded" class="divide-y divide-slate-100 dark:divide-slate-800">
      <PackingItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        @toggle="emit('toggle-item', $event)"
        @edit="emit('edit-item', $event)"
        @delete="emit('delete-item', $event)"
      />
    </div>
  </section>
</template>
