<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  Lock,
  RefreshCw,
  Share2,
  ShieldCheck,
} from 'lucide-vue-next';
import { tripService } from '@/services/trip.service';
import { useToastStore } from '@/stores/toast.store';
import { pluralizeRu } from '@/composables/useFormatters';
import type { Trip, TripShareSettings, UpdateTripSharePayload } from '@/types';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';

interface Props {
  open: boolean;
  trip: Trip | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const toastStore = useToastStore();

const share = ref<TripShareSettings | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const isRegenerating = ref(false);
const confirmRegenerate = ref(false);
const copied = ref(false);
const error = ref<string | null>(null);

// Local toggle states (used both before first creation and synced with backend)
const showItinerary = ref(true);
const showPackingList = ref(true);
const showCountryInfo = ref(true);
const showExpenses = ref(false);

let copyTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearCopyTimer() {
  if (copyTimeoutId) {
    clearTimeout(copyTimeoutId);
    copyTimeoutId = null;
  }
}

onBeforeUnmount(() => {
  clearCopyTimer();
});

const isActive = computed(() => Boolean(share.value?.isActive));

const shareUrl = computed(() => {
  if (!share.value?.token || typeof window === 'undefined') return '';
  return `${window.location.origin}/shared/${share.value.token}`;
});

const viewsLabel = computed(() => {
  const count = share.value?.viewsCount ?? 0;
  return `${count} ${pluralizeRu(count, ['просмотр', 'просмотра', 'просмотров'])}`;
});

function syncLocalFields(next: TripShareSettings | null) {
  if (!next) {
    showItinerary.value = true;
    showPackingList.value = true;
    showCountryInfo.value = true;
    showExpenses.value = false;
    return;
  }
  showItinerary.value = next.showItinerary;
  showPackingList.value = next.showPackingList;
  showCountryInfo.value = next.showCountryInfo;
  showExpenses.value = next.showExpenses;
}

async function loadShareSettings() {
  if (!props.trip) return;
  isLoading.value = true;
  error.value = null;
  confirmRegenerate.value = false;
  copied.value = false;
  clearCopyTimer();

  try {
    const data = await tripService.getTripShare(props.trip.id);
    share.value = data;
    syncLocalFields(data);
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить настройки публичного доступа';
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => [props.open, props.trip?.id] as const,
  ([isOpen, tripId]) => {
    if (isOpen && tripId) {
      loadShareSettings();
    } else if (!isOpen) {
      confirmRegenerate.value = false;
      copied.value = false;
      clearCopyTimer();
    }
  },
  { immediate: true }
);

async function persistSettings(payload: UpdateTripSharePayload, successMessage?: string) {
  if (!props.trip) return;
  isSaving.value = true;
  error.value = null;
  try {
    const res = await tripService.updateTripShare(props.trip.id, payload);
    share.value = res.share;
    syncLocalFields(res.share);
    if (successMessage) {
      toastStore.success(successMessage);
    }
  } catch (err: any) {
    error.value = err?.message || 'Не удалось сохранить настройки доступа';
    syncLocalFields(share.value);
  } finally {
    isSaving.value = false;
  }
}

async function handleToggleActive() {
  if (isSaving.value || isLoading.value || !props.trip) return;
  const nextActive = !isActive.value;
  confirmRegenerate.value = false;

  if (!share.value && nextActive) {
    await persistSettings(
      {
        isActive: true,
        showItinerary: showItinerary.value,
        showPackingList: showPackingList.value,
        showCountryInfo: showCountryInfo.value,
        showExpenses: showExpenses.value,
      },
      'Публичная ссылка создана и активна'
    );
    return;
  }

  await persistSettings(
    { isActive: nextActive },
    nextActive ? 'Доступ по ссылке открыт' : 'Доступ по ссылке закрыт'
  );
}

async function handleTogglePermission(
  field: 'showItinerary' | 'showPackingList' | 'showCountryInfo' | 'showExpenses',
  nextValue: boolean
) {
  if (field === 'showItinerary') showItinerary.value = nextValue;
  if (field === 'showPackingList') showPackingList.value = nextValue;
  if (field === 'showCountryInfo') showCountryInfo.value = nextValue;
  if (field === 'showExpenses') showExpenses.value = nextValue;

  if (!share.value) {
    return;
  }

  await persistSettings({ [field]: nextValue });
}

async function handleCopyLink() {
  if (!shareUrl.value) return;

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(shareUrl.value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl.value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    copied.value = true;
    clearCopyTimer();
    copyTimeoutId = setTimeout(() => {
      copied.value = false;
    }, 2500);
    toastStore.success('Ссылка скопирована в буфер обмена');
  } catch {
    toastStore.error('Не удалось скопировать ссылку', 'Скопируйте адрес вручную из поля');
  }
}

async function handleRegenerateLink() {
  if (!props.trip || isRegenerating.value) return;
  isRegenerating.value = true;
  error.value = null;
  try {
    const res = await tripService.regenerateTripShare(props.trip.id);
    share.value = res.share;
    syncLocalFields(res.share);
    confirmRegenerate.value = false;
    copied.value = false;
    toastStore.success(
      'Ссылка обновлена',
      'Прежняя ссылка отозвана и больше недействительна'
    );
  } catch (err: any) {
    error.value = err?.message || 'Не удалось обновить ссылку доступа';
  } finally {
    isRegenerating.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Поделиться маршрутом"
    maxWidth="lg"
    @close="emit('close')"
  >
    <div v-if="isLoading" class="py-8">
      <BaseSpinner label="Загружаем настройки доступа..." />
    </div>

    <div v-else-if="trip" class="space-y-5">
      <BaseAlert v-if="error" type="error" :message="error" />

      <!-- Trip Context Card -->
      <div class="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 p-3.5 flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0"
        >
          <Share2 class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ trip.title }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ trip.country }}, {{ trip.city }} · Публичный просмотр для попутчиков без регистрации
          </p>
        </div>
      </div>

