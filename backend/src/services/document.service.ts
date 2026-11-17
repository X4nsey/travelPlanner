import path from 'node:path';
import { DocumentCategory, DocumentStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  AllowedDocumentMimeType,
  CreateDocumentInput,
  MAX_DOCUMENT_ATTACHMENT_BYTES,
  UpdateDocumentInput,
} from '../schemas/document.schema';
import { formatDateOnly, parseDateOnly, TripService } from './trip.service';

export const DOCUMENT_CATEGORY_META: Record<
  DocumentCategory,
  { nameRu: string; order: number }
> = {
  FLIGHT_TICKET: { nameRu: 'Авиабилеты и проезд', order: 0 },
  HOTEL_BOOKING: { nameRu: 'Проживание и отели', order: 1 },
  INSURANCE: { nameRu: 'Страховка', order: 2 },
  VISA_PASSPORT: { nameRu: 'Паспорт и виза', order: 3 },
  EXCURSION_TICKET: { nameRu: 'Билеты и экскурсии', order: 4 },
  RENTAL_TRANSFER: { nameRu: 'Аренда авто и трансфер', order: 5 },
  OTHER: { nameRu: 'Прочее', order: 6 },
};

export const DOCUMENT_STATUS_META: Record<
  DocumentStatus,
  { nameRu: string; order: number }
> = {
  REQUIRED: { nameRu: 'Нужно подготовить', order: 0 },
  PENDING: { nameRu: 'Ожидает подтверждения', order: 1 },
  READY: { nameRu: 'Готово', order: 2 },
};

const ORDERED_CATEGORIES = (Object.keys(DOCUMENT_CATEGORY_META) as DocumentCategory[]).sort(
  (a, b) => DOCUMENT_CATEGORY_META[a].order - DOCUMENT_CATEGORY_META[b].order
);

const MIME_DEFAULT_EXTENSIONS: Record<AllowedDocumentMimeType, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const DEFAULT_CHECKLIST_TEMPLATES: ReadonlyArray<{
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  notes: string;
}> = [
  {
    title: 'Билеты туда и обратно',
    category: DocumentCategory.FLIGHT_TICKET,
    status: DocumentStatus.REQUIRED,
    notes: 'Добавьте маршрутную квитанцию, номер брони (PNR) или посадочный талон.',
  },
  {
    title: 'Бронь проживания',
    category: DocumentCategory.HOTEL_BOOKING,
    status: DocumentStatus.REQUIRED,
    notes: 'Сохраните ваучер отеля или апартаментов, адрес и код подтверждения.',
  },
  {
    title: 'Медицинская страховка',
    category: DocumentCategory.INSURANCE,
    status: DocumentStatus.REQUIRED,
    notes: 'Укажите номер страхового полиса, телефон ассистанса и прикрепите файл полиса.',
  },
  {
    title: 'Загранпаспорт и виза',
    category: DocumentCategory.VISA_PASSPORT,
    status: DocumentStatus.REQUIRED,
    notes: 'Проверьте срок действия паспорта и при необходимости прикрепите копию визы.',
  },
];

const DOCUMENT_METADATA_SELECT = {
  id: true,
  tripId: true,
  title: true,
  category: true,
  status: true,
  provider: true,
  referenceCode: true,
  eventDate: true,
  endDate: true,
  externalUrl: true,
  notes: true,
  fileName: true,
  fileMimeType: true,
  fileSize: true,
  createdAt: true,
  updatedAt: true,
} as const;

type DocumentMetadataRow = Prisma.TripDocumentGetPayload<{
  select: typeof DOCUMENT_METADATA_SELECT;
}>;

