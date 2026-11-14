import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/errors';
import { createPackingItemSchema, updatePackingItemSchema } from '../schemas/packing.schema';
import { PackingListService } from '../services/packing-list.service';

export class PackingController {
  static async getByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PackingListService.getTripPackingList(
        req.user!.id,
        req.params.tripId
      );
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async generateForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PackingListService.generateTripPackingList(
        req.user!.id,
        req.params.tripId
      );
      return sendSuccess(res, result, 200, 'Список вещей сформирован');
    } catch (err) {
      next(err);
    }
  }

  static async createItemForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createPackingItemSchema.parse(req.body ?? {});
      const item = await PackingListService.addCustomItem(
        req.user!.id,
        req.params.tripId,
        parsed
      );
      return sendSuccess(res, { item }, 201, 'Позиция добавлена в список вещей');
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updatePackingItemSchema.parse(req.body ?? {});
      const item = await PackingListService.updatePackingItem(
        req.user!.id,
        req.params.id,
        parsed
      );
      return sendSuccess(res, { item }, 200, 'Позиция списка вещей обновлена');
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PackingListService.deletePackingItem(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Позиция удалена из списка вещей');
    } catch (err) {
      next(err);
    }
  }

  static async clearOutdatedForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PackingListService.clearOutdatedItems(
        req.user!.id,
        req.params.tripId
      );
      return sendSuccess(res, result, 200, 'Устаревшие рекомендации удалены');
    } catch (err) {
      next(err);
    }
  }
}
