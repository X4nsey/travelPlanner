import { Request, Response, NextFunction } from 'express';
import { createTripSchema, updateTripSchema } from '../schemas/trip.schema';
import { TripService } from '../services/trip.service';
import { sendSuccess } from '../lib/errors';

export class TripController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await TripService.listUserTrips(req.user!.id);
      return sendSuccess(res, { trips }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.getTripById(req.user!.id, req.params.id);
      return sendSuccess(res, { trip }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createTripSchema.parse(req.body);
      const trip = await TripService.createTrip(req.user!.id, parsed);
      return sendSuccess(res, { trip }, 201, 'Поездка успешно создана');
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateTripSchema.parse(req.body);
      const trip = await TripService.updateTrip(req.user!.id, req.params.id, parsed);
      return sendSuccess(res, { trip }, 200, 'Поездка успешно обновлена');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripService.deleteTrip(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Поездка удалена');
    } catch (err) {
      next(err);
    }
  }
}
