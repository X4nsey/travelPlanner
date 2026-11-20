<script setup lang="ts">
import type { Component } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Globe2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { vReveal } from '@/directives/vReveal';
import PublicLayout from '@/layouts/PublicLayout.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import DestinationsSlider from '@/components/home/DestinationsSlider.vue';

const authStore = useAuthStore();

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: Component;
  iconWrapClass: string;
  hoverBorderClass: string;
  actionLabel?: string;
  actionTo?: string;
}

const featureCards: FeatureCard[] = [
  {
    id: 'globe-atlas',
    title: '3D-глобус и гид по странам',
    description:
      'Выбирайте направление на интерактивном глобусе: проверенные фото, климат, визовые правила, транспорт и связь.',
    icon: Globe2,
    iconWrapClass:
      'bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200/70 dark:border-teal-500/30',
    hoverBorderClass: 'hover:border-teal-300/80 dark:hover:border-teal-500/40',
    actionLabel: 'Открыть глобус',
    actionTo: '/explore',
  },
  {
    id: 'plan-weather-packing',
    title: 'План по дням, погода и список вещей',
    description:
      'Расписание по часам, прогноз погоды на даты поездки и умный чек-лист вещей под климат и формат отдыха.',
    icon: CalendarDays,
    iconWrapClass:
      'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-200/70 dark:border-sky-500/30',
    hoverBorderClass: 'hover:border-sky-300/80 dark:hover:border-sky-500/40',
  },
  {
    id: 'budget-offline',
    title: 'Бюджет в разных валютах и офлайн-гид',
    description:
      'Автоматический пересчёт расходов в рублях, долларах и евро и выгрузка маршрута в PDF или HTML для работы без интернета.',
    icon: Wallet,
    iconWrapClass:
      'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-500/30',
    hoverBorderClass: 'hover:border-amber-300/80 dark:hover:border-amber-500/40',
  },
  {
    id: 'privacy-sharing',
    title: 'Приватность и доступ для попутчиков',
    description:
      'Ваши билеты и брони остаются только на вашем устройстве, а планом и списком вещей можно поделиться с друзьями по одной ссылке.',
    icon: ShieldCheck,
    iconWrapClass:
      'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/30',
    hoverBorderClass: 'hover:border-emerald-300/80 dark:hover:border-emerald-500/40',
  },
];
</script>

