<script>
  import Api from "./API.js";
  import {
    playlists,
    tournamentMode,
    tournamentModes,
  } from "./stores.js";
  import Stack from "./Stack.svelte";
  import Anchor from "./Anchor.svelte";

  let localTournamentMode = tournamentModes.singleElimination;

  $: {
    tournamentMode.set(localTournamentMode);
  }

  async function fetchNextPlaylists(nextUrl) {
    return Api.fetchUsersPlaylists(nextUrl).then(async (json) => {
      const data = await json;
      playlists.set($playlists.concat(data.items));
      if (typeof data.next === "string") {
        await fetchNextPlaylists(data.next);
      }
    });
  }

  let promise =
    $playlists.length === 0
      ? fetchNextPlaylists()
      : new Promise((resolve) => resolve());
</script>

<Stack spacing="m">
  {#await promise}
    <p>Loading playlists...</p>
  {:then}
    <p class="text-lg">
      Here be your playlists. Click one of them and let the batte begin!
    </p>
    <Stack spacing="xxs">
      <p>Tournament mode</p>
      <div>
        <input
          type="radio"
          id={tournamentModes.singleElimination}
          name="tournamentMode"
          value={tournamentModes.singleElimination}
          bind:group={localTournamentMode}
        />
        <label for={tournamentModes.singleElimination}>Single-elimination</label
        >
      </div>
      <div>
        <input
          type="radio"
          id={tournamentModes.doubleElimination}
          name="tournamentMode"
          value={tournamentModes.doubleElimination}
          bind:group={localTournamentMode}
        />
        <label for={tournamentModes.doubleElimination}>Double-elimination</label
        >
      </div>
    </Stack>
    <ul>
      <Stack spacing="xxs">
        {#each $playlists as pl}
          <li>
            <Anchor props={{ href: `#/playlist/${pl.name}?id=${pl.id}` }}>
              {pl.name}
            </Anchor>
          </li>
        {/each}
      </Stack>
    </ul>
  {/await}
</Stack>
