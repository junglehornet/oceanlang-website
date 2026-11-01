<script lang="ts">
 import { page } from '$app/state';
 import { docs, groups } from '$lib/docs';
 let { children } = $props();
 let open = $state(false);
</script>
<div class="docs-shell"><aside class="docs-sidebar"><button class="docs-mobile-toggle" onclick={()=>open=!open} aria-expanded={open}>Browse documentation <span>{open ? '−' : '+'}</span></button><nav class:expanded={open} aria-label="Documentation"><a class="docs-overview" class:current={page.url.pathname==='/docs/'} href="/docs/" onclick={()=>open=false}>◈ &nbsp; Documentation</a>{#each groups as group}<div class="sidebar-group"><h2>{group}</h2>{#each docs.filter(d=>d.group===group) as doc}<a class:current={page.url.pathname==='/docs/'+doc.slug+'/'} aria-current={page.url.pathname==='/docs/'+doc.slug+'/'?'page':undefined} href={'/docs/'+doc.slug+'/'} onclick={()=>open=false}>{doc.title}</a>{/each}</div>{/each}<div class="sidebar-note"><span class="status-dot"></span> Ocean 0.1<p>Documenting the language<br/>as it works today.</p></div></nav></aside><div class="docs-body">{@render children()}</div></div>