<template>
  <PublicLayout>
    <!-- Unified Full-Page Atmospheric Surface -->
    <div class="home-page-surface relative overflow-hidden flex-1 transition-colors duration-200">
      <!-- Lightweight Static Vector Travel Map (Meridians, Flight Arcs & City Nodes) -->
      <div
        class="pointer-events-none select-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          class="home-map-graticule absolute inset-0 w-full h-full"
          viewBox="0 0 1440 2200"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Subtle Meridians & Parallels -->
          <g class="home-map-grid-lines" stroke-width="1">
            <!-- Curved Meridians -->
            <path d="M 135 0 Q 55 1100 155 2200" />
            <path d="M 335 0 Q 250 1100 355 2200" />
            <path d="M 575 0 Q 525 1100 585 2200" />
            <path d="M 865 0 Q 915 1100 855 2200" />
            <path d="M 1105 0 Q 1190 1100 1085 2200" />
            <path d="M 1305 0 Q 1385 1100 1285 2200" />

            <!-- Curved Parallels -->
            <path d="M 0 190 Q 720 125 1440 190" />
            <path d="M 0 490 Q 720 435 1440 490" />
            <path d="M 0 820 Q 720 780 1440 820" />
            <path d="M 0 1160 Q 720 1140 1440 1160" />
            <path d="M 0 1500 Q 720 1535 1440 1500" />
            <path d="M 0 1840 Q 720 1895 1440 1840" />
            <path d="M 0 2100 Q 720 2160 1440 2100" />

            <!-- Delicate Orbital Edge Arcs -->
            <circle cx="-40" cy="240" r="300" stroke-dasharray="3 8" />
            <circle cx="1480" cy="280" r="320" stroke-dasharray="3 8" />
          </g>

          <!-- Dashed Flight Route Arcs -->
          <g stroke-width="1.35" stroke-linecap="round" stroke-dasharray="5 7">
            <!-- 1. Hero Left Route -->
            <path class="home-map-route-primary" d="M 86 355 Q 132 165 286 112" />
            <path class="home-map-route-secondary" d="M 286 112 Q 338 245 178 465" />

            <!-- 2. Hero Right Route -->
            <path class="home-map-route-secondary" d="M 1152 118 Q 1308 175 1354 360" />
            <path class="home-map-route-primary" d="M 1354 360 Q 1265 495 1332 650" />

            <!-- 3. Slider-to-Features Left Route -->
            <path class="home-map-route-primary" d="M 110 700 Q 42 990 146 1275" />
            <path class="home-map-route-secondary" d="M 146 1275 Q 235 1410 92 1620" />

            <!-- 4. Features-to-CTA Right Route -->
            <path class="home-map-route-primary" d="M 1332 1210 Q 1396 1485 1286 1745" />
            <path class="home-map-route-secondary" d="M 1286 1745 Q 1210 1885 1344 2020" />
          </g>

          <!-- City Route Waypoint Nodes -->
          <g>
            <!-- Hero Left Nodes -->
            <circle cx="86" cy="355" r="8" class="home-map-node-ring" stroke-width="1" />
            <circle cx="86" cy="355" r="3.2" class="home-map-node-fill" />

            <circle cx="286" cy="112" r="9" class="home-map-node-ring" stroke-width="1" />
            <circle cx="286" cy="112" r="3.5" class="home-map-node-fill" />

            <circle cx="178" cy="465" r="7" class="home-map-node-ring-sky" stroke-width="1" />
            <circle cx="178" cy="465" r="2.8" class="home-map-node-fill-sky" />

            <!-- Hero Right Nodes -->
            <circle cx="1152" cy="118" r="9" class="home-map-node-ring-sky" stroke-width="1" />
            <circle cx="1152" cy="118" r="3.5" class="home-map-node-fill-sky" />

            <circle cx="1354" cy="360" r="8" class="home-map-node-ring" stroke-width="1" />
            <circle cx="1354" cy="360" r="3.2" class="home-map-node-fill" />

            <circle cx="1332" cy="650" r="7" class="home-map-node-ring" stroke-width="1" />
            <circle cx="1332" cy="650" r="2.8" class="home-map-node-fill" />

            <!-- Mid & Lower Flank Nodes -->
            <circle cx="110" cy="700" r="7.5" class="home-map-node-ring" stroke-width="1" />
            <circle cx="110" cy="700" r="3" class="home-map-node-fill" />

            <circle cx="146" cy="1275" r="8.5" class="home-map-node-ring" stroke-width="1" />
            <circle cx="146" cy="1275" r="3.2" class="home-map-node-fill" />

            <circle cx="92" cy="1620" r="7" class="home-map-node-ring-sky" stroke-width="1" />
            <circle cx="92" cy="1620" r="2.8" class="home-map-node-fill-sky" />

            <circle cx="1332" cy="1210" r="7.5" class="home-map-node-ring" stroke-width="1" />
            <circle cx="1332" cy="1210" r="3" class="home-map-node-fill" />

            <circle cx="1286" cy="1745" r="8.5" class="home-map-node-ring-sky" stroke-width="1" />
            <circle cx="1286" cy="1745" r="3.2" class="home-map-node-fill-sky" />

            <circle cx="1344" cy="2020" r="7" class="home-map-node-ring-sky" stroke-width="1" />
            <circle cx="1344" cy="2020" r="2.8" class="home-map-node-fill-sky" />
          </g>
        </svg>
      </div>

      <!-- Foreground Page Sections -->
      <div class="relative z-10">
        <!-- 1. AIRY CENTERED HERO SECTION -->
        <section class="pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-22">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-teal-200/80 dark:border-teal-500/35 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-sm"
            >
              <span
                class="inline-flex h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400 shrink-0"
                aria-hidden="true"
              />
              <span>Удобный планировщик путешествий</span>
            </div>

            <h1
              class="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
            >
              Планируйте поездки легко —
              <span
                class="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-sky-600 to-emerald-600 dark:from-teal-300 dark:via-sky-300 dark:to-emerald-300"
              >
                от идеи до маршрута по дням
              </span>
            </h1>

            <p
              class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              Выбирайте направления на 3D-глобусе, собирайте расписание по дням, следите за погодой
              и бюджетом — всё в одном спокойном пространстве.
            </p>

            <!-- Primary & Secondary CTA -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <RouterLink
                :to="authStore.isAuthenticated ? '/dashboard' : '/register'"
                class="w-full sm:w-auto"
              >
                <BaseButton variant="primary" size="lg" fullWidth>
                  <span>Начать планировать</span>
                  <ArrowRight class="w-5 h-5" />
                </BaseButton>
              </RouterLink>

              <RouterLink to="/explore" class="w-full sm:w-auto">
                <BaseButton variant="secondary" size="lg" fullWidth>
                  <Globe2 class="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Открыть 3D-глобус</span>
                </BaseButton>
              </RouterLink>
            </div>

            <!-- Calm Reassurance Strip -->
            <p
              class="pt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <span>Бесплатно</span>
              <span class="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
              <span>Без рекламы</span>
              <span class="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
              <span>Билеты хранятся только в вашем браузере</span>
            </p>
          </div>
        </section>

        <!-- 2. INTERACTIVE DESTINATIONS & CURATED ROUTES SLIDER -->
        <section id="routes" class="scroll-mt-20 py-12 sm:py-16 lg:py-20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" v-reveal>
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="max-w-2xl space-y-2">
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30 shadow-sm dark:shadow-none"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>Готовые маршруты</span>
                </div>
                <h2
                  class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                >
                  Вдохновение и планы поездок в один клик
                </h2>
                <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  Переключайте направления, изучайте ключевые события по дням и берите любой шаблон
                  за основу своего маршрута.
                </p>
              </div>

              <RouterLink to="/countries" class="shrink-0">
                <BaseButton variant="outline" size="md">
                  <BookOpen class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Весь каталог стран</span>
                </BaseButton>
              </RouterLink>
            </div>

            <DestinationsSlider />
          </div>
        </section>

        <!-- 3. COMPACT 2x2 FEATURES SECTION -->
        <section id="features" class="scroll-mt-20 py-14 sm:py-20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div class="text-center max-w-2xl mx-auto space-y-3" v-reveal>
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-sm dark:shadow-none"
              >
                <Compass class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Возможности TravelPlanner</span>
              </div>
              <h2
                class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
              >
                Всё для поездки — в одном пространстве
              </h2>
              <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Без лишних таблиц и десятка вкладок: от выбора направления до готового маршрута в
                телефоне.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <article
                v-for="(card, index) in featureCards"
                :key="card.id"
                v-reveal="index * 60"
                :class="[
                  'rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/85 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-7 flex flex-col justify-between gap-4 transition-colors duration-200',
                  card.hoverBorderClass,
                ]"
              >
                <div class="space-y-3.5">
                  <div
                    :class="[
                      'w-11 h-11 rounded-2xl border flex items-center justify-center',
                      card.iconWrapClass,
                    ]"
                  >
                    <component :is="card.icon" class="w-5 h-5" />
                  </div>

                  <div class="space-y-2">
                    <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {{ card.title }}
                    </h3>
                    <p
                      class="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      {{ card.description }}
                    </p>
                  </div>
                </div>

                <RouterLink
                  v-if="card.actionTo && card.actionLabel"
                  :to="card.actionTo"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group w-fit pt-1"
                >
                  <span>{{ card.actionLabel }}</span>
                  <ArrowRight
                    class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </RouterLink>
              </article>
            </div>
          </div>
        </section>

        <!-- 4. FINAL CTA SECTION -->
        <section class="pt-8 pb-16 sm:pt-10 sm:pb-24">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" v-reveal>
            <div
              class="home-cta-surface relative overflow-hidden rounded-3xl border border-teal-500/25 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-2xl shadow-slate-900/15 dark:shadow-black/40"
            >
              <div class="relative z-10 max-w-2xl mx-auto space-y-5">
                <div
                  class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/15"
                >
                  <Sparkles class="w-3.5 h-3.5 text-teal-300" />
                  <span>Бесплатно · Без рекламы · Удобно на телефоне и ПК</span>
                </div>

                <h2
                  class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
                >
                  Готовы спланировать следующее путешествие?
                </h2>

                <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Выберите страну на 3D-глобусе или возьмите готовый маршрут за основу — соберите
                  план по дням, проверьте погоду и сохраните путеводитель под рукой.
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                  <RouterLink
                    :to="authStore.isAuthenticated ? '/dashboard' : '/register'"
                    class="w-full sm:w-auto"
                  >
                    <BaseButton variant="primary" size="lg" fullWidth>
                      <span>
                        {{
                          authStore.isAuthenticated
                            ? 'Перейти в личный кабинет'
                            : 'Начать планировать'
                        }}
                      </span>
                      <ArrowRight class="w-5 h-5" />
                    </BaseButton>
                  </RouterLink>

                  <RouterLink to="/explore" class="w-full sm:w-auto">
                    <button
                      type="button"
                      class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 active:scale-[0.99]"
                    >
                      <Globe2 class="w-5 h-5 text-teal-300" />
                      <span>Открыть 3D-глобус</span>
                    </button>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </PublicLayout>
</template>
