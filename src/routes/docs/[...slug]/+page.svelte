<script lang="ts">
 import Code from '$lib/components/Code.svelte';
 import Prose from '$lib/components/Prose.svelte';
 import Inline from '$lib/components/Inline.svelte';
 import type { Doc } from '$lib/docs';
 let { data }: {data: {doc:Doc; previous?:Doc; next?:Doc}} = $props();
 function codeLabel(code: string) {
  if (code.startsWith('// In the docs array')) return 'TypeScript';
  if (/^(cmake|ctest|git clone|ocean |# Shell)/.test(code)) return 'Terminal';
  if (code.startsWith('module ')) return 'ocean.mod';
  return 'Ocean';
 }
</script>

<svelte:head>
 <title>{data.doc.title} — Ocean documentation</title>
 <meta name="description" content={data.doc.description}/>
</svelte:head>

<div class="doc-layout">
 <main id="main" class="doc-article">
  <div class="doc-breadcrumb"><a href="/docs/">Docs</a><span>/</span>{data.doc.group}</div>
  <h1>{data.doc.title}</h1>
  <p class="doc-lead">{data.doc.description}</p>
  <div class="article-meta">
   <span class="status-dot"></span> Ocean 0.1 <span>·</span>
   {Math.max(2, Math.ceil(data.doc.sections.map(s=>s.text+' '+(s.after ?? '')).join(' ').split(/\s+/).length / 200))} min read
  </div>
  {#each data.doc.sections as section}
   <section id={'section-'+section.id}>
    <h2><a href={'#section-'+section.id}>{section.title}<span class="anchor-mark">#</span></a></h2>
    <Prose text={section.text}/>
    {#if section.table}
     <div class="reference-table">
      <table>
       <caption class="sr-only">{section.title} reference</caption>
       <thead><tr>{#each section.table.headers as heading}<th scope="col">{heading}</th>{/each}</tr></thead>
       <tbody>{#each section.table.rows as row}<tr>{#each row as cell}<td><Inline text={cell}/></td>{/each}</tr>{/each}</tbody>
      </table>
     </div>
    {/if}
    {#if section.code}<Code code={section.code} label={codeLabel(section.code)}/>{/if}
    {#if section.after}<div class="example-explanation"><Prose text={section.after}/></div>{/if}
    {#if section.links}<div class="section-links">{#each section.links as link}<p><a href={link.href} target={/^https?:\/\//i.test(link.href) ? '_blank' : undefined} rel={/^https?:\/\//i.test(link.href) ? 'noopener noreferrer' : undefined}>{link.label}{#if /^https?:\/\//i.test(link.href)}<span class="sr-only"> (opens in a new tab)</span>{/if}</a></p>{/each}</div>{/if}
    {#if section.note}<aside class="callout"><span>↳</span><div><Prose text={section.note}/></div></aside>{/if}
   </section>
  {/each}
  <div class="doc-end-note">This page documents the current Ocean compiler and standard library.</div>
  <nav class="doc-pagination" aria-label="Previous and next pages">
   {#if data.previous}
    <a href={'/docs/'+data.previous.slug+'/'}><small>← Previous</small><strong>{data.previous.title}</strong></a>
   {:else}
    <a href="/docs/"><small>← Back to</small><strong>Documentation</strong></a>
   {/if}
   {#if data.next}<a href={'/docs/'+data.next.slug+'/'}><small>Next →</small><strong>{data.next.title}</strong></a>{/if}
  </nav>
 </main>
 <aside class="on-this-page">
  <h2>ON THIS PAGE</h2>
  {#each data.doc.sections as section}<a href={'#section-'+section.id}>{section.title}</a>{/each}
  <div class="toc-bottom"><a href="/docs/">Documentation index →</a></div>
 </aside>
</div>

<style>
 .section-links { margin-top: 18px; font-size: 14px; }
 .section-links p + p { margin-top: 10px; }
 .section-links a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
</style>
