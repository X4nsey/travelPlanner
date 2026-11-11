import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id', ExpenseController.getById);
router.patch('/:id', ExpenseController.update);
router.delete('/:id', ExpenseController.remove);

export default router;
