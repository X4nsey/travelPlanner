<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Mail, Lock, Compass } from 'lucide-vue-next';
import { loginValidationSchema } from '@/schemas/validation';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import PublicLayout from '@/layouts/PublicLayout.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const serverError = ref<string | null>(null);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginValidationSchema),
  initialValues: {
    email: '',
    password: '',
  },
});

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  try {
    await authStore.login({
      email: values.email.trim(),
      password: values.password,
    });
    toastStore.success('Вы успешно вошли в систему');
    const redirectPath = (route.query.redirect as string) || '/dashboard';
    router.push(redirectPath);
  } catch (err: any) {
    serverError.value = err?.message || 'Неверная электронная почта или пароль';
  }
});
</script>

<template>
  <PublicLayout>
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8 animate-fade-in">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Compass class="w-6 h-6" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Вход в TravelPlanner</h1>
          <p class="text-sm text-slate-500 mt-1">
            Введите данные вашего аккаунта для доступа к поездкам
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
          <BaseAlert v-if="serverError" type="error" :message="serverError" />

          <BaseInput
            v-model="email"
            name="email"
            type="email"
            label="Электронная почта"
            placeholder="you@example.com"
            autocomplete="email"
            :error="errors.email"
            required
            :disabled="authStore.isLoading"
          >
            <template #icon>
              <Mail class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput
            v-model="password"
            name="password"
            type="password"
            label="Пароль"
            placeholder="Введите ваш пароль"
            autocomplete="current-password"
            :error="errors.password"
            required
            :disabled="authStore.isLoading"
          >
            <template #icon>
              <Lock class="w-4 h-4" />
            </template>
          </BaseInput>

          <div class="pt-2">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              :loading="authStore.isLoading"
            >
              Войти
            </BaseButton>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Ещё нет аккаунта?
          <RouterLink to="/register" class="font-semibold text-teal-600 hover:text-teal-700">
            Зарегистрироваться
          </RouterLink>
        </p>
      </div>
    </div>
  </PublicLayout>
</template>
