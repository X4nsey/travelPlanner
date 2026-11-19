<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Component } from 'vue';
import { RouterLink } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  User,
  Mail,
  Calendar,
  Lock,
  ShieldCheck,
  Compass,
  Map,
  Globe2,
  CalendarDays,
  HardDrive,
  Trash2,
  RefreshCw,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  LockKeyhole,
} from 'lucide-vue-next';
import {
  profileNameValidationSchema,
  passwordChangeValidationSchema,
} from '@/schemas/validation';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useDocumentStore } from '@/stores/document.store';
import { useToastStore } from '@/stores/toast.store';
import { useTheme, type ThemeMode } from '@/composables/useTheme';
import { formatRussianDate, pluralizeRu } from '@/composables/useFormatters';
import {
  clearAllLocalAttachments,
  formatAttachmentFileSize,
  getLocalVaultStats,
  type LocalVaultStats,
} from '@/utils/localDocumentVault';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const authStore = useAuthStore();
const tripStore = useTripStore();
const documentStore = useDocumentStore();
const toastStore = useToastStore();
const { themeMode, isDark, setTheme } = useTheme();

// Traveler passport info
const userInitials = computed(() => {
  const rawName = authStore.user?.name || 'П';
  return rawName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

const formattedCreatedAt = computed(() => {
  const iso = authStore.user?.createdAt;
  if (!iso) return '—';
  return formatRussianDate(iso.slice(0, 10), true);
});

const passportStats = computed(() => [
  {
    key: 'trips',
    label: 'Поездок',
    value: tripStore.stats?.totalTrips ?? 0,
    icon: Map,
  },
  {
    key: 'countries',
    label: 'Стран',
    value: tripStore.stats?.uniqueCountriesCount ?? 0,
    icon: Globe2,
  },
  {
    key: 'days',
    label: 'Дней в пути',
    value: tripStore.stats?.totalTravelDays ?? 0,
    icon: CalendarDays,
  },
]);

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

watch(
  () => authStore.user?.name,
  (nextName) => {
    if (nextName && !name.value) {
      name.value = nextName;
    }
  }
);

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

// Local document vault (IndexedDB Privacy-by-Design)
const vaultStats = ref<LocalVaultStats>({
  supported: true,
  filesCount: 0,
  totalBytes: 0,
  tripsCount: 0,
  latestUpdatedAt: null,
});
const isLoadingVault = ref(true);
const vaultError = ref<string | null>(null);
const clearVaultDialogOpen = ref(false);
const isClearingVault = ref(false);

async function loadVaultStats() {
  isLoadingVault.value = true;
  vaultError.value = null;
  try {
    vaultStats.value = await getLocalVaultStats();
  } catch (err: any) {
    vaultError.value =
      err?.message || 'Не удалось прочитать статистику локального хранилища браузера';
  } finally {
    isLoadingVault.value = false;
  }
}

async function handleConfirmClearVault() {
  isClearingVault.value = true;
  vaultError.value = null;
  try {
    await clearAllLocalAttachments();
    documentStore.clearState();
    await loadVaultStats();
    clearVaultDialogOpen.value = false;
    toastStore.success('Локальные файлы документов удалены с этого устройства');
  } catch (err: any) {
    vaultError.value = err?.message || 'Не удалось очистить локальный сейф документов';
    toastStore.error('Ошибка очистки локального хранилища');
  } finally {
    isClearingVault.value = false;
  }
}

const vaultFilesLabel = computed(() =>
  pluralizeRu(vaultStats.value.filesCount, ['файл', 'файла', 'файлов'])
);

const vaultTripsSubtext = computed(() => {
  if (!vaultStats.value.supported) return 'IndexedDB недоступна';
  if (vaultStats.value.filesCount === 0) return 'На этом устройстве файлов нет';
  const tripsCount = vaultStats.value.tripsCount;
  if (tripsCount <= 0) return 'Хранятся локально в браузере';
  return `В ${tripsCount} ${pluralizeRu(tripsCount, ['поездке', 'поездках', 'поездках'])}`;
});

const formattedVaultSize = computed(() =>
  formatAttachmentFileSize(vaultStats.value.totalBytes)
);

// Theme appearance options
const themeCards: Array<{
  mode: ThemeMode;
  title: string;
  description: string;
  icon: Component;
}> = [
  {
    mode: 'light',
    title: 'Светлая',
    description: 'Чистый дневной интерфейс',
    icon: Sun,
  },
  {
    mode: 'dark',
    title: 'Тёмная',
    description: 'Комфорт для глаз вечером',
    icon: Moon,
  },
  {
    mode: 'system',
    title: 'Системная',
    description: 'Как в настройках ОС',
    icon: Monitor,
  },
];

const activeThemeCaption = computed(() => {
  if (themeMode.value === 'system') {
    return `Автоматическая синхронизация с ОС — сейчас активна ${isDark.value ? 'тёмная' : 'светлая'} тема`;
  }
  return themeMode.value === 'dark'
    ? 'Включена тёмная тема оформления на этом устройстве'
    : 'Включена светлая тема оформления на этом устройстве';
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

const passwordChecks = computed(() => {
  const pwd = newPassword.value || '';
  return {
    minLength: pwd.length >= 6,
    goodLength: pwd.length >= 10,
    hasMixedCase: /[a-zа-яё]/.test(pwd) && /[A-ZА-ЯЁ]/.test(pwd),
    hasDigit: /\d/.test(pwd),
    hasSymbol: /[^a-zA-Zа-яА-ЯёЁ0-9]/.test(pwd),
  };
});

const passwordStrength = computed(() => {
  const pwd = newPassword.value || '';
  if (!pwd) {
    return {
      score: 0,
      label: '',
      textClass: 'text-slate-400 dark:text-slate-500',
      barClass: 'bg-slate-200 dark:bg-slate-800',
    };
  }

  const c = passwordChecks.value;
  if (!c.minLength) {
    return {
      score: 1,
      label: 'Слишком короткий',
      textClass: 'text-rose-600 dark:text-rose-400',
      barClass: 'bg-rose-500',
    };
  }

  let points = 1;
  const varietyCount =
    (c.hasMixedCase ? 1 : 0) + (c.hasDigit ? 1 : 0) + (c.hasSymbol ? 1 : 0);

  if (pwd.length >= 8 || varietyCount >= 1) points += 1;
  if ((pwd.length >= 8 && varietyCount >= 2) || (c.goodLength && varietyCount >= 1)) points += 1;
  if (
    (c.goodLength && varietyCount >= 2) ||
    (pwd.length >= 12 && varietyCount >= 2) ||
    varietyCount === 3
  ) {
    points += 1;
  }

  const score = Math.min(4, points);

  if (score <= 1) {
    return {
      score: 1,
      label: 'Слабый',
      textClass: 'text-rose-600 dark:text-rose-400',
      barClass: 'bg-rose-500',
    };
  }
  if (score === 2) {
    return {
      score: 2,
      label: 'Средний',
      textClass: 'text-amber-600 dark:text-amber-400',
      barClass: 'bg-amber-500',
    };
  }
  if (score === 3) {
    return {
      score: 3,
      label: 'Хороший',
      textClass: 'text-teal-600 dark:text-teal-400',
      barClass: 'bg-teal-500',
    };
  }
  return {
    score: 4,
    label: 'Надёжный',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    barClass: 'bg-emerald-500',
  };
});

const passwordRuleHints = computed(() => [
  { label: '6+ симв.', met: passwordChecks.value.minLength },
  { label: 'Заглавные и строчные', met: passwordChecks.value.hasMixedCase },
  { label: 'Цифры', met: passwordChecks.value.hasDigit },
  { label: 'Спецсимволы', met: passwordChecks.value.hasSymbol },
]);

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

onMounted(() => {
  tripStore.fetchStats().catch(() => {
    // Non-blocking fallback to zeros
  });
  loadVaultStats();
});
</script>

<template>
  <DashboardLayout>
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <!-- Full-Width Traveler Passport Hero Banner -->
      <section
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 dark:from-teal-700 dark:via-emerald-800 dark:to-cyan-900 p-6 sm:p-8 text-white shadow-card dark:shadow-black/40"
      >
        <!-- Decorative Ambient Layers -->
        <div
          class="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          class="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-cyan-300/15 blur-3xl"
        />
        <Compass
          class="pointer-events-none select-none absolute -right-6 -bottom-8 w-44 h-44 text-white/[0.07] rotate-12"
        />

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <!-- Identity Info -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-2xl sm:text-3xl font-extrabold flex items-center justify-center shrink-0 shadow-lg"
            >
              {{ userInitials }}
            </div>

            <div class="min-w-0 space-y-2">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[11px] font-semibold uppercase tracking-wider text-teal-50"
              >
                <Compass class="w-3.5 h-3.5" />
                <span>Паспорт путешественника</span>
              </div>

              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                {{ authStore.user?.name || 'Путешественник' }}
              </h1>

              <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-teal-50/90">
                <span class="inline-flex items-center gap-1.5 min-w-0">
                  <Mail class="w-4 h-4 shrink-0 text-teal-200" />
                  <span class="truncate">{{ authStore.user?.email }}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 shrink-0">
                  <Calendar class="w-4 h-4 shrink-0 text-teal-200" />
                  <span>В TravelPlanner с {{ formattedCreatedAt }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 3 Compact Live Stats Badges -->
          <div class="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div
              v-for="stat in passportStats"
              :key="stat.key"
              class="rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-3 sm:px-4 sm:py-3.5 min-w-[92px] sm:min-w-[112px] transition-colors"
            >
              <div class="flex items-center gap-1.5 text-teal-100/90 mb-1">
                <component :is="stat.icon" class="w-3.5 h-3.5 shrink-0" />
                <span class="text-[11px] font-medium truncate">{{ stat.label }}</span>
              </div>

              <div
                v-if="tripStore.isLoadingStats && !tripStore.stats"
                class="h-7 w-12 rounded-lg bg-white/20 animate-pulse"
              />
              <p v-else class="text-xl sm:text-2xl font-extrabold text-white leading-tight tabular-nums">
                {{ stat.value }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2-Column Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- LEFT COLUMN -->
        <div class="space-y-6">
          <!-- Card 1: Personal Info -->
          <section
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-7 transition-colors"
          >
            <div class="flex items-start gap-3.5 mb-6">
              <div
                class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0"
              >
                <User class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Личные данные
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Обновите отображаемое имя в вашем профиле и на маршрутах
                </p>
              </div>
            </div>

            <form @submit.prevent="onSaveName" class="space-y-4" novalidate>
              <BaseAlert v-if="nameError" type="error" :message="nameError" />

              <BaseInput
                v-model="name"
                name="name"
                label="Отображаемое имя"
                placeholder="Введите ваше имя"
                :error="nameErrors.name"
                required
                :disabled="isUpdatingName"
              >
                <template #icon>
                  <User class="w-4 h-4" />
                </template>
              </BaseInput>

              <BaseInput
                :modelValue="authStore.user?.email || ''"
                name="email_readonly"
                label="Электронная почта"
                disabled
                hint="Почта закреплена за аккаунтом и используется для входа — изменить её нельзя"
              >
                <template #icon>
                  <Mail class="w-4 h-4" />
                </template>
              </BaseInput>

              <div class="pt-2 flex justify-end sm:justify-start">
                <BaseButton type="submit" variant="primary" :loading="isUpdatingName">
                  Сохранить имя
                </BaseButton>
              </div>
            </form>
          </section>

          <!-- Card 2: Local Document Vault (Privacy-by-Design) -->
          <section
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-7 transition-colors"
          >
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-start gap-3.5 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                >
                  <HardDrive class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Локальный сейф документов
                    </h2>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                    >
                      <LockKeyhole class="w-3 h-3" />
                      Privacy-by-Design
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Файлы билетов, броней и ваучеров хранятся исключительно в
                    <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">IndexedDB</code>
                    этого браузера и никогда не отправляются на сервер.
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="loadVaultStats"
                :disabled="isLoadingVault"
                title="Обновить статистику хранилища"
                aria-label="Обновить статистику хранилища"
                class="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-teal-400 dark:hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
              >
                <RefreshCw :class="['w-4 h-4', isLoadingVault ? 'animate-spin' : '']" />
              </button>
            </div>

            <BaseAlert v-if="vaultError" type="error" :message="vaultError" class="mb-4" />

            <!-- Storage Metrics -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div
                class="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4"
              >
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Сохранено локально
                </p>
                <div
                  v-if="isLoadingVault"
                  class="h-7 w-24 mt-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                />
                <p
                  v-else
                  class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums"
                >
                  {{ vaultStats.filesCount }}
                  <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {{ vaultFilesLabel }}
                  </span>
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {{ vaultTripsSubtext }}
                </p>
              </div>

              <div
                class="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4"
              >
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Занято на устройстве
                </p>
                <div
                  v-if="isLoadingVault"
                  class="h-7 w-20 mt-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                />
                <p
                  v-else
                  class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums"
                >
                  {{ formattedVaultSize }}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  PDF, JPEG, PNG, WEBP до 10 МБ
                </p>
              </div>
            </div>

            <!-- Clear Local Files Action -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                @click="clearVaultDialogOpen = true"
                :disabled="isLoadingVault || isClearingVault || !vaultStats.supported || vaultStats.filesCount === 0"
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:border-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 dark:hover:border-rose-500/40 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <Trash2 class="w-4 h-4 shrink-0" />
                <span>Очистить локальные файлы на этом устройстве</span>
              </button>
            </div>

            <!-- Compact Diagnostics Footer Link -->
            <div
              class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <span class="text-xs text-slate-400 dark:text-slate-500">
                Служебный инструмент каталога стран
              </span>
              <RouterLink
                to="/diagnostics/photos"
                class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
              >
                <span>Диагностика флагов и фото</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </RouterLink>
            </div>
          </section>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="space-y-6">
          <!-- Card 3: Interface Appearance / Theme Picker -->
          <section
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-7 transition-colors"
          >
            <div class="flex items-start gap-3.5 mb-5">
              <div
                class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0"
              >
                <Palette class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Оформление интерфейса
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Выберите предпочитаемую тему — настройка сохраняется мгновенно
                </p>
              </div>
            </div>

            <!-- 3 Visual Preview Mini-Cards -->
            <div
              class="grid grid-cols-1 sm:grid-cols-3 gap-3"
              role="radiogroup"
              aria-label="Выбор темы оформления"
            >
              <button
                v-for="option in themeCards"
                :key="option.mode"
                type="button"
                role="radio"
                :aria-checked="themeMode === option.mode"
                @click="setTheme(option.mode)"
                :class="[
                  'group relative flex flex-col text-left rounded-2xl border p-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
                  themeMode === option.mode
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-500/10 dark:ring-teal-400/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/70',
                ]"
              >
                <!-- Mini UI Preview Window -->
                <div
                  class="relative w-full h-20 rounded-xl overflow-hidden border mb-3 select-none"
                  :class="
                    option.mode === 'dark'
                      ? 'border-slate-700/80 bg-slate-950'
                      : option.mode === 'light'
                        ? 'border-slate-200 bg-slate-100'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100'
                  "
                >
                  <!-- Light Theme Preview -->
                  <div v-if="option.mode === 'light'" class="h-full flex">
                    <div class="w-1/3 bg-white border-r border-slate-200/90 p-1.5 flex flex-col gap-1">
                      <div class="h-2 w-8 rounded bg-teal-500/80" />
                      <div class="h-1.5 w-full rounded bg-slate-200 mt-1" />
                      <div class="h-1.5 w-4/5 rounded bg-teal-100" />
                      <div class="h-1.5 w-3/4 rounded bg-slate-200" />
                    </div>
                    <div class="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-50">
                      <div class="h-3.5 rounded-md bg-gradient-to-r from-teal-500 to-emerald-500" />
                      <div class="flex-1 rounded-md bg-white border border-slate-200/80 p-1.5 space-y-1">
                        <div class="h-1.5 w-3/4 rounded bg-slate-300" />
                        <div class="h-1.5 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>

                  <!-- Dark Theme Preview -->
                  <div v-else-if="option.mode === 'dark'" class="h-full flex">
                    <div class="w-1/3 bg-slate-900 border-r border-slate-800 p-1.5 flex flex-col gap-1">
                      <div class="h-2 w-8 rounded bg-teal-400/90" />
                      <div class="h-1.5 w-full rounded bg-slate-700 mt-1" />
                      <div class="h-1.5 w-4/5 rounded bg-teal-500/30" />
                      <div class="h-1.5 w-3/4 rounded bg-slate-700" />
                    </div>
                    <div class="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-950">
                      <div class="h-3.5 rounded-md bg-gradient-to-r from-teal-600 to-emerald-600" />
                      <div class="flex-1 rounded-md bg-slate-900 border border-slate-800 p-1.5 space-y-1">
                        <div class="h-1.5 w-3/4 rounded bg-slate-600" />
                        <div class="h-1.5 w-1/2 rounded bg-slate-700" />
                      </div>
                    </div>
                  </div>

                  <!-- System Theme Split Preview -->
                  <div v-else class="h-full grid grid-cols-2">
                    <!-- Left Half Light -->
                    <div class="bg-slate-50 p-1.5 flex flex-col gap-1.5 border-r border-slate-300/80">
                      <div class="h-3 rounded bg-teal-500" />
                      <div class="flex-1 rounded bg-white border border-slate-200 p-1 space-y-1">
                        <div class="h-1.5 w-4/5 rounded bg-slate-300" />
                        <div class="h-1.5 w-3/5 rounded bg-slate-200" />
                      </div>
                    </div>
                    <!-- Right Half Dark -->
                    <div class="bg-slate-950 p-1.5 flex flex-col gap-1.5">
                      <div class="h-3 rounded bg-teal-400/80" />
                      <div class="flex-1 rounded bg-slate-900 border border-slate-800 p-1 space-y-1">
                        <div class="h-1.5 w-4/5 rounded bg-slate-600" />
                        <div class="h-1.5 w-3/5 rounded bg-slate-700" />
                      </div>
                    </div>
                  </div>

                  <!-- Active Check Pill -->
                  <span
                    v-if="themeMode === option.mode"
                    class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-950 flex items-center justify-center shadow"
                  >
                    <Check class="w-3 h-3 stroke-[3]" />
                  </span>
                </div>

                <!-- Card Title & Subtitle -->
                <div class="flex items-center gap-1.5">
                  <component
                    :is="option.icon"
                    :class="[
                      'w-4 h-4 shrink-0',
                      themeMode === option.mode
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400 dark:text-slate-500',
                    ]"
                  />
                  <span
                    :class="[
                      'text-sm font-semibold',
                      themeMode === option.mode
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-slate-800 dark:text-slate-200',
                    ]"
                  >
                    {{ option.title }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {{ option.description }}
                </p>
              </button>
            </div>

            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="isDark ? 'bg-teal-400' : 'bg-emerald-500'"
              />
              <span>{{ activeThemeCaption }}</span>
            </p>
          </section>

          <!-- Card 4: Security & Password -->
          <section
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-6 sm:p-7 transition-colors"
          >
            <div class="flex items-start gap-3.5 mb-6">
              <div
                class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0"
              >
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Безопасность и пароль
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Подтвердите текущий пароль, чтобы установить новый
                </p>
              </div>
            </div>

            <form @submit.prevent="onSavePassword" class="space-y-4" novalidate>
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

              <div class="space-y-2.5">
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

                <!-- Password Strength Indicator -->
                <div
                  class="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-3 space-y-2"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500 dark:text-slate-400 font-medium">
                      Надёжность нового пароля
                    </span>
                    <span
                      v-if="passwordStrength.score > 0"
                      :class="['font-semibold', passwordStrength.textClass]"
                    >
                      {{ passwordStrength.label }}
                    </span>
                    <span v-else class="text-slate-400 dark:text-slate-500">
                      Введите пароль
                    </span>
                  </div>

                  <!-- 4 Strength Bars -->
                  <div class="grid grid-cols-4 gap-1.5">
                    <div
                      v-for="segment in 4"
                      :key="segment"
                      :class="[
                        'h-1.5 rounded-full transition-colors duration-200',
                        segment <= passwordStrength.score
                          ? passwordStrength.barClass
                          : 'bg-slate-200 dark:bg-slate-700/80',
                      ]"
                    />
                  </div>

                  <!-- Requirement Chips -->
                  <div class="flex flex-wrap gap-1.5 pt-0.5">
                    <span
                      v-for="rule in passwordRuleHints"
                      :key="rule.label"
                      :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors',
                        rule.met
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                      ]"
                    >
                      <Check v-if="rule.met" class="w-3 h-3 stroke-[2.5]" />
                      <span>{{ rule.label }}</span>
                    </span>
                  </div>
                </div>
              </div>

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

              <div class="pt-2 flex justify-end sm:justify-start">
                <BaseButton type="submit" variant="primary" :loading="isUpdatingPassword">
                  Обновить пароль
                </BaseButton>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>

    <!-- Clear Local Vault Confirmation Modal -->
    <ConfirmDialog
      :open="clearVaultDialogOpen"
      title="Очистить локальный сейф?"
      :message="`Будут безвозвратно удалены все ${vaultStats.filesCount} ${vaultFilesLabel} (${formattedVaultSize}) из локального хранилища IndexedDB этого браузера. Сами карточки документов в поездках останутся на месте.`"
      confirmText="Очистить файлы"
      cancelText="Отмена"
      :loading="isClearingVault"
      @confirm="handleConfirmClearVault"
      @cancel="clearVaultDialogOpen = false"
    />
  </DashboardLayout>
</template>
