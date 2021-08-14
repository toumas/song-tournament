<script>
  export let track;

  import { afterUpdate } from "svelte";

  import { playingTrack } from "./stores.js";

  let audioElement;

  afterUpdate(() => {
    if (track.id !== $playingTrack) {
      audioElement.pause();
    }
  });

  function handleOnPlay() {
    playingTrack.set(track.id);
  }
</script>

<audio
  controls
  src={track.preview_url}
  bind:this={audioElement}
  on:play={handleOnPlay}
  class="w-full"
>
  Your browser does not support the <code>audio</code> element.
</audio>
