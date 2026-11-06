import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import { setAuthCookies, clearAuthCookies, CSRF_COOKIE_NAME } from '../lib/jwt';
import { sendSuccess } from '../lib/errors';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.parse(req.body);
      const user = await AuthService.register(parsed);
      setAuthCookies(res, { userId: user.id, email: user.email });
      return sendSuccess(res, { user }, 201, 'Регистрация прошла успешно');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);
      const user = await AuthService.login(parsed);
      setAuthCookies(res, { userId: user.id, email: user.email });
      return sendSuccess(res, { user }, 200, 'Вход выполнен успешно');
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookies(res);
      return sendSuccess(res, { loggedOut: true }, 200, 'Вы вышли из аккаунта');
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      if (!req.cookies?.[CSRF_COOKIE_NAME]) {
        const csrfToken = crypto.randomBytes(24).toString('hex');
        res.cookie(CSRF_COOKIE_NAME, csrfToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }
      return sendSuccess(res, { user }, 200);
    } catch (err) {
      next(err);
    }
  }
}
