<script lang="ts">
 import Code from '$lib/components/Code.svelte';
 let selected = $state(0);
 let ripples = $state<{ id: number; x: number; y: number }[]>([]);
 let nextRippleId = 0;

 let heroBackground = $state<HTMLDivElement>();
 let glowPos = $state({ x: 0, y: 0, rx: 600, ry: 550 });
 let draggingHero = $state(false);
 let heroDetached = $state(false);
 let returningHero = $state(false);
 let dragStart = { x: 0, y: 0 };
 let returnFrame = 0;

 function getHeroHomeCenter() {
  if (!heroBackground) return { cx: 0, cy: 0, rx: 0, ry: 0 };
  const rect = heroBackground.getBoundingClientRect();
  const vw = window.innerWidth;
  const cx = rect.left + rect.width * 0.5 + Math.min(0.2 * vw, 288);
  const cy = rect.top + rect.height * 0.35;
  const rx = Math.min(0.65 * vw, 900);
  const ry = rect.height * 0.85;
  return { cx, cy, rx, ry };
 }

 function syncGlowRadii() {
  const { rx, ry } = getHeroHomeCenter();
  if (rx > 0 && ry > 0) {
   glowPos.rx = rx;
   glowPos.ry = ry;
  }
 }

 function isInsideHeroGrabRadius(clientX: number, clientY: number) {
  const { cx, cy, rx, ry } = getHeroHomeCenter();
  const grabRx = rx * 0.42;
  const grabRy = ry * 0.42;
  if (grabRx <= 0 || grabRy <= 0) return false;
  const dx = (clientX - cx) / grabRx;
  const dy = (clientY - cy) / grabRy;
  return dx * dx + dy * dy <= 1;
 }

 function returnHeroToHome() {
  if (returnFrame) cancelAnimationFrame(returnFrame);
  draggingHero = false;
  returningHero = true;

  const startX = glowPos.x;
  const startY = glowPos.y;
  const duration = 1100;
  const startTime = performance.now();

  function step(now: number) {
   const t = Math.min(1, (now - startTime) / duration);
   const ease = 1 - Math.pow(1 - t, 3);
   const { cx, cy, rx, ry } = getHeroHomeCenter();
   glowPos.x = startX + (cx - startX) * ease;
   glowPos.y = startY + (cy - startY) * ease;
   glowPos.rx = rx;
   glowPos.ry = ry;

   if (t < 1) {
    returnFrame = requestAnimationFrame(step);
   } else {
    returnFrame = 0;
    returningHero = false;
    heroDetached = false;
   }
  }

  returnFrame = requestAnimationFrame(step);
 }

 function onPointerMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return;

  if (draggingHero) {
   const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
   if (dist > 3) {
    if (returnFrame) {
     cancelAnimationFrame(returnFrame);
     returnFrame = 0;
    }
    returningHero = false;
    window.getSelection()?.removeAllRanges();
    syncGlowRadii();
    heroDetached = true;
    draggingHero = false;
   }
  }

  if (heroDetached && !returningHero) {
   glowPos.x = e.clientX;
   glowPos.y = e.clientY;
   syncGlowRadii();
  }
 }

 function onPointerDown(e: PointerEvent) {
  const id = nextRippleId++;
  ripples.push({ id, x: e.clientX, y: e.clientY });
  setTimeout(() => {
   ripples = ripples.filter((r) => r.id !== id);
  }, 750);

  if (e.button !== 0) return;
  const target = e.target as HTMLElement | null;
  if (target?.closest('a, button, input, pre, code')) return;

  if (heroDetached && !returningHero) {
   returnHeroToHome();
   return;
  }

  if (!heroDetached && isInsideHeroGrabRadius(e.clientX, e.clientY)) {
   e.preventDefault();
   window.getSelection()?.removeAllRanges();
   glowPos.x = e.clientX;
   glowPos.y = e.clientY;
   syncGlowRadii();
   draggingHero = true;
   dragStart = { x: e.clientX, y: e.clientY };
  }
 }

 function onPointerUp() {
  draggingHero = false;
 }

 const examples = [
  {
   title: 'Print a formatted message',
   file: 'hello.oc',
   code: 'package main;\n\nimport "io";\n\nfunc main() {\n    name := "Ocean";\n    io.Printfln("Hello, {}!", name);\n}',
   output: 'Hello, Ocean!',
   explanation: 'A small program, from source to console output.'
  },
  {
   title: 'Copy a dynamic array',
   file: 'values.oc',
   code: 'package main;\n\nimport "io";\n\nfunc main() {\n    original := int[]{1, 2, 3};\n    copy := original;\n    copy[0] = 42;\n\n    io.Println(original);\n    io.Println(copy);\n}',
   output: '[1 2 3]\n[42 2 3]',
   explanation: 'Change the copy, keep the original. Each array has its own data.'
  },
  {
   title: 'Use a generic struct',
   file: 'generics.oc',
   code: 'package main;\n\nimport "io";\n\nstruct Box<T> { value T; }\n\nfunc main() {\n    answer := Box<int>{42};\n    io.Println(answer.value);\n}',
   output: '42',
   explanation: 'Box<T> defines a family of types. Choosing Box<int> gives this value an integer field; choosing Box<string> would create a different type with a string field.'
  }
 ];
