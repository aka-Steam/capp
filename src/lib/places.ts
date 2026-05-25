export interface MapPlace {
  id: string;
  title: string;
  coords: [number, number];
  city?: string;
}

export function toMapPlaces<
  T extends { data: { id: string; title: string; coords: [number, number]; city?: string } },
>(entries: T[]): MapPlace[] {
  return entries.map((e) => ({
    id: e.data.id,
    title: e.data.title,
    coords: e.data.coords,
    city: e.data.city,
  }));
}
