<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { RouterLink } from 'vue-router';
import {
  Compass,
  CalendarRange,
  Wallet,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  CalendarDays,
  Info,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import PublicLayout from '@/layouts/PublicLayout.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import SmartImage from '@/components/ui/SmartImage.vue';
import type { InspirationTrip } from '@/components/trips/InspirationTripModal.vue';

const InspirationTripModal = defineAsyncComponent(
  () => import('@/components/trips/InspirationTripModal.vue')
);

const authStore = useAuthStore();
const selectedInspirationTrip = ref<InspirationTrip | null>(null);

const features = [
  {
    icon: CalendarRange,
    title: 'Пошаговый план по дням',
    description:
      'Система автоматически формирует расписание по календарным дням вашей поездки — добавляйте экскурсии, перелёты и встречи в хронологическом порядке.',
  },
  {
    icon: Wallet,
    title: 'Контроль бюджета и валют',
    description:
      'Фиксируйте общий бюджет путешествия в RUB, USD или EUR и отслеживайте ориентировочную стоимость отдельных мероприятий.',
  },
  {
    icon: Clock,
    title: 'Все детали в одном месте',
    description:
      'Даты, время начала и окончания, адреса, заметки и количество участников всегда под рукой на компьютере, планшете и смартфоне.',
  },
  {
    icon: ShieldCheck,
    title: 'Приватность и надёжность',
    description:
      'Ваши маршруты и личные планы надёжно защищены и доступны только вам после авторизации.',
  },
];

const demoDestinations: InspirationTrip[] = [
  {
    id: 'spb-karelia',
    title: 'Санкт-Петербург и Карелия',
    country: 'Россия',
    countrySlug: 'russia',
    flag: '🇷🇺',
    city: 'Санкт-Петербург',
    days: '5 дней',
    durationDays: 5,
    season: 'Белые ночи и северная природа',
    bestPeriod: 'Май — Август',
    photoUrl: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Nikolay Vorobyev',
    budget: 65000,
    currency: 'RUB',
    currencySymbol: '₽',
    description:
      'Насыщенный маршрут, объединяющий имперский блеск Санкт-Петербурга, разводные мосты, шедевры Эрмитажа и выезд на ретропоезде в горный парк Рускеала среди карельских скал и озёр.',
    highlights: [
      'Государственный Эрмитаж и Дворцовая площадь',
      'Петергоф с каскадами фонтанов',
      'Горный парк Рускеала и мраморный каньон',
      'Ночная прогулка на катере под разводными мостами',
      'Храм Спаса на Крови и Исаакиевский собор',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Невский проспект и мосты Невы',
        activities: 'Прибытие, заселение, пешая прогулка по Невскому проспекту и вечерний круиз на теплоходе под разводными мостами.',
      },
      {
        day: 2,
        title: 'Шедевры искусства и архитектуры',
        activities: 'Экскурсия в Эрмитаж, подъём на колоннаду Исаакиевского собора и обед на набережной Мойки.',
      },
      {
        day: 3,
        title: 'Императорский Петергоф',
        activities: 'Поездка на «Метеоре» в Петергоф, прогулка по Нижнему парку фонтанов и вид на Финский залив.',
      },
      {
        day: 4,
        title: 'Сказочная Карелия и Рускеала',
        activities: 'Ретропоезд «Рускеальский экспресс», мраморный каньон, водопады Ахинкоски и традиционные карельские калитки.',
      },
      {
        day: 5,
        title: 'Музей Фаберже и сувениры',
        activities: 'Шедевры Фаберже в Шуваловском дворце, покупка кофе и десертов, трансфер на вокзал/аэропорт.',
      },
    ],
  },
  {
    id: 'istanbul-bosporus',
    title: 'Босфор и исторический центр',
    country: 'Турция',
    countrySlug: 'turkey',
    flag: '🇹🇷',
    city: 'Стамбул',
    days: '4 дня',
    durationDays: 4,
    season: 'Культура, гастрономия и морские прогулки',
    bestPeriod: 'Апрель — Июнь, Сентябрь — Ноябрь',
    photoUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Anna Berdnik',
    budget: 1200,
    currency: 'USD',
    currencySymbol: '$',
    rubApprox: 110400,
    description:
      'Погрузитесь в атмосферу города на стыке двух континентов: тысячелетняя Айя-София, круизы по проливу Босфор на закате, пряные ароматы Египетского базара и колорит богемных улочек Галаты.',
    highlights: [
      'Собор Святой Софии (Айя-София)',
      'Голубая мечеть и Цистерна Базилика',
      'Паромная переправа на азиатский берег в Кадыкёй',
      'Галатская башня и исторический трамвай на Истикляль',
      'Дворец султанов Топкапы',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Сердце Султанахмета',
        activities: 'Посещение Айя-Софии, Голубой мечети, подземной Цистерны Базилика и турецкий чай в парке Гюльхане.',
      },
      {
        day: 2,
        title: 'Галата и европейский берег',
        activities: 'Подъём на смотровую Галатской башни, колоритная пешеходная улица Истикляль и дегустация пахлавы.',
      },
      {
        day: 3,
        title: 'Круиз по Босфору и Балат',
        activities: 'Морская прогулка вдоль дворца Долмабахче, разноцветные домики района Балат и рынок специй.',
      },
      {
        day: 4,
        title: 'Азиатская сторона и Кадыкёй',
        activities: 'Паромная переправа с чаем и симитами, прогулка по набережной Мода и трансфер в аэропорт.',
      },
    ],
  },
  {
    id: 'rome-tuscany',
    title: 'Вечный город и Тоскана',
    country: 'Италия',
    countrySlug: 'italy',
    flag: '🇮🇹',
    city: 'Рим и Флоренция',
    days: '7 дней',
    durationDays: 7,
    season: 'Архитектура, музеи и панорамные террасы',
    bestPeriod: 'Апрель — Июнь, Сентябрь — Октябрь',
    photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'David Kohler',
    budget: 1850,
    currency: 'EUR',
    currencySymbol: '€',
    rubApprox: 185000,
    description:
      'Незабываемое путешествие по сердцу Италии: от античных форумов, Колизея и фонтана Треви в Риме до шедевров эпохи Возрождения во Флоренции и кипарисовых холмов Тосканы.',
    highlights: [
      'Колизей и Римский форум',
      'Музеи Ватикана и собор Святого Петра',
      'Фонтан Треви и Пантеон',
      'Галерея Уффици и купол Брунеллески во Флоренции',
      'Мост Понте-Веккьо и винные холмы Тосканы',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Знакомство с Римом',
        activities: 'Испанская лестница, Пантеон, пьяцца Навона и традиционный бросок монетки в фонтан Треви.',
      },
      {
        day: 2,
        title: 'Величие Античности',
        activities: 'Подробная экскурсия в Колизей, Римский форум и панорама с холма Палатин.',
      },
      {
        day: 3,
        title: 'Сокровища Ватикана',
        activities: 'Сикстинская капелла Микеланджело, собор Святого Петра и колоритный район Трастевере.',
      },
      {
        day: 4,
        title: 'Переезд во Флоренцию',
        activities: 'Скоростной поезд Frecciarossa, собор Санта-Мария-дель-Фьоре и закат на площади Микеланджело.',
      },
      {
        day: 5,
        title: 'Ренессанс и мост Понте-Веккьо',
        activities: 'Шедевры Боттичелли в галерее Уффици, сады Боболи и флорентийский стейк на ужин.',
      },
      {
        day: 6,
        title: 'Винные холмы Тосканы',
        activities: 'Однодневная поездка в средневековый город Сиена и винодельни региона Кьянти.',
      },
      {
        day: 7,
        title: 'Утренний эспрессо и вылет',
        activities: 'Покупка сувениров из кожи, итальянского сыра и трансфер в аэропорт.',
      },
    ],
  },
  {
    id: 'altai-mountains',
    title: 'Горные озёра и перевалы',
    country: 'Россия',
    countrySlug: 'russia',
    flag: '🇷🇺',
    city: 'Горный Алтай',
    days: '6 дней',
    durationDays: 6,
    season: 'Автомаршрут по Чуйскому тракту',
    bestPeriod: 'Июнь — Сентябрь',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg/1280px-Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    photoAuthor: 'A Vahanvaty (Wikimedia Commons)',
    budget: 80000,
    currency: 'RUB',
    currencySymbol: '₽',
    description:
      'Экспедиция по одной из красивейших автомобильных дорог планеты — Чуйскому тракту. Бирюзовые воды реки Катунь, древние перевалы, загадочное Гейзерное озеро и марсианские пейзажи Кызыл-Чина.',
    highlights: [
      'Живописный Чуйский тракт',
      'Слияние рек Чуи и Катуни',
      'Термальное Гейзерное озеро с узорами на дне',
      'Марсианские глиняные каньоны Кызыл-Чин',
      'Катерная прогулка по Телецкому озеру',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Врата Алтая',
        activities: 'Прилёт в Горно-Алтайск, старт по Чуйскому тракту, берега бирюзовой Катуни и заселение на эко-турбазе.',
      },
      {
        day: 2,
        title: 'Перевалы и наскальные рисунки',
        activities: 'Преодоление перевалов Семинский и Чике-Таман, древнее урочище петроглифов Калбак-Таш.',
      },
      {
        day: 3,
        title: 'Гейзерное озеро и Курайская степь',
        activities: 'Утренние узоры Гейзерного озера и панорама заснеженного Северо-Чуйского хребта.',
      },
      {
        day: 4,
        title: 'Алтайский Марс',
        activities: 'Экскурсия на внедорожниках в цветные каньоны Марс-1 и Марс-2, фотосессия на инопланетных ландшафтах.',
      },
      {
        day: 5,
        title: 'Легендарное Телецкое озеро',
        activities: 'Переезд к северной части Телецкого озера, моторная лодка к водопаду Корбу.',
      },
      {
        day: 6,
        title: 'Возвращение домой',
        activities: 'Покупка алтайского мёда, кедровых орехов и травяных чаёв, вылет из Горно-Алтайска.',
      },
    ],
  },
  {
    id: 'tokyo-kyoto',
    title: 'Неоновый Токио и Киото',
    country: 'Япония',
    countrySlug: 'japan',
    flag: '🇯🇵',
    city: 'Токио и Киото',
    days: '8 дней',
    durationDays: 8,
    season: 'Традиции, технологии и вид на Фудзи',
    bestPeriod: 'Март — Май, Октябрь — Ноябрь',
    photoUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Louie Martinez',
    budget: 2400,
    currency: 'USD',
    currencySymbol: '$',
    rubApprox: 220800,
    description:
      'Удивительный контраст футуристического мегаполиса и многовековых синтоистских святилищ: неоновый перекрёсток Сибуя, тысяча алых ворот Фусими Инари, бамбуковый лес и вид на священную гору Фудзи.',
    highlights: [
      'Знаменитый перекрёсток Сибуя и Хатико',
      'Древний храм Сэнсо-дзи в районе Асакуса',
      'Вид на вулкан Фудзияма с озера Кавагутико',
      'Тысяча ворот святилища Фусими Инари в Киото',
      'Золотой павильон Кинкаку-дзи и квартал гейш Гион',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Прибытие в Токио',
        activities: 'Заселение в Синдзюку, вечерний футуристический город и смотровая площадка на Токийскую башню.',
      },
      {
        day: 2,
        title: 'Традиции и технологии',
        activities: 'Старейший храм Сэнсо-дзи, район электроники Акихабара и сад Синдзюку-гёэн.',
      },
      {
        day: 3,
        title: 'Сибуя и Харадзюку',
        activities: 'Самый оживлённый перекрёсток в мире Сибуя, памятник верному псу Хатико и святилище Мэйдзи.',
      },
      {
        day: 4,
        title: 'Однодневная поездка к Фудзи',
        activities: 'Озеро Кавагутико, открыточный вид на вулкан Фудзияма и канатная дорога Кати-Кати.',
      },
      {
        day: 5,
        title: 'Синкансэн в древний Киото',
        activities: 'Скоростной поезд-пуля, исторический квартал Гион и традиционная чайная церемония.',
      },
      {
        day: 6,
        title: 'Красные ворота Фусими Инари',
        activities: 'Утренний подъём сквозь коридоры алых ворот тории и посещение Золотого павильона.',
      },
      {
        day: 7,
        title: 'Бамбуковая роща и парк оленей',
        activities: 'Бамбуковый лес Арасияма, храм Тэнрю-дзи и выезд в Нару к ручным оленям.',
      },
      {
        day: 8,
        title: 'Сувениры и вылет',
        activities: 'Возвращение в Токио, покупка японских сладостей и трансфер в аэропорт Нарита.',
      },
    ],
  },
  {
    id: 'paris-france',
    title: 'Огни Парижа и замки Луары',
    country: 'Франция',
    countrySlug: 'france',
    flag: '🇫🇷',
    city: 'Париж',
    days: '6 дней',
    durationDays: 6,
    season: 'Искусство, круассаны и романтика Сены',
    bestPeriod: 'Апрель — Июнь, Сентябрь — Октябрь',
    photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    photoAuthor: 'Chris Karidis',
    budget: 1650,
    currency: 'EUR',
    currencySymbol: '€',
    rubApprox: 165000,
    description:
      'Классическая парижская мечта: сияющая огнями Эйфелева башня, полотна Моне и Леонардо да Винчи в Лувре, богемный Монмартр, свежая выпечка и королевская зеркальная галерея Версаля.',
    highlights: [
      'Эйфелева башня и Марсово поле',
      'Музей Лувр («Мона Лиза» и античные скульптуры)',
      'Базилика Сакре-Кёр на вершине Монмартра',
      'Роскошный Версальский дворец и парки',
      'Прогулочный круиз по реке Сене на закате',
    ],
    samplePlan: [
      {
        day: 1,
        title: 'Бонжур, Париж!',
        activities: 'Елисейские поля, Триумфальная арка и вечерний круиз на кораблике по Сене мимо светящейся башни.',
      },
      {
        day: 2,
        title: 'Великие музеи',
        activities: 'Экскурсия в Лувр, сад Тюильри, площадь Согласия и кофе с круассаном в историческом кафе.',
      },
      {
        day: 3,
        title: 'Богемный Монмартр',
        activities: 'Холм художников, базилика Сакре-Кёр с панорамой всего Парижа и знаменитая стена «Я люблю тебя».',
      },
      {
        day: 4,
        title: 'Королевский Версаль',
        activities: 'Зеркальная галерея, апартаменты королей и грандиозный французский парк Людовика XIV.',
      },
      {
        day: 5,
        title: 'Латинский квартал и Сен-Жермен',
        activities: 'Остров Сите, Люксембургский сад, музей Орсе и вечерний пикник с сыром и багетом.',
      },
      {
        day: 6,
        title: 'Прощание с городом любви',
        activities: 'Покупка французского парфюма и макарон Ladurée, трансфер в аэропорт Шарль-де-Голль.',
      },
    ],
  },
];

