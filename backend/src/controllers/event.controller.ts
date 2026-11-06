import { Request, Response, NextFunction } from 'express';
import { createEventSchema, updateEventSchema } from '../schemas/event.schema';
import { EventService } from '../services/event.service';
import { sendSuccess } from '../lib/errors';

export class EventController {
  static async listByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventService.listTripEvents(req.user!.id, req.params.tripId);
      return sendSuccess(res, { events }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createEventSchema.parse(req.body);
      const event = await EventService.createTripEvent(req.user!.id, req.params.tripId, parsed);
      return sendSuccess(res, { event }, 201, 'Мероприятие добавлено в план поездки');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.getEventById(req.user!.id, req.params.id);
      return sendSuccess(res, { event }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateEventSchema.parse(req.body);
      const event = await EventService.updateEvent(req.user!.id, req.params.id, parsed);
      return sendSuccess(res, { event }, 200, 'Мероприятие успешно обновлено');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EventService.deleteEvent(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Мероприятие удалено');
    } catch (err) {
      next(err);
    }
  }
}
