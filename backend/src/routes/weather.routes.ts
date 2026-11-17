import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const weatherPreviewRouter = Router();
weatherPreviewRouter.get('/preview', WeatherController.getPreview);

const router = Router();

router.use(requireAuth);

router.get('/:tripId/weather', WeatherController.getByTrip);
router.post('/:tripId/weather/refresh', WeatherController.refreshForTrip);

export default router;
