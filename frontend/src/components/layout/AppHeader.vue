<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Component } from 'vue';
import { RouterLink, useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import {
  Compass,
  LayoutDashboard,
  Map,
  Globe2,
  BookOpen,
  Heart,
  Sparkles,
  Route,
  Plus,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { usePackingStore } from '@/stores/packing.store';
import { useWeatherStore } from '@/stores/weather.store';
import { useDocumentStore } from '@/stores/document.store';
import { useToastStore } from '@/stores/toast.store';
import { useTheme, type ThemeMode } from '@/composables/useTheme';

interface HeaderNavItem {
  id: string;
  label: string;
  to: RouteLocationRaw;
  icon: Component;
  badge?: number;
  isActive: () => boolean;
}

const authStore = useAuthStore();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const packingStore = usePackingStore();
const weatherStore = useWeatherStore();
const documentStore = useDocumentStore();
const toastStore = useToastStore();
const { themeMode, setTheme } = useTheme();
const route = useRoute();
const router = useRouter();

const mobileMenuOpen = ref(false);

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: Component }> = [
  { mode: 'light', label: 'Светлая тема', icon: Sun },
  { mode: 'dark', label: 'Тёмная тема', icon: Moon },
  { mode: 'system', label: 'Системная тема', icon: Monitor },
];

function syncFavoritesIfNeeded() {
  if (authStore.isAuthenticated) {
    countryStore.fetchFavorites().catch(() => {});
  }
}

onMounted(() => {
  syncFavoritesIfNeeded();
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      syncFavoritesIfNeeded();
    }
  }
);

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  }
);

const favoritesCount = computed(() => countryStore.favoriteSlugs.length);

const navItems = computed<HeaderNavItem[]>(() => {
  if (authStore.isAuthenticated) {
    return [
      {
        id: 'dashboard',
        label: 'Обзор',
        to: '/dashboard',
        icon: LayoutDashboard,
        isActive: () => route.path === '/dashboard',
      },
      {
        id: 'trips',
        label: 'Поездки',
        to: '/trips',
        icon: Map,
        isActive: () =>
          route.path === '/trips' ||
          (route.path.startsWith('/trips/') && route.path !== '/trips/new'),
      },
      {
        id: 'explore',
        label: '3D-глобус',
        to: '/explore',
        icon: Globe2,
        isActive: () => route.path === '/explore',
      },
      {
        id: 'countries',
        label: 'Страны',
        to: '/countries',
        icon: BookOpen,
        isActive: () =>
          route.path === '/countries' || route.path.startsWith('/countries/'),
      },
      {
        id: 'favorites',
        label: 'Избранное',
        to: '/favorites',
        icon: Heart,
        badge: favoritesCount.value > 0 ? favoritesCount.value : undefined,
        isActive: () => route.path === '/favorites',
      },
    ];
  }

  return [
    {
      id: 'explore',
      label: '3D-глобус',
      to: '/explore',
      icon: Globe2,
      isActive: () => route.path === '/explore',
    },
    {
      id: 'countries',
      label: 'Страны',
      to: '/countries',
      icon: BookOpen,
      isActive: () =>
        route.path === '/countries' || route.path.startsWith('/countries/'),
    },
    {
      id: 'routes',
      label: 'Маршруты',
      to: { path: '/', hash: '#routes' },
      icon: Route,
      isActive: () => route.path === '/' && route.hash === '#routes',
    },
    {
      id: 'features',
      label: 'Преимущества',
      to: { path: '/', hash: '#features' },
      icon: Sparkles,
      isActive: () => route.path === '/' && route.hash === '#features',
    },
  ];
});

const isCreateTripActive = computed(() => route.path === '/trips/new');
const isProfileActive = computed(() => route.path === '/profile');

