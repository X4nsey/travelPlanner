<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Pause,
  Sparkles,
  Wallet,
} from 'lucide-vue-next';
import { tripService } from '@/services/trip.service';
import { useAuthStore } from '@/stores/auth.store';
import { useCountryStore } from '@/stores/country.store';
import { resolveTripTheme } from '@/composables/useTripTheme';
import { getTripTypeLabelRu } from '@/constants/packing';
import { formatCurrency, formatDaysLabel } from '@/composables/useFormatters';
import type { TripTemplate, TripTemplateEvent } from '@/types';
import BaseButton from '@/components/ui/BaseButton.vue';
import SmartImage from '@/components/ui/SmartImage.vue';

const SLIDE_DURATION_MS = 6000;

const FALLBACK_TEMPLATES: TripTemplate[] = [
  {
    id: 'istanbul-weekend-3d',
    slug: 'istanbul-weekend-3d',
    title: 'Уикенд в Стамбуле: два континента',
    country: 'Турция',
    city: 'Стамбул',
    durationDays: 3,
    tripType: 'SIGHTSEEING',
    recommendedBudget: 65000,
    currency: 'RUB',
    paceLabel: 'Насыщенный',
    tags: ['История', 'Босфор', 'Гастрономия'],
    summary:
      'Три ярких дня на стыке Европы и Азии: византийское наследие Султанахмета, паром через Босфор в Кадыкёй, Галатская башня на закате и пряные ароматы базара специй.',
    highlights: [
      'Айя-София, Голубая мечеть и Цистерна Базилика',
      'Паром через Босфор на азиатский берег',
      'Галатская башня и улица Истикляль',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Площадь Султанахмет и Айя-София',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Фатих, Султанахмет',
        category: 'SIGHTSEEING',
        estimatedCost: 2500,
        description: 'Историческое сердце города, Голубая мечеть и собор Святой Софии.',
      },
      {
        dayOffset: 1,
        title: 'Паром по Босфору и квартал Кадыкёй',
        startTime: '14:30',
        endTime: '18:00',
        location: 'Причал Эминёню — Кадыкёй',
        category: 'TRANSPORT',
        estimatedCost: 1500,
        description: 'Морская переправа в азиатскую часть города и набережная Мода.',
      },
      {
        dayOffset: 2,
        title: 'Дворец Долмабахче и улица Истикляль',
        startTime: '10:00',
        endTime: '14:00',
        location: 'Бешикташ, Бейоглу',
        category: 'CULTURE',
        estimatedCost: 4200,
        description: 'Роскошный дворец на берегу пролива и исторический красный трамвай.',
      },
    ],
  },
  {
    id: 'georgia-tbilisi-kazbegi-5d',
    slug: 'georgia-tbilisi-kazbegi-5d',
    title: 'Грузия: Тбилиси, Мцхета и Казбеги',
    country: 'Грузия',
    city: 'Тбилиси',
    durationDays: 5,
    tripType: 'MOUNTAIN',
    recommendedBudget: 85000,
    currency: 'RUB',
    paceLabel: 'Сбалансированный',
    tags: ['Горы', 'Хайкинг', 'Старый город'],
    summary:
      'Идеальный баланс уютных двориков Старого Тбилиси, древних монастырей Мцхеты, винных дегустаций Кахетии и захватывающих панорам Большого Кавказа у подножия Казбека.',
    highlights: [
      'Старый Тбилиси, Абанотубани и крепость Нарикала',
      'Военно-Грузинская дорога и храм Гергети',
      'Винные дегустации в Кахетии',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Старый Тбилиси и крепость Нарикала',
        startTime: '10:30',
        endTime: '13:30',
        location: 'Абанотубани, Нарикала',
        category: 'SIGHTSEEING',
        estimatedCost: 1200,
        description: 'Резные балконы, серные бани и панорама города с канатной дороги.',
      },
      {
        dayOffset: 1,
        title: 'Древняя Мцхета и монастырь Джвари',
        startTime: '09:30',
        endTime: '14:00',
        location: 'Мцхета',
        category: 'CULTURE',
        estimatedCost: 2400,
        description: 'Знаменитое слияние рек Арагви и Куры со смотровой площадки Джвари.',
      },
      {
        dayOffset: 2,
        title: 'Храм Гергети у подножия Казбека',
        startTime: '08:30',
        endTime: '17:00',
        location: 'Степанцминда, Казбеги',
        category: 'NATURE',
        estimatedCost: 4800,
        description: 'Перевал Крестовый, крепость Ананури и горные вершины Большого Кавказа.',
      },
    ],
  },
  {
    id: 'rome-classic-4d',
    slug: 'rome-classic-4d',
    title: 'Классический Рим за 4 дня',
    country: 'Италия',
    city: 'Рим',
    durationDays: 4,
    tripType: 'SIGHTSEEING',
    recommendedBudget: 1450,
    currency: 'EUR',
    paceLabel: 'Классический',
    tags: ['Античность', 'Ватикан', 'Трастевере'],
    summary:
      'Путешествие сквозь тысячелетия: античные форумы и Колизей, шедевры Ватикана, фонтан Треви на рассвете и неспешные ужины в колоритных переулках Трастевере.',
    highlights: [
      'Колизей, Римский форум и холм Палатин',
      'Музеи Ватикана и собор Святого Петра',
      'Пантеон, фонтан Треви и ужин в Трастевере',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Колизей, Римский форум и Палатин',
        startTime: '09:30',
        endTime: '13:30',
        location: 'Piazza del Colosseo',
        category: 'SIGHTSEEING',
        estimatedCost: 35,
        description: 'Главный амфитеатр Античности и панорама императорских форумов.',
      },
      {
        dayOffset: 1,
        title: 'Музеи Ватикана и Сикстинская капелла',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Ватикан',
        category: 'CULTURE',
        estimatedCost: 45,
        description: 'Шедевры Микеланджело, Рафаэля и купол собора Святого Петра.',
      },
      {
        dayOffset: 2,
        title: 'Пантеон, фонтан Треви и Трастевере',
        startTime: '11:00',
        endTime: '20:00',
        location: 'Исторический центр и Трастевере',
        category: 'FOOD',
        estimatedCost: 55,
        description: 'Знаковые площади барочного Рима и авторская паста на ужин.',
      },
    ],
  },
  {
    id: 'tokyo-traditions-future-6d',
    slug: 'tokyo-traditions-future-6d',
    title: 'Токио: традиции и мегаполис будущего',
    country: 'Япония',
    city: 'Токио',
    durationDays: 6,
    tripType: 'MIXED',
    recommendedBudget: 2100,
    currency: 'USD',
    paceLabel: 'Насыщенный',
    tags: ['Неон', 'Храмы', 'Фудзи'],
    summary:
      'Контраст вековых синтоистских святилищ и футуристических кварталов: храм Сэнсо-дзи, неоновая Сибуя, цифровой музей искусства и выезд к озеру Кавагутико с видом на Фудзи.',
    highlights: [
      'Храм Сэнсо-дзи и улица Накамисэ в Асакусе',
      'Перекрёсток Сибуя и смотровая Shibuya Sky',
      'Однодневная поездка к озеру Кавагутико и Фудзи',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Вечерний район Синдзюку и смотровая',
        startTime: '16:00',
        endTime: '21:00',
        location: 'Синдзюку, Токио',
        category: 'SIGHTSEEING',
        estimatedCost: 40,
        description: 'Первое знакомство с огнями японской столицы и переулком Омоидэ Ёкотё.',
      },
      {
        dayOffset: 1,
        title: 'Храм Сэнсо-дзи и перекрёсток Сибуя',
        startTime: '09:30',
        endTime: '18:30',
        location: 'Асакуса и Сибуя',
        category: 'CULTURE',
        estimatedCost: 65,
        description: 'Древнейший буддийский храм Токио и закат со смотровой Shibuya Sky.',
      },
      {
        dayOffset: 3,
        title: 'Озеро Кавагутико и вид на гору Фудзи',
        startTime: '08:00',
        endTime: '18:00',
        location: 'Префектура Яманаси',
        category: 'NATURE',
        estimatedCost: 90,
        description: 'Открыточные панорамы Фудзиямы, пагода Тюрейто и канатная дорога.',
      },
    ],
  },
  {
    id: 'paris-romance-relax-5d',
    slug: 'paris-romance-relax-5d',
    title: 'Париж: искусство, Монмартр и прогулки по Сене',
    country: 'Франция',
    city: 'Париж',
    durationDays: 5,
    tripType: 'WELLNESS_SPA',
    recommendedBudget: 1650,
    currency: 'EUR',
    paceLabel: 'Неспешный',
    tags: ['Искусство', 'Сена', 'Атмосфера'],
    summary:
      'Неспешный маршрут по сердцу Парижа: утренние круассаны у сада Тюильри, Лувр и музей Орсе, холм художников Монмартр, королевские сады Версаля и вечерний круиз по Сене.',
    highlights: [
      'Лувр, сад Тюильри и площадь Согласия',
      'Монмартр и панорама у Сакре-Кёр',
      'Вечерний круиз по Сене на закате',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Елисейские поля и вечерний круиз по Сене',
        startTime: '15:00',
        endTime: '21:00',
        location: 'Сена и Марсово поле',
        category: 'LEISURE',
        estimatedCost: 45,
        description: 'Прогулка от Триумфальной арки к Эйфелевой башне и кораблик на закате.',
      },
      {
        dayOffset: 1,
        title: 'Музей Лувр и сад Тюильри',
        startTime: '10:00',
        endTime: '15:00',
        location: 'Rue de Rivoli, Париж',
        category: 'CULTURE',
        estimatedCost: 35,
        description: 'Главные залы Лувра и кофе в исторических аркадах Пале-Рояль.',
      },
      {
        dayOffset: 2,
        title: 'Холм Монмартр и базилика Сакре-Кёр',
        startTime: '11:00',
        endTime: '17:00',
        location: 'Монмартр, 18-й округ',
        category: 'SIGHTSEEING',
        estimatedCost: 30,
        description: 'Площадь Тертр, уютные бистро и панорамный закат над крышами Парижа.',
      },
    ],
  },
];

