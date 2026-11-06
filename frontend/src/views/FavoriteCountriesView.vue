<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { Heart, Globe2, BookOpen } from 'lucide-vue-next';
import { useCountryStore } from '@/stores/country.store';
import type { CountryData } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import CountryCard from '@/components/countries/CountryCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const router = useRouter();
const countryStore = useCountryStore();

onMounted(async () => {
  await countryStore.ensureCountriesLoaded().catch(() => {});
  await countryStore.fetchFavorites(true).catch(() => {});
});

function handleOpenCountry(country: CountryData) {
  router.push(`/countries/${country.slug}`);
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Избранные страны
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Ваша личная коллекция направлений, сохранённых для будущих путешествий
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <RouterLink to="/explore">
            <BaseButton variant="secondary" size="sm">
              <Globe2 class="w-4 h-4 text-teal-600" />
              <span>3D-глобус</span>
            </BaseButton>
          </RouterLink>
          <RouterLink to="/countries">
            <BaseButton variant="outline" size="sm">
              <BookOpen class="w-4 h-4 text-teal-600" />
              <span>Каталог стран</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Loading State -->
      <BaseSpinner
        v-if="countryStore.isLoadingFavorites && countryStore.favoriteCountries.length === 0"
        label="Загружаем ваши избранные страны..."
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="countryStore.favoriteCountries.length === 0"
        title="В избранном пока нет стран"
        description="Нажмите на иконку сердечка на карточке любой страны в каталоге или на странице 3D-глобуса, чтобы сохранить направление в свой список желаний."
      >
        <template #icon>
          <Heart class="w-7 h-7 text-rose-500" />
        </template>
        <template #action>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <RouterLink to="/explore">
              <BaseButton variant="primary" size="md">
                <Globe2 class="w-4 h-4" />
                <span>Исследовать мир на 3D-глобусе</span>
              </BaseButton>
            </RouterLink>
            <RouterLink to="/countries">
              <BaseButton variant="outline" size="md">
                <BookOpen class="w-4 h-4" />
                <span>Открыть каталог стран</span>
              </BaseButton>
            </RouterLink>
          </div>
        </template>
      </EmptyState>

      <!-- Favorites Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <CountryCard
          v-for="country in countryStore.favoriteCountries"
          :key="country.slug"
          :country="country"
          @select="handleOpenCountry"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
