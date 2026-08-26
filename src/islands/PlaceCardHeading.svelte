<script lang="ts">
  import FavoriteButton from './FavoriteButton.svelte';
  import NewBadge from './NewBadge.svelte';
  import VerifiedBadge from './VerifiedBadge.svelte';

  interface Props {
    id: string;
    title: string;
    verified: boolean;
    isNew?: boolean;
  }

  let { id, title, verified, isNew = false }: Props = $props();
</script>

<div class="place-card__heading">
  <h2 class="place-card__title">
    {title}
    {#if isNew}
      <NewBadge />
    {/if}
    {#if verified}
      <VerifiedBadge />
    {/if}
  </h2>
  <FavoriteButton {id} />
</div>
