<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col app-page-surface text-slate-900 dark:text-slate-100">
    <AppHeader />

    <!-- Main Workspace Area -->
    <main class="flex-1 min-w-0">
      <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
