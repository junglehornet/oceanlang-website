// Syntax highlighting for documentation code blocks.
//
// Ocean code is highlighted in two passes, in the style of a JetBrains IDE:
// a lexer splits the source into tokens (block comments nest and raw strings
// may span lines, so the whole block is scanned at once), then a semantic pass
// classifies each identifier from its context: declarations, calls, methods,
// fields, parameters, types, type parameters, enum variants, packages, and so
// on. The result is split into lines of tokens. Each token kind maps to a
// `tk-<kind>` CSS class in layout.css.

export type Token = { value: string; kind: string };

const keywords = new Set(['package', 'import', 'func', 'return', 'struct', 'enum', 'interface', 'type', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'match', 'break', 'continue', 'fallthrough', 'goto', 'panic', 'defer', 'extern', 'asm', 'mixed', 'as', 'forward']);
const constants = new Set(['true', 'false', 'null']);
const builtinTypes = new Set(['int', 'i64', 'i32', 'i16', 'i8', 'uint', 'u64', 'u32', 'u16', 'u8', 'float', 'f64', 'f32', 'bool', 'string', 'any', 'void', 'buffer', 'array', 'map']);
const builtinFunctions = new Set(['len', 'make', 'new', 'free', 'delete', 'zero', 'sizeof', 'recover']);
const builtinEnums = new Set(['Result', 'Optional']);
const standardPackages = new Set(['io', 'os', 'exec', 'json', 'http', 'term', 'tui', 'math', 'mem', 'time', 'threads', 'sync', 'reflect', 'testing']);
// Exported standard-library globals that are used as constants.
const knownConstants = new Set(['Pi', 'E', 'Ln2', 'Sqrt2', 'Nanosecond', 'Microsecond', 'Millisecond', 'Second']);
const number = /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/;
const operatorChars = /^[+\-*/%=!<>&|^~?:]+/;

type Lexeme = { value: string; kind: 'comment' | 'string' | 'char' | 'raw' | 'number' | 'word' | 'op' | 'punct' | 'space' };

function lexOcean(source: string): Lexeme[] {
 const out: Lexeme[] = [];
 let i = 0;
 while (i < source.length) {
  const c = source[i];
  const rest = source.slice(i);
  let j = i + 1;
  let kind: Lexeme['kind'];
  if (rest.startsWith('/*')) {
   let depth = 0;
   j = i;
   while (j < source.length) {
    if (source.startsWith('/*', j)) { depth++; j += 2; }
    else if (source.startsWith('*/', j)) { depth--; j += 2; if (depth === 0) break; }
    else j++;
   }
   kind = 'comment';
  } else if (rest.startsWith('//')) {
   const end = source.indexOf('\n', i);
   j = end === -1 ? source.length : end;
   kind = 'comment';
  } else if (c === '"' || c === "'") {
   while (j < source.length && source[j] !== c && source[j] !== '\n') j += source[j] === '\\' ? 2 : 1;
   j = Math.min(source.length, source[j] === c ? j + 1 : j);
   kind = c === '"' ? 'string' : 'char';
  } else if (c === '`') {
   const end = source.indexOf('`', i + 1);
   j = end === -1 ? source.length : end + 1;
   kind = 'raw';
  } else if (/[A-Za-z_À-￿]/.test(c)) {
   j = i + /^[A-Za-z0-9_À-￿]+/.exec(rest)![0].length;
   kind = 'word';
  } else if (/\d/.test(c)) {
   j = i + (number.exec(rest)?.[0].length ?? 1);
   kind = 'number';
  } else if (/\s/.test(c)) {
   j = i + /^\s+/.exec(rest)![0].length;
   kind = 'space';
  } else if (rest.startsWith('...')) {
   j = i + 3;
   kind = 'op';
  } else if (operatorChars.test(rest)) {
   // Split runs like `=>{` correctly: take the longest operator prefix, but
   // never glue a closing `>` of generics onto a following operator.
   const run = operatorChars.exec(rest)![0];
   const known = ['<<=', '>>=', '->', '=>', ':=', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'];
   const match = known.find(op => run.startsWith(op));
   j = i + (match ? match.length : 1);
   kind = 'op';
  } else {
   kind = 'punct';
  }
  out.push({ value: source.slice(i, j), kind });
  i = j;
 }
 return out;
}

// Split a string literal into string text, escape sequences, and `{}` placeholders.
function stringParts(value: string, raw: boolean): Token[] {
 if (raw) return [{ value, kind: 'string' }];
 const parts: Token[] = [];
 const pattern = /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|[0-7]{1,3}|.)|\{\}/g;
 let last = 0;
 for (const m of value.matchAll(pattern)) {
  if (m.index! > last) parts.push({ value: value.slice(last, m.index), kind: 'string' });
  parts.push({ value: m[0], kind: 'escape' });
  last = m.index! + m[0].length;
 }
 if (last < value.length) parts.push({ value: value.slice(last), kind: 'string' });
 return parts;
}

