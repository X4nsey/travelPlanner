import { ContinentName, CountryData, CountryPhoto } from './countries.data';
import { ALL_COUNTRIES } from './countries-catalog-extended.data';
import { applyVerifiedPhotosToCountry } from './verified-wikimedia-photos.data';

export interface CompactCountrySpec {
  slug: string;
  isoNumeric: string;
  isoAlpha2: string;
  nameRu: string;
  nameEn: string;
  flagEmoji: string;
  capital: string;
  continent: ContinentName;
  population: number;
  area: number;
  languages: string[];
  currency: string;
  defaultTripCurrency: 'RUB' | 'USD' | 'EUR';
  timezone: string;
  lat: number;
  lng: number;
  shortDescription: string;
  description: string;
  cities: string[];
  coverPhoto: { url: string; thumbUrl?: string; author: string; alt?: string; sourceName?: 'Wikimedia' | 'Unsplash' };
  galleryPhotos: Array<{
    url: string;
    thumbUrl?: string;
    author: string;
    alt: string;
    category: CountryPhoto['category'];
    sourceName?: 'Wikimedia' | 'Unsplash';
  }>;
  cityPhotoUrls: [string, string, string];
}

const COMPACT_SPECS: CompactCountrySpec[] = [
  {
    slug: 'fiji',
    isoNumeric: '242',
    isoAlpha2: 'FJ',
    nameRu: 'Фиджи',
    nameEn: 'Fiji',
    flagEmoji: '🇫🇯',
    capital: 'Сува',
    continent: 'Океания',
    population: 929766,
    area: 18274,
    languages: ['Английский', 'Фиджийский', 'Хинди'],
    currency: 'Доллар Фиджи (FJD, $)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+12 (FJT)',
    lat: -17.7134,
    lng: 178.065,
    shortDescription: 'Бирюзовые лагуны Тихого океана, коралловые рифы, пляжи архипелага Маманука и культура южных морей.',
    description:
      'Фиджи — тропический рай в южной части Тихого океана, объединяющий более 330 островов с белоснежными пляжами, бирюзовыми лагунами, богатым подводным миром и тёплым гостеприимством.',
    cities: ['Сува', 'Нанди', 'Лаутока'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Mamanuca.jpg/1280px-Mamanuca.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Mamanuca.jpg/1280px-Mamanuca.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Бирюзовые лагуны и коралловые острова архипелага Маманука, Фиджи',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Suva%2C_Fiji_77.jpg/1280px-Suva%2C_Fiji_77.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Suva%2C_Fiji_77.jpg/1280px-Suva%2C_Fiji_77.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Сува — столица и гавань Фиджи', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Cakaulevu_Reef%2C_Fiji.jpg/1280px-Cakaulevu_Reef%2C_Fiji.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Cakaulevu_Reef%2C_Fiji.jpg/1280px-Cakaulevu_Reef%2C_Fiji.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Тропические леса и водопады острова Тавеуни', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Sacred_Heart_Cathedral%2C_Suva_Fiji_July_2014.jpg/1280px-Sacred_Heart_Cathedral%2C_Suva_Fiji_July_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Sacred_Heart_Cathedral%2C_Suva_Fiji_July_2014.jpg/1280px-Sacred_Heart_Cathedral%2C_Suva_Fiji_July_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Кафедральный собор Святого Сердца в Суве', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Yasawa_Islands_banner_Waya_Island.jpg/1280px-Yasawa_Islands_banner_Waya_Island.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Yasawa_Islands_banner_Waya_Island.jpg/1280px-Yasawa_Islands_banner_Waya_Island.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Архипелаг Ясава — песчаные косы и кокосовые пальмы', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Suva%2C_Fiji_77.jpg/1280px-Suva%2C_Fiji_77.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Nadi_Sri_Siva_Subramaniya_Temple.jpg/1280px-Nadi_Sri_Siva_Subramaniya_Temple.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Lautoka-Vitogo-Parade.jpg/1280px-Lautoka-Vitogo-Parade.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'austria',
    isoNumeric: '040',
    isoAlpha2: 'AT',
    nameRu: 'Австрия',
    nameEn: 'Austria',
    flagEmoji: '🇦🇹',
    capital: 'Вена',
    continent: 'Европа',
    population: 9132383,
    area: 83879,
    languages: ['Немецкий'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 47.5162,
    lng: 14.5501,
    shortDescription: 'Имперская Вена, музыкальный Зальцбург, альпийский Гальштат и горнолыжные курорты Тироля.',
    description:
      'Австрия очаровывает дворцами Габсбургов в Вене, родиной Моцарта в Зальцбурге, зеркальными озёрами региона Зальцкаммергут и первоклассными альпийскими трассами Инсбрука и Тироля.',
    cities: ['Вена', 'Зальцбург', 'Инсбрук'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Hallstatt_-_Zentrum_.JPG/1280px-Hallstatt_-_Zentrum_.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Hallstatt_-_Zentrum_.JPG/1280px-Hallstatt_-_Zentrum_.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Альпийская деревня Гальштат на зеркальном озере, Австрия',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wien_-_Stephansdom_%281%29.JPG/1280px-Wien_-_Stephansdom_%281%29.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wien_-_Stephansdom_%281%29.JPG/1280px-Wien_-_Stephansdom_%281%29.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Вена — собор Святого Стефана в историческом центре', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Gro%C3%9Fglockner_from_behind_the_glass_panorama_tower.JPG/1280px-Gro%C3%9Fglockner_from_behind_the_glass_panorama_tower.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Gro%C3%9Fglockner_from_behind_the_glass_panorama_tower.JPG/1280px-Gro%C3%9Fglockner_from_behind_the_glass_panorama_tower.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Высокогорный пик Гросглоккнер и альпийские ледники', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Wien_-_Schloss_Sch%C3%B6nbrunn.JPG/1280px-Wien_-_Schloss_Sch%C3%B6nbrunn.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Wien_-_Schloss_Sch%C3%B6nbrunn.JPG/1280px-Wien_-_Schloss_Sch%C3%B6nbrunn.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Императорский барочный дворец Шёнбрунн в Вене', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Крепость Хоэнзальцбург над старым городом Зальцбурга', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Schoenbrunn_philharmoniker_2012.jpg/1280px-Schoenbrunn_philharmoniker_2012.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Salzburg_%2848489551981%29.jpg/1280px-Salzburg_%2848489551981%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/B%C3%BCrgerstra%C3%9Fe_26%2B24_%28BT0A2830%29.jpg/1280px-B%C3%BCrgerstra%C3%9Fe_26%2B24_%28BT0A2830%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'netherlands',
    isoNumeric: '528',
    isoAlpha2: 'NL',
    nameRu: 'Нидерланды',
    nameEn: 'Netherlands',
    flagEmoji: '🇳🇱',
    capital: 'Амстердам',
    continent: 'Европа',
    population: 17879488,
    area: 41850,
    languages: ['Нидерландский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 52.1326,
    lng: 5.2913,
    shortDescription: 'Каналы и музеи Амстердама, ветряные мельницы Киндердейка, поля тюльпанов и футуристический Роттердам.',
    description:
      'Нидерланды славятся живописными каналами Амстердама, полотнами Рембрандта и Ван Гога, весенними садами Кёкенхоф и современной архитектурой Роттердама и Гааги.',
    cities: ['Амстердам', 'Роттердам', 'Гаага'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png/1280px-Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png/1280px-Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Исторические каналы и мосты Амстердама, Нидерланды',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Dam_Square_2026.jpg/1280px-Dam_Square_2026.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Dam_Square_2026.jpg/1280px-Dam_Square_2026.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Амстердам — Королевский дворец и площадь Дам', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/26Y_1599_2.jpg/1280px-26Y_1599_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/26Y_1599_2.jpg/1280px-26Y_1599_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Цветущие тюльпановые поля парка Кёкенхоф', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/KinderdijkMolens02.jpg/1280px-KinderdijkMolens02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/KinderdijkMolens02.jpg/1280px-KinderdijkMolens02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Ветряные мельницы Киндердейка XVIII века (ЮНЕСКО)', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg/1280px-South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg/1280px-South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Государственный музей Рейксмюсеум в Амстердаме', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png/1280px-Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/A_view_of_Rotterdam%2C_taken_from_the_roof_of_the_Maassilo%2C_Rotterdam%2C_The_Netherlands.jpg/1280px-A_view_of_Rotterdam%2C_taken_from_the_roof_of_the_Maassilo%2C_Rotterdam%2C_The_Netherlands.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Den_Haag_Skyline_1.jpg/1280px-Den_Haag_Skyline_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'iceland',
    isoNumeric: '352',
    isoAlpha2: 'IS',
    nameRu: 'Исландия',
    nameEn: 'Iceland',
    flagEmoji: '🇮🇸',
    capital: 'Рейкьявик',
    continent: 'Европа',
    population: 396760,
    area: 103000,
    languages: ['Исландский'],
    currency: 'Исландская крона (ISK)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+0 (GMT)',
    lat: 64.9631,
    lng: -19.0208,
    shortDescription: 'Остров льда и пламени с водопадами, гейзерами, чёрными пляжами Вика и Голубой лагуной.',
    description:
      'Исландия впечатляет первозданной природой: ледниковыми лагунами Йёкюльсаурлоун, мощными водопадами Скоугафосс и Гюдльфосс, геотермальными источниками и северным сиянием.',
    cities: ['Рейкьявик', 'Акюрейри', 'Вик'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Kirkjufell_in_Iceland.jpg/1280px-Kirkjufell_in_Iceland.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Kirkjufell_in_Iceland.jpg/1280px-Kirkjufell_in_Iceland.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Гора Киркьюфедль и северное сияние, Исландия',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Hallgrimskirkja_mai_2026.jpg/1280px-Hallgrimskirkja_mai_2026.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Hallgrimskirkja_mai_2026.jpg/1280px-Hallgrimskirkja_mai_2026.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Рейкьявик — церковь Хадльгримскиркья и панорама города', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg/1280px-2008-05-24_35_Sk%C3%B3gafoss.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg/1280px-2008-05-24_35_Sk%C3%B3gafoss.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Мощный каскад водопада Скоугафосс', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/df/Harpa_Concert_Hall%2C_Reykjavik.jpg/1280px-Harpa_Concert_Hall%2C_Reykjavik.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/df/Harpa_Concert_Hall%2C_Reykjavik.jpg/1280px-Harpa_Concert_Hall%2C_Reykjavik.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Футуристический концертный зал Харпа в гавани Рейкьявика', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg/1280px-J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg/1280px-J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Ледниковая лагуна Йёкюльсаурлоун с плавающими айсбергами', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg/1280px-Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Akureyri_-_Skapti_Hallgr%C3%ADmsson.jpg/1280px-Akureyri_-_Skapti_Hallgr%C3%ADmsson.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/V%C3%ADk_%C3%AD_M%C3%BDrdal%2C_Iceland.jpg/1280px-V%C3%ADk_%C3%AD_M%C3%BDrdal%2C_Iceland.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'belarus',
    isoNumeric: '112',
    isoAlpha2: 'BY',
    nameRu: 'Беларусь',
    nameEn: 'Belarus',
    flagEmoji: '🇧🇾',
    capital: 'Минск',
    continent: 'Европа',
    population: 9155978,
    area: 207600,
    languages: ['Белорусский', 'Русский'],
    currency: 'Белорусский рубль (BYN)',
    defaultTripCurrency: 'RUB',
    timezone: 'UTC+3 (MSK)',
    lat: 53.7098,
    lng: 27.9534,
    shortDescription: 'Замки Мира и Несвижа, заповедная Беловежская пуща, широкие проспекты Минска и Браславские озёра.',
    description:
      'Беларусь привлекает путешественников средневековыми замковыми комплексами из списка ЮНЕСКО, старинными городами Гродно и Брестом, реликтовыми лесами Беловежской пущи и чистейшими озёрами.',
    cities: ['Минск', 'Гродно', 'Брест'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG/1280px-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG/1280px-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Мирский замок XVI века в Гродненской области, Беларусь',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Gouvernementbelarus.JPG/1280px-Gouvernementbelarus.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Gouvernementbelarus.JPG/1280px-Gouvernementbelarus.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Минск — площадь Независимости и монументальный проспект', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/BelarusBNP09.JPG/1280px-BelarusBNP09.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/BelarusBNP09.JPG/1280px-BelarusBNP09.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Реликтовый первобытный лес Беловежской пущи', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Nesvizh_castle_c.jpg/1280px-Nesvizh_castle_c.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Nesvizh_castle_c.jpg/1280px-Nesvizh_castle_c.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Дворцово-парковый ансамбль Радзивиллов в Несвиже', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg/1280px-Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg/1280px-Brest_Brest_Fortress_Kholm_Gate_9209_2150.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Мемориальный комплекс «Брестская крепость-герой»', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/View_of_Minsk_%28180819%29_09.jpg/1280px-View_of_Minsk_%28180819%29_09.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Brest_BY_collage.jpg/1280px-Brest_BY_collage.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Horadnia_%28Hrodna%29%2C_Vilienskaja._%D0%93%D0%BE%D1%80%D0%B0%D0%B4%D0%BD%D1%8F%2C_%D0%92%D1%96%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%282021%29_05.jpg/1280px-Horadnia_%28Hrodna%29%2C_Vilienskaja._%D0%93%D0%BE%D1%80%D0%B0%D0%B4%D0%BD%D1%8F%2C_%D0%92%D1%96%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%282021%29_05.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'kazakhstan',
    isoNumeric: '398',
    isoAlpha2: 'KZ',
    nameRu: 'Казахстан',
    nameEn: 'Kazakhstan',
    flagEmoji: '🇰🇿',
    capital: 'Астана',
    continent: 'Азия',
    population: 20033842,
    area: 2724902,
    languages: ['Казахский', 'Русский'],
    currency: 'Казахстанский тенге (KZT, ₸)',
    defaultTripCurrency: 'RUB',
    timezone: 'UTC+5',
    lat: 48.0196,
    lng: 66.9237,
    shortDescription: 'Футуристическая Астана, горные озёра Кольсай и Каинды близ Алматы и Чарынский каньон.',
    description:
      'Казахстан сочетает современную архитектуру Астаны, заснеженные вершины Заилийского Алатау в Алматы, каток Медеу, курорт Шымбулак и грандиозные степные и каньонные пейзажи.',
    cities: ['Алматы', 'Астана', 'Туркестан'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Charyn_Canyon%2C_Kazakhstan_03.jpg/1280px-Charyn_Canyon%2C_Kazakhstan_03.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Charyn_Canyon%2C_Kazakhstan_03.jpg/1280px-Charyn_Canyon%2C_Kazakhstan_03.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Красные скалы и каньоны урочища Чарын, Казахстан',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/en/thumb/6/66/Central_Downtown_Astana_2.jpg/1280px-Central_Downtown_Astana_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/en/thumb/6/66/Central_Downtown_Astana_2.jpg/1280px-Central_Downtown_Astana_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Астана — монумент Байтерек и футуристический бульвар Нуржол', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Kaindy_lake_south-east_Kazakhstan.jpg/1280px-Kaindy_lake_south-east_Kazakhstan.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Kaindy_lake_south-east_Kazakhstan.jpg/1280px-Kaindy_lake_south-east_Kazakhstan.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Озеро Каинды с затопленными стволами реликтовых тянь-шаньских елей', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/%D0%9C%D0%B0%D1%83%D0%B7%D0%BE%D0%BB%D0%B5%D1%98_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B5_%D0%90%D1%85%D0%BC%D0%B5%D0%B4%D0%B0_%D0%88%D0%B0%D1%81%D0%B0%D0%B2%D0%B8%D1%98%D0%B0_%28%D0%B3%D1%80%D0%B0%D0%B4_%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%2C_%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%29.jpg/1280px-%D0%9C%D0%B0%D1%83%D0%B7%D0%BE%D0%BB%D0%B5%D1%98_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B5_%D0%90%D1%85%D0%BC%D0%B5%D0%B4%D0%B0_%D0%88%D0%B0%D1%81%D0%B0%D0%B2%D0%B8%D1%98%D0%B0_%28%D0%B3%D1%80%D0%B0%D0%B4_%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%2C_%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/%D0%9C%D0%B0%D1%83%D0%B7%D0%BE%D0%BB%D0%B5%D1%98_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B5_%D0%90%D1%85%D0%BC%D0%B5%D0%B4%D0%B0_%D0%88%D0%B0%D1%81%D0%B0%D0%B2%D0%B8%D1%98%D0%B0_%28%D0%B3%D1%80%D0%B0%D0%B4_%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%2C_%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%29.jpg/1280px-%D0%9C%D0%B0%D1%83%D0%B7%D0%BE%D0%BB%D0%B5%D1%98_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B5_%D0%90%D1%85%D0%BC%D0%B5%D0%B4%D0%B0_%D0%88%D0%B0%D1%81%D0%B0%D0%B2%D0%B8%D1%98%D0%B0_%28%D0%B3%D1%80%D0%B0%D0%B4_%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%2C_%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Мавзолей Ходжи Ахмеда Ясави в Туркестане', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/%D0%9C%D0%B5%D0%B4%D0%B5%D1%83%2C_%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C_2023_%D0%B6%D1%8B%D0%BB%D2%93%D1%8B_%D2%9B%D0%B0%D2%A3%D1%82%D0%B0%D1%80_%281%29.jpg/1280px-%D0%9C%D0%B5%D0%B4%D0%B5%D1%83%2C_%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C_2023_%D0%B6%D1%8B%D0%BB%D2%93%D1%8B_%D2%9B%D0%B0%D2%A3%D1%82%D0%B0%D1%80_%281%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/%D0%9C%D0%B5%D0%B4%D0%B5%D1%83%2C_%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C_2023_%D0%B6%D1%8B%D0%BB%D2%93%D1%8B_%D2%9B%D0%B0%D2%A3%D1%82%D0%B0%D1%80_%281%29.jpg/1280px-%D0%9C%D0%B5%D0%B4%D0%B5%D1%83%2C_%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C_2023_%D0%B6%D1%8B%D0%BB%D2%93%D1%8B_%D2%9B%D0%B0%D2%A3%D1%82%D0%B0%D1%80_%281%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Высокогорный спортивный комплекс Медеу и пики Заилийского Алатау', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Astana_Esil_view.jpg/1280px-Astana_Esil_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Almaty_K%C3%B6k_T%C3%B6be.jpg/1280px-Almaty_K%C3%B6k_T%C3%B6be.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Shymkent_independence_square_in_2023.jpg/1280px-Shymkent_independence_square_in_2023.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'armenia',
    isoNumeric: '051',
    isoAlpha2: 'AM',
    nameRu: 'Армения',
    nameEn: 'Armenia',
    flagEmoji: '🇦🇲',
    capital: 'Ереван',
    continent: 'Азия',
    population: 2991200,
    area: 29743,
    languages: ['Армянский'],
    currency: 'Армянский драм (AMD, ֏)',
    defaultTripCurrency: 'RUB',
    timezone: 'UTC+4 (AMT)',
    lat: 40.0691,
    lng: 45.0382,
    shortDescription: 'Розовый туф Еревана, панорама Арарата у Хор Вирапа, высокогорное озеро Севан и храм Гарни.',
    description:
      'Армения — одна из древнейших стран мира с гостеприимным Ереваном, античным языческим храмом Гарни, пещерным монастырём Гегард и лазурной гладью озера Севан.',
    cities: ['Ереван', 'Гюмри', 'Дилижан'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg/1280px-Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg/1280px-Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Монастырь Хор Вирап на фоне библейской горы Арарат, Армения',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Cascade%2C_Yerevan%2C_July_2023_17_27_24_039000.jpeg/1280px-Cascade%2C_Yerevan%2C_July_2023_17_27_24_039000.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Cascade%2C_Yerevan%2C_July_2023_17_27_24_039000.jpeg/1280px-Cascade%2C_Yerevan%2C_July_2023_17_27_24_039000.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Ереван — панорама города и архитектурный комплекс Каскад', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/%D5%8D%D6%87%D5%A1%D5%B6%D5%AB_%D5%BE%D5%A1%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6_%D5%B0%D5%A1%D5%B4%D5%A1%D5%AC%D5%AB%D6%80_%D5%84%D4%B2_29.jpg/1280px-%D5%8D%D6%87%D5%A1%D5%B6%D5%AB_%D5%BE%D5%A1%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6_%D5%B0%D5%A1%D5%B4%D5%A1%D5%AC%D5%AB%D6%80_%D5%84%D4%B2_29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/%D5%8D%D6%87%D5%A1%D5%B6%D5%AB_%D5%BE%D5%A1%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6_%D5%B0%D5%A1%D5%B4%D5%A1%D5%AC%D5%AB%D6%80_%D5%84%D4%B2_29.jpg/1280px-%D5%8D%D6%87%D5%A1%D5%B6%D5%AB_%D5%BE%D5%A1%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6_%D5%B0%D5%A1%D5%B4%D5%A1%D5%AC%D5%AB%D6%80_%D5%84%D4%B2_29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Высокогорное озеро Севан и древний монастырь Севанаванк', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Garni_temple_2021_drone.jpg/1280px-Garni_temple_2021_drone.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Garni_temple_2021_drone.jpg/1280px-Garni_temple_2021_drone.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Античный языческий храм Гарни I века н.э.', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/-2025.05_%D0%A2%D0%B0%D1%82%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C_1.jpg/1280px--2025.05_%D0%A2%D0%B0%D1%82%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/-2025.05_%D0%A2%D0%B0%D1%82%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C_1.jpg/1280px--2025.05_%D0%A2%D0%B0%D1%82%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Татевский монастырь над Воротанским ущельем', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/%D5%80%D5%A1%D5%B6%D6%80%D5%A1%D5%BA%D5%A5%D5%BF%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6_%D5%80%D6%80%D5%A1%D5%BA%D5%A1%D6%80%D5%A1%D5%AF.jpg/1280px-%D5%80%D5%A1%D5%B6%D6%80%D5%A1%D5%BA%D5%A5%D5%BF%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6_%D5%80%D6%80%D5%A1%D5%BA%D5%A1%D6%80%D5%A1%D5%AF.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Abovyan_street_Gyumri.jpg/1280px-Abovyan_street_Gyumri.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Dilijan_mix_new.jpg/1280px-Dilijan_mix_new.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'poland',
    isoNumeric: '616',
    isoAlpha2: 'PL',
    nameRu: 'Польша',
    nameEn: 'Poland',
    flagEmoji: '🇵🇱',
    capital: 'Варшава',
    continent: 'Европа',
    population: 36685849,
    area: 312696,
    languages: ['Польский'],
    currency: 'Польский злотый (PLN, zł)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 51.9194,
    lng: 19.1451,
    shortDescription: 'Королевский Краков, старый порт Гданьск на Балтике, современная Варшава и вершины Татр.',
    description:
      'Польша богата историческими ансамблями: от Рыночной площади и Вавельского замка в Кракове до ганзейских фасадов Гданьска, мостов Вроцлава и горного курорта Закопане.',
    cities: ['Краков', 'Варшава', 'Гданьск'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Sukiennice_and_Main_Market_Square_Krakow_Poland.JPG/1280px-Sukiennice_and_Main_Market_Square_Krakow_Poland.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Sukiennice_and_Main_Market_Square_Krakow_Poland.JPG/1280px-Sukiennice_and_Main_Market_Square_Krakow_Poland.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Главная Рыночная площадь и Суконные ряды в Кракове, Польша',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/PL_Warsaw_stare_miasto_location.svg/1280px-PL_Warsaw_stare_miasto_location.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/PL_Warsaw_stare_miasto_location.svg/1280px-PL_Warsaw_stare_miasto_location.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Варшава — Королевский замок и Старый город', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Tatra_mountains_western_side_2.jpg/1280px-Tatra_mountains_western_side_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Tatra_mountains_western_side_2.jpg/1280px-Tatra_mountains_western_side_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Татранское горное озеро и вершины Татр', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/1280px-Wawel_%284%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/1280px-Wawel_%284%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Королевский замок Вавель на холме над Вислой', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Monumento_Neptuno%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_01.jpg/1280px-Monumento_Neptuno%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Monumento_Neptuno%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_01.jpg/1280px-Monumento_Neptuno%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Фонтан Нептуна и Длинный рынок в Гданьске', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Krakow_Rynek_Glowny_panorama_2.jpg/1280px-Krakow_Rynek_Glowny_panorama_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Aleja_Niepdleglosci_Warsaw_2022_aerial_%28cropped%29.jpg/1280px-Aleja_Niepdleglosci_Warsaw_2022_aerial_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Calle_Dlugie_Pobrzeze%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_06.jpg/1280px-Calle_Dlugie_Pobrzeze%2C_Gdansk%2C_Polonia%2C_2013-05-20%2C_DD_06.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'sweden',
    isoNumeric: '752',
    isoAlpha2: 'SE',
    nameRu: 'Швеция',
    nameEn: 'Sweden',
    flagEmoji: '🇸🇪',
    capital: 'Стокгольм',
    continent: 'Европа',
    population: 10551707,
    area: 450295,
    languages: ['Шведский'],
    currency: 'Шведская крона (SEK)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 60.1282,
    lng: 18.6435,
    shortDescription: 'Стокгольм на 14 островах, кварталы Гамла-Стан, скандинавский дизайн и северная Лапландия.',
    description:
      'Швеция очаровывает архипелагом Стокгольма, старинным районом Гамла-Стан, музеем корабля «Ваза», приморским Гётеборгом и бескрайними лесами и озёрами.',
    cities: ['Стокгольм', 'Гётеборг', 'Мальмё'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/The_Royal_Palace_%2815891592359%29.jpg/1280px-The_Royal_Palace_%2815891592359%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/The_Royal_Palace_%2815891592359%29.jpg/1280px-The_Royal_Palace_%2815891592359%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Королевский дворец в Стокгольме на набережной озера Меларен, Швеция',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Stockholms_stadshus_February_2026_02.jpg/1280px-Stockholms_stadshus_February_2026_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Stockholms_stadshus_February_2026_02.jpg/1280px-Stockholms_stadshus_February_2026_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Стокгольмская ратуша на стрелке острова Кунгсхольмен', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Pierikpakte_in_Sarek.jpg/1280px-Pierikpakte_in_Sarek.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Pierikpakte_in_Sarek.jpg/1280px-Pierikpakte_in_Sarek.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Национальный парк Сарек и арктическая природа Лапландии', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Drottningholm_kollage_2011abc.jpg/1280px-Drottningholm_kollage_2011abc.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Drottningholm_kollage_2011abc.jpg/1280px-Drottningholm_kollage_2011abc.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Дворец Дроттнингхольм — версаль шведских монархов', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/0522Visby_domkyrka.jpg/1280px-0522Visby_domkyrka.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/0522Visby_domkyrka.jpg/1280px-0522Visby_domkyrka.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Средневековый ганзейский город Висбю на острове Готланд', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Munkbroleden_with_Kornhamstorg_at_Gamla_Stan%2C_Stockholm%2C_Sweden_01.jpg/1280px-Munkbroleden_with_Kornhamstorg_at_Gamla_Stan%2C_Stockholm%2C_Sweden_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/G%C3%B6teborg_2503_stitch_%2828573994096%29.jpg/1280px-G%C3%B6teborg_2503_stitch_%2828573994096%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Malm%C3%B6%E2%80%93flygbild_06_september_2014.jpg/1280px-Malm%C3%B6%E2%80%93flygbild_06_september_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'finland',
    isoNumeric: '246',
    isoAlpha2: 'FI',
    nameRu: 'Финляндия',
    nameEn: 'Finland',
    flagEmoji: '🇫🇮',
    capital: 'Хельсинки',
    continent: 'Европа',
    population: 5603851,
    area: 338455,
    languages: ['Финский', 'Шведский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+2 (EET) / UTC+3 (EEST)',
    lat: 61.9241,
    lng: 25.7482,
    shortDescription: 'Страна тысячи озёр, морская крепость Суоменлинна в Хельсинки и снежная Лапландия.',
    description:
      'Финляндия славится северной архитектурой Хельсинки, озёрным краем Сайма, полярным кругом в Рованиеми и нетронутыми национальными парками.',
    cities: ['Хельсинки', 'Рованиеми', 'Турку'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Kirkko3.png/1280px-Kirkko3.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Kirkko3.png/1280px-Kirkko3.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Белоснежный Кафедральный собор на Сенатской площади Хельсинки, Финляндия',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Helsinki_Senate_Square%2C_2019_%2801%29.jpg/1280px-Helsinki_Senate_Square%2C_2019_%2801%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Helsinki_Senate_Square%2C_2019_%2801%29.jpg/1280px-Helsinki_Senate_Square%2C_2019_%2801%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Хельсинки — Сенатская площадь и гранитная архитектура столицы', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Koli_hill_view.jpg/1280px-Koli_hill_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Koli_hill_view.jpg/1280px-Koli_hill_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Национальный парк Коли и панорама озёрного края', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Suomenlinna_aerial.JPG/1280px-Suomenlinna_aerial.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Suomenlinna_aerial.JPG/1280px-Suomenlinna_aerial.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Морская крепость Суоменлинна (Свеаборг) на островах', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Santa_Claus_Village.jpg/1280px-Santa_Claus_Village.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Santa_Claus_Village.jpg/1280px-Santa_Claus_Village.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Деревня Санта-Клауса в Рованиеми на полярном круге', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Suomenlinna_%28cropped%29.jpg/1280px-Suomenlinna_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/View_from_Turku_Cathedral_tower.jpg/1280px-View_from_Turku_Cathedral_tower.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Tampere.lippu.svg/1280px-Tampere.lippu.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'croatia',
    isoNumeric: '191',
    isoAlpha2: 'HR',
    nameRu: 'Хорватия',
    nameEn: 'Croatia',
    flagEmoji: '🇭🇷',
    capital: 'Загреб',
    continent: 'Европа',
    population: 3859686,
    area: 56594,
    languages: ['Хорватский'],
    currency: 'Евро (EUR, €)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 45.1,
    lng: 15.2,
    shortDescription: 'Каменные стены Дубровника, каскады Плитвицких озёр и тысяча островов Адриатики.',
    description:
      'Хорватия — жемчужина Адриатического моря с крепостными стенами Дубровника, античным дворцом Диоклетиана в Сплите и бирюзовыми водопадами Плитвицких озёр.',
    cities: ['Дубровник', 'Сплит', 'Загреб'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Dubrovnik_s_24.jpg/1280px-Dubrovnik_s_24.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Dubrovnik_s_24.jpg/1280px-Dubrovnik_s_24.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Крепостные стены средневекового Дубровника над Адриатикой, Хорватия',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Croatia-01239_-_The_Peristil_%289551533404%29.jpg/1280px-Croatia-01239_-_The_Peristil_%289551533404%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Croatia-01239_-_The_Peristil_%289551533404%29.jpg/1280px-Croatia-01239_-_The_Peristil_%289551533404%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Сплит — античный императорский дворец Диоклетиана', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/View_in_Plitvice_Lakes_National_Park.jpg/1280px-View_in_Plitvice_Lakes_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/View_in_Plitvice_Lakes_National_Park.jpg/1280px-View_in_Plitvice_Lakes_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Каскады бирюзовых озёр национального парка Плитвицкие озёра', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Pula_Arena_%282024-10-10_1%29.jpg/1280px-Pula_Arena_%282024-10-10_1%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Pula_Arena_%282024-10-10_1%29.jpg/1280px-Pula_Arena_%282024-10-10_1%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Римский амфитеатр I века в Пуле', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Croatia_Rovinj_St_Euphemia_church_BW_2014-10-08_14-23-33.jpg/1280px-Croatia_Rovinj_St_Euphemia_church_BW_2014-10-08_14-23-33.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Croatia_Rovinj_St_Euphemia_church_BW_2014-10-08_14-23-33.jpg/1280px-Croatia_Rovinj_St_Euphemia_church_BW_2014-10-08_14-23-33.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Старинный венецианский Ровинь и базилика Святой Евфимии', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/1280px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Split_080620-133710-IMG_0968x.jpg/1280px-Split_080620-133710-IMG_0968x.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Zagreb_%2829255640143%29.jpg/1280px-Zagreb_%2829255640143%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'serbia',
    isoNumeric: '688',
    isoAlpha2: 'RS',
    nameRu: 'Сербия',
    nameEn: 'Serbia',
    flagEmoji: '🇷🇸',
    capital: 'Белград',
    continent: 'Европа',
    population: 6641197,
    area: 88361,
    languages: ['Сербский'],
    currency: 'Сербский динар (RSD)',
    defaultTripCurrency: 'EUR',
    timezone: 'UTC+1 (CET) / UTC+2 (CEST)',
    lat: 44.0165,
    lng: 21.0059,
    shortDescription: 'Белградская крепость на слиянии Савы и Дуная, уютный Нови-Сад и каньоны реки Увац.',
    description:
      'Сербия встречает радушием Белграда, крепостью Калемегдан, богемным кварталом Скадарлия, австро-венгерской архитектурой Нови-Сада и живописными национальными парками Тара и Копаоник.',
    cities: ['Белград', 'Нови-Сад', 'Суботица'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/P037152-661920_-_Belgrade_fortress_stand_at_the_downtown_of_Belgrade.jpg/1280px-P037152-661920_-_Belgrade_fortress_stand_at_the_downtown_of_Belgrade.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/P037152-661920_-_Belgrade_fortress_stand_at_the_downtown_of_Belgrade.jpg/1280px-P037152-661920_-_Belgrade_fortress_stand_at_the_downtown_of_Belgrade.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Крепость Калемегдан на слиянии рек Савы и Дуная в Белграде, Сербия',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Knez_Mihailova_Street_%28October_2026%2C_1%29.jpg/1280px-Knez_Mihailova_Street_%28October_2026%2C_1%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Knez_Mihailova_Street_%28October_2026%2C_1%29.jpg/1280px-Knez_Mihailova_Street_%28October_2026%2C_1%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Белград — пешеходная улица князя Михаила', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Uvac_River_and_Eagle.jpg/1280px-Uvac_River_and_Eagle.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Uvac_River_and_Eagle.jpg/1280px-Uvac_River_and_Eagle.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Меандры каньона реки Увац и скальные хребты', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Hram_svetog_save_beograd_0005_%28edited%29.jpg/1280px-Hram_svetog_save_beograd_0005_%28edited%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Hram_svetog_save_beograd_0005_%28edited%29.jpg/1280px-Hram_svetog_save_beograd_0005_%28edited%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Монументальный собор Святого Саввы в Белграде', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Petrovaradin_Fortress_%28P%C3%A9terv%C3%A1radi_v%C3%A1r%2C_Peterwardein%29.JPG/1280px-Petrovaradin_Fortress_%28P%C3%A9terv%C3%A1radi_v%C3%A1r%2C_Peterwardein%29.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Petrovaradin_Fortress_%28P%C3%A9terv%C3%A1radi_v%C3%A1r%2C_Peterwardein%29.JPG/1280px-Petrovaradin_Fortress_%28P%C3%A9terv%C3%A1radi_v%C3%A1r%2C_Peterwardein%29.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Петроварадинская крепость над Дунаем в Нови-Саде', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Belgrade_from_the_Belgrade_Tower_%28October_2026%2C_1%29.jpg/1280px-Belgrade_from_the_Belgrade_Tower_%28October_2026%2C_1%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/20230429.Ansichten_in_Novi_Sad.-039.jpg/1280px-20230429.Ansichten_in_Novi_Sad.-039.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/%D0%9D%D0%B8%D1%88_34.JPG/1280px-%D0%9D%D0%B8%D1%88_34.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'cuba',
    isoNumeric: '192',
    isoAlpha2: 'CU',
    nameRu: 'Куба',
    nameEn: 'Cuba',
    flagEmoji: '🇨🇺',
    capital: 'Гавана',
    continent: 'Северная Америка',
    population: 11089511,
    area: 109884,
    languages: ['Испанский'],
    currency: 'Кубинское песо (CUP)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC-5 (CST)',
    lat: 21.5218,
    lng: -77.7812,
    shortDescription: 'Набережная Малекон и ретро-автомобили Старой Гаваны, долина Виньялес и пляжи Варадеро.',
    description:
      'Куба — Остров Свободы в Карибском море с колониальной архитектурой Гаваны и Тринидада, карстовыми холмами долины Виньялес и белоснежным побережьем Атлантики.',
    cities: ['Гавана', 'Варадеро', 'Тринидад'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Old_Square%2C_Havana.jpg/1280px-Old_Square%2C_Havana.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Old_Square%2C_Havana.jpg/1280px-Old_Square%2C_Havana.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Историческая площадь Пласа-Вьеха в Старой Гаване, Куба',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/DJI_0197_crp_wiki.jpg/1280px-DJI_0197_crp_wiki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/DJI_0197_crp_wiki.jpg/1280px-DJI_0197_crp_wiki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Гавана — океанская набережная Малекон и панорама столицы', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Vi%C3%B1ales_Valley.jpg/1280px-Vi%C3%B1ales_Valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Vi%C3%B1ales_Valley.jpg/1280px-Vi%C3%B1ales_Valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Карстовые долины Моготе в национальном парке Виньялес', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Trinidad_in_Kuba.jpg/1280px-Trinidad_in_Kuba.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Trinidad_in_Kuba.jpg/1280px-Trinidad_in_Kuba.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Колониальные мощёные улочки и дворцы города Тринидад', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Aerial_photo_of_Varadero_16.JPG/1280px-Aerial_photo_of_Varadero_16.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Aerial_photo_of_Varadero_16.JPG/1280px-Aerial_photo_of_Varadero_16.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Белоснежные песчаные пляжи и бирюзовые воды Варадеро', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/DJI_0197_crp_wiki.jpg/1280px-DJI_0197_crp_wiki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Aerial_photo_of_Varadero_16.JPG/1280px-Aerial_photo_of_Varadero_16.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Trinidad_in_Kuba.jpg/1280px-Trinidad_in_Kuba.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'chile',
    isoNumeric: '152',
    isoAlpha2: 'CL',
    nameRu: 'Чили',
    nameEn: 'Chile',
    flagEmoji: '🇨🇱',
    capital: 'Сантьяго',
    continent: 'Южная Америка',
    population: 19629590,
    area: 756102,
    languages: ['Испанский'],
    currency: 'Чилийское песо (CLP, $)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC-3 / UTC-4',
    lat: -35.6751,
    lng: -71.543,
    shortDescription: 'Марсианские пейзажи пустыни Атакама, гранитные башни Торрес-дель-Пайне и загадочный остров Пасхи.',
    description:
      'Чили протянулась вдоль Тихого океана и хребта Анд, предлагая путешественникам гейзеры Атакамы, панорамы Сантьяго, фьорды Патагонии и каменные истуканы моаи на острове Рапа-Нуи.',
    cities: ['Сантьяго', 'Вальпараисо', 'Пуэрто-Наталес'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/CostaneraCenter2016.jpg/1280px-CostaneraCenter2016.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/CostaneraCenter2016.jpg/1280px-CostaneraCenter2016.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Небоскрёб Костанера-Центр на фоне заснеженных Анд в Сантьяго, Чили',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg/1280px-Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg/1280px-Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Дворец Вергара и живописное побережье Винья-дель-Мар и Вальпараисо', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg/1280px-Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg/1280px-Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Гранитные пики и ледники национального парка Торрес-дель-Пайне', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Iglesia_de_San_Francisco%2C_Castro%2C_exterior_02.jpg/1280px-Iglesia_de_San_Francisco%2C_Castro%2C_exterior_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Iglesia_de_San_Francisco%2C_Castro%2C_exterior_02.jpg/1280px-Iglesia_de_San_Francisco%2C_Castro%2C_exterior_02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Церковь Сан-Франсиско в Кастро — деревянное зодчество Чилоэ (ЮНЕСКО)', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Valle_della_Luna_01.jpg/1280px-Valle_della_Luna_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Valle_della_Luna_01.jpg/1280px-Valle_della_Luna_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Лунная долина (Валье-де-ла-Луна) в пустыне Атакама', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Palacio_de_La_Moneda_-_miguelreflex.jpg/1280px-Palacio_de_La_Moneda_-_miguelreflex.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg/1280px-Palacio_Vergara%2C_Vi%C3%B1a_del_Mar_20210725_16.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/San_Pedro_de_Atacama_oasis.jpg/1280px-San_Pedro_de_Atacama_oasis.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
  {
    slug: 'kenya',
    isoNumeric: '404',
    isoAlpha2: 'KE',
    nameRu: 'Кения',
    nameEn: 'Kenya',
    flagEmoji: '🇰🇪',
    capital: 'Найроби',
    continent: 'Африка',
    population: 55100586,
    area: 580367,
    languages: ['Суахили', 'Английский'],
    currency: 'Кенийский шиллинг (KES)',
    defaultTripCurrency: 'USD',
    timezone: 'UTC+3 (EAT)',
    lat: -0.0236,
    lng: 37.9062,
    shortDescription: 'Сафари в заповеднике Масаи-Мара, вид на Килиманджаро из Амбосели и пляжи Индийского океана.',
    description:
      'Кения — классическое направление африканского сафари с национальными парками Масаи-Мара, Амбосели и розовыми фламинго на озёрах Великой рифтовой долины.',
    cities: ['Найроби', 'Момбаса', 'Накуру'],
    coverPhoto: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Masai_Mara_at_Sunset.jpg/1280px-Masai_Mara_at_Sunset.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Masai_Mara_at_Sunset.jpg/1280px-Masai_Mara_at_Sunset.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      author: 'Wikimedia Commons',
      alt: 'Дикая природа саванны национального заповедника Масаи-Мара, Кения',
      sourceName: 'Wikimedia'
    },
    galleryPhotos: [
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Nairobi_skyline_from_Gem_Hotel.jpg/1280px-Nairobi_skyline_from_Gem_Hotel.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Nairobi_skyline_from_Gem_Hotel.jpg/1280px-Nairobi_skyline_from_Gem_Hotel.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Деловой центр Найроби на фоне зелёных парков', category: 'Города', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/MtKenya.jpg/1280px-MtKenya.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/MtKenya.jpg/1280px-MtKenya.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Заснеженный вулканический пик горы Кения', category: 'Природа', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Mombasa_Island.jpg/1280px-Mombasa_Island.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Mombasa_Island.jpg/1280px-Mombasa_Island.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Исторический остров Момбаса и форт Иисус XVI века', category: 'Архитектура', sourceName: 'Wikimedia' },
      { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Diani_Beach_Ukunda.jpg/1280px-Diani_Beach_Ukunda.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', thumbUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Diani_Beach_Ukunda.jpg/1280px-Diani_Beach_Ukunda.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', author: 'Wikimedia Commons', alt: 'Белоснежный коралловый пляж Диани-Бич на Индийском океане', category: 'Туристические места', sourceName: 'Wikimedia' },
    ],
    cityPhotoUrls: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Nairobi_skyline_from_Gem_Hotel.jpg/1280px-Nairobi_skyline_from_Gem_Hotel.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Mombasa_Island.jpg/1280px-Mombasa_Island.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Golden_life_mall%2C_Nakuru.jpg/1280px-Golden_life_mall%2C_Nakuru.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
    ],
  },
];

function makePhotoItem(
  spec: { url: string; thumbUrl?: string; alt?: string; author?: string; sourceName?: 'Wikimedia' | 'Unsplash'; category?: CountryPhoto['category'] },
  defaultCategory: CountryPhoto['category'] = 'Обложка'
): CountryPhoto {
  return {
    url: spec.url,
    thumbUrl: spec.thumbUrl || spec.url,
    alt: spec.alt || 'Фотография',
    category: spec.category || defaultCategory,
    authorName: spec.author || 'Wikimedia Commons',
    authorUrl: 'https://commons.wikimedia.org',
    sourceName: spec.sourceName || 'Wikimedia',
    sourceUrl: 'https://commons.wikimedia.org',
  };
}

function expandCompactSpec(spec: CompactCountrySpec): CountryData {
  const coverPhoto = makePhotoItem(
    {
      url: spec.coverPhoto.url,
      thumbUrl: spec.coverPhoto.thumbUrl,
      alt: spec.coverPhoto.alt || `${spec.nameRu} — панорама`,
      author: spec.coverPhoto.author,
      sourceName: spec.coverPhoto.sourceName,
      category: 'Обложка',
    },
    'Обложка'
  );

  return {
    slug: spec.slug,
    isoNumeric: spec.isoNumeric,
    isoAlpha2: spec.isoAlpha2,
    nameRu: spec.nameRu,
    nameEn: spec.nameEn,
    flagEmoji: spec.flagEmoji,
    flagUrl: `https://flagcdn.com/w80/${spec.isoAlpha2.toLowerCase()}.webp`,
    capital: spec.capital,
    continent: spec.continent,
    population: spec.population,
    area: spec.area,
    languages: spec.languages,
    currency: spec.currency,
    defaultTripCurrency: spec.defaultTripCurrency,
    timezone: spec.timezone,
    coordinates: { lat: spec.lat, lng: spec.lng },
    shortDescription: spec.shortDescription,
    description: spec.description,
    coverPhoto,
    gallery: spec.galleryPhotos.map((item) =>
      makePhotoItem(item, item.category)
    ),
    popularCities: spec.cities.map((city, idx) => ({
      name: city,
      description:
        idx === 0
          ? `Главный культурный и исторический центр страны (${spec.nameRu}), популярный среди путешественников.`
          : `Популярное туристическое направление в стране ${spec.nameRu} с богатой историей и атмосферой.`,
      photoUrl: spec.cityPhotoUrls[idx] || spec.coverPhoto.url,
      authorName: spec.coverPhoto.author,
    })),
    landmarks: [
      {
        name: `Исторический центр города ${spec.capital}`,
        city: spec.capital,
        category: 'Культурное наследие',
        description: `Знаковые площади, архитектурные ансамбли и музеи столицы (${spec.capital}).`,
      },
      {
        name: `Национальные парки и панорамы (${spec.nameRu})`,
        city: spec.cities[1] || spec.capital,
        category: 'Природные маршруты',
        description: `Живописные природные ландшафты и обзорные маршруты региона.`,
      },
    ],
  };
}

export const FULL_COUNTRIES_CATALOG: CountryData[] = [
  ...ALL_COUNTRIES,
  ...COMPACT_SPECS.map(expandCompactSpec),
].map(applyVerifiedPhotosToCountry);
