<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  Briefcase,
  Sparkles,
  RefreshCw,
  Plus,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-vue-next';
import type { PackingCategory, PackingItem, TripType } from '@/types';
import {
  ORDERED_PACKING_CATEGORIES,
  getTripTypeLabelRu,
} from '@/constants/packing';
import { usePackingStore } from '@/stores/packing.store';
import { useWeatherStore } from '@/stores/weather.store';
import { useToastStore } from '@/stores/toast.store';
import { formatTemperatureRange } from '@/utils/weatherFormatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import WeatherIcon from '@/components/weather/WeatherIcon.vue';
import PackingProgress from './PackingProgress.vue';
import PackingCategoryCard from './PackingCategoryCard.vue';
import PackingItemFormModal from './PackingItemFormModal.vue';

type PackingStatusFilter = 'all' | 'unpacked' | 'packed' | 'outdated';

interface MergeSummarySnapshot {
  isFirstSeed: boolean;
  addedCount: number;
  preservedCount: number;
  outdatedCount: number;
  restoredFromOutdatedCount: number;
  preservedEditedCount: number;
}

interface Props {
  tripId: string;
  tripType?: TripType | null;
}

const props = defineProps<Props>();

const packingStore = usePackingStore();
const weatherStore = useWeatherStore();
const toastStore = useToastStore();

const currentWeather = computed(() => weatherStore.weatherByTripId[props.tripId] ?? null);

const weatherSummaryBadge = computed(() => {
  const w = currentWeather.value;
  if (!w) return null;

  const iconType = w.summary.hasSnow
    ? 'snow'
    : w.summary.hasHeavyRain
      ? 'heavy_rain'
      : (w.daily[0]?.iconType ?? 'partly_cloudy');

  return {
    iconType,
    tempRange: formatTemperatureRange(w.summary.minTemp, w.summary.maxTemp),
    climateLabelRu: w.climateLabelRu,
    sourceLabelRu: w.sourceLabelRu,
  };
});

const statusFilter = ref<PackingStatusFilter>('all');
const latestMergeSnapshot = ref<MergeSummarySnapshot | null>(null);

const itemModalOpen = ref(false);
const editingItem = ref<PackingItem | null>(null);
const modalDefaultCategory = ref<PackingCategory>('CLOTHING');

const itemToDelete = ref<PackingItem | null>(null);
const isDeletingItem = ref(false);
const showClearOutdatedConfirm = ref(false);

watch(
  () => props.tripId,
  () => {
    statusFilter.value = 'all';
    latestMergeSnapshot.value = null;
    itemModalOpen.value = false;
    editingItem.value = null;
    itemToDelete.value = null;
    showClearOutdatedConfirm.value = false;
  }
);

watch(
  () => packingStore.hasOutdatedItems,
  (hasOutdated) => {
    if (!hasOutdated && statusFilter.value === 'outdated') {
      statusFilter.value = 'all';
    }
  }
);

const isAlreadyGenerated = computed(() => Boolean(packingStore.packingList?.lastGeneratedAt));

const showInitialLoading = computed(
  () => packingStore.isLoading && !packingStore.hasLoaded
);

const showFirstTimeEmptyState = computed(
  () =>
    !packingStore.isLoading &&
    !packingStore.error &&
    packingStore.totalCount === 0
);

const inlineErrorMessage = computed<string | null>(() => {
  if (showInitialLoading.value) return null;
  if (packingStore.error && !packingStore.hasLoaded) return null;
  return packingStore.actionError || packingStore.error || null;
});

const categoryTotalsMap = computed(() => {
  const map: Partial<Record<PackingCategory, { total: number; packed: number }>> = {};
  for (const catSummary of packingStore.summary.byCategory) {
    map[catSummary.category] = {
      total: catSummary.total,
      packed: catSummary.packed,
    };
  }
  return map;
});

const filteredCategoryGroups = computed(() => {
  const groupsByCategory = new Map(
    packingStore.itemsByCategory.map((group) => [group.category, group])
  );

  const result: Array<{
    category: PackingCategory;
    nameRu: string;
    items: PackingItem[];
    totalInCategory: number;
    packedInCategory: number;
  }> = [];

  for (const category of ORDERED_PACKING_CATEGORIES) {
    const group = groupsByCategory.get(category);
    if (!group) continue;

    const filteredItems = group.items.filter((item) => {
      if (statusFilter.value === 'unpacked') return !item.isPacked;
      if (statusFilter.value === 'packed') return item.isPacked;
      if (statusFilter.value === 'outdated') return item.isOutdated;
      return true;
    });

    if (filteredItems.length === 0) continue;

    const totals = categoryTotalsMap.value[category];
    result.push({
      category,
      nameRu: group.nameRu,
      items: filteredItems,
      totalInCategory: totals?.total ?? group.items.length,
      packedInCategory: totals?.packed ?? group.items.filter((i) => i.isPacked).length,
    });
  }

  return result;
});

