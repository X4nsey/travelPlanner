import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id', EventController.getById);
router.patch('/:id', EventController.update);
router.delete('/:id', EventController.remove);

export default router;
