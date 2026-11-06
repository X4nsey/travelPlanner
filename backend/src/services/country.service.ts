import { CountryData } from '../data/countries.data';
import { FULL_COUNTRIES_CATALOG } from '../data/world-atlas-lookup.data';
import { PhotoService } from './photo.service';
import { AppError } from '../lib/errors';

export interface CountryListQuery {
  search?: string;
  continent?: string;
  sort?: 'asc' | 'desc';
}

export class CountryService {
  static listCountries(query: CountryListQuery = {}): CountryData[] {
    const search = query.search?.trim().toLowerCase() || '';
    const continent = query.continent?.trim() || '';
    const sortOrder = query.sort === 'desc' ? 'desc' : 'asc';

    const filtered = FULL_COUNTRIES_CATALOG.filter((c) => {
      if (continent && continent !== 'all' && c.continent !== continent) {
        return false;
      }
      if (!search) return true;
      return (
        c.nameRu.toLowerCase().includes(search) ||
        c.nameEn.toLowerCase().includes(search) ||
        c.capital.toLowerCase().includes(search) ||
        c.popularCities.some((city) => city.name.toLowerCase().includes(search))
      );
    });

    return filtered.sort((a, b) => {
      const cmp = a.nameRu.localeCompare(b.nameRu, 'ru');
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }

  static findCountryByIdentifier(identifier: string): CountryData | undefined {
    const clean = identifier.trim().toLowerCase();
    const paddedNumeric = /^\d+$/.test(clean) ? clean.padStart(3, '0') : clean;

    return FULL_COUNTRIES_CATALOG.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.isoNumeric === paddedNumeric ||
        c.isoAlpha2.toLowerCase() === clean ||
        c.nameRu.toLowerCase() === clean ||
        c.nameEn.toLowerCase() === clean
    );
  }

  static async getCountryDetail(identifier: string): Promise<CountryData> {
    const country = this.findCountryByIdentifier(identifier);
    if (!country) {
      throw new AppError('Страна не найдена в каталоге', 404, 'COUNTRY_NOT_FOUND');
    }

    const photos = await PhotoService.getPhotosForCountry(country);
    return {
      ...country,
      coverPhoto: photos.coverPhoto,
      gallery: photos.gallery,
    };
  }

  static async getCountryPhotos(identifier: string) {
    const country = this.findCountryByIdentifier(identifier);
    if (!country) {
      throw new AppError('Страна не найдена в каталоге', 404, 'COUNTRY_NOT_FOUND');
    }

    return PhotoService.getPhotosForCountry(country);
  }
}
