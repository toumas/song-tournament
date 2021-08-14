<script>
  export let track;
  export let id;

  import Api from "./API.js";
  import ArtistSong from "./ArtistSong.svelte";
  import Audio from "./Audio.svelte";
  import Anchor from "./Anchor.svelte";
  import Stack from "./Stack.svelte";
  import { getArtistSong } from "./utils.js";
</script>

<Stack spacing="xxs">
  <label for={id}>
    <Stack spacing="xs">
      <ArtistSong {track} />
      <img
        alt={`ALbum art for ${track.name}`}
        src={track.album.images[0].url}
      />
    </Stack>
  </label>
  {#if track.preview_url === null}
    {#await Api.searchForATrack(track.artists[0].name, track.name)}
      <p>Searching for previews...</p>
    {:then { tracks: { items } }}
      {#if items.length === 0}
        <p>Literally could not find any songs ¯\_(ツ)_/¯</p>
      {:else if items.length > 0}
        {#if items.some(({ preview_url }) => preview_url !== null) && items.some((trackFromSearch) => getArtistSong(trackFromSearch).toLowerCase() === getArtistSong(track).toLowerCase())}
          <p>
            Heads-up: Original preview isn't available. Here are some
            alternatives. These may or may not be the correct song.
          </p>
          {#each items
            .filter((trackFromSearch) => getArtistSong(trackFromSearch).toLowerCase() === getArtistSong(track).toLowerCase())
            .slice(0, 3) as trackFromSearch (trackFromSearch.id)}
            {#if trackFromSearch.preview_url !== null}
              <Audio track={trackFromSearch} />
            {/if}
          {/each}
        {:else}
          <p>I couldn't find any previewable songs :/</p>
        {/if}
      {/if}
    {/await}
  {:else}
    <Audio {track} />
  {/if}
  <p>
    <Anchor props={{ href: track.uri }}>Listen to the song on Spotify</Anchor>
  </p>
</Stack>

<style>
</style>
