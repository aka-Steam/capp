export type ScheduleEventKind =
  | 'flight'
  | 'train'
  | 'bus'
  | 'metro'
  | 'taxi'
  | 'visit'
  | 'shop'
  | 'food'
  | 'hotel'
  | 'free';

export const scheduleKindLabels: Record<ScheduleEventKind, string> = {
  flight: 'Перелёт',
  train: 'Поезд',
  bus: 'Автобус',
  metro: 'Метро',
  taxi: 'Такси',
  visit: 'Достопримечательность',
  shop: 'Магазин',
  food: 'Еда',
  hotel: 'Отель',
  free: 'Свободное время',
};

/** Раздел справочника для ссылки ref по типу события */
export function refSectionForKind(kind: ScheduleEventKind): string | null {
  switch (kind) {
    case 'flight':
    case 'train':
    case 'bus':
    case 'metro':
    case 'taxi':
      return 'logistics';
    case 'visit':
    case 'shop':
      return 'attractions';
    case 'food':
      return 'food';
    case 'hotel':
      return 'hotels';
    case 'free':
      return null;
    default:
      return 'attractions';
  }
}

export function refHref(
  baseUrl: string,
  kind: ScheduleEventKind,
  ref: string | undefined,
): string | null {
  if (!ref) return null;
  const section = refSectionForKind(kind);
  if (!section) return null;
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${base}${section}#place-${ref}`;
}
