# The Ocean Programming Language — Specification

This document specifies the Ocean language as implemented by `ocean-c`, the
pre-bootstrapping compiler in this repository. It is written so that an
independent implementation can reproduce the same accepted programs, the same
rejected programs (in kind, not necessarily in diagnostic wording), and the same
observable runtime behavior.

**Authority.** Where this document and other prose (README, `types.txt`, the
website, the editor skill) disagree, this document follows the compiler's actual
behavior, which was verified by reading the scanner, parser, semantic checker,
and backend and by compiling and running probe programs. Section 17 lists the
known places where other documentation is inaccurate.

**Pipeline.** Ocean-c processes a program in stages: *scan* (§2) → *parse* (§3)
→ *package resolution and name qualification* (§4) → *semantic check* (§5–§12)
→ *backend lowering to LLVM IR* → *native compile and link via Clang*. Some
constructs are accepted by an early stage and rejected by a later one; such
constructs are **not part of the language** and are marked *unsupported* below.
A conforming implementation must reject them (at any stage).

Notation: grammar uses EBNF. `'x'` is a literal token, `[x]` optional, `{x}`
zero or more, `x | y` alternation, `( )` grouping. Terms in *italics* are
defined elsewhere.

---

## 1. Source text

- A source file is a byte sequence interpreted as UTF-8. Invalid UTF-8 inside
  identifiers, character literals, or string literals is a compile error.
- Ocean source files have the extension `.oc`.
- Line terminator is `\n`; `\r` is treated as whitespace. Diagnostics report
  1-based line and column numbers (columns count bytes).

---

## 2. Lexical structure

### 2.1 Whitespace and comments

Whitespace (space, tab, CR, LF) separates tokens and is otherwise ignored.
There is no automatic semicolon insertion.

- Line comment: `//` to end of line.
- Block comment: `/* ... */`. Block comments **nest**: every `/*` inside must be
  matched by a `*/`. An unterminated block comment is an error.

### 2.2 Identifiers

```
identifier = id_start { id_continue } .
```

- `id_start`: ASCII letter, `_`, or any Unicode 16.0 `XID_Start` code point.
- `id_continue`: `id_start`, ASCII digit, or any Unicode `XID_Continue` code point.
- The single character `_` is not an identifier; it is the **blank** token
  (used for discards and unnamed parameters). Identifiers may otherwise begin
  with `_` (e.g. `_tmp`).
- An identifier is **exported** if its first code point is a Unicode uppercase
  letter (§4.5).

### 2.3 Keywords

The following are reserved and cannot be used as identifiers:

```
any       as        asm       break     case      continue  default
defer     else      enum      extern    fallthrough         for
func      goto      if        import    interface match     mixed
null      package   panic     range     return    struct    switch
type      varint    varuint
```

`varint` and `varuint` begin the parameterized integer types `varint(n)` and
`varuint(n)` (§6.2.1) and must always be followed by `(width)`.

**Not keywords** (they are ordinary identifiers that have special meaning only
in certain positions): `true`, `false`, `sizeof`, `zero`, `make`, `new`, `len`,
`free`, `delete`, `recover`, `forward`, `map`, `buffer`, `array`,
`void`, and all built-in type names (`int`, `string`, …). See §5.1 and §9.10.

Reserved spellings with restrictions:

- `array` cannot be declared as a type name (type, struct, enum, interface, or
  type parameter). It may still name variables.

### 2.4 Operators and punctuation

```
{  }  (  )  [  ]  ;  ,  .  :  ?  `  ->  =>
+  -  *  /  %  ^  &  |  ~  !  <  >  <<  >>  &&  ||  ==  !=  <=  >=
=  +=  -=  *=  /=  %=  ^=  &=  |=  <<=  >>=  ++  --
```

- The scanner is greedy (maximal munch). `...` is three `.` tokens; the parser
  recognizes three consecutive dots as an ellipsis.
- In type-argument lists, a `>>` token closes two angle brackets (§3.3).

### 2.5 Integer literals

```
int_lit     = decimal | '0x' hex_digits | '0X' hex_digits
            | '0b' bin_digits | '0B' bin_digits | '0o' oct_digits | '0O' oct_digits .
```

- There are no digit separators and no suffixes. A numeric literal immediately
  followed by a letter, digit, or `_` is an error (`1u`, `0x1g` are invalid).
- Leading zeros in decimal are allowed and do **not** mean octal (`017 == 17`).
- The magnitude may have at most 8,388,608 bits (the maximum parameterized
  integer width, §6.2); a longer literal is an error. Decimal, hexadecimal,
  binary, and octal literals all keep their exact value.
- A literal whose magnitude fits in `INT64_MAX` is an *untyped integer* that
  defaults to `int` (§7.4). One that exceeds `INT64_MAX` but fits in 64 bits has
  type `uint`. One that exceeds 64 bits has type `varuint(k)`, where `k` is the
  bit length of the magnitude (`18446744073709551616` and `0x1ffffffffffffffff`
  are `varuint(65)`).
- A negated literal below the `int` range has type `varint(k)` with the
  smallest `k` that holds it (`-9223372036854775809` and
  `-18446744073709551616` are `varint(65)`).
- `-9223372036854775808` (a `-` immediately applied to the literal
  `9223372036854775808`) is folded to the `int` value `INT64_MIN`.

### 2.6 Floating-point literals

```
float_lit = digits '.' digits [ exponent ]
          | digits exponent
          | '0x' hex_digits '.' hex_digits
          | '0b' bin_digits '.' bin_digits
          | '0o' oct_digits '.' oct_digits .
exponent  = ( 'e' | 'E' ) [ '+' | '-' ] decimal_digits .   (* decimal only *)
```

- A fractional part requires at least one digit on **both** sides of `.`:
  `1.` lexes as the integer `1` followed by `.`; `.5` lexes as `.` then `5`.
- Exponents are permitted only on decimal literals. Hexadecimal `p` exponents
  are not supported.
- Float literals default to `float` (binary64). When a context expects
  `f32`, the literal is rounded directly to binary32 (§7.4).
- A non-finite result at the selected precision is an error.

### 2.7 Character literals

`'c'` contains exactly one character or escape. It produces an *untyped
integer* literal whose value is the Unicode scalar value (for a UTF-8 encoded
source character) or the escape's value. `''` and an unterminated literal are errors.

### 2.8 String literals

- **Interpreted**: `"..."`. May not contain an unescaped newline. Escapes are
  decoded (§2.9). Non-ASCII source characters are copied as their UTF-8 bytes.
- **Raw**: `` `...` ``. Any bytes except `` ` ``, including newlines; no escapes.

The literal's value is the sequence of decoded bytes. **No terminating NUL is
added**; write `"\0"` explicitly when a C API needs one. Both forms have type `string`.

### 2.9 Escape sequences (strings and character literals)

| Escape | Value |
|---|---|
| `\a \b \e \f \n \r \t \v` | 7, 8, 27, 12, 10, 13, 9, 11 |
| `\\ \' \" \?` | the character itself |
| `\` followed by a newline | newline (10) |
| `\xHH` | exactly 2 hex digits; one byte |
| `\o`, `\oo`, `\ooo` | 1–3 octal digits; value ≤ 255; one byte |
| `\uXXXX` | exactly 4 hex digits; a Unicode scalar value |
| `\UXXXXXXXX` | exactly 8 hex digits; a Unicode scalar value |

- `\u`/`\U` values must be ≤ U+10FFFF and not a surrogate (U+D800–U+DFFF).
- In a string, `\u`/`\U` escapes and non-ASCII source characters are encoded as
  UTF-8; `\x` and octal escapes insert a single raw byte (even if ≥ 0x80).
- Any other escape character is an error.

### 2.10 Inline assembly bodies

After the tokens `asm IDENT` or `asm IDENT / IDENT`, a `{` begins a raw assembly
body that extends to the matching `}`. Inside the body the Ocean lexer does not
run; brace matching ignores braces inside `"`/`'` quotes, `//` and `/* */`
comments, and (except when the architecture is `aarch64`) `#` line comments.
See §10.13.

---

## 3. Syntax

### 3.1 Source file

```
SourceFile   = PackageClause { ImportDecl | TopLevelDecl } .
PackageClause = 'package' identifier ';' .
ImportDecl   = 'import' ( ImportSpec ';'
                        | '(' { ImportSpec [ ',' | ';' ] } ')' [ ';' ] ) .
ImportSpec   = [ identifier | '_' | '.' ] string_lit [ 'as' ( identifier | '_' | '.' ) ] .
```

- The package clause must be the first declaration and appear exactly once.
- Within a parenthesized import group, entries are separated by `,`, `;`, or a
  line break.
- An alias may be given before the path or after `as`, but not both. The
  import path must be a non-empty string.

### 3.2 Top-level declarations

```
TopLevelDecl = FuncDecl | MethodDecl | ExternDecl | VarDecl ';'
             | TypeDecl | StructDecl | EnumDecl | InterfaceDecl .
```

Any other statement at file scope is rejected. (`return`, `panic`, `defer`,
`goto`, `asm`, `forward panic` are syntax errors outside functions; other
statements such as `if` are rejected later.)

### 3.3 Types

Types are written with the following grammar. **Every type modifier is a prefix
that applies to the entire type written after it.** (The compiler stores types as
token spans and interprets them during checking, so some syntactically valid
spellings are semantically invalid; see §6.)

```
Type        = '*' Type                          (* pointer *)
            | '[' ']' Type                      (* dynamic array *)
            | '[' Dimension ']' Type            (* array of Dimension elements *)
            | '[' '...' ']' Type                (* array sized by its literal; literals only *)
            | 'mixed' '[' ']' Type              (* heterogeneous interface array *)
            | NamedType
            | ( 'varint' | 'varuint' ) '(' int_lit ')'    (* parameterized integer, §6.2 *)
            | 'buffer' [ '<' Type [ ',' BufferSize ] '>' ]
            | 'map' '[' Type ']' Type
            | 'func' Params [ Results | Type ]
            | 'interface' '{' InterfaceBody '}'
            | 'struct' '{' Fields '}' .         (* parses; unsupported as a type *)
NamedType   = ( identifier | 'any' ) { '.' identifier } [ TypeArgs ] { '.' identifier } .
TypeArgs    = '<' Type { ',' Type } [ ',' ] '>' .
Dimension   = TernaryExpr .                     (* any expression except assignment/comma *)
BufferSize  = AdditiveExpr .                    (* operands with + - * / % only; parenthesize others *)
Constraint  = [ '~' ] Type { '|' [ '~' ] Type } .
```

Notes:

- **Prefix binding.** Reading left to right, each modifier wraps everything
  after it: `[3][2]int` is an array of 3 elements, each an `[2]int`
  (`len(x) == 3`, `len(x[0]) == 2`); `[]*T` is a dynamic array of pointers;
  `*[]T` is a pointer to a dynamic array; `*[3]T` a pointer to a `[3]T`.
  Parentheses never group types (`(*T)[]` is not a type).
- Because nothing follows a complete type, arrays of any element type are
  written directly: `[]map[string]int` (array of maps), `map[string][]int` (map
  to arrays), `[]func() int` (array of functions), and `func() []int` (a function
  returning an array).