function highlightOcean(source: string): Token[] {
 const lex = lexOcean(source);
 // Indexes of significant lexemes (not spaces or comments), for context lookups.
 const sig: number[] = [];
 lex.forEach((l, i) => { if (l.kind !== 'space' && l.kind !== 'comment') sig.push(i); });
 const at = (k: number) => (k >= 0 && k < sig.length ? lex[sig[k]] : undefined);
 const val = (k: number) => at(k)?.value;
 const kinds: string[] = new Array(lex.length).fill('');

 // Find the significant index of the bracket matching the one at k.
 function matching(k: number): number {
  const open = val(k)!;
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };
  const close = pairs[open];
  let depth = 0;
  for (let m = k; m < sig.length; m++) {
   const v = val(m);
   if (v === open) depth++;
   else if (v === close) { depth--; if (depth === 0) return m; }
   else if (open === '<' && (v === ';' || v === '{' || v === ')' || v === '&&' || v === '||')) return -1;
  }
  return -1;
 }
 // Find the significant index of the opening bracket that matches the closer at k.
 function matchingBack(k: number): number {
  const close = val(k)!;
  const open = ({ ')': '(', ']': '[', '}': '{', '>': '<' } as Record<string, string>)[close];
  let depth = 0;
  for (let m = k; m >= 0; m--) {
   const v = val(m);
   if (v === close) depth++;
   else if (v === open) { depth--; if (depth === 0) return m; }
  }
  return -1;
 }
 // A `<` starts a generic argument list if its matching `>` is found nearby.
 const isGenericOpen = (k: number) => val(k) === '<' && at(k - 1)?.kind === 'word' && matching(k) !== -1;
 const isCapital = (w: string) => /^[A-ZÀ-Þ]/.test(w);

 // Pass 1: collect declared names.
 const userTypes = new Set<string>();
 const enumTypes = new Set<string>(builtinEnums);
 const typeParams = new Set<string>();
 const params = new Set<string>();
 const packages = new Set<string>(standardPackages);
 const fieldDecl = new Set<number>(); // significant indexes declaring fields
 const paramDecl = new Set<number>();
 const typeDecl = new Set<number>();
 const funcDecl = new Set<number>();
 const labelSet = new Set<string>();

 // Mark names in a parameter or result list spanning significant indexes (open, close).
 function markParamList(open: number, close: number, results: boolean) {
  let start = open + 1;
  const elements: [number, number][] = [];
  let depth = 0;
  for (let m = open + 1; m <= close; m++) {
   const v = val(m);
   if (v === '(' || v === '[' || v === '{' || (v === '<')) depth++;
   else if (v === ')' || v === ']' || v === '}' || v === '>') { if (m === close) { elements.push([start, m]); break; } depth--; }
   else if (v === ',' && depth === 0) { elements.push([start, m]); start = m + 1; }
  }
  for (const [s, e] of elements) {
   const count = e - s;
   if (count === 0) continue;
   const first = at(s)!;
   if (results) {
    // Named results are type-first: `(int total, count)`.
    const last = at(e - 1)!;
    if (count >= 2 && last.kind === 'word' && !builtinTypes.has(last.value) && val(e - 2) !== '.') { paramDecl.add(e - 1); params.add(last.value); }
    else if (count === 1 && first.kind === 'word' && !builtinTypes.has(first.value) && !isCapital(first.value) && elements.length > 1) { paramDecl.add(s); params.add(first.value); }
   } else if (first.kind === 'word' && !builtinTypes.has(first.value) && !keywords.has(first.value) && (count >= 2 ? val(s + 1) !== '.' && val(s + 1) !== '<' && val(s + 1) !== '[' : !isCapital(first.value))) {
    paramDecl.add(s);
    params.add(first.value);
   }
  }
 }
 // Mark type parameter names in a generic declaration list `<T any, U>`.
 function markTypeParams(open: number) {
  const close = matching(open);
  if (close === -1) return close;
  let expectName = true;
  let depth = 0;
  for (let m = open + 1; m < close; m++) {
   const v = val(m)!;
   if (v === '<' || v === '(' || v === '[') depth++;
   else if (v === '>' || v === ')' || v === ']') depth--;
   else if (v === ',' && depth === 0) expectName = true;
   else if (expectName && depth === 0 && at(m)!.kind === 'word') { typeParams.add(v); typeDecl.add(m); expectName = false; }
  }
  return close;
 }
 // Mark field names declared in a struct or record body `{ a, b int; c string; }`.
 function markFields(open: number) {
  const close = matching(open);
  if (close === -1) return;
  let atStart = true;
  for (let m = open + 1; m < close; m++) {
   const v = val(m)!;
   if (v === ';') { atStart = true; continue; }
   if (atStart && at(m)!.kind === 'word' && !builtinTypes.has(v)) {
    // Names run until the first token that is neither a name nor a comma.
    let n = m;
    while (n < close && at(n)!.kind === 'word' && (val(n + 1) === ',' )) { fieldDecl.add(n); n += 2; }
    if (at(n)?.kind === 'word' && val(n + 1) !== ';' && val(n + 1) !== '}') fieldDecl.add(n);
    m = n;
    atStart = false;
   } else atStart = false;
  }
 }

 for (let k = 0; k < sig.length; k++) {
  const v = val(k);
  const next = val(k + 1);
  if (v === 'import') {
   // import "path" [as alias]; or import . "path"; or import _ "path";
   let m = k + 1;
   if (val(m) === '.' || val(m) === '_') m++;
   const path = at(m);
   if (path?.kind === 'string') {
    const name = path.value.slice(1, -1).split('/').pop()!;
    if (val(m + 1) === 'as' && at(m + 2)) packages.add(val(m + 2)!);
    else packages.add(name);
   }
  } else if ((v === 'struct' || v === 'enum' || v === 'interface' || v === 'type') && at(k + 1)?.kind === 'word') {
   const name = next!;
   userTypes.add(name);
   if (v === 'enum') enumTypes.add(name);
   typeDecl.add(k + 1);
   let m = k + 2;
   if (val(m) === '<') m = markTypeParams(m) + 1;
   if (val(m) === '(' && v === 'struct') {
    // Struct value parameters become read-only fields.
    const close = matching(m);
    markParamList(m, close, false);
    for (let p = m + 1; p < close; p++) if (paramDecl.has(p)) { paramDecl.delete(p); fieldDecl.add(p); params.delete(val(p)!); }
    m = close + 1;
   }
   if (v === 'struct' && val(m) === '{') markFields(m);
   if (v === 'interface' && val(m) === '{') {
    const close = matching(m);
    for (let p = m + 1; p < close; p++) {
     if (at(p)!.kind === 'word' && (val(p + 1) === '(' || val(p + 1) === '<') && ['{', ';', 'func'].includes(val(p - 1)!)) funcDecl.add(p);
    }
   }
   if (v === 'enum' && val(m) === '{') {
    // Variants, and record-variant fields.
    const close = matching(m);
    for (let p = m + 1; p < close; p++) {
     if (at(p)!.kind === 'word' && (val(p - 1) === '{' || val(p - 1) === ',') && p - 1 >= m) {
      fieldDecl.add(-p - 1); // marker: variant declaration, handled below
      if (val(p + 1) === '{') { markFields(p + 1); p = matching(p + 1); }
      else if (val(p + 1) === '(') p = matching(p + 1);
     }
    }
   }
  } else if (v === 'func') {
   let m = k + 1;
   if (val(m) === '(') {
    // Receiver, or a function literal / function type.
    const close = matching(m);
    if (at(close + 1)?.kind === 'word') {
     markParamList(m, close, false);
     m = close + 1;
    }
   }
   if (at(m)?.kind === 'word' && !builtinTypes.has(val(m)!)) { funcDecl.add(m); m++; }
   if (val(m) === '<') m = markTypeParams(m) + 1;
   if (val(m) === '(') {
    const close = matching(m);
    if (close !== -1) {
     markParamList(m, close, false);
     if (val(close + 1) === '(') {
      const rclose = matching(close + 1);
      if (rclose !== -1) markParamList(close + 1, rclose, true);
     }
    }
   }
  } else if (v === 'extern' && next !== '.') {
   // extern ResultType name(ParamType name, ...);
   let m = k + 1;
   while (m < sig.length && !(at(m)!.kind === 'word' && val(m + 1) === '(')) m++;
   if (m < sig.length) {
    funcDecl.add(m);
    const close = matching(m + 1);
    for (let p = m + 2; p < close; p++) {
     // C-style parameters put the name last: `buffer<i8> data`.
     if (at(p)!.kind === 'word' && (val(p + 1) === ',' || val(p + 1) === ')') && at(p - 1) && val(p - 1) !== '(' && val(p - 1) !== ',' && !builtinTypes.has(val(p)!)) { paramDecl.add(p); }
    }
   }
  } else if (at(k)?.kind === 'word' && next === ':' && (val(k + 2) === '{' || val(k + 2) === 'for')) {
   labelSet.add(v!);
  }
 }

 // Receiver type parameters such as `(b *Box<T>)` bind T too: treat any
 // single capital letter as a type parameter.
 const isTypeParam = (w: string) => typeParams.has(w) || /^[A-Z]$/.test(w);

 // Track whether each `{` opens a composite literal, so `name:` inside it is a field.
 const literalBraces = new Set<number>();
 for (let k = 0; k < sig.length; k++) {
  if (val(k) !== '{') continue;
  const prev = at(k - 1);
  if (!prev) continue;
  if (prev.value === '>' ) {
   const open = matchingBack(k - 1);
   const owner = val(open - 1);
   if (owner && (userTypes.has(owner) || isCapital(owner))) literalBraces.add(k);
  } else if (prev.kind === 'word' && (userTypes.has(prev.value) || isCapital(prev.value)) && !['struct', 'enum', 'interface', 'type', '=>'].includes(val(k - 2) ?? '') && !builtinTypes.has(prev.value)) {
   literalBraces.add(k);
  } else if (prev.value === ']') {
   literalBraces.add(k); // map[K]V{...} and T[n]{...}
  }
 }
 const braceStack: number[] = [];
 const insideLiteral = new Set<number>();
 for (let k = 0; k < sig.length; k++) {
  const v = val(k);
  if (v === '{') braceStack.push(k);
  else if (v === '}') braceStack.pop();
  else if (braceStack.length && literalBraces.has(braceStack[braceStack.length - 1])) insideLiteral.add(k);
 }

 // Local variables: `a, b := …`, `name: Type` declarations, and match-pattern bindings.
 const locals = new Set<string>();
 const localDecl = new Set<number>();
 const statementStart = (k: number) => k === 0 || [';', '{', '}', '('].includes(val(k - 1) ?? '');
 for (let k = 0; k < sig.length; k++) {
  const v = val(k);
  if (v === ':=') {
   for (let m = k - 1; m >= 0 && at(m)!.kind === 'word'; m -= 2) {
    if (val(m) !== '_') { locals.add(val(m)!); localDecl.add(m); }
    if (val(m - 1) !== ',') break;
   }
  } else if (v === ':' && at(k - 1)?.kind === 'word' && statementStart(k - 1) && !labelSet.has(val(k - 1)!) && !insideLiteral.has(k)) {
   locals.add(val(k - 1)!);
   localDecl.add(k - 1);
  } else if ((v === '(' || v === '{') && at(k - 1)?.kind === 'word' && val(k - 2) === '.') {
   // `Enum.Variant(a, b) =>` or `Enum.Variant{alias = field} =>` in a match arm.
   const close = matching(k);
   if (close !== -1 && val(close + 1) === '=>') {
    for (let m = k + 1; m < close; m++) {
     if (at(m)!.kind !== 'word' || val(m) === '_') continue;
     if (val(m + 1) === '=' || v === '(' || (val(m - 1) !== '=')) { locals.add(val(m)!); localDecl.add(m); }
     if (val(m - 1) === '=') fieldDecl.add(m);
    }
   }
  }
 }

 // Pass 2: classify each significant lexeme.
 for (let k = 0; k < sig.length; k++) {
  const l = at(k)!;
  const idx = sig[k];
  const v = l.value;
  const prev = val(k - 1);
  const next = val(k + 1);
  if (l.kind === 'number') { kinds[idx] = 'number'; continue; }
  if (l.kind === 'char') { kinds[idx] = 'string'; continue; }
  if (l.kind === 'op') { kinds[idx] = isGenericOpen(k) || (v === '>' && matchingBack(k) !== -1 && at(matchingBack(k) - 1)?.kind === 'word' && val(matchingBack(k)) === '<') ? 'punct' : 'operator'; continue; }
  if (l.kind !== 'word') continue;

  if (constants.has(v)) { kinds[idx] = 'constant'; continue; }
  if (keywords.has(v)) { kinds[idx] = 'keyword'; continue; }
  if (prev === 'asm' || (prev === '/' && val(k - 2) && val(k - 3) === 'asm')) { kinds[idx] = 'namespace'; continue; }
  if (typeDecl.has(k)) { kinds[idx] = isTypeParam(v) && !userTypes.has(v) ? 'typeparam' : 'class-decl'; continue; }
  if (funcDecl.has(k)) { kinds[idx] = 'function-decl'; continue; }
  if (fieldDecl.has(-k - 1)) { kinds[idx] = 'enum-member'; continue; }
  if (fieldDecl.has(k)) { kinds[idx] = 'field-decl'; continue; }
  if (paramDecl.has(k)) { kinds[idx] = 'param'; continue; }
  if (localDecl.has(k)) { kinds[idx] = 'variable'; continue; }
  if (builtinTypes.has(v)) { kinds[idx] = 'type'; continue; }
  if ((prev === 'break' || prev === 'continue' || prev === 'goto') || (labelSet.has(v) && next === ':')) { kinds[idx] = 'label'; continue; }

  const callsNext = next === '(' || (next === '<' && isGenericOpen(k + 1) && val(matching(k + 1) + 1) === '(');
  if (prev === '.') {
   // Member access: work out what is on the left of the dot.
   let left = k - 2;
   if (val(left) === '>') { const open = matchingBack(left); if (open > 0) left = open - 1; }
   const owner = val(left) ?? '';
   if (enumTypes.has(owner)) kinds[idx] = callsNext && !isCapital(v) && ['unwrap', 'hasValue', 'hasError', 'error', 'unwrapOrElse', 'unwrapOrZero'].includes(v) && owner !== val(k - 2) ? 'method' : 'enum-member';
   else if (owner === 'extern') kinds[idx] = 'call';
   else if (packages.has(owner) && at(left - 1)?.value !== '.') kinds[idx] = callsNext ? 'call' : knownConstants.has(v) ? 'static' : isCapital(v) ? 'class' : 'field';
   else kinds[idx] = callsNext ? 'method' : 'field';
   continue;
  }
  if (next === '.' && packages.has(v) && !params.has(v)) { kinds[idx] = 'namespace'; continue; }
  if (builtinFunctions.has(v) && next === '(') { kinds[idx] = 'builtin'; continue; }
  if (insideLiteral.has(k) && next === ':' && (prev === '{' || prev === ',')) { kinds[idx] = 'field'; continue; }
  if (callsNext) { kinds[idx] = userTypes.has(v) ? 'class' : 'call'; continue; }
  if (isTypeParam(v) && !userTypes.has(v)) { kinds[idx] = 'typeparam'; continue; }
  if (userTypes.has(v) || enumTypes.has(v) || isCapital(v)) { kinds[idx] = 'class'; continue; }
  if (params.has(v)) { kinds[idx] = 'param'; continue; }
  if (locals.has(v)) { kinds[idx] = 'variable'; continue; }
 }

 const tokens: Token[] = [];
 lex.forEach((l, i) => {
  if (l.kind === 'comment') tokens.push({ value: l.value, kind: 'comment' });
  else if (l.kind === 'string' || l.kind === 'raw') tokens.push(...stringParts(l.value, l.kind === 'raw'));
  else tokens.push({ value: l.value, kind: kinds[i] });
 });
 return tokens;
}

