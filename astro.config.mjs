// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [svelte()],
});
