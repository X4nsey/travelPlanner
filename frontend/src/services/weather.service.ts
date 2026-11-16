import { apiClient, ApiClientError } from './api';
import type { ApiSuccessResponse, TripWeatherResponseDto } from '@/types';

const WEATHER_REQUEST_TIMEOUT_MS = 20000;

function normalizeWeatherError(err: unknown): ApiClientError {
  if (err instanceof ApiClientError) {
    return err;
  }

  const anyErr = err as {
    response?: {
      status?: number;
      data?: {
        error?: {
          code?: string;
          message?: string;
          details?: Record<string, string[]>;
        };
        message?: string;
      };
    };
    statusCode?: number;
    code?: string;
    message?: string;
  };

  const apiError = anyErr?.response?.data?.error;
  const code =
    (typeof apiError?.code === 'string' && apiError.code) ||
    (typeof anyErr?.code === 'string' && anyErr.code) ||
    'API_ERROR';
  const message =
    (typeof apiError?.message === 'string' && apiError.message) ||
    (typeof anyErr?.response?.data?.message === 'string' && anyErr.response.data.message) ||
    (typeof anyErr?.message === 'string' && anyErr.message) ||
    'Не удалось получить данные о погоде';
  const status = Number(anyErr?.response?.status ?? anyErr?.statusCode ?? 500);

  return new ApiClientError(message, status, code, apiError?.details, false);
}

export const weatherService = {
  async getTripWeather(tripId: string): Promise<TripWeatherResponseDto> {
    try {
      const { data } = await apiClient.get<ApiSuccessResponse<TripWeatherResponseDto>>(
        `/trips/${encodeURIComponent(tripId)}/weather`,
        { timeout: WEATHER_REQUEST_TIMEOUT_MS }
      );
      return data.data;
    } catch (err) {
      throw normalizeWeatherError(err);
    }
  },

  async refreshTripWeather(tripId: string): Promise<TripWeatherResponseDto> {
    try {
      // apiClient request interceptor automatically attaches X-CSRF-Token from cookie
      const { data } = await apiClient.post<ApiSuccessResponse<TripWeatherResponseDto>>(
        `/trips/${encodeURIComponent(tripId)}/weather/refresh`,
        undefined,
        { timeout: WEATHER_REQUEST_TIMEOUT_MS }
      );
      return data.data;
    } catch (err) {
      throw normalizeWeatherError(err);
    }
  },
};
