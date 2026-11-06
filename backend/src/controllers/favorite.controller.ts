import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FavoriteService } from '../services/favorite.service';
import { sendSuccess } from '../lib/errors';

const addFavoriteSchema = z
  .object({
    countrySlug: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
  })
  .refine((data) => Boolean(data.countrySlug || data.slug), {
    message: 'Укажите идентификатор страны (countrySlug или slug)',
  });

export class FavoriteController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FavoriteService.listUserFavorites(req.user!.id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const slugFromParams = req.params.slug;
      let slug = slugFromParams;
      if (!slug) {
        const parsed = addFavoriteSchema.parse(req.body);
        slug = (parsed.countrySlug || parsed.slug)!;
      }

      const result = await FavoriteService.addFavorite(req.user!.id, slug);
      return sendSuccess(res, result, 201, 'Страна добавлена в избранное');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FavoriteService.removeFavorite(req.user!.id, req.params.slug);
      return sendSuccess(res, result, 200, 'Страна удалена из избранного');
    } catch (err) {
      next(err);
    }
  }
}
