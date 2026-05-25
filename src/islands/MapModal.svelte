<script lang="ts">
  import { onMount } from 'svelte';
  import MapView, { type MapPlace } from './MapView.svelte';

  interface MapConfig {
    tileUrl: string;
    attribution: string;
    defaultZoom: number;
    focusZoom: number;
  }

  interface Props {
    open: boolean;
    placeId: string | null;
    placeTitle: string;
    places: MapPlace[];
    mapConfig: MapConfig;
    leafletBase: string;
    onClose: () => void;
  }

  let { open, placeId, placeTitle, places, mapConfig, leafletBase, onClose }: Props = $props();

  let mapRef: MapView | undefined;
  let focusedId = $state<string | null>(null);

  $effect(() => {
    if (open && placeId) {
      focusedId = placeId;
      setTimeout(() => mapRef?.invalidate(), 100);
    }
  });

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="map-modal-overlay" onclick={onClose} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="map-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="map-modal-title">
      <header class="map-modal__header">
        <h2 id="map-modal-title">{placeTitle}</h2>
        <button type="button" class="map-modal__close" onclick={onClose} aria-label="Закрыть">×</button>
      </header>
      {#key placeId}
        <MapView
          bind:this={mapRef}
          {places}
          {mapConfig}
          {leafletBase}
          bind:focusedId
          variant="modal"
        />
      {/key}
    </div>
  </div>
{/if}