export interface TripDocumentDto {
  id: string;
  tripId: string;
  title: string;
  category: DocumentCategory;
  categoryNameRu: string;
  status: DocumentStatus;
  statusNameRu: string;
  provider: string;
  referenceCode: string;
  eventDate: string | null;
  endDate: string | null;
  externalUrl: string;
  notes: string;
  hasAttachment: boolean;
  fileName: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripDocumentCategorySummary {
  category: DocumentCategory;
  nameRu: string;
  count: number;
  readyCount: number;
  pendingCount: number;
  requiredCount: number;
  withAttachmentCount: number;
}

export interface TripDocumentsSummaryDto {
  totalCount: number;
  readyCount: number;
  pendingCount: number;
  requiredCount: number;
  withAttachmentCount: number;
  readinessPercentage: number;
  byCategory: TripDocumentCategorySummary[];
}

export interface TripDocumentAttachmentDto {
  id: string;
  tripId: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  fileDataBase64: string;
}

function isAllowedMimeType(val: string): val is AllowedDocumentMimeType {
  return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(val);
}

export function sanitizeFileName(
  rawName: string | null | undefined,
  mimeType: AllowedDocumentMimeType
): string {
  const ext = MIME_DEFAULT_EXTENSIONS[mimeType];
  const fallback = mimeType === 'application/pdf' ? `document.${ext}` : `image.${ext}`;

  if (!rawName) return fallback;

  const base = path.posix.basename(path.win32.basename(rawName));
  const cleaned = base
    .replace(/[\x00-\x1f\x7f<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 255);

  return cleaned || fallback;
}

function parseAndValidateAttachment(input: {
  fileName?: string | null;
  fileMimeType?: string | null;
  fileDataBase64: string;
}): {
  fileName: string;
  fileMimeType: AllowedDocumentMimeType;
  fileSize: number;
  fileDataBase64: string;
} {
  let effectiveMime = input.fileMimeType ? input.fileMimeType.trim().toLowerCase() : null;
  let rawBase64 = input.fileDataBase64.trim();

  if (/^data:/i.test(rawBase64)) {
    const match = /^data:([^;,]+)(?:;[^,]*)*;base64,([\s\S]*)$/i.exec(rawBase64);
    if (!match) {
      throw new AppError(
        'Некорректный формат Data URL для вложения',
        400,
        'VALIDATION_ERROR',
        { fileDataBase64: ['Ожидается корректный Base64 или Data URL с ;base64,'] }
      );
    }

    const dataUrlMime = match[1].trim().toLowerCase();
    if (!isAllowedMimeType(dataUrlMime)) {
      throw new AppError(
        'Поддерживаются только файлы форматов PDF, JPEG, PNG и WEBP',
        400,
        'INVALID_FILE_TYPE',
        { fileMimeType: ['Допустимые форматы: application/pdf, image/jpeg, image/png, image/webp'] }
      );
    }

    if (effectiveMime && effectiveMime !== dataUrlMime) {
      throw new AppError(
        'Указанный MIME-тип не совпадает с типом данных в Data URL',
        400,
        'VALIDATION_ERROR',
        { fileMimeType: ['MIME-тип файла не соответствует Data URL'] }
      );
    }

    effectiveMime = dataUrlMime;
    rawBase64 = match[2];
  }

  if (!effectiveMime || !isAllowedMimeType(effectiveMime)) {
    throw new AppError(
      'Необходимо указать допустимый MIME-тип файла (PDF, JPEG, PNG или WEBP)',
      400,
      'INVALID_FILE_TYPE',
      { fileMimeType: ['Поддерживаются только application/pdf, image/jpeg, image/png, image/webp'] }
    );
  }

  const cleanBase64 = rawBase64.replace(/\s+/g, '');
  const maxBase64Chars = Math.ceil(MAX_DOCUMENT_ATTACHMENT_BYTES / 3) * 4;

  if (cleanBase64.length > maxBase64Chars) {
    throw new AppError(
      'Размер прикреплённого файла не должен превышать 4 МБ',
      400,
      'FILE_TOO_LARGE',
      { fileDataBase64: ['Максимально допустимый размер файла — 4 МБ'] }
    );
  }

  if (
    !cleanBase64 ||
    cleanBase64.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
      cleanBase64
    )
  ) {
    throw new AppError(
      'Некорректный формат содержимого файла (ожидается корректная строка Base64)',
      400,
      'VALIDATION_ERROR',
      { fileDataBase64: ['Содержимое файла должно быть в корректном формате Base64'] }
    );
  }

  const buffer = Buffer.from(cleanBase64, 'base64');

  if (buffer.length === 0) {
    throw new AppError(
      'Прикреплённый файл не может быть пустым',
      400,
      'VALIDATION_ERROR',
      { fileDataBase64: ['Файл не содержит данных'] }
    );
  }

  if (buffer.length > MAX_DOCUMENT_ATTACHMENT_BYTES) {
    throw new AppError(
      'Размер прикреплённого файла не должен превышать 4 МБ',
      400,
      'FILE_TOO_LARGE',
      { fileDataBase64: ['Максимально допустимый размер файла — 4 МБ'] }
    );
  }

  const fileName = sanitizeFileName(input.fileName, effectiveMime);

  return {
    fileName,
    fileMimeType: effectiveMime,
    fileSize: buffer.length,
    fileDataBase64: cleanBase64,
  };
}

export function serializeTripDocument(doc: DocumentMetadataRow): TripDocumentDto {
  const categoryMeta = DOCUMENT_CATEGORY_META[doc.category] || DOCUMENT_CATEGORY_META.OTHER;
  const statusMeta = DOCUMENT_STATUS_META[doc.status] || DOCUMENT_STATUS_META.READY;
  const hasAttachment = Boolean(doc.fileMimeType && doc.fileSize !== null && doc.fileSize > 0);

  return {
    id: doc.id,
    tripId: doc.tripId,
    title: doc.title,
    category: doc.category,
    categoryNameRu: categoryMeta.nameRu,
    status: doc.status,
    statusNameRu: statusMeta.nameRu,
    provider: doc.provider || '',
    referenceCode: doc.referenceCode || '',
    eventDate: doc.eventDate ? formatDateOnly(doc.eventDate) : null,
    endDate: doc.endDate ? formatDateOnly(doc.endDate) : null,
    externalUrl: doc.externalUrl || '',
    notes: doc.notes || '',
    hasAttachment,
    fileName: hasAttachment ? (doc.fileName ?? null) : null,
    fileMimeType: hasAttachment ? (doc.fileMimeType ?? null) : null,
    fileSize: hasAttachment ? (doc.fileSize ?? null) : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function sortTripDocuments(docs: DocumentMetadataRow[]): DocumentMetadataRow[] {
  return [...docs].sort((a, b) => {
    const aDate = a.eventDate ? formatDateOnly(a.eventDate) : null;
    const bDate = b.eventDate ? formatDateOnly(b.eventDate) : null;

    if (aDate && bDate) {
      if (aDate !== bDate) return aDate.localeCompare(bDate);
    } else if (aDate && !bDate) {
      return -1;
    } else if (!aDate && bDate) {
      return 1;
    }

    const catDiff =
      (DOCUMENT_CATEGORY_META[a.category]?.order ?? 99) -
      (DOCUMENT_CATEGORY_META[b.category]?.order ?? 99);
    if (catDiff !== 0) return catDiff;

    const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });
}

export function computeDocumentsSummary(docs: DocumentMetadataRow[]): TripDocumentsSummaryDto {
  const totalCount = docs.length;
  let readyCount = 0;
  let pendingCount = 0;
  let requiredCount = 0;
  let withAttachmentCount = 0;

  const countsByCategory: Record<
    DocumentCategory,
    {
      count: number;
      readyCount: number;
      pendingCount: number;
      requiredCount: number;
      withAttachmentCount: number;
    }
  > = {
    FLIGHT_TICKET: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    HOTEL_BOOKING: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    INSURANCE: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    VISA_PASSPORT: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    EXCURSION_TICKET: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    RENTAL_TRANSFER: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    OTHER: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
  };

  for (const doc of docs) {
    const hasAttachment = Boolean(doc.fileMimeType && doc.fileSize !== null && doc.fileSize > 0);
    if (hasAttachment) withAttachmentCount += 1;

    if (doc.status === DocumentStatus.READY) readyCount += 1;
    else if (doc.status === DocumentStatus.PENDING) pendingCount += 1;
    else if (doc.status === DocumentStatus.REQUIRED) requiredCount += 1;

    const bucket = countsByCategory[doc.category];
    if (bucket) {
      bucket.count += 1;
      if (hasAttachment) bucket.withAttachmentCount += 1;
      if (doc.status === DocumentStatus.READY) bucket.readyCount += 1;
      else if (doc.status === DocumentStatus.PENDING) bucket.pendingCount += 1;
      else if (doc.status === DocumentStatus.REQUIRED) bucket.requiredCount += 1;
    }
  }

  const byCategory: TripDocumentCategorySummary[] = ORDERED_CATEGORIES.map((category) => ({
    category,
    nameRu: DOCUMENT_CATEGORY_META[category].nameRu,
    ...countsByCategory[category],
  }));

  return {
    totalCount,
    readyCount,
    pendingCount,
    requiredCount,
    withAttachmentCount,
    readinessPercentage:
      totalCount > 0 ? Math.round((readyCount / totalCount) * 1000) / 10 : 0,
    byCategory,
  };
}

export class DocumentService {
  private static async getOwnedDocumentMetadata(documentId: string, userId: string) {
    const doc = await prisma.tripDocument.findUnique({
      where: { id: documentId },
      select: {
        ...DOCUMENT_METADATA_SELECT,
        trip: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!doc) {
      throw new AppError('Документ или бронь не найдены', 404, 'DOCUMENT_NOT_FOUND');
    }

    if (doc.trip.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этому документу', 403, 'FORBIDDEN');
    }

    return doc;
  }

  static async listByTrip(tripId: string, userId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const rows = await prisma.tripDocument.findMany({
      where: { tripId },
      select: DOCUMENT_METADATA_SELECT,
    });

    const sorted = sortTripDocuments(rows);

    return {
      documents: sorted.map(serializeTripDocument),
      summary: computeDocumentsSummary(sorted),
    };
  }

  static async createDocument(
    tripId: string,
    userId: string,
    payload: CreateDocumentInput
  ): Promise<TripDocumentDto> {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    let attachmentData: {
      fileName: string | null;
      fileMimeType: string | null;
      fileSize: number | null;
      fileDataBase64: string | null;
    } = {
      fileName: null,
      fileMimeType: null,
      fileSize: null,
      fileDataBase64: null,
    };

    if (payload.fileDataBase64) {
      attachmentData = parseAndValidateAttachment({
        fileName: payload.fileName,
        fileMimeType: payload.fileMimeType,
        fileDataBase64: payload.fileDataBase64,
      });
    } else if (payload.fileMimeType || payload.fileName) {
      throw new AppError(
        'Для прикрепления файла необходимо передать его содержимое в Base64',
        400,
        'VALIDATION_ERROR',
        { fileDataBase64: ['Передайте содержимое файла в поле fileDataBase64'] }
      );
    }

    const created = await prisma.tripDocument.create({
      data: {
        tripId,
        title: payload.title,
        category: payload.category as DocumentCategory,
        status: payload.status as DocumentStatus,
        provider: payload.provider ?? '',
        referenceCode: payload.referenceCode ?? '',
        eventDate: payload.eventDate ? parseDateOnly(payload.eventDate) : null,
        endDate: payload.endDate ? parseDateOnly(payload.endDate) : null,
        externalUrl: payload.externalUrl ?? '',
        notes: payload.notes ?? '',
        fileName: attachmentData.fileName,
        fileMimeType: attachmentData.fileMimeType,
        fileSize: attachmentData.fileSize,
        fileDataBase64: attachmentData.fileDataBase64,
      },
      select: DOCUMENT_METADATA_SELECT,
    });

    return serializeTripDocument(created);
  }

  static async updateDocument(
    documentId: string,
    userId: string,
    payload: UpdateDocumentInput
  ): Promise<TripDocumentDto> {
    const existing = await this.getOwnedDocumentMetadata(documentId, userId);

    const effectiveEventDate =
      payload.eventDate !== undefined
        ? payload.eventDate
        : existing.eventDate
          ? formatDateOnly(existing.eventDate)
          : null;
    const effectiveEndDate =
      payload.endDate !== undefined
        ? payload.endDate
        : existing.endDate
          ? formatDateOnly(existing.endDate)
          : null;

    if (effectiveEventDate && effectiveEndDate && effectiveEndDate < effectiveEventDate) {
      throw new AppError(
        'Дата окончания не может быть раньше даты начала',
        400,
        'VALIDATION_ERROR',
        { endDate: ['Дата окончания не может быть раньше даты начала'] }
      );
    }

    const dataToUpdate: Prisma.TripDocumentUpdateInput = {};

    if (payload.title !== undefined) dataToUpdate.title = payload.title;
    if (payload.category !== undefined) dataToUpdate.category = payload.category as DocumentCategory;
    if (payload.status !== undefined) dataToUpdate.status = payload.status as DocumentStatus;
    if (payload.provider !== undefined) dataToUpdate.provider = payload.provider;
    if (payload.referenceCode !== undefined) dataToUpdate.referenceCode = payload.referenceCode;
    if (payload.eventDate !== undefined) {
      dataToUpdate.eventDate = payload.eventDate ? parseDateOnly(payload.eventDate) : null;
    }
    if (payload.endDate !== undefined) {
      dataToUpdate.endDate = payload.endDate ? parseDateOnly(payload.endDate) : null;
    }
    if (payload.externalUrl !== undefined) dataToUpdate.externalUrl = payload.externalUrl;
    if (payload.notes !== undefined) dataToUpdate.notes = payload.notes;

    if (payload.removeAttachment === true || payload.fileDataBase64 === null) {
      dataToUpdate.fileName = null;
      dataToUpdate.fileMimeType = null;
      dataToUpdate.fileSize = null;
      dataToUpdate.fileDataBase64 = null;
    } else if (typeof payload.fileDataBase64 === 'string' && payload.fileDataBase64.length > 0) {
      const parsedFile = parseAndValidateAttachment({
        fileName: payload.fileName,
        fileMimeType: payload.fileMimeType,
        fileDataBase64: payload.fileDataBase64,
      });
      dataToUpdate.fileName = parsedFile.fileName;
      dataToUpdate.fileMimeType = parsedFile.fileMimeType;
      dataToUpdate.fileSize = parsedFile.fileSize;
      dataToUpdate.fileDataBase64 = parsedFile.fileDataBase64;
    } else {
      if (payload.fileMimeType !== undefined && payload.fileMimeType !== null) {
        throw new AppError(
          'Для замены файла необходимо передать его содержимое в Base64',
          400,
          'VALIDATION_ERROR',
          { fileDataBase64: ['Передайте содержимое нового файла в поле fileDataBase64'] }
        );
      }

      if (payload.fileName !== undefined) {
        if (!existing.fileMimeType) {
          throw new AppError(
            'Невозможно задать имя файла без прикреплённого вложения',
            400,
            'VALIDATION_ERROR',
            { fileName: ['Сначала прикрепите файл'] }
          );
        }
        if (payload.fileName === null) {
          throw new AppError(
            'Имя прикреплённого файла не может быть пустым',
            400,
            'VALIDATION_ERROR',
            { fileName: ['Укажите имя файла или удалите вложение через removeAttachment'] }
          );
        }
        if (isAllowedMimeType(existing.fileMimeType)) {
          dataToUpdate.fileName = sanitizeFileName(payload.fileName, existing.fileMimeType);
        }
      }
    }

    const updated = await prisma.tripDocument.update({
      where: { id: documentId },
      data: dataToUpdate,
      select: DOCUMENT_METADATA_SELECT,
    });

    return serializeTripDocument(updated);
  }

  static async deleteDocument(documentId: string, userId: string) {
    await this.getOwnedDocumentMetadata(documentId, userId);

    await prisma.tripDocument.delete({
      where: { id: documentId },
    });

    return { deleted: true, id: documentId };
  }

  static async getDocumentAttachment(
    documentId: string,
    userId: string
  ): Promise<TripDocumentAttachmentDto> {
    const doc = await prisma.tripDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        tripId: true,
        fileName: true,
        fileMimeType: true,
        fileSize: true,
        fileDataBase64: true,
        trip: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!doc) {
      throw new AppError('Документ или бронь не найдены', 404, 'DOCUMENT_NOT_FOUND');
    }

    if (doc.trip.userId !== userId) {
      throw new AppError('У вас нет прав доступа к этому документу', 403, 'FORBIDDEN');
    }

    if (!doc.fileDataBase64 || !doc.fileMimeType) {
      throw new AppError('У этого документа нет прикреплённого файла', 404, 'ATTACHMENT_NOT_FOUND');
    }

    const safeFileName = isAllowedMimeType(doc.fileMimeType)
      ? sanitizeFileName(doc.fileName, doc.fileMimeType)
      : doc.fileName || 'attachment';

    return {
      id: doc.id,
      tripId: doc.tripId,
      fileName: safeFileName,
      fileMimeType: doc.fileMimeType,
      fileSize: doc.fileSize ?? Buffer.byteLength(doc.fileDataBase64, 'base64'),
      fileDataBase64: doc.fileDataBase64,
    };
  }

  static async seedDefaultChecklist(tripId: string, userId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    return prisma.$transaction(async (tx) => {
      // Сериализуем создание базового чек-листа по поездке для защиты от дублей при параллельных запросах.
      await tx.$executeRaw`SELECT id FROM "Trip" WHERE id = ${tripId} FOR UPDATE`;

      const existingRows = await tx.tripDocument.findMany({
        where: { tripId },
        select: {
          category: true,
          title: true,
        },
      });

      const existingCategories = new Set(existingRows.map((row) => row.category));
      const existingTitles = new Set(existingRows.map((row) => row.title.trim().toLowerCase()));

      const itemsToCreate = DEFAULT_CHECKLIST_TEMPLATES.filter(
        (tpl) =>
          !existingCategories.has(tpl.category) &&
          !existingTitles.has(tpl.title.trim().toLowerCase())
      ).map((tpl) => ({
        tripId,
        title: tpl.title,
        category: tpl.category,
        status: tpl.status,
        notes: tpl.notes,
      }));

      if (itemsToCreate.length > 0) {
        await tx.tripDocument.createMany({
          data: itemsToCreate,
        });
      }

      const allRows = await tx.tripDocument.findMany({
        where: { tripId },
        select: DOCUMENT_METADATA_SELECT,
      });

      const sorted = sortTripDocuments(allRows);

      return {
        documents: sorted.map(serializeTripDocument),
        summary: computeDocumentsSummary(sorted),
        addedCount: itemsToCreate.length,
      };
    });
  }
}
