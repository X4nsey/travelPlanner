<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  CloudSun,
  Compass,
  Copy,
  FileDown,
  FileText,
  Globe2,
  HardDrive,
  Link2,
  Lock,
  MapPin,
  Palette,
  Share2,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { vReveal } from '@/directives/vReveal';
import PublicLayout from '@/layouts/PublicLayout.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import HeroTripPreview from '@/components/home/HeroTripPreview.vue';
import DestinationsSlider from '@/components/home/DestinationsSlider.vue';

const authStore = useAuthStore();

const bentoPackingItems = ref([
  { id: 'passport', label: 'Загранпаспорт и страховка', checked: true },
  { id: 'sunglasses', label: 'Солнцезащитные очки (+24°C)', checked: true },
  { id: 'adapter', label: 'Пауэрбанк и адаптер Type-C', checked: false },
]);

const packedDemoCount = computed(
  () => bentoPackingItems.value.filter((item) => item.checked).length
);

function toggleDemoPackingItem(id: string) {
  const item = bentoPackingItems.value.find((entry) => entry.id === id);
  if (item) {
    item.checked = !item.checked;
  }
}

const vaultDemoFiles = [
  { name: 'Авиабилет SVO → FCO.pdf', meta: '312 КБ · IndexedDB', status: 'Готово' },
  { name: 'Полис ВЗР · Скан.webp', meta: '184 КБ · IndexedDB', status: 'Готово' },
  { name: 'Ваучер отеля Trastevere.pdf', meta: '245 КБ · IndexedDB', status: 'Готово' },
];

const budgetDemoBars = [
  { day: 'Д1', amount: '14 200 ₽', heightPct: 58, colorClass: 'from-teal-500 to-emerald-500' },
  { day: 'Д2', amount: '21 800 ₽', heightPct: 92, colorClass: 'from-sky-500 to-teal-500' },
  { day: 'Д3', amount: '16 500 ₽', heightPct: 68, colorClass: 'from-teal-500 to-cyan-500' },
  { day: 'Д4', amount: '11 900 ₽', heightPct: 48, colorClass: 'from-emerald-500 to-teal-500' },
];

const globePins = [
  { flag: '🇮🇹', name: 'Италия', posClass: 'top-[24%] left-[44%]', delay: '0s' },
  { flag: '🇯🇵', name: 'Япония', posClass: 'top-[32%] right-[12%]', delay: '0.7s' },
  { flag: '🇹🇷', name: 'Турция', posClass: 'top-[47%] left-[55%]', delay: '1.3s' },
  { flag: '🇬🇪', name: 'Грузия', posClass: 'bottom-[24%] left-[20%]', delay: '0.4s' },
];
</script>

