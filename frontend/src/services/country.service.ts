import { apiClient } from './api';
import type { ApiSuccessResponse, CountryData, CountryPhoto } from '@/types';

export interface GetCountriesParams {
  search?: string;
  continent?: string;
  sort?: 'asc' | 'desc';
}

export const countryService = {
  async getCountries(params: GetCountriesParams = {}): Promise<CountryData[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ countries: CountryData[] }>>('/countries', {
      params,
    });
    return data.data.countries;
  },

  async getCountryBySlug(slug: string): Promise<CountryData> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ country: CountryData }>>(
      `/countries/${encodeURIComponent(slug)}`
    );
    return data.data.country;
  },

  async getCountryPhotos(slug: string): Promise<{
    coverPhoto: CountryPhoto;
    gallery: CountryPhoto[];
    provider: string;
  }> {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{
        coverPhoto: CountryPhoto;
        gallery: CountryPhoto[];
        provider: string;
      }>
    >(`/countries/${encodeURIComponent(slug)}/photos`);
    return data.data;
  },
};
