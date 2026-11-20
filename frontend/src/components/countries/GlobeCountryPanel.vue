<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  Landmark,
  Globe2,
  Users,
  Maximize2,
  Languages,
  Coins,
  Compass,
  PlaneTakeoff,
  MapPin,
  CheckCircle2,
  Heart,
  BookOpen,
  Plane,
  ShieldAlert,
  ArrowRight,
} from 'lucide-vue-next';
import type { CountryData } from '@/types';
import { useCountryStore } from '@/stores/country.store';
import { useTripStore } from '@/stores/trip.store';
import { GLOBE_COLORS } from '@/constants/globe-colors';
import SmartImage from '@/components/ui/SmartImage.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import CountryFlag from '@/components/ui/CountryFlag.vue';
import FavoriteButton from './FavoriteButton.vue';

interface Props {
  country: CountryData | null;
  pickerMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pickerMode: false,
});

const emit = defineEmits<{
  (e: 'view-country', country: CountryData): void;
  (e: 'create-trip', country: CountryData): void;
  (e: 'pick-for-trip', country: CountryData): void;
  (e: 'auth-required'): void;
}>();

const countryStore = useCountryStore();
const tripStore = useTripStore();

const formattedPopulation = computed(() => {
  if (!props.country || !props.country.population) return null;
  return new Intl.NumberFormat('ru-RU').format(props.country.population) + ' чел.';
});

const formattedArea = computed(() => {
  if (!props.country || !props.country.area) return null;
  return new Intl.NumberFormat('ru-RU').format(props.country.area) + ' км²';
});

const hasDetailedPage = computed(() => {
  if (!props.country) return false;
  return countryStore.isInCatalog(props.country.slug);
});

const isFavoriteCountry = computed(() => {
  if (!props.country) return false;
  return countryStore.isFavorite(props.country.slug);
});

const countryPlannedTripsCount = computed(() => {
  if (!props.country) return 0;
  const nameRu = props.country.nameRu.toLowerCase();
  const nameEn = props.country.nameEn.toLowerCase();
  const slug = props.country.slug.toLowerCase();
  return tripStore.trips.filter((t) => {
    const tc = t.country.trim().toLowerCase();
    return tc === nameRu || tc === nameEn || tc === slug;
  }).length;
});
</script>

