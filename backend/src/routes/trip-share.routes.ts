import { Router } from 'express';
import { TripShareController } from '../controllers/trip-share.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Публичное чтение маршрута по токену (БЕЗ авторизации)
router.get('/trips/:token', TripShareController.getPublicSharedTrip);

// Клонирование публичного маршрута в аккаунт авторизованного попутчика
router.post('/trips/:token/clone', requireAuth, TripShareController.cloneSharedTrip);

export default router;
