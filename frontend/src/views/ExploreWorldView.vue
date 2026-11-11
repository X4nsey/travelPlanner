<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  Globe2,
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Heart,
  PlaneTakeoff,
} from 'lucide-vue-next';
import { useCountryStore } from '@/stores/country.store';
import { useTripStore } from '@/stores/trip.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import type { CountryData } from '@/types';
import type { GlobePolygonFeature } from '@/services/geo.service';
import AdaptiveLayout from '@/layouts/AdaptiveLayout.vue';
import GlobeCountryPanel from '@/components/countries/GlobeCountryPanel.vue';
import CountryCard from '@/components/countries/CountryCard.vue';
import AuthPromptModal from '@/components/countries/AuthPromptModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Lazy-load the heavy 3D Globe + Three.js component only when ExploreWorldView is rendered
const WorldGlobe = defineAsyncComponent({
  loader: () => import('@/components/countries/WorldGlobe.vue'),
  delay: 50,
});

const route = useRoute();
const router = useRouter();
const countryStore = useCountryStore();
const tripStore = useTripStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const quickSearch = ref('');
const authPromptOpen = ref(false);
const authRedirectTarget = ref('/explore');

const isPickerMode = computed(
  () => route.query.mode === 'pick' || Boolean(countryStore.pendingReturnPath)
);

const plannedCountryNames = computed<string[]>(() => {
  const set = new Set<string>();
  for (const trip of tripStore.trips) {
    if (trip.country?.trim()) {
      set.add(trip.country.trim());
    }
  }
  return Array.from(set);
});

const plannedCountrySetLower = computed(() => {
  const s = new Set<string>();
  for (const name of plannedCountryNames.value) {
    s.add(name.toLowerCase());
  }
  return s;
});

function hasPlannedTrip(country: CountryData): boolean {
  const s = plannedCountrySetLower.value;
  return (
    s.has(country.nameRu.toLowerCase()) ||
    s.has(country.nameEn.toLowerCase()) ||
    s.has(country.slug.toLowerCase())
  );
}

const quickMatchingCountries = computed(() => {
  const q = quickSearch.value.trim().toLowerCase();
  if (!q) {
    return countryStore.countries.filter((c) => c.featured).slice(0, 10);
  }
  return countryStore.countries
    .filter(
      (c) =>
        c.nameRu.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q)
    )
    .slice(0, 12);
});

const popularFeaturedCountries = computed(() =>
  countryStore.countries.filter((c) => c.featured).slice(0, 8)
);

onMounted(async () => {
  try {
    await countryStore.ensureCountriesLoaded();
    if (authStore.isAuthenticated) {
      countryStore.fetchFavorites().catch(() => {});
      if (tripStore.trips.length === 0) {
        tripStore.fetchTrips().catch(() => {});
      }
    }

    const queryCountry = route.query.country as string | undefined;
    if (queryCountry) {
      const found = countryStore.findCountryByQuery(queryCountry);
      if (found) {
        countryStore.selectedGlobeCountry = found;
      }
    }
  } catch {
    // Error handled in store
  }
});

async function handlePolygonSelect(feat: GlobePolygonFeature) {
  const resolved = await countryStore.resolvePolygonCountry(feat);
  countryStore.selectedGlobeCountry = resolved;
}

function selectQuickCountry(country: CountryData) {
  countryStore.selectedGlobeCountry = country;
}

function handleViewCountry(country: CountryData) {
  router.push(`/countries/${country.slug}`);
}

function handleCreateTripToCountry(country: CountryData) {
  if (!authStore.isAuthenticated) {
    authRedirectTarget.value = `/trips/new?country=${encodeURIComponent(country.nameRu)}`;
    authPromptOpen.value = true;
    return;
  }

  router.push({
    path: '/trips/new',
    query: {
      country: country.nameRu,
      currency: country.defaultTripCurrency,
    },
  });
}

function handlePickForTrip(country: CountryData) {
  const returnPath =
    (route.query.returnTo as string) || countryStore.pendingReturnPath || '/trips/new';

  if (countryStore.pendingTripDraft) {
    countryStore.pendingTripDraft.country = country.nameRu;
    if (!countryStore.pendingTripDraft.currency) {
      countryStore.pendingTripDraft.currency = country.defaultTripCurrency;
    }
  }

  toastStore.success(`Выбрана страна: ${country.flagEmoji} ${country.nameRu}`);
  router.push({
    path: returnPath,
    query: {
      country: country.nameRu,
    },
  });
}

function cancelPickerMode() {
  const returnPath =
    (route.query.returnTo as string) || countryStore.pendingReturnPath || '/trips/new';
  router.push(returnPath);
}

function openAuthPrompt() {
  authRedirectTarget.value = route.fullPath;
  authPromptOpen.value = true;
}
</script>

