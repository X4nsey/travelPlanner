import { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME, verifyToken } from '../lib/jwt';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
      throw new AppError('Требуется авторизация. Пожалуйста, войдите в аккаунт.', 401, 'UNAUTHORIZED');
    }

    // CSRF protection for cookie-authenticated state-changing requests
    if (MUTATING_METHODS.has(req.method.toUpperCase())) {
      const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
      const csrfHeader = req.headers['x-csrf-token'];
      const requestedWith = req.headers['x-requested-with'];

      const csrfMatches = csrfCookie && csrfHeader && csrfCookie === csrfHeader;
      const hasCustomHeader = requestedWith === 'XMLHttpRequest';

      if (!csrfMatches && !hasCustomHeader) {
        throw new AppError('Недействительный CSRF-токен запроса. Обновите страницу и попробуйте снова.', 403, 'CSRF_INVALID');
      }
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError('Сессия истекла или недействительна. Пожалуйста, войдите снова.', 401, 'INVALID_SESSION');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError('Пользователь не найден. Пожалуйста, войдите снова.', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