// Terminal blocks: comments, commands, environment assignments, flags, strings.
function highlightShell(source: string): Token[] {
 const tokens: Token[] = [];
 let commandStart = true;
 let continued = false;
 const pattern = /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\s+)|([A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|\S*))|(--?[A-Za-z][\w-]*(?:=(?:"[^"]*"|[^\s"]*))?)|(\$[A-Za-z_]\w*|\$\{[^}]*\}|\$\([^)]*\))|([|&;<>]+|\\$)|([^\s"'|&;<>]+)/gm;
 for (const m of source.matchAll(pattern)) {
  const [text, comment, str, space, assign, flag, variable, op] = m;
  if (comment) { tokens.push({ value: text, kind: 'comment' }); continue; }
  if (space) { tokens.push({ value: text, kind: '' }); if (text.includes('\n') && !continued) commandStart = true; continued = false; continue; }
  if (str) { tokens.push({ value: text, kind: 'string' }); commandStart = false; continue; }
  if (assign && commandStart) {
   const eq = text.indexOf('=');
   tokens.push({ value: text.slice(0, eq), kind: 'param' }, { value: '=', kind: 'operator' }, { value: text.slice(eq + 1), kind: 'string' });
   continue;
  }
  if (flag) {
   const eq = text.indexOf('=');
   if (eq === -1) tokens.push({ value: text, kind: 'keyword' });
   else tokens.push({ value: text.slice(0, eq), kind: 'keyword' }, { value: '=', kind: 'operator' }, { value: text.slice(eq + 1), kind: 'string' });
   continue;
  }
  if (variable) { tokens.push({ value: text, kind: 'param' }); continue; }
  if (op) { tokens.push({ value: text, kind: 'operator' }); if (text === '\\') continued = true; else commandStart = true; continue; }
  tokens.push({ value: text, kind: commandStart ? 'function-decl' : '' });
  commandStart = false;
 }
 return tokens;
}

// ocean.mod files: directives, versions, replacement arrows, comments.
function highlightMod(source: string): Token[] {
 const tokens: Token[] = [];
 for (const m of source.matchAll(/(\/\/.*$)|(^\s*(?:module|ocean|require|replace)\b)|("[^"]*")|(\bv?\d+(?:\.\d+)*\b)|(=>|[()])|([^\s"()=]+|\s+|.)/gm)) {
  const [text, comment, directive, str, version, op] = m;
  tokens.push({ value: text, kind: comment ? 'comment' : directive ? 'keyword' : str ? 'string' : version ? 'number' : op ? 'operator' : /^\s/.test(text) ? '' : 'namespace' });
 }
 return tokens;
}

