import {
  ItineraryEvent,
  PackingCategory,
  PackingItem,
  PackingItemSource,
  Prisma,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CreatePackingItemInput, UpdatePackingItemInput } from '../schemas/packing.schema';
import { PackingEngineService } from './packing-engine.service';
import { TripService } from './trip.service';
import { WeatherService } from './weather.service';

export const PACKING_CATEGORY_META: Record<
  PackingCategory,
  { nameRu: string; order: number }
> = {
  DOCUMENTS: { nameRu: 'Документы', order: 0 },
  CLOTHING: { nameRu: 'Одежда', order: 1 },
  FOOTWEAR: { nameRu: 'Обувь', order: 2 },
  TECH: { nameRu: 'Техника и связь', order: 3 },
  HYGIENE: { nameRu: 'Гигиена и уход', order: 4 },
  PERSONAL: { nameRu: 'Личные вещи', order: 5 },
  MEDICINE: { nameRu: 'Аптечка', order: 6 },
  ACTIVITY: { nameRu: 'Для активностей', order: 7 },
  OTHER: { nameRu: 'Прочее', order: 8 },
};

const ORDERED_CATEGORIES = (Object.keys(PACKING_CATEGORY_META) as PackingCategory[]).sort(
  (a, b) => PACKING_CATEGORY_META[a].order - PACKING_CATEGORY_META[b].order
);

