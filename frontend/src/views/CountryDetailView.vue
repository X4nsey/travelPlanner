<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  ArrowLeft,
  Landmark,
  Globe2,
  Users,
  Maximize2,
  Coins,
  Languages,
  Clock,
  PlaneTakeoff,
  Camera,
  MapPin,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-vue-next';
import { useCountryStore } from '@/stores/country.store';
import { useAuthStore } from '@/stores/auth.store';
import type { CountryData, CountryPhoto } from '@/types';
import AdaptiveLayout from '@/layouts/AdaptiveLayout.vue';
import SmartImage from '@/components/ui/SmartImage.vue';
import FavoriteButton from '@/components/countries/FavoriteButton.vue';
import AuthPromptModal from '@/components/countries/AuthPromptModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const route = useRoute();
const router = useRouter();
const countryStore = useCountryStore();
const authStore = useAuthStore();

const country = ref<CountryData | null>(null);
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const authPromptOpen = ref(false);
const authRedirectTarget = ref('');

// Lightbox state for photo gallery
const lightboxIndex = ref<number | null>(null);

const slug = computed(() => String(route.params.slug || ''));

async function loadCountry() {
  if (!slug.value) return;
  isLoading.value = true;
  loadError.value = null;

  try {
    await countryStore.ensureCountriesLoaded();
    if (authStore.isAuthenticated) {
      countryStore.fetchFavorites().catch(() => {});
    }
    const detail = await countryStore.fetchCountryDetail(slug.value);
    country.value = detail;
    document.title = `${detail.nameRu} — Путеводитель TravelPlanner`;
  } catch (err: any) {
    loadError.value = err?.message || 'Страна не найдена';
  } finally {
    isLoading.value = false;
  }
}

watch(slug, () => {
  loadCountry();
});

