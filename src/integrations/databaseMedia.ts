import { createReadStream, existsSync, statSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/**
 * Serves `database/media` at `/media` in dev and copies it into `dist/media` on build.
 */
export function databaseMedia(): AstroIntegration {
  const mediaRoot = path.resolve('database/media');

  return {
    name: 'database-media',
    hooks: {
      'astro:server:setup'({ server }) {
        const base = (server.config.base ?? '/').replace(/\/$/, '');
        const prefixes = base && base !== '/' ? [`${base}/media`, '/media'] : ['/media'];

        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url?.split('?')[0] ?? '';
          const prefix = prefixes.find((p) => rawUrl === p || rawUrl.startsWith(`${p}/`));
          if (!prefix) {
            next();
            return;
          }

          const rel = decodeURIComponent(rawUrl.slice(prefix.length).replace(/^\/+/, ''));
          if (!rel || rel.includes('..')) {
            next();
            return;
          }

          const file = path.resolve(mediaRoot, rel);
          if (!file.startsWith(mediaRoot) || !existsSync(file) || !statSync(file).isFile()) {
            next();
            return;
          }

          const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
          res.setHeader('Content-Type', type);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          createReadStream(file).pipe(res);
        });
      },
      'astro:build:done': async ({ dir }) => {
        if (!existsSync(mediaRoot)) return;
        const dest = fileURLToPath(new URL('media/', dir));
        await cp(mediaRoot, dest, { recursive: true });
      },
    },
  };
}
