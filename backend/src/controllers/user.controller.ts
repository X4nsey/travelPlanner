import { Request, Response, NextFunction } from 'express';
import { updateProfileSchema, updatePasswordSchema } from '../schemas/user.schema';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../lib/errors';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      return sendSuccess(res, { user }, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProfileSchema.parse(req.body);
      const user = await UserService.updateProfile(req.user!.id, parsed);
      return sendSuccess(res, { user }, 200, 'Профиль успешно обновлён');
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updatePasswordSchema.parse(req.body);
      const result = await UserService.updatePassword(req.user!.id, parsed);
      return sendSuccess(res, result, 200, 'Пароль успешно изменён');
    } catch (err) {
      next(err);
    }
  }
}