- **Removed postfix syntax.** A `[` or `*` directly after a complete type is the
  old postfix syntax (`int[]`, `T[N]`, `T*`, `int*[]`), as is a bracket after
  `buffer<T>` (`buffer<T>[N]`). The compiler rejects it with a syntax error that
  names the prefix spelling:
  - `Square brackets go before the type for an array. Did you mean '[]int'?`
    (any form involving array brackets; `T*[]` suggests `[]*T`; `int[3][2]`
    suggests `[2][3]int`, preserving meaning);
  - `The pointer star goes before the type. Did you mean '*T'?`
    (`varint(4)[2]` suggests `[2]varint(4)`, and `varuint(8)*` suggests
    `*varuint(8)`);
  - `A buffer's size is its second type argument. Did you mean 'buffer<int, 4>'?`.
  In expressions, `Type[...]{…}`, `Type[...]`, `buffer<T>[n]`, `Name<…>[n]`, and
  `T[n]` where `T` is a built-in type name are reported by the parser; `T[n]`
  where `T` names a user-defined type (an index expression on a type) is
  reported by the type checker with the same message. Because an index always
  needs an expression, `x[]` in an expression is always reported this way.
  `ocean fix` (§15) rewrites all of these.
- **Angle-bracket closing.** When closing nested type arguments, a `>>` token is
  split into two `>`.
- **Casts** (`->`) accept, without parentheses, a single-token type (`int`,
  `MyType`, `any`), `varint(n)`/`varuint(n)`, `buffer<…>`, or a
  bracket-prefixed array type (`x->[n]int`);
  a following `*` is multiplication. Every other target must be parenthesized:
  `x->(*int)`, `x->(pkg.T)`, `x->(Box<int>)`.

### 3.4 Expressions

Operator precedence, highest first. All binary operators are left-associative;
ternary and assignment are right-associative.

| Level | Operators | Notes |
|---|---|---|
| Postfix | `x.f` `x.(T)` `x[i]` `x[a:b]` `f(args)` `f<T>` `T{…}` `x->T` `x++` `x--` | applied left to right |
| Unary (prefix) | `-x` `!x` `~x` `*x` `&x` `++x` `--x` `sizeof(…)` | |
| 10 | `*` `/` `%` | |
| 9 | `+` `-` | |
| 8 | `<<` `>>` | |
| 7 | `<` `<=` `>` `>=` | |
| 6 | `==` `!=` | |
| 5 | `&` | |
| 4 | `^` | |
| 3 | `\|` | |
| 2 | `&&` | |
| 1 | `\|\|` | |
| ternary | `c ? a : b` | `a` may be a comma expression; `b` is a ternary |
| assignment | `=` `+=` `-=` `*=` `/=` `%=` `^=` `&=` `\|=` `<<=` `>>=` | right-assoc, is an expression |
| comma | `a, b` | |

Consequences:

- The cast `->` is postfix and binds tighter than prefix operators:
  `*p->float` is `*(p->float)`; `-x->int` is `-(x->int)`.
- `&`, `^`, `|` bind more loosely than comparisons (as in C):
  `x & 3 == 3` is `x & (3 == 3)`.
- `x = y = 4` assigns 4 to both.

```
Primary     = Operand { Postfix } .
Operand     = literal | identifier | '_' | 'any' | 'null'
            | '(' Expr ')'
            | 'extern' '.' identifier
            | FuncLit
            | CompositeLit                      (* untyped: { ... } *)
            | ('mixed' | 'interface') Type CompositeBody
            | 'map' '[' Type ']' Type CompositeBody
            | ArrayType [ CompositeBody ]        (* []int{...}, [n]T allocation, [...]T{...} *)
            | 'buffer' '<' Type [ ',' BufferSize ] '>' [ CompositeBody ]
            | ('zero' | 'new' | 'make') '(' Type ')' .
ArrayType   = '[' [ Dimension | '...' ] ']' Type .
Postfix     = '.' identifier
            | '.' '(' Type [ CompositeBody ] ')'      (* assertion / extraction *)
            | '.' '(' 'type' ')'                      (* only in a type-switch header *)
            | '[' Expr ']' | '[' [ Expr ] ':' [ Expr ] ']'
            | TypeArgs                                (* see disambiguation *)
            | '(' [ Arg { ',' Arg } ] ')'
            | CompositeBody                           (* only after a name, a.b, or x<…> *)
            | '->' CastTarget | '++' | '--' .
Arg         = AssignExpr [ '...' ] .                  (* only the last argument may be spread *)
CompositeBody = '{' [ Entry { ',' Entry } [ ',' ] ] '}' .
Entry       = AssignExpr [ ':' AssignExpr ] .        (* all keyed or all positional *)
FuncLit     = 'func' Params [ Results ] Block .
```

**Type-argument disambiguation.** In an expression, `<` after an operand is
tried as a type-argument list. It is accepted as type arguments only if the
tokens parse as a comma-separated list of types closed by `>` (or the first half
of `>>`) **and** the following token is one of
`( { [ ; , ) ] } . => ` or end of input. Otherwise `<` is the less-than operator.

**Array types in expressions.** An operand that starts with `[` is a type. With
a literal body it is a typed composite literal (`[]int{1, 2}`, `[3]int{1}`,
`[...]int{1, 2}`, `[]*Node{&n}`). Without a body, `[n]T` allocates a new dynamic
array of `n` zero-valued elements (`n` evaluated once); `[]T` and `[...]T`
without a body are errors except as a `sizeof` operand. Likewise `buffer<T, n>`
without a body allocates a raw buffer of `n` elements, and `buffer<T>{…}` /
`buffer<T, N>{…}` are buffer literals. In `buffer<…>` only a buffer whose size
argument is present or that has a literal body is treated as a type in
expression position; a variable named `buffer` remains an ordinary value
(`buffer[1]`).

**`sizeof`.** `sizeof` followed by `(` parses a parenthesized expression. If the
operand denotes a type (a type name, `*T`, `Name<…>`, `[]T`, `[N]T`,
`buffer<T, N>`), it is `sizeof(Type)`; otherwise `sizeof(value)`.

**`zero`, `new`, `make`.** `zero(T)` is always builtin syntax. `new(T)` is
builtin when the parenthesized content is a type. `make(T)` is builtin when `T`
begins with `[` or `map`. A variable named `zero` is still allowed elsewhere.

**Comma and simultaneous assignment.** In an expression list `a, b = x, y`, the
parser rewrites `targets , … = values , …` into a single simultaneous
assignment when every item before `=` is an identifier, index, member, unary,
or instantiation expression.

### 3.5 Statements

```
Statement  = Block | VarDecl ';' | SimpleStmt ';' | IfStmt | ForStmt | SwitchStmt
           | MatchStmt | ReturnStmt | 'panic' Expr ';' | 'return' 'panic' Expr ';'
           | 'forward' 'panic' Statement | DeferStmt | LabeledStmt
           | 'break' [ identifier ] ';' | 'continue' [ identifier ] ';'
           | 'goto' identifier ';' | 'fallthrough' ';' | AsmStmt
           | TypeDecl | StructDecl | EnumDecl | InterfaceDecl | ';' .
Block      = '{' { Statement } '}' .
SimpleStmt = Expr .
VarDecl    = Names ':' [ Type ] [ '=' AssignExpr { ',' AssignExpr } ]
           (* at least one of Type or '=' initializer; ':=' is ':' '=' *) .
Names      = ( identifier | '_' ) { ',' ( identifier | '_' ) } .
ReturnStmt = 'return' [ AssignExpr { ',' AssignExpr } ] ( ';' | before '}' ) .
DeferStmt  = 'defer' CallExpr ';' .
LabeledStmt = identifier ':' Statement .
```

- A `return` immediately followed by `}` needs no semicolon (`{ return }`,
  `{ return x }`).
- **Label vs. declaration.** `name : …` is a declaration if what follows the
  colon is `=` (i.e. `:=`) or a complete type followed by `;` or `=`.
  Otherwise it is a label. To label an ambiguous statement, use a block:
  `name: { … }`.
- `forward` is contextual: it is a keyword only when directly followed by `panic`.
- `var` is not a keyword; there is no `var x = …` form.
- Named function declarations inside a function body parse but are rejected by
  the backend (*unsupported*). Use a function literal assigned to a variable.
- `func` at statement start inside a function followed by `(` begins an
  expression statement (an immediately invoked literal).

Remaining statement grammars are given in §10.

---

## 4. Packages, modules, and program structure

### 4.1 Packages and files

- A **package** is all `.oc` files in one directory (not subdirectories). A
  build location may be a directory or a `.oc` file; a file selects its
  containing directory.
- Every file in the directory must have the same package name. The package name
  must be an ASCII identifier (`[A-Za-z_][A-Za-z0-9_]*`).
- **File selection** (before parsing):
  - Files ending `_test.oc` are excluded from ordinary builds (§14).
  - Files whose base name (before `.oc` or `_test.oc`) ends in `_native` are used
    only for native targets; `_wasm` only when `OCARCH=wasm`. All other files are
    always used.
  - Only regular files are read.
- Files are processed in byte-wise lexicographic order of path.
- Package-level declarations (functions, types, structs, enums, interfaces,
  global variables) are shared across all files of the package. Two package-level
  declarations with the same name (in any files) are an error.
- **Imports and `extern` declarations are file-scoped** (§4.4, §11.6).
- A directory with no Ocean sources is an error.

### 4.2 Modules

A directory containing `ocean.mod` is a module root. The nearest enclosing
`ocean.mod` (searching upward) defines a package's module. Format (line based,
`//` or `#` comments, tokens may be quoted, `;` treated as whitespace):

```
module <module-path>
ocean <version>                       // accepted without version enforcement
require <module-path> <version>
require ( <module-path> <version> ... )
replace <module-path> => <directory-or-module> [<version>]
replace ( ... )
```

A module path consists of `/`-separated non-empty segments of
`[A-Za-z0-9._~-]`, excluding `.` and `..` segments.

### 4.3 Import resolution

An import path `P` from a package in module `M` resolves to the first of:

1. If `P` equals or begins with `M`'s module name followed by `/`: the corresponding
   directory under `M`'s root.
2. If `M.root/P` is a directory: that directory (module-relative import).
3. The standard library: `$OCEAN_SRC/P` if `OCEAN_SRC` is set, otherwise
   `<compiler-executable-dir>/../src/P`.
4. An external module: the longest `require`/`replace` entry that is a prefix of
   `P`; or, if none, a conventional `host/owner/repo` prefix (the first segment
   must contain a `.`). A `replace` to a path starting with `.` or `/` uses that
   local directory (relative to the module root); otherwise the module is cloned
   with `git clone --depth 1 [--branch <version>] https://<module>` into the cache
   (`$OCEAN_MOD_CACHE` or `~/.cache/ocean/modules/<module>@<version|latest>`). The
   fetched module must contain `ocean.mod` declaring the expected name (unless replaced).

Otherwise resolution fails. **Import cycles are errors.**

### 4.4 Import bindings

- The import name defaults to the imported package's declared name; when the
  imported directory is itself a module root, the default is the last segment of
  the import path.
- `import h "path"` / `import "path" as h` binds the name `h`.
- `import . "path"` makes the package's **exported** names usable unqualified in
  this file. If two dot imports provide the same name it is an error ("ambiguous").
  Names declared in the current package take precedence over dot-imported names.
