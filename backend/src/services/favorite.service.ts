import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CountryService } from './country.service';

export class FavoriteService {
  static async listUserFavorites(userId: string) {
    const records = await prisma.favoriteCountry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const slugs = records.map((r) => r.countrySlug);
    const countries = records
      .map((r) => {
        const country = CountryService.findCountryByIdentifier(r.countrySlug);
        if (!country) return null;
        return {
          ...country,
          favoritedAt: r.createdAt.toISOString(),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      slugs,
      countries,
    };
  }

  static async addFavorite(userId: string, countrySlug: string) {
    const country = CountryService.findCountryByIdentifier(countrySlug);
    if (!country) {
      throw new AppError('Указанная страна не найдена в каталоге', 404, 'COUNTRY_NOT_FOUND');
    }

    const record = await prisma.favoriteCountry.upsert({
      where: {
        userId_countrySlug: {
          userId,
          countrySlug: country.slug,
        },
      },
      update: {},
      create: {
        userId,
        countrySlug: country.slug,
      },
    });

    return {
      id: record.id,
      countrySlug: country.slug,
      isFavorite: true,
      createdAt: record.createdAt.toISOString(),
    };
  }

  static async removeFavorite(userId: string, countrySlug: string) {
    const country = CountryService.findCountryByIdentifier(countrySlug);
    const normalizedSlug = country ? country.slug : countrySlug.trim().toLowerCase();

    await prisma.favoriteCountry.deleteMany({
      where: {
        userId,
        countrySlug: normalizedSlug,
      },
    });

    return {
      countrySlug: normalizedSlug,
      isFavorite: false,
    };
  }
}
