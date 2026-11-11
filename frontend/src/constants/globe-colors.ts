export type GlobeColorState =
  | 'default'
  | 'hovered'
  | 'selected'
  | 'planned'
  | 'favorite';

export const GLOBE_COLORS: Record<GlobeColorState, string> = {
  default: '#94a3b8', // Серый — обычная страна, не выбранная пользователем
  hovered: '#38bdf8', // Голубой — страна, на которую пользователь навёл курсор
  selected: '#f97316', // Оранжевый — выбранная страна
  planned: '#22c55e', // Зелёный — страна, в которую у пользователя уже запланирована поездка
  favorite: '#a855f7', // Фиолетовый — страна добавлена в избранное
};

export interface GlobeLegendItem {
  id: GlobeColorState;
  color: string;
  colorName: string;
  label: string;
  shortDesc: string;
  tooltip: string;
}

export const GLOBE_LEGEND_ITEMS: GlobeLegendItem[] = [
  {
    id: 'default',
    color: GLOBE_COLORS.default,
    colorName: 'Серый',
    label: 'Обычная страна',
    shortDesc: 'Не выбрана пользователем',
    tooltip:
      'Обычная страна, которая сейчас не выбрана, не добавлена в избранное и не имеет запланированных поездок.',
  },
  {
    id: 'hovered',
    color: GLOBE_COLORS.hovered,
    colorName: 'Голубой',
    label: 'Наведение курсора',
    shortDesc: 'Страна под курсором',
    tooltip:
      'Страна, на которую в данный момент наведён курсор мыши. Не сбрасывает выделение уже выбранной страны.',
  },
  {
    id: 'selected',
    color: GLOBE_COLORS.selected,
    colorName: 'Оранжевый',
    label: 'Выбранная страна',
    shortDesc: 'Активный выбор на глобусе',
    tooltip:
      'Текущая выбранная страна. Сохраняет своё выделение, пока вы не выберете другую страну на глобусе или в списке.',
  },
  {
    id: 'planned',
    color: GLOBE_COLORS.planned,
    colorName: 'Зелёный',
    label: 'Запланирована поездка',
    shortDesc: 'Есть в ваших поездках',
    tooltip:
      'Страна, в которую у вас уже создана запланированная поездка. Имеет приоритет цвета над избранным (наличие в избранном дополнительно отмечается иконкой ♥).',
  },
  {
    id: 'favorite',
    color: GLOBE_COLORS.favorite,
    colorName: 'Фиолетовый',
    label: 'В избранном',
    shortDesc: 'Добавлена в избранное',
    tooltip:
      'Страна сохранена в вашей коллекции избранного. Если в неё также запланирована поездка, используется зелёный цвет поездки и дополнительный значок сердечка ♥.',
  },
];
