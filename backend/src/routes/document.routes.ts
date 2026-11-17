import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.patch('/:id', DocumentController.update);
router.delete('/:id', DocumentController.remove);
router.get('/:id/attachment', DocumentController.getAttachment);

export default router;
