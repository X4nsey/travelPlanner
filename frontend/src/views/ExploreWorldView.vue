<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  Globe2,
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-vue-next';
import { useCountryStore } from '@/stores/country.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import type { CountryData } from '@/types';
import type { GlobePolygonFeature } from '@/services/geo.service';
import AdaptiveLayout from '@/layouts/AdaptiveLayout.vue';
import WorldGlobe from '@/components/countries/WorldGlobe.vue';
import GlobeCountryPanel from '@/components/countries/GlobeCountryPanel.vue';
import CountryCard from '@/components/countries/CountryCard.vue';
import AuthPromptModal from '@/components/countries/AuthPromptModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const countryStore = useCountryStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const quickSearch = ref('');
const authPromptOpen = ref(false);
const authRedirectTarget = ref('/explore');

const isPickerMode = computed(
  () => route.query.mode === 'pick' || Boolean(countryStore.pendingReturnPath)
);

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

function handlePolygonSelect(feat: GlobePolygonFeature) {
  const resolved = countryStore.resolvePolygonCountry(feat);
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
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800',
            ]"
          >
            <span>{{ item.flagEmoji }}</span>
            <span>{{ item.nameRu }}</span>
          </button>
        </div>
      </div>

      <!-- Main Interactive Section: 3D Globe (Left/Center) + Selected Country Panel (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col">
          <WorldGlobe
            :countries="countryStore.countries"
            :selectedCountry="countryStore.selectedGlobeCountry"
            @select-country="handlePolygonSelect"
          />
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
