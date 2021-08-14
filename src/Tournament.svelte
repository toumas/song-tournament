<script>
  export let tracks;
  export let playlistName;

  import { afterUpdate } from "svelte";
  import { writable } from "svelte/store";
  import TournamentOrganizer from "tournament-organizer";

  import Api from "./API.js";
  import { playingTrack, tournamentMode, tournamentModes } from "./stores.js";
  import { getArtistSong } from "./utils.js";
  import Opponent from "./Opponent.svelte";
  import Stack from "./Stack.svelte";
  import HStack from "./HStack.svelte";
  import Anchor from "./Anchor.svelte";

  const manager = new TournamentOrganizer.EventManager();

  let tourney;
  let activeMatch;
  let standings;
  let finished = false;
  let error;
  let saved = false;
  let tournamentPlaylist;
  const playersMap = new Map();

  let formElement;
  let opponent1Input;
  let opponent2Input;
  let winnerId;

  $: winnerName = tracks?.find(({ track }) => track.id === winnerId)?.track
    .name;

  $: {
    if (tracks.length > 0) {
      if (tracks.length < 4) {
        error =
          "Sorry buddy, but you need at least four songs in order for this to work!";
      } else {
        tourney = manager.createTournament(null, {
          name: "My Example Tournament",
          format: "elim",
          doubleElim: $tournamentMode === tournamentModes.doubleElimination,
          winValue: 1,
        });

        tracks.forEach(({ track }) => {
          tourney.addPlayer(getArtistSong(track), track.id);
          playersMap.set(track.id, track);
        });

        tourney.startEvent();
        activeMatch = tourney.activeMatches()[0];
        standings = tourney.standings(false);
      }
    }
  }

  let opponent1 = writable();
  let opponent2 = writable();

  $: {
    if (typeof tourney !== "undefined") {
      opponent1.set(playersMap.get(tourney.activeMatches()[0].playerOne.id));
      opponent2.set(playersMap.get(tourney.activeMatches()[0].playerTwo.id));
    }
  }

  function incrementActiveIndex() {
    activeIndex = activeIndex + 1;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(formElement);
    const winner = data.get("winner");
    let playerOneScore = winner === $opponent1.id ? 1 : 0;
    let playerTwoScore = winner === $opponent2.id ? 1 : 0;

    tourney.result(tourney.activeMatches()[0], playerOneScore, playerTwoScore);
    const activeMatches = tourney.activeMatches();
    if (activeMatches.length > 0) {
      activeMatch = activeMatches[0];
      opponent1.set(playersMap.get(activeMatches[0].playerOne.id));
      opponent2.set(playersMap.get(activeMatches[0].playerTwo.id));
    } else if (activeMatches.length === 0) {
      finished = true;
    }
    standings = tourney.standings(false);
    data.delete("winner");
    winnerId = undefined;
    formElement.reset();
    opponent1Input.blur();
    opponent2Input.blur();
  }

  async function createPlaylist() {
    const json = await Api.createPlaylistFromStandings(playlistName);
    const data = await json;
    tournamentPlaylist = data;
    const spotifyUrisToBeAdded = standings.map((player) => {
      return playersMap.get(player.id).uri;
    });
    while (spotifyUrisToBeAdded.length > 0) {
      Api.functionAddSongsToPlaylist(
        data.id,
        spotifyUrisToBeAdded.splice(0, 100)
      );
    }
    saved = true;
  }
</script>

<Stack spacing="xs">
  <Stack spacing="xl">
    <div>
      {#if error}
        <p>{error}</p>
      {:else if typeof $opponent1 !== "undefined"}
        {#if finished === false}
          <Stack spacing="xxs">
            <p>Tournament mode: {$tournamentMode}</p>
            <p>Round: {activeMatch.round} Match: {activeMatch.matchNumber}</p>
          </Stack>
          <form bind:this={formElement} on:submit={handleSubmit}>
            <Stack spacing="s">
              <input
                required
                id="opponent1"
                type="radio"
                name="winner"
                value={$opponent1.id}
                bind:group={winnerId}
                bind:this={opponent1Input}
              />
              <Opponent id="opponent1" track={$opponent1} />
              <p class="text-center text-3xl italic">vs</p>
              <div class="relative m-0">
                <input
                  id="opponent2"
                  type="radio"
                  name="winner"
                  value={$opponent2.id}
                  bind:group={winnerId}
                  bind:this={opponent2Input}
                  class="absolute"
                />
                <Opponent id="opponent2" track={$opponent2} />
              </div>
              <button
                type="submit"
                class="fixed bottom-0 left-0 text-xl text-white bg-yellow-700 w-screen p-3"
              >
                {#if typeof winnerId === "undefined"}
                  Select the winner
                {:else}
                  {winnerName} - Continue
                {/if}
              </button>
            </Stack>
          </form>
        {/if}
        <Stack spacing="xs">
          {#if finished === true}
            {#if saved === false}
              <HStack alignX="center">
                <button
                  on:click={createPlaylist}
                  class="w-full border-2 rounded-lg p-3 animate-pulse"
                >
                  Create a playlist from standings
                </button>
              </HStack>
            {:else}
              <Stack spacing="xs">
                <Anchor props={{ href: tournamentPlaylist.uri }}>
                  Listen to the tournament playlist on Spotify
                </Anchor>
              </Stack>
            {/if}
          {/if}
          <Stack spacing="xxs">
            <p class="text-xl">Standings</p>
            <table class="table-auto">
              <thead>
                <tr>
                  <th class="text-left">Title</th>
                  <th>Wins</th>
                  <th>Games</th>
                </tr>
              </thead>
              <tbody>
                {#each standings as player (player.id)}
                  <tr>
                    <td>{player.alias}</td>
                    <td>{player.gamePoints}</td>
                    <td>{player.games}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </Stack>
        </Stack>
        <ul />
      {/if}
    </div>
    <div />
  </Stack>
</Stack>

<style>
  input {
    z-index: -2;
  }
</style>
