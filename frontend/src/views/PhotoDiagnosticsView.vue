<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Edit3,
  Sparkles,
  ExternalLink,
  Filter,
  MapPin,
  X,
  Pin,
  RotateCcw,
  Copy,
} from 'lucide-vue-next';
import AdaptiveLayout from '@/layouts/AdaptiveLayout.vue';
import SmartImage, { clearSmartImageCache } from '@/components/ui/SmartImage.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { countryService } from '@/services/country.service';
import { useCountryStore } from '@/stores/country.store';
import { useToastStore } from '@/stores/toast.store';
import type { PhotoDiagnosticItem, PhotoDiagnosticsReport } from '@/types';

const countryStore = useCountryStore();
const toastStore = useToastStore();

const report = ref<PhotoDiagnosticsReport | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');

// Filters
const searchQuery = ref('');
const selectedCountry = ref('all');
const selectedSection = ref('all');
const selectedStatus = ref('all');
const currentPage = ref(1);
const pageSize = 24;

// Track live client-side image load status
const clientLoadErrors = ref<Set<string>>(new Set());
const clientLoadedIds = ref<Set<string>>(new Set());

// Action states
const processingItemId = ref<string | null>(null);
const editingItem = ref<PhotoDiagnosticItem | null>(null);
const editForm = ref({
  url: '',
  thumbUrl: '',
  objectName: '',
  cityName: '',
  authorName: '',
  sourceName: 'Wikimedia Commons',
  sourceUrl: '',
  license: 'CC BY-SA 4.0',
});
const isSavingReplacement = ref(false);
const modalErrorMessage = ref('');

async function loadDiagnostics() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const data = await countryService.getPhotoDiagnostics();
    report.value = data;
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Не удалось загрузить отчёт диагностики изображений';
  } finally {
    isLoading.value = false;
  }
}

