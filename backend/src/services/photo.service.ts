import { CountryData, CountryPhoto } from '../data/countries.data';

interface CachedPhotos {
  coverPhoto: CountryPhoto;
  gallery: CountryPhoto[];
  provider: 'unsplash' | 'pexels' | 'fallback';
  fetchedAt: number;
}

const photoCache = new Map<string, CachedPhotos>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const GALLERY_CATEGORIES: CountryPhoto['category'][] = [
  'Города',
  'Природа',
  'Архитектура',
  'Туристические места',
];

export class PhotoService {
  static async getPhotosForCountry(country: CountryData): Promise<CachedPhotos> {
    const cached = photoCache.get(country.slug);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached;
    }

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
    const pexelsKey = process.env.PEXELS_API_KEY?.trim();

    if (unsplashKey) {
      try {
        const result = await this.fetchFromUnsplash(country, unsplashKey);
        if (result) {
          photoCache.set(country.slug, result);
          return result;
        }
      } catch (err) {
        console.warn(`[PhotoService] Ошибка запроса к Unsplash API для ${country.slug}, используем резервные фото:`, err);
      }
    }

    if (pexelsKey) {
      try {
        const result = await this.fetchFromPexels(country, pexelsKey);
        if (result) {
          photoCache.set(country.slug, result);
          return result;
        }
      } catch (err) {
        console.warn(`[PhotoService] Ошибка запроса к Pexels API для ${country.slug}, используем резервные фото:`, err);
      }
    }

    const fallback: CachedPhotos = {
      coverPhoto: country.coverPhoto,
      gallery: country.gallery,
      provider: 'fallback',
      fetchedAt: Date.now(),
    };

    photoCache.set(country.slug, fallback);
    return fallback;
  }

  private static async fetchFromUnsplash(
    country: CountryData,
    accessKey: string
  ): Promise<CachedPhotos | null> {
    const query = encodeURIComponent(`${country.nameEn} ${country.capital} travel landmark`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            'Accept-Version': 'v1',
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) return null;
      const data: any = await response.json();
      const results: any[] = data?.results || [];
      if (results.length === 0) return null;

      const mapped: CountryPhoto[] = results.map((item, idx) => ({
        url: item.urls?.regular || item.urls?.full || country.coverPhoto.url,
        thumbUrl: item.urls?.small || item.urls?.regular || country.coverPhoto.thumbUrl,
        alt: item.alt_description || item.description || `${country.nameRu} — фото`,
        category: idx === 0 ? 'Обложка' : GALLERY_CATEGORIES[(idx - 1) % GALLERY_CATEGORIES.length],
        authorName: item.user?.name || 'Unsplash Photographer',
        authorUrl: item.user?.links?.html || 'https://unsplash.com',
        sourceName: 'Unsplash',
        sourceUrl: item.links?.html || 'https://unsplash.com',
      }));

      return {
        coverPhoto: mapped[0],
        gallery: mapped.slice(1).length >= 2 ? mapped.slice(1) : country.gallery,
        provider: 'unsplash',
        fetchedAt: Date.now(),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private static async fetchFromPexels(
    country: CountryData,
    apiKey: string
  ): Promise<CachedPhotos | null> {
    const query = encodeURIComponent(`${country.nameEn} travel landscape`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: apiKey,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) return null;
      const data: any = await response.json();
      const photos: any[] = data?.photos || [];
      if (photos.length === 0) return null;

      const mapped: CountryPhoto[] = photos.map((item, idx) => ({
        url: item.src?.large2x || item.src?.large || country.coverPhoto.url,
        thumbUrl: item.src?.medium || item.src?.large || country.coverPhoto.thumbUrl,
        alt: item.alt || `${country.nameRu} — фото`,
        category: idx === 0 ? 'Обложка' : GALLERY_CATEGORIES[(idx - 1) % GALLERY_CATEGORIES.length],
        authorName: item.photographer || 'Pexels Photographer',
        authorUrl: item.photographer_url || 'https://www.pexels.com',
        sourceName: 'Pexels',
        sourceUrl: item.url || 'https://www.pexels.com',
      }));

      return {
        coverPhoto: mapped[0],
        gallery: mapped.slice(1).length >= 2 ? mapped.slice(1) : country.gallery,
        provider: 'pexels',
        fetchedAt: Date.now(),
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
