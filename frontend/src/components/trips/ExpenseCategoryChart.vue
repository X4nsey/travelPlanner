<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Car,
  Utensils,
  Hotel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  PieChart as PieChartIcon,
} from 'lucide-vue-next';
import type { ExpenseCategory, TripExpenseSummary, ExpenseCategoryStat } from '@/types';
import { formatCurrency } from '@/composables/useFormatters';

interface Props {
  summary: TripExpenseSummary | null;
  selectedCategory?: ExpenseCategory | null;
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: null,
});

const emit = defineEmits<{
  (e: 'select-category', category: ExpenseCategory | null): void;
}>();

const hoveredCategory = ref<ExpenseCategory | null>(null);

const activeCategory = computed<ExpenseCategory | null>(() => {
  return hoveredCategory.value || props.selectedCategory || null;
});

const activeCategoryStat = computed<ExpenseCategoryStat | null>(() => {
  if (!activeCategory.value || !props.summary) return null;
  return props.summary.byCategory.find((c) => c.category === activeCategory.value) || null;
});

const categoriesWithExpenses = computed(() => {
  if (!props.summary) return [];
  return props.summary.byCategory.filter((c) => c.totalAmount > 0);
});

// SVG Donut Slice Calculation
interface SvgSlice {
  category: ExpenseCategory;
  nameRu: string;
  color: string;
  amount: number;
  percentage: number;
  pathData: string;
  isHovered: boolean;
  isSelected: boolean;
}

const svgSlices = computed<SvgSlice[]>(() => {
  if (!props.summary || props.summary.totalSpent <= 0) return [];

  const items = categoriesWithExpenses.value;
  if (items.length === 0) return [];

  const total = props.summary.totalSpent;
  const cx = 140;
  const cy = 140;
  const outerR = 112;
  const innerR = 82; // Ample 164px diameter hole for central labels

  // If there's only 1 category with 100% expenses, draw two clean 180-deg arcs
  if (items.length === 1) {
    const item = items[0];
    const topOuter = cy - outerR;
    const bottomOuter = cy + outerR;
    const topInner = cy - innerR;
    const bottomInner = cy + innerR;

    const pathData = [
      `M ${cx} ${topOuter}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx} ${bottomOuter}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx} ${topOuter}`,
      `M ${cx} ${topInner}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${bottomInner}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${topInner}`,
      'Z',
    ].join(' ');

    return [
      {
        category: item.category,
        nameRu: item.nameRu,
        color: item.color,
        amount: item.totalAmount,
        percentage: 100,
        pathData,
        isHovered: hoveredCategory.value === item.category,
        isSelected: props.selectedCategory === item.category,
      },
    ];
  }

  const gapRad = 0.038; // Angular gap between slices
  let currentAngle = -Math.PI / 2; // Start from 12 o'clock

  return items.map((item) => {
    const sliceAngle = (item.totalAmount / total) * (Math.PI * 2);
    const startAngle = currentAngle + gapRad / 2;
    const endAngle = currentAngle + sliceAngle - gapRad / 2;

    currentAngle += sliceAngle;

    // Outer arc points
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    // Inner arc points
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle - gapRad > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      category: item.category,
      nameRu: item.nameRu,
      color: item.color,
      amount: item.totalAmount,
      percentage: item.percentage,
      pathData,
      isHovered: hoveredCategory.value === item.category,
      isSelected: props.selectedCategory === item.category,
    };
  });
});

function handleCategoryClick(cat: ExpenseCategory) {
  if (props.selectedCategory === cat) {
    emit('select-category', null);
  } else {
    emit('select-category', cat);
  }
}

