<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  Search,
  Globe2,
  X,
  ChevronDown,
  Check,
  MapPin,
} from 'lucide-vue-next';
import type { CountryData } from '@/types';
import { useCountryStore } from '@/stores/country.store';
import SmartImage from '@/components/ui/SmartImage.vue';

interface Props {
  modelValue?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Страна',
  required: true,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select-country-object', country: CountryData | null): void;
  (e: 'open-globe-picker'): void;
}>();

const countryStore = useCountryStore();
const wrapperRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);
const searchQuery = ref('');

onMounted(() => {
  countryStore.ensureCountriesLoaded().catch(() => {});
  document.addEventListener('mousedown', handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
});

function handleOutsideClick(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

const selectedCountryObj = computed<CountryData | undefined>(() => {
  if (!props.modelValue) return undefined;
  return countryStore.findCountryByQuery(props.modelValue);
});

const filteredCountries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return countryStore.countries;
  return countryStore.countries.filter(
    (c) =>
      c.nameRu.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q)
  );
});

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 30);
  }
}

function selectCountry(country: CountryData) {
  emit('update:modelValue', country.nameRu);
  emit('select-country-object', country);
  isOpen.value = false;
  searchQuery.value = '';
}

function useCustomQuery() {
  const trimmed = searchQuery.value.trim();
  if (!trimmed) return;
  emit('update:modelValue', trimmed);
  emit('select-country-object', null);
  isOpen.value = false;
  searchQuery.value = '';
}

function clearSelection(event: MouseEvent) {
  event.stopPropagation();
  emit('update:modelValue', '');
  emit('select-country-object', null);
  searchQuery.value = '';
}
</script>

<template>
  <div ref="wrapperRef" class="w-full space-y-2">
    <!-- Top Label + "Выбрать на глобусе" button -->
    <div class="flex items-center justify-between gap-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {{ label }}
        <span v-if="required" class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>
      </label>

      <button
        type="button"
        :disabled="disabled"
        @click="emit('open-globe-picker')"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 px-2.5 py-1 rounded-lg border border-teal-200/70 dark:border-teal-500/30 transition-colors disabled:opacity-50"
      >
        <Globe2 class="w-3.5 h-3.5" />
        <span>Выбрать на глобусе</span>
      </button>
    </div>

    <!-- Main Trigger Box -->
    <div class="relative">
      <div
        role="button"
        tabindex="0"
        @click="toggleDropdown"
        @keydown.enter.prevent="toggleDropdown"
        :class="[
          'w-full rounded-xl border bg-white dark:bg-slate-800/80 px-3.5 py-2 text-sm transition-colors flex items-center justify-between gap-3 cursor-pointer min-h-[44px]',
          disabled ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-60' : '',
          error
            ? 'border-rose-300 dark:border-rose-500/60 focus:border-rose-500'
            : isOpen
              ? 'border-teal-600 dark:border-teal-400 ring-2 ring-teal-500/20'
              : 'border-slate-200 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600',
        ]"
      >
        <!-- Selected Country Display with Thumbnail Photo & Flag -->
        <div v-if="selectedCountryObj" class="flex items-center gap-3 min-w-0 flex-1">
          <SmartImage
            :src="selectedCountryObj.coverPhoto?.thumbUrl"
            size="xs"
            :alt="selectedCountryObj.nameRu"
            :fallbackTitle="selectedCountryObj.nameRu"
            :fallbackFlag="selectedCountryObj.flagEmoji"
            aspectClass="w-11 h-8 rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
          />

          <div class="flex items-center gap-2 min-w-0">
            <img
              v-if="selectedCountryObj.flagUrl"
              :src="selectedCountryObj.flagUrl"
              :alt="selectedCountryObj.nameRu"
              loading="lazy"
              decoding="async"
              class="w-5 h-3.5 object-cover rounded-sm border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <span v-else class="text-base">{{ selectedCountryObj.flagEmoji }}</span>

            <div class="truncate">
              <span class="font-semibold text-slate-900 dark:text-slate-100">{{ selectedCountryObj.nameRu }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-400 ml-1.5 hidden sm:inline">
                {{ selectedCountryObj.nameEn }} • {{ selectedCountryObj.capital }}
              </span>
            </div>
          </div>
        </div>

        <!-- Custom Country String (if not in catalog) -->
        <div v-else-if="modelValue" class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-base">🌍</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100 truncate">{{ modelValue }}</span>
        </div>

        <!-- Placeholder -->
        <span v-else class="text-slate-400 dark:text-slate-500 truncate">
          Выберите страну из каталога или на 3D-глобусе...
        </span>

        <!-- Clear & Chevron Icons -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            v-if="modelValue && !disabled"
            type="button"
            @click="clearSelection"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Очистить выбор"
            aria-label="Очистить выбор"
          >
            <X class="w-4 h-4" />
          </button>

          <ChevronDown
            :class="[
              'w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200',
              isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : '',
            ]"
          />
        </div>
      </div>

      <!-- Dropdown Panel -->
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 z-40 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-black/50 overflow-hidden animate-fade-in"
      >
        <!-- Search Input Inside Dropdown -->
        <div class="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию страны или столице..."
              class="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-600 dark:focus:border-teal-400"
              @keydown.enter.prevent="
                filteredCountries.length > 0
                  ? selectCountry(filteredCountries[0])
                  : useCustomQuery()
              "
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-64 overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800">
          <button
            v-for="item in filteredCountries"
            :key="item.slug"
            type="button"
            @click="selectCountry(item)"
            :class="[
              'w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-teal-50/60 dark:hover:bg-teal-500/10 transition-colors',
              modelValue.toLowerCase() === item.nameRu.toLowerCase() ? 'bg-teal-50/90 dark:bg-teal-500/15' : '',
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <SmartImage
                :src="item.coverPhoto?.thumbUrl"
                size="xs"
                :alt="item.nameRu"
                :fallbackTitle="item.nameRu"
                :fallbackFlag="item.flagEmoji"
                aspectClass="w-10 h-7 rounded-md shrink-0 border border-slate-200 dark:border-slate-700"
              />

              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm">{{ item.flagEmoji }}</span>
                  <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {{ item.nameRu }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500 truncate">({{ item.nameEn }})</span>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{{ item.continent }}</span>
                  <span>•</span>
                  <span class="inline-flex items-center gap-0.5">
                    <MapPin class="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                    {{ item.capital }}
                  </span>
                </div>
              </div>
            </div>

            <Check
              v-if="modelValue.toLowerCase() === item.nameRu.toLowerCase()"
              class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0"
            />
          </button>

          <!-- Fallback if search query doesn't match catalog -->
          <div v-if="filteredCountries.length === 0" class="p-4 text-center space-y-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Страна «{{ searchQuery }}» не найдена в быстром списке
            </p>
            <button
              v-if="searchQuery.trim().length >= 2"
              type="button"
              @click="useCustomQuery"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 dark:hover:bg-teal-500"
            >
              Использовать «{{ searchQuery.trim() }}»
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-xs font-medium text-rose-600 dark:text-rose-400">
      {{ error }}
    </p>
  </div>
</template>
