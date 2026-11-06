import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { userService, type UpdateProfilePayload, type UpdatePasswordPayload } from '@/services/user.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));

  let initPromise: Promise<void> | null = null;

  async function initializeAuth(): Promise<void> {
    if (isInitialized.value) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        isLoading.value = true;
        const currentUser = await authService.getMe();
        user.value = currentUser;
      } catch {
        user.value = null;
      } finally {
        isLoading.value = false;
        isInitialized.value = true;
        initPromise = null;
      }
    })();

    return initPromise;
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true;
    try {
      const res = await authService.register(payload);
      user.value = res.user;
      isInitialized.value = true;
      return res;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(payload: LoginPayload) {
    isLoading.value = true;
    try {
      const res = await authService.login(payload);
      user.value = res.user;
      isInitialized.value = true;
      return res;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await authService.logout();
    } catch {
      // Clear local state regardless of network failure on logout
    } finally {
      user.value = null;
      isLoading.value = false;
    }
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    const res = await userService.updateProfile(payload);
    user.value = res.user;
    return res;
  }

  async function updatePassword(payload: UpdatePasswordPayload) {
    return await userService.updatePassword(payload);
  }

  return {
    user,
    isInitialized,
    isLoading,
    isAuthenticated,
    initializeAuth,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
  };
});