const filterOptions = computed(() => {
  const options: Array<{ key: PackingStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'Все', count: packingStore.totalCount },
    { key: 'unpacked', label: 'Осталось собрать', count: packingStore.unpackedCount },
    { key: 'packed', label: 'Собрано', count: packingStore.packedCount },
  ];

  if (packingStore.hasOutdatedItems || statusFilter.value === 'outdated') {
    options.push({
      key: 'outdated',
      label: 'Устаревшие',
      count: packingStore.outdatedCount,
    });
  }

  return options;
});

async function handleRetryFetch() {
  try {
    await packingStore.fetchPackingList(props.tripId, { force: true });
  } catch {
    // Error is stored in packingStore.error
  }
}

async function handleGenerateList() {
  const wasGeneratedBefore = isAlreadyGenerated.value;
  latestMergeSnapshot.value = null;

  try {
    const res = await packingStore.generatePackingList(props.tripId);
    const stats = res.mergeStats;

    // Убеждаемся, что погодный контекст в weatherStore актуален после генерации
    const existingWeather = weatherStore.weatherByTripId[props.tripId];
    const snapshot = res.packingList?.contextSnapshot;
    const isWeatherExpired = existingWeather
      ? new Date(existingWeather.expiresAt).getTime() <= Date.now()
      : true;
    const isWeatherMismatched = Boolean(
      existingWeather &&
        snapshot &&
        (snapshot.climateHint !== existingWeather.climateHint ||
          (snapshot.weatherSourceMode &&
            snapshot.weatherSourceMode !== 'heuristic' &&
            snapshot.weatherSourceMode !== existingWeather.sourceMode))
    );

    if (!existingWeather || isWeatherExpired || isWeatherMismatched) {
      await weatherStore.fetchTripWeather(props.tripId, { force: true }).catch(() => {});
    }

    const preservedCount = Math.max(
      0,
      res.summary.total - res.summary.outdated - stats.addedCount
    );

    latestMergeSnapshot.value = {
      isFirstSeed:
        !wasGeneratedBefore &&
        preservedCount === 0 &&
        stats.outdatedCount === 0 &&
        stats.updatedCount === 0 &&
        stats.preservedEditedCount === 0,
      addedCount: stats.addedCount,
      preservedCount,
      outdatedCount: stats.outdatedCount,
      restoredFromOutdatedCount: stats.restoredFromOutdatedCount,
      preservedEditedCount: stats.preservedEditedCount,
    };

    if (wasGeneratedBefore) {
      toastStore.success(
        'Рекомендации обновлены',
        `Добавлено: ${stats.addedCount}, неактуальных: ${stats.outdatedCount}`
      );
    } else {
      toastStore.success(
        'Список вещей сформирован',
        `Подобрано ${res.summary.total} позиций для вашей поездки`
      );
    }
  } catch (err: any) {
    toastStore.error(
      'Ошибка генерации',
      err?.message || 'Не удалось сформировать список вещей'
    );
  }
}

function openCreateModal(category: PackingCategory = 'CLOTHING') {
  editingItem.value = null;
  modalDefaultCategory.value = category;
  itemModalOpen.value = true;
}

function openEditModal(item: PackingItem) {
  if (packingStore.isItemMutating(item.id)) return;
  editingItem.value = item;
  modalDefaultCategory.value = item.category;
  itemModalOpen.value = true;
}

async function handleToggleItem(item: PackingItem) {
  try {
    await packingStore.toggleItemPacked(item.id);
  } catch (err: any) {
    toastStore.error(
      'Не удалось обновить статус',
      err?.message || 'Попробуйте повторить действие'
    );
  }
}

function requestDeleteItem(item: PackingItem) {
  if (packingStore.isItemMutating(item.id)) return;
  itemToDelete.value = item;
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) return;
  const target = itemToDelete.value;
  isDeletingItem.value = true;

  try {
    await packingStore.deleteItem(target.id);
    toastStore.success('Позиция удалена из списка');
    itemToDelete.value = null;
  } catch (err: any) {
    toastStore.error(
      'Ошибка удаления',
      err?.message || 'Не удалось удалить позицию'
    );
  } finally {
    isDeletingItem.value = false;
  }
}

function cancelDeleteItem() {
  if (isDeletingItem.value) return;
  itemToDelete.value = null;
}

function cancelClearOutdated() {
  if (packingStore.isClearingOutdated) return;
  showClearOutdatedConfirm.value = false;
}

