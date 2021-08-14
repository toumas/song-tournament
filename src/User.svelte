<script>
  import { writable } from "svelte/store";

  import Api from "./API.js";
  import { access_token, user } from "./stores.js";
  import Playlists from "./Playlists.svelte";

  async function fetchUser() {
    return Api.fetchUser().then(async (json) => {
      const data = await json;
      user.set(data);
    });
  }

  let promise =
    typeof $user === "undefined"
      ? fetchUser()
      : new Promise((resolve) => resolve());
</script>

{#await promise}
  <p>Loading user...</p>
{:then}
  {#if $user?.id}
    <Playlists />
  {/if}
{/await}
