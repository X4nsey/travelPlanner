import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/errors';
import { WeatherService } from '../services/weather.service';

export class WeatherController {
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
