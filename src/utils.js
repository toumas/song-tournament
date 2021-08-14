export function getArtistSong(track) {
  const artists = track.artists.map(({ name }) => name);
  return `${artists.join(", ")} - ${track.name}`;
}
