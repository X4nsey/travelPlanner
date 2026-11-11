import { Request, Response, NextFunction } from 'express';
import { CountryService } from '../services/country.service';
import { PhotoService } from '../services/photo.service';
import { AppError, sendSuccess } from '../lib/errors';

export class CountryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const continent = typeof req.query.continent === 'string' ? req.query.continent : undefined;
      const sort = req.query.sort === 'desc' ? 'desc' : 'asc';

      const countries = await CountryService.listCountriesAsync({ search, continent, sort });
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

  static async getPhotoDiagnostics(req: Request, res: Response, next: NextFunction) {
    try {
      const countrySlug = typeof req.query.countrySlug === 'string' ? req.query.countrySlug : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const targetType = typeof req.query.targetType === 'string' ? req.query.targetType : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const report = await PhotoService.getDiagnosticsReport({
        countrySlug,
        status,
        targetType,
        search,
      });

      return sendSuccess(res, report, 200);
    } catch (err) {
      next(err);
    }
  }

  static async replacePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        countrySlug,
        targetType,
        targetKey,
        url,
        thumbUrl,
        objectName,
        cityName,
        authorName,
        sourceName,
        sourceUrl,
        license,
      } = req.body || {};

      if (!countrySlug || !targetType || targetKey === undefined || !url) {
        throw new AppError(
          'Укажите страну, раздел, ключ объекта и URL изображения',
          400,
          'VALIDATION_ERROR'
        );
      }

      const record = await PhotoService.replacePhoto({
        countrySlug: String(countrySlug),
        targetType,
        targetKey: String(targetKey),
        url: String(url),
        thumbUrl: thumbUrl ? String(thumbUrl) : undefined,
        objectName: objectName ? String(objectName) : undefined,
        cityName: cityName ? String(cityName) : undefined,
        authorName: authorName ? String(authorName) : undefined,
        sourceName: sourceName ? String(sourceName) : undefined,
        sourceUrl: sourceUrl ? String(sourceUrl) : undefined,
        license: license ? String(license) : undefined,
      });

      return sendSuccess(res, { record }, 200, 'Фотография успешно проверена и сохранена');
    } catch (err: any) {
      if (err instanceof AppError) return next(err);
      return next(new AppError(err?.message || 'Ошибка при замене фотографии', 400, 'PHOTO_VERIFICATION_FAILED'));
    }
  }

  static async reverifyPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { countrySlug, targetType, targetKey } = req.body || {};
      if (!countrySlug || !targetType || targetKey === undefined) {
        throw new AppError('Укажите страну, раздел и ключ объекта', 400, 'VALIDATION_ERROR');
      }

      const record = await PhotoService.reverifyPhoto({
        countrySlug: String(countrySlug),
        targetType,
        targetKey: String(targetKey),
      });

      return sendSuccess(res, { record }, 200, 'Повторная проверка изображения завершена');
    } catch (err: any) {
      if (err instanceof AppError) return next(err);
      return next(new AppError(err?.message || 'Ошибка при повторной проверке', 400, 'PHOTO_REVERIFY_FAILED'));
    }
  }

  static async autoSearchWikimedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { countrySlug, targetType, targetKey, customQuery } = req.body || {};
      if (!countrySlug || !targetType || targetKey === undefined) {
        throw new AppError('Укажите страну, раздел и ключ объекта', 400, 'VALIDATION_ERROR');
      }

      const record = await PhotoService.autoSearchAndSaveWikimediaPhoto({
        countrySlug: String(countrySlug),
        targetType,
        targetKey: String(targetKey),
        customQuery: customQuery ? String(customQuery) : undefined,
      });

      return sendSuccess(
        res,
        { record },
        200,
        'Проверенная фотография из Wikimedia Commons успешно подобрана и сохранена'
      );
    } catch (err: any) {
      if (err instanceof AppError) return next(err);
      return next(new AppError(err?.message || 'Не удалось подобрать фотографию', 400, 'WIKIMEDIA_SEARCH_FAILED'));
    }
  }

  static async resetPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { countrySlug, targetType, targetKey } = req.body || {};
      if (!countrySlug || !targetType || targetKey === undefined) {
        throw new AppError('Укажите страну, раздел и ключ объекта', 400, 'VALIDATION_ERROR');
      }

      const result = await PhotoService.resetPhotoOverride({
        countrySlug: String(countrySlug),
        targetType,
        targetKey: String(targetKey),
      });

      return sendSuccess(res, result, 200, 'Ручное закрепление фотографии успешно снято');
    } catch (err: any) {
      if (err instanceof AppError) return next(err);
      return next(
        new AppError(
          err?.message || 'Ошибка при снятии ручного закрепления',
          400,
          'PHOTO_RESET_FAILED'
        )
      );
    }
  }
}
