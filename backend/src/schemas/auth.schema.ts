import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Имя обязательно для заполнения' })
      .trim()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(80, 'Имя не должно превышать 80 символов'),
    email: z
      .string({ required_error: 'Электронная почта обязательна' })
      .trim()
      .toLowerCase()
      .email('Введите корректный адрес электронной почты')
      .max(120, 'Электронная почта слишком длинная'),
    password: z
      .string({ required_error: 'Пароль обязателен' })
      .min(6, 'Пароль должен содержать минимум 6 символов')
      .max(100, 'Пароль слишком длинный'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Пароли не совпадают',
      path: ['confirmPassword'],
    }
  );

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Введите электронную почту' })
    .trim()
    .toLowerCase()
    .email('Введите корректный адрес электронной почты'),
  password: z
    .string({ required_error: 'Введите пароль' })
    .min(1, 'Введите пароль'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
