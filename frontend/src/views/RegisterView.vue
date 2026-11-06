<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { User, Mail, Lock, Compass } from 'lucide-vue-next';
import { registerValidationSchema } from '@/schemas/validation';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import PublicLayout from '@/layouts/PublicLayout.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const serverError = ref<string | null>(null);

const { handleSubmit, errors, setFieldError } = useForm({
  validationSchema: toTypedSchema(registerValidationSchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
});

const { value: name } = useField<string>('name');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  try {
    await authStore.register({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
    toastStore.success('Добро пожаловать в TravelPlanner!', 'Аккаунт успешно создан');
    router.push('/dashboard');
  } catch (err: any) {
    serverError.value = err?.message || 'Не удалось выполнить регистрацию';
    if (err?.details) {
      for (const [field, messages] of Object.entries(err.details)) {
        if (Array.isArray(messages) && messages[0]) {
          setFieldError(field as any, messages[0]);
        }
      }
    }
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
          <h1 class="text-2xl font-bold text-slate-900">Создать аккаунт</h1>
          <p class="text-sm text-slate-500 mt-1">
            Зарегистрируйтесь, чтобы начать планировать поездки
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
          <BaseAlert v-if="serverError" type="error" :message="serverError" />

          <BaseInput
            v-model="name"
            name="name"
            label="Имя"
            placeholder="Например: Александр"
            autocomplete="name"
            :error="errors.name"
            required
            :disabled="authStore.isLoading"
          >
            <template #icon>
              <User class="w-4 h-4" />
            </template>
          </BaseInput>

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
            placeholder="Минимум 6 символов"
            autocomplete="new-password"
            :error="errors.password"
            required
            :disabled="authStore.isLoading"
          >
            <template #icon>
              <Lock class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Подтверждение пароля"
            placeholder="Повторите пароль"
            autocomplete="new-password"
            :error="errors.confirmPassword"
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
              Зарегистрироваться
            </BaseButton>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Уже есть аккаунт?
          <RouterLink to="/login" class="font-semibold text-teal-600 hover:text-teal-700">
            Войти
          </RouterLink>
        </p>
      </div>
    </div>
  </PublicLayout>
</template>
