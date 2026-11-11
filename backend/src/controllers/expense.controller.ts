import { Request, Response, NextFunction } from 'express';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expense.schema';
import { ExpenseService } from '../services/expense.service';
import { sendSuccess } from '../lib/errors';

export class ExpenseController {
  static async listByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { expenses, summary } = await ExpenseService.listTripExpenses(
        req.user!.id,
        req.params.tripId
      );
      return sendSuccess(res, { expenses, summary }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createExpenseSchema.parse(req.body);
      const expense = await ExpenseService.createTripExpense(
        req.user!.id,
        req.params.tripId,
        parsed
      );
      return sendSuccess(res, { expense }, 201, 'Расход успешно добавлен');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await ExpenseService.getExpenseById(req.user!.id, req.params.id);
      return sendSuccess(res, { expense }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateExpenseSchema.parse(req.body);
      const expense = await ExpenseService.updateExpense(
        req.user!.id,
        req.params.id,
        parsed
      );
      return sendSuccess(res, { expense }, 200, 'Расход успешно обновлен');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExpenseService.deleteExpense(req.user!.id, req.params.id);
      return sendSuccess(res, result, 200, 'Расход удален');
    } catch (err) {
      next(err);
    }
  }
}
