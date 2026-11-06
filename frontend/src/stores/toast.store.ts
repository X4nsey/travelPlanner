import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([]);

  function show(title: string, type: ToastType = 'info', message?: string, duration = 4200) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    toasts.value.push({ id, type, title, message });

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }

  function success(title: string, message?: string) {
    show(title, 'success', message);
  }

  function error(title: string, message?: string) {
    show(title, 'error', message, 5500);
  }

  function info(title: string, message?: string) {
    show(title, 'info', message);
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    show,
    success,
    error,
    info,
    remove,
  };
});