const FALLBACK_MEDIA_BY_COUNTRY: Record<
  string,
  { flagEmoji: string; photoUrl: string; photoAuthor: string }
> = {
  турция: {
    flagEmoji: '🇹🇷',
    photoUrl:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Anna Berdnik',
  },
  италия: {
    flagEmoji: '🇮🇹',
    photoUrl:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'David Kohler',
  },
  япония: {
    flagEmoji: '🇯🇵',
    photoUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Louie Martinez',
  },
  франция: {
    flagEmoji: '🇫🇷',
    photoUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Chris Karidis',
  },
  россия: {
    flagEmoji: '🇷🇺',
    photoUrl:
      'https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Nikolay Vorobyev',
  },
  грузия: {
    flagEmoji: '🇬🇪',
    photoUrl: '',
    photoAuthor: '',
  },
  армения: {
    flagEmoji: '🇦🇲',
    photoUrl: '',
    photoAuthor: '',
  },
  казахстан: {
    flagEmoji: '🇰🇿',
    photoUrl: '',
    photoAuthor: '',
  },
  азербайджан: {
    flagEmoji: '🇦🇿',
    photoUrl: '',
    photoAuthor: '',
  },
};

const authStore = useAuthStore();
const countryStore = useCountryStore();

const templates = ref<TripTemplate[]>(FALLBACK_TEMPLATES);
const activeIndex = ref(0);
const isPaused = ref(false);
const progressKey = ref(0);
const reducedMotion = ref(false);

