<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import DashboardLayout from './DashboardLayout.vue';
import PublicLayout from './PublicLayout.vue';

const authStore = useAuthStore();
</script>

<template>
  <DashboardLayout v-if="authStore.isAuthenticated">
    <slot />
  </DashboardLayout>
  <PublicLayout v-else>
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </PublicLayout>
</template>
