import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AppError(
        'Пользователь с такой электронной почтой уже зарегистрирован',
        409,
        'EMAIL_ALREADY_EXISTS',
        { email: ['Пользователь с такой электронной почтой уже зарегистрирован'] }
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    return serializeUser(user);
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(
        'Неверная электронная почта или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(
        'Неверная электронная почта или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    return serializeUser(user);
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    return serializeUser(user);
  }
}