// TOML: tables, keys, strings, numbers, booleans, comments.
function highlightToml(source: string): Token[] {
 const tokens: Token[] = [];
 for (const m of source.matchAll(/(#.*$)|(^\s*\[\[?[^\]]*\]\]?)|("(?:[^"\\]|\\.)*")|([\w.-]+(?=\s*=))|(\b(?:true|false)\b)|(\b\d+(?:\.\d+)?\b)|([=,{}[\]])|(\s+|[^\s"#=,{}[\]]+)/gm)) {
  const [text, comment, table, str, key, bool, num, op] = m;
  tokens.push({ value: text, kind: comment ? 'comment' : table ? 'class-decl' : str ? 'string' : key ? 'field' : bool ? 'constant' : num ? 'number' : op ? 'operator' : '' });
 }
 return tokens;
}

function toLines(tokens: Token[]): Token[][] {
 const lines: Token[][] = [[]];
 for (const token of tokens) {
  token.value.split('\n').forEach((part, index) => {
   if (index > 0) lines.push([]);
   if (!part) return;
   const line = lines[lines.length - 1];
   const last = line[line.length - 1];
   if (last && last.kind === token.kind) last.value += part;
   else line.push({ value: part, kind: token.kind });
  });
 }
 return lines;
}

export function highlight(source: string, label = 'Ocean'): Token[][] {
 const name = label.toLowerCase();
 if (name === 'output' || name === 'page source' || name === 'text') return toLines([{ value: source, kind: '' }]);
 if (name === 'terminal' || name === 'shell') return toLines(highlightShell(source));
 if (name === 'ocean.mod') return toLines(highlightMod(source));
 if (name.endsWith('.toml')) return toLines(highlightToml(source));
 return toLines(highlightOcean(source));
}
