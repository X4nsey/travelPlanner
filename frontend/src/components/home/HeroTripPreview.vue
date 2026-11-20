<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ArrowRightLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Palette,
  Share2,
  ShieldCheck,
  Sun,
} from 'lucide-vue-next';
import { TRIP_THEMES, type TripThemeId } from '@/constants/tripThemes';

const PREVIEW_THEME_IDS: readonly TripThemeId[] = [
  'ocean',
  'mountain',
  'metropolis',
  'sunset',
];

const selectedThemeId = ref<TripThemeId>('ocean');
const flagFailed = ref(false);

const activeTheme = computed(() => TRIP_THEMES[selectedThemeId.value]);

const previewEvents = [
  {
    time: '09:30',
    title: 'Колизей и Римский форум',
    meta: 'Билет в сейфе · €24',
    tag: 'Экскурсия',
  },
  {
    time: '13:15',
    title: 'Обед в траттории Трастевере',
    meta: 'Гастрономия · €32',
    tag: 'Еда',
  },
  {
    time: '18:30',
    title: 'Закат на террасе Пинчо',
    meta: 'Вилла Боргезе · Прогулка',
    tag: 'Вид',
  },
];

function selectPreviewTheme(id: TripThemeId) {
  selectedThemeId.value = id;
}
</script>

