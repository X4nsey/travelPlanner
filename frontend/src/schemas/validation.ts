import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const registerValidationSchema = z
  .object({
    name: z
      .string({ required_error: 'Введите ваше имя' })
      .trim()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(80, 'Имя не должно превышать 80 символов'),
    email: z
      .string({ required_error: 'Введите электронную почту' })
      .trim()
      .email('Введите корректный адрес электронной почты'),
    password: z
      .string({ required_error: 'Введите пароль' })
      .min(6, 'Пароль должен содержать минимум 6 символов')
      .max(100, 'Пароль слишком длинный'),
    confirmPassword: z
      .string({ required_error: 'Подтвердите пароль' })
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const loginValidationSchema = z.object({
  email: z
    .string({ required_error: 'Введите электронную почту' })
    .trim()
    .email('Введите корректный адрес электронной почты'),
  password: z
    .string({ required_error: 'Введите пароль' })
    .min(1, 'Введите пароль'),
});

export const tripValidationSchema = z
  .object({
    title: z
      .string({ required_error: 'Укажите название поездки' })
      .trim()
      .min(2, 'Название должно содержать минимум 2 символа')
      .max(150, 'Название не должно превышать 150 символов'),
    country: z
      .string({ required_error: 'Укажите страну' })
      .trim()
      .min(2, 'Название страны должно содержать минимум 2 символа')
      .max(100, 'Название страны не должно превышать 100 символов'),
    city: z
      .string({ required_error: 'Укажите город' })
      .trim()
      .min(2, 'Название города должно содержать минимум 2 символа')
      .max(100, 'Название города не должно превышать 100 символов'),
    startDate: z
      .string({ required_error: 'Выберите дату начала' })
      .regex(dateRegex, 'Выберите корректную дату начала'),
    endDate: z
      .string({ required_error: 'Выберите дату окончания' })
      .regex(dateRegex, 'Выберите корректную дату окончания'),
    travelersCount: z.coerce
      .number({ invalid_type_error: 'Введите число путешественников' })
      .int('Количество путешественников должно быть целым числом')
      .min(1, 'Должен быть хотя бы 1 путешественник')
      .max(100, 'Количество путешественников не может превышать 100'),
    budget: z.coerce
      .number({ invalid_type_error: 'Введите сумму бюджета' })
      .min(0, 'Бюджет не может быть отрицательным')
      .max(999999999, 'Сумма бюджета слишком велика'),
    currency: z.enum(['RUB', 'USD', 'EUR'], {
      errorMap: () => ({ message: 'Выберите валюту бюджета' }),
    }),
    description: z
      .string()
      .max(2000, 'Описание не должно превышать 2000 символов')
      .optional()
      .default(''),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'Дата окончания не может быть раньше даты начала',
    path: ['endDate'],
  });

export function buildEventValidationSchema(tripStartDate: string, tripEndDate: string) {
  return z
    .object({
      title: z
        .string({ required_error: 'Укажите название мероприятия' })
        .trim()
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(150, 'Название не должно превышать 150 символов'),
      description: z
        .string()
        .max(1500, 'Описание не должно превышать 1500 символов')
        .optional()
        .default(''),
      date: z
        .string({ required_error: 'Выберите дату мероприятия' })
        .regex(dateRegex, 'Укажите корректную дату')
        .refine(
          (val) => (!tripStartDate || val >= tripStartDate) && (!tripEndDate || val <= tripEndDate),
          `Дата должна быть в пределах поездки (${tripStartDate} — ${tripEndDate})`
        ),
      startTime: z
        .string()
        .optional()
        .default('')
        .refine((val) => !val || timeRegex.test(val), 'Формат времени ЧЧ:ММ'),
      endTime: z
        .string()
        .optional()
        .default('')
        .refine((val) => !val || timeRegex.test(val), 'Формат времени ЧЧ:ММ'),
      location: z
        .string()
        .max(200, 'Место проведения не должно превышать 200 символов')
        .optional()
        .default(''),
      estimatedCost: z
        .union([z.string(), z.number(), z.null(), z.undefined()])
        .optional()
        .refine((val) => {
          if (val === '' || val === null || val === undefined) return true;
          const num = Number(val);
          return !Number.isNaN(num) && num >= 0 && num <= 999999999;
        }, 'Стоимость не может быть отрицательной'),
      note: z
        .string()
        .max(1000, 'Заметка не должна превышать 1000 символов')
        .optional()
        .default(''),
    })
    .refine(
      (data) => {
        if (data.startTime && data.endTime) {
          return data.endTime >= data.startTime;
        }
        return true;
      },
      {
        message: 'Время окончания не может быть раньше времени начала',
        path: ['endTime'],
      }
    );
}

export const profileNameValidationSchema = z.object({
  name: z
    .string({ required_error: 'Имя обязательно для заполнения' })
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(80, 'Имя не должно превышать 80 символов'),
});

export const passwordChangeValidationSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Введите текущий пароль' })
      .min(1, 'Введите текущий пароль'),
    newPassword: z
      .string({ required_error: 'Введите новый пароль' })
      .min(6, 'Новый пароль должен содержать минимум 6 символов')
      .max(100, 'Новый пароль слишком длинный'),
    confirmPassword: z
      .string({ required_error: 'Подтвердите новый пароль' })
      .min(1, 'Подтвердите новый пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Подтверждение пароля не совпадает с новым паролем',
    path: ['confirmPassword'],
  });

export const expenseValidationSchema = z.object({
  category: z.enum(
    ['TRANSPORT', 'FOOD', 'LODGING', 'ENTERTAINMENT', 'SHOPPING', 'OTHER'],
    {
      errorMap: () => ({ message: 'Выберите категорию расхода' }),
    }
  ),
  amount: z.coerce
    .number({ invalid_type_error: 'Введите сумму расхода' })
    .positive('Сумма расхода должна быть больше 0')
    .max(999999999, 'Сумма расхода слишком велика'),
  currency: z.enum(['RUB', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Выберите валюту расхода' }),
  }),
  expenseDate: z
    .string({ required_error: 'Выберите дату расхода' })
    .regex(dateRegex, 'Выберите корректную дату расхода'),
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional()
    .default(''),
});
