import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CountryData, TripFormPayload } from '@/types';
import { countryService } from '@/services/country.service';
import { favoriteService } from '@/services/favorite.service';
import {
  buildFallbackCountryFromFeature,
  type GlobePolygonFeature,
} from '@/services/geo.service';
import { useAuthStore } from './auth.store';
import { useToastStore } from './toast.store';

export const useCountryStore = defineStore('countries', () => {
  const countries = ref<CountryData[]>([]);
  const isCatalogLoaded = ref(false);
  const isLoadingCatalog = ref(false);
  const catalogError = ref<string | null>(null);

  const favoriteSlugs = ref<string[]>([]);
  const favoriteCountries = ref<CountryData[]>([]);
  const isFavoritesLoaded = ref(false);
  const isLoadingFavorites = ref(false);

  const selectedGlobeCountry = ref<CountryData | null>(null);

  // Preserves TripForm fields when user navigates to the 3D Globe to pick a country
  const pendingTripDraft = ref<Partial<TripFormPayload> | null>(null);
  const pendingReturnPath = ref<string | null>(null);

  const favoriteSlugsSet = computed(() => new Set(favoriteSlugs.value));

  let catalogPromise: Promise<CountryData[]> | null = null;

  async function ensureCountriesLoaded(force = false): Promise<CountryData[]> {
    if (isCatalogLoaded.value && !force && countries.value.length > 0) {
      return countries.value;
    }
    if (catalogPromise && !force) {
      return catalogPromise;
    }

    catalogPromise = (async () => {
      isLoadingCatalog.value = true;
      catalogError.value = null;
      try {
        const list = await countryService.getCountries();
        countries.value = list;
        isCatalogLoaded.value = true;
        if (!selectedGlobeCountry.value && list.length > 0) {
          selectedGlobeCountry.value =
            list.find((c) => c.slug === 'france') || list[0];
        }
        return list;
      } catch (err: any) {
        catalogError.value = err?.message || 'Не удалось загрузить каталог стран';
        throw err;
      } finally {
        isLoadingCatalog.value = false;
        catalogPromise = null;
      }
    })();

    return catalogPromise;
  }

  async function fetchCountryDetail(slug: string): Promise<CountryData> {
    const detail = await countryService.getCountryBySlug(slug);
    const idx = countries.value.findIndex((c) => c.slug === detail.slug);
    if (idx !== -1) {
      countries.value[idx] = detail;
    }
    return detail;
  }

  async function fetchFavorites(force = false) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      favoriteSlugs.value = [];
      favoriteCountries.value = [];
      isFavoritesLoaded.value = false;
      return;
    }

    if (isFavoritesLoaded.value && !force) {
      return;
    }

    isLoadingFavorites.value = true;
    try {
      const res = await favoriteService.getFavorites();
      favoriteSlugs.value = res.slugs;
      favoriteCountries.value = res.countries;
      isFavoritesLoaded.value = true;
    } catch {
      // Ignore silent failure on background sync
    } finally {
      isLoadingFavorites.value = false;
    }
  }

  function isFavorite(slug?: string | null): boolean {
    if (!slug) return false;
    return favoriteSlugsSet.value.has(slug);
  }

  function isInCatalog(slug?: string | null): boolean {
    if (!slug) return false;
    return countries.value.some((c) => c.slug === slug);
  }

  async function toggleFavorite(country: CountryData): Promise<{ toggled: boolean; requiresAuth?: boolean }> {
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    if (!authStore.isAuthenticated) {
      return { toggled: false, requiresAuth: true };
    }

    const slug = country.slug;
    const currentlyFav = isFavorite(slug);

    try {
      if (currentlyFav) {
        await favoriteService.removeFavorite(slug);
        favoriteSlugs.value = favoriteSlugs.value.filter((s) => s !== slug);
        favoriteCountries.value = favoriteCountries.value.filter((c) => c.slug !== slug);
        toastStore.info(`«${country.nameRu}» удалена из избранного`);
      } else {
        await favoriteService.addFavorite(slug);
        if (!favoriteSlugs.value.includes(slug)) {
          favoriteSlugs.value.unshift(slug);
        }
        if (!favoriteCountries.value.some((c) => c.slug === slug)) {
          favoriteCountries.value.unshift(country);
        }
        toastStore.success(`«${country.nameRu}» добавлена в избранное`);
      }
      return { toggled: true };
    } catch (err: any) {
      toastStore.error('Ошибка', err?.message || 'Не удалось обновить избранное');
      return { toggled: false };
    }
  }

  function findCountryByQuery(val?: string | null): CountryData | undefined {
    if (!val) return undefined;
    const clean = val.trim().toLowerCase();
    const padded = /^\d+$/.test(clean) ? clean.padStart(3, '0') : clean;

    return countries.value.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.nameRu.toLowerCase() === clean ||
        c.nameEn.toLowerCase() === clean ||
        c.isoNumeric === padded ||
        c.isoAlpha2.toLowerCase() === clean
    );
  }

  function resolvePolygonCountry(feat: GlobePolygonFeature): CountryData {
    const match =
      findCountryByQuery(feat.properties.slug) ||
      findCountryByQuery(feat.properties.isoNumeric) ||
      findCountryByQuery(feat.properties.name);

    if (match) return match;
    return buildFallbackCountryFromFeature(feat);
  }

  function setTripPickerDraft(draft: Partial<TripFormPayload>, returnPath: string) {
    pendingTripDraft.value = { ...draft };
    pendingReturnPath.value = returnPath;
  }

  function consumeTripPickerDraft(): { draft: Partial<TripFormPayload> | null; returnPath: string | null } {
    const draft = pendingTripDraft.value;
    const returnPath = pendingReturnPath.value;
    pendingTripDraft.value = null;
    pendingReturnPath.value = null;
    return { draft, returnPath };
  }

  function clearFavoritesState() {
    favoriteSlugs.value = [];
    favoriteCountries.value = [];
    isFavoritesLoaded.value = false;
  }

  return {
    countries,
    isCatalogLoaded,
    isLoadingCatalog,
    catalogError,
    favoriteSlugs,
    favoriteCountries,
    isFavoritesLoaded,
    isLoadingFavorites,
    selectedGlobeCountry,
    pendingTripDraft,
    pendingReturnPath,
    ensureCountriesLoaded,
    fetchCountryDetail,
    fetchFavorites,
    isFavorite,
    isInCatalog,
    toggleFavorite,
    findCountryByQuery,
    resolvePolygonCountry,
    setTripPickerDraft,
    consumeTripPickerDraft,
    clearFavoritesState,
  };
});
