<script>
  import { writable } from "svelte/store";
  import { querystring } from "svelte-spa-router";

  import Api from "./API.js";
  import Tournament from "./Tournament.svelte";
  import Stack from "./Stack.svelte";

  export let params;

  const queryParams = new URLSearchParams($querystring);

  const promises = writable([]);
  const allTracks = writable([]);
  let activeId = writable();
  let activePreviewUrlFromSearch = writable();

  let allIds = writable([]);

  $: {
    allIds.set([...$allTracks.map((item) => item.track.id)]);
  }

  let promise = Api.fetchFirstTracks(queryParams.get("id"));

  promise.then(async (json) => {
    const data = await json;
    allTracks.set([...$allTracks, ...data?.items]);

    for (let offset = 100; offset <= data.total; offset = offset + 100) {
      promises.set([
        ...$promises,
        (async () => {
          const data = await Api.fetchNextTracks(queryParams.get("id"), offset);
          allTracks.set([...$allTracks, ...data.items]);
        })(),
      ]);
    }
  });

  async function handleClick(id, artist, title, preview_url) {
    console.log(id);

    activeId.set(id);
    if (preview_url === null) {
      const json = await Api.searchForATrack(artist, title);
      const data = await json;
      console.log(data);
      activePreviewUrlFromSearch.set(data.tracks.items[0].preview_url);
    }
  }
</script>

<Stack spacing="s">
  <h1 class="text-3xl">{params.title}</h1>
  {#await promise}
    <p>Loading tracks...</p>
  {:then}
    <!--<AudioFeatures ids={$allIds} />-->
    <Tournament tracks={$allTracks} playlistName={params.title} />
    <!--
        <ul>
        {#each $allTracks as item}
          <li>
            <button
              on:click={() => {
                handleClick(
                  item.track.id,
                  item.track.artists[0].name,
                  item.track.name,
                  item.track.preview_url
                )
              }}
              href={item.track.preview_url}
            >
                {#each item.track.artists as artist}
                  {artist.name}{#if item.track.artists.length > 1},{' '}{/if}
                {/each}
                - 
                {item.track.name}
                {#if $activeId === item.track.id}
                <p>{item.track.preview_url}</p>
                  <iframe title="Spotify track preview" src={item.track.preview_url ?? $activePreviewUrlFromSearch} />
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      -->
  {/await}
</Stack>
