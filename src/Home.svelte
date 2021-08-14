<script>
  import { access_token } from "./stores.js";
  import User from "./User.svelte";
  import Anchor from "./Anchor.svelte";
  import Stack from "./Stack.svelte";

  $access_token: {
    window.location.hash = "";
  }
</script>

{#if typeof $access_token === "undefined"}
  <Stack spacing="xs">
    <Stack spacing="m">
      <h1>Song Tournament</h1>
      <p>
        Put your favorite songs from your playlists head-to-head through epic
        battle in single or double-elimination format
      </p>
    </Stack>
    <Anchor
      props={{
        href: `https://accounts.spotify.com/authorize?client_id=7660a9f96b924b21a8edb7b64102e778&response_type=token&redirect_uri=${window.location.origin}/&scope=playlist-read-private playlist-modify-private`,
      }}
    >
      Log in with Spotify
    </Anchor>
  </Stack>
{:else}
  <User />
{/if}