- `import _ "path"` loads the package (it is initialized) without binding a name.
- Duplicate import names in one file are errors; an import name equal to a
  package-level declaration name is an error.
- A qualified reference is `name.Member` (expression) or `name.Type` (type). A
  local variable with the same name as an import shadows the import.

### 4.5 Exports and visibility

- A top-level function, global variable, type, struct, enum, or interface
  declared in package `p` is accessible from another package only if its name is
  exported (§2.2). Referencing an unexported or nonexistent member is an error.
- **Methods** follow the same rule: an unexported method cannot be called from
  another package. **Enum variants** likewise: an unexported variant name cannot
  be used from another package.
- **Struct fields are not access-controlled**: any field of an accessible struct
  value may be read and written from any package.
- The built-in `Result` and `Optional` types and all their variants and methods
  are accessible everywhere regardless of capitalization.

### 4.6 Program kinds

- If the root package is named `main`, the build is an **executable**; the
  package must declare `func main()` or `func main() int` (any other result type
  is rejected). A `main` function in an imported package is an ordinary function.
- Any other root package builds a **library** object; it cannot be `run`.

### 4.7 Built-in names and shadowing

The universe scope contains `Result` and `Optional` (§6.12). A package that
declares its own top-level `Result` or `Optional` (type, struct, enum,
interface, or function) shadows the built-in for that package only.

---

## 5. Declarations and scope

### 5.1 Scopes

Scopes nest: universe → package → file (imports, externs) → function →
blocks. A block is introduced by `{…}`, and also implicitly by `if`, `for`,
`switch`, `match`, each `case`/match arm, and each function body.

- Within one scope, two declarations with the same name are an error
  ("duplicate declaration"). An inner scope may shadow outer names.
- `_` declares nothing.
- **Order within a block.** Functions, structs, type declarations, enums, and
  interfaces declared in a block are visible throughout that block (they are
  pre-declared). Variables are visible only after their declaration.
- **Package scope.** All top-level names are visible throughout the package
  regardless of order. Global variables may reference each other in any order
  (see §13.2 for runtime values). If a global's type cannot be inferred because
  of circular inference, it is an error; give it an explicit type.
- Function parameters, named results, and the receiver share the function scope;
  duplicates among them are errors.

### 5.2 Predeclared value-like identifiers

`true` and `false` (type `bool`) are recognized by name. The builtin functions
`len`, `free`, `delete`, `recover` are recognized only when no user
declaration of that name is in scope; a local variable named `len` shadows the
builtin.

### 5.3 Variable declarations

```
x := expr;                 // inferred type
x: T;                      // zero-initialized (§7.6)
x: T = expr;
a, b := e1, e2;            // one initializer per name
a, b := f();               // one multi-result call supplies all
v, ok := m[k];             // checked forms (§9.4, §9.7)
_, y := f();
```

