import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/errors';
import { WeatherService } from '../services/weather.service';

export function parseWeatherPreviewQuery(query: Request['query']) {
  return {
    country: typeof query.country === 'string' ? query.country : '',
    city: typeof query.city === 'string' ? query.city : undefined,
    startDate: typeof query.startDate === 'string' ? query.startDate : undefined,
    endDate: typeof query.endDate === 'string' ? query.endDate : undefined,
  };
}

export class WeatherController {
  static async getPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WeatherService.getDestinationWeatherPreview(
        parseWeatherPreviewQuery(req.query)
      );
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WeatherService.getTripWeather(
        req.params.tripId,
        req.user!.id,
        { forceRefresh: false }
      );
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async refreshForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WeatherService.getTripWeather(
        req.params.tripId,
        req.user!.id,
        { forceRefresh: true }
      );
      return sendSuccess(res, result, 200, 'Прогноз погоды обновлён');
    } catch (err) {
      next(err);
    }
  }
}
