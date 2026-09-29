<svelte:head><title>Ocean Docs</title></svelte:head>

<h1>
	Hello, Ocean!
</h1>
<p>
	Here is an example of an idiomatic hello world program written in the Ocean
	programming language:
</p>
<pre>
<code>package main;

import "io";

func main() &#123;
    io.Println("Hello, world!");
&#125;
</code>
      </pre>
<p>Let's dissect this program.</p>
<h3><code>package main;</code></h3>
<p>The <code>package</code>
	keyword denotes the name of the package that a file is a part of. In this case, a package is essentially a collection of .oc
	(the standard file extension for Ocean source code) files that share the same global scope. This means that any global variables
	or functions declared anywhere in a package will be available anywhere else in the same package. For example, if another
	.oc file is in the same directory as this hello world program, its package is declared as main using the line <code>package main;</code>,
	and the file declares a function, that function would be available to be called from the hello world file. Note that the
	package statement must followed by a semicolon.</p>

<h3><code>import "io";</code></h3>
<p>
	This line imports the package <code>io</code>
	from the ocean standard library. The <code>io</code>
	package provides functions for performing I/O, such as reading and writing to files, as well as taking terminal input and printing
	output to the terminal. This import statement allows the program to call functions from the <code>io</code>
	package in the file containing the hello world program
	by writing <code>io.</code>
	and then the name of the function that is to be called. Note that if a package is imported in one file of a package, it is not
	available in other files in the same package unless those other files also import the package. Also note that an import statement must be
	followed by a semicolon when importing a package in this way. For more details about different ways to import things, see
	<a href="/docs/advanced/imports/"><b>2.2</b>
	Import &amp; Package System</a>, but for now you just need to know that you can import
	packages and modules one at a time by just writing <code>import</code>
	followed by the name as a string of the module or standard
	library package, or relative file path of a non standard libarary package in the same module, followed by a semicolon.
</p>
<h3><code>func main() &#123;</code></h3>
<p>
	The <code>func</code>
	keyword declares a function. Here, a function called main with no arguments is declared. The function is named main because
	when an Ocean project is compiled and declares a function named <code>main()</code>
	with no arguments in the <code>main</code>
	package of a module, the module will compile into an executable. Then, when the executable is run, the <code>main()</code>
	function is called to start the execution of your program. This means that this is where the execution of every Ocean executable
	program starts, and therefore any code that you want to run must either be in the <code>main()</code>
	function, or the function containing the code must be called by the <code>main()</code>
	function, or by a function called by <code>main()</code>. In this program, there is only one line of code, so the line has been placed in the
	<code>main()</code>
	function so it will run.
</p>
<h3><code>io.Println("Hello, world!");</code></h3>
<p>
	<code>io.</code>
	tells the compiler that we are calling a function from the <code>io</code>
	package that we imported earlier. <code>Println()</code>
	is the name of the function that we are calling. <code>io.Println()</code>
	takes a variable number of arguments,
	formats them into a string with spaces between each argument, and then prints that string to the stdout stream of the program followed
	by a newline (denoted in a literal string by "\n"). Here, only one argumment is passed: the string "Hello, world!". This prints "Hello, world!"
	to the console, followed by a newline character. Note that at the end of the line there is a semicolon as every statement in Ocean must
	either end in a curly-brace-enclosed block of statements or a semicolon. In this case, the statement ends with a semicolon as there isn't
	a block of code collowing the statement, such as in an <code>if</code>
	statement or function declaration.
</p>
<h3><code>&#125;</code></h3>
<p>This curly brace ends the body of our main function. Note that the function declaration is not followed by a semicolon, as it
	already ended in a block of code.</p>
