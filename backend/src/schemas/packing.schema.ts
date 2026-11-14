import { z } from 'zod';

export const packingCategoryEnum = z.enum([
  'DOCUMENTS',
  'CLOTHING',
  'FOOTWEAR',
  'TECH',
  'HYGIENE',
  'PERSONAL',
  'MEDICINE',
  'ACTIVITY',
  'OTHER',
]);

const packingQuantitySchema = z
  .union([
    z
      .number({ invalid_type_error: 'Количество должно быть числом' })
      .int('Количество должно быть целым числом')
      .min(1, 'Количество должно быть не менее 1')
      .max(999, 'Количество не может превышать 999'),
    z.null(),
  ])
  .optional();

export const createPackingItemSchema = z
  .object({
    name: z
      .string({ required_error: 'Название вещи обязательно' })
      .trim()
      .min(1, 'Название вещи не может быть пустым')
      .max(200, 'Название вещи не должно превышать 200 символов'),
    category: packingCategoryEnum,
    quantity: packingQuantitySchema,
  })
  .strict('Переданы недопустимые или служебные поля');

export const updatePackingItemSchema = z
  .object({
    name: z
      .string({ invalid_type_error: 'Название вещи должно быть строкой' })
      .trim()
      .min(1, 'Название вещи не может быть пустым')
      .max(200, 'Название вещи не должно превышать 200 символов')
      .optional(),
    category: packingCategoryEnum.optional(),
    quantity: packingQuantitySchema,
    isPacked: z
      .boolean({ invalid_type_error: 'Поле isPacked должно быть логическим значением' })
      .optional(),
  })
  .strict('Запрещено изменять служебные или недопустимые поля')
  .refine(
    (data) =>
      data.name !== undefined ||
      data.category !== undefined ||
      data.quantity !== undefined ||
      data.isPacked !== undefined,
    {
      message: 'Необходимо указать хотя бы одно поле для обновления',
    }
  );

export type CreatePackingItemInput = z.infer<typeof createPackingItemSchema>;
export type UpdatePackingItemInput = z.infer<typeof updatePackingItemSchema>;
