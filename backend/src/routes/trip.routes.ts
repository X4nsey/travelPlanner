import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { EventController } from '../controllers/event.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', TripController.list);
router.post('/', TripController.create);
router.get('/:id', TripController.getById);
router.patch('/:id', TripController.update);
router.delete('/:id', TripController.remove);

// Nested events routes for a specific trip
router.get('/:tripId/events', EventController.listByTrip);
router.post('/:tripId/events', EventController.createForTrip);

export default router;