<template>
  <PublicLayout>
    <!-- 1. TWO-COLUMN HERO SECTION -->
    <section
      class="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 transition-colors duration-200"
    >
      <!-- Subtle Decorative Ambient Background -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          class="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-3xl"
        />
        <div
          class="absolute top-1/4 -right-24 w-[30rem] h-[30rem] rounded-full bg-sky-300/20 dark:bg-sky-500/10 blur-3xl"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-35 dark:opacity-45 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_30%,#000_40%,transparent_100%)]"
        />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <!-- Left Column: Copy, CTA & Facts -->
          <div class="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-teal-200/80 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-sm backdrop-blur-sm"
            >
              <span class="relative flex h-2 w-2 shrink-0">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"
                />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              <span>Умный планировщик путешествий · Privacy-by-Design</span>
            </div>

            <h1
              class="text-4xl sm:text-5xl xl:text-[3.4rem] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]"
            >
              Собирайте идеальные поездки —
              <span
                class="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-sky-600 to-emerald-600 dark:from-teal-400 dark:via-sky-400 dark:to-emerald-400"
              >
                от 3D-глобуса до офлайн-гида
              </span>
            </h1>

            <p
              class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Создавайте расписания по дням, изучайте страны на интерактивном 3D-глобусе,
              проверяйте прогноз погоды, ведите мультивалютный бюджет, храните билеты в локальном
              сейфе браузера и выгружайте путеводитель в PDF.
            </p>

            <!-- Primary & Secondary CTA -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
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
                  <span>Исследовать 3D-глобус</span>
                </BaseButton>
              </RouterLink>
            </div>

            <!-- Compact Key Facts Strip -->
            <div
              class="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              <span class="inline-flex items-center gap-1.5">
                <Palette class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>5 атмосферных тем</span>
              </span>
              <span class="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span class="inline-flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Локальный сейф IndexedDB</span>
              </span>
              <span class="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span class="inline-flex items-center gap-1.5">
                <FileDown class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Офлайн HTML/PDF</span>
              </span>
            </div>
          </div>

          <!-- Right Column: Live Interactive Floating Trip Preview -->
          <div class="lg:col-span-6">
            <HeroTripPreview />
          </div>
        </div>
      </div>
    </section>

    <!-- 2. INTERACTIVE DESTINATIONS & CURATED ROUTES SLIDER -->
    <section
      id="routes"
      class="scroll-mt-20 py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800/80 transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" v-reveal>
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="max-w-2xl space-y-2">
            <div
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-500/30"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Готовые кураторские маршруты</span>
            </div>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Вдохновение и планы поездок в один клик
            </h2>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Переключайте направления, изучайте ключевые события по дням и берите любой шаблон за основу своего маршрута.
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

    <!-- 3. MODERN 6-CARD BENTO GRID OF REAL FEATURES -->
    <section
      id="features"
      class="scroll-mt-20 py-16 sm:py-24 bg-white dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800 transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="text-center max-w-2xl mx-auto space-y-3" v-reveal>
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
          >
            <Compass class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Реальные инструменты путешественника</span>
          </div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Всё для поездки — в одном продуманном пространстве
          </h2>
          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Никаких разрозненных таблиц и десятка вкладок: каждая функция TravelPlanner дополняет остальные.
          </p>
        </div>

        <!-- Bento Grid: 1 col mobile / 6 cols tablet / 12 cols desktop -->
        <div class="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
          <!-- BENTO 1: Interactive 3D Globe & Country Atlas (Dark Graphite Accent Card) -->
          <article
            v-reveal="40"
            class="md:col-span-6 lg:col-span-7 relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-card flex flex-col justify-between gap-6 group"
          >
            <!-- Ambient Nebula Glow -->
            <div
              class="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl group-hover:bg-teal-400/25 transition-colors duration-500"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl"
              aria-hidden="true"
            />

            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div class="sm:col-span-7 space-y-3.5">
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-400/30"
                >
                  <Globe2 class="w-3.5 h-3.5" />
                  <span>WebGL · Three.js + Атлас</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Интерактивный 3D-глобус и атлас стран
                </h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                  Вращайте планету, нажимайте на страны, изучайте проверенные фото, визовые правила,
                  связь, транспорт и сразу запускайте планирование поездки из карточки страны.
                </p>

                <div class="flex flex-wrap items-center gap-2.5 pt-2">
                  <RouterLink to="/explore">
                    <BaseButton variant="primary" size="sm">
                      <span>Открыть 3D-глобус</span>
                      <ArrowRight class="w-4 h-4" />
                    </BaseButton>
                  </RouterLink>
                  <RouterLink
                    to="/countries"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors"
                  >
                    <BookOpen class="w-3.5 h-3.5 text-teal-300" />
                    <span>Атлас стран</span>
                  </RouterLink>
                </div>
              </div>

              <!-- Decorative Orbital Globe Visual -->
              <div class="sm:col-span-5 relative h-52 sm:h-56 flex items-center justify-center">
                <svg
                  viewBox="0 0 220 220"
                  class="w-48 h-48 sm:w-52 sm:h-52 text-teal-400/35"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="bentoGlobeFill" cx="40%" cy="35%" r="65%">
                      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.38" />
                      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.16" />
                      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.05" />
                    </radialGradient>
                  </defs>
                  <circle cx="110" cy="110" r="78" fill="url(#bentoGlobeFill)" stroke="currentColor" stroke-width="1.2" />
                  <circle cx="110" cy="110" r="98" stroke="currentColor" stroke-width="1" stroke-dasharray="4 6" opacity="0.55" />
                  <ellipse cx="110" cy="110" rx="78" ry="28" stroke="currentColor" stroke-width="1" opacity="0.65" />
                  <ellipse cx="110" cy="110" rx="78" ry="54" stroke="currentColor" stroke-width="0.9" opacity="0.35" />
                  <ellipse cx="110" cy="110" rx="34" ry="78" stroke="currentColor" stroke-width="1" opacity="0.65" />
                  <ellipse cx="110" cy="110" rx="60" ry="78" stroke="currentColor" stroke-width="0.9" opacity="0.35" />
                  <line x1="32" y1="110" x2="188" y2="110" stroke="currentColor" stroke-width="0.9" opacity="0.4" />
                  <line x1="110" y1="32" x2="110" y2="188" stroke="currentColor" stroke-width="0.9" opacity="0.4" />
                </svg>

                <!-- Floating Country Chips on Orbit -->
                <div
                  v-for="pin in globePins"
                  :key="pin.name"
                  :class="[
                    'absolute inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 backdrop-blur-md border border-white/15 shadow-lg text-[11px] font-semibold text-white',
                    pin.posClass,
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" :style="{ animationDelay: pin.delay }" />
                  <span aria-hidden="true">{{ pin.flag }}</span>
                  <span>{{ pin.name }}</span>
                </div>
              </div>
            </div>
          </article>

          <!-- BENTO 2: Privacy-by-Design Ticket Vault (IndexedDB) -->
          <article
            v-reveal="100"
            class="md:col-span-6 lg:col-span-5 rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300/80 dark:hover:border-emerald-500/40 p-6 sm:p-7 flex flex-col justify-between gap-5 transition-colors duration-200"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/30 flex items-center justify-center"
                >
                  <ShieldCheck class="w-5 h-5" />
                </div>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30"
                >
                  <HardDrive class="w-3 h-3" />
                  <span>IndexedDB · 0 байт на сервер</span>
                </span>
              </div>

              <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Privacy-by-Design сейф билетов
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Сканы паспортов, PDF-билеты и номера полисов хранятся исключительно в локальной
                базе вашего браузера и никогда не уходят на удалённый сервер.
              </p>
            </div>

            <!-- Mini Vault UI Preview -->
            <div class="space-y-2">
              <div
                v-for="doc in vaultDemoFiles"
                :key="doc.name"
                class="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/70 dark:border-slate-700/80"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                  >
                    <Lock class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {{ doc.name }}
                    </p>
                    <p class="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {{ doc.meta }}
                    </p>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0"
                >
                  {{ doc.status }}
                </span>
              </div>
            </div>
          </article>

          <!-- BENTO 3: Smart Packing List + Weather Forecast -->
          <article
            v-reveal="140"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-300/80 dark:hover:border-sky-500/40 p-6 flex flex-col justify-between gap-5 transition-colors duration-200"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/30 flex items-center justify-center"
                >
                  <Briefcase class="w-5 h-5" />
                </div>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30 tabular-nums"
                >
                  <CloudSun class="w-3.5 h-3.5" />
                  <span>+22°…+27°C · Open-Meteo</span>
                </span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Умный список вещей + погода
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Чек-лист подстраивается под климат направления, длительность и формат отдыха.
              </p>
            </div>

            <!-- Interactive Mini Checklist -->
            <div class="rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/70 dark:border-slate-700/80 p-3.5 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-700/70">
                <span>Попробуйте отметить:</span>
                <span class="text-teal-700 dark:text-teal-400 tabular-nums">
                  {{ packedDemoCount }} / {{ bentoPackingItems.length }}
                </span>
              </div>

              <button
                v-for="item in bentoPackingItems"
                :key="item.id"
                type="button"
                @click="toggleDemoPackingItem(item.id)"
                class="w-full flex items-center gap-2.5 py-1 text-left group cursor-pointer"
              >
                <span
                  :class="[
                    'w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                    item.checked
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-teal-400',
                  ]"
                >
                  <Check v-if="item.checked" class="w-3 h-3 stroke-[3]" />
                </span>
                <span
                  :class="[
                    'text-xs font-semibold transition-colors truncate',
                    item.checked
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-100',
                  ]"
                >
                  {{ item.label }}
                </span>
              </button>
            </div>
          </article>

          <!-- BENTO 4: Multi-Currency Budget & Analytics -->
          <article
            v-reveal="180"
            class="md:col-span-3 lg:col-span-4 rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-300/80 dark:hover:border-teal-500/40 p-6 flex flex-col justify-between gap-5 transition-colors duration-200"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-200/70 dark:border-teal-500/30 flex items-center justify-center"
                >
                  <BarChart3 class="w-5 h-5" />
                </div>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30"
                >
                  <ArrowRightLeft class="w-3 h-3" />
                  <span>Курс ЦБ РФ</span>
                </span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Мультивалютный бюджет
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Траты в EUR, USD и RUB автоматически приводятся к валюте поездки с динамикой по дням.
              </p>
            </div>

            <!-- Mini Budget & Daily Bars Preview -->
            <div class="rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/70 dark:border-slate-700/80 p-3.5 space-y-3">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-500 dark:text-slate-400">EUR / USD → RUB</span>
                <span class="text-teal-700 dark:text-teal-300 tabular-nums">64 400 ₽</span>
              </div>

              <div class="grid grid-cols-4 gap-2.5 items-end h-20 pt-1">
                <div
                  v-for="bar in budgetDemoBars"
                  :key="bar.day"
                  class="h-full flex flex-col justify-end items-center gap-1"
                  :title="`${bar.day}: ${bar.amount}`"
                >
                  <div class="w-full flex-1 bg-slate-100 dark:bg-slate-700/70 rounded-lg overflow-hidden flex items-end">
                    <div
                      :class="['w-full rounded-t-lg bg-gradient-to-t', bar.colorClass]"
                      :style="{ height: `${bar.heightPct}%` }"
                    />
                  </div>
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {{ bar.day }}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <!-- BENTO 5: Offline PDF/HTML Guidebook -->
          <article
            v-reveal="220"
            class="md:col-span-6 lg:col-span-4 rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300/80 dark:hover:border-amber-500/40 p-6 flex flex-col justify-between gap-5 transition-colors duration-200"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/30 flex items-center justify-center"
                >
                  <FileDown class="w-5 h-5" />
                </div>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30"
                >
                  <WifiOff class="w-3 h-3" />
                  <span>Без интернета</span>
                </span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Офлайн PDF/HTML-путеводитель
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Экспортируйте полный лист маршрута с расписанием, памяткой страны и чек-листом — откроется в телефоне даже в роуминге.
              </p>
            </div>

            <!-- Mini Offline Sheet Preview -->
            <div class="rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/70 dark:border-slate-700/80 p-3.5 space-y-2.5">
              <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/70">
                <div class="flex items-center gap-2 min-w-0">
                  <FileText class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    TravelGuide_Rome.html
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300">
                    PDF
                  </span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300">
                    HTML
                  </span>
                </div>
              </div>

              <div class="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5">
                    <CalendarDays class="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>План по дням и адреса</span>
                  </span>
                  <span class="font-bold text-slate-800 dark:text-slate-100">6 дней</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5">
                    <MapPin class="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>Визы, транспорт, экстренные</span>
                  </span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">Включено</span>
                </div>
              </div>
            </div>
          </article>

          <!-- BENTO 6: Sharing & Ready Templates (Wide Bottom Card) -->
          <article
            v-reveal="260"
            class="md:col-span-6 lg:col-span-12 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/35 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300/80 dark:hover:border-indigo-500/40 p-6 sm:p-8 transition-colors duration-200"
          >
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div class="lg:col-span-5 space-y-3">
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30"
                >
                  <Share2 class="w-3.5 h-3.5" />
                  <span>Совместный доступ и шаблоны</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  Делитесь маршрутом с попутчиками и дублируйте поездки
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Откройте публичную ссылку только для чтения: друзья увидят расписание и смогут
                  отмечать личный список вещей у себя в браузере, а ваши брони и документы останутся
                  приватными. Любой маршрут можно клонировать с автоматическим сдвигом дат.
                </p>
              </div>

              <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Sub-card A: Public Share Link Preview -->
                <div
                  class="rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3 shadow-soft dark:shadow-none"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <Link2 class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Публичная ссылка</span>
                    </span>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Активна
                    </span>
                  </div>

                  <div
                    class="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate"
                  >
                    /shared/rome-amalfi-2026
                  </div>

                  <div class="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                    <span class="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      План ✓
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300">
                      Вещи ✓
                    </span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <Lock class="w-2.5 h-2.5" />
                      Брони скрыты
                    </span>
                  </div>
                </div>

                <!-- Sub-card B: Duplicate with Date Shift Preview -->
                <div
                  class="rounded-2xl bg-white dark:bg-slate-800/75 border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3 shadow-soft dark:shadow-none"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <Copy class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Дублирование маршрута</span>
                    </span>
                    <span class="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 px-2 py-0.5 rounded-full">
                      1 клик
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700 text-xs font-bold">
                    <span class="text-slate-500 dark:text-slate-400">14 – 19 мая</span>
                    <ArrowRight class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span class="text-slate-900 dark:text-slate-100">10 – 15 сен</span>
                  </div>

                  <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Автоматический сдвиг всех дней, событий, списка вещей и шаблона чек-листа.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. FINAL CTA SECTION -->
    <section class="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" v-reveal>
        <div
          class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/25 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-2xl shadow-slate-900/15 dark:shadow-black/40"
        >
          <!-- Ambient Glows -->
          <div
            class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl"
            aria-hidden="true"
          />

          <div class="relative z-10 max-w-2xl mx-auto space-y-5">
            <div
              class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-sm"
            >
              <Sparkles class="w-3.5 h-3.5 text-teal-300" />
              <span>Бесплатно · Без рекламы · Privacy-by-Design</span>
            </div>

            <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Готовы собрать своё следующее путешествие?
            </h2>

            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
              Выберите страну на 3D-глобусе или запустите готовый маршрут — настройте атмосферу
              поездки, соберите вещи по погоде и выгрузите удобный путеводитель.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <RouterLink
                :to="authStore.isAuthenticated ? '/dashboard' : '/register'"
                class="w-full sm:w-auto"
              >
                <BaseButton variant="primary" size="lg" fullWidth>
                  <span>
                    {{ authStore.isAuthenticated ? 'Перейти в личный кабинет' : 'Начать планировать' }}
                  </span>
                  <ArrowRight class="w-5 h-5" />
                </BaseButton>
              </RouterLink>

              <RouterLink to="/explore" class="w-full sm:w-auto">
                <button
                  type="button"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 active:scale-[0.99]"
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
  </PublicLayout>
</template>
