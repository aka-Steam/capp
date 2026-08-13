<script lang="ts">
  import MapView from './MapView.svelte';
  import { categoryLabels, type MapPlace, type PlaceCardData } from '../lib/poi';
  import type { Category } from '../types';

  interface MapConfig {
    tileUrl: string;
    attribution: string;
    defaultZoom: number;
    focusZoom: number;
  }

  interface Props {
    cards: PlaceCardData[];
    places: MapPlace[];
    mapConfig: MapConfig;
    leafletBase: string;
  }

  let { cards, places, mapConfig, leafletBase }: Props = $props();

  let selectedCategory = $state<string>('all');
  let focusedId = $state<string | null>(null);
  let mapRef: MapView | undefined;

  const categories = $derived(
    [...new Set(places.map((p) => p.category).filter(Boolean))] as Category[],
  );

  const filteredPlaces = $derived(
    selectedCategory === 'all'
      ? places
      : places.filter((p) => p.category === selectedCategory),
  );

  const selected = $derived(focusedId ? cards.find((c) => c.id === focusedId) : undefined);

  function selectPlace(id: string) {
    focusedId = id;
    mapRef?.invalidate();
  }
</script>

<div class="city-filter" role="group" aria-label="Фильтр по категории">
  <button type="button" class:active={selectedCategory === 'all'} onclick={() => (selectedCategory = 'all')}>
    Все категории
  </button>
  {#each categories as category (category)}
    <button
      type="button"
      class:active={selectedCategory === category}
      onclick={() => (selectedCategory = category)}
    >
      {categoryLabels[category]}
    </button>
  {/each}
</div>

<div class="map-explorer">
  <div class="map-explorer__map">
    <MapView
      bind:this={mapRef}
      places={filteredPlaces}
      {mapConfig}
      {leafletBase}
      bind:focusedId
      variant="explorer"
      onSelect={selectPlace}
    />
  </div>

  <aside class="map-explorer__panel" aria-live="polite">
    {#if selected}
      <h2 class="place-card__title">{selected.title}</h2>
      <div class="place-card__city">
        {selected.categoryLabel}
        {#if selected.cityLabel}
          · {selected.cityLabel}
        {/if}
      </div>
      {#if selected.cover}
        <div class="place-card__photos">
          <figure class="place-card__cover">
            <img src={selected.cover.src} alt={selected.cover.alt} loading="lazy" decoding="async" />
          </figure>
        </div>
      {/if}
      <ul class="field-list">
        {#if selected.openingHours}
          <li><span class="field-list__label">Часы:</span> {selected.openingHours}</li>
        {/if}
        {#if selected.priceLabel}
          <li><span class="field-list__label">Стоимость:</span> {selected.priceLabel}</li>
        {/if}
        {#if selected.address}
          <li><span class="field-list__label">Адрес:</span> {selected.address}</li>
        {/if}
      </ul>
      {#if selected.description}
        <div class="place-card__body">{selected.description}</div>
      {/if}
      <a class="place-card__more" href={selected.href}>Подробнее</a>
    {:else}
      <p class="map-explorer__hint">Нажмите на маркер, чтобы увидеть информацию о месте.</p>
    {/if}
  </aside>
</div>
