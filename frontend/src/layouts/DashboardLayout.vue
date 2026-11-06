<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  Compass,
  LayoutDashboard,
  Globe2,
  BookOpen,
  Heart,
  Map,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';

const authStore = useAuthStore();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();

const mobileNavOpen = ref(false);

onMounted(() => {
  if (authStore.isAuthenticated) {
    countryStore.fetchFavorites().catch(() => {});
  }
});

const navItems = computed(() => [
  {
    name: 'Обзор',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
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
  {
    name: 'Мои поездки',
    to: '/trips',
    icon: Map,
  },
  {
    name: 'Создать поездку',
    to: '/trips/new',
    icon: PlusCircle,
  },
  {
    name: 'Профиль',
    to: '/profile',
    icon: User,
  },
]);

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
  toastStore.info('Вы вышли из аккаунта');
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30"
    >
      <!-- Brand Header -->
      <div class="h-16 px-6 flex items-center border-b border-slate-100">
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-sm"
          >
            <Compass class="w-5 h-5" />
          </div>
          <span class="text-lg font-extrabold tracking-tight text-slate-900">
            Travel<span class="text-teal-600">Planner</span>
          </span>
        </RouterLink>
      </div>

      <!-- User Mini Card -->
      <div class="p-4 border-b border-slate-100">
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div
            class="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0"
          >
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900 truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-slate-500 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            isItemActive(item)
              ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 shrink-0',
                isItemActive(item) ? 'text-teal-600' : 'text-slate-400',
              ]"
            />
            <span class="truncate">{{ item.name }}</span>
          </div>

          <span
            v-if="item.badge"
            class="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200/70"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Logout Button -->
      <div class="p-3 border-t border-slate-100">
        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut class="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <header
      class="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between"
    >
      <RouterLink to="/dashboard" class="flex items-center gap-2">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center"
        >
          <Compass class="w-5 h-5" />
        </div>
        <span class="text-lg font-extrabold text-slate-900">
          Travel<span class="text-teal-600">Planner</span>
        </span>
      </RouterLink>

      <button
        type="button"
        @click="mobileNavOpen = !mobileNavOpen"
        class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Меню навигации"
      >
        <X v-if="mobileNavOpen" class="w-6 h-6" />
        <Menu v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="mobileNavOpen"
      class="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 z-20"
    >
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div
          class="w-9 h-9 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900 truncate">
            {{ authStore.user?.name }}
          </p>
          <p class="text-xs text-slate-500 truncate">
            {{ authStore.user?.email }}
          </p>
        </div>
      </div>

      <nav class="space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="mobileNavOpen = false"
          :class="[
            'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isItemActive(item)
              ? 'bg-teal-50 text-teal-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-100',
          ]"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </div>
          <span
            v-if="item.badge"
            class="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600"
          >
            {{ item.badge }}
          </span>
        </RouterLink>

        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut class="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </nav>
    </div>

    <!-- Main Workspace Area -->
    <main class="flex-1 lg:pl-64">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
