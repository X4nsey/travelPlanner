<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Component } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  Compass,
  LayoutDashboard,
  Globe2,
  BookOpen,
  Heart,
  Map,
  Plus,
  User,
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

interface NavItem {
  name: string;
  to: string;
  icon: Component;
  badge?: number;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
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

const mobileNavOpen = ref(false);

onMounted(() => {
  if (authStore.isAuthenticated) {
    countryStore.fetchFavorites().catch(() => {});
  }
});

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false;
  }
);

const navSections = computed<NavSection[]>(() => [
  {
    id: 'planning',
    label: 'Планирование',
    items: [
      {
        name: 'Обзор',
        to: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Мои поездки',
        to: '/trips',
        icon: Map,
      },
    ],
  },
  {
    id: 'explore',
    label: 'Исследование',
    items: [
      {
        name: 'Исследовать мир',
        to: '/explore',
        icon: Globe2,
      },
      {
        name: 'Страны мира',
        to: '/countries',
        icon: BookOpen,
      },
      {
        name: 'Избранные страны',
        to: '/favorites',
        icon: Heart,
        badge: countryStore.favoriteSlugs.length || undefined,
      },
    ],
  },
  {
    id: 'account',
    label: 'Аккаунт',
    items: [
      {
        name: 'Профиль',
        to: '/profile',
        icon: User,
      },
    ],
  },
]);

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: Component }> = [
  { mode: 'light', label: 'Светлая тема', icon: Sun },
  { mode: 'dark', label: 'Тёмная тема', icon: Moon },
  { mode: 'system', label: 'Системная тема', icon: Monitor },
];

const isCreateTripActive = computed(() => route.path === '/trips/new');

function isItemActive(item: { to: string }) {
  if (item.to === '/trips') {
    return (
      route.path === '/trips' ||
      (route.path.startsWith('/trips/') && route.path !== '/trips/new')
    );
  }
  if (item.to === '/countries') {
    return route.path === '/countries' || route.path.startsWith('/countries/');
  }
  return route.path === item.to;
}

const userInitials = computed(() => {
  const name = authStore.user?.name || 'П';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

async function handleLogout() {
  mobileNavOpen.value = false;
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
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30"
    >
      <!-- Brand Header -->
      <div class="h-16 px-5 flex items-center border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/20 group-hover:scale-[1.03] transition-transform"
          >
            <Compass class="w-5 h-5" />
          </div>
          <span class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Travel<span class="text-teal-600 dark:text-teal-400">Planner</span>
          </span>
        </RouterLink>
      </div>

      <!-- Primary CTA Action -->
      <div class="px-4 pt-4 pb-2 shrink-0">
        <RouterLink
          to="/trips/new"
          :class="[
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm shadow-teal-600/20 dark:shadow-teal-950/50 transition-[background-color,transform] duration-150 active:scale-[0.99]',
            isCreateTripActive ? 'ring-2 ring-teal-500/40 ring-offset-2 ring-offset-white dark:ring-teal-400/50 dark:ring-offset-slate-900' : '',
          ]"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Создать поездку</span>
        </RouterLink>
      </div>

      <!-- Grouped Navigation Links -->
      <nav class="flex-1 px-3 py-3 space-y-5 overflow-y-auto" aria-label="Основная навигация">
        <div v-for="section in navSections" :key="section.id" class="space-y-1">
          <p class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
            {{ section.label }}
          </p>

          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :class="[
              'group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
              isItemActive(item)
                ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm dark:bg-teal-500/15 dark:text-teal-300 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-teal-500/25'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <component
                :is="item.icon"
                :class="[
                  'w-5 h-5 shrink-0 transition-colors',
                  isItemActive(item)
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                ]"
              />
              <span class="truncate">{{ item.name }}</span>
            </div>

            <span
              v-if="item.badge"
              class="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </div>
      </nav>

      <!-- Sidebar Footer: Theme Switcher + User Profile Card -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 shrink-0">
        <!-- Compact Theme Switcher -->
        <div
          class="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70"
          role="group"
          aria-label="Переключатель темы оформления"
        >
          <button
            v-for="opt in themeOptions"
            :key="opt.mode"
            type="button"
            :title="opt.label"
            :aria-label="opt.label"
            :aria-pressed="themeMode === opt.mode"
            @click="setTheme(opt.mode)"
            :class="[
              'flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors duration-150',
              themeMode === opt.mode
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
          >
            <component :is="opt.icon" class="w-4 h-4" />
          </button>
        </div>

        <!-- User Card + Logout -->
        <div
          class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800"
        >
          <RouterLink
            to="/profile"
            class="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-0.5 hover:opacity-90 transition-opacity"
            title="Перейти в профиль"
          >
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
            >
              {{ userInitials }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {{ authStore.user?.name }}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>
          </RouterLink>

          <button
            type="button"
            @click="handleLogout"
            title="Выйти из аккаунта"
            aria-label="Выйти из аккаунта"
            class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors shrink-0"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <header
      class="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between"
    >
      <RouterLink to="/dashboard" class="flex items-center gap-2.5">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-sm"
        >
          <Compass class="w-5 h-5" />
        </div>
        <span class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Travel<span class="text-teal-600 dark:text-teal-400">Planner</span>
        </span>
      </RouterLink>

      <div class="flex items-center gap-2">
        <!-- Mobile Quick Theme Switcher -->
        <div
          class="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70"
          role="group"
          aria-label="Переключатель темы"
        >
          <button
            v-for="opt in themeOptions"
            :key="`mobile-bar-${opt.mode}`"
            type="button"
            :title="opt.label"
            :aria-label="opt.label"
            :aria-pressed="themeMode === opt.mode"
            @click="setTheme(opt.mode)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              themeMode === opt.mode
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400',
            ]"
          >
            <component :is="opt.icon" class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          @click="mobileNavOpen = !mobileNavOpen"
          class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Меню навигации"
          :aria-expanded="mobileNavOpen"
        >
          <X v-if="mobileNavOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="mobileNavOpen"
      class="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4 z-20 shadow-lg dark:shadow-black/40"
    >
      <!-- Mobile Primary CTA -->
      <RouterLink
        to="/trips/new"
        @click="mobileNavOpen = false"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-sm"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Создать поездку</span>
      </RouterLink>

      <!-- Mobile Grouped Nav -->
      <nav class="space-y-4" aria-label="Мобильная навигация">
        <div v-for="section in navSections" :key="`mobile-${section.id}`" class="space-y-1">
          <p class="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {{ section.label }}
          </p>

          <RouterLink
            v-for="item in section.items"
            :key="`mobile-${item.to}`"
            :to="item.to"
            @click="mobileNavOpen = false"
            :class="[
              'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isItemActive(item)
                ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-500/15 dark:text-teal-300 dark:ring-1 dark:ring-inset dark:ring-teal-500/25'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70',
            ]"
          >
            <div class="flex items-center gap-3">
              <component
                :is="item.icon"
                :class="[
                  'w-5 h-5',
                  isItemActive(item)
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400 dark:text-slate-500',
                ]"
              />
              <span>{{ item.name }}</span>
            </div>
            <span
              v-if="item.badge"
              class="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </div>
      </nav>

      <!-- Mobile User Card + Logout -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <RouterLink
          to="/profile"
          @click="mobileNavOpen = false"
          class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex-1 min-w-0"
        >
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0"
          >
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {{ authStore.user?.name }}
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
    </div>

    <!-- Main Workspace Area -->
    <main class="flex-1 lg:pl-64 min-w-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
