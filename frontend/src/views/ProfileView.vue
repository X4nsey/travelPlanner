<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Component } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  User,
  Mail,
  Calendar,
  Lock,
  ShieldCheck,
  Settings,
  LogOut,
  Map,
  Globe2,
  CalendarDays,
  HardDrive,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  FileText,
  FolderOpen,
  Database,
} from 'lucide-vue-next';
import {
  profileNameValidationSchema,
  passwordChangeValidationSchema,
} from '@/schemas/validation';
import { useAuthStore } from '@/stores/auth.store';
import { useTripStore } from '@/stores/trip.store';
import { useCountryStore } from '@/stores/country.store';
import { usePackingStore } from '@/stores/packing.store';
import { useWeatherStore } from '@/stores/weather.store';
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

type ProfileTab = 'settings' | 'documents' | 'security';

const router = useRouter();
const authStore = useAuthStore();
const tripStore = useTripStore();
const countryStore = useCountryStore();
const packingStore = usePackingStore();
const weatherStore = useWeatherStore();
const documentStore = useDocumentStore();
const toastStore = useToastStore();
const { themeMode, isDark, setTheme } = useTheme();

const activeTab = ref<ProfileTab>('settings');

const menuTabs = computed<
  Array<{
    id: ProfileTab;
    label: string;
    mobileLabel: string;
    title: string;
    subtitle: string;
    icon: Component;
    badge?: number;
  }>
>(() => [
  {
    id: 'settings',
    label: 'Настройки',
    mobileLabel: 'Настройки',
    title: 'Настройки',
    subtitle: 'Статистика путешественника, личные данные и тема оформления',
    icon: Settings,
  },
  {
    id: 'documents',
    label: 'Документы на устройстве',
    mobileLabel: 'Документы',
    title: 'Документы на устройстве',
    subtitle: 'Локально сохранённые билеты, брони и ваучеры в этом браузере',
    icon: HardDrive,
    badge: vaultStats.value.filesCount > 0 ? vaultStats.value.filesCount : undefined,
  },
  {
    id: 'security',
    label: 'Безопасность',
    mobileLabel: 'Безопасность',
    title: 'Безопасность',
    subtitle: 'Управление паролем и защитой вашего аккаунта',
    icon: ShieldCheck,
  },
]);

const currentTabMeta = computed(
  () => menuTabs.value.find((tab) => tab.id === activeTab.value) || menuTabs.value[0]
);

// Traveler identity & stats
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

const travelerStats = computed(() => [
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
    toastStore.success('Изменения профиля сохранены');
  } catch (err: any) {
    nameError.value = err?.message || 'Не удалось обновить имя';
  } finally {
    isUpdatingName.value = false;
  }
});

// Theme appearance switcher
const themeOptions: Array<{ mode: ThemeMode; label: string; icon: Component }> = [
  { mode: 'light', label: 'Светлая', icon: Sun },
  { mode: 'dark', label: 'Тёмная', icon: Moon },
  { mode: 'system', label: 'Системная', icon: Monitor },
];

const activeThemeCaption = computed(() => {
  if (themeMode.value === 'system') {
    return `Подстраивается под систему — сейчас активна ${isDark.value ? 'тёмная' : 'светлая'} тема`;
  }
  return themeMode.value === 'dark'
    ? 'Активна тёмная тема на этом устройстве'
    : 'Активна светлая тема на этом устройстве';
});

// Local document storage on device
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
    vaultError.value = err?.message || 'Не удалось очистить локальные файлы';
    toastStore.error('Ошибка очистки локального хранилища');
  } finally {
    isClearingVault.value = false;
  }
}

const vaultFilesLabel = computed(() =>
  pluralizeRu(vaultStats.value.filesCount, ['файл', 'файла', 'файлов'])
);

const vaultTripsLabel = computed(() =>
  pluralizeRu(vaultStats.value.tripsCount, ['поездка', 'поездки', 'поездок'])
);

const formattedVaultSize = computed(() =>
  formatAttachmentFileSize(vaultStats.value.totalBytes)
);

// Password change form
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

// Logout handler
const isLoggingOut = ref(false);

async function handleLogout() {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  try {
    await authStore.logout();
    tripStore.clearState();
    countryStore.clearFavoritesState();
    packingStore.clearState();
    weatherStore.clearState();
    documentStore.clearState();
    toastStore.info('Вы вышли из аккаунта');
    router.push('/login');
  } finally {
    isLoggingOut.value = false;
  }
}

onMounted(() => {
  tripStore.fetchStats().catch(() => {
    // Non-blocking fallback to zeros
  });
  loadVaultStats();
});
</script>

