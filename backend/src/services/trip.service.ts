import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CreateTripInput, UpdateTripInput } from '../schemas/trip.schema';
import { serializeEvent, sortEventsChronologically } from './event.service';

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
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

    const newStartDateStr = input.startDate ?? formatDateOnly(existing.startDate);
    const newEndDateStr = input.endDate ?? formatDateOnly(existing.endDate);

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
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
      include: {
        events: true,
        _count: { select: { events: true } },
      },
    });

    return serializeTrip(updated);
  }

  static async deleteTrip(userId: string, tripId: string) {
    await this.getTripAndVerifyOwner(userId, tripId, false);

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return { deleted: true, id: tripId };
  }
}