const countryOptions = computed(() => {
  if (!report.value) return [];
  const map = new Map<string, { slug: string; nameRu: string; flagEmoji: string }>();
  for (const item of report.value.items) {
    if (!map.has(item.countrySlug)) {
      map.set(item.countrySlug, {
        slug: item.countrySlug,
        nameRu: item.countryNameRu,
        flagEmoji: item.flagEmoji,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.nameRu.localeCompare(b.nameRu, 'ru'));
});

const filteredItems = computed(() => {
  if (!report.value) return [];
  const q = searchQuery.value.trim().toLowerCase();

  return report.value.items.filter((item) => {
    if (selectedCountry.value !== 'all' && item.countrySlug !== selectedCountry.value) {
      return false;
    }
    if (selectedSection.value !== 'all' && item.targetType !== selectedSection.value) {
      return false;
    }
    if (selectedStatus.value !== 'all') {
      if (selectedStatus.value === 'duplicate') {
        if (!item.isDuplicate) return false;
      } else if (selectedStatus.value === 'manual') {
        if (!item.manualOverride) return false;
      } else if (selectedStatus.value === 'error') {
        if (
          item.verificationStatus !== 'broken' &&
          item.verificationStatus !== 'rejected' &&
          !clientLoadErrors.value.has(item.id)
        ) {
          return false;
        }
      } else if (item.verificationStatus !== selectedStatus.value) {
        return false;
      }
    }
    if (q) {
      const hay = `${item.countryNameRu} ${item.countryNameEn} ${item.objectName} ${item.cityName} ${item.authorName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / pageSize))
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredItems.value.slice(start, start + pageSize);
});

watch([searchQuery, selectedCountry, selectedSection, selectedStatus], () => {
  currentPage.value = 1;
});

const liveStats = computed(() => {
  const base = report.value?.summary;
  if (!base) {
    return {
      totalImages: 0,
      verifiedCount: 0,
      missingCount: 0,
      errorCount: 0,
      needsReviewCount: 0,
    };
  }
  const runtimeErrors = clientLoadErrors.value.size;
  return {
    totalImages: base.totalImages,
    verifiedCount: Math.max(0, base.verifiedCount - runtimeErrors),
    missingCount: base.missingCount,
    errorCount: base.errorCount + runtimeErrors,
    needsReviewCount: base.needsReviewCount,
  };
});

function handleImgLoaded(id: string) {
  clientLoadedIds.value.add(id);
  clientLoadErrors.value.delete(id);
}

function handleImgError(id: string) {
  clientLoadErrors.value.add(id);
}

function openReplaceModal(item: PhotoDiagnosticItem) {
  editingItem.value = item;
  modalErrorMessage.value = '';
  editForm.value = {
    url: item.url,
    thumbUrl: item.thumbUrl || item.url,
    objectName: item.objectName,
    cityName: item.cityName,
    authorName: item.authorName || 'Wikimedia Commons',
    sourceName: item.sourceName || 'Wikimedia Commons',
    sourceUrl: item.sourceUrl || '',
    license: item.license || 'CC BY-SA 4.0',
  };
}

function closeReplaceModal() {
  editingItem.value = null;
  modalErrorMessage.value = '';
}

async function submitReplacement() {
  if (!editingItem.value) return;
  isSavingReplacement.value = true;
  modalErrorMessage.value = '';
  try {
    const cleanMainUrl = editForm.value.url.trim();
    const targetThumb =
      cleanMainUrl !== editingItem.value.url && editForm.value.thumbUrl === editingItem.value.thumbUrl
        ? cleanMainUrl
        : (editForm.value.thumbUrl?.trim() || cleanMainUrl);

    await countryService.replacePhoto({
      countrySlug: editingItem.value.countrySlug,
      targetType: editingItem.value.targetType,
      targetKey: editingItem.value.targetKey,
      url: cleanMainUrl,
      thumbUrl: targetThumb,
      objectName: editForm.value.objectName,
      cityName: editForm.value.cityName,
      authorName: editForm.value.authorName,
      sourceName: editForm.value.sourceName,
      sourceUrl: editForm.value.sourceUrl,
      license: editForm.value.license,
    });
    toastStore.show('Фотография проверена и успешно сохранена в базу данных', 'success');
    clearSmartImageCache();
    await countryStore.ensureCountriesLoaded(true);
    await countryStore.fetchCountryDetail(editingItem.value.countrySlug);
    await loadDiagnostics();
    closeReplaceModal();
  } catch (err: any) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Фотография не прошла гео-проверку соответствия стране или произошла ошибка записи в БД';
    modalErrorMessage.value = msg;
    toastStore.show(msg, 'error');
  } finally {
    isSavingReplacement.value = false;
  }
}

async function handleResetOverride(item: PhotoDiagnosticItem) {
  if (!confirm(`Снять ручное закрепление для «${item.objectName}» и восстановить стандартное проверенное изображение?`)) {
    return;
  }
  processingItemId.value = item.id;
  try {
    await countryService.resetPhotoOverride({
      countrySlug: item.countrySlug,
      targetType: item.targetType,
      targetKey: item.targetKey,
    });
    toastStore.show(`Ручное закрепление для «${item.objectName}» снято`, 'success');
    clearSmartImageCache();
    await countryStore.ensureCountriesLoaded(true);
    await countryStore.fetchCountryDetail(item.countrySlug);
    await loadDiagnostics();
  } catch (err: any) {
    toastStore.show(
      err?.response?.data?.error?.message || err?.message || 'Ошибка при снятии закрепления',
      'error'
    );
  } finally {
    processingItemId.value = null;
  }
}

async function handleReverify(item: PhotoDiagnosticItem) {
  processingItemId.value = item.id;
  try {
    await countryService.reverifyPhoto({
      countrySlug: item.countrySlug,
      targetType: item.targetType,
      targetKey: item.targetKey,
    });
    toastStore.show(`Повторная проверка «${item.objectName}» выполнена`, 'success');
    await loadDiagnostics();
  } catch (err: any) {
    toastStore.show(
      err?.response?.data?.error?.message || 'Ошибка при повторной проверке',
      'error'
    );
  } finally {
    processingItemId.value = null;
  }
}

async function handleAutoWikimedia(item: PhotoDiagnosticItem) {
  processingItemId.value = item.id;
  try {
    await countryService.autoSearchWikimedia({
      countrySlug: item.countrySlug,
      targetType: item.targetType,
      targetKey: item.targetKey,
    });
    toastStore.show(
      `Подобрано проверенное фото Wikimedia для «${item.objectName}»`,
      'success'
    );
    await countryStore.ensureCountriesLoaded(true);
    await loadDiagnostics();
  } catch (err: any) {
    toastStore.show(
      err?.response?.data?.error?.message ||
        'Не удалось автоматически подобрать подтверждённое фото',
      'error'
    );
  } finally {
    processingItemId.value = null;
  }
}

function getStatusBadge(item: PhotoDiagnosticItem) {
  if (item.isDuplicate) {
    return {
      label: 'Дубликат (запрещено)',
      classes: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  if (clientLoadErrors.value.has(item.id) || item.verificationStatus === 'broken' || item.verificationStatus === 'rejected') {
    return {
      label: 'Ошибка / Отклонено',
      classes: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  if (item.verificationStatus === 'missing' || !item.url) {
    return {
      label: 'Отсутствует',
      classes: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  }
  if (item.verificationStatus === 'needs_review') {
    return {
      label: 'Требует проверки страны',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    label: 'Подтверждено (гео-матч)',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

onMounted(() => {
  loadDiagnostics();
});
</script>

<template>
  <AdaptiveLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
            <ShieldCheck class="w-4 h-4" />
            <span>Административная диагностика и гео-верификация</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Диагностика фотографий стран и достопримечательностей
          </h1>
          <p class="text-sm text-slate-500">
            Контроль географического соответствия, лицензий, источников (Wikimedia Commons, Unsplash) и целостности URL.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <BaseButton
            variant="secondary"
            size="md"
            :disabled="isLoading"
            @click="loadDiagnostics"
          >
            <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
            <span>Обновить отчёт</span>
          </BaseButton>
        </div>
      </div>

      <!-- Summary Counters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5">
        <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Всего</span>
            <ImageIcon class="w-4 h-4 text-slate-400" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ liveStats.totalImages }}</p>
          <p v-if="report" class="text-[11px] text-slate-500 mt-1 truncate">
            Обл: {{ report.summary.bySection.cover }} • Мест: {{ report.summary.bySection.landmark }}
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-2">
            <span>Подтверждено</span>
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-emerald-700">{{ liveStats.verifiedCount }}</p>
          <p class="text-[11px] text-emerald-600/80 mt-1">
            Строгая гео-проверка
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-violet-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-violet-700 text-xs font-semibold mb-2">
            <span>Ручной выбор</span>
            <Pin class="w-4 h-4 text-violet-600" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-violet-700">{{ report?.summary?.manualOverridesCount ?? 0 }}</p>
          <p class="text-[11px] text-violet-600/80 mt-1">
            В базе PostgreSQL
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-rose-700 text-xs font-semibold mb-2">
            <span>Дубликаты</span>
            <Copy class="w-4 h-4 text-rose-600" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-rose-700">{{ report?.summary?.duplicateCount ?? 0 }}</p>
          <p class="text-[11px] text-rose-600/80 mt-1">
            Повторные фото
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-slate-600 text-xs font-semibold mb-2">
            <span>Отсутствуют</span>
            <ImageIcon class="w-4 h-4 text-slate-400" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-slate-800">{{ liveStats.missingCount }}</p>
          <p class="text-[11px] text-slate-500 mt-1">
            Без случайных фото
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-rose-700 text-xs font-semibold mb-2">
            <span>Ошибки</span>
            <XCircle class="w-4 h-4 text-rose-600" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-rose-700">{{ liveStats.errorCount }}</p>
          <p class="text-[11px] text-rose-600/80 mt-1">
            Битые URL / чужая страна
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-soft">
          <div class="flex items-center justify-between text-amber-700 text-xs font-semibold mb-2">
            <span>На проверку</span>
            <AlertTriangle class="w-4 h-4 text-amber-600" />
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-amber-700">{{ liveStats.needsReviewCount }}</p>
          <p class="text-[11px] text-amber-600/80 mt-1">
            Не подтверждено гео
          </p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-soft space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- Search -->
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по стране, городу, месту..."
              class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <!-- Country Select -->
          <div class="relative">
            <Filter class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              v-model="selectedCountry"
              class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="all">Все страны ({{ countryOptions.length }})</option>
              <option v-for="c in countryOptions" :key="c.slug" :value="c.slug">
                {{ c.flagEmoji }} {{ c.nameRu }}
              </option>
            </select>
          </div>

          <!-- Section Select -->
          <select
            v-model="selectedSection"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            <option value="all">Все разделы карточек</option>
            <option value="cover">Главная фотография страны</option>
            <option value="gallery">Галерея страны</option>
            <option value="city">Популярные города</option>
            <option value="landmark">Что посетить (достопримечательности)</option>
          </select>

          <!-- Status Select -->
          <select
            v-model="selectedStatus"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            <option value="all">Все статусы проверки</option>
            <option value="verified">Подтверждено соответствие</option>
            <option value="manual">Ручной выбор (закреплено)</option>
            <option value="duplicate">Дубликаты фото ({{ report?.summary?.duplicateCount ?? 0 }})</option>
            <option value="needs_review">Требует проверки страны</option>
            <option value="missing">Отсутствует изображение</option>
            <option value="error">С ошибками / Отклонено</option>
          </select>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Найдено записей: <strong class="text-slate-800">{{ filteredItems.length }}</strong>
          </span>
          <span>
            Страница {{ currentPage }} из {{ totalPages }}
          </span>
        </div>
      </div>

      <!-- Error or Loading State -->
      <div v-if="errorMessage" class="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
        {{ errorMessage }}
      </div>

      <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="n in 6"
          :key="n"
          class="h-80 rounded-2xl bg-white border border-slate-200/70 p-4 animate-pulse"
        />
      </div>

      <!-- Items Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="item in paginatedItems"
          :key="item.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col justify-between"
        >
          <div>
            <!-- Image Preview -->
            <SmartImage
              :src="item.url"
              :thumbSrc="item.thumbUrl"
              size="md"
              :alt="`${item.objectName} (${item.countryNameRu})`"
              :fallbackTitle="item.objectName"
              :fallbackFlag="item.flagEmoji"
              aspectClass="aspect-[16/10]"
              :authorName="item.authorName"
              :sourceName="item.sourceName"
              :sourceUrl="item.sourceUrl"
              :license="item.license"
              showAttribution
              @load="handleImgLoaded(item.id)"
              @error="handleImgError(item.id)"
            >
              <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                <span class="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-sm text-white text-[11px] font-bold truncate">
                  {{ item.flagEmoji }} {{ item.countryNameRu }}
                </span>
                <div class="flex items-center gap-1 shrink-0">
                  <span
                    v-if="item.manualOverride"
                    class="px-2 py-0.5 rounded-full border border-violet-300 bg-violet-600/95 text-white text-[10px] font-extrabold shadow-sm flex items-center gap-1"
                  >
                    <Pin class="w-2.5 h-2.5" />
                    <span>Ручной выбор</span>
                  </span>
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full border text-[11px] font-bold backdrop-blur-sm',
                      getStatusBadge(item).classes,
                    ]"
                  >
                    {{ getStatusBadge(item).label }}
                  </span>
                </div>
              </div>
            </SmartImage>

            <!-- Details -->
            <div class="p-4 space-y-2.5">
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span class="font-semibold text-teal-700">{{ item.sectionLabel }}</span>
                <span class="inline-flex items-center gap-1">
                  <MapPin class="w-3 h-3 text-slate-400" />
                  {{ item.cityName }}
                </span>
              </div>

              <h3 class="text-sm font-extrabold text-slate-900 line-clamp-2">
                {{ item.objectName }}
              </h3>

              <div v-if="item.isDuplicate" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <Copy class="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span class="truncate">Повтор: {{ item.duplicateOf }}</span>
              </div>

              <p class="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                {{ item.verificationNotes }}
              </p>

              <div class="text-[11px] text-slate-500 space-y-0.5">
                <div class="flex items-center justify-between">
                  <span>Источник: <strong class="text-slate-700">{{ item.sourceName }}</strong></span>
                  <span v-if="item.license" class="text-slate-400">{{ item.license }}</span>
                </div>
                <div class="flex items-center justify-between truncate">
                  <span class="truncate">Автор: {{ item.authorName || 'Не указан' }}</span>
                  <a
                    v-if="item.sourceUrl"
                    :href="item.sourceUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-teal-600 hover:underline shrink-0 ml-2"
                  >
                    <span>Оригинал</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="openReplaceModal(item)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-700 hover:text-teal-700 transition"
              >
                <Edit3 class="w-3.5 h-3.5" />
                <span>Заменить</span>
              </button>

              <button
                type="button"
                :disabled="processingItemId === item.id"
                @click="handleAutoWikimedia(item)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-xs font-bold text-teal-700 transition disabled:opacity-50"
                title="Подобрать проверенное фото из Wikimedia Commons API"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>Wikimedia</span>
              </button>

              <button
                type="button"
                :disabled="processingItemId === item.id"
                @click="handleReverify(item)"
                class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition disabled:opacity-50"
                title="Повторно проверить гео-соответствие и доступность URL"
              >
                <RefreshCw :class="['w-3.5 h-3.5', processingItemId === item.id ? 'animate-spin' : '']" />
              </button>

              <button
                v-if="item.manualOverride || item.hasDbOverride"
                type="button"
                :disabled="processingItemId === item.id"
                @click="handleResetOverride(item)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 transition disabled:opacity-50"
                title="Снять ручное закрепление и восстановить стандартное изображение"
              >
                <RotateCcw :class="['w-3.5 h-3.5', processingItemId === item.id ? 'animate-spin' : '']" />
                <span>Сбросить</span>
              </button>
            </div>

            <RouterLink
              :to="`/countries/${item.countrySlug}`"
              class="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Страница →
            </RouterLink>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 pt-2"
      >
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="currentPage <= 1"
          @click="currentPage -= 1"
        >
          Назад
        </BaseButton>
        <span class="text-xs font-semibold text-slate-600 px-3">
          Страница {{ currentPage }} из {{ totalPages }}
        </span>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage += 1"
        >
          Вперёд
        </BaseButton>
      </div>
    </div>

    <!-- Modal for Manual Photo Replacement -->
    <Teleport to="body">
      <div
        v-if="editingItem"
        class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closeReplaceModal"
      >
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-teal-600">
                {{ editingItem.flagEmoji }} {{ editingItem.countryNameRu }} • {{ editingItem.sectionLabel }}
              </span>
              <h3 class="text-lg font-extrabold text-slate-900">
                Замена фотографии объекта
              </h3>
            </div>
            <button
              type="button"
              @click="closeReplaceModal"
              class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-3 text-sm">
            <div
              v-if="modalErrorMessage"
              class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5"
            >
              <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div class="space-y-0.5">
                <p class="font-bold">Ошибка сохранения</p>
                <p>{{ modalErrorMessage }}</p>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Название объекта / достопримечательности</label>
              <input
                v-model="editForm.objectName"
                :disabled="isSavingReplacement"
                type="text"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Город или регион ({{ editingItem.countryNameRu }})</label>
              <input
                v-model="editForm.cityName"
                :disabled="isSavingReplacement"
                type="text"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">URL фотографии (Wikimedia Commons / Unsplash)</label>
              <input
                v-model="editForm.url"
                :disabled="isSavingReplacement"
                type="url"
                placeholder="https://thumb.wikimedia.org/wikipedia/commons/..."
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Автор фотографии</label>
                <input
                  v-model="editForm.authorName"
                  :disabled="isSavingReplacement"
                  type="text"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Лицензия</label>
                <input
                  v-model="editForm.license"
                  :disabled="isSavingReplacement"
                  type="text"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ссылка на страницу оригинала</label>
              <input
                v-model="editForm.sourceUrl"
                :disabled="isSavingReplacement"
                type="url"
                placeholder="https://commons.wikimedia.org/wiki/File:..."
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <p class="text-xs text-slate-500 bg-teal-50/70 border border-teal-200/60 rounded-xl p-2.5">
              Перед сохранением в базу данных PostgreSQL изображение пройдёт автоматическую проверку соответствия стране «{{ editingItem.countryNameRu }}» и будет защищено от автоматической перезаписи.
            </p>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="isSavingReplacement"
              @click="closeReplaceModal"
            >
              Отмена
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              :disabled="isSavingReplacement || !editForm.url.trim()"
              @click="submitReplacement"
            >
              <RefreshCw v-if="isSavingReplacement" class="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>{{ isSavingReplacement ? 'Проверка и запись...' : 'Проверить и сохранить' }}</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </AdaptiveLayout>
</template>
