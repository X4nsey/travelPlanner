<script setup lang="ts">
import { Landmark, ArrowUpRight, Globe2 } from 'lucide-vue-next';
import type { CountryData } from '@/types';
import SmartImage from '@/components/ui/SmartImage.vue';
import CountryFlag from '@/components/ui/CountryFlag.vue';
import FavoriteButton from './FavoriteButton.vue';

interface Props {
  country: CountryData;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', country: CountryData): void;
  (e: 'auth-required'): void;
}>();
</script>

<template>
  <article
    @click="emit('select', country)"
    class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none hover:shadow-card hover:border-teal-300/90 dark:hover:border-teal-500/40 transition-[border-color,box-shadow] duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
  >
    <div>
      <!-- Country Cover Photo with consistent 16:10 aspect ratio -->
      <SmartImage
        :src="country.coverPhoto?.url"
        :thumbSrc="country.coverPhoto?.thumbUrl"
        size="md"
        :alt="country.nameRu"
        :fallbackTitle="country.nameRu"
        :fallbackFlag="country.flagEmoji"
        aspectClass="aspect-[16/10]"
        imgClass="object-cover group-hover:scale-105"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />

        <!-- Top Badges -->
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 text-xs font-semibold text-slate-800 dark:text-slate-100 border border-white/40 dark:border-slate-700/80 shadow-sm"
          >
            <Globe2 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            {{ country.continent }}
          </span>

          <FavoriteButton
            :country="country"
            size="md"
            @auth-required="emit('auth-required')"
          />
        </div>

        <!-- Bottom Overlay: Flag & Country Name -->
        <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
          <div class="flex items-center gap-2.5 min-w-0">
            <CountryFlag
              :code="country.isoAlpha2 || country.flagEmoji"
              :flagUrl="country.flagUrl"
              :name="country.nameRu"
              size="md"
              class="!w-7 !h-5 shadow-sm"
            />
            <div class="min-w-0">
              <h3 class="text-lg font-extrabold leading-tight truncate drop-shadow-sm">
                {{ country.nameRu }}
              </h3>
              <p class="text-[11px] text-white/80 truncate">
                {{ country.nameEn }}
              </p>
            </div>
          </div>
        </div>
      </SmartImage>

      <!-- Card Body -->
      <div class="p-5">
        <div class="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2.5">
          <Landmark class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Столица: {{ country.capital }}</span>
        </div>

        <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {{ country.shortDescription }}
        </p>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:bg-teal-50/50 dark:group-hover:bg-teal-500/10 transition-colors">
      <span>Подробнее о стране</span>
      <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </div>
  </article>
</template>
