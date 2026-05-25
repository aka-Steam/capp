<script lang="ts">
  import { onMount } from 'svelte';
  import type { CircleMarker, Map as LeafletMap } from 'leaflet';
  import type * as Leaflet from 'leaflet';
  import { patchLeafletMeasure } from '../lib/patchLeafletMeasure';

  export interface MapPlace {
    id: string;
    title: string;
    coords: [number, number];
  }

  interface MapConfig {
    tileUrl: string;
    attribution: string;
    defaultZoom: number;
    focusZoom: number;
  }

  interface Props {
    places: MapPlace[];
    mapConfig: MapConfig;
    leafletBase: string;
    highlightedId?: string | null;
    focusedId?: string | null;
    variant?: 'sidebar' | 'modal';
  }

  let {
    places,
    mapConfig,
    leafletBase,
    highlightedId = null,
    focusedId = $bindable<string | null>(null),
    variant = 'sidebar',
  }: Props = $props();

  let container: HTMLDivElement;
  let map: LeafletMap | null = null;
  let leafletLink: HTMLLinkElement | null = null;
  let measureLink: HTMLLinkElement | null = null;
  let measureScript: HTMLScriptElement | null = null;
  let LRef: typeof Leaflet | null = null;
  let measuring = false;
  const markers = new Map<string, CircleMarker>();

  const measureBase = $derived(leafletBase.replace(/leaflet\/$/, 'leaflet-measure/'));

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
      measureScript = script;
    });
  }

  function applyMarkerStyles() {
    if (!map) return;
    const activeId = focusedId ?? highlightedId;
    for (const [id, marker] of markers) {
      const active = id === activeId;
      const focused = id === focusedId;
      marker.setStyle({
        radius: focused ? 14 : active ? 11 : 8,
        fillOpacity: focused ? 1 : active ? 0.95 : 0.85,
        weight: focused ? 3 : active ? 2.5 : 2,
      });
    }
  }

  function focusOnMap(id: string | null) {
    if (!map || !id || measuring) return;
    const marker = markers.get(id);
    if (!marker) return;
    map.setView(marker.getLatLng(), mapConfig.focusZoom ?? 15, { animate: true });
    marker.openPopup();
    applyMarkerStyles();
  }

  function setMarkersInteractive(interactive: boolean) {
    for (const marker of markers.values()) {
      const handler = markerClickHandlers.get(marker);
      if (!handler) continue;
      if (interactive) {
        marker.on('click', handler);
      } else {
        marker.off('click', handler);
        marker.closePopup();
      }
      marker.setStyle({ interactive });
    }
  }

  const markerClickHandlers = new Map<CircleMarker, () => void>();

  function fitAllPlaces() {
    if (!map || !LRef || places.length === 0 || measuring) return;
    const bounds = places.map((p) => p.coords);
    if (bounds.length === 1) {
      map.setView(bounds[0], mapConfig.defaultZoom);
    } else {
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }

  function rebuildMarkers() {
    if (!map || !LRef) return;
    const L = LRef;
    for (const m of markers.values()) m.remove();
    markers.clear();
    markerClickHandlers.clear();

    for (const place of places) {
      const marker = L.circleMarker(place.coords, {
        radius: 8,
        color: '#c41e3a',
        fillColor: '#c41e3a',
        fillOpacity: 0.85,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(place.title);

      const onMarkerClick = () => {
        if (measuring) return;
        focusedId = place.id;
        focusOnMap(place.id);
      };
      marker.on('click', onMarkerClick);
      markerClickHandlers.set(marker, onMarkerClick);

      markers.set(place.id, marker);
    }

    if (measuring) {
      setMarkersInteractive(false);
    } else if (focusedId) {
      focusOnMap(focusedId);
    } else {
      fitAllPlaces();
    }
    applyMarkerStyles();
  }

  onMount(async () => {
    LRef = await import('leaflet');

    leafletLink = document.createElement('link');
    leafletLink.rel = 'stylesheet';
    leafletLink.href = `${leafletBase}leaflet.css`;
    document.head.appendChild(leafletLink);

    measureLink = document.createElement('link');
    measureLink.rel = 'stylesheet';
    measureLink.href = `${measureBase}leaflet-measure.css`;
    document.head.appendChild(measureLink);

    (window as Window & { L?: typeof Leaflet }).L = LRef;
    await loadScript(`${measureBase}leaflet-measure.ru.js`);
    patchLeafletMeasure(LRef);

    map = LRef.map(container, { scrollWheelZoom: true });

    LRef.tileLayer(mapConfig.tileUrl, {
      attribution: mapConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    // @ts-expect-error leaflet-measure extends L at runtime
    LRef.control
      .measure({
        position: 'topleft',
        primaryLengthUnit: 'kilometers',
        secondaryLengthUnit: 'meters',
        primaryAreaUnit: 'hectares',
        decPoint: ',',
        thousandsSep: ' ',
        captureZIndex: 100000,
      })
      .addTo(map);

    map.on('measurestart', () => {
      measuring = true;
      setMarkersInteractive(false);
    });
    map.on('measurefinish', () => {
      measuring = false;
      setMarkersInteractive(true);
    });

    rebuildMarkers();

    const ro = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      map?.remove();
      map = null;
      LRef = null;
      leafletLink?.remove();
      measureLink?.remove();
      measureScript?.remove();
      delete (window as Window & { L?: typeof Leaflet }).L;
    };
  });

  $effect(() => {
    places;
    if (map && LRef) rebuildMarkers();
  });

  $effect(() => {
    highlightedId;
    applyMarkerStyles();
    if (measuring) return;
    if (highlightedId && !focusedId) {
      const marker = markers.get(highlightedId);
      if (marker && map) map.panTo(marker.getLatLng(), { animate: true });
    }
  });

  $effect(() => {
    if (measuring) return;
    if (focusedId) focusOnMap(focusedId);
    else applyMarkerStyles();
  });

  export function invalidate() {
    queueMicrotask(() => map?.invalidateSize());
  }
</script>

<div
  class="map-panel"
  class:map-panel--modal={variant === 'modal'}
  bind:this={container}
  role="application"
  aria-label="Карта мест"
></div>
