import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { EventController } from '../controllers/event.controller';
import { ExpenseController } from '../controllers/expense.controller';
import { PackingController } from '../controllers/packing.controller';
import { DocumentController } from '../controllers/document.controller';
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

// Nested expenses routes for a specific trip
router.get('/:tripId/expenses', ExpenseController.listByTrip);
router.post('/:tripId/expenses', ExpenseController.createForTrip);

// Nested smart packing list routes for a specific trip
router.get('/:tripId/packing', PackingController.getByTrip);
router.post('/:tripId/packing/generate', PackingController.generateForTrip);
router.post('/:tripId/packing/items', PackingController.createItemForTrip);
router.delete('/:tripId/packing/outdated', PackingController.clearOutdatedForTrip);

// Nested documents & bookings routes for a specific trip
router.get('/:tripId/documents', DocumentController.listByTrip);
router.post('/:tripId/documents', DocumentController.createForTrip);
router.post('/:tripId/documents/seed-defaults', DocumentController.seedDefaultsForTrip);

export default router;
