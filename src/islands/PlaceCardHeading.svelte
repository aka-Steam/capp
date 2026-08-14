<script lang="ts">
  import FavoriteButton from './FavoriteButton.svelte';
  import VerifiedBadge from './VerifiedBadge.svelte';

  interface Props {
    id: string;
    title: string;
    verified: boolean;
  }

  let { id, title, verified }: Props = $props();
</script>

<div class="place-card__heading">
  <h2 class="place-card__title">
    {title}
    {#if verified}
      <VerifiedBadge />
    {/if}
  </h2>
  <FavoriteButton {id} />
</div>
