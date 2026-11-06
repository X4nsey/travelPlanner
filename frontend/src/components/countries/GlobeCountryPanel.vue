<script setup lang="ts">
import { computed } from 'vue';
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
} from 'lucide-vue-next';
import type { CountryData } from '@/types';
import { useCountryStore } from '@/stores/country.store';
import SmartImage from '@/components/ui/SmartImage.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
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
</script>

<template>
  <aside
    class="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col justify-between h-full"
  >
    <template v-if="country">
      <div>
        <!-- Cover Image Header -->
        <SmartImage
          :src="country.coverPhoto?.url"
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
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-800 shadow-sm"
            >
              <Globe2 class="w-3.5 h-3.5 text-teal-600" />
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
            <img
              v-if="country.flagUrl"
              :src="country.flagUrl"
              :alt="country.nameRu"
              class="w-10 h-7 object-cover rounded-md shadow border border-white/30 shrink-0"
            />
            <span v-else class="text-3xl">{{ country.flagEmoji }}</span>

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
          <!-- Description -->
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ country.description }}
          </p>

          <!-- Key Characteristics Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-1.5 text-slate-400 mb-1">
                <Landmark class="w-3.5 h-3.5 text-teal-600" />
                <span>Столица</span>
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ country.capital }}</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-1.5 text-slate-400 mb-1">
                <Coins class="w-3.5 h-3.5 text-teal-600" />
                <span>Валюта</span>
              </div>
              <p class="font-bold text-slate-900 text-sm truncate" :title="country.currency">
                {{ country.currency }}
              </p>
            </div>

            <div v-if="formattedPopulation" class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-1.5 text-slate-400 mb-1">
                <Users class="w-3.5 h-3.5 text-teal-600" />
                <span>Население</span>
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ formattedPopulation }}</p>
            </div>

            <div v-if="formattedArea" class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-1.5 text-slate-400 mb-1">
                <Maximize2 class="w-3.5 h-3.5 text-teal-600" />
                <span>Площадь</span>
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ formattedArea }}</p>
            </div>

            <div class="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-1.5 text-slate-400 mb-1">
                <Languages class="w-3.5 h-3.5 text-teal-600" />
                <span>Официальные языки</span>
              </div>
              <p class="font-bold text-slate-900 text-sm">
                {{ country.languages.join(', ') }}
              </p>
            </div>
          </div>

          <!-- Popular Cities Chips -->
          <div v-if="country.popularCities && country.popularCities.length > 0">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Популярные города
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="city in country.popularCities"
                :key="city.name"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 text-teal-800 border border-teal-200/60 text-xs font-semibold"
              >
                <MapPin class="w-3 h-3 text-teal-600" />
                {{ city.name }}
              </span>
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
            <Compass class="w-4 h-4 text-teal-600" />
            <span>Посмотреть страну</span>
          </BaseButton>
        </template>
      </div>
    </template>

    <!-- Empty Placeholder if no country is selected -->
    <div v-else class="p-8 text-center my-auto">
      <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
        <Globe2 class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-1">Выберите страну на глобусе</h3>
      <p class="text-sm text-slate-500">
        Нажмите на любое государство на трёхмерной модели Земли, чтобы узнать подробности и спланировать маршрут.
      </p>
    </div>
  </aside>
</template>
