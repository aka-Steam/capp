<script lang="ts">
  interface Props {
    size?: number;
  }

  let { size = 18 }: Props = $props();
</script>

<span class="verified-badge" title="Информация проверена" aria-label="Информация проверена">
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#1d9bf0" />
    <path
      d="M7.2 12.4 10.1 15.3 16.8 8.6"
      fill="none"
      stroke="#fff"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</span>
