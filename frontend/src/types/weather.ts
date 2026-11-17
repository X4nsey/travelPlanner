export type ClimateHint =
  | 'tropical_warm'
  | 'warm_season'
  | 'cool_season'
  | 'shoulder_or_uncertain';

export type WeatherSourceMode = 'forecast' | 'seasonal_reference';

export type WeatherIconType =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherSummaryDto {
  avgTempMin: number;
  avgTempMax: number;
  minTemp: number;
  maxTemp: number;
  totalPrecipitationMm: number;
  rainyDaysCount: number;
  maxWindKmh: number;
  hasSnow: boolean;
  hasHeavyRain: boolean;
}

export interface WeatherDailyItemDto {
  date: string; // YYYY-MM-DD
  weatherCode: number;
  conditionRu: string;
  iconType: WeatherIconType;
  tempMin: number;
  tempMax: number;
  precipitationMm: number;
  precipitationProbMax: number | null;
  windSpeedMaxKmh: number;
}

export interface TripWeatherResponseDto {
  tripId?: string;
  resolvedCity: string;
  resolvedCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
  sourceMode: WeatherSourceMode;
  sourceLabelRu: string;
  disclaimerRu: string | null;
  climateHint: ClimateHint;
  climateLabelRu: string;
  summary: WeatherSummaryDto;
  daily: WeatherDailyItemDto[];
  fromCache: boolean;
  fetchedAt: string;
  expiresAt: string;
}

export interface DestinationWeatherPreviewParams {
  country: string;
  city?: string;
  startDate?: string;
  endDate?: string;
}
