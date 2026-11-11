import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(val: string): boolean {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

export const expenseCategoryEnum = z.enum([
  'TRANSPORT',
  'FOOD',
  'LODGING',
  'ENTERTAINMENT',
  'SHOPPING',
  'OTHER',
]);

export const currencyEnum = z.enum(['RUB', 'USD', 'EUR']);

export const createExpenseSchema = z.object({
  category: expenseCategoryEnum,
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const parsed = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
      return Number.isNaN(parsed) ? NaN : Math.round(parsed * 100) / 100;
    })
    .refine((val) => !Number.isNaN(val) && val > 0 && val <= 999999999.99, {
      message: 'Сумма расхода должна быть положительным числом (до 999 999 999)',
    }),
  currency: currencyEnum.default('RUB'),
  expenseDate: z
    .string({ required_error: 'Дата расхода обязательна' })
    .trim()
    .refine(isValidIsoDate, 'Некорректный формат даты (ожидается ГГГГ-ММ-ДД)'),
  description: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => (val ? val.trim() : ''))
    .refine((val) => val.length <= 500, 'Описание не должно превышать 500 символов'),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