let autoTimer: ReturnType<typeof setTimeout> | null = null;
let timerStartedAt = 0;
let remainingMs = SLIDE_DURATION_MS;

function pickKeyEvents(events: TripTemplateEvent[]): TripTemplateEvent[] {
  if (!events || events.length === 0) return [];
  const picked: TripTemplateEvent[] = [];
  const seenDays = new Set<number>();

  for (const ev of events) {
    if (!seenDays.has(ev.dayOffset)) {
      seenDays.add(ev.dayOffset);
      picked.push(ev);
      if (picked.length === 3) return picked;
    }
  }

  for (const ev of events) {
    if (!picked.includes(ev)) {
      picked.push(ev);
      if (picked.length === 3) break;
    }
  }

  return picked;
}

const slides = computed(() =>
  templates.value.map((tpl) => {
    const matchedCountry = countryStore.findCountryByQuery(tpl.country);
    const fallbackMedia = FALLBACK_MEDIA_BY_COUNTRY[tpl.country.trim().toLowerCase()];
    const photoUrl = matchedCountry?.coverPhoto?.url || fallbackMedia?.photoUrl || '';
    const thumbUrl = matchedCountry?.coverPhoto?.thumbUrl || '';
    const photoAuthor = matchedCountry?.coverPhoto?.authorName || fallbackMedia?.photoAuthor || '';
    const flagUrl = matchedCountry?.flagUrl || '';
    const flagEmoji = matchedCountry?.flagEmoji || fallbackMedia?.flagEmoji || '🌍';
    const countrySlug = matchedCountry?.slug || null;
    const theme = resolveTripTheme(undefined, tpl.tripType);
    const keyEvents = pickKeyEvents(tpl.events);

    return {
      template: tpl,
      photoUrl,
      thumbUrl,
      photoAuthor,
      flagUrl,
      flagEmoji,
      countrySlug,
      theme,
      keyEvents,
    };
  })
);

