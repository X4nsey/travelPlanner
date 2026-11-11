import { apiClient } from './api';
import type {
  ApiSuccessResponse,
  CountryData,
  CountryPhoto,
  PhotoDiagnosticsReport,
} from '@/types';

export interface GetCountriesParams {
  search?: string;
  continent?: string;
  sort?: 'asc' | 'desc';
}

export interface PhotoDiagnosticsQuery {
  countrySlug?: string;
  status?: string;
  targetType?: string;
  search?: string;
}

export interface ReplacePhotoPayload {
  countrySlug: string;
  targetType: 'cover' | 'gallery' | 'city' | 'landmark';
  targetKey: string;
  url: string;
  thumbUrl?: string;
  objectName?: string;
  cityName?: string;
  authorName?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
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

  async getPhotoDiagnostics(params: PhotoDiagnosticsQuery = {}): Promise<PhotoDiagnosticsReport> {
    const { data } = await apiClient.get<ApiSuccessResponse<PhotoDiagnosticsReport>>(
      '/countries/diagnostics/photos',
      { params }
    );
    return data.data;
  },

  async replacePhoto(payload: ReplacePhotoPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ record: any }>>(
      '/countries/diagnostics/photos/replace',
      payload
    );
    return data;
  },

  async resetPhotoOverride(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ reset: boolean }>>(
      '/countries/diagnostics/photos/reset',
      payload
    );
    return data;
  },

  async reverifyPhoto(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ record: any }>>(
      '/countries/diagnostics/photos/reverify',
      payload
    );
    return data;
  },

  async autoSearchWikimedia(payload: {
    countrySlug: string;
    targetType: 'cover' | 'gallery' | 'city' | 'landmark';
    targetKey: string;
    customQuery?: string;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ record: any }>>(
      '/countries/diagnostics/photos/wikimedia-search',
      payload
    );
    return data;
  },
};
