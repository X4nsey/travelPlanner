<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: 'Подтверждение удаления',
  confirmText: 'Удалить',
  cancelText: 'Отмена',
  loading: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <BaseModal :open="open" :title="title" maxWidth="sm" @close="emit('cancel')">
    <div class="flex items-start gap-4">
      <div class="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <div class="text-sm text-slate-600 leading-relaxed pt-0.5">
        {{ message }}
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" :disabled="loading" @click="emit('cancel')">
        {{ cancelText }}
      </BaseButton>
      <BaseButton variant="danger" :loading="loading" @click="emit('confirm')">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