export function serializePackingItem(item: PackingItem) {
  const meta = PACKING_CATEGORY_META[item.category] || PACKING_CATEGORY_META.OTHER;
  return {
    id: item.id,
    packingListId: item.packingListId,
    category: item.category,
    categoryNameRu: meta.nameRu,
    name: item.name,
    quantity: item.quantity,
    isPacked: item.isPacked,
    source: item.source,
    ruleKey: item.ruleKey,
    reason: item.reason,
    isEditedByUser: item.isEditedByUser,
    isOutdated: item.isOutdated,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializePackingListMeta(list: {
  id: string;
  tripId: string;
  lastGeneratedAt: Date | null;
  contextSnapshot: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: list.id,
    tripId: list.tripId,
    lastGeneratedAt: list.lastGeneratedAt ? list.lastGeneratedAt.toISOString() : null,
    contextSnapshot: list.contextSnapshot,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

export function sortPackingItems(items: PackingItem[]): PackingItem[] {
  return [...items].sort((a, b) => {
    const catOrderDiff =
      (PACKING_CATEGORY_META[a.category]?.order ?? 99) -
      (PACKING_CATEGORY_META[b.category]?.order ?? 99);
    if (catOrderDiff !== 0) return catOrderDiff;

    const sortDiff = a.sortOrder - b.sortOrder;
    if (sortDiff !== 0) return sortDiff;

    const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });
}

export function computePackingSummary(items: PackingItem[]) {
  const total = items.length;
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

  for (const item of items) {
    if (item.isPacked) packed += 1;
    if (item.isOutdated) outdated += 1;
    if (item.source === PackingItemSource.CUSTOM) {
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

  const byCategory = ORDERED_CATEGORIES.map((category) => ({
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

export class PackingListService {
  private static async getOwnedPackingItem(userId: string, itemId: string) {
    const item = await prisma.packingItem.findUnique({
      where: { id: itemId },
      include: {
        packingList: {
          include: {
            trip: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Позиция списка вещей не найдена', 404, 'PACKING_ITEM_NOT_FOUND');
    }

    if (item.packingList.trip.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этой позиции списка вещей', 403, 'FORBIDDEN');
    }

    if (item.isDismissed) {
      throw new AppError('Позиция списка вещей не найдена', 404, 'PACKING_ITEM_NOT_FOUND');
    }

    return item;
  }

  static async getTripPackingList(userId: string, tripId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const packingList = await prisma.packingList.findUnique({
      where: { tripId },
    });

    if (!packingList) {
      return {
        exists: false,
        packingList: null,
        items: [],
        summary: computePackingSummary([]),
      };
    }

    const visibleItems = await prisma.packingItem.findMany({
      where: {
        packingListId: packingList.id,
        isDismissed: false,
      },
    });

    const sorted = sortPackingItems(visibleItems);

    return {
      exists: true,
      packingList: serializePackingListMeta(packingList),
      items: sorted.map(serializePackingItem),
      summary: computePackingSummary(sorted),
    };
  }

  static async generateTripPackingList(userId: string, tripId: string) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, true);
    const tripEvents = (
      'events' in trip && Array.isArray(trip.events) ? trip.events : []
    ) as ItineraryEvent[];

    const weatherContext = await WeatherService.getWeatherContextForPacking(tripId, userId);

    const engineResult = PackingEngineService.generateRecommendations({
      title: trip.title,
      country: trip.country,
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: trip.travelersCount,
      tripType: trip.tripType ?? null,
      description: trip.description ?? '',
      weatherContext,
      events: tripEvents.map((ev) => ({
        title: ev.title,
        description: ev.description,
        location: ev.location,
        note: ev.note,
        date: ev.date,
      })),
    });

    const result = await prisma.$transaction(async (tx) => {
      // Блокируем строку Trip на время транзакции, чтобы параллельные запросы генерации
      // сериализовались в PostgreSQL и не создавали дубликаты или гонки по ruleKey.
      await tx.$executeRaw`SELECT id FROM "Trip" WHERE id = ${tripId} FOR UPDATE`;

      const now = new Date();
      const contextSnapshot = engineResult.context as unknown as Prisma.InputJsonValue;

      const packingList = await tx.packingList.upsert({
        where: { tripId },
        create: {
          tripId,
          lastGeneratedAt: now,
          contextSnapshot,
        },
        update: {
          lastGeneratedAt: now,
          contextSnapshot,
        },
      });

      const existingItems = await tx.packingItem.findMany({
        where: { packingListId: packingList.id },
      });

      // Индексируем только GENERATED-позиции с непустым ruleKey.
      // Позиции с source = CUSTOM или ruleKey = null никогда не сопоставляются с правилами.
      const existingByRuleKey = new Map<string, PackingItem>();
      for (const item of existingItems) {
        if (item.source === PackingItemSource.GENERATED && item.ruleKey !== null) {
          existingByRuleKey.set(item.ruleKey, item);
        }
      }

      const matchedRuleKeys = new Set<string>();
      const itemsToCreate: Prisma.PackingItemCreateManyInput[] = [];
      let addedCount = 0;
      let updatedCount = 0;
      let restoredFromOutdatedCount = 0;
      let outdatedCount = 0;
      let preservedDismissedCount = 0;
      let preservedEditedCount = 0;

      for (const candidate of engineResult.items) {
        if (matchedRuleKeys.has(candidate.ruleKey)) {
          continue;
        }
        matchedRuleKeys.add(candidate.ruleKey);

        const existing = existingByRuleKey.get(candidate.ruleKey);

        if (!existing) {
          itemsToCreate.push({
            packingListId: packingList.id,
            category: candidate.category,
            name: candidate.name,
            quantity: candidate.quantity,
            isPacked: false,
            source: PackingItemSource.GENERATED,
            ruleKey: candidate.ruleKey,
            reason: candidate.reason,
            isEditedByUser: false,
            isOutdated: false,
            isDismissed: false,
            sortOrder: candidate.sortOrder,
          });
          addedCount += 1;
          continue;
        }

        // Отклонённую пользователем позицию никогда не восстанавливаем автоматически.
        if (existing.isDismissed) {
          preservedDismissedCount += 1;
          continue;
        }

        const updateData: Prisma.PackingItemUpdateInput = {};
        let needsUpdate = false;

        if (existing.isOutdated) {
          updateData.isOutdated = false;
          restoredFromOutdatedCount += 1;
          needsUpdate = true;
        }

        if (existing.reason !== candidate.reason) {
          updateData.reason = candidate.reason;
          needsUpdate = true;
        }

        if (existing.sortOrder !== candidate.sortOrder) {
          updateData.sortOrder = candidate.sortOrder;
          needsUpdate = true;
        }

        if (existing.isEditedByUser) {
          preservedEditedCount += 1;
        } else {
          if (existing.name !== candidate.name) {
            updateData.name = candidate.name;
            needsUpdate = true;
          }
          if (existing.category !== candidate.category) {
            updateData.category = candidate.category;
            needsUpdate = true;
          }
          if (existing.quantity !== candidate.quantity) {
            updateData.quantity = candidate.quantity;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await tx.packingItem.update({
            where: { id: existing.id },
            data: updateData,
          });
          updatedCount += 1;
        }
      }

      if (itemsToCreate.length > 0) {
        await tx.packingItem.createMany({
          data: itemsToCreate,
        });
      }

      // Помечаем как устаревшие только активные GENERATED-позиции с ruleKey,
      // которые больше не подходят текущему маршруту. CUSTOM и ruleKey = null не трогаем.
      const outdatedIds: string[] = [];
      for (const existing of existingItems) {
        if (
          existing.source === PackingItemSource.GENERATED &&
          existing.ruleKey !== null &&
          !existing.isDismissed &&
          !matchedRuleKeys.has(existing.ruleKey)
        ) {
          if (!existing.isOutdated) {
            outdatedIds.push(existing.id);
          }
        }
      }

      if (outdatedIds.length > 0) {
        await tx.packingItem.updateMany({
          where: { id: { in: outdatedIds } },
          data: { isOutdated: true },
        });
        outdatedCount = outdatedIds.length;
      }

      const visibleItems = await tx.packingItem.findMany({
        where: {
          packingListId: packingList.id,
          isDismissed: false,
        },
      });

      const sorted = sortPackingItems(visibleItems);

      return {
        exists: true,
        packingList: serializePackingListMeta(packingList),
        items: sorted.map(serializePackingItem),
        summary: computePackingSummary(sorted),
        mergeStats: {
          addedCount,
          updatedCount,
          outdatedCount,
          restoredFromOutdatedCount,
          preservedDismissedCount,
          preservedEditedCount,
        },
      };
    });

    return result;
  }

  static async addCustomItem(
    userId: string,
    tripId: string,
    input: CreatePackingItemInput
  ) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Trip" WHERE id = ${tripId} FOR UPDATE`;

      const packingList = await tx.packingList.upsert({
        where: { tripId },
        create: { tripId },
        update: {},
      });

      const agg = await tx.packingItem.aggregate({
        where: {
          packingListId: packingList.id,
          category: input.category as PackingCategory,
        },
        _max: { sortOrder: true },
      });

      const nextSortOrder = Math.max(10000, (agg._max.sortOrder ?? 0) + 10);

      return tx.packingItem.create({
        data: {
          packingListId: packingList.id,
          category: input.category as PackingCategory,
          name: input.name,
          quantity: input.quantity ?? null,
          isPacked: false,
          source: PackingItemSource.CUSTOM,
          ruleKey: null,
          reason: null,
          isEditedByUser: false,
          isOutdated: false,
          isDismissed: false,
          sortOrder: nextSortOrder,
        },
      });
    });

    return serializePackingItem(created);
  }

  static async updatePackingItem(
    userId: string,
    itemId: string,
    input: UpdatePackingItemInput
  ) {
    const existing = await this.getOwnedPackingItem(userId, itemId);

    const dataToUpdate: Prisma.PackingItemUpdateInput = {};
    let contentEdited = false;

    if (input.name !== undefined) {
      dataToUpdate.name = input.name;
      if (input.name !== existing.name) {
        contentEdited = true;
      }
    }

    if (input.category !== undefined) {
      dataToUpdate.category = input.category as PackingCategory;
      if (input.category !== existing.category) {
        contentEdited = true;
      }
    }

    if (input.quantity !== undefined) {
      dataToUpdate.quantity = input.quantity;
      if (input.quantity !== existing.quantity) {
        contentEdited = true;
      }
    }

    if (input.isPacked !== undefined) {
      dataToUpdate.isPacked = input.isPacked;
    }

    // При изменении только isPacked флаг isEditedByUser не выставляется.
    if (
      existing.source === PackingItemSource.GENERATED &&
      contentEdited &&
      !existing.isEditedByUser
    ) {
      dataToUpdate.isEditedByUser = true;
    }

    const updated = await prisma.packingItem.update({
      where: { id: itemId },
      data: dataToUpdate,
    });

    return serializePackingItem(updated);
  }

  static async deletePackingItem(userId: string, itemId: string) {
    const existing = await this.getOwnedPackingItem(userId, itemId);

    if (existing.source === PackingItemSource.CUSTOM) {
      await prisma.packingItem.delete({
        where: { id: itemId },
      });
      return {
        deleted: true,
        mode: 'hard' as const,
        id: itemId,
      };
    }

    await prisma.packingItem.update({
      where: { id: itemId },
      data: { isDismissed: true },
    });

    return {
      deleted: true,
      mode: 'dismissed' as const,
      id: itemId,
    };
  }

  static async clearOutdatedItems(userId: string, tripId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Trip" WHERE id = ${tripId} FOR UPDATE`;

      const packingList = await tx.packingList.findUnique({
        where: { tripId },
      });

      if (!packingList) {
        return { deletedCount: 0 };
      }

      // Удаляем физически только видимые устаревшие GENERATED-позиции.
      // CUSTOM-позиции и отклонённые (isDismissed = true) записи не затрагиваются.
      const res = await tx.packingItem.deleteMany({
        where: {
          packingListId: packingList.id,
          source: PackingItemSource.GENERATED,
          isOutdated: true,
          isDismissed: false,
        },
      });

      return { deletedCount: res.count };
    });
  }
}
