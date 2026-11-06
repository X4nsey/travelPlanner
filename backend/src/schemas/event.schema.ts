import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidIsoDate(val: string): boolean {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

const optionalTimeSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val || val.trim() === '') return null;
    return val.trim();
  })
  .refine((val) => val === null || timeRegex.test(val), {
    message: 'Время должно быть в формате ЧЧ:ММ (например, 09:30)',
  });

const optionalStringSchema = (maxLen: number, fieldLabel: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val || val.trim() === '') return null;
      return val.trim();
    })
    .refine((val) => val === null || val.length <= maxLen, {
      message: `${fieldLabel} не должно превышать ${maxLen} символов`,
    });

const optionalCostSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined || val === '') return null;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? NaN : parsed;
  })
  .refine((val) => val === null || (!Number.isNaN(val) && val >= 0 && val <= 999999999), {
    message: 'Предполагаемая стоимость должна быть неотрицательным числом',
  });

export const createEventSchema = z
  .object({
    title: z
      .string({ required_error: 'Название мероприятия обязательно' })
      .trim()
      .min(2, 'Название мероприятия должно содержать минимум 2 символа')
      .max(150, 'Название мероприятия не должно превышать 150 символов'),
    description: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => (val ? val.trim() : ''))
      .refine((val) => val.length <= 1500, 'Описание не должно превышать 1500 символов'),
    date: z
      .string({ required_error: 'Дата мероприятия обязательна' })
      .trim()
      .refine(isValidIsoDate, 'Некорректный формат даты мероприятия (ожидается ГГГГ-ММ-ДД)'),
    startTime: optionalTimeSchema,
    endTime: optionalTimeSchema,
    location: optionalStringSchema(200, 'Место проведения'),
    estimatedCost: optionalCostSchema,
    note: optionalStringSchema(1000, 'Заметка'),
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

export const updateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Название мероприятия должно содержать минимум 2 символа')
      .max(150, 'Название мероприятия не должно превышать 150 символов')
      .optional(),
    description: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => (val === undefined ? undefined : val ? val.trim() : ''))
      .refine((val) => val === undefined || val.length <= 1500, 'Описание не должно превышать 1500 символов'),
    date: z
      .string()
      .trim()
      .refine(isValidIsoDate, 'Некорректный формат даты мероприятия (ожидается ГГГГ-ММ-ДД)')
      .optional(),
    startTime: optionalTimeSchema.optional(),
    endTime: optionalTimeSchema.optional(),
    location: optionalStringSchema(200, 'Место проведения').optional(),
    estimatedCost: optionalCostSchema.optional(),
    note: optionalStringSchema(1000, 'Заметка').optional(),
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

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
