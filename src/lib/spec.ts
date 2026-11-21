// Renders SPEC.md (served verbatim at /SPEC.md) as the /spec/ page: heading
// anchors, a nested table of contents, site-styled tables, and Ocean code
// blocks highlighted with the docs highlighter.
import { Marked, type Tokens } from 'marked';
import { highlight } from '#lib/highlight.ts';

export type TocEntry = { id: string; title: string; children: TocEntry[] };
export type RenderedSpec = { title: string; html: string; toc: TocEntry[] };

const escapeHtml = (s: string) =>
 s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Heading text without inline markdown, e.g. "6.7.1 Bitfields" -> "6-7-1-bitfields".
function slug(text: string) {
 return text.replace(/[`*_]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
}

// Fenced blocks without a language are grammar (EBNF), Ocean, or plain lists.
function codeLabel(code: string, lang?: string) {
 if (lang) return lang.toLowerCase() === 'ocean' ? 'Ocean' : lang;
 // EBNF: `rule = … .` productions or quoted terminals such as '(' and 'type'.
 if ((/^\s*\w+\s+=\s/m.test(code) && /\s\.\s*$/m.test(code)) || /'[^'\s]+'/.test(code)) return 'Grammar';
 if (/[;{}]|:=|->/.test(code)) return 'Ocean';
 return 'Text';
}

function codeBlock(code: string, label: string) {
 const tokens = highlight(code, label === 'Ocean' ? 'Ocean' : 'text');
 const lines = tokens
  .map(line => '<span class="code-line">' + line
   .map(t => t.kind ? `<span class="tk-${t.kind}">${escapeHtml(t.value)}</span>` : escapeHtml(t.value))
   .join('') + '\n</span>')
  .join('');
 return `<div class="code-block"><div class="code-title"><span>${escapeHtml(label)}</span></div><pre><code>${lines}</code></pre></div>`;
}

export function renderSpec(markdown: string): RenderedSpec {
 const toc: TocEntry[] = [];
 const used = new Map<string, number>();
 let title = '';
 const marked = new Marked({ gfm: true });
 marked.use({
  renderer: {
   heading({ tokens, depth, text }: Tokens.Heading) {
    const inner = this.parser.parseInline(tokens);
    if (depth === 1 && !title) { title = text; return ''; }
    let id = slug(text);
    const seen = used.get(id) ?? 0;
    used.set(id, seen + 1);
    if (seen) id += '-' + (seen + 1);
    // Plain text for the table of contents, which Svelte escapes again.
    const plain = inner.replace(/<[^>]+>/g, '')
     .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    if (depth === 2) toc.push({ id, title: plain, children: [] });
    else if (depth === 3 && toc.length) toc[toc.length - 1].children.push({ id, title: plain, children: [] });
    else if (depth === 4 && toc.length && toc[toc.length - 1].children.length) {
     const parent = toc[toc.length - 1].children;
     parent[parent.length - 1].children.push({ id, title: plain, children: [] });
    }
    return `<h${depth} id="${id}"><a href="#${id}">${inner}<span class="anchor-mark">#</span></a></h${depth}>\n`;
   },
   code({ text, lang }: Tokens.Code) {
    return codeBlock(text, codeLabel(text, lang || undefined));
   }
  }
 });
 const html = (marked.parse(markdown, { async: false }) as string)
  .replace(/<table>/g, '<div class="reference-table"><table>')
  .replace(/<\/table>/g, '</table></div>');
 return { title: title.replace(/`/g, ''), html, toc };
}
