<script setup lang="ts">
import { computed } from 'vue';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  Pencil,
  Trash2,
  Clock,
  Copy,
} from 'lucide-vue-next';
import type { Trip } from '@/types';
import {
  formatDateRange,
  formatDaysLabel,
  formatTravelersLabel,
  formatCurrency,
  getTripTimingStatus,
} from '@/composables/useFormatters';
import { resolveTripTheme } from '@/composables/useTripTheme';
import BaseButton from '@/components/ui/BaseButton.vue';

interface Props {
  trip: Trip;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const emit = defineEmits<{
  (e: 'open', id: string): void;
  (e: 'edit', id: string): void;
  (e: 'duplicate', trip: Trip): void;
  (e: 'delete', trip: Trip): void;
}>();

const timing = computed(() => getTripTimingStatus(props.trip.startDate, props.trip.endDate));
const tripTheme = computed(() => resolveTripTheme(props.trip.id, props.trip.tripType));
</script>

<template>
  <article
    :class="[
      'group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none hover:shadow-card transition-all duration-200 flex flex-col justify-between overflow-hidden',
      tripTheme.cardHoverBorderClass,
    ]"
  >
    <div>
      <!-- Atmospheric Top Accent Bar -->
      <div
        :class="['h-1.5 w-full transition-all duration-300', tripTheme.cardTopBarClass]"
        aria-hidden="true"
      />

      <div class="p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3 mb-3">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
              timing.badgeClass,
            ]"
          >
            {{ timing.label }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
          >
            <Clock :class="['w-3.5 h-3.5', tripTheme.accentIconClass]" />
            {{ formatDaysLabel(trip.durationDays) }}
          </span>
        </div>

        <h3
          @click="emit('open', trip.id)"
          :class="[
            'text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors cursor-pointer line-clamp-1 mb-1.5',
            tripTheme.accentHoverTitleClass,
          ]"
        >
          {{ trip.title }}
        </h3>

        <div :class="['flex items-center gap-1.5 text-sm font-medium mb-4', tripTheme.accentTextClass]">
          <MapPin :class="['w-4 h-4 shrink-0', tripTheme.accentIconClass]" />
          <span class="truncate">{{ trip.country }}, {{ trip.city }}</span>
        </div>

        <div class="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div class="flex items-center gap-2.5">
            <Calendar class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
          </div>

          <div class="flex items-center gap-2.5">
            <Users class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{{ formatTravelersLabel(trip.travelersCount) }}</span>
          </div>

          <div class="flex items-center gap-2.5">
            <Wallet class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span class="font-semibold text-slate-800 dark:text-slate-100">
              {{ formatCurrency(trip.budget, trip.currency) }}
            </span>
            <span class="text-xs text-slate-400 dark:text-slate-500">({{ trip.currency }})</span>
          </div>
        </div>

        <p
          v-if="!compact && trip.description"
          class="mt-4 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
        >
          {{ trip.description }}
        </p>
      </div>
    </div>

    <div
      class="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
    >
      <BaseButton
        variant="ghost"
        size="sm"
        :class="['!px-2.5', tripTheme.accentGhostBtnClass]"
        @click="emit('open', trip.id)"
      >
        <span>Подробнее</span>
        <ArrowRight class="w-4 h-4" />
      </BaseButton>

      <div v-if="!compact" class="flex items-center gap-1">
        <button
          type="button"
          @click="emit('duplicate', trip)"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/15 border border-transparent hover:border-teal-200 dark:hover:border-teal-500/30 transition-colors"
          title="Дублировать поездку"
        >
          <Copy class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="emit('edit', trip.id)"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          title="Редактировать поездку"
        >
          <Pencil class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="emit('delete', trip)"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors"
          title="Удалить поездку"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </article>
</template>
