<script lang="ts">
  import { onMount } from 'svelte';
  import MapView from './MapView.svelte';
  import MapModal from './MapModal.svelte';
  import { categoryLabels, cityLabels, NO_CITY, type MapPlace, type PlaceCardData } from '../lib/poi';
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
    showMap: boolean;
  }

  let { cards, places, mapConfig, leafletBase, showMap }: Props = $props();

  let selectedCity = $state<string>('all');
  let selectedCategory = $state<string>('all');
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
    [...new Set(cards.map((c) => c.cityKey))].sort((a, b) => {
      if (a === NO_CITY) return 1;
      if (b === NO_CITY) return -1;
      return (cityLabels[a] ?? a).localeCompare(cityLabels[b] ?? b, 'ru');
    }),
  );

  const categories = $derived(
    [...new Set(cards.map((c) => c.category))].sort((a, b) =>
      categoryLabels[a].localeCompare(categoryLabels[b], 'ru'),
    ) as Category[],
  );

  const filteredCards = $derived(
    cards.filter((c) => {
      if (selectedCity !== 'all' && c.cityKey !== selectedCity) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      return true;
    }),
  );

  const filteredPlaces = $derived(
    places.filter((p) => filteredCards.some((c) => c.id === p.id)),
  );

  const mapModalTitle = $derived(
    cards.find((c) => c.id === mapModalPlaceId)?.title ?? 'На карте',
  );

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

<div class="city-filter" role="group" aria-label="Фильтр по городу">
  <button type="button" class:active={selectedCity === 'all'} onclick={() => (selectedCity = 'all')}>
    {cityLabels.all}
  </button>
  {#each cities as city (city)}
    <button type="button" class:active={selectedCity === city} onclick={() => (selectedCity = city)}>
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
          <div class="place-card__city">
            {card.categoryLabel}
            {#if card.cityLabel}
              · {card.cityLabel}
            {/if}
          </div>
          {#if card.cover}
            <div class="place-card__photos">
              <figure class="place-card__cover">
                <img src={card.cover.src} alt={card.cover.alt} loading="lazy" decoding="async" />
              </figure>
            </div>
          {/if}
          <ul class="field-list">
            {#if card.openingHours}
              <li><span class="field-list__label">Часы:</span> {card.openingHours}</li>
            {/if}
            {#if card.priceLabel}
              <li><span class="field-list__label">Стоимость:</span> {card.priceLabel}</li>
            {/if}
            {#if card.address}
              <li><span class="field-list__label">Адрес:</span> {card.address}</li>
            {/if}
          </ul>
          {#if card.description}
            <div class="place-card__body">{card.description}</div>
          {/if}
          <a class="place-card__more" href={card.href} onclick={(e) => e.stopPropagation()}>Подробнее</a>
          {#if showMap && card.coords && !isDesktop}
            <button type="button" class="place-card__map-btn" onclick={(e) => openMapModal(card.id, e)}>
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
