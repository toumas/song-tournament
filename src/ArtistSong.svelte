<script>
  export let track;

  import { getArtistSong } from "./utils.js";
</script>

<span class="text-lg">
  {getArtistSong(track)}
</span>