async function confirmClearOutdated() {
  try {
    const res = await packingStore.clearOutdated(props.tripId);
    showClearOutdatedConfirm.value = false;
    toastStore.success(
      'Устаревшие позиции очищены',
      `Удалено позиций: ${res.deletedCount}`
    );
  } catch (err: any) {
    toastStore.error(
      'Не удалось очистить список',
      err?.message || 'Попробуйте повторить позже'
    );
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-soft dark:shadow-none"
    >
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Список вещей</h2>
          <span
            v-if="tripType"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-500/30"
          >
            {{ getTripTypeLabelRu(tripType) }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Интеллектуальный подбор вещей с учётом направления, дат, типа поездки и событий маршрута.
        </p>
        <div
          v-if="weatherSummaryBadge"
          class="inline-flex flex-wrap items-center gap-2 mt-1.5 px-3 py-1.5 rounded-xl bg-sky-50/80 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/30 text-xs text-slate-700 dark:text-slate-300"
        >
          <WeatherIcon :type="weatherSummaryBadge.iconType" size="sm" />
          <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {{ weatherSummaryBadge.tempRange }}
          </span>
          <span class="text-slate-400 dark:text-slate-500">·</span>
          <span class="font-semibold text-teal-800 dark:text-teal-300">
            {{ weatherSummaryBadge.climateLabelRu }}
          </span>
          <span class="text-slate-400 dark:text-slate-500">·</span>
          <span class="text-slate-500 dark:text-slate-400">
            {{ weatherSummaryBadge.sourceLabelRu }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="showInitialLoading || packingStore.isGenerating"
          @click="openCreateModal()"
        >
          <Plus class="w-4 h-4" />
          <span>Добавить вещь</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          :loading="packingStore.isGenerating"
          :disabled="showInitialLoading"
          @click="handleGenerateList"
        >
          <RefreshCw v-if="isAlreadyGenerated" class="w-4 h-4" />
          <Sparkles v-else class="w-4 h-4" />
          <span>{{ isAlreadyGenerated ? 'Обновить рекомендации' : 'Сгенерировать список' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Action / Inline Error Alert (shown in both empty state and populated list) -->
    <BaseAlert
      v-if="inlineErrorMessage"
      type="error"
      :message="inlineErrorMessage"
    />

    <!-- Loading State -->
    <BaseSpinner
      v-if="showInitialLoading"
      label="Загружаем список вещей..."
    />

    <!-- Initial Load Error State -->
    <div v-else-if="packingStore.error && !packingStore.hasLoaded" class="space-y-4">
      <BaseAlert
        type="error"
        title="Не удалось загрузить список вещей"
        :message="packingStore.error"
      />
      <BaseButton variant="secondary" size="sm" @click="handleRetryFetch">
        <RefreshCw class="w-4 h-4" />
        <span>Повторить загрузку</span>
      </BaseButton>
    </div>

    <!-- First-Time Empty State -->
    <EmptyState
      v-else-if="showFirstTimeEmptyState"
      title="Умный список вещей ещё не сформирован"
      description="Нажмите «Сгенерировать список» — система проанализирует страну, сезон и даты поездки, её тип и запланированные мероприятия, чтобы подобрать нужные вещи. Вы также можете добавлять собственные позиции в любой момент."
    >
      <template #icon>
        <Briefcase class="w-7 h-7" />
      </template>

      <template #action>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <BaseButton
            variant="primary"
            :loading="packingStore.isGenerating"
            @click="handleGenerateList"
          >
            <Sparkles class="w-4 h-4" />
            <span>Сгенерировать список</span>
          </BaseButton>

          <BaseButton
            variant="outline"
            :disabled="packingStore.isGenerating"
            @click="openCreateModal()"
          >
            <Plus class="w-4 h-4" />
            <span>Добавить вещь</span>
          </BaseButton>
        </div>
      </template>
    </EmptyState>

    <!-- Main Packing List Content -->
    <template v-else>
      <!-- Progress Summary Card -->
      <PackingProgress />

      <!-- Smart Merge Results Banner -->
      <div
        v-if="latestMergeSnapshot"
        class="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 flex items-start justify-between gap-3 text-sm text-emerald-900 dark:text-emerald-200"
      >
        <div class="flex items-start gap-3">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-semibold">
              {{
                latestMergeSnapshot.isFirstSeed
                  ? 'Умный список сформирован на основе параметров поездки'
                  : 'Рекомендации обновлены (Smart Merge)'
              }}
            </p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-800 dark:text-emerald-300">
              <span>
                Добавлено: <strong>{{ latestMergeSnapshot.addedCount }}</strong>
              </span>
              <span>
                Сохранено: <strong>{{ latestMergeSnapshot.preservedCount }}</strong>
              </span>
              <span>
                Стали неактуальными: <strong>{{ latestMergeSnapshot.outdatedCount }}</strong>
              </span>
              <span v-if="latestMergeSnapshot.restoredFromOutdatedCount > 0">
                Восстановлено: <strong>{{ latestMergeSnapshot.restoredFromOutdatedCount }}</strong>
              </span>
              <span v-if="latestMergeSnapshot.preservedEditedCount > 0">
                Ваших правок сохранено: <strong>{{ latestMergeSnapshot.preservedEditedCount }}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="latestMergeSnapshot = null"
          class="p-1 rounded-lg text-emerald-700/70 dark:text-emerald-300/70 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shrink-0"
          aria-label="Скрыть уведомление"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Outdated Recommendations Warning Banner -->
      <div
        v-if="packingStore.hasOutdatedItems"
        class="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-amber-900 dark:text-amber-200"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <p class="font-semibold">
              Найдены устаревшие рекомендации ({{ packingStore.outdatedCount }})
            </p>
            <p class="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              После изменения маршрута, дат или типа поездки часть прежних рекомендаций больше не соответствует плану. Вы можете просмотреть их по фильтру «Устаревшие» или очистить.
            </p>
          </div>
        </div>

        <BaseButton
          variant="outline"
          size="sm"
          class="border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 hover:bg-amber-100/70 dark:hover:bg-amber-500/20 shrink-0"
          :loading="packingStore.isClearingOutdated"
          @click="showClearOutdatedConfirm = true"
        >
          <Trash2 class="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>Очистить устаревшие</span>
        </BaseButton>
      </div>

      <!-- Status Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="opt in filterOptions"
            :key="opt.key"
            type="button"
            @click="statusFilter = opt.key"
            :class="[
              'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors',
              statusFilter === opt.key
                ? opt.key === 'outdated'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100',
            ]"
          >
            <span>{{ opt.label }}</span>
            <span
              :class="[
                'px-1.5 py-0.5 rounded-full text-[11px] font-bold',
                statusFilter === opt.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
              ]"
            >
              {{ opt.count }}
            </span>
          </button>
        </div>

        <p
          v-if="!isAlreadyGenerated && packingStore.customCount > 0"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          Добавлены только ваши вещи — нажмите «Сгенерировать список» для умных рекомендаций.
        </p>
      </div>

      <!-- Empty Filter Result -->
      <div
        v-if="filteredCategoryGroups.length === 0"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-8 text-center space-y-3"
      >
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
          <template v-if="statusFilter === 'packed'">
            Пока ни одна вещь не отмечена как собранная.
          </template>
          <template v-else-if="statusFilter === 'unpacked'">
            Все вещи в списке уже собраны!
          </template>
          <template v-else-if="statusFilter === 'outdated'">
            Устаревших рекомендаций не осталось.
          </template>
          <template v-else>
            В списке пока нет вещей.
          </template>
        </p>

        <BaseButton
          v-if="statusFilter !== 'all'"
          variant="outline"
          size="sm"
          @click="statusFilter = 'all'"
        >
          Показать все вещи
        </BaseButton>
      </div>

      <!-- Categories Grid / Stack -->
      <div v-else class="space-y-4">
        <PackingCategoryCard
          v-for="group in filteredCategoryGroups"
          :key="group.category"
          :category="group.category"
          :items="group.items"
          :totalInCategory="group.totalInCategory"
          :packedInCategory="group.packedInCategory"
          @toggle-item="handleToggleItem"
          @edit-item="openEditModal"
          @delete-item="requestDeleteItem"
          @add-to-category="openCreateModal"
        />
      </div>
    </template>

    <!-- Add / Edit Packing Item Modal -->
    <PackingItemFormModal
      :open="itemModalOpen"
      :tripId="tripId"
      :editingItem="editingItem"
      :defaultCategory="modalDefaultCategory"
      @close="itemModalOpen = false"
    />

    <!-- Confirm Clear Outdated Modal -->
    <ConfirmDialog
      :open="showClearOutdatedConfirm"
      title="Очистить устаревшие рекомендации?"
      :message="`Будет удалено устаревших рекомендаций: ${packingStore.outdatedCount}. Ваши собственные вещи и актуальные рекомендации останутся в списке.`"
      confirmText="Очистить"
      :loading="packingStore.isClearingOutdated"
      @confirm="confirmClearOutdated"
      @cancel="cancelClearOutdated"
    />

    <!-- Confirm Delete Item Modal -->
    <ConfirmDialog
      :open="Boolean(itemToDelete)"
      title="Удалить вещь из списка?"
      :message="
        itemToDelete?.source === 'GENERATED'
          ? `Убрать рекомендованную позицию «${itemToDelete?.name}» из списка вещей? При следующем обновлении рекомендаций она не вернётся автоматически.`
          : `Удалить вещь «${itemToDelete?.name}» из списка?`
      "
      confirmText="Удалить"
      :loading="isDeletingItem"
      @confirm="confirmDeleteItem"
      @cancel="cancelDeleteItem"
    />
  </div>
</template>