<template>
  <aside
    class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-none overflow-hidden flex flex-col justify-between h-full"
  >
    <template v-if="country">
      <div>
        <!-- Cover Image Header -->
        <SmartImage
          :src="country.coverPhoto?.url"
          :thumbSrc="country.coverPhoto?.thumbUrl"
          size="lg"
          :alt="country.nameRu"
          :fallbackTitle="country.nameRu"
          :fallbackFlag="country.flagEmoji"
          :authorName="country.coverPhoto?.authorName"
          :authorUrl="country.coverPhoto?.authorUrl"
          :sourceName="country.coverPhoto?.sourceName"
          :sourceUrl="country.coverPhoto?.sourceUrl"
          showAttribution
          aspectClass="aspect-[16/9]"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />

          <div class="absolute top-3.5 left-4 right-4 flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm text-xs font-semibold text-slate-800 dark:text-slate-100 border border-transparent dark:border-slate-700/80 shadow-sm"
            >
              <Globe2 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {{ country.continent }}
            </span>

            <FavoriteButton
              v-if="hasDetailedPage"
              :country="country"
              size="md"
              @auth-required="emit('auth-required')"
            />
          </div>

          <div class="absolute bottom-3.5 left-5 right-5 flex items-center gap-3 text-white">
            <CountryFlag
              :code="country.isoAlpha2 || country.flagEmoji"
              :flagUrl="country.flagUrl"
              :name="country.nameRu"
              size="lg"
              class="!w-10 !h-7 shadow"
            />

            <div class="min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold leading-tight truncate">
                {{ country.nameRu }}
              </h2>
              <p class="text-xs text-white/80 font-medium truncate">
                {{ country.nameEn }}
              </p>
            </div>
          </div>
        </SmartImage>

        <!-- Country Details Content -->
        <div class="p-5 sm:p-6 space-y-5">
          <!-- Status Badges matching Globe Color System -->
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-200 border border-orange-200/80 dark:border-orange-500/30"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ backgroundColor: GLOBE_COLORS.selected }"
              />
              <span>Выбрана на глобусе</span>
            </span>

            <span
              v-if="countryPlannedTripsCount > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-500/30"
            >
              <PlaneTakeoff class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Запланировано поездок: {{ countryPlannedTripsCount }}</span>
            </span>

            <span
              v-if="isFavoriteCountry"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30"
            >
              <Heart class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 shrink-0" />
              <span>В избранном</span>
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ country.description }}
          </p>

          <!-- Key Characteristics Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70">
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 mb-1">
                <Landmark class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Столица</span>
              </div>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">{{ country.capital }}</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70">
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 mb-1">
                <Coins class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Валюта</span>
              </div>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate" :title="country.currency">
                {{ country.currency }}
              </p>
            </div>

            <div v-if="formattedPopulation" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70">
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 mb-1">
                <Users class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Население</span>
              </div>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">{{ formattedPopulation }}</p>
            </div>

            <div v-if="formattedArea" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70">
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 mb-1">
                <Maximize2 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Площадь</span>
              </div>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">{{ formattedArea }}</p>
            </div>

            <div class="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70">
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 mb-1">
                <Languages class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Официальные языки</span>
              </div>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {{ country.languages.join(', ') }}
              </p>
            </div>
          </div>

          <!-- Popular Cities Chips -->
          <div v-if="country.popularCities && country.popularCities.length > 0">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
              Популярные города
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="city in country.popularCities"
                :key="city.name"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 dark:bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-200/60 dark:border-teal-500/30 text-xs font-semibold"
              >
                <MapPin class="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {{ city.name }}
              </span>
            </div>
          </div>

          <!-- Compact Travel Info Memo -->
          <div
            v-if="country.travelInfo"
            class="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-3"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <BookOpen class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Памятка путешественника</span>
              </div>

              <RouterLink
                v-if="hasDetailedPage"
                :to="`/countries/${country.slug}#country-travel-info`"
                :target="pickerMode ? '_blank' : undefined"
                :rel="pickerMode ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors shrink-0"
              >
                <span>Подробный разбор</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </RouterLink>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-start gap-2">
                <Plane class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span class="font-semibold text-slate-800 dark:text-slate-100">Правила въезда:</span>
                  {{ country.travelInfo.entryRules.summary }}
                </p>
              </div>

              <div class="flex items-start gap-2">
                <Coins class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span class="font-semibold text-slate-800 dark:text-slate-100">Оплата:</span>
                  {{ country.travelInfo.moneyAndPayments.summary }}
                </p>
              </div>

              <div class="flex items-start gap-2">
                <ShieldAlert class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span class="font-semibold text-slate-800 dark:text-slate-100">Безопасность:</span>
                  {{ country.travelInfo.safetyAndEmergency.summary }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="p-5 sm:p-6 pt-0 space-y-2.5">
        <template v-if="pickerMode">
          <BaseButton
            variant="primary"
            size="lg"
            fullWidth
            @click="emit('pick-for-trip', country)"
          >
            <CheckCircle2 class="w-5 h-5" />
            <span>Выбрать «{{ country.nameRu }}» для поездки</span>
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton
            variant="primary"
            size="lg"
            fullWidth
            @click="emit('create-trip', country)"
          >
            <PlaneTakeoff class="w-4 h-4" />
            <span>Создать поездку в эту страну</span>
          </BaseButton>

          <BaseButton
            v-if="hasDetailedPage"
            variant="outline"
            size="md"
            fullWidth
            @click="emit('view-country', country)"
          >
            <Compass class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Посмотреть страну</span>
          </BaseButton>
        </template>
      </div>
    </template>

    <!-- Empty Placeholder if no country is selected -->
    <div v-else class="p-8 text-center my-auto">
      <div class="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
        <Globe2 class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Выберите страну на глобусе</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Нажмите на любое государство на трёхмерной модели Земли, чтобы узнать подробности и спланировать маршрут.
      </p>
    </div>
  </aside>
</template>
