<script lang="ts">
 import Code from '$lib/components/Code.svelte';
 let selected = $state(0);
 const examples = [
  {
   title: 'Print a formatted message',
   file: 'hello.oc',
   code: 'package main;\n\nimport "io";\n\nfunc main() {\n    name := "Ocean";\n    io.Printfln("Hello, {}!", name);\n}',
   output: 'Hello, Ocean!',
   explanation: 'Every executable starts in package main. Import io for console output; {} inserts a value into a formatted string.'
  },
  {
   title: 'Copy a dynamic array',
   file: 'values.oc',
   code: 'package main;\n\nimport "io";\n\nfunc main() {\n    original := int[]{1, 2, 3};\n    copy := original;\n    copy[0] = 42;\n\n    io.Println(original);\n    io.Println(copy);\n}',
   output: '[1 2 3]\n[42 2 3]',
   explanation: 'Dynamic array assignment creates an independent copy. Changing copy[0] leaves the original array unchanged.'
  },
  {
   title: 'Use a generic struct',
   file: 'generics.oc',
   code: 'package main;\n\nimport "io";\n\nstruct Box<T> { value T; }\n\nfunc main() {\n    answer := Box<int>{42};\n    io.Println(answer.value);\n}',
   output: '42',
   explanation: 'Box<T> can hold different types of values. Box<int> specializes the struct with an integer field at compile time.'
  }
 ];
</script>

<svelte:head>
 <title>Ocean programming language</title>
</svelte:head>

<main id="main">
 <div class="hero-background">
  <div class="hero-art" aria-hidden="true"></div>
 <section class="hero">
  <div class="hero-content">
   <a class="eyebrow release-link" href="/docs/getting-started/">
    <span class="status-dot"></span> Ocean 0.1 · In development
   </a>
   <h1>The <em>Ocean</em><br/>programming<br/>language.</h1>
   <p class="hero-description">A compiled language with static types, generics, and value semantics. Ocean produces native executables through LLVM and Clang, with scope-based cleanup for strings and dynamic arrays.</p>
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
  <div class="section-heading">
   <div><h2>Language features</h2></div>
   <p>Ocean combines typed functions and structs with explicit control over shared data and heap allocations.</p>
  </div>
  <div class="feature-grid">
   <a href="/docs/language/functions/">
    <h3>Functions and types</h3>
    <p>Infer local variable types, return multiple results, and use structs and generic functions to organize your code.</p>
    <span class="text-link">Language guide →</span>
   </a>
   <a href="/docs/language/memory/">
    <h3>Values and memory</h3>
    <p>Dynamic arrays and strings copy by value and clean up at scope exit. Pointers provide shared access; heap allocations are freed explicitly.</p>
    <span class="text-link">Memory model →</span>
   </a>
   <a href="/docs/tooling/editor/">
    <h3>Compiler and editor tools</h3>
    <p>Build, run, and check packages from the command line. Connect the language server for diagnostics, completion, and navigation.</p>
    <span class="text-link">Tooling →</span>
   </a>
  </div>
 </section>

 <div class="examples-background">
 <section class="example-section section">
  <div class="example-intro">
   <h2>A few examples</h2>
   <p>These programs show the syntax for console output, array copies, and generic types. Each one can be saved as main.oc and run with ocean run .</p>
   <div class="example-tabs" role="tablist" aria-label="Code examples">
    {#each examples as example, i}
     <button id={'example-tab-'+i} aria-controls="example-panel" role="tab" aria-selected={selected===i} class:selected={selected===i} onclick={()=>selected=i}>
      {example.title}<span>→</span>
     </button>
    {/each}
   </div>
   <a class="text-link" href="/docs/language/variables/">Read about variables and types →</a>
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
  <div class="development-note"><h3>Development status</h3><p>Ocean is under active development. The documentation describes the current compiler, including implementation limits. The compiler and standard library are available on <a href="https://codeberg.org/junglehornet/ocean-c" target="_blank" rel="noopener noreferrer">Codeberg ↗</a>.</p></div>
 </section>
</main>
