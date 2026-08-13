import { getMapConfig } from './config';

export function leafletAssets(baseUrl: string) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return {
    mapConfig: getMapConfig(),
    leafletBase: `${base}leaflet/`,
  };
}
