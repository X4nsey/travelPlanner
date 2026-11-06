<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  open: boolean;
  title: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'lg',
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const maxWidthClass: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          :class="[
            'relative w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-auto animate-fade-in',
            maxWidthClass[maxWidth],
          ]"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ title }}
            </h3>
            <button
              type="button"
              @click="emit('close')"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Закрыть окно"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 max-h-[80vh] overflow-y-auto">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