</script>

<svelte:window
 onpointermove={onPointerMove}
 onpointerdown={onPointerDown}
 onpointerup={onPointerUp}
 onpointercancel={onPointerUp}
/>

<svelte:head>
 <title>Ocean Programming Language</title>
</svelte:head>

<div class="cursor-dots-layer" aria-hidden="true">
 <div
  class="cursor-dots-glow"
  class:active={heroDetached}
  style="--mx: {glowPos.x}px; --my: {glowPos.y}px; --grx: {glowPos.rx}px; --gry: {glowPos.ry}px;"
 ></div>
 {#each ripples as ripple (ripple.id)}
  <div
   class="cursor-dots-ripple"
   style="--rx: {ripple.x}px; --ry: {ripple.y}px;"
  ></div>
 {/each}
</div>

<main id="main" class:dragging-hero={draggingHero}>
 <div class="hero-background" bind:this={heroBackground}>
  <div
   class="hero-art"
   class:detached={heroDetached}
   aria-hidden="true"
  ></div>
 <section class="hero">
  <div class="hero-content">
   <a class="eyebrow release-link" href="/docs/getting-started/">
    <span class="status-dot"></span> Ocean 0.1 · In development
   </a>
   <h1>The <em>Ocean</em><br/>programming<br/>language.</h1>
   <p class="hero-description">Ocean compiles to native code, catches type errors before your program runs, and automatically releases the memory owned by strings, arrays, and maps when their values leave scope.</p>
   <div class="hero-actions">
    <a class="button primary" href="/docs/getting-started/">Get started <span>→</span></a>
    <a class="button secondary" href="/docs/">Documentation</a>
   </div>
   <a class="hero-source" href="https://codeberg.org/junglehornet/ocean-c" target="_blank" rel="noopener noreferrer">View the compiler source ↗</a>
  </div>
  <div class="hero-code">
   <div class="editor-top"><span>hello.oc</span><span class="editor-language">Ocean</span></div>
   <div class="editor-code">
    <div class="line-numbers">1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8</div>
    <Code code={examples[0].code} label="hello.oc"/>
   </div>
   <div class="terminal">
    <div><span class="terminal-prompt">❯</span> ocean run .</div>
    <p>Hello, Ocean!</p>
   </div>
  </div>
 </section>
 </div>

 <section id="language" class="section language-section">
  <h2>Why Ocean?</h2>
  <div class="language-overview">
   <p>Ocean brings familiar syntax and built-in strings, arrays, and maps to a language that gives you direct control over memory. You can write everyday code without managing every allocation by hand, and reach for pointers when you need them.</p>
   <p>If you know Go, the packages, functions, and short variable declarations will feel familiar. The difference is in how data lives: Ocean cleans up owned strings, arrays, and maps when their values leave scope, without a garbage collector. Assign an array or map to another variable and its owned contents are copied, so changing the copy does not change the original.</p>
   <p>If you know C, you can still work directly with pointers and call C functions. Ocean adds generics and automatic cleanup for owned strings, arrays, and maps. Allocations made with new(T) still need an explicit free(pointer); copying a pointer shares its target rather than copying that object.</p>
   <a class="text-link" href="/docs/language/memory/">How memory works in Ocean →</a>
  </div>
  <div class="language-example">
   <Code code={'// Create a dynamic array of integers.\noriginal := int[]{1, 2, 3};\n\n// Assignment copies the array.\ncopy := original;\ncopy[0] = 42;\n\n// The original stays unchanged.\nio.Println(original); // [1 2 3]\nio.Println(copy);     // [42 2 3]'} />
  </div>
 </section>

 <div class="examples-background">
 <section class="example-section section">
  <div class="example-intro">
   <h2>A few examples</h2>
   <p>Take a look at the syntax, how arrays behave, and a simple generic type.</p>
   <div class="example-tabs" role="tablist" aria-label="Code examples">
    {#each examples as example, i}
     <button id={'example-tab-'+i} aria-controls="example-panel" role="tab" aria-selected={selected===i} class:selected={selected===i} onclick={()=>selected=i}>
      {example.title}<span>→</span>
     </button>
    {/each}
   </div>
   <a class="text-link" href="/docs/language/variables/">Explore the language guide →</a>
  </div>
  <div id="example-panel" class="example-panel" role="tabpanel" aria-labelledby={'example-tab-'+selected}>
   <Code code={examples[selected].code} label={examples[selected].file}/>
   <div class="example-output"><span>OUTPUT</span><pre>{examples[selected].output}</pre></div>
   <p>{examples[selected].explanation}</p>
  </div>
 </section>

 </div>

 <section class="section journey">
  <div class="section-heading"><div><h2>Documentation</h2></div></div>
  <div class="journey-grid">
   <a class="journey-main" href="/docs/getting-started/">
    <h3>Install Ocean</h3>
    <p>Build the compiler from source, install the standard library, and compile your first program.</p>
    <span class="text-link">Installation and first steps <span>→</span></span>
   </a>
   <div class="journey-links">
    <a href="/docs/language/variables/"><div><h3>Language guide</h3><p>Variables, functions, collections, types, and memory.</p></div><span>→</span></a>
    <a href="/docs/tooling/cli/"><div><h3>Compiler and packages</h3><p>Command-line usage, modules, and editor configuration.</p></div><span>→</span></a>
    <a href="/docs/library/io/"><div><h3>Standard library</h3><p>Reference documentation for io, os, and reflect.</p></div><span>→</span></a>
   </div>
  </div>
  <div class="development-note"><h3>Development status</h3><p>Ocean is young and still changing. Expect rough edges and a small standard library. Follow development or contribute on <a href="https://codeberg.org/junglehornet/ocean-c" target="_blank" rel="noopener noreferrer">Codeberg ↗</a>.</p></div>
 </section>
</main>

<style>
 @property --ripple-r {
  syntax: '<length>';
  initial-value: 0px;
  inherits: false;
 }
 #main {
  position: relative;
  z-index: 1;
 }
 #main.dragging-hero {
  -webkit-user-select: none;
  user-select: none;
  cursor: grabbing;
 }
 .hero-art.detached {
  opacity: 0;
 }
 .cursor-dots-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
 }
 .cursor-dots-glow,
 .cursor-dots-ripple {
  position: absolute;
  inset: 0;
  background-image:
   radial-gradient(circle, var(--accent) 0.8px, transparent 1px),
   radial-gradient(circle, var(--accent) 0.6px, transparent 0.9px);
  background-size: 6px 6px;
  background-position: 0 0, 3px 3px;
 }
 .cursor-dots-glow {
  opacity: 0;
  -webkit-mask-image:
   radial-gradient(
    ellipse var(--grx) var(--gry) at var(--mx) var(--my),
    black,
    transparent
   ),
   linear-gradient(
    180deg,
    transparent calc(var(--my) - var(--gry)),
    black calc(var(--my) - var(--gry) * 0.59),
    black calc(var(--my) + var(--gry) * 0.35),
    transparent calc(var(--my) + var(--gry) * 0.76)
   );
  mask-image:
   radial-gradient(
    ellipse var(--grx) var(--gry) at var(--mx) var(--my),
    black,
    transparent
   ),
   linear-gradient(
    180deg,
    transparent calc(var(--my) - var(--gry)),
    black calc(var(--my) - var(--gry) * 0.59),
    black calc(var(--my) + var(--gry) * 0.35),
    transparent calc(var(--my) + var(--gry) * 0.76)
   );
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
 }
 .cursor-dots-glow.active {
  opacity: 0.3;
 }
 .cursor-dots-ripple {
  --ripple-r: 0px;
  -webkit-mask-image: radial-gradient(
   circle at var(--rx) var(--ry),
   transparent calc(var(--ripple-r) - 28px),
   black var(--ripple-r),
   transparent calc(var(--ripple-r) + 28px)
  );
  mask-image: radial-gradient(
   circle at var(--rx) var(--ry),
   transparent calc(var(--ripple-r) - 28px),
   black var(--ripple-r),
   transparent calc(var(--ripple-r) + 28px)
  );
  animation: cursor-dot-ripple 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
 }
 @keyframes cursor-dot-ripple {
  0% {
   --ripple-r: 0px;
   opacity: 0.55;
  }
  100% {
   --ripple-r: 180px;
   opacity: 0;
  }
 }
 @media (prefers-reduced-motion: reduce), (hover: none) {
  .cursor-dots-layer {
   display: none;
  }
 }
 .hero-code { transform: none; }
 .language-section {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-template-areas: "heading overview" "example overview";
  grid-template-rows: auto 1fr;
  gap: 24px 48px;
  border-top: 1px solid var(--line);
 }
 .language-section h2 {
  grid-area: heading;
  font-size: 42px;
  line-height: 1.25;
  letter-spacing: -1.9px;
  font-weight: 500;
 }
 .language-overview { grid-area: overview; max-width: 660px; min-width: 0; }
 .language-example { grid-area: example; min-width: 0; }
 .language-example :global(.code-block) { margin: 0; }
 .language-overview p {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
 }
 .language-overview p + p { margin-top: 22px; }
 @media (max-width: 760px) {
  .language-section {
   grid-template-columns: 1fr;
   grid-template-areas: "heading" "overview" "example";
   grid-template-rows: auto;
   gap: 24px;
  }
  .language-section h2 { font-size: 34px; }
 }
</style>
