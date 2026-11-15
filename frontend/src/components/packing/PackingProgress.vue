<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, AlertTriangle, PackageCheck, UserPlus, Sparkles } from 'lucide-vue-next';
import { usePackingStore } from '@/stores/packing.store';

const packingStore = usePackingStore();

const isComplete = computed(
  () => packingStore.totalCount > 0 && packingStore.packedCount === packingStore.totalCount
);

const barWidthStyle = computed(() => {
  const clamped = Math.min(100, Math.max(0, packingStore.progressPercentage));
  return `${clamped}%`;
});

const formattedPercentage = computed(() => {
  const val = packingStore.progressPercentage;
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
});

const contextSnapshot = computed(() => packingStore.packingList?.contextSnapshot ?? null);
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 sm:p-6 space-y-4">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isComplete
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-teal-50 text-teal-600',
          ]"
        >
          <CheckCircle2 v-if="isComplete" class="w-5 h-5" />
          <PackageCheck v-else class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900">Прогресс сборов</h3>
          <p class="text-xs text-slate-500">
            <template v-if="isComplete">
              Все вещи собраны и готовы к поездке
            </template>
            <template v-else>
              Собрано {{ packingStore.packedCount }} из {{ packingStore.totalCount }} · осталось
              {{ packingStore.unpackedCount }}
            </template>
          </p>
        </div>
      </div>

      <div class="flex items-baseline gap-1.5 sm:text-right">
        <span
          :class="[
            'text-2xl font-extrabold tracking-tight',
            isComplete ? 'text-emerald-600' : 'text-teal-700',
          ]"
        >
          {{ formattedPercentage }}%
        </span>
        <span class="text-xs font-medium text-slate-400">готово</span>
      </div>
    </div>

    <!-- Visual Progress Bar -->
    <div
      class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"
      role="progressbar"
      :aria-valuenow="Math.round(packingStore.progressPercentage)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        :class="[
          'h-full rounded-full transition-all duration-300',
          isComplete ? 'bg-emerald-500' : 'bg-teal-600',
        ]"
        :style="{ width: barWidthStyle }"
      />
    </div>

    <!-- Stats Summary Grid -->
    <div
      :class="[
        'grid gap-3 pt-1',
        packingStore.hasOutdatedItems
          ? 'grid-cols-2 sm:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-4',
      ]"
    >
      <div class="px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Всего</p>
        <p class="text-base font-bold text-slate-900 mt-0.5">{{ packingStore.totalCount }}</p>
      </div>

      <div class="px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80">
          Собрано
        </p>
        <p class="text-base font-bold text-emerald-700 mt-0.5">{{ packingStore.packedCount }}</p>
      </div>

      <div class="px-3.5 py-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-teal-700/80">
          Осталось
        </p>
        <p class="text-base font-bold text-teal-700 mt-0.5">{{ packingStore.unpackedCount }}</p>
      </div>

      <div class="px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1">
          <UserPlus class="w-3 h-3" />
          <span>Свои вещи</span>
        </p>
        <p class="text-base font-bold text-slate-900 mt-0.5">{{ packingStore.customCount }}</p>
      </div>

      <div
        v-if="packingStore.hasOutdatedItems"
        class="col-span-2 sm:col-span-1 px-3.5 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-800 inline-flex items-center gap-1">
          <AlertTriangle class="w-3 h-3" />
          <span>Устарели</span>
        </p>
        <p class="text-base font-bold text-amber-800 mt-0.5">{{ packingStore.outdatedCount }}</p>
      </div>
    </div>

    <!-- Context Snapshot Hints (optional when generated) -->
    <div
      v-if="contextSnapshot"
      class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs"
    >
      <span class="inline-flex items-center gap-1 text-slate-400 mr-1">
        <Sparkles class="w-3.5 h-3.5 text-teal-600" />
        Учтено:
      </span>
      <span
        v-if="contextSnapshot.climateLabelRu"
        class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
      >
        {{ contextSnapshot.climateLabelRu }}
      </span>
      <span
        v-for="act in contextSnapshot.detectedActivities.slice(0, 5)"
        :key="act.tag"
        class="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 font-medium"
        :title="act.reason"
      >
        {{ act.labelRu }}
      </span>
    </div>
  </div>
</template>
