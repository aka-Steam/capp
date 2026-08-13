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

export function refHref(
  baseUrl: string,
  kind: ScheduleEventKind,
  ref: string | undefined,
): string | null {
  if (!ref) return null;
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  switch (kind) {
    case 'flight':
    case 'train':
    case 'bus':
    case 'metro':
    case 'taxi':
      return `${base}logistics#place-${ref}`;
    case 'free':
      return null;
    default:
      return `${base}poi/${ref}`;
  }
}
