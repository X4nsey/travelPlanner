import { apiClient } from './api';
import type {
  ApiSuccessResponse,
  CreateTripDocumentPayload,
  SeedDefaultDocumentsResponse,
  TripDocumentDto,
  TripDocumentsListResponse,
  UpdateTripDocumentPayload,
} from '@/types';

function normalizeOptionalDate(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function sanitizeCreateDocumentPayload(
  payload: CreateTripDocumentPayload
): CreateTripDocumentPayload {
  const isVisaPassport = payload.category === 'VISA_PASSPORT';

  const clean: CreateTripDocumentPayload = {
    title: payload.title.trim(),
    category: payload.category,
    status: payload.status,
    provider: payload.provider?.trim() ?? '',
    // Privacy-by-Design: для VISA_PASSPORT номер документа никогда не отправляется на сервер
    referenceCode: isVisaPassport ? '' : (payload.referenceCode?.trim() ?? ''),
    eventDate: normalizeOptionalDate(payload.eventDate) ?? null,
    endDate: normalizeOptionalDate(payload.endDate) ?? null,
    externalUrl: payload.externalUrl?.trim() ?? '',
    notes: payload.notes?.trim() ?? '',
  };

  if (!isVisaPassport && payload.fileMimeType && payload.fileSize && payload.fileSize > 0) {
    clean.fileName = payload.fileName?.trim() || null;
    clean.fileMimeType = payload.fileMimeType.trim().toLowerCase();
    clean.fileSize = Math.trunc(payload.fileSize);
  }

  return clean;
}

export function sanitizeUpdateDocumentPayload(
  payload: UpdateTripDocumentPayload
): UpdateTripDocumentPayload {
  const isVisaPassport = payload.category === 'VISA_PASSPORT';
  const clean: UpdateTripDocumentPayload = {};

  if (payload.title !== undefined) clean.title = payload.title.trim();
  if (payload.category !== undefined) clean.category = payload.category;
  if (payload.status !== undefined) clean.status = payload.status;
  if (payload.provider !== undefined) clean.provider = payload.provider.trim();
  if (payload.eventDate !== undefined) clean.eventDate = normalizeOptionalDate(payload.eventDate);
  if (payload.endDate !== undefined) clean.endDate = normalizeOptionalDate(payload.endDate);
  if (payload.externalUrl !== undefined) clean.externalUrl = payload.externalUrl.trim();
  if (payload.notes !== undefined) clean.notes = payload.notes.trim();

  if (isVisaPassport) {
    clean.referenceCode = '';
    clean.removeAttachment = true;
    return clean;
  }

  if (payload.referenceCode !== undefined) {
    clean.referenceCode = payload.referenceCode.trim();
  }

  if (payload.removeAttachment === true) {
    clean.removeAttachment = true;
  } else {
    if (payload.fileName !== undefined) {
      clean.fileName = payload.fileName === null ? null : payload.fileName.trim();
    }
    if (payload.fileMimeType !== undefined) {
      clean.fileMimeType =
        payload.fileMimeType === null ? null : payload.fileMimeType.trim().toLowerCase();
    }
    if (payload.fileSize !== undefined) {
      clean.fileSize = payload.fileSize === null ? null : Math.trunc(payload.fileSize);
    }
  }

  return clean;
}

export const documentService = {
  async getTripDocuments(tripId: string): Promise<TripDocumentsListResponse> {
    const { data } = await apiClient.get<ApiSuccessResponse<TripDocumentsListResponse>>(
      `/trips/${tripId}/documents`
    );
    return data.data;
  },

  async createTripDocument(
    tripId: string,
    payload: CreateTripDocumentPayload
  ): Promise<{ document: TripDocumentDto; message?: string }> {
    const body = sanitizeCreateDocumentPayload(payload);
    const { data } = await apiClient.post<ApiSuccessResponse<{ document: TripDocumentDto }>>(
      `/trips/${tripId}/documents`,
      body
    );
    return {
      document: data.data.document,
      message: data.message,
    };
  },

  async seedDefaultDocuments(
    tripId: string
  ): Promise<SeedDefaultDocumentsResponse & { message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<SeedDefaultDocumentsResponse>>(
      `/trips/${tripId}/documents/seed-defaults`
    );
    return {
      ...data.data,
      message: data.message,
    };
  },

  async updateTripDocument(
    id: string,
    payload: UpdateTripDocumentPayload
  ): Promise<{ document: TripDocumentDto; message?: string }> {
    const body = sanitizeUpdateDocumentPayload(payload);
    const { data } = await apiClient.patch<ApiSuccessResponse<{ document: TripDocumentDto }>>(
      `/documents/${id}`,
      body
    );
    return {
      document: data.data.document,
      message: data.message,
    };
  },

  async deleteTripDocument(
    id: string
  ): Promise<{ deleted: boolean; id: string; message?: string }> {
    const { data } = await apiClient.delete<
      ApiSuccessResponse<{ deleted: boolean; id: string }>
    >(`/documents/${id}`);
    return {
      ...data.data,
      message: data.message,
    };
  },
};