<template>
  <div class="relative mx-auto w-full max-w-lg lg:max-w-none py-4 sm:py-6 lg:px-4">
    <!-- Ambient Atmospheric Glow behind Card -->
    <div
      :class="[
        'pointer-events-none absolute -inset-4 sm:-inset-6 rounded-[2.5rem] blur-3xl opacity-80 dark:opacity-65 transition-all duration-500',
        activeTheme.heroGlowClass,
      ]"
      aria-hidden="true"
    />

    <!-- Floating Mini-Badge 1 (Top-Right, Desktop) -->
    <div
      class="hidden lg:flex items-center gap-2.5 absolute -top-1 -right-1 xl:-right-4 z-20 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/90 shadow-card dark:shadow-black/40 animate-float-delayed"
    >
      <div
        :class="[
          'w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-colors duration-300',
          activeTheme.badgeClass,
        ]"
      >
        <ArrowRightLeft class="w-4 h-4" />
      </div>
      <div class="leading-tight">
        <p class="text-[11px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          Мультивалютный пересчёт
        </p>
        <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Курс ЦБ РФ · EUR / USD → RUB
        </p>
      </div>
    </div>

    <!-- Floating Mini-Badge 2 (Bottom-Left, Desktop) -->
    <div
      class="hidden lg:flex items-center gap-2.5 absolute -bottom-1 -left-1 xl:-left-4 z-20 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/90 shadow-card dark:shadow-black/40 animate-float-reverse"
    >
      <div
        class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center shrink-0"
      >
        <Share2 class="w-4 h-4" />
      </div>
      <div class="leading-tight">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p class="text-[11px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Публичная ссылка для попутчиков
          </p>
        </div>
        <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Только чтение · Личные брони скрыты
        </p>
      </div>
    </div>

    <!-- Main Floating Interactive Trip Preview Card -->
    <div
      :class="[
        'relative z-10 rounded-3xl border shadow-2xl shadow-slate-900/10 dark:shadow-black/50 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300 animate-float',
        activeTheme.cardBorderClass,
      ]"
    >
      <!-- Top Gradient Strip -->
      <div
        :class="['h-1.5 w-full transition-all duration-300', activeTheme.heroAccentStripClass]"
        aria-hidden="true"
      />

      <!-- Themed Card Header -->
      <div
        :class="[
          'relative px-5 pt-4 pb-4 border-b border-slate-200/70 dark:border-slate-800 transition-colors duration-300',
          activeTheme.headerBandClass,
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <img
              v-if="!flagFailed"
              src="https://flagcdn.com/w80/it.webp"
              alt="Италия"
              loading="eager"
              decoding="async"
              @error="flagFailed = true"
              class="w-10 h-7 object-cover rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0 mt-0.5"
            />
            <div
              v-else
              class="w-10 h-7 rounded-lg bg-white/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 mt-0.5"
              aria-hidden="true"
            >
              🇮🇹
            </div>

            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">
                Рим и побережье Амальфи
              </h2>
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-xs">
                <span :class="['inline-flex items-center gap-1 font-semibold', activeTheme.accentTextClass]">
                  <MapPin :class="['w-3.5 h-3.5 shrink-0', activeTheme.accentIconClass]" />
                  <span>Италия, Рим</span>
                </span>
                <span class="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Calendar class="w-3.5 h-3.5 shrink-0" />
                  <span>14 – 19 мая · 6 дней</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Weather Mini-Badge -->
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm shrink-0"
            title="Прогноз погоды Open-Meteo"
          >
            <Sun class="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span class="tabular-nums">+24°C</span>
          </div>
        </div>

        <!-- Interactive 4-Palette Atmospheric Theme Switcher -->
        <div
          class="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2"
        >
          <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 min-w-0">
            <Palette :class="['w-3.5 h-3.5 shrink-0', activeTheme.accentIconClass]" />
            <span class="truncate">Атмосфера:</span>
            <span :class="['font-bold truncate', activeTheme.accentTextClass]">
              {{ activeTheme.name }}
            </span>
          </div>

          <div
            class="flex items-center gap-1.5"
            role="group"
            aria-label="Переключить атмосферу карточки-превью"
          >
            <button
              v-for="themeId in PREVIEW_THEME_IDS"
              :key="themeId"
              type="button"
              :title="`Включить тему «${TRIP_THEMES[themeId].name}»`"
              :aria-label="`Выбрать тему ${TRIP_THEMES[themeId].name}`"
              :aria-pressed="selectedThemeId === themeId"
              @click="selectPreviewTheme(themeId)"
              :class="[
                'w-6 h-6 rounded-full p-0.5 transition-all duration-200 focus:outline-none cursor-pointer',
                selectedThemeId === themeId
                  ? ['scale-110 bg-white dark:bg-slate-900', TRIP_THEMES[themeId].ringClass]
                  : 'opacity-80 hover:opacity-100 hover:scale-105',
              ]"
            >
              <span
                :class="['block w-full h-full rounded-full shadow-inner', TRIP_THEMES[themeId].swatchClass]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Mini Day Timeline -->
      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all duration-300',
                activeTheme.dayBadgeClass,
              ]"
            >
              День 2
            </span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">
              Исторический центр
            </span>
          </div>
          <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            3 события
          </span>
        </div>

        <ol class="relative space-y-2.5 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          <li
            v-for="ev in previewEvents"
            :key="ev.time"
            class="relative pl-9"
          >
            <span
              :class="[
                'absolute left-2.5 top-2.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 transition-all duration-300',
                activeTheme.swatchClass,
              ]"
              aria-hidden="true"
            />
            <div
              class="rounded-xl px-3 py-2 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/90 flex items-center justify-between gap-2"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 text-[11px] font-bold tabular-nums',
                      activeTheme.accentTextClass,
                    ]"
                  >
                    <Clock class="w-3 h-3 shrink-0" />
                    {{ ev.time }}
                  </span>
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {{ ev.title }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {{ ev.meta }}
                </p>
              </div>
              <span
                class="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0"
              >
                {{ ev.tag }}
              </span>
            </div>
          </li>
        </ol>

        <!-- Readiness Progress Bars: Packing + IndexedDB Vault -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <!-- Packing -->
          <div class="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-3 space-y-2">
            <div class="flex items-center justify-between gap-1.5 text-xs">
              <span class="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                <Briefcase :class="['w-3.5 h-3.5 shrink-0', activeTheme.accentIconClass]" />
                <span>Список вещей</span>
              </span>
              <span :class="['font-extrabold tabular-nums', activeTheme.accentTextClass]">
                78%
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all duration-500', activeTheme.progressFillClass]"
                style="width: 78%"
              />
            </div>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Собрано 14 из 18 позиций
            </p>
          </div>

          <!-- IndexedDB Vault -->
          <div class="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-3 space-y-2">
            <div class="flex items-center justify-between gap-1.5 text-xs">
              <span class="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 truncate">
                <Lock :class="['w-3.5 h-3.5 shrink-0', activeTheme.accentIconClass]" />
                <span class="truncate">Брони в IndexedDB</span>
              </span>
              <span class="inline-flex items-center gap-0.5 font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                <CheckCircle2 class="w-3 h-3" />
                100%
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all duration-500', activeTheme.progressSecondaryFillClass]"
                style="width: 100%"
              />
            </div>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <ShieldCheck class="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>5 билетов локально в браузере</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
