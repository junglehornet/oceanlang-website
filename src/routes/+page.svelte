<script lang="ts">
 import Code from '#lib/components/Code.svelte';
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
  <section class="section masthead">
   <div>
    <h1>Ocean</h1>
    <p class="slogan">A low-level language for the modern age,<br/>whether it's systems programming or full-stack applications.</p>
   </div>
   <a class="get-started" href="/docs/getting-started/">Get started <span aria-hidden="true">→</span></a>
  </section>
 </div>

 <section id="language" class="section language-section">
  <h2>Why Ocean?</h2>
  <div class="why-columns">
   <div class="why-column">
    <h3>Values, not hidden sharing</h3>
    <p>Strings, arrays, maps, and structs are copied when you assign or pass them, so changing a copy never changes the original. When you do want to share, you say so with a pointer, and the type shows it.</p>
    <a class="text-link" href="/docs/language/functions/#section-value-semantics">How values are passed →</a>
   </div>
   <div class="why-column">
    <h3>No garbage collector</h3>
    <p>Each value owns its memory, and the compiler releases it when the value goes out of scope. There are no collection pauses and no reference counting. Heap allocations made with <code>new</code> are yours to <code>free</code>.</p>
    <a class="text-link" href="/docs/language/memory/">How memory works →</a>
   </div>
   <div class="why-column">
    <h3>Close to the machine</h3>
    <p>Ocean compiles to native code through LLVM for Linux, macOS, and Windows, or to WebAssembly. Call C libraries directly with <code>extern</code>, and drop into inline assembly when you need a specific instruction.</p>
    <a class="text-link" href="/docs/language/c-interop/">C interop and assembly →</a>
   </div>
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
    <a class="text-link" href="/docs/language/basics/">Explore the language guide →</a>
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
    <p>Download the installer or build from source, then compile your first program.</p>
    <span class="text-link">Installation and first steps <span>→</span></span>
   </a>
   <div class="journey-links">
    <a href="/docs/language/variables/"><div><h3>Language guide</h3><p>Variables, functions, collections, types, and memory.</p></div><span>→</span></a>
    <a href="/docs/tooling/cli/"><div><h3>Compiler and packages</h3><p>Command-line usage, modules, and editor configuration.</p></div><span>→</span></a>
    <a href="/docs/library/io/"><div><h3>Standard library</h3><p>Files, formatting, JSON, HTTP, processes, terminal apps, threads, and more.</p></div><span>→</span></a>
   </div>
  </div>
  <div class="development-note"><h3>Development status</h3><p>Ocean is young and still changing. Expect rough edges and a small standard library. Follow development or contribute on <a href="https://github.com/ocean-foundation/ocean-c" target="_blank" rel="noopener noreferrer">GitHub ↗</a>.</p></div>
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
 .masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px 48px;
  padding-block: 104px 96px;
 }
 .masthead h1 {
  font-size: 68px;
  font-weight: 600;
  letter-spacing: -2.5px;
  line-height: 1.05;
 }
 .slogan {
  font-size: 21px;
  line-height: 1.5;
  color: var(--muted);
  margin-top: 14px;
  max-width: 640px;
 }
 .get-started {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 22px 44px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--bg);
  font: 600 21px Manrope, sans-serif;
  box-shadow: 0 14px 36px var(--shadow);
  transition: transform 0.15s, box-shadow 0.15s;
 }
 .get-started:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 44px var(--shadow);
 }
 .get-started span {
  transition: transform 0.15s;
 }
 .get-started:hover span {
  transform: translateX(3px);
 }
 @media (max-width: 760px) {
  .masthead {
   padding-block: 56px 52px;
  }
  .masthead h1 {
   font-size: 46px;
  }
  .slogan {
   font-size: 17px;
  }
  .get-started {
   width: 100%;
   justify-content: center;
   padding-block: 18px;
   font-size: 18px;
  }
 }
 .language-section {
  border-top: 1px solid var(--line);
 }
 .language-section h2 {
  font-size: 42px;
  line-height: 1.25;
  letter-spacing: -1.9px;
  font-weight: 500;
 }
 .why-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px;
  margin-top: 44px;
 }
 .why-column {
  display: flex;
  flex-direction: column;
  padding-left: 24px;
  border-left: 1px solid var(--line);
 }
 .why-column h3 {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.35;
 }
 .why-column p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
  margin-top: 14px;
 }
 .why-column code {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88em;
  color: var(--text);
 }
 .why-column .text-link {
  margin-top: auto;
  padding-top: 20px;
 }
 @media (max-width: 1100px) {
  .why-columns { gap: 32px; }
 }
 @media (max-width: 760px) {
  .language-section h2 { font-size: 34px; }
  .why-columns {
   grid-template-columns: 1fr;
   gap: 36px;
   margin-top: 32px;
  }
 }
</style>
