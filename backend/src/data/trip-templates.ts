import { Currency, TripType } from '@prisma/client';

export type EventCategory =
  | 'SIGHTSEEING'
  | 'CULTURE'
  | 'FOOD'
  | 'NATURE'
  | 'TRANSPORT'
  | 'LEISURE';

export interface TripTemplateEvent {
  dayOffset: number; // 0 .. durationDays - 1
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  category: EventCategory;
  estimatedCost: number;
  description: string;
}

export interface TripTemplate {
  id: string;
  slug: string;
  title: string;
  country: string;
  city: string;
  durationDays: number;
  tripType: TripType;
  recommendedBudget: number;
  currency: Currency;
  paceLabel: string;
  tags: string[];
  summary: string;
  highlights: string[];
  events: TripTemplateEvent[];
}

export const TRIP_TEMPLATES: TripTemplate[] = [
  {
    id: 'istanbul-weekend-3d',
    slug: 'istanbul-weekend-3d',
    title: 'Уикенд в Стамбуле: два континента',
    country: 'Турция',
    city: 'Стамбул',
    durationDays: 3,
    tripType: TripType.SIGHTSEEING,
    recommendedBudget: 65000,
    currency: Currency.RUB,
    paceLabel: 'Насыщенный',
    tags: ['История', 'Босфор', 'Гастрономия', 'Уикенд'],
    summary:
      'Три ярких дня на стыке Европы и Азии: византийское наследие Султанахмета, прогулка по Босфору, азиатский Кадыкёй и колоритные кофейни Бейоглу.',
    highlights: [
      'Айя-София, Голубая мечеть и Цистерна Базилика',
      'Круиз на пароме через Босфор в азиатскую часть города',
      'Галатская башня на закате и променад по улице Истикляль',
      'Турецкий завтрак и дегустация уличной кухни в Кадыкёе',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Заселение и площадь Султанахмет',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Площадь Султанахмет, Фатих',
        category: 'SIGHTSEEING',
        estimatedCost: 2500,
        description:
          'Прогулка по историческому сердцу Стамбула: внешний осмотр Голубой мечети, Ипподрома и посещение Айя-Софии.',
      },
      {
        dayOffset: 0,
        title: 'Цистерна Базилика и Гранд-базар',
        startTime: '14:30',
        endTime: '17:30',
        location: 'Еребатан и квартал Беязыт',
        category: 'CULTURE',
        estimatedCost: 3500,
        description:
          'Спуск в древнее подземное водохранилище с колоннами Медузы и неспешный променад по крытым галереям Гранд-базара.',
      },
      {
        dayOffset: 0,
        title: 'Ужин с видом на Золотой Рог',
        startTime: '19:00',
        endTime: '21:00',
        location: 'Район Эминёню',
        category: 'FOOD',
        estimatedCost: 2800,
        description:
          'Знакомство с турецкой кухней: мезе, кебабы на мангале и традиционный чай на панорамной террасе.',
      },
      {
        dayOffset: 1,
        title: 'Дворец Топкапы и парк Гюльхане',
        startTime: '09:30',
        endTime: '13:00',
        location: 'Дворец Топкапы',
        category: 'CULTURE',
        estimatedCost: 5000,
        description:
          'Осмотр главной резиденции османских султанов, гарема и сокровищницы с последующей прогулкой по тенистым аллеям парка.',
      },
      {
        dayOffset: 1,
        title: 'Паром по Босфору и квартал Кадыкёй',
        startTime: '14:30',
        endTime: '18:00',
        location: 'Причал Эминёню — Кадыкёй',
        category: 'TRANSPORT',
        estimatedCost: 1500,
        description:
          'Переправа на общественном пароме в азиатскую часть города, прогулка по рынку специй, бутикам и набережной Мода.',
      },
      {
        dayOffset: 1,
        title: 'Галатская башня и квартал Каракёй',
        startTime: '19:00',
        endTime: '21:30',
        location: 'Бейоглу, Галата',
        category: 'FOOD',
        estimatedCost: 3200,
        description:
          'Вечерняя панорама Босфора со смотровой площадки, десерты с пахлавой и кофе по-турецки в уютных кофейнях.',
      },
      {
        dayOffset: 2,
        title: 'Дворец Долмабахче и район Бешикташ',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Долмабахче, Бешикташ',
        category: 'SIGHTSEEING',
        estimatedCost: 4200,
        description:
          'Экскурсия по роскошному дворцу XIX века на самом берегу пролива и утренний турецкий завтрак на улице Кахвалтыджылар.',
      },
      {
        dayOffset: 2,
        title: 'Улица Истикляль и покупка сувениров',
        startTime: '14:30',
        endTime: '17:30',
        location: 'Истикляль, Таксим',
        category: 'LEISURE',
        estimatedCost: 3000,
        description:
          'Поездка на историческом красном трамвайчике, покупка лукума и специй перед трансфером в аэропорт.',
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
    tripType: TripType.MOUNTAIN,
    recommendedBudget: 85000,
    currency: Currency.RUB,
    paceLabel: 'Сбалансированный',
    tags: ['Горы', 'Виноделие', 'Старый город', 'Хайкинг'],
    summary:
      'Идеальный баланс уютных двориков Старого Тбилиси, древних монастырей Мцхеты, винных дегустаций Кахетии и захватывающих панорам Большого Кавказа у подножия Казбека.',
    highlights: [
      'Старый Тбилиси, серные бани Абанотубани и крепость Нарикала',
      'Древняя столица Мцхета и монастырь Джвари над слиянием рек',
      'Военно-Грузинская дорога, Ананури и Троицкая церковь в Гергети',
      'Дегустация грузинских вин и обед в семейной марани Кахетии',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Прогулка по Старому Тбилиси и Нарикала',
        startTime: '10:30',
        endTime: '13:30',
        location: 'Абанотубани, крепость Нарикала',
        category: 'SIGHTSEEING',
        estimatedCost: 1200,
        description:
          'Подъём по канатной дороге от парка Рике, обзорная прогулка по крепостным стенам и спуск к водопаду в Инжировом ущелье.',
      },
      {
        dayOffset: 0,
        title: 'Серные бани и грузинский ужин',
        startTime: '17:30',
        endTime: '21:00',
        location: 'Улица Шардени и Абанотубани',
        category: 'FOOD',
        estimatedCost: 4500,
        description:
          'Отдых в традиционных серных банях и праздничный ужин с хинкали, хачапури по-аджарски и живой музыкой.',
      },
      {
        dayOffset: 1,
        title: 'Поездка в Мцхету и монастырь Джвари',
        startTime: '09:30',
        endTime: '14:00',
        location: 'Мцхета, собор Светицховели',
        category: 'CULTURE',
        estimatedCost: 3000,
        description:
          'Знакомство с духовной столицей Грузии и знаменитой смотровой площадкой на слиянии Арагви и Куры.',
      },
      {
        dayOffset: 1,
        title: 'Фуникулёр на гору Мтацминда',
        startTime: '16:30',
        endTime: '19:30',
        location: 'Проспект Руставели — Мтацминда',
        category: 'LEISURE',
        estimatedCost: 2000,
        description:
          'Вечерняя панорама всего Тбилиси в огнях заката и чашечка кофе с легендарным пончиком на верхней террасе.',
      },
      {
        dayOffset: 2,
        title: 'Военно-Грузинская дорога: Ананури и Гудаури',
        startTime: '08:30',
        endTime: '13:30',
        location: 'Жинвальское водохранилище — Крестовый перевал',
        category: 'TRANSPORT',
        estimatedCost: 5500,
        description:
          'Живописная дорога через горные перевалы с остановками у бирюзового водохранилища, крепости Ананури и Арки Дружбы.',
      },
      {
        dayOffset: 2,
        title: 'Храм Гергети у подножия Казбека',
        startTime: '14:30',
        endTime: '17:30',
        location: 'Степанцминда, гора Казбек',
        category: 'NATURE',
        estimatedCost: 2500,
        description:
          'Подъём к высокогорному храму XIV века на высоте 2170 метров с открыточным видом на снежные вершины.',
      },
      {
        dayOffset: 3,
        title: 'Винный тур в Кахетию и город любви Сигнахи',
        startTime: '09:00',
        endTime: '16:00',
        location: 'Сигнахи, Алазанская долина',
        category: 'FOOD',
        estimatedCost: 6000,
        description:
          'Прогулка по крепостным стенам Сигнахи, панорама Алазанской долины и дегустация вин квеври в винодельне.',
      },
      {
        dayOffset: 3,
        title: 'Возвращение в Тбилиси и ужин в Сололаки',
        startTime: '19:00',
        endTime: '21:30',
        location: 'Район Сололаки, Тбилиси',
        category: 'FOOD',
        estimatedCost: 3000,
        description:
          'Атмосферный вечер в одном из авторских винных баров исторического района с резными балконами.',
      },
      {
        dayOffset: 4,
        title: 'Сухой мост, Фабрика и прощальный обед',
        startTime: '10:30',
        endTime: '15:00',
        location: 'Блошиный рынок «Сухой мост» и Fabrika',
        category: 'LEISURE',
        estimatedCost: 3500,
        description:
          'Поиск винтажных сувениров, покупка чурчхелы и специй на Дезертирском рынке, кофе в креативном кластере.',
      },
    ],
  },
  {
    id: 'armenia-yerevan-monasteries-4d',
    slug: 'armenia-yerevan-monasteries-4d',
    title: 'Ереван и горные монастыри Армении',
    country: 'Армения',
    city: 'Ереван',
    durationDays: 4,
    tripType: TripType.SIGHTSEEING,
    recommendedBudget: 70000,
    currency: Currency.RUB,
    paceLabel: 'Комфортный',
    tags: ['Древняя история', 'Горы', 'Озёра', 'Гастрономия'],
    summary:
      'Тёплый «розовый город» Ереван, виды на библейский Арарат, пещерный монастырь Гегард, античный храм Гарни и высокогорное озеро Севан.',
    highlights: [
      'Каскад, площадь Республики и поющие фонтаны Еревана',
      'Языческий храм Гарни, ущелье «Симфония камней» и монастырь Гегард',
      'Монастырь Хор Вирап на фоне величественного Арарата',
      'Высокогорное озеро Севан и монастырь Севанаванк',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Обзорная прогулка по центру Еревана и Каскад',
        startTime: '10:00',
        endTime: '13:30',
        location: 'Большой Каскад и Северный проспект',
        category: 'SIGHTSEEING',
        estimatedCost: 1000,
        description:
          'Подъём на смотровую площадку Каскада с видом на Арарат, знакомство с парком скульптур и архитектурой из розового туфа.',
      },
      {
        dayOffset: 0,
        title: 'Вечер на площади Республики и ужин',
        startTime: '18:30',
        endTime: '21:30',
        location: 'Площадь Республики, Ереван',
        category: 'FOOD',
        estimatedCost: 3500,
        description:
          'Ужин с толмой, хоровацем и домашним вином, а после — прогулка у вечерних поющих фонтанов.',
      },
      {
        dayOffset: 1,
        title: 'Храм Гарни и Симфония камней',
        startTime: '09:30',
        endTime: '13:00',
        location: 'Гарни, Котайкская область',
        category: 'CULTURE',
        estimatedCost: 3200,
        description:
          'Осмотр единственного сохранившегося в регионе античного греко-римского храма и базальтовых столбов в ущелье реки Азат.',
      },
      {
        dayOffset: 1,
        title: 'Пещерный монастырь Гегард и выпечка лаваша',
        startTime: '13:30',
        endTime: '17:00',
        location: 'Монастырь Гегард',
        category: 'CULTURE',
        estimatedCost: 2800,
        description:
          'Посещение высеченного в скале комплекса ЮНЕСКО и обед с мастер-классом по выпечке традиционного лаваша в тонире.',
      },
      {
        dayOffset: 2,
        title: 'Монастырь Хор Вирап и вид на Арарат',
        startTime: '09:00',
        endTime: '12:30',
        location: 'Араратская долина, Хор Вирап',
        category: 'NATURE',
        estimatedCost: 2600,
        description:
          'Утренняя поездка к самой близкой к горе Арарат обзорной точке и посещение древнейшей христианской обители.',
      },
      {
        dayOffset: 2,
        title: 'Матенадаран и музей истории Армении',
        startTime: '15:00',
        endTime: '18:00',
        location: 'Проспект Месропа Маштоца, Ереван',
        category: 'CULTURE',
        estimatedCost: 1800,
        description:
          'Знакомство с крупнейшим в мире собранием древних рукописей и историческими реликвиями.',
      },
      {
        dayOffset: 3,
        title: 'Озеро Севан и монастырь Севанаванк',
        startTime: '09:30',
        endTime: '15:30',
        location: 'Полуостров Севан, Гегаркуник',
        category: 'NATURE',
        estimatedCost: 4200,
        description:
          'Поездка к «армянскому морю» на высоте 1900 метров, подъём к древним церквям и обед со свежевыловленной севанской форелью.',
      },
      {
        dayOffset: 3,
        title: 'Рынок Вернисаж и покупка гостинцев',
        startTime: '16:30',
        endTime: '18:30',
        location: 'Вернисаж, центр Еревана',
        category: 'LEISURE',
        estimatedCost: 2500,
        description:
          'Выбор изделий ремесленников, сухофруктов и абрикосовых сладостей перед завершением путешествия.',
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
    tripType: TripType.SIGHTSEEING,
    recommendedBudget: 950,
    currency: Currency.EUR,
    paceLabel: 'Насыщенный',
    tags: ['Античность', 'Музеи', 'Итальянская кухня', 'Архитектура'],
    summary:
      'Путешествие по «Вечному городу»: от арены Колизея и Римского форума до шедевров Ватикана, фонтанов барокко и атмосферных ужинов в квартале Трастевере.',
    highlights: [
      'Колизей, Палатинский холм и Римский форум',
      'Музеи Ватикана, Сикстинская капелла и собор Святого Петра',
      'Пантеон, фонтан Треви, Испанская лестница и площадь Навона',
      'Вечерняя прогулка по аутентичному кварталу Трастевере',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Колизей, Римский форум и Палатин',
        startTime: '09:30',
        endTime: '13:30',
        location: 'Piazza del Colosseo',
        category: 'CULTURE',
        estimatedCost: 45,
        description:
          'Погружение в эпоху Древнего Рима: амфитеатр Флавиев, триумфальные арки и руины императорских дворцов на Палатинском холме.',
      },
      {
        dayOffset: 0,
        title: 'Аперитив и ужин в районе Монти',
        startTime: '18:30',
        endTime: '21:00',
        location: 'Rione Monti, Via dei Serpenti',
        category: 'FOOD',
        estimatedCost: 55,
        description:
          'Паста карбонара и качо-э-пепе в уютной семейной траттории в шаге от исторического центра.',
      },
      {
        dayOffset: 1,
        title: 'Музеи Ватикана и Сикстинская капелла',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Viale Vaticano, Ватикан',
        category: 'CULTURE',
        estimatedCost: 60,
        description:
          'Осмотр богатейших папских коллекций искусства, Станц Рафаэля и росписей Микеланджело в Сикстинской капелле.',
      },
      {
        dayOffset: 1,
        title: 'Собор Святого Петра и замок Святого Ангела',
        startTime: '14:30',
        endTime: '18:00',
        location: 'Piazza San Pietro — Lungotevere Castello',
        category: 'SIGHTSEEING',
        estimatedCost: 30,
        description:
          'Подъём на купол собора Святого Петра ради панорамы Рима и прогулка по мосту ангелов через Тибр.',
      },
      {
        dayOffset: 2,
        title: 'Пантеон, фонтан Треви и Испанская лестница',
        startTime: '09:30',
        endTime: '13:30',
        location: 'Исторический центр (Centro Storico)',
        category: 'SIGHTSEEING',
        estimatedCost: 20,
        description:
          'Классический пешеходный маршрут по главным площадям и шедеврам барокко с остановкой на настоящее итальянское джелато.',
      },
      {
        dayOffset: 2,
        title: 'Ужин в квартале Трастевере',
        startTime: '19:00',
        endTime: '22:00',
        location: 'Trastevere, Piazza di Santa Maria',
        category: 'FOOD',
        estimatedCost: 65,
        description:
          'Прогулка по мощёным переулкам, увитым плющом, римская пицца на тонком тесте и бокал вина на открытой веранде.',
      },
      {
        dayOffset: 3,
        title: 'Вилла Боргезе и смотровая площадка Пинчо',
        startTime: '10:00',
        endTime: '14:00',
        location: 'Villa Borghese, Pincio',
        category: 'NATURE',
        estimatedCost: 35,
        description:
          'Отдых в крупнейшем ландшафтном парке в центре Рима, посещение галереи или прогулка на лодке и вид на Пьяцца дель Пополо.',
      },
      {
        dayOffset: 3,
        title: 'Кампо-деи-Фьори и площадь Навона',
        startTime: '15:00',
        endTime: '17:30',
        location: 'Campo de’ Fiori — Piazza Navona',
        category: 'LEISURE',
        estimatedCost: 30,
        description:
          'Покупка итальянского сыра, оливкового масла и свежеобжаренного кофе перед завершением поездки.',
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
    tripType: TripType.MIXED,
    recommendedBudget: 1600,
    currency: Currency.USD,
    paceLabel: 'Насыщенный',
    tags: ['Мегаполис', 'Храмы', 'Гастрономия', 'Технологии'],
    summary:
      'Шесть дней контрастов Страны восходящего солнца: древние храмы Асакусы, неон Синдзюку, цифровой арт-музей, рынок Цукидзи и однодневная поездка к горе Фудзи.',
    highlights: [
      'Храм Сэнсо-дзи в Асакусе и телебашня Tokyo Skytree',
      'Перекрёсток Сибуя, парк Ёёги и святилище Мэйдзи Дзингу',
      'Однодневный выезд к озеру Кавагутико с видом на Фудзи',
      'Иммерсивное искусство teamLab и рынок свежих морепродуктов',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Прибытие и вечерний район Синдзюку',
        startTime: '15:00',
        endTime: '19:30',
        location: 'Синдзюку, Кабукитё и смотровая в мэрии',
        category: 'SIGHTSEEING',
        estimatedCost: 40,
        description:
          'Бесплатная панорама Токио со здания столичного правительства и первое знакомство с неоновыми кварталами и улочкой Омоидэ Ёкотё.',
      },
      {
        dayOffset: 1,
        title: 'Храм Сэнсо-дзи и улица Накамисэ',
        startTime: '09:30',
        endTime: '13:00',
        location: 'Асакуса, Токио',
        category: 'CULTURE',
        estimatedCost: 35,
        description:
          'Старейший буддийский храм города, гигантские красные фонари Каминаримон и традиционные сладости с матчей.',
      },
      {
        dayOffset: 1,
        title: 'Подъём на Tokyo Skytree и парк Уэно',
        startTime: '14:30',
        endTime: '18:30',
        location: 'Сумида — Уэно',
        category: 'SIGHTSEEING',
        estimatedCost: 55,
        description:
          'Вид на мегаполис с высоты 350 метров и вечерняя прогулка среди музеев и прудов парка Уэно.',
      },
      {
        dayOffset: 2,
        title: 'Святилище Мэйдзи и улица Харадзюку',
        startTime: '10:00',
        endTime: '13:30',
        location: 'Сибуя, парк Ёёги и Такесита-дори',
        category: 'CULTURE',
        estimatedCost: 25,
        description:
          'Тишина векового леса в самом центре мегаполиса у синтоистского святилища и контрастная молодёжная мода Харадзюку.',
      },
      {
        dayOffset: 2,
        title: 'Перекрёсток Сибуя и смотровая Shibuya Sky',
        startTime: '16:30',
        endTime: '20:30',
        location: 'Станция Сибуя',
        category: 'LEISURE',
        estimatedCost: 65,
        description:
          'Знаменитый диагональный переход, памятник Хатико и закатная панорама с открытой крыши небоскрёба.',
      },
      {
        dayOffset: 3,
        title: 'Рынок Цукидзи и музей цифрового искусства',
        startTime: '09:00',
        endTime: '14:00',
        location: 'Цукидзи — Тоёсу / Одайба',
        category: 'FOOD',
        estimatedCost: 80,
        description:
          'Свежайшие суси и морепродукты на утреннем рынке и погружение в интерактивные световые инсталляции teamLab.',
      },
      {
        dayOffset: 3,
        title: 'Залив Одайба и вечерняя Гинза',
        startTime: '15:30',
        endTime: '20:00',
        location: 'Одайба — Гинза',
        category: 'SIGHTSEEING',
        estimatedCost: 50,
        description:
          'Поездка на автоматическом монорельсе по Радужному мосту и прогулка по кварталу премиальных универмагов и театров.',
      },
      {
        dayOffset: 4,
        title: 'Экскурсия к озеру Кавагутико и горе Фудзи',
        startTime: '08:00',
        endTime: '18:30',
        location: 'Кавагутико, префектура Яманаси',
        category: 'NATURE',
        estimatedCost: 110,
        description:
          'Выезд на целый день к подножию символа Японии: пагода Тюрэйто, канатная дорога и фотопрогулка у берега озера.',
      },
      {
        dayOffset: 5,
        title: 'Акихабара, Императорский дворец и шопинг',
        startTime: '10:30',
        endTime: '17:00',
        location: 'Тиёда — Акихабара',
        category: 'LEISURE',
        estimatedCost: 70,
        description:
          'Прогулка по Восточным садам Императорского дворца, мир электроники и поп-культуры в Акихабаре и покупка сувениров.',
      },
    ],
  },
  {
    id: 'almaty-tian-shan-lakes-4d',
    slug: 'almaty-tian-shan-lakes-4d',
    title: 'Алматы и горные озёра Тянь-Шаня',
    country: 'Казахстан',
    city: 'Алматы',
    durationDays: 4,
    tripType: TripType.MOUNTAIN,
    recommendedBudget: 75000,
    currency: Currency.RUB,
    paceLabel: 'Активный',
    tags: ['Горы', 'Озёра', 'Каньон', 'Природа'],
    summary:
      'Динамичное путешествие к предгорьям Заилийского Алатау: каток Медеу, высокогорный курорт Шымбулак, Чарынский каньон и бирюзовые озёра Кольсай и Каинды.',
    highlights: [
      'Высокогорный комплекс Медеу и подъём на курорт Шымбулак',
      'Чарынский каньон («Долина замков») на рассвете или закате',
      'Высокогорное озеро Кольсай и затопленный лес озера Каинды',
      'Зелёный базар Алматы, парк 28 гвардейцев-панфиловцев и Кок-Тобе',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Знакомство с Алматы: Панфиловский парк и Зелёный базар',
        startTime: '10:30',
        endTime: '14:00',
        location: 'Центр Алматы, Вознесенский собор',
        category: 'SIGHTSEEING',
        estimatedCost: 2000,
        description:
          'Осмотр деревянного Вознесенского собора, дегустация национальных деликатесов, кумыса и восточных сладостей на Зелёном базаре.',
      },
      {
        dayOffset: 0,
        title: 'Канатная дорога на гору Кок-Тобе',
        startTime: '17:00',
        endTime: '20:00',
        location: 'Гора Кок-Тобе',
        category: 'LEISURE',
        estimatedCost: 3000,
        description:
          'Закатный вид на город на фоне заснеженных вершин Заилийского Алатау и ужин с бешбармаком.',
      },
      {
        dayOffset: 1,
        title: 'Каток Медеу и перевал на курорте Шымбулак',
        startTime: '09:30',
        endTime: '15:00',
        location: 'Ущелье Малая Алматинка, Медеу — Шымбулак',
        category: 'NATURE',
        estimatedCost: 5500,
        description:
          'Подъём на гондольной дороге до Талгарского перевала (3200 м), прогулка по альпийским тропам и обед в горном ресторане.',
      },
      {
        dayOffset: 1,
        title: 'Прогулка по проспекту Панфилова и кофейни',
        startTime: '17:30',
        endTime: '20:00',
        location: 'Пешеходная улица Панфилова, Алматы',
        category: 'FOOD',
        estimatedCost: 2800,
        description:
          'Вечерний променад по уютной пешеходной улице и ужин в одном из современных гастро-проектов города.',
      },
      {
        dayOffset: 2,
        title: 'Выезд в Чарынский каньон: Долина замков',
        startTime: '07:30',
        endTime: '14:00',
        location: 'Чарынский национальный парк',
        category: 'NATURE',
        estimatedCost: 6500,
        description:
          'Треккинг по дну грандиозного каньона из красного песчаника к бурной реке Чарын и панорамным смотровым площадкам.',
      },
      {
        dayOffset: 2,
        title: 'Переезд в Саты и вечер у горной реки',
        startTime: '16:00',
        endTime: '20:00',
        location: 'Посёлок Саты, Кегенский район',
        category: 'TRANSPORT',
        estimatedCost: 4500,
        description:
          'Заселение в уютный гостевой дом в горах и домашний ужин перед утренним походом к озёрам.',
      },
      {
        dayOffset: 3,
        title: 'Озёра Кольсай и мистическое озеро Каинды',
        startTime: '08:30',
        endTime: '16:00',
        location: 'Национальный парк «Кольсайские озёра»',
        category: 'NATURE',
        estimatedCost: 7000,
        description:
          'Прогулка вдоль кристально чистого Первого Кольсайского озера и заброска на внедорожнике к затопленному хвойному лесу Каинды.',
      },
      {
        dayOffset: 3,
        title: 'Возвращение в Алматы',
        startTime: '16:30',
        endTime: '21:00',
        location: 'Алматы',
        category: 'TRANSPORT',
        estimatedCost: 2000,
        description:
          'Обратная дорога в город, сборы и прощальный ужин.',
      },
    ],
  },
  {
    id: 'baku-absheron-3d',
    slug: 'baku-absheron-3d',
    title: 'Баку и Апшеронский полуостров',
    country: 'Азербайджан',
    city: 'Баку',
    durationDays: 3,
    tripType: TripType.MIXED,
    recommendedBudget: 60000,
    currency: Currency.RUB,
    paceLabel: 'Сбалансированный',
    tags: ['Каспий', 'Старый город', 'Футуризм', 'Восток'],
    summary:
      'Гармония древнего Востока и современной архитектуры на берегу Каспийского моря: крепость Ичери-Шехер, центр Гейдара Алиева, петроглифы Гобустана и огни Янардага.',
    highlights: [
      'Древняя крепость Ичери-Шехер, Девичья башня и Дворец Ширваншахов',
      'Футуристический Центр Гейдара Алиева по проекту Захи Хадид',
      'Приморский бульвар и панорама Пламенных башен из Нагорного парка',
      'Гобустан, грязевые вулканы, храм огня Атешгях и гора Янардаг',
    ],
    events: [
      {
        dayOffset: 0,
        title: 'Крепость Ичери-Шехер и Девичья башня',
        startTime: '10:00',
        endTime: '13:30',
        location: 'Старый город (Ичери-Шехер)',
        category: 'CULTURE',
        estimatedCost: 2500,
        description:
          'Пешеходная прогулка по узким каменным улочкам Старого города, посещение Дворца Ширваншахов, караван-сараев и Девичьей башни.',
      },
      {
        dayOffset: 0,
        title: 'Приморский бульвар и Нагорный парк на закате',
        startTime: '17:00',
        endTime: '20:30',
        location: 'Приморский бульвар — Нагорный парк',
        category: 'SIGHTSEEING',
        estimatedCost: 3000,
        description:
          'Прогулка вдоль Каспия до Бакинской Венеции, подъём на фуникулёре к смотровой площадке у подножия Пламенных башен и ужин с пловом.',
      },
      {
        dayOffset: 1,
        title: 'Центр Гейдара Алиева',
        startTime: '10:30',
        endTime: '13:30',
        location: 'Проспект Гейдара Алиева, Баку',
        category: 'CULTURE',
        estimatedCost: 2200,
        description:
          'Знакомство с шедевром современной архитектуры без единого острого угла, экспозицией «Мини-Азербайджан» и выставочными залами.',
      },
      {
        dayOffset: 1,
        title: 'Храм Атешгях и горящая гора Янардаг',
        startTime: '15:00',
        endTime: '19:00',
        location: 'Апшеронский полуостров: Сураханы — Мамедли',
        category: 'SIGHTSEEING',
        estimatedCost: 4000,
        description:
          'Поездка к древнему храму огнепоклонников и природным выходам горящего газа на склоне холма Янардаг в сумерках.',
      },
      {
        dayOffset: 2,
        title: 'Заповедник Гобустан и грязевые вулканы',
        startTime: '09:30',
        endTime: '14:30',
        location: 'Гобустанский заповедник',
        category: 'NATURE',
        estimatedCost: 5000,
        description:
          'Осмотр наскальных петроглифов возрастом более 10 тысяч лет и космических пейзажей действующих грязевых вулканов.',
      },
      {
        dayOffset: 2,
        title: 'Улица Низами, Зелёный базар и прощальный чай',
        startTime: '16:00',
        endTime: '19:00',
        location: 'Улица Низами (Торговая) и Яшыл Базар',
        category: 'FOOD',
        estimatedCost: 3200,
        description:
          'Покупка бакинской пахлавы, шекербуры, специй и чая с вареньем из белой черешни.',
      },
    ],
  },
];

export function findTripTemplateByIdOrSlug(idOrSlug: string): TripTemplate | undefined {
  const normalized = idOrSlug.trim().toLowerCase();
  return TRIP_TEMPLATES.find(
    (tpl) => tpl.id.toLowerCase() === normalized || tpl.slug.toLowerCase() === normalized
  );
}
