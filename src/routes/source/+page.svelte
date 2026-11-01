<script lang="ts">
 const repositories = [
  {
   name: 'Ocean compiler',
   repository: 'junglehornet/ocean-c',
   host: 'Codeberg',
   href: 'https://codeberg.org/junglehornet/ocean-c',
   description: 'The compiler, command-line tools, and language server. This repository also contains the compiler tests and implementation notes.'
  },
  {
   name: 'Standard library',
   repository: 'junglehornet/ocean-src',
   host: 'Codeberg',
   href: 'https://codeberg.org/junglehornet/ocean-src',
   description: 'The Ocean source for the standard library, including the io, os, and reflect packages.'
  },
  {
   name: 'Website and documentation',
   repository: 'junglehornet/oceanlang-website',
   host: 'GitHub',
   href: 'https://github.com/junglehornet/oceanlang-website',
   description: 'The SvelteKit source for this website, its documentation, and its shared styles and components.'
  }
 ];
</script>

<svelte:head>
 <title>Source code — Ocean</title>
 <meta name="description" content="Source repositories for the Ocean compiler, standard library, website, and documentation."/>
</svelte:head>

<main id="main" class="source-page">
 <h1>Source code</h1>
 <p class="introduction">Ocean’s compiler, standard library, and website are maintained in separate repositories. Choose a repository below to browse its source.</p>
 <div class="repositories">
  {#each repositories as repository}
   <a class="repository" href={repository.href} target="_blank" rel="noopener noreferrer">
    <div class="repository-heading"><h2>{repository.name}</h2><span aria-hidden="true">↗</span></div>
    <p>{repository.description}</p>
    <span class="repository-location">{repository.host} · {repository.repository}</span>
    <span class="sr-only"> (opens in a new tab)</span>
   </a>
  {/each}
 </div>
 <p class="installation">To build Ocean locally, follow the <a href="/docs/getting-started/">installation guide</a>.</p>
</main>

<style>
 .source-page { max-width: 960px; margin: 0 auto; padding: 72px 6% 88px; }
 h1 { font-size: 43px; font-weight: 500; letter-spacing: -1.8px; margin-bottom: 22px; }
 .introduction { color: var(--muted); font-size: 16px; max-width: 680px; }
 .repositories { display: grid; gap: 18px; margin-top: 36px; }
 .repository { display: block; padding: 27px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); }
 .repository:hover { background: var(--raised); }
 .repository-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; margin-bottom: 12px; }
 h2 { font-size: 20px; font-weight: 600; letter-spacing: -.4px; }
 .repository-heading > span { color: var(--accent); }
 .repository p { font-size: 14px; color: var(--muted); max-width: 630px; }
 .repository-location { display: block; margin-top: 18px; font-size: 11px; color: var(--accent); overflow-wrap: anywhere; }
 .installation { margin-top: 30px; color: var(--muted); font-size: 14px; }
 .installation a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
 @media (max-width: 760px) {
  .source-page { padding-top: 42px; padding-bottom: 55px; }
  h1 { font-size: 35px; }
  .introduction { font-size: 15px; }
  .repository { padding: 22px; }
  h2 { font-size: 18px; }
 }
</style>
