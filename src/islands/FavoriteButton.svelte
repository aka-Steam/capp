<script lang="ts">
  import { onMount } from 'svelte';
  import { favorites, initFavorites, isFavorite, toggleFavorite } from '../lib/favorites.svelte';

  interface Props {
    id: string;
  }

  let { id }: Props = $props();

  onMount(() => {
    initFavorites();
  });

  const on = $derived(favorites.ready && isFavorite(id));

  function onClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(id);
  }
</script>

<button
  type="button"
  class={['fav-btn', on && 'fav-btn--on']}
  onclick={onClick}
  aria-pressed={on}
  aria-label={on ? 'Убрать из избранного' : 'Добавить в избранное'}
  title={on ? 'Убрать из избранного' : 'В избранное'}
>
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path
      d="M12 20s-7-4.4-9.2-8.2C1.2 9 2.2 6 5 6c1.8 0 3.1 1 4 2.2C9.9 7 11.2 6 13 6c2.8 0 3.8 3 2.2 5.8C13 15.6 12 20 12 20z"
      fill={on ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
  </svg>
</button>
