<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border shadow-lg border-slate-200/90"
        >
          <CheckCircle2
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
          />
          <AlertCircle
            v-else-if="toast.type === 'error'"
            class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
          />
          <Info
            v-else
            class="w-5 h-5 text-teal-600 shrink-0 mt-0.5"
          />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <button
            type="button"
            @click="toastStore.remove(toast.id)"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            aria-label="Закрыть уведомление"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
