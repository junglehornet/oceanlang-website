export type Section = { id: string; title: string; text: string; code: string; note: string; links?: { label: string; href: string }[]; after?: string; table?: { headers: string[]; rows: string[][] } };
export type Doc = { slug: string; group: string; title: string; description: string; sections: Section[] };
export const docs: Doc[] = [
  {
    "slug": "getting-started",
    "group": "Start here",
    "title": "Get started with Ocean",
    "description": "Build and install the compiler and standard library, then write, check, and run your first Ocean program.",
    "sections": [
      {
        "id": "agent-skill",
        "title": "Code with an agent skill",
        "text": "The compiler repository on Codeberg includes an Ocean agent skill covering current syntax, tooling, packages, modules, and the build system. Download the latest SKILL.md from the main branch and save it as ocean/SKILL.md in your coding agent’s skills directory. Use your agent’s skill installation instructions to choose that directory.",
        "code": "",
        "note": "The download follows the main branch, so download it again when updating your compiler to keep the guidance current.",
        "links": [
          { "label": "View the Ocean agent skill in the compiler repository", "href": "https://codeberg.org/junglehornet/ocean-c/src/branch/main/skills/ocean/SKILL.md" },
          { "label": "Download the latest SKILL.md", "href": "https://codeberg.org/junglehornet/ocean-c/raw/branch/main/skills/ocean/SKILL.md" }
        ]
      },
      {
        "id": "source",
        "title": "Get the source",
        "text": "Ocean currently builds from source. Clone the compiler repository, `ocean-c`, and the standard-library repository, `ocean-src`, into the same parent directory. This makes them sibling directories, so the compiler’s build configuration can find the library at `../ocean-src`. Git is also used when Ocean downloads external modules.\n\nThe standard library consists of `.oc` source files. Keep its package directories intact; Ocean compiles the packages your program imports when it builds that program. You do not need to build the library separately.\n\nThe commands below create both checkouts and then enter `ocean-c`. The installation section explains how CMake copies the compiler into `<prefix>/bin` and the library into `<prefix>/src`. For a manual system-wide installation, `/usr/local/lib/ocean` can serve as that prefix: place the executable in `/usr/local/lib/ocean/bin`, copy the library source tree into `/usr/local/lib/ocean/src`, and add the `bin` directory to PATH. The compiler normally finds the library relative to its own executable, not relative to your program’s working directory.",
        "code": "git clone https://codeberg.org/junglehornet/ocean-c.git\ngit clone https://codeberg.org/junglehornet/ocean-src.git\ncd ocean-c",
        "note": "",
        "after": "The remaining build commands run inside `ocean-c`. Once Ocean is installed, your own programs can live in any other directory; they do not need to be placed inside either source repository."
      },
      {
        "id": "build-the-compiler",
        "title": "Build the compiler",
        "text": "You need CMake 4.2 or newer, a C23-capable C compiler, libffi development headers and libraries, and Clang on your PATH. Python 3 is also required for the test suite, which is enabled by default. Run these commands from your Ocean compiler checkout. The compiler generates textual LLVM IR and uses Clang to produce native code; LLVM development libraries are not required.\n\nCMake configures the build, and the C compiler builds Ocean itself. Clang has a separate job: it compiles the LLVM output of your Ocean programs and links their native executables. Make sure both your C compiler and Clang are installed, even if you already have one of them.\n\nThe `build` directory holds generated build files and compiler binaries. Keeping those files separate from the source makes it easier to rebuild or change configuration later. The final command runs the compiler’s test suite and reports any failures.",
        "code": "cmake -S . -B build\ncmake --build build\nctest --test-dir build --output-on-failure",
        "note": "Ocean is under active development. These docs describe the current compiler and standard-library source, rather than promising a stable release API.",
        "after": "After a successful build, `build/ocean` is available directly from this checkout. If CMake reports missing libffi headers or libraries, install your operating system’s libffi development package and configure the build again. Package names and installation commands depend on your system."
      },
      {
        "id": "install-ocean",
        "title": "Install Ocean and its library",
        "text": "There are two settings for the standard library, used at different times. `OCEAN_STANDARD_LIBRARY_SOURCE` is a CMake setting: it chooses which library source directory to copy during installation and defaults to the sibling `../ocean-src` checkout. `OCEAN_SRC` is an environment variable: it tells a running compiler which library source directory to use instead of its installed copy.\n\nAn installation prefix is the parent directory of the installed `bin` and `src` directories. For example, a prefix of `$HOME/.local` puts Ocean in `$HOME/.local/bin/ocean` and library packages in `$HOME/.local/src`. Without `OCEAN_SRC`, the compiler finds `../src` relative to the directory containing its executable. Choose a prefix you can write to and add its `bin` directory to PATH.\n\nInstallation copies the executable and standard-library sources into a common prefix. The compiler normally looks for library packages relative to its own executable, so using the installed layout avoids setting a library path for every command. The example uses a user-owned prefix and does not require a system-wide installation. A system-wide installation can use `/usr/local/lib/ocean`, giving `/usr/local/lib/ocean/bin` and `/usr/local/lib/ocean/src`.\n\nReplace `/path/to/ocean-src` with the absolute path to your standard-library checkout. If you cloned both repositories into the same parent directory, CMake already defaults to `../ocean-src`; no rename is needed. However, spelling it out makes the relationship explicit.",
        "code": "cmake -S . -B build -DCMAKE_INSTALL_PREFIX=\"$HOME/.local\" \\\n  -DOCEAN_STANDARD_LIBRARY_SOURCE=/path/to/ocean-src\ncmake --build build\ncmake --install build\nexport PATH=\"$HOME/.local/bin:$PATH\"",
        "note": "The installed layout places the compiler in bin/ and library packages in src/. OCEAN_SRC can override the library source directory.",
        "after": "The `export` command affects the current shell. To make it permanent, add the equivalent PATH setting to your shell configuration. You can also run the installed compiler using its full path. `OCEAN_SRC` is useful when testing changes in a separate standard-library checkout."
      },
      {
        "id": "first-program",
        "title": "Write your first program",
        "text": "Create a new directory, run `ocean mod init example.com/hello` there to create its `ocean.mod` module file, and save the following as `main.oc`. Every Ocean file starts with a package declaration. A root package named `main` can build into an executable.\n\nUse a directory containing only this example while you are getting started. Ocean compiles packages rather than isolated files, so an unrelated `.oc` file in the same directory will also be part of the program. You can call the new directory `hello`; the source filename itself does not determine the package name.\n\n`package main;` identifies an executable package. `import \"io\";` makes the standard output functions available in this file. When the executable starts, Ocean calls `main`, whose body prints the message and then finishes.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Hello, Ocean!\");\n}",
        "note": "",
        "after": "Save the file before running the next commands. The string is enclosed in double quotes, the call ends with a semicolon, and the closing brace ends the function body. This program should print `Hello, Ocean!` followed by a newline."
      },
      {
        "id": "check-run-build",
        "title": "Check, run, build",
        "text": "Run these commands inside your program directory. `check` validates the package and its imports without executing your program. `run` builds and executes a temporary executable. `build` creates a native executable you can keep.\n\nStart with `ocean check .` when you want feedback without running code. It checks the complete package graph and verifies that native code can be produced and linked. This means a missing native toolchain can fail a check even when the Ocean syntax is valid.\n\n`ocean run .` is convenient during development because it removes the temporary executable afterward. Use `ocean build` when you want an executable to run again, distribute, or inspect separately. The optional `-o` option chooses its output filename, which will default to the selected package directory’s name.",
        "code": "ocean check .\nocean run .\nocean build . -o hello\n./hello",
        "note": "A file argument selects its entire containing package directory, not just that file. Put unrelated programs in separate directories.",
        "after": "The dot refers to your current directory. The last command runs the executable produced by the preceding build. If `io` cannot be resolved, check that the standard library was installed alongside Ocean or that `OCEAN_SRC` points to the library source directory."
      },
      {
        "id": "read-the-syntax",
        "title": "Read the syntax",
        "text": "Statements end with a semicolon unless they end in a block. Braces enclose function bodies and control-flow blocks. In a declaration, the name comes before its type. Use := when the compiler can infer the type.\n\nFor example, `value int` declares an integer parameter, and the `int` following the closing parenthesis declares the result type. A call to `twice` must supply a compatible value, and its result is itself an integer. Local type inference saves you from repeating that type in `answer := twice(21);`.\n\nOcean still checks inferred variables statically. Once a variable has an inferred type, assigning a different kind of value does not change that type. Use explicit type annotations in public function signatures or wherever a declared type makes the code easier to understand.",
        "code": "func twice(value int) int {\n    return value * 2;\n}\n\n// Inside main:\nanswer := twice(21);\nio.Println(answer);",
        "note": "",
        "after": "Place the function declaration outside `main`, then put the final two statements inside `main`. The call passes `21`, the function multiplies it by two, and the printed result is `42`. The language guide covers these rules in more detail."
      }
    ]
  },
  {
    "slug": "language/variables",
    "group": "Language guide",
    "title": "Variables & basic types",
    "description": "Declare values, work with numbers, and make conversions explicit.",
    "sections": [
      {
        "id": "declarations-and-inference",
        "title": "Declarations and inference",
        "text": "Use `name: Type` for an explicit variable declaration, or `name := value` to infer its type. A declaration without an initializer, such as `x: int;`, receives its type’s default value: zero for an integer, for example. A name declared in an inner block can shadow an outer name.\n\nNeither form of variable declaration makes a variable immutable. After declaration, use `=` or a compound assignment such as `+=` to change its value. The new value must remain compatible with the variable’s type.\n\nA block creates a lexical scope. A local name is available from its declaration within that scope, including nested blocks unless another declaration shadows it. Prefer a different name when shadowing would make it unclear which value an expression uses.",
        "code": "count := 12;\ndepth: float = 42.5;\nready: bool;              // false\ncount += 3;\ncount++;",
        "note": "",
        "after": "Here, `count` is inferred as `int`, `depth` is explicitly a `float`, and `ready` starts as `false`. The two updates leave `count` equal to `16`. Use `count = ...` for another assignment; another declaration is a different operation."
      },
      {
        "id": "built-in-scalar-types",
        "title": "Built-in scalar types",
        "text": "`int` and `i64` are signed 64-bit integers. `i32`, `i16`, and `i8` provide narrower signed storage. `uint`, `u64`, `u32`, `u16`, and `u8` provide unsigned integers. `float` and `f64` are double precision; `f32` is single precision. `bool` holds `true` or `false`. `string` stores immutable bytes. Choose explicit widths for binary data and C interfaces.\n\nUse `int` for ordinary integer values unless a storage or interface requirement calls for a particular width. Ocean’s `int` is 64-bit; it should not be assumed to have the same width as a C `int`. Floating-point values have different precision and rounding behavior from integers, so choose them for quantities that need fractional values.\n\nAn integer literal, including a negative literal, can supply a floating-point value when the surrounding operation expects one: `depth == 0` and calls such as `measure(2)` work when the value or parameter is a float. Typed initializers, assignments, returns, and arithmetic also accept integer literals. Integer variables and expressions such as `1 + 2` still require an explicit cast; `count := 0` still infers `int`.\n\nInteger variables convert implicitly only when the destination can represent every source value. For example, `i8` to `i32`, `u8` to `u16`, and `u8` to `i16` are allowed. Reducing the storage width or converting a signed integer to an unsigned integer requires `value -> Type`. An unsigned integer can convert implicitly to a signed integer only when the signed destination has enough bits to represent the unsigned source’s full range. For example, `u8` fits in `i16`, but not in `i8`. These rules apply to arguments, initializers, assignments, returns, and collection elements. Fitting integer literals can directly supply narrower types (`small: i8 = 42`), but variables and expressions are checked by their type rather than their current value. Widening an individual number does not change the storage type behind a pointer or inside an existing collection. For example, an `i8` value can supply an `i32` parameter, but an `i8[]` array cannot supply an `i32[]` parameter, and an `*i8` pointer cannot supply an `*i32` parameter. When integer operands have different widths, arithmetic uses a compatible 64-bit result type. A fitting integer literal can instead use the other operand’s type. Mixed signed/unsigned arithmetic requires a cast when no signed 64-bit type represents both ranges.\n\nAn arrow cast, written `value -> Type`, requests an explicit conversion. It makes a type change visible at the expression where it occurs. For a compound target such as a pointer type, put the target in parentheses.",
        "code": "small: i8 = 7;\nwide: i32 = small;\nnarrow := wide -> i8;\nratio := 3.5;\nwhole := ratio -> int;\nnonzero := whole -> bool;",
        "note": "",
        "after": "Assigning `small` to `wide` implicitly widens an `i8` to `i32`. Converting `wide` back to `i8` requires the explicit arrow cast. Converting `3.5` to `int` produces an integer, and converting a number to `bool` tests whether it is nonzero. A cast can lose information; choose the destination type according to the values your program needs to represent.",
        "table": {
          "headers": [
            "Type",
            "Meaning"
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
              "`float`, `f64`",
              "Double-precision floating point"
            ],
            [
              "`f32`",
              "Single-precision floating point"
            ],
            [
              "`bool`",
              "`true` or `false`"
            ],
            [
              "`string`",
              "Immutable sequence of bytes"
            ]
          ]
        }
      },
      {
        "id": "operators",
        "title": "Operators",
        "text": "Arithmetic uses +, -, *, /, and %. Comparisons use ==, !=, <, <=, >, and >=. Boolean && and || short-circuit: the right operand is evaluated only when needed. Integer bit operations are supported. The conditional expression uses condition ? yes : no.\n\nUse parentheses when an expression combines several operations and their grouping would otherwise be hard to follow. Short-circuit evaluation is especially useful for guards: a condition can establish that a later expression is safe before the expression is evaluated.\n\nThe conditional expression produces one of two values. It is useful for a small choice inside an assignment, such as choosing a label. For branches that perform several operations, use an `if` statement instead so each path remains easy to read.",
        "code": "label := count > 10 ? \"many\" : \"few\";\nsafe := count != 0 && 100 / count > 2;",
        "note": "",
        "after": "In the second expression, the division is evaluated only when `count` is nonzero. This guard prevents division by zero. The label expression chooses `\"many\"` or `\"few\"`; both alternatives are strings, so the result has a consistent type.\n\nEquality works recursively on structs and arrays and is available on unconstrained generic types. Strings also support <, <=, >, and >= using unsigned-byte lexicographic order, including embedded NUL bytes. If one string is an exact byte prefix of another, the shorter string comes first; for example, `\"a\" < \"aa\"`."
      },
      {
        "id": "default-values",
        "title": "Default values",
        "text": "`zero(Type)` explicitly constructs a default value. Its argument is a type, not a value. Each struct field receives the default for its own type, strings and dynamic arrays are empty, maps contain no entries, numbers are `0`, and booleans are `false`.\n\nDefault initialization lets you declare a counter, flag, or empty collection without writing a literal initializer. `zero(Type)` is useful when you want to express the same default explicitly, especially in generic code where the concrete type is a parameter. It constructs a value; it does not call a user-defined constructor.\n\nFor a struct, defaulting proceeds through its stored fields. For a fixed buffer, every element receives a default value. An empty string, dynamic array, or map is a valid value with length zero. It can be used without first assigning a nonempty value.",
        "code": "count := zero(int);\ntext := zero(string);\nitems := zero(int[]);",
        "note": "A default pointer has a zero address, which is distinct from Ocean’s explicit null marker. Initialize optional pointers to null explicitly.",
        "after": "Notice that `zero(int[])` takes the array type itself. Passing a variable to `zero` is not an alternative spelling for clearing it. A reset is an assignment such as `count = zero(int);`. Pointer defaults need extra care because the zero address and explicit `null` are distinct in Ocean."
      },
      {
        "id": "value-equality",
        "title": "Value equality and generic comparisons",
        "text": "`==` and `!=` are available for every generic type parameter, including an unconstrained `T`; no comparability constraint is required. This allows a generic function to test two values for equality without declaring a special “comparable” constraint. It does not allow arbitrary unrelated types to be compared: the operands still have to satisfy Ocean’s usual type-compatibility rules, including its pointer and explicit-null rules.\n\nStruct equality recursively compares stored fields, ignoring padding. Arrays compare lengths and then elements recursively, including nested arrays and structs. Capacity and allocation address do not affect array equality. A fixed array, an array whose length is chosen at runtime, and a dynamic array can be compared when both operands store the same element type. Equal lengths and equal elements are required for equality. A difference in length makes the arrays unequal. Fixed raw buffers compare their elements; raw buffer pointer views and typed pointers compare addresses, without following pointees. Maps compare their key/value entries, ignoring insertion order and bucket capacity. Enum value equality compares which variant is stored and the data carried by that variant; comparison with a variant selector, such as `event == Event.Key`, tests only the tag. Function values compare the function code and the particular captured-variable environment they refer to. Copying a closure preserves that identity; creating a new closure with its own captured variables does not.\n\nAn `any` or interface value stores both a value and its concrete type; this representation is called a box. Equality inspects that concrete type to choose how to compare the stored values. Matching concrete types compare by the rules above; different types compare unequal, except primitive numeric values retain the usual numeric conversions. Floating-point equality is numeric even inside aggregates: positive and negative zero are equal, and NaN is unequal to itself. Both operands are evaluated once, left to right; the left value is preserved if the right expression mutates it.\n\nStrings support all six comparisons: `==`, `!=`, `<`, `<=`, `>`, and `>=`. Ordering compares unsigned bytes from left to right, including embedded zero (NUL) bytes. The first differing byte decides the order. If every byte of the shorter string matches the start of the longer string, the shorter string comes first. It is case-sensitive and does not perform locale collation or Unicode normalization. String constraints, including `T string`, support ordering. An unconstrained `T` promises equality but does not promise ordering or arithmetic.",
        "after": "`indexOf<Person>` works because Ocean compares both stored fields of each `Person`. It returns `1` for the second array element. The string tests show both a differing first byte (`apple` versus `banana`) and an exact-prefix comparison (`a` versus `aa`).",
        "code": "func indexOf<T>(data array<T>, value T) int {\n    for (i := 0; i < len(data); i++) {\n        if (data[i] == value) return i;\n    }\n    return -1;\n}\n\nstruct Person { name string; age int; }\n\nfunc main() int {\n    people := Person[2]{{\"Ada\", 36}, {\"Lin\", 28}};\n    if (indexOf<Person>(people, Person{\"Lin\", 28}) != 1) return 1;\n    if (!(\"apple\" < \"banana\" && \"a\" < \"aa\")) return 2;\n    return 0;\n}",
        "note": "Struct fields and array elements compare by value. Pointers and function values compare identity; their referenced state is not traversed."
      }
    ]
  },
  {
    "slug": "language/control-flow",
    "group": "Language guide",
    "title": "Control flow",
    "description": "Conditions, loops, and switches with familiar, explicit structure.",
    "sections": [
      {
        "id": "conditions",
        "title": "Conditions",
        "text": "An `if` statement chooses a branch using a boolean condition. Braces group statements; a single statement can follow the condition directly.\n\nConditions must produce a boolean. A comparison such as `depth > 100` supplies one directly; a variable of type `bool` can also be used as the condition. Ocean evaluates the condition and executes only the selected branch. You can extend an `else` with another `if` when several conditions should be checked in order.\n\nThe example assumes `depth` has already been declared. Both branches are braced even though each contains one statement, which keeps the structure clear if more statements are added later.",
        "code": "if (depth > 100) {\n    io.Println(\"Deep water\");\n} else {\n    io.Println(\"Near the surface\");\n}",
        "note": "",
        "after": "A depth greater than `100` prints `Deep water`; every other value takes the `else` branch. A condition alone does not create a repeated operation. Use a loop when the test and body need to run more than once."
      },
      {
        "id": "counting-and-range-loops",
        "title": "Counting and range loops",
        "text": "Use `for` for both counted loops and collection traversal with `range`. For an array or string, two range bindings receive the index and a copy of the element; a single binding receives only the index. For a map, two bindings receive the key and a copy of the value; a single binding receives only the key.\n\nThe counted form has an initializer, a condition, and an update separated by semicolons. The initializer runs once, the condition is tested before each iteration, and the update runs as the loop advances. A `for (;;)` loop has no stopping condition and normally needs a `break` or another terminating path.\n\nAn array or string range loop evaluates its collection expression once, then visits elements in index order. A map range loop visits a snapshot of the map’s entries in unspecified order. Its element binding is a value copy. Updating that local binding does not replace the corresponding element in the original array; use indexed assignment when you need that effect.",
        "code": "for (i := 0; i < 3; i++) {\n    io.Println(i);\n}\n\nvalues := int[]{10, 20, 30};\nfor (index, value := range values) {\n    io.Printfln(\"{}: {}\", index, value);\n}",
        "note": "",
        "after": "The counted loop prints `0`, `1`, and `2`. The range loop prints each index together with its value: `0: 10`, `1: 20`, and `2: 30`. With only one binding, `for (index := range values)`, that binding would receive the index."
      },
      {
        "id": "condition-loops",
        "title": "Condition-only and deferred-condition loops",
        "text": "Use `for (cond)` when a loop needs a condition but no initializer or update in its header. Ocean tests the condition before entering the body and again before each subsequent iteration. If it is false at the start, the body does not run. This is the form to use for a while-style loop; update the relevant state inside the body.\n\nAdding `defer` before the condition skips only the first condition check. In `for (defer cond)`, execution enters the body immediately, then tests the condition before deciding whether to repeat. The body therefore runs at least once, even if the condition would initially be false. This is useful when the body must produce or update the state that the condition examines.\n\nThe same modifier works in a three-part header: `for (init; defer cond; incr)`. The initializer runs once, then the first body runs without a condition check. After the body, the increment runs, and only then is the condition tested. Later iterations keep that body, increment, condition order. A normal three-part loop instead checks its condition between initialization and the first body.",
        "code": "// A condition-only loop checks before its first iteration.\ncount := 0;\nfor (count < 3) {\n    io.Println(count);\n    count++;\n}\n\n// A deferred condition allows the first iteration unconditionally.\ncount = 3;\nfor (defer count < 3) {\n    io.Println(count);\n    count++;\n}\n\n// The update still runs before the deferred condition is checked.\nlimit := 0;\nfor (i := 0; defer i < limit; i++) {\n    io.Println(i);\n}",
        "after": "Place these statements inside a function in a file that imports `io`. The first loop prints `0`, `1`, and `2`. The second starts with `count` equal to `3`, so its condition would be false before entry. Because the condition is deferred, it still prints `3` once, increments `count` to `4`, and then stops.\n\nThe final loop also runs once: it initializes `i` to `0`, prints `0`, increments `i` to `1`, and tests `1 < 0`, which is false. Without `defer`, the initial test `0 < 0` would prevent the body from running at all. An initializer binding such as `i` belongs to the loop’s scope.\n\n`continue` follows the same advancement path as reaching the end of the body: it runs the update if one exists, then checks the condition. `break` exits directly, without running the update or another condition check. Deferring the condition does not change either rule.",
        "note": "Here, `defer` modifies when the loop condition is first evaluated. It is separate from a deferred function-call statement, which schedules a call before the enclosing function exits.",
        "table": {
          "headers": [
            "Loop form",
            "Execution order"
          ],
          "rows": [
            [
              "`for (cond)`",
              "Check → body → check → body …"
            ],
            [
              "`for (defer cond)`",
              "Body → check → body → check …"
            ],
            [
              "`for (init; defer cond; incr)`",
              "Initialize → body → increment → check → body …"
            ]
          ]
        }
      },
      {
        "id": "loop-control",
        "title": "Loop control",
        "text": "`break` exits a loop and `continue` advances to the next iteration. Labels let nested loops `break` or `continue` a named outer loop. The `range` index advances independently of changes you make to its visible binding.\n\nUse an unlabeled `break` or `continue` when you mean the innermost loop. In nested loops, a label names the loop that should receive the operation. This can be clearer than adding extra flags simply to communicate that an outer search is finished.\n\nFor a counted loop, `continue` advances through the update before the next condition test. For a range loop over an array or string, `continue` advances to the next index; for a map, it advances to the next entry. Assigning to a range binding changes that local variable, not the loop’s internal position or the original collection.",
        "code": "outer: for (i := 0; i < 5; i++) {\n    for (j := 0; j < 5; j++) {\n        if (i + j > 4) break outer;\n    }\n}",
        "note": "",
        "after": "In this example, `break outer;` leaves both loops once a pair has a sum greater than four. An unlabeled `break;` at the same position would leave only the inner loop, allowing the outer loop to continue."
      },
      {
        "id": "switches",
        "title": "Switches",
        "text": "Value switches compare against cases in source order. A matched case does not implicitly fall into the next one; use `fallthrough` explicitly when needed. A `default` branch handles unmatched values. Condition switches and type-guard switches are also supported.\n\nA value switch evaluates case tests in source order and runs the first matching case. Comma-separated case values share a body. The `default` body runs only if no case matches, regardless of where it is written. Put the default last when that makes the intended order easiest to see.\n\nEach case normally finishes without executing the next case. `fallthrough` executes the next case body without requiring that next case’s test to match. Type-guard switches use the same overall structure but select by concrete type; those are described in the generics guide.",
        "code": "switch (status) {\n    case 0:\n        io.Println(\"Ready\");\n    case 1, 2:\n        io.Println(\"Working\");\n    default:\n        io.Println(\"Unknown\");\n}",
        "note": "",
        "after": "Assuming an integer variable named `status`, zero prints `Ready`, one or two prints `Working`, and another value prints `Unknown`. There is no need to add a `break` after each body to prevent an implicit fallthrough."
      }
    ]
  },
  {
    "slug": "language/functions",
    "group": "Language guide",
    "title": "Functions",
    "description": "Typed parameters, multiple results, variadic calls, and predictable value semantics.",
    "sections": [
      {
        "id": "declare-a-function",
        "title": "Declare a function",
        "text": "An ordinary function parameter is written as a name followed by its type, such as `left int`. The result type follows the parameter list. Functions can call declarations that appear later, and recursion is supported. Executables use `func main()` or `func main() int`.\n\nA function declaration separates the operations it performs from the places that call it. The parameter list gives each input a name and a type. Those names are local to the function body. A result type tells callers what value to expect; omitting it declares a function with no result.\n\n`return` ends the current call. In a value-returning function, provide an expression compatible with the result type. Functions declared in any source file of the same package can call one another without a separate forward declaration.",
        "code": "func add(left int, right int) int {\n    return left + right;\n}\n\nfunc main() int {\n    return add(2, 3);\n}",
        "note": "",
        "after": "The call `add(2, 3)` binds `left` to `2` and `right` to `3`, then returns `5`. Here `main` returns that number as the process exit status. For a program that simply prints output and succeeds, use `func main()` without a result type."
      },
      {
        "id": "multiple-results",
        "title": "Multiple results",
        "text": "List result types in parentheses and unpack a call into multiple bindings. Use _ to discard an individual result. If a function call produces several results, it can appear by itself after `return` to return all those results. It can also be the only argument expression in another call, supplying that call’s entire argument list in order.\n\nMultiple results are useful when an operation has both a value and a status. Callers can handle them together without defining a one-off wrapper struct. The number and types of expressions in a return must agree with the declared result list.\n\nIn the example, division by zero is an expected failure represented by `false`. The caller should check that flag before using the result as a successful quotient. When a result is deliberately unnecessary, use `_` for that position rather than introducing an unused descriptive name.",
        "code": "func divide(a int, b int) (int, bool) {\n    if (b == 0) return 0, false;\n    return a / b, true;\n}\n\n// Inside a function:\nvalue, ok := divide(12, 3);",
        "note": "",
        "after": "After `divide(12, 3)`, `value` is `4` and `ok` is `true`. Calling `divide(12, 0)` instead gives `0` and `false`. You can write `value, _ := divide(12, 3);` when a surrounding condition already guarantees a valid divisor."
      },
      {
        "id": "variadic-parameters",
        "title": "Variadic parameters",
        "text": "A final `...T` parameter accepts zero or more values. Use a final `array...` argument to expand an existing array. The called function receives an array containing independent copies of the supplied values. `...any` accepts a mixture of concrete types.\n\nA variadic parameter gathers its arguments into an array that can be indexed or traversed. The element type after `...` constrains each supplied item. A variadic parameter must be last, after any required fixed parameters. A call with no variadic items provides an empty collection.\n\nExpansion is written on the final argument expression, not on each element. It can follow explicit variadic items, so `total(10, numbers...)` includes ten before the array contents. Raw buffers cannot be expanded because they do not carry the required array length.",
        "code": "func total(values ...int) int {\n    result := 0;\n    for (i, value := range values) {\n        result += value;\n    }\n    return result;\n}\n\n// Inside a function:\nnumbers := int[]{2, 4, 6};\nanswer := total(numbers...);",
        "note": "",
        "after": "The call shown returns `12`. Inside `total`, each range iteration adds an element copy to `result`. Passing `numbers...` does not make the function share mutable ownership of the caller’s collection; the value-copy rules still apply."
      },
      {
        "id": "values-and-shared-mutation",
        "title": "Values and shared mutation",
        "text": "Arrays, maps, strings, and structs are copied when passed by value, including the owned values nested inside them. To mutate a caller’s value, pass an explicit pointer. Pointer receivers can borrow addressable values automatically.\n\nA copied parameter is local to the call. This rule applies to nested strings, arrays, and maps in structs as well as top-level collections. It can make code easier to reason about, but copying a large value is still real work. Choose a pointer when you intend to share the original object rather than relying on an accidental alias.\n\nIn a pointer parameter such as `*int`, the asterisk is part of the type. At the call site, `&count` supplies the address of the variable. In the body, `*value` accesses that variable through the pointer.",
        "code": "func increment(value *int) {\n    *value += 1;\n}\n\n// Inside a function:\ncount := 4;\nincrement(&count);",
        "note": "Write explicit returns. A function with a declared result type that reaches the end without `return` currently returns that type’s default value and emits a warning. Bound method values remain unsupported. Function literals and shared mutable closures are supported.",
        "after": "After `increment(&count)`, the caller’s `count` is `5`. If the function instead accepted `value int` and incremented it, only its local copy would change. Pointer lifetime and explicit heap allocation are covered in the memory guide."
      },
      {
        "id": "function-literals-and-closures",
        "title": "Function literals and closures",
        "text": "Function literals use `func(parameters) resultType { body }`; omit the result type for a function with no results. Their types use the same signature without the body: `func(int) int`, `func()`, or `func() (int, bool)`. When assigning a function value to a function-typed variable or passing it to a function-typed parameter, the source function and destination function type must agree on each parameter type, each result type, and whether the final parameter is variadic. This includes numeric storage widths: `func(i32) int` and `func(int) int` are different types. Parameter names are not part of that comparison. Functions can be assigned to variables, passed as arguments, returned, stored in structs or arrays, and boxed in `any`. A named function can also be passed or assigned as a value. For a generic function, choose its concrete type arguments first: `identity<int>` selects the integer version of `identity`. Function literals can use outer generic type parameters but cannot declare their own type parameters.\n\nClosures capture variables by reference. The surrounding function and sibling closures share updates to a captured variable. Returning a closure preserves its captures; copying a function value shares the same environment. Separate calls to a factory create independent environments. Each iteration gets separate storage for range bindings and variables declared inside the loop body. A variable declared once in the loop initializer is instead shared across iterations, so closures capturing that variable see updates to the same storage. Captured storage currently lives until process exit, when the runtime releases its owned values. Raw pointer and buffer captures still borrow their pointees and backing storage.\n\nUse a type alias for arrays of functions, such as `type Callback = func() int;` then `callbacks: Callback[3];`. In `func() int[3]`, the `[3]` is part of the function’s result type: it describes a function returning a three-element integer array. To declare a three-element array of functions, use the `Callback` alias followed by `[3]`. An uninitialized function value panics if called. Function values use an Ocean closure ABI and cannot be passed directly as native C function pointers. Bound method values and calls through interface methods remain unsupported.",
        "after": "The function literal reads `offset` from its surrounding scope. Here `map` calls the function with `1` and `2`, so the returned array contains `4` and `5`, and `main` returns `9`. A later change to a captured variable would be visible to the closure because the capture refers to the variable’s storage.",
        "code": "func map(data array<int>, closure func(int) int) int[] {\n    result := make(int[]);\n    for (i := 0; i < len(data); i++) {\n        result.append(closure(data[i]));\n    }\n    return result;\n}\n\nfunc main() int {\n    offset := 3;\n    values := int[2]{1, 2};\n    mapped := map(values, func(n int) int { return n + offset; });\n    return mapped[0] + mapped[1]; // 9\n}",
        "note": "Captured variables are shared by reference and remain alive until process exit in the current runtime."
      }
    ]
  },
  {
    "slug": "language/packages-and-imports",
    "group": "Language guide",
    "title": "Packages & imports",
    "description": "Organize files, import shared code, and understand visibility and method ownership.",
    "sections": [
      {
        "id": "directories",
        "title": "One directory, one package",
        "text": "Every `.oc` file starts with a package declaration. All Ocean files in a directory must declare the same package. Functions, types, and global variables are shared across those files, including lowercase helpers. Subdirectories are separate packages. Passing a source file to the compiler selects its entire directory. Only a root package named `main` gets an executable entry point.\n\nThe “root package” is the package you select on the command line. Selecting an imported helper package does not automatically build another `main` package elsewhere in the module. A module is the project-wide import namespace; each source directory within it is still a separate package.",
        "code": "package main;\n\nfunc main() int {\n    return answer();\n}\n\n// In helper.oc in the same directory:\n// package main;\n// func answer() int { return 42; }",
        "note": ""
      },
      {
        "id": "layout",
        "title": "Create a module and a package",
        "text": "Run `ocean mod init example.com/app` in your project directory. This creates `ocean.mod`. Save the library below as `greeting/greeting.oc`, and the importing program as `main.oc` in the project root. Run `ocean check .` to validate both packages or `ocean run .` to execute the program.",
        "after": "The module name `example.com/app` becomes the prefix in `\"example.com/app/greeting\"`. Because that package is inside the same module, Ocean resolves it to the local `greeting` directory. Running this example does not require publishing a repository at that address.",
        "code": "// greeting/greeting.oc\npackage greeting;\n\nfunc Message() string {\n    return \"Hello from another package\";\n}\n\n// main.oc\npackage main;\n\nimport \"io\";\nimport \"example.com/app/greeting\";\n\nfunc main() {\n    io.Println(greeting.Message());\n}",
        "note": "",
        "links": [
          {
            "label": "Module dependencies and replacements",
            "href": "/docs/tooling/packages/"
          }
        ]
      },
      {
        "id": "imports",
        "title": "Import paths and aliases",
        "text": "The import path tells Ocean where to find the package directory. The qualifier is the name before a dot in an expression such as `greeting.Message()`. By default, that qualifier comes from the imported source’s `package greeting;` declaration, which need not be the last component of the import path. Module-relative paths such as `\"greeting\"` are also accepted. Standard-library imports such as `\"io\"` resolve under the installed source directory, which `OCEAN_SRC` can override. External modules resolve through the module configuration and Git cache. An `as` alias changes the qualifier for the current file. Each file must declare the imports it uses.",
        "after": "After the `as hello` alias, this file calls the exported function as `hello.Message()`. The alias changes how this file refers to the package; it does not rename the package in its own source or in other importing files.",
        "code": "package main;\n\nimport \"example.com/app/greeting\" as hello;\nimport \"io\";\n\nfunc main() {\n    io.Println(hello.Message());\n}",
        "note": ""
      },
      {
        "id": "visibility",
        "title": "Exports, dot imports, and blank imports",
        "text": "Names beginning with an uppercase letter are exported. Lowercase declarations remain private to their package. This applies to functions, types, globals, receiver methods, interfaces, aliases, and enum types and variants. Extern declarations are file-scoped and are not exported through imports. A dot import introduces exported names without a qualifier; collisions can make a reference ambiguous. A blank import, written with `_`, loads and initializes the package but does not introduce a qualifier or any directly callable names into this file.",
        "code": "import . \"example.com/app/greeting\";\nimport _ \"example.com/app/setup\";\n\n// Inside a function, the dot import allows:\nmessage := Message();",
        "note": "Each example import requires a package at that path. The setup package is illustrative."
      },
      {
        "id": "methods",
        "title": "Methods belong to the defining package",
        "text": "A receiver method must be declared in the package that defines its receiver type. It may be in a different file within that package. You cannot add methods to imported types, including types brought into scope by dot imports or local aliases of imported types. For example, `type Local = imported.Type` is an alias of the imported type and cannot be used to add local methods. `type Local imported.Type` creates a distinct type defined in the current package; methods for that new type may be declared locally.",
        "code": "// In the greeting package:\nstruct Greeting { text string; }\n\nfunc (message Greeting) Text() string {\n    return message.text;\n}",
        "note": "Package-qualified receiver syntax such as `func (x greeting.Message) Extra()` is also rejected by the parser."
      },
      {
        "id": "initialization",
        "title": "Initialization and package errors",
        "text": "Imported packages initialize before their importers. Within a package, files are sorted by filename and globals initialize in declaration order, after all globals have received their type’s default value. If an initializer reads a global whose explicit initializer has not run yet, it can see that default rather than the value assigned later. Import cycles, conflicting package declarations, ambiguous imported names, and access to private declarations are errors.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "Packages, modules, and dependencies",
            "href": "/docs/tooling/packages/"
          }
        ]
      }
    ]
  },
  {
    "slug": "language/strings",
    "group": "Language guide",
    "title": "Strings",
    "description": "Immutable byte strings, explicit formatting, and independent copies.",
    "sections": [
      {
        "id": "string-values",
        "title": "String values",
        "text": "A `string` is an immutable, heap-backed sequence of `i8` bytes. `len(text)` reports the number of bytes in the string and is the usual way to ask for its length. The `.length`, `.capacity`, and `.size` properties currently report that same byte count for a string, but `len(text)` states the intention more clearly. Indexing reads a signed byte and checks bounds. Equality compares all bytes, including embedded NUL bytes.\n\nImmutability applies to the bytes of a string value. You can still assign a new string to a string variable, and `+=` constructs and assigns a concatenation. Neither operation grants permission to mutate the original byte storage through an index. This distinction matters when several variables began with equal text.\n\nStrings compare by content, not by allocation address. Two independently created strings with the same bytes are equal. A byte count is useful for output and storage, but it is not necessarily the number of characters a person sees because a Unicode character can use several UTF-8 bytes, and a visible character can contain more than one Unicode scalar value. For text consisting only of ASCII characters, each character occupies one byte.\n\nStrings also support <, <=, >, and >=. Ordering compares unsigned bytes from left to right. The first differing byte decides the order. If one string is an exact byte prefix of the other, the shorter string comes first. It is case-sensitive, includes embedded NUL bytes, and performs no locale collation or Unicode normalization.",
        "code": "greeting := \"Hello, Ocean!\";\nlength := len(greeting);\nsame := greeting == \"Hello, Ocean!\";\ngreeting += \"\\n\";",
        "note": "",
        "after": "The initial value has thirteen bytes, and `same` is `true`. Appending a newline replaces `greeting` with a new value containing one extra byte. A previous copy of the string would still contain its original text."
      },
      {
        "id": "unicode-and-escapes",
        "title": "Unicode and escapes",
        "text": "Source identifiers support Unicode 16.0 identifier characters. Strings encode Unicode escapes as UTF-8. A character literal represents one Unicode scalar value, rather than one UTF-8 byte. This differs from indexing a string, which reads a byte. Indexing and `range` on a `string` still work on bytes, not user-perceived characters.\n\nA source file is read as UTF-8. Common escapes include `\\n` for a newline, `\\t` for a tab, `\\\"` for a quote, and `\\\\` for a backslash. Unicode escapes specify a scalar value that is encoded into one or more UTF-8 bytes in the resulting string. Invalid UTF-8 and invalid scalar escapes are rejected.\n\nKeep byte operations separate from character operations. For example, indexing a non-ASCII string may read only one byte of a multi-byte encoding. It is not a Unicode character decoder, and a range loop over a string does not change that fact.",
        "code": "text := \"A wave: \\u2248\";\nline := \"first\\nsecond\";\nquote := \"say \\\"hello\\\"\";",
        "note": "",
        "after": "The first string contains the approximately-equal symbol (≈). The second contains an actual newline between two words; it does not contain a literal backslash followed by `n`. The last string contains double quotes around `hello`."
      },
      {
        "id": "mutable-bytes",
        "title": "Mutable bytes",
        "text": "Convert or assign a `string` to `i8[]` to obtain an independent mutable copy. Replacing a `string` allocates a new value; you cannot write its elements or call dynamic array mutation methods on it.\n\nA byte array is the appropriate representation when an algorithm needs to change individual bytes. The conversion from a string gives the array its own storage, so mutations do not affect the source string. Converting the array back to a string also makes an independent value.\n\nThis is useful when preparing writable data for a native API or when performing an explicitly byte-oriented transformation. It does not make arbitrary edits to UTF-8 safe: changing one byte inside a multi-byte sequence can still produce invalid encoded text.",
        "code": "text := \"Ocean\";\nbytes: i8[] = text;\nbytes[0] = 'o';\n// text is still \"Ocean\".",
        "note": "",
        "after": "Only the first byte of `bytes` changes. The original `text` remains `\"Ocean\"`, while the mutable array now contains the bytes for `\"ocean\"`. Both owned values are cleaned up when their scopes end."
      },
      {
        "id": "formatting-output",
        "title": "Formatting output",
        "text": "The `io` package uses `{}` placeholders for template formatting. A template such as `\"Depth: {} meters\"` supplies its own punctuation and spaces. `io.Sprintf` returns `Result<string>`: a formatted string on success, or an error if the placeholder and argument counts differ. `io.Sprint` instead converts values directly to a plain `string`, with no template.\n\nFor direct output, `io.Print` writes converted values and `io.Println` adds a newline. These conversion functions insert a space only between two adjacent non-string arguments. Include spaces explicitly when combining strings and numbers, or use a template with `io.Printf` or `io.Printfln`.\n\nChoose the formatting function according to where the result should go. `io.Printfln` writes formatted text and a newline to standard output. `io.Sprintf` builds a string for later use, which is useful when constructing a message without printing it immediately.\n\nA pair of braces consumes one argument in order. The template supplies punctuation, units, and spacing. This is usually easier to read than assembling a message through several concatenations, especially when the values are numbers or other non-string types.",
        "code": "import \"io\";\n\n// Inside a function:\nio.Printfln(\"Depth: {} meters\", 42);\nmessage := io.Sprintf(\"Hello, {}!\", \"Ocean\").unwrap();",
        "note": "",
        "after": "The printed line is `Depth: 42 meters`. The second call stores `Hello, Ocean!` in `message`; it produces no output by itself. Import `io` at the top of any source file that uses these qualified names."
      }
    ]
  },
  {
    "slug": "language/collections",
    "group": "Language guide",
    "title": "Arrays, maps & buffers",
    "description": "Choose the collection that fits its lifetime, size, and access requirements.",
    "sections": [
      {
        "id": "maps",
        "title": "Hash maps",
        "text": "`map[K]V` maps keys of type `K` to values of type `V`. Literals use `key: value` entries. Uninitialized declarations, `zero(map[K]V)`, and `make(map[K]V)` create empty maps. Indexed writes insert or replace entries. A single-value read such as `value := table[key]` panics if the key does not exist. Use `value, present := table[key]` when absence is an expected outcome: a missing key returns the value type’s zero value and `false`; an existing key returns its stored value and `true`. The boolean reports whether the lookup succeeded. Neither read form inserts an entry. Missing-key panics use the ordinary panic mechanism and can be handled with `defer` and `recover`. `len(table)` counts entries and `delete(table, key)` removes a key if present.\n\nInterfaces can be keys, values, or both. Unlike interface arrays, maps always permit mixed concrete types independently on both sides, with no `mixed` modifier. Each key and value must satisfy its declared interface. Boxed inputs are checked at runtime. Map assignments, arguments, and returns copy owned keys and values recursively. When assigning one map to another, the source and destination must have the same declared key type and the same declared value type. The key type does not have to equal the value type: `map[string]int` is valid. For example, a `map[string]int` cannot be assigned directly to a `map[string]any`, even though an individual integer can be stored in `any`; declare an interface-valued map when constructing it if you need mixed values.\n\nKeys use Ocean equality: strings and aggregates compare contents, pointers compare addresses, and boxed primitive numeric keys use numeric equality. For example, `1` and `1.0` select the same entry in `map[any]V`. Two maps of the same type are equal when they contain the same keys and an equal value for each key. The order in which entries were inserted and the table’s internal bucket capacity do not affect that comparison. Range loops visit a snapshot in unspecified order; one binding receives keys and two receive keys and values. Entry addresses cannot be taken. The type written after `map[K]` is the complete value type. For example, `map[string]int[]` maps strings to dynamic integer arrays, and `map[string]*int` maps strings to integer pointers. To create an array of maps, first declare an alias such as `type Counts = map[string]int;`, then use `Counts[]`.",
        "code": "counts := map[string]int{\"Ocean\": 1};\ncounts[\"Ocean\"] += 1;\ncounts[\"compiler\"] = 3;\nvalue, present := counts[\"missing\"]; // 0, false\nsize := len(counts); // 2\nfor (key, value := range counts) {\n    // key is string; value is int\n}\ndelete(counts, \"compiler\");\n\nitems := map[any]any{1: \"one\", \"two\": 2, true: false};",
        "note": "Maps are built into the language and require no import or build configuration. Maps do not expose array mutation methods, .data, or capacity.",
        "after": "Both the key side and value side of `items` contain different concrete types. This is the default behavior of interface maps."
      },
      {
        "id": "three-collection-forms",
        "title": "Three collection forms",
        "text": "`T[]` is a heap-backed dynamic array, `T[n]` is a sized array value, and `buffer<T>[n]` is raw contiguous storage. `array<T>` accepts sized arrays of any length. Ordinary array indexing checks bounds; raw buffer indexing is unchecked.\n\nStart with a dynamic array when your collection needs to grow or shrink. Use a sized array when the value has a particular extent or when you want to pass a sized value through `array<T>`. Raw buffers are lower-level storage views and are mainly useful when an interface requires contiguous memory without Ocean’s ordinary array checks.\n\nThe three forms in the example below are sequential collections: positions are integer indices. Maps use keys of a declared type instead, as described above. Each sequential form specifies an element type. A literal body gives the initial elements, and an explicit declaration selects which collection representation receives them. The similar-looking syntax is worth reading carefully: a bracketed length in a declaration is different from a bare allocation expression.",
        "code": "dynamic := int[]{1, 2, 3};\nfixed: int[3] = {1, 2, 3};\nraw: buffer<int>[3] = {1, 2, 3};",
        "note": "The expression int[count] without a literal body creates a dynamic array for compatibility. Use a typed declaration or int[3]{...} when you want a sized array.",
        "after": "The three declarations contain the same integer elements, but their permitted operations and storage behavior differ. `dynamic` supports mutation methods such as `append`; `fixed` has a length in its type; `raw` permits unchecked indexed access.",
        "table": {
          "headers": [
            "Form",
            "Typical use"
          ],
          "rows": [
            [
              "`T[]`",
              "A dynamic collection that can grow or shrink"
            ],
            [
              "`T[n]`",
              "An array value with a length in its type"
            ],
            [
              "`array<T>`",
              "A parameter or result accepting sized arrays of different lengths"
            ],
            [
              "`buffer<T>[n]`",
              "Raw storage with a length known in the declaring scope"
            ],
            [
              "`buffer<T>[]`",
              "A raw memory view; pass the element count separately"
            ]
          ]
        }
      },
      {
        "id": "grow-and-remove",
        "title": "Grow and remove",
        "text": "Dynamic arrays own their payload. `append` adds at the end, `prepend` adds at the beginning, and `add` inserts at an index. `remove` returns the removed element and shifts later values left. `pop` removes and returns the last element.\n\nInsertion methods take values compatible with the element type. `append` and `prepend` can accept several values, and `add(index, ...)` inserts before the element currently at that index. These operations can replace the backing allocation as the collection grows.\n\n`remove` and `pop` return a value that remains valid after the array changes. The removed value follows Ocean’s independent-copy rules. Nested owned data remains independently owned, so removing a string does not leave the result referring to freed collection storage. Invalid removal indices and popping an empty collection report a bounds error.",
        "code": "items := make(int[]);\nitems.append(2, 3);\nitems.prepend(1);\nitems.add(1, 8);\nlast := items.pop();\nremoved := items.remove(0);",
        "note": "",
        "after": "The array becomes `[2, 3]`, then `[1, 2, 3]`, then `[1, 8, 2, 3]`. `pop()` returns `3`; `remove(0)` then returns `1`, leaving `[8, 2]`. `make(int[])` starts with an empty dynamic array."
      },
      {
        "id": "copy-and-concatenate",
        "title": "Copy and concatenate",
        "text": "Array assignment, argument passing, and return create independent copies, including strings and other arrays stored inside the elements. If an element is a pointer, only its address is copied, so both arrays still refer to the same pointed-to object. For arrays, `+` constructs a concatenated value and `+=` assigns that new value back to the variable on the left. These concatenation operators are not map operations.\n\nValue semantics mean that ordinary assignment does not create two names for the same mutable payload. The compiler recursively copies owned collection contents, including dynamic arrays nested inside other arrays or structs. Explicit pointers are the exception: their address values are copied, so their pointees remain shared.\n\nConcatenation follows the same copy rules. `first + second` produces a new collection without altering either input. Compound addition assigns that new result back to the variable on the left. You can also add a compatible single element at either end.",
        "code": "first := int[]{1, 2};\ncopy := first;\ncopy[0] = 99;           // first[0] remains 1\njoined := first + int[]{3, 4};\nfirst += 5;",
        "note": "",
        "after": "Changing `copy[0]` leaves `first[0]` equal to `1`. `joined` receives `[1, 2, 3, 4]`, and `first += 5` replaces `first` with `[1, 2, 5]`. None of those operations changes `copy` afterward."
      },
      {
        "id": "checked-access",
        "title": "Checked access and sized arrays",
        "text": "For arrays and strings, indexing with two bindings, such as `value, ok := values[index];`, returns an element and a boolean. If the index is outside the array, this form returns the element type’s default value and `false`. A single-binding read such as `value := values[index];` instead reports a runtime bounds error for that invalid index. `array<T>` preserves runtime length when passing sized arrays. A dynamic array’s `.array()` method makes an independent sized-array copy.\n\nUse the two-binding form when absence is an expected outcome you want to handle in the program. The success flag distinguishes a real zero-valued element from a failed lookup that also yields zero.\n\nAn `array<int>` parameter accepts sized integer arrays of different lengths while preserving their runtime extent. The length remains available through `len(values)`, but is not fixed by the parameter’s declared type. `array<int>` describes a sized array of any length; `int[]` describes a growable dynamic array. They are different types. To supply a dynamic array’s current elements, call its `.array()` method to make a sized-array copy.",
        "code": "func first(values array<int>) (int, bool) {\n    value, ok := values[0];\n    return value, ok;\n}",
        "note": "",
        "after": "Calling `first` with a nonempty sized array returns its first element and `true`. An empty sized array gives `0` and `false`. The caller should use the flag to decide whether the value represents an actual element."
      },
      {
        "id": "raw-storage",
        "title": "Raw storage",
        "text": "Use `buffer<T>[]` for an unsized raw view. Buffers do not provide ordinary bounds checks, and a raw buffer parameter does not retain a length recorded by the caller’s declaration. Pass the number of valid elements as a separate argument. Sized buffer declarations pad omitted literal elements with `zero` values.\n\nAn unsized buffer is a view of raw memory. Passing one to a function shares that memory instead of granting the function an independent length-aware collection. The separate count is part of the function’s contract: it must not exceed the valid memory available through the view.\n\nThis representation is useful for C interfaces and small low-level routines. It also removes checks that an ordinary array would provide, so keep the pointer and count together in the surrounding code. For example, the declaration `data: buffer<int>[8];` makes the length eight available in the declaring scope. Passing `data` to a `buffer<int>[]` parameter does not make that length available inside the called function.",
        "code": "func fill(data buffer<int>[], count int) {\n    for (i := 0; i < count; i++) {\n        data[i] = i;\n    }\n}",
        "note": "",
        "after": "The function writes increasing integers into the first `count` elements. It assumes all those positions are valid. Use an array parameter instead when the function should receive a checked value with an available length."
      }
    ]
  },
  {
    "slug": "language/types",
    "group": "Language guide",
    "title": "Structs & named types",
    "description": "Model data with value types, methods, and deliberate type identities.",
    "sections": [
      {
        "id": "struct-values",
        "title": "Struct values",
        "text": "Fields use name type ordering. Struct literals can initialize fields positionally or by name. Struct assignment copies the fields, including owned nested values. Explicit pointers preserve shared references.\n\nA struct groups named fields into one value. Each field has its own type, and field access uses a dot, such as `point.x`. The type declaration describes the layout; a struct literal constructs a value using that description. A function can return the struct just as it returns an integer or string.\n\nPositional literals follow field declaration order. Keyed literals name the fields they initialize and are useful when a struct has several similar-looking values. Omitted fields receive defaults. Assigning a struct to another variable creates a separate struct value. Owned fields such as strings, arrays, and maps are copied recursively. A pointer field copies its address, so its target remains shared.",
        "code": "struct Point {\n    x float;\n    y float;\n}\n\nfunc origin() Point {\n    return Point{0.0, 0.0};\n}",
        "note": "",
        "after": "The returned `Point` has both coordinates set to `0.0`. A caller can store it with `point := origin();` and update `point.x`. Assigning it to another variable makes a separate struct value, so changing a coordinate in that copy does not change `point`."
      },
      {
        "id": "methods",
        "title": "Methods",
        "text": "Declare methods in the package that defines the receiver type; imported types and aliases of them cannot receive new methods. Place a receiver before the method name. A value receiver works on a copy; a pointer receiver can update the original. When a value stored in a variable calls a pointer-receiver method, Ocean can pass the variable’s address automatically. “Addressable” means the expression refers to storage whose address can be taken; a temporary result is not automatically such storage.\n\nThe receiver gives a method access to the value on which it was called. A value receiver is suitable for reading fields or computing a result. A pointer receiver is appropriate when the method needs to modify the original stored fields. The distinction appears directly in the receiver’s type.\n\nAutomatic borrowing makes an addressable variable convenient to call without hiding the declaration’s behavior: `counter.Increment()` still invokes a pointer receiver. A value receiver copies its struct even when the call is made through a pointer.",
        "code": "struct Counter { value int; }\n\nfunc (counter *Counter) Increment() {\n    counter.value++;\n}\n\nfunc (counter Counter) Value() int {\n    return counter.value;\n}",
        "note": "",
        "after": "For `counter := Counter{0};`, calling `counter.Increment();` updates the field to one. Calling `counter.Value()` returns that integer. Methods are associated with their declared types; they are not separate fields storing callable function values."
      },
      {
        "id": "definitions-and-aliases",
        "title": "Definitions and aliases",
        "text": "`type Name Existing` creates a distinct type with the same underlying storage layout. `type Name = Existing` creates another name for exactly the same type. Distinct definitions require explicit casts when converting to or from their underlying type.\n\nA defined type is useful when two values have the same machine representation but mean different things. A user identifier can use integer storage while remaining distinct from an ordinary count. That distinction participates in assignments, function signatures, and generic type checking.\n\nAn alias is useful for another spelling of an existing type, such as a shorter name at a package boundary. It does not create a new conversion requirement. Defined types can declare their own methods; aliases use the method set of their target.",
        "code": "type UserID int;\ntype AccountID = UserID;\n\n// Inside a function:\nid := 42 -> UserID;\nalias: AccountID = id;\nnumber := id -> int;",
        "note": "",
        "after": "Here, `AccountID` and `UserID` refer to the same type, so assigning `id` to `alias` is direct. `UserID` and `int` have distinct identities, so the example uses arrow casts to cross that boundary. The underlying integer representation remains the same."
      },
      {
        "id": "value-parameters",
        "title": "Value parameters",
        "text": "A struct can carry immutable value parameters before its ordinary fields. They are stored as the first fields, ahead of the fields written in the struct body. The initializer supplies them once, and they cannot be reassigned afterward. They are distinct from compile-time generic type arguments.\n\nValue parameters become stored fields, with names and types, before the fields in the struct body. They can record configuration that is chosen at initialization and should remain unchanged for that value’s lifetime. Their immutability applies to those bindings, including attempts to take a mutable address of them.\n\nGeneric type parameters instead choose types during specialization, as in `Box<int>`. Value parameters do not turn each parameter value into a separately specialized type. Read the initializer in field order: immutable parameter fields first, then ordinary fields.",
        "code": "struct Sample(tag int) {\n    value float;\n}\n\n// Inside a function:\nsample := Sample{7, 3.5};\nsample.value = 4.0;\n// sample.tag is immutable.",
        "note": "",
        "after": "The literal initializes `tag` to `7` and `value` to `3.5`. Updating `sample.value` is allowed because it is an ordinary mutable field. Assigning another number to `sample.tag` is rejected by the frontend."
      }
    ]
  },
  {
    "slug": "language/enums",
    "group": "Language guide",
    "title": "Enums & matching",
    "description": "Construct tagged enum values, extract immutable payloads, and match variants.",
    "sections": [
      {
        "id": "declare-variants",
        "title": "Declare and construct variants",
        "text": "An enum defines a type whose value holds exactly one of its named alternatives, called variants. A variant may carry no data, an ordered list of values (a tuple payload), or named fields (a record payload). Variant names belong to the enum. Tuple construction uses parentheses; record construction uses braces with positional values or named fields. Payload fields are immutable. Uppercase enum and variant names are exported to other packages.",
        "code": "enum GuiEvent {\n    GuiLoad,\n    KeyPress(i8),\n    Click{x, y i8},\n}\n\nfunc main() {\n    load := GuiEvent.GuiLoad;\n    key := GuiEvent.KeyPress(65);\n    click := GuiEvent.Click{x: 2, y: 3};\n}",
        "note": "Two separately declared enum types remain different types. A value of one cannot be assigned to the other merely because both declare a variant with the same name and the same payload fields."
      },
      {
        "id": "extract-payload",
        "title": "Test and extract a payload",
        "text": "Compare an enum value with a qualified variant name, such as `event == GuiEvent.KeyPress`, to test which variant it holds. This test does not compare the payload data. Extract data with value.(Enum.Variant). A tuple yields its positional values; use multiple assignment for multiple elements and _ to discard positions. A record yields a record with immutable fields. An extraction traps if the value holds a different variant.\n\nComparing two constructed enum values compares their tags and payloads recursively. A comparison with a qualified variant selector still tests only the tag.",
        "code": "func keyCode(event GuiEvent) i8 {\n    if (event == GuiEvent.KeyPress) {\n        key := event.(GuiEvent.KeyPress);\n        return key;\n    }\n    return 0;\n}",
        "note": "`GuiEvent.KeyPress` alone can be used to test for that variant, but storing a key-press value requires its payload: for example, `GuiEvent.KeyPress(65)`."
      },
      {
        "id": "match-variants",
        "title": "Match variants",
        "text": "match evaluates its enum subject once and executes the matching arm. Tuple bindings follow payload order. A record pattern chooses fields by name and may omit fields it does not need. In an alias such as `clickX = x`, the name on the left is the new local binding and the name on the right is the payload field to read. Each arm has its own scope. The compiler warns when variants are missing; an arm naming the enum type supplies a default. Use `match` to choose among enum variants. A type-guard switch chooses among concrete types stored in interfaces and is not a replacement for matching an enum.",
        "code": "func position(event GuiEvent) int {\n    match (event) {\n        GuiEvent.GuiLoad => return 0;\n        GuiEvent.KeyPress(_) => return 1;\n        GuiEvent.Click{clickX = x, clickY = y} => {\n            return clickX->int + clickY->int;\n        }\n    }\n    return 0;\n}",
        "note": "Use GuiEvent => statement; for a default arm. Tuple patterns must include every position; use _ for omitted values."
      },
      {
        "id": "extract-named-fields",
        "title": "Extract named fields",
        "text": "A named record extraction can select only the fields you need. The names on the left of the declaration or assignment match the binding names in the pattern, so field order does not matter. An alias gives a field a different local name.",
        "after": "In the first extraction, local `x` receives payload field `x` and local `y` receives field `y`, even though the pattern lists `y` first. In the second, `clickX = x` gives field `x` the local name `clickX`. The aliases describe field-to-binding relationships, not positional pairing.",
        "code": "func clickX(event GuiEvent) int {\n    if (event == GuiEvent.Click) {\n        x, y := event.(GuiEvent.Click{y, x});\n        clickX, clickY := event.(GuiEvent.Click{clickY = y, clickX = x});\n        return x->int + clickX->int;\n    }\n    return 0;\n}",
        "note": ""
      },
      {
        "id": "fixed-payload-variants",
        "title": "Fixed payload variants",
        "text": "A variant can define a fixed payload with := and an inferred type, or with : Type = and an explicit type. Accessing that variant constructs a value carrying the payload. For example, `Number.One` is a value of enum type `Number` carrying the integer payload `1`; it is not an ordinary `int`. The variant name remains part of the enum value’s identity even if another variant carries the same data.",
        "code": "struct RGB { r, g, b int; }\nenum Color {\n    Red: RGB = {255, 0, 0},\n    Green: RGB = {0, 255, 0},\n    Blue := RGB{0, 0, 255},\n    Other(RGB),\n}\nenum Number { One := 1, Two := 2, Other(int) }",
        "note": ""
      },
      {
        "id": "methods",
        "title": "Enum methods",
        "text": "Enums support value and pointer receiver methods. Generic receiver arguments bind the enum's type parameters; methods may also declare their own explicit type parameters. Value receivers copy the enum, while pointer receivers can replace an addressable enum value. Declare methods in the package that defines the enum. Method names cannot collide with any variant name or named payload field.",
        "code": "func (r Result<T>) unwrap() T {\n    match (r) {\n        Result.value(v) => return v;\n        Result.error(msg) => return panic msg;\n    }\n    return zero(T);\n}\n\n// result := Result<int>.value(42);\n// value := result.unwrap();",
        "note": "Only actual variants can appear in match patterns. Result.unwrap(v) is neither a variant constructor nor a valid tuple pattern."
      },
      {
        "id": "generic-enums",
        "title": "Generic enums",
        "text": "Enums accept type parameters and constraints, using the same syntax as structs. Specify arguments when constructing a value, such as Result<int>.value(42). Supplying type arguments chooses a concrete version of the generic enum, called a specialization. `Result<int>` carries integer successes and `Result<string>` carries string successes. They are different types, so a variable declared as one cannot receive a value of the other. Payloads may use type parameters in tuple and record fields, and enums may be nested or passed through generic functions.",
        "code": "enum Result<T> {\n    value(T),\n    error(string),\n}\n\nfunc unwrap<T>(result Result<T>, fallback T) T {\n    match (result) {\n        Result.value(v) => return v;\n        Result.error(_) => return fallback;\n    }\n    return fallback;\n}\n\nfunc main() int {\n    result := Result<int>.value(42);\n    value := result.(Result<int>.value);\n    return unwrap<int>(result, 0);\n}",
        "note": "When inspecting an existing enum value, an extraction or match pattern may omit type arguments: `result.(Result.value)` and `Result.value(v)` use the arguments already carried by `result`’s type. If the pattern writes explicit arguments, they must agree with those of the inspected value. Constructing a new enum value has no source value from which to obtain those arguments, so write them explicitly, as in `Result<int>.value(42)`. Enum declarations and specializations require angle brackets, such as Result<T> and Result<int>. Constraints such as enum Counter<T ~int> restrict specializations."
      },
      {
        "id": "builtin-result",
        "title": "Built-in Result<T>",
        "text": "Result<T> is available without imports or standard-library files. It is the compiler-owned equivalent of enum Result<T> { value(T), error(string) }. The built-in `value` and `error` variants, and its lowercase helper methods such as `unwrap`, are available to every package. This is a specific property of the compiler-provided `Result`; user-defined lowercase declarations still follow normal package privacy rules.\n\nConstruct Result<int>.value(42) or Result<int>.error(\"invalid number\"). Normal comparisons, extraction and match work with these variants. A user-declared Result may shadow the name and remains a distinct type. Payloads and fallbacks retain ordinary value ownership.",
        "code": "func main() int {\n    success := Result<int>.value(42);\n    failure := Result<int>.error(\"invalid number\");\n    if (failure.unwrapOrZero() != 0) return 1;\n    return success.unwrap() + failure.unwrapOrElse(0);\n}",
        "note": "",
        "table": {
          "headers": [
            "Method",
            "value case",
            "error case"
          ],
          "rows": [
            [
              "`unwrap() T`",
              "Return payload",
              "Return a panic with the stored error string, attributed to caller"
            ],
            [
              "`unwrapOrElse(fallback T) T`",
              "Return payload",
              "Return provided fallback value"
            ],
            [
              "`unwrapOrZero() T`",
              "Return payload",
              "Return zero(T)"
            ]
          ]
        }
      },
      {
        "id": "result-fallbacks",
        "title": "Fallback evaluation and zero values",
        "text": "`unwrapOrElse` takes an already evaluated fallback value, not a function to call later. For example, `result.unwrapOrElse(computeFallback())` calls `computeFallback()` even when `result` contains a successful value. Use an explicit `match` if computing the fallback should happen only on error. unwrapOrZero follows the existing zero(T) semantics; a pointer zero is a zero address and remains distinct from explicit null.\n\nBuilt-in methods appear in editor completion and hover. Their compiler-owned declarations cannot be renamed and do not navigate to a physical source file.",
        "code": "",
        "note": ""
      }
    ]
  },

  {
    "slug": "language/generics",
    "group": "Language guide",
    "title": "Generics & interfaces",
    "description": "Reusable types and functions with explicit specialization and type constraints.",
    "sections": [
      {
        "id": "type-parameters",
        "title": "Type parameters",
        "text": "Generic declarations accept type parameters in angle brackets. An omitted constraint defaults to `any`. Calls require explicit type arguments: Ocean does not currently infer generic function arguments. Each concrete set of type arguments selects a version of the declaration with those types substituted. This concrete version is called a specialization; for example, `Box<int>` uses `int` wherever the declaration uses `T`.\n\nA type parameter lets one declaration describe several concrete functions or data layouts. Inside `Box<T>`, the field’s type is whichever concrete type was supplied for `T`. A generic function uses the same idea in its parameters and result. The compiler specializes concrete uses rather than requiring the caller to pass a runtime type descriptor for an ordinary concrete struct.\n\n`any` is the default constraint when no narrower requirement is written. A constraint limits which types are accepted. Type parameters are not values: for example, `zero(T)` constructs a default value of the selected type.",
        "code": "struct Box<T> { value T; }\n\nfunc identity<T>(value T) T {\n    return value;\n}\n\n// Inside a function:\nbox := Box<int>{42};\nanswer := identity<int>(box.value);",
        "note": "",
        "after": "The struct literal produces a `Box<int>` with an integer field. `identity<int>` then accepts that integer and returns an integer. Write the call’s type arguments explicitly even when their intended types look obvious from the value arguments."
      },
      {
        "id": "type-lists",
        "title": "Method interfaces and type lists",
        "text": "An interface contains either method signatures or one list of types separated by |. Method receivers are implied, parameter names are optional, and methods can have their own generic type parameters. The func keyword is optional on interface method signatures. A type-list interface may omit its final semicolon.\n\nAn exact type list such as `int | float` accepts `int`, `float`, and aliases of either type. It does not accept a distinct defined type merely because that type uses integer storage. For example, `type ID int;` declares a new type; `~int` accepts both `int` and defined types whose underlying type is `int`, including `ID`. The narrower types `i8` and `i32` have different underlying storage types and are not included by `~int`.\n\nType lists also work directly in function parameter lists. Equality (== and !=) is available on every generic type parameter, including unconstrained T. Other operators on generic and interface operands require every possible type to support them. Numeric int | float lists support arithmetic and comparisons; integer-only operators require integer-only lists. In `add<T Number>(x, y T)`, both arguments are checked against the one concrete type chosen for `T`. In `sum(x, y int | float)`, each argument is an independent interface value: one may hold an `int` while the other holds a `float`. An operator used on those independent values must work for every permitted combination of their types.",
        "code": "interface Arithmetic {\n    func add(int) int;\n    func subtract(other int) int;\n    func multiply<T int | float>(T) float;\n}\ninterface Number { int | float }\ninterface Integer { ~int }\n\nfunc add<T Number>(x, y T) T { return x + y; }\nfunc sum(x, y int | float) int | float { return x + y; }",
        "note": "Smaller numeric value arguments can widen to an accepted parameter type, such as i8 to int in multiply<int>. This does not make i8 an exact member of int | float. Generic method implementations must match the required constraints and signature. Calls still require explicit generic type arguments.",
        "after": "Use type lists to describe the types allowed by a constraint. Older operator-requirement syntax and membership forms such as `-Type`, `+Type`, and `=Type` are not the current syntax. Interfaces cannot mix methods with type-list terms. Use named receiver methods for custom struct operations; struct operator overloading is unsupported. Calls through boxed method interfaces still require narrowing to a concrete type first."
      },
      {
        "id": "generic-methods",
        "title": "Generic methods",
        "text": "Receiver arguments bind the struct’s type parameters. A method may introduce separate generic parameters after its name; pass those arguments explicitly at the call.\n\nThe receiver `Box<T>` introduces the struct’s type parameter to the method’s signature and body. You do not declare it again after the method name. A second parameter such as `U` belongs to the method itself, so it is declared after the method name and must have a different name.\n\nThis allows a method to combine a value stored in the receiver with a separately typed argument. Its result signature can refer to both parameters. Each concrete receiver and method argument combination gets its own specialization.",
        "code": "func (box Box<T>) Pair<U>(other U) (T, U) {\n    return box.value, other;\n}\n\n// Inside a function:\nbox := Box<int>{3};\nnumber, flag := box.Pair<bool>(true);",
        "note": "",
        "after": "With `Box<int>` as the receiver and `<bool>` at the call, the result types are `(int, bool)`. The bindings receive `3` and `true`. Method type arguments are explicit, just like direct generic function type arguments."
      },
      {
        "id": "interfaces-and-arrays",
        "title": "Interfaces and mixed arrays",
        "text": "Method interfaces describe required method signatures. `T[]` is homogeneous, even when `T` is an interface: elements share a concrete type. `mixed T[]` permits multiple concrete types satisfying the interface. `any` is the empty interface.\n\nAn interface specifies method names and exact signatures that a concrete type must satisfy. If a required method is implemented only with a pointer receiver, a pointer to that concrete type satisfies the interface; a non-pointer value of the type does not gain that method merely from automatic borrowing at a direct method call. `any` has no method requirements, so it can hold a boxed value of any supported concrete type.\n\nAn interface bound does not by itself make an array heterogeneous. For example, `any[]{1, 2}` is homogeneous because both elements are integers, but `any[]{1, \"two\"}` is rejected because it combines an integer and a string. Use `mixed any[]{1, \"two\"}` for that mixture. Adding `mixed` permits different concrete element types, provided each one satisfies the interface bound. This distinction is checked both statically where possible and at runtime for boxed conversions and writes.\n\nMaps use a different rule: an interface in either `map[K]V` position always permits mixed concrete types on that side. Thus `map[any]any{1: \"one\", \"two\": 2}` needs no `mixed` keyword. Every key and value must still satisfy its own declared interface constraint.",
        "code": "interface Value { Get() int; }\nstruct Reading { value int; }\nfunc (r Reading) Get() int { return r.value; }\n\n// Inside a function:\nitems := mixed any[]{42, \"Ocean\", true};",
        "note": "Calls through interface methods are not implemented. Narrow a boxed value to a concrete type before invoking methods.",
        "after": "The `Reading` type satisfies `Value` through its `Get` method. The separate `mixed any[]` literal can contain an integer, a string, and a boolean together. To call a method on an interface value with the current backend, first narrow the value to an appropriate concrete type."
      },
      {
        "id": "type-switch",
        "title": "Narrow with a type switch",
        "text": "A type-guard switch inspects concrete identity. Put specific cases before broad family cases. `Box` matches any specialization; `Box<int>` matches its integer specialization. In a case naming one specific type, the case-local variable is checked as that type, allowing operations such as reading the concrete type’s fields.\n\nA broad generic family name can describe several specializations when used as a constraint. For example, a parameter declared as `Box` can receive both `Box<int>` and `Box<bool>`. The actual concrete identity is retained so a type switch can distinguish them.\n\nInside a single-type case, the case binding has that case’s type constraint. This permits concrete field operations after narrowing. A family case such as `case Box:` says only that the value is some `Box` specialization; it does not choose a field type for `T`. Use a more specific case such as `case Box<int>:` before reading or operating on fields that depend on `T`.",
        "code": "func inspect(box Box) int {\n    switch (item := box.(type)) {\n    case Box<int>:\n        return item.value;\n    case Box:\n        return 0;\n    default:\n        return -1;\n    }\n}",
        "note": "",
        "after": "An integer box reaches the first branch, where `item.value` has type `int`. Another box specialization reaches the family branch and returns zero. The more specific case must come first because cases are considered in source order."
      },
      {
        "id": "current-boundaries",
        "title": "Current boundaries",
        "text": "Struct operator overloading is not supported. Define named receiver methods for custom struct operations. Generic functions require explicit type arguments before use as values. Type argument inference and values made by extracting a method from its receiver, such as `counter.Increment` are not implemented by the backend. Parser acceptance alone does not guarantee executable support. Use `ocean check` to validate the complete path through native linking.\n\nSeparate the syntax accepted by the parser from operations that the native backend can actually compile. An unsupported construct can parse successfully and then fail during checking or code generation. `ocean check` exercises the full compilation path without executing the program, which is the most useful validation when experimenting with a feature.\n\nFor current code, prefer direct calls, concrete specializations, and explicit type switches. Do not assume that an interface declaration implies dynamic method dispatch, or that a generic declaration implies inferred call-site type arguments. These are distinct capabilities with separate implementation requirements.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/memory",
    "group": "Language guide",
    "title": "Memory & pointers",
    "description": "Automatic cleanup for owned values, explicit lifetimes for heap pointers.",
    "sections": [
      {
        "id": "scope-cleanup",
        "title": "Owned values clean up at scope exit",
        "text": "Strings, dynamic arrays, and maps own the memory used for their contents. Ordinary locals, parameters, results, nested owned fields, and temporaries release storage as their scopes end, including early returns and loop exits. This cleanup is emitted into the generated LLVM control flow; there is no garbage collector or reference counting.\n\nOwnership describes which value is responsible for releasing an allocation. Ordinary string, dynamic-array, and map values have that responsibility for their contents. Assignment and parameter passing make independent copies, including owned values nested inside collections or structs. A copied string therefore does not depend on the lifetime of the source variable.\n\nScope cleanup is part of generated control flow. It runs when the scope is left through an ordinary end, an early return, or a loop exit. Returning an owned value copies it before the function’s local cleanup, so the returned result remains valid.",
        "code": "func example() {\n    items := int[]{1, 2, 3};\n    text := \"Ocean\";\n    // Owned storage is released when this scope ends.\n}",
        "note": "",
        "after": "No explicit `free` is needed for the two locals in `example`. This automatic cleanup covers their owned allocations, not arbitrary heap objects reached through pointer fields. Pointer ownership follows a different rule described below."
      },
      {
        "id": "explicit-heap-allocations",
        "title": "Explicit heap allocations",
        "text": "`new(T)` allocates zeroed heap memory, initializes the value to `zero(T)`, and returns `*T`. Pointer variables are non-owning: scope exit does not release their pointees. Call `free(pointer)` when the allocation is no longer needed.\n\nUse `new(T)` when an object needs a heap allocation whose lifetime you will manage explicitly. The returned pointer identifies that allocation; copying the pointer does not create a second object and does not create a second owner. Keep track of which part of your program is responsible for freeing it.\n\n`free(pointer)` releases the allocation created by `new(T)`, along with owned strings, arrays, and maps stored inside the allocated value. It does not recursively follow pointer fields. This prevents the compiler from guessing whether another pointer target is shared, but means that linked allocations need their own cleanup plan.",
        "code": "pointer := new(int);\n*pointer = 42;\nfree(pointer);",
        "note": "Use `free` for allocations you created with `new`. Taking `&local` does not allocate a new object, so its borrowed address must not be freed. Freeing an allocation does not invalidate other copies of its address automatically; you must stop using every such pointer.",
        "after": "The allocation starts with an integer value of zero, is updated to `42`, and is then released. After `free(pointer)`, neither that pointer nor another copy of its address should be dereferenced. Simply leaving the pointer variable’s scope would not release the allocation."
      },
      {
        "id": "addresses-and-sharing",
        "title": "Addresses and sharing",
        "text": "&value takes an address; *pointer accesses its pointee. Pointer copies share the same object. Passing an array by value instead makes an independent deep copy. `free(value)` can release a string or dynamic array’s owned storage before scope exit; the compiler then avoids freeing that storage a second time. Re-create the collection before using it again. This is separate from `free(pointer)`, which releases an explicitly allocated pointee.\n\nTaking an address is a way to borrow access to an existing object without making another object. The borrowed pointer is valid only while the original storage is valid. A pointer to a local variable must not be retained for use after that variable’s lifetime ends.\n\nIn a signature, `*int` means a pointer to an integer. In an expression, `*value` dereferences a pointer. These related uses of the asterisk are distinguished by context. A pointer parameter lets a function deliberately modify its caller’s storage instead of only a copied argument.",
        "code": "func reset(value *int) {\n    *value = 0;\n}\n\n// Inside a function:\ncount := 7;\nreset(&count);",
        "note": "",
        "after": "The call supplies the address of `count`, so the assignment in `reset` changes `count` itself to zero. There is no heap allocation here and no call to `free`: the variable’s ordinary lexical lifetime owns its storage."
      },
      {
        "id": "explicit-null",
        "title": "Null is explicit",
        "text": "Ocean’s `null` is pointer-only and uses a reserved marker. It differs from the zero address stored in a default-initialized Ocean pointer or returned as a null pointer by a C API. Always initialize an optional link explicitly to `null`. Dereferencing explicit `null` traps.\n\nThis is an important Ocean-specific distinction. An uninitialized pointer receives a zero-address default, and `zero(*T)` constructs that same default. Explicit `null` is a separate reserved marker used for pointer-only absence. Testing for one does not test for the other.\n\nChoose and initialize the representation your code expects. For linked structures whose terminator is checked with `== null`, write `null` into every terminating link explicitly. At a C boundary, an address returned as a C null pointer is a zero address instead, so compare it against `zero(*T)` for the appropriate pointer type, such as `zero(*void)` for a C `void*` result.",
        "code": "struct Node {\n    value int;\n    next *Node;\n}\n\n// Inside a function:\nnext: *Node = null;\nif (next == null) {\n    // No next node.\n}",
        "note": "",
        "after": "The explicit initializer makes the condition true. Omitting `= null` would produce a different default value. Neither explicit null nor a zero-address pointer refers to a valid object that can be dereferenced."
      },
      {
        "id": "storage-layout",
        "title": "Storage layout",
        "text": "`sizeof(Type)` returns storage size including alignment and padding. `sizeof(value)` inspects the type without evaluating the expression. Avoid relying on the internal layout of dynamic arrays or parameterized struct array fields at a C boundary. For arrays and strings, pass their `.data` buffer and a count instead. Maps have no `.data` view and should be converted to a representation required by the native API before crossing that boundary.\n\nThe size of a type includes any padding and alignment required by its target layout. `sizeof(value)` uses the type of the expression in parentheses without evaluating that expression; an increment or call written inside it does not run. The result is a storage measurement, not a count of collection elements.\n\nFor collections, use `len` when you mean the number of elements. A sized array includes its size header in its storage layout, while a dynamic array has a header and separately allocated payload. The compiler’s internal representation is not automatically a C-compatible structure definition.\n\nWhen passing data to C, prefer an explicitly declared buffer pointer and count. In particular, dynamic-array headers and parameterized struct array fields have implementation-specific lowering that should not be used as an assumed native ABI.",
        "code": "",
        "note": ""
      },
      {
        "id": "closure-capture-lifetime",
        "title": "Captured variable lifetime",
        "text": "Function literals share captured variables with their lexical surroundings and sibling closures. A returned closure keeps its captures available after the creating call returns. Copying a function value shares its environment.\n\nThe current runtime retains captured cells and closure environments until process exit, then releases their owned contents and backing storage. Programs that repeatedly create escaping closures can therefore retain memory until shutdown. Raw pointer and buffer captures retain their usual borrowing rules; a captured pointer does not extend its pointee’s lifetime.",
        "after": "`counter(3)` returns a function that keeps access to the `start` variable from that call. Calling the returned function twice produces `4` and `5`. Copying that function value shares the same `start`; calling `counter(3)` a second time creates a separate counter.",
        "code": "func counter(start int) func() int {\n    return func() int {\n        start++;\n        return start;\n    };\n}",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/errors",
    "group": "Language guide",
    "title": "Errors",
    "description": "Schedule deferred cleanup, recover panics, and forward failures to callers.",
    "sections": [
      {
        "id": "panic-diagnostics",
        "title": "Panic diagnostics",
        "text": "`panic` accepts a `string` expression and interrupts normal execution. Ocean then unwinds the call stack: it runs the relevant deferred calls while passing the panic outward through callers. Deferred calls run before the panic propagates to callers. If no deferred function recovers it, execution stops with status 1 and a report containing a source excerpt and call trace.\n\n`return panic` skips the current function’s deferred calls and attributes the failure to its immediate caller, or to the statement itself when used in `main`. A caller that does not forward the panic runs its deferred calls and can recover it. For a routine failure the caller is expected to handle, return a status or `Result<T>` instead of interrupting execution with a panic.",
        "code": "func requirePositive(value int) int {\n    if (value <= 0) return panic \"expected a positive number\";\n    return value;\n}",
        "note": "",
        "after": "A call such as `requirePositive(-1)` fails at that call site with the message `expected a positive number`. Source excerpts are embedded in the executable, so the runtime report does not depend on finding the original file on disk."
      },
      {
        "id": "panic-forwarding",
        "title": "Forward panic diagnostics",
        "text": "Use `forward panic <statement>` in a wrapper to report a returned panic at the wrapper’s caller. The statement can be a single statement or a block. A single statement keeps its usual semicolon; a block needs no trailing semicolon.\n\nForwarding applies only to a failure created by `return panic \"message\";`. The `return` in that form is part of Ocean’s panic-reporting behavior, not a normal returned error value. An ordinary `panic \"message\";` always reports where it occurs, even inside a forwarding block. Forwarding changes the diagnostic location; it does not catch a panic or allow execution to continue. Successful calls behave normally, and the original message and full call trace are preserved.",
        "code": "func leaf() int {\n    return panic \"invalid input\";\n}\n\nfunc wrapper() int {\n    forward panic return leaf();\n}\n\nfunc main() int {\n    return wrapper(); // Diagnostic points to this call.\n}",
        "note": "",
        "after": "For several calls, write `forward panic { first(); second(); }`. Forwarding applies to calls in the annotated statement, including conditions and arguments. Consecutive forwarding callers move the location outward until a caller does not forward or the outermost call site is reached. Nested forwarding blocks in the same function do not skip extra frames. A wrapped declaration, such as `forward panic x := leaf();`, remains visible in its enclosing scope.\n\nFor example, `forward panic { panic \"hi\"; }` reports at `panic \"hi\"`; it is never forwarded. Use `return panic \"hi\";` when creating a failure that should be attributed to the caller and may be forwarded by its wrappers.\n\nForwarding a returned panic skips the wrapper’s deferred calls. The first caller that does not forward runs its deferred calls and can recover the panic. An ordinary panic from a called function, or a direct panic inside a forwarding block, runs local deferred calls."
      },
      {
        "id": "defer-recover",
        "title": "Deferred calls and recovery",
        "text": "`defer cleanup(arg);` evaluates the receiver and arguments immediately and runs the call when the enclosing function exits. A `defer` inside a nested block still waits until the enclosing function exits; it does not run merely because that block ends. If several calls are deferred, the most recently registered call runs first. Calls registered in loops follow the same rule. Return expressions are evaluated before deferred calls; deferred calls can change named results through pointers. Ocean's usual value-copy rules apply to captured arguments; pointers retain their aliasing behavior.\n\n`recover()` returns `any`. Called directly in a deferred Ocean function during panic unwinding, it returns the panic message as a boxed `string` and stops the panic. After recovery, the panicking function finishes any remaining deferred calls and returns to its caller. It does not resume at the statement after `panic`. Its named result variables supply the returned values; unnamed results receive their types’ defaults. Outside that context, including an indirect helper call or a normally returning function's deferred call, `recover()` returns `null`. A second call after recovery also returns `null`; `defer recover();` does not recover a panic.\n\nAn ordinary `panic` runs the function's defers, then its callers' defers as it propagates. `return panic` skips the originating function's defers. A caller that forwards that returned panic with `forward panic` also skips its defers; the first caller that does not forward runs its defers and can recover. Further propagation runs callers' defers normally. A direct panic inside `forward panic { panic \"hi\"; }` runs local defers, as does an ordinary panic from a called function. An unrecovered panic prints its diagnostic and exits with status 1. A new panic in a deferred call starts unwinding from that call.",
        "after": "The function literal is registered before `work` panics. During unwinding, it calls `recover()` directly in its own body and receives the boxed message `\"operation failed\"`. After that deferred call and any remaining deferred calls finish, `work` returns normally to its caller.",
        "code": "func work() {\n    defer func() {\n        message := recover();\n        if (message != null) {\n            // Inspect message.(string).\n        }\n    }();\n    panic \"operation failed\";\n}",
        "note": "Call recover directly inside the deferred function body. A recover() used as an argument to the deferred call is evaluated immediately."
      }
    ]
  },
  {
    "slug": "language/c-interop",
    "group": "Language guide",
    "title": "C interop",
    "description": "Call native libraries with an explicit ABI and work with C strings and pointers.",
    "sections": [
      {
        "id": "compatibility-note",
        "title": "Current support and portability",
        "text": "The current compiler emits LLVM IR and uses Clang to link calls to native C functions. C interoperability is available in this implementation, but Ocean’s native interfaces are still evolving and are not a stable portability guarantee.\n\nWhere practical, prefer an existing Ocean package or implement the functionality in Ocean rather than depending heavily on extern calls. Functionality shared by many programs can be exposed through a standard-library package; platform-specific parts can use inline assembly when needed. If native calls are necessary, keep their declarations together, document the platform and ABI they assume, and test them on each supported target. A platform-specific library implementation can expose an ordinary Ocean API so its callers do not need to repeat those assumptions.",
        "code": "",
        "note": ""
      },
      {
        "id": "declare-external-functions",
        "title": "Declare external functions",
        "text": "Extern declarations use C-style ordering: return type first, then the function name, then type-first parameters. They are file-scoped and called through `extern.name`. The declaration must match the target’s application binary interface (ABI): the storage widths, argument layout, and calling convention expected by the native function. C `int` is `i32` on the tested host, while Ocean `int` is `i64`.\n\nAn extern declaration promises that the named symbol exists in the native libraries linked into the program and that its signature matches the target’s native calling conventions. Ocean cannot infer the correct C signature from a symbol name. Check argument widths, pointer types, return types, and the target platform’s conventions when writing the declaration.\n\nExtern declarations intentionally use a different ordering from ordinary Ocean functions. They also have a separate call qualifier, `extern`, so a native function does not collide with an Ocean function or local variable of the same name. A declaration applies only to its own source file.",
        "code": "extern int write(i32 fd, buffer<i8>[] data, int count);\n\nfunc main() {\n    text := \"Hello from native code!\\n\";\n    extern.write(1, text.data, len(text));\n}",
        "note": "",
        "after": "This example uses the host’s `write` function to send a byte count to file descriptor one, standard output. `text.data` supplies a raw byte buffer, not the header of an Ocean string. The example signature is for the current tested host and should be checked when targeting another native ABI."
      },
      {
        "id": "strings-at-a-c-boundary",
        "title": "Strings at a C boundary",
        "text": "Ocean strings carry a header and have no implicit trailing NUL. Pass `.data` for a raw buffer. For APIs expecting a C string (`char*`), append `\\0` explicitly. A `string`’s `.data` argument is an isolated temporary valid only during its enclosing call; create a named mutable `i8[]` copy for persistent access.\n\nA C API may expect a pointer to bytes terminated by a zero byte, a pointer and explicit length, or writable storage that it retains. Those are different contracts. An Ocean string value does not automatically satisfy all of them merely because it contains text.\n\nFor a length-based operation such as `write`, pass `.data` together with `len(text)`. For a C-string operation, explicitly provide a terminator, for example `\"Ocean\\0\".data`. The terminator is part of the string’s bytes, so do not add it blindly when an API already takes an explicit text length.\n\nA string’s temporary `.data` buffer isolates its immutable contents from writes during the native call. If the API keeps the pointer afterward, a temporary is insufficient. Use a named mutable byte array with a lifetime that covers every native use of that pointer.",
        "code": "",
        "note": ""
      },
      {
        "id": "void-pointers-and-casts",
        "title": "Void pointers and casts",
        "text": "`*void` holds a native address without specifying the type of object stored there. You cannot dereference it until you cast it to a pointer with a concrete pointee type. Typed pointers convert automatically to `*void`. Converting back requires an explicit cast; multi-token cast targets are grouped in parentheses.\n\nAn untyped pointer is useful for APIs such as `malloc` that allocate storage without knowing its eventual Ocean type. Before dereferencing that storage, cast the address to a pointer with a concrete pointee type. The grouped target syntax `raw -> (*int)` makes the compound type part of the cast.\n\nTyped pointers convert to `*void` automatically when passed to a compatible parameter. The reverse conversion remains explicit because it asserts how the underlying storage will be interpreted. Neither conversion by itself allocates, copies, initializes, or frees an object.",
        "code": "extern *void malloc(uint bytes);\nextern void free(*void memory);\n\nfunc main() {\n    byteCount := sizeof(int);\n    raw := extern.malloc(byteCount -> uint);\n    if (raw == zero(*void)) panic \"allocation failed\";\n    value := raw -> (*int);\n    *value = 42;\n    extern.free(value);\n}",
        "note": "Structs passed or returned by value through extern are not supported. Use pointers and verify the target platform’s ABI. Native variadic calls use libffi.",
        "after": "The allocation is checked against a zero-address pointer because this is a C allocation result. The address is then interpreted as integer storage, written, and released with C `free`. Keep allocation and deallocation APIs matched; this example deliberately uses native allocation rather than Ocean `new`.\n\nThis declaration uses a 64-bit unsigned `size_t` argument for `malloc`, as on the tested 64-bit host. The byte count is not a C `int`; verify the target’s `size_t` width before reusing the declaration on another platform."
      }
    ]
  },

  {
    "slug": "language/inline-assembly",
    "group": "Language guide",
    "title": "Inline assembly",
    "description": "Write architecture-specific assembly with optional platform selection.",
    "sections": [
      {
        "id": "syntax",
        "title": "Architecture and platform selection",
        "text": "Inside a function, write `asm architecture[/platform] { assembly }`. The architecture is required: `x86_64`, `aarch64`, or `riscv64`. An optional platform suffix, `/linux`, `/macos`, or `/windows`, additionally requires that operating system. For example, `asm x86_64/linux` is included only when compiling on an x86-64 Linux host. Braces are required; a trailing semicolon is optional. Unknown selectors are errors.",
        "code": "func main() {\n    asm x86_64/linux {\n        nop\n    }\n    asm aarch64 {\n        nop\n    }\n}",
        "note": ""
      },
      {
        "id": "assembly-syntax",
        "title": "Assembly syntax and matching blocks",
        "text": "Ocean currently builds for the host through Clang. Nonmatching blocks are omitted without assembling their bodies; choosing a selector does not change the compilation target. An `aarch64` block in a program built on an x86-64 host is omitted; it does not produce an AArch64 executable. Every matching block executes in source order. x86-64 uses Intel syntax; AArch64 and RISC-V use their standard LLVM assembler syntax. Bodies are raw assembly, including newlines, directives, and literal `$` characters, with balanced braces outside quoted strings and comments. Use `#` line comments on x86-64 and RISC-V, and `//` on AArch64; `/* ... */` comments are also recognized.",
        "code": "",
        "note": ""
      },
      {
        "id": "operands",
        "title": "Read and write Ocean variables",
        "text": "Use `${name}` outside assembly strings/comments to read or write a mutable scalar variable or pointer. Each placeholder names the variable’s memory location in the assembly operand list. It is not replaced with a numeric constant or with a register containing the address. On x86-64, `mov rax, ${value}` loads from that location and `mov ${value}, rax` writes back. Choose registers and instructions matching the variable’s storage width; an Ocean `int` occupies 64 bits. Initialize variables before the block.",
        "code": "value := 7;\nasm x86_64 {\n    mov rax, ${value}\n    add rax, 3\n    mov ${value}, rax\n}\n// value is now 10 on x86-64.",
        "note": ""
      },
      {
        "id": "operand-limits",
        "title": "Operand limits",
        "text": "The operand limit depends on the architecture: `x86_64` supports more than four distinct operand names with no compiler-imposed count limit. Both `aarch64` and `riscv64` support at most four distinct operand names per block.\n\nAArch64 and RISC-V currently reserve registers to address operands, which limits how many distinct variables a block can reference. x86-64 can address stack variables directly and does not have this four-operand restriction. Repeated references to `${name}` share one operand: reading and then writing `${value}` counts as one distinct variable, regardless of architecture. The name inside `${...}` must refer to a supported mutable scalar or pointer variable. A collection, struct, constant, or expression such as `${value + 1}` cannot be used there.",
        "code": "",
        "note": ""
      },
      {
        "id": "registers",
        "title": "Clobbers and reserved registers",
        "text": "The compiler assumes the block can change ordinary integer and vector/floating-point registers; these are the block’s clobbers. It also treats named operands as readable and writable, accounts for condition-code changes where applicable, and prevents surrounding memory operations from being moved across the block in ways that violate its memory effects. These compiler assumptions do not mean the assembly may overwrite every machine register. Preserve frame pointers, reserved registers, and special machine state: x86-64 `rbp`; AArch64 `x18`/`x29`; RISC-V `gp`/`tp`/`s0`. When operands are present, also preserve AArch64 `x9`–`x15` and RISC-V `t3`–`t6`: the compiler uses them to address operands. Native calls may overwrite these address registers, so save and restore them around calls.",
        "code": "",
        "note": ""
      },
      {
        "id": "stack-and-calls",
        "title": "Stack usage and native calls",
        "text": "Blocks enter with an aligned stack. Functions containing matching asm use no red zone and are not inlined. Stack use and native calls must follow the platform ABI, restore the stack pointer exactly, preserve operand-address registers, and reserve any stack space required by the platform’s calling convention, such as space for a native callee. Named operands may be addressed relative to the stack. Read or write them only while the stack pointer has its original value: before changing it or after restoring it. Do not return, branch out of the block, or unwind through it. Use numeric local assembly labels for jumps within a block so repeated blocks do not declare conflicting symbol names.",
        "code": "",
        "note": ""
      },
      {
        "id": "build-diagnostics",
        "title": "CPU support and build diagnostics",
        "text": "Instructions must be supported by the host's default Clang target; the Ocean CLI does not currently offer a way to select additional instruction-set features. An architecture selector chooses which block is included, not which optional CPU extensions are available. Native `check`/build reports assembler errors through Clang; `--emit-llvm` writes the assembly text into LLVM IR without assembling it. A successful IR-only build therefore does not show that the assembly instructions are valid; use `ocean check` or a native build for that verification.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/packages",
    "group": "Tooling",
    "title": "Packages & modules",
    "description": "Organize source files and share code across local and external packages.",
    "sections": [
      {
        "id": "package-directories",
        "title": "A directory is a package",
        "text": "All .oc files in a directory belong to the same package and must declare the same name. Functions, types, and globals are shared across those files. An import is available only in the file that declares it, even though top-level functions, types, and variables are shared across files in the package. Only the root `package main` gets an executable entry point.\n\nPackage membership comes from the source directory and declaration, not the source filename. Splitting a large program into several `.oc` files in one directory does not require imports between those files. Their global-level declarations share the package scope, while local declarations still follow ordinary lexical scope.\n\nImports are different: each file must import the packages whose qualified names it uses. Importing `io` in `main.oc` does not make `io` available in a sibling source file. Extern declarations are also file-scoped and must be repeated in each file that calls them.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"One directory, one package.\");\n}",
        "note": "",
        "after": "This file belongs to the executable package `main`. A sibling file beginning with `package main;` can declare helpers that `main` calls directly. A sibling file declaring a different package would cause a package-name error."
      },
      {
        "id": "initialize-a-module",
        "title": "Initialize a module",
        "text": "A module root contains `ocean.mod`. Its subdirectories are separate packages. `ocean mod init` uses the supplied module name or the current directory’s name; it preserves an existing module file.\n\nThe module name supplies a stable prefix for imports inside the project and for code importing it externally. It usually resembles a repository path. One module can contain several packages. Each directory containing Ocean source is a package, while the root `ocean.mod` gives those packages a common import prefix. Subpackages do not need separate module files.\n\nRun initialization from the directory you want to use as the root. The command creates `ocean.mod` containing the chosen `module` name and an `ocean 0.1` directive. With no explicit name, the current directory’s name is used. An existing module file is preserved rather than overwritten.",
        "code": "ocean mod init github.com/yourname/project",
        "note": "",
        "after": "The example path is illustrative; replace it with the name of your project. After initialization, a `helper` subdirectory is a separate package that can be imported using the module name followed by `/helper`."
      },
      {
        "id": "import-packages",
        "title": "Import packages",
        "text": "Import qualifiers default to the declared package name. Aliases use `as`. Names beginning with a Unicode uppercase letter are exported; lowercase declarations are private to their package. Import cycles and mixed package names are errors.\n\nThe import path identifies where a package is found; the qualifier used in expressions normally comes from that package’s `package` declaration. An alias changes the local qualifier for this file, which is useful when two imports would otherwise have the same package name.\n\nExporting is name-based. A capitalized function such as `Answer` is available to importers, while lowercase helpers remain accessible only inside their own package. The rule also applies to types, global variables, receiver methods, aliases, and interfaces. Dot imports expose exported names directly; blank imports do not introduce a normal qualifier.",
        "code": "import \"github.com/yourname/project/helper\";\nimport \"github.com/example/collections/list\" as lists;\n\n// Inside a function:\nanswer := helper.Answer();",
        "note": "See the Packages & imports language guide for dot imports, blank imports, visibility, and receiver ownership.",
        "links": [{ "label": "Packages & imports", "href": "/docs/language/packages-and-imports/" }],
        "after": "In this illustrative module layout, the first import supplies `helper.Answer()`. The second package is bound as `lists` regardless of its usual qualifier. Each referenced package must actually exist and declare the exported names you call."
      },
      {
        "id": "dependencies-and-replacements",
        "title": "Dependencies and replacements",
        "text": "`require` selects a Git tag or branch. `replace` redirects a module requirement to a local directory or a different module/version without changing the import paths written in your source. A local replacement needs its own `ocean.mod`. External modules use direct Git over HTTPS and are cached.\n\nA requirement records which version of an external module to select. Versions are resolved through Git tags or branches, and module downloads are reused from the module cache. Unlike systems with a module proxy, Ocean fetches repository content directly over HTTPS.\n\nA local replacement is useful while developing two modules together. It keeps the logical import path unchanged while directing resolution to a checkout on disk. That checkout must have its own module declaration so the package graph can be resolved consistently. Single-line and parenthesized directive groups are accepted.",
        "code": "module github.com/yourname/project\n\nocean 0.1\n\nrequire github.com/example/collections v1.2.3\nreplace github.com/example/collections => ../collections",
        "note": "The default module cache is ~/.cache/ocean/modules. OCEAN_MOD_CACHE overrides it. Module downloads and build artifacts use separate caches.",
        "after": "The example dependency and version are placeholders. The replacement makes that dependency resolve to the sibling `collections` checkout. Removing a build cache entry will not change which external module sources are available in the independent module download cache."
      },
      {
        "id": "initialization",
        "title": "Initialization",
        "text": "Imported packages initialize before importers. Within a package, files are sorted by filename and global initializers execute in declaration order. Globals are default-initialized first, so a forward reference may observe a default value. Owned contents of global arrays, strings, and maps remain available for the program’s lifetime and are released at process shutdown.\n\nDefault initialization happens before user initializers execute. This means a global referenced before its initializer runs has a defined default, rather than causing the compiler to reorder arbitrary expressions to satisfy the reference. Explicit types are useful for forward-referenced globals because they make the intended storage type unambiguous.\n\nKeep global initialization simple and avoid relying on surprising file-order dependencies. Imported packages finish initializing before their importers. Within one package, filename order and then declaration order determine execution. Global collections own their copies for the program’s lifetime. A function using a global collection does not borrow the temporary storage used while its initializer ran.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/cli",
    "group": "Tooling",
    "title": "Compiler & CLI",
    "description": "Build native executables, inspect LLVM, and understand the build cache.",
    "sections": [
      {
        "id": "everyday-commands",
        "title": "Everyday commands",
        "text": "The executable names `ocean` and `ocean-c` accept the same commands and options; the examples use `ocean`. A location can be a file or directory. A file selects its containing package. Non-`main` packages `build` into native object files and cannot be `run` directly.\n\nUse `check` for validation, `run` for a development execution, and `build` when you want a persistent output artifact. All three operate on a package and its imports. Passing `main.oc` is a convenient way to locate that package; it does not exclude other `.oc` files in the directory.\n\nUse `--static` (short form `-s`) with `build` or `run` to statically link the executable, including the temporary executable used by `run`. This passes `-static` to Clang and requires host support and static system libraries, including static libffi when needed. Missing static libraries or unsupported targets cause a linker error. Static linking is rejected for non-main packages and cannot be combined with `check`, `--check`, or `--emit-llvm`. When eligible cached object files already exist, Ocean reuses them and performs the link step again with static linking enabled. Use `--` to pass a literal `--static` or `-s` argument to a running program.\n\nNative builds emit separate LLVM modules directly for each source package and shared program support. Packages compile all ordinary functions so a cached object can serve different callers. Executable linking discards unused functions and data using function/data sections. Library builds preserve callable functions for downstream users. The --emit-llvm option retains a single merged inspection file containing reachable executable functions.\n\nWithout `-o`, an executable uses the package directory’s name as its output name. A non-main package produces an object file instead. Choosing an explicit output path is useful in scripts because it avoids depending on a directory’s current name.",
        "code": "ocean check .\nocean run .\nocean run ./main.oc argument\nocean run . -- --static\nocean build . -o application\nocean build --static . -o application\nocean run -s .\nocean build ./library -o library.o",
        "note": "",
        "after": "The `--` separator makes the boundary between compiler options and program arguments clear. For a directly built executable, invoke its output path through the shell. `run` rejects a package that is not an executable root named `main`."
      },
      {
        "id": "llvm-and-validation",
        "title": "LLVM and validation",
        "text": "`--emit-llvm` writes textual LLVM IR, defaulting to `a.ll` if no output is specified. `check` validates syntax, semantics, backend lowering, LLVM verification, and native linking. It may compile and link temporary files to validate the build, but does not leave an executable at your requested output path or execute your program.\n\nTextual LLVM output is useful when inspecting how an Ocean construct is lowered or when working with a separate native compilation step. It contains compiler-generated code rather than the original source.\n\nChecking is broader than parsing. The compiler resolves imported packages, performs semantic validation, lowers the program, verifies the generated LLVM, and checks native linking. A successful check therefore validates the implemented backend path, but does not test runtime behavior or execute application logic.",
        "code": "ocean build --emit-llvm . -o application.ll\nocean build --check .\nocean check ./main.oc",
        "note": "",
        "after": "Both checking forms avoid publishing an executable. They can still report errors from the native toolchain, including unresolved external functions. Temporary artifacts used during validation are removed after the check."
      },
      {
        "id": "run-behavior",
        "title": "Run behavior",
        "text": "`run` builds in a private temporary directory and executes with the current working directory and inherited standard streams. Normal arguments and unrecognized flags after the location are forwarded to the program. Ocean compiler flags are parsed by Ocean until `--`; everything after `--` is passed literally to the program. The executable’s exit status is returned, and temporary artifacts are removed afterward.\n\nThe temporary build location is separate from the process working directory. Relative paths used by the running program are still interpreted from the directory where you invoked Ocean, and terminal input and output are inherited. This makes a development run behave much like invoking a built executable yourself.\n\nPass arguments directly after the program location: `ocean run . arg1 arg2`. Unrecognized flags after the location are also forwarded. Ocean recognizes `-o`, `--emit-llvm`, and `--check` anywhere before `--`, even after normal program arguments; these build-only options are incompatible with `run`. Use `--` to pass matching names to the program, for example `ocean run . arg1 -- -o output --check`. Ocean returns the program’s exit status to the invoking shell. A `func main() int` result becomes that status; a no-result `main` normally exits with zero.\n\nThe temporary executable and directory are removed after execution, including runtime failures and handled interrupts. Use `build` instead when another tool needs to inspect or invoke the resulting file later.",
        "code": "",
        "note": ""
      },
      {
        "id": "build-caching",
        "title": "Build caching",
        "text": "Native builds cache compiled objects per source package and shared program support in `~/.cache/ocean-build`. Native cache keys hash source contents and paths, transitive dependency sources, compiler and native toolchain identity, host, working directory, and environment. Generated LLVM is not an input to native cache lookup. Dependency invalidation is conservative: changing a dependency implementation rebuilds its importers.\n\nCache lookup happens before backend emission. When all objects and link metadata are cached, Ocean skips LLVM generation and native compilation, then relinks against current system libraries. On misses, the backend emits package LLVM files directly; there is no merged-file splitter. Unchanged package objects can be reused when an application starts calling additional package functions. Rebuilding shared support still lowers the graph to collect type and runtime requirements from all packages. Support uses a whole-program source key because it owns globals, startup, concrete specializations, and type-dependent runtime dispatch.\n\nThe --emit-llvm inspection output has a separate source-keyed cache. Parsing and semantic checks still run. The check command validates direct package modules in temporary files. Output filenames, link-only --static, and application arguments do not invalidate native objects. An unavailable cache falls back to compilation; corrupt artifacts are treated as cache misses.\n\n`ocean clean --cache` removes the build cache without removing downloaded modules.",
        "code": "ocean clean --cache\n\n# Shell environment overrides:\nOCEAN_BUILD_CACHE=off ocean build .\nOCEAN_BUILD_CACHE=/path/to/cache ocean build .",
        "note": "Cleaning the build cache does not remove downloaded modules. An unavailable build cache falls back to compilation.",
        "after": "Use `OCEAN_BUILD_CACHE=off` to compare behavior without cached artifacts or when investigating a build problem. A custom cache path can keep generated data in a location appropriate to your environment. An unavailable cache falls back to ordinary compilation."
      },
      {
        "id": "diagnostics",
        "title": "Diagnostics",
        "text": "Errors and warnings include a filename, line, column, excerpt, and caret. Terminal output uses color; redirected output is plain. `NO_COLOR` disables color, and `CLICOLOR_FORCE=1` forces it. Build failures preserve previous output files.\n\nRead diagnostics from the first reported location and use the excerpt to identify the expression involved. A syntax error can cause several later messages, so fixing the earliest issue and checking again is often more useful than addressing every downstream message separately. Source paths are relative to the compiler’s working directory where possible.\n\nWarnings do not prevent a successful compilation. One example is a value-returning function that reaches its end and implicitly returns a zero value. Prefer an explicit return so the intended behavior is visible. Native compiler and linker failures also make the build unsuccessful.\n\nIf a previous output file exists, a failed build preserves it. Be careful when running an old executable after a failed rebuild: its presence is not evidence that the latest source compiled successfully.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "tooling/editor",
    "group": "Tooling",
    "title": "Editor integration",
    "description": "Connect an LSP-capable editor to the Ocean compiler.",
    "sections": [
      {
        "id": "language-server",
        "title": "Start the language server",
        "text": "Configure your editor’s language client with command `ocean` and two separate arguments, `check` and `--lsp`. It communicates using Language Server Protocol framing over stdin and stdout. Ensure ocean and Clang are available to the editor process.\n\nThe language server is part of the compiler executable, so there is no separate server binary to install. Your editor needs an LSP client configured to associate `.oc` files with Ocean and start the command below. Use an absolute path to `ocean` if the editor does not inherit the same PATH as your terminal.\n\nThe server uses standard input and output as a protocol stream, not as an interactive terminal. A client starts the process, sends initialization, and exchanges LSP messages. Launching it manually is useful for confirming that the command exists, but it will then wait for protocol input.",
        "code": "ocean check --lsp",
        "note": "",
        "after": "A generic client configuration has executable `ocean` and an argument list containing `check` and `--lsp` as separate arguments. The exact configuration file and language identifier depend on the editor. Also make sure the server process can locate Clang and the standard library."
      },
      {
        "id": "language-features",
        "title": "Language features",
        "text": "The server reports scanner, parser, semantic, backend, and native diagnostics on open, change, and save. Hover shows resolved types. Definition, declaration, type-definition, and references follow bindings across source files and imports.\n\nHover is useful for inferred variables because it shows the resolved type at the symbol rather than requiring a separate annotation. Navigation requests distinguish the declaration of a symbol from the declaration of its type, which helps when following fields and package exports. References follow actual symbol bindings across files and imports.\n\nDiagnostics use the compiler’s validation stages, so editor feedback can include a backend or native linking problem as well as a syntax error. A clean syntax highlight alone is not a substitute for these compiler diagnostics.\n\nThe client decides how to present this information, such as an inline underline, a diagnostics panel, or a hover popup. If a feature appears missing, check that the editor is connected to this server and supports the corresponding LSP request.",
        "code": "",
        "note": ""
      },
      {
        "id": "completion-and-rename",
        "title": "Completion and rename",
        "text": "Completion uses lexical scope and inferred receiver types for fields, methods, array operations, and exported package members. Rename respects shadowing and rejects invalid names, collisions, and a change from an exported uppercase name to a private lowercase name when that declaration is used through an import.\n\nCompletion uses the receiver’s resolved type when you type a dot, including fields, methods, dynamic-array operations, and exported package names. It also considers lexical scope so local variables and parameters are suggested where they are actually available. Incomplete member expressions can still receive suggestions.\n\nRename operates on resolved bindings rather than replacing every matching string. This is important when a local variable shadows another declaration with the same spelling. The server can also reject a rename that collides with an existing declaration or makes an imported public export private.\n\nReview workspace edits in the editor before accepting a larger rename. The server supplies edits across the relevant source files; the editor controls their preview and application.",
        "code": "",
        "note": ""
      },
      {
        "id": "unsaved-files",
        "title": "Unsaved files",
        "text": "Open buffers, including new unsaved files and incomplete member expressions, are checked with their package and imports without changing source files. Edit ranges and diagnostic positions exchanged with the editor count UTF-16 code units, rather than UTF-8 bytes. Editor-specific setup depends on your editor’s language-client configuration.\n\nThe server checks open buffers together with the rest of their package graph. A new or edited file can therefore receive diagnostics without first writing those changes to disk. Other files in the package and imported packages are still considered, so errors may depend on more than the visible buffer.\n\nPositions exchanged with the client use UTF-16 units, as required by the supported protocol behavior. This matters when a line contains characters whose encoding spans more than one unit; a custom client should not treat byte offsets as equivalent positions.\n\nIf command-line checks and editor feedback disagree, compare the executable path, working directory, environment variables, and unsaved buffer contents. These are common reasons for the two processes to resolve different sources or toolchains.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/io",
    "group": "Standard library",
    "title": "io",
    "description": "Print and format values, parse numeric strings into Result values, and scan files or standard input.",
    "sections": [
      {
        "id": "import-and-print",
        "title": "Import and print",
        "text": "`Print` converts its arguments to text and writes them to standard output (stdout), without interpreting them as a format template. `Println` adds a newline. The current implementation inserts a space only between adjacent non-`string` values, so include spaces explicitly when combining text and numbers.\n\nImport `io` in each file that calls it. The package’s printing functions accept variadic values, so a call can contain one value or several. The formatting of each value depends on its concrete type, while `Println` adds the final newline regardless of whether the last value is a string.\n\nFor mixed text and numbers, include separators in strings or use a format template. For example, `io.Println(\"count: \", 3)` includes the desired space explicitly. Relying on automatic spacing between every argument would produce different results because the implementation treats strings differently.",
        "code": "package main;\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Hello, Ocean!\");\n    io.Printfln(\"The answer is {}\", 42);\n}",
        "note": "",
        "after": "The program prints two lines: `Hello, Ocean!` and `The answer is 42`. `Print` would write the same converted arguments without the final newline. `Printfln` combines placeholder formatting with a newline."
      },
      {
        "id": "formatting-functions",
        "title": "Formatting functions",
        "text": "`io.Printf(format, items...)` replaces each `{}` in the format string with the corresponding argument’s text, then writes the result. `Printfln` adds a newline. `Sprintf` returns Result<string>. Templates use {} placeholders in argument order. The number of supplied formatting arguments must equal the number of `{}` placeholders. If those counts differ, the function returns `Result.error` instead of a formatted success value. This is not C-style percent formatting.\n\nEach `{}` in the template consumes the next argument. Ordinary text, including spaces and punctuation, is copied into the result. The formatter requires the number of arguments to match the number of placeholders: too few and too many both return an error Result.\n\nChoose `Printf` or `Printfln` for immediate console output. Choose `Sprintf` when another function needs the formatted string or when you want to store it. The template language does not implement C percent directives or a general collection of width and precision specifiers.",
        "code": "message := io.Sprintf(\"{} + {} = {}\", 2, 3, 5).unwrap();\nio.Println(message);",
        "note": "",
        "after": "The returned string is `2 + 3 = 5`, and `Println` then writes it followed by a newline. A percent sequence such as `%d` is ordinary text for these functions, not an integer placeholder.",
        "table": {
          "headers": [
            "Function",
            "Result"
          ],
          "rows": [
            [
              "`Print(items ...any) Result<int>`",
              "Writes converted values"
            ],
            [
              "`Println(items ...any) Result<int>`",
              "Writes converted values and a newline"
            ],
            [
              "`Printf(format string, items ...any) Result<int>`",
              "Writes a formatted message"
            ],
            [
              "`Printfln(format string, items ...any) Result<int>`",
              "Writes a formatted message and a newline"
            ],
            [
              "`Sprint(items ...any) string`",
              "Returns converted values as a string"
            ],
            [
              "`Sprintf(format string, items ...any) Result<string>`",
              "Returns a formatted message as a string"
            ]
          ]
        }
      },
      {
        "id": "parse-numbers",
        "title": "Parse integers and floats",
        "text": "io.ParseInt(text string) Result<int> parses an optional leading sign followed by one or more ASCII decimal digits. It supports the complete signed 64-bit range, including -9223372036854775808. Leading zeros are allowed.\n\nio.ParseFloat(text string) Result<float> parses binary64 decimal numbers with an optional sign, optional point, and optional exponent introduced by `e` or `E`, whose exponent may also have a sign. At least one digit is required. Examples include .5, 1., and -1.25e2. Case-insensitive nan, inf and infinity, with an optional sign, are also accepted.\n\nA parse succeeds only if the entire input string is a valid number; neither function accepts just a numeric prefix and ignores the rest. Empty input, surrounding whitespace, digit separators, base prefixes, malformed syntax and trailing characters return error Results. Integer overflow and finite float overflow also return errors. Floats round to nearest with ties to even, support subnormals and signed zero, and underflow sufficiently small values to signed zero. Parsing is implemented in Ocean, independent of libc and locale.",
        "after": "`ParseInt(\"42\")` succeeds with `42`. `ParseFloat(\"1.25e-2\")` succeeds with `0.0125`; the fallback `0.0` is used only on an error. `ParseInt(\"invalid\")` reaches the error arm and prints its message. Whitespace is not trimmed automatically, so `ParseInt(\" 42\")` is an error.",
        "code": "package main;\nimport \"io\";\n\nfunc main() {\n    count := io.ParseInt(\"42\").unwrap();\n    ratio := io.ParseFloat(\"1.25e-2\").unwrapOrElse(0.0);\n    parsed := io.ParseInt(\"invalid\");\n    match(parsed) {\n        Result<int>.value(value) => io.Println(value);\n        Result<int>.error(message) => io.Println(message);\n    }\n    io.Println(count, \" \", ratio);\n}",
        "note": ""
      },
      {
        "id": "parse-errors",
        "title": "Handle parsing errors",
        "text": "`ParseInt` and `ParseFloat` report invalid or out-of-range input as a `Result.error` variant; the parse call itself does not panic for that input. unwrap returns the value or panics with the stored error message; unwrapOrElse returns a supplied fallback on error; unwrapOrZero returns zero(T) on error. Error strings distinguish invalid input from out-of-range input.\n\nResult<T> belongs to the language and needs no import. ParseInt and ParseFloat belong to the standard-library io package and use capitalized exported names. Update the compiler and io source tree together.",
        "code": "",
        "note": ""
      },
      {
        "id": "string-conversion",
        "title": "String conversion",
        "text": "`Sprint`(items `...any`) returns the text that `Print` would write. The implementation handles signed integers, floats, booleans, strings, arrays, and structs; raw buffers use a placeholder. The default floating-point conversion rounds to two digits after the decimal point. For example, it is intended as readable output, not as a way to serialize every significant digit of a float.\n\n`Sprint` is useful when you want the same conversion rules as the printing functions without writing to stdout. Integer values are rendered in decimal, booleans as `true` or `false`, and strings as their contents. Arrays are rendered with bracketed elements. Struct formatting uses reflected field names and field values.\n\nThe current floating formatter uses two decimal places, so this API should not be assumed to preserve arbitrary input precision in its default output. It uses exact binary64 conversion with ties-to-even rounding in Ocean, independent of the C locale. A raw buffer is represented by a placeholder rather than traversed as a length-aware collection.",
        "code": "text := io.Sprint(42);\nvalues := int[]{1, 2, 3};\nio.Println(values);",
        "note": "",
        "after": "`text` contains `\"42\"`. The final statement prints `[1 2 3]`. The local string and array have their usual owned lifetimes; returning a formatted string gives the caller an independent value."
      },
      {
        "id": "output-implementation",
        "title": "Output implementation and platform support",
        "text": "The standard-library `io` package has no `extern` declarations. Output uses assembly system calls on Linux (x86-64, AArch64, RISC-V64) and macOS (x86-64, AArch64). Windows x86-64/AArch64 assembly calls `GetStdHandle` and `WriteFile`; native Windows executable links include `kernel32` (use `-lkernel32` when linking saved IR manually). Other architecture/platform combinations report unsupported output. Writes handle partial results and retry Unix interruptions; other output failures return error Results.\n\nThe use of system calls inside `io` does not remove the rest of the executable’s native dependencies. Compiler-generated runtime code and boxed values can still use native libraries and libffi, so an Ocean executable is not automatically a standalone program with no runtime library dependencies.",
        "code": "",
        "note": "",
        "links": [
          {
            "label": "Inline assembly",
            "href": "/docs/language/inline-assembly/"
          }
        ]
      },
      {
        "id": "input-and-files",
        "title": "Input scanning and files",
        "text": "Most standard-library I/O operations return `Result<T>` so the caller can handle an operating-system error as an ordinary result. Calling `.unwrap()` returns the successful value or panics with the error message. Alternatively, use `match` to handle `Result.error` in your program. `Close()` and `Setpos()` are exceptions: they return no value and panic on failure.\n\n`os.Stdin()`, `os.Stdout()`, and `os.Stderr()` each return `Result<os.File>`. Standard input is readable. Standard output and standard error are writable and cannot be used as scanner input. `os.Open(path, mode)` also returns `Result<os.File>`; the mode controls whether the file can be read, written, created, truncated, or appended to. The table below explains the modes.\n\nCopying an `os.File` does not open a second independent stream. File values refer to shared native state, including the current byte position, whether the file is closed, and whether EOF has been reported. Closing one copy affects the others. This sharing is specific to the underlying file handle; ordinary Ocean array and map copies still own independent contents.\n\n`io.NewScanner(file)` creates a buffered text scanner. It panics if the file is binary, closed, or not readable. Use one scanner for a stream and avoid mixing its buffered reads with direct reads on the same file. `io.Scan()` and `io.Scanln()` are convenience functions using a shared scanner for standard input.\n\n`scanner.Scan()`, `scanner.Scanln()`, and `scanner.Scanc(delimiter)` return `Result<string>`. They consume the delimiter but omit it from the returned string. An immediate delimiter therefore gives a successful empty string. `Scan()` stops at an ASCII whitespace byte, `Scanln()` stops at newline or EOF, and `Scanc()` stops at the requested byte or EOF. For a CRLF line ending, `Scanln()` consumes the LF and leaves the preceding CR in the returned string. Reaching EOF is a successful scan result, even when no bytes remain.\n\n`scanner.Scann(n)` returns `Result<io.ScanResult>`. Its `Bytes` field is an `i8[]` containing only the bytes actually read, with no padding. Its `End` field is true when EOF prevented the scanner from filling the request. Asking for zero bytes succeeds without consuming input; a negative count panics. This differs from `File.Readn(n)`, whose returned array always has length `n` and zero-fills unused positions.\n\n`HasNext()`, `HasNextln()`, and `HasNextc(delimiter)` return `Result<bool>` without waiting for more input. They inspect buffered data and the operating system’s current readiness state. A successful `true` means a complete segment is available, or EOF has left remaining data to consume. A readiness failure is an error result, not `false`. Readiness is only a snapshot: another reader can consume input before the next scan.",
        "after": "The example opens `input.txt` for reading, consumes one line without its newline, prints that line, and closes the shared file handle. Each `.unwrap()` turns a recoverable I/O error into a panic for this small example. In application code, inspect the returned `Result` when an error should be handled without stopping the operation.",
        "code": "package main;\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    file := os.Open(\"input.txt\", os.FileMode.Read).unwrap();\n    scanner := io.NewScanner(file);\n    line := scanner.Scanln().unwrap();\n    io.Println(line).unwrap();\n    file.Close();\n}\n",
        "note": "",
        "table": {"headers": ["FileMode", "Access and creation behavior"], "rows": [["`Read` / `Binary`", "Read an existing file; no writing. `Binary` selects the binary form."], ["`Write` / `BinaryWrite`", "Write a file, creating it if needed and truncating an existing file."], ["`ReadWrite` / `BinaryReadWrite`", "Read and write; create the file if needed without truncating existing contents."], ["`Append` / `BinaryAppend`", "Write at the end of the file, creating it if needed."], ["`ReadAppend` / `BinaryReadAppend`", "Read the file and append writes at the end, creating it if needed."]]}
      },
      {
        "id": "byte-reads",
        "title": "Byte reads, binary files, and file positions",
        "text": "A file’s position is the byte offset used by its next read or write. Copies of an `os.File` share that position. `Read()`, `Readn(n)`, and `Readend()` advance it as they consume bytes. `Readall()` instead reads the whole file and attempts to restore the previous position and EOF state, including after a read failure. If restoration fails, it returns an error and discards buffered scanner state. `Setpos(position)` also discards scanner buffers so later scans do not use bytes from the old position.\n\nEnd-of-file and a failed read are different outcomes. For example, `Read()` returns a successful `-1` at EOF, whereas a closed file, missing read permission, or native I/O failure returns an error `Result`. Calling `Read()` again after EOF has already been reported panics. A negative requested byte count also panics. Check the success or EOF indicator documented for the particular operation rather than treating every empty result as an error.\n\nA failed operation may already have consumed input or written part of its output; failure does not promise that the file position and contents are unchanged. If a native close fails, the library does not retry it because the operating system may already have released the handle.\n\n`File.IsOpen()`, `CanRead()`, `CanWrite()`, and `IsBinary()` return booleans describing the shared file state. `os.FromDescriptor(fd, readable, writable)` adopts a native descriptor as a text stream; a negative descriptor panics. `File.NativeHandle()` returns the native handle and panics when the file is closed. Keep one scanner per stream and avoid interleaving its buffered operations with direct reads or writes.\n\nThe printing functions `io.Print`, `Println`, `Printf`, and `Printfln` return `Result<int>`. A successful result contains the number of bytes written, including the newline for the newline-producing functions. Native output failures return errors; Unix output retries interrupted writes. `io.Sprintf` returns `Result<string>` and reports a mismatch between placeholders and arguments. `io.Sprint` returns a plain string. These conversion and formatting functions support the full unsigned integer ranges, including the `u64` maximum `18446744073709551615`.",
        "after": "If the file contains fewer than sixteen remaining bytes, `read.End` is `true` and `read.Bytes` still has sixteen elements, with zeroes in the unread positions. `Setpos(0)` then returns to the beginning. `Readall()` reads the whole file while restoring that position, and `Close()` releases the shared handle.",
        "code": "file := os.Open(\"data.bin\", os.FileMode.Binary).unwrap();\nread := file.Readn(16).unwrap();\nbytes := read.Bytes;\nshortRead := read.End;\nfile.Setpos(0);\nwholeFile := file.Readall().unwrap();\nfile.Close();\n",
        "note": "",
        "table": {
          "headers": [
            "File method",
            "Return value and behavior"
          ],
          "rows": [
            [
              "`Read()`",
              "`Result<int>`: unsigned byte 0–255, or -1 at EOF"
            ],
            [
              "`Readn(n)`",
              "`Result<os.ReadResult>`: `Bytes` is an `array<i8>` with exactly n elements; `End` is true if EOF prevents filling it. Unread positions contain zeroes."
            ],
            [
              "`Readend()`",
              "`Result<array<i8>>`: bytes from the current position through EOF; leaves the file positioned at EOF."
            ],
            [
              "`Readall()`",
              "`Result<array<i8>>`: all file bytes; attempts to restore the original position and EOF state before returning."
            ],
            [
              "`Readchunk(n)`",
              "`Result<i8[]>`: at most n bytes, with no zero padding; a successful empty array means no bytes remain at EOF."
            ],
            [
              "`Size()`",
              "`Result<int>`: size in bytes, requires a seekable file"
            ],
            [
              "`PollRead()`",
              "`Result<int>`: OS readiness information without blocking"
            ],
            [
              "`Write(text)`",
              "`Result<int>`: number of bytes written"
            ],
            [
              "`Close()`",
              "Closes the shared file; repeated close succeeds; native failure panics"
            ],
            [
              "`Setpos(position)`",
              "Sets the position for the next operation. Valid offsets run from zero through the file size, including EOF; an invalid offset or native failure panics."
            ]
          ]
        }
      }
    ]
  },

  {
    "slug": "library/os",
    "group": "Standard library",
    "title": "os",
    "description": "Read process arguments, access standard streams, and open, read, write, and close native files.",
    "sections": [
      {
        "id": "os-args",
        "title": "os.Args",
        "text": "`Args()` returns `array<string>`, an independently copied sized-array value. The compiler supplies process arguments through the library’s internal initialization hook.\n\nThe returned collection contains the process argument strings in their original order, including the executable name at index zero. User-supplied arguments follow it. Because it is an independent copy, modifying your local collection does not change the arguments retained by the package.\n\nThe example prints indices as well as values so the order is visible. For a command-line program, check the collection’s length before reading a required position. Alternatively, use checked two-binding indexing when an absent argument should be handled as a normal input error.",
        "code": "package main;\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    args := os.Args();\n    for (index, argument := range args) {\n        io.Printfln(\"{}: {}\", index, argument);\n    }\n}",
        "note": "",
        "after": "When using `ocean run`, the executable name refers to the temporary program Ocean created. It may differ from a separately built executable’s name. Use the arguments after index zero as application input instead of relying on that generated path."
      },
      {
        "id": "pass-arguments",
        "title": "Pass arguments",
        "text": "With `ocean run`, normal arguments after the package location are passed to the generated executable. Ocean still recognizes its own options until a `--` separator. Put `--` before an argument such as `--static` or `-o` when that exact text should be passed to your program. A directly built executable receives arguments from the shell in the usual way.\n\nThe separator belongs to the compiler invocation; it is not itself a user argument passed to the application. Arguments following it are forwarded in order. For a built executable, the shell passes its argument list directly without involving the Ocean compiler.\n\nShell quoting still applies before the program receives those strings. For example, quoting `\"hello ocean\"` passes one argument containing a space, while writing `hello ocean` passes two arguments. Ocean does not re-split the strings returned by `os.Args`.",
        "code": "ocean run . hello ocean\nocean run subdir arg1 arg2\nocean build . -o app\n./app hello ocean",
        "note": "",
        "after": "The first `ocean run` command and the final `./app` command both pass `hello` and `ocean` as two user arguments. The separate `subdir` example instead selects a package in that directory and supplies `arg1` and `arg2`. The executable name at the beginning of the result can differ between them, especially because `run` uses a temporary output file."
      },
      {
        "id": "input-and-files",
        "title": "Input scanning and files",
        "text": "Most standard-library I/O operations return `Result<T>` so the caller can handle an operating-system error as an ordinary result. Calling `.unwrap()` returns the successful value or panics with the error message. Alternatively, use `match` to handle `Result.error` in your program. `Close()` and `Setpos()` are exceptions: they return no value and panic on failure.\n\n`os.Stdin()`, `os.Stdout()`, and `os.Stderr()` each return `Result<os.File>`. Standard input is readable. Standard output and standard error are writable and cannot be used as scanner input. `os.Open(path, mode)` also returns `Result<os.File>`; the mode controls whether the file can be read, written, created, truncated, or appended to. The table below explains the modes.\n\nCopying an `os.File` does not open a second independent stream. File values refer to shared native state, including the current byte position, whether the file is closed, and whether EOF has been reported. Closing one copy affects the others. This sharing is specific to the underlying file handle; ordinary Ocean array and map copies still own independent contents.\n\n`io.NewScanner(file)` creates a buffered text scanner. It panics if the file is binary, closed, or not readable. Use one scanner for a stream and avoid mixing its buffered reads with direct reads on the same file. `io.Scan()` and `io.Scanln()` are convenience functions using a shared scanner for standard input.\n\n`scanner.Scan()`, `scanner.Scanln()`, and `scanner.Scanc(delimiter)` return `Result<string>`. They consume the delimiter but omit it from the returned string. An immediate delimiter therefore gives a successful empty string. `Scan()` stops at an ASCII whitespace byte, `Scanln()` stops at newline or EOF, and `Scanc()` stops at the requested byte or EOF. For a CRLF line ending, `Scanln()` consumes the LF and leaves the preceding CR in the returned string. Reaching EOF is a successful scan result, even when no bytes remain.\n\n`scanner.Scann(n)` returns `Result<io.ScanResult>`. Its `Bytes` field is an `i8[]` containing only the bytes actually read, with no padding. Its `End` field is true when EOF prevented the scanner from filling the request. Asking for zero bytes succeeds without consuming input; a negative count panics. This differs from `File.Readn(n)`, whose returned array always has length `n` and zero-fills unused positions.\n\n`HasNext()`, `HasNextln()`, and `HasNextc(delimiter)` return `Result<bool>` without waiting for more input. They inspect buffered data and the operating system’s current readiness state. A successful `true` means a complete segment is available, or EOF has left remaining data to consume. A readiness failure is an error result, not `false`. Readiness is only a snapshot: another reader can consume input before the next scan.",
        "after": "The example opens `input.txt` for reading, consumes one line without its newline, prints that line, and closes the shared file handle. Each `.unwrap()` turns a recoverable I/O error into a panic for this small example. In application code, inspect the returned `Result` when an error should be handled without stopping the operation.",
        "code": "package main;\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    file := os.Open(\"input.txt\", os.FileMode.Read).unwrap();\n    scanner := io.NewScanner(file);\n    line := scanner.Scanln().unwrap();\n    io.Println(line).unwrap();\n    file.Close();\n}\n",
        "note": "",
        "table": {"headers": ["FileMode", "Access and creation behavior"], "rows": [["`Read` / `Binary`", "Read an existing file; no writing. `Binary` selects the binary form."], ["`Write` / `BinaryWrite`", "Write a file, creating it if needed and truncating an existing file."], ["`ReadWrite` / `BinaryReadWrite`", "Read and write; create the file if needed without truncating existing contents."], ["`Append` / `BinaryAppend`", "Write at the end of the file, creating it if needed."], ["`ReadAppend` / `BinaryReadAppend`", "Read the file and append writes at the end, creating it if needed."]]}
      },
      {
        "id": "byte-reads",
        "title": "Byte reads, binary files, and file positions",
        "text": "A file’s position is the byte offset used by its next read or write. Copies of an `os.File` share that position. `Read()`, `Readn(n)`, and `Readend()` advance it as they consume bytes. `Readall()` instead reads the whole file and attempts to restore the previous position and EOF state, including after a read failure. If restoration fails, it returns an error and discards buffered scanner state. `Setpos(position)` also discards scanner buffers so later scans do not use bytes from the old position.\n\nEnd-of-file and a failed read are different outcomes. For example, `Read()` returns a successful `-1` at EOF, whereas a closed file, missing read permission, or native I/O failure returns an error `Result`. Calling `Read()` again after EOF has already been reported panics. A negative requested byte count also panics. Check the success or EOF indicator documented for the particular operation rather than treating every empty result as an error.\n\nA failed operation may already have consumed input or written part of its output; failure does not promise that the file position and contents are unchanged. If a native close fails, the library does not retry it because the operating system may already have released the handle.\n\n`File.IsOpen()`, `CanRead()`, `CanWrite()`, and `IsBinary()` return booleans describing the shared file state. `os.FromDescriptor(fd, readable, writable)` adopts a native descriptor as a text stream; a negative descriptor panics. `File.NativeHandle()` returns the native handle and panics when the file is closed. Keep one scanner per stream and avoid interleaving its buffered operations with direct reads or writes.\n\nThe printing functions `io.Print`, `Println`, `Printf`, and `Printfln` return `Result<int>`. A successful result contains the number of bytes written, including the newline for the newline-producing functions. Native output failures return errors; Unix output retries interrupted writes. `io.Sprintf` returns `Result<string>` and reports a mismatch between placeholders and arguments. `io.Sprint` returns a plain string. These conversion and formatting functions support the full unsigned integer ranges, including the `u64` maximum `18446744073709551615`.",
        "after": "If the file contains fewer than sixteen remaining bytes, `read.End` is `true` and `read.Bytes` still has sixteen elements, with zeroes in the unread positions. `Setpos(0)` then returns to the beginning. `Readall()` reads the whole file while restoring that position, and `Close()` releases the shared handle.",
        "code": "file := os.Open(\"data.bin\", os.FileMode.Binary).unwrap();\nread := file.Readn(16).unwrap();\nbytes := read.Bytes;\nshortRead := read.End;\nfile.Setpos(0);\nwholeFile := file.Readall().unwrap();\nfile.Close();\n",
        "note": "",
        "table": {
          "headers": [
            "File method",
            "Return value and behavior"
          ],
          "rows": [
            [
              "`Read()`",
              "`Result<int>`: unsigned byte 0–255, or -1 at EOF"
            ],
            [
              "`Readn(n)`",
              "`Result<os.ReadResult>`: `Bytes` is an `array<i8>` with exactly n elements; `End` is true if EOF prevents filling it. Unread positions contain zeroes."
            ],
            [
              "`Readend()`",
              "`Result<array<i8>>`: bytes from the current position through EOF; leaves the file positioned at EOF."
            ],
            [
              "`Readall()`",
              "`Result<array<i8>>`: all file bytes; attempts to restore the original position and EOF state before returning."
            ],
            [
              "`Readchunk(n)`",
              "`Result<i8[]>`: at most n bytes, with no zero padding; a successful empty array means no bytes remain at EOF."
            ],
            [
              "`Size()`",
              "`Result<int>`: size in bytes, requires a seekable file"
            ],
            [
              "`PollRead()`",
              "`Result<int>`: OS readiness information without blocking"
            ],
            [
              "`Write(text)`",
              "`Result<int>`: number of bytes written"
            ],
            [
              "`Close()`",
              "Closes the shared file; repeated close succeeds; native failure panics"
            ],
            [
              "`Setpos(position)`",
              "Sets the position for the next operation. Valid offsets run from zero through the file size, including EOF; an invalid offset or native failure panics."
            ]
          ]
        }
      }
    ]
  },

  {
    "slug": "library/reflect",
    "group": "Standard library",
    "title": "reflect",
    "description": "Inspect struct snapshots without depending on their native memory layout.",
    "sections": [
      {
        "id": "struct-snapshots",
        "title": "Struct snapshots",
        "text": "`Fields(value any)` returns `array<reflect.Field>` in declaration order. Each returned `Field` contains the field name in `Name string` and a boxed copy of its value in `Value any`. Private fields and immutable value-parameter fields are included.\n\nReflection is useful when code needs to inspect fields without hard-coding a particular struct declaration. The result is a snapshot: it records field names and boxed field values at the time of the call. It is not a mutable view through which the original struct can be edited.\n\nEach result element is a `reflect.Field`. `Name` identifies the field, and `Value` holds a boxed copy whose concrete type can be recovered with an assertion or type switch. Declaration order is preserved, including private fields and immutable value-parameter fields.",
        "code": "package main;\nimport \"io\";\nimport \"reflect\";\n\nstruct Person { name string; age int; }\n\nfunc main() {\n    person := Person{\"Ada\", 36};\n    for (i, field := range reflect.Fields(person)) {\n        io.Printfln(\"{}: {}\", field.Name, field.Value);\n    }\n}",
        "note": "",
        "after": "The program prints `name: Ada` and `age: 36` in that order. `io` can format each boxed value here without the caller writing a concrete assertion for every possible field type."
      },
      {
        "id": "copy-behavior",
        "title": "Copy behavior",
        "text": "`Field` values are independent deep copies, while pointer fields retain their non-owning addresses. `reflect.Fields` returns an empty array for a non-struct input. A pointer to a struct counts as a pointer input, not a struct input; the function does not dereference it automatically. `IsStruct(value any)` distinguishes an empty struct from a non-struct.\n\nAn owned string or nested array in a field is deep-copied into the snapshot. Later changes to the original struct do not change that stored field value. A pointer field copies only its address, so the snapshot is not a deep clone of an arbitrary graph of pointed-to objects.\n\n`IsStruct` is useful before interpreting an empty `Fields` result. An empty struct has no fields but is still a struct; a non-struct also returns no fields. Passing a pointer to a struct does not automatically inspect its pointee. Dereference a valid pointer explicitly if that is what you intend to inspect.",
        "code": "// Inside a function:\nisStruct := reflect.IsStruct(Person{\"Ada\", 36});\nfields := reflect.Fields(Person{\"Ada\", 36});\nname := fields[0].Value.(string);",
        "note": "",
        "after": "The assertion `.Value.(string)` requests the field’s concrete string value. In this particular struct the first field is known to be a string. For general-purpose inspection, use a type switch rather than assuming that every field has the same concrete type."
      },
      {
        "id": "trusted-library-implementation",
        "title": "Trusted library implementation",
        "text": "The compiler permits its internal reflection operations only in the `reflect` package loaded from the configured standard-library source root. Those operations are called compiler primitives; they are implementation hooks rather than ordinary functions available to application packages. Ordinary code uses the public Fields and IsStruct API. Copying a package or giving it the same name does not grant intrinsic access.\n\nThe public API is implemented with compiler primitives restricted to the configured standard-library root. This restriction concerns how the package is implemented, not who may import it: ordinary Ocean packages can call `reflect.Fields` and `reflect.IsStruct`.\n\nA package named `reflect` elsewhere does not receive the same primitive access. Neither a copied implementation nor a module replacement grants it. `OCEAN_SRC` explicitly changes the trusted library root during development, so configure it to the library checkout you intend to use.\n\nFor application code, depend on the public snapshot behavior rather than the internal primitive names or the native layout of a boxed value. That keeps ordinary reflection code independent of those implementation details.",
        "code": "",
        "note": ""
      }
    ]
  },
{
  "slug": "source",
  "group": "Contribute",
  "title": "Source code",
  "description": "Find the repositories for the Ocean compiler, standard library, and documentation.",
  "sections": [
    {
      "id": "compiler",
      "title": "Ocean compiler",
      "text": "The compiler, command-line tools, and language server live in `junglehornet/ocean-c` on Codeberg. The repository also contains compiler tests and implementation notes.",
      "code": "",
      "note": "",
      "links": [
        {
          "label": "Browse the compiler source ↗",
          "href": "https://codeberg.org/junglehornet/ocean-c"
        },
        {
          "label": "Building and compiler architecture →",
          "href": "/docs/contribute/compiler/"
        }
      ]
    },
    {
      "id": "library",
      "title": "Standard library",
      "text": "The `junglehornet/ocean-src` repository on Codeberg contains the Ocean sources for `io`, `os`, and `reflect`. It is maintained separately from the compiler.",
      "code": "",
      "note": "",
      "links": [
        {
          "label": "Browse the standard library ↗",
          "href": "https://codeberg.org/junglehornet/ocean-src"
        },
        {
          "label": "Standard library repository guide →",
          "href": "/docs/contribute/stdlib/"
        }
      ]
    },
    {
      "id": "website",
      "title": "Website and documentation",
      "text": "The SvelteKit website, documentation content, shared components, and styles live in `junglehornet/oceanlang-website` on GitHub.",
      "code": "",
      "note": "",
      "links": [
        {
          "label": "Browse the website source ↗",
          "href": "https://github.com/junglehornet/oceanlang-website"
        },
        {
          "label": "Contribute to the docs website →",
          "href": "/docs/contribute/website/"
        }
      ]
    }
  ]
},
{
  "slug": "contribute/compiler",
  "group": "Contribute",
  "title": "Building & compiler architecture",
  "description": "Build a development compiler, find each compilation stage, and choose the right tests for a change.",
  "sections": [
    {
      "id": "checkout",
      "title": "Check out the sources",
      "text": "Install Git, CMake 4.2 or newer, a C23-capable C compiler, Clang, and libffi development headers and libraries. Python 3 is required when tests are enabled, as they are by default. CMake selects Clang unless you choose another C compiler.\n\nClone the two repositories into sibling directories. The standard library is Ocean source loaded by the compiler; it does not have a separate native build.",
      "code": "git clone https://codeberg.org/junglehornet/ocean-c.git\ngit clone https://codeberg.org/junglehornet/ocean-src.git\ncd ocean-c",
      "note": ""
    },
    {
      "id": "build",
      "title": "Configure and build",
      "text": "Run these commands from `ocean-c`. An out-of-source Debug build keeps generated files separate and provides debugging information. `OCEAN_STANDARD_LIBRARY_SOURCE` selects the source tree copied during installation; `OCEAN_SRC` selects the library used while running the compiler.\n\nThe C compiler builds Ocean itself. Ocean emits textual LLVM IR and invokes Clang to produce and link native code. LLVM development libraries are not required; libffi supports native calls and boxed runtime values. It is a dependency of the compiler build even though LLVM development libraries are not.",
      "code": "cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug -DBUILD_TESTING=ON -DOCEAN_STANDARD_LIBRARY_SOURCE=\"../ocean-src\"\ncmake --build build --parallel\nctest --test-dir build --output-on-failure",
      "note": "",
      "after": "The build produces `build/ocean-c` and an `ocean` copy beside it. Rebuild after editing C sources. To change C compilers, configure a fresh build directory with `-DCMAKE_C_COMPILER=...` rather than reusing an incompatible CMake cache."
    },
    {
      "id": "try",
      "title": "Run against your library checkout",
      "text": "An uninstalled executable in `build/` will not automatically find the sibling `ocean-src` checkout. From the compiler repository, set `OCEAN_SRC` to that checkout and use an absolute path to your example package. A check validates the package graph, backend output, and native link without executing the program.",
      "code": "# Shell\nOCEAN_SRC=\"$PWD/../ocean-src\" ./build/ocean check /path/to/example\nOCEAN_SRC=\"$PWD/../ocean-src\" ./build/ocean run /path/to/example",
      "note": "",
      "after": "To test installation, configure with `-DCMAKE_INSTALL_PREFIX=\"$HOME/.local/ocean\"`, rebuild, and run `cmake --install build`. The prefix receives `bin/ocean` and `src/` containing library sources. Add its `bin/` directory to PATH. If testing cache behavior is not your goal, `OCEAN_BUILD_CACHE=off` can help isolate a compiler change."
    },
    {
      "id": "pipeline",
      "title": "Follow the compilation pipeline",
      "text": "Compiler implementation files live at the repository root. Start at `main.c` for command dispatch and tool invocation. Package loading brings together a graph of source files and imports; the scanner turns source text into tokens, and the parser turns those tokens into the abstract syntax tree (AST); semantic analysis resolves names and types; the backend lowers the program to LLVM IR. Clang handles native compilation and linking.",
      "code": "",
      "note": "",
      "table": {
        "headers": [
          "Files",
          "Responsibility"
        ],
        "rows": [
          [
            "`main.c`",
            "CLI commands, build/check/run orchestration, and native tool execution."
          ],
          [
            "`package.c`, `package.h`",
            "Package and module loading, import resolution, and standard-library lookup."
          ],
          [
            "`scanner.c`, `token.c`",
            "Lexing source text and representing tokens."
          ],
          [
            "`parser.c`, `ast.c` and their headers",
            "Parsing declarations and expressions, syntax structures, and AST utilities."
          ],
          [
            "`semantic.c`, `semantic.h`",
            "Bindings, type resolution, and semantic diagnostics."
          ],
          [
            "`backend.c`, `backend.h`",
            "LLVM emission, runtime helpers, and value ownership/cleanup lowering."
          ],
          [
            "`llvm_packages.c`",
            "Splitting emitted LLVM into package units."
          ],
          [
            "`build_cache.c`",
            "Generated IR and native-object caching."
          ],
          [
            "`lsp.c`, `lsp_semantic.inc`",
            "LSP transport, document state, diagnostics, and semantic editor features."
          ],
          [
            "`dynarray.c`, `c-hashmap/`, shared headers",
            "Supporting collections, type representations, source paths, and diagnostics."
          ]
        ]
      }
    },
    {
      "id": "tests",
      "title": "Choose tests for the change",
      "text": "`CMakeLists.txt` defines the compiler sources and registers the CTest suites. `tests/` contains C unit tests and Python integration tests. Parser suites inspect syntax directly; backend tests compile Ocean fixtures, inspect output, and run native programs. Other integration suites exercise import resolution, cache reuse, reflection behavior, and editor requests, so choose the suite for the behavior your change affects rather than only the file you edited.\n\nRun a focused suite while iterating, then run the full suite before submitting. A parser accepting a construct does not prove semantic or native support. A language change may need scanner/parser coverage, semantic rejection cases, runtime behavior, editor checks, and updated docs.",
      "code": "ctest --test-dir build -R parser --output-on-failure\nctest --test-dir build --output-on-failure",
      "note": "",
      "after": "Read `tests/README.md` for suite conventions and `tests/pending/README.md` plus `tests/pending/features.json` for tracked limitations. Pending cases can be skipped; a skip is not proof that a feature works. Include a focused regression for a bug and describe which tests you ran."
    }
  ]
},
{
  "slug": "contribute/stdlib",
  "group": "Contribute",
  "title": "Standard library repository",
  "description": "Understand the ocean-src layout, its compiler integration, and how to verify library changes.",
  "sections": [
    {
      "id": "layout",
      "title": "Repository layout",
      "text": "`ocean-src` is the standard-library source root. Each package is a directory beneath that root and is imported by its directory path: `import \"io\";` resolves the `io` directory under the configured library root. Source files begin with their package declaration. The current repository is small; it does not contain a general-purpose collection of packages borrowed from another language.",
      "code": "",
      "note": "",
      "table": {
        "headers": [
          "Path",
          "Contents"
        ],
        "rows": [
          [
            "`README.md`",
            "Repository introduction."
          ],
          [
            "`io/io.oc`",
            "Output, string conversion, and placeholder formatting."
          ],
          [
            "`os/args.oc`",
            "Process argument storage, initialization hook, and public Args function."
          ],
          [
            "`reflect/reflect.oc`",
            "Field snapshot API backed by restricted compiler primitives."
          ],
          [
            "`reflect/README.md`",
            "Reflection semantics, ownership rules, and trusted-source restrictions."
          ]
        ]
      }
    },
    {
      "id": "relationships",
      "title": "How packages connect to the compiler",
      "text": "`io` implements printing and formatting in Ocean, including reflected struct formatting, portable float conversion, and platform assembly for stdout. `os` provides process arguments, standard streams, native File values, FileMode, Open, and Close; application code calls `os.Args()` for arguments. `reflect` exposes `Field`, `Fields`, and `IsStruct`.\n\nReflection primitives are available only to the actual `reflect` package under the configured standard-library root. A project-local package with the same name does not gain access. If a library change depends on a new compiler hook or native calling convention, update and test the compiler alongside the library. Merely editing the `.oc` source cannot add support that the compiler does not implement.",
      "code": "",
      "note": ""
    },
    {
      "id": "development",
      "title": "Work directly from the checkout",
      "text": "Clone the library beside the compiler and point `OCEAN_SRC` at its absolute path. Run these commands from the directory containing both repositories, after building the compiler. Replace `/path/to/example` with a package that exercises your change.",
      "code": "git clone https://codeberg.org/junglehornet/ocean-src.git\n# With a built sibling ocean-c checkout:\nOCEAN_SRC=\"$PWD/ocean-src\" ./ocean-c/build/ocean check /path/to/example\nOCEAN_SRC=\"$PWD/ocean-src\" ./ocean-c/build/ocean run /path/to/example",
      "note": "",
      "after": "There is no separate library compilation or npm/CMake build in this repository. Ocean compiles the required library packages with the importing program. For installation, preserve the package directories under the installed `src/` root."
    },
    {
      "id": "changes",
      "title": "Add or change a package",
      "text": "Keep each package in its own directory and use a matching package declaration. Follow existing export conventions: public names start with an uppercase letter. Add source files to the package directory when splitting an implementation.\n\nExercise new behavior from a small importing program. For compiler-integrated behavior, add regression coverage to the compiler repository: `tests/io_backend_test.py`, `tests/os_args_test.py`, and `tests/reflect_test.py` cover the current packages. Run the relevant CTest suites and update the corresponding reference page in this website. Preserve the documented copy behavior when changing an API. In particular, test whether returned strings, arrays, maps, and boxed values remain valid after local source values leave scope, and whether a reflected snapshot is independent of later changes to the source struct.",
      "code": "",
      "note": "",
      "links": [
        {
          "label": "Standard library API documentation →",
          "href": "/docs/library/io/"
        }
      ]
    }
  ]
},
{
  "slug": "contribute/website",
  "group": "Contribute",
  "title": "Contribute to the docs website",
  "description": "Clone the website, run it locally, and add documentation pages through the shared content model.",
  "sections": [
    {
      "id": "setup",
      "title": "Clone and start the website",
      "text": "Install a current Node.js version compatible with the checked-in dependencies and npm. Clone the website repository and install the locked dependency versions. Generate Cloudflare runtime types before starting the development server.",
      "code": "git clone https://github.com/junglehornet/oceanlang-website.git\ncd oceanlang-website\nnpm ci\nnpm run gen\nnpm run dev",
      "note": "",
      "after": "Open the local URL printed by Vite. The website uses SvelteKit, Svelte 5, TypeScript, and the Cloudflare adapter. Local content editing does not require deploying the site."
    },
    {
      "id": "files",
      "title": "Find the content and components",
      "text": "Most documentation edits belong in `src/lib/docs.ts`. The catch-all docs route looks up a page by slug and renders its sections. The shared layout and index read the same content to build navigation.",
      "code": "",
      "note": "",
      "table": {
        "headers": [
          "Path",
          "Purpose"
        ],
        "rows": [
          [
            "`src/lib/docs.ts`",
            "Pages, section content, sidebar groups, and reading order."
          ],
          [
            "`src/routes/docs/[...slug]/+page.ts`",
            "Page lookup, prerender entries, and previous/next pages."
          ],
          [
            "`src/routes/docs/[...slug]/+page.svelte`",
            "Shared article renderer and navigation buttons."
          ],
          [
            "`src/routes/docs/+layout.svelte`, `+page.svelte`",
            "Documentation sidebar and index."
          ],
          [
            "`src/routes/+layout.svelte`",
            "Site navigation, theme, and document search."
          ],
          [
            "`src/lib/components/`",
            "Code blocks, inline code, prose, and logo components."
          ],
          [
            "`src/routes/layout.css`",
            "Shared styles and responsive layout."
          ]
        ]
      }
    },
    {
      "id": "page",
      "title": "Add a documentation page",
      "text": "Add a `Doc` object to the `docs` array in `src/lib/docs.ts`. The slug supplies the URL path after `/docs/`; for example, `language/collections` becomes `/docs/language/collections/`. Choose a slug not already used by another page, without a leading or trailing slash, select an existing group, and add a title, description, and sections. Array order controls the previous/next buttons. To introduce a group, also add its name to `groups`.\n\nEach section needs a unique `id` within the page, a title, text, code, and note. Use empty strings for an unused code example or note. Optional `after` text explains an example, `table` supplies headers and rows, and `links` supplies labeled URLs. Separate paragraphs with blank lines and wrap inline code in backticks. In `text`, `after`, and `note`, use `\\n\\n` in the TypeScript string to separate paragraphs and backticks to mark inline code. Other Markdown features and raw HTML are displayed as text, not rendered. For clickable links, use the section’s `links` array rather than Markdown link syntax.",
      "code": "// In the docs array in src/lib/docs.ts:\n{\n  slug: \"contribute/example\",\n  group: \"Contribute\",\n  title: \"Example guide\",\n  description: \"Explain what readers will learn.\",\n  sections: [{\n    id: \"overview\",\n    title: \"Overview\",\n    text: \"Describe the workflow and use `inline code` for names.\",\n    code: \"\",\n    note: \"\",\n    links: [{ label: \"Source code\", href: \"/docs/source/\" }]\n  }]\n}",
      "note": "",
      "after": "A content entry automatically appears in the sidebar, documentation index, search, prerender entries, and reading sequence. It does not need a dedicated Svelte route. Keep examples grounded in the compiler and library sources and verify executable examples with Ocean."
    },
    {
      "id": "validate",
      "title": "Check and build",
      "text": "Run the type checks and production build after editing. The build generates runtime types and prerenders the documentation. The production build turns each documentation page into prerendered output. The preview command starts a local Wrangler server for that output; it does not deploy the site.",
      "code": "# Shell\nnpm run check\nnpm run build\nnpm run preview",
      "note": "",
      "after": "Review the edited page at desktop and mobile widths, follow its previous/next links, check the sidebar and search, and try any changed code samples. In your contribution, describe the content or behavior changed and report the checks you ran. Submit documentation changes through a pull request rather than running `npm run deploy`. The repository’s deployment workflow publishes the website automatically after the pull request is merged into `main` on GitHub."
    }
  ]
}
];
export const groups = ["Start here", "Language guide", "Tooling", "Standard library", "Contribute"];