onMounted(() => {
  loadCountry();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const formattedPopulation = computed(() => {
  if (!country.value?.population) return null;
  return new Intl.NumberFormat('ru-RU').format(country.value.population) + ' чел.';
});

const formattedArea = computed(() => {
  if (!country.value?.area) return null;
  return new Intl.NumberFormat('ru-RU').format(country.value.area) + ' км²';
});

const galleryPhotos = computed<CountryPhoto[]>(() => {
  if (!country.value) return [];
  const list = country.value.gallery || [];
  if (list.length > 0) return list;
  return country.value.coverPhoto ? [country.value.coverPhoto] : [];
});

const activeLightboxPhoto = computed<CountryPhoto | null>(() => {
  if (lightboxIndex.value === null) return null;
  return galleryPhotos.value[lightboxIndex.value] || null;
});

function openLightbox(idx: number) {
  lightboxIndex.value = idx;
}

function closeLightbox() {
  lightboxIndex.value = null;
}

function prevLightboxPhoto() {
  if (lightboxIndex.value === null || galleryPhotos.value.length === 0) return;
  lightboxIndex.value =
    (lightboxIndex.value - 1 + galleryPhotos.value.length) % galleryPhotos.value.length;
}

function nextLightboxPhoto() {
  if (lightboxIndex.value === null || galleryPhotos.value.length === 0) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % galleryPhotos.value.length;
}

function handleKeydown(event: KeyboardEvent) {
  if (lightboxIndex.value === null) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') prevLightboxPhoto();
  if (event.key === 'ArrowRight') nextLightboxPhoto();
}

function handleCreateTrip(cityName?: string) {
  if (!country.value) return;

  const queryParams: Record<string, string> = {
    country: country.value.nameRu,
    currency: country.value.defaultTripCurrency,
  };
  if (cityName) {
    queryParams.city = cityName;
  }

  if (!authStore.isAuthenticated) {
    const search = new URLSearchParams(queryParams).toString();
    authRedirectTarget.value = `/trips/new?${search}`;
    authPromptOpen.value = true;
    return;
  }

  router.push({
    path: '/trips/new',
    query: queryParams,
  });
}

function handleShowOnGlobe() {
  if (!country.value) return;
  countryStore.selectedGlobeCountry = country.value;
  router.push({
    path: '/explore',
    query: { country: country.value.slug },
  });
}

function openAuthPromptForFavorite() {
  authRedirectTarget.value = route.fullPath;
  authPromptOpen.value = true;
}
</script>

<template>
  <AdaptiveLayout>
    <!-- Loading State -->
    <BaseSpinner
      v-if="isLoading"
      label="Загружаем путеводитель по стране..."
    />

    <!-- Error State -->
    <div v-else-if="loadError || !country" class="max-w-xl mx-auto py-8 space-y-4">
      <BaseAlert
        type="error"
        title="Страна не найдена"
        :message="loadError || 'Не удалось загрузить информацию о выбранной стране'"
      />
      <div class="flex items-center gap-3">
        <BaseButton variant="outline" @click="router.push('/countries')">
          <ArrowLeft class="w-4 h-4" />
          <span>К каталогу стран</span>
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/explore')">
          <Globe2 class="w-4 h-4" />
          <span>Открыть 3D-глобус</span>
        </BaseButton>
      </div>
    </div>

    <!-- Country Detail Content -->
    <div v-else class="space-y-10 animate-fade-in">
      <!-- Top Back Navigation -->
      <div class="flex items-center justify-between gap-4">
        <RouterLink
          to="/countries"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Все страны мира</span>
        </RouterLink>

        <button
          type="button"
          @click="handleShowOnGlobe"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <Globe2 class="w-4 h-4" />
          <span>Показать на 3D-глобусе</span>
        </button>
      </div>

      <!-- 1. HERO COVER SECTION -->
      <section class="relative rounded-3xl overflow-hidden shadow-card border border-slate-200/80 bg-slate-900">
        <SmartImage
          :src="country.coverPhoto?.url"
          :thumbSrc="country.coverPhoto?.thumbUrl"
          size="hero"
          :alt="country.nameRu"
          :fallbackTitle="country.nameRu"
          :fallbackFlag="country.flagEmoji"
          :authorName="country.coverPhoto?.authorName"
          :authorUrl="country.coverPhoto?.authorUrl"
          :sourceName="country.coverPhoto?.sourceName"
          :sourceUrl="country.coverPhoto?.sourceUrl"
          showAttribution
          eager
          aspectClass="h-[360px] sm:h-[440px] lg:h-[480px] w-full"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/15" />

          <div class="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <!-- Top Row: Continent Badge & Favorite Button -->
            <div class="flex items-center justify-between gap-3">
              <span
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow"
              >
                <Globe2 class="w-3.5 h-3.5 text-teal-600" />
                <span>{{ country.continent }}</span>
              </span>

              <FavoriteButton
                :country="country"
                showLabel
                @auth-required="openAuthPromptForFavorite"
              />
            </div>

            <!-- Bottom Row: Country Flag, Name, Description & CTA -->
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div class="space-y-3 max-w-3xl text-white">
                <div class="flex items-center gap-3.5">
                  <img
                    v-if="country.flagUrl"
                    :src="country.flagUrl"
                    :alt="country.nameRu"
                    class="w-12 h-8 sm:w-14 sm:h-10 object-cover rounded-lg shadow-md border border-white/30 shrink-0"
                  />
                  <span v-else class="text-4xl">{{ country.flagEmoji }}</span>

                  <div>
                    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                      {{ country.nameRu }}
                    </h1>
                    <p class="text-sm sm:text-base text-teal-200/90 font-medium">
                      {{ country.nameEn }} • Столица: {{ country.capital }}
                    </p>
                  </div>
                </div>

                <p class="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {{ country.description }}
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3 shrink-0">
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="!px-6 !py-3.5 shadow-lg"
                  @click="handleCreateTrip()"
                >
                  <PlaneTakeoff class="w-5 h-5" />
                  <span>Создать поездку</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </SmartImage>
      </section>

      <!-- 2. MAIN CHARACTERISTICS BLOCK -->
      <section class="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <h2 class="text-xl font-bold text-slate-900 mb-5">
          Основная информация о стране
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Landmark class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Столица</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ country.capital }}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Globe2 class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Континент</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ country.continent }}</p>
            </div>
          </div>

          <div v-if="formattedPopulation" class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Население</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ formattedPopulation }}</p>
            </div>
          </div>

          <div v-if="formattedArea" class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Maximize2 class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Площадь территории</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ formattedArea }}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coins class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Национальная валюта</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ country.currency }}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Languages class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Официальные языки</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">
                {{ country.languages.join(', ') }}
              </p>
            </div>
          </div>

          <div
            v-if="country.timezone"
            class="sm:col-span-2 p-4 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-3.5"
          >
            <div class="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Часовой пояс</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">{{ country.timezone }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. PHOTO GALLERY -->
      <section v-if="galleryPhotos.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 mb-1">
              <Camera class="w-3.5 h-3.5" />
              <span>Атмосфера путешествия</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Фотогалерея страны</h2>
          </div>
          <span class="text-xs text-slate-400 hidden sm:inline">
            Нажмите на любую фотографию для увеличения
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="(photo, idx) in galleryPhotos"
            :key="idx"
            @click="openLightbox(idx)"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card transition-all cursor-pointer flex flex-col"
          >
            <SmartImage
              :src="photo.url"
              :thumbSrc="photo.thumbUrl"
              size="md"
              :alt="photo.alt"
              :fallbackTitle="photo.alt"
              :fallbackFlag="country.flagEmoji"
              aspectClass="aspect-[4/3]"
              imgClass="object-cover group-hover:scale-105"
            >
              <div
                v-if="photo.url"
                class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
              />

              <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span
                  v-if="photo.category"
                  class="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-slate-800 shadow-sm"
                >
                  {{ photo.category }}
                </span>
                <span
                  v-if="photo.url"
                  class="w-8 h-8 rounded-xl bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn class="w-4 h-4" />
                </span>
              </div>

              <div v-if="photo.url" class="absolute bottom-3 left-3.5 right-3.5 text-white pointer-events-none">
                <p class="text-xs font-semibold line-clamp-1">{{ photo.alt }}</p>
                <p class="text-[10px] text-white/75 mt-0.5 truncate">
                  Фото: {{ photo.authorName }} ({{ photo.sourceName }})
                </p>
              </div>
            </SmartImage>
          </div>
        </div>
      </section>

      <!-- 4. POPULAR CITIES -->
      <section v-if="country.popularCities && country.popularCities.length > 0" class="space-y-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Популярные города</h2>
          <p class="text-sm text-slate-500">
            Лучшие города и курорты направления «{{ country.nameRu }}» для включения в ваш маршрут
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="city in country.popularCities"
            :key="city.name"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-card transition-all"
          >
            <div>
              <SmartImage
                :src="city.photoUrl"
                :thumbSrc="city.thumbUrl || city.photoUrl"
                size="md"
                :alt="`${city.name} — ${country.nameRu}`"
                :fallbackTitle="city.name"
                :fallbackFlag="country.flagEmoji"
                aspectClass="aspect-[16/10]"
                :authorName="city.authorName"
                :authorUrl="city.authorUrl"
                :sourceName="city.sourceName"
                :sourceUrl="city.sourceUrl"
                :license="city.license"
                showAttribution
              />

              <div class="p-5">
                <div class="flex items-center gap-2 mb-2">
                  <MapPin class="w-4 h-4 text-teal-600 shrink-0" />
                  <h3 class="text-lg font-extrabold text-slate-900 truncate">{{ city.name }}</h3>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">
                  {{ city.description }}
                </p>
              </div>
            </div>

            <div class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                @click="handleCreateTrip(city.name)"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
              >
                <PlaneTakeoff class="w-3.5 h-3.5" />
                <span>Запланировать поездку в г. {{ city.name }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- 5. LANDMARKS (ЧТО ПОСЕТИТЬ) -->
      <section v-if="country.landmarks && country.landmarks.length > 0" class="space-y-4">
        <div>
          <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 mb-1">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Что посетить</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Что посетить — известные достопримечательности</h2>
          <p class="text-sm text-slate-500">
            Проверенные знаковые места и памятники природы и архитектуры в стране «{{ country.nameRu }}»
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="lm in country.landmarks"
            :key="lm.name"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col justify-between hover:border-teal-200 hover:shadow-card transition-all"
          >
            <div>
              <SmartImage
                :src="lm.photoUrl"
                :thumbSrc="lm.thumbUrl || lm.photoUrl"
                size="md"
                :alt="`${lm.name} (${lm.city}, ${country.nameRu})`"
                :fallbackTitle="lm.name"
                :fallbackFlag="country.flagEmoji"
                aspectClass="aspect-[16/10]"
                :authorName="lm.authorName"
                :authorUrl="lm.authorUrl"
                :sourceName="lm.sourceName"
                :sourceUrl="lm.sourceUrl"
                :license="lm.license"
                showAttribution
              />

              <div class="p-5">
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 text-xs font-semibold">
                    {{ lm.category }}
                  </span>
                  <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span class="truncate max-w-[150px]">{{ lm.city }}</span>
                  </span>
                </div>

                <h3 class="text-base font-extrabold text-slate-900 mb-2">
                  {{ lm.name }}
                </h3>

                <p class="text-sm text-slate-600 leading-relaxed">
                  {{ lm.description }}
                </p>
              </div>
            </div>

            <div class="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="truncate">
                {{ country.nameRu }} • {{ lm.city }}
              </span>
              <button
                type="button"
                @click="handleCreateTrip(lm.city)"
                class="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 transition-colors shrink-0"
              >
                <PlaneTakeoff class="w-3.5 h-3.5" />
                <span>В маршрут</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Bottom CTA Banner -->
      <section
        class="rounded-3xl bg-gradient-to-r from-teal-600 to-sky-600 p-6 sm:p-10 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div class="space-y-1.5 max-w-xl">
          <h3 class="text-xl sm:text-2xl font-extrabold">
            Готовы отправиться в путешествие по направлению «{{ country.nameRu }}»?
          </h3>
          <p class="text-sm text-teal-50">
            Создайте маршрут, укажите бюджет и распределите посещение городов и достопримечательностей по календарным дням.
          </p>
        </div>

        <BaseButton
          variant="secondary"
          size="lg"
          class="!bg-white !text-teal-800 hover:!bg-teal-50 !border-0 font-bold shrink-0"
          @click="handleCreateTrip()"
        >
          <PlaneTakeoff class="w-5 h-5 text-teal-600" />
          <span>Создать поездку</span>
        </BaseButton>
      </section>
    </div>

    <!-- LIGHTBOX MODAL FOR ENLARGED GALLERY PHOTOS -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="activeLightboxPhoto"
          class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          @click.self="closeLightbox"
        >
          <!-- Top Bar -->
          <div class="w-full max-w-5xl flex items-center justify-between text-white mb-4">
            <div class="flex items-center gap-2.5">
              <span
                v-if="activeLightboxPhoto.category"
                class="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-semibold"
              >
                {{ activeLightboxPhoto.category }}
              </span>
              <span class="text-sm font-semibold truncate">
                {{ activeLightboxPhoto.alt }}
              </span>
            </div>

            <button
              type="button"
              @click="closeLightbox"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Закрыть просмотр"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Main Enlarged Image + Prev/Next Controls -->
          <div class="relative w-full max-w-5xl flex items-center justify-center">
            <button
              v-if="galleryPhotos.length > 1"
              type="button"
              @click.stop="prevLightboxPhoto"
              class="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white border border-white/20 transition-colors"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>

            <img
              :src="activeLightboxPhoto.url"
              :alt="activeLightboxPhoto.alt"
              decoding="async"
              class="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/15"
            />

            <button
              v-if="galleryPhotos.length > 1"
              type="button"
              @click.stop="nextLightboxPhoto"
              class="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white border border-white/20 transition-colors"
              aria-label="Следующее фото"
            >
              <ChevronRight class="w-6 h-6" />
            </button>
          </div>

          <!-- Attribution Footer -->
          <div class="mt-4 text-xs text-slate-300 text-center">
            Фотограф:
            <a
              :href="activeLightboxPhoto.authorUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-teal-300 font-medium"
            >
              {{ activeLightboxPhoto.authorName }}
            </a>
            • Источник:
            <a
              :href="activeLightboxPhoto.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-teal-300 font-medium"
            >
              {{ activeLightboxPhoto.sourceName }}
            </a>
          </div>
        </div>
      </Transition>
    </Teleport>

    <AuthPromptModal
      :open="authPromptOpen"
      :redirectPath="authRedirectTarget"
      @close="authPromptOpen = false"
    />
  </AdaptiveLayout>
</template>
