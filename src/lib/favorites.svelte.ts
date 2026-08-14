export interface FavoriteCatalogItem {
  id: string;
  title: string;
  href: string;
  categoryLabel: string;
  cityLabel: string;
  verified: boolean;
}

const STORAGE_KEY = 'capp-favorites';

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Shared favorite ids. Mutate `ids`, do not reassign the object. */
export const favorites = $state({
  ids: [] as string[],
  ready: false,
});

export function initFavorites() {
  if (typeof localStorage === 'undefined' || favorites.ready) return;
  favorites.ids = readIds();
  favorites.ready = true;
}

export function isFavorite(id: string): boolean {
  return favorites.ids.includes(id);
}

export function toggleFavorite(id: string) {
  initFavorites();
  if (favorites.ids.includes(id)) {
    favorites.ids = favorites.ids.filter((item) => item !== id);
  } else {
    favorites.ids = [...favorites.ids, id];
  }
  writeIds(favorites.ids);
}
