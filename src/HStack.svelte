<script>
  export let spacing = "m";
  export let alignX = "left";
</script>

<hstack {spacing} align-x={alignX}>
  <slot />
</hstack>
