export type Section = { id: string; title: string; text: string; code: string; note: string; lang?: string; links?: { label: string; href: string }[]; after?: string; table?: { headers: string[]; rows: string[][] } };
export type Doc = { slug: string; group: string; title: string; description: string; sections: Section[] };
export const docs: Doc[] = [
  {
    "slug": "getting-started",
    "group": "Start here",
    "title": "Get started with Ocean",
    "description": "Install the compiler and standard library, then write, check, run, and build your first program.",
    "sections": [
      {
        "id": "overview",
        "title": "How Ocean fits together",
        "text": "Ocean is a compiled, statically typed language. The compiler, `ocean`, reads your `.oc` source files, checks them, and translates them to LLVM IR as text. It then hands that IR to Clang, which produces a native executable for your machine. You therefore need Clang installed even though you never call it yourself; LLVM's development libraries are not required.\n\nThe standard library is shipped as Ocean source code, not as a precompiled library. When you build a program, the compiler reads the library packages that program imports and compiles them along with your code. An installation therefore has two parts: the `ocean` executable in a `bin` directory, and the library sources in a sibling `src` directory.\n\nOcean runs on Linux (x86-64, AArch64, and RISC-V64), macOS (x86-64 and Apple silicon), and Windows (x86-64 and AArch64). It can also produce WebAssembly modules for a JavaScript host.",
        "code": "",
        "note": "Ocean is under active development. These pages describe the current compiler and standard library; details can still change between releases."
      },
      {
        "id": "installer",
        "title": "Install with the installer",
        "text": "The easiest way to install Ocean is the interactive installer attached to each GitHub release. Open the releases page, pick a release, and download the asset named `ocean-installer_<tag>_<arch>-<os>.tar` for your system. `<arch>` is `x86_64`, `aarch64`, or `riscv64`; `<os>` is `linux`, `macos`, or `windows`. Windows releases also offer `.zip` copies. Avoid the `ocean-c_…` assets: those contain only the bare compiler.\n\nEach archive holds a single program, `ocean-installer` (or `ocean-installer.exe` on Windows). Extract it and run it from a terminal. The installer needs Git, which it uses to read release tags and fetch the matching standard library.",
        "code": "# Linux and macOS\ntar -xf ocean-installer_<tag>_<arch>-<os>.tar\n./ocean-installer\n\n# Windows (PowerShell)\n.\\ocean-installer.exe",
        "note": "",
        "lang": "Terminal",
        "after": "The installer asks four questions:\n\n1. Which version to install. `latest` picks the newest stable release, `latest-nightly` picks the newest nightly build, and you can also type an exact tag. Neither option falls back to the other channel.\n\n2. Where to install. You can choose a system location (`/usr/local/lib/ocean` on Unix, Program Files on Windows), a per-user location (`~/.local/lib/ocean`, or LocalAppData on Windows), or any absolute path. It asks for administrator rights only if the location needs them.\n\n3. How to get Clang and the native libraries. You can skip this step, let your system package manager install them (apt, dnf, pacman, zypper, apk, Homebrew, MSYS2, or winget), or install a self-contained bundle with Clang, a linker, libffi, and libcurl into the Ocean directory. The bundle does not need administrator access. On macOS, Apple's Command Line Tools are still required.\n\n4. Whether to add Ocean to your `PATH`. Bash, Zsh, Fish, csh, and other POSIX shells are supported, as is the Windows user or machine environment.\n\nWhen it finishes, open a new terminal and run `ocean --version`. The output shows the release, the compiler commit it was built from, and the build date.",
        "links": [
          {
            "label": "Ocean releases on GitHub",
            "href": "https://github.com/ocean-foundation/ocean-c/releases"
          }
        ]
      },
      {
        "id": "releases",
        "title": "Stable releases and nightlies",
        "text": "Stable releases are tagged on the compiler's `stable` branch. Nightly builds are tagged `nightly-YYYY.MM.DD`. Every day at midnight UTC, the release automation compares the `main` branches of the compiler and standard-library repositories with the last nightly. If either one changed, it tags both repositories and publishes a prerelease. The tag is named after the day that just ended, so the run at midnight on December 1 produces `nightly-2026.11.30`. If nothing changes, a fresh nightly is still built after 30 days.\n\nA compiler release and the standard library with the same tag are designed to be used together. The installer always pairs them correctly. If you assemble an installation yourself, use the same tag for both.",
        "code": "",
        "note": ""
      },
      {
        "id": "source",
        "title": "Build from source",
        "text": "To build Ocean yourself, you need CMake 4.2 or newer, a C compiler that supports C23, the libffi development headers and library, Clang on your `PATH`, and Python 3 (used by the test suite). Clone the compiler, `ocean-c`, and the standard library, `ocean-src`, side by side in the same parent directory. The build looks for the library at `../ocean-src` by default.",
        "code": "git clone https://github.com/ocean-foundation/ocean-c.git\ngit clone https://github.com/ocean-foundation/ocean-src.git\ncd ocean-c\ncmake -S . -B build\ncmake --build build\nctest --test-dir build --output-on-failure",
        "note": "",
        "lang": "Terminal",
        "after": "The C compiler builds the Ocean compiler itself; Clang is what the Ocean compiler later uses to turn your programs into executables. You need both, even if your C compiler is also Clang.\n\nThe result is `build/ocean`. A compiler that is run straight out of the build directory cannot find the standard library on its own, so either install it (next section) or set `OCEAN_SRC` to your `ocean-src` checkout before running it.\n\nOn Windows, build from an MSYS2 CLANG64 shell (or CLANGARM64 on ARM) with Clang, CMake, Ninja, Make, and the matching libffi package installed. The Clang on your `PATH` must target the Windows GNU/MinGW environment."
      },
      {
        "id": "install",
        "title": "Install a source build",
        "text": "`cmake --install` copies the compiler to `<prefix>/bin/ocean` and the standard library to `<prefix>/src`. A compiler finds its library by looking in `../src` relative to its own executable, so an installed compiler works from any directory without further configuration.",
        "code": "cmake --install build --prefix \"$HOME/.local/lib/ocean\"\nexport PATH=\"$HOME/.local/lib/ocean/bin:$PATH\"\nocean --version",
        "note": "",
        "lang": "Terminal",
        "after": "Add the `export` line to your shell's startup file to make it permanent.\n\nTwo settings control which library is used. The CMake option `OCEAN_STANDARD_LIBRARY_SOURCE` chooses which library directory is copied at install time; it defaults to the sibling `../ocean-src`. The environment variable `OCEAN_SRC` tells a running compiler to use a different library directory than its installed copy, which is handy when you are working on the library itself."
      },
      {
        "id": "first-program",
        "title": "Write your first program",
        "text": "Make a new, empty directory for the program. Inside it, run `ocean mod init` to create an `ocean.mod` file, which marks the directory as the root of a module (a project). Then save the following as `main.oc`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Hello, Ocean!\");\n}",
        "note": "Ocean builds whole directories, not single files: every `.oc` file in a directory is part of the same package. Keep each program in its own directory so that unrelated files don't get compiled together.",
        "after": "Each line has a job:\n\n`package main;` says which package this file belongs to. Every Ocean file starts with a package declaration, and a package named `main` is the one that becomes a program.\n\n`import \"io\";` makes the standard `io` package available in this file. Its functions are then written with an `io.` prefix.\n\n`func main() { … }` declares the function that runs when the program starts. `io.Println` prints its arguments followed by a newline.\n\nStatements end with a semicolon. Strings use double quotes."
      },
      {
        "id": "check-run-build",
        "title": "Check, run, and build",
        "text": "From the program's directory, use these three commands. The `.` means \"the package in the current directory\".",
        "code": "ocean check .\nocean run .\nocean build . -o hello\n./hello",
        "note": "",
        "lang": "Terminal",
        "after": "`ocean check` compiles the program all the way to native code without running it or leaving any files behind, and reports errors and warnings. It is the fastest way to find out whether your code is valid.\n\n`ocean run` builds a temporary executable, runs it, and deletes it. Anything after the directory is passed to your program as arguments: `ocean run . first second`.\n\n`ocean build` writes an executable you can keep. Without `-o`, the file is named after the directory.\n\nIf the compiler reports that it cannot find `io`, it cannot locate the standard library: check that the library was installed next to the compiler, or set `OCEAN_SRC` to the library's directory."
      },
      {
        "id": "agent-skill",
        "title": "Coding with an AI agent",
        "text": "The compiler repository contains a skill file for coding agents that summarizes Ocean's syntax, tooling, and libraries. Save it as `ocean/SKILL.md` in your agent's skills directory. It tracks the `main` branch, so download it again when you update the compiler.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "View the Ocean agent skill",
            "href": "https://github.com/ocean-foundation/ocean-c/blob/main/skills/ocean/SKILL.md"
          },
          {
            "label": "Download SKILL.md",
            "href": "https://raw.githubusercontent.com/ocean-foundation/ocean-c/main/skills/ocean/SKILL.md"
          }
        ]
      },
      {
        "id": "next",
        "title": "Where to go next",
        "text": "Read the language guide in order: it starts with the basic syntax and builds up to generics, memory, and C interop. If you prefer to learn by doing, the tutorial walks through a complete interactive program.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "Language guide: syntax basics",
            "href": "/docs/language/basics/"
          },
          {
            "label": "Tutorial: build a checklist app",
            "href": "/docs/tutorials/checklist/"
          },
          {
            "label": "Compiler commands",
            "href": "/docs/tooling/cli/"
          }
        ]
      }
    ]
  },
  {
    "slug": "language/basics",
    "group": "Language guide",
    "title": "Syntax basics",
    "description": "How an Ocean source file is laid out: packages, declarations, statements, comments, names, and literals.",
    "sections": [
      {
        "id": "file-layout",
        "title": "The shape of a source file",
        "text": "An Ocean source file has three parts, in this order: a package declaration, any imports, and then top-level declarations. Top-level declarations are functions, global variables, and type declarations (`struct`, `enum`, `interface`, and `type`), plus `extern` declarations for C functions.",
        "code": "package main;\n\nimport \"io\";\n\ntotal := 0;\n\nfunc add(amount int) {\n    total += amount;\n}\n\nfunc main() {\n    add(2);\n    add(4);\n    io.Println(total);\n}",
        "note": "",
        "after": "Declarations can appear in any order. A function can call another function that is declared further down the file, or in a different file of the same package, without any forward declaration."
      },
      {
        "id": "statements",
        "title": "Statements, blocks, and semicolons",
        "text": "Simple statements end with a semicolon. Statements that end in a block, such as `if`, `for`, `switch`, and function bodies, do not need one after the closing brace. Conditions are always written in parentheses, and braces group statements into blocks.\n\nThere is one convenience: a `return` statement may leave out its semicolon when it is immediately followed by a closing brace, as in `func answer() int { return 42 }`. A line break on its own never ends a statement.\n\nWhen the body of an `if` or a loop is a single statement, the braces are optional: `if (n < 0) return 0;`.",
        "code": "",
        "note": ""
      },
      {
        "id": "comments",
        "title": "Comments",
        "text": "`//` starts a comment that runs to the end of the line. `/* … */` encloses a comment that can span lines. Block comments nest, so you can comment out a region of code that already contains a block comment.",
        "code": "/* Disabled for now:\nfunc old() {\n    /* a nested comment is fine */\n}\n*/\n// A line comment.",
        "note": ""
      },
      {
        "id": "names",
        "title": "Names",
        "text": "Names (identifiers) may contain letters, digits, and underscores, and may not start with a digit. Unicode letters are allowed. A name made of a single underscore, `_`, is not a name: it is the discard placeholder, used to ignore a value you don't need.\n\nCapitalization matters. A top-level name that starts with an uppercase letter is exported, which means other packages can use it. A name that starts with any other character is private to its own package. See Packages and imports for the details.\n\nThese words are reserved and cannot be used as names: `any`, `as`, `asm`, `break`, `case`, `continue`, `default`, `defer`, `else`, `enum`, `extern`, `fallthrough`, `for`, `func`, `goto`, `if`, `import`, `interface`, `match`, `mixed`, `null`, `package`, `panic`, `range`, `return`, `struct`, `switch`, `type`, `varint`, and `varuint`.",
        "code": "",
        "note": ""
      },
      {
        "id": "literals",
        "title": "Literals",
        "text": "Integer literals can be written in decimal (`255`), hexadecimal (`0xff`), binary (`0b1010`), or octal (`0o17`). Values up to 18446744073709551615, the largest unsigned 64-bit value, fit the standard integer types. Larger literals, up to 8,388,608 bits, get a wider `varuint(n)` or `varint(n)` type; see Integers of any width below. Floating-point literals contain a decimal point or an exponent: `3.5`, `0.25`, `1.5e3`, `6e-2`.\n\n`true` and `false` are the two boolean values. `null` is the \"no value\" marker for pointers, interfaces, and optionals.\n\nA character literal such as `'A'` or `'é'` is an integer holding the character's Unicode code point (`65` and `233` here). It can be assigned to any integer type wide enough to hold it, such as `i8` for ASCII bytes.\n\nString literals are written in double quotes. A raw string is written in backticks: its contents are taken exactly as written, with no escape processing, and it may span several lines.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Tab:\\tend\");\n    io.Println(`C:\\files\\new`);\n    io.Println(\"\\x41\\101\\u00e9\");\n}",
        "note": "",
        "table": {
          "headers": [
            "Escape",
            "Meaning"
          ],
          "rows": [
            [
              "`\\n`, `\\t`, `\\r`",
              "Newline, tab, carriage return"
            ],
            [
              "`\\a`, `\\b`, `\\e`, `\\f`, `\\v`",
              "Bell, backspace, escape, form feed, vertical tab"
            ],
            [
              "`\\\\`, `\\\"`, `\\'`, `\\?`",
              "Backslash, double quote, single quote, question mark"
            ],
            [
              "`\\xHH`",
              "A byte given as two hexadecimal digits"
            ],
            [
              "`\\ooo`",
              "A byte given as one to three octal digits"
            ],
            [
              "`\\uXXXX`, `\\UXXXXXXXX`",
              "A Unicode code point, stored as UTF-8"
            ]
          ]
        }
      },
      {
        "id": "main",
        "title": "The main function and exit status",
        "text": "A program starts in `func main()` in the package named `main`. If `main` returns nothing, the program exits with status `0` when it finishes. You can instead declare `func main() int` and return the exit status yourself.\n\nTo read command-line arguments, call `os.Args()`; its first element is the path of the running program. To stop the program immediately from anywhere, call `os.Exit(code)`. Note that `os.Exit` ends the process at once, without running deferred calls.",
        "code": "package main;\n\nimport \"io\";\nimport \"os\";\n\nfunc main() int {\n    args := os.Args();\n    if (len(args) < 2) {\n        io.Println(\"usage: greet NAME\");\n        return 2;\n    }\n    io.Println(\"Hello, \", args[1]);\n    return 0;\n}",
        "note": ""
      },
      {
        "id": "builtins",
        "title": "Built-in functions",
        "text": "A handful of functions are part of the language itself and need no import. Each is described in the guide page where it is most relevant.",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "Built-in",
            "Purpose"
          ],
          "rows": [
            [
              "`len(value)`",
              "Number of elements in an array or map, or bytes in a string"
            ],
            [
              "`make(T)`",
              "Create an empty dynamic array or map, such as `make([]int)`"
            ],
            [
              "`new(T)`",
              "Allocate a zeroed `T` on the heap and return a `*T`"
            ],
            [
              "`free(value)`",
              "Release heap memory or a dynamic array's storage"
            ],
            [
              "`delete(m, key)`",
              "Remove a key from a map"
            ],
            [
              "`zero(T)`",
              "The default value of type `T`"
            ],
            [
              "`sizeof(T)` or `sizeof(value)`",
              "Storage size in bytes"
            ],
            [
              "`recover()`",
              "Stop a panic from inside a deferred function"
            ]
          ]
        }
      }
    ]
  },
  {
    "slug": "language/variables",
    "group": "Language guide",
    "title": "Variables & types",
    "description": "Declare variables, choose numeric types, and convert between them with explicit casts.",
    "sections": [
      {
        "id": "declaring",
        "title": "Declaring variables",
        "text": "Write `name := value` to declare a variable whose type is inferred from its initial value, or `name: Type = value` to state the type yourself. If you leave out the initializer, as in `name: Type;`, the variable starts with its type's default value: zero for numbers, `false` for booleans, and empty for strings and collections.\n\nEvery variable can be reassigned with `=`. The compound assignments `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `|=`, `^=`, `<<=`, and `>>=` update a variable in place, and `++` and `--` add or subtract one. Assignments must keep the variable's type: once `count` is an `int`, you cannot store a string in it.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    count := 12;           // int\n    depth: float = 42.5;   // float, stated explicitly\n    ready: bool;           // starts as false\n    count += 3;\n    count++;\n    io.Println(count, depth, ready);\n}",
        "note": "",
        "after": "A variable declared inside a block, such as a loop body, exists only inside that block. A block may declare a variable with the same name as one outside it; the inner one shadows the outer one until the block ends."
      },
      {
        "id": "types",
        "title": "Built-in types",
        "text": "`int` is the everyday integer type. It is a signed 64-bit integer on every platform, so don't assume it matches C's `int`, which is usually 32 bits. Use the sized types when the exact width matters, for example for binary data or when calling C code.",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "Type",
            "Description"
          ],
          "rows": [
            [
              "`int`, `i64`",
              "Signed 64-bit integer"
            ],
            [
              "`i32`, `i16`, `i8`",
              "Signed 32-, 16-, and 8-bit integers"
            ],
            [
              "`uint`, `u64`",
              "Unsigned 64-bit integer"
            ],
            [
              "`u32`, `u16`, `u8`",
              "Unsigned 32-, 16-, and 8-bit integers"
            ],
            [
              "`varint(n)`, `varuint(n)`",
              "Signed or unsigned integer of exactly `n` bits, from 1 to 8,388,608"
            ],
            [
              "`float`, `f64`",
              "64-bit (double-precision) floating point"
            ],
            [
              "`f32`",
              "32-bit (single-precision) floating point"
            ],
            [
              "`bool`",
              "`true` or `false`"
            ],
            [
              "`string`",
              "Immutable sequence of bytes, usually UTF-8 text"
            ]
          ]
        }
      },
      {
        "id": "integer-conversions",
        "title": "Implicit integer conversions",
        "text": "Ocean converts one integer type to another automatically only when no value can be lost: the destination must be able to hold every value of the source type. An `i8` can become an `i32`, a `u8` can become a `u16`, and a `u8` can even become an `i16`, because `i16` has room for 0 to 255. Going the other way (to a narrower type, or from signed to unsigned) requires an explicit cast. This rule applies everywhere a value is stored or passed: initializers, assignments, function arguments, return values, and collection elements.\n\nInteger literals are more flexible: a literal can initialize any integer type it fits in, so `small: i8 = 42` is fine. Variables and expressions are judged by their type, not by their current value.\n\nWhen two integers of different types meet in arithmetic, the result is 64-bit, or the wider type if either is wider than 64 bits. This applies even to two types of the same width, so `varint(32) + i32` is an `int`. Only two values of the very same type keep it. If one side is a literal that fits the other side's type, the other side's type is used instead.\n\nMixing signed and unsigned values works when the result can hold both ranges. If both sides are 64 bits or narrower, the result is a signed 64-bit `int`, which needs a cast when the unsigned side is itself 64 bits wide. If either side is wider, the result is a signed type with one bit more than the unsigned side (or the signed side's width, if that is larger), so `varint(100) + varuint(128)` is a `varint(129)` with no cast needed.",
        "code": "",
        "note": "Automatic widening applies to individual numbers only. A `[]i8` array is not a `[]i32`, and a `*i8` pointer is not a `*i32`; the storage behind them has a different layout."
      },
      {
        "id": "exact-widths",
        "title": "Integers of any width",
        "text": "When none of the standard sizes fits, `varint(n)` gives you a signed integer of exactly `n` bits and `varuint(n)` an unsigned one. The width is a number written in the parentheses, anywhere from 1 up to 8,388,608 bits. A `varint(4)` holds -8 to 7, and a `varuint(4)` holds 0 to 15. Arithmetic wraps at that width, just as it does for the built-in sizes. `varint` and `varuint` are keywords, so you can't use either word as a name.\n\nIf you use the same width in several places, give it a name with a defined type, such as `type Nibble varuint(4);`. As with any defined type, convert values in and out with casts: `15->Nibble` and `n->int`.",
        "code": "package main;\n\nimport \"io\";\n\ntype Nibble varuint(4);\n\nfunc main() {\n    small: varint(4) = 7;\n    small++;                    // past the top of the range: wraps to -8\n    n := 15->Nibble;\n    n++;                        // wraps to 0\n    big: varuint(128) = 340282366920938463463374607431768211455;\n    io.Println(small->int, \" \", n->int, \" \", sizeof(varint(12)), \" \", big == 340282366920938463463374607431768211455);\n}",
        "note": "",
        "after": "Widths follow the same widening rules as the other integers. A value converts automatically to a type that can hold every value it might have, and anything narrower needs a cast, which keeps only the low bits. Storage is rounded up to whole bytes, which is why `varint(12)` takes 2 bytes. Integer literals keep their exact value even past 64 bits, so `big` above holds the largest 128-bit unsigned number.\n\n`io.Println` can't print these types directly yet. Cast to a standard type first, as in `small->int`. When calling C, an `extern` declaration can only use widths that C has: 8, 16, 32, or 64 bits. Values wider than 64 bits can't be passed to C at all, so cast them down to a size C understands. When you pass one of these integers to a variadic C function such as `printf`, Ocean widens it the way C expects: a `varint(6)` arrives as an `int`, and a `varint(40)` as a 64-bit `long long`."
      },
      {
        "id": "floats",
        "title": "Mixing integers and floats",
        "text": "Integer literals can be used wherever a float is expected, so `x: float = 2`, `measure(3)`, and `if (depth == 0)` all work with float values. In arithmetic and comparisons, an integer variable can also be combined with a float: `1.5 * n` produces a float. Arithmetic between two integers stays an integer, and integer division truncates toward zero, so `7 / 2` is `3` and `-7 / 2` is `-3`.\n\nTo store an integer variable in a float variable (or the reverse), cast it explicitly. The remainder operator `%` and the bitwise operators work only on integers.\n\nA floating-point literal takes the expected width. For example, `depth: f32 = 1.5;` uses `f32`, and `depth := 1.5;` infers `float` (`f64`). An `f32` value widens to `float` automatically. Narrowing an already-typed `f64` value requires a cast.",
        "code": "",
        "note": ""
      },
      {
        "id": "casts",
        "title": "Casting with ->",
        "text": "An explicit conversion is written `value -> Type`. Casting a float to an integer drops the fractional part. Casting a number to `bool` tests whether it is nonzero. When the target type is more than a single name, such as a pointer type or a type from another package, put it in parentheses: `raw -> (*int)`, `value -> (pkg.ID)`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    wide: i32 = 300;\n    narrow := wide -> i8;          // 300 does not fit in i8: the value wraps\n    ratio := 3.75;\n    whole := ratio -> int;          // 3\n    nonzero := whole -> bool;       // true\n    io.Println(wide, narrow, whole, nonzero);\n}",
        "note": "",
        "after": "A cast always does what you ask, even when information is lost. Here `300` doesn't fit in an 8-bit integer, so the result keeps only the low 8 bits."
      },
      {
        "id": "defaults",
        "title": "Default values and zero(T)",
        "text": "Every type has a default value, which is what an uninitialized variable holds. `zero(Type)` produces that value explicitly. Its argument is a type, not a variable. This is especially useful in generic code, where you may not know the concrete type in advance.",
        "code": "",
        "note": "",
        "after": "The last row is a common surprise. A pointer declared without an initializer holds address zero, but Ocean's `null` is a separate marker, so `p: *int;` gives `p != null`. Initialize pointers to `null` explicitly when you mean \"points to nothing\". The memory page explains why.",
        "table": {
          "headers": [
            "Type",
            "Default value"
          ],
          "rows": [
            [
              "Numbers",
              "`0`"
            ],
            [
              "`bool`",
              "`false`"
            ],
            [
              "`string`",
              "`\"\"` (empty)"
            ],
            [
              "Arrays, dynamic arrays, maps",
              "Empty (length zero)"
            ],
            [
              "Structs",
              "Every field set to its own default"
            ],
            [
              "Interfaces, `any`, `Optional<T>`",
              "`null`"
            ],
            [
              "Pointers",
              "A zero address, which is not the same as `null`"
            ]
          ]
        }
      },
      {
        "id": "globals",
        "title": "Global variables",
        "text": "A variable declared outside any function is a global. It is visible in every file of its package, and exported to other packages if its name is capitalized. Globals are set up before `main` runs: first every global receives its default value, then their initializers run. Packages you import are initialized before your package. Within a package, files are processed in filename order and globals in the order they are declared.\n\nBecause of this order, an initializer that reads a global declared later sees that global's default value, not its eventual value. Give such globals explicit types.",
        "code": "",
        "note": "Ocean has no constant declarations yet. Standard-library values such as `math.Pi` and `time.Second` are ordinary exported globals that are treated as constants by convention: don't assign to them."
      },
      {
        "id": "sizeof",
        "title": "sizeof",
        "text": "`sizeof(Type)` gives the number of bytes a type occupies, including any padding. `sizeof(value)` works out the size from the expression's type without evaluating the expression, so `sizeof(next())` never calls `next`. For example, `sizeof(int)` is `8` and `sizeof(bool)` is `1`.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/operators",
    "group": "Language guide",
    "title": "Operators & equality",
    "description": "Arithmetic, comparison, logical, and bitwise operators, and how == compares values of every kind.",
    "sections": [
      {
        "id": "arithmetic",
        "title": "Arithmetic and bitwise operators",
        "text": "The arithmetic operators are `+`, `-`, `*`, `/`, and `%` (remainder). Integers also support the bitwise operators `&` (and), `|` (or), `^` (exclusive or), `~` (complement), `<<` (shift left), and `>>` (shift right). On unsigned types, division, remainder, comparisons, and right shifts all treat values as unsigned.\n\n`+` also joins strings and arrays; see the strings and collections pages.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(7 / 2, 7 % 3, 1 << 4, 6 & 3, 6 | 1, 6 ^ 3, ~5);\n}",
        "note": ""
      },
      {
        "id": "comparison-logic",
        "title": "Comparisons and logic",
        "text": "`==`, `!=`, `<`, `<=`, `>`, and `>=` compare values and produce a `bool`. `!` negates a boolean. `&&` and `||` combine booleans and short-circuit: the right side is evaluated only when it can change the result. That makes them useful as guards.\n\nThe conditional expression `condition ? a : b` evaluates to `a` when the condition is true and `b` otherwise. Both alternatives must have compatible types.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    count := 0;\n    // The division only runs when count is not zero.\n    if (count != 0 && 100 / count > 2) {\n        io.Println(\"large share\");\n    }\n    label := count > 10 ? \"many\" : \"few\";\n    io.Println(label);\n}",
        "note": ""
      },
      {
        "id": "equality",
        "title": "What == compares",
        "text": "Equality works on every type, and it compares values, not storage locations:\n\nStructs are equal when all their fields are equal. Arrays are equal when they have the same length and equal elements, regardless of capacity or where they are stored, and a fixed-size array can be compared with a dynamic array of the same element type. Maps are equal when they contain the same keys mapped to equal values, in any insertion order. Strings are equal when they contain the same bytes. Enum values are equal when they hold the same variant with equal data.\n\nPointers, raw buffer views, and function values are compared by identity: two pointers are equal when they hold the same address, and nothing is followed. Two function values are equal when they are the same function sharing the same captured variables.\n\nValues of type `any` or of an interface type compare their concrete contents: values of different concrete types are unequal, except that numbers still compare numerically, and two such values that are both `null` are equal. Floating-point comparison follows the usual rules even inside structs and arrays: `0.0 == -0.0` is true, and NaN is not equal to anything, including itself.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Point { x, y int; }\n\nfunc main() {\n    a := Point{1, 2};\n    b := Point{1, 2};\n    io.Println(a == b, []int{1, 2} == []int{1, 2}, \"abc\" == \"abd\");\n}",
        "note": ""
      },
      {
        "id": "string-order",
        "title": "Ordering strings",
        "text": "Strings support `<`, `<=`, `>`, and `>=` as well as equality. They are compared byte by byte, treating each byte as an unsigned value, and the first difference decides. If one string is a prefix of the other, the shorter one comes first, so `\"a\" < \"aa\"`. The comparison is case-sensitive and knows nothing about languages or Unicode normalization: `\"Z\" < \"a\"` because uppercase letters have smaller byte values.",
        "code": "",
        "note": ""
      },
      {
        "id": "precedence",
        "title": "Grouping",
        "text": "Use parentheses whenever the grouping of a longer expression is not obvious at a glance. They cost nothing, and they make the intended order explicit to the next reader.",
        "code": "",
        "note": "Ocean has no operator overloading. To give a struct its own \"add\" or \"compare\" behavior, write a named method such as `func (a Vector) Plus(b Vector) Vector`."
      }
    ]
  },
  {
    "slug": "language/control-flow",
    "group": "Language guide",
    "title": "Control flow",
    "description": "Make decisions with if and switch, repeat work with the forms of for, and jump with labels.",
    "sections": [
      {
        "id": "if",
        "title": "if and else",
        "text": "`if` runs a block when its condition is true; an optional `else` runs otherwise. Chain conditions with `else if`. The condition must be a `bool` and is always written in parentheses.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    depth := 40;\n    if (depth > 100) {\n        io.Println(\"deep\");\n    } else if (depth > 10) {\n        io.Println(\"shallow\");\n    } else {\n        io.Println(\"surface\");\n    }\n}",
        "note": ""
      },
      {
        "id": "initializers",
        "title": "Initializers in if and switch",
        "text": "An `if` or `switch` can start with a short statement, separated from the condition by a semicolon: `if (count := len(items); count > 10) { … }`. The statement runs first, and any variables it declares exist only inside the `if` (including its `else` branches) or the `switch`. This keeps a value that only the condition needs from leaking into the rest of the function.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    items := []int{1, 2, 3, 4};\n    if (count := len(items); count > 3) {\n        io.Println(\"big: \", count);\n    } else {\n        io.Println(\"small: \", count);\n    }\n\n    switch (half := len(items) / 2; half) {\n        case 2:\n            io.Println(\"two\");\n        default:\n            io.Println(\"other\");\n    }\n}",
        "note": "",
        "after": "The interfaces page shows a common use: testing a type assertion with `if (text, ok := value.(string); ok)`."
      },
      {
        "id": "for",
        "title": "Counting loops",
        "text": "The three-part `for` loop has an initializer, a condition, and an update, separated by semicolons. The initializer runs once; the condition is checked before every iteration; the update runs after each iteration. Any part may be left empty, and `for (;;)` loops until something inside it breaks out.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    for (i := 0; i < 3; i++) {\n        io.Println(i);\n    }\n}",
        "note": ""
      },
      {
        "id": "while",
        "title": "Condition-only loops",
        "text": "A `for` with only a condition repeats while that condition holds, like a `while` loop in other languages. The condition is checked before the first iteration, so the body may not run at all.\n\nPutting `defer` in front of the condition skips that first check: `for (defer cond)` always runs the body once, then checks the condition before each further iteration, like a do-while loop. The three-part form accepts it too. In `for (init; defer cond; update)`, the order is initialize, body, update, check, body, and so on.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    n := 1;\n    for (n < 5) {\n        n += 2;\n    }\n    io.Println(n);        // 5\n\n    tries := 0;\n    for (defer tries < 0) {\n        tries++;          // runs once even though the condition starts false\n    }\n    tries++;\n    io.Println(tries);    // 2\n}",
        "note": "This `defer` only changes when a loop's condition is first tested. It is unrelated to the `defer` statement that schedules a call for when a function returns."
      },
      {
        "id": "range",
        "title": "Looping over collections",
        "text": "`range` visits each element of an array, dynamic array, string, or map. With two variables, an array or string loop receives the index and a copy of the element, and a map loop receives each key and a copy of its value. With one variable, you get only the index (or only the key). Use `_` for a position you don't need.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    values := []int{10, 20, 30};\n    for (i, value := range values) {\n        if (i < 2) io.Printfln(\"{}: {}\", i, value);\n    }\n    total := 0;\n    for (_, value := range values) {\n        total += value;\n    }\n    io.Println(total - 30);\n}",
        "note": "",
        "after": "The collection expression is evaluated once, before the loop starts. Because each element is copied into the loop variable, changing that variable does not change the collection; assign through an index, such as `values[i] = …`, when you mean to. Map loops work on a snapshot of the map's entries and visit them in no particular order. Strings are traversed byte by byte."
      },
      {
        "id": "break-continue",
        "title": "break, continue, and labels",
        "text": "`break` leaves the innermost loop; `continue` skips to its next iteration (running the update of a three-part loop first). To affect an outer loop from inside a nested one, put a label before the outer loop and name it: `break outer;` or `continue outer;`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    outer: for (i := 0; i < 5; i++) {\n        for (j := 0; j < 5; j++) {\n            if (i * j == 6) {\n                io.Println(\"found \", i, \" \", j);\n                break outer;\n            }\n        }\n    }\n}",
        "note": ""
      },
      {
        "id": "switch",
        "title": "switch",
        "text": "A `switch` compares a value against each `case` in order and runs the first one that matches. A case can list several values separated by commas. Cases do not fall through into the next one: no `break` is needed. If you want to continue into the following case body, write `fallthrough;` as the last statement of a case. The `default` case runs when nothing else matches, wherever it is written.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    status := 2;\n    switch (status) {\n        case 0:\n            io.Println(\"ready\");\n        case 1, 2:\n            io.Println(\"busy\");\n        default:\n            io.Println(\"unknown\");\n    }\n}",
        "note": "",
        "after": "For choosing by the runtime type of a value there is a type switch, `switch (v := value.(type))`, covered on the interfaces page. Enums use `match`, covered on the enums page."
      },
      {
        "id": "condition-switch",
        "title": "Condition switches",
        "text": "Leave out the value, writing just `switch { … }`, and each `case` holds a boolean condition instead. The first case whose condition is true runs. This is a tidy replacement for a long `if`/`else if` chain.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    n := 7;\n    switch {\n        case n < 5:\n            io.Println(\"small\");\n        case n < 10:\n            io.Println(\"medium\");\n        default:\n            io.Println(\"large\");\n    }\n}",
        "note": ""
      },
      {
        "id": "goto",
        "title": "goto and labeled blocks",
        "text": "`goto label;` jumps to a labeled statement in the same function. A label can also name a block, written `name: { … }`. Jumps can go forward or backward within the current block or to an enclosing block, but they cannot jump into a nested block or loop, and cannot skip over a variable declaration that would still be in scope at the destination.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    n := 0;\nagain: {\n    n++;\n    if (n < 5) goto again;\n}\n    io.Println(n);\n}",
        "note": "",
        "after": "Most code is clearer with ordinary loops; `goto` is mainly useful for generated code and for jumping to shared cleanup."
      }
    ]
  },
  {
    "slug": "language/functions",
    "group": "Language guide",
    "title": "Functions",
    "description": "Parameters and results, multiple and named results, variadic functions, function values, closures, and defer.",
    "sections": [
      {
        "id": "declaring",
        "title": "Declaring a function",
        "text": "A function declaration lists its parameters, each written as a name followed by a type, and then its result type. Consecutive parameters with the same type can share it: `func add(a, b int) int`. Leave out the result type for a function that returns nothing. `return` ends the function and, if the function has a result, supplies it.",
        "code": "package main;\n\nimport \"io\";\n\nfunc add(a, b int) int {\n    return a + b;\n}\n\nfunc main() {\n    io.Println(add(2, 3));\n}",
        "note": "",
        "after": "Functions can call themselves recursively and can call functions declared anywhere in the package.\n\nA function with a result type should return a value on every path. If execution reaches the end of such a function, it returns the type's default value and the compiler prints a warning, so treat that warning as a bug to fix."
      },
      {
        "id": "multiple-results",
        "title": "Multiple results",
        "text": "List several result types in parentheses to return more than one value. The caller unpacks them with several variables on the left side of `:=` or `=`, and can discard any of them with `_`. This is a common way to return a value together with a success flag.",
        "code": "package main;\n\nimport \"io\";\n\nfunc divide(a, b int) (int, bool) {\n    if (b == 0) return 0, false;\n    return a / b, true;\n}\n\nfunc main() {\n    q, ok := divide(12, 3);\n    io.Println(q, \" \", ok);\n    q, ok = divide(1, 0);\n    io.Println(q, \" \", ok);\n}",
        "note": "",
        "after": "A call that returns several values can be passed directly as the whole argument list of another call, or returned directly: `return divide(a, b);`."
      },
      {
        "id": "named-results",
        "title": "Named results",
        "text": "Named results put names before the type, just like parameters. In `(total, count int)`, both results have type `int`. Named results start at their default values, behave like local variables, and are returned by a bare `return;`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc stats(values ...int) (total, count int) {\n    for (_, v := range values) {\n        total += v;\n    }\n    count = len(values);\n    return;\n}\n\nfunc main() {\n    total, count := stats(1, 2, 3);\n    io.Println(total, count);\n}",
        "note": ""
      },
      {
        "id": "variadic",
        "title": "Variadic functions",
        "text": "A final parameter written `name ...T` accepts any number of arguments of type `T`, including none. Inside the function it is an ordinary array of `T`. To pass an existing array as the variadic arguments, follow it with `...`. You can put individual arguments before the expanded array: `sum(10, numbers...)`.\n\nA parameter of type `...any` accepts arguments of different types; that is how `io.Println` takes anything you give it.",
        "code": "package main;\n\nimport \"io\";\n\nfunc sum(values ...int) int {\n    total := 0;\n    for (_, v := range values) {\n        total += v;\n    }\n    return total;\n}\n\nfunc main() {\n    numbers := []int{2, 4, 6};\n    io.Println(sum(), sum(numbers...), sum(10, numbers...));\n}",
        "note": ""
      },
      {
        "id": "value-semantics",
        "title": "Arguments are copies",
        "text": "Ocean passes every argument by value. A function that receives a string, array, map, or struct gets its own complete copy, including copies of everything nested inside it, so changes it makes are invisible to the caller. To let a function modify the caller's variable, pass a pointer: write `&variable` at the call and use a parameter of type `*T`. Inside the function, `*name` reaches the original.",
        "code": "package main;\n\nimport \"io\";\n\nfunc tryChange(value int) {\n    value = 100;     // changes only the local copy\n}\n\nfunc increment(value *int) {\n    *value += 1;\n}\n\nfunc main() {\n    a := 1;\n    tryChange(a);\n    b := 4;\n    increment(&b);\n    io.Println(a, b);\n}",
        "note": "",
        "after": "Copying is predictable but not free: passing a large array by value copies all of it. Pointers are covered in depth on the memory page."
      },
      {
        "id": "function-values",
        "title": "Function values",
        "text": "Functions are values. A function type starts with `func`, followed by the parameter list and optional results. For example, `func(int) int` takes an `int` and returns one, and `func()` takes and returns nothing. A function literal, `func(n int) int { return n * 2; }`, creates a function value on the spot. You can store function values in variables, pass them to other functions, return them, and keep them in structs and arrays. A named function can be used as a value just by writing its name.\n\nFor a function value to fit a function type, the parameter types, result types, and variadic marker must match exactly; parameter names don't matter. Widths count too: `func(i32) int` and `func(int) int` are different types.",
        "code": "package main;\n\nimport \"io\";\n\nfunc apply(values []int, change func(int) int) []int {\n    result := make([]int);\n    for (_, v := range values) {\n        result.append(change(v));\n    }\n    return result;\n}\n\nfunc square(n int) int { return n * n; }\n\nfunc main() {\n    offset := 3;\n    shifted := apply([]int{1, 2}, func(n int) int { return n + offset; });\n    squared := apply([]int{2, 3}, square);\n    io.Println(shifted[0], squared[1]);\n}",
        "note": "",
        "after": "Write `callbacks: [3]func() int;` to declare an array of three functions. A function returning an array of three integers has type `func() [3]int`.\n\nCalling a function variable that was never assigned panics. Generic functions must be given their type arguments before being used as values, as in `identity<int>`."
      },
      {
        "id": "closures",
        "title": "Closures",
        "text": "A function literal can use variables from the function around it. It captures them by reference: the literal and the surrounding code share the same variable, so an update by either is seen by both. A closure returned from a function keeps its captured variables alive, and each call of the outer function creates fresh variables.",
        "code": "package main;\n\nimport \"io\";\n\nfunc counter() func() int {\n    count := 0;\n    return func() int {\n        count++;\n        return count;\n    };\n}\n\nfunc main() {\n    a := counter();\n    b := counter();\n    first := a();\n    second := a();\n    io.Println(first, second, b());\n}",
        "note": "Methods cannot yet be used as values: `item.Describe` without parentheses is not allowed. Wrap the call in a function literal instead.",
        "after": "Inside loops, each iteration gets its own copy of the `range` variables and of variables declared in the loop body, so closures created in different iterations don't interfere. A variable declared in a three-part loop's initializer, like `i` in `for (i := 0; …)`, is a single variable shared by every iteration.\n\nIn the current implementation, captured variables live until the program exits."
      },
      {
        "id": "defer",
        "title": "defer",
        "text": "`defer` schedules a function call to run when the surrounding function returns, however it returns. The call's arguments are evaluated immediately, when the `defer` statement runs; only the call itself is postponed. Deferred calls run in reverse order, so the most recently deferred runs first. This makes `defer` the natural place for cleanup that must not be forgotten, such as closing a file or unlocking a mutex.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    defer io.Println(\"first\");\n    defer io.Println(\"second\");\n    io.Println(\"working\");\n}",
        "note": "",
        "after": "The return value is computed before deferred calls run. Deferred calls also run while a panic is unwinding the stack, which is how `recover` works; see the errors page."
      }
    ]
  },
  {
    "slug": "language/packages-and-imports",
    "group": "Language guide",
    "title": "Packages & imports",
    "description": "Split a program across files and directories, import other packages, and control what each package exports.",
    "sections": [
      {
        "id": "packages",
        "title": "One directory, one package",
        "text": "A package is a directory of `.oc` files. Every file in the directory must start with the same `package` declaration, and together they behave like one unit: functions, types, and globals declared in any of the files can be used from all of them, including private (lowercase) ones. Each subdirectory is a separate package.\n\nThe compiler always works on whole packages. Pointing a command at one file, as in `ocean run main.oc`, selects the entire directory containing it. Files whose names end in `_test.oc` are the exception: they hold tests and are only compiled by `ocean test` and `ocean check`.\n\nOnly a package named `main` that you build directly becomes a program. Any other package builds into a library object, and a function named `main` in an imported package is just an ordinary function.",
        "code": "",
        "note": ""
      },
      {
        "id": "modules",
        "title": "Modules",
        "text": "A module is a project: a directory tree with an `ocean.mod` file at its root. The file gives the module a name, usually where its source is hosted, such as `example.com/app`. Packages inside the module are imported by the module name followed by their directory path. Create the file with `ocean mod init example.com/app`; the tooling page describes it in full.",
        "code": "// file: ocean.mod\nmodule example.com/app\n\nocean 0.1\n// file: main.oc\npackage main;\n\nimport \"io\";\nimport \"example.com/app/greeting\";\n\nfunc main() {\n    io.Println(greeting.Message());\n}\n// file: greeting/greeting.oc\npackage greeting;\n\nfunc Message() string {\n    return \"Hello from \" + name();\n}\n\nfunc name() string {\n    return \"greeting\";\n}",
        "note": "",
        "after": "`main.oc` sits at the module root and `greeting/greeting.oc` in a subdirectory. Because `example.com/app/greeting` lies inside the current module, the compiler finds it on disk; nothing has to be published. Inside the module you may also write the shorter module-relative path, `import \"greeting\";`.",
        "links": [
          {
            "label": "Modules and dependencies",
            "href": "/docs/tooling/packages/"
          }
        ]
      },
      {
        "id": "exports",
        "title": "Exported and private names",
        "text": "A top-level name that starts with an uppercase letter is exported: other packages can use it. Anything else is private to its package. In the example above, `greeting.Message` is usable from `main`, but `greeting.name` is not. The rule applies to every kind of declaration: functions, globals, types, struct fields, methods, interfaces, aliases, and enums.",
        "code": "",
        "note": ""
      },
      {
        "id": "import-forms",
        "title": "Import forms",
        "text": "An import makes a package available in the current file only; each file lists the imports it uses. By default you refer to an imported package by its declared package name, which does not have to match the last part of its path. The exception is a package at the root of another module, which is named after the last part of the module path.",
        "code": "",
        "note": "",
        "after": "Dot imports save typing but can make it unclear where a name comes from, and two dot-imported packages that export the same name make that name ambiguous. Blank imports are for packages whose global initializers do work you need.",
        "table": {
          "headers": [
            "Form",
            "Effect"
          ],
          "rows": [
            [
              "`import \"io\";`",
              "Use the package as `io.Println(…)`"
            ],
            [
              "`import \"example.com/app/greeting\" as hello;`",
              "Choose your own qualifier: `hello.Message()`"
            ],
            [
              "`import . \"example.com/app/greeting\";`",
              "Use exported names without a qualifier: `Message()`"
            ],
            [
              "`import _ \"example.com/app/setup\";`",
              "Load and initialize the package without using its names"
            ]
          ]
        }
      },
      {
        "id": "resolution",
        "title": "Where imports come from",
        "text": "The compiler looks for an import path in three places: packages inside the current module, the standard library (in the installation's `src` directory, or wherever `OCEAN_SRC` points), and external modules, which are fetched with Git. External dependencies are covered on the packages and modules tooling page.",
        "code": "",
        "note": ""
      },
      {
        "id": "methods-ownership",
        "title": "Methods belong to their type's package",
        "text": "Methods can only be declared in the package that defines their receiver type, though they may be in any file of it. You cannot add methods to a type imported from another package. If you need extra behavior for an imported type, define a new type based on it in your package, with `type Local other.Type;`, and give that type methods. An alias, `type Local = other.Type;`, is just another name for the imported type and cannot receive methods.",
        "code": "",
        "note": ""
      },
      {
        "id": "init-order",
        "title": "Initialization order and errors",
        "text": "Imported packages are initialized before the packages that import them. Inside a package, global variables are initialized file by file in filename order, and in declaration order within each file. Import cycles, two files disagreeing about the package name, conflicting declarations, and use of another package's private names are all compile-time errors.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/strings",
    "group": "Language guide",
    "title": "Strings",
    "description": "Immutable byte strings, indexing and slicing, building text, byte arrays, and Unicode.",
    "sections": [
      {
        "id": "basics",
        "title": "What a string is",
        "text": "A `string` is an immutable sequence of bytes. String literals are stored as UTF-8, so text in any language works, but the string itself knows nothing about characters: `len(text)` counts bytes, and indexing gives you a byte. `text.length` is another way to get the same count.\n\nBecause strings are immutable, you never modify one in place. Operations such as concatenation produce a new string, and assigning it to the variable replaces the old one.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    word := \"héllo\";\n    io.Println(len(word), \" \", word[0], \" \", word[1:3]);\n}",
        "note": "",
        "after": "`héllo` has five characters but six bytes, because `é` takes two bytes in UTF-8. `word[0]` is the byte `104` (the letter `h`) as an `i8`. Slicing with `word[1:3]` selects bytes 1 and 2, which happen to form `é`. Slicing in the middle of a multi-byte character produces invalid UTF-8, so be careful when working with non-ASCII text."
      },
      {
        "id": "building",
        "title": "Building strings",
        "text": "`+` joins two strings, and `+=` appends to a string variable. A single byte, such as a character literal, can also be added to either end: `text + '!'`. To turn other values into text, use `io.Sprint`, which formats anything `io.Println` can print, or `io.Sprintf`, which fills `{}` placeholders.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    count := 3;\n    text := \"Ocean has \" + io.Sprint(count);\n    text += \" seas\";\n    text = text + '!';\n    io.Println(text);\n}",
        "note": ""
      },
      {
        "id": "comparing",
        "title": "Comparing strings",
        "text": "`==` and `!=` compare the full contents of two strings, so two separately built strings with the same text are equal. `<`, `<=`, `>`, and `>=` order strings byte by byte; see the operators page for the exact rule.",
        "code": "",
        "note": ""
      },
      {
        "id": "slicing",
        "title": "Slicing",
        "text": "`text[start:end]` produces a new string containing the bytes from index `start` up to, but not including, `end`. Leave out `start` to begin at zero or `end` to go to the end: `text[:3]`, `text[3:]`. The bounds must satisfy `0 <= start <= end <= len(text)`; anything else stops the program with a bounds error.",
        "code": "",
        "note": ""
      },
      {
        "id": "iterating",
        "title": "Iterating over bytes",
        "text": "A `range` loop over a string visits it one byte at a time, giving the index and the byte. To find a character, compare bytes against character literals.",
        "code": "package main;\n\nimport \"io\";\n\nfunc countSpaces(text string) int {\n    count := 0;\n    for (_, b := range text) {\n        if (b == ' ') count++;\n    }\n    return count;\n}\n\nfunc main() {\n    io.Println(countSpaces(\"a b c\"));\n}",
        "note": ""
      },
      {
        "id": "bytes",
        "title": "Strings and byte arrays",
        "text": "When you need to change bytes, copy the string into a byte array, which is a dynamic array of `i8`. Assigning a string to a `[]i8` variable makes an independent copy, and casting the array back with `-> string` copies it again. `text.array()` also returns a copy of the bytes, as a fixed-size array.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    text := \"hello\";\n    bytes: []i8 = text;\n    bytes[0] = 'H';\n    io.Println(bytes -> string);\n}",
        "note": "",
        "after": "Changes to `bytes` never affect `text`. Printing a byte array directly shows its numbers, such as `[72, 101, 108, 108, 111]`; cast it to `string` to print it as text."
      },
      {
        "id": "no-strings-package",
        "title": "Common string tasks",
        "text": "There is no separate strings package yet. Tasks such as searching, splitting, and changing case are done with byte loops, slices, and dynamic arrays. For conversions between text and numbers, use the `io` package: `io.Sprint(value)` turns a number into text, while `io.ParseInt(text)` and `io.ParseFloat(text)` read numbers back and report failures as a `Result`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc split(text string, separator i8) []string {\n    parts := make([]string);\n    start := 0;\n    for (i, b := range text) {\n        if (b == separator) {\n            parts.append(text[start:i]);\n            start = i + 1;\n        }\n    }\n    parts.append(text[start:]);\n    return parts;\n}\n\nfunc main() {\n    io.Println(split(\"ocean,sea,wave\", ','));\n}",
        "note": "",
        "links": [
          {
            "label": "The io package",
            "href": "/docs/library/io/"
          }
        ]
      },
      {
        "id": "c-strings",
        "title": "Strings and C",
        "text": "Ocean strings are not terminated by a zero byte. When you pass text to a C function, pass `text.data` (a raw pointer to the bytes) and add the terminator yourself, for example `\"hello\\0\".data`. The C interop page covers this in detail.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/collections",
    "group": "Language guide",
    "title": "Arrays",
    "description": "Fixed-size arrays, growable dynamic arrays, slicing, concatenation, and bounds checking.",
    "sections": [
      {
        "id": "overview",
        "title": "Two kinds of arrays",
        "text": "Ocean has two array types, and choosing between them is mostly a question of whether the length can change.\n\nA fixed-size array, `[n]T`, holds exactly `n` elements of type `T`. Its length never changes, and its elements are stored directly in the variable (on the stack, for a local). A dynamic array, `[]T`, can grow and shrink: it stores its elements in heap memory and has methods such as `append` and `pop`.\n\nThe brackets always come before the element type. Code written with the older `int[]` and `int[3]` spellings no longer compiles; `ocean fix` updates it.\n\nBoth kinds are values. Assigning an array, passing it to a function, or returning it copies every element, so two variables never secretly share the same array. Every array also checks its indexes: reading or writing outside the array stops the program with an error that shows the offending line and a call trace.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "Compiler & CLI: ocean fix",
            "href": "/docs/tooling/cli/#section-fix"
          }
        ]
      },
      {
        "id": "fixed",
        "title": "Fixed-size arrays",
        "text": "Declare a fixed array with its length in the type: `scores: [3]int;` starts as three zeros. Initialize it with a list in braces; missing elements are filled with zeros. When the length comes from the list itself, write `[...]int{…}`, or let a plain `:=` infer it. The length can also be a runtime value, as in `buffer: [n]int;`, in which case the array is still fixed once created.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    padded: [3]int = {1, 2};\n    counted := [...]int{4, 5};\n    inferred := {6, 7, 8};\n    n := 4;\n    sized: [n]int;\n    io.Println(len(inferred), \" \", padded, \" \", len(counted), \" \", len(sized));\n}",
        "note": ""
      },
      {
        "id": "array-param",
        "title": "Accepting arrays of any length",
        "text": "To write a function that accepts a fixed array of any length, use the parameter type `array<T>`. A `[n]T` of any length can be passed to it. `array<T>` describes arrays but cannot create one: construct a `[n]T` and pass it.",
        "code": "package main;\n\nimport \"io\";\n\nfunc total(values array<int>) int {\n    sum := 0;\n    for (_, v := range values) {\n        sum += v;\n    }\n    return sum;\n}\n\nfunc main() {\n    io.Println(total([3]int{1, 2, 3}), \" \", total([...]int{4, 5}));\n}",
        "note": ""
      },
      {
        "id": "dynamic",
        "title": "Dynamic arrays",
        "text": "A dynamic array, `[]T`, starts empty unless you give it elements. Create one with a literal, `[]int{1, 2}`, with `make([]int)`, or just by declaring `items: []int;`. It grows as you add to it.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    items := make([]int);\n    items.append(3, 4);       // [3 4]\n    items.prepend(1);         // [1 3 4]\n    items.add(1, 2);          // insert 2 at index 1: [1 2 3 4]\n    io.Println(items, \" \", items.length);\n\n    last := items.pop();      // removes and returns 4\n    first := items.remove(0); // removes and returns 1\n    io.Println(last, \" \", first, \" \", items);\n}",
        "note": "",
        "after": "Removing from an empty array, or with an invalid index, is a bounds error. When a dynamic array runs out of room it at least doubles its capacity, so appending one element at a time is efficient on average.",
        "table": {
          "headers": [
            "Operation",
            "Effect"
          ],
          "rows": [
            [
              "`append(values...)`",
              "Add values at the end"
            ],
            [
              "`prepend(values...)`",
              "Add values at the start"
            ],
            [
              "`add(index, values...)`",
              "Insert values before `index`"
            ],
            [
              "`remove(index)`",
              "Remove and return the element at `index`"
            ],
            [
              "`pop()`",
              "Remove and return the last element"
            ],
            [
              "`array()`",
              "Return a fixed-size copy of the current elements"
            ],
            [
              "`length`, `capacity`",
              "Number of elements, and the number of elements that fit before more memory is needed"
            ]
          ]
        }
      },
      {
        "id": "indexing",
        "title": "Indexing and checked reads",
        "text": "`items[i]` reads or writes element `i`, counting from zero. An index outside the array is a runtime error that stops the program. When an index might be out of range, use the two-value form instead: `value, ok := items[i];` gives the element and `true`, or the type's default value and `false`, without stopping.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    items := []int{10, 20};\n    value, ok := items[5];\n    io.Println(value, \" \", ok);\n}",
        "note": ""
      },
      {
        "id": "slicing",
        "title": "Slicing",
        "text": "`items[start:end]` copies the elements from `start` up to but not including `end` into a new dynamic array. Either bound may be left out: `items[:2]`, `items[1:]`, `items[:]`. The slice is a separate array, so changing it does not change the original. The bounds must satisfy `0 <= start <= end <= len(items)`.",
        "code": "",
        "note": ""
      },
      {
        "id": "concatenation",
        "title": "Joining arrays with +",
        "text": "`a + b` produces a new array containing the elements of `a` followed by those of `b`. A single element can be added to either end as well: `items + 5` and `0 + items`. With `+=`, the result replaces the left-hand variable; for dynamic arrays, `items += 5` appends in place.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    first := []int{1, 2};\n    joined := first + []int{3, 4};\n    first += 5;\n    io.Println(joined, \" \", 0 + first);\n}",
        "note": ""
      },
      {
        "id": "nested",
        "title": "Arrays of arrays",
        "text": "Array types read left to right: `[2]int` is \"an array of two ints\", so `[3][2]int` is \"three arrays of two ints\". The first index selects one of the three inner arrays. For rows of varying length, use a dynamic array of dynamic arrays, `[][]int`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    grid: [3][2]int;\n    io.Println(len(grid), \" \", len(grid[0]));\n\n    rows := [][]int{[]int{1, 2}, []int{3}};\n    rows[1].append(4);\n    io.Println(rows);\n}",
        "note": ""
      },
      {
        "id": "literals",
        "title": "Array literals need a type outside assignments",
        "text": "A brace list on the right of an assignment or declaration takes its type from the variable: `values: []int = {1, 2};`. Everywhere else, such as in a function argument or a `return`, the literal needs its type written in front: `sum([]int{1, 2})`, `return []string{\"a\"};`.",
        "code": "",
        "note": "For historical reasons, `[5]int` used as an expression on its own (without braces) creates a dynamic array of five zeros. Use `values: [5]int;` or `[5]int{}` when you want a fixed-size array."
      },
      {
        "id": "data",
        "title": "The size and data fields",
        "text": "Every array has two low-level fields. `.size` is the number of bytes its elements occupy, so `len(items)` equals `items.size / sizeof(element type)`. `.data` is a raw pointer to the first element, used when passing an array's contents to C code. Indexing through `.data` is not bounds-checked. The memory and C interop pages explain when to use them.",
        "code": "",
        "note": ""
      },
      {
        "id": "free",
        "title": "Releasing a dynamic array early",
        "text": "A dynamic array's memory is released automatically when its variable goes out of scope. If you are finished with a large array sooner, `free(items)` releases it immediately. Assign a new value, such as `items = {};`, before using the variable again.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/maps",
    "group": "Language guide",
    "title": "Maps",
    "description": "Built-in hash maps: creating them, reading safely, updating, deleting, and iterating.",
    "sections": [
      {
        "id": "create",
        "title": "Creating a map",
        "text": "`map[K]V` is a hash map from keys of type `K` to values of type `V`. Write a map literal with `key: value` pairs. A map declared without an initializer, or made with `make(map[K]V)`, starts empty and is ready to use; there is no separate \"nil map\" state.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    ages := map[string]int{\"Ada\": 36, \"Lin\": 28};\n    ages[\"Lin\"] += 1;        // update an entry\n    ages[\"Kai\"] = 3;         // insert a new one\n    delete(ages, \"Kai\");     // removing a missing key is harmless\n    io.Println(len(ages), \" \", ages[\"Ada\"] / 12, \" \", ages[\"Lin\"] - 27);\n}",
        "note": ""
      },
      {
        "id": "reading",
        "title": "Reading safely",
        "text": "Reading a key with `m[key]` alone expects the key to exist and panics if it does not. When a key might be missing, use the two-value form: `value, found := m[key];` returns the stored value and `true`, or the value type's default and `false`. Neither form adds an entry to the map.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    ages := map[string]int{\"Ada\": 36};\n    age, found := ages[\"Grace\"];\n    io.Println(age, \" \", found);\n}",
        "note": ""
      },
      {
        "id": "iterate",
        "title": "Iterating",
        "text": "A `range` loop over a map visits each key, or each key and value. The order is not specified and can differ from insertion order, so sort the keys yourself if order matters. The loop walks a snapshot, so modifying the map inside the loop does not disturb the iteration.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    stock := map[string]int{\"rope\": 3, \"sail\": 1};\n    for (item, count := range stock) {\n        io.Printfln(\"{}: {}\", item, count);\n    }\n}",
        "note": ""
      },
      {
        "id": "keys",
        "title": "Keys and values",
        "text": "Keys are compared with Ocean's normal equality rules: strings and structs by content, pointers by address. Values can be any type, including arrays, structs, and other maps. Type modifiers are prefixes, so `map[string][]int` maps strings to dynamic arrays of integers, while `[]map[string]int` is a dynamic array of maps.\n\nInterface types, including `any`, can be used for keys, values, or both, and then each entry may hold a different concrete type: `map[any]any{1: \"one\", \"two\": 2}`. With `any` keys, numbers compare by value, so `1` and `1.0` are the same key.",
        "code": "",
        "note": ""
      },
      {
        "id": "semantics",
        "title": "Copying and limits",
        "text": "Like arrays, maps are values: assigning or passing a map copies all of its entries. Use a pointer, `*map[K]V`, to share one map. Two maps compare equal with `==` when they hold the same entries.\n\nYou cannot take the address of a map entry, because entries may move when the map grows. Printing a map directly with `io.Println` is not supported yet; loop over its entries instead.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/types",
    "group": "Language guide",
    "title": "Structs & methods",
    "description": "Group data in structs, attach behavior with methods, and create distinct types and aliases.",
    "sections": [
      {
        "id": "structs",
        "title": "Declaring structs",
        "text": "A struct groups named fields. Each field is a name followed by a type, and fields with the same type can share a declaration: `x, y int;`. Create a struct value with a literal, listing values in field order or naming the fields you want to set. Fields you leave out get their default values. Read and write fields with a dot.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Person {\n    name string;\n    age int;\n    visits int;\n}\n\nfunc main() {\n    ada := Person{\"Ada\", 36, 0};\n    lin := Person{name: \"Lin\"};\n    ada.age++;\n    io.Println(ada.name, \" \", ada.age, \" \", lin.visits);\n}",
        "note": "",
        "after": "A struct literal used as a function argument or return value must name its type, `Person{…}`; when assigned to a variable of known type, the type may be omitted: `p: Person = {\"Kai\", 9, 0};`. Structs can contain any type, including arrays, maps, and other structs. A struct cannot contain itself directly; use a pointer field such as `next *Node` for linked structures."
      },
      {
        "id": "copies",
        "title": "Structs are values",
        "text": "Assigning a struct copies all of its fields, including any strings, arrays, and maps inside it. The copy and the original are completely independent. To share a struct, use a pointer: `p := &ada;` and then `p.age` reads through it (no explicit `*` is needed for field access).",
        "code": "",
        "note": ""
      },
      {
        "id": "methods",
        "title": "Methods",
        "text": "A method is a function with a receiver, written in parentheses before the name. A value receiver, `(p Person)`, gets a copy of the struct. A pointer receiver, `(p *Person)`, gets the address of the original and can modify it. You call a pointer-receiver method on an ordinary variable without writing `&`; Ocean takes the address for you.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Person {\n    name string;\n    age int;\n}\n\nfunc (p Person) Greeting() string {\n    return \"Hi, I'm \" + p.name + \" (\" + io.Sprint(p.age) + \")\";\n}\n\nfunc (p *Person) Birthday() {\n    p.age++;\n}\n\nfunc main() {\n    ada := Person{\"Ada\", 36};\n    ada.Birthday();\n    io.Println(ada.Greeting());\n}",
        "note": "",
        "after": "Methods follow the same export rule as everything else: `Greeting` is visible to other packages, a lowercase method would not be."
      },
      {
        "id": "value-parameters",
        "title": "Struct parameters",
        "text": "A struct can declare value parameters in parentheses after its name. They become read-only fields at the front of the struct, set once when the value is created. Later fields can use them, for example as array lengths. This is how you write a struct whose shape is chosen at creation time.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Grid(width, height int) {\n    cells [height][width]int;\n}\n\nfunc main() {\n    grid := Grid{3, 2};\n    grid.cells[1][2] = 7;\n    io.Println(grid.width, \" \", grid.height, \" \", grid.cells[1][2]);\n}",
        "note": "",
        "after": "`grid.width = 4;` would be a compile-time error: parameters can't change after construction. Because `cells` is `[height][width]int`, it holds `height` rows of `width` integers; see Arrays of arrays on the arrays page."
      },
      {
        "id": "bitfields",
        "title": "Bitfields",
        "text": "To pack several small values into as few bytes as possible, give a field a size in bits: `name Type : bits;`. Each bitfield stores only that many bits of its value. The type must be an integer type (including `varint(n)` or a type defined from one) or `bool` with a size of 1. Sizes run from 1 to 64 bits and can't exceed the width of the field's type.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Pixel {\n    red, green, blue u8 : 5;\n    visible bool : 1;\n    alpha int : 4;\n}\n\nfunc main() {\n    p: Pixel;\n    p.red = 31;\n    p.green = 40;               // keeps only the low 5 bits: 8\n    p.visible = true;\n    p.alpha = 9;                // a signed 4-bit field holds -8 to 7: reads back -7\n    io.Println(p.red, \" \", p.green, \" \", p.visible, \" \", p.alpha, \" \", sizeof(Pixel));\n}",
        "note": "",
        "after": "Adjacent bitfields share storage. They fill it in order, starting from the lowest bits, until the next one would take the group past 64 bits. An ordinary field between bitfields starts a new group. Here all five fields fit in 20 bits, so the whole struct takes 4 bytes. Writing a value that doesn't fit keeps its low bits and leaves the neighboring fields alone. Reading a signed field sign-extends it. An assignment or a prefix `++`/`--` used as a value gives back what was actually stored, so `++p.alpha` on a field holding 7 is -8. Postfix `p.alpha++` gives back the old value, 7, and still stores -8. Enum variant payloads can't contain bitfields.\n\nA bitfield has no address of its own, so `&p.red` is an error, and so is calling a method with a pointer receiver on one. If you write the type as `varint(n)` and then give the field fewer than `n` bits, as in `num varint(6) : 5;`, the compiler warns that the two sizes disagree. Defined types are exempt from the warning, so `type Nibble varint(4);` followed by `low Nibble : 3;` compiles quietly."
      },
      {
        "id": "defined-types",
        "title": "Defining new types",
        "text": "`type Name Existing;` defines a new type with the same representation as an existing one but its own identity. A `UserID` defined from `int` is not interchangeable with `int` or with another type defined from `int`; converting requires a cast. This catches mix-ups, such as passing a user ID where an order ID is expected. Defined types can have their own methods.",
        "code": "package main;\n\nimport \"io\";\n\ntype UserID int;\n\nfunc (id UserID) Label() string {\n    return \"user #\" + io.Sprint(id -> int);\n}\n\nfunc main() {\n    id := 42 -> UserID;\n    io.Println(id.Label());\n}",
        "note": ""
      },
      {
        "id": "aliases",
        "title": "Aliases",
        "text": "`type Name = Existing;` creates an alias: another name for exactly the same type. Aliases need no casts and share their target's methods. They are useful for shortening long types, such as `type Callback = func(int) bool;`.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/enums",
    "group": "Language guide",
    "title": "Enums & match",
    "description": "Model values that can be one of several variants, each with its own data, and take them apart with match.",
    "sections": [
      {
        "id": "declaring",
        "title": "Declaring an enum",
        "text": "An enum lists the variants a value can be. Each variant can carry its own data: nothing (a unit variant), a list of positional values (a tuple variant), named fields (a record variant), or a fixed value set in the declaration. Variants belong to their enum, so you always write them qualified, as `Shape.Circle`, and two enums can reuse the same variant names.",
        "code": "package main;\n\nimport \"io\";\n\nenum Shape {\n    Dot,\n    Circle(float),\n    Rect{w, h int},\n}\n\nfunc main() {\n    io.Println(Shape.Dot);\n    io.Println(Shape.Circle(1.5));\n    io.Println(Shape.Rect{w: 2, h: 3});\n}",
        "note": "",
        "after": "Enums are not integers in disguise. A fixed variant, declared as `One := 1` or `Red: []int = {255, 0, 0}`, is still a variant that carries that value, not a numeric constant. The data inside a variant can't be modified after creation."
      },
      {
        "id": "match",
        "title": "Taking enums apart with match",
        "text": "`match` checks which variant a value holds and runs the matching arm. Each arm is a pattern, `=>`, and a statement or a block. Patterns can bind the variant's data to names: positional names for a tuple, and field names for a record (or `alias = field` to bind a field under a different name). Use `_` to ignore a position. An arm written as just the enum's name, such as `Shape => …`, is the default and matches anything not handled earlier.",
        "code": "package main;\n\nimport \"io\";\n\nenum Shape {\n    Dot,\n    Circle(float),\n    Rect{w, h int},\n}\n\nfunc area(s Shape) float {\n    match (s) {\n        Shape.Circle(r) => return 3.0 * r * r;\n        Shape.Rect{width = w, height = h} => {\n            return (width * height) -> float;\n        }\n        Shape => return 0.0;\n    }\n}\n\nfunc main() {\n    io.Println(area(Shape.Circle(1.0)), area(Shape.Rect{w: 2, h: 3}), area(Shape.Dot));\n}",
        "note": "",
        "after": "The compiler warns when a `match` without a default arm leaves out a variant, so adding a variant later points you to every place that needs updating. When every arm returns, the compiler knows the function can't fall off the end."
      },
      {
        "id": "testing-variants",
        "title": "Checking and extracting a single variant",
        "text": "To test which variant a value holds without a full `match`, compare it with the bare variant: `shape == Shape.Circle` is true for any circle. Comparing with a complete value, `shape == Shape.Circle(1.0)`, also compares the data.\n\nTo pull the data out directly, use an extraction: `radius := shape.(Shape.Circle);`. A tuple with several values unpacks into several names, and a record can be unpacked by field name. Extraction assumes you know the variant: if the value holds a different one, the program stops immediately. Check first, or use `match`.",
        "code": "package main;\n\nimport \"io\";\n\nenum Event {\n    Load,\n    Move(int, int),\n    Click{x, y int},\n}\n\nfunc main() {\n    move := Event.Move(7, 8);\n    dx, dy := move.(Event.Move);\n\n    click := Event.Click{x: 1, y: 9};\n    if (click == Event.Click) {\n        x, y := click.(Event.Click{x, y});\n        io.Println(dx, dy, x, y);\n    }\n}",
        "note": ""
      },
      {
        "id": "methods",
        "title": "Methods on enums",
        "text": "Enums can have methods, with value or pointer receivers, just like structs. A method may not share its name with a variant or a record field of its enum.",
        "code": "package main;\n\nimport \"io\";\n\nenum Light { Red, Amber, Green }\n\nfunc (l Light) CanGo() bool {\n    return l == Light.Green;\n}\n\nfunc main() {\n    io.Println(Light.Green.CanGo(), Light.Red.CanGo());\n}",
        "note": ""
      },
      {
        "id": "generic-enums",
        "title": "Generic enums",
        "text": "An enum can take type parameters, written in angle brackets after its name. When creating a value you supply the type arguments, `Tree<int>.Node(5)`. In patterns and extractions the type arguments can be left out, because they are known from the value being matched. Each set of type arguments makes a distinct type.",
        "code": "",
        "note": ""
      },
      {
        "id": "optional",
        "title": "Optional<T>",
        "text": "`Optional<T>` is a built-in generic enum for a value that may be absent. It has two variants, `Optional<T>.value(x)` and `Optional<T>.none`. `none` is equal to `null`, so you can assign `null` to an optional and test `opt == null`. An optional declared without a value is `none`.\n\n`hasValue()` reports whether a value is present, and `unwrap()` returns it, panicking if there is none. Use `match` to handle both cases at once.",
        "code": "package main;\n\nimport \"io\";\n\nfunc find(items []string, wanted string) Optional<int> {\n    for (i, item := range items) {\n        if (item == wanted) return Optional<int>.value(i);\n    }\n    return null;\n}\n\nfunc main() {\n    items := []string{\"rope\", \"sail\", \"oar\", \"net\"};\n    match (find(items, \"net\")) {\n        Optional.value(index) => io.Println(\"found \", index);\n        Optional.none => io.Println(\"missing\");\n    }\n    if (!find(items, \"anchor\").hasValue()) io.Println(\"missing\");\n}",
        "note": "",
        "after": "The other built-in enum, `Result<T>`, carries either a value or an error message. It is the standard way to report recoverable errors, and has its own section on the errors page.",
        "links": [
          {
            "label": "Errors and Result",
            "href": "/docs/language/errors/"
          }
        ]
      }
    ]
  },
  {
    "slug": "language/errors",
    "group": "Language guide",
    "title": "Errors",
    "description": "Report recoverable failures with Result, stop on bugs with panic, and recover when you must.",
    "sections": [
      {
        "id": "two-kinds",
        "title": "Two kinds of failure",
        "text": "Ocean separates failures you expect from failures that indicate a bug.\n\nAn expected failure, such as a missing file or text that isn't a number, is returned as a value of the built-in type `Result<T>`. The caller decides what to do about it. The standard library reports all recoverable errors this way.\n\nA failure that should never happen, such as an index out of range or a broken assumption, is a panic. A panic prints a message, the source location, and a call trace, then ends the program with exit status 1 unless something recovers it.",
        "code": "",
        "note": ""
      },
      {
        "id": "result",
        "title": "Result<T>",
        "text": "`Result<T>` is a built-in enum with two variants: `Result<T>.value(x)` holds a successful result and `Result<T>.error(message)` holds an error message string. It has methods for the common ways of handling it.",
        "code": "",
        "note": "",
        "after": "`unwrapOrElse` takes a plain value, not a function, and that value is always evaluated, even when the result is a success.",
        "table": {
          "headers": [
            "Method",
            "On a value",
            "On an error"
          ],
          "rows": [
            [
              "`unwrap()`",
              "Returns the value",
              "Panics with the error message"
            ],
            [
              "`unwrapOrElse(fallback)`",
              "Returns the value",
              "Returns `fallback`"
            ],
            [
              "`unwrapOrZero()`",
              "Returns the value",
              "Returns the type's default value"
            ],
            [
              "`hasError()`",
              "`false`",
              "`true`"
            ],
            [
              "`error()`",
              "Panics",
              "Returns the error message"
            ]
          ]
        }
      },
      {
        "id": "handling",
        "title": "Handling a Result",
        "text": "Use `unwrap()` when an error really is unexpected and stopping is the right response, as in a quick script. When you can do something sensible instead, check `hasError()`, use a fallback, or `match` on the two variants.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(io.ParseInt(\"42\").unwrap());\n    io.Println(io.ParseInt(\"forty\").unwrapOrElse(0));\n\n    match (io.ParseInt(\"seven\")) {\n        Result.value(n) => io.Println(n);\n        Result.error(message) => io.Printfln(\"could not read \\\"seven\\\": {}\", message);\n    }\n}",
        "note": ""
      },
      {
        "id": "returning",
        "title": "Returning a Result",
        "text": "Your own functions return errors the same way: declare a `Result<T>` result type and construct one of its variants. To pass an error from a call on to your own caller, check it and return a new error. When the payload types differ, extract the message with `error()`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc ratio(a, b string) Result<float> {\n    top := io.ParseFloat(a);\n    if (top.hasError()) return Result<float>.error(top.error());\n    bottom := io.ParseFloat(b);\n    if (bottom.hasError()) return Result<float>.error(bottom.error());\n    if (bottom.unwrap() == 0) return Result<float>.error(\"cannot divide by zero\");\n    return Result<float>.value(top.unwrap() / bottom.unwrap());\n}\n\nfunc main() {\n    io.Println(ratio(\"3\", \"2\").unwrap());\n    result := ratio(\"1\", \"0\");\n    if (result.hasError()) io.Println(\"error: \", result.error());\n}",
        "note": ""
      },
      {
        "id": "panic",
        "title": "panic",
        "text": "`panic \"message\";` stops the current function and starts unwinding the call stack. Deferred calls run on the way out. If nothing recovers, the program prints `Panic:` with the message, the file, line, and column, the offending source line, and a call trace, then exits with status 1. The message must be a string. Because a panic never returns, a function may end in a panic instead of a `return`.\n\nThe runtime raises the same kind of error for problems it detects, such as an out-of-range array index or a missing map key. Those reports work without debug symbols or source files, because the compiler embeds the needed source snippets in the executable.",
        "code": "",
        "note": ""
      },
      {
        "id": "return-panic",
        "title": "return panic: blaming the caller",
        "text": "Often a function panics because it was called incorrectly. `return panic \"message\";` reports the panic at the place where the current function was called, rather than inside it, so the diagnostic points at the code that needs fixing. The full call trace is still shown.",
        "code": "package main;\n\nimport \"io\";\n\nfunc check(n int) int {\n    if (n < 0) return panic \"negative input\";\n    return n;\n}\n\nfunc main() {\n    io.Println(check(-1));    // the panic is reported here\n}",
        "note": "",
        "after": "`return panic` skips the deferred calls of the function it appears in. `forward panic` extends this through helper layers: write `forward panic return helper();`, or `forward panic { first(); second(); }` around several statements, and a `return panic` coming out of those calls is reported at your caller instead. Only panics that originate from `return panic` are forwarded; an ordinary `panic` keeps its own location."
      },
      {
        "id": "recover",
        "title": "Recovering from a panic",
        "text": "`recover()` stops a panic, but only when it is called directly inside a deferred function while that panic is unwinding. It returns the panic message as an `any` holding a `string`. In any other situation it returns `null`. After recovery, the function that panicked returns normally to its caller: named results keep their current values, and other results are default values.",
        "code": "package main;\n\nimport \"io\";\n\nfunc divide(a, b int) (result int) {\n    defer func() {\n        message := recover();\n        if (message != null) {\n            io.Println(\"recovered: \", message.(string));\n            result = -1;\n        }\n    }();\n    if (b == 0) panic \"division by zero\";\n    return a / b;\n}\n\nfunc main() {\n    io.Println(divide(1, 0));\n}",
        "note": "",
        "after": "Recover from panics sparingly. A deferred cleanup that needs to run is a good use; using panics for ordinary error handling is not, because `Result` makes those paths visible in function signatures."
      }
    ]
  },
  {
    "slug": "language/interfaces",
    "group": "Language guide",
    "title": "Interfaces & any",
    "description": "Describe behavior with interfaces, hold any value with any, and recover concrete types with assertions and type switches.",
    "sections": [
      {
        "id": "interfaces",
        "title": "Declaring and satisfying interfaces",
        "text": "An interface lists method signatures. Any type that has those methods satisfies the interface automatically; there is no `implements` declaration. A variable of an interface type can hold a value of any satisfying type, and calling a method on it runs the concrete type's method.",
        "code": "package main;\n\nimport \"io\";\n\ninterface Shape {\n    Area() float;\n    Name() string;\n}\n\nstruct Square { side float; }\nstruct Circle { radius float; }\n\nfunc (s Square) Area() float { return s.side * s.side; }\nfunc (s Square) Name() string { return \"square\"; }\nfunc (c Circle) Area() float { return 3.14 * c.radius * c.radius; }\nfunc (c Circle) Name() string { return \"circle\"; }\n\nfunc report(shape Shape) {\n    io.Println(shape.Name(), \" \", shape.Area());\n}\n\nfunc main() {\n    report(Square{2.0});\n    report(Circle{1.0});\n}",
        "note": "",
        "after": "In an interface, parameter names are optional (`Scale(float) float`), and the `func` keyword before a method is allowed but not required."
      },
      {
        "id": "pointer-methods",
        "title": "Pointer receivers",
        "text": "If a type's methods use a pointer receiver, only a pointer to it satisfies the interface: store `&value`, not `value`. Calls through the interface then modify the original. Methods with value receivers work on a copy of the value stored in the interface.",
        "code": "",
        "note": ""
      },
      {
        "id": "any",
        "title": "any",
        "text": "`any` is the interface with no methods, so every value satisfies it. Use it when a function must accept values of many unrelated types, as `io.Println` does. A value of type `any` has no methods you can call; to use it, find out its concrete type first.\n\nInterface values, including `any`, can be `null`, and that is their default value. Calling a method on a null interface panics.",
        "code": "",
        "note": ""
      },
      {
        "id": "assertions",
        "title": "Type assertions",
        "text": "`value.(Type)` extracts the concrete value from an interface. If the value holds some other type, the program stops, so only assert this way when you know the type.\n\nTo test the type instead, assign the assertion to two names: `msg, ok := value.(string);`. The second name is a `bool` that reports whether the value held that type. When it is `false`, the first name holds the type's zero value and the program keeps running. The two-name form also works with `=` and in an `if` initializer. To choose between several types, use a type switch.",
        "code": "package main;\n\nimport \"io\";\n\nfunc show(value any) {\n    if (msg, ok := value.(string); ok) {\n        io.Println(\"text \" + msg);\n        return;\n    }\n    io.Println(\"not text\");\n}\n\nfunc main() {\n    show(\"hi\");\n    show(42);\n}",
        "note": ""
      },
      {
        "id": "type-switch",
        "title": "Type switches",
        "text": "A type switch, `switch (v := value.(type))`, tests the value's concrete type against each case in order. In a case that names a single type, `v` has that type. In a case listing several types, and in `default`, `v` keeps the original interface type.",
        "code": "package main;\n\nimport \"io\";\n\nfunc describe(value any) string {\n    switch (v := value.(type)) {\n        case int:\n            return \"number \" + io.Sprint(v);\n        case string:\n            return \"text \" + v;\n        default:\n            return \"something else\";\n    }\n}\n\nfunc main() {\n    io.Println(describe(4));\n    io.Println(describe(\"hi\"));\n    io.Println(describe(true));\n}",
        "note": ""
      },
      {
        "id": "arrays",
        "title": "Arrays of interface values",
        "text": "An array whose element type is an interface, such as `[]Shape`, is uniform by default: every element must have the same concrete type. To hold different types in one array, mark it `mixed`. A `mixed []any` can hold anything.",
        "code": "package main;\n\nimport \"io\";\n\ninterface Named { Name() string; }\nstruct Square {}\nstruct Circle {}\nfunc (s Square) Name() string { return \"square\"; }\nfunc (c Circle) Name() string { return \"circle\"; }\n\nfunc main() {\n    shapes: mixed []Named = {Square{}, Circle{}};\n    for (_, shape := range shapes) {\n        io.Println(shape.Name());\n    }\n    anything := mixed []any{1, \"two\", true};\n    anything.append(3.5);\n}",
        "note": "",
        "after": "A variadic `...any` parameter is a `mixed []any`, which is why `io.Println(1, \"two\")` works."
      },
      {
        "id": "type-lists",
        "title": "Type-list interfaces",
        "text": "Instead of methods, an interface can contain a list of types separated by `|`. Such an interface is satisfied by exactly those types. Prefix a type with `~` to also accept defined types built on it: `~int` matches `int` and `type UserID int`, but not narrower types such as `i32`. Type lists are mostly used as constraints for generics, described on the next page, but they can also be used directly as parameter types.",
        "code": "interface Number { int | float }\ninterface IntLike { ~int }",
        "note": "An interface contains either methods or one type list, never both."
      }
    ]
  },
  {
    "slug": "language/generics",
    "group": "Language guide",
    "title": "Generics",
    "description": "Write functions, structs, and methods that work across many types, and constrain what those types may be.",
    "sections": [
      {
        "id": "functions",
        "title": "Generic functions",
        "text": "Type parameters are written in angle brackets after a function's name. Each parameter can have a constraint that limits which types are allowed; without one, any type is allowed. When calling a generic function you must supply the type arguments explicitly: Ocean does not infer them.",
        "code": "package main;\n\nimport \"io\";\n\nfunc larger<T int | float>(a, b T) T {\n    return a > b ? a : b;\n}\n\nfunc indexOf<T>(items array<T>, wanted T) int {\n    for (i := 0; i < len(items); i++) {\n        if (items[i] == wanted) return i;\n    }\n    return -1;\n}\n\nfunc main() {\n    io.Println(larger<int>(3, 9), \" \", larger<float>(1.5, 0.5));\n    io.Println(indexOf<string>([...]string{\"a\", \"b\"}, \"b\"));\n}",
        "note": "",
        "after": "Every type supports `==` and `!=`, so `indexOf` works for any `T`. Other operators are allowed only if the constraint guarantees them for every permitted type: `int | float` allows arithmetic and ordering, while an unconstrained `T` allows only equality. The compiler checks generic function bodies even if they are never called."
      },
      {
        "id": "constraints",
        "title": "Constraints",
        "text": "A constraint can be an interface with methods (the type must have those methods), a type-list interface or an inline type list such as `int | float`, a `~T` underlying-type match, or a generic struct family as described below. Type parameters that share a constraint can be grouped, as in `<K, V any>`. Leaving the constraint off is the same as writing `any`.",
        "code": "",
        "note": ""
      },
      {
        "id": "structs",
        "title": "Generic structs",
        "text": "Structs take type parameters the same way. Every use of the struct names its type arguments, such as `Stack<string>`. Methods of a generic struct name the parameters in the receiver, `(s *Stack<T>)`, and can use `T` throughout.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Stack<T> {\n    items []T;\n}\n\nfunc (s *Stack<T>) Push(value T) {\n    s.items.append(value);\n}\n\nfunc (s *Stack<T>) Pop() T {\n    return s.items.pop();\n}\n\nfunc (s Stack<T>) Size() int {\n    return len(s.items);\n}\n\nfunc main() {\n    names: Stack<string>;\n    names.Push(\"a\");\n    names.Push(\"b\");\n    io.Println(names.Size(), \" \", names.Pop());\n}",
        "note": ""
      },
      {
        "id": "methods",
        "title": "Generic methods",
        "text": "A method can declare its own type parameters after its name, in addition to those of its receiver. They need different names, and, as with functions, you supply them at each call.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Box<T> { value T; }\n\nfunc (b Box<T>) Pair<U>(other U) (T, U) {\n    return b.value, other;\n}\n\nfunc main() {\n    box := Box<int>{3};\n    number, flag := box.Pair<bool>(true);\n    io.Println(number, \" \", flag);\n}",
        "note": ""
      },
      {
        "id": "families",
        "title": "Struct families",
        "text": "The bare name of a generic struct, without type arguments, stands for every version of it. As a parameter type or constraint, `Box` accepts `Box<int>`, `Box<string>`, and so on, while `Box<int>` accepts only that one. Combine this with a type switch to handle particular versions specially. List specific cases before general ones, since cases are tried in order.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Box<T> { value T; }\n\nfunc inspect(box Box) int {\n    switch (b := box.(type)) {\n        case Box<int>:\n            return b.value;\n        default:\n            return 0;\n    }\n}\n\nfunc main() {\n    io.Println(inspect(Box<int>{5}), \" \", inspect(Box<string>{\"x\"}));\n}",
        "note": ""
      },
      {
        "id": "zero",
        "title": "Default values in generic code",
        "text": "`zero(T)` gives the default value of a type parameter, which is handy for initializing a result or resetting a value whose type you don't know in advance.",
        "code": "package main;\n\nimport \"io\";\n\nfunc reset<T>(value *T) {\n    *value = zero(T);\n}\n\nfunc main() {\n    count := 42;\n    reset<int>(&count);\n    io.Println(count);\n}",
        "note": "Generic code is specialized: the compiler produces a separate copy for each set of type arguments you use, so there is no runtime cost for genericity itself. Type arguments always use angle brackets; square brackets are reserved for indexing and map types."
      }
    ]
  },
  {
    "slug": "language/memory",
    "group": "Language guide",
    "title": "Memory & pointers",
    "description": "How Ocean manages memory without a garbage collector, and how to share and allocate data with pointers.",
    "sections": [
      {
        "id": "ownership",
        "title": "Values own their data",
        "text": "Ocean has no garbage collector. Instead, every variable owns its value outright. Strings, dynamic arrays, and maps store their contents in heap memory, and that memory belongs to exactly one variable. When the variable goes out of scope (when its block ends, or the function returns early, or a loop exits) the compiler releases the memory automatically. When you assign a new value to a variable, the old contents are released.\n\nThis is why assignment, argument passing, and returns copy: if two variables shared the same storage, it would be unclear which one should free it. A copy is fully independent, including all the data nested inside it.\n\nThere is one exception: variables captured by closures are kept alive until the program exits, so that closures can always use them.",
        "code": "",
        "note": ""
      },
      {
        "id": "pointers",
        "title": "Pointers",
        "text": "A pointer holds the address of a value. `&x` takes the address of `x`, giving a `*T` (pointer to `T`). `*p` reaches the value it points at, for reading or writing. Field access works directly through a pointer to a struct: `p.name` means `(*p).name`.\n\nPointers do not own what they point to. Copying a pointer copies only the address, so both copies refer to the same value. Use a pointer when you want several parts of a program to see and modify the same value.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Account { balance int; }\n\nfunc deposit(account *Account, amount int) {\n    account.balance += amount;\n}\n\nfunc main() {\n    savings := Account{5};\n    alias := &savings;\n    deposit(&savings, 2);\n    io.Println(savings.balance, \" \", alias.balance);\n}",
        "note": "",
        "after": "A pointer to a local variable is valid only while that variable exists. Don't return the address of a local, and don't keep one after its block has ended. When data must outlive the function that creates it, allocate it with `new`.\n\nRead pointer and array types from left to right. `*[]int` is a pointer to a dynamic array of integers, while `[]*int` is a dynamic array of pointers.\n\nUse `p + n`, `n + p`, or `p - n` to move a pointer by `n` elements of its pointee type. For example, if `p := &items[0]`, then `*(p + 1)` accesses the second item. The operators `+=`, `-=`, `++`, and `--` update the pointer. Subtracting two pointers of the same type into one array gives the signed element distance. Pointer arithmetic performs no bounds checks and traps on `null`.\n\n`ip: *int = 5;` and `ip := 5->(*int);` both initialize a pointer to address `0x5`. Use an explicit cast for integer addresses in reassignments and function arguments, as in `ip = 5->(*int)` or `f(5->(*int))`. Only dereference an address when it points to a live value of the right type."
      },
      {
        "id": "new-free",
        "title": "new and free",
        "text": "`new(T)` allocates a value of type `T` on the heap, sets it to `zero(T)`, and returns a `*T`. The memory stays allocated until you release it with `free(pointer)`. Ocean never frees it for you, because a pointer doesn't own its target: forgetting to call `free` leaks the memory. `free` releases the value and anything it owns, such as strings and arrays inside a struct, but it does not follow pointer fields.",
        "code": "package main;\n\nimport \"io\";\n\nstruct Node {\n    value int;\n    next *Node;\n}\n\nfunc main() {\n    first := new(Node);\n    first.value = 1;\n    first.next = null;\n\n    second := new(Node);\n    second.value = 2;\n    second.next = first;\n\n    for (n := second; n != null; n = n.next) {\n        io.Println(n.value);\n    }\n    free(second);\n    free(first);\n}",
        "note": ""
      },
      {
        "id": "null",
        "title": "null versus the zero address",
        "text": "Ocean's `null` is a reserved marker meaning \"points to nothing\". It is not the same as address zero. A pointer declared without an initializer holds address zero and is not equal to `null`. That's why the linked list above sets `next` to `null` explicitly; when a list's last node relies on the default value instead, a loop testing `n != null` would run off the end.\n\nComparing with `null` and dereferencing `null` are both well defined: dereferencing `null` stops the program. A `p := null` declaration is not allowed, since there is no type to infer; write `p: *Node = null;`. Only pointers, interfaces, and `Optional` values can be `null`.",
        "code": "",
        "note": "When calling C, never pass Ocean's `null` where C expects `NULL`. Use `zero(*void)` instead, and test pointers returned by C with `(pointer -> int) == 0`."
      },
      {
        "id": "buffers",
        "title": "Raw buffers",
        "text": "Most code never needs anything below arrays, but for low-level work and C interop Ocean has raw buffers. A buffer is contiguous storage with no bounds checks and no length header.",
        "code": "package main;\n\nimport \"io\";\n\nfunc fill(data buffer<int>, count int) {\n    for (i := 0; i < count; i++) {\n        data[i] = i;\n    }\n}\n\nfunc main() {\n    values := []int{0, 0, 0, 0};\n    fill(values.data, len(values));\n    io.Println(values[3]);\n}",
        "note": "",
        "after": "Indexing a buffer is never checked, so going out of range corrupts memory instead of stopping the program. A buffer's length is not passed along with it: a function that receives a buffer needs a separate count. Every array has a `.data` field that gives a raw buffer view of its elements.",
        "table": {
          "headers": [
            "Type",
            "Meaning"
          ],
          "rows": [
            [
              "`buffer<T, 4>`",
              "Four elements of `T`, stored inline, with a length known at compile time"
            ],
            [
              "`buffer<T, n>`",
              "A runtime-sized buffer on the stack; its elements start uninitialized"
            ],
            [
              "`buffer<T>`",
              "A raw pointer to elements of `T`, with no length and no ownership"
            ]
          ]
        }
      },
      {
        "id": "copying-bytes",
        "title": "Copying raw bytes",
        "text": "For moving raw memory, the standard `mem` package provides `mem.Copy(source, destination, byteCount)`, which handles overlapping regions correctly. It copies bytes only; use ordinary assignment for values that own strings or arrays.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "The mem package",
            "href": "/docs/library/mem/"
          }
        ]
      }
    ]
  },
  {
    "slug": "language/c-interop",
    "group": "Language guide",
    "title": "C interop",
    "description": "Call functions from C libraries with extern declarations, and pass data across the boundary safely.",
    "sections": [
      {
        "id": "extern",
        "title": "Declaring C functions",
        "text": "An `extern` declaration describes a function provided by a C library or the C runtime. It uses C's order: the result type, the name, and the parameters with their types first and optional names after. Use Ocean's type names, `void` for \"no result\", and `()` or `(void)` for no parameters. The linker resolves the function when the program is built.\n\nCall an extern function with the `extern.` prefix. Extern declarations belong to a single file: every file that calls a C function needs its own declaration, and they are never exported to other packages.",
        "code": "package main;\n\nextern i32 puts(buffer<i8> text);\n\nfunc main() {\n    extern.puts(\"Hello from C\\0\".data);\n}",
        "note": ""
      },
      {
        "id": "types",
        "title": "Matching C types",
        "text": "You are responsible for matching the C function's real signature, because the compiler cannot see the C header. Ocean's `int` is 64 bits, while C's `int` is usually 32, so use `i32` for C `int`. On 64-bit platforms Ocean's `int` matches `size_t`. Pointer parameters use Ocean pointer types, and `void *` is written `*void`.",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "C type",
            "Ocean type"
          ],
          "rows": [
            [
              "`int`, `unsigned int`",
              "`i32`, `u32`"
            ],
            [
              "`long long`, `size_t`",
              "`int`, `uint` (on 64-bit platforms)"
            ],
            [
              "`double`, `float`",
              "`float`, `f32`"
            ],
            [
              "`char *`",
              "`buffer<i8>`"
            ],
            [
              "`void *`",
              "`*void`"
            ],
            [
              "`T *`",
              "`*T`"
            ]
          ]
        }
      },
      {
        "id": "strings",
        "title": "Passing strings and arrays",
        "text": "Ocean strings and arrays are not C pointers: they carry a header. Pass their `.data` field, which is a raw pointer to their bytes or elements. C strings also need a terminating zero byte, which Ocean strings do not have, so add one: `\"text\\0\".data`, or `(text + \"\\0\").data` for a variable.\n\nA string's `.data` used as an argument is a temporary copy that is valid only during that call, so C code cannot modify the original string. If C needs to keep the pointer or write into the bytes, pass the `.data` of a named `[]i8` array that outlives the call.",
        "code": "",
        "note": ""
      },
      {
        "id": "pointers",
        "title": "Pointers and void *",
        "text": "Any typed pointer converts automatically to `*void`. Converting back requires a cast, written with parentheses because the target type is more than one word: `raw -> (*int)`.",
        "code": "package main;\n\nimport \"io\";\n\nextern *void malloc(int bytes);\nextern void free(*void memory);\n\nfunc main() {\n    raw := extern.malloc(sizeof(int));\n    if ((raw -> int) == 0) panic \"allocation failed\";\n    number := raw -> (*int);\n    *number = 42;\n    io.Println(*number);\n    extern.free(number);\n}",
        "note": "",
        "after": "Structs can be shared with C through pointers. Passing or returning a struct by value across `extern` is not supported. Ocean function values cannot be used as C callback pointers."
      },
      {
        "id": "variadic",
        "title": "C variadic functions",
        "text": "End the parameter list with `...` to declare a variadic C function such as `printf`. Extra arguments are passed with their Ocean types, except that booleans and small integers are widened to C `int` and floats are passed as `double`, following C's rules. An Ocean `...any` parameter can be forwarded straight into a C variadic call.",
        "code": "package main;\n\nextern i32 printf(buffer<i8> format, ...);\n\nfunc main() {\n    extern.printf(\"%d %.1f %s\\n\\0\".data, 7 -> i32, 2.5, \"ok\\0\".data);\n}",
        "note": "",
        "after": "Variadic C calls go through libffi, which Ocean links automatically for programs that use them."
      },
      {
        "id": "linking",
        "title": "Linking libraries",
        "text": "Functions from the C standard library are available automatically. For other libraries, the compiler links what the standard library needs (for example libcurl for `net/http`), but does not yet accept extra linker flags on the command line. If you emit LLVM IR with `--emit-llvm` and link it yourself with Clang, add the libraries your program uses, such as `-lffi`.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/inline-assembly",
    "group": "Language guide",
    "title": "Inline assembly",
    "description": "Embed architecture-specific assembly in a function, select it per platform, and exchange values with Ocean variables.",
    "sections": [
      {
        "id": "blocks",
        "title": "Assembly blocks",
        "text": "Inside a function, `asm architecture { … }` embeds assembly instructions. The architecture is required and is one of `x86_64`, `aarch64`, `riscv64`, or `wasm`. Add `/linux`, `/macos`, or `/windows` to restrict a block to one operating system. Blocks that don't match the target are left out without being assembled, so one function can contain a version for each platform. Blocks that match run in source order.",
        "code": "package main;\n\nfunc main() {\n    asm x86_64/linux {\n        nop\n    }\n    asm aarch64 {\n        nop\n    }\n}",
        "note": "",
        "after": "x86-64 assembly uses Intel syntax; AArch64 and RISC-V use the standard LLVM assembler syntax. Put each instruction on its own line: on macOS AArch64, `;` starts a comment, so anything after it on the line is ignored. Comments are `#` on x86-64 and RISC-V, `//` on AArch64, and `/* … */` on all of them."
      },
      {
        "id": "operands",
        "title": "Reading and writing variables",
        "text": "Write `${name}` to refer to an Ocean variable. Each placeholder is a memory operand for the variable's storage, not a register or a copied value, so use an instruction of the matching width. The variable must be an initialized scalar (a number, boolean, or pointer); collections, structs, and expressions can't be operands.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    value := 7;\n    asm x86_64 {\n        mov rax, ${value}\n        add rax, 3\n        mov ${value}, rax\n    }\n    io.Println(value);\n}",
        "note": "",
        "after": "On AArch64 and RISC-V, a block can refer to at most four distinct variables; x86-64 has no such limit. Using the same variable several times counts once. WebAssembly blocks do not support operands yet."
      },
      {
        "id": "rules",
        "title": "Rules for safe blocks",
        "text": "The compiler assumes a block may change any ordinary register and memory, so you don't need to save general-purpose registers. You must, however, leave certain registers alone: `rbp` on x86-64, `x18` and `x29` on AArch64, and `gp`, `tp`, and `s0` on RISC-V. When a block uses operands, the compiler uses AArch64 `x9`–`x15` and RISC-V `t3`–`t6` to address them, so preserve those too.\n\nEach block starts with an aligned stack. Restore the stack pointer exactly before the block ends, follow the platform calling convention if you call native functions, and never return, jump out of the block, or unwind through it. Use numeric local labels, because a block may be duplicated.\n\nOnly instructions the target supports are accepted; there is no CPU-feature selection. Assembly errors are reported by Clang during `ocean check` or `ocean build`.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tutorials/checklist",
    "group": "Tutorials",
    "title": "Build a checklist app",
    "description": "Build an interactive terminal checklist with the term/tui package: a model, keyboard handling, a view, and a timer command.",
    "sections": [
      {
        "id": "goal",
        "title": "What you will build",
        "text": "This tutorial builds a full-screen checklist that runs in your terminal. A `>` marks the selected row, `[ ]` and `[x]` show whether each item is done, and a counter tracks how many are finished. You move with the arrow keys (or `j` and `k`), toggle the selected item with Space or Enter, and quit with `q`. Each toggle shows a short message that disappears by itself after a moment. When you quit, your shell screen comes back and the program prints a summary.\n\nAlong the way you will use the `term/tui` package's model–update–view loop: a struct that holds the app's state, an `Update` method that reacts to key presses, a `View` method that draws the screen, and a command that runs a timer in the background. You should be comfortable with structs, methods, and dynamic arrays from the language guide.",
        "code": "",
        "note": ""
      },
      {
        "id": "setup",
        "title": "Set up the project",
        "text": "Create a directory for the program and initialize a module in it. Everything goes in a single file, `main.oc`.",
        "code": "mkdir checklist\ncd checklist\nocean mod init example.com/checklist",
        "note": "`term/tui` needs a real terminal and native threads, so run the app directly in a terminal window. It can't be compiled for WebAssembly.",
        "lang": "Terminal"
      },
      {
        "id": "loop",
        "title": "How a tui program works",
        "text": "A `term/tui` program never prints to the screen itself. Instead, you describe the whole screen as a string and let the framework draw it. Your app's state lives in a value called the model, which has three methods:",
        "code": "// Provided by term/tui. You don't declare this yourself.\ninterface Model {\n    Init() Cmd;\n    Update(message Msg) (Model, Cmd);\n    View() string;\n}",
        "note": "",
        "after": "The framework calls `Init` once at startup and draws whatever `View` returns. Then it waits for something to happen, such as a key press, a window resize, or a timer firing, and hands it to `Update` as a message. `Update` returns the new model, and the framework redraws. That cycle repeats until the app quits.\n\n`Update` and `Init` also return a command: a function the framework runs in the background, whose result comes back later as another message. This is how a tui program waits or does slow work without freezing the screen. `Msg` is just `any`, so any value can be a message, and `Cmd` is `func() Msg`.\n\nYour struct satisfies `Model` simply by having these three methods; no declaration is needed."
      },
      {
        "id": "state",
        "title": "Define the state",
        "text": "Start `main.oc` with the package, the imports, and the types. An `Item` has a label and a done flag. `Checklist` is the model: the items, the index of the selected row, and the message shown after a toggle.\n\nThe `revision` field and the `clearNoticeMsg` type are for clearing that message later. Each toggle will start a timer, and when the timer fires it sends back a `clearNoticeMsg`. The revision number tells `Update` whether the message it is about to clear is still the latest one.",
        "code": "package main;\n\nimport \"io\";\nimport \"term/tui\";\nimport \"time\";\n\nstruct Item { Label string; Done bool; }\nstruct Checklist {\n    items []Item;\n    cursor int;\n    notice string;\n    revision int;\n}\nstruct clearNoticeMsg { revision int; }",
        "note": ""
      },
      {
        "id": "initial",
        "title": "The starting model",
        "text": "`initialModel` builds the checklist the app starts with. Fields that aren't set get their default values, so every item starts unchecked, the cursor starts on the first row, and there is no notice.\n\n`Init` has no work to do at startup, so it returns `tui.NoCmd`, the command that does nothing. Note that it returns `tui.NoCmd` itself, without parentheses: a command is a function value, and the framework is the one that calls it.",
        "code": "func initialModel() Checklist {\n    return Checklist{items: []Item{\n        Item{Label: \"Learn the model/update/view loop\"},\n        Item{Label: \"Toggle a checklist item\"},\n        Item{Label: \"Write a terminal app in Ocean\"}\n    }};\n}\n\nfunc (model Checklist) Init() tui.Cmd { return tui.NoCmd; }",
        "note": ""
      },
      {
        "id": "update",
        "title": "React to keys in Update",
        "text": "`Update` uses a type switch to see what kind of message arrived. Key presses arrive as `tui.KeyMsg`. Its `Key` field names special keys such as `up`, `space`, or `ctrl+c`, and its `Text` field holds the character for ordinary keys such as `q` or `j`.\n\nThe quit check comes first, so the app can always be closed. In the terminal's raw mode, Ctrl+C is just another key, so it needs handling explicitly. Returning `tui.Quit` asks the framework to shut down cleanly and restore the terminal. The movement branches only change `cursor` when there is room, so the selection can't run off either end of the list.\n\nToggling flips the selected item's `Done` field, sets the notice, and bumps the revision. It then returns a `tui.Tick` command that will deliver a `clearNoticeMsg` carrying that revision about 0.9 seconds later. When that message comes back, the notice is cleared, but only if no newer toggle has happened since. Without that check, a timer from an earlier toggle could erase a newer message early.\n\n`Checklist` uses value receivers, so `Update` changes its own copy of the model. Returning that copy is what makes the change take effect.",
        "code": "func (model Checklist) Update(message tui.Msg) (tui.Model, tui.Cmd) {\n    switch (event := message.(type)) {\n        case tui.KeyMsg:\n            if (event.Alt) return model, tui.NoCmd;\n            if (event.Key == \"ctrl+c\" || event.Text == \"q\") return model, tui.Quit;\n            if (len(model.items) == 0) return model, tui.NoCmd;\n\n            if (event.Key == \"up\" || event.Text == \"k\") {\n                if (model.cursor > 0) model.cursor--;\n            } else if (event.Key == \"down\" || event.Text == \"j\") {\n                if (model.cursor + 1 < len(model.items)) model.cursor++;\n            } else if (event.Key == \"space\" || event.Key == \"enter\") {\n                index := model.cursor;\n                model.items[index].Done = !model.items[index].Done;\n                model.notice = model.items[index].Done ? \"Item checked.\" : \"Item unchecked.\";\n                model.revision++;\n                return model, tui.Tick(900 * time.Millisecond, clearNoticeMsg{model.revision});\n            }\n        case clearNoticeMsg:\n            if (event.revision == model.revision) model.notice = \"\";\n        case tui.EOFMsg:\n            return model, tui.Quit;\n    }\n    return model, tui.NoCmd;\n}",
        "note": "Never call `time.Sleep` inside `Update`. It would freeze the whole app, input and drawing included. Waiting is what commands such as `tui.Tick` are for: they run on a background thread while the app stays responsive.",
        "after": "Messages the app doesn't care about, such as window resizes, reach the final `return` and leave the model unchanged. `tui.EOFMsg` means the terminal's input has closed; quitting is the sensible response."
      },
      {
        "id": "view",
        "title": "Draw the screen in View",
        "text": "`View` turns the model into the text of the whole screen: a title, a row for each item, the progress count, the notice, and a line of help. Each row combines the cursor marker and the checkbox, so the selection and the check marks are drawn independently. The notice gets its own line even when empty, so the help text stays in the same place while notices come and go.\n\n`completed` is a small helper that counts finished items. `View` is used again after the app ends to print the summary.",
        "code": "func (model Checklist) completed() int {\n    count := 0;\n    for (i := 0; i < len(model.items); i++) {\n        if (model.items[i].Done) count++;\n    }\n    return count;\n}\n\nfunc (model Checklist) View() string {\n    text := \"Ocean checklist\\n\\n\";\n    for (i := 0; i < len(model.items); i++) {\n        cursor := i == model.cursor ? \"> \" : \"  \";\n        checkbox := model.items[i].Done ? \"[x] \" : \"[ ] \";\n        text += cursor + checkbox + model.items[i].Label + \"\\n\";\n    }\n    if (len(model.items) == 0) text += \"No items yet.\\n\";\n    text += \"\\nCompleted: \" + io.Sprint(model.completed()) + \"/\" + io.Sprint(len(model.items));\n    text += \"\\n\" + model.notice;\n    text += \"\\n\\nUp/Down or j/k: move | Space/Enter: toggle | q: quit\";\n    return text;\n}",
        "note": "",
        "after": "`View` builds a string and returns it; it never prints. While the app is running, the framework owns the terminal, so anything printed with `io.Println` would fight with the drawing. Turning numbers into text with `io.Sprint` is fine, because it only returns a string."
      },
      {
        "id": "main",
        "title": "Start the program",
        "text": "`main` creates the program with the starting model and runs it. `AltScreen: true` draws the app on the terminal's alternate screen, the same way full-screen tools such as editors do, and gives you back your normal shell screen when it exits. Keep the program in one variable and don't copy it once it is running.\n\n`Run` blocks until the app quits, then returns the final model. Its declared type is the `tui.Model` interface, so `final.(Checklist)` gets the concrete checklist back. By the time `Run` returns, the terminal has been restored, so printing the summary is safe.",
        "code": "func main() {\n    program := tui.NewProgram(initialModel(), tui.Options{AltScreen: true});\n    final := program.Run().unwrap();\n    checklist := final.(Checklist);\n    io.Printfln(\"Checked {} of {} items.\", checklist.completed(), len(checklist.items)).unwrap();\n}",
        "note": ""
      },
      {
        "id": "complete",
        "title": "The complete program",
        "text": "Here is the whole of `main.oc`. If you built it up piece by piece, compare against this; otherwise copy it as is.",
        "code": "package main;\n\nimport \"io\";\nimport \"term/tui\";\nimport \"time\";\n\nstruct Item { Label string; Done bool; }\nstruct Checklist {\n    items []Item;\n    cursor int;\n    notice string;\n    revision int;\n}\nstruct clearNoticeMsg { revision int; }\n\nfunc initialModel() Checklist {\n    return Checklist{items: []Item{\n        Item{Label: \"Learn the model/update/view loop\"},\n        Item{Label: \"Toggle a checklist item\"},\n        Item{Label: \"Write a terminal app in Ocean\"}\n    }};\n}\n\nfunc (model Checklist) Init() tui.Cmd { return tui.NoCmd; }\n\nfunc (model Checklist) Update(message tui.Msg) (tui.Model, tui.Cmd) {\n    switch (event := message.(type)) {\n        case tui.KeyMsg:\n            if (event.Alt) return model, tui.NoCmd;\n            if (event.Key == \"ctrl+c\" || event.Text == \"q\") return model, tui.Quit;\n            if (len(model.items) == 0) return model, tui.NoCmd;\n\n            if (event.Key == \"up\" || event.Text == \"k\") {\n                if (model.cursor > 0) model.cursor--;\n            } else if (event.Key == \"down\" || event.Text == \"j\") {\n                if (model.cursor + 1 < len(model.items)) model.cursor++;\n            } else if (event.Key == \"space\" || event.Key == \"enter\") {\n                index := model.cursor;\n                model.items[index].Done = !model.items[index].Done;\n                model.notice = model.items[index].Done ? \"Item checked.\" : \"Item unchecked.\";\n                model.revision++;\n                return model, tui.Tick(900 * time.Millisecond, clearNoticeMsg{model.revision});\n            }\n        case clearNoticeMsg:\n            if (event.revision == model.revision) model.notice = \"\";\n        case tui.EOFMsg:\n            return model, tui.Quit;\n    }\n    return model, tui.NoCmd;\n}\n\nfunc (model Checklist) completed() int {\n    count := 0;\n    for (i := 0; i < len(model.items); i++) {\n        if (model.items[i].Done) count++;\n    }\n    return count;\n}\n\nfunc (model Checklist) View() string {\n    text := \"Ocean checklist\\n\\n\";\n    for (i := 0; i < len(model.items); i++) {\n        cursor := i == model.cursor ? \"> \" : \"  \";\n        checkbox := model.items[i].Done ? \"[x] \" : \"[ ] \";\n        text += cursor + checkbox + model.items[i].Label + \"\\n\";\n    }\n    if (len(model.items) == 0) text += \"No items yet.\\n\";\n    text += \"\\nCompleted: \" + io.Sprint(model.completed()) + \"/\" + io.Sprint(len(model.items));\n    text += \"\\n\" + model.notice;\n    text += \"\\n\\nUp/Down or j/k: move | Space/Enter: toggle | q: quit\";\n    return text;\n}\n\nfunc main() {\n    program := tui.NewProgram(initialModel(), tui.Options{AltScreen: true});\n    final := program.Run().unwrap();\n    checklist := final.(Checklist);\n    io.Printfln(\"Checked {} of {} items.\", checklist.completed(), len(checklist.items)).unwrap();\n}",
        "note": ""
      },
      {
        "id": "run",
        "title": "Run it",
        "text": "Check the program, then run it in your terminal. To keep a copy, build an executable afterwards.",
        "code": "ocean check .\nocean run .\nocean build . -o checklist",
        "note": "",
        "lang": "Terminal",
        "after": "The app opens with the cursor on the first item and the counter at `0/3`. Press Space: the first row becomes `[x]`, the counter reads `1/3`, and \"Item checked.\" appears and then fades away. Press Down and then Enter to check the second item, then `k` and Space to uncheck the first. The counter shows `1/3` again. Holding Up or Down at either end of the list leaves the cursor where it is. Press `q` and your shell screen returns with the line `Checked 1 of 3 items.`\n\nThe checklist lives only in memory, so each run starts again at `0/3`."
      },
      {
        "id": "extend",
        "title": "Ideas for extending it",
        "text": "Let the user add items: on `a`, switch the model into an \"adding\" mode where typed characters (from `event.Text`) build up a new label, Enter appends it to `items`, and Escape cancels. Add deletion with the dynamic array's `remove` method, keeping `cursor` inside the list afterwards. Handle `tui.WindowSizeMsg` to lay out the view for the terminal's width. To save the list between runs, write a command that writes the items to a file and returns a message reporting how it went.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "The term/tui package",
            "href": "/docs/library/term/tui/"
          },
          {
            "label": "Dynamic arrays",
            "href": "/docs/language/collections/"
          }
        ]
      }
    ]
  },
  {
    "slug": "tooling/cli",
    "group": "Tooling",
    "title": "Compiler & CLI",
    "description": "Every ocean command and option, how builds are cached, static linking, diagnostics, and environment variables.",
    "sections": [
      {
        "id": "commands",
        "title": "Commands at a glance",
        "text": "The compiler is a single program, `ocean`. (A build from source also produces `ocean-c`, which behaves identically.) Most commands take a location: a package directory, or a file, which selects the directory containing it. The location defaults to the current directory where it is optional.",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "Command",
            "What it does"
          ],
          "rows": [
            [
              "`ocean check [location]`",
              "Compile everything without running or writing output, reporting errors and warnings"
            ],
            [
              "`ocean run [location] [args…]`",
              "Build a temporary executable, run it with the given arguments, then delete it"
            ],
            [
              "`ocean build [location]`",
              "Build an executable (for a `main` package) or a library object"
            ],
            [
              "`ocean test [locations…]`",
              "Build and run a package's tests"
            ],
            [
              "`ocean mod init [name]`",
              "Create `ocean.mod` in the current directory"
            ],
            [
              "`ocean fix [locations…]`",
              "Rewrite old postfix type syntax to the current prefix syntax, in place"
            ],
            [
              "`ocean clean --cache`",
              "Delete the build cache"
            ],
            [
              "`ocean check --lsp`",
              "Start the language server for editors"
            ],
            [
              "`ocean --version`",
              "Show the version, commit, and build date (`-v` also works)"
            ]
          ]
        }
      },
      {
        "id": "check",
        "title": "ocean check",
        "text": "`ocean check` runs the whole compilation pipeline, including code generation and a trial native link, but then discards the result. A program that passes `check` builds with the same compiler and toolchain. It also checks the package's test files, without running them, and exits with a nonzero status if anything fails.\n\nBecause it goes all the way to native code, `check` needs Clang, just like `build`.",
        "code": "",
        "note": ""
      },
      {
        "id": "run",
        "title": "ocean run",
        "text": "`ocean run` builds the program into a private temporary directory, runs it in your current directory with your terminal's input and output, and removes it afterward, even if the program fails or is interrupted. Its exit status is the program's exit status.\n\nArguments after the location go to your program. The compiler's own build options (`-o`, `--check`, `--emit-llvm`) are rejected by `run`; to pass a string that looks like one of them to your program, put it after `--`, which ends option parsing.",
        "code": "ocean run . input.txt --verbose\nocean run ./tools/report -- -o literal-argument",
        "note": "",
        "lang": "Terminal"
      },
      {
        "id": "build",
        "title": "ocean build",
        "text": "For a `main` package, `ocean build` produces an executable named after the package directory, or the name given with `-o`. For any other package it produces a native library object, `<package>.o`, which can be linked into other programs. If compilation or linking fails, the previous output file is left untouched.",
        "code": "",
        "note": "",
        "after": "Static linking needs static versions of the system libraries (and of libffi or libcurl if your program uses them) to be installed; otherwise the link fails. It only applies to `main` packages.\n\nOn Windows, library objects are COFF archives, and building one requires `llvm-ar` on your `PATH`.",
        "table": {
          "headers": [
            "Option",
            "Effect"
          ],
          "rows": [
            [
              "`-o path`",
              "Choose the output file"
            ],
            [
              "`--check`",
              "Same as `ocean check`: build everything, write nothing"
            ],
            [
              "`--emit-llvm`",
              "Write the generated LLVM IR as a single text file (default `a.ll`) instead of compiling it"
            ],
            [
              "`--static`, `-s`",
              "Link the executable statically (also accepted by `run`)"
            ]
          ]
        }
      },
      {
        "id": "fix",
        "title": "ocean fix",
        "text": "Ocean writes type modifiers before the type they modify: `[]int`, `[3]int`, `*T`, and `buffer<int, 4>`. Earlier versions put them after the type (`int[]`, `int[3]`, `T*`, `buffer<int>[4]`). That syntax is now an error, and the message names the replacement, such as \"Square brackets go before the type for an array. Did you mean '[]int'?\".\n\n`ocean fix` updates old code for you. It rewrites every old-style type in the given packages in place, including `_test.oc` files, and reports how many types it changed in each file. A location is a package directory, a single `.oc` file, or `dir/...` for every package below `dir`. With no location, it fixes the current directory.",
        "code": "ocean fix ./...",
        "note": "",
        "lang": "Terminal",
        "after": "Nested array sizes switch order, so the meaning stays the same: `int[2][3]` becomes `[3][2]int`, three arrays of two integers. The command leaves everything outside the rewritten types untouched, so you can run it again safely. Running it a second time changes nothing."
      },
      {
        "id": "diagnostics",
        "title": "Errors and warnings",
        "text": "Diagnostics show the file, line and column, the source line, and a caret pointing at the problem. Errors stop the build; warnings, such as a function that can reach its end without returning a value or a `match` that misses a variant, do not. Errors are red and warnings yellow when the output is a terminal. Set `NO_COLOR=1` to turn color off, or `CLICOLOR_FORCE=1` to force it on when the output is redirected.",
        "code": "",
        "note": ""
      },
      {
        "id": "cache",
        "title": "The build cache",
        "text": "Builds are cached. The compiler keeps one compiled object per package, plus a shared support object, in `~/.cache/ocean-build`. On the next build, packages whose sources (and dependencies' sources) haven't changed are reused, and if nothing changed at all the compiler only relinks. Parsing and checking still run every time, so you always get current diagnostics.\n\nThe cache key covers the source files, the compiler version, the toolchain, and the environment, so it is safe to leave on. Set `OCEAN_BUILD_CACHE` to another directory to move it, or to `off` to disable it. `ocean clean --cache` empties it. Downloaded module sources are kept separately and are not removed.",
        "code": "",
        "note": ""
      },
      {
        "id": "environment",
        "title": "Environment variables",
        "text": "",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "Variable",
            "Purpose"
          ],
          "rows": [
            [
              "`OCEAN_SRC`",
              "Use this standard-library directory instead of the installed one"
            ],
            [
              "`OCEAN_BUILD_CACHE`",
              "Build cache directory, or `off`"
            ],
            [
              "`OCEAN_MOD_CACHE`",
              "Where downloaded modules are stored (default `~/.cache/ocean/modules`)"
            ],
            [
              "`OCOS`, `OCARCH`",
              "Set both to `js` and `wasm` to target WebAssembly"
            ],
            [
              "`NO_COLOR`, `CLICOLOR_FORCE`",
              "Turn colored diagnostics off or force them on"
            ],
            [
              "`SOURCE_DATE_EPOCH`",
              "Fix the build timestamp when building the compiler reproducibly"
            ]
          ]
        }
      },
      {
        "id": "toolchain",
        "title": "What the compiler needs",
        "text": "The compiler emits LLVM IR as text and runs Clang to compile and link it, so Clang must be on your `PATH` for `check`, `build`, `run`, and `test`. Programs are linked with libffi when they need it (for example, for C variadic calls). Programs that import `net/http` also need libcurl. Programs that use threads are linked with the threading runtime automatically.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/packages",
    "group": "Tooling",
    "title": "Modules & dependencies",
    "description": "The ocean.mod file, depending on other modules through Git, local replacements, and how imports are resolved.",
    "sections": [
      {
        "id": "mod-file",
        "title": "The ocean.mod file",
        "text": "A module is a directory tree with an `ocean.mod` file at its root. Run `ocean mod init NAME` to create one; without a name, the current directory's name is used, and an existing file is never overwritten. By convention, the name is the address where the module's repository lives, such as `github.com/you/project`.",
        "code": "module github.com/example/application\n\nocean 0.1\n\nrequire (\n    github.com/example/collections v1.2.3\n)\n\nreplace github.com/example/collections => ../collections",
        "note": "",
        "lang": "ocean.mod",
        "after": "`module` names the module. `ocean` records the language version. `require` lists dependencies and the version of each, which is a Git tag or branch name. `replace` substitutes a different source for a dependency: a local directory (which must contain its own `ocean.mod`) or another module and version. `require` and `replace` can be written on one line or as parenthesized blocks. Paths may be quoted, and `//` starts a comment. A `go <version>` directive is an error."
      },
      {
        "id": "external",
        "title": "External modules",
        "text": "To use another module, add it to `require` and import its packages by their full path, for example `import \"github.com/example/collections/list\";`. The first build downloads the repository with Git over HTTPS and stores it in `~/.cache/ocean/modules/<module>@<version>`, where later builds reuse it. `OCEAN_MOD_CACHE` moves this directory.\n\nModules are fetched directly from their Git repositories; there is no central module proxy. An import of the form `host/owner/repository/...` that isn't listed in `require` is fetched from the repository's default branch, which is convenient for experiments, but declare versions for anything you want to build reproducibly.",
        "code": "",
        "note": ""
      },
      {
        "id": "local",
        "title": "Working on two modules at once",
        "text": "`replace` with a local path is the way to develop a library and an application together: the application builds against your working copy of the library instead of a downloaded version.",
        "code": "module example.com/app\n\nocean 0.1\n\nrequire example.com/lib v0.1.0\nreplace example.com/lib => ../lib",
        "note": "",
        "lang": "ocean.mod"
      },
      {
        "id": "resolution",
        "title": "How an import is found",
        "text": "For each import path, the compiler checks, in order: packages inside the current module (by full path, or by a path relative to the module root), the standard library, and the module's dependencies. The standard library lives in the `src` directory next to the compiler's `bin` directory, unless `OCEAN_SRC` points elsewhere.",
        "code": "",
        "note": ""
      },
      {
        "id": "target-files",
        "title": "Platform-specific files",
        "text": "A file whose name ends in `_native.oc` is compiled only for native targets, and one ending in `_wasm.oc` only for WebAssembly. Test files use `_native_test.oc` and `_wasm_test.oc`. All other files are shared. The selection happens before anything else, so the two variants can declare the same functions. For differences between individual operating systems or CPUs, use inline assembly selectors instead.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/testing",
    "group": "Tooling",
    "title": "Testing",
    "description": "Write unit tests with the testing package and run them with ocean test.",
    "sections": [
      {
        "id": "writing",
        "title": "Writing a test",
        "text": "Tests live in files whose names end in `_test.oc`, next to the code they test. A test is a top-level function whose name starts with `Test` and that takes exactly one parameter of type `*testing.T`. Use the `T` to report failures.",
        "code": "// file: ocean.mod\nmodule example.com/arithmetic\n\nocean 0.1\n// file: arithmetic.oc\npackage arithmetic;\n\nfunc Add(a, b int) int {\n    return a + b;\n}\n// file: arithmetic_test.oc\npackage arithmetic;\n\nimport \"testing\";\n\nfunc TestAdd(t *testing.T) {\n    if (Add(2, 3) != 5) {\n        t.Errorf(\"Add(2, 3) = {}, want 5\", Add(2, 3));\n    }\n}",
        "note": "",
        "after": "Run the tests with `ocean test` from the package directory. Test files are ignored by `ocean build` and `ocean run`, so test code never ends up in your program.\n\nA test file that declares the same package as the code can use its private names. A test file that declares `package arithmetic_test;` instead is an external test: it must import the package and can only use what it exports, which is a good way to test the public API. Both kinds can sit in the same directory."
      },
      {
        "id": "t-methods",
        "title": "Reporting results",
        "text": "",
        "code": "",
        "note": "",
        "after": "Format strings use `{}` placeholders, as in `io.Printf`. Stopping a test runs its deferred calls and cleanup functions, and the other tests continue. A panic inside a test fails that test only. Call `Fatal` and `Skip` only from the test's own thread, not from threads the test starts.",
        "table": {
          "headers": [
            "Method",
            "Effect"
          ],
          "rows": [
            [
              "`Error(values…)`, `Errorf(format, values…)`",
              "Record a failure and a message; the test keeps running"
            ],
            [
              "`Fatal(values…)`, `Fatalf(format, values…)`",
              "Record a failure and stop this test immediately"
            ],
            [
              "`Fail()`, `FailNow()`",
              "Mark the test failed, without a message; `FailNow` also stops it"
            ],
            [
              "`Log(values…)`, `Logf(format, values…)`",
              "Record a message, shown when the test fails or with `-v`"
            ],
            [
              "`Skip(values…)`, `Skipf(…)`, `SkipNow()`",
              "Stop the test and report it as skipped"
            ],
            [
              "`Failed()`, `Skipped()`, `Name()`",
              "Query the test's state and full name"
            ],
            [
              "`Cleanup(func())`",
              "Register a function to run when the test and its subtests finish"
            ],
            [
              "`Run(name, func(*testing.T)) bool`",
              "Run a subtest; returns whether it passed"
            ],
            [
              "`Parallel()`",
              "Let this test run in parallel with others"
            ]
          ]
        }
      },
      {
        "id": "subtests",
        "title": "Subtests and table tests",
        "text": "`t.Run` runs a named subtest, which is handy for checking many cases with one loop. Subtest names are joined to the parent's with a slash in reports, such as `TestAdd/negative`, and a failing subtest fails its parent.",
        "code": "// file: ocean.mod\nmodule example.com/arithmetic\n\nocean 0.1\n// file: arithmetic.oc\npackage arithmetic;\n\nfunc Add(a, b int) int {\n    return a + b;\n}\n// file: arithmetic_test.oc\npackage arithmetic;\n\nimport \"testing\";\n\nstruct addCase {\n    name string;\n    a, b, want int;\n}\n\nfunc TestAddCases(t *testing.T) {\n    cases := []addCase{\n        addCase{\"small\", 1, 2, 3},\n        addCase{\"negative\", -4, 1, -3},\n    };\n    for (_, c := range cases) {\n        t.Run(c.name, func(t *testing.T) {\n            if (Add(c.a, c.b) != c.want) t.Errorf(\"got {}, want {}\", Add(c.a, c.b), c.want);\n        });\n    }\n}",
        "note": ""
      },
      {
        "id": "parallel",
        "title": "Parallel tests",
        "text": "Tests run one after another by default. A test that calls `t.Parallel()` pauses there and resumes once the package's other sequential tests have finished, alongside the other parallel tests. When several packages are tested together, the packages run concurrently. At most 16 tests run at once by default; `-t N` changes the limit and `--single-threaded` sets it to one.\n\nA parallel subtest resumes after its parent's function has returned, so the parent's deferred calls run before the subtest does. Use `t.Cleanup` for anything parallel subtests depend on: cleanup functions wait for all subtests to finish.",
        "code": "",
        "note": ""
      },
      {
        "id": "running",
        "title": "Running tests",
        "text": "`ocean test` with no location tests the current directory. Pass several locations to test several packages, or use `./...` to include every package below a directory.",
        "code": "ocean test\nocean test ./...\nocean test parser lexer\nocean test . -v\nocean test . --json\nocean test . --timeout 30s",
        "note": "",
        "lang": "Terminal",
        "after": "In a terminal, `ocean test` shows a live display of running and finished tests. Scroll with the arrow or Page keys, press `f` or End to follow new output, and `q` or Ctrl+C to stop. While that display is active, tests read end-of-file from standard input, so use `--notty` for tests that read input. Output printed by tests is captured either way.\n\nThe command exits with status zero when every test passes (or there are none), and nonzero for any failure, compilation error, or timeout. Each JSON event has `Time`, `Action`, `Package`, and `Elapsed` fields, plus `Test` and `Output` where relevant; actions are `start`, `run`, `pause`, `cont`, `output`, `pass`, `fail`, and `skip`.",
        "table": {
          "headers": [
            "Option",
            "Effect"
          ],
          "rows": [
            [
              "`-v`",
              "Include passing tests in the final report"
            ],
            [
              "`--notty`",
              "Disable the live terminal display"
            ],
            [
              "`--no-color`",
              "Disable color (as does the `NO_COLOR` variable)"
            ],
            [
              "`--json`",
              "Print test events as JSON, one per line"
            ],
            [
              "`--outfile path`, `-o path`",
              "Also save the plain-text report to a file"
            ],
            [
              "`--jsonfile path`",
              "Also save JSON events to a file"
            ],
            [
              "`--hide-skipped`",
              "Leave skipped tests out of the details (they are still counted)"
            ],
            [
              "`--timeout duration`",
              "Fail if tests run longer than this (default `10m`; `0` disables)"
            ],
            [
              "`-t N`, `--single-threaded`",
              "Limit how many tests run at once"
            ]
          ]
        }
      }
    ]
  },
  {
    "slug": "tooling/editor",
    "group": "Tooling",
    "title": "Editor support",
    "description": "Connect your editor to Ocean's language server for diagnostics, completion, navigation, and rename.",
    "sections": [
      {
        "id": "server",
        "title": "The language server",
        "text": "`ocean check --lsp` runs a Language Server Protocol server over standard input and output. Any editor with a generic LSP client can use it: configure the command `ocean` with the arguments `check` and `--lsp`, for files ending in `.oc`.\n\nIt provides diagnostics as you type (including for unsaved files), hover with resolved types, go to definition and find references across files and packages, rename, and completion of local names, fields, methods, enum variants, and package members. Completing the name of a package you haven't imported yet adds the import for you.",
        "code": "",
        "note": ""
      },
      {
        "id": "limits",
        "title": "What the editor checks",
        "text": "To stay fast, the language server stops after type checking: it does not generate code or link. Some problems, such as an unsupported feature in code generation or a missing C library, therefore only show up with `ocean check` or a build. Editor analysis also recovers from errors so that the rest of a file stays usable, while command-line builds are strict.",
        "code": "",
        "note": ""
      },
      {
        "id": "helix",
        "title": "Helix: get the files",
        "text": "The compiler repository ships everything Helix needs in `editors/helix`: a Tree-sitter grammar for highlighting, the highlight and indentation queries, and two color themes, `ocean-dark` and `ocean-light`, that match the code on this site. Clone the repository (or update your existing checkout), then copy the three parts into your Helix configuration directory. On Linux and macOS that is `~/.config/helix`; on Windows it is `%AppData%\\helix`.",
        "code": "git clone https://github.com/ocean-foundation/ocean-c.git\ncd ocean-c/editors/helix\n\nmkdir -p ~/.config/helix/grammars/ocean ~/.config/helix/runtime/grammars \\\n  ~/.config/helix/runtime/queries/ocean ~/.config/helix/themes\ncp -r grammar/. ~/.config/helix/grammars/ocean/\ncp queries/ocean/*.scm ~/.config/helix/runtime/queries/ocean/\ncp themes/*.toml ~/.config/helix/themes/",
        "note": "",
        "lang": "Terminal",
        "after": "The grammar source goes in `grammars/ocean`, and Helix writes the compiled grammar to `runtime/grammars`, which it does not create by itself; the queries in `runtime/queries/ocean`, which tell Helix how to color what the grammar finds; and the themes in `themes`."
      },
      {
        "id": "helix-languages",
        "title": "Helix: register the language",
        "text": "Add the Ocean language, its language server, and its grammar to `languages.toml` in the same directory. Replace `/home/you` with the absolute path of your home directory: the grammar `source` must be an absolute path.",
        "code": "[language-server.ocean-lsp]\ncommand = \"ocean\"\nargs = [\"check\", \"--lsp\"]\n\n[[language]]\nname = \"ocean\"\nscope = \"source.ocean\"\ninjection-regex = \"ocean\"\nfile-types = [\"oc\"]\nroots = [\"ocean.mod\", \".git\"]\ncomment-token = \"//\"\nblock-comment-tokens = { start = \"/*\", end = \"*/\" }\nlanguage-servers = [\"ocean-lsp\"]\ngrammar = \"ocean\"\nindent = { tab-width = 4, unit = \"    \" }\n\n[[grammar]]\nname = \"ocean\"\nsource = { path = \"/home/you/.config/helix/grammars/ocean\" }",
        "note": "",
        "lang": "languages.toml",
        "after": "If your editor runs a compiler straight from a source checkout rather than an installed one, also add `environment = { OCEAN_SRC = \"/path/to/ocean-src\" }` to the `ocean-lsp` section, as described below."
      },
      {
        "id": "helix-build",
        "title": "Helix: build the grammar",
        "text": "Ask Helix to compile the grammar, then check that everything is found. The command is `helix` or `hx`, depending on how Helix was installed. Building needs a C compiler, but not the Tree-sitter command-line tool.",
        "code": "helix --grammar build\nhelix --health ocean",
        "note": "",
        "lang": "Terminal",
        "after": "`helix --grammar build` builds every grammar in your configuration. To build only Ocean's, add `use-grammars = { only = [\"ocean\"] }` at the top of `languages.toml` while you run it, and remove the line afterwards if you use other languages. The health check should report the language server, the Tree-sitter parser, and the highlight and indent queries as found. Ocean doesn't ship textobject queries, so that line shows as missing."
      },
      {
        "id": "helix-theme",
        "title": "Helix: choose a theme",
        "text": "Select one of the Ocean themes in `config.toml`. `ocean-dark` uses Darcula-style colors and `ocean-light` uses IntelliJ-style ones. Both color the editor's interface to match this site as well as the code. You can also try them without editing the file by typing `:theme ocean-dark` in Helix.",
        "code": "theme = \"ocean-dark\"",
        "note": "",
        "lang": "config.toml",
        "after": "The themes work for every language, not only Ocean. Because Ocean's grammar recognizes tokens rather than full syntax, Ocean highlighting is close to, but not quite as detailed as, the code on this site. Its queries recognize keywords, types, functions and method calls, fields, enum variants, and standard-library package names from their surroundings."
      },
      {
        "id": "helix-update",
        "title": "Helix: updating",
        "text": "After pulling a new version of `ocean-c`, copy the files again and rerun `helix --grammar build`, then restart Helix. Restart only the language server, after updating the compiler, with `:lsp-restart`. For manual completion, bind a key to `completion` in `config.toml`; for example `C-space = \"completion\"` under `[keys.insert]`.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "Helix files in the compiler repository",
            "href": "https://github.com/ocean-foundation/ocean-c/tree/main/editors/helix"
          }
        ]
      },
      {
        "id": "checkout",
        "title": "Using a compiler from a source checkout",
        "text": "A compiler run straight from its build directory has no installed library next to it. If your editor starts such a compiler, set `OCEAN_SRC` in the language server's environment to your standard-library checkout, or standard-library imports won't resolve.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/webassembly",
    "group": "Tooling",
    "title": "WebAssembly",
    "description": "Compile Ocean packages to WebAssembly modules for a JavaScript host.",
    "sections": [
      {
        "id": "building",
        "title": "Building for WebAssembly",
        "text": "Set the environment variables `OCOS=js` and `OCARCH=wasm` to compile for WebAssembly instead of your machine. Both must be set together. The setting applies to every command that compiles: `build`, `check`, and `--emit-llvm`.",
        "code": "OCOS=js OCARCH=wasm ocean build . -o main.wasm",
        "note": "",
        "lang": "Terminal",
        "after": "The output is a `wasm32-unknown-unknown` module. You need a Clang with the WebAssembly target and `wasm-ld`; Clang and LLD version 23 are recommended. `ocean run` and `ocean test` only work for native targets, so load the module in a WebAssembly host to run it."
      },
      {
        "id": "host",
        "title": "What the host provides",
        "text": "The module exports `main`. Functions it cannot resolve itself, such as memory allocation and other runtime support, are imported from the `env` module, and the JavaScript host must supply them. No JavaScript adapter is included. Ocean's integers remain 64-bit, while pointers are 32-bit.",
        "code": "",
        "note": ""
      },
      {
        "id": "library",
        "title": "The standard library on WebAssembly",
        "text": "Much of the standard library talks to the operating system through native system calls, and those parts have no WebAssembly implementation yet: output from `io` does not work, and importing `threads`, `sync`, or `term/tui` fails to compile. `net/http` compiles, but needs a transport supplied by the host. `time.Monotonic` imports `env.ocean_time_monotonic_ns`, which must return monotonic nanoseconds as a 64-bit integer (a BigInt in JavaScript).\n\nUse files ending in `_wasm.oc` and `_native.oc` to provide different implementations for the two targets, and `asm wasm { … }` for WebAssembly-specific inline assembly.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/io",
    "group": "Standard library",
    "title": "io",
    "description": "Print and format text, read from standard input and files with scanners, and parse numbers.",
    "sections": [
      {
        "id": "printing",
        "title": "Printing",
        "text": "`io.Print` writes its arguments to standard output, and `io.Println` does the same and adds a newline. They accept any number of values of any type. A space is inserted between two neighboring arguments only when neither is a string, so `io.Println(1, 2)` prints `1 2`, while `io.Println(\"x=\", 1)` prints `x=1`. Include spaces in your strings where you want them.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(1, 2, 3);\n    io.Println(\"total: \", 42);\n    io.Println(\"pi is about \", 3.14159);\n}",
        "note": "",
        "after": "Floats print with two decimal places by default. Use `io.FormatFloat(x)` for the full precision needed to read the value back exactly. Structs print as `{x: 1, y: 2}`, arrays as `[1 2 3]`, and enums as `Shape.Circle(1.50)`. Byte arrays (`[]i8`) print as numbers; cast them to `string` to print text. Maps cannot be printed directly yet."
      },
      {
        "id": "formatting",
        "title": "Formatting with placeholders",
        "text": "`io.Printf` and `io.Printfln` take a format string in which each `{}` is replaced by the next argument, printed as `io.Print` would print it. `Printfln` adds a newline. To include a literal `{` before a `}`, escape it with a backslash, written `\"\\\\{}\"` in an Ocean string. There are no width or precision specifiers.\n\n`io.Sprint` and `io.Sprintf` return the text instead of printing it. Because a format string can have the wrong number of placeholders, `Sprintf` returns a `Result<string>`.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    label := io.Sprintf(\"{} apples cost {}\", 3, 1.5).unwrap();\n    io.Println(label);\n}",
        "note": ""
      },
      {
        "id": "results",
        "title": "Output results",
        "text": "The print functions return a `Result<int>` with the number of bytes written. Writing to standard output almost never fails, so most programs ignore the result. Check it when output goes somewhere that might fail, such as a closed pipe.",
        "code": "",
        "note": ""
      },
      {
        "id": "stdin",
        "title": "Reading from standard input",
        "text": "`io.Scanln()` reads one line from standard input, without the trailing newline. `io.Scan()` reads one word: it stops at any whitespace. Both return a `Result<string>`. At the end of input they succeed with an empty string. A carriage return before the newline is kept, so strip it yourself if you process Windows-style input.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Print(\"What is your name? \");\n    name := io.Scanln().unwrap();\n    io.Println(\"Hello, \", name, \"!\");\n}",
        "note": ""
      },
      {
        "id": "scanner",
        "title": "Scanners",
        "text": "For files, or for more control, create a scanner with `io.NewScanner(file)`, passing an `os.File` opened for reading in text mode. A scanner buffers its input; use one scanner per file and don't mix it with direct reads on the same file.",
        "code": "package main;\n\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    file := os.Open(\"notes.txt\", os.FileMode.Read).unwrap();\n    defer file.Close();\n    scanner := io.NewScanner(file);\n    for (scanner.HasNextln().unwrap()) {\n        io.Println(\"> \", scanner.Scanln().unwrap());\n    }\n}",
        "note": "",
        "after": "The `HasNext` methods only look at data that is already available and never wait for more. That makes them ideal for files. On a terminal or pipe they may return `false` simply because the user hasn't typed anything yet.",
        "table": {
          "headers": [
            "Method",
            "Returns"
          ],
          "rows": [
            [
              "`Scanln()`",
              "`Result<string>`: the next line, without its newline"
            ],
            [
              "`Scan()`",
              "`Result<string>`: the next whitespace-separated word"
            ],
            [
              "`Scanc(delimiter)`",
              "`Result<string>`: text up to the given byte, which is consumed"
            ],
            [
              "`Scann(n)`",
              "`Result<io.ScanResult>`: up to `n` bytes in `Bytes`, with `End` set if input ended first"
            ],
            [
              "`HasNextln()`, `HasNext()`, `HasNextc(delimiter)`",
              "`Result<bool>`: whether a complete line, word, or segment is available without waiting"
            ]
          ]
        }
      },
      {
        "id": "parsing",
        "title": "Parsing numbers",
        "text": "`io.ParseInt(text)` reads a whole string as a base-10 integer, with an optional `+` or `-` sign. `io.ParseFloat(text)` reads a decimal number with an optional fraction and exponent, such as `-1.25e2` or `.5`, and also accepts `inf`, `infinity`, and `nan`. Both return an error `Result` instead of panicking if the text is not a valid number, has surrounding spaces or trailing characters, or is out of range.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    count := io.ParseInt(\"42\").unwrap();\n    ratio := io.ParseFloat(\"1.25e-2\").unwrapOrElse(0.0);\n    io.Println(count, \" \", ratio);\n    io.Println(io.ParseInt(\"12 apples\").error());\n}",
        "note": "",
        "after": "Number parsing and formatting are written in Ocean and don't depend on the C library or the system locale."
      }
    ]
  },
  {
    "slug": "library/os",
    "group": "Standard library",
    "title": "os",
    "description": "Open, read, and write files, access the standard streams, read command-line arguments, and exit.",
    "sections": [
      {
        "id": "args-exit",
        "title": "Arguments and exit",
        "text": "`os.Args()` returns the command-line arguments as an array of strings. The first element is the path of the program itself, so the arguments you typed start at index 1. `os.Exit(code)` ends the whole process immediately with the given status. It does not run deferred calls, so prefer returning from `main` when you can.",
        "code": "",
        "note": ""
      },
      {
        "id": "opening",
        "title": "Opening files",
        "text": "`os.Open(path, mode)` opens a file and returns a `Result<os.File>`. The mode chooses what you can do with the file. Text and binary modes differ only in what you may do with them: a scanner can only read text-mode files.",
        "code": "",
        "note": "",
        "after": "`os.Stdin()`, `os.Stdout()`, and `os.Stderr()` return the standard streams as files. Copies of an `os.File` value refer to the same open file and share its position. Close a file with `Close()` when you are done; closing twice is harmless.",
        "table": {
          "headers": [
            "Mode",
            "Meaning"
          ],
          "rows": [
            [
              "`os.FileMode.Read`",
              "Read an existing file"
            ],
            [
              "`os.FileMode.Write`",
              "Create the file, or empty an existing one, and write"
            ],
            [
              "`os.FileMode.ReadWrite`",
              "Read and write, creating the file if needed without emptying it"
            ],
            [
              "`os.FileMode.Append`",
              "Write at the end, creating the file if needed"
            ],
            [
              "`os.FileMode.ReadAppend`",
              "Read, and write at the end"
            ],
            [
              "`Binary`, `BinaryWrite`, `BinaryReadWrite`, `BinaryAppend`, `BinaryReadAppend`",
              "The same modes for binary data (`Binary` is read-only)"
            ]
          ]
        }
      },
      {
        "id": "writing",
        "title": "Writing a file",
        "text": "`file.Write(text)` writes a string and returns a `Result<int>` with the number of bytes written.",
        "code": "package main;\n\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    out := os.Open(\"notes.txt\", os.FileMode.Write).unwrap();\n    out.Write(\"first line\\nsecond line\\n\").unwrap();\n    out.Close();\n\n    file := os.Open(\"notes.txt\", os.FileMode.Read).unwrap();\n    io.Println(file.Size().unwrap());\n    file.Close();\n}",
        "note": ""
      },
      {
        "id": "reading",
        "title": "Reading bytes",
        "text": "For line- or word-based reading, wrap a file in an `io.Scanner`. For raw bytes, use the file's own read methods.",
        "code": "",
        "note": "",
        "after": "To turn bytes into a string, slice them into a dynamic array and cast: `text := file.Readall().unwrap()[:] -> string;`.\n\n`IsOpen()`, `CanRead()`, `CanWrite()`, and `IsBinary()` describe a file. `Close()` and `Setpos()` panic if the operating system reports a failure; every other method reports problems through its `Result`. Reading again after the end of file has been reported panics.",
        "table": {
          "headers": [
            "Method",
            "Returns"
          ],
          "rows": [
            [
              "`Read()`",
              "`Result<int>`: the next byte as 0–255, or -1 at end of file"
            ],
            [
              "`Readn(n)`",
              "`Result<os.ReadResult>`: exactly `n` bytes in `Bytes` (zero-padded), with `End` set if the file ended early"
            ],
            [
              "`Readchunk(n)`",
              "`Result<[]i8>`: up to `n` bytes; empty at end of file"
            ],
            [
              "`Readend()`",
              "`Result<array<i8>>`: everything from the current position to the end"
            ],
            [
              "`Readall()`",
              "`Result<array<i8>>`: the whole file, without moving the current position"
            ],
            [
              "`Size()`",
              "`Result<int>`: the file's size in bytes"
            ],
            [
              "`Setpos(offset)`",
              "Move to a byte offset, from 0 up to the size"
            ]
          ]
        }
      },
      {
        "id": "errors",
        "title": "Handling a missing file",
        "text": "Opening a file that doesn't exist, or that you lack permission for, returns an error `Result` rather than panicking, so you can decide what to do.",
        "code": "package main;\n\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    opened := os.Open(\"settings.txt\", os.FileMode.Read);\n    if (opened.hasError()) {\n        io.Println(\"using defaults: \", opened.error());\n        return;\n    }\n    file := opened.unwrap();\n    file.Close();\n}",
        "note": ""
      },
      {
        "id": "descriptors",
        "title": "Native handles",
        "text": "`os.FromDescriptor(fd, readable, writable)` wraps an existing operating-system file descriptor as an `os.File`, and `file.NativeHandle()` returns the descriptor of an open file. These are for interoperating with C code.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/os/exec",
    "group": "Standard library",
    "title": "os/exec",
    "description": "Run other programs, pass them arguments and environment variables, and capture their output.",
    "sections": [
      {
        "id": "command",
        "title": "Running a command",
        "text": "`exec.Command(name, args...)` describes a program to run. The arguments are passed to it directly; no shell is involved, so spaces and quotes in arguments need no escaping. The name is looked up on `PATH` unless it contains a path. Then run it in one of three ways:",
        "code": "package main;\n\nimport \"io\";\nimport \"os/exec\";\n\nfunc main() {\n    command := exec.Command(\"echo\", \"hello\", \"world\");\n    io.Print(command.Output().unwrap());\n}",
        "note": "",
        "after": "A nonzero exit status counts as an error, so `unwrap()` panics if the program fails. After it finishes, the command's `ExitCode` field holds the exit status (or -1 if the program was killed by a signal). Each command can run only once.",
        "table": {
          "headers": [
            "Method",
            "Behavior"
          ],
          "rows": [
            [
              "`Run()`",
              "Run with the parent's standard input and output; returns `Result<int>`"
            ],
            [
              "`Output()`",
              "Capture standard output as a `Result<string>`; standard error passes through"
            ],
            [
              "`CombinedOutput()`",
              "Capture standard output and standard error together, in the order written"
            ]
          ]
        }
      },
      {
        "id": "configuring",
        "title": "Working directory and environment",
        "text": "Set fields on the command before running it. `Dir` sets the working directory, and `Env` replaces the environment with a list of `KEY=value` strings; leaving either empty inherits the parent's.",
        "code": "package main;\n\nimport \"io\";\nimport \"os/exec\";\n\nfunc main() {\n    command := exec.Command(\"/bin/sh\", \"-c\", \"echo \\\"$GREETING from $PWD\\\"\");\n    command.Env = []string{\"GREETING=hello\"};\n    command.Dir = \"/tmp\";\n    io.Print(command.Output().unwrap());\n}",
        "note": ""
      },
      {
        "id": "lookpath",
        "title": "Finding programs",
        "text": "`exec.LookPath(name)` returns the full path of the program that `name` would run, or an error if it isn't found.",
        "code": "",
        "note": ""
      },
      {
        "id": "limits",
        "title": "Limitations",
        "text": "Output is collected in temporary files, so commands that produce a lot of output can't deadlock, but there is no size limit. There is no way yet to start a command and wait for it later, to connect pipes, to set a timeout, or to supply standard input. `os/exec` works on Linux, macOS, and Windows, but not on WebAssembly.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/encoding/json",
    "group": "Standard library",
    "title": "encoding/json",
    "description": "Encode Ocean values as JSON text and decode JSON into dynamic values.",
    "sections": [
      {
        "id": "marshal",
        "title": "Encoding",
        "text": "`json.Marshal(value)` returns the JSON text for a value as a `Result<string>`. It handles `null`, booleans, strings, integers, finite floats, structs, `map[string]any`, `mixed []any`, and dynamic arrays of strings, integers, floats, and booleans. Struct fields are written with their exact names, including private ones; object keys from maps come out sorted. Types it can't encode produce an error.",
        "code": "package main;\n\nimport \"io\";\nimport \"encoding/json\";\n\nstruct Person {\n    Name string;\n    Age int;\n    Tags []string;\n}\n\nfunc main() {\n    io.Println(json.Marshal(Person{\"Ada\", 36, []string{\"math\"}}).unwrap());\n}",
        "note": ""
      },
      {
        "id": "unmarshal",
        "title": "Decoding",
        "text": "`json.Unmarshal(text)` parses a document and returns a `Result<any>`. Objects become `map[string]any`, arrays become `mixed []any`, strings, booleans, and `null` become their Ocean equivalents, and numbers become `json.Number`. Use type assertions or type switches to navigate the result.",
        "code": "package main;\n\nimport \"io\";\nimport \"encoding/json\";\n\nfunc main() {\n    value := json.Unmarshal(\"{\\\"name\\\": \\\"Lin\\\", \\\"scores\\\": [1, 2.5]}\").unwrap();\n    object := value.(map[string]any);\n    name := object[\"name\"].(string);\n    scores := object[\"scores\"].(mixed []any);\n    second := scores[1].(json.Number).Float64().unwrap();\n    io.Println(name, \" \", len(scores), \" \", second);\n}",
        "note": ""
      },
      {
        "id": "number",
        "title": "json.Number",
        "text": "A `json.Number` keeps the number's original text in its `Text` field, so large integers and exact decimal spellings aren't lost. Convert it with `Int64()` or `Float64()`, which return a `Result` and fail if the value doesn't fit.",
        "code": "",
        "note": ""
      },
      {
        "id": "valid",
        "title": "Validation and limits",
        "text": "`json.Valid(text)` reports whether a string is one complete, valid JSON document. Decoding checks UTF-8, escape sequences, and number syntax, and limits nesting to 128 levels. When an object repeats a key, the last value wins.\n\nThere is no decoding into structs, no field tags or custom encoders, no streaming, and no pretty-printing. Fixed-size arrays, pointers, and maps with non-`any` values such as `map[string]int` can't be encoded yet; convert them to supported types first.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/net/http",
    "group": "Standard library",
    "title": "net/http",
    "description": "Make HTTP and HTTPS requests with timeouts, custom headers, and cancellation.",
    "sections": [
      {
        "id": "get",
        "title": "Making a request",
        "text": "`http.Get(url)` fetches a URL and returns a `Result<http.Response>`. The response has `StatusCode` (such as `200`), `Status` (such as `200 OK`), `Header`, and `Body`, a string containing the whole response body. Status codes such as 404 are normal responses, not errors; errors are reserved for failures such as an unreachable server or an invalid certificate.",
        "code": "package main;\n\nimport \"io\";\nimport \"net/http\";\n\nfunc main() {\n    response := http.Get(\"https://example.com/\").unwrap();\n    io.Println(response.StatusCode, \" \", response.Header.Get(\"Content-Type\"));\n    io.Println(len(response.Body), \" bytes\");\n}",
        "note": "",
        "after": "`http.Post(url, contentType, body)` sends a POST request with the given body."
      },
      {
        "id": "client",
        "title": "Clients and timeouts",
        "text": "For control over requests, declare an `http.Client` and set its fields; the zero value works. `Timeout` is a time limit in nanoseconds for the whole request, from connecting to reading the last byte, so use the units from the `time` package. Zero means no limit. `MaxResponseBytes` caps the response size (16 MiB by default).",
        "code": "package main;\n\nimport \"io\";\nimport \"net/http\";\nimport \"time\";\n\nfunc main() {\n    client: http.Client;\n    client.Timeout = 5 * time.Second;\n    request := http.NewRequest(\"POST\", \"https://example.com/items\", \"{\\\"name\\\": \\\"rope\\\"}\").unwrap();\n    request.Header.Set(\"Content-Type\", \"application/json\");\n    response := client.Do(request).unwrap();\n    io.Println(response.Status);\n}",
        "note": "",
        "after": "`http.NewRequest(method, url, body)` builds a request; an empty method means GET. `client.Do(request)` sends it, and `client.Get` and `client.Post` are shortcuts. A timed-out request fails with the error `http: timeout exceeded`."
      },
      {
        "id": "headers",
        "title": "Headers",
        "text": "`Header` is used for both requests and responses. `Set` replaces a header's value, `Add` appends another value, `Get` returns the first value (or an empty string), `Values` returns all of them, and `Del` removes the header. Names are case-insensitive. The client manages `Host`, `Connection`, `Content-Length`, and `Transfer-Encoding` itself, and setting them is an error.",
        "code": "",
        "note": ""
      },
      {
        "id": "cancel",
        "title": "Cancellation",
        "text": "To cancel a request from another thread, create an `http.Cancellation`, attach it with `http.NewRequestWithCancel(&cancel, method, url, body)` or `request.WithCancel(&cancel)`, and call `cancel.Cancel()`. The request then fails with `http: request canceled`. Keep the cancellation value in one place (don't copy it) and alive until the request has finished. One cancellation can cancel several requests.",
        "code": "",
        "note": ""
      },
      {
        "id": "tls",
        "title": "Security and limits",
        "text": "HTTPS connections always verify the server's certificate and hostname and require TLS 1.2 or newer, using the system's trusted certificates. To trust a private certificate authority, set `client.TLSClientConfig.RootCAFile` to a PEM file. There is no option to turn verification off.\n\nRedirects are not followed, and proxies, cookies, compressed responses, IPv6 address literals in URLs, connection reuse, and HTTP servers are not supported yet. URL paths must already be percent-encoded.",
        "code": "",
        "note": ""
      },
      {
        "id": "requirements",
        "title": "Requirements",
        "text": "The native implementation uses libcurl 7.68 or newer, built with TLS support. The installer's dependency bundle includes it; otherwise install your system's libcurl development package (such as `libcurl4-openssl-dev` on Debian and Ubuntu). The compiler links libcurl automatically for programs that import `net/http`.\n\nOn WebAssembly, the package compiles, but you must supply a transport by setting `client.Transport` to a value with a `RoundTrip(request Request) Result<Response>` method that performs the request through the host.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/term",
    "group": "Standard library",
    "title": "term",
    "description": "Query terminal size, detect terminals, read passwords without echo, and switch to raw mode.",
    "sections": [
      {
        "id": "functions",
        "title": "Functions",
        "text": "Every function takes an open `os.File`, usually `os.Stdin().unwrap()`, and returns a `Result`. The package never closes the file.",
        "code": "",
        "note": "",
        "table": {
          "headers": [
            "Function",
            "Result"
          ],
          "rows": [
            [
              "`term.IsTerminal(file)`",
              "`Result<bool>`: whether the file is a terminal (a pipe or regular file gives `false`)"
            ],
            [
              "`term.GetSize(file)`",
              "`Result<term.Size>`: the terminal's `Width` in columns and `Height` in rows"
            ],
            [
              "`term.ReadPassword(file)`",
              "`Result<string>`: one line of input read without echoing it"
            ],
            [
              "`term.MakeRaw(file)`",
              "`Result<bool>`: save the current settings and switch to raw mode"
            ],
            [
              "`term.Restore(file)`",
              "`Result<bool>`: restore the settings saved by `MakeRaw`"
            ]
          ]
        }
      },
      {
        "id": "example",
        "title": "Example",
        "text": "",
        "code": "package main;\n\nimport \"io\";\nimport \"os\";\nimport \"term\";\n\nfunc restore(input os.File) {\n    term.Restore(input).unwrap();\n}\n\nfunc main() {\n    input := os.Stdin().unwrap();\n    if (!term.IsTerminal(input).unwrap()) {\n        io.Println(\"not a terminal\");\n        return;\n    }\n    size := term.GetSize(input).unwrap();\n    io.Println(size.Width, \" columns, \", size.Height, \" rows\");\n\n    io.Print(\"Password: \");\n    password := term.ReadPassword(input).unwrap();\n    io.Println();\n    io.Println(\"read \", len(password), \" characters\");\n\n    term.MakeRaw(input).unwrap();\n    defer restore(input);\n    key := input.Readchunk(1).unwrap();\n}",
        "note": "",
        "after": "`ReadPassword` prints neither a prompt nor a newline, so print them yourself as shown. It restores the terminal's settings afterward, even if reading fails."
      },
      {
        "id": "raw-mode",
        "title": "Raw mode",
        "text": "In raw mode the terminal delivers each key press immediately, without waiting for Enter, and does not echo or interpret special keys: Ctrl+C arrives as a byte rather than stopping the program. Always restore the terminal before your program exits; registering `Restore` with `defer` right after `MakeRaw` makes that automatic, including during a panic. Settings cannot be restored if the process is killed.\n\nFor full-screen interactive programs, the `term/tui` package handles raw mode, input decoding, and redrawing for you.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/term/tui",
    "group": "Standard library",
    "title": "term/tui",
    "description": "Build interactive terminal applications with a model, an update function, and a view.",
    "sections": [
      {
        "id": "architecture",
        "title": "The model–update–view loop",
        "text": "`term/tui` structures an interactive terminal program as a loop, in the style of the Bubble Tea library. Your application state is a model, a type with three methods:",
        "code": "interface Model {\n    Init() Cmd;\n    Update(message Msg) (Model, Cmd);\n    View() string;\n}",
        "note": "",
        "after": "`View` returns the text to show on screen. `Update` receives each event, such as a key press, a mouse click, a resize, or a timer, and returns the new model. `Init` runs once at the start. Both `Init` and `Update` also return a command: a function the framework runs in the background, whose returned message is later fed back into `Update`. `Msg` is simply `any`, and `Cmd` is `func() Msg`.\n\nThe three methods always run one at a time, on the thread that called `Run`, so model state never needs locking. Commands run on separate threads; give them copies of the data they need rather than letting them touch the model."
      },
      {
        "id": "counter",
        "title": "A complete program",
        "text": "This counter increases every second, responds to the arrow keys and the mouse, and quits on `q` or Ctrl+C.",
        "code": "package main;\n\nimport \"io\";\nimport \"term/tui\";\nimport \"time\";\n\nstruct counter { count int; }\nstruct tickMsg {}\n\nfunc (model counter) Init() tui.Cmd {\n    return tui.Tick(time.Second, tickMsg{});\n}\n\nfunc (model counter) Update(message tui.Msg) (tui.Model, tui.Cmd) {\n    switch (event := message.(type)) {\n        case tui.KeyMsg:\n            if (event.Key == \"ctrl+c\" || event.Text == \"q\") return model, tui.Quit;\n            if (event.Key == \"up\") model.count++;\n            if (event.Key == \"down\") model.count--;\n        case tui.MouseMsg:\n            if (event.Action == \"press\" && event.Button == \"left\") model.count++;\n        case tickMsg:\n            model.count++;\n            return model, tui.Tick(time.Second, tickMsg{});\n        case tui.EOFMsg:\n            return model, tui.Quit;\n    }\n    return model, tui.NoCmd;\n}\n\nfunc (model counter) View() string {\n    return \"Count: \" + io.Sprint(model.count) + \"\\n↑/↓ or click to change, q to quit\";\n}\n\nfunc main() {\n    program := tui.NewProgram(counter{}, tui.Options{AltScreen: true, Mouse: true});\n    program.Run().unwrap();\n}",
        "note": "",
        "after": "`counter` uses value receivers, so `Update` changes its own copy and returns it. A model can also be a pointer to a struct, whose methods modify it in place and return the same pointer. Notice that `tui.Quit` and `tui.NoCmd` are passed as function values, without parentheses. Ticks fire once; schedule the next one from `Update` to repeat.\n\n`Run` returns the final model as a `Result<tui.Model>`; assert it back to your type, as in `final.(counter)`, if you need its state."
      },
      {
        "id": "program",
        "title": "Programs and options",
        "text": "`tui.NewProgram(model, options)` creates a program, and `program.Run()` takes over the terminal until a quit message arrives, then restores it. Keep the program in one variable and don't copy it. `program.Send(message)` delivers a message from any thread, and `program.Quit()` asks it to stop.",
        "code": "",
        "note": "",
        "after": "Without `AltScreen`, the view is drawn inline, starting at the current line. Only redrawn lines are repainted. While `Run` is active, don't read standard input or print to standard output elsewhere: return everything through `View`.",
        "table": {
          "headers": [
            "Option",
            "Effect"
          ],
          "rows": [
            [
              "`AltScreen: true`",
              "Draw on the terminal's alternate screen and restore the previous contents on exit"
            ],
            [
              "`Mouse: true`",
              "Report mouse clicks, wheel movement, and drags as `MouseMsg`"
            ],
            [
              "`Headless: true`",
              "Don't use the terminal at all (useful for tests and command-only programs)"
            ]
          ]
        }
      },
      {
        "id": "messages",
        "title": "Messages",
        "text": "",
        "code": "",
        "note": "",
        "after": "For printable characters, `Key` is `rune` and `Text` holds the character. Other key names include `enter`, `tab`, `backspace`, `esc`, `space`, `up`, `down`, `left`, `right`, `home`, `end`, `pgup`, `pgdown`, `insert`, `delete`, `shift+tab`, `f1` to `f12`, and `ctrl+a` to `ctrl+z`. In raw mode Ctrl+C is an ordinary key, so handle `ctrl+c` if you want it to quit.\n\nMouse actions are `press`, `release`, `motion` (while a button is held), and `scroll`. Buttons are `left`, `middle`, `right`, or `none`; for scrolling, `Button` gives the direction: `up`, `down`, `left`, or `right`. Coordinates count from the top-left corner of the whole terminal.",
        "table": {
          "headers": [
            "Message",
            "Fields and meaning"
          ],
          "rows": [
            [
              "`tui.KeyMsg`",
              "`Key`, `Text`, `Alt`: a key press. `Text` holds the character for printable keys"
            ],
            [
              "`tui.MouseMsg`",
              "`X`, `Y` (zero-based cell), `Button`, `Action`, `Shift`, `Alt`, `Ctrl`"
            ],
            [
              "`tui.WindowSizeMsg`",
              "`Width`, `Height`: sent at startup and whenever the terminal is resized"
            ],
            [
              "`tui.EOFMsg`",
              "Terminal input has ended"
            ],
            [
              "`tui.ReadMsg`, `tui.WriteMsg`, `tui.ErrorMsg`",
              "Results of the `tui.Read` and `tui.Write` commands"
            ]
          ]
        }
      },
      {
        "id": "commands",
        "title": "Commands",
        "text": "",
        "code": "",
        "note": "",
        "after": "Any function of type `func() tui.Msg` is a command, so you can write your own that does slow work, such as reading a file, and returns a message describing the result. Each running command uses its own thread. When the program quits, unfinished commands are cancelled and waited for. `term/tui` needs native threads, so it is not available on WebAssembly.",
        "table": {
          "headers": [
            "Command",
            "Effect"
          ],
          "rows": [
            [
              "`tui.NoCmd`",
              "Do nothing"
            ],
            [
              "`tui.Quit`",
              "Stop the program"
            ],
            [
              "`tui.Tick(duration, message)`",
              "Deliver `message` once after `duration` nanoseconds"
            ],
            [
              "`tui.Batch(commands...)`",
              "Run several commands at the same time"
            ],
            [
              "`tui.Sequence(commands...)`",
              "Run commands one after another"
            ],
            [
              "`tui.Read(file, count)`, `tui.Write(file, text)`",
              "Read from or write to another file in the background"
            ]
          ]
        }
      }
    ]
  },
  {
    "slug": "library/math",
    "group": "Standard library",
    "title": "math",
    "description": "Trigonometry, powers, logarithms, rounding, and floating-point helpers for float values.",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "text": "All functions take and return `float` values unless noted. Angles are in radians. The package is implemented in Ocean (with some assembly for speed) and doesn't depend on the C math library.",
        "code": "package main;\n\nimport \"io\";\nimport \"math\";\n\nfunc main() {\n    root := math.Pow(9.0, 0.5);\n    wave := math.Sin(math.Pi / 6.0);\n    io.Println(root, \" \", wave, \" \", math.Hypot(3.0, 4.0));\n}",
        "note": "",
        "table": {
          "headers": [
            "Group",
            "Functions"
          ],
          "rows": [
            [
              "Constants",
              "`Pi`, `E`, `Ln2`, `Sqrt2`"
            ],
            [
              "Trigonometry",
              "`Sin`, `Cos`, `Tan`, `Asin`, `Acos`, `Atan`, `Atan2(y, x)`"
            ],
            [
              "Powers and logarithms",
              "`Pow(x, y)`, `Sqrt`, `Exp`, `Exp2`, `Log` (natural), `Log2`, `Log10`, `Hypot(x, y)`"
            ],
            [
              "Rounding",
              "`Trunc`, `Floor`, `Ceil`, `Round` (halves round away from zero)"
            ],
            [
              "Arithmetic",
              "`Abs`, `Copysign(x, y)`, `Min`, `Max`, `Mod(x, y)`"
            ],
            [
              "IEEE values",
              "`NaN()`, `Inf(sign)`, `IsNaN(x)`, `IsInf(x, sign)`, `Signbit(x)`, `Float64bits(x)`, `Float64frombits(bits)`"
            ]
          ]
        }
      },
      {
        "id": "details",
        "title": "Special values and accuracy",
        "text": "Invalid inputs return NaN, and overflow returns infinity, rather than panicking. `Log(0)` is negative infinity. `Inf(sign)` gives negative infinity for a negative sign and positive infinity otherwise; `IsInf(x, 0)` accepts either. `Float64bits` and `Float64frombits` convert between a float and its raw bits as a `uint`.\n\nThe results are close approximations, not always correctly rounded. Trigonometric functions lose accuracy for very large angles, so keep angles within a few turns of zero.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/time",
    "group": "Standard library",
    "title": "time",
    "description": "Pause execution, measure elapsed time, and express durations in nanoseconds.",
    "sections": [
      {
        "id": "durations",
        "title": "Durations",
        "text": "Durations in Ocean are `int` values counting nanoseconds. The package exports units to make them readable: `time.Nanosecond`, `time.Microsecond`, `time.Millisecond`, and `time.Second`. Multiply to build a duration, such as `250 * time.Millisecond`.",
        "code": "",
        "note": ""
      },
      {
        "id": "sleep-measure",
        "title": "Sleeping and measuring",
        "text": "`time.Sleep(duration)` pauses the calling thread for at least about that long; zero and negative durations return immediately. `time.Monotonic()` returns a reading from a clock that only moves forward, in nanoseconds. Its starting point is arbitrary, so it is only useful for measuring the time between two readings in the same program.",
        "code": "package main;\n\nimport \"io\";\nimport \"time\";\n\nfunc main() {\n    start := time.Monotonic();\n    time.Sleep(20 * time.Millisecond);\n    elapsed := time.Monotonic() - start;\n    io.Println(elapsed >= 20 * time.Millisecond);\n}",
        "note": "",
        "after": "On Windows the monotonic clock has millisecond precision. There is no wall-clock (calendar date and time) support yet."
      }
    ]
  },
  {
    "slug": "library/threads",
    "group": "Standard library",
    "title": "threads",
    "description": "Run functions concurrently on native operating-system threads.",
    "sections": [
      {
        "id": "spawn",
        "title": "Starting and waiting for threads",
        "text": "`threads.Spawn(job)` starts a function or closure on a new operating-system thread and returns a thread ID. `threads.Await(id)` waits until that thread has finished, and `threads.IsDone(id)` checks without waiting. `threads.CurrentID()` returns the calling thread's ID; the main thread is 0. IDs are never reused, and passing an unknown ID to any function panics.",
        "code": "package main;\n\nimport \"io\";\nimport \"threads\";\nimport \"sync\";\n\nfunc main() {\n    total := 0;\n    lock: sync.Mutex;\n    ids := make([]int);\n    for (i := 0; i < 4; i++) {\n        ids.append(threads.Spawn(func() {\n            lock.Lock();\n            defer lock.Unlock();\n            total += 1;\n        }));\n    }\n    for (_, id := range ids) {\n        threads.Await(id);\n    }\n    io.Println(total);\n}",
        "note": "",
        "after": "Closures share the variables they capture, so threads that modify the same variable must coordinate, here with a `sync.Mutex`. When `main` returns, the program waits for every thread still running before it exits."
      },
      {
        "id": "control",
        "title": "Pausing, stopping, and killing",
        "text": "",
        "code": "",
        "note": "",
        "after": "Killing is cooperative: the target stops the next time it starts a function call, begins a loop iteration, or waits in `Yield`, `Await`, or a `sync` wait, and its deferred calls run. A thread blocked inside a long native call or assembly block stops only once that returns. `Return` and `Kill` are not panics and cannot be recovered. An unrecovered panic in any thread ends the whole program.",
        "table": {
          "headers": [
            "Function",
            "Effect"
          ],
          "rows": [
            [
              "`threads.Yield()`",
              "Pause the calling thread until another thread wakes it"
            ],
            [
              "`threads.Wake(id)`",
              "Resume a thread that is paused in `Yield` (no effect otherwise)"
            ],
            [
              "`threads.Return()`",
              "End the calling thread from any depth, running its deferred calls"
            ],
            [
              "`threads.Kill(id)`",
              "Ask a thread to stop; follow with `Await` to wait for it"
            ]
          ]
        }
      },
      {
        "id": "platforms",
        "title": "Platforms",
        "text": "Threads use pthreads on Linux and macOS and the Win32 API on Windows. Importing `threads` (or `sync`) when compiling for WebAssembly is an error.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/sync",
    "group": "Standard library",
    "title": "sync",
    "description": "Coordinate threads with mutexes and wait groups.",
    "sections": [
      {
        "id": "mutex",
        "title": "Mutex",
        "text": "A `sync.Mutex` ensures only one thread at a time runs a section of code. `Lock()` waits until the mutex is free and takes it, `Unlock()` releases it, and `TryLock()` takes it only if it is free, returning whether it succeeded. Register the unlock with `defer` immediately after locking, so the mutex is released even if the thread returns early or is killed.\n\nMutexes are not reentrant, so a thread must not lock a mutex it already holds. Unlocking a mutex that isn't locked panics.",
        "code": "",
        "note": ""
      },
      {
        "id": "waitgroup",
        "title": "WaitGroup",
        "text": "A `sync.WaitGroup` waits for a set of tasks to finish. Call `Add(n)` before starting `n` tasks, have each task call `Done()` when it finishes (with `defer`), and call `Wait()` to block until all are done.",
        "code": "package main;\n\nimport \"io\";\nimport \"threads\";\nimport \"sync\";\n\nfunc main() {\n    group: sync.WaitGroup;\n    lock: sync.Mutex;\n    finished := 0;\n    for (i := 0; i < 3; i++) {\n        group.Add(1);\n        threads.Spawn(func() {\n            defer group.Done();\n            lock.Lock();\n            defer lock.Unlock();\n            finished++;\n        });\n    }\n    group.Wait();\n    io.Println(\"done \", finished);\n}",
        "note": ""
      },
      {
        "id": "rules",
        "title": "Using them correctly",
        "text": "Both types work as soon as they are declared; no initialization is needed. Their methods use pointer receivers, and they must stay at a fixed location: never copy a mutex or wait group after you start using it, and pass it to functions as a pointer. A wait group can be reused only after every earlier `Wait` call has returned.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/mem",
    "group": "Standard library",
    "title": "mem",
    "description": "Copy raw bytes between memory regions.",
    "sections": [
      {
        "id": "copy",
        "title": "mem.Copy",
        "text": "`mem.Copy(source, destination, byteCount)` copies exactly `byteCount` bytes from one address to another. The regions may overlap. Both pointers are `*void`, so any typed pointer can be passed. Both regions must be valid for the full count; a count of zero touches neither, and a negative count panics.",
        "code": "package main;\n\nimport \"io\";\nimport \"mem\";\n\nfunc main() {\n    data: [4]u8 = {1, 2, 3, 4};\n    mem.Copy(&data[0], &data[1], 3);   // shift the first three bytes right\n    io.Println(data);\n}",
        "note": "",
        "after": "`mem.Copy` moves bytes only. It does not copy the strings or arrays a value owns, so use ordinary assignment for anything other than plain numeric data."
      }
    ]
  },
  {
    "slug": "library/reflect",
    "group": "Standard library",
    "title": "reflect",
    "description": "Inspect the fields of structs and the variants of enums at runtime.",
    "sections": [
      {
        "id": "fields",
        "title": "Struct fields",
        "text": "`reflect.Fields(value)` returns an array of `reflect.Field` values, one for each field of a struct, in declaration order. Each `Field` has a `Name` string and a `Value` of type `any`. Private fields are included. The values are independent copies: changing them does not affect the original. For anything that isn't a struct or enum, the array is empty, and pointers are not followed (pass `*pointer` to inspect what it points to).",
        "code": "package main;\n\nimport \"io\";\nimport \"reflect\";\n\nstruct Person { name string; age int; }\n\nfunc main() {\n    for (_, field := range reflect.Fields(Person{\"Ada\", 36})) {\n        io.Println(field.Name, \" = \", field.Value);\n    }\n}",
        "note": ""
      },
      {
        "id": "enums",
        "title": "Enums",
        "text": "`reflect.IsStruct(value)` and `reflect.IsEnum(value)` report what kind of value you have. `reflect.EnumVariant(value)` returns the variant's qualified name, such as `Event.Key`, or an empty string for a non-enum. For an enum, `Fields` returns the active variant's data: record fields with their names, tuple values with empty names.\n\n`io.Println` uses this package to print structs and enums.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "source",
    "group": "Contribute",
    "title": "Source code",
    "description": "Where the compiler, standard library, and this website are developed.",
    "sections": [
      {
        "id": "repositories",
        "title": "The three repositories",
        "text": "Ocean is developed in the open on GitHub, in three repositories under the `ocean-foundation` organization.\n\n`ocean-c` holds the compiler, written in C, together with the language server, the installer, the release scripts, the editor support files, and the compiler's test suite.\n\n`ocean-src` holds the standard library, written in Ocean. A compiler release and the library tag with the same name belong together.\n\n`oceanlang-website` holds this website and its documentation.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "ocean-foundation/ocean-c",
            "href": "https://github.com/ocean-foundation/ocean-c"
          },
          {
            "label": "ocean-foundation/ocean-src",
            "href": "https://github.com/ocean-foundation/ocean-src"
          },
          {
            "label": "ocean-foundation/oceanlang-website",
            "href": "https://github.com/ocean-foundation/oceanlang-website"
          }
        ]
      },
      {
        "id": "contributing",
        "title": "Making a contribution",
        "text": "Contributions are made as pull requests against each repository's `main` branch. Describe what you changed and which tests you ran. A language change usually touches more than one repository: the compiler, the standard library if it uses the change, and these docs. The compiler repository's agent skill file, `skills/ocean/SKILL.md`, is kept in step with the language and should be updated in the same change.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "contribute/compiler",
    "group": "Contribute",
    "title": "Working on the compiler",
    "description": "Build the compiler, run it against a library checkout, find your way around the pipeline, and run its tests.",
    "sections": [
      {
        "id": "build",
        "title": "Build a development compiler",
        "text": "Follow the source build on the getting-started page: clone `ocean-c` and `ocean-src` side by side and build with CMake. The build produces `build/ocean-c` and an identical `build/ocean`. Rebuild with `cmake --build build` after changing C files. To switch C compilers, configure a fresh build directory with `-DCMAKE_C_COMPILER=…` instead of reusing the old one.",
        "code": "cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug\ncmake --build build",
        "note": "",
        "lang": "Terminal",
        "after": "You can also build with `make VERSION=1.2.3`, which wraps CMake and stamps the version into `ocean --version`. Without a version, it reports `dev`."
      },
      {
        "id": "run",
        "title": "Run it against your library checkout",
        "text": "A compiler in the build directory has no installed library next to it, so point `OCEAN_SRC` at your `ocean-src` checkout. Setting `OCEAN_BUILD_CACHE=off` makes sure every run really exercises the compiler you just built, rather than reusing cached objects.",
        "code": "export OCEAN_SRC=\"$PWD/../ocean-src\"\nOCEAN_BUILD_CACHE=off build/ocean check /path/to/example",
        "note": "",
        "lang": "Terminal"
      },
      {
        "id": "pipeline",
        "title": "How the compiler is organized",
        "text": "The compiler's sources sit at the repository root. A build passes through these stages:",
        "code": "",
        "note": "",
        "after": "The backend writes LLVM IR as text, and `main.c` runs Clang to compile and link it. The interactive installer, in `installer/`, is itself an Ocean program.",
        "table": {
          "headers": [
            "Stage",
            "Main files"
          ],
          "rows": [
            [
              "Command-line interface and tool invocation",
              "`main.c`, `platform.c`"
            ],
            [
              "Module and package loading, imports, external modules",
              "`package.c`"
            ],
            [
              "Scanning source text into tokens",
              "`scanner.c`, `token.c`"
            ],
            [
              "Parsing tokens into an abstract syntax tree",
              "`parser.c`, `ast.c`"
            ],
            [
              "Name resolution and type checking",
              "`semantic.c`, `semantic_enum.inc`"
            ],
            [
              "Generating LLVM IR",
              "`backend.c` and its `backend_*.inc` parts"
            ],
            [
              "Build cache",
              "`build_cache.c`"
            ],
            [
              "Runtime support embedded in programs",
              "`runtime_threads.c`, `runtime_process.c`"
            ],
            [
              "Language server",
              "`lsp.c`, `lsp_semantic.inc`"
            ]
          ]
        }
      },
      {
        "id": "tests",
        "title": "Tests",
        "text": "`ctest --test-dir build --output-on-failure` runs the whole suite, which is registered in `CMakeLists.txt`. It combines C unit tests for the scanner, parser, AST, and semantic analysis with Python integration tests in `tests/` that compile Ocean programs, inspect the generated code, and run the results. Other suites cover packages and modules, the build cache, the language server, the standard library, and release packaging. Use `ctest -R name` to run a focused suite while you work.\n\n`tests/README.md` explains the suite conventions. Known gaps are tracked in `tests/pending/`; a skipped pending test documents a missing feature, it doesn't prove that one works. When fixing a bug, add a test that fails without the fix. The parser accepts some syntax that later stages don't support, so test new features all the way through to a running program.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "contribute/stdlib",
    "group": "Contribute",
    "title": "Working on the standard library",
    "description": "How the standard library is laid out, how to test changes, and the conventions packages follow.",
    "sections": [
      {
        "id": "layout",
        "title": "Layout",
        "text": "Each directory in `ocean-src` is a package, imported by its path from the repository root: the `term/tui` directory is imported as `\"term/tui\"`. There is no build step: the compiler reads the library's source whenever a program imports it, so you edit `.oc` files and use them immediately.\n\nPackages whose implementation differs between native targets and WebAssembly use `_native.oc` and `_wasm.oc` files. Differences between operating systems and CPUs are handled with inline assembly blocks selected by architecture and platform, which is how `io`, `os`, `time`, and `term` make system calls without C dependencies.",
        "code": "",
        "note": ""
      },
      {
        "id": "testing",
        "title": "Testing a change",
        "text": "Point a matching compiler at your checkout with `OCEAN_SRC`, then run the Ocean unit tests from the repository root. Tests live next to the code in `_test.oc` files.",
        "code": "export OCEAN_SRC=\"$PWD\"\nocean test ./... --notty\nocean test encoding/json io",
        "note": "",
        "lang": "Terminal",
        "after": "The HTTP tests need permission to open local sockets; they don't contact outside servers. A few packages also have Python harnesses for behavior that needs a real terminal or several processes, in `term/tests`, `term/tui/tests`, `threads/tests`, `time/tests`, and similar directories. Set `OCEAN` to the compiler to use when running them."
      },
      {
        "id": "conventions",
        "title": "Conventions",
        "text": "Exported names start with an uppercase letter and the rest stay private. Recoverable failures are returned as `Result<T>`; panics are reserved for misuse, such as invalid arguments. Each package directory has a `README.md` describing its API and behavior; keep it up to date along with these website pages.\n\nThe `reflect` package is special: it can call compiler primitives that no other package may use, and only when it lives in the configured standard-library directory.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "contribute/website",
    "group": "Contribute",
    "title": "Working on the website",
    "description": "Run this website locally, edit documentation pages, and verify their examples.",
    "sections": [
      {
        "id": "setup",
        "title": "Run the site locally",
        "text": "The website is built with SvelteKit and Svelte 5 and deployed to Cloudflare Workers. Install Node.js and npm, then install the locked dependencies, generate the Cloudflare types, and start the development server.",
        "code": "npm ci\nnpm run gen\nnpm run dev",
        "note": "",
        "lang": "Terminal"
      },
      {
        "id": "content",
        "title": "Where the documentation lives",
        "text": "Each documentation page is written in a plain-text file in `content/docs/`. Pages appear in the order of the files, sorted by name, and in their order within each file. The script `scripts/build_docs.py` turns these files into `src/lib/docs.ts`, which the site reads to build every page, the sidebar, search, and the previous and next links. Don't edit `docs.ts` by hand; edit the text files and run `npm run docs`.",
        "code": "",
        "note": ""
      },
      {
        "id": "format",
        "title": "The page format",
        "text": "A page starts with `===` and its URL slug, followed by its group, title, and description. Each section starts with `---`, an identifier, and a title. Plain lines are the section's text; a blank line starts a new paragraph, and backticks mark inline code. A section may contain one code block, written between a line starting with three backticks and the word `code` and a closing line of three backticks, optionally labeled after `code`. After the code block, `@after` begins text shown below the example, `@note` a highlighted callout, `@table` a table (first row is the header, cells separated by `|`, written as `\\|` inside a cell), and `@links` a list of `Label -> URL` lines.",
        "code": "=== language/example\ngroup: Language guide\ntitle: Example page\ndesc: One sentence describing the page.\n\n--- intro | Introduction\nText with `inline code`.\n\nA second paragraph.\n@note\nA callout.",
        "note": "",
        "lang": "Page source",
        "after": "Groups must be one of the groups listed in the script. Markdown other than inline code is shown literally, so use `@links` rather than Markdown link syntax."
      },
      {
        "id": "examples",
        "title": "Verify the examples",
        "text": "`scripts/check_docs.py` compiles every complete Ocean example (any example containing a `package` declaration) with `ocean check`. It uses the `ocean` on your `PATH`, or the compiler named by the `OCEAN` environment variable, and the usual `OCEAN_SRC` setting to choose the library. Lines that control the checker are removed from the published page: `// check: run` runs the example instead of only checking it, each `// expect: TEXT` line gives one expected line of output, `// check: skip` excludes an example that needs input or a network, and `// file: path` splits an example into several files.",
        "code": "python3 scripts/check_docs.py content/docs\nOCEAN=../ocean-c/build/ocean OCEAN_SRC=../ocean-src \\\n  python3 scripts/check_docs.py content/docs language/functions",
        "note": "",
        "lang": "Terminal"
      },
      {
        "id": "validate",
        "title": "Check and build",
        "text": "Run the type checks and a production build before submitting a change, and look over the changed pages in `npm run preview` at both desktop and phone widths.",
        "code": "npm run docs\nnpm run check\nnpm run build",
        "note": "",
        "lang": "Terminal"
      }
    ]
  }
];
export const groups = ["Start here", "Language guide", "Tutorials", "Tooling", "Standard library", "Contribute"];
