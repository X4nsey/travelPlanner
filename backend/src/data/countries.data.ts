export type ContinentName =
  | 'Европа'
  | 'Азия'
  | 'Африка'
  | 'Северная Америка'
  | 'Южная Америка'
  | 'Океания';

export interface CountryPhoto {
  url: string;
  thumbUrl: string;
  alt: string;
  category?: 'Города' | 'Природа' | 'Архитектура' | 'Туристические места' | 'Обложка';
  authorName: string;
  authorUrl: string;
  sourceName: 'Unsplash' | 'Pexels' | 'Wikimedia';
  sourceUrl: string;
}

export interface CountryCityItem {
  name: string;
  description: string;
  photoUrl: string;
  authorName?: string;
}

export interface CountryLandmarkItem {
  name: string;
  city: string;
  category: string;
  description: string;
}

export interface CountryData {
  slug: string;
  isoNumeric: string;
  isoAlpha2: string;
  nameRu: string;
  nameEn: string;
  flagEmoji: string;
  flagUrl: string;
  capital: string;
  continent: ContinentName;
  population: number;
  area: number; // km²
  languages: string[];
  currency: string;
  defaultTripCurrency: 'RUB' | 'USD' | 'EUR';
  timezone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  shortDescription: string;
  description: string;
  coverPhoto: CountryPhoto;
  gallery: CountryPhoto[];
  popularCities: CountryCityItem[];
  landmarks: CountryLandmarkItem[];
  featured?: boolean;
}

function uPhoto(
  id: string,
  alt: string,
  authorName: string,
  category: CountryPhoto['category'] = 'Обложка'
): CountryPhoto {
  const baseUrl = `https://images.unsplash.com/photo-${id}`;
  return {
    url: `${baseUrl}?auto=format&fit=crop&w=1400&q=80`,
    thumbUrl: `${baseUrl}?auto=format&fit=crop&w=600&q=75`,
    alt,
    category,
    authorName,
    authorUrl: 'https://unsplash.com',
    sourceName: 'Unsplash',
    sourceUrl: `https://unsplash.com`,
  };
}

