import { apiClient } from './api';
import type {
  ApiSuccessResponse,
  ClearOutdatedResponse,
  CreatePackingItemPayload,
  DeletePackingItemResponse,
  PackingGenerateResponse,
  PackingItem,
  PackingListResponse,
  UpdatePackingItemPayload,
} from '@/types';

export function normalizePackingQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || value === 0) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed === 0) return null;
    return Math.trunc(parsed);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value === 0) return null;
    return Math.trunc(value);
  }

  return null;
}

export function sanitizeCreatePackingItemPayload(
  payload: CreatePackingItemPayload
): CreatePackingItemPayload {
  return {
    name: payload.name.trim(),
    category: payload.category,
    quantity: normalizePackingQuantity(payload.quantity),
  };
}

export function sanitizeUpdatePackingItemPayload(
  payload: UpdatePackingItemPayload
): UpdatePackingItemPayload {
  const cleanPayload: UpdatePackingItemPayload = {};

  if (payload.name !== undefined) {
    cleanPayload.name = payload.name.trim();
  }
  if (payload.category !== undefined) {
    cleanPayload.category = payload.category;
  }
  if (payload.quantity !== undefined) {
    cleanPayload.quantity = normalizePackingQuantity(payload.quantity);
  }
  if (payload.isPacked !== undefined) {
    cleanPayload.isPacked = payload.isPacked;
  }

  return cleanPayload;
}

export const packingService = {
  async getPackingList(tripId: string): Promise<PackingListResponse> {
    const { data } = await apiClient.get<ApiSuccessResponse<PackingListResponse>>(
      `/trips/${tripId}/packing`
    );
    return data.data;
  },

  async generatePackingList(
    tripId: string
  ): Promise<PackingGenerateResponse & { message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<PackingGenerateResponse>>(
      `/trips/${tripId}/packing/generate`
    );
    return {
      ...data.data,
      message: data.message,
    };
  },

  async addCustomItem(
    tripId: string,
    payload: CreatePackingItemPayload
  ): Promise<{ item: PackingItem; message?: string }> {
    const body = sanitizeCreatePackingItemPayload(payload);
    const { data } = await apiClient.post<ApiSuccessResponse<{ item: PackingItem }>>(
      `/trips/${tripId}/packing/items`,
      body
    );
    return {
      item: data.data.item,
      message: data.message,
    };
  },

  async updateItem(
    itemId: string,
    payload: UpdatePackingItemPayload
  ): Promise<{ item: PackingItem; message?: string }> {
    const body = sanitizeUpdatePackingItemPayload(payload);
    const { data } = await apiClient.patch<ApiSuccessResponse<{ item: PackingItem }>>(
      `/packing/${itemId}`,
      body
    );
    return {
      item: data.data.item,
      message: data.message,
    };
  },

  async deleteItem(
    itemId: string
  ): Promise<DeletePackingItemResponse & { message?: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<DeletePackingItemResponse>>(
      `/packing/${itemId}`
    );
    return {
      ...data.data,
      message: data.message,
    };
  },

  async clearOutdated(
    tripId: string
  ): Promise<ClearOutdatedResponse & { message?: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<ClearOutdatedResponse>>(
      `/trips/${tripId}/packing/outdated`
    );
    return {
      ...data.data,
      message: data.message,
    };
  },
};
