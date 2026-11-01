<script lang="ts">
 import './layout.css';
 import { onMount, tick } from 'svelte';
 import { page } from '$app/state';
 import { docs } from '$lib/docs';
 import Logo from '$lib/components/Logo.svelte';
 let { children } = $props();
 let dark = $state(true);
 let searchOpen = $state(false);
 let query = $state('');
 let menuOpen = $state(false);
 let searchPanel = $state<HTMLDivElement>();
 $effect(() => {
  if (searchOpen) {
   const previous = document.activeElement as HTMLElement;
   tick().then(() => searchPanel?.querySelector('input')?.focus());
   const overflow = document.body.style.overflow;
   document.body.style.overflow = 'hidden';
   return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }
 });
 function trapFocus(event: KeyboardEvent) {
  if(event.key !== 'Tab') return;
  const elements = searchPanel!.querySelectorAll<HTMLElement>('input, button, a');
  const first = elements[0], last = elements[elements.length - 1];
  if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
 }
 const results = $derived(docs.filter(d => (d.title+' '+d.description+' '+d.sections.map(s=>s.title+' '+s.text).join(' ')).toLowerCase().includes(query.toLowerCase())));
 onMount(() => { dark = document.documentElement.dataset.theme !== 'light'; });
 function toggleTheme() { dark = !dark; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('ocean-theme', dark ? 'dark' : 'light'); } catch {} }
 function keyboard(e: KeyboardEvent) { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchOpen = !searchOpen; } if(e.key === 'Escape') { searchOpen = false; menuOpen = false; } }
</script>
<svelte:window onkeydown={keyboard}/>
<svelte:head><link rel="icon" type="image/svg+xml" href="/favicon.svg?v=waves"/><meta name="theme-color" content={dark ? '#0b1424' : '#f7f9fd'}/><meta name="description" content="Ocean is a native programming language with familiar syntax, explicit types, generics, and predictable value semantics. Explore the language and its documentation."/></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="Ocean home"><Logo/><span>ocean<span class="brand-dot">.</span></span></a><span class="version">0.1 <span> / in development</span></span><nav class:mobile-open={menuOpen} aria-label="Main navigation"><a class:active={page.url.pathname.startsWith('/docs')} href="/docs/" onclick={()=>menuOpen=false}>Documentation</a><a href="/#language" onclick={()=>menuOpen=false}>The language</a><a href="/docs/tooling/cli/" onclick={()=>menuOpen=false}>Tooling <span class="arrow">↗</span></a></nav><div class="header-actions"><button class="search-trigger" onclick={()=>searchOpen=true} aria-label="Search documentation"><span>⌕</span><span class="search-label">Search docs</span><kbd>⌘ K</kbd></button><button class="theme-toggle" onclick={toggleTheme} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? '☼' : '☾'}</button><button class="mobile-toggle" onclick={()=>menuOpen=!menuOpen} aria-label="Toggle menu" aria-expanded={menuOpen}>☰</button></div></div></header>
{@render children()}
<footer class="site-footer"><a class="brand" href="/"><Logo small/><span>ocean.</span></a><p>The Ocean programming language.</p><div><a href="/docs/">Documentation</a><a href="/docs/getting-started/">Get started ↗</a><a href="https://codeberg.org/junglehornet/ocean-c">Source on Codeberg ↗</a></div></footer>
{#if searchOpen}<div class="search-backdrop" role="presentation" onclick={(e)=>{if(e.target===e.currentTarget)searchOpen=false;}}><div bind:this={searchPanel} onkeydown={trapFocus} class="search-dialog" role="dialog" aria-modal="true" aria-label="Search documentation" tabindex="-1"><div class="search-input"><span>⌕</span><input aria-label="Search documentation" placeholder="Search the Ocean docs…" bind:value={query}/><button onclick={()=>searchOpen=false} aria-label="Close search">Esc</button></div><div class="search-results">{#if results.length===0}<p>No results. Try “arrays”, “install”, or “functions”.</p>{/if}{#each results as result}<a href={'/docs/'+result.slug+'/'} onclick={()=>searchOpen=false}><small>{result.group}</small><strong>{result.title}<span>↗</span></strong><p>{result.description}</p></a>{/each}</div><div class="search-bottom">Search the language guide, tooling, and standard library</div></div></div>{/if}
