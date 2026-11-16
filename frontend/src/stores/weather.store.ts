import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TripWeatherResponseDto } from '@/types';
import { ApiClientError } from '@/services/api';
import { weatherService } from '@/services/weather.service';

interface InFlightRequest {
  version: number;
  promise: Promise<TripWeatherResponseDto>;
}

function extractErrorInfo(err: unknown, fallbackMessage: string): {
  message: string;
  code: string;
} {
  if (err instanceof ApiClientError) {
    return {
      message: err.message || fallbackMessage,
      code: err.code || 'API_ERROR',
    };
  }

  const anyErr = err as { message?: unknown; code?: unknown } | null | undefined;
  return {
    message:
      typeof anyErr?.message === 'string' && anyErr.message.trim()
        ? anyErr.message
        : fallbackMessage,
    code:
      typeof anyErr?.code === 'string' && anyErr.code.trim()
        ? anyErr.code
        : 'API_ERROR',
  };
}

export const useWeatherStore = defineStore('weather', () => {
  const weatherByTripId = ref<Record<string, TripWeatherResponseDto>>({});
  const loadingByTripId = ref<Record<string, boolean>>({});
  const refreshingByTripId = ref<Record<string, boolean>>({});
  const errorByTripId = ref<Record<string, string | null>>({});
  const errorCodeByTripId = ref<Record<string, string | null>>({});

  // Race-condition & invalidation guards per tripId
  const versionByTripId: Record<string, number> = {};
  const fetchSeqByTripId: Record<string, number> = {};
  const refreshSeqByTripId: Record<string, number> = {};
  const writeSeqByTripId: Record<string, number> = {};
  const inFlightFetchByTripId: Record<string, InFlightRequest> = {};
  const inFlightRefreshByTripId: Record<string, InFlightRequest> = {};

  function getVersion(tripId: string): number {
    return versionByTripId[tripId] ?? 0;
  }

  function isCurrentWrite(tripId: string, version: number, writeSeq: number): boolean {
    return getVersion(tripId) === version && writeSeqByTripId[tripId] === writeSeq;
  }

  function setWeatherEntry(tripId: string, weather: TripWeatherResponseDto) {
    weatherByTripId.value = {
      ...weatherByTripId.value,
      [tripId]: weather,
    };
  }

  function setLoadingFlag(tripId: string, active: boolean) {
    if (active) {
      loadingByTripId.value = {
        ...loadingByTripId.value,
        [tripId]: true,
      };
    } else if (tripId in loadingByTripId.value) {
      const next = { ...loadingByTripId.value };
      delete next[tripId];
      loadingByTripId.value = next;
    }
  }

  function setRefreshingFlag(tripId: string, active: boolean) {
    if (active) {
      refreshingByTripId.value = {
        ...refreshingByTripId.value,
        [tripId]: true,
      };
    } else if (tripId in refreshingByTripId.value) {
      const next = { ...refreshingByTripId.value };
      delete next[tripId];
      refreshingByTripId.value = next;
    }
  }

  function setErrorEntry(tripId: string, message: string | null, code: string | null) {
    if (message === null && code === null) {
      if (tripId in errorByTripId.value) {
        const nextErr = { ...errorByTripId.value };
        delete nextErr[tripId];
        errorByTripId.value = nextErr;
      }
      if (tripId in errorCodeByTripId.value) {
        const nextCode = { ...errorCodeByTripId.value };
        delete nextCode[tripId];
        errorCodeByTripId.value = nextCode;
      }
      return;
    }

    errorByTripId.value = {
      ...errorByTripId.value,
      [tripId]: message,
    };
    errorCodeByTripId.value = {
      ...errorCodeByTripId.value,
      [tripId]: code,
    };
  }

  function getWeather(tripId: string): TripWeatherResponseDto | null {
    return weatherByTripId.value[tripId] ?? null;
  }

  function isLoading(tripId: string): boolean {
    return Boolean(loadingByTripId.value[tripId]);
  }

  function isRefreshing(tripId: string): boolean {
    return Boolean(refreshingByTripId.value[tripId]);
  }

  function getError(tripId: string): string | null {
    return errorByTripId.value[tripId] ?? null;
  }

  function getErrorCode(tripId: string): string | null {
    return errorCodeByTripId.value[tripId] ?? null;
  }

  async function fetchTripWeather(
    tripId: string,
    options: { force?: boolean } = {}
  ): Promise<TripWeatherResponseDto> {
    const requestVersion = getVersion(tripId);
    const existing = inFlightFetchByTripId[tripId];

    if (!options.force && existing && existing.version === requestVersion) {
      return existing.promise;
    }

    const fetchSeq = (fetchSeqByTripId[tripId] ?? 0) + 1;
    fetchSeqByTripId[tripId] = fetchSeq;

    const writeSeq = (writeSeqByTripId[tripId] ?? 0) + 1;
    writeSeqByTripId[tripId] = writeSeq;

    setLoadingFlag(tripId, true);
    setErrorEntry(tripId, null, null);

    let promise!: Promise<TripWeatherResponseDto>;
    promise = (async () => {
      try {
        const result = await weatherService.getTripWeather(tripId);
        if (isCurrentWrite(tripId, requestVersion, writeSeq)) {
          setWeatherEntry(tripId, result);
          setErrorEntry(tripId, null, null);
        }
        return result;
      } catch (err) {
        if (isCurrentWrite(tripId, requestVersion, writeSeq)) {
          const { message, code } = extractErrorInfo(
            err,
            'Не удалось загрузить прогноз погоды'
          );
          setErrorEntry(tripId, message, code);
        }
        throw err;
      } finally {
        if (getVersion(tripId) === requestVersion && fetchSeqByTripId[tripId] === fetchSeq) {
          setLoadingFlag(tripId, false);
        }
        if (inFlightFetchByTripId[tripId]?.promise === promise) {
          delete inFlightFetchByTripId[tripId];
        }
      }
    })();

    inFlightFetchByTripId[tripId] = { version: requestVersion, promise };
    return promise;
  }

  async function refreshTripWeather(tripId: string): Promise<TripWeatherResponseDto> {
    const requestVersion = getVersion(tripId);
    const existing = inFlightRefreshByTripId[tripId];

    if (existing && existing.version === requestVersion) {
      return existing.promise;
    }

    const refreshSeq = (refreshSeqByTripId[tripId] ?? 0) + 1;
    refreshSeqByTripId[tripId] = refreshSeq;

    const writeSeq = (writeSeqByTripId[tripId] ?? 0) + 1;
    writeSeqByTripId[tripId] = writeSeq;

    setRefreshingFlag(tripId, true);
    setErrorEntry(tripId, null, null);

    let promise!: Promise<TripWeatherResponseDto>;
    promise = (async () => {
      try {
        const result = await weatherService.refreshTripWeather(tripId);
        if (isCurrentWrite(tripId, requestVersion, writeSeq)) {
          setWeatherEntry(tripId, result);
          setErrorEntry(tripId, null, null);
        }
        return result;
      } catch (err) {
        if (isCurrentWrite(tripId, requestVersion, writeSeq)) {
          const { message, code } = extractErrorInfo(
            err,
            'Не удалось обновить прогноз погоды'
          );
          setErrorEntry(tripId, message, code);
        }
        throw err;
      } finally {
        if (getVersion(tripId) === requestVersion && refreshSeqByTripId[tripId] === refreshSeq) {
          setRefreshingFlag(tripId, false);
        }
        if (inFlightRefreshByTripId[tripId]?.promise === promise) {
          delete inFlightRefreshByTripId[tripId];
        }
      }
    })();

    inFlightRefreshByTripId[tripId] = { version: requestVersion, promise };
    return promise;
  }

  function invalidateTripWeather(tripId: string) {
    versionByTripId[tripId] = getVersion(tripId) + 1;
    delete inFlightFetchByTripId[tripId];
    delete inFlightRefreshByTripId[tripId];

    if (tripId in weatherByTripId.value) {
      const next = { ...weatherByTripId.value };
      delete next[tripId];
      weatherByTripId.value = next;
    }

    setLoadingFlag(tripId, false);
    setRefreshingFlag(tripId, false);
    setErrorEntry(tripId, null, null);
  }

  function clearState() {
    const trackedTripIds = new Set([
      ...Object.keys(versionByTripId),
      ...Object.keys(weatherByTripId.value),
      ...Object.keys(loadingByTripId.value),
      ...Object.keys(refreshingByTripId.value),
      ...Object.keys(errorByTripId.value),
      ...Object.keys(inFlightFetchByTripId),
      ...Object.keys(inFlightRefreshByTripId),
    ]);

    for (const id of trackedTripIds) {
      versionByTripId[id] = getVersion(id) + 1;
      delete inFlightFetchByTripId[id];
      delete inFlightRefreshByTripId[id];
    }

    weatherByTripId.value = {};
    loadingByTripId.value = {};
    refreshingByTripId.value = {};
    errorByTripId.value = {};
    errorCodeByTripId.value = {};
  }

  return {
    weatherByTripId,
    loadingByTripId,
    refreshingByTripId,
    errorByTripId,
    errorCodeByTripId,
    getWeather,
    isLoading,
    isRefreshing,
    getError,
    getErrorCode,
    fetchTripWeather,
    refreshTripWeather,
    invalidateTripWeather,
    clearState,
  };
});
