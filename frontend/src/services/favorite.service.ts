import { apiClient } from './api';
import type { ApiSuccessResponse, CountryData } from '@/types';

export interface FavoritesListResponse {
  slugs: string[];
  countries: CountryData[];
}

export const favoriteService = {
  async getFavorites(): Promise<FavoritesListResponse> {
    const { data } = await apiClient.get<ApiSuccessResponse<FavoritesListResponse>>('/favorites');
    return data.data;
  },

  async addFavorite(countrySlug: string): Promise<{ countrySlug: string; isFavorite: boolean; message?: string }> {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ countrySlug: string; isFavorite: boolean }>
    >('/favorites', { countrySlug });
    return { ...data.data, message: data.message };
  },

  async removeFavorite(countrySlug: string): Promise<{ countrySlug: string; isFavorite: boolean; message?: string }> {
    const { data } = await apiClient.delete<
      ApiSuccessResponse<{ countrySlug: string; isFavorite: boolean }>
    >(`/favorites/${encodeURIComponent(countrySlug)}`);
    return { ...data.data, message: data.message };
  },
};
