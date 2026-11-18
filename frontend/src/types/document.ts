export type DocumentCategory =
  | 'FLIGHT_TICKET'
  | 'HOTEL_BOOKING'
  | 'INSURANCE'
  | 'VISA_PASSPORT'
  | 'EXCURSION_TICKET'
  | 'RENTAL_TRANSFER'
  | 'OTHER';

export type DocumentStatus = 'REQUIRED' | 'PENDING' | 'READY';

export type AllowedDocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

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

export interface LocalDocumentFileSummary {
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  updatedAt: string;
}

export interface TripDocumentItem extends TripDocumentDto {
  hasLocalFileOnDevice: boolean;
  localFileMeta: LocalDocumentFileSummary | null;
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

export interface TripDocumentsListResponse {
  documents: TripDocumentDto[];
  summary: TripDocumentsSummaryDto;
}

export interface SeedDefaultDocumentsResponse extends TripDocumentsListResponse {
  addedCount: number;
}

export interface CreateTripDocumentPayload {
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  provider?: string;
  referenceCode?: string;
  eventDate?: string | null;
  endDate?: string | null;
  externalUrl?: string;
  notes?: string;
  fileName?: string | null;
  fileMimeType?: string | null;
  fileSize?: number | null;
}

export interface UpdateTripDocumentPayload {
  title?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  provider?: string;
  referenceCode?: string;
  eventDate?: string | null;
  endDate?: string | null;
  externalUrl?: string;
  notes?: string;
  fileName?: string | null;
  fileMimeType?: string | null;
  fileSize?: number | null;
  removeAttachment?: boolean;
}
