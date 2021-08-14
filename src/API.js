import { get } from "svelte/store";
import { replace } from "svelte-spa-router";
import { access_token, user } from "./stores";

class API {
  async makeRequest(request) {
    try {
      const res = await request();
      if (res.status === 401) {
        access_token.set(undefined);
        window.localStorage.removeItem("spotifyAccessToken");
        replace("/");
      } else {
        return res.json();
      }
    } catch (error) {
      access_token.set(undefined);
      window.localStorage.removeItem("spotifyAccessToken");
      replace("/");
    }
  }

  async fetchUser() {
    return this.makeRequest(async () =>
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${get(access_token)}` }
      })
    );
  }

  async fetchUsersPlaylists(nextUrl) {
    return this.makeRequest(async () =>
      fetch(
        nextUrl ? nextUrl : `https://api.spotify.com/v1/me/playlists?limit=50`,
        {
          headers: { Authorization: `Bearer ${get(access_token)}` }
        }
      )
    );
  }

  async fetchFirstTracks(id) {
    return this.makeRequest(async () =>
      fetch(
        `https://api.spotify.com/v1/playlists/${id}/tracks?fields=total,items(track(id, preview_url, uri, artists(id, name), album(images), name))`,
        {
          headers: { Authorization: `Bearer ${get(access_token)}` }
        }
      )
    );
  }

  fetchNextTracks(id, offset) {
    return this.makeRequest(async () =>
      fetch(
        `https://api.spotify.com/v1/playlists/${id}/tracks?fields=total,items(track(id, preview_url, uri, artists(id, name), album(images), name))&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${get(access_token)}` }
        }
      )
    );
  }

  async fetchAudioFeatures(ids) {
    return this.makeRequest(async () =>
      fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
        headers: { Authorization: `Bearer ${get(access_token)}` }
      })
    );
  }

  async searchForATrack(artist, title) {
    return this.makeRequest(async () =>
      fetch(
        `https://api.spotify.com/v1/search?q=${artist} ${title}&type=track`,
        {
          headers: { Authorization: `Bearer ${get(access_token)}` }
        }
      )
    );
  }

  async createPlaylistFromStandings(playlistName) {
    return this.makeRequest(async () =>
      fetch(`https://api.spotify.com/v1/users/${get(user).id}/playlists`, {
        method: "post",
        headers: { Authorization: `Bearer ${get(access_token)}` },
        body: JSON.stringify({
          name: `Spotify Tournament - ${playlistName}`,
          description: `Generated from Spotify Tournament`,
          public: false
        })
      })
    );
  }

  async functionAddSongsToPlaylist(playlistId, uris) {
    return this.makeRequest(async () =>
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "post",
        headers: { Authorization: `Bearer ${get(access_token)}` },
        body: JSON.stringify({ uris })
      })
    );
  }
}

const ApiWrapper = new API();

export default ApiWrapper;
