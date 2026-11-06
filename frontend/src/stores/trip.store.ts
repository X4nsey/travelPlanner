import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Trip, TripFormPayload, EventFormPayload, ItineraryEvent } from '@/types';
import { tripService } from '@/services/trip.service';
import { eventService } from '@/services/event.service';
import { getTodayIso } from '@/composables/useFormatters';

export const useTripStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([]);
  const currentTrip = ref<Trip | null>(null);
  const isLoadingList = ref(false);
  const isLoadingDetail = ref(false);
  const listError = ref<string | null>(null);
  const detailError = ref<string | null>(null);

  const totalTripsCount = computed(() => trips.value.length);

  const upcomingTripsCount = computed(() => {
    const today = getTodayIso();
    return trips.value.filter((t) => t.endDate >= today).length;
  });

  const recentTrips = computed(() => {
    return [...trips.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  });

  async function fetchTrips() {
    isLoadingList.value = true;
    listError.value = null;
    try {
      trips.value = await tripService.getTrips();
      return trips.value;
    } catch (err: any) {
      listError.value = err?.message || 'Не удалось загрузить список поездок';
      throw err;
    } finally {
      isLoadingList.value = false;
    }
  }

  async function fetchTripById(id: string) {
    isLoadingDetail.value = true;
    detailError.value = null;
    try {
      const trip = await tripService.getTripById(id);
      currentTrip.value = trip;
      // Also update in list if present
      const idx = trips.value.findIndex((t) => t.id === id);
      if (idx !== -1) {
        trips.value[idx] = { ...trips.value[idx], ...trip };
      }
      return trip;
    } catch (err: any) {
      detailError.value = err?.message || 'Не удалось загрузить данные поездки';
      currentTrip.value = null;
      throw err;
    } finally {
      isLoadingDetail.value = false;
    }
  }

  async function createTrip(payload: TripFormPayload) {
    const res = await tripService.createTrip(payload);
    trips.value.push(res.trip);
    trips.value.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return res;
  }

  async function updateTrip(id: string, payload: Partial<TripFormPayload>) {
    const res = await tripService.updateTrip(id, payload);
    const idx = trips.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      trips.value[idx] = res.trip;
      trips.value.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    if (currentTrip.value?.id === id) {
      currentTrip.value = res.trip;
    }
    return res;
  }

  async function deleteTrip(id: string) {
    const res = await tripService.deleteTrip(id);
    trips.value = trips.value.filter((t) => t.id !== id);
    if (currentTrip.value?.id === id) {
      currentTrip.value = null;
    }
    return res;
  }

  function sortEventsList(events: ItineraryEvent[]): ItineraryEvent[] {
    return [...events].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.startTime && b.startTime && a.startTime !== b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      if (a.endTime && b.endTime && a.endTime !== b.endTime) {
        return a.endTime.localeCompare(b.endTime);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async function addEventToCurrentTrip(tripId: string, payload: EventFormPayload) {
    const res = await eventService.createTripEvent(tripId, payload);
    if (currentTrip.value && currentTrip.value.id === tripId) {
      const existing = currentTrip.value.events || [];
      currentTrip.value.events = sortEventsList([...existing, res.event]);
      currentTrip.value.eventsCount = currentTrip.value.events.length;
    }
    return res;
  }

  async function updateEventInCurrentTrip(eventId: string, payload: Partial<EventFormPayload>) {
    const res = await eventService.updateEvent(eventId, payload);
    if (currentTrip.value && currentTrip.value.events) {
      const updatedList = currentTrip.value.events.map((ev) => (ev.id === eventId ? res.event : ev));
      currentTrip.value.events = sortEventsList(updatedList);
    }
    return res;
  }

  async function deleteEventFromCurrentTrip(eventId: string) {
    const res = await eventService.deleteEvent(eventId);
    if (currentTrip.value && currentTrip.value.events) {
      currentTrip.value.events = currentTrip.value.events.filter((ev) => ev.id !== eventId);
      currentTrip.value.eventsCount = currentTrip.value.events.length;
    }
    return res;
  }

  function clearState() {
    trips.value = [];
    currentTrip.value = null;
    listError.value = null;
    detailError.value = null;
  }

  return {
    trips,
    currentTrip,
    isLoadingList,
    isLoadingDetail,
    listError,
    detailError,
    totalTripsCount,
    upcomingTripsCount,
    recentTrips,
    fetchTrips,
    fetchTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    addEventToCurrentTrip,
    updateEventInCurrentTrip,
    deleteEventFromCurrentTrip,
    clearState,
  };
});