function getCategoryIcon(cat: ExpenseCategory) {
  switch (cat) {
    case 'TRANSPORT':
      return Car;
    case 'FOOD':
      return Utensils;
    case 'LODGING':
      return Hotel;
    case 'ENTERTAINMENT':
      return Ticket;
    case 'SHOPPING':
      return ShoppingBag;
    default:
      return MoreHorizontal;
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <PieChartIcon class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-base">Структура расходов</h3>
          <p class="text-xs text-slate-500">Распределение трат по категориям</p>
        </div>
      </div>

      <button
        v-if="selectedCategory"
        type="button"
        @click="emit('select-category', null)"
        class="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-lg transition-colors"
      >
        Сбросить выбор
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="!summary || summary.totalSpent <= 0"
      class="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div class="w-36 h-36 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-300 mb-4">
        <PieChartIcon class="w-12 h-12" />
      </div>
      <p class="text-base font-bold text-slate-800">Расходы ещё не добавлены</p>
      <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
        Вносите траты на жильё, транспорт, еду и покупки — здесь появится интерактивная диаграмма
      </p>
    </div>

    <!-- Chart + Breakdown Body -->
    <div v-else class="space-y-6 pt-4">
      <!-- Donut Visual (Large, Centered with ample interior space) -->
      <div class="flex justify-center">
        <div class="relative w-64 h-64 sm:w-72 sm:h-72 select-none">
          <svg
            viewBox="0 0 280 280"
            class="w-full h-full transform -rotate-90 filter drop-shadow-sm transition-transform duration-300"
          >
            <!-- Background Track -->
            <circle
              cx="140"
              cy="140"
              r="97"
              fill="none"
              stroke="#f1f5f9"
              stroke-width="28"
            />

            <!-- Category Slices -->
            <g
              v-for="slice in svgSlices"
              :key="slice.category"
              class="cursor-pointer transition-all duration-200"
              :style="{
                transformOrigin: '140px 140px',
                transform: slice.isHovered || slice.isSelected ? 'scale(1.04)' : 'scale(1)',
                opacity: activeCategory && activeCategory !== slice.category ? '0.35' : '1',
              }"
              @mouseenter="hoveredCategory = slice.category"
              @mouseleave="hoveredCategory = null"
              @click="handleCategoryClick(slice.category)"
            >
              <path
                :d="slice.pathData"
                :fill="slice.color"
                class="transition-colors duration-150"
              />
            </g>
          </svg>

          <!-- Donut Hole Content (Strictly fitted within the 164px inner diameter) -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center text-center p-5 pointer-events-none"
          >
            <template v-if="activeCategoryStat">
              <div class="flex items-center gap-1.5 mb-1 max-w-[130px]">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: activeCategoryStat.color }"
                ></span>
                <span class="text-xs font-bold text-slate-600 truncate">
                  {{ activeCategoryStat.nameRu }}
                </span>
              </div>
              <span class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {{ formatCurrency(activeCategoryStat.totalAmount, summary.currency) }}
              </span>
              <span
                class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700"
              >
                {{ activeCategoryStat.percentage }}% от расходов
              </span>
            </template>

            <template v-else>
              <span class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Всего потрачено
              </span>
              <span class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight my-0.5 leading-tight">
                {{ formatCurrency(summary.totalSpent, summary.currency) }}
              </span>
              <span
                class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="
                  summary.status === 'over_budget'
                    ? 'bg-rose-100 text-rose-700'
                    : summary.status === 'near_budget'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                "
              >
                {{ summary.spentPercentage }}% бюджета
              </span>
            </template>
          </div>
        </div>
      </div>

      <!-- Categories Legend / Breakdown Cards List -->
      <div class="space-y-2.5 pt-2 border-t border-slate-100">
        <div
          v-for="cat in categoriesWithExpenses"
          :key="cat.category"
          @click="handleCategoryClick(cat.category)"
          @mouseenter="hoveredCategory = cat.category"
          @mouseleave="hoveredCategory = null"
          :class="[
            'p-3 rounded-xl border cursor-pointer transition-all duration-150',
            selectedCategory === cat.category
              ? 'bg-slate-50 border-teal-500 shadow-sm ring-1 ring-teal-500/20'
              : hoveredCategory === cat.category
                ? 'bg-slate-50/70 border-slate-300'
                : 'bg-white border-slate-100 hover:border-slate-200',
          ]"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                :style="{ backgroundColor: cat.color }"
              >
                <component :is="getCategoryIcon(cat.category)" class="w-4 h-4" />
              </div>

              <span class="text-sm font-bold text-slate-900 truncate">
                {{ cat.nameRu }}
              </span>
              <span class="text-xs text-slate-400 font-medium">
                {{ cat.count }} {{ cat.count === 1 ? 'запись' : cat.count < 5 ? 'записи' : 'записей' }}
              </span>
            </div>

            <div class="text-right shrink-0 pl-2 flex items-baseline gap-2">
              <span class="text-sm font-extrabold text-slate-900">
                {{ formatCurrency(cat.totalAmount, summary.currency) }}
              </span>
              <span class="text-xs font-bold text-slate-500">
                {{ cat.percentage }}%
              </span>
            </div>
          </div>

          <!-- Color Progress Bar for this category -->
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(cat.percentage, 100)}%`,
                backgroundColor: cat.color,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
