<script lang="ts">
  import { onMount } from 'svelte';
  import MapView, { type MapPlace } from './MapView.svelte';
  import MapModal from './MapModal.svelte';

  interface MapConfig {
    tileUrl: string;
    attribution: string;
    defaultZoom: number;
    focusZoom: number;
  }

  interface CardData {
    id: string;
    city?: string;
    title: string;
    cityLabel: string;
    fieldsHtml: string;
    photosHtml: string;
    bodyHtml: string;
    coords?: [number, number];
  }

  interface Props {
    cards: CardData[];
    places: MapPlace[];
    mapConfig: MapConfig;
    leafletBase: string;
    showMap: boolean;
  }

  let { cards, places, mapConfig, leafletBase, showMap }: Props = $props();

  let selectedCity = $state<string>('all');
  let highlightedId = $state<string | null>(null);
  let focusedId = $state<string | null>(null);
  let isDesktop = $state(true);
  let mapModalOpen = $state(false);
  let mapModalPlaceId = $state<string | null>(null);
  let mapRef: MapView | undefined;

  const MOBILE_MQ = '(min-width: 769px)';

  onMount(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => {
      isDesktop = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  });

  const cities = $derived(
    [...new Set(cards.map((c) => c.city).filter(Boolean))] as string[],
  );

  const filteredCards = $derived(
    selectedCity === 'all' ? cards : cards.filter((c) => c.city === selectedCity),
  );

  const filteredPlaces = $derived(
    selectedCity === 'all'
      ? places
      : places.filter((p) => {
          const card = cards.find((c) => c.id === p.id);
          return card?.city === selectedCity;
        }),
  );

  const mapModalTitle = $derived(
    cards.find((c) => c.id === mapModalPlaceId)?.title ?? 'На карте',
  );

  const cityLabels: Record<string, string> = {
    beijing: 'Пекин',
    shanghai: 'Шанхай',
    pingyao: 'Пиньяо',
    all: 'Все города',
  };

  function onCardEnter(id: string) {
    if (!isDesktop) return;
    highlightedId = id;
  }

  function onCardLeave() {
    if (!isDesktop) return;
    highlightedId = null;
  }

  function onCardClick(id: string) {
    if (!showMap) return;
    if (isDesktop) {
      focusedId = id;
      highlightedId = id;
      mapRef?.invalidate();
    } else {
      mapModalPlaceId = id;
      mapModalOpen = true;
    }
  }

  function openMapModal(id: string, e: MouseEvent) {
    e.stopPropagation();
    mapModalPlaceId = id;
    mapModalOpen = true;
  }

  function closeMapModal() {
    mapModalOpen = false;
    mapModalPlaceId = null;
  }
</script>

<div class="city-filter" role="group" aria-label="Фильтр по городу">
  <button
    type="button"
    class:active={selectedCity === 'all'}
    onclick={() => (selectedCity = 'all')}
  >
    {cityLabels.all}
  </button>
  {#each cities as city}
    <button
      type="button"
      class:active={selectedCity === city}
      onclick={() => (selectedCity = city)}
    >
      {cityLabels[city] ?? city}
    </button>
  {/each}
</div>

<div
  class="info-page-layout"
  class:info-page-layout--with-map={showMap && isDesktop}
  class:info-page-layout--no-map={!showMap}
>
  <div class="info-page-layout__list">
    <div class="place-list">
      {#each filteredCards as card (card.id)}
        <article
          class="place-card"
          class:place-card--highlight={focusedId === card.id || highlightedId === card.id}
          class:place-card--clickable={showMap && !!card.coords}
          id={`place-${card.id}`}
          data-place-id={card.id}
          onmouseenter={() => onCardEnter(card.id)}
          onmouseleave={onCardLeave}
          onclick={() => onCardClick(card.id)}
          onkeydown={(e) => e.key === 'Enter' && onCardClick(card.id)}
          role={showMap && card.coords ? 'button' : undefined}
          tabindex={showMap && card.coords ? 0 : undefined}
        >
          <h2 class="place-card__title">{card.title}</h2>
          {#if card.city}
            <div class="place-card__city">{card.cityLabel}</div>
          {/if}
          {#if card.photosHtml}
            <div class="place-card__photos">{@html card.photosHtml}</div>
          {/if}
          <div class="field-list-wrap">{@html card.fieldsHtml}</div>
          {#if card.bodyHtml}
            <div class="place-card__body">{@html card.bodyHtml}</div>
          {/if}
          {#if showMap && card.coords && !isDesktop}
            <button
              type="button"
              class="place-card__map-btn"
              onclick={(e) => openMapModal(card.id, e)}
            >
              Посмотреть на карте
            </button>
          {/if}
        </article>
      {/each}
    </div>
  </div>

  {#if showMap && isDesktop && filteredPlaces.length > 0}
    <aside class="map-rail" aria-label="Карта">
      <MapView
        bind:this={mapRef}
        places={filteredPlaces}
        {mapConfig}
        {leafletBase}
        bind:focusedId
        {highlightedId}
        variant="sidebar"
      />
    </aside>
  {/if}
</div>

{#if showMap && !isDesktop}
  <MapModal
    open={mapModalOpen}
    placeId={mapModalPlaceId}
    placeTitle={mapModalTitle}
    places={filteredPlaces}
    {mapConfig}
    {leafletBase}
    onClose={closeMapModal}
  />
{/if}