function openTripDetails(trip: InspirationTrip) {
  selectedInspirationTrip.value = trip;
}
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-teal-50/60 via-white to-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-semibold mb-6"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Удобный органайзер ваших путешествий</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Планируйте идеальные поездки с
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
              TravelPlanner
            </span>
          </h1>

          <p class="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Создавайте маршруты, распределяйте мероприятия по дням, контролируйте бюджет и храните все заметки о предстоящих путешествиях в едином минималистичном пространстве.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RouterLink :to="authStore.isAuthenticated ? '/dashboard' : '/register'" class="w-full sm:w-auto">
              <BaseButton variant="primary" size="lg" fullWidth>
                <span>Начать планировать</span>
                <ArrowRight class="w-5 h-5" />
              </BaseButton>
            </RouterLink>

            <RouterLink to="/explore" class="w-full sm:w-auto">
              <BaseButton variant="secondary" size="lg" fullWidth>
                <Compass class="w-5 h-5" />
                <span>Исследовать 3D-глобус</span>
              </BaseButton>
            </RouterLink>

            <RouterLink
              v-if="!authStore.isAuthenticated"
              to="/login"
              class="w-full sm:w-auto"
            >
              <BaseButton variant="outline" size="lg" fullWidth>
                Войти в аккаунт
              </BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages Section -->
    <section id="features" class="py-16 sm:py-20 bg-white border-y border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Всё необходимое для продуманного маршрута
          </h2>
          <p class="text-sm sm:text-base text-slate-500">
            Никаких перегруженных таблиц и разрозненных заметок — только структурированный план вашей поездки.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="item in features"
            :key="item.title"
            class="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-200 hover:bg-white hover:shadow-soft transition-all duration-200"
          >
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <component :is="item.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2">
              {{ item.title }}
            </h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Destinations Inspiration Section with Real Photos, Ruble Conversion & Click Modal -->
    <section id="destinations" class="py-16 sm:py-20 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/70 mb-2">
              <Sparkles class="w-3.5 h-3.5" />
              <span>Готовые идеи для путешествий</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">
              Вдохновение для следующих поездок
            </h2>
            <p class="text-sm sm:text-base text-slate-500 mt-1">
              Нажмите на карточку любого города, чтобы открыть подробный план по дням, достопримечательности и бюджет.
            </p>
          </div>

          <RouterLink :to="authStore.isAuthenticated ? '/trips/new' : '/register'">
            <BaseButton variant="secondary" size="md">
              <Compass class="w-4 h-4" />
              <span>Создать свой маршрут</span>
            </BaseButton>
          </RouterLink>
        </div>

        <!-- 6 Destination Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="dest in demoDestinations"
            :key="dest.id"
            @click="openTripDetails(dest)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="openTripDetails(dest)"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all duration-200 cursor-pointer group text-left"
          >
            <div>
              <!-- Real Photo Cover with Country & Duration Badges -->
              <div class="relative overflow-hidden aspect-[16/10]">
                <SmartImage
                  :src="dest.photoUrl"
                  size="md"
                  :alt="dest.title"
                  :authorName="dest.photoAuthor"
                  :fallbackTitle="dest.title"
                  :fallbackFlag="dest.flag"
                  aspectClass="w-full h-full"
                  imgClass="group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/25 pointer-events-none" />

                <!-- Badges on top of photo -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-md"
                  >
                    <span>{{ dest.flag }}</span>
                    <span>{{ dest.country }}</span>
                  </span>

                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-slate-900/70 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                    <CalendarDays class="w-3.5 h-3.5 text-teal-300" />
                    {{ dest.days }}
                  </span>
                </div>

                <!-- City Tag on bottom left of photo -->
                <div class="absolute bottom-3 left-3 z-10 text-white flex items-center gap-1 text-xs font-medium drop-shadow">
                  <MapPin class="w-3.5 h-3.5 text-teal-300" />
                  <span>{{ dest.city }}</span>
                </div>
              </div>

              <!-- Content Body -->
              <div class="p-5">
                <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-1.5 line-clamp-1">
                  {{ dest.title }}
                </h3>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {{ dest.description }}
                </p>
              </div>
            </div>

            <!-- Footer: Budget Line with Ruble conversion in brackets for foreign currency -->
            <div class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">Ориентир бюджета:</span>
              <div class="text-right">
                <span class="font-extrabold text-slate-900">
                  {{ dest.budget.toLocaleString('ru-RU') }} {{ dest.currencySymbol }}
                </span>
                <!-- In brackets in rubles for foreign currency -->
                <span
                  v-if="dest.currency !== 'RUB' && dest.rubApprox"
                  class="font-semibold text-teal-700 ml-1"
                >
                  (~{{ dest.rubApprox.toLocaleString('ru-RU') }} ₽)
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Hint below cards -->
        <div class="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Info class="w-3.5 h-3.5 text-slate-400" />
          <span>Нажмите на любую карточку выше, чтобы посмотреть программу по дням и сразу создать поездку</span>
        </div>
      </div>
    </section>

    <!-- Interactive Inspiration Trip Modal -->
    <InspirationTripModal
      :open="Boolean(selectedInspirationTrip)"
      :trip="selectedInspirationTrip"
      @close="selectedInspirationTrip = null"
    />
  </PublicLayout>
</template>
