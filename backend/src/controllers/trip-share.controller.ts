import { Request, Response, NextFunction } from 'express';
import { updateTripShareSchema } from '../schemas/trip-share.schema';
import { TripShareService } from '../services/trip-share.service';
import { sendSuccess } from '../lib/errors';

export class TripShareController {
  static async getShareSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const share = await TripShareService.getShareSettings(req.user!.id, req.params.id);
      return sendSuccess(res, { share }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateShareSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateTripShareSchema.parse(req.body ?? {});
      const share = await TripShareService.updateShareSettings(
        req.user!.id,
        req.params.id,
        parsed
      );
      return sendSuccess(res, { share }, 200, 'Настройки публичного доступа сохранены');
    } catch (err) {
      next(err);
    }
  }

  static async regenerateShareToken(req: Request, res: Response, next: NextFunction) {
    try {
      const share = await TripShareService.regenerateShareToken(req.user!.id, req.params.id);
      return sendSuccess(
        res,
        { share },
        200,
        'Публичная ссылка обновлена. Старая ссылка больше недействительна'
      );
    } catch (err) {
      next(err);
    }
  }

  static async getPublicSharedTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TripShareService.getPublicSharedTrip(req.params.token);
      return sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  }

  static async cloneSharedTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripShareService.cloneSharedTrip(req.user!.id, req.params.token);
      return sendSuccess(res, { trip }, 201, 'Маршрут успешно скопирован в ваш аккаунт');
    } catch (err) {
      next(err);
    }
  }
}