<template>
  <DashboardLayout>
    <div class="max-w-5xl mx-auto animate-fade-in">
      <div class="flex flex-col lg:flex-row items-start gap-6 lg:gap-7">
        <!-- Left Column: Compact Sticky Sidebar Menu Card -->
        <aside class="w-full lg:w-64 shrink-0">
          <div
            class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-2.5 lg:sticky lg:top-24"
          >
            <!-- Mini User Plate -->
            <div
              class="flex items-center justify-between gap-2.5 px-2.5 py-2.5 mb-2 border-b border-slate-100 dark:border-slate-800/80"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm"
                >
                  {{ userInitials }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {{ authStore.user?.name || 'Путешественник' }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {{ authStore.user?.email }}
                  </p>
                </div>
              </div>

              <!-- Mobile Quick Logout Button -->
              <button
                type="button"
                @click="handleLogout"
                :disabled="isLoggingOut"
                aria-label="Выйти из аккаунта"
                class="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 transition-colors shrink-0 disabled:opacity-50"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            </div>

            <!-- Menu Tabs (Horizontal strip on mobile, Vertical stack on desktop) -->
            <nav
              class="flex lg:flex-col gap-1 overflow-x-auto"
              role="tablist"
              aria-label="Разделы профиля"
            >
              <button
                v-for="tab in menuTabs"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'group flex-1 lg:flex-none flex items-center justify-center lg:justify-between gap-2 px-3 py-2 lg:py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors duration-150',
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-500/15 dark:text-teal-300 dark:ring-1 dark:ring-inset dark:ring-teal-500/25'
                    : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                ]"
              >
                <span class="flex items-center gap-2.5 min-w-0">
                  <component
                    :is="tab.icon"
                    :class="[
                      'w-4 h-4 shrink-0 transition-colors',
                      activeTab === tab.id
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                    ]"
                  />
                  <span class="sm:hidden">{{ tab.mobileLabel }}</span>
                  <span class="hidden sm:inline truncate">{{ tab.label }}</span>
                </span>

                <span
                  v-if="tab.badge"
                  :class="[
                    'hidden lg:inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums',
                    activeTab === tab.id
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/25 dark:text-teal-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  ]"
                >
                  {{ tab.badge }}
                </span>
              </button>
            </nav>

            <!-- Desktop Divider & Logout Button -->
            <div class="hidden lg:block mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="handleLogout"
                :disabled="isLoggingOut"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                <LogOut class="w-4 h-4 shrink-0" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Right Column: Active Section Content -->
        <div class="flex-1 min-w-0 w-full space-y-5">
          <!-- Section Heading -->
          <header class="space-y-1">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {{ currentTabMeta.title }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ currentTabMeta.subtitle }}
            </p>
          </header>

          <!-- TAB 1: SETTINGS -->
          <div v-if="activeTab === 'settings'" role="tabpanel" class="space-y-5 animate-fade-in">
            <!-- Compact Traveler Stats Row Card -->
            <section
              class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="grid grid-cols-3 gap-3 sm:gap-5 flex-1">
                  <div
                    v-for="stat in travelerStats"
                    :key="stat.key"
                    class="flex items-center gap-2.5 min-w-0"
                  >
                    <div
                      class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0"
                    >
                      <component :is="stat.icon" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <div
                        v-if="tripStore.isLoadingStats && !tripStore.stats"
                        class="h-6 w-10 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"
                      />
                      <p
                        v-else
                        class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tabular-nums"
                      >
                        {{ stat.value }}
                      </p>
                      <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {{ stat.label }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 pt-3 sm:pt-0 sm:pl-5 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shrink-0"
                >
                  <Calendar class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-none">
                      Дата регистрации
                    </p>
                    <p class="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                      {{ formattedCreatedAt }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Personal Info Card -->
            <section
              class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6"
            >
              <div class="mb-5">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Личные данные
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Отображаемое имя используется в личном кабинете и на ваших маршрутах
                </p>
              </div>

              <form @submit.prevent="onSaveName" class="space-y-4" novalidate>
                <BaseAlert v-if="nameError" type="error" :message="nameError" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
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
                    hint="Почта закреплена за аккаунтом для входа — изменить её нельзя"
                  >
                    <template #icon>
                      <Mail class="w-4 h-4" />
                    </template>
                  </BaseInput>
                </div>

                <div class="pt-1 flex justify-end sm:justify-start">
                  <BaseButton type="submit" variant="primary" :loading="isUpdatingName">
                    Сохранить изменения
                  </BaseButton>
                </div>
              </form>
            </section>

            <!-- Theme Appearance Compact Bar Card -->
            <section
              class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="min-w-0">
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Тема оформления
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ activeThemeCaption }}
                  </p>
                </div>

                <div
                  class="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 w-full sm:w-auto shrink-0"
                  role="radiogroup"
                  aria-label="Выбор темы оформления"
                >
                  <button
                    v-for="opt in themeOptions"
                    :key="`profile-theme-${opt.mode}`"
                    type="button"
                    role="radio"
                    :aria-checked="themeMode === opt.mode"
                    @click="setTheme(opt.mode)"
                    :class="[
                      'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-colors duration-150',
                      themeMode === opt.mode
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700'
                        : 'text-slate-600 hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:text-slate-100',
                    ]"
                  >
                    <component
                      :is="opt.icon"
                      :class="[
                        'w-4 h-4 shrink-0',
                        themeMode === opt.mode
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-400 dark:text-slate-500',
                      ]"
                    />
                    <span>{{ opt.label }}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- TAB 2: LOCAL DOCUMENTS ON DEVICE -->
          <div v-else-if="activeTab === 'documents'" role="tabpanel" class="space-y-5 animate-fade-in">
            <section
              class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6"
            >
              <div class="flex items-start justify-between gap-3 mb-5">
                <div class="flex items-start gap-3.5 min-w-0">
                  <div
                    class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                  >
                    <HardDrive class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      Локальное хранилище билетов и броней
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Ваши билеты, сканы и ваучеры хранятся только в этом браузере и никогда не отправляются на сервер.
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

              <BaseAlert
                v-if="!isLoadingVault && !vaultStats.supported"
                type="info"
                message="Локальное хранилище файлов недоступно в текущем режиме браузера."
                class="mb-4"
              />

              <!-- 3 Storage Metrics -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div
                  class="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4"
                >
                  <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <FileText class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Сохранено файлов</span>
                  </div>
                  <div
                    v-if="isLoadingVault"
                    class="h-7 w-20 mt-2 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                  />
                  <p
                    v-else
                    class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 tabular-nums"
                  >
                    {{ vaultStats.filesCount }}
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {{ vaultFilesLabel }}
                    </span>
                  </p>
                </div>

                <div
                  class="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4"
                >
                  <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <FolderOpen class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Связанных поездок</span>
                  </div>
                  <div
                    v-if="isLoadingVault"
                    class="h-7 w-20 mt-2 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                  />
                  <p
                    v-else
                    class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 tabular-nums"
                  >
                    {{ vaultStats.tripsCount }}
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {{ vaultTripsLabel }}
                    </span>
                  </p>
                </div>

                <div
                  class="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4"
                >
                  <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Database class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Занятый объём</span>
                  </div>
                  <div
                    v-if="isLoadingVault"
                    class="h-7 w-20 mt-2 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                  />
                  <p
                    v-else
                    class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 tabular-nums"
                  >
                    {{ formattedVaultSize }}
                  </p>
                </div>
              </div>

              <!-- Clear Local Files Action -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  @click="clearVaultDialogOpen = true"
                  :disabled="
                    isLoadingVault ||
                    isClearingVault ||
                    !vaultStats.supported ||
                    vaultStats.filesCount === 0
                  "
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:border-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 dark:hover:border-rose-500/40 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <Trash2 class="w-4 h-4 shrink-0" />
                  <span>Очистить локальные файлы на этом устройстве</span>
                </button>

                <span class="text-xs text-slate-400 dark:text-slate-500">
                  PDF, JPEG, PNG, WEBP до 10 МБ
                </span>
              </div>

              <!-- Utility Diagnostics Link -->
              <div
                class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <span class="text-xs text-slate-400 dark:text-slate-500">
                  Служебный инструмент каталога стран
                </span>
                <RouterLink
                  to="/diagnostics/photos"
                  class="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                >
                  <span>Диагностика фото каталога</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </RouterLink>
              </div>
            </section>
          </div>

          <!-- TAB 3: SECURITY -->
          <div v-else role="tabpanel" class="space-y-5 animate-fade-in">
            <section
              class="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-none p-5 sm:p-6"
            >
              <div class="flex items-start gap-3.5 mb-5">
                <div
                  class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0"
                >
                  <ShieldCheck class="w-5 h-5" />
                </div>
                <div>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Смена пароля
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Подтвердите текущий пароль, чтобы установить новый
                  </p>
                </div>
              </div>

              <form @submit.prevent="onSavePassword" class="space-y-4 max-w-xl" novalidate>
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
                    class="rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-3 space-y-2"
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

                <div class="pt-1 flex justify-end sm:justify-start">
                  <BaseButton type="submit" variant="primary" :loading="isUpdatingPassword">
                    Обновить пароль
                  </BaseButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Local Documents Confirmation Modal -->
    <ConfirmDialog
      :open="clearVaultDialogOpen"
      title="Очистить локальные файлы?"
      :message="`Будут безвозвратно удалены все ${vaultStats.filesCount} ${vaultFilesLabel} (${formattedVaultSize}) из памяти этого браузера. Сами карточки документов в поездках останутся на месте.`"
      confirmText="Очистить файлы"
      cancelText="Отмена"
      :loading="isClearingVault"
      @confirm="handleConfirmClearVault"
      @cancel="clearVaultDialogOpen = false"
    />
  </DashboardLayout>
</template>
