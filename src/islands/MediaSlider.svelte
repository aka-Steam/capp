<script lang="ts">
  import type { NormalizedMedia } from '../lib/poi';

  interface Props {
    items: NormalizedMedia[];
  }

  let { items }: Props = $props();

  let index = $state(0);

  const current = $derived(items[index]);
  const hasMany = $derived(items.length > 1);

  function go(next: number) {
    if (items.length === 0) return;
    index = (next + items.length) % items.length;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!hasMany) return;
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if items.length > 0 && current}
  <div class="media-slider" aria-roledescription="carousel" aria-label="Медиа точки">
    <div class="media-slider__stage">
      {#key current.id}
        {#if current.type === 'video'}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            class="media-slider__media"
            src={current.src}
            poster={current.preview}
            controls
            playsinline
            preload="metadata"
          ></video>
        {:else}
          <img
            class="media-slider__media"
            src={current.src}
            alt={current.caption ?? ''}
            loading="lazy"
            decoding="async"
          />
        {/if}
      {/key}
      {#if hasMany}
        <button type="button" class="media-slider__nav media-slider__nav--prev" onclick={() => go(index - 1)} aria-label="Предыдущий слайд">
          ‹
        </button>
        <button type="button" class="media-slider__nav media-slider__nav--next" onclick={() => go(index + 1)} aria-label="Следующий слайд">
          ›
        </button>
      {/if}
    </div>

    {#if current.caption}
      <p class="media-slider__caption">{current.caption}</p>
    {/if}

    {#if hasMany}
      <div class="media-slider__thumbs" role="tablist" aria-label="Выбор слайда">
        {#each items as item, i (item.id)}
          <button
            type="button"
            class={['media-slider__thumb', index === i && 'media-slider__thumb--active']}
            onclick={() => go(i)}
            aria-label={item.caption ?? `Слайд ${i + 1}`}
            aria-selected={index === i}
            role="tab"
          >
            {#if item.type === 'video'}
              {#if item.preview}
                <img src={item.preview} alt="" />
              {:else}
                <span class="media-slider__thumb-fallback">▶</span>
              {/if}
              <span class="media-slider__play">▶</span>
            {:else}
              <img src={item.src} alt="" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .media-slider {
    margin: 0 0 1.25rem;
  }

  .media-slider__stage {
    position: relative;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
    min-height: 200px;
  }

  .media-slider__media {
    display: block;
    width: 100%;
    height: auto;
    max-height: 480px;
    object-fit: contain;
    object-position: center;
    background: var(--color-bg);
  }

  .media-slider__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 999px;
    background: rgba(26, 29, 33, 0.65);
    color: #fff;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
  }

  .media-slider__nav:hover {
    background: rgba(26, 29, 33, 0.85);
  }

  .media-slider__nav--prev {
    left: 0.5rem;
  }

  .media-slider__nav--next {
    right: 0.5rem;
  }

  .media-slider__caption {
    margin: 0.4rem 0 0;
    font-size: 0.85rem;
    color: var(--color-muted);
  }

  .media-slider__thumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.65rem;
  }

  .media-slider__thumb {
    position: relative;
    width: 64px;
    height: 48px;
    padding: 0;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    background: var(--color-bg);
    cursor: pointer;
  }

  .media-slider__thumb--active {
    border-color: var(--color-accent);
  }

  .media-slider__thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-slider__thumb-fallback,
  .media-slider__play {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 0.7rem;
    text-shadow: 0 0 4px #000;
  }

  .media-slider__thumb-fallback {
    background: #1a1d21;
  }
</style>
