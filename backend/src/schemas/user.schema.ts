import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: 'Имя обязательно для заполнения' })
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(80, 'Имя не должно превышать 80 символов'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Текущий пароль обязателен' })
      .min(1, 'Введите текущий пароль'),
    newPassword: z
      .string({ required_error: 'Новый пароль обязателен' })
      .min(6, 'Новый пароль должен содержать минимум 6 символов')
      .max(100, 'Новый пароль слишком длинный'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Подтверждение пароля не совпадает с новым паролем',
      path: ['confirmPassword'],
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
