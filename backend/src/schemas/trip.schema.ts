import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(val: string): boolean {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

const baseTripFields = {
  title: z
    .string({ required_error: 'Название поездки обязательно' })
    .trim()
    .min(2, 'Название поездки должно содержать минимум 2 символа')
    .max(150, 'Название поездки не должно превышать 150 символов'),
  country: z
    .string({ required_error: 'Страна обязательна' })
    .trim()
    .min(2, 'Название страны должно содержать минимум 2 символа')
    .max(100, 'Название страны не должно превышать 100 символов'),
  city: z
    .string({ required_error: 'Город обязателен' })
    .trim()
    .min(2, 'Название города должно содержать минимум 2 символа')
    .max(100, 'Название города не должно превышать 100 символов'),
  startDate: z
    .string({ required_error: 'Дата начала обязательна' })
    .trim()
    .refine(isValidIsoDate, 'Некорректный формат даты начала (ожидается ГГГГ-ММ-ДД)'),
  endDate: z
    .string({ required_error: 'Дата окончания обязательна' })
    .trim()
    .refine(isValidIsoDate, 'Некорректный формат даты окончания (ожидается ГГГГ-ММ-ДД)'),
  travelersCount: z.coerce
    .number({ invalid_type_error: 'Укажите корректное количество путешественников' })
    .int('Количество путешественников должно быть целым числом')
    .min(1, 'Количество путешественников должно быть не менее 1')
    .max(100, 'Количество путешественников не может превышать 100'),
  budget: z.coerce
    .number({ invalid_type_error: 'Укажите корректную сумму бюджета' })
    .min(0, 'Бюджет не может быть отрицательным')
    .max(999999999, 'Сумма бюджета превышает допустимый предел'),
  currency: z.enum(['RUB', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Выберите одну из поддерживаемых валют: RUB, USD или EUR' }),
  }),
  description: z
    .string()
    .trim()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .optional()
    .default(''),
};

export const createTripSchema = z
  .object(baseTripFields)
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Дата окончания не может быть раньше даты начала',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    title: baseTripFields.title.optional(),
    country: baseTripFields.country.optional(),
    city: baseTripFields.city.optional(),
    startDate: baseTripFields.startDate.optional(),
    endDate: baseTripFields.endDate.optional(),
    travelersCount: baseTripFields.travelersCount.optional(),
    budget: baseTripFields.budget.optional(),
    currency: baseTripFields.currency.optional(),
    description: z.string().trim().max(2000, 'Описание не должно превышать 2000 символов').optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'Дата окончания не может быть раньше даты начала',
      path: ['endDate'],
    }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
