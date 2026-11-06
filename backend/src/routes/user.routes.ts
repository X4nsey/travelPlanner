import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', UserController.updateMe);
router.patch('/me/password', UserController.updatePassword);

export default router;
