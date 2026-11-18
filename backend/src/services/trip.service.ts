import { DocumentStatus, PackingItemSource, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { TRIP_TEMPLATES, findTripTemplateByIdOrSlug } from '../data/trip-templates';
import {
  CreateTripFromTemplateInput,
  CreateTripInput,
  DuplicateTripInput,
  UpdateTripInput,
} from '../schemas/trip.schema';
import { serializeEvent, sortEventsChronologically } from './event.service';
import { PackingEngineService } from './packing-engine.service';
import { DocumentService } from './document.service';

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function addDaysToDateOnly(dateStr: string, offsetDays: number): string {
  const baseMs = parseDateOnly(dateStr).getTime();
  const shifted = new Date(baseMs + offsetDays * 24 * 60 * 60 * 1000);
  return formatDateOnly(shifted);
}

export function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  const start = parseDateOnly(startDateStr).getTime();
  const end = parseDateOnly(endDateStr).getTime();
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

export function serializeTrip(trip: any) {
  const startDate = formatDateOnly(trip.startDate);
  const endDate = formatDateOnly(trip.endDate);
  const durationDays = calculateDurationDays(startDate, endDate);

  return {
    id: trip.id,
    userId: trip.userId,
    title: trip.title,
    country: trip.country,
    city: trip.city,
    startDate,
    endDate,
    durationDays,
    travelersCount: trip.travelersCount,
    budget: Number(trip.budget),
    currency: trip.currency,
    tripType: trip.tripType ?? null,
    description: trip.description || '',
    eventsCount: trip._count?.events ?? (Array.isArray(trip.events) ? trip.events.length : undefined),
    ...(Array.isArray(trip.events)
      ? { events: sortEventsChronologically(trip.events).map(serializeEvent) }
      : {}),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}

export class TripService {
  static async listUserTrips(userId: string) {
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    });

    return trips.map(serializeTrip);
  }

  static async getTripAndVerifyOwner(userId: string, tripId: string, includeEvents = false) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: includeEvents
        ? {
            events: true,
            _count: { select: { events: true } },
          }
        : {
            _count: { select: { events: true } },
          },
    });

    if (!trip) {
      throw new AppError('Поездка не найдена', 404, 'TRIP_NOT_FOUND');
    }

    if (trip.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этой поездке', 403, 'FORBIDDEN');
    }

    return trip;
  }

  static async getTripById(userId: string, tripId: string) {
    const trip = await this.getTripAndVerifyOwner(userId, tripId, true);
    return serializeTrip(trip);
  }

  static async createTrip(userId: string, input: CreateTripInput) {
    const trip = await prisma.trip.create({
      data: {
        userId,
        title: input.title,
        country: input.country,
        city: input.city,
        startDate: parseDateOnly(input.startDate),
        endDate: parseDateOnly(input.endDate),
        travelersCount: input.travelersCount,
        budget: input.budget,
        currency: input.currency,
        tripType: input.tripType ?? null,
        description: input.description ?? '',
      },
      include: {
        _count: { select: { events: true } },
      },
    });

    return serializeTrip(trip);
  }

  static async updateTrip(userId: string, tripId: string, input: UpdateTripInput) {
    const existing = await this.getTripAndVerifyOwner(userId, tripId, true);

    const oldStartDateStr = formatDateOnly(existing.startDate);
    const oldEndDateStr = formatDateOnly(existing.endDate);
    const newStartDateStr = input.startDate ?? oldStartDateStr;
    const newEndDateStr = input.endDate ?? oldEndDateStr;

    if (newEndDateStr < newStartDateStr) {
      throw new AppError(
        'Дата окончания не может быть раньше даты начала',
        400,
        'VALIDATION_ERROR',
        { endDate: ['Дата окончания не может быть раньше даты начала'] }
      );
    }

    // Check if any existing events fall outside the new trip date range
    const events = (existing as any).events || [];
    const outOfRangeEvents = events.filter((ev: any) => {
      const evDateStr = formatDateOnly(ev.date);
      return evDateStr < newStartDateStr || evDateStr > newEndDateStr;
    });

    if (outOfRangeEvents.length > 0) {
      throw new AppError(
        `Невозможно изменить даты поездки: в плане уже есть мероприятия (${outOfRangeEvents.length} шт.) за пределами выбранного периода (${newStartDateStr} — ${newEndDateStr}). Сначала перенесите или удалите эти мероприятия.`,
        400,
        'EVENTS_OUT_OF_RANGE',
        {
          startDate: ['В плане есть мероприятия за пределами нового диапазона дат'],
        }
      );
    }

    const nextCountry = input.country !== undefined ? input.country : existing.country;
    const nextCity = input.city !== undefined ? input.city : existing.city;
    const weatherFieldsChanged =
      nextCountry.trim() !== existing.country.trim() ||
      nextCity.trim() !== existing.city.trim() ||
      newStartDateStr !== oldStartDateStr ||
      newEndDateStr !== oldEndDateStr;

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.startDate !== undefined ? { startDate: parseDateOnly(input.startDate) } : {}),
        ...(input.endDate !== undefined ? { endDate: parseDateOnly(input.endDate) } : {}),
        ...(input.travelersCount !== undefined ? { travelersCount: input.travelersCount } : {}),
        ...(input.budget !== undefined ? { budget: input.budget } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.tripType !== undefined ? { tripType: input.tripType } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
      include: {
        events: true,
        _count: { select: { events: true } },
      },
    });

    if (weatherFieldsChanged) {
      await prisma.tripWeatherCache.deleteMany({
        where: { tripId },
      });
    }

    return serializeTrip(updated);
  }

  static async deleteTrip(userId: string, tripId: string) {
    await this.getTripAndVerifyOwner(userId, tripId, false);

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return { deleted: true, id: tripId };
  }

  static listTemplates() {
    return TRIP_TEMPLATES;
  }

  static async createTripFromTemplate(userId: string, input: CreateTripFromTemplateInput) {
    const template = findTripTemplateByIdOrSlug(input.templateId);
    if (!template) {
      throw new AppError('Шаблон маршрута не найден', 404, 'TEMPLATE_NOT_FOUND');
    }

    const startDateStr = input.startDate;
    const endDateStr = addDaysToDateOnly(startDateStr, template.durationDays - 1);
    const startDate = parseDateOnly(startDateStr);
    const endDate = parseDateOnly(endDateStr);

    const resolvedTitle = input.title ?? template.title;
    const resolvedTravelers = input.travelersCount ?? 1;
    const resolvedBudget = input.budget ?? template.recommendedBudget;
    const resolvedCurrency = input.currency ?? template.currency;

    const preparedEvents = template.events.map((ev) => {
      const clampedOffset = Math.max(0, Math.min(template.durationDays - 1, ev.dayOffset));
      const eventDateStr = addDaysToDateOnly(startDateStr, clampedOffset);
      return {
        date: parseDateOnly(eventDateStr),
        title: ev.title,
        description: ev.description || '',
        startTime: ev.startTime || null,
        endTime: ev.endTime || null,
        location: ev.location || null,
        estimatedCost: ev.estimatedCost ?? null,
        note: null,
      };
    });

    const createdTripId = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId,
          title: resolvedTitle,
          country: template.country,
          city: template.city,
          startDate,
          endDate,
          travelersCount: resolvedTravelers,
          budget: resolvedBudget,
          currency: resolvedCurrency,
          tripType: template.tripType,
          description: template.summary,
        },
      });

      if (preparedEvents.length > 0) {
        await tx.itineraryEvent.createMany({
          data: preparedEvents.map((ev) => ({
            tripId: newTrip.id,
            ...ev,
          })),
        });
      }

      if (input.autoGeneratePacking !== false) {
        const engineResult = PackingEngineService.generateRecommendations({
          title: resolvedTitle,
          country: template.country,
          city: template.city,
          startDate,
          endDate,
          travelersCount: resolvedTravelers,
          tripType: template.tripType,
          description: template.summary,
          weatherContext: null,
          events: preparedEvents.map((ev) => ({
            title: ev.title,
            description: ev.description,
            location: ev.location,
            note: ev.note,
            date: ev.date,
          })),
        });

        const now = new Date();
        const packingList = await tx.packingList.create({
          data: {
            tripId: newTrip.id,
            lastGeneratedAt: now,
            contextSnapshot: engineResult.context as unknown as Prisma.InputJsonValue,
          },
        });

        const seenRuleKeys = new Set<string>();
        const packingItemsData: Prisma.PackingItemCreateManyInput[] = [];
        for (const candidate of engineResult.items) {
          if (seenRuleKeys.has(candidate.ruleKey)) continue;
          seenRuleKeys.add(candidate.ruleKey);
          packingItemsData.push({
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
        }

        if (packingItemsData.length > 0) {
          await tx.packingItem.createMany({
            data: packingItemsData,
          });
        }
      }

      return newTrip.id;
    });

    if (input.autoSeedDocuments !== false) {
      await DocumentService.seedDefaultChecklist(createdTripId, userId);
    }

    return this.getTripById(userId, createdTripId);
  }

  static async duplicateTrip(userId: string, tripId: string, input: DuplicateTripInput) {
    const original = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        events: true,
        packingList: {
          include: {
            items: true,
          },
        },
        documents: true,
      },
    });

    if (!original) {
      throw new AppError('Поездка не найдена', 404, 'TRIP_NOT_FOUND');
    }

    if (original.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этой поездке', 403, 'FORBIDDEN');
    }

    const origStartStr = formatDateOnly(original.startDate);
    const origEndStr = formatDateOnly(original.endDate);
    const durationDays = calculateDurationDays(origStartStr, origEndStr);

    const newStartStr = input.startDate;
    const newEndStr = addDaysToDateOnly(newStartStr, durationDays - 1);
    const dayShift = Math.round(
      (parseDateOnly(newStartStr).getTime() - parseDateOnly(origStartStr).getTime()) /
        (24 * 60 * 60 * 1000)
    );

    const defaultTitle = `${original.title} (копия)`.slice(0, 150);
    const resolvedTitle = input.title ?? defaultTitle;

    const duplicatedTrip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId,
          title: resolvedTitle,
          country: original.country,
          city: original.city,
          startDate: parseDateOnly(newStartStr),
          endDate: parseDateOnly(newEndStr),
          travelersCount: original.travelersCount,
          budget: original.budget,
          currency: original.currency,
          tripType: original.tripType,
          description: original.description || '',
        },
      });

      if (input.includeEvents !== false && original.events.length > 0) {
        const shiftedEvents = original.events.map((ev) => {
          const shiftedDateStr = addDaysToDateOnly(formatDateOnly(ev.date), dayShift);
          const clampedDateStr =
            shiftedDateStr < newStartStr
              ? newStartStr
              : shiftedDateStr > newEndStr
                ? newEndStr
                : shiftedDateStr;

          return {
            tripId: newTrip.id,
            date: parseDateOnly(clampedDateStr),
            title: ev.title,
            description: ev.description || '',
            startTime: ev.startTime ?? null,
            endTime: ev.endTime ?? null,
            location: ev.location ?? null,
            estimatedCost: ev.estimatedCost ?? null,
            note: ev.note ?? null,
          };
        });

        await tx.itineraryEvent.createMany({
          data: shiftedEvents,
        });
      }

      if (input.includePackingList !== false && original.packingList) {
        const newPackingList = await tx.packingList.create({
          data: {
            tripId: newTrip.id,
            lastGeneratedAt: original.packingList.lastGeneratedAt,
            contextSnapshot: original.packingList.contextSnapshot ?? Prisma.DbNull,
          },
        });

        if (original.packingList.items.length > 0) {
          await tx.packingItem.createMany({
            data: original.packingList.items.map((item) => ({
              packingListId: newPackingList.id,
              category: item.category,
              name: item.name,
              quantity: item.quantity,
              isPacked: false,
              source: item.source,
              ruleKey: item.ruleKey,
              reason: item.reason,
              isEditedByUser: item.isEditedByUser,
              isOutdated: false,
              isDismissed: item.isDismissed,
              sortOrder: item.sortOrder,
            })),
          });
        }
      }

      if (input.includeDocumentsChecklist !== false && original.documents.length > 0) {
        await tx.tripDocument.createMany({
          data: original.documents.map((doc) => ({
            tripId: newTrip.id,
            title: doc.title,
            category: doc.category,
            status: DocumentStatus.REQUIRED,
            provider: doc.provider || '',
            // Privacy-by-Design: очищаем номера броней, даты и файловые метаданные при копировании
            referenceCode: '',
            eventDate: null,
            endDate: null,
            externalUrl: doc.externalUrl || '',
            notes: doc.notes || '',
            fileName: null,
            fileMimeType: null,
            fileSize: null,
            fileDataBase64: null,
          })),
        });
      }

      // TripExpense не копируются: новая поездка начинается с чистого бюджета

      return tx.trip.findUniqueOrThrow({
        where: { id: newTrip.id },
        include: {
          events: true,
          _count: { select: { events: true } },
        },
      });
    });

    return serializeTrip(duplicatedTrip);
  }
}
