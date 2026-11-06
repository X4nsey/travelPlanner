<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Compass, LogIn, UserPlus } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

interface Props {
  open: boolean;
  redirectPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  redirectPath: '/explore',
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

function goToLogin() {
  emit('close');
  router.push({ path: '/login', query: { redirect: props.redirectPath } });
}

function goToRegister() {
  emit('close');
  router.push({ path: '/register', query: { redirect: props.redirectPath } });
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Требуется вход в аккаунт"
    maxWidth="sm"
    @close="emit('close')"
  >
    <div class="text-center space-y-4">
      <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
        <Compass class="w-7 h-7" />
      </div>

      <div>
        <h4 class="text-base font-bold text-slate-900 mb-1">
          Сохраняйте любимые страны и планируйте маршруты
        </h4>
        <p class="text-sm text-slate-500 leading-relaxed">
          Войдите в свой аккаунт или зарегистрируйтесь за полминуты, чтобы добавлять страны в избранное и создавать поездки.
        </p>
      </div>

      <div class="flex flex-col gap-2.5 pt-2">
        <BaseButton variant="primary" size="lg" fullWidth @click="goToLogin">
          <LogIn class="w-4 h-4" />
          <span>Войти в аккаунт</span>
        </BaseButton>

        <BaseButton variant="outline" size="lg" fullWidth @click="goToRegister">
          <UserPlus class="w-4 h-4" />
          <span>Создать новый аккаунт</span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