      <!-- Master Toggle: Public Link Access -->
      <div
        class="rounded-2xl border p-4 transition-colors"
        :class="
          isActive
            ? 'bg-teal-50/40 dark:bg-teal-500/10 border-teal-200/80 dark:border-teal-500/30'
            : 'bg-white dark:bg-slate-800/50 border-slate-200/90 dark:border-slate-700/80'
        "
      >
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-slate-900 dark:text-slate-100">Доступ по ссылке</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border"
                :class="
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                "
              >
                {{ isActive ? 'Активна' : 'Отключена' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{
                isActive
                  ? 'Любой человек с этой ссылкой сможет просматривать выбранные разделы и сохранить копию себе.'
                  : 'Включите доступ, чтобы получить уникальную ссылку для друзей и попутчиков.'
              }}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            :aria-checked="isActive"
            aria-label="Доступ по ссылке"
            :disabled="isSaving || isRegenerating"
            @click="handleToggleActive"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
            :class="isActive ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="isActive ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Active Share Link Box -->
        <div v-if="share && isActive" class="mt-4 pt-4 border-t border-teal-200/60 dark:border-teal-500/25 space-y-3">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div class="relative flex-1 min-w-0">
              <Link2
                class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                readonly
                :value="shareUrl"
                aria-label="Публичная ссылка на маршрут"
                class="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 select-all"
                @focus="($event.target as HTMLInputElement)?.select()"
              />
            </div>

            <BaseButton
              :variant="copied ? 'secondary' : 'primary'"
              size="md"
              class="shrink-0"
              @click="handleCopyLink"
            >
              <Check v-if="copied" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <Copy v-else class="w-4 h-4" />
              <span>{{ copied ? 'Скопировано!' : 'Копировать' }}</span>
            </BaseButton>
          </div>

          <!-- Stats & Link Actions Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 font-semibold"
              >
                <Eye class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{{ viewsLabel }}</span>
              </span>

              <a
                :href="shareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
              >
                <span>Открыть</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              v-if="!confirmRegenerate"
              type="button"
              :disabled="isSaving || isRegenerating"
              @click="confirmRegenerate = true"
              class="inline-flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              <span>Обновить ссылку</span>
            </button>
          </div>

          <!-- Inline Confirmation for Regenerating / Revoking Old Link -->
          <div
            v-if="confirmRegenerate"
            class="rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30 p-3 space-y-2.5"
          >
            <div class="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Старая ссылка сразу перестанет работать для всех, кому вы её отправляли. Создать новую?
              </span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <BaseButton
                variant="outline"
                size="sm"
                :disabled="isRegenerating"
                @click="confirmRegenerate = false"
              >
                Отмена
              </BaseButton>
              <BaseButton
                variant="primary"
                size="sm"
                :loading="isRegenerating"
                @click="handleRegenerateLink"
              >
                <RefreshCw class="w-3.5 h-3.5" />
                <span>Да, обновить ссылку</span>
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Paused Link Notice -->
        <div
          v-else-if="share && !isActive"
          class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
          <span>Публичный доступ сейчас закрыт — по прежней ссылке показывается экран «404».</span>
          <span class="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <Eye class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{{ viewsLabel }}</span>
          </span>
        </div>
      </div>

      <!-- Visibility Permissions Section -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Видимость разделов для попутчиков
          </p>
          <span v-if="isSaving" class="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            Сохраняем...
          </span>
        </div>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/20 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="showItinerary"
            :disabled="isSaving || isRegenerating"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            @change="handleTogglePermission('showItinerary', ($event.target as HTMLInputElement).checked)"
          />
          <div class="flex items-start gap-2.5 flex-1 min-w-0">
            <CalendarDays class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">План по дням</span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">
                Расписание мероприятий, время, адреса локаций и заметки к событиям.
              </span>
            </div>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/20 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="showPackingList"
            :disabled="isSaving || isRegenerating"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            @change="handleTogglePermission('showPackingList', ($event.target as HTMLInputElement).checked)"
          />
          <div class="flex items-start gap-2.5 flex-1 min-w-0">
            <Briefcase class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">Список вещей</span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">
                Попутчики увидят список без ваших отметок и смогут отмечать сборы у себя в браузере.
              </span>
            </div>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-200 dark:hover:border-teal-500/40 hover:bg-teal-50/20 dark:hover:bg-teal-500/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="showCountryInfo"
            :disabled="isSaving || isRegenerating"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            @change="handleTogglePermission('showCountryInfo', ($event.target as HTMLInputElement).checked)"
          />
          <div class="flex items-start gap-2.5 flex-1 min-w-0">
            <BookOpen class="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">Памятка о стране</span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">
                Правила въезда, оплата, транспорт, связь, экстренные службы и практические советы.
              </span>
            </div>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-200 dark:hover:border-amber-500/40 hover:bg-amber-50/20 dark:hover:bg-amber-500/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="showExpenses"
            :disabled="isSaving || isRegenerating"
            class="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-teal-600 focus:ring-teal-500"
            @change="handleTogglePermission('showExpenses', ($event.target as HTMLInputElement).checked)"
          />
          <div class="flex items-start gap-2.5 flex-1 min-w-0">
            <Coins class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Бюджет и расходы</span>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Lock class="w-2.5 h-2.5" />
                  Скрыто по умолчанию
                </span>
              </div>
              <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Планируемый бюджет, сводка по категориям и список зафиксированных трат.
              </span>
            </div>
          </div>
        </label>
      </div>

      <!-- Privacy-by-Design Banner -->
      <div
        class="rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 p-4 flex items-start gap-3"
      >
        <div
          class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5"
        >
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div class="space-y-1 text-xs leading-relaxed text-emerald-950 dark:text-emerald-200/90">
          <p class="font-bold text-emerald-900 dark:text-emerald-200">Защита приватности (Privacy-by-Design)</p>
          <p>
            Брони, чек-лист документов и локальные файлы из вашего браузера никогда не передаются по публичной ссылке. Ваш email, имя аккаунта и внутренние идентификаторы также скрыты.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="primary" @click="emit('close')">
        Готово
      </BaseButton>
    </template>
  </BaseModal>
</template>
