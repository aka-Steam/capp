import type { Category, IHotel, IPoi, MediaItem, Price } from '../types';
import { withBase } from './config';

export const categoryLabels: Record<Category, string> = {
  attraction: 'Достопримечательность',
  restaurant: 'Ресторан',
  cafe: 'Кафе',
  shop: 'Магазин',
  hotel: 'Отель',
  station: 'Вокзал',
  airport: 'Аэропорт',
  meeting_point: 'Место встречи',
};

export const categoryColors: Record<Category, string> = {
  attraction: '#c41e3a',
  restaurant: '#d97706',
  cafe: '#b45309',
  shop: '#7c3aed',
  hotel: '#2563eb',
  station: '#475569',
  airport: '#0f766e',
  meeting_point: '#059669',
};

export const cityLabels: Record<string, string> = {
  beijing: 'Пекин',
  shanghai: 'Шанхай',
  pingyao: 'Пиньяо',
  chongqing: 'Чунцин',
  all: 'Все города',
  none: 'Без города',
};

export const NO_CITY = 'none';

/** Province → city filter key when `cityId` is missing. */
const PROVINCE_TO_CITY: Record<string, string> = {
  Chongqing: 'chongqing',
};

export function cityLabel(cityId?: string, province?: string): string {
  const key = cityId || (province ? PROVINCE_TO_CITY[province] : undefined);
  if (key && cityLabels[key]) return cityLabels[key];
  if (cityId) return cityId;
  if (province) return province;
  return cityLabels[NO_CITY];
}

export function cityFilterKey(poi: IPoi): string {
  if (poi.location.cityId) return poi.location.cityId;
  const fromProvince = poi.location.province && PROVINCE_TO_CITY[poi.location.province];
  if (fromProvince) return fromProvince;
  return NO_CITY;
}

export function formatPrice(price?: Price): string | undefined {
  if (!price) return undefined;
  const amount = price.approximate ? `~${price.amount}` : String(price.amount);
  return `${amount} ${price.currency}`;
}

export function hasCoords(poi: IPoi): poi is IPoi & { location: { geo: { lat: number; lon: number } } } {
  const geo = poi.location.geo;
  return typeof geo?.lat === 'number' && typeof geo?.lon === 'number';
}

export function poiCoords(poi: IPoi): [number, number] | undefined {
  if (!hasCoords(poi)) return undefined;
  return [poi.location.geo.lat, poi.location.geo.lon];
}

export interface MapPlace {
  id: string;
  title: string;
  coords: [number, number];
  category?: Category;
  city?: string;
}

export function toMapPlace(poi: IPoi): MapPlace | null {
  const coords = poiCoords(poi);
  if (!coords) return null;
  return {
    id: poi.id,
    title: poi.title,
    coords,
    category: poi.category,
    city: poi.location.cityId,
  };
}

export function toMapPlaces(items: IPoi[]): MapPlace[] {
  return items.map(toMapPlace).filter((p): p is MapPlace => p !== null);
}

export interface NormalizedPhoto {
  src: string;
  alt: string;
}

export interface NormalizedMedia {
  id: string;
  type: 'image' | 'video';
  src: string;
  preview?: string;
  caption?: string;
}

export function resolveMediaUrl(src: string | undefined, baseUrl: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  const path = src.startsWith('/') ? src : `/media/${src}`;
  return withBase(path, baseUrl);
}

export function normalizeMedia(media: MediaItem[] | undefined, baseUrl: string): NormalizedMedia[] {
  if (!media?.length) return [];
  return media
    .filter((item) => item.src)
    .map((item) => ({
      id: item.id,
      type: item.type,
      src: resolveMediaUrl(item.src, baseUrl) ?? item.src,
      preview: resolveMediaUrl(item.preview, baseUrl),
      caption: item.caption,
    }));
}

export function coverFromMedia(media: MediaItem[] | undefined, baseUrl: string): NormalizedPhoto | undefined {
  const items = normalizeMedia(media, baseUrl);
  const image = items.find((item) => item.type === 'image');
  if (image) return { src: image.src, alt: image.caption ?? '' };
  const video = items.find((item) => item.type === 'video' && item.preview);
  if (video?.preview) return { src: video.preview, alt: video.caption ?? '' };
  return undefined;
}

export interface PlaceCardData {
  id: string;
  title: string;
  category: Category;
  categoryLabel: string;
  cityKey: string;
  cityLabel: string;
  description?: string;
  openingHours?: string;
  priceLabel?: string;
  address?: string;
  cover?: NormalizedPhoto;
  href: string;
  coords?: [number, number];
  verified: boolean;
}

export function toPlaceCard(poi: IPoi, baseUrl: string): PlaceCardData {
  return {
    id: poi.id,
    title: poi.title,
    category: poi.category,
    categoryLabel: categoryLabels[poi.category],
    cityKey: cityFilterKey(poi),
    cityLabel: cityLabel(poi.location.cityId, poi.location.province),
    description: poi.description,
    openingHours: poi.visit?.openingHours,
    priceLabel: formatPrice(poi.visit?.price),
    address: poi.location.address,
    cover: coverFromMedia(poi.media, baseUrl),
    href: withBase(`/poi/${poi.id}`, baseUrl),
    coords: poiCoords(poi),
    verified: poi.verified,
  };
}

export interface HotelNearbyPlace {
  ref: string;
  title: string;
  walkMinutes: number;
  href: string;
}

export interface HotelCardData {
  id: string;
  title: string;
  cityKey: string;
  cityLabel: string;
  description?: string;
  cover?: NormalizedPhoto;
  href: string;
  coords?: [number, number];
  priceSingle?: number;
  priceDouble?: number;
  hasSingleRoom: boolean;
  currency: string;
  nearbyWalkable: HotelNearbyPlace[];
  verified: boolean;
}

export function toHotelCard(
  hotel: IHotel,
  baseUrl: string,
  titleById: Map<string, string>,
): HotelCardData {
  const stay = hotel.stay;
  const hasSingleRoom =
    stay?.hasSingleRoom !== undefined
      ? stay.hasSingleRoom
      : stay?.priceSingle !== undefined;

  return {
    id: hotel.id,
    title: hotel.title,
    cityKey: cityFilterKey(hotel),
    cityLabel: cityLabel(hotel.location.cityId, hotel.location.province),
    description: hotel.description,
    cover: coverFromMedia(hotel.media, baseUrl),
    href: withBase(`/poi/${hotel.id}`, baseUrl),
    coords: poiCoords(hotel),
    priceSingle: hasSingleRoom ? stay?.priceSingle : undefined,
    priceDouble: stay?.priceDouble,
    hasSingleRoom,
    currency: stay?.currency ?? 'CNY',
    nearbyWalkable: (stay?.nearbyWalkable ?? []).map((item) => ({
      ref: item.ref,
      title: titleById.get(item.ref) ?? item.ref,
      walkMinutes: item.walkMinutes,
      href: withBase(`/poi/${item.ref}`, baseUrl),
    })),
    verified: hotel.verified,
  };
}
