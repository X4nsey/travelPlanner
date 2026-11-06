export type Currency = 'RUB' | 'USD' | 'EUR';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryEvent {
  id: string;
  tripId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  location: string | null;
  estimatedCost: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  country: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  travelersCount: number;
  budget: number;
  currency: Currency;
  description: string;
  eventsCount?: number;
  events?: ItineraryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TripFormPayload {
  title: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  budget: number;
  currency: Currency;
  description: string;
}

export interface EventFormPayload {
  title: string;
  description: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  estimatedCost: number | null;
  note: string | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ContinentName =
  | 'Европа'
  | 'Азия'
  | 'Африка'
  | 'Северная Америка'
  | 'Южная Америка'
  | 'Океания';

export interface CountryPhoto {
  url: string;
  thumbUrl: string;
  alt: string;
  category?: 'Города' | 'Природа' | 'Архитектура' | 'Туристические места' | 'Обложка';
  authorName: string;
  authorUrl: string;
  sourceName: 'Unsplash' | 'Pexels' | 'Wikimedia';
  sourceUrl: string;
}

export interface CountryCityItem {
  name: string;
  description: string;
  photoUrl: string;
  authorName?: string;
}

export interface CountryLandmarkItem {
  name: string;
  city: string;
  category: string;
  description: string;
}

export interface CountryData {
  slug: string;
  isoNumeric: string;
  isoAlpha2: string;
  nameRu: string;
  nameEn: string;
  flagEmoji: string;
  flagUrl: string;
  capital: string;
  continent: ContinentName;
  population: number;
  area: number;
  languages: string[];
  currency: string;
  defaultTripCurrency: Currency;
  timezone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  shortDescription: string;
  description: string;
  coverPhoto: CountryPhoto;
  gallery: CountryPhoto[];
  popularCities: CountryCityItem[];
  landmarks: CountryLandmarkItem[];
  featured?: boolean;
  favoritedAt?: string;
}