const userInitials = computed(() => {
  const name = authStore.user?.name || 'П';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

const profileButtonLabel = computed(() => {
  const firstWord = authStore.user?.name?.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length <= 12) {
    return firstWord;
  }
  return 'Профиль';
});

const profileButtonTitle = computed(() =>
  authStore.user?.name ? `Профиль — ${authStore.user.name}` : 'Профиль'
);

async function handleLogout() {
  mobileMenuOpen.value = false;
  await authStore.logout();
  tripStore.clearState();
  countryStore.clearFavoritesState();
  packingStore.clearState();
  weatherStore.clearState();
  documentStore.clearState();
  toastStore.info('Вы вышли из аккаунта');
  router.push('/login');
}
</script>

<template>
  <header
    class="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
      <!-- Left: Brand Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 group shrink-0">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/20 group-hover:scale-[1.03] transition-transform"
        >
          <Compass class="w-5 h-5" />
        </div>
        <span class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Travel<span class="text-teal-600 dark:text-teal-400">Planner</span>
        </span>
      </RouterLink>

      <!-- Center: Desktop Pill Navigation -->
      <nav
        class="hidden lg:flex items-center gap-0.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-1"
        aria-label="Основная навигация"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'inline-flex items-center gap-1.5 px-3 xl:px-3.5 py-1.5 rounded-full text-[13px] xl:text-sm whitespace-nowrap transition-colors duration-150',
            item.isActive()
              ? 'bg-white text-slate-900 font-semibold shadow-sm dark:bg-slate-800 dark:text-white dark:ring-1 dark:ring-white/10'
              : 'text-slate-600 hover:bg-slate-200/75 hover:text-slate-950 font-medium dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white',
          ]"
        >
          <span>{{ item.label }}</span>
          <span
            v-if="item.badge"
            :class="[
              'min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[11px] font-bold tabular-nums',
              item.isActive()
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                : 'bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25',
            ]"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Right: Desktop Controls -->
      <div class="hidden lg:flex items-center gap-2 shrink-0">
        <!-- 3-Mode Theme Switcher -->
        <div
          class="flex items-center gap-0.5 p-1 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800"
          role="group"
          aria-label="Переключатель темы оформления"
        >
          <button
            v-for="opt in themeOptions"
            :key="`desktop-theme-${opt.mode}`"
            type="button"
            :title="opt.label"
            :aria-label="opt.label"
            :aria-pressed="themeMode === opt.mode"
            @click="setTheme(opt.mode)"
            :class="[
              'p-1.5 rounded-full transition-colors duration-150',
              themeMode === opt.mode
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm dark:ring-1 dark:ring-white/10'
                : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white',
            ]"
          >
            <component :is="opt.icon" class="w-4 h-4" />
          </button>
        </div>

        <template v-if="authStore.isAuthenticated">
          <!-- Primary CTA: + Поездка -->
          <RouterLink
            to="/trips/new"
            :class="[
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] xl:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm shadow-teal-600/20 dark:shadow-teal-950/40 whitespace-nowrap transition-[background-color,transform] duration-150 active:scale-[0.98]',
              isCreateTripActive
                ? 'ring-2 ring-teal-500/40 ring-offset-2 ring-offset-white dark:ring-teal-400/50 dark:ring-offset-slate-950'
                : '',
            ]"
          >
            <Plus class="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>Поездка</span>
          </RouterLink>

          <!-- Profile Button -->
          <RouterLink
            to="/profile"
            :title="profileButtonTitle"
            aria-label="Профиль"
            :class="[
              'inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border text-[13px] xl:text-sm font-medium whitespace-nowrap transition-colors duration-150',
              isProfileActive
                ? 'bg-teal-50 text-teal-800 border-teal-300/90 ring-2 ring-teal-500/20 font-semibold dark:bg-teal-500/15 dark:text-teal-200 dark:border-teal-500/40 dark:ring-teal-400/20'
                : 'bg-white/90 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 dark:text-slate-200 dark:hover:text-white dark:border-slate-800',
            ]"
          >
            <span
              class="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm"
            >
              {{ userInitials }}
            </span>
            <span class="max-w-[92px] truncate">{{ profileButtonLabel }}</span>
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            :class="[
              'px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150',
              route.path === '/login'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
            ]"
          >
            Войти
          </RouterLink>

          <RouterLink
            to="/register"
            :class="[
              'px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm shadow-teal-600/20 dark:shadow-teal-950/40 whitespace-nowrap transition-[background-color,transform] duration-150 active:scale-[0.98]',
              route.path === '/register'
                ? 'ring-2 ring-teal-500/40 ring-offset-2 ring-offset-white dark:ring-teal-400/50 dark:ring-offset-slate-950'
                : '',
            ]"
          >
            Регистрация
          </RouterLink>
        </template>
      </div>

      <!-- Mobile Right Controls (< lg) -->
      <div class="flex lg:hidden items-center gap-2 shrink-0">
        <div
          class="flex items-center gap-0.5 p-0.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800"
          role="group"
          aria-label="Переключатель темы"
        >
          <button
            v-for="opt in themeOptions"
            :key="`mobile-theme-${opt.mode}`"
            type="button"
            :title="opt.label"
            :aria-label="opt.label"
            :aria-pressed="themeMode === opt.mode"
            @click="setTheme(opt.mode)"
            :class="[
              'p-1.5 rounded-full transition-colors',
              themeMode === opt.mode
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm dark:ring-1 dark:ring-white/10'
                : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white',
            ]"
          >
            <component :is="opt.icon" class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Открыть меню навигации"
          :aria-expanded="mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-4 shadow-lg dark:shadow-black/40"
    >
      <!-- Mobile Primary CTA (authenticated) -->
      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/trips/new"
        @click="mobileMenuOpen = false"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Создать поездку</span>
      </RouterLink>

      <!-- Mobile Navigation Links -->
      <nav class="flex flex-col space-y-1" aria-label="Мобильная навигация">
        <RouterLink
          v-for="item in navItems"
          :key="`mobile-${item.id}`"
          :to="item.to"
          @click="mobileMenuOpen = false"
          :class="[
            'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors',
            item.isActive()
              ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-500/15 dark:text-teal-300 dark:ring-1 dark:ring-inset dark:ring-teal-500/25'
              : 'text-slate-700 font-medium hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/70',
          ]"
        >
          <div class="flex items-center gap-3">
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 shrink-0',
                item.isActive()
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-400 dark:text-slate-500',
              ]"
            />
            <span>{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge"
            class="px-2 py-0.5 text-xs font-bold rounded-full tabular-nums bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Mobile Footer: Profile + Logout OR Auth Buttons -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-2.5">
          <RouterLink
            to="/profile"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 p-2.5 rounded-xl border flex-1 min-w-0 transition-colors',
              isProfileActive
                ? 'bg-teal-50/80 border-teal-300/80 dark:bg-teal-500/15 dark:border-teal-500/35'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800',
            ]"
          >
            <div
              class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
            >
              {{ userInitials }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {{ authStore.user?.name || 'Профиль' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </RouterLink>

          <button
            type="button"
            @click="handleLogout"
            class="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 transition-colors shrink-0"
          >
            <LogOut class="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>

        <div v-else class="flex flex-col gap-2.5">
          <RouterLink
            to="/login"
            @click="mobileMenuOpen = false"
            class="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Войти
          </RouterLink>
          <RouterLink
            to="/register"
            @click="mobileMenuOpen = false"
            class="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm transition-colors"
          >
            Регистрация
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