<template>
  <AdaptiveLayout>
    <div class="space-y-8 animate-fade-in">
      <!-- Picker Mode Banner (when opened from TripForm "Выбрать на глобусе") -->
      <div
        v-if="isPickerMode"
        class="bg-gradient-to-r from-teal-600 to-sky-600 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-start sm:items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Globe2 class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm sm:text-base font-bold">
              Выбор страны на 3D-глобусе для вашей поездки
            </p>
            <p class="text-xs sm:text-sm text-teal-50">
              Нажмите на нужную страну на глобусе и подтвердите выбор в карточке справа
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <BaseButton
            v-if="countryStore.selectedGlobeCountry"
            variant="secondary"
            size="sm"
            class="!bg-white !text-teal-800 hover:!bg-teal-50 !border-0 font-bold"
            @click="handlePickForTrip(countryStore.selectedGlobeCountry)"
          >
            <CheckCircle2 class="w-4 h-4 text-teal-600" />
            <span>Подставить «{{ countryStore.selectedGlobeCountry.nameRu }}»</span>
          </BaseButton>

          <button
            type="button"
            @click="cancelPickerMode"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Назад к форме</span>
          </button>
        </div>
      </div>

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 text-xs font-semibold mb-2.5"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Интерактивный 3D-атлас путешественника</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Исследуй мир
          </h1>
          <p class="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
            Вращайте трёхмерную модель Земли, выбирайте страны одним нажатием, изучайте ключевые факты и сразу создавайте маршруты путешествий.
          </p>
        </div>

        <RouterLink to="/countries" class="shrink-0">
          <BaseButton variant="outline" size="md">
            <BookOpen class="w-4 h-4 text-teal-600" />
            <span>Открыть каталог всех стран</span>
          </BaseButton>
        </RouterLink>
      </div>

      <!-- Quick Country Search & Jump Chips -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="quickSearch"
              type="text"
              placeholder="Быстрый переход к стране на глобусе (например: Япония, Италия, Бразилия)..."
              class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <span class="text-xs text-slate-400">
            Или нажмите на любое государство прямо на 3D-глобусе:
          </span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            v-for="item in quickMatchingCountries"
            :key="item.slug"
            type="button"
            @click="selectQuickCountry(item)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all',
              countryStore.selectedGlobeCountry?.slug === item.slug
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : hasPlannedTrip(item)
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300/90 hover:bg-emerald-100/80'
                  : countryStore.isFavorite(item.slug)
                    ? 'bg-purple-50 text-purple-900 border-purple-200/90 hover:bg-purple-100/80'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-900',
            ]"
          >
            <span>{{ item.flagEmoji }}</span>
            <span>{{ item.nameRu }}</span>
            <PlaneTakeoff
              v-if="hasPlannedTrip(item)"
              :class="[
                'w-3 h-3 shrink-0',
                countryStore.selectedGlobeCountry?.slug === item.slug ? 'text-white' : 'text-emerald-600',
              ]"
              title="Запланирована поездка"
            />
            <Heart
              v-if="countryStore.isFavorite(item.slug)"
              :class="[
                'w-3 h-3 shrink-0 fill-current',
                countryStore.selectedGlobeCountry?.slug === item.slug ? 'text-white' : 'text-purple-600',
              ]"
              title="В избранном"
            />
          </button>
        </div>
      </div>

      <!-- Main Interactive Section: 3D Globe (Left/Center) + Selected Country Panel (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col">
          <Suspense>
            <template #default>
              <WorldGlobe
                :countries="countryStore.countries"
                :selectedCountry="countryStore.selectedGlobeCountry"
                :favoriteSlugs="countryStore.favoriteSlugs"
                :plannedCountryNames="plannedCountryNames"
                @select-country="handlePolygonSelect"
              />
            </template>
            <template #fallback>
              <div
                class="w-full h-[460px] sm:h-[540px] lg:h-[600px] rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 border border-slate-800/80 shadow-xl flex flex-col items-center justify-center p-6 text-center text-white"
              >
                <div class="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center mb-3 animate-pulse">
                  <Globe2 class="w-6 h-6 text-sky-400" />
                </div>
                <p class="text-sm font-semibold text-slate-200">Загрузка интерактивного 3D-глобуса...</p>
                <p class="text-xs text-slate-400 mt-1">Подготавливаем карту стран мира</p>
              </div>
            </template>
          </Suspense>
        </div>

        <div class="lg:col-span-5 xl:col-span-4 flex flex-col">
          <GlobeCountryPanel
            :country="countryStore.selectedGlobeCountry"
            :pickerMode="isPickerMode"
            @view-country="handleViewCountry"
            @create-trip="handleCreateTripToCountry"
            @pick-for-trip="handlePickForTrip"
            @auth-required="openAuthPrompt"
          />
        </div>
      </div>

      <!-- Popular Destinations Section Below Globe -->
      <section v-if="popularFeaturedCountries.length > 0" class="pt-4 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
              Популярные страны для путешествий
            </h2>
            <p class="text-sm text-slate-500">
              Нажмите на карточку, чтобы открыть подробный путеводитель по стране с фотогалереей и достопримечательностями
            </p>
          </div>

          <RouterLink to="/countries">
            <BaseButton variant="ghost" size="sm" class="text-teal-700">
              <span>Смотреть весь каталог ({{ countryStore.countries.length }})</span>
            </BaseButton>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CountryCard
            v-for="country in popularFeaturedCountries"
            :key="country.slug"
            :country="country"
            @select="handleViewCountry"
            @auth-required="openAuthPrompt"
          />
        </div>
      </section>
    </div>

    <AuthPromptModal
      :open="authPromptOpen"
      :redirectPath="authRedirectTarget"
      @close="authPromptOpen = false"
    />
  </AdaptiveLayout>
</template>
