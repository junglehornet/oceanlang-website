<script lang="ts">
 let { code, label = 'Ocean' }: { code: string; label?: string } = $props();
 let copied = $state(false);
 let failed = $state(false);
 function tokens(line: string) {
  return line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\b(?:package|import|func|return|struct|interface|type|if|else|for|range|switch|case|default|break|continue|panic|defer|extern|mixed|as)\b|\b(?:int|i32|i16|i8|float|bool|string|any|true|false|null|void)\b|\b\d+(?:\.\d+)?\b)/g).filter(Boolean).map(value => ({value, kind: value.startsWith('//') ? 'comment' : /^["']/.test(value) ? 'string' : /^(package|import|func|return|struct|interface|type|if|else|for|range|switch|case|default|break|continue|panic|defer|extern|mixed|as)$/.test(value) ? 'keyword' : /^(int|i32|i16|i8|float|bool|string|any|true|false|null|void)$/.test(value) ? 'type' : /^\d/.test(value) ? 'number' : ''}));
 }
 async function copy() { try { await navigator.clipboard.writeText(code); copied = true; setTimeout(() => copied = false, 2000); } catch { failed = true; } }
</script>
<div class="code-block"><div class="code-title"><span>{label}</span><button onclick={copy} aria-label="Copy code">{copied ? 'Copied ✓' : failed ? 'Select code to copy' : 'Copy ↗'}</button></div><pre><code>{#each code.split('\n') as line}<span class="code-line">{#each tokens(line) as token}<span class={token.kind}>{token.value}</span>{/each}{'\n'}</span>{/each}</code></pre></div>
