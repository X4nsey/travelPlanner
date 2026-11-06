import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { Response } from 'express';

export const AUTH_COOKIE_NAME = 'travelplanner_session';
export const CSRF_COOKIE_NAME = 'travelplanner_csrf';

export interface JwtPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    return 'travelplanner-local-dev-jwt-secret-key-2026-secure';
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function setAuthCookies(res: Response, payload: JwtPayload): string {
  const token = signToken(payload);
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  // HttpOnly session cookie (inaccessible to JavaScript)
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  // Readable CSRF cookie for double-submit CSRF verification
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  return csrfToken;
}

export function clearAuthCookies(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}
