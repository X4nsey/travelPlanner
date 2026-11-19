import { apiClient } from './api';
import type {
  ApiSuccessResponse,
  CreateTripFromTemplatePayload,
  DuplicateTripPayload,
  SharedTripResponse,
  Trip,
  TripFormPayload,
  TripShareSettings,
  TripTemplate,
  UpdateTripSharePayload,
  UserTravelStats,
} from '@/types';

export const tripService = {
  async getStats(): Promise<UserTravelStats> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ stats: UserTravelStats }>>('/trips/stats');
    return data.data.stats;
  },

  async getTemplates(): Promise<TripTemplate[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ templates: TripTemplate[] }>>('/trips/templates');
    return data.data.templates;
  },

  async createTripFromTemplate(
    payload: CreateTripFromTemplatePayload
  ): Promise<{ trip: Trip; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ trip: Trip }>>(
      '/trips/from-template',
      payload
    );
    return { trip: data.data.trip, message: data.message };
  },

  async duplicateTrip(
    tripId: string,
    payload: DuplicateTripPayload
  ): Promise<{ trip: Trip; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ trip: Trip }>>(
      `/trips/${tripId}/duplicate`,
      payload
    );
    return { trip: data.data.trip, message: data.message };
  },

  async getTrips(): Promise<Trip[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ trips: Trip[] }>>('/trips');
    return data.data.trips;
  },

  async getTripById(id: string): Promise<Trip> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ trip: Trip }>>(`/trips/${id}`);
    return data.data.trip;
  },

  async createTrip(payload: TripFormPayload): Promise<{ trip: Trip; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ trip: Trip }>>('/trips', payload);
    return { trip: data.data.trip, message: data.message };
  },

  async updateTrip(id: string, payload: Partial<TripFormPayload>): Promise<{ trip: Trip; message?: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ trip: Trip }>>(`/trips/${id}`, payload);
    return { trip: data.data.trip, message: data.message };
  },

  async deleteTrip(id: string): Promise<{ id: string; message?: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ id: string; deleted: boolean }>>(`/trips/${id}`);
    return { id: data.data.id, message: data.message };
  },

  async getTripShare(tripId: string): Promise<TripShareSettings | null> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ share: TripShareSettings | null }>>(
      `/trips/${tripId}/share`
    );
    return data.data.share;
  },

  async updateTripShare(
    tripId: string,
    payload: UpdateTripSharePayload
  ): Promise<{ share: TripShareSettings; message?: string }> {
    const { data } = await apiClient.put<ApiSuccessResponse<{ share: TripShareSettings }>>(
      `/trips/${tripId}/share`,
      payload
    );
    return { share: data.data.share, message: data.message };
  },

  async regenerateTripShare(
    tripId: string
  ): Promise<{ share: TripShareSettings; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ share: TripShareSettings }>>(
      `/trips/${tripId}/share/regenerate`
    );
    return { share: data.data.share, message: data.message };
  },

  async getSharedTripByToken(token: string): Promise<SharedTripResponse> {
    const { data } = await apiClient.get<ApiSuccessResponse<SharedTripResponse>>(
      `/shared/trips/${encodeURIComponent(token)}`
    );
    return data.data;
  },

  async cloneSharedTrip(token: string): Promise<{ trip: Trip; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ trip: Trip }>>(
      `/shared/trips/${encodeURIComponent(token)}/clone`
    );
    return { trip: data.data.trip, message: data.message };
  },
};