const activeSlide = computed(() => slides.value[activeIndex.value] ?? slides.value[0]);

function clearAutoTimer() {
  if (autoTimer !== null) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
}

function scheduleAutoAdvance(delay = remainingMs) {
  clearAutoTimer();
  if (reducedMotion.value || isPaused.value || slides.value.length <= 1) {
    return;
  }
  timerStartedAt = Date.now();
  remainingMs = delay;
  autoTimer = setTimeout(() => {
    goToSlide((activeIndex.value + 1) % slides.value.length);
  }, delay);
}

function goToSlide(index: number) {
  const total = slides.value.length;
  if (total === 0) return;
  activeIndex.value = ((index % total) + total) % total;
  remainingMs = SLIDE_DURATION_MS;
  progressKey.value += 1;
  if (!isPaused.value) {
    scheduleAutoAdvance(SLIDE_DURATION_MS);
  }
}

function nextSlide() {
  goToSlide(activeIndex.value + 1);
}

function prevSlide() {
  goToSlide(activeIndex.value - 1);
}

function pauseSlider() {
  if (isPaused.value) return;
  isPaused.value = true;
  if (autoTimer !== null && timerStartedAt > 0) {
    const elapsed = Date.now() - timerStartedAt;
    remainingMs = Math.max(250, remainingMs - elapsed);
  }
  clearAutoTimer();
}

function resumeSlider() {
  if (!isPaused.value) return;
  isPaused.value = false;
  scheduleAutoAdvance(remainingMs);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextSlide();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    prevSlide();
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  scheduleAutoAdvance(SLIDE_DURATION_MS);

  const [templatesResult] = await Promise.allSettled([
    tripService.getTemplates(),
    countryStore.ensureCountriesLoaded(),
  ]);

  if (
    templatesResult.status === 'fulfilled' &&
    Array.isArray(templatesResult.value) &&
    templatesResult.value.length > 0
  ) {
    templates.value = templatesResult.value;
    if (activeIndex.value >= templates.value.length) {
      activeIndex.value = 0;
    }
  }
});

onBeforeUnmount(() => {
  clearAutoTimer();
});
</script>

