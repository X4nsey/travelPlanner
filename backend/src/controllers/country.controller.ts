import { Request, Response, NextFunction } from 'express';
import { CountryService } from '../services/country.service';
import { sendSuccess } from '../lib/errors';

export class CountryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const continent = typeof req.query.continent === 'string' ? req.query.continent : undefined;
      const sort = req.query.sort === 'desc' ? 'desc' : 'asc';

      const countries = CountryService.listCountries({ search, continent, sort });
      return sendSuccess(res, { countries }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await CountryService.getCountryDetail(req.params.slug);
      return sendSuccess(res, { country }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const photos = await CountryService.getCountryPhotos(req.params.slug);
      return sendSuccess(res, photos, 200);
    } catch (err) {
      next(err);
    }
  }
}
