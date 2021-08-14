import { writable } from "svelte/store";

export const access_token = writable(undefined);
export const user = writable(undefined);
export const playlists = writable([]);
export const playingTrack = writable();

export const tournamentModes = {
  singleElimination: "single-elimination",
  doubleElimination: "double-elimination"
};

export const tournamentMode = writable(tournamentModes.singleElimination);