- With no initializer, the variable holds the zero value of `T`.
- Inference rules: an untyped integer literal infers `int`; a float literal
  `float`; a string literal `string`; an untyped composite literal infers a
  fixed array (§9.6); `null` cannot be inferred ("null requires an explicit
  pointer type").
- Declaring an uninitialized `array<T>`, an unsized `buffer<T>`, or a struct
  with value parameters (§6.7) without an initializer is an error. A
  runtime-sized buffer cannot have an initializer.
- `void` is never a variable type.

---

## 6. Types

### 6.1 Overview

| Category | Spelling |
|---|---|
| Signed integers | `i8`, `i16`, `i32`, `int` (= `i64`) |
| Unsigned integers | `u8`, `u16`, `u32`, `uint` (= `u64`) |
| Parameterized integers | `varint(n)` (signed), `varuint(n)` (unsigned), 1 ≤ n ≤ 8,388,608 |
| Floating point | `f32`, `float` (= `f64`) |
| Boolean | `bool` |
| String | `string` |
| No value | `void` (only as an extern result or `*void`) |
| Dynamic interface | `any` (= `interface{}`) |
| Pointer | `*T` (arrays of pointers: `[]*T`, `[N]*T`) |
| Fixed array | `[N]T`, `[n]T` (runtime length), `[...]T` (literals only) |
| Length-erased array | `array<T>` |
| Dynamic array | `[]T`, `mixed []I` |
| Raw buffer | `buffer<T, N>`, `buffer<T, n>`, `buffer<T>` (unsized), `buffer` (family) |
| Map | `map[K]V` |
| Struct | `struct Name<…>(…) {…}` declarations |
| Enum | `enum Name<…> {…}` declarations |
| Interface | `interface Name<…> {…}` declarations, `interface {…}` literals |
| Function | `func(P…) R`, `func(P…) (R1, R2)` |
| Defined/alias | `type N T`, `type N = T` |

`i64`/`int`, `u64`/`uint`, and `f64`/`float` are identical pairs. The table
above is the complete set of built-in scalar types; there are no `byte`
or `rune` types (those names are ordinary identifiers, and a program may
declare them, e.g. `type byte = u8;`). Using an undeclared `byte` or `rune` as
a type is an "unresolved type" error.

**Unsupported:** `chan T`; anonymous `struct {…}` type expressions. Structs cannot
be indexed.

### 6.2 Numeric types

- Integers are two's complement with the stated width. `bool` is 1 bit of
  information (stored as LLVM `i1`).
- `float` is IEEE-754 binary64; `f32` binary32.
- Arithmetic on integers **wraps** modulo 2ⁿ of the operation's type.

#### 6.2.1 Parameterized integers: `varint(n)` and `varuint(n)`

`varint(n)` is a signed two's-complement integer of exactly `n` bits, including
the sign bit, with range −2ⁿ⁻¹ through 2ⁿ⁻¹−1. `varuint(n)` is unsigned, with
range 0 through 2ⁿ−1. The width `n` must be an integer literal from 1 through
8,388,608 (LLVM's maximum integer width); a name, constant expression, or
out-of-range width is a syntax error.

```
small: varint(4) = -3;
counter: varuint(256) = 0;
mask := 0xff->varuint(12);
```

- **Identity.** Each width and signedness is its own built-in type.
  `varint(32)` is not identical to `i32`, and `varint(64)` is not identical to
  `int`. They interconvert implicitly by the ordinary integer widening rules
  (§7.2): `varint(32)` and `i32` are mutually assignable, as are `varint(64)` and
  `int`, `i8` is assignable to `varint(8)`, and `varuint(8)` to `varint(9)`.
- **Named types.** `type nibble varint(4);` defines a distinct type, converted
  with `3->nibble` and `x->int`. Untyped literals do not convert to it
  (§7.2). An alias `type nibble = varint(4);` is identical to `varint(4)`.
  Prefer a named type over repeating a width.
- **Storage.** A value occupies the target ABI's allocation size and alignment
  for an `n`-bit integer, which is always whole bytes. On x86-64,
  `sizeof(varint(1))` and `sizeof(varint(4))` are 1, `sizeof(varint(12))` is 2,
  `sizeof(varint(24))` is 4, `sizeof(varint(65))` is 16, and
  `sizeof(varuint(256))` is 32.
- **Arithmetic** wraps at the type's width: a `varint(4)` holding 7 becomes −8
  after `++`, and a `varuint(4)` holding 15 becomes 0. `varuint` division,
  remainder, comparison, and `>>` are unsigned. Result types are given in §9.2.
- **Conversions.** Widening sign-extends `varint` and zero-extends `varuint`.
  Narrowing requires `->` and truncates to the low `n` bits
  (`300->varint(8)` is 44). Signed to unsigned always requires a cast.
- **Containers.** Parameterized integers may be array, dynamic-array, pointer,
  map, and buffer elements (`[3]varint(4)`, `[]varuint(8)`, `*varint(12)`), and
  struct fields, including bitfields (§6.7.1).
- **Boxing.** Boxing in `any` preserves the exact type, so `boxed.(varuint(128))`
  recovers it. Values wider than 64 bits are boxed in owned heap storage that is
  copied with the box.

### 6.3 Strings

`string` is an immutable sequence of bytes. It is a heap-backed dynamic array
of `i8` (§6.6) whose capacity always equals its length.

- `len(s)`, `s.length`, `s.capacity`, `s.size` all give the byte count.
- `s[i]` reads the byte at `i` as an `i8` (signed), with bounds checking.
- Strings cannot be mutated: element assignment, `&s[i]`, `append`, `prepend`,
  `add`, `remove`, `pop`, and compound assignments other than `=` and `+=` are
  errors. `s.data` is permitted only as a function-call argument (§11.6).
- Reassignment and `+=` produce a new independent string.
- `string` and `[]i8` are mutually assignable and convertible; conversion copies
  bytes (a mutable copy never aliases the string).
- Comparisons: see §9.3.

### 6.4 Pointers

`*T` points to a value of type `T`. `*void` is an untyped address.

- Pointers are **non-owning** (§12).
- `ip: *int = 5;` initializes a pointer to address `0x5`. An integer
  initializer in a declaration with an explicit pointer type supplies the
  address. An explicit cast can also supply an address, as in
  `ip := 5->(*int);`. Neither form allocates storage. Subsequent assignments
  and function arguments require an explicit cast for integer addresses.
- For a pointer `p` to a sized type and an integer `n`, `p + n`, `n + p`,
  and `p - n` offset the address by whole elements and preserve the pointer
  type. `p += n`, `p -= n`, `++`, and `--` update the pointer in place.
  Arithmetic traps on the reserved `null` marker. It does not check bounds.
- Subtracting two pointers of identical type into the same array, including its
  one-past-the-end address, gives their signed difference in elements as an
  `int`. The element size must be nonzero. Only dereference pointers to live
  elements.
- `null` is assignable to pointers, interfaces (including `any`), and
  `Optional<T>`. Pointers compare with `==`/`!=`.
- An uninitialized pointer (or `zero(*T)`) is the **zero address**, which is
  **not equal** to `null`. `null` uses a distinct reserved marker; dereferencing
  `null` traps.
- `*T` and unsized buffer pointers convert implicitly to `*void` in assignment,
  arguments, returns, comparisons, and ternaries; the reverse requires a cast.
  This does not apply through more levels of indirection (`**T` ↛ `**void`).
- Pointers to `string` and pointers to mutable values (e.g. `*[]i8`) are not
  inter-convertible even with a cast.
- Member access through a pointer auto-dereferences: `p.field`, `p.method()`.

### 6.5 Fixed arrays: `[N]T`, `[n]T`, `array<T>`

An array is a value holding a fixed number of elements, preceded (in memory) by
an immutable `int` header holding the **payload size in bytes**.

- `[N]T` with `N` a constant integer has a static length that is part of the
  type. `N` must be nonnegative.
- `x: [n]T` with a runtime `n` allocates an array of that length (evaluated once)
  with stack lifetime.
- `[...]T{e1, …}` infers `N` from the number of entries (only valid with a literal body).
- `array<T>` is an array of `T` whose length is not part of the static type. It
  is valid for parameters, results, and variables initialized from an existing
  array. It cannot construct values: `array<T>{…}`, `zero(array<T>)`,
  `new(array<T>)`, and an uninitialized `array<T>` variable are errors. Bare
  `array` is not a type.
- Operations: `len(a)` (element count = `a.size / sizeof(T)`), `a.size`
  (read-only, bytes), `a.data` (§6.8), checked indexing, two-value indexing
  (§9.7), slicing, `range`, `==`/`!=`, `+`/`+=` (§9.3).
- `sizeof([N]T) = 8 + N*sizeof(T)` plus alignment; the header is included.
- Empty structs occupy one byte so array lengths remain recoverable.
- Array values have **value semantics**: assignment, argument passing, and
  returns copy all elements deeply (§12).
- `a.data = …` copies into the existing payload (§10.3); compound assignment to
  `.data` is an error; `&a.data` is an error; `.size` cannot be assigned or have
  its address taken.

### 6.6 Dynamic arrays: `[]T`

A dynamic array has a header (length, capacity, data pointer) and heap-allocated
elements. It can grow.

- Construct with `make([]T)` (empty), a literal `[]T{…}` or `{…}` in a `[]T`
  context, an uninitialized declaration `x: []T` (empty), `zero([]T)` (empty),
  slicing, or the expression `[count]T` (a dynamic array of `count`
  zero-valued elements; legacy form).
- Fields: `.length`, `.capacity` (read-only `int`), `.size` (payload bytes),
  `.data` (a `buffer<T>` view of the elements).
- Methods (not available on strings):

  | Method | Effect |
  |---|---|
  | `append(v…)` | add values at the end |
  | `prepend(v…)` | add values at the beginning |
  | `add(i, v…)` | insert values before index `i` |
  | `remove(i) T` | remove and return element `i`; later elements shift left |
  | `pop() T` | remove and return the last element |
  | `array() array<T>` | independent fixed-array copy of current elements |

  The last argument of `append`/`prepend`/`add` may be spread with `...` (an
  array or dynamic array). Invalid `remove` indices and `pop` on an empty array
  are runtime bounds errors. `array()` also works on strings, yielding a mutable
  `array<i8>`.
- A mutation method requires a writable (non-immutable) dynamic array.
- `free(d)` releases the backing storage early; using `d` afterwards (in the
  same function, before reassigning it) is a compile error.
- **`mixed []I`** (where `I` is an interface or `any`) allows elements of
  different concrete types, each satisfying `I`. A non-mixed `[]I` is
  **homogeneous**: all elements must have the same concrete type (checked at
  compile time for literals and at runtime otherwise). `mixed` is only valid
  before an array type ending in `[]` whose element is an interface.

### 6.7 Structs

```
StructDecl  = 'struct' identifier [ TypeParams ] [ ValueParams ] '{' { FieldDecl } '}' .
ValueParams = '(' [ ValueGroup { ',' ValueGroup } [ ',' ] ] ')' .
ValueGroup  = identifier { ',' identifier } Constraint .
FieldDecl   = identifier { ',' identifier } Type [ ':' int_lit ] ';' .
```

- Fields are `name Type;`; grouped names share a type (`x, y int;`).
- **Value parameters** `struct Config(size int, tag string) { value int; }`
  declare immutable fields placed **before** the body fields, in parameter
  order. The full field order is value parameters then body fields. Value
  parameters must be named and not variadic; they must not duplicate type
  parameters or body fields.
- Value-parameter fields cannot be assigned, incremented, compound-assigned, or
  have their address taken. Elements reachable through a buffer/pointer held in
  such a field remain writable.
- Every literal of a struct with value parameters must initialize all value
  parameters; a declaration of such a struct requires an initializer.
- Recursive inline struct values are rejected; recursion must go through pointers.
- Runtime-sized buffers cannot be fields.
- Struct values are copied by value (deeply for owned contents, §12).
- Structs cannot be passed or returned by value through `extern` functions.

#### 6.7.1 Bitfields

A field declared `name T : size;` is a **bitfield** that stores only `size` bits.

```
struct Flags { low uint : 4; high uint : 4; ready bool : 1; }
```

- `size` is an integer literal from 1 through 64 (a syntax error otherwise) and
  must not exceed the bit width of `T` (`bitfield size exceeds its type width`).
  This 64-bit limit applies even when `T` is a wider parameterized integer.
- `T` must be an integer type, a parameterized integer, a defined type or alias
  of one, or `bool` with size 1. Other types are rejected
  (`bitfield requires an integer or bool type`).
- Grouped names share the size: in `a, b u8 : 3;` each field has 3 bits.
- **Packing.** Consecutive bitfields are packed in declaration order, starting at
  the least significant bit, into one storage unit, until the next bitfield would
  take the unit past 64 bits. That field starts a new unit, and an ordinary field
  ends the unit. A unit is an integer of the unit's total bits rounded up to whole
  bytes, laid out with that integer's ABI size and alignment. On x86-64, `Flags`
  above has size 2, `struct { a u8 : 4; b u8 : 4; }` has size 1,
  `struct { a u64 : 32; b u64 : 32; }` has size 8, and
  `struct { a u64 : 40; b u64 : 40; }` uses two units and has size 16.
- **Reads** produce a value of type `T`. Signed fields sign-extend from the
  field width, so storing 5 in an `int : 3` field reads back −3.
- **Writes** truncate to the field width and leave neighboring fields unchanged.
- A bitfield is not addressable: `&s.field` is an error, and so is calling a
  pointer-receiver method on a bitfield, which would take its address implicitly.
- **Warning.** When `T` is written directly as `varint(n)` or `varuint(n)` and
  `size < n`, the compiler warns (`bitfield size 5 is smaller than explicit
  varint(6)`) and compiles the field. Named types and aliases are exempt:
  `type nibble varint(4); struct P { low nibble : 3; }` compiles silently.

### 6.8 Raw buffers

Buffers are unchecked contiguous storage, used mainly for C interop.

- `buffer<T, N>` — fixed-size inline storage of `N > 0` elements (constant `N`).
- `x: buffer<T, n>` — runtime-sized stack storage, evaluated once; elements
  uninitialized; no initializer allowed; not allowed for globals or in type declarations.
- `buffer<T>` — an unsized raw pointer to elements, with no length. As a
  constraint or type-switch case it also matches buffers of element `T` of any
  size. A local unsized buffer requires an initializer (an existing buffer, an
  extern result, or a literal, which allocates backing storage).
- `buffer` — the family of all buffers; only usable as a constraint or
  parameter type; must be narrowed (type switch) before indexing.
- Indexing a buffer is **not** bounds-checked. Buffers have no members.
- `len(b)` works only on buffers with a statically known length.
- Passing a sized buffer to a `buffer<T>` parameter passes its address; buffer
  parameters erase their length. A sized cast `p->buffer<T, n>` restores length metadata.
- Assigning or passing an unsized buffer copies the pointer (aliasing).
- Element types must have a fixed storage size.
- An array's `.data` has type `buffer<T>`.

### 6.9 Maps

`map[K]V` is a built-in hash map. `K` and `V` are any storage types except `void`.

- Construction: `map[K]V{k: v, …}`, contextual `{k: v}`, `make(map[K]V)`,
  `zero(map[K]V)`, or an uninitialized declaration (empty map). Map literals
  require `key: value` entries.
- `m[k]` reads; if `k` is absent this **panics** ("map key does not exist").
- `v, ok := m[k]` returns the value and `true`, or `zero(V)` and `false`. Reads
  never insert.
- `m[k] = v` inserts or replaces; compound assignment `m[k] += 1` is allowed.
- `len(m)` is the number of entries. `delete(m, k)` removes `k` if present
  (absent keys are ignored); `m` must be writable.
- `for (k, v := range m)` iterates a snapshot in unspecified order; a single
  binding receives keys.
- `&m[k]` is an error.
- Keys use Ocean equality (§9.3): strings and aggregates by content, pointers by
  address, boxed numbers numerically (so `1` and `1.0` are the same key in a
  `map[any]V`); `+0.0 == -0.0`; NaN never matches.
- Interface key/value types always permit mixed concrete types; there is no
  `mixed` modifier for maps.
- Map types are invariant: `map[K]V` is assignable only to the identical map type.
- Map copies are deep; map equality compares entries regardless of order.

### 6.10 Enums

```
EnumDecl   = 'enum' identifier [ '<' TypeParamList '>' ] '{' [ Variant { ',' Variant } [ ',' ] ] '}' .
Variant    = identifier                                    (* unit *)
           | identifier '(' Type { ',' Type } ')'          (* tuple *)
           | identifier '{' Field { (',' | ';') Field } [ ',' | ';' ] '}'   (* record *)
           | identifier ':' '=' Expr                       (* fixed value, inferred type *)
           | identifier ':' Type '=' Expr                  (* fixed value, explicit type *)
           | identifier '=' Expr .                         (* fixed value *)
Field      = identifier { ',' identifier } Type .
```

- Enums are nominal tagged unions. Variant names are scoped to the enum; names
  must be unique within an enum. Generic enums must use `<…>` (not `[…]`).
- Each variant's tag is its zero-based declaration index.
- **Construction:**
  - unit: `E.V` (also `E<T>.V`)
  - tuple: `E.V(a, b)` (argument count must match; spread not allowed)
  - record: `E.V{x: 1, y: 2}` (or positional)
  - fixed: `E.V` (the variant's fixed payload is evaluated on construction)
  - Generic enums require explicit type arguments: `Result<int>.value(42)`.
  - A tuple or record variant used without construction is an error, except as a
    comparison selector or pattern.
- **Selector comparison:** `e == E.V` / `e != E.V` tests only the tag. Comparing
  two enum *values* compares tag and payload. Comparing different enum types, or
  different specializations, is an error.
- **Extraction** `e.(E.V)`:
  - tuple with one field → that field; with several → a multi-value, unpacked
    as `a, b := e.(E.V)` (use `_` to discard);
  - record → the whole payload record (immutable fields, accessible by name);
    `x, y := e.(E.V{y, x})` binds by field name (order of names on the left
    determines binding; `alias = field` renames);
  - fixed → the fixed value; unit → error.
  - If `e` does not hold `V`, the program **traps** (abnormal termination, no
    diagnostic).
  - `E.V` without type arguments infers the specialization from `e`; explicit
    type arguments must match.
- Payload fields are immutable.
- **Methods** may be declared on enums (value or pointer receivers), including
  generic receivers `func (r Result<T>) m() T`. A method name must not equal a
  variant name or any record payload field name. Enum methods are called on
  values; `E.m(v)` is not valid.
- `zero(E)` and an uninitialized enum variable hold variant 0 with a zero payload.
- Enum type switches are rejected; use `match` (§10.9).

### 6.11 Interfaces

```
InterfaceDecl = 'interface' identifier [ TypeParams ] '{' InterfaceBody '}' .
InterfaceBody = { MethodSpec } | Constraint [ ';' ] .
MethodSpec    = [ 'func' ] identifier [ TypeParams ] Params [ Results | Type ] ';' .
```

An interface body contains **either** method signatures **or** exactly one
type list; mixing them is an error.

- Method signatures have an implied receiver. Parameter names are optional
  (but named/unnamed may not be mixed). Methods may have constrained type
  parameters. Duplicate method names are errors.
- `any` ≡ `interface{}`.
- **Method satisfaction:** a type `S` (struct, enum, or defined type) or `*S`
  satisfies a method interface if, for every required method, `S` declares a
  method with the same name, the same number of type parameters with equivalent
  constraints, the same number of parameters and results, the same variadic
  flag, and identical parameter/result types (names ignored). A method with a
  **pointer receiver** is satisfied only by a `*S` value; value-receiver methods
  are satisfied by both `S` and `*S`.
- A type-list interface is satisfied by any type in its list (§7.3). A
  single-term type list naming another interface embeds it (methods are
  inherited); union terms contribute no methods.
- Interface values (including `any`) are **boxed**: they hold a concrete value
  and its dynamic type. Their zero value is `null`. Calling a method on a null
  interface panics ("method call on null interface").
- Method calls on interface values dispatch to the concrete receiver.
- Interfaces with type parameters cannot be satisfied as value types.

### 6.12 Built-in `Result<T>` and `Optional<T>`

Both are available in every package without imports and behave exactly as if
declared as follows (with public lowercase variants/methods):

```ocean
enum Result<T> { value(T), error(string) }
func (r Result<T>) hasError() bool        // tag == error
func (r Result<T>) error() string         // error string; else return panic "Result.error() called on a value result"
func (r Result<T>) unwrap() T             // value; else return panic <error string>
func (r Result<T>) unwrapOrElse(fallback T) T   // value; else fallback (fallback always evaluated)
func (r Result<T>) unwrapOrZero() T       // value; else zero(T)

enum Optional<T> { none, value(T) }
func (o Optional<T>) hasValue() bool
func (o Optional<T>) unwrap() T           // value; else return panic "Optional.unwrap() called on none"
```

- For `Optional<T>`: `null` is assignable and converts to `none`; `o == null`
  tests for `none`; zero value is `none` (tag 0). `Optional<T>.value(null)` is a
  present value.
- `unwrap` uses `return panic` (§11.5), so the panic location is the caller's call site.
- The `error()` method intentionally shares its name with the `error` variant.

### 6.13 Function types

Function types begin with `func`, followed by the parameter list and optional
results. Write `func(P1, P2) R` for one result, `func(P) (R1, R2)` for multiple
results, or `func()` for no parameters or results. Parameter names are permitted
and ignored for identity. A final `...T` marks a variadic parameter.

- Two function types are identical when they have the same number of
  parameters and results, the same variadic flag, and identical parameter and
  result types.
- Function values are closures (§11.8). An uninitialized function variable
  panics if called. Function values cannot be passed to C as function pointers.
- Generic functions must be specialized (`f<int>`) before use as values.
- Equality compares identity: copies of a closure are equal; separately created
  closures are not.

### 6.14 Type declarations

```
TypeDecl = 'type' identifier [ '=' ] Type ';' .
```

- `type N T` (**definition**) creates a new type with `T`'s representation and
  operations but a distinct identity. It is not assignable to/from `T` or other
  definitions; convert explicitly with `->`. Methods are not inherited from `T`.
  Untyped literals do not implicitly convert to a defined type (write `1->N`).
  Arithmetic between two values of the same numeric definition yields that type.
- `type N = T` (**alias**) is another name for exactly `T` (shares methods,
  identity, everything). Generic arguments may be applied through an alias to a
  generic struct.
- `void` cannot underlie a definition. Runtime-sized buffers cannot be used in
  type declarations. Cyclic aliases and cyclic definitions not broken by
  indirection (pointer, array, map, etc.) are errors.
- Type declarations may appear in function bodies (block-scoped).

### 6.15 Generics

```
TypeParams    = '<' TypeParamList '>' .
TypeParamList = TypeParamGroup { ',' TypeParamGroup } .
TypeParamGroup = identifier { ',' identifier } [ Constraint ] .
```

- Functions, methods, structs, enums, and interfaces may declare type parameters.
  Square brackets are not accepted for enums; for functions/structs/interfaces
  the parser accepts `[` as a start token but the canonical form is `<…>`.
- An omitted constraint means `any`; in a group like `<T, U any>` the constraint
  applies to all names in the group; `<T, U>` gives both `any`.
- **Explicit type arguments are required** for generic function calls
  (`f<int>(x)`), generic method calls (`b.pair<bool>(true)`), struct literals
  (`Box<int>{…}`), and enum construction. There is no type-argument inference.
- **Receiver type parameters**: in `func (b *Box<T>) m()`, `T` is a fresh name
  bound positionally to the receiver's type arguments, inheriting the struct's
  constraint. Receiver arguments must be fresh identifiers (not existing type
  names); their count must equal the struct's type-parameter count; method type
  parameters must use different names.
- Each distinct list of concrete type arguments produces a separate
  specialization (monomorphization).
- Generic bodies are checked once, universally: every operation must be valid
  for every type the constraint admits (§9.2). `==`/`!=` are always available.

---

## 7. Type relations

### 7.1 Identity

Types are identical if they are the same named declaration with identical type
arguments; or structurally equal composite types (same kind, identical
elements, same lengths/sizes, same `mixed` flag); or the same built-in type
(treating `i64`≡`int`, `u64`≡`uint`, `f64`≡`float`). Defined types are identical
only to themselves. An empty `interface{}` is identical to `any`.

### 7.2 Assignability (implicit conversion)

A value of type `A` is assignable to destination `D` (in declarations,
assignments, arguments, returns, composite elements, `+=` operands) if:

1. `A` and `D` are identical (after alias resolution), or
2. both are integer types and every value of `A` fits in `D`: same signedness
   with `width(D) ≥ width(A)`, or `A` unsigned, `D` signed and
   `width(D) > width(A)` (e.g. `u8`→`i16`, `i8`→`i32`; not `int`→`i8`, not
   `u64`→`int`, not signed→unsigned), or
3. `A` is `f32` and `D` is `float` (`f64`), or
4. `D` is `any`, or `D` is an interface `A` satisfies, or `A` is itself an
   interface/`any` and `D` is an interface, or
5. `A` is `null` and `D` is a pointer, interface, `any`, or `Optional<T>`, or
6. `D` is `*void` and `A` is a pointer or unsized buffer, or
7. `D` is a type list / type-set interface `A` belongs to (§7.3), or
8. `D` is a generic family (bare generic struct name `Box`, `buffer`,
   `buffer<T>`, `array<T>`) that `A` belongs to (§7.3), or
9. `A` and `D` are `string` and `[]i8` (either direction; copies), or
10. arrays, buffers, and dynamic arrays of the same kind whose element types are
    compatible and, for integers, convert exactly in the element direction, with
    equal static lengths. (`[]i8` is **not** assignable to `[]i32`.)
11. A fixed array `[N]T` is assignable to `array<T>`; an unsized-buffer
    destination accepts a sized buffer (by address).

Converting an already-typed `float` (`f64`) value to `f32` requires an
explicit cast. A literal can take the destination type, as in
`small: f32 = 1.5;`.

Boxing a value in `any` preserves its concrete type, including the identity
of a defined type. For example, given `type Count int;`, assigning
`boxed: any = 5->Count;` stores a `Count` that can be recovered with
`boxed.(Count)`.

Integer **literal** values (an integer literal, optionally negated) are
additionally assignable to any integer type whose range contains the value, and
to any floating type (they become float literals). Literals out of range are an
error ("integer literal is out of range"). An untyped literal does not convert
to a defined type.

An `any` value is **not** implicitly assignable to an array, dynamic array, or
map destination; use an assertion.

### 7.3 Constraints, type lists, and families

A constraint is a union of terms `T1 | T2 | ~T3`.

- An exact term `T` matches `T` and its aliases, preserving integer width and
  defined-type identity (`int | float` does not admit `i8` or `type ID int`).
- `~T` matches any type whose underlying representation is identical to `T`'s,
  including defined types (`~int` admits `type ID int`, not `i32`).
- A term naming a type-list interface expands to its terms; a term naming a
  method interface requires satisfying that interface.
- **Families** (directional; a family value does not satisfy a concrete type):
  - A bare generic struct/enum name `Box` admits every specialization; `Box<int>`
    admits only that one; `Box<Box>` admits `Box<Box<int>>` etc.
  - `buffer` admits any buffer; `buffer<T>` admits buffers of element `T` of any length.
  - `array<T>` admits arrays of `T` of any length; `array<any>` any array. Not
    dynamic arrays or buffers.
  - `mixed []I` as a constraint admits `mixed []I`, homogeneous `[]I`, and `[]C`
    where `C` satisfies `I`.
- Type arguments do not undergo numeric conversion: `Box<i8>` does not satisfy `Box<int>`.
- A type list may be used directly as a parameter or result type
  (`func f(x, y int | float) int | float`). Such a value is boxed; operations
  dispatch on its runtime type. A narrower numeric argument is widened to the
  first listed term it fits (e.g. an `i8` literal/value to `int`; `f32` to `float`).
- A set fits another set only if every term of the first is covered by the second.

### 7.4 Untyped literals and default types

Integer literals and character literals are untyped: they take the type demanded
by context when the value fits (§7.2), and otherwise default to `int` (or the
`uint`, `varuint(k)`, or `varint(k)` type given in §2.5 when the value is
outside the `int` range). In a binary operation with a typed integer operand, the
literal takes the other operand's type if it fits. For example,
`y: i8 = -2;` and `z: u32 = 531;` use the stated integer types.

A floating-point literal, optionally negated, takes type `f32` in an
initializer, assignment, compound assignment, argument, return, or composite
element that expects `f32`. Otherwise it defaults to `float`. String literals
are `string`.

### 7.5 Explicit conversions (`x->T`)

`x->T` is valid when any of the following hold:

- `x` is assignable to `T`, or their underlying representations are compatible
  (this covers conversion between a defined type and its underlying type, and
  between layout-equivalent definitions);
- both are numeric or `bool`:
  - int → int: truncate or sign/zero-extend according to the **source** signedness;
  - float → int: truncate toward zero (out-of-range results are undefined);
  - int → float: nearest representable value;
  - float → float: round to nearest;
  - number → `bool`: `true` iff the value is nonzero;
  - `bool` → number: 0 or 1;
- both are pointers / buffers / fixed arrays (reinterpretation of address);
- pointer/buffer ↔ integer (address conversion);
- `p->buffer<T, n>` restores a length on a buffer view; `p->[n]T` views a buffer as
  an array of length `n`.

Casting between pointers to `string` and pointers to mutable types is an error.
`any`/interface values are converted with assertions (§9.8), not casts.

### 7.6 Zero values

| Type | Zero value |
|---|---|
| numeric | `0` |
| `bool` | `false` |
| `string` | `""` |
| `[]T` | empty dynamic array |
| `[N]T` | `N` zero elements |
| `buffer<T, N>` | `N` zero elements |
| `map[K]V` | empty map |
| pointer, `*void` | zero address (≠ `null`) |
| interface, `any` | `null` |
| struct | every field (including value parameters) zero |
| enum | variant 0 with zero payload (`Optional` → `none`) |
| function | uninitialized (calling it panics) |

`zero(T)` produces this value. It is rejected for `void`, `any` (the literal
type `any`; a type parameter is fine), bare `buffer`, `array<T>`, and
runtime-sized buffers.

---

## 8. Constant expressions

Array/buffer dimensions in types are expressions over integer literals and
names. A dimension that is a single integer literal is a compile-time length.
Any other dimension is evaluated at runtime (once, at the declaration) and must
have integer type. Negative literal counts are errors.

There are no named constants; `sizeof` and `zero` are compile-time constants.

---

## 9. Expressions

### 9.1 Evaluation order

- Operands of binary operators are evaluated left to right, each exactly once;
  the left value is captured before evaluating the right.
- `&&` and `||` short-circuit.
- Call arguments are evaluated left to right; array arguments are copied as
  they are evaluated.
- `sizeof(expr)` does not evaluate `expr`.
- The ternary evaluates the condition, then exactly one branch.

### 9.2 Arithmetic and bitwise operators

| Operators | Operand types | Result |
|---|---|---|
| `+ - * /` | numeric | see below |
| `%` `<<` `>>` `&` `\|` `^` | integer only | see below |
| unary `-` | numeric | operand type |
| unary `~` | integer | operand type |
| `+` | `string`, `string` | new concatenated `string` |
| `+` | pointer and integer, in either order | pointer type (§6.4) |
| `-` | pointer and integer | pointer type (§6.4) |
| `-` | pointers of identical type | `int` (§6.4) |
| `+` | arrays / dynamic arrays | §9.3.3 |

**Result type of numeric binary operators** (non-assigning):

- If either operand is floating: the result is the floating type (if both are
  floating and differ, `float`). Integer operands are converted.
- Both integers with the same width and signedness: that type.
- Same signedness, different widths: the wider width, but at least 64 bits.
  Operands up to 64 bits give `int` (signed) or `uint` (unsigned), so
  `varint(4) + varint(8)` is `int`. A wider operand gives `varint(w)` or
  `varuint(w)` for the wider width `w`.
- Mixed signedness with both operands at most 64 bits: `int` if the unsigned
  operand is narrower than 64 bits; otherwise it is an error ("mixed signed and
  unsigned integers require an explicit -> cast").
- Mixed signedness with an operand wider than 64 bits: `varint(w)`, where `w` is
  the larger of the signed width and the unsigned width plus one, so
  `varint(100) + varuint(100)` is `varint(101)`. It is an error if `w` would
  exceed 8,388,608.
- These rules also apply to `==`/`!=` and ordering comparisons.
- Defined numeric types: both operands must be the identical defined type; the
  result has that type.

Semantics:

- Integer `+ - *` wrap. `/` truncates toward zero; `%` has the sign of the
  dividend; unsigned types use unsigned division/remainder.
- **Integer division or remainder by zero, `INT_MIN / -1`, and shifts by a count
  ≥ the operand width (or negative) are undefined behavior** (ocean-c emits raw
  LLVM `sdiv/udiv/srem/urem/shl/ashr/lshr`; on x86-64 division by zero
  terminates the process with SIGFPE).
- `>>` is arithmetic for signed types and logical for unsigned types.
- Float operations follow IEEE-754 (`%`, bit operators, and `~` are not
  defined on floats).
- `bool` supports only `!`, `&&`, `||`, `==`, `!=`.

**Compound assignment** `x op= y` is `x = x op y` with `x` evaluated once; the
result must be assignable back to `x`'s type.

**Increment/decrement** `x++`, `x--`, `++x`, `--x` require a writable numeric
or arithmetic-capable pointer operand (§6.4). Postfix forms yield the old
value, and prefix forms yield the new value.

**In generic/interface bodies**, an operator is permitted only if it is valid for
every type the operands' constraints admit: `int | float` allows arithmetic and
ordering; integer-only operators need integer-only lists; `any` allows only
equality. Operands typed by the same type parameter share one concrete type;
operands typed by an interface/type-list parameter may differ, so the operation
must be valid for all pairs.

### 9.3 Comparison operators

All comparisons produce `bool`.

**Ordering** `< <= > >=`: numbers (numeric rules above; floats: IEEE, NaN
unordered) and strings. String ordering is lexicographic by **unsigned byte
value**, including embedded NULs; a proper prefix orders first. No locale or
Unicode normalization.

**Equality** `== !=` is defined for every type, including unconstrained type
parameters:

- numbers: numeric equality after the usual conversions; `+0.0 == -0.0`; NaN ≠ NaN.
- strings and `[]i8`: content equality.
- structs: field-by-field recursive equality (padding ignored).
- arrays / dynamic arrays / fixed buffers: equal length and element-wise equal
  (capacity and address ignored). Fixed, runtime-sized, and dynamic arrays with
  matching element types are comparable; different lengths compare unequal.
- unsized buffer views and pointers: address equality (pointees are not compared).
- enums: tag and payload; against a selector `E.V`: tag only.
- maps: same set of entries.
- functions: closure identity.
- `any`/interface values: compare by dynamic type; different dynamic types are
  unequal, except that boxed numbers compare numerically (`1 == 1.0`).
- `null`: compared with pointers, interfaces, `any`, `Optional`.
- `*void` may be compared with any pointer.

Operand types must otherwise be compatible (e.g. comparing a struct with an
unrelated struct is an error).

#### 9.3.3 Array and string concatenation

- `string + string` concatenates. A `string` may also be combined with one
  compatible byte value: `s + 'd'`, `'z' + s`.
- `A + B` where both are dynamic arrays of the same type: new dynamic array of
  all elements of `A` followed by `B`.
- `A + e` / `e + A` where `e` is compatible with the element type: append/prepend one element.
  For `[][]int + []int` the right side is one element.
- Fixed arrays: `[N]T + [M]T` is `[N+M]T` (or `array<T>` if a length is not static).
- `A += B` / `A += e` replace `A` with the concatenation; `A` must be a
  writable variable. `+=` cannot widen an element type to `any`.
- Operands are unchanged; elements are copied by value. Two raw buffers cannot be added.

### 9.4 Indexing

- Arrays, dynamic arrays, and strings: `x[i]` with integer `i`; checked at
  runtime (`0 ≤ i < len(x)`), including for writes, compound assignments, and
  increments. An out-of-range index is a fatal runtime error (§13.4).
- Two-value form `v, ok := x[i]` (or `v, ok = x[i]`) on arrays, dynamic arrays,
  and maps: no trap; on failure `v` is `zero(T)` and `ok` is `false`.
- Buffers: unchecked; `.data[i]` is unchecked.
- Maps: §6.9.
- Strings cannot be indexed for writing.

### 9.5 Slicing

`x[a:b]`, `x[:b]`, `x[a:]`, `x[:]` on arrays, dynamic arrays, strings, and typed
buffers. Omitted `a` is 0; omitted `b` is the length. Bounds must satisfy
`0 ≤ a ≤ b ≤ len` (runtime bounds error otherwise). The result is a **new**
dynamic array (or a new string for strings, sliced by byte) owning copies of the
selected elements; it never aliases the source. Slicing an unsized buffer
requires an explicit end bound and is unchecked. Slicing maps is invalid.

### 9.6 Composite literals

```
T{e1, e2, …}         positional
T{name: e, …}        keyed (structs, maps)
{…}                  untyped: takes its type from context
[]T{…}, [N]T{…}      array literals
[...]T{…}            fixed array with inferred length
buffer<T>{…}, buffer<T, N>{…}
mixed []I{…}, []interface{…}{…}, map[K]V{…}
```

- A literal prefix must name an array, buffer, dynamic array, map, or struct
  type (`[]int{…}`, `[3]int{…}`, `buffer<int, 4>{…}`, `buffer<int>{…}`,
  `Box<int>{…}`, `pkg.T{…}`). Enum record construction uses `E.V{…}`.
- **Untyped `{…}`** takes its type from the destination only in variable
  declarations with an explicit type and in assignments (`x: T = {…}`,
  `x = {…}`), when nested inside another literal (element/field type), and as a
  `.data` source. Everywhere else — inferred declarations (`x := {…}`), function
  arguments, `return` values, operands — it is typed **standalone** as a fixed
  array `[n]E` (n = entry count, `E` = type of the first entry) and then checked
  against the destination. So `g({1, 2})` and `return {1, 2};` fail for an
  `[]int` destination (expected `[]int`, got `[2]int`); write `[]int{1, 2}`.
- `{}` cannot be typed standalone; `{null, …}` needs an explicit type.
- Keyed and positional entries cannot be mixed.
- **Arrays/dynamic arrays:** positional only; for `[]T` the length is the entry
  count. For `[N]T` / `buffer<T, N>`, fewer entries pad with zero values; more
  entries are an error.
- **Unsized buffer destination:** allocates backing storage for the entries.
- **Structs:** positional entries fill fields in full field order (value
  parameters first); keyed entries name fields; unmentioned fields are zero;
  duplicate fields, unknown fields, and too many entries are errors; all value
  parameters must be provided. Generic structs need concrete type arguments.
- **Maps:** every entry must be `key: value`.
- Homogeneous interface arrays (`[]I`, not `mixed`) require every element to
  have the same concrete type.
- Allocating a non-empty interface array by count (`[n]I`) is an error; use a literal.

### 9.7 Calls

- `f(args)` where `f` has a function type. Argument count must equal the number
  of parameters (for variadic functions: at least the fixed count).
- A single multi-result call may supply all arguments: `g(f())`.
- **Variadic** `...T` parameter: extra arguments are collected into a new array
  of `T` (empty if none). The final argument may be spread with `xs...` (an array
  or dynamic array; not a buffer, not a multi-value call). If only the spread is
  given, the callee receives an independent copy; with preceding extra items, a
  fresh array of those items followed by the spread elements is built. A `...any`
  (or `...I` with interface `I`) parameter has type `mixed []any` (`mixed []I`).
- **Method calls** `x.m(args)`: `x` may be a value or a pointer. For a pointer
  receiver, a non-pointer `x` must be addressable (variable, field, element,
  dereference) and mutable; its address is taken. For a value receiver, the
  receiver is copied (also through a pointer). Generic methods need explicit
  arguments: `x.m<int>(…)`.
- Bound method values (`f := x.m`) are unsupported.
- Only direct calls of generic functions/methods are supported.
- **Extern calls** use `extern.name(args)` (§11.6).

### 9.8 Type assertions

`x.(T)` where `x` is `any`, an interface, a type-list value, or a family value:

- Single-value form yields `x`'s dynamic value as `T`; if the dynamic type does
  not match, the program **traps** (abnormal termination; no diagnostic message).
- Two-value form `v, ok := x.(T)` (also in `=` assignments and `if`/`switch`
  initializers): never traps; on failure `v = zero(T)`, `ok = false`.
- `T` may be a concrete type, an interface (checks satisfaction), `[]any`
  (matches homogeneous arrays), `mixed []any` (matches any array), or `mixed []I`
  (checks each element).
- Defined types keep their identity in boxes; an alias matches its target.
- On enums `x.(E.V)` is variant extraction (§6.10).

### 9.9 Address-of and dereference

- `&x` for addressable `x` gives `*T`. Not allowed: map entries, `arr.data`,
  immutable value-parameter fields, bitfields (§6.7.1), string elements.
- `*p` requires a typed pointer; `*void` must be cast first. Dereferencing `null` traps.

### 9.10 Built-in functions and forms

| Form | Meaning |
|---|---|
| `len(x)` | element count of array, dynamic array, string, map, or buffer with static length; `int` |
| `sizeof(T)` / `sizeof(expr)` | storage size in bytes (`int`), target layout with padding; expr not evaluated; `void` is an error |
| `zero(T)` | zero value (§7.6) |
| `new(T)` | allocate zeroed heap storage, initialize to `zero(T)`, return `*T`; each call returns a distinct allocation; `void` and `array<T>` rejected; allocation failure traps |
| `make([]T)`, `make(map[K]V)` | empty dynamic array / map; other types rejected |
| `free(x)` | release a dynamic array/string's storage, or a pointer's allocation (after releasing the pointee's owned contents, without following nested pointers); exactly one argument |
| `delete(m, k)` | remove map entry |
| `recover()` | §11.4; returns `any`; no arguments |
| `[n]T` (expression) | new dynamic array of `n` zero elements (`n ≥ 0`, evaluated once) |
| `buffer<T, n>` (expression) | new raw buffer of `n` elements |

### 9.11 Ternary

`c ? a : b`: `c` must be `bool`. `b` must be assignable to `a`'s type (or, if
either is `*void`, both are treated as `*void`; if `a` is `null`, the result has
`b`'s type).

---

## 10. Statements

### 10.1 Expression statements

Any expression may be a statement. Calls to functions returning values may
discard the results.

### 10.2 Assignment

- `x = e` requires `x` writable: a variable, a field of a writable struct, a
  checked index, a map entry, a dereference, or `arr.data`. Immutable targets:
  value-parameter fields (also via `&`), enum payload fields, `.size`,
  `.length`, `.capacity`, string bytes.
- **Simultaneous assignment** `a, b = e1, e2` evaluates all right-hand values
  first, then assigns: `x, y = y, x` swaps. `_` discards. A single multi-result
  call may supply all values. Counts must match.
- Assignment is an expression whose value is the assigned value.
- Replacing an owned value (array, dynamic array, string, map, struct with
  owned fields) copies the new value before releasing the old (self-assignment
  is safe).

### 10.3 `.data` copy assignment

`arr.data = src` (arrays and dynamic arrays) copies into the existing elements
without changing length:

- If `src` is a buffer, exactly `len(arr)` elements are read from it.
- If `src` is a literal (typed or untyped), its entries are all evaluated first,
  then copied; fewer entries pad with zero values; more entries than `len(arr)`
  is a runtime bounds error.
- It must stand alone (not part of a simultaneous assignment); compound forms
  are errors.

### 10.4 Blocks

`{ … }` creates a scope. Leaving a block (normally or via `break`, `continue`,
`goto`, `return`, or panic) releases block-scoped owned storage (§12).

### 10.5 `if`

```
IfStmt = 'if' '(' [ SimpleStmtOrDecl ';' ] Expr ')' Statement [ 'else' Statement ] .
```

Parentheses are required. The condition must be `bool`. The optional
initializer's declarations are scoped to the whole `if`/`else`. `else` binds to
the nearest `if`.

### 10.6 `for`

```
ForStmt   = 'for' '(' ForHeader ')' Statement .
ForHeader = [ Init ] ';' [ 'defer' ] [ Expr ] ';' [ Expr ]     (* three-clause *)
          | Expr                                               (* condition only *)
          | 'defer' Expr                                       (* do-while *)
          | Names ':' '=' 'range' Expr .                       (* 1 or 2 names *)
```

- Three-clause: `Init` runs once; the condition (absent = `true`) is checked
  before each iteration; the post expression runs after each iteration
  (including after `continue`).
- `defer` before the condition skips **only the first** check: the body always
  runs at least once (`for (defer c) body` is a do-while).
- **Range** over arrays, dynamic arrays, strings: `for (i, v := range x)` binds
  the index (`int`) and a copy of the element (`i8` for strings); one binding
  receives only the index. Over maps: key, value (or key only). The range
  expression is evaluated once. The bindings are reset each iteration
  (assigning to the index does not affect traversal).
- Variables declared in the loop body and range bindings are fresh per
  iteration (closures capture per-iteration storage); a variable declared in
  `Init` is shared across iterations.
- `break` / `continue` apply to the innermost loop, or to the labeled loop
  (`break L;`, `continue L;`).

### 10.7 `switch` (value and condition)

```
SwitchStmt = 'switch' [ '(' [ SimpleStmtOrDecl ';' ] [ Expr ] ')' ] '{' { Clause } '}' .
Clause     = ( 'case' Expr { ',' Expr } | 'default' ) ':' { Statement } .
```

- With a value: each case expression must be assignable to the value's type;
  cases are tested in source order with `==`; the first match runs.
- Without a value (`switch { … }` or `switch () {…}`/`switch (init;) {…}`), each
  case is a `bool` condition.
- `default` (at most one) runs only if no case matches, wherever it appears.
- There is **no implicit fallthrough**. `fallthrough;` must be the last
  statement of a non-final clause (directly in the clause, not nested); it
  transfers control into the next clause's body without testing it.
- `break` exits the switch. Each clause has its own scope.

### 10.8 Type switch

```
switch ( [ Init ';' ] [ identifier ':' '=' ] Expr '.' '(' 'type' ')' ) {
    case Constraint { ',' Constraint } : …
    default: …
}
```

- `x.(type)` is only valid in a switch header.
- Cases are type constraints (§7.3), tested in source order; the first that
  matches the dynamic type runs. `case any:` matches everything.
- With a binding, in a case with a single type term the binding has that type;
  with several types, a union, or `default`, the binding is `any`.
- `fallthrough` is not allowed. Enum subjects are rejected (use `match`).
- A `case buffer<int>:` binding is an indexable view of the boxed snapshot.

### 10.9 `match`

```
MatchStmt = 'match' '(' Expr ')' '{' { Pattern '=>' Statement [ ';' ] } '}' .
Pattern   = EnumRef '.' Variant
          | EnumRef '.' Variant '(' Binding { ',' Binding } ')'
          | EnumRef '.' Variant '{' RecBinding { ',' RecBinding } '}'
          | EnumRef .                                      (* default arm *)
EnumRef   = identifier [ TypeArgs ] | qualified name .
Binding   = identifier | '_' .
RecBinding = identifier | identifier '=' identifier .     (* alias = field *)
```

- The subject must be an enum value; it is evaluated once.
- Each arm matches by tag. A tuple pattern must list exactly as many bindings as
  fields (`_` to skip). A record pattern binds named fields (`field` or
  `alias = field`). A bare variant ignores the payload.
- Bindings are scoped to the arm.
- The bare enum name is the default arm (at most one; cannot bind).
- Duplicate variants are errors. Patterns must be of the same enum (and
  compatible type arguments). Missing variants with no default produce a
  **warning**, not an error; if no arm matches at runtime, nothing runs.
- There is no fallthrough between arms.

### 10.10 `return`

- `return;` in a function without results, or with **named** results (returns
  their current values).
- `return e1, …, en;` with exactly one value per result (or one multi-result
  call).
- Return expressions are evaluated (and copied) before deferred calls run.
- If a value-returning function can reach the end of its body, the compiler
  issues a **warning** and the function returns zero values (named results:
  their current values) on that path. Reachability analysis treats `return`,
  `panic`, `return panic`, infinite `for` loops (no condition or literal
  `true`), `goto`, and exhaustive `match`/type switches (`case any`) precisely,
  and treats `if (true)`/`if (false)` literally.

### 10.11 `goto` and labels

- `Label: Statement`. Labels are function-local and must be unique per function.
- `goto L;` may jump forward or backward to a label in the **same or an
  enclosing** block. It may not jump into a nested block, loop body, or other
  branch, and may not jump forward over a variable declaration that would be in
  scope at the label.
- Labeled loops/switches are targets for `break L` / `continue L`.
- `break` without a label requires an enclosing loop or switch; `continue`
  requires an enclosing loop.

### 10.12 `panic`, `return panic`, `forward panic`, `defer`

See §11.3–§11.5.

### 10.13 `asm`

```
AsmStmt = 'asm' Arch [ '/' Platform ] '{' raw-body '}' [ ';' ] .
Arch     = 'x86_64' | 'aarch64' | 'riscv64' | 'wasm' .
Platform = 'linux' | 'macos' | 'windows' .
```

- Only inside function bodies. Unknown selectors are errors (`wasm/js` is invalid).
- A block whose architecture (and platform, if given) does not match the build
  target is omitted without being assembled. Matching blocks execute in source order.
- `${name}` (outside asm strings/comments) refers to a mutable local or global
  scalar variable (integer, float, `bool`) or pointer as a **memory operand** of
  its storage width. Repeated uses share one operand. At most 4 distinct operands
  for `aarch64` and `riscv64`; none for `wasm`; unlimited for `x86_64`.
- x86-64 uses Intel syntax. The block is treated as clobbering general and
  vector registers, flags, and memory. It must not return, branch out, or unwind,
  and must restore the stack pointer. Reserved registers: x86-64 `rbp`; AArch64
  `x18`, `x29`, and `x9`–`x15` when operands are used; RISC-V `gp`, `tp`, `s0`,
  and `t3`–`t6` when operands are used.

---

## 11. Functions

### 11.1 Declarations

```
FuncDecl   = 'func' identifier [ TypeParams ] Params [ Results | Type ] Block .
MethodDecl = 'func' '(' identifier Type ')' identifier [ TypeParams ] Params [ Results | Type ] Block .
Params     = '(' [ ParamGroup { ',' ParamGroup } ] ')' .
ParamGroup = identifier { ',' identifier } [ '...' ] Constraint   (* named: name(s) then type *)
           | [ '...' ] Constraint .                               (* unnamed *)
Results    = '(' [ ResultGroup { ',' ResultGroup } [ ',' ] ] ')' .
ResultGroup = identifier { ',' identifier } Constraint             (* named *)
            | Constraint .                                         (* unnamed *)
```

- Parameters are **name-first**: `func f(a, b int, s string)`. Grouped names
  share a type. All parameters are named or all unnamed.
- A single result may be written without parentheses (and may be a type list:
  `int | float`). Multiple results require parentheses: `(int, bool)`.
- Named results also put names before the type, as in `(total, count int)`.
  All results are named or all unnamed. Named results are zero-initialized
  locals.
- Only the last parameter may be variadic (`name ...T`, exactly one name).
  Results cannot be variadic.
- Parameter, result, and receiver names must be distinct.
- Functions with results must return on every path (else warning + zero values).

### 11.2 Methods

- The receiver is `(name T)` or `(name *T)` where `T` is a struct,
  enum, or defined type declared **in the same package**, optionally with fresh
  type-parameter names `T<A, B>`.
- A method name must be unique for its receiver type (value and pointer receivers
  share one method set), must not equal a struct field name, and for enums must
  not equal a variant or payload field name.
- Aliases share their target's methods; definitions do not inherit.

### 11.3 `defer`

`defer f(args);` — the operand must be a call expression. The callee and
arguments are evaluated immediately (with ordinary copy semantics); the call
runs when the enclosing **function** returns (not at block end), in reverse
registration order (including defers registered in loops). Deferred calls run
after return values are evaluated and can modify named results (directly via a
closure or through pointers). A deferred call to a method on an interface
dispatches dynamically.

### 11.4 `panic` and `recover`

- `panic e;` where `e` is a `string`. It starts unwinding: the current function's
  deferred calls run, then the caller's, and so on.
- `recover()` returns `any`. When called **directly** inside a deferred function
  while a panic is unwinding, it returns the panic message as a boxed `string`
  and stops the panic; the panicking function then finishes its remaining
  deferred calls and returns its named results' current values (or zero values),
  and execution continues in its caller. In every other context (not deferred,
  called from a helper, no panic in progress, or a second call) it returns
  `null`. `defer recover();` does not recover.
- A panic raised inside a deferred call starts a new unwinding from there.
- An unrecovered panic prints the diagnostic (§13.4) and exits with status 1.
- Runtime errors that are reported as panics (map missing key, null-interface
  method call, `unwrap` failures) are recoverable; traps (§13.4) are not.

### 11.5 `return panic` and `forward panic`

- `return panic e;` raises a panic attributed to the **call site** in the
  caller (in `main`, to the statement itself). It **skips** the current
  function's deferred calls. Usable in functions of any result signature.
- `forward panic Statement` — calls inside the statement (lexically, including
  conditions, arguments, and nested blocks) that fail with a `return panic`
  re-attribute the failure one level further out, to this function's caller, and
  skip this function's deferred calls. Chained forwarding moves the reported
  location outward until a non-forwarding caller is reached. Ordinary `panic`
  statements and other runtime errors are not affected by forwarding, even inside
  a `forward panic` block. Declarations inside a forwarded single statement
  remain visible in the enclosing scope.
- The first non-forwarding caller runs its deferred calls and can `recover`.

### 11.6 `extern` functions

```
ExternDecl = 'extern' ( Type | 'void' ) identifier
             '(' [ 'void' | ExternParam { ',' ExternParam } [ ',' '...' ] ] ')' ';' .
ExternParam = Type [ identifier | '_' ] .
```

- C-style order: result type, name, then `type [name]` parameters.
  `()` and `(void)` mean no parameters. Only at file scope.
- Externs are **file-scoped**: they are visible only in the declaring file,
  must be redeclared in every file that uses them, and are never exported.
  Identical redeclarations in one file are merged; conflicting ones are errors.
- They must be called as `extern.name(args)`; a bare `name(...)` is an error.
- Types must match the C ABI by hand (C `int` is `i32`; Ocean `int` is 64-bit).
  Use `buffer<i8>` for `char *`, `*void` for `void *`.
- Parameterized integers of at most 64 bits pass as C integers of their storage
  width. Passing an integer wider than 64 bits to an extern is an error
  ("integers wider than 64 bits require an explicit narrowing cast for C
  interoperability"). Narrow it with `->`, or pass a pointer to its storage.
- Structs cannot be passed or returned by value.
- `string.data` / `array.data` may be passed as a buffer argument. For strings,
  the callee receives an isolated temporary copy, valid only during the call.
- **C variadics** (`, ...`): require at least one fixed parameter. Extra
  arguments must be scalars or pointers; `bool` and integers narrower than 32
  bits are promoted to `i32`, floats to `double`. A final array spread
  (including `...any` packs) passes its elements.

### 11.7 Entry point

`func main()` or `func main() int`, no parameters. The process exit status is
main's result (or 0). Program arguments are obtained through the standard
library (`os`).

### 11.8 Function literals and closures

- `func(params) results { body }` — cannot declare type parameters but may use
  enclosing type parameters.
- Closures capture enclosing local variables **by reference**: the enclosing
  function and all closures share each captured variable. Copies of a function
  value share the environment; each evaluation of a literal in a new scope
  instance creates a new environment.
- Captured variables live until process exit.

---

## 12. Memory and ownership

Ocean has no garbage collector and no reference counting; ownership is static.

- **Owned values**: arrays, dynamic arrays, strings, maps, and any struct, enum
  payload, or collection containing them. Assignment, initialization, argument
  passing, return, collection insertion, and boxing copy owned values
  **deeply**; the copy is independent of the source.
- **Scope exit** (including early `return`, `break`, `continue`, `goto`, panic)
  releases owned values held by locals, parameters, named results, and
  temporaries. Returned values are copied before the callee's cleanup.
- **Pointers and unsized buffers are non-owning**: copying copies the address;
  scope exit never frees a pointee. Memory from `new` must be released with
  `free(p)` or it leaks.
- Captured closure variables persist until process exit.
- Global owned values live for the whole process.
- `free(x)` on an owned dynamic array/string releases it early; later scope
  cleanup will not double-free it.
- Mutating an array parameter affects only the callee's copy; use `*[]T`/`&a`
  for shared mutation. Replacing an array through a pointer copies into the
  owner's storage and must fit its current extent (oversize replacement traps).

---

## 13. Program execution

### 13.1 Startup

1. Every package-level variable is set to its zero value.
2. Packages are initialized in dependency order: an imported package before its
   importers (each package once).
3. Within a package, files are processed in filename order, and each file's
   global initializers run in declaration order.
4. `main` is called.

### 13.2 Global initializers

A global referenced before its initializer runs observes its zero value (e.g.
`a := b * 2; b: int = 21;` leaves `a == 0`). Prefer explicit types for
forward-referenced globals. Runtime-sized buffer globals are rejected.

### 13.3 Termination

- Returning from `main` exits with its result (or 0) after waiting for worker
  threads (standard-library `threads`).
- An unrecovered panic or a fatal runtime error exits with status 1.
- Traps terminate abnormally (signal), with no Ocean diagnostic.

### 13.4 Runtime errors

| Condition | Behavior |
|---|---|
| Array/dynamic array/string index out of range; invalid slice bounds; `remove`/`pop` on invalid index/empty | fatal error, e.g. `Array index out of bounds: index I, length N`, with source location and call trace; exit 1 (not recoverable) |
| `.data` literal longer than the array | fatal error `Array data literal too large: literal length L exceeds array length N` + location + trace; exit 1 |
| Calling an uninitialized function value | `Panic: call of an uninitialized function`; recoverable |
| `panic`, `return panic`, `unwrap` failure | `Panic: <message>` + location + call trace; recoverable |
| Missing map key on single-value read | `Panic: map key does not exist`; recoverable |
| Method call on null interface | `Panic: method call on null interface`; recoverable |
| Failed single-value type assertion; enum extraction of the wrong variant; dereferencing `null` | **trap** (abnormal termination) |
| Integer division by zero, overflow of `INT_MIN / -1`, oversized shifts, out-of-range float→int, unchecked buffer access out of bounds | undefined behavior |
| Runtime violation of homogeneous-array or interface conformance | trap/abort |

Diagnostic format (stderr): a header line, `  --> file:line:col`, the source line
with a caret, then `Call trace (most recent call first):` with `  at <function>
(file:line:col)` entries up to `main`. Source excerpts are embedded in the
executable. File paths are relative to the compiler's working directory.

---

## 14. Testing

- Test files end in `_test.oc`. They are compiled only by `ocean test` (executed)
  and `ocean check` / `build --check` / the language server (checked only), and
  only for the selected package (never for dependencies).
- A test file with the same package name joins the package (sees private
  declarations). A test file with package `<name>_test` forms an external test
  package that must import the package under test and sees only exports.
- Test functions: top-level `func TestXxx(t *testing.T)` — name starting `Test`,
  exactly one `*testing.T` parameter, no results, type parameters, or variadics.
  `testing` is a standard-library package.

---

## 15. Compilation targets and tools (informative)

- `ocean build [--check|--emit-llvm|--static|-s] [-o out] [location]`,
  `ocean run [-s] location [args…] [-- literal args]`, `ocean check [location]`,
  `ocean check --lsp`, `ocean test [locations…]`, `ocean mod init [name]`,
  `ocean clean --cache`, `ocean fix [locations…]`, `ocean -v|--version`.
- `ocean fix` rewrites the removed postfix type syntax to prefix syntax in place.
  A location is a package directory, an Ocean file (its directory), or `dir/...`
  (every directory below `dir` containing `.oc` files, skipping hidden
  directories, `vendor`, and `node_modules`); the default is `.`. All `.oc`
  files of a package are rewritten, including `*_test.oc` and target variants.
  Each legacy type is replaced by its prefix spelling with the same meaning
  (`T[a][b]` → `[b][a]T`, `T*[]` → `[]*T`, `buffer<T>[N]` → `buffer<T, N>`,
  `buffer<T>[]` → `buffer<T>`); text outside rewritten types, including
  dimension expressions, comments, and spacing, is preserved. Nested legacy
  types are rewritten by repeating until none remain, so the command is
  idempotent. Expression-level allocations `T[n]` are rewritten when `T` is a
  built-in type, a type declared in the package, an exported type of an imported
  package (resolved locally, without downloading), or an enclosing type
  parameter; others are left for the type checker to report. Each changed file
  is reported as `ocean fix: <path>: <n> types rewritten`. Files are replaced
  atomically; the exit status is nonzero if a file cannot be read or written.
- Default target is the host (Linux/macOS/Windows; x86-64, AArch64, RISC-V64).
  `OCOS=js OCARCH=wasm` selects `wasm32-unknown-unknown`.
- Environment: `OCEAN_SRC` (standard library root), `OCEAN_MOD_CACHE`,
  `OCEAN_BUILD_CACHE` (path or `off`), `NO_COLOR`, `CLICOLOR_FORCE`.
- Standard-library intrinsics (`reflect.Fields/IsStruct/IsEnum/EnumVariant`,
  `threads.Spawn/Return`, `os.setArgs`) are recognized only when declared in
  the corresponding package located physically under the standard-library root;
  calls to the underlying `compilerReflect*`/`compilerThread*` names from any
  other code are errors.

---

## 16. Implementation notes relevant to compatibility (informative)

- All packages are merged into one program; package-level names are internally
  qualified (`__pkg<N>_<name>`), externs as `__extern.<file>.<name>`.
- Struct layout follows the host C ABI (natural alignment and padding); value
  parameters are the first fields. `sizeof([]int)` (dynamic array) is the size
  of its header reference (8 on 64-bit hosts); `sizeof([N]T)` includes the 8-byte
  size header.
- `int` is 64-bit on every target, including Wasm (where pointers are 32-bit).
- Parameterized integers lower to LLVM `iN`. Very large widths can take
  substantial compile time and memory, and native code generation for them
  depends on the installed LLVM target.
- The standard library's `io` formatting does not yet recognize `varint(n)` or
  `varuint(n)` values: `io.Println` prints `[unknown type]` for them. Convert to
  a fixed-width integer first (`io.Println(x->int)`).

---

## 17. Divergences from other documentation

Verified against the compiler; other docs currently say otherwise:

- `byte` and `rune` are not types (they were removed as built-ins).
- All type modifiers are prefixes (`[]T`, `[N]T`, `*T`, `buffer<T, N>`); the
  former postfix syntax is rejected and `ocean fix` migrates it (§3.3, §15).
- Hexadecimal floats with `p` exponents are not supported.
- Struct index delegation (`index field;`, `x[]`) has been removed; `index` is an
  ordinary identifier.
- Named function declarations nested in function bodies parse but are rejected.
- `[]T` is a heap-backed **dynamic array** (older README sections describe it as
  a stack array with a byte-size header; that describes `[N]T` / `array<T>`).
- Struct fields are not export-controlled across packages.
- An `int` variable may be combined with a float in arithmetic (`i + 1.5` is
  `float`), but an `int` variable is not implicitly assignable to `float`.
- `f32` widens implicitly to `float`. Narrowing to `f32` requires a cast.
