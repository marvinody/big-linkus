<script>
  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  let name = "";
  let counter = 0;
  let exists = false;
  let repoEmails = [];
  // boolean true if it exists
  $: loggedIn = !!$session.tokens.google;
  $: loading = counter !== 0;
  $: notBlank = name !== "";
  $: gucci = !loading && exists && notBlank;
  $: notGucci = !loading && !exists && notBlank;
</script>

<style>
  h1 {
    text-align: center;
  }
</style>

<svelte:head>
  <title>Git Analysis</title>
</svelte:head>

<h1>Git Analysis</h1>

<div class="container">
  <div>
    {#if loggedIn}
      <h1>Logged In</h1>
    {:else}
      <a href="/auth/github">Sign in with Github</a>
    {/if}
  </div>
</div>
