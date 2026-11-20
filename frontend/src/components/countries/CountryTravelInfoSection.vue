<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  Coins,
  Compass,
  ExternalLink,
  Landmark,
  Languages,
  Lightbulb,
  MapPin,
  Plane,
  ShieldAlert,
  TrainFront,
  Wifi,
} from 'lucide-vue-next';
import type {
  CountryData,
  CountryTravelInfo,
  SharedCountryInfo,
  TravelInfoSection,
} from '@/types';
import CountryFlag from '@/components/ui/CountryFlag.vue';

interface Props {
  country: CountryData | SharedCountryInfo;
  travelInfo: CountryTravelInfo;
  tripCity?: string;
  showCountryLink?: boolean;
  showQuickFacts?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCountryLink: true,
  showQuickFacts: true,
});

type TravelSectionKey = keyof CountryTravelInfo;

interface SectionConfig {
  key: TravelSectionKey;
  title: string;
  subtitle: string;
  icon: Component;
  iconBgClass: string;
  iconColorClass: string;
  badgeClass: string;
  summaryBgClass: string;
  dotClass: string;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: 'entryRules',
    title: 'Правила въезда и визы',
    subtitle: 'Паспорт, визовый режим, декларации',
    icon: Plane,
    iconBgClass: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/15 dark:border-indigo-500/30',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    summaryBgClass: 'bg-indigo-50/50 border-indigo-100 text-slate-800 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-slate-200',
    dotClass: 'bg-indigo-500 dark:bg-indigo-400',
  },
  {
    key: 'moneyAndPayments',
    title: 'Валюта и оплата',
    subtitle: 'Карты, наличные, обмен, чаевые',
    icon: Coins,
    iconBgClass: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/30',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    summaryBgClass: 'bg-emerald-50/50 border-emerald-100 text-slate-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-slate-200',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  {
    key: 'transport',
    title: 'Транспорт',
    subtitle: 'Общественный транспорт, такси, аренда авто',
    icon: TrainFront,
    iconBgClass: 'bg-teal-50 border-teal-100 dark:bg-teal-500/15 dark:border-teal-500/30',
    iconColorClass: 'text-teal-600 dark:text-teal-400',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/70 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
    summaryBgClass: 'bg-teal-50/50 border-teal-100 text-slate-800 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-slate-200',
    dotClass: 'bg-teal-500 dark:bg-teal-400',
  },
  {
    key: 'cultureAndEtiquette',
    title: 'Культура и этикет',
    subtitle: 'Обычаи, дресс-код, правила поведения',
    icon: Landmark,
    iconBgClass: 'bg-amber-50 border-amber-100 dark:bg-amber-500/15 dark:border-amber-500/30',
    iconColorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    summaryBgClass: 'bg-amber-50/50 border-amber-100 text-slate-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-slate-200',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
  },
  {
    key: 'telecomAndInternet',
    title: 'Связь и интернет',
    subtitle: 'SIM-карты, eSIM, мобильный трафик, Wi-Fi',
    icon: Wifi,
    iconBgClass: 'bg-sky-50 border-sky-100 dark:bg-sky-500/15 dark:border-sky-500/30',
    iconColorClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
    summaryBgClass: 'bg-sky-50/50 border-sky-100 text-slate-800 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-slate-200',
    dotClass: 'bg-sky-500 dark:bg-sky-400',
  },
  {
    key: 'safetyAndEmergency',
    title: 'Безопасность и экстренные службы',
    subtitle: 'Экстренные номера, медицина, предосторожность',
    icon: ShieldAlert,
    iconBgClass: 'bg-rose-50 border-rose-100 dark:bg-rose-500/15 dark:border-rose-500/30',
    iconColorClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    summaryBgClass: 'bg-rose-50/50 border-rose-100 text-slate-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-slate-200',
    dotClass: 'bg-rose-500 dark:bg-rose-400',
  },
  {
    key: 'practicalTips',
    title: 'Практические советы',
    subtitle: 'Розетки, напряжение, вода, режим работы',
    icon: Lightbulb,
    iconBgClass: 'bg-violet-50 border-violet-100 dark:bg-violet-500/15 dark:border-violet-500/30',
    iconColorClass: 'text-violet-600 dark:text-violet-400',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/70 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
    summaryBgClass: 'bg-violet-50/50 border-violet-100 text-slate-800 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-slate-200',
    dotClass: 'bg-violet-500 dark:bg-violet-400',
  },
];

const expandedKeys = ref<Set<TravelSectionKey>>(
  new Set(SECTION_CONFIGS.map((s) => s.key))
);

const allExpanded = computed(
  () => expandedKeys.value.size === SECTION_CONFIGS.length
);

const resolvedSections = computed(() =>
  SECTION_CONFIGS.map((cfg) => ({
    config: cfg,
    data: props.travelInfo[cfg.key] as TravelInfoSection,
  })).filter((item) => Boolean(item.data))
);

function isExpanded(key: TravelSectionKey): boolean {
  return expandedKeys.value.has(key);
}

