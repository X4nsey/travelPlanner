<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  X,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  Compass,
  BookOpen,
  CheckCircle2,
  CalendarDays,
} from 'lucide-vue-next';
import SmartImage from '@/components/ui/SmartImage.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

export interface InspirationTrip {
  id: string;
  title: string;
  country: string;
  countrySlug?: string;
  flag: string;
  city: string;
  days: string;
  durationDays: number;
  season: string;
  bestPeriod: string;
  photoUrl: string;
  photoAuthor: string;
  photoSourceUrl?: string;
  budget: number;
  currency: 'RUB' | 'USD' | 'EUR';
  currencySymbol: string;
  rubApprox?: number;
  description: string;
  highlights: string[];
  samplePlan: Array<{
    day: number;
    title: string;
    activities: string;
  }>;
}

interface Props {
  open: boolean;
  trip: InspirationTrip | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

function handlePlanThisTrip() {
  if (!props.trip) return;
  const t = props.trip;

  emit('close');
  router.push({
    path: '/trips/new',
    query: {
      title: t.title,
      country: t.country,
      city: t.city,
      budget: String(t.budget),
      currency: t.currency,
      description: `${t.description}\n\nРекомендованные места для посещения:\n• ${t.highlights.join('\n• ')}`,
    },
  });
}

function handleViewCountry() {
  if (!props.trip?.countrySlug) return;
  emit('close');
  router.push(`/countries/${props.trip.countrySlug}`);
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && trip"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up"
        >
          <!-- Top Cover Photo with Floating Badges & Close Button -->
          <div class="relative shrink-0">
            <SmartImage
              :src="trip.photoUrl"
              size="lg"
              :alt="trip.title"
              :authorName="trip.photoAuthor"
              :fallbackTitle="trip.title"
              :fallbackFlag="trip.flag"
              aspectClass="h-56 sm:h-72 w-full"
              showAttribution
              eager
            />

            <!-- Gradient Overlay for readability -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/40 pointer-events-none" />

            <!-- Close Button -->
            <button
              type="button"
              @click="emit('close')"
              class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-colors"
              aria-label="Закрыть"
            >
              <X class="w-5 h-5" />
            </button>

            <!-- Badges on Photo -->
            <div class="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-sm backdrop-blur-md"
              >
                <span>{{ trip.flag }}</span>
                <span>{{ trip.country }}</span>
              </span>

              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/70 text-white text-xs font-semibold backdrop-blur-md border border-white/20"
              >
                <CalendarDays class="w-3.5 h-3.5 text-teal-300" />
                <span>{{ trip.days }}</span>
              </span>
            </div>

            <!-- Title & City on Bottom of Photo -->
            <div class="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1">
              <div class="inline-flex items-center gap-1 text-xs font-semibold text-teal-300">
                <MapPin class="w-3.5 h-3.5" />
                <span>{{ trip.city }}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                {{ trip.title }}
              </h2>
            </div>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-700">
            <!-- Budget & Best Time highlight blocks -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Budget Highlight Block with Ruble equivalent -->
              <div class="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/70">
                <div class="flex items-center gap-2 text-xs font-semibold text-teal-800 mb-1">
                  <Wallet class="w-4 h-4 text-teal-600" />
                  <span>Ориентировочный бюджет:</span>
                </div>
                <div class="flex flex-wrap items-baseline gap-1.5">
                  <span class="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {{ trip.budget.toLocaleString('ru-RU') }} {{ trip.currencySymbol }}
                  </span>
                  <!-- If trip is abroad in foreign currency, display cost in rubles in brackets -->
                  <span
                    v-if="trip.currency !== 'RUB' && trip.rubApprox"
                    class="text-sm sm:text-base font-bold text-teal-700"
                  >
                    (~{{ trip.rubApprox.toLocaleString('ru-RU') }} ₽)
                  </span>
                </div>
                <p class="text-[11px] text-teal-700/80 mt-1">
                  На 1 человека (проживание, питание и билеты)
                </p>
              </div>

              <!-- Best Time Block -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
                  <Calendar class="w-4 h-4 text-sky-600" />
                  <span>Лучшее время для поездки:</span>
                </div>
                <div class="text-base sm:text-lg font-bold text-slate-900">
                  {{ trip.bestPeriod }}
                </div>
                <p class="text-[11px] text-slate-500 mt-1">
                  {{ trip.season }}
                </p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
                О маршруте
              </h3>
              <p class="text-sm sm:text-base leading-relaxed text-slate-700">
                {{ trip.description }}
              </p>
            </div>

            <!-- Key Landmarks / Highlights -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-teal-600" />
                <span>Главные локации маршрута</span>
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in trip.highlights"
                  :key="item"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{{ item }}</span>
                </span>
              </div>
            </div>

            <!-- Day-by-Day Sample Itinerary Plan -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass class="w-3.5 h-3.5 text-teal-600" />
                  <span>Пример расписания по дням</span>
                </h3>
                <span class="text-[11px] text-slate-400">Легко настроить под себя</span>
              </div>

              <div class="space-y-2.5">
                <div
                  v-for="dayItem in trip.samplePlan"
                  :key="dayItem.day"
                  class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm"
                  >
                    Д{{ dayItem.day }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-slate-900">
                      {{ dayItem.title }}
                    </p>
                    <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {{ dayItem.activities }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons Footer -->
          <div
            class="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
          >
            <button
              v-if="trip.countrySlug"
              type="button"
              @click="handleViewCountry"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <BookOpen class="w-4 h-4 text-teal-600" />
              <span>Путеводитель по стране</span>
            </button>
            <div v-else class="hidden sm:block" />

            <div class="flex items-center gap-2.5 w-full sm:w-auto">
              <BaseButton
                variant="outline"
                size="md"
                class="flex-1 sm:flex-none"
                @click="emit('close')"
              >
                Закрыть
              </BaseButton>

              <BaseButton
                variant="primary"
                size="md"
                class="flex-1 sm:flex-none !px-5"
                @click="handlePlanThisTrip"
              >
                <Compass class="w-4 h-4" />
                <span>Запланировать такую поездку</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
