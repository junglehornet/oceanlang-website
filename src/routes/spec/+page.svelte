<script lang="ts">
 import type { PageData } from './$types';
 let { data }: { data: PageData } = $props();
</script>

<svelte:head>
 <title>Language Specification — Ocean</title>
 <meta name="description" content="The Ocean language specification: lexical structure, syntax, types, expressions, statements, and program execution as implemented by ocean-c."/>
</svelte:head>

<div class="doc-layout spec-layout">
 <main id="main" class="doc-article spec-article">
  <div class="doc-breadcrumb"><a href="/docs/">Docs</a><span>/</span>Reference</div>
  <h1>{data.title}</h1>
  <div class="article-meta">
   <span class="status-dot"></span> Ocean 0.1 <span>·</span> {data.toc.length} sections <span>·</span>
   <a href="/SPEC.md">View as Markdown ↗</a>
  </div>

  <nav class="spec-toc" aria-labelledby="spec-toc-heading">
   <h2 id="spec-toc-heading">CONTENTS</h2>
   <ol>
    {#each data.toc as section}
     <li>
      <a href={'#' + section.id}>{section.title}</a>
      {#if section.children.length}
       <ol>{#each section.children as child}<li><a href={'#' + child.id}>{child.title}</a>{#if child.children.length}<ol>{#each child.children as grandchild}<li><a href={'#' + grandchild.id}>{grandchild.title}</a></li>{/each}</ol>{/if}</li>{/each}</ol>
      {/if}
     </li>
    {/each}
   </ol>
  </nav>

  <div class="spec-body">{@html data.html}</div>
 </main>
</div>

<style>
 .spec-layout { grid-template-columns: minmax(0, 1fr); }
 .spec-article { max-width: 860px; }
 .article-meta a { color: var(--accent); }

 .spec-toc { border: 1px solid var(--line); border-radius: 7px; background: var(--raised); padding: 24px 28px; margin-bottom: 45px; }
 .spec-toc h2 { font: 9px 'IBM Plex Mono', monospace; color: var(--muted); letter-spacing: 1.2px; margin-bottom: 18px; }
 .spec-toc > ol { list-style: none; columns: 2 300px; column-gap: 36px; }
 .spec-toc > ol > li { break-inside: avoid; margin-bottom: 14px; }
 .spec-toc > ol > li > a { font-size: 13px; font-weight: 500; color: var(--text); }
 .spec-toc ol ol { list-style: none; margin: 6px 0 0 12px; padding-left: 10px; border-left: 1px solid var(--line); }
 .spec-toc ol ol li { margin: 3px 0; }
 .spec-toc ol ol a { font-size: 12px; color: var(--muted); }
 .spec-toc ol ol ol { margin: 2px 0 2px 4px; }
 .spec-toc ol ol ol a { font-size: 11px; }
 .spec-toc a:hover { color: var(--accent); }

 .spec-body :global(h2), .spec-body :global(h3), .spec-body :global(h4) { scroll-margin-top: 120px; font-weight: 500; }
 .spec-body :global(h2) { font-size: 25px; letter-spacing: -.6px; margin: 55px 0 18px; padding-top: 30px; border-top: 1px solid var(--line); }
 .spec-body :global(h3) { font-size: 19px; letter-spacing: -.4px; margin: 38px 0 14px; }
 .spec-body :global(h4) { font-size: 17px; letter-spacing: -.2px; margin: 32px 0 12px; }
 .spec-body :global(:is(h2, h3, h4) a) { display: inline-flex; gap: 10px; align-items: center; }
 .spec-body :global(:is(h2, h3, h4):hover .anchor-mark) { opacity: 1; }
 .spec-body :global(p), .spec-body :global(li) { font-size: 15px; line-height: 1.85; }
 .spec-body :global(p) { margin-bottom: 16px; }
 .spec-body :global(ul), .spec-body :global(ol) { margin: 0 0 18px 22px; }
 .spec-body :global(li) { margin-bottom: 7px; }
 .spec-body :global(li > ul), .spec-body :global(li > ol) { margin-top: 7px; margin-bottom: 0; }
 .spec-body :global(p a), .spec-body :global(li a) { color: var(--accent); }
 .spec-body :global(:is(p, li, td) code) { font-family: 'IBM Plex Mono', monospace; font-size: .84em; background: var(--raised); border: 1px solid var(--line); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
 .spec-body :global(td code) { border: 0; background: transparent; padding: 0; color: var(--accent); }
 .spec-body :global(.reference-table td:first-child) { width: auto; min-width: 0; }
 .spec-body :global(.code-block) { margin: 20px 0 24px; }
 .spec-body :global(hr) { border: 0; border-top: 1px solid var(--line); margin: 40px 0; }
 .spec-body :global(blockquote) { border-left: 2px solid var(--accent); background: var(--raised); padding: 14px 18px; margin: 20px 0; border-radius: 0 5px 5px 0; }
 .spec-body :global(strong) { font-weight: 600; }

 @media (max-width: 760px) {
  .spec-toc { padding: 20px; }
  .spec-body :global(h2) { font-size: 22px; }
  .spec-body :global(p), .spec-body :global(li) { font-size: 14px; }
 }
</style>