function toggleSection(key: TravelSectionKey) {
  const next = new Set(expandedKeys.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  expandedKeys.value = next;
}

function toggleAll() {
  if (allExpanded.value) {
    expandedKeys.value = new Set();
  } else {
    expandedKeys.value = new Set(SECTION_CONFIGS.map((s) => s.key));
  }
}

function focusSection(key: TravelSectionKey) {
  if (!expandedKeys.value.has(key)) {
    const next = new Set(expandedKeys.value);
    next.add(key);
    expandedKeys.value = next;
  }
  const el = document.getElementById(`travel-info-section-${key}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function formatLastUpdated(value?: string): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const date = new Date(Date.UTC(year, monthIdx, 1));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Hero Country Summary Card -->
    <section
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-7 space-y-5"
    >
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-start gap-4 min-w-0">
          <CountryFlag
            :code="'isoAlpha2' in country ? country.isoAlpha2 || country.flagEmoji : country.flagEmoji"
            :flagUrl="country.flagUrl"
            :name="country.nameRu"
            size="lg"
            class="!w-14 !h-10 !rounded-xl shadow-sm"
          />

          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-500/30"
              >
                <BookOpen class="w-3.5 h-3.5" />
                <span>Памятка путешественника</span>
              </span>

              <span
                v-if="tripCity"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
              >
                <MapPin class="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{{ tripCity }}</span>
              </span>
            </div>

            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {{ country.nameRu }}
              <span class="text-base font-semibold text-slate-400 dark:text-slate-500 ml-1">
                ({{ country.nameEn }})
              </span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {{ country.shortDescription }}
            </p>
          </div>
        </div>

        <RouterLink
          v-if="showCountryLink"
          :to="`/countries/${country.slug}`"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 text-white text-sm font-bold shadow-sm transition-colors shrink-0"
        >
          <Compass class="w-4 h-4" />
          <span>Полный путеводитель по стране</span>
          <ArrowRight class="w-4 h-4" />
        </RouterLink>
      </div>

      <!-- Quick Country Facts -->
      <div
        v-if="showQuickFacts"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800"
      >
        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Landmark class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Столица</p>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ country.capital }}</p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Валюта</p>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ country.currency }}</p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Languages class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Языки</p>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {{ country.languages.join(', ') }}
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Часовой пояс</p>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {{ country.timezone || 'По региону' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Controls & Quick Jump Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in resolvedSections"
          :key="item.config.key"
          type="button"
          @click="focusSection(item.config.key)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-500/40 transition-colors shadow-sm dark:shadow-none"
        >
          <component
            :is="item.config.icon"
            class="w-3.5 h-3.5"
            :class="item.config.iconColorClass"
          />
          <span>{{ item.config.title }}</span>
        </button>
      </div>

      <button
        type="button"
        @click="toggleAll"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0 self-start sm:self-auto shadow-sm dark:shadow-none"
      >
        <ChevronsDownUp v-if="allExpanded" class="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <ChevronsUpDown v-else class="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span>{{ allExpanded ? 'Свернуть все' : 'Развернуть все' }}</span>
      </button>
    </div>

    <!-- 7 Travel Info Sections -->
    <div class="grid grid-cols-1 gap-4">
      <article
        v-for="{ config, data } in resolvedSections"
        :id="`travel-info-section-${config.key}`"
        :key="config.key"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none overflow-hidden transition-colors"
      >
        <!-- Accordion Header -->
        <button
          type="button"
          :aria-expanded="isExpanded(config.key)"
          @click="toggleSection(config.key)"
          class="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div
              class="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
              :class="[config.iconBgClass, config.iconColorClass]"
            >
              <component :is="config.icon" class="w-5 h-5" />
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {{ config.title }}
                </h3>
                <span
                  v-if="data.lastUpdated"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                  :class="config.badgeClass"
                >
                  <CalendarClock class="w-3 h-3" />
                  <span>Актуально: {{ formatLastUpdated(data.lastUpdated) }}</span>
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {{ config.subtitle }}
              </p>
            </div>
          </div>

          <ChevronDown
            class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180 text-slate-700 dark:text-slate-200': isExpanded(config.key) }"
          />
        </button>

        <!-- Accordion Content -->
        <div
          v-show="isExpanded(config.key)"
          class="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4"
        >
          <!-- Summary Callout -->
          <div
            class="mt-3 p-4 rounded-xl border text-sm font-medium leading-relaxed"
            :class="config.summaryBgClass"
          >
            {{ data.summary }}
          </div>

          <!-- Details Bullet List -->
          <ul v-if="data.details && data.details.length > 0" class="space-y-2.5">
            <li
              v-for="(detail, idx) in data.details"
              :key="idx"
              class="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0 mt-2"
                :class="config.dotClass"
                aria-hidden="true"
              />
              <span>{{ detail }}</span>
            </li>
          </ul>

          <!-- Official Links -->
          <div
            v-if="data.officialLinks && data.officialLinks.length > 0"
            class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5"
          >
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Полезные ссылки:
            </span>
            <a
              v-for="link in data.officialLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-500/15 border border-slate-200/80 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500/40 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              <span>{{ link.title }}</span>
              <ExternalLink class="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
