import yaml from 'js-yaml';

import mapYaml from '../../config/map.yaml?raw';
import navigationYaml from '../../config/navigation.yaml?raw';

import attractionsFieldsYaml from '../../config/fields/attractions.yaml?raw';
import hotelsFieldsYaml from '../../config/fields/hotels.yaml?raw';
import foodFieldsYaml from '../../config/fields/food.yaml?raw';
import logisticsFieldsYaml from '../../config/fields/logistics.yaml?raw';

export type FieldType =
  | 'text'
  | 'stars'
  | 'url'
  | 'money'
  | 'enum'
  | 'links'
  | 'tags';

export interface FieldConfig {
  label: string;
  type: FieldType;
  showOnCard?: boolean;
  enumLabels?: Record<string, string>;
}

export type FieldsRegistry = Record<string, FieldConfig>;

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

const fieldsByCollection: Record<string, FieldsRegistry> = {
  attractions: yaml.load(attractionsFieldsYaml) as FieldsRegistry,
  hotels: yaml.load(hotelsFieldsYaml) as FieldsRegistry,
  food: yaml.load(foodFieldsYaml) as FieldsRegistry,
  logistics: yaml.load(logisticsFieldsYaml) as FieldsRegistry,
};

export function getFieldsConfig(collection: string): FieldsRegistry {
  return fieldsByCollection[collection] ?? {};
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

export const cityLabels: Record<string, string> = {
  beijing: 'Пекин',
  shanghai: 'Шанхай',
  pingyao: 'Пиньяо',
  all: 'Все города',
};
