import yaml from 'js-yaml';

import mapYaml from '../../config/map.yaml?raw';
import navigationYaml from '../../config/navigation.yaml?raw';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface MapConfig {
  tileUrl: string;
  attribution: string;
  defaultZoom: number;
  focusZoom: number;
}

export function getNavigation(): NavSection[] {
  const data = yaml.load(navigationYaml) as { sections: NavSection[] };
  return data.sections;
}

export function getMapConfig(): MapConfig {
  const raw = yaml.load(mapYaml) as Partial<MapConfig>;
  return {
    tileUrl: raw.tileUrl ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: raw.attribution ?? '',
    defaultZoom: raw.defaultZoom ?? 12,
    focusZoom: raw.focusZoom ?? 15,
  };
}

/** Resolve nav href with Astro base */
export function withBase(href: string, base: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (href.startsWith('/')) {
    return normalizedBase === '' || normalizedBase === '/'
      ? href
      : `${normalizedBase}${href}`;
  }
  return href;
}
