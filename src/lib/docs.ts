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
        "text": "Ocean currently builds from source. Clone the compiler and standard library into sibling directories. Git is needed for the checkout and for external module downloads. The links below point to the project’s source repositories.\n\nThe compiler and library are separate repositories. Once compiled, the ocean binary will search for the standard library at `<binary-path>/../src/.` The recommended installation method is to create a directory `/usr/local/lib/ocean/` and then add `bin` and `src` directories inside the ocean directory. Place the compiler binary inside the bin directory and add the directory to your path. Copy the standard library source code to the src directory.\n\nIMPORTANT: Do not compile the standard library. Directly copy the source files into the src directory, preserving the directory structure from the ocean-src repo.\n\nThe commands below create `ocean-c` and `ocean-src` in your current directory, then enter the compiler checkout. Choose a parent directory where you normally keep development projects. After you have created `/usr/local/lib/ocean/src/` you can use the command `sudo rsync -av --include=\"*/\" --include=\"*.oc\" --exclude=\"*\" ./ocean-src/ /usr/local/lib/ocean/src` while in the directory containing `ocean-src` (the one you ran `git clone` in) to copy the standard library into the required location.",
        "code": "git clone https://codeberg.org/junglehornet/ocean-c.git\ngit clone https://codeberg.org/junglehornet/ocean-src.git\ncd ocean-c",
        "note": "",
        "after": "The remaining build commands run inside `ocean-c`. Once Ocean is installed, your own programs can live in any other directory; they do not need to be placed inside either source repository."
      },
      {
        "id": "1",
        "title": "Build the compiler",
        "text": "You need CMake, a C23-capable C compiler, libffi development headers, and Clang on your PATH. Run these commands from your Ocean compiler checkout. The compiler generates textual LLVM IR and uses Clang to produce native code; LLVM development libraries are not required.\n\nCMake configures the build, and the C compiler builds Ocean itself. Clang has a separate job: it compiles the LLVM output of your Ocean programs and links their native executables. Make sure both your C compiler and Clang are installed, even if you already have one of them.\n\nThe `build` directory holds generated build files and compiler binaries. Keeping those files separate from the source makes it easier to rebuild or change configuration later. The final command runs the compiler’s test suite and reports any failures.",
        "code": "cmake -S . -B build\ncmake --build build\nctest --test-dir build --output-on-failure",
        "note": "Ocean is under active development. These docs describe the current compiler and standard-library source, rather than promising a stable release API.",
        "after": "After a successful build, `build/ocean` is available directly from this checkout. If CMake reports missing libffi headers or libraries, install your operating system’s libffi development package and configure the build again. Package names and installation commands depend on your system."
      },
      {
        "id": "2",
        "title": "Install Ocean and its library",
        "text": "The default standard-library source is the sibling src directory to the executable. If your checkout is elsewhere, set `OCEAN_STANDARD_LIBRARY_SOURCE` when configuring CMake. Install to a prefix you can write to, then `add` its bin directory to your PATH.\n\nInstallation copies the executable and standard-library sources into a common prefix. The compiler normally looks for library packages relative to its own executable, so using the installed layout avoids setting a library path for every command. The example uses a user-owned prefix and does not require a system-wide installation. For a system-wide installation the prefix `/usr/local/lib` is recommended.\n\nReplace `/path/to/src` with the actual library checkout. If you cloned both repositories into the same parent directory then if you rename `ocean-src` to `src`, the default source location will already point there. However, spelling it out makes the relationship explicit.",
        "code": "cmake -S . -B build -DCMAKE_INSTALL_PREFIX=\"$HOME/.local\" \\\n  -DOCEAN_STANDARD_LIBRARY_SOURCE=/path/to/src\ncmake --build build\ncmake --install build\nexport PATH=\"$HOME/.local/bin:$PATH\"",
        "note": "The installed layout places the compiler in bin/ and library packages in src/. OCEAN_SRC can override the library source directory.",
        "after": "The `export` command affects the current shell. To make it permanent, add the equivalent PATH setting to your shell configuration. You can also run the installed compiler using its full path. `OCEAN_SRC` is useful when testing changes in a separate standard-library checkout."
      },
      {
        "id": "3",
        "title": "Write your first program",
        "text": "Create a new directory, run `ocean mod init` to initialize the project, and save the following as `main.oc`. Every Ocean file starts with a package declaration. A root package named `main` can build into an executable.\n\nUse a directory containing only this example while you are getting started. Ocean compiles packages rather than isolated files, so an unrelated `.oc` file in the same directory will also be part of the program. You can call the new directory `hello`; the source filename itself does not determine the package name.\n\n`package main;` identifies an executable package. `import \"io\";` makes the standard output functions available in this file. When the executable starts, Ocean calls `main`, whose body prints the message and then finishes.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Hello, Ocean!\");\n}",
        "note": "",
        "after": "Save the file before running the next commands. The string is enclosed in double quotes, the call ends with a semicolon, and the closing brace ends the function body. This program should print `Hello, Ocean!` followed by a newline."
      },
      {
        "id": "4",
        "title": "Check, run, build",
        "text": "Run these commands inside your program directory. `check` validates the package and its imports without executing your program. `run` builds and executes a temporary executable. `build` creates a native executable you can keep.\n\nStart with `ocean check .` when you want feedback without running code. It checks the complete package graph and verifies that native code can be produced and linked. This means a missing native toolchain can fail a check even when the Ocean syntax is valid.\n\n`ocean run .` is convenient during development because it removes the temporary executable afterward. Use `ocean build` when you want an executable to run again, distribute, or inspect separately. The optional `-o` option chooses its output filename, which will default to the name of the directory containing the ocean.mod file.",
        "code": "ocean check .\nocean run .\nocean build . -o hello\n./hello",
        "note": "A file argument selects its entire containing package directory, not just that file. Put unrelated programs in separate directories.",
        "after": "The dot refers to your current directory. The last command runs the executable produced by the preceding build. If `io` cannot be resolved, check that the standard library was installed alongside Ocean or that `OCEAN_SRC` points to the library source directory."
      },
      {
        "id": "5",
        "title": "Read the syntax",
        "text": "Statements end with a semicolon unless they end in a block. Braces enclose function bodies and control-flow blocks. In a declaration, the name comes before its type. Use := when the compiler can infer the type.\n\nFor example, `value int` declares an integer parameter, and the `int` following the closing parenthesis declares the result type. A call to `twice` must supply a compatible value, and its result is itself an integer. Local type inference saves you from repeating that type in `answer := twice(21);`.\n\nOcean still checks inferred variables statically. Once a variable has an inferred type, assigning a different kind of value does not change that type. Use explicit type annotations at interfaces or where they make the code easier to understand.",
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
        "id": "1",
        "title": "Declarations and inference",
        "text": "Use `name: Type` for an explicit variable declaration, or `name := value` to infer its type. Variable declarations without initializers (eg. `x: int;`) receive their default value. A name declared in an inner block can shadow an outer name.\n\nNeither form of variable declaration makes a variable immutable. After declaration, use `=` or a compound assignment such as `+=` to change its value. The new value must remain compatible with the variable’s type.\n\nA block creates a lexical scope. A local name is available from its declaration within that scope, including nested blocks unless another declaration shadows it. Prefer a different name when shadowing would make it unclear which value an expression uses.",
        "code": "count := 12;\ndepth: float = 42.5;\nready: bool;              // false\ncount += 3;\ncount++;",
        "note": "",
        "after": "Here, `count` is inferred as `int`, `depth` is explicitly a `float`, and `ready` starts as `false`. The two updates leave `count` equal to `16`. Use `count = ...` for another assignment; another declaration is a different operation."
      },
      {
        "id": "2",
        "title": "Built-in scalar types",
        "text": "`int` and `i64` are signed 64-bit integers. `i32`, `i16`, and `i8` provide narrower signed storage. `uint`, `u64`, `u32`, `u16`, and `u8` provide unsigned integers. `float` and `f64` are double precision; `f32` is single precision. `bool` holds `true` or `false`. `string` stores immutable bytes. Choose explicit widths for binary data and C interfaces.\n\nUse `int` for ordinary integer values unless a storage or interface requirement calls for a particular width. Ocean’s `int` is 64-bit; it should not be assumed to have the same width as a C `int`. Floating-point values have different precision and rounding behavior from integers, so choose them for quantities that need fractional values.\n\nInteger literals, including negative literals, automatically convert in float contexts: `depth == 0` and calls such as `measure(2)` work when the value or parameter is a float. Typed initializers, assignments, returns, and arithmetic also accept integer literals. Integer variables and expressions such as `1 + 2` still require an explicit cast; `count := 0` still infers `int`.\n\nAn arrow cast, written `value -> Type`, requests an explicit conversion. It makes a type change visible at the expression where it occurs. For a compound target such as a pointer type, put the target in parentheses.",
        "code": "small: i32 = 7;\nwide := small -> int;\nratio := 3.5;\nwhole := ratio -> int;\nnonzero := whole -> bool;",
        "note": "",
        "after": "The first conversion widens an `i32` to `int`. Converting `3.5` to `int` produces an integer, and converting a number to `bool` tests whether it is nonzero. A cast can lose information; choose the destination type according to the values your program needs to represent.",
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
        "id": "3",
        "title": "Operators",
        "text": "Arithmetic uses +, -, *, /, and %. Comparisons use ==, !=, <, <=, >, and >=. Boolean && and || short-circuit: the right operand is evaluated only when needed. Integer bit operations are supported. The conditional expression uses condition ? yes : no.\n\nUse parentheses when an expression combines several operations and their grouping would otherwise be hard to follow. Short-circuit evaluation is especially useful for guards: a condition can establish that a later expression is safe before the expression is evaluated.\n\nThe conditional expression produces one of two values. It is useful for a small choice inside an assignment, such as choosing a label. For branches that perform several operations, use an `if` statement instead so each path remains easy to read.",
        "code": "label := count > 10 ? \"many\" : \"few\";\nsafe := count != 0 && 100 / count > 2;",
        "note": "",
        "after": "In the second expression, the division is evaluated only when `count` is nonzero. This guard prevents division by zero. The label expression chooses `\"many\"` or `\"few\"`; both alternatives are strings, so the result has a consistent type."
      },
      {
        "id": "4",
        "title": "Default values",
        "text": "`zero(Type)` explicitly constructs a default value. Its argument is a type, not a value. Struct fields default recursively, strings and dynamic arrays are empty, and numbers are `zero`.\n\nDefault initialization lets you declare a counter, flag, or empty collection without writing a literal initializer. `zero(Type)` is useful when you want to express the same default explicitly, especially in generic code where the concrete type is a parameter. It constructs a value; it does not call a user-defined constructor.\n\nFor a struct, defaulting proceeds through its stored fields. For a fixed buffer, every element receives a default value. An empty string and an empty dynamic array are valid values with length zero, rather than missing values.",
        "code": "count := zero(int);\ntext := zero(string);\nitems := zero(int[]);",
        "note": "A default pointer has a zero address, which is distinct from Ocean’s explicit null marker. Initialize optional pointers to null explicitly.",
        "after": "Notice that `zero(int[])` takes the array type itself. Passing a variable to `zero` is not an alternative spelling for clearing it. A reset is an assignment such as `count = zero(int);`. Pointer defaults need extra care because the zero address and explicit `null` are distinct in Ocean."
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
        "id": "1",
        "title": "Conditions",
        "text": "An `if` statement chooses a branch using a boolean condition. Braces group statements; a single statement can follow the condition directly.\n\nConditions must produce a boolean. A comparison such as `depth > 100` supplies one directly; a variable of type `bool` can also be used as the condition. Ocean evaluates the condition and executes only the selected branch. You can extend an `else` with another `if` when several conditions should be checked in order.\n\nThe example assumes `depth` has already been declared. Both branches are braced even though each contains one statement, which keeps the structure clear if more statements are added later.",
        "code": "if (depth > 100) {\n    io.Println(\"Deep water\");\n} else {\n    io.Println(\"Near the surface\");\n}",
        "note": "",
        "after": "A depth greater than `100` prints `Deep water`; every other value takes the `else` branch. A condition alone does not create a repeated operation. Use a loop when the test and body need to run more than once."
      },
      {
        "id": "2",
        "title": "Counting and range loops",
        "text": "Use `for` for counted loops and `range` traversal. In a two-binding `range`, the first binding receives the index and the second receives a copy of the element. A single binding receives the index, not the element.\n\nThe counted form has an initializer, a condition, and an update separated by semicolons. The initializer runs once, the condition is tested before each iteration, and the update runs as the loop advances. A `for (;;)` loop has no stopping condition and normally needs a `break` or another terminating path.\n\nA range loop evaluates its collection expression once, then visits elements in index order. Its element binding is a value copy. Updating that local binding does not replace the corresponding element in the original array; use indexed assignment when you need that effect.",
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
        "note": "Here, `defer` modifies when the loop condition is first evaluated. It is separate from a deferred function-call statement, which the native backend does not currently implement.",
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
        "id": "3",
        "title": "Loop control",
        "text": "`break` exits a loop and `continue` advances to the next iteration. Labels let nested loops `break` or `continue` a named outer loop. The `range` index advances independently of changes you make to its visible binding.\n\nUse an unlabeled `break` or `continue` when you mean the innermost loop. In nested loops, a label names the loop that should receive the operation. This can be clearer than adding extra flags simply to communicate that an outer search is finished.\n\nFor a counted loop, `continue` advances through the update before the next condition test. For a range loop, it still advances to the next sequential index. Assigning to the visible range index does not change that traversal order.",
        "code": "outer: for (i := 0; i < 5; i++) {\n    for (j := 0; j < 5; j++) {\n        if (i + j > 4) break outer;\n    }\n}",
        "note": "",
        "after": "In this example, `break outer;` leaves both loops once a pair has a sum greater than four. An unlabeled `break;` at the same position would leave only the inner loop, allowing the outer loop to continue."
      },
      {
        "id": "4",
        "title": "Switches",
        "text": "Value switches compare against cases in source order. A matched case does not implicitly fall into the next one; use `fallthrough` explicitly when needed. A `default` branch handles unmatched values. Condition switches and type-guard switches are also supported.\n\nA value switch evaluates case tests in source order and runs the first matching case. Comma-separated case values share a body. The `default` body runs only if no case matches, regardless of where it is written. Put the default last when that makes the intended order easiest to see.\n\nEach case normally finishes without executing the next case. An explicit `fallthrough` requests that continuation. Type-guard switches use the same overall structure but select by concrete type; those are described in the generics guide.",
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
        "id": "1",
        "title": "Declare a function",
        "text": "Function parameters use name type ordering. The result type follows the parameter list. Functions can call declarations that appear later, and recursion is supported. Executables use `func main()` or `func main() int`.\n\nA function declaration separates the operations it performs from the places that call it. The parameter list gives each input a name and a type. Those names are local to the function body. A result type tells callers what value to expect; omitting it declares a function with no result.\n\n`return` ends the current call. In a value-returning function, provide an expression compatible with the result type. Functions declared in any source file of the same package can call one another without a separate forward declaration.",
        "code": "func add(left int, right int) int {\n    return left + right;\n}\n\nfunc main() int {\n    return add(2, 3);\n}",
        "note": "",
        "after": "The call `add(2, 3)` binds `left` to `2` and `right` to `3`, then returns `5`. Here `main` returns that number as the process exit status. For a program that simply prints output and succeeds, use `func main()` without a result type."
      },
      {
        "id": "2",
        "title": "Multiple results",
        "text": "List result types in parentheses and unpack a call into multiple bindings. Use _ to discard an individual result. A sole multiple-result call can forward its results to another return or supply every argument to a call.\n\nMultiple results are useful when an operation has both a value and a status. Callers can handle them together without defining a one-off wrapper struct. The number and types of expressions in a return must agree with the declared result list.\n\nIn the example, division by zero is an expected failure represented by `false`. The caller should check that flag before using the result as a successful quotient. When a result is deliberately unnecessary, use `_` for that position rather than introducing an unused descriptive name.",
        "code": "func divide(a int, b int) (int, bool) {\n    if (b == 0) return 0, false;\n    return a / b, true;\n}\n\n// Inside a function:\nvalue, ok := divide(12, 3);",
        "note": "",
        "after": "After `divide(12, 3)`, `value` is `4` and `ok` is `true`. Calling `divide(12, 0)` instead gives `0` and `false`. You can write `value, _ := divide(12, 3);` when a surrounding condition already guarantees a valid divisor."
      },
      {
        "id": "3",
        "title": "Variadic parameters",
        "text": "A final `...T` parameter accepts zero or more values. Use a final `array...` argument to expand an existing array. The callee receives an independent copy. `...any` accepts a mixture of concrete types.\n\nA variadic parameter gathers its arguments into an array that can be indexed or traversed. The element type after `...` constrains each supplied item. A variadic parameter must be last, after any required fixed parameters. A call with no variadic items provides an empty collection.\n\nExpansion is written on the final argument expression, not on each element. It can follow explicit variadic items, so `total(10, numbers...)` includes ten before the array contents. Raw buffers cannot be expanded because they do not carry the required array length.",
        "code": "func total(values ...int) int {\n    result := 0;\n    for (i, value := range values) {\n        result += value;\n    }\n    return result;\n}\n\n// Inside a function:\nnumbers := int[]{2, 4, 6};\nanswer := total(numbers...);",
        "note": "",
        "after": "The call shown returns `12`. Inside `total`, each range iteration adds an element copy to `result`. Passing `numbers...` does not make the function share mutable ownership of the caller’s collection; the value-copy rules still apply."
      },
      {
        "id": "4",
        "title": "Values and shared mutation",
        "text": "Arrays, strings, and structs are copied when passed by value, including owned nested values. To mutate a caller’s value, pass an explicit pointer. Pointer receivers can borrow addressable values automatically.\n\nA copied parameter is local to the call. This rule applies to nested strings and arrays in structs as well as top-level collections. It can make code easier to reason about, but copying a large value is still real work. Choose a pointer when you intend to share the original object rather than relying on an accidental alias.\n\nIn a pointer parameter such as `*int`, the asterisk is part of the type. At the call site, `&count` supplies the address of the variable. In the body, `*value` accesses that variable through the pointer.",
        "code": "func increment(value *int) {\n    *value += 1;\n}\n\n// Inside a function:\ncount := 4;\nincrement(&count);",
        "note": "Write explicit returns. A value-returning function that reaches its end currently returns zero and emits a warning. Closures, function values, and bound method values are not implemented.",
        "after": "After `increment(&count)`, the caller’s `count` is `5`. If the function instead accepted `value int` and incremented it, only its local copy would change. Pointer lifetime and explicit heap allocation are covered in the memory guide."
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
        "text": "Every `.oc` file starts with a package declaration. All Ocean files in a directory must declare the same package. Functions, types, and global variables are shared across those files, including lowercase helpers. Subdirectories are separate packages. Passing a source file to the compiler selects its entire directory. Only a root package named `main` gets an executable entry point.",
        "code": "package main;\n\nfunc main() int {\n    return answer();\n}\n\n// In helper.oc in the same directory:\n// package main;\n// func answer() int { return 42; }",
        "note": ""
      },
      {
        "id": "layout",
        "title": "Create a module and a package",
        "text": "Run `ocean mod init example.com/app` in your project directory. This creates `ocean.mod`. Save the library below as `greeting/greeting.oc`, and the importing program as `main.oc` in the project root. Run `ocean check .` to validate both packages or `ocean run .` to execute the program.",
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
        "text": "The import path identifies the package directory; the default qualifier comes from its declared package name. Module-relative paths such as `\"greeting\"` are also accepted. Standard-library imports such as `\"io\"` resolve under the installed source directory, which `OCEAN_SRC` can override. External modules resolve through the module configuration and Git cache. An `as` alias changes the qualifier for the current file. Each file must declare the imports it uses.",
        "code": "package main;\n\nimport \"example.com/app/greeting\" as hello;\nimport \"io\";\n\nfunc main() {\n    io.Println(hello.Message());\n}",
        "note": ""
      },
      {
        "id": "visibility",
        "title": "Exports, dot imports, and blank imports",
        "text": "Names beginning with an uppercase letter are exported. Lowercase declarations remain private to their package. This applies to functions, types, globals, receiver methods, interfaces, aliases, and enum types and variants. Extern declarations are file-scoped and are not exported through imports. A dot import introduces exported names without a qualifier; collisions can make a reference ambiguous. A blank import loads and initializes the package without binding its names.",
        "code": "import . \"example.com/app/greeting\";\nimport _ \"example.com/app/setup\";\n\n// Inside a function, the dot import allows:\nmessage := Message();",
        "note": "Each example import requires a package at that path. The setup package is illustrative."
      },
      {
        "id": "methods",
        "title": "Methods belong to the defining package",
        "text": "A receiver method must be declared in the package that defines its receiver type. It may be in a different file within that package. You cannot add methods to imported types, including types brought into scope by dot imports or local aliases of imported types. A type alias preserves the original type identity; a distinct local type definition creates a new type on which local methods can be declared.",
        "code": "// In the greeting package:\nstruct Greeting { text string; }\n\nfunc (message Greeting) Text() string {\n    return message.text;\n}",
        "note": "Package-qualified receiver syntax such as `func (x greeting.Message) Extra()` is also rejected by the parser."
      },
      {
        "id": "initialization",
        "title": "Initialization and package errors",
        "text": "Imported packages initialize before their importers. Within a package, files are sorted by filename and globals initialize in declaration order, after default initialization. Avoid relying on forward references to obtain an already initialized value. Import cycles, conflicting package declarations, ambiguous imported names, and access to private declarations are errors.",
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
        "id": "1",
        "title": "String values",
        "text": "A `string` is an immutable, heap-backed sequence of `i8` bytes. `len(text)`, `.length`, `.capacity`, and `.size` all report byte counts, however `len(text)` is the idiomatic way to get the length/byte count in Ocean; avoid the other forms. Indexing reads a signed byte and checks bounds. Equality compares all bytes, including embedded NUL bytes.\n\nImmutability applies to the bytes of a string value. You can still assign a new string to a string variable, and `+=` constructs and assigns a concatenation. Neither operation grants permission to mutate the original byte storage through an index. This distinction matters when several variables began with equal text.\n\nStrings compare by content, not by allocation address. Two independently created strings with the same bytes are equal. A byte count is useful for output and storage, but it is not necessarily the number of characters a person sees as some unicode characters are multiple bytes long. If your text is all ASCII characters then you can assume byte count = character count.",
        "code": "greeting := \"Hello, Ocean!\";\nlength := len(greeting);\nsame := greeting == \"Hello, Ocean!\";\ngreeting += \"\\n\";",
        "note": "",
        "after": "The initial value has thirteen bytes, and `same` is `true`. Appending a newline replaces `greeting` with a new value containing one extra byte. A previous copy of the string would still contain its original text."
      },
      {
        "id": "2",
        "title": "Unicode and escapes",
        "text": "Source identifiers support Unicode 16.0 identifier characters. Strings encode Unicode escapes as UTF-8. Character literals decode Unicode scalar values. Indexing and `range` on a `string` still work on bytes, not user-perceived characters.\n\nA source file is read as UTF-8. Common escapes include `\\n` for a newline, `\\t` for a tab, `\\\"` for a quote, and `\\\\` for a backslash. Unicode escapes specify a scalar value that is encoded into one or more UTF-8 bytes in the resulting string. Invalid UTF-8 and invalid scalar escapes are rejected.\n\nKeep byte operations separate from character operations. For example, indexing a non-ASCII string may read only one byte of a multi-byte encoding. It is not a Unicode character decoder, and a range loop over a string does not change that fact.",
        "code": "text := \"A wave: \\u2248\";\nline := \"first\\nsecond\";\nquote := \"say \\\"hello\\\"\";",
        "note": "",
        "after": "The first string contains the approximately-equal symbol (≈). The second contains an actual newline between two words; it does not contain a literal backslash followed by `n`. The last string contains double quotes around `hello`."
      },
      {
        "id": "3",
        "title": "Mutable bytes",
        "text": "Convert or assign a `string` to `i8[]` to obtain an independent mutable copy. Replacing a `string` allocates a new value; you cannot write its elements or call dynamic array mutation methods on it.\n\nA byte array is the appropriate representation when an algorithm needs to change individual bytes. The conversion from a string gives the array its own storage, so mutations do not affect the source string. Converting the array back to a string also makes an independent value.\n\nThis is useful when preparing writable data for a native API or when performing an explicitly byte-oriented transformation. It does not make arbitrary edits to UTF-8 safe: changing one byte inside a multi-byte sequence can still produce invalid encoded text.",
        "code": "text := \"Ocean\";\nbytes: i8[] = text;\nbytes[0] = 'o';\n// text is still \"Ocean\".",
        "note": "",
        "after": "Only the first byte of `bytes` changes. The original `text` remains `\"Ocean\"`, while the mutable array now contains the bytes for `\"ocean\"`. Both owned values are cleaned up when their scopes end."
      },
      {
        "id": "4",
        "title": "Formatting output",
        "text": "The io package uses {} placeholders rather than C printf format specifiers. `Println` appends a newline. `Sprint` and `Sprintf` return strings. Supply explicit spaces in text: `Sprint` only inserts a space between adjacent non-`string` items.\n\nChoose the formatting function according to where the result should go. `io.Printfln` writes formatted text and a newline to standard output. `io.Sprintf` builds a string for later use, which is useful when constructing a message without printing it immediately.\n\nA pair of braces consumes one argument in order. The template supplies punctuation, units, and spacing. This is usually easier to read than assembling a message through several concatenations, especially when the values are numbers or other non-string types.",
        "code": "import \"io\";\n\n// Inside a function:\nio.Printfln(\"Depth: {} meters\", 42);\nmessage := io.Sprintf(\"Hello, {}!\", \"Ocean\");",
        "note": "",
        "after": "The printed line is `Depth: 42 meters`. The second call stores `Hello, Ocean!` in `message`; it produces no output by itself. Import `io` at the top of any source file that uses these qualified names."
      }
    ]
  },
  {
    "slug": "language/collections",
    "group": "Language guide",
    "title": "Arrays & buffers",
    "description": "Choose the collection that fits its lifetime, size, and access requirements.",
    "sections": [
      {
        "id": "1",
        "title": "Three collection forms",
        "text": "`T[]` is a heap-backed dynamic array, `T[n]` is a sized array value, and `buffer<T>[n]` is raw contiguous storage. `array<T>` accepts sized arrays of any length. Ordinary array indexing checks bounds; raw buffer indexing is unchecked.\n\nStart with a dynamic array when your collection needs to grow or shrink. Use a sized array when the value has a particular extent or when you want to pass a sized value through `array<T>`. Raw buffers are lower-level storage views and are mainly useful when an interface requires contiguous memory without Ocean’s ordinary array checks.\n\nAll three forms specify an element type. A literal body gives the initial elements, and an explicit declaration selects which collection representation receives them. The similar-looking syntax is worth reading carefully: a bracketed length in a declaration is different from a bare allocation expression.",
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
              "Raw contiguous storage with a lexical length"
            ],
            [
              "`buffer<T>[]`",
              "A raw view passed with a separate count"
            ]
          ]
        }
      },
      {
        "id": "2",
        "title": "Grow and remove",
        "text": "Dynamic arrays own their payload. `append` adds at the end, `prepend` adds at the beginning, and `add` inserts at an index. `remove` returns the removed element and shifts later values left. `pop` removes and returns the last element.\n\nInsertion methods take values compatible with the element type. `append` and `prepend` can accept several values, and `add(index, ...)` inserts before the element currently at that index. These operations can replace the backing allocation as the collection grows.\n\nRemoval transfers the removed element into the returned value. Nested owned data remains independently owned, so removing a string does not leave the result referring to freed collection storage. Invalid removal indices and popping an empty collection report a bounds error.",
        "code": "items := make(int[]);\nitems.append(2, 3);\nitems.prepend(1);\nitems.add(1, 8);\nlast := items.pop();\nremoved := items.remove(0);",
        "note": "",
        "after": "The array becomes `[2, 3]`, then `[1, 2, 3]`, then `[1, 8, 2, 3]`. `pop()` returns `3`; `remove(0)` then returns `1`, leaving `[8, 2]`. `make(int[])` starts with an empty dynamic array."
      },
      {
        "id": "3",
        "title": "Copy and concatenate",
        "text": "Assignments, arguments, and returns create independent value copies. Nested owned values copy recursively; pointer elements keep their addresses. + creates a concatenated value, while += replaces the left-hand value.\n\nValue semantics mean that ordinary assignment does not create two names for the same mutable payload. The compiler recursively copies owned collection contents, including dynamic arrays nested inside other arrays or structs. Explicit pointers are the exception: their address values are copied, so their pointees remain shared.\n\nConcatenation follows the same copy rules. `first + second` produces a new collection without altering either input. Compound addition assigns that new result back to the variable on the left. You can also add a compatible single element at either end.",
        "code": "first := int[]{1, 2};\ncopy := first;\ncopy[0] = 99;           // first[0] remains 1\njoined := first + int[]{3, 4};\nfirst += 5;",
        "note": "",
        "after": "Changing `copy[0]` leaves `first[0]` equal to `1`. `joined` receives `[1, 2, 3, 4]`, and `first += 5` replaces `first` with `[1, 2, 5]`. None of those operations changes `copy` afterward."
      },
      {
        "id": "4",
        "title": "Checked access and sized arrays",
        "text": "Two-binding indexing returns the value and a success flag; out-of-bounds access returns a `zero` value and `false`. `array<T>` preserves runtime length when passing sized arrays. A dynamic array’s `.array()` method makes an independent sized-array copy.\n\nOrdinary indexing reports a runtime error for an invalid position. Use the two-binding form when absence is an expected outcome you want to handle in the program. The success flag distinguishes a real zero-valued element from a failed lookup that also yields zero.\n\nAn `array<int>` parameter accepts sized integer arrays of different lengths while preserving their runtime extent. It is a length-independent array type, not another spelling for a dynamic `int[]`. To supply a dynamic array’s current elements, call its `.array()` method to make a sized-array copy.",
        "code": "func first(values array<int>) (int, bool) {\n    value, ok := values[0];\n    return value, ok;\n}",
        "note": "",
        "after": "Calling `first` with a nonempty sized array returns its first element and `true`. An empty sized array gives `0` and `false`. The caller should use the flag to decide whether the value represents an actual element."
      },
      {
        "id": "5",
        "title": "Raw storage",
        "text": "Use `buffer<T>[]` for an unsized raw view. Buffers do not provide ordinary bounds checks, and a function parameter loses the caller’s lexical length metadata, so pass a count explicitly. Sized buffer declarations pad omitted literal elements with `zero` values.\n\nAn unsized buffer is a view of raw memory. Passing one to a function shares that memory instead of granting the function an independent length-aware collection. The separate count is part of the function’s contract: it must not exceed the valid memory available through the view.\n\nThis representation is useful for C interfaces and small low-level routines. It also removes checks that an ordinary array would provide, so keep the pointer and count together in the surrounding code. A buffer’s lexical size is not a substitute for a runtime length once that metadata has been erased at a call boundary.",
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
        "id": "1",
        "title": "Struct values",
        "text": "Fields use name type ordering. Struct literals can initialize fields positionally or by name. Struct assignment copies the fields, including owned nested values. Explicit pointers preserve shared references.\n\nA struct groups named fields into one value. Each field has its own type, and field access uses a dot, such as `point.x`. The type declaration describes the layout; a struct literal constructs a value using that description. A function can return the struct just as it returns an integer or string.\n\nPositional literals follow field declaration order. Keyed literals name the fields they initialize and are useful when a struct has several similar-looking values. Omitted fields receive defaults. Copying a struct copies its stored values rather than changing its identity into a reference.",
        "code": "struct Point {\n    x float;\n    y float;\n}\n\nfunc origin() Point {\n    return Point{0.0, 0.0};\n}",
        "note": "",
        "after": "The returned `Point` has both coordinates set to `0.0`. A caller can store it with `point := origin();` and update `point.x`. Assigning it to another variable makes a separate struct value, so changing a coordinate in that copy does not change `point`."
      },
      {
        "id": "2",
        "title": "Methods",
        "text": "Declare methods in the package that defines the receiver type; imported types and aliases of them cannot receive new methods. Place a receiver before the method name. A value receiver works on a copy; a pointer receiver can update the original. When an addressable value calls a pointer method, Ocean borrows its address automatically.\n\nThe receiver gives a method access to the value on which it was called. A value receiver is suitable for reading fields or computing a result. A pointer receiver is appropriate when the method needs to modify the original stored fields. The distinction appears directly in the receiver’s type.\n\nAutomatic borrowing makes an addressable variable convenient to call without hiding the declaration’s behavior: `counter.Increment()` still invokes a pointer receiver. A value receiver copies its struct even when the call is made through a pointer.",
        "code": "struct Counter { value int; }\n\nfunc (counter *Counter) Increment() {\n    counter.value++;\n}\n\nfunc (counter Counter) Value() int {\n    return counter.value;\n}",
        "note": "",
        "after": "For `counter := Counter{0};`, calling `counter.Increment();` updates the field to one. Calling `counter.Value()` returns that integer. Methods are associated with their declared types; they are not separate fields storing callable function values."
      },
      {
        "id": "3",
        "title": "Definitions and aliases",
        "text": "`type Name Existing` creates a distinct type with the same representation. `type Name = Existing` creates another name for exactly the same type. Distinct definitions require explicit casts when converting to or from their underlying type.\n\nA defined type is useful when two values have the same machine representation but mean different things. A user identifier can use integer storage while remaining distinct from an ordinary count. That distinction participates in assignments, function signatures, and generic type checking.\n\nAn alias is useful for another spelling of an existing type, such as a shorter name at a package boundary. It does not create a new conversion requirement. Defined types can declare their own methods; aliases use the method set of their target.",
        "code": "type UserID int;\ntype AccountID = UserID;\n\n// Inside a function:\nid := 42 -> UserID;\nalias: AccountID = id;\nnumber := id -> int;",
        "note": "",
        "after": "Here, `AccountID` and `UserID` refer to the same type, so assigning `id` to `alias` is direct. `UserID` and `int` have distinct identities, so the example uses arrow casts to cross that boundary. The underlying integer representation remains the same."
      },
      {
        "id": "4",
        "title": "Value parameters",
        "text": "A struct can carry immutable value parameters before its ordinary fields. They occupy the field prefix, are supplied once by the initializer, and cannot be reassigned. They are distinct from compile-time generic type arguments.\n\nValue parameters become stored fields, with names and types, before the fields in the struct body. They can record configuration that is chosen at initialization and should remain unchanged for that value’s lifetime. Their immutability applies to those bindings, including attempts to take a mutable address of them.\n\nGeneric type parameters instead choose types during specialization, as in `Box<int>`. Value parameters do not turn each parameter value into a separately specialized type. Read the initializer in field order: immutable parameter fields first, then ordinary fields.",
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
        "id": "0",
        "title": "Declare and construct variants",
        "text": "An enum is a distinct type whose variants may carry no data, an ordered tuple, or named record fields. Variant names belong to the enum. Tuple construction uses parentheses; record construction uses braces with positional values or named fields. Payload fields are immutable. Uppercase enum and variant names are exported to other packages.",
        "code": "enum GuiEvent {\n    GuiLoad,\n    KeyPress(i8),\n    Click{x, y i8},\n}\n\nfunc main() {\n    load := GuiEvent.GuiLoad;\n    key := GuiEvent.KeyPress(65);\n    click := GuiEvent.Click{x: 2, y: 3};\n}",
        "note": "Enums have nominal identity: a variant of another enum cannot be assigned even when its name and payload shape match."
      },
      {
        "id": "1",
        "title": "Test and extract a payload",
        "text": "Compare a value with a qualified variant name to test its tag. Extract data with value.(Enum.Variant). A tuple yields its positional values; use multiple assignment for multiple elements and _ to discard positions. A record yields a record with immutable fields. An extraction traps if the value holds a different variant.",
        "code": "func keyCode(event GuiEvent) i8 {\n    if (event == GuiEvent.KeyPress) {\n        key := event.(GuiEvent.KeyPress);\n        return key;\n    }\n    return 0;\n}",
        "note": "Payload variants require construction before they can be stored or passed as values."
      },
      {
        "id": "2",
        "title": "Match variants",
        "text": "match evaluates its enum subject once and executes the matching arm. Tuple bindings follow payload order. Record patterns select fields by name, may omit fields, and support bindingName = fieldName aliases. Each arm has its own scope. The compiler warns when variants are missing; an arm naming the enum type supplies a default. Type-guard switches do not support enum values.",
        "code": "func position(event GuiEvent) int {\n    match (event) {\n        GuiEvent.GuiLoad => return 0;\n        GuiEvent.KeyPress(_) => return 1;\n        GuiEvent.Click{clickX = x, clickY = y} => {\n            return clickX->int + clickY->int;\n        }\n    }\n    return 0;\n}",
        "note": "Use GuiEvent => statement; for a default arm. Tuple patterns must include every position; use _ for omitted values."
      },
      {
        "id": "3",
        "title": "Extract named fields",
        "text": "A named record extraction can select only the fields you need. The names on the left of the declaration or assignment match the binding names in the pattern, so field order does not matter. An alias gives a field a different local name.",
        "code": "func clickX(event GuiEvent) int {\n    if (event == GuiEvent.Click) {\n        x, y := event.(GuiEvent.Click{y, x});\n        clickX, clickY := event.(GuiEvent.Click{clickY = y, clickX = x});\n        return x->int + clickX->int;\n    }\n    return 0;\n}",
        "note": ""
      },
      {
        "id": "4",
        "title": "Fixed payload variants",
        "text": "A variant can define a fixed payload with := and an inferred type, or with : Type = and an explicit type. Accessing that variant constructs a value carrying the payload. These remain distinct enum variants rather than C-style integer constants.",
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
        "id": "5",
        "title": "Generic enums",
        "text": "Enums accept type parameters and constraints, using the same syntax as structs. Specify arguments when constructing a value, such as Result<int>.value(42). Each specialization has its own type identity: Result<int> and Result<string> cannot be interchanged. Payloads may use type parameters in tuple and record fields, and enums may be nested or passed through generic functions.",
        "code": "enum Result<T> {\n    value(T),\n    error(string),\n}\n\nfunc unwrap<T>(result Result<T>, fallback T) T {\n    match (result) {\n        Result.value(v) => return v;\n        Result.error(_) => return fallback;\n    }\n    return fallback;\n}\n\nfunc main() int {\n    result := Result<int>.value(42);\n    value := result.(Result<int>.value);\n    return unwrap<int>(result, 0);\n}",
        "note": "Extraction and match patterns may omit arguments: result.(Result.value) and Result.value(v) use the source specialization. Explicit arguments must match the source. Constructors require explicit arguments. Enum declarations and specializations require angle brackets, such as Result<T> and Result<int>. Constraints such as enum Counter<T ~int> restrict specializations."
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
        "id": "1",
        "title": "Type parameters",
        "text": "Generic declarations accept type parameters in angle brackets. An omitted constraint defaults to `any`. Calls require explicit type arguments: Ocean does not currently infer generic function arguments. Concrete combinations compile into specializations.\n\nA type parameter lets one declaration describe several concrete functions or data layouts. Inside `Box<T>`, the field’s type is whichever concrete type was supplied for `T`. A generic function uses the same idea in its parameters and result. The compiler specializes concrete uses rather than requiring the caller to pass a runtime type descriptor for an ordinary concrete struct.\n\n`any` is the default constraint when no narrower requirement is written. A constraint limits which types are accepted. Type parameters are not values: for example, `zero(T)` constructs a default value of the selected type.",
        "code": "struct Box<T> { value T; }\n\nfunc identity<T>(value T) T {\n    return value;\n}\n\n// Inside a function:\nbox := Box<int>{42};\nanswer := identity<int>(box.value);",
        "note": "",
        "after": "The struct literal produces a `Box<int>` with an integer field. `identity<int>` then accepts that integer and returns an integer. Write the call’s type arguments explicitly even when their intended types look obvious from the value arguments."
      },
      {
        "id": "2",
        "title": "Generic methods",
        "text": "Receiver arguments bind the struct’s type parameters. A method may introduce separate generic parameters after its name; pass those arguments explicitly at the call.\n\nThe receiver `Box<T>` introduces the struct’s type parameter to the method’s signature and body. You do not declare it again after the method name. A second parameter such as `U` belongs to the method itself, so it is declared after the method name and must have a different name.\n\nThis allows a method to combine a value stored in the receiver with a separately typed argument. Its result signature can refer to both parameters. Each concrete receiver and method argument combination gets its own specialization.",
        "code": "func (box Box<T>) Pair<U>(other U) (T, U) {\n    return box.value, other;\n}\n\n// Inside a function:\nbox := Box<int>{3};\nnumber, flag := box.Pair<bool>(true);",
        "note": "",
        "after": "With `Box<int>` as the receiver and `<bool>` at the call, the result types are `(int, bool)`. The bindings receive `3` and `true`. Method type arguments are explicit, just like direct generic function type arguments."
      },
      {
        "id": "3",
        "title": "Interfaces and mixed arrays",
        "text": "Interfaces describe required method signatures. `T[]` is homogeneous, even when `T` is an interface: elements share a concrete type. `mixed T[]` permits multiple concrete types satisfying the interface. `any` is the empty interface.\n\nAn interface specifies method names and exact signatures that a concrete type must satisfy. A pointer receiver requires a pointer value when checking that method set. `any` has no method requirements, so it can hold a boxed value of any supported concrete type.\n\nAn interface bound does not by itself make an array heterogeneous. A homogeneous interface array still has one concrete element type for all its entries. Adding `mixed` permits different concrete element types, provided each one satisfies the interface bound. This distinction is checked both statically where possible and at runtime for boxed conversions and writes.",
        "code": "interface Value { Get() int; }\nstruct Reading { value int; }\nfunc (r Reading) Get() int { return r.value; }\n\n// Inside a function:\nitems := mixed any[]{42, \"Ocean\", true};",
        "note": "Calls through interface methods are not implemented. Narrow a boxed value to a concrete type before invoking methods.",
        "after": "The `Reading` type satisfies `Value` through its `Get` method. The separate `mixed any[]` literal can contain an integer, a string, and a boolean together. To call a method on an interface value with the current backend, first narrow the value to an appropriate concrete type."
      },
      {
        "id": "4",
        "title": "Narrow with a type switch",
        "text": "A type-guard switch inspects concrete identity. Put specific cases before broad family cases. `Box` matches any specialization; `Box<int>` matches its integer specialization. A single case narrows the case binding.\n\nA broad generic family name can describe several specializations when used as a constraint. For example, a parameter declared as `Box` can receive both `Box<int>` and `Box<bool>`. The actual concrete identity is retained so a type switch can distinguish them.\n\nInside a single-type case, the case binding has that case’s type constraint. This permits concrete field operations after narrowing. A broad family case still does not give the compiler concrete field type arguments, so narrow further before performing operations that depend on a specific field type.",
        "code": "func inspect(box Box) int {\n    switch (item := box.(type)) {\n    case Box<int>:\n        return item.value;\n    case Box:\n        return 0;\n    default:\n        return -1;\n    }\n}",
        "note": "",
        "after": "An integer box reaches the first branch, where `item.value` has type `int`. Another box specialization reaches the family branch and returns zero. The more specific case must come first because cases are considered in source order."
      },
      {
        "id": "5",
        "title": "Current boundaries",
        "text": "Generic function values, type argument inference, operator dispatch, closures, and defer statements are not implemented by the backend. Parser acceptance alone does not guarantee executable support. Use `ocean check` to validate the complete path through native linking.\n\nSeparate the syntax accepted by the parser from operations that the native backend can actually compile. An unsupported construct can parse successfully and then fail during checking or code generation. `ocean check` exercises the full compilation path without executing the program, which is the most useful validation when experimenting with a feature.\n\nFor current code, prefer direct calls, concrete specializations, and explicit type switches. Do not assume that an interface declaration implies dynamic method dispatch, or that a generic declaration implies inferred call-site type arguments. These are distinct capabilities with separate implementation requirements.",
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
        "id": "1",
        "title": "Owned values clean up at scope exit",
        "text": "Strings and dynamic arrays own their backing allocations. Ordinary locals, parameters, results, nested owned fields, and temporaries release storage as their scopes end, including early returns and loop exits. This cleanup is emitted into the generated LLVM control flow; there is no garbage collector or reference counting.\n\nOwnership describes which value is responsible for releasing an allocation. Ordinary string and dynamic-array values have that responsibility for their backing data. Assignment and parameter passing make independent copies, including owned values nested inside collections or structs. A copied string therefore does not depend on the lifetime of the source variable.\n\nScope cleanup is part of generated control flow. It runs when the scope is left through an ordinary end, an early return, or a loop exit. Returning an owned value copies it before the function’s local cleanup, so the returned result remains valid.",
        "code": "func example() {\n    items := int[]{1, 2, 3};\n    text := \"Ocean\";\n    // Owned storage is released when this scope ends.\n}",
        "note": "",
        "after": "No explicit `free` is needed for the two locals in `example`. This automatic cleanup covers their owned allocations, not arbitrary heap objects reached through pointer fields. Pointer ownership follows a different rule described below."
      },
      {
        "id": "2",
        "title": "Explicit heap allocations",
        "text": "`new(T)` allocates zeroed heap memory, initializes the value to `zero(T)`, and returns `*T`. Pointer variables are non-owning: scope exit does not release their pointees. Call `free(pointer)` when the allocation is no longer needed.\n\nUse `new(T)` when an object needs a heap allocation whose lifetime you will manage explicitly. The returned pointer identifies that allocation; copying the pointer does not create a second object and does not create a second owner. Keep track of which part of your program is responsible for freeing it.\n\nFreeing the pointer releases the allocation and the owned strings or dynamic arrays stored inside its value. It does not recursively follow pointer fields. This prevents the compiler from guessing whether another pointer target is shared, but means that linked allocations need their own cleanup plan.",
        "code": "pointer := new(int);\n*pointer = 42;\nfree(pointer);",
        "note": "free(pointer) releases the allocation and its owned nested strings or arrays. It does not follow pointer fields. Keep pointer lifetimes valid and avoid using freed storage.",
        "after": "The allocation starts with an integer value of zero, is updated to `42`, and is then released. After `free(pointer)`, neither that pointer nor another copy of its address should be dereferenced. Simply leaving the pointer variable’s scope would not release the allocation."
      },
      {
        "id": "3",
        "title": "Addresses and sharing",
        "text": "&value takes an address; *pointer accesses its pointee. Pointer copies share the same object. Passing an array by value instead makes an independent deep copy. Explicit `free(value)` can release an owned `string` or array early; later scope cleanup does not free it again.\n\nTaking an address is a way to borrow access to an existing object without making another object. The borrowed pointer is valid only while the original storage is valid. A pointer to a local variable must not be retained for use after that variable’s lifetime ends.\n\nIn a signature, `*int` means a pointer to an integer. In an expression, `*value` dereferences a pointer. These related uses of the asterisk are distinguished by context. A pointer parameter lets a function deliberately modify its caller’s storage instead of only a copied argument.",
        "code": "func reset(value *int) {\n    *value = 0;\n}\n\n// Inside a function:\ncount := 7;\nreset(&count);",
        "note": "",
        "after": "The call supplies the address of `count`, so the assignment in `reset` changes `count` itself to zero. There is no heap allocation here and no call to `free`: the variable’s ordinary lexical lifetime owns its storage."
      },
      {
        "id": "4",
        "title": "Null is explicit",
        "text": "Ocean’s `null` is pointer-only and uses a reserved marker. It differs from the `zero` address in a default-initialized pointer or a C `null` pointer. Always initialize an optional link explicitly to `null`. Dereferencing explicit `null` traps.\n\nThis is an important Ocean-specific distinction. An uninitialized pointer receives a zero-address default, and `zero(*T)` constructs that same default. Explicit `null` is a separate reserved marker used for pointer-only absence. Testing for one does not test for the other.\n\nChoose and initialize the representation your code expects. For linked structures whose terminator is checked with `== null`, write `null` into every terminating link explicitly. At a C boundary, an address returned as a C null pointer is a zero address instead, so compare it against the appropriate zero pointer value.",
        "code": "struct Node {\n    value int;\n    next *Node;\n}\n\n// Inside a function:\nnext: *Node = null;\nif (next == null) {\n    // No next node.\n}",
        "note": "",
        "after": "The explicit initializer makes the condition true. Omitting `= null` would produce a different default value. Neither explicit null nor a zero-address pointer refers to a valid object that can be dereferenced."
      },
      {
        "id": "5",
        "title": "Storage layout",
        "text": "`sizeof(Type)` returns storage size including alignment and padding. `sizeof(value)` inspects the type without evaluating the expression. Avoid relying on the internal layout of dynamic arrays or parameterized struct array fields at a C boundary; pass `.data` explicitly.\n\nThe size of a type includes any padding and alignment required by its target layout. `sizeof(value)` uses the expression’s type without evaluating the expression; an increment or call written inside it does not run. The result is a storage measurement, not a count of collection elements.\n\nFor collections, use `len` when you mean the number of elements. A sized array includes its size header in its storage layout, while a dynamic array has a header and separately allocated payload. The compiler’s internal representation is not automatically a C-compatible structure definition.\n\nWhen passing data to C, prefer an explicitly declared buffer pointer and count. In particular, dynamic-array headers and parameterized struct array fields have implementation-specific lowering that should not be used as an assumed native ABI.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "language/errors",
    "group": "Language guide",
    "title": "Errors",
    "description": "Understand runtime failures, panic diagnostics, and forwarding failures to callers.",
    "sections": [
      {
        "id": "1",
        "title": "Panic diagnostics",
        "text": "`panic` accepts a `string` expression and stops execution with status 1. The report includes a source excerpt and call trace. `return panic` attributes the failure to the immediate caller, or to the statement itself when used in `main`.\n\nUse a returned status, such as a `(value, bool)` result, when the caller is expected to handle failure and continue. A panic instead terminates the program. It is appropriate for a violated requirement or another condition from which the program has no recovery path.\n\n`return panic` does not return an ordinary result despite its name. It terminates execution and attributes the diagnostic to the immediate caller, which can make validation helpers easier to debug. In `main`, with no Ocean caller, the statement itself supplies the location.",
        "code": "func requirePositive(value int) int {\n    if (value <= 0) return panic \"expected a positive number\";\n    return value;\n}",
        "note": "",
        "after": "A call such as `requirePositive(-1)` fails at that call site with the message `expected a positive number`. Source excerpts are embedded in the executable, so the runtime report does not depend on finding the original file on disk."
      },
      {
        "id": "panic-forwarding",
        "title": "Forward panic diagnostics",
        "text": "Use `forward panic <statement>` in a wrapper to report a returned panic at the wrapper’s caller. The statement can be a single statement or a block. A single statement keeps its usual semicolon; a block needs no trailing semicolon.\n\nOnly failures originating from `return panic \"message\";` participate. An ordinary `panic \"message\";` always reports where it occurs, even inside a forwarding block. Forwarding changes the diagnostic location; it does not catch a panic or allow execution to continue. Successful calls behave normally, and the original message and full call trace are preserved.",
        "code": "func leaf() int {\n    return panic \"invalid input\";\n}\n\nfunc wrapper() int {\n    forward panic return leaf();\n}\n\nfunc main() int {\n    return wrapper(); // Diagnostic points to this call.\n}",
        "note": "",
        "after": "For several calls, write `forward panic { first(); second(); }`. Forwarding applies to calls in the annotated statement, including conditions and arguments. Consecutive forwarding callers move the location outward until a caller does not forward or the outermost call site is reached. Nested forwarding blocks in the same function do not skip extra frames. A wrapped declaration, such as `forward panic x := leaf();`, remains visible in its enclosing scope.\n\nFor example, `forward panic { panic \"hi\"; }` reports at `panic \"hi\"`; it is never forwarded. Use `return panic \"hi\";` when creating a failure that should be attributed to the caller and may be forwarded by its wrappers."
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
        "id": "2",
        "title": "Declare external functions",
        "text": "Extern declarations use C-style ordering: return type first, then the function name, then type-first parameters. They are file-scoped and called through `extern.name`. Match the native ABI exactly: C `int` is `i32` on the tested host, while Ocean `int` is `i64`.\n\nAn extern declaration promises that the named symbol exists in the native libraries linked into the program and that its signature matches the target ABI. Ocean cannot infer the correct C signature from a symbol name. Check argument widths, pointer types, return types, and the target platform’s conventions when writing the declaration.\n\nExtern declarations intentionally use a different ordering from ordinary Ocean functions. They also have a separate call qualifier, `extern`, so a native function does not collide with an Ocean function or local variable of the same name. A declaration applies only to its own source file.",
        "code": "extern int write(i32 fd, buffer<i8>[] data, int count);\n\nfunc main() {\n    text := \"Hello from native code!\\n\";\n    extern.write(1, text.data, len(text));\n}",
        "note": "",
        "after": "This example uses the host’s `write` function to send a byte count to file descriptor one, standard output. `text.data` supplies a raw byte buffer, not the header of an Ocean string. The example signature is for the current tested host and should be checked when targeting another native ABI."
      },
      {
        "id": "3",
        "title": "Strings at a C boundary",
        "text": "Ocean strings carry a header and have no implicit trailing NUL. Pass `.data` for a raw buffer. For APIs expecting a C string (`char*`), append `\\0` explicitly. A `string`’s `.data` argument is an isolated temporary valid only during its enclosing call; create a named mutable `i8[]` copy for persistent access.\n\nA C API may expect a pointer to bytes terminated by a zero byte, a pointer and explicit length, or writable storage that it retains. Those are different contracts. An Ocean string value does not automatically satisfy all of them merely because it contains text.\n\nFor a length-based operation such as `write`, pass `.data` together with `len(text)`. For a C-string operation, explicitly provide a terminator, for example `\"Ocean\\0\".data`. The terminator is part of the string’s bytes, so do not add it blindly when an API already takes an explicit text length.\n\nA string’s temporary `.data` buffer isolates its immutable contents from writes during the native call. If the API keeps the pointer afterward, a temporary is insufficient. Use a named mutable byte array with a lifetime that covers every native use of that pointer.",
        "code": "",
        "note": ""
      },
      {
        "id": "4",
        "title": "Void pointers and casts",
        "text": "`*void` can hold an untyped native address but cannot be dereferenced. Typed pointers convert automatically to `*void`. Converting back requires an explicit cast; multi-token cast targets are grouped in parentheses.\n\nAn untyped pointer is useful for APIs such as `malloc` that allocate storage without knowing its eventual Ocean type. Before dereferencing that storage, cast the address to a pointer with a concrete pointee type. The grouped target syntax `raw -> (*int)` makes the compound type part of the cast.\n\nTyped pointers convert to `*void` automatically when passed to a compatible parameter. The reverse conversion remains explicit because it asserts how the underlying storage will be interpreted. Neither conversion by itself allocates, copies, initializes, or frees an object.",
        "code": "extern *void malloc(i32 bytes);\nextern void free(*void memory);\n\nfunc main() {\n    raw := extern.malloc(sizeof(int)->i32);\n    if (raw == zero(*void)) panic \"allocation failed\";\n    value := raw -> (*int);\n    *value = 42;\n    extern.free(value);\n}",
        "note": "Structs passed or returned by value through extern are not supported. Use pointers and verify the target platform’s ABI. Native variadic calls use libffi.",
        "after": "The allocation is checked against a zero-address pointer because this is a C allocation result. The address is then interpreted as integer storage, written, and released with C `free`. Keep allocation and deallocation APIs matched; this example deliberately uses native allocation rather than Ocean `new`."
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
        "id": "1",
        "title": "A directory is a package",
        "text": "All .oc files in a directory belong to the same package and must declare the same name. Functions, types, and globals are shared across those files. Imports are file-scoped. Only the root `package main` gets an executable entry point.\n\nPackage membership comes from the source directory and declaration, not the source filename. Splitting a large program into several `.oc` files in one directory does not require imports between those files. Their global-level declarations share the package scope, while local declarations still follow ordinary lexical scope.\n\nImports are different: each file must import the packages whose qualified names it uses. Importing `io` in `main.oc` does not make `io` available in a sibling source file. Extern declarations are also file-scoped and must be repeated in each file that calls them.",
        "code": "package main;\n\nimport \"io\";\n\nfunc main() {\n    io.Println(\"One directory, one package.\");\n}",
        "note": "",
        "after": "This file belongs to the executable package `main`. A sibling file beginning with `package main;` can declare helpers that `main` calls directly. A sibling file declaring a different package would cause a package-name error."
      },
      {
        "id": "2",
        "title": "Initialize a module",
        "text": "A module root contains `ocean.mod`. Its subdirectories are separate packages. `ocean mod init` uses the supplied module name or the current directory’s name; it preserves an existing module file.\n\nThe module name supplies a stable prefix for imports inside the project and for code importing it externally. It usually resembles a repository path. A module can contain several packages, one per Ocean source directory, without giving each directory a separate module file.\n\nRun initialization from the directory you want to use as the root. The command creates `ocean.mod` containing the chosen `module` name and an `ocean 0.1` directive. With no explicit name, the current directory’s name is used. An existing module file is preserved rather than overwritten.",
        "code": "ocean mod init github.com/yourname/project",
        "note": "",
        "after": "The example path is illustrative; replace it with the name of your project. After initialization, a `helper` subdirectory is a separate package that can be imported using the module name followed by `/helper`."
      },
      {
        "id": "3",
        "title": "Import packages",
        "text": "Import qualifiers default to the declared package name. Aliases use `as`. Names beginning with a Unicode uppercase letter are exported; lowercase declarations are private to their package. Import cycles and mixed package names are errors.\n\nThe import path identifies where a package is found; the qualifier used in expressions normally comes from that package’s `package` declaration. An alias changes the local qualifier for this file, which is useful when two imports would otherwise have the same package name.\n\nExporting is name-based. A capitalized function such as `Answer` is available to importers, while lowercase helpers remain accessible only inside their own package. The rule also applies to types, global variables, receiver methods, aliases, and interfaces. Dot imports expose exported names directly; blank imports do not introduce a normal qualifier.",
        "code": "import \"github.com/yourname/project/helper\";\nimport \"github.com/example/collections/list\" as lists;\n\n// Inside a function:\nanswer := helper.Answer();",
        "note": "See the Packages & imports language guide for dot imports, blank imports, visibility, and receiver ownership.",
        "links": [{ "label": "Packages & imports", "href": "/docs/language/packages-and-imports/" }],
        "after": "In this illustrative module layout, the first import supplies `helper.Answer()`. The second package is bound as `lists` regardless of its usual qualifier. Each referenced package must actually exist and declare the exported names you call."
      },
      {
        "id": "4",
        "title": "Dependencies and replacements",
        "text": "`require` selects a Git tag or branch. `replace` can select a local directory or another module version. A local replacement needs its own `ocean.mod`. External modules use direct Git over HTTPS and are cached.\n\nA requirement records which version of an external module to select. Versions are resolved through Git tags or branches, and module downloads are reused from the module cache. Unlike systems with a module proxy, Ocean fetches repository content directly over HTTPS.\n\nA local replacement is useful while developing two modules together. It keeps the logical import path unchanged while directing resolution to a checkout on disk. That checkout must have its own module declaration so the package graph can be resolved consistently. Single-line and parenthesized directive groups are accepted.",
        "code": "module github.com/yourname/project\n\nocean 0.1\n\nrequire github.com/example/collections v1.2.3\nreplace github.com/example/collections => ../collections",
        "note": "The default module cache is ~/.cache/ocean/modules. OCEAN_MOD_CACHE overrides it. Module downloads and build artifacts use separate caches.",
        "after": "The example dependency and version are placeholders. The replacement makes that dependency resolve to the sibling `collections` checkout. Removing a build cache entry will not change which external module sources are available in the independent module download cache."
      },
      {
        "id": "5",
        "title": "Initialization",
        "text": "Imported packages initialize before importers. Within a package, files are sorted by filename and global initializers execute in declaration order. Globals are default-initialized first, so a forward reference may observe a default value. Owned global arrays live until process shutdown.\n\nDefault initialization happens before user initializers execute. This means a global referenced before its initializer runs has a defined default, rather than causing the compiler to reorder arbitrary expressions to satisfy the reference. Explicit types are useful for forward-referenced globals because they make the intended storage type unambiguous.\n\nKeep global initialization simple and avoid relying on surprising file-order dependencies. Imported packages finish initializing before their importers. Within one package, filename order and then declaration order determine execution. Global arrays own module-lifetime copies and release them at process shutdown.",
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
        "id": "1",
        "title": "Everyday commands",
        "text": "Both ocean and ocean-c expose this interface. A location can be a file or directory. A file selects its containing package. Non-`main` packages `build` into native object files and cannot be `run` directly.\n\nUse `check` for validation, `run` for a development execution, and `build` when you want a persistent output artifact. All three operate on a package and its imports. Passing `main.oc` is a convenient way to locate that package; it does not exclude other `.oc` files in the directory.\n\nWithout `-o`, an executable uses the package directory’s name as its output name. A non-main package produces an object file instead. Choosing an explicit output path is useful in scripts because it avoids depending on a directory’s current name.",
        "code": "ocean check .\nocean run .\nocean run ./main.oc argument\nocean build . -o application\nocean build ./library -o library.o",
        "note": "",
        "after": "The `--` separator makes the boundary between compiler options and program arguments clear. For a directly built executable, invoke its output path through the shell. `run` rejects a package that is not an executable root named `main`."
      },
      {
        "id": "2",
        "title": "LLVM and validation",
        "text": "`--emit-llvm` writes textual LLVM IR, defaulting to `a.ll` if no output is specified. `check` validates syntax, semantics, backend lowering, LLVM verification, and native linking. It publishes no executable and never runs the program.\n\nTextual LLVM output is useful when inspecting how an Ocean construct is lowered or when working with a separate native compilation step. It contains compiler-generated code rather than the original source.\n\nChecking is broader than parsing. The compiler resolves imported packages, performs semantic validation, lowers the program, verifies the generated LLVM, and checks native linking. A successful check therefore validates the implemented backend path, but does not test runtime behavior or execute application logic.",
        "code": "ocean build --emit-llvm . -o application.ll\nocean build --check .\nocean check ./main.oc",
        "note": "",
        "after": "Both checking forms avoid publishing an executable. They can still report errors from the native toolchain, including unresolved external functions. Temporary artifacts used during validation are removed after the check."
      },
      {
        "id": "3",
        "title": "Run behavior",
        "text": "`run` builds in a private temporary directory and executes with the current working directory and inherited standard streams. Normal arguments and unrecognized flags after the location are forwarded to the program. Ocean compiler flags are parsed by Ocean until `--`; everything after `--` is passed literally to the program. The executable’s exit status is returned, and temporary artifacts are removed afterward.\n\nThe temporary build location is separate from the process working directory. Relative paths used by the running program are still interpreted from the directory where you invoked Ocean, and terminal input and output are inherited. This makes a development run behave much like invoking a built executable yourself.\n\nPass arguments directly after the program location: `ocean run . arg1 arg2`. Unrecognized flags after the location are also forwarded. Ocean recognizes `-o`, `--emit-llvm`, and `--check` anywhere before `--`, even after normal program arguments; these build-only options are incompatible with `run`. Use `--` to pass matching names to the program, for example `ocean run . arg1 -- -o output --check`. Ocean returns the program’s exit status to the invoking shell. A `func main() int` result becomes that status; a no-result `main` normally exits with zero.\n\nThe temporary executable and directory are removed after execution, including runtime failures and handled interrupts. Use `build` instead when another tool needs to inspect or invoke the resulting file later.",
        "code": "",
        "note": ""
      },
      {
        "id": "4",
        "title": "Build caching",
        "text": "The compiler caches generated LLVM and package objects in `~/.cache/ocean-build`. Content keys include the compiler, the import graph, paths, toolchain, and environment. Parsing and semantic checks still run, and executables are relinked with current system libraries.\n\nCache entries are selected from source contents and compilation inputs, rather than only modification timestamps. Editing a dependency invalidates affected actions; returning to earlier contents can reuse their previous results. The compiler also partitions native objects by source package so some unaffected objects can be reused.\n\nThe cache does not bypass semantic validation. Parsing and checking still run on every invocation, and executables are relinked against current system libraries. Output names and application arguments do not themselves require recompiling unchanged source.\n\n`ocean clean --cache` removes the build cache.",
        "code": "ocean clean --cache\n\n# Shell environment overrides:\nOCEAN_BUILD_CACHE=off ocean build .\nOCEAN_BUILD_CACHE=/path/to/cache ocean build .",
        "note": "Cleaning the build cache does not remove downloaded modules. An unavailable build cache falls back to compilation.",
        "after": "Use `OCEAN_BUILD_CACHE=off` to compare behavior without cached artifacts or when investigating a build problem. A custom cache path can keep generated data in a location appropriate to your environment. An unavailable cache falls back to ordinary compilation."
      },
      {
        "id": "5",
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
        "id": "1",
        "title": "Start the language server",
        "text": "Configure your editor’s language client with command `ocean` and arguments [\"`check`\", \"`--lsp`\"]. It communicates using Language Server Protocol framing over stdin and stdout. Ensure ocean and Clang are available to the editor process.\n\nThe language server is part of the compiler executable, so there is no separate server binary to install. Your editor needs an LSP client configured to associate `.oc` files with Ocean and start the command below. Use an absolute path to `ocean` if the editor does not inherit the same PATH as your terminal.\n\nThe server uses standard input and output as a protocol stream, not as an interactive terminal. A client starts the process, sends initialization, and exchanges LSP messages. Launching it manually is useful for confirming that the command exists, but it will then wait for protocol input.",
        "code": "ocean check --lsp",
        "note": "",
        "after": "A generic client configuration has executable `ocean` and an argument list containing `check` and `--lsp` as separate arguments. The exact configuration file and language identifier depend on the editor. Also make sure the server process can locate Clang and the standard library."
      },
      {
        "id": "2",
        "title": "Language features",
        "text": "The server reports scanner, parser, semantic, backend, and native diagnostics on open, change, and save. Hover shows resolved types. Definition, declaration, type-definition, and references follow bindings across source files and imports.\n\nHover is useful for inferred variables because it shows the resolved type at the symbol rather than requiring a separate annotation. Navigation requests distinguish the declaration of a symbol from the declaration of its type, which helps when following fields and package exports. References follow actual symbol bindings across files and imports.\n\nDiagnostics use the compiler’s validation stages, so editor feedback can include a backend or native linking problem as well as a syntax error. A clean syntax highlight alone is not a substitute for these compiler diagnostics.\n\nThe client decides how to present this information, such as an inline underline, a diagnostics panel, or a hover popup. If a feature appears missing, check that the editor is connected to this server and supports the corresponding LSP request.",
        "code": "",
        "note": ""
      },
      {
        "id": "3",
        "title": "Completion and rename",
        "text": "Completion uses lexical scope and inferred receiver types for fields, methods, array operations, and exported package members. Rename respects shadowing and rejects invalid names, collisions, and changes that would make an imported export private.\n\nCompletion uses the receiver’s resolved type when you type a dot, including fields, methods, dynamic-array operations, and exported package names. It also considers lexical scope so local variables and parameters are suggested where they are actually available. Incomplete member expressions can still receive suggestions.\n\nRename operates on resolved bindings rather than replacing every matching string. This is important when a local variable shadows another declaration with the same spelling. The server can also reject a rename that collides with an existing declaration or makes an imported public export private.\n\nReview workspace edits in the editor before accepting a larger rename. The server supplies edits across the relevant source files; the editor controls their preview and application.",
        "code": "",
        "note": ""
      },
      {
        "id": "4",
        "title": "Unsaved files",
        "text": "Open buffers, including new unsaved files and incomplete member expressions, are checked with their package and imports without changing source files. Protocol edit and diagnostic positions use UTF-16. Editor-specific setup depends on your editor’s language-client configuration.\n\nThe server checks open buffers together with the rest of their package graph. A new or edited file can therefore receive diagnostics without first writing those changes to disk. Other files in the package and imported packages are still considered, so errors may depend on more than the visible buffer.\n\nPositions exchanged with the client use UTF-16 units, as required by the supported protocol behavior. This matters when a line contains characters whose encoding spans more than one unit; a custom client should not treat byte offsets as equivalent positions.\n\nIf command-line checks and editor feedback disagree, compare the executable path, working directory, environment variables, and unsaved buffer contents. These are common reasons for the two processes to resolve different sources or toolchains.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/io",
    "group": "Standard library",
    "title": "io",
    "description": "Print values to standard output and build strings using the current library’s conversion and formatting functions.",
    "sections": [
      {
        "id": "1",
        "title": "Import and print",
        "text": "`Print` writes formatted values to stdout. `Println` adds a newline. The current implementation inserts a space only between adjacent non-`string` values, so include spaces explicitly when combining text and numbers.\n\nImport `io` in each file that calls it. The package’s printing functions accept variadic values, so a call can contain one value or several. The formatting of each value depends on its concrete type, while `Println` adds the final newline regardless of whether the last value is a string.\n\nFor mixed text and numbers, include separators in strings or use a format template. For example, `io.Println(\"count: \", 3)` includes the desired space explicitly. Relying on automatic spacing between every argument would produce different results because the implementation treats strings differently.",
        "code": "package main;\nimport \"io\";\n\nfunc main() {\n    io.Println(\"Hello, Ocean!\");\n    io.Printfln(\"The answer is {}\", 42);\n}",
        "note": "",
        "after": "The program prints two lines: `Hello, Ocean!` and `The answer is 42`. `Print` would write the same converted arguments without the final newline. `Printfln` combines placeholder formatting with a newline."
      },
      {
        "id": "2",
        "title": "Formatting functions",
        "text": "`Printf`(format `string`, items `...any`) prints a template. `Printfln` adds a newline. `Sprintf` returns a formatted `string`. Templates use {} placeholders in argument order. An argument-count mismatch panics. This is not C-style percent formatting.\n\nEach `{}` in the template consumes the next argument. Ordinary text, including spaces and punctuation, is copied into the result. The formatter requires the number of arguments to match the number of placeholders: too few and too many both report a panic.\n\nChoose `Printf` or `Printfln` for immediate console output. Choose `Sprintf` when another function needs the formatted string or when you want to store it. The template language does not implement C percent directives or a general collection of width and precision specifiers.",
        "code": "message := io.Sprintf(\"{} + {} = {}\", 2, 3, 5);\nio.Println(message);",
        "note": "",
        "after": "The returned string is `2 + 3 = 5`, and `Println` then writes it followed by a newline. A percent sequence such as `%d` is ordinary text for these functions, not an integer placeholder.",
        "table": {
          "headers": [
            "Function",
            "Result"
          ],
          "rows": [
            [
              "`Print(items ...any)`",
              "Writes converted values"
            ],
            [
              "`Println(items ...any)`",
              "Writes converted values and a newline"
            ],
            [
              "`Printf(format string, items ...any)`",
              "Writes a formatted message"
            ],
            [
              "`Printfln(format string, items ...any)`",
              "Writes a formatted message and a newline"
            ],
            [
              "`Sprint(items ...any) string`",
              "Returns converted values as a string"
            ],
            [
              "`Sprintf(format string, items ...any) string`",
              "Returns a formatted message as a string"
            ]
          ]
        }
      },
      {
        "id": "3",
        "title": "String conversion",
        "text": "`Sprint`(items `...any`) returns the text that `Print` would write. The implementation handles signed integers, floats, booleans, strings, arrays, and structs; raw buffers use a placeholder. Current floating output uses two decimal places.\n\n`Sprint` is useful when you want the same conversion rules as the printing functions without writing to stdout. Integer values are rendered in decimal, booleans as `true` or `false`, and strings as their contents. Arrays are rendered with bracketed elements. Struct formatting uses reflected field names and field values.\n\nThe current floating formatter uses two decimal places, so this API should not be assumed to preserve arbitrary input precision in its default output. A raw buffer is represented by a placeholder rather than traversed as a length-aware collection.",
        "code": "text := io.Sprint(42);\nvalues := int[]{1, 2, 3};\nio.Println(values);",
        "note": "",
        "after": "`text` contains `\"42\"`. The final statement prints `[1 2 3]`. The local string and array have their usual owned lifetimes; returning a formatted string gives the caller an independent value."
      },
      {
        "id": "4",
        "title": "Current scope",
        "text": "The checked-in io package implements output and formatting. File reading, stdin helpers, and networking APIs are not provided by this package. Use verified `extern` declarations for native functionality when needed.\n\nThis reference covers the functions present in the checked-in library. The package provides `Print`, `Println`, `Printf`, `Printfln`, `Sprint`, and `Sprintf`. Output goes to standard output; these functions do not expose a file-handle abstraction or a general reader/writer interface.\n\nIf you need another I/O operation, inspect the native API you intend to call and declare a matching extern signature, or implement an Ocean package around that interface. A similar package name in another language is not evidence that the same function exists here. The C interop guide explains pointer, string, and ABI considerations.",
        "code": "",
        "note": ""
      }
    ]
  },
  {
    "slug": "library/os",
    "group": "Standard library",
    "title": "os",
    "description": "Read the command-line arguments passed to an Ocean executable.",
    "sections": [
      {
        "id": "1",
        "title": "os.Args",
        "text": "`Args()` returns `array<string>`, an independently copied sized-array value. The compiler supplies process arguments through the library’s internal initialization hook.\n\nThe returned collection contains the process argument strings in their original order, including the executable name at index zero. User-supplied arguments follow it. Because it is an independent copy, modifying your local collection does not change the arguments retained by the package.\n\nThe example prints indices as well as values so the order is visible. For a command-line program, check the collection’s length before reading a required position. Alternatively, use checked two-binding indexing when an absent argument should be handled as a normal input error.",
        "code": "package main;\nimport \"io\";\nimport \"os\";\n\nfunc main() {\n    args := os.Args();\n    for (index, argument := range args) {\n        io.Printfln(\"{}: {}\", index, argument);\n    }\n}",
        "note": "",
        "after": "When using `ocean run`, the executable name refers to the temporary program Ocean created. It may differ from a separately built executable’s name. Use the arguments after index zero as application input instead of relying on that generated path."
      },
      {
        "id": "2",
        "title": "Pass arguments",
        "text": "Arguments after the `run` location, optionally separated with --, go to the generated executable. A directly built executable receives arguments from the shell in the usual way.\n\nThe separator belongs to the compiler invocation; it is not itself a user argument passed to the application. Arguments following it are forwarded in order. For a built executable, the shell passes its argument list directly without involving the Ocean compiler.\n\nShell quoting still applies before the program receives those strings. For example, quoting `\"hello ocean\"` passes one argument containing a space, while writing `hello ocean` passes two arguments. Ocean does not re-split the strings returned by `os.Args`.",
        "code": "ocean run . hello ocean\nocean run subdir arg1 arg2\nocean build . -o app\n./app hello ocean",
        "note": "",
        "after": "Both invocations pass `hello` and `ocean` as user arguments. The executable name at the beginning of the result can differ between them, especially because `run` uses a temporary output file."
      },
      {
        "id": "3",
        "title": "Current scope",
        "text": "The current os source provides `Args`. Do not assume file-system, environment, process-spawning, or operating-system APIs from other languages exist here.\n\n`Args` is the public operation in the current package. Its internal initialization hook receives the native process arguments from compiler-generated startup code; ordinary programs should call `Args` rather than invoking that hook themselves.\n\nThere are no documented file-system, environment, or process-spawning wrappers in this checkout. If your program needs those facilities, use another package that actually implements them or add a carefully declared native interface. Check the current library source before assuming an API from another language is available under the same package name.",
        "code": "",
        "note": ""
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
        "id": "1",
        "title": "Struct snapshots",
        "text": "`Fields(value any)` returns `array<reflect.Field>` in declaration order. Each `Field` has `Name string` and `Value any`. Private fields and immutable value-parameter fields are included.\n\nReflection is useful when code needs to inspect fields without hard-coding a particular struct declaration. The result is a snapshot: it records field names and boxed field values at the time of the call. It is not a mutable view through which the original struct can be edited.\n\nEach result element is a `reflect.Field`. `Name` identifies the field, and `Value` holds a boxed copy whose concrete type can be recovered with an assertion or type switch. Declaration order is preserved, including private fields and immutable value-parameter fields.",
        "code": "package main;\nimport \"io\";\nimport \"reflect\";\n\nstruct Person { name string; age int; }\n\nfunc main() {\n    person := Person{\"Ada\", 36};\n    for (i, field := range reflect.Fields(person)) {\n        io.Printfln(\"{}: {}\", field.Name, field.Value);\n    }\n}",
        "note": "",
        "after": "The program prints `name: Ada` and `age: 36` in that order. `io` can format each boxed value here without the caller writing a concrete assertion for every possible field type."
      },
      {
        "id": "2",
        "title": "Copy behavior",
        "text": "`Field` values are independent deep copies, while pointer fields retain their non-owning addresses. Non-struct inputs return an empty array; pointers are not automatically dereferenced. `IsStruct(value any)` distinguishes an empty struct from a non-struct.\n\nAn owned string or nested array in a field is deep-copied into the snapshot. Later changes to the original struct do not change that stored field value. A pointer field copies only its address, so the snapshot is not a deep clone of an arbitrary graph of pointed-to objects.\n\n`IsStruct` is useful before interpreting an empty `Fields` result. An empty struct has no fields but is still a struct; a non-struct also returns no fields. Passing a pointer to a struct does not automatically inspect its pointee. Dereference a valid pointer explicitly if that is what you intend to inspect.",
        "code": "// Inside a function:\nisStruct := reflect.IsStruct(Person{\"Ada\", 36});\nfields := reflect.Fields(Person{\"Ada\", 36});\nname := fields[0].Value.(string);",
        "note": "",
        "after": "The assertion `.Value.(string)` requests the field’s concrete string value. In this particular struct the first field is known to be a string. For general-purpose inspection, use a type switch rather than assuming that every field has the same concrete type."
      },
      {
        "id": "3",
        "title": "Trusted library implementation",
        "text": "Only reflect physically located under the configured standard-library root can invoke its compiler primitives. Ordinary code uses the public Fields and IsStruct API. Copying a package or giving it the same name does not grant intrinsic access.\n\nThe public API is implemented with compiler primitives restricted to the configured standard-library root. This restriction concerns how the package is implemented, not who may import it: ordinary Ocean packages can call `reflect.Fields` and `reflect.IsStruct`.\n\nA package named `reflect` elsewhere does not receive the same primitive access. Neither a copied implementation nor a module replacement grants it. `OCEAN_SRC` explicitly changes the trusted library root during development, so configure it to the library checkout you intend to use.\n\nFor application code, depend on the public snapshot behavior rather than the internal primitive names or the native layout of a boxed value. That keeps ordinary reflection code independent of those implementation details.",
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
      "text": "Run these commands from `ocean-c`. An out-of-source Debug build keeps generated files separate and provides debugging information. `OCEAN_STANDARD_LIBRARY_SOURCE` selects the source tree copied during installation; `OCEAN_SRC` selects the library used while running the compiler.\n\nThe C compiler builds Ocean itself. Ocean emits textual LLVM IR and invokes Clang to produce and link native code. LLVM development libraries are not required; libffi is needed for runtime C calls.",
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
      "text": "Compiler implementation files live at the repository root. Start at `main.c` for command dispatch and tool invocation. Package loading brings together a graph of source files and imports; scanning and parsing construct the syntax representation; semantic analysis resolves names and types; the backend lowers the program to LLVM IR. Clang handles native compilation and linking.",
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
      "text": "`CMakeLists.txt` defines the compiler sources and registers the CTest suites. `tests/` contains C unit tests and Python integration tests. Parser suites inspect syntax directly; backend tests compile Ocean fixtures, inspect output, and run native programs. Package, cache, reflection, and LSP tests cover their respective boundaries.\n\nRun a focused suite while iterating, then run the full suite before submitting. A parser accepting a construct does not prove semantic or native support. A language change may need scanner/parser coverage, semantic rejection cases, runtime behavior, editor checks, and updated docs.",
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
      "text": "`ocean-src` is the standard-library source root. Its package directories are imported by name: `import \"io\";` resolves the `io` directory under the configured library root. Source files begin with their package declaration. The current repository is small; it does not contain a general-purpose collection of packages borrowed from another language.",
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
      "text": "`io` implements printing and formatting in Ocean, including reflected struct formatting and native C interfaces. `os` stores the process arguments supplied through its internal `setArgs` hook; application code calls `os.Args()`. `reflect` exposes `Field`, `Fields`, and `IsStruct`.\n\nReflection primitives are available only to the actual `reflect` package under the configured standard-library root. A project-local package with the same name does not gain access. Changes to these hooks or to native interfaces may require matching changes and tests in `ocean-c`.",
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
      "text": "Keep each package in its own directory and use a matching package declaration. Follow existing export conventions: public names start with an uppercase letter. Add source files to the package directory when splitting an implementation.\n\nExercise new behavior from a small importing program. For compiler-integrated behavior, add regression coverage to the compiler repository: `tests/io_backend_test.py`, `tests/os_args_test.py`, and `tests/reflect_test.py` cover the current packages. Run the relevant CTest suites and update the corresponding reference page in this website. Preserve copy and ownership behavior, especially for strings, arrays, boxed values, and reflected snapshots.",
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
      "text": "Add a `Doc` object to the `docs` array in `src/lib/docs.ts`. Choose a unique slug without leading or trailing slashes, select an existing group, and add a title, description, and sections. Array order controls the previous/next buttons. To introduce a group, also add its name to `groups`.\n\nEach section needs a unique `id` within the page, a title, text, code, and note. Use empty strings for an unused code example or note. Optional `after` text explains an example, `table` supplies headers and rows, and `links` supplies labeled URLs. Separate paragraphs with blank lines and wrap inline code in backticks. The renderer treats prose as text, so HTML and Markdown links are not interpreted.",
      "code": "// In the docs array in src/lib/docs.ts:\n{\n  slug: \"contribute/example\",\n  group: \"Contribute\",\n  title: \"Example guide\",\n  description: \"Explain what readers will learn.\",\n  sections: [{\n    id: \"overview\",\n    title: \"Overview\",\n    text: \"Describe the workflow and use `inline code` for names.\",\n    code: \"\",\n    note: \"\",\n    links: [{ label: \"Source code\", href: \"/docs/source/\" }]\n  }]\n}",
      "note": "",
      "after": "A content entry automatically appears in the sidebar, documentation index, search, prerender entries, and reading sequence. It does not need a dedicated Svelte route. Keep examples grounded in the compiler and library sources and verify executable examples with Ocean."
    },
    {
      "id": "validate",
      "title": "Check and build",
      "text": "Run the type checks and production build after editing. The build generates runtime types and prerenders the documentation. For a local production preview through Wrangler, run the preview command after these checks.",
      "code": "# Shell\nnpm run check\nnpm run build\nnpm run preview",
      "note": "",
      "after": "Review the edited page at desktop and mobile widths, follow its previous/next links, check the sidebar and search, and try any changed code samples. In your contribution, describe the content or behavior changed and report the checks you ran. Don't use `npm run deploy` to deploy the site. Rather, when your pull request is merged into the main branch of the repository on github, the website will automatically deploy."
    }
  ]
}
];
export const groups = ["Start here", "Language guide", "Tooling", "Standard library", "Contribute"];
