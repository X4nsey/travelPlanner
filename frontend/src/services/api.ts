import axios, { AxiosError } from 'axios';

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'UNKNOWN_ERROR',
    details?: Record<string, string[]>,
    isNetworkError = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use((config) => {
  const csrfToken = getCookieValue('travelplanner_csrf');
  if (csrfToken && config.headers) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiClientError(
          'Потеряно соединение с сервером. Проверьте подключение к сети или убедитесь, что backend запущен.',
          0,
          'NETWORK_ERROR',
          undefined,
          true
        )
      );
    }

    const status = error.response.status;
    const apiError = error.response.data?.error;
    const message =
      apiError?.message ||
      error.response.data?.message ||
      (status === 401
        ? 'Сессия истекла или требуется вход в систему'
        : status === 403
          ? 'У вас нет прав для выполнения этого действия'
          : status === 404
            ? 'Запрашиваемые данные не найдены'
            : 'Произошла ошибка при обращении к серверу');

    return Promise.reject(
      new ApiClientError(
        message,
        status,
        apiError?.code || 'API_ERROR',
        apiError?.details,
        false
      )
    );
  }
);
