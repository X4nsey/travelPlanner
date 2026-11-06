import { apiClient } from './api';
import type { ApiSuccessResponse, EventFormPayload, ItineraryEvent } from '@/types';

export const eventService = {
  async getTripEvents(tripId: string): Promise<ItineraryEvent[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ events: ItineraryEvent[] }>>(
      `/trips/${tripId}/events`
    );
    return data.data.events;
  },

  async createTripEvent(
    tripId: string,
    payload: EventFormPayload
  ): Promise<{ event: ItineraryEvent; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ event: ItineraryEvent }>>(
      `/trips/${tripId}/events`,
      payload
    );
    return { event: data.data.event, message: data.message };
  },

  async getEventById(id: string): Promise<ItineraryEvent> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ event: ItineraryEvent }>>(`/events/${id}`);
    return data.data.event;
  },

  async updateEvent(
    id: string,
    payload: Partial<EventFormPayload>
  ): Promise<{ event: ItineraryEvent; message?: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ event: ItineraryEvent }>>(
      `/events/${id}`,
      payload
    );
    return { event: data.data.event, message: data.message };
  },

  async deleteEvent(id: string): Promise<{ id: string; message?: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ id: string; deleted: boolean }>>(
      `/events/${id}`
    );
    return { id: data.data.id, message: data.message };
  },
};
