<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Compass, Menu, X, ArrowRight, Globe2, BookOpen } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
          >
            <Compass class="w-5 h-5" />
          </div>
          <span class="text-xl font-extrabold tracking-tight text-slate-900">
            Travel<span class="text-teal-600">Planner</span>
          </span>
        </RouterLink>

        <!-- Desktop Links -->
        <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <RouterLink
            to="/explore"
            class="inline-flex items-center gap-1.5 hover:text-teal-600 transition-colors"
            active-class="text-teal-600 font-semibold"
          >
            <Globe2 class="w-4 h-4 text-teal-600" />
            <span>Исследовать мир</span>
          </RouterLink>
          <RouterLink
            to="/countries"
            class="inline-flex items-center gap-1.5 hover:text-teal-600 transition-colors"
            active-class="text-teal-600 font-semibold"
          >
            <BookOpen class="w-4 h-4 text-teal-600" />
            <span>Страны мира</span>
          </RouterLink>
          <a href="/#features" class="hover:text-teal-600 transition-colors">Преимущества</a>
        </nav>

        <!-- Desktop Auth Buttons -->
        <div class="hidden md:flex items-center gap-3">
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

        <!-- Mobile Menu Button -->
        <button
          type="button"
          class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Открыть меню"
        >
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3"
      >
        <div class="flex flex-col space-y-1.5 text-sm font-medium text-slate-700">
          <RouterLink
            to="/explore"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50"
            @click="mobileMenuOpen = false"
          >
            <Globe2 class="w-4 h-4 text-teal-600" />
            <span>Исследовать мир (3D-глобус)</span>
          </RouterLink>
          <RouterLink
            to="/countries"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50"
            @click="mobileMenuOpen = false"
          >
            <BookOpen class="w-4 h-4 text-teal-600" />
            <span>Страны мира</span>
          </RouterLink>
          <a
            href="/#features"
            class="px-3 py-2 rounded-lg hover:bg-slate-50"
            @click="mobileMenuOpen = false"
          >
            Преимущества
          </a>
        </div>

        <div class="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
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
    <footer class="bg-white border-t border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Compass class="w-4 h-4" />
          </div>
          <span class="font-bold text-slate-900">TravelPlanner</span>
          <span class="text-xs text-slate-400 ml-1">— сервис планирования путешествий</span>
        </div>

        <div class="flex items-center gap-5 text-xs text-slate-500">
          <RouterLink to="/explore" class="hover:text-teal-600">3D-Глобус</RouterLink>
          <RouterLink to="/countries" class="hover:text-teal-600">Каталог стран</RouterLink>
          <span>© {{ new Date().getFullYear() }} TravelPlanner</span>
        </div>
      </div>
    </footer>
  </div>
</template>
