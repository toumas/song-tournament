<script>
  import { afterUpdate } from "svelte";
  import { writable } from "svelte/store";

  import Api from "./API.js";

  export let ids;

  const audioFeaturesObject = {
    danceability: 0,
    energy: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 0,
    instrumentalness: 0,
    liveness: 0,
    valence: 0,
    tempo: 0,
    duration_ms: 0,
    time_signature: 0,
  };

  let page = writable(0);
  let promises = writable([]);
  let promise = writable(Promise.all($promises));
  let allAudioFeatures = [];

  let averageTrack;

  function getDivider(i, arr) {
    return (i === arr.length - 1 && arr.length) || 1;
  }

  $: {
    promise.set(Promise.all($promises));
  }

  $: {
    if ($promises.length > 0) {
      $promise.then(async (json) => {
        const data = await json;

        averageTrack = data
          .reduce((acc, cur) => {
            return [...acc, ...cur.audio_features];
          }, [])
          .reduce((acc, cur, i, arr) => {
            return {
              danceability:
                (acc.danceability + cur.danceability) / getDivider(i, arr),
              energy: (acc.energy + cur.energy) / getDivider(i, arr),
              loudness: (acc.loudness + cur.loudness) / getDivider(i, arr),
              mode: (acc.mode + cur.mode) / getDivider(i, arr),
              speechiness:
                (acc.speechiness + cur.speechiness) / getDivider(i, arr),
              acousticness:
                (acc.acousticness + cur.acousticness) / getDivider(i, arr),
              instrumentalness:
                (acc.instrumentalness + cur.instrumentalness) /
                getDivider(i, arr),
              liveness: (acc.liveness + cur.liveness) / getDivider(i, arr),
              valence: (acc.valence + cur.valence) / getDivider(i, arr),
              tempo: (acc.tempo + cur.tempo) / getDivider(i, arr),
              duration_ms:
                (acc.duration_ms + cur.duration_ms) / getDivider(i, arr),
              time_signature:
                (acc.time_signature + cur.time_signature) / getDivider(i, arr),
            };
          }, audioFeaturesObject);
      });
    }
  }

  const fetchedIds = new Set();
  afterUpdate(() => {
    if (ids.length > 0) {
      const idsToBeFetched = ids.filter((id) => !fetchedIds.has(id));
      if (idsToBeFetched.length > 0) {
        promises.set([
          ...$promises,
          (async () => {
            const json = await Api.fetchAudioFeatures(idsToBeFetched);
            const data = await json;
            return data;
          })(),
        ]);

        ids.forEach((id) => {
          fetchedIds.add(id);
        });
      }
    }
  });
</script>

<h1>AudioFeatures</h1>
{#if $promises.length > 0}
  {#await $promise}
    <p>Loading audio features...</p>
  {:then}
    <pre>{JSON.stringify(averageTrack, null, 2)}</pre>
  {/await}
{/if}
