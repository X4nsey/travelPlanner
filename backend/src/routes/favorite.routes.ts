import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', FavoriteController.list);
router.post('/', FavoriteController.add);
router.post('/:slug', FavoriteController.add);
router.delete('/:slug', FavoriteController.remove);

export default router;
