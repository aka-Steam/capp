// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { databaseMedia } from './src/integrations/databaseMedia.ts';

const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [svelte(), databaseMedia()],
  redirects: {
    '/attractions': '/points',
    '/food': '/points',
  },
});
