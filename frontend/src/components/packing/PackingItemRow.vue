<script setup lang="ts">
import { computed } from 'vue';
import {
  Check,
  Loader2,
  Pencil,
  Trash2,
  Sparkles,
  User,
  AlertTriangle,
} from 'lucide-vue-next';
import type { PackingItem } from '@/types';
import { usePackingStore } from '@/stores/packing.store';

interface Props {
  item: PackingItem;
  mutating?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mutating: false,
});

const emit = defineEmits<{
  (e: 'toggle', item: PackingItem): void;
  (e: 'edit', item: PackingItem): void;
  (e: 'delete', item: PackingItem): void;
}>();

const packingStore = usePackingStore();

const isBusy = computed(
  () => Boolean(props.mutating || packingStore.isItemMutating(props.item.id))
);

const hasQuantity = computed(
  () => props.item.quantity !== null && props.item.quantity !== undefined && props.item.quantity > 0
);

function handleToggle() {
  if (isBusy.value) return;
  emit('toggle', props.item);
}

function handleEdit() {
  if (isBusy.value) return;
  emit('edit', props.item);
}

function handleDelete() {
  if (isBusy.value) return;
  emit('delete', props.item);
}
</script>

<template>
  <div
    :class="[
      'group flex items-start justify-between gap-3 px-4 py-3.5 transition-colors',
      item.isPacked
        ? 'bg-slate-50/70 dark:bg-slate-800/35'
        : item.isOutdated
          ? 'bg-amber-50/25 hover:bg-amber-50/40 dark:bg-amber-500/5 dark:hover:bg-amber-500/10'
          : 'bg-white hover:bg-slate-50/60 dark:bg-slate-900 dark:hover:bg-slate-800/50',
      isBusy ? 'opacity-75' : '',
    ]"
  >
    <!-- Left: Checkbox + Details -->
    <div class="flex items-start gap-3.5 min-w-0 flex-1">
      <button
        type="button"
        role="checkbox"
        :aria-checked="item.isPacked"
        :aria-label="
          item.isPacked
            ? `Отметить «${item.name}» как несобранную`
            : `Отметить «${item.name}» как собранную`
        "
        :disabled="isBusy"
        @click="handleToggle"
        :class="[
          'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/25',
          isBusy ? 'cursor-wait' : 'cursor-pointer',
          item.isPacked
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-teal-600 dark:hover:border-teal-400 text-transparent',
        ]"
      >
        <Loader2 v-if="isBusy" class="w-3.5 h-3.5 animate-spin text-current" />
        <Check v-else-if="item.isPacked" class="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <span
            @click="handleToggle"
            :class="[
              'text-sm font-medium break-words transition-colors',
              isBusy ? 'pointer-events-none' : 'cursor-pointer',
              item.isPacked
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100',
            ]"
          >
            {{ item.name }}
          </span>

          <!-- Quantity badge (hidden if null) -->
          <span
            v-if="hasQuantity"
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
              item.isPacked
                ? 'bg-slate-100 text-slate-400 border-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
            ]"
          >
            ×{{ item.quantity }}
          </span>

          <!-- Source badge -->
          <span
            v-if="item.source === 'CUSTOM'"
            :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
              item.isPacked
                ? 'bg-slate-100/80 text-slate-400 border-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
            ]"
          >
            <User class="w-3 h-3" />
            <span>Своя вещь</span>
          </span>

          <span
            v-else
            :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
              item.isPacked
                ? 'bg-slate-100/80 text-slate-400 border-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                : 'bg-teal-50 text-teal-700 border-teal-200/70 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
            ]"
          >
            <Sparkles class="w-3 h-3" />
            <span>Рекомендация</span>
          </span>

          <!-- Outdated badge -->
          <span
            v-if="item.isOutdated"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
          >
            <AlertTriangle class="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Неактуально</span>
          </span>
        </div>

        <!-- Reason explanation -->
        <p
          v-if="item.reason"
          :class="[
            'text-xs leading-relaxed break-words',
            item.isPacked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400',
          ]"
        >
          {{ item.reason }}
        </p>
      </div>
    </div>

    <!-- Right: Action Buttons -->
    <div class="flex items-center gap-1 shrink-0">
      <button
        type="button"
        :disabled="isBusy"
        @click="handleEdit"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/15 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        title="Редактировать позицию"
        aria-label="Редактировать позицию"
      >
        <Pencil class="w-4 h-4" />
      </button>

      <button
        type="button"
        :disabled="isBusy"
        @click="handleDelete"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        title="Удалить позицию"
        aria-label="Удалить позицию"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
