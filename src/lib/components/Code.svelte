<script lang="ts">
 import { onDestroy } from 'svelte';
 let { code, label = 'Ocean' }: { code: string; label?: string } = $props();
 let copied = $state(false);
 let failed = $state(false);
 let codeElement: HTMLElement;
 let resetTimer: ReturnType<typeof setTimeout> | undefined;
 onDestroy(() => clearTimeout(resetTimer));
 function tokens(line: string) {
  return line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\b(?:package|import|func|return|struct|interface|type|if|else|for|range|switch|case|default|break|continue|panic|defer|extern|mixed|as)\b|\b(?:int|i32|i16|i8|float|bool|string|any|true|false|null|void)\b|\b\d+(?:\.\d+)?\b)/g).filter(Boolean).map(value => ({value, kind: value.startsWith('//') ? 'comment' : /^["']/.test(value) ? 'string' : /^(package|import|func|return|struct|interface|type|if|else|for|range|switch|case|default|break|continue|panic|defer|extern|mixed|as)$/.test(value) ? 'keyword' : /^(int|i32|i16|i8|float|bool|string|any|true|false|null|void)$/.test(value) ? 'type' : /^\d/.test(value) ? 'number' : ''}));
 }
 function copyWithSelection() {
  const focused = document.activeElement;
  const input = document.createElement('textarea');
  input.value = code;
  input.readOnly = true;
  input.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
  document.body.appendChild(input);
  try {
   input.select();
   input.setSelectionRange(0, input.value.length);
   return document.execCommand('copy');
  } catch {
   return false;
  } finally {
   input.remove();
   if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
  }
 }
 async function copy() {
  clearTimeout(resetTimer);
  copied = false;
  failed = false;
  try {
   await navigator.clipboard.writeText(code);
   copied = true;
  } catch {
   copied = copyWithSelection();
  }
  if (copied) {
   resetTimer = setTimeout(() => copied = false, 2000);
  } else {
   const selection = window.getSelection();
   const range = document.createRange();
   range.selectNodeContents(codeElement);
   selection?.removeAllRanges();
   selection?.addRange(range);
   failed = true;
  }
 }
</script>
<div class="code-block"><div class="code-title"><span>{label}</span><button onclick={copy} aria-label={failed ? 'Code selected. Press Ctrl+C or Command+C to copy.' : 'Copy code'} title={failed ? 'Press Ctrl+C or Command+C, or use your device’s Copy action.' : 'Copy code'}><span aria-live="polite">{copied ? 'Copied ✓' : failed ? 'Selected' : 'Copy ↗'}</span></button></div><pre><code bind:this={codeElement}>{#each code.split('\n') as line}<span class="code-line">{#each tokens(line) as token}<span class={token.kind}>{token.value}</span>{/each}{'\n'}</span>{/each}</code></pre></div>

<style>
 .code-title {
  block-size: 48px;
  line-height: 16px;
 }
 .code-title button {
  inline-size: 10ch;
  block-size: 24px;
  line-height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: right;
 }
</style>
