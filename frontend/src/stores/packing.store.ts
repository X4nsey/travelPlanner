import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  ClearOutdatedResponse,
  CreatePackingItemPayload,
  DeletePackingItemResponse,
  PackingCategory,
  PackingGenerateResponse,
  PackingItem,
  PackingListMeta,
  PackingListResponse,
  PackingMergeStats,
  PackingSummary,
  UpdatePackingItemPayload,
} from '@/types';
import {
  ORDERED_PACKING_CATEGORIES,
  PACKING_CATEGORY_META,
} from '@/constants/packing';
import {
  normalizePackingQuantity,
  packingService,
  sanitizeCreatePackingItemPayload,
} from '@/services/packing.service';

export function createEmptyPackingSummary(): PackingSummary {
  return {
    total: 0,
    packed: 0,
    unpacked: 0,
    outdated: 0,
    custom: 0,
    generated: 0,
    progressPercentage: 0,
    byCategory: ORDERED_PACKING_CATEGORIES.map((category) => ({
      category,
      nameRu: PACKING_CATEGORY_META[category].nameRu,
      total: 0,
      packed: 0,
    })),
  };
}

export function sortPackingItems(list: PackingItem[]): PackingItem[] {
  return [...list].sort((a, b) => {
    const catOrderDiff =
      (PACKING_CATEGORY_META[a.category]?.order ?? 99) -
      (PACKING_CATEGORY_META[b.category]?.order ?? 99);
    if (catOrderDiff !== 0) return catOrderDiff;

    const sortDiff = a.sortOrder - b.sortOrder;
    if (sortDiff !== 0) return sortDiff;

    const createdDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });
}

export function computePackingSummary(list: PackingItem[]): PackingSummary {
  const total = list.length;
  let packed = 0;
  let outdated = 0;
  let custom = 0;
  let generated = 0;

  const countsByCategory: Record<PackingCategory, { total: number; packed: number }> = {
    DOCUMENTS: { total: 0, packed: 0 },
    CLOTHING: { total: 0, packed: 0 },
    FOOTWEAR: { total: 0, packed: 0 },
    TECH: { total: 0, packed: 0 },
    HYGIENE: { total: 0, packed: 0 },
    PERSONAL: { total: 0, packed: 0 },
    MEDICINE: { total: 0, packed: 0 },
    ACTIVITY: { total: 0, packed: 0 },
    OTHER: { total: 0, packed: 0 },
  };

  for (const item of list) {
    if (item.isPacked) packed += 1;
    if (item.isOutdated) outdated += 1;
    if (item.source === 'CUSTOM') {
      custom += 1;
    } else {
      generated += 1;
    }

    const bucket = countsByCategory[item.category];
    if (bucket) {
      bucket.total += 1;
      if (item.isPacked) bucket.packed += 1;
    }
  }

  const byCategory = ORDERED_PACKING_CATEGORIES.map((category) => ({
    category,
    nameRu: PACKING_CATEGORY_META[category].nameRu,
    total: countsByCategory[category].total,
    packed: countsByCategory[category].packed,
  }));

  return {
    total,
    packed,
    unpacked: total - packed,
    outdated,
    custom,
    generated,
    progressPercentage: total > 0 ? Math.round((packed / total) * 1000) / 10 : 0,
    byCategory,
  };
}

