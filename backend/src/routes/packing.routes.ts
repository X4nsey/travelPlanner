import { Router } from 'express';
import { PackingController } from '../controllers/packing.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.patch('/:id', PackingController.updateItem);
router.delete('/:id', PackingController.removeItem);

export default router;