<template>
  <div
    class="space-y-5"
    tabindex="0"
    aria-roledescription="carousel"
    aria-label="Готовые маршруты и популярные направления"
    @mouseenter="pauseSlider"
    @mouseleave="resumeSlider"
    @focusin="pauseSlider"
    @focusout="resumeSlider"
    @keydown="handleKeydown"
  >
    <!-- Top Country Pills Navigation + Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div
        class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        role="tablist"
        aria-label="Выбор маршрута"
      >
        <button
          v-for="(slide, idx) in slides"
          :key="slide.template.id"
          type="button"
          role="tab"
          :aria-selected="idx === activeIndex"
          @click="goToSlide(idx)"
          :class="[
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shrink-0 whitespace-nowrap',
            idx === activeIndex
              ? ['bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm', slide.theme.ringClass]
              : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700',
          ]"
        >
          <img
            v-if="slide.flagUrl"
            :src="slide.flagUrl"
            :alt="slide.template.country"
            loading="lazy"
            class="w-4 h-3 object-cover rounded-[2px] border border-slate-200/80 dark:border-slate-700 shrink-0"
          />
          <span v-else class="text-sm leading-none" aria-hidden="true">{{ slide.flagEmoji }}</span>
          <span>{{ slide.template.city }}</span>
        </button>
      </div>

      <!-- Prev / Next Arrows + Pause Hint -->
      <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <span
          v-if="isPaused && !reducedMotion"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1"
        >
          <Pause class="w-3 h-3" />
          <span>Пауза</span>
        </span>

        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums mr-1">
          {{ activeIndex + 1 }} / {{ slides.length }}
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="prevSlide"
            aria-label="Предыдущий маршрут"
            class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300 shadow-sm dark:shadow-none flex items-center justify-center transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="nextSlide"
            aria-label="Следующий маршрут"
            class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300 shadow-sm dark:shadow-none flex items-center justify-center transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Slide Card -->
    <div
      v-if="activeSlide"
      class="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-none overflow-hidden"
    >
      <!-- Auto-Advance Progress Bar -->
      <div class="h-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden" aria-hidden="true">
        <div
          v-if="!reducedMotion"
          :key="`progress-${progressKey}`"
          :class="['h-full w-full origin-left slide-progress-bar', activeSlide.theme.heroAccentStripClass]"
          :style="{
            animationDuration: `${SLIDE_DURATION_MS}ms`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }"
        />
        <div
          v-else
          :class="['h-full w-full', activeSlide.theme.heroAccentStripClass]"
        />
      </div>

      <Transition name="slide-fade" mode="out-in">
        <div
          :key="activeSlide.template.id"
          class="grid grid-cols-1 lg:grid-cols-12"
        >
          <!-- Left Media Panel -->
          <div class="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] lg:min-h-[430px] overflow-hidden">
            <SmartImage
              v-if="activeSlide.photoUrl"
              :src="activeSlide.photoUrl"
              :thumbSrc="activeSlide.thumbUrl"
              size="lg"
              eager
              :alt="activeSlide.template.title"
              :authorName="activeSlide.photoAuthor"
              :fallbackTitle="activeSlide.template.title"
              :fallbackFlag="activeSlide.flagEmoji"
              aspectClass="w-full h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[430px]"
              imgClass="object-cover"
            />
            <!-- Atmospheric Gradient Fallback when no external photo is available -->
            <div
              v-else
              :class="[
                'w-full h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[430px] relative flex flex-col items-center justify-center p-8 text-center',
                activeSlide.theme.heroBannerClass,
              ]"
            >
              <div
                :class="[
                  'absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-80',
                  activeSlide.theme.heroGlowClass,
                ]"
                aria-hidden="true"
              />
              <img
                v-if="activeSlide.flagUrl"
                :src="activeSlide.flagUrl"
                :alt="activeSlide.template.country"
                class="w-20 h-14 object-cover rounded-xl shadow-md border border-white/60 dark:border-slate-700 mb-3 relative z-10"
              />
              <span v-else class="text-5xl mb-3 relative z-10" aria-hidden="true">
                {{ activeSlide.flagEmoji }}
              </span>
              <p class="text-xl font-extrabold text-slate-900 dark:text-slate-100 relative z-10">
                {{ activeSlide.template.city }}
              </p>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300 relative z-10">
                {{ activeSlide.template.country }}
              </p>
            </div>

            <!-- Readability Scrim over Photo -->
            <div
              v-if="activeSlide.photoUrl"
              class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/35 pointer-events-none"
            />

            <!-- Top Overlays: Country + Duration -->
            <div class="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
              <span
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-md border border-white/40 dark:border-slate-700/80"
              >
                <img
                  v-if="activeSlide.flagUrl"
                  :src="activeSlide.flagUrl"
                  :alt="activeSlide.template.country"
                  class="w-4 h-3 object-cover rounded-[2px] border border-slate-200/80 dark:border-slate-700 shrink-0"
                />
                <span v-else aria-hidden="true">{{ activeSlide.flagEmoji }}</span>
                <span>{{ activeSlide.template.country }}</span>
              </span>

              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/75 text-white backdrop-blur-md border border-white/15"
              >
                <CalendarDays class="w-3.5 h-3.5 text-teal-300" />
                <span>{{ formatDaysLabel(activeSlide.template.durationDays) }}</span>
              </span>
            </div>

            <!-- Bottom Overlays: Trip Type + Tags -->
            <div class="absolute bottom-4 left-4 right-4 z-10 space-y-2.5">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/75 text-white backdrop-blur-md border border-white/15"
                >
                  <Compass class="w-3 h-3 text-teal-300" />
                  <span>{{ getTripTypeLabelRu(activeSlide.template.tripType) }}</span>
                </span>
                <span
                  v-if="activeSlide.template.paceLabel"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 backdrop-blur-md"
                >
                  Темп: {{ activeSlide.template.paceLabel }}
                </span>
              </div>

              <div v-if="activeSlide.template.tags.length > 0" class="flex flex-wrap items-center gap-1.5">
                <span
                  v-for="tag in activeSlide.template.tags.slice(0, 4)"
                  :key="tag"
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/45 text-white/95 backdrop-blur-sm border border-white/15"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Details Panel -->
          <div class="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <!-- Title & Budget Row -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div class="space-y-1.5 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                        activeSlide.theme.badgeClass,
                      ]"
                    >
                      <MapPin class="w-3 h-3" />
                      <span>{{ activeSlide.template.city }}</span>
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      <Sparkles class="w-3 h-3" />
                      <span>Готовый шаблон · {{ activeSlide.template.events.length }} событий</span>
                    </span>
                  </div>

                  <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {{ activeSlide.template.title }}
                  </h3>
                </div>

                <div
                  class="inline-flex sm:flex-col items-center sm:items-end justify-between gap-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/80 shrink-0"
                >
                  <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <Wallet class="w-3.5 h-3.5" />
                    <span>Ориентир</span>
                  </span>
                  <span class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    {{ formatCurrency(activeSlide.template.recommendedBudget, activeSlide.template.currency) }}
                  </span>
                </div>
              </div>

              <!-- Summary -->
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {{ activeSlide.template.summary }}
              </p>

              <!-- 3 Key Events Preview -->
              <div class="space-y-2.5 pt-1">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Ключевые события маршрута
                </p>

                <div class="space-y-2">
                  <div
                    v-for="(ev, idx) in activeSlide.keyEvents"
                    :key="`${activeSlide.template.id}-ev-${idx}`"
                    class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/55 border border-slate-200/60 dark:border-slate-800"
                  >
                    <span
                      :class="[
                        'inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 mt-0.5',
                        activeSlide.theme.dayBadgeClass,
                      ]"
                    >
                      День {{ ev.dayOffset + 1 }}
                    </span>

                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {{ ev.title }}
                      </p>
                      <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span v-if="ev.startTime" class="inline-flex items-center gap-1 tabular-nums">
                          <Clock class="w-3 h-3 shrink-0" />
                          {{ ev.startTime }}
                        </span>
                        <span v-if="ev.location" class="truncate">
                          {{ ev.location }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <RouterLink :to="authStore.isAuthenticated ? '/dashboard' : '/register'">
                <BaseButton variant="primary" size="md">
                  <span>Спланировать маршрут</span>
                  <ArrowRight class="w-4 h-4" />
                </BaseButton>
              </RouterLink>

              <RouterLink
                v-if="activeSlide.countrySlug"
                :to="`/countries/${activeSlide.countrySlug}`"
              >
                <BaseButton variant="outline" size="md">
                  <BookOpen :class="['w-4 h-4', activeSlide.theme.accentIconClass]" />
                  <span>Изучить страну</span>
                </BaseButton>
              </RouterLink>

              <RouterLink v-else to="/countries">
                <BaseButton variant="outline" size="md">
                  <BookOpen :class="['w-4 h-4', activeSlide.theme.accentIconClass]" />
                  <span>Каталог стран</span>
                </BaseButton>
              </RouterLink>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bottom Dot Indicators -->
    <div class="flex items-center justify-center gap-2" aria-hidden="true">
      <button
        v-for="(slide, idx) in slides"
        :key="`dot-${slide.template.id}`"
        type="button"
        tabindex="-1"
        @click="goToSlide(idx)"
        :class="[
          'h-2 rounded-full transition-all duration-300',
          idx === activeIndex
            ? ['w-7', slide.theme.heroAccentStripClass]
            : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600',
        ]"
      />
    </div>
  </div>
</template>

<style scoped>
.slide-progress-bar {
  animation-name: slideProgress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(14px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: none;
  }
}
</style>
