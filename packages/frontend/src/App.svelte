<main>
  {#if state === 'loading'}
    <p>Loading</p>
  {:else if state === 'error'}
    <h1>Error</h1>
    <p>{error}</p>
  {:else}
    {#each listings as listing}
      <p>{JSON.stringify(listing)}</p>
    {/each}
  {/if}
</main>

<script>
  import { onMount } from 'svelte'
  import api from './lib/api'

  export let state = 'loading'
  export let error
  export let listings = []

  onMount(async () => {
    try {
      listings = (await api.get('/listings')).listings
      state = 'loaded'
    } catch (err) {
      state = 'error'
      error = err.message
      console.error(err)
    }
  })
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
