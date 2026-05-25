import yaml from 'js-yaml';

/** Split one .md file into many entries: `---` yaml `---` body (repeated). */
export function parseBundleMarkdown(content: string): Array<{
  data: Record<string, unknown>;
  body: string;
}> {
  const entries: Array<{ data: Record<string, unknown>; body: string }> = [];
  const trimmed = content.trim();
  if (!trimmed) return entries;

  const parts = trimmed.split(/\r?\n---\r?\n/);
  let i = parts[0].trim() === '' ? 1 : 0;

  while (i < parts.length) {
    const fmBlock = parts[i]?.trim();
    const bodyBlock = parts[i + 1] ?? '';
    if (!fmBlock) {
      i += 1;
      continue;
    }
    try {
      const data = yaml.load(fmBlock) as Record<string, unknown>;
      if (data && typeof data === 'object' && typeof data.id === 'string') {
        entries.push({ data, body: bodyBlock.trim() });
      }
    } catch {
      /* skip malformed block */
    }
    i += 2;
  }

  return entries;
}