export const usePackingStore = defineStore('packing', () => {
  const currentTripId = ref<string | null>(null);
  const exists = ref(false);
  const packingList = ref<PackingListMeta | null>(null);
  const items = ref<PackingItem[]>([]);
  const summary = ref<PackingSummary>(createEmptyPackingSummary());
  const lastMergeStats = ref<PackingMergeStats | null>(null);

  const hasLoaded = ref(false);
  const isLoading = ref(false);
  const isGenerating = ref(false);
  const isAdding = ref(false);
  const isClearingOutdated = ref(false);
  const mutatingItemMap = ref<Record<string, boolean>>({});

  const error = ref<string | null>(null);
  const actionError = ref<string | null>(null);

  // Guard against stale async responses on rapid trip switching and duplicate requests
  let contextVersion = 0;
  let fetchSequence = 0;
  let inFlightFetch: { tripId: string; promise: Promise<PackingListResponse> } | null = null;
  let inFlightGenerate: {
    tripId: string;
    promise: Promise<PackingGenerateResponse & { message?: string }>;
  } | null = null;
  let inFlightClearOutdated: {
    tripId: string;
    promise: Promise<ClearOutdatedResponse & { message?: string }>;
  } | null = null;
  let activeAddRequests = 0;

  const totalCount = computed(() => summary.value.total);
  const packedCount = computed(() => summary.value.packed);
  const unpackedCount = computed(() => summary.value.unpacked);
  const outdatedCount = computed(() => summary.value.outdated);
  const customCount = computed(() => summary.value.custom);
  const generatedCount = computed(() => summary.value.generated);
  const progressPercentage = computed(() => summary.value.progressPercentage);
  const hasOutdatedItems = computed(() => summary.value.outdated > 0);
  const mutatingItemIds = computed(() => Object.keys(mutatingItemMap.value));

  const itemsByCategory = computed(() => {
    const grouped: Record<PackingCategory, PackingItem[]> = {
      DOCUMENTS: [],
      CLOTHING: [],
      FOOTWEAR: [],
      TECH: [],
      HYGIENE: [],
      PERSONAL: [],
      MEDICINE: [],
      ACTIVITY: [],
      OTHER: [],
    };

    for (const item of items.value) {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      } else {
        grouped.OTHER.push(item);
      }
    }

    return ORDERED_PACKING_CATEGORIES.map((category) => ({
      category,
      nameRu: PACKING_CATEGORY_META[category].nameRu,
      items: grouped[category],
    })).filter((group) => group.items.length > 0);
  });

  function isItemMutating(itemId: string): boolean {
    return Boolean(mutatingItemMap.value[itemId]);
  }

  function setItemMutating(itemId: string, active: boolean) {
    if (active) {
      mutatingItemMap.value = { ...mutatingItemMap.value, [itemId]: true };
    } else if (mutatingItemMap.value[itemId]) {
      const next = { ...mutatingItemMap.value };
      delete next[itemId];
      mutatingItemMap.value = next;
    }
  }

  function recalculateSummary() {
    summary.value = computePackingSummary(items.value);
  }

  function applyListResponse(res: PackingListResponse) {
    exists.value = res.exists;
    packingList.value = res.packingList;
    items.value = sortPackingItems(res.items);
    summary.value = res.summary ?? computePackingSummary(items.value);
    hasLoaded.value = true;
  }

  function resetForTrip(tripId: string | null) {
    contextVersion += 1;
    currentTripId.value = tripId;
    exists.value = false;
    packingList.value = null;
    items.value = [];
    summary.value = createEmptyPackingSummary();
    lastMergeStats.value = null;
    hasLoaded.value = false;
    isLoading.value = false;
    isGenerating.value = false;
    isAdding.value = false;
    isClearingOutdated.value = false;
    mutatingItemMap.value = {};
    error.value = null;
    actionError.value = null;
    inFlightFetch = null;
    inFlightGenerate = null;
    inFlightClearOutdated = null;
    activeAddRequests = 0;
  }

  function clearState() {
    resetForTrip(null);
  }

  function clearErrors() {
    error.value = null;
    actionError.value = null;
  }

  function isSameContext(version: number, tripId: string): boolean {
    return version === contextVersion && currentTripId.value === tripId;
  }

  async function fetchPackingList(
    tripId: string,
    options: { force?: boolean } = {}
  ): Promise<PackingListResponse> {
    if (currentTripId.value !== tripId) {
      resetForTrip(tripId);
    }

    if (!options.force && inFlightFetch && inFlightFetch.tripId === tripId) {
      return inFlightFetch.promise;
    }

    const requestVersion = contextVersion;
    const requestSeq = ++fetchSequence;
    isLoading.value = true;
    error.value = null;

    let promise!: Promise<PackingListResponse>;
    promise = (async () => {
      try {
        const res = await packingService.getPackingList(tripId);
        if (isSameContext(requestVersion, tripId) && requestSeq === fetchSequence) {
          applyListResponse(res);
        }
        return res;
      } catch (err: any) {
        if (isSameContext(requestVersion, tripId) && requestSeq === fetchSequence) {
          error.value = err?.message || 'Не удалось загрузить список вещей';
        }
        throw err;
      } finally {
        if (isSameContext(requestVersion, tripId) && requestSeq === fetchSequence) {
          isLoading.value = false;
        }
        if (inFlightFetch?.promise === promise) {
          inFlightFetch = null;
        }
      }
    })();

    inFlightFetch = { tripId, promise };
    return promise;
  }

  async function generatePackingList(
    tripId: string
  ): Promise<PackingGenerateResponse & { message?: string }> {
    if (currentTripId.value !== tripId) {
      resetForTrip(tripId);
    }

    if (inFlightGenerate && inFlightGenerate.tripId === tripId) {
      return inFlightGenerate.promise;
    }

    const requestVersion = contextVersion;
    isGenerating.value = true;
    actionError.value = null;

    let promise!: Promise<PackingGenerateResponse & { message?: string }>;
    promise = (async () => {
      try {
        const res = await packingService.generatePackingList(tripId);
        if (isSameContext(requestVersion, tripId)) {
          applyListResponse(res);
          lastMergeStats.value = res.mergeStats;
          error.value = null;
        }
        return res;
      } catch (err: any) {
        if (isSameContext(requestVersion, tripId)) {
          actionError.value = err?.message || 'Не удалось сформировать список вещей';
        }
        throw err;
      } finally {
        if (isSameContext(requestVersion, tripId)) {
          isGenerating.value = false;
        }
        if (inFlightGenerate?.promise === promise) {
          inFlightGenerate = null;
        }
      }
    })();

    inFlightGenerate = { tripId, promise };
    return promise;
  }

  async function addCustomItem(
    tripId: string,
    payload: CreatePackingItemPayload
  ): Promise<{ item: PackingItem; message?: string }> {
    if (currentTripId.value !== tripId) {
      resetForTrip(tripId);
    }

    const requestVersion = contextVersion;
    activeAddRequests += 1;
    isAdding.value = true;
    actionError.value = null;

    const cleanPayload = sanitizeCreatePackingItemPayload(payload);

    try {
      const res = await packingService.addCustomItem(tripId, cleanPayload);
      if (isSameContext(requestVersion, tripId)) {
        const existingIdx = items.value.findIndex((i) => i.id === res.item.id);
        if (existingIdx !== -1) {
          items.value[existingIdx] = res.item;
        } else {
          items.value.push(res.item);
        }
        items.value = sortPackingItems(items.value);
        exists.value = true;
        hasLoaded.value = true;

        if (!packingList.value) {
          packingList.value = {
            id: res.item.packingListId,
            tripId,
            lastGeneratedAt: null,
            contextSnapshot: null,
            createdAt: res.item.createdAt,
            updatedAt: res.item.updatedAt,
          };
        }

        recalculateSummary();
      }
      return res;
    } catch (err: any) {
      if (isSameContext(requestVersion, tripId)) {
        actionError.value = err?.message || 'Не удалось добавить позицию в список вещей';
      }
      throw err;
    } finally {
      if (isSameContext(requestVersion, tripId)) {
        activeAddRequests = Math.max(0, activeAddRequests - 1);
        isAdding.value = activeAddRequests > 0;
      }
    }
  }

  async function updateItem(
    itemId: string,
    payload: UpdatePackingItemPayload
  ): Promise<{ item: PackingItem; message?: string } | null> {
    if (isItemMutating(itemId)) {
      return null;
    }

    const tripId = currentTripId.value;
    const existing = items.value.find((item) => item.id === itemId);

    const diff: UpdatePackingItemPayload = {};

    if (payload.name !== undefined) {
      const trimmedName = payload.name.trim();
      if (!existing || trimmedName !== existing.name) {
        diff.name = trimmedName;
      }
    }

    if (payload.category !== undefined) {
      if (!existing || payload.category !== existing.category) {
        diff.category = payload.category;
      }
    }

    if (payload.quantity !== undefined) {
      const normalizedQuantity = normalizePackingQuantity(payload.quantity);
      if (!existing || normalizedQuantity !== existing.quantity) {
        diff.quantity = normalizedQuantity;
      }
    }

    if (payload.isPacked !== undefined) {
      if (!existing || payload.isPacked !== existing.isPacked) {
        diff.isPacked = payload.isPacked;
      }
    }

    if (Object.keys(diff).length === 0) {
      return existing ? { item: existing } : null;
    }

    const requestVersion = contextVersion;
    setItemMutating(itemId, true);
    actionError.value = null;

    try {
      const res = await packingService.updateItem(itemId, diff);
      if (tripId && isSameContext(requestVersion, tripId)) {
        const idx = items.value.findIndex((item) => item.id === itemId);
        if (idx !== -1) {
          items.value[idx] = res.item;
        } else {
          items.value.push(res.item);
        }
        items.value = sortPackingItems(items.value);
        recalculateSummary();
      }
      return res;
    } catch (err: any) {
      if (!tripId || isSameContext(requestVersion, tripId)) {
        actionError.value = err?.message || 'Не удалось обновить позицию списка вещей';
      }
      throw err;
    } finally {
      if (!tripId || isSameContext(requestVersion, tripId)) {
        setItemMutating(itemId, false);
      }
    }
  }

  async function toggleItemPacked(
    itemId: string,
    nextPacked?: boolean
  ): Promise<{ item: PackingItem; message?: string } | null> {
    const existing = items.value.find((item) => item.id === itemId);
    if (!existing) {
      return null;
    }

    const targetPacked = nextPacked !== undefined ? nextPacked : !existing.isPacked;
    return updateItem(itemId, { isPacked: targetPacked });
  }

  async function deleteItem(
    itemId: string
  ): Promise<(DeletePackingItemResponse & { message?: string }) | null> {
    if (isItemMutating(itemId)) {
      return null;
    }

    const tripId = currentTripId.value;
    const requestVersion = contextVersion;
    setItemMutating(itemId, true);
    actionError.value = null;

    try {
      const res = await packingService.deleteItem(itemId);
      if (tripId && isSameContext(requestVersion, tripId)) {
        items.value = items.value.filter((item) => item.id !== itemId);
        recalculateSummary();
      }
      return res;
    } catch (err: any) {
      if (!tripId || isSameContext(requestVersion, tripId)) {
        actionError.value = err?.message || 'Не удалось удалить позицию из списка вещей';
      }
      throw err;
    } finally {
      if (!tripId || isSameContext(requestVersion, tripId)) {
        setItemMutating(itemId, false);
      }
    }
  }

  async function clearOutdated(
    tripId: string
  ): Promise<ClearOutdatedResponse & { message?: string }> {
    if (currentTripId.value !== tripId) {
      resetForTrip(tripId);
    }

    if (inFlightClearOutdated && inFlightClearOutdated.tripId === tripId) {
      return inFlightClearOutdated.promise;
    }

    const requestVersion = contextVersion;
    isClearingOutdated.value = true;
    actionError.value = null;

    let promise!: Promise<ClearOutdatedResponse & { message?: string }>;
    promise = (async () => {
      try {
        const res = await packingService.clearOutdated(tripId);
        if (isSameContext(requestVersion, tripId)) {
          const beforeCount = items.value.length;
          items.value = items.value.filter(
            (item) => !(item.source === 'GENERATED' && item.isOutdated)
          );
          const localRemovedCount = beforeCount - items.value.length;
          recalculateSummary();

          if (res.deletedCount !== localRemovedCount) {
            await fetchPackingList(tripId, { force: true }).catch(() => {});
          }
        }
        return res;
      } catch (err: any) {
        if (isSameContext(requestVersion, tripId)) {
          actionError.value = err?.message || 'Не удалось очистить устаревшие позиции';
        }
        throw err;
      } finally {
        if (isSameContext(requestVersion, tripId)) {
          isClearingOutdated.value = false;
        }
        if (inFlightClearOutdated?.promise === promise) {
          inFlightClearOutdated = null;
        }
      }
    })();

    inFlightClearOutdated = { tripId, promise };
    return promise;
  }

  return {
    currentTripId,
    exists,
    packingList,
    items,
    summary,
    lastMergeStats,
    hasLoaded,
    isLoading,
    isGenerating,
    isAdding,
    isClearingOutdated,
    mutatingItemIds,
    error,
    actionError,
    totalCount,
    packedCount,
    unpackedCount,
    outdatedCount,
    customCount,
    generatedCount,
    progressPercentage,
    hasOutdatedItems,
    itemsByCategory,
    isItemMutating,
    fetchPackingList,
    generatePackingList,
    addCustomItem,
    updateItem,
    toggleItemPacked,
    deleteItem,
    clearOutdated,
    clearErrors,
    clearState,
  };
});
