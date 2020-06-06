<script>
  import { stores, goto } from "@sapper/app";
  import axios from "axios";
  const { session } = stores();
  $: loggedIn = !!$session.username;
  $: username = $session.username;

  const logout = () => {
    axios.post("/auth/logout");
    session.set({ username: undefined });
  };
</script>

<style>
  h1,
  p {
    margin: 0 auto;
  }

  .center {
    text-align: center;
  }

  h1 {
    font-size: 2.8em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  p {
    margin: 1em auto;
    text-align: left;
  }
  ul {
    list-style-type: disclosure-closed;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>

<svelte:head>
  <title>Big Linkus</title>
</svelte:head>

<h1 class="center">Big Linkus</h1>

<p class="center">
  <strong>A notifier for Youtube Livestreams on Discord.</strong>
</p>

<p>
  Ever streamed on Youtube and want your friends (or random strangers) on
  Discord to know when you went live? Well now here's another service to let you
  accomplish just that!
</p>

<p />

<p>Pretty simple execution:</p>
<ul>
  <li>Click on signup below</li>
  <li>Select the Youtube account you want to "keep watch on"</li>
  <li>You're done!</li>
</ul>
<p>
  I require consent from the streamer so we don't track people who don't want to
  be tracked. This is a completely opt-in streaming setup. Once you do the above
  steps, a bot will periodically check your status and send out a message if it
  detects you as live.
</p>
{#if loggedIn}
  <h2>Welcome {username}</h2>
  <p>You are being monitored by this bot already!</p>
  <button class="center" on:click={logout}>Logout</button>
{:else}
  <a href="/auth/google">
    <button class="center">Sign Up with Google</button>
  </a>
{/if}
