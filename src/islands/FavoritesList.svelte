<script lang="ts">
  import { onMount } from 'svelte';
  import { favorites, initFavorites, toggleFavorite, type FavoriteCatalogItem } from '../lib/favorites.svelte';
  import VerifiedBadge from './VerifiedBadge.svelte';

  interface Props {
    items: FavoriteCatalogItem[];
  }

  let { items }: Props = $props();

  onMount(() => {
    initFavorites();
  });

  const saved = $derived(
    favorites.ids
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is FavoriteCatalogItem => Boolean(item)),
  );
</script>

<section class="favorites-block" aria-labelledby="favorites-heading">
  <h2 id="favorites-heading">Избранное</h2>
  {#if !favorites.ready}
    <p class="favorites-block__empty">Загрузка…</p>
  {:else if saved.length === 0}
    <p class="favorites-block__empty">
      Пока пусто. Нажмите сердечко на карточке места или отеля — они появятся здесь.
    </p>
  {:else}
    <ul class="favorites-block__list">
      {#each saved as item (item.id)}
        <li class="favorites-block__item">
          <div>
            <a href={item.href} class="favorites-block__title">
              {item.title}
              {#if item.verified}
                <VerifiedBadge size={16} />
              {/if}
            </a>
            <div class="favorites-block__meta">{item.categoryLabel} · {item.cityLabel}</div>
          </div>
          <button
            type="button"
            class="favorites-block__remove"
            onclick={() => toggleFavorite(item.id)}
          >
            Убрать
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>
