import { apiClient } from './api';
import type { ApiSuccessResponse, Trip, TripFormPayload } from '@/types';

export const tripService = {
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
};
