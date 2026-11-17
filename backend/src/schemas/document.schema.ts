import { z } from 'zod';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export const MAX_DOCUMENT_ATTACHMENT_BYTES = 4 * 1024 * 1024; // 4 МБ

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(val: string): boolean {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

function isValidHttpUrl(val: string): boolean {
  if (val === '') return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const documentCategoryEnum = z.enum(
  [
    'FLIGHT_TICKET',
    'HOTEL_BOOKING',
    'INSURANCE',
    'VISA_PASSPORT',
    'EXCURSION_TICKET',
    'RENTAL_TRANSFER',
    'OTHER',
  ],
  {
    errorMap: () => ({
      message:
        'Недопустимая категория документа. Допустимые: FLIGHT_TICKET, HOTEL_BOOKING, INSURANCE, VISA_PASSPORT, EXCURSION_TICKET, RENTAL_TRANSFER, OTHER',
    }),
  }
);

export const documentStatusEnum = z.enum(['REQUIRED', 'PENDING', 'READY'], {
  errorMap: () => ({
    message: 'Недопустимый статус документа. Допустимые: REQUIRED, PENDING, READY',
  }),
});

const createOptionalDateSchema = (fieldLabel: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    })
    .refine((val) => val === null || isValidIsoDate(val), {
      message: `Некорректный формат поля «${fieldLabel}» (ожидается ГГГГ-ММ-ДД)`,
    });

const updateOptionalDateSchema = (fieldLabel: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    })
    .refine((val) => val === undefined || val === null || isValidIsoDate(val), {
      message: `Некорректный формат поля «${fieldLabel}» (ожидается ГГГГ-ММ-ДД)`,
    });

const createOptionalTextSchema = (maxLen: number, fieldLabel: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => (val ? val.trim() : ''))
    .refine((val) => val.length <= maxLen, {
      message: `${fieldLabel} не должно превышать ${maxLen} символов`,
    });

const updateOptionalTextSchema = (maxLen: number, fieldLabel: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === undefined) return undefined;
      return val ? val.trim() : '';
    })
    .refine((val) => val === undefined || val.length <= maxLen, {
      message: `${fieldLabel} не должно превышать ${maxLen} символов`,
    });

const optionalFileNameSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    const trimmed = val.trim();
    return trimmed === '' ? null : trimmed;
  })
  .refine((val) => val === undefined || val === null || val.length <= 255, {
    message: 'Имя файла не должно превышать 255 символов',
  });

const optionalFileMimeTypeSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    const normalized = val.trim().toLowerCase();
    return normalized === '' ? null : normalized;
  })
  .refine(
    (val) =>
      val === undefined ||
      val === null ||
      (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(val),
    {
      message: 'Поддерживаются только файлы форматов PDF, JPEG, PNG и WEBP',
    }
  );

const optionalFileSizeSchema = z
  .union([z.number(), z.null(), z.undefined()])
  .refine(
    (val) =>
      val === undefined ||
      val === null ||
      (Number.isFinite(val) && val >= 0 && val <= MAX_DOCUMENT_ATTACHMENT_BYTES),
    {
      message: 'Размер прикреплённого файла не должен превышать 4 МБ',
    }
  );

const optionalFileDataBase64Schema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    const trimmed = val.trim();
    return trimmed === '' ? null : trimmed;
  });

export const createDocumentSchema = z
  .object({
    title: z
      .string({ required_error: 'Название документа обязательно' })
      .trim()
      .min(1, 'Название документа не может быть пустым')
      .max(200, 'Название документа не должно превышать 200 символов'),
    category: documentCategoryEnum.default('OTHER'),
    status: documentStatusEnum.default('READY'),
    provider: createOptionalTextSchema(150, 'Поставщик / сервис'),
    referenceCode: createOptionalTextSchema(100, 'Код бронирования / номер'),
    eventDate: createOptionalDateSchema('Дата события / заезда'),
    endDate: createOptionalDateSchema('Дата окончания / выезда'),
    externalUrl: createOptionalTextSchema(2000, 'Ссылка на бронь').refine(isValidHttpUrl, {
      message: 'Ссылка должна быть корректным URL и начинаться с http:// или https://',
    }),
    notes: createOptionalTextSchema(2000, 'Заметки'),
    fileName: optionalFileNameSchema,
    fileMimeType: optionalFileMimeTypeSchema,
    fileSize: optionalFileSizeSchema,
    fileDataBase64: optionalFileDataBase64Schema,
  })
  .refine(
    (data) => {
      if (data.eventDate && data.endDate) {
        return data.endDate >= data.eventDate;
      }
      return true;
    },
    {
      message: 'Дата окончания не может быть раньше даты начала',
      path: ['endDate'],
    }
  );

export const updateDocumentSchema = z
  .object({
    title: z
      .string({ invalid_type_error: 'Название документа должно быть строкой' })
      .trim()
      .min(1, 'Название документа не может быть пустым')
      .max(200, 'Название документа не должно превышать 200 символов')
      .optional(),
    category: documentCategoryEnum.optional(),
    status: documentStatusEnum.optional(),
    provider: updateOptionalTextSchema(150, 'Поставщик / сервис'),
    referenceCode: updateOptionalTextSchema(100, 'Код бронирования / номер'),
    eventDate: updateOptionalDateSchema('Дата события / заезда'),
    endDate: updateOptionalDateSchema('Дата окончания / выезда'),
    externalUrl: updateOptionalTextSchema(2000, 'Ссылка на бронь').refine(
      (val) => val === undefined || isValidHttpUrl(val),
      {
        message: 'Ссылка должна быть корректным URL и начинаться с http:// или https://',
      }
    ),
    notes: updateOptionalTextSchema(2000, 'Заметки'),
    fileName: optionalFileNameSchema,
    fileMimeType: optionalFileMimeTypeSchema,
    fileSize: optionalFileSizeSchema,
    fileDataBase64: optionalFileDataBase64Schema,
    removeAttachment: z
      .boolean({ invalid_type_error: 'Поле removeAttachment должно быть логическим значением' })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.eventDate && data.endDate) {
        return data.endDate >= data.eventDate;
      }
      return true;
    },
    {
      message: 'Дата окончания не может быть раньше даты начала',
      path: ['endDate'],
    }
  )
  .refine(
    (data) =>
      !(data.removeAttachment === true && typeof data.fileDataBase64 === 'string' && data.fileDataBase64.length > 0),
    {
      message: 'Нельзя одновременно удалить и загрузить вложение',
      path: ['removeAttachment'],
    }
  )
  .refine(
    (data) =>
      data.title !== undefined ||
      data.category !== undefined ||
      data.status !== undefined ||
      data.provider !== undefined ||
      data.referenceCode !== undefined ||
      data.eventDate !== undefined ||
      data.endDate !== undefined ||
      data.externalUrl !== undefined ||
      data.notes !== undefined ||
      data.fileName !== undefined ||
      data.fileMimeType !== undefined ||
      data.fileSize !== undefined ||
      data.fileDataBase64 !== undefined ||
      data.removeAttachment !== undefined,
    {
      message: 'Необходимо указать хотя бы одно поле для обновления',
    }
  );

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