export const FEATURED_COUNTRIES: CountryData[] = [
  {
    slug: 'russia',
    isoNumeric: '643',
    isoAlpha2: 'RU',
    nameRu: 'Россия',
    nameEn: 'Russia',
    flagEmoji: '🇷🇺',
    flagUrl: 'https://flagcdn.com/w160/ru.png',
    capital: 'Москва',
    continent: 'Европа',
    population: 146150789,
    area: 17098246,
    languages: ['Русский'],
    currency: 'Российский рубль (RUB, ₽)',
    defaultTripCurrency: 'RUB',
    timezone: 'UTC+2 — UTC+12',
    coordinates: { lat: 61.524, lng: 90.3188 },
    shortDescription: 'Бескрайние просторы от Балтики и Кавказа до озера Байкал и вулканов Камчатки.',
    description:
      'Россия — самое большое государство мира, объединяющее десятки климатических зон, богатейшее архитектурное наследие Москвы и Санкт-Петербурга, древние города Золотого кольца, горные вершины Алтая и Кавказа, а также уникальную природу Байкала и Дальнего Востока.',
    coverPhoto: uPhoto('1513326738677-b964603b136d', 'Москва, Россия', 'Nikolay Vorobyev'),
    gallery: [
      uPhoto('1556610961-2fecc5927173', 'Санкт-Петербург и разводные мосты', 'Michael Parulava', 'Города'),
      uPhoto('1548625361-16800b455387', 'Озеро Байкал зимой', ' Philipp Trubchenko', 'Природа'),
      uPhoto('1520106212299-d99c443e4568', 'Архитектура исторического центра Москвы', 'Artem Bryzgalov', 'Архитектура'),
      uPhoto('1508804185872-d7badad00f7d', 'Горные пейзажи Алтая', 'Sasha Freemind', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Москва',
        description: 'Динамичный мегаполис с Красной площадью, историческими бульварами, парками и современными музеями.',
        photoUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Санкт-Петербург',
        description: 'Культурная столица с дворцовыми набережными Невы, Эрмитажем и белыми ночами.',
        photoUrl: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Казань',
        description: 'Третья столица России на берегу Волги, где гармонично сочетаются восточная и европейская культуры.',
        photoUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Сочи',
        description: 'Главный курорт Чёрного моря и круглогодичный горный кластер Красной Поляны.',
        photoUrl: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Московский Кремль и Красная площадь',
        city: 'Москва',
        category: 'Исторический ансамбль',
        description: 'Главный архитектурный и исторический комплекс столицы, включённый в список Всемирного наследия ЮНЕСКО.',
      },
      {
        name: 'Государственный Эрмитаж',
        city: 'Санкт-Петербург',
        category: 'Музей искусства',
        description: 'Один из крупнейших и старейших художественных и культурно-исторических музеев мира.',
      },
      {
        name: 'Озеро Байкал',
        city: 'Иркутская область / Бурятия',
        category: 'Природный памятник',
        description: 'Самое глубокое озеро планеты и крупнейший природный резервуар пресной воды.',
      },
    ],
    featured: true,
  },
  {
    slug: 'france',
    isoNumeric: '250',
    isoAlpha2: 'FR',
    nameRu: 'Франция',
    nameEn: 'France',
    flagEmoji: '🇫🇷',
    flagUrl: 'https://flagcdn.com/w160/fr.png',
    capital: 'Париж',
    continent: 'Европа',
    population: 68170228,
    area: 551695,
    languages: ['Французский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    coordinates: { lat: 46.2276, lng: 2.2137 },
    shortDescription: 'Романтика Парижа, лавандовые поля Прованса, замки Луары и Лазурный берег.',
    description:
      'Франция — мировое направление номер один для ценителей искусства, высокой гастрономии и живописных пейзажей. От бульваров Парижа и средневекового Мон-Сен-Мишеля до альпийских вершин Шамони и средиземноморских курортов Ниццы.',
    coverPhoto: uPhoto('1502602898657-3e91760cbb34', 'Париж и Эйфелева башня, Франция', 'Chris Karidis'),
    gallery: [
      uPhoto('1499856871958-5b9627545d1a', 'Мост Александра III и Сена, Париж', 'Leonard Cotte', 'Города'),
      uPhoto('1533105079780-92b9be482077', 'Лазурный берег и прибрежные скалы', 'insung yoon', 'Природа'),
      uPhoto('1522093007474-d86e9bf7ba6f', 'Исторические кварталы Парижа', 'DXL', 'Архитектура'),
      uPhoto('1509439581779-6298f75bf6e5', 'Аббатство Мон-Сен-Мишель', 'Pedro Lastra', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Париж',
        description: 'Столица моды, искусства и архитектуры с Лувром, Монмартром и набережными Сены.',
        photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Ницца',
        description: 'Сердце Лазурного берега с Английской набережной, лазурным морем и старым городом.',
        photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Лион',
        description: 'Гастрономическая столица Франции на слиянии рек Роны и Соны с кварталами эпохи Возрождения.',
        photoUrl: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Страсбург',
        description: 'Очаровательный город в Эльзасе с фахверковыми домами квартала Маленькая Франция.',
        photoUrl: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Эйфелева башня',
        city: 'Париж',
        category: 'Архитектурный символ',
        description: 'Знаменитая 330-метровая башня на Марсовом поле, открывающая панорамный вид на весь Париж.',
      },
      {
        name: 'Музей Лувр',
        city: 'Париж',
        category: 'Художественный музей',
        description: 'Королевский дворец с богатейшей коллекцией мировых шедевров, включая «Мону Лизу».',
      },
      {
        name: 'Мон-Сен-Мишель',
        city: 'Нормандия',
        category: 'Средневековое аббатство',
        description: 'Остров-крепость с бенедиктинским аббатством на скале в окружении самых сильных приливов Европы.',
      },
    ],
    featured: true,
  },
  {
    slug: 'italy',
    isoNumeric: '380',
    isoAlpha2: 'IT',
    nameRu: 'Италия',
    nameEn: 'Italy',
    flagEmoji: '🇮🇹',
    flagUrl: 'https://flagcdn.com/w160/it.png',
    capital: 'Рим',
    continent: 'Европа',
    population: 58870762,
    area: 301340,
    languages: ['Итальянский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    coordinates: { lat: 41.8719, lng: 12.5674 },
    shortDescription: 'Античный Рим, каналы Венеции, шедевры Ренессанса во Флоренции и побережье Амальфи.',
    description:
      'Италия — настоящий музей под открытым небом с наибольшим числом объектов ЮНЕСКО в мире. Здесь античные памятники соседствуют с ренессансными соборами, живописными холмами Тосканы, озёрами Комо и Гарда и солнечными берегами Средиземноморья.',
    coverPhoto: uPhoto('1552832230-c0197dd311b5', 'Колизей в Риме, Италия', 'David Köhler'),
    gallery: [
      uPhoto('1514890547357-a9ee288728e0', 'Гранд-канал в Венеции', 'Henrique Ferreira', 'Города'),
      uPhoto('1533105079780-92b9be482077', 'Побережье Амальфи и Чинкве-Терре', 'Jack Ward', 'Природа'),
      uPhoto('1543429257-3eb0b65d9c58', 'Собор Санта-Мария-дель-Фьоре во Флоренции', 'meritt thomas', 'Архитектура'),
      uPhoto('1516483638261-f4dbaf036963', 'Скалистые деревни Лигурии', 'Sung Jin Cho', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Рим',
        description: 'Вечный город с Колизеем, Римским форумом, Пантеоном и фонтаном Треви.',
        photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Флоренция',
        description: 'Колыбель итальянского Возрождения с галереей Уффици, собором Дуомо и мостом Понте-Веккьо.',
        photoUrl: 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Венеция',
        description: 'Уникальный город на воде с площадью Сан-Марко, дворцом Дожей и сотнями мостов.',
        photoUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Милан',
        description: 'Деловая и модная столица Италии с белоснежным готическим собором Дуомо.',
        photoUrl: 'https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Колизей (Амфитеатр Флавиев)',
        city: 'Рим',
        category: 'Античный памятник',
        description: 'Крупнейший древнеримский амфитеатр I века н.э., ставший главным символом Рима.',
      },
      {
        name: 'Площадь и собор Святого Марка',
        city: 'Венеция',
        category: 'Архитектурный ансамбль',
        description: 'Историческое сердце Венецианской республики с византийскими мозаиками и колокольней Кампанила.',
      },
      {
        name: 'Санта-Мария-дель-Фьоре',
        city: 'Флоренция',
        category: 'Кафедральный собор',
        description: 'Кафедральный собор Флоренции с легендарным терракотовым куполом работы Филиппо Брунеллески.',
      },
    ],
    featured: true,
  },
  {
    slug: 'japan',
    isoNumeric: '392',
    isoAlpha2: 'JP',
    nameRu: 'Япония',
    nameEn: 'Japan',
    flagEmoji: '🇯🇵',
    flagUrl: 'https://flagcdn.com/w160/jp.png',
    capital: 'Токио',
    continent: 'Азия',
    population: 124516650,
    area: 377975,
    languages: ['Японский'],
    currency: 'Японская иена (JPY, ¥)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+9 (JST)',
    coordinates: { lat: 36.2048, lng: 138.2529 },
    shortDescription: 'Гармония древних храмов Киото, священной горы Фудзи и неонового мегаполиса Токио.',
    description:
      'Япония — островное государство в Восточной Азии, где многовековые традиции чайных церемоний, садов камней и цветения сакуры сочетаются с передовыми технологиями, скоростными поездами синкансэн и уникальной гастрономической культурой.',
    coverPhoto: uPhoto('1493976040374-85c8e12f0c0e', 'Киото и пагода на закате, Япония', 'Su San Lee'),
    gallery: [
      uPhoto('1503899036084-c55cdd92da26', 'Вечерние кварталы Токио', 'Jezael Melgoza', 'Города'),
      uPhoto('1490806843957-31f4c9a91c65', 'Гора Фудзи и цветение сакуры', 'JJ Ying', 'Природа'),
      uPhoto('1478436127897-769e1b3f0f36', 'Красные ворота тории Фусими Инари в Киото', 'finding dan', 'Архитектура'),
      uPhoto('1528164344705-475426879c0d', 'Замок Химэдзи и японские сады', 'Soragrit Wongsa', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Токио',
        description: 'Ультрасовременная столица с районами Сибуя и Синдзюку, храмом Сэнсо-дзи и императорским парком.',
        photoUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Киото',
        description: 'Древняя императорская столица с Золотым павильоном Кинкаку-дзи и бамбуковой рощей Арасияма.',
        photoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Осака',
        description: 'Гастрономическая столица Японии с самурайским замком Осака и яркой набережной Дотонбори.',
        photoUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Гора Фудзи (Фудзияма)',
        city: 'Префектуры Сидзуока и Яманаси',
        category: 'Природная святыня',
        description: 'Священный вулкан высотой 3776 метров с идеально симметричным заснеженным конусом.',
      },
      {
        name: 'Святилище Фусими Инари-тайся',
        city: 'Киото',
        category: 'Синтоистский храм',
        description: 'Храмовый комплекс, знаменитый тысячами ярко-оранжевых ворот тории на склонах гор.',
      },
      {
        name: 'Кинкаку-дзи (Золотой павильон)',
        city: 'Киото',
        category: 'Буддийский храм',
        description: 'Изящный павильон, покрытый сусальным золотом и отражающийся в зеркальном пруду Кёкоти.',
      },
    ],
    featured: true,
  },
  {
    slug: 'turkey',
    isoNumeric: '792',
    isoAlpha2: 'TR',
    nameRu: 'Турция',
    nameEn: 'Turkey',
    flagEmoji: '🇹🇷',
    flagUrl: 'https://flagcdn.com/w160/tr.png',
    capital: 'Анкара',
    continent: 'Азия',
    population: 85372377,
    area: 783562,
    languages: ['Турецкий'],
    currency: 'Турецкая лира (TRY, ₺)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+3 (TRT)',
    coordinates: { lat: 38.9637, lng: 35.2433 },
    shortDescription: 'Пролив Босфор в Стамбуле, воздушные шары Каппадокии и бирюзовые бухты Средиземного моря.',
    description:
      'Турция расположена на стыке Европы и Азии и славится колоссальным историческим наследием Византии и Османской империи, инопланетными долинами Каппадокии, термальными источниками Памуккале и живописным Ликийским побережьем.',
    coverPhoto: uPhoto('1524231757912-21f4fe3a7200', 'Стамбул и пролив Босфор, Турция', 'Anna Berdnik'),
    gallery: [
      uPhoto('1541432901042-2d8bd64b4a9b', 'Панорама Стамбула и мечетей', 'Fatih Yürür', 'Города'),
      uPhoto('1570939274717-7eda259b50ed', 'Воздушные шары над долинами Каппадокии', 'Daniela Cuevas', 'Природа'),
      uPhoto('1527838832700-5059252407fa', 'Собор Святой Софии и Голубая мечеть', 'Adli Wahid', 'Архитектура'),
      uPhoto('1519817650390-64a93db51149', 'Бирюзовое побережье Антальи и Фетхие', 'Engin Akyurt', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Стамбул',
        description: 'Единственный мегаполис мира на двух континентах с Айя-Софией, дворцом Топкапы и Гранд-базаром.',
        photoUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Анталья',
        description: 'Курортная столица Средиземноморья со старым кварталом Калеичи, водопадами и античными городами.',
        photoUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Гёреме (Каппадокия)',
        description: 'Скальные города, подземные лабиринты и утренние полёты десятков воздушных шаров.',
        photoUrl: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Айя-София (Собор Святой Софии)',
        city: 'Стамбул',
        category: 'Памятник архитектуры',
        description: 'Величественный шедевр византийского зодчества VI века в историческом районе Султанахмет.',
      },
      {
        name: 'Национальный парк Гёреме',
        city: 'Каппадокия',
        category: 'Природно-исторический объект',
        description: 'Вулканические ландшафты и пещерные храмы, внесённые в список Всемирного наследия ЮНЕСКО.',
      },
      {
        name: 'Травертины Памуккале и Иераполис',
        city: 'Денизли',
        category: 'Природный комплекс',
        description: 'Белоснежные известняковые террасы с геотермальными источниками и руинами античного курорта.',
      },
    ],
    featured: true,
  },
  {
    slug: 'spain',
    isoNumeric: '724',
    isoAlpha2: 'ES',
    nameRu: 'Испания',
    nameEn: 'Spain',
    flagEmoji: '🇪🇸',
    flagUrl: 'https://flagcdn.com/w160/es.png',
    capital: 'Мадрид',
    continent: 'Европа',
    population: 48373336,
    area: 505992,
    languages: ['Испанский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    coordinates: { lat: 40.4637, lng: -3.7492 },
    shortDescription: 'Шедевры Гауди в Барселоне, королевский Мадрид, страстная Андалусия и солнечные берега.',
    description:
      'Испания очаровывает ярким темпераментом, фантастической архитектурой Антонио Гауди, мавританскими дворцами Гранады и Севильи, мировыми художественными коллекциями музея Прадо и тёплым побережьем Средиземного моря и Атлантики.',
    coverPhoto: uPhoto('1583422409516-2895a77efded', 'Барселона и Саграда Фамилия, Испания', 'Logan Armstrong'),
    gallery: [
      uPhoto('1539037116277-4db20889f2d4', 'Площадь Испании в Мадриде', 'Florian Wehde', 'Города'),
      uPhoto('1509840841025-9088ba78a826', 'Скалистые бухты Коста-Брава', 'Drew Farwell', 'Природа'),
      uPhoto('1511527661048-7fe73d85e9a4', 'Площадь Испании в Севилье', 'Henrique Ferreira', 'Архитектура'),
      uPhoto('1558642084-fd07fae5282e', 'Парк Гуэль в Барселоне', 'Daniel Corneschi', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Барселона',
        description: 'Столица Каталонии на берегу моря с Готическим кварталом и творениями Антонио Гауди.',
        photoUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Мадрид',
        description: 'Величественная столица с Королевским дворцом, парком Ретиро и Золотым треугольником искусств.',
        photoUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Севилья',
        description: 'Сердце Андалусии с королевским Алькасаром, готическим собором и родиной фламенко.',
        photoUrl: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Храм Святого Семейства (Саграда Фамилия)',
        city: 'Барселона',
        category: 'Архитектурный шедевр',
        description: 'Грандиозная базилика по проекту Антонио Гауди, ставшая главным символом Барселоны.',
      },
      {
        name: 'Дворец Альгамбра',
        city: 'Гранада',
        category: 'Дворцово-парковый ансамбль',
        description: 'Вершина мавританского зодчества в Европе с резными двориками и садами Хенералифе.',
      },
      {
        name: 'Национальный музей Прадо',
        city: 'Мадрид',
        category: 'Художественный музей',
        description: 'Одно из богатейших собраний европейской живописи с полотнами Веласкеса, Гойи и Эль Греко.',
      },
    ],
    featured: true,
  },
  {
    slug: 'thailand',
    isoNumeric: '764',
    isoAlpha2: 'TH',
    nameRu: 'Таиланд',
    nameEn: 'Thailand',
    flagEmoji: '🇹🇭',
    flagUrl: 'https://flagcdn.com/w160/th.png',
    capital: 'Бангкок',
    continent: 'Азия',
    population: 71801279,
    area: 513120,
    languages: ['Тайский'],
    currency: 'Тайский бат (THB, ฿)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+7 (ICT)',
    coordinates: { lat: 15.87, lng: 100.9925 },
    shortDescription: 'Золотые храмы Бангкока, изумрудные бухты Пхукета и Краби и тропические острова Сиамского залива.',
    description:
      'Таиланд — «Страна тысячи улыбок», привлекающая путешественников белоснежными пляжами Андаманского моря, древними буддийскими святынями Аюттхаи и Чиангмая, тропическими национальными парками и яркой экзотической кухней.',
    coverPhoto: uPhoto('1528181304800-259b08848526', 'Храмы и природа Таиланда', 'Mathew Schwartz'),
    gallery: [
      uPhoto('1508009603885-50cf7c579365', 'Королевский дворец и Ват Арун в Бангкоке', 'Alejandro Cartagena', 'Города'),
      uPhoto('1552465011-b4e21bf6e79a', 'Известняковые скалы и лодки в заливе Пхангнга', 'Sumit Chinchane', 'Природа'),
      uPhoto('1563492065599-3520f775eeed', 'Белый храм Ват Ронг Кхун в Чианграе', 'geran de klerk', 'Архитектура'),
      uPhoto('1537956965359-7573183d1f57', 'Пляжи архипелага Пхи-Пхи', 'Evan Krause', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Бангкок',
        description: 'Контрастный мегаполис с Большим королевским дворцом, храмом Изумрудного Будды и панорамными небоскрёбами.',
        photoUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Пхукет',
        description: 'Крупнейший курортный остров с живописными пляжами, смотровыми площадками и старым городом.',
        photoUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Чиангмай',
        description: 'Культурная столица севера страны в окружении туманных гор и сотен древних храмов.',
        photoUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Большой королевский дворец',
        city: 'Бангкок',
        category: 'Дворцово-храмовый комплекс',
        description: 'Историческая резиденция королей Таиланда и место хранения святыни Ват Пхра Кео.',
      },
      {
        name: 'Залив Пхангнга и острова Пхи-Пхи',
        city: 'Провинция Краби / Пхукет',
        category: 'Морской национальный парк',
        description: 'Отвесные карстовые скалы, возвышающиеся из бирюзовых вод Андаманского моря.',
      },
      {
        name: 'Исторический город Аюттхая',
        city: 'Провинция Пхранакхонсиаюттхая',
        category: 'Памятник ЮНЕСКО',
        description: 'Руины древней столицы королевства Сиам с величественными ступами и статуями Будды.',
      },
    ],
    featured: true,
  },
  {
    slug: 'uae',
    isoNumeric: '784',
    isoAlpha2: 'AE',
    nameRu: 'ОАЭ',
    nameEn: 'United Arab Emirates',
    flagEmoji: '🇦🇪',
    flagUrl: 'https://flagcdn.com/w160/ae.png',
    capital: 'Абу-Даби',
    continent: 'Азия',
    population: 9516871,
    area: 83600,
    languages: ['Арабский'],
    currency: 'Дирхам ОАЭ (AED)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+4 (GST)',
    coordinates: { lat: 23.4241, lng: 53.8478 },
    shortDescription: 'Футуристические небоскрёбы Дубая, белоснежная мечеть Шейха Зайда и золотые барханы пустыни.',
    description:
      'Объединённые Арабские Эмираты поражают масштабом архитектурных рекордов, рукотворными островами Персидского залива, музеями мирового уровня в Абу-Даби и первоклассным пляжным отдыхом.',
    coverPhoto: uPhoto('1512453979798-5ea266f8880c', 'Панорама Дубая и Бурдж-Халифа, ОАЭ', 'ZQ Lee'),
    gallery: [
      uPhoto('1518684079-3c830dcef090', 'Небоскрёбы Дубай Марины', 'Christoph Schulz', 'Города'),
      uPhoto('1451337516015-6b6e9a44a8a3', 'Песчаные дюны Аравийской пустыни', 'Nasa', 'Природа'),
      uPhoto('1584551246679-0daf3d275d0f', 'Большая мечеть Шейха Зайда в Абу-Даби', 'David Rodrigo', 'Архитектура'),
      uPhoto('1546412414-e1885259563a', 'Набережные Персидского залива', 'Darcey Beau', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Дубай',
        description: 'Город будущего с башней Бурдж-Халифа, Музеем будущего, поющими фонтанами и островом Пальма Джумейра.',
        photoUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Абу-Даби',
        description: 'Столица страны с мечетью Шейха Зайда, музеем Лувр Абу-Даби и парком развлечений на острове Яс.',
        photoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Шарджа',
        description: 'Культурная столица арабского мира с многочисленными музеями и традиционными восточными рынками.',
        photoUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Бурдж-Халифа',
        city: 'Дубай',
        category: 'Сверхвысотный небоскрёб',
        description: 'Самое высокое здание в мире (828 м) со смотровыми площадками на 124, 125 и 148 этажах.',
      },
      {
        name: 'Мечеть Шейха Зайда',
        city: 'Абу-Даби',
        category: 'Архитектурный памятник',
        description: 'Величественная мечеть из белоснежного мрамора с 82 куполами и инкрустацией из полудрагоценных камней.',
      },
      {
        name: 'Лувр Абу-Даби',
        city: 'Абу-Даби',
        category: 'Художественный музей',
        description: 'Музей мирового искусства под ажурным куполом архитектора Жана Нувеля на острове Саадият.',
      },
    ],
    featured: true,
  },
  {
    slug: 'egypt',
    isoNumeric: '818',
    isoAlpha2: 'EG',
    nameRu: 'Египет',
    nameEn: 'Egypt',
    flagEmoji: '🇪🇬',
    flagUrl: 'https://flagcdn.com/w160/eg.png',
    capital: 'Каир',
    continent: 'Африка',
    population: 112716598,
    area: 1002450,
    languages: ['Арабский'],
    currency: 'Египетский фунт (EGP)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+2 (EET)',
    coordinates: { lat: 26.8206, lng: 30.8025 },
    shortDescription: 'Великие пирамиды Гизы, храмы Луксора на берегах Нила и коралловые рифы Красного моря.',
    description:
      'Египет — колыбель одной из древнейших цивилизаций человечества. Путешественников ждут монументальные пирамиды и Большой Сфинкс, круизы по Нилу от Луксора до Асуана и богатейший подводный мир Красного моря.',
    coverPhoto: uPhoto('1539650116574-8efeb43e2750', 'Пирамиды Гизы и Сфинкс, Египет', 'Spencer Davis'),
    gallery: [
      uPhoto('1572252821143-035a024857ac', 'Панорама Каира и реки Нил', 'Omar Elsharawy', 'Города'),
      uPhoto('1544551763-46a013bb70d5', 'Коралловые рифы Красного моря', 'Francesco Ungaro', 'Природа'),
      uPhoto('1568322445389-f64ac2515020', 'Колоннады Карнакского храма в Луксоре', 'AXP Photography', 'Архитектура'),
      uPhoto('1503177119275-0aa32b3a9368', 'Долина Царей и храм Хатшепсут', 'Simon Berger', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Каир',
        description: 'Крупнейший город Африки рядом с плато Гиза, Египетским музеем и средневековой цитаделью.',
        photoUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Луксор',
        description: 'Древние Фивы с Карнакским храмом, Луксорским храмом и гробницами фараонов в Долине Царей.',
        photoUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Шарм-эш-Шейх',
        description: 'Популярный курорт на Синайском полуострове рядом с морским заповедником Рас-Мохаммед.',
        photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Пирамиды Гизы и Большой Сфинкс',
        city: 'Гиза (Каир)',
        category: 'Чудо Древнего мира',
        description: 'Единственное сохранившееся из Семи чудес античного мира, возведённое более 4500 лет назад.',
      },
      {
        name: 'Карнакский храмовый комплекс',
        city: 'Луксор',
        category: 'Древнеегипетский храм',
        description: 'Грандиозный священный комплекс с гипостильным залом из 134 гигантских колонн.',
      },
      {
        name: 'Храмы Абу-Симбел',
        city: 'Асуан',
        category: 'Скальный храм',
        description: 'Высеченные в скале храмы фараона Рамсеса II на берегу озера Насер.',
      },
    ],
    featured: true,
  },
  {
    slug: 'usa',
    isoNumeric: '840',
    isoAlpha2: 'US',
    nameRu: 'США',
    nameEn: 'United States',
    flagEmoji: '🇺🇸',
    flagUrl: 'https://flagcdn.com/w160/us.png',
    capital: 'Вашингтон',
    continent: 'Северная Америка',
    population: 334914895,
    area: 9833520,
    languages: ['Английский'],
    currency: 'Доллар США (USD, $)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC-4 — UTC-10',
    coordinates: { lat: 37.0902, lng: -95.7129 },
    shortDescription: 'Небоскрёбы Нью-Йорка, каньоны и национальные парки Запада, побережье Калифорнии и Флориды.',
    description:
      'Соединённые Штаты Америки предлагают невероятное разнообразие маршрутов: от культурных центров Восточного побережья до Гранд-Каньона, гейзеров Йеллоустоуна, секвой Калифорнии и живописного Тихоокеанского шоссе.',
    coverPhoto: uPhoto('1485738422979-f5c462d49f74', 'Манхэттен, Нью-Йорк, США', 'Luca Bravo'),
    gallery: [
      uPhoto('1496442226666-8d4d0e62e6e9', 'Таймс-сквер и панорама Нью-Йорка', 'kitthitorn', 'Города'),
      uPhoto('1474044159687-1ee9f3a51722', 'Гранд-Каньон в Аризоне', 'Sonaal Bangera', 'Природа'),
      uPhoto('1501594907352-04cda38ebc29', 'Мост Золотые Ворота в Сан-Франциско', 'Maarten van den Heuvel', 'Архитектура'),
      uPhoto('1506744038136-46273834b3fb', 'Национальный парк Йосемити', 'Bailey Zindel', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Нью-Йорк',
        description: 'Мировой мегаполис с Центральным парком, Бродвеем, Статуей Свободы и музеем Метрополитен.',
        photoUrl: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Сан-Франциско',
        description: 'Холмистый город у залива с мостом Золотые Ворота, канатными трамваями и островом Алькатрас.',
        photoUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Лос-Анджелес',
        description: 'Солнечная столица киноиндустрии с набережной Санта-Моники и обсерваторией Гриффита.',
        photoUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Национальный парк Гранд-Каньон',
        city: 'Штат Аризона',
        category: 'Природный памятник',
        description: 'Один из глубочайших и самых впечатляющих каньонов планеты, прорезанный рекой Колорадо.',
      },
      {
        name: 'Статуя Свободы',
        city: 'Нью-Йорк',
        category: 'Исторический монумент',
        description: 'Знаменитый колоссальный памятник на острове Свободы в Нью-Йоркской бухте.',
      },
      {
        name: 'Йеллоустоунский национальный парк',
        city: 'Штаты Вайоминг, Монтана, Айдахо',
        category: 'Биосферный заповедник',
        description: 'Первый в мире национальный парк, известный геотермальными источниками и каньоном.',
      },
    ],
    featured: true,
  },
  {
    slug: 'brazil',
    isoNumeric: '076',
    isoAlpha2: 'BR',
    nameRu: 'Бразилия',
    nameEn: 'Brazil',
    flagEmoji: '🇧🇷',
    flagUrl: 'https://flagcdn.com/w160/br.png',
    capital: 'Бразилиа',
    continent: 'Южная Америка',
    population: 203080756,
    area: 8515767,
    languages: ['Португальский'],
    currency: 'Бразильский реал (BRL, R$)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC-2 — UTC-5',
    coordinates: { lat: -14.235, lng: -51.9253 },
    shortDescription: 'Бухты Рио-де-Жанейро, мощь водопадов Игуасу и бескрайние тропические леса Амазонии.',
    description:
      'Бразилия — крупнейшая страна Южной Америки, где гранитные пики Рио-де-Жанейро и пляжи Копакабаны соседствуют с гигантским каскадом водопадов Игуасу, колониальным наследием Салвадора и уникальной экосистемой Амазонки.',
    coverPhoto: uPhoto('1483729558449-99ef09a8c325', 'Рио-де-Жанейро и гора Сахарная Голова, Бразилия', 'Raphael Nogueira'),
    gallery: [
      uPhoto('1516306580123-e6e52b1b7b5f', 'Панорама Рио-де-Жанейро с высоты', 'Agustin Diaz Gargiulo', 'Города'),
      uPhoto('1544989164-31dc3c645987', 'Каскады водопадов Игуасу', 'Sander Lenaerts', 'Природа'),
      uPhoto('1518639192441-8fce0a366e2e', 'Статуя Христа-Искупителя на горе Корковаду', 'Mylo Kaye', 'Архитектура'),
      uPhoto('1551632811-561732d1e306', 'Тропические берега и острова', 'v2osk', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Рио-де-Жанейро',
        description: 'Живописный город между горами и океаном с пляжами Ипанема и Копакабана и горой Корковаду.',
        photoUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Сан-Паулу',
        description: 'Финансовое и культурное сердце Южной Америки с проспектом Паулиста и художественными музеями.',
        photoUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Фос-ду-Игуасу',
        description: 'Отправная точка для знакомства с величественным комплексом из 275 водопадов Игуасу.',
        photoUrl: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Статуя Христа-Искупителя',
        city: 'Рио-де-Жанейро',
        category: 'Монумент',
        description: 'Знаменитый символ Бразилии на вершине горы Корковаду в национальном парке Тижука.',
      },
      {
        name: 'Водопады Игуасу',
        city: 'Штат Парана',
        category: 'Природное чудо света',
        description: 'Грандиозный каскад водопадов на границе Бразилии и Аргентины с ущельем «Глотка Дьявола».',
      },
      {
        name: 'Гора Сахарная Голова (Пан-ди-Асукар)',
        city: 'Рио-де-Жанейро',
        category: 'Панорамная вершина',
        description: 'Гранитный утёс у входа в залив Гуанабара с канатной дорогой и лучшими видами на закат.',
      },
    ],
    featured: true,
  },
  {
    slug: 'australia',
    isoNumeric: '036',
    isoAlpha2: 'AU',
    nameRu: 'Австралия',
    nameEn: 'Australia',
    flagEmoji: '🇦🇺',
    flagUrl: 'https://flagcdn.com/w160/au.png',
    capital: 'Канберра',
    continent: 'Океания',
    population: 26638544,
    area: 7692024,
    languages: ['Английский'],
    currency: 'Австралийский доллар (AUD, A$)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+8 — UTC+11',
    coordinates: { lat: -25.2744, lng: 133.7751 },
    shortDescription: 'Гавань Сиднея с легендарной Оперой, Большой Барьерный риф и Великая океанская дорога.',
    description:
      'Австралия — целый континент удивительной природы и современных городов. Здесь можно увидеть паруса Сиднейского оперного театра, коралловые сады Большого Барьерного рифа, скалы Двенадцати Апостолов и красные просторы Улуру.',
    coverPhoto: uPhoto('1506973035872-a4ec16b8e8d9', 'Сиднейский оперный театр и Харбор-Бридж, Австралия', 'Dan Freeman'),
    gallery: [
      uPhoto('1514395462725-fb4566210144', 'Панорама Мельбурна и реки Ярра', 'Denise Jans', 'Города'),
      uPhoto('1529108190281-9a4f620bc2d8', 'Скалы Двенадцать Апостолов на Великой океанской дороге', 'Inigo De la Maza', 'Природа'),
      uPhoto('1523482580672-f109ba8cb9be', 'Архитектура Сиднейской гавани', 'Photoholgic', 'Архитектура'),
      uPhoto('1544551763-46a013bb70d5', 'Большой Барьерный риф с высоты', 'Francesco Ungaro', 'Туристические места'),
    ],
    popularCities: [
      {
        name: 'Сидней',
        description: 'Крупнейший мегаполис страны с живописной бухтой, Оперным театром и океанским пляжем Бонди.',
        photoUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Мельбурн',
        description: 'Культурная столица Австралии, отправная точка для путешествия по Великой океанской дороге.',
        photoUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Кэрнс',
        description: 'Тропические ворота к коралловым островам Большого Барьерного рифа и древним лесам Дейнтри.',
        photoUrl: 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=700&q=80',
      },
    ],
    landmarks: [
      {
        name: 'Сиднейский оперный театр',
        city: 'Сидней',
        category: 'Архитектурный шедевр XX века',
        description: 'Всемирно известное здание с крышей в форме парусов на берегу Сиднейской гавани.',
      },
      {
        name: 'Большой Барьерный риф',
        city: 'Штат Квинсленд',
        category: 'Морской заповедник ЮНЕСКО',
        description: 'Крупнейшая в мире система коралловых рифов протяжённостью более 2300 километров.',
      },
      {
        name: 'Великая океанская дорога и 12 Апостолов',
        city: 'Штат Виктория',
        category: 'Панорамный маршрут',
        description: 'Живописная прибрежная трасса вдоль известняковых утёсов Южного океана.',
      },
    ],
    featured: true,
  },
];
