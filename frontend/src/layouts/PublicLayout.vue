<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Compass } from 'lucide-vue-next';
import AppHeader from '@/components/layout/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col app-page-surface text-slate-900 dark:text-slate-100">
    <!-- Shared Top Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white/90 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-sm"
          >
            <Compass class="w-4 h-4" />
          </div>
          <span class="font-bold text-slate-900 dark:text-slate-100">
            Travel<span class="text-teal-600 dark:text-teal-400">Planner</span>
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 ml-1 hidden sm:inline">
            — умный планировщик путешествий
          </span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <RouterLink :to="{ path: '/', hash: '#routes' }" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Маршруты
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#features' }" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Преимущества
          </RouterLink>
          <RouterLink to="/explore" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            3D-глобус
          </RouterLink>
          <RouterLink to="/countries" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Каталог стран
          </RouterLink>
          <span class="text-slate-400 dark:text-slate-500">© {{ new Date().getFullYear() }} TravelPlanner</span>
        </div>
      </div>
    </footer>
  </div>
</template>
