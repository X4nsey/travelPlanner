import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CreateEventInput, UpdateEventInput } from '../schemas/event.schema';
import { formatDateOnly, parseDateOnly, TripService } from './trip.service';

export function serializeEvent(event: any) {
  return {
    id: event.id,
    tripId: event.tripId,
    date: formatDateOnly(event.date),
    title: event.title,
    description: event.description || '',
    startTime: event.startTime ?? null,
    endTime: event.endTime ?? null,
    location: event.location ?? null,
    estimatedCost: event.estimatedCost !== null && event.estimatedCost !== undefined ? Number(event.estimatedCost) : null,
    note: event.note ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function sortEventsChronologically<T extends { date: Date; startTime?: string | null; endTime?: string | null; createdAt: Date }>(
  events: T[]
): T[] {
  return [...events].sort((a, b) => {
    const dateA = formatDateOnly(a.date);
    const dateB = formatDateOnly(b.date);
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    // Events with a startTime come before events without a startTime, ordered by HH:MM
    if (a.startTime && b.startTime) {
      if (a.startTime !== b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
    } else if (a.startTime && !b.startTime) {
      return -1;
    } else if (!a.startTime && b.startTime) {
      return 1;
    }

    if (a.endTime && b.endTime && a.endTime !== b.endTime) {
      return a.endTime.localeCompare(b.endTime);
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export class EventService {
  static async listTripEvents(userId: string, tripId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const events = await prisma.itineraryEvent.findMany({
      where: { tripId },
    });

    return sortEventsChronologically(events).map(serializeEvent);
  }

  static async createTripEvent(userId: string, tripId: string, input: CreateEventInput) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const tripStart = formatDateOnly(trip.startDate);
    const tripEnd = formatDateOnly(trip.endDate);

    if (input.date < tripStart || input.date > tripEnd) {
      throw new AppError(
        `Дата мероприятия (${input.date}) должна находиться в пределах дат поездки (${tripStart} — ${tripEnd})`,
        400,
        'EVENT_DATE_OUT_OF_RANGE',
        { date: [`Дата мероприятия должна быть между ${tripStart} и ${tripEnd}`] }
      );
    }

    const event = await prisma.itineraryEvent.create({
      data: {
        tripId,
        date: parseDateOnly(input.date),
        title: input.title,
        description: input.description ?? '',
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        estimatedCost: input.estimatedCost ?? null,
        note: input.note ?? null,
      },
    });

    return serializeEvent(event);
  }

  static async getEventAndVerifyOwner(userId: string, eventId: string) {
    const event = await prisma.itineraryEvent.findUnique({
      where: { id: eventId },
      include: {
        trip: true,
      },
    });

    if (!event) {
      throw new AppError('Мероприятие не найдено', 404, 'EVENT_NOT_FOUND');
    }

    if (event.trip.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этому мероприятию', 403, 'FORBIDDEN');
    }

    return event;
  }

  static async getEventById(userId: string, eventId: string) {
    const event = await this.getEventAndVerifyOwner(userId, eventId);
    return serializeEvent(event);
  }

  static async updateEvent(userId: string, eventId: string, input: UpdateEventInput) {
    const existing = await this.getEventAndVerifyOwner(userId, eventId);

    const tripStart = formatDateOnly(existing.trip.startDate);
    const tripEnd = formatDateOnly(existing.trip.endDate);
    const effectiveDate = input.date ?? formatDateOnly(existing.date);

    if (effectiveDate < tripStart || effectiveDate > tripEnd) {
      throw new AppError(
        `Дата мероприятия (${effectiveDate}) должна находиться в пределах дат поездки (${tripStart} — ${tripEnd})`,
        400,
        'EVENT_DATE_OUT_OF_RANGE',
        { date: [`Дата мероприятия должна быть между ${tripStart} и ${tripEnd}`] }
      );
    }

    const effectiveStartTime = input.startTime !== undefined ? input.startTime : existing.startTime;
    const effectiveEndTime = input.endTime !== undefined ? input.endTime : existing.endTime;

    if (effectiveStartTime && effectiveEndTime && effectiveEndTime < effectiveStartTime) {
      throw new AppError(
        'Время окончания не может быть раньше времени начала',
        400,
        'VALIDATION_ERROR',
        { endTime: ['Время окончания не может быть раньше времени начала'] }
      );
    }

    const updated = await prisma.itineraryEvent.update({
      where: { id: eventId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.date !== undefined ? { date: parseDateOnly(input.date) } : {}),
        ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
        ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.estimatedCost !== undefined ? { estimatedCost: input.estimatedCost } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
      },
    });

    return serializeEvent(updated);
  }

  static async deleteEvent(userId: string, eventId: string) {
    await this.getEventAndVerifyOwner(userId, eventId);

    await prisma.itineraryEvent.delete({
      where: { id: eventId },
    });

    return { deleted: true, id: eventId };
  }
}
