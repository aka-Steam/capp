import type { FieldConfig, FieldsRegistry } from './config';

export interface FieldRow {
  key: string;
  label: string;
  type: FieldConfig['type'];
  value: unknown;
  enumLabels?: Record<string, string>;
}

export function buildFieldRows(
  data: Record<string, unknown>,
  registry: FieldsRegistry,
  extraSkip: string[] = [],
): FieldRow[] {
  const skip = new Set(['id', 'city', 'title', 'coords', 'photos', 'comments', ...extraSkip]);

  return Object.entries(registry)
    .filter(([key, cfg]) => cfg.showOnCard !== false && !skip.has(key))
    .map(([key, cfg]) => ({
      key,
      label: cfg.label,
      type: cfg.type,
      value: data[key],
      enumLabels: cfg.enumLabels,
    }))
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatRowValue(row: FieldRow): string | null {
  const { value, type, enumLabels } = row;
  if (value === undefined || value === null || value === '') return null;

  if (type === 'enum' && typeof value === 'string') {
    return escapeHtml(enumLabels?.[value] ?? value);
  }
  if (type === 'money' && typeof value === 'number') {
    return String(value);
  }
  if (type === 'tags' && Array.isArray(value)) {
    return escapeHtml(value.join(', '));
  }
  if (type === 'stars' && typeof value === 'number') {
    const full = Math.round(value);
    const stars = '★'.repeat(full) + '☆'.repeat(5 - full);
    return `<span class="stars" title="${value} / 5">${stars}</span>`;
  }
  if (type === 'url' && typeof value === 'string') {
    return `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.label)}</a>`;
  }
  if (type === 'links' && Array.isArray(value)) {
    return (value as { label: string; url: string }[])
      .map(
        (l) =>
          `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`,
      )
      .join(' ');
  }
  return escapeHtml(String(value));
}

export function fieldsRowsToHtml(rows: FieldRow[]): string {
  if (rows.length === 0) return '';
  const items = rows
    .map((row) => {
      if (row.type === 'url' || row.type === 'links') {
        const inner = formatRowValue(row);
        if (!inner) return '';
        return `<li><span class="field-list__label">${escapeHtml(row.label)}: </span>${inner}</li>`;
      }
      const inner = formatRowValue(row);
      if (!inner) return '';
      return `<li><span class="field-list__label">${escapeHtml(row.label)}: </span>${inner}</li>`;
    })
    .filter(Boolean)
    .join('');
  return `<ul class="field-list">${items}</ul>`;
}
