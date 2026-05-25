import { existsSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob as tinyglob } from 'tinyglobby';
import { parseBundleMarkdown } from './bundleMarkdown';
import type { Loader } from 'astro/loaders';

const LOGISTICS_TYPE_BY_FILE: Record<string, 'flight' | 'train' | 'bus' | 'metro' | 'taxi'> = {
  flights: 'flight',
  flight: 'flight',
  trains: 'train',
  train: 'train',
  buses: 'bus',
  bus: 'bus',
  metro: 'metro',
  taxis: 'taxi',
  taxi: 'taxi',
};

function inferLogisticsType(filePath: string): 'flight' | 'train' | 'bus' | 'metro' | 'taxi' | undefined {
  const base = path.basename(filePath, '.md').toLowerCase();
  return LOGISTICS_TYPE_BY_FILE[base];
}

/** Shallower paths load first; deeper paths override duplicate ids. */
function sortByLoadPriority(files: string[], basePath: string): string[] {
  return [...files].sort((a, b) => {
    const depthA = path.relative(basePath, a).split(path.sep).length;
    const depthB = path.relative(basePath, b).split(path.sep).length;
    if (depthA !== depthB) return depthA - depthB;
    return a.localeCompare(b);
  });
}

export interface HybridMarkdownOptions {
  /** Directory relative to project root, e.g. `./content/attractions` */
  base: string;
  /** Apply transport type from filename (trains.md → train) for logistics */
  inferLogisticsTypeFromFile?: boolean;
}

export function hybridMarkdownLoader(options: HybridMarkdownOptions): Loader {
  const label = options.base;

  return {
    name: `hybrid-markdown:${label}`,
    load: async ({ config, logger, parseData, store, watcher }) => {
      const baseUrl = new URL(options.base, config.root);
      const basePath = fileURLToPath(baseUrl);

      if (!existsSync(basePath)) {
        logger.warn(`Content directory not found: ${options.base}`);
        return;
      }

      async function syncAll() {
        const files = await tinyglob('**/*.md', {
          cwd: basePath,
          absolute: true,
          onlyFiles: true,
          ignore: ['**/README.md', '**/readme.md'],
        });

        const sorted = sortByLoadPriority(files, basePath);
        const loadedIds = new Set<string>();
        const rootDir = fileURLToPath(config.root);

        for (const filePath of sorted) {
          const content = await fs.readFile(filePath, 'utf-8');
          const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
          const entries = parseBundleMarkdown(content);
          const fileType = options.inferLogisticsTypeFromFile
            ? inferLogisticsType(filePath)
            : undefined;

          if (entries.length === 0) {
            logger.warn(`No entries parsed from ${relativePath}`);
            continue;
          }

          for (const { data, body } of entries) {
            if (!data.id || typeof data.id !== 'string') {
              logger.warn(`Entry without id in ${relativePath}, skipped`);
              continue;
            }

            const enriched: Record<string, unknown> = { ...data };
            if (fileType && !enriched.type) {
              enriched.type = fileType;
            }

            const id = String(enriched.id);
            if (loadedIds.has(id)) {
              logger.warn(
                `Duplicate id "${id}" — ${relativePath} overrides an earlier entry`,
              );
            }
            loadedIds.add(id);

            const parsedData = await parseData({
              id,
              data: enriched,
              filePath: relativePath,
            });

            store.set({
              id,
              data: parsedData,
              body,
              filePath: relativePath,
            });
          }
        }

        for (const existingId of store.keys()) {
          if (!loadedIds.has(existingId)) {
            store.delete(existingId);
          }
        }

        logger.debug(`Loaded ${loadedIds.size} entries from ${sorted.length} file(s) in ${options.base}`);
      }

      await syncAll();

      watcher?.add(basePath);
      watcher?.on('change', async (changed) => {
        if (changed.startsWith(basePath)) await syncAll();
      });
    },
  };
}
