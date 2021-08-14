<script>
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import Playlist from "./Playlist.svelte";

  import { access_token } from "./stores.js";
  import Background from "./Background.svelte";

  const accessTokenFromLocalStorage =
    window.localStorage.getItem("spotifyAccessToken");

  if (typeof accessTokenFromLocalStorage === "string") {
    access_token.set(accessTokenFromLocalStorage);
  }

  if (typeof $access_token === "undefined") {
    access_token.set(
      window.location.hash?.split("#access_token=")[1]?.split("&")[0]
    );
  }

  $access_token: {
    if (typeof $access_token === "string") {
      window.localStorage.setItem("spotifyAccessToken", $access_token);
    }
  }

  const routes = {
    "/": Home,
    "/playlist/:title": Playlist,
    "/*": Home,
  };
</script>

<Background />
<main class="p-4">
  <Router {routes} />
</main>

<style>
</style>
