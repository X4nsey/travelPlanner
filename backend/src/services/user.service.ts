import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { UpdateProfileInput, UpdatePasswordInput } from '../schemas/user.schema';
import { serializeUser } from './auth.service';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    return serializeUser(user);
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
      },
    });

    return serializeUser(updated);
  }

  static async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const isCurrentValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AppError(
        'Текущий пароль указан неверно',
        400,
        'INVALID_CURRENT_PASSWORD',
        { currentPassword: ['Текущий пароль указан неверно'] }
      );
    }

    const isSamePassword = await bcrypt.compare(input.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new AppError(
        'Новый пароль должен отличаться от текущего',
        400,
        'SAME_PASSWORD',
        { newPassword: ['Новый пароль должен отличаться от текущего'] }
      );
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { updated: true };
  }
}
