<script lang="ts">
  import { onMount } from 'svelte';
  import MapView, { type MapPlace } from './MapView.svelte';
  import MapModal from './MapModal.svelte';
  import type { HotelCardData } from '../lib/infoPage';

  interface MapConfig {
    tileUrl: string;
    attribution: string;
    defaultZoom: number;
    focusZoom: number;
  }

  interface Props {
    cards: HotelCardData[];
    places: MapPlace[];
    mapConfig: MapConfig;
    leafletBase: string;
    showMap: boolean;
  }

  let { cards, places, mapConfig, leafletBase, showMap }: Props = $props();

  let selectedCity = $state<string>('all');
  let nights = $state(1);
  type SortKey =
    | 'default'
    | 'avgAsc'
    | 'avgDesc'
    | 'singleAsc'
    | 'singleDesc'
    | 'doubleAsc'
    | 'doubleDesc';

  let sortBy = $state<SortKey>('default');
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

  const cityLabels: Record<string, string> = {
    beijing: 'Пекин',
    shanghai: 'Шанхай',
    pingyao: 'Пиньяо',
    all: 'Все города',
  };

  function priceSingleTotal(card: HotelCardData): number {
    const n = effectiveNights();
    if (!card.hasSingleRoom || card.priceSingle === undefined) return Number.POSITIVE_INFINITY;
    return card.priceSingle * n;
  }

  function priceDoubleTotal(card: HotelCardData): number {
    const n = effectiveNights();
    if (card.priceDouble === undefined) return Number.POSITIVE_INFINITY;
    return card.priceDouble * n;
  }

  /** Средняя стоимость номера за выбранное число ночей (по доступным типам). */
  function priceAverageTotal(card: HotelCardData): number {
    const n = effectiveNights();
    const perNight: number[] = [];
    if (card.hasSingleRoom && card.priceSingle !== undefined) perNight.push(card.priceSingle);
    if (card.priceDouble !== undefined) perNight.push(card.priceDouble);
    if (perNight.length === 0) return Number.POSITIVE_INFINITY;
    const avgPerNight = perNight.reduce((sum, p) => sum + p, 0) / perNight.length;
    return avgPerNight * n;
  }

  function compareCards(
    a: HotelCardData,
    b: HotelCardData,
    value: (c: HotelCardData) => number,
    direction: 'asc' | 'desc',
  ): number {
    const va = value(a);
    const vb = value(b);
    const diff = direction === 'asc' ? va - vb : vb - va;
    return diff || a.title.localeCompare(b.title, 'ru');
  }

  const filteredCards = $derived.by(() => {
    let list =
      selectedCity === 'all' ? [...cards] : cards.filter((c) => c.city === selectedCity);

    switch (sortBy) {
      case 'avgAsc':
        list = [...list].sort((a, b) => compareCards(a, b, priceAverageTotal, 'asc'));
        break;
      case 'avgDesc':
        list = [...list].sort((a, b) => compareCards(a, b, priceAverageTotal, 'desc'));
        break;
      case 'singleAsc':
        list = [...list].sort((a, b) => compareCards(a, b, priceSingleTotal, 'asc'));
        break;
      case 'singleDesc':
        list = [...list].sort((a, b) => compareCards(a, b, priceSingleTotal, 'desc'));
        break;
      case 'doubleAsc':
        list = [...list].sort((a, b) => compareCards(a, b, priceDoubleTotal, 'asc'));
        break;
      case 'doubleDesc':
        list = [...list].sort((a, b) => compareCards(a, b, priceDoubleTotal, 'desc'));
        break;
    }

    return list;
  });

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

  function nightLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'ночей';
    if (mod10 === 1) return 'ночь';
    if (mod10 >= 2 && mod10 <= 4) return 'ночи';
    return 'ночей';
  }

  function effectiveNights(): number {
    return Math.max(1, Math.round(nights) || 1);
  }

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

  function clampNights() {
    if (!Number.isFinite(nights) || nights < 1) nights = 1;
    nights = Math.min(365, Math.round(nights));
  }
</script>

<div class="hotels-toolbar">
  <label class="hotels-toolbar__nights">
    <span>Ночей</span>
    <input
      type="number"
      min="1"
      max="365"
      step="1"
      bind:value={nights}
      onchange={clampNights}
      onblur={clampNights}
      aria-label="Количество ночей"
    />
  </label>
  <label class="hotels-toolbar__sort">
    <span class="hotels-toolbar__sort-label">Сортировка</span>
    <select bind:value={sortBy} aria-label="Сортировка по стоимости">
      <option value="default">По умолчанию</option>
      <optgroup label="Средняя стоимость">
        <option value="avgAsc">↑ по возрастанию</option>
        <option value="avgDesc">↓ по убыванию</option>
      </optgroup>
      <optgroup label="Одноместный">
        <option value="singleAsc">↑ по возрастанию</option>
        <option value="singleDesc">↓ по убыванию</option>
      </optgroup>
      <optgroup label="Двухместный">
        <option value="doubleAsc">↑ по возрастанию</option>
        <option value="doubleDesc">↓ по убыванию</option>
      </optgroup>
    </select>
  </label>
</div>

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
        {@const n = effectiveNights()}
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
          <ul class="field-list hotel-prices">
            <li class:hotel-prices--unavailable={!card.hasSingleRoom}>
              <span class="field-list__label">Одноместный:</span>
              {#if !card.hasSingleRoom || card.priceSingle === undefined}
                нет
              {:else if n === 1}
                {card.priceSingle} {card.currency}
              {:else}
                {card.priceSingle * n} {card.currency}
                <span class="hotel-prices__detail">({card.priceSingle} × {n} {nightLabel(n)})</span>
              {/if}
            </li>
            <li>
              <span class="field-list__label">Двухместный:</span>
              {#if card.priceDouble === undefined}
                —
              {:else if n === 1}
                {card.priceDouble} {card.currency}
              {:else}
                {card.priceDouble * n} {card.currency}
                <span class="hotel-prices__detail">({card.priceDouble} × {n} {nightLabel(n)})</span>
              {/if}
            </li>
          </ul>
          {#if card.nearbyWalkable.length > 0}
            <div class="hotel-nearby">
              <div class="hotel-nearby__title">Пешком до 35 мин</div>
              <ul class="hotel-nearby__list">
                {#each card.nearbyWalkable as place}
                  <li>
                    <a href={place.href}>{place.title}</a>
                    <span class="hotel-nearby__time">~{place.walkMinutes} мин</span>
                  </li>
                {/each}
              </ul>
            </div>
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
