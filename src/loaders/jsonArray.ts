import { existsSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';

export interface JsonArrayLoaderOptions {
  /** Path relative to project root, e.g. `./database/poi.json` */
  file: string;
}

export function jsonArrayLoader(options: JsonArrayLoaderOptions): Loader {
  return {
    name: `json-array:${options.file}`,
    load: async ({ config, logger, parseData, store, watcher }) => {
      const fileUrl = new URL(options.file, config.root);
      const filePath = fileURLToPath(fileUrl);
      const rootDir = fileURLToPath(config.root);

      async function syncAll() {
        if (!existsSync(filePath)) {
          logger.warn(`JSON file not found: ${options.file}`);
          return;
        }

        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        const raw = await fs.readFile(filePath, 'utf-8');
        let items: unknown;
        try {
          items = JSON.parse(raw);
        } catch (err) {
          logger.error(`Invalid JSON in ${relativePath}: ${err}`);
          return;
        }

        if (!Array.isArray(items)) {
          logger.error(`${relativePath} must contain a JSON array`);
          return;
        }

        const loadedIds = new Set<string>();

        for (const item of items) {
          if (!item || typeof item !== 'object' || !('id' in item)) {
            logger.warn(`Entry without id in ${relativePath}, skipped`);
            continue;
          }

          const id = String((item as { id: unknown }).id);
          if (loadedIds.has(id)) {
            logger.warn(`Duplicate id "${id}" in ${relativePath} — later entry skipped`);
            continue;
          }
          loadedIds.add(id);

          const parsedData = await parseData({
            id,
            data: item as Record<string, unknown>,
            filePath: relativePath,
          });

          store.set({
            id,
            data: parsedData,
            filePath: relativePath,
          });
        }

        for (const existingId of store.keys()) {
          if (!loadedIds.has(existingId)) {
            store.delete(existingId);
          }
        }

        logger.info(`Loaded ${loadedIds.size} entries from ${relativePath}`);
      }

      await syncAll();

      watcher?.add(filePath);
      watcher?.on('change', async (changed) => {
        const normalized = path.normalize(changed);
        if (normalized === path.normalize(filePath)) await syncAll();
      });
    },
  };
}
