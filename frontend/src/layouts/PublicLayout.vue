<script setup lang="ts">
import { ref } from 'vue';
import type { Component } from 'vue';
import { RouterLink } from 'vue-router';
import { Compass, Menu, X, ArrowRight, Globe2, BookOpen, Sun, Moon, Monitor } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme, type ThemeMode } from '@/composables/useTheme';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();
const { themeMode, setTheme } = useTheme();
const mobileMenuOpen = ref(false);

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: Component }> = [
  { mode: 'light', label: 'Светлая тема', icon: Sun },
  { mode: 'dark', label: 'Тёмная тема', icon: Moon },
  { mode: 'system', label: 'Системная тема', icon: Monitor },
];
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group shrink-0">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
          >
            <Compass class="w-5 h-5" />
          </div>
          <span class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Travel<span class="text-teal-600 dark:text-teal-400">Planner</span>
          </span>
        </RouterLink>

        <!-- Desktop Links -->
        <nav class="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <RouterLink
            to="/explore"
            class="inline-flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            active-class="text-teal-600 dark:text-teal-400 font-semibold"
          >
            <Globe2 class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Исследовать мир</span>
          </RouterLink>
          <RouterLink
            to="/countries"
            class="inline-flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            active-class="text-teal-600 dark:text-teal-400 font-semibold"
          >
            <BookOpen class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Страны мира</span>
          </RouterLink>
          <RouterLink
            :to="{ path: '/', hash: '#routes' }"
            class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Маршруты
          </RouterLink>
          <RouterLink
            :to="{ path: '/', hash: '#features' }"
            class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Преимущества
          </RouterLink>
        </nav>

        <!-- Desktop Theme Switcher & Auth Buttons -->
        <div class="hidden md:flex items-center gap-3">
          <div
            class="flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80"
            role="group"
            aria-label="Переключатель темы оформления"
          >
            <button
              v-for="opt in themeOptions"
              :key="`public-${opt.mode}`"
              type="button"
              :title="opt.label"
              :aria-label="opt.label"
              :aria-pressed="themeMode === opt.mode"
              @click="setTheme(opt.mode)"
              :class="[
                'p-1.5 rounded-lg transition-all duration-150',
                themeMode === opt.mode
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              <component :is="opt.icon" class="w-4 h-4" />
            </button>
          </div>

          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard">
              <BaseButton variant="primary" size="md">
                <span>Личный кабинет</span>
                <ArrowRight class="w-4 h-4" />
              </BaseButton>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/login">
              <BaseButton variant="ghost" size="md">Войти</BaseButton>
            </RouterLink>
            <RouterLink to="/register">
              <BaseButton variant="primary" size="md">Регистрация</BaseButton>
            </RouterLink>
          </template>
        </div>

        <!-- Mobile Right Controls -->
        <div class="flex md:hidden items-center gap-2">
          <div
            class="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70"
            role="group"
            aria-label="Переключатель темы"
          >
            <button
              v-for="opt in themeOptions"
              :key="`public-mobile-${opt.mode}`"
              type="button"
              :title="opt.label"
              :aria-label="opt.label"
              :aria-pressed="themeMode === opt.mode"
              @click="setTheme(opt.mode)"
              :class="[
                'p-1.5 rounded-lg transition-all',
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
            class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Открыть меню"
          >
            <X v-if="mobileMenuOpen" class="w-6 h-6" />
            <Menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3"
      >
        <div class="flex flex-col space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          <RouterLink
            to="/explore"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            @click="mobileMenuOpen = false"
          >
            <Globe2 class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Исследовать мир (3D-глобус)</span>
          </RouterLink>
          <RouterLink
            to="/countries"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            @click="mobileMenuOpen = false"
          >
            <BookOpen class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Страны мира</span>
          </RouterLink>
          <RouterLink
            :to="{ path: '/', hash: '#routes' }"
            class="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            @click="mobileMenuOpen = false"
          >
            Маршруты
          </RouterLink>
          <RouterLink
            :to="{ path: '/', hash: '#features' }"
            class="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            @click="mobileMenuOpen = false"
          >
            Преимущества
          </RouterLink>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/dashboard" @click="mobileMenuOpen = false">
              <BaseButton variant="primary" fullWidth>Личный кабинет</BaseButton>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/login" @click="mobileMenuOpen = false">
              <BaseButton variant="outline" fullWidth>Войти</BaseButton>
            </RouterLink>
            <RouterLink to="/register" @click="mobileMenuOpen = false">
              <BaseButton variant="primary" fullWidth>Регистрация</BaseButton>
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-sm">
            <Compass class="w-4 h-4" />
          </div>
          <span class="font-bold text-slate-900 dark:text-slate-100">TravelPlanner</span>
          <span class="text-xs text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— умный планировщик путешествий</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <RouterLink :to="{ path: '/', hash: '#routes' }" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Маршруты</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#features' }" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Преимущества</RouterLink>
          <RouterLink to="/explore" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">3D-Глобус</RouterLink>
          <RouterLink to="/countries" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Каталог стран</RouterLink>
          <span class="text-slate-400 dark:text-slate-500">© {{ new Date().getFullYear() }} TravelPlanner</span>
        </div>
      </div>
    </footer>
  </div>
</template>
