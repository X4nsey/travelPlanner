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
} from 'lucide-vue-next';
import type { Trip } from '@/types';
import {
  formatDateRange,
  formatDaysLabel,
  formatTravelersLabel,
  formatCurrency,
  getTripTimingStatus,
} from '@/composables/useFormatters';
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
  (e: 'delete', trip: Trip): void;
}>();

const timing = computed(() => getTripTimingStatus(props.trip.startDate, props.trip.endDate));
</script>

<template>
  <article
    class="group bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card hover:border-teal-200/90 transition-all duration-200 flex flex-col justify-between overflow-hidden"
  >
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
          class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
        >
          <Clock class="w-3.5 h-3.5 text-teal-600" />
          {{ formatDaysLabel(trip.durationDays) }}
        </span>
      </div>

      <h3
        @click="emit('open', trip.id)"
        class="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-1 mb-1.5"
      >
        {{ trip.title }}
      </h3>

      <div class="flex items-center gap-1.5 text-sm font-medium text-teal-700 mb-4">
        <MapPin class="w-4 h-4 shrink-0 text-teal-600" />
        <span class="truncate">{{ trip.country }}, {{ trip.city }}</span>
      </div>

      <div class="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
        <div class="flex items-center gap-2.5">
          <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
          <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
        </div>

        <div class="flex items-center gap-2.5">
          <Users class="w-4 h-4 text-slate-400 shrink-0" />
          <span>{{ formatTravelersLabel(trip.travelersCount) }}</span>
        </div>

        <div class="flex items-center gap-2.5">
          <Wallet class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="font-semibold text-slate-800">
            {{ formatCurrency(trip.budget, trip.currency) }}
          </span>
          <span class="text-xs text-slate-400">({{ trip.currency }})</span>
        </div>
      </div>

      <p
        v-if="!compact && trip.description"
        class="mt-4 text-xs text-slate-500 line-clamp-2 leading-relaxed"
      >
        {{ trip.description }}
      </p>
    </div>

    <div
      class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2"
    >
      <BaseButton
        variant="ghost"
        size="sm"
        class="text-teal-700 hover:text-teal-800 hover:bg-teal-50/80 !px-2.5"
        @click="emit('open', trip.id)"
      >
        <span>Подробнее</span>
        <ArrowRight class="w-4 h-4" />
      </BaseButton>

      <div v-if="!compact" class="flex items-center gap-1">
        <button
          type="button"
          @click="emit('edit', trip.id)"
          class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
          title="Редактировать поездку"
        >
          <Pencil class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="emit('delete', trip)"
          class="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Удалить поездку"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </article>
</template>
