import { getCollection } from 'astro:content';
import { marked } from 'marked';
import { cityLabels, getFieldsConfig, getMapConfig, withBase } from './config';
import { buildFieldRows, fieldsRowsToHtml } from './fieldRows';
import { normalizePhotos, photosToGalleryHtml } from './photos';
import { toMapPlaces } from './places';

type CollectionName = 'attractions' | 'hotels' | 'food';

const imageRoots: Record<CollectionName, string> = {
  attractions: '/images/attractions/',
  hotels: '/images/hotels/',
  food: '/images/food/',
};

async function bodyToHtml(entry: { body?: string }): Promise<string> {
  if (!entry.body?.trim()) return '';
  return await marked.parse(entry.body);
}

export async function buildInfoPageData(collection: CollectionName) {
  const entries = await getCollection(collection);
  const fieldsRegistry = getFieldsConfig(collection);
  const mapConfig = getMapConfig();
  const base = import.meta.env.BASE_URL;
  const leafletBase = `${base}leaflet/`;
  const imageRoot = imageRoots[collection];

  const cards = await Promise.all(
    entries.map(async (entry) => {
      const data = entry.data as {
        id: string;
        city?: string;
        title: string;
        photos?: unknown;
      };
      const rows = buildFieldRows(entry.data as Record<string, unknown>, fieldsRegistry);
      const photos = normalizePhotos(data.photos, base, imageRoot);

      return {
        id: data.id,
        city: data.city,
        title: data.title,
        cityLabel: data.city ? (cityLabels[data.city] ?? data.city) : '',
        fieldsHtml: fieldsRowsToHtml(rows),
        photosHtml: photosToGalleryHtml(photos),
        bodyHtml: await bodyToHtml(entry),
        coords: (entry.data as { coords?: [number, number] }).coords,
      };
    }),
  );

  const withCoords = entries.filter((e) => {
    const d = e.data as { coords?: unknown };
    return Array.isArray(d.coords) && d.coords.length === 2;
  });

  const places = toMapPlaces(withCoords as Parameters<typeof toMapPlaces>[0]);

  return { cards, places, mapConfig, leafletBase, showMap: places.length > 0 };
}

const logisticsTypeOrder: Record<string, number> = {
  flight: 0,
  train: 1,
  bus: 2,
  metro: 3,
  taxi: 4,
};

export async function buildLogisticsPageData() {
  const entries = await getCollection('logistics');
  const fieldsRegistry = getFieldsConfig('logistics');
  const mapConfig = getMapConfig();
  const base = import.meta.env.BASE_URL;
  const leafletBase = `${base}leaflet/`;

  const cards = await Promise.all(
    entries.map(async (entry) => {
      const data = entry.data as { id: string; from: string; to: string; type: string };
      const rows = buildFieldRows(entry.data as Record<string, unknown>, fieldsRegistry);

      return {
        id: data.id,
        city: undefined,
        title: `${data.from} → ${data.to}`,
        cityLabel: '',
        fieldsHtml: fieldsRowsToHtml(rows),
        photosHtml: '',
        bodyHtml: await bodyToHtml(entry),
        coords: undefined,
        sortKey: logisticsTypeOrder[data.type] ?? 99,
      };
    }),
  );

  cards.sort((a, b) => a.sortKey - b.sortKey || a.title.localeCompare(b.title, 'ru'));

  return { cards, places: [], mapConfig, leafletBase, showMap: false };
}

export interface HotelNearbyPlace {
  ref: string;
  title: string;
  walkMinutes: number;
  href: string;
}

export interface HotelCardData {
  id: string;
  city?: string;
  title: string;
  cityLabel: string;
  fieldsHtml: string;
  photosHtml: string;
  bodyHtml: string;
  coords?: [number, number];
  priceSingle?: number;
  priceDouble?: number;
  hasSingleRoom: boolean;
  currency: string;
  nearbyWalkable: HotelNearbyPlace[];
}

export async function buildHotelsPageData() {
  const entries = await getCollection('hotels');
  const attractions = await getCollection('attractions');
  const attractionTitles = new Map(
    attractions.map((a) => [a.data.id, a.data.title as string]),
  );

  const fieldsRegistry = getFieldsConfig('hotels');
  const mapConfig = getMapConfig();
  const base = import.meta.env.BASE_URL;
  const leafletBase = `${base}leaflet/`;
  const imageRoot = imageRoots.hotels;

  const hotelFieldSkip = [
    'priceSingle',
    'priceDouble',
    'hasSingleRoom',
    'currency',
    'nearbyWalkable',
  ];

  const cards: HotelCardData[] = await Promise.all(
    entries.map(async (entry) => {
      const data = entry.data as {
        id: string;
        city?: string;
        title: string;
        photos?: unknown;
        priceSingle?: number;
        priceDouble?: number;
        hasSingleRoom?: boolean;
        currency?: string;
        coords?: [number, number];
        nearbyWalkable?: { ref: string; walkMinutes: number }[];
      };

      const hasSingleRoom =
        data.hasSingleRoom !== undefined
          ? data.hasSingleRoom
          : data.priceSingle !== undefined && data.priceSingle !== null;

      const rows = buildFieldRows(
        entry.data as Record<string, unknown>,
        fieldsRegistry,
        hotelFieldSkip,
      );
      const photos = normalizePhotos(data.photos, base, imageRoot);

      const nearbyWalkable = (data.nearbyWalkable ?? []).map((item) => ({
        ref: item.ref,
        title: attractionTitles.get(item.ref) ?? item.ref,
        walkMinutes: item.walkMinutes,
        href: withBase(`/attractions#place-${item.ref}`, base),
      }));

      return {
        id: data.id,
        city: data.city,
        title: data.title,
        cityLabel: data.city ? (cityLabels[data.city] ?? data.city) : '',
        fieldsHtml: fieldsRowsToHtml(rows),
        photosHtml: photosToGalleryHtml(photos),
        bodyHtml: await bodyToHtml(entry),
        coords: data.coords,
        priceSingle: hasSingleRoom ? data.priceSingle : undefined,
        priceDouble: data.priceDouble,
        hasSingleRoom,
        currency: data.currency ?? 'CNY',
        nearbyWalkable,
      };
    }),
  );

  const withCoords = entries.filter((e) => {
    const d = e.data as { coords?: unknown };
    return Array.isArray(d.coords) && d.coords.length === 2;
  });

  const places = toMapPlaces(withCoords as Parameters<typeof toMapPlaces>[0]);

  return { cards, places, mapConfig, leafletBase, showMap: places.length > 0 };
}
