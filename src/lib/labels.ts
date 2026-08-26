import raw from '../../database/new.json';

function parseIds(value: unknown): Set<string> {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && 'ids' in value && Array.isArray((value as { ids: unknown }).ids)
      ? (value as { ids: unknown[] }).ids
      : [];

  return new Set(
    list
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      .map((id) => id.trim()),
  );
}

export const newPoiIds = parseIds(raw);

export function isNewPoi(id: string): boolean {
  return newPoiIds.has(id);
}
