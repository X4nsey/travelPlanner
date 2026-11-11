<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import {
  Search,
  Globe2,
  ArrowUpDown,
  Compass,
  RefreshCw,
} from 'lucide-vue-next';
import { useCountryStore } from '@/stores/country.store';
import { useAuthStore } from '@/stores/auth.store';
import type { ContinentName, CountryData } from '@/types';
import AdaptiveLayout from '@/layouts/AdaptiveLayout.vue';
import CountryCard from '@/components/countries/CountryCard.vue';
import AuthPromptModal from '@/components/countries/AuthPromptModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const router = useRouter();
const countryStore = useCountryStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedContinent = ref<'all' | ContinentName>('all');
const sortOrder = ref<'asc' | 'desc'>('asc');
const authPromptOpen = ref(false);

const continents: { value: 'all' | ContinentName; label: string }[] = [
  { value: 'all', label: 'Все континенты' },
  { value: 'Европа', label: 'Европа' },
  { value: 'Азия', label: 'Азия' },
  { value: 'Африка', label: 'Африка' },
  { value: 'Северная Америка', label: 'Северная Америка' },
  { value: 'Южная Америка', label: 'Южная Америка' },
  { value: 'Океания', label: 'Океания' },
];

onMounted(() => {
  countryStore.ensureCountriesLoaded().catch(() => {});
  if (authStore.isAuthenticated) {
    countryStore.fetchFavorites().catch(() => {});
  }
});

const filteredAndSortedCountries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  const filtered = countryStore.countries.filter((c) => {
    if (selectedContinent.value !== 'all' && c.continent !== selectedContinent.value) {
      return false;
    }
    if (!q) return true;
    return (
      c.nameRu.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q) ||
      c.shortDescription.toLowerCase().includes(q)
    );
  });

  return [...filtered].sort((a, b) => {
    const cmp = a.nameRu.localeCompare(b.nameRu, 'ru');
    return sortOrder.value === 'desc' ? -cmp : cmp;
  });
});

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function resetFilters() {
  searchQuery.value = '';
  selectedContinent.value = 'all';
  sortOrder.value = 'asc';
}

function handleOpenCountry(country: CountryData) {
  router.push(`/countries/${country.slug}`);
}
</script>

<template>
  <AdaptiveLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Страны мира</h1>
          <p class="text-sm text-slate-500 mt-1">
            Каталог туристических направлений с фотографиями, столицами и ключевыми фактами
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <RouterLink to="/diagnostics/photos">
            <BaseButton variant="secondary" size="md">
              <span>Диагностика фото</span>
            </BaseButton>
          </RouterLink>
          <RouterLink to="/explore">
            <BaseButton variant="secondary" size="md">
              <Globe2 class="w-4 h-4 text-teal-600" />
              <span>Открыть 3D-глобус</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Search, Continent Filter & Alphabetical Sort Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-soft space-y-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию страны (на русском или английском) или столице..."
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="button"
            @click="toggleSortOrder"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors shrink-0"
          >
            <ArrowUpDown class="w-4 h-4 text-teal-600" />
            <span>По алфавиту: {{ sortOrder === 'asc' ? 'А → Я' : 'Я → А' }}</span>
          </button>
        </div>

        <!-- Continent Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            v-for="cont in continents"
            :key="cont.value"
            type="button"
            @click="selectedContinent = cont.value"
            :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all',
              selectedContinent === cont.value
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900',
            ]"
          >
            {{ cont.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <BaseSpinner
        v-if="countryStore.isLoadingCatalog && countryStore.countries.length === 0"
        label="Загружаем каталог стран..."
      />

      <!-- Error State -->
      <div v-else-if="countryStore.catalogError" class="space-y-4">
        <BaseAlert
          type="error"
          title="Не удалось загрузить каталог стран"
          :message="countryStore.catalogError"
        />
        <BaseButton variant="outline" @click="countryStore.ensureCountriesLoaded(true)">
          <RefreshCw class="w-4 h-4" />
          <span>Попробовать снова</span>
        </BaseButton>
      </div>

      <!-- Empty Search / Filter State -->
      <EmptyState
        v-else-if="filteredAndSortedCountries.length === 0"
        title="Страны не найдены"
        description="По вашему поисковому запросу или выбранному континенту ничего не найдено. Попробуйте изменить запрос или сбросить фильтры."
      >
        <template #icon>
          <Compass class="w-7 h-7" />
        </template>
        <template #action>
          <BaseButton variant="primary" @click="resetFilters">
            Сбросить поиск и фильтры
          </BaseButton>
        </template>
      </EmptyState>

      <!-- Countries Grid -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Найдено стран: <strong class="text-slate-800">{{ filteredAndSortedCountries.length }}</strong></span>
          <button
            v-if="searchQuery || selectedContinent !== 'all'"
            type="button"
            @click="resetFilters"
            class="text-teal-600 hover:underline font-medium"
          >
            Сбросить фильтры
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CountryCard
            v-for="country in filteredAndSortedCountries"
            :key="country.slug"
            :country="country"
            @select="handleOpenCountry"
            @auth-required="authPromptOpen = true"
          />
        </div>
      </div>
    </div>

    <AuthPromptModal
      :open="authPromptOpen"
      redirectPath="/countries"
      @close="authPromptOpen = false"
    />
  </AdaptiveLayout>
</template>
