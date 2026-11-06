<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { User, Mail, Calendar, Lock, ShieldCheck } from 'lucide-vue-next';
import {
  profileNameValidationSchema,
  passwordChangeValidationSchema,
} from '@/schemas/validation';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import { formatRussianDate } from '@/composables/useFormatters';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

// Name update form
const isUpdatingName = ref(false);
const nameError = ref<string | null>(null);

const {
  handleSubmit: handleNameSubmit,
  errors: nameErrors,
} = useForm({
  validationSchema: toTypedSchema(profileNameValidationSchema),
  initialValues: {
    name: authStore.user?.name || '',
  },
});

const { value: name } = useField<string>('name');

const onSaveName = handleNameSubmit(async (values) => {
  isUpdatingName.value = true;
  nameError.value = null;
  try {
    await authStore.updateProfile({ name: values.name.trim() });
    toastStore.success('Имя пользователя успешно обновлено');
  } catch (err: any) {
    nameError.value = err?.message || 'Не удалось обновить имя';
  } finally {
    isUpdatingName.value = false;
  }
});

// Password update form
const isUpdatingPassword = ref(false);
const passwordError = ref<string | null>(null);

const {
  handleSubmit: handlePasswordSubmit,
  errors: passwordErrors,
  resetForm: resetPasswordForm,
  setFieldError: setPasswordFieldError,
} = useForm({
  validationSchema: toTypedSchema(passwordChangeValidationSchema),
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
});

const { value: currentPassword } = useField<string>('currentPassword');
const { value: newPassword } = useField<string>('newPassword');
const { value: confirmPassword } = useField<string>('confirmPassword');

const onSavePassword = handlePasswordSubmit(async (values) => {
  isUpdatingPassword.value = true;
  passwordError.value = null;
  try {
    await authStore.updatePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
    toastStore.success('Пароль успешно изменён');
    resetPasswordForm();
  } catch (err: any) {
    passwordError.value = err?.message || 'Не удалось изменить пароль';
    if (err?.details) {
      for (const [field, messages] of Object.entries(err.details)) {
        if (Array.isArray(messages) && messages[0]) {
          setPasswordFieldError(field as any, messages[0]);
        }
      }
    }
  } finally {
    isUpdatingPassword.value = false;
  }
});

const formattedCreatedAt = computed(() => {
  const iso = authStore.user?.createdAt;
  if (!iso) return '—';
  return formatRussianDate(iso.slice(0, 10), true);
});
</script>

<template>
  <DashboardLayout>
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Профиль пользователя</h1>
        <p class="text-sm text-slate-500 mt-1">
          Личные данные аккаунта и настройки безопасности
        </p>
      </div>

      <!-- Account Info Summary Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <User class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-slate-500">Имя</p>
              <p class="text-sm font-bold text-slate-900 truncate mt-0.5">
                {{ authStore.user?.name }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Mail class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-slate-500">Электронная почта</p>
              <p class="text-sm font-bold text-slate-900 truncate mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-slate-500">Дата регистрации</p>
              <p class="text-sm font-bold text-slate-900 mt-0.5">
                {{ formattedCreatedAt }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Name Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <h2 class="text-lg font-bold text-slate-900 mb-1">Основная информация</h2>
        <p class="text-xs sm:text-sm text-slate-500 mb-6">
          Вы можете изменить отображаемое имя в личном кабинете
        </p>

        <form @submit.prevent="onSaveName" class="space-y-4 max-w-lg" novalidate>
          <BaseAlert v-if="nameError" type="error" :message="nameError" />

          <BaseInput
            v-model="name"
            name="name"
            label="Ваше имя"
            placeholder="Введите имя"
            :error="nameErrors.name"
            required
            :disabled="isUpdatingName"
          />

          <BaseInput
            :modelValue="authStore.user?.email || ''"
            name="email_readonly"
            label="Электронная почта"
            disabled
            hint="Электронная почта используется для входа в аккаунт"
          />

          <div class="pt-2">
            <BaseButton type="submit" variant="primary" :loading="isUpdatingName">
              Сохранить имя
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <div class="flex items-center gap-2.5 mb-1">
          <ShieldCheck class="w-5 h-5 text-teal-600" />
          <h2 class="text-lg font-bold text-slate-900">Смена пароля</h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mb-6">
          Для установки нового пароля подтвердите ваш текущий пароль
        </p>

        <form @submit.prevent="onSavePassword" class="space-y-4 max-w-lg" novalidate>
          <BaseAlert v-if="passwordError" type="error" :message="passwordError" />

          <BaseInput
            v-model="currentPassword"
            name="currentPassword"
            type="password"
            label="Текущий пароль"
            placeholder="Введите текущий пароль"
            autocomplete="current-password"
            :error="passwordErrors.currentPassword"
            required
            :disabled="isUpdatingPassword"
          >
            <template #icon>
              <Lock class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput
            v-model="newPassword"
            name="newPassword"
            type="password"
            label="Новый пароль"
            placeholder="Минимум 6 символов"
            autocomplete="new-password"
            :error="passwordErrors.newPassword"
            required
            :disabled="isUpdatingPassword"
          >
            <template #icon>
              <Lock class="w-4 h-4" />
            </template>
          </BaseInput>

          <BaseInput
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Подтверждение нового пароля"
            placeholder="Повторите новый пароль"
            autocomplete="new-password"
            :error="passwordErrors.confirmPassword"
            required
            :disabled="isUpdatingPassword"
          >
            <template #icon>
              <Lock class="w-4 h-4" />
            </template>
          </BaseInput>

          <div class="pt-2">
            <BaseButton type="submit" variant="primary" :loading="isUpdatingPassword">
              Обновить пароль
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>
