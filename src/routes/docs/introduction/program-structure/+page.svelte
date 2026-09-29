<svelte:head><title>Ocean Docs</title></svelte:head>

<h1>Program Structure</h1>
<h3>ocean.mod</h3>
<p>If you tried to copy and run the program from the last lesson, you may have noticed that you can't run it as-is. This is
	because Ocean programs require more than just source code in order to compile. This is because every Ocean project needs an
	ocean.mod file. The ocean.mod file defines important metadata about a module, such as the minimum version of Ocean required,
	dependencies, etc. To get started with a simple, local project, make a new directory with the name of your project. Then,
	run <code>ocean mod init &lt;module name></code>, where the module name is optional (if not specified, module name will
	be the same as the name of the directory). For more details about Ocean's package and module system, see
	<a href="/docs/advanced/imports/"><b>2.2</b>
	Import &amp; Package System</a>.</p>
<h3>Entry Point</h3>
<p>Every (executable) Ocean program needs an <strong>entry point</strong>. The entry point is where the execution of the program
	starts, and is therefore required for executable programs. In Ocean, the entry point of a program is always the <code>main()</code>
	function of the <code>main</code>
	package of the module. Note that the <code>main</code>
	package should always be in the same
	directory as the ocean.mod file. To declare the <code>main()</code>
	function in the <code>main</code>
	package, we need to first
	declare that a file is in the <code>main</code>
	package. We do this by placing a <code>package</code>
	statement at the top of our
	file:</p>
<pre>
<code>package main;
</code>
				</pre>
<p>
	Next, we need to declare the <code>main()</code>
	function:
</p>
<pre>
<code>package main;

func main() &#123;&#125;
</code>
				</pre>
<h3>Imports</h3>
<p>
	Now, if we place any code inside the <code>main()</code>
	function, it will be run when the program is executed. Additionally,
	you can import modules or packages at the top of a file, below the package statement. Note that when you import a module, you
	are really only importing the <code>main</code>
	package of the module. To import other packages from the module, use the following
	syntax:
</p>
<code>
	import "&lt;module name>/&lt;package path>";
</code>
<p>
	So, for example, to import the <code>bar</code>
	package from the <code>foo</code>
	module, you would write:
</p>
<code>
	import "foo/bar";
</code>
<p>
	Additionally, if you wanted to import <code>bar</code>'s sub-package, <code>baz</code>, you would write:
</p>
<code>
	import "foo/bar/baz";
</code>
<p>
	Let's import the <code>io</code>
	package from the standard libary so we can use it later:
</p>
<pre>
<code class="block">package main;

import "io";

func main() &#123;&#125;
</code>	
				</pre>
<p>
	Note that we don't have to specify a module name for <code>io</code>
	as standard libary packages don't require a module name to import.
</p>
<h3>Top-Level Declarations</h3>
<p>
	Now, let's say you wanted to declare another function, <code>hello()</code>, that printed a message to the user. How would you do this?
	In Ocean, all functions in the same package are in the same global namespace, regardless of order. That means that we could declare our
	<code>hello()</code>
	function below the <code>main()</code>
	function, or even in another file in the <code>main</code>
	pacage, and we
	could still directly call it without having to import anything or use the <code>package.function()</code>
	notation. For example:
</p>
<pre>
<code>package main;

import "io";

func main() &#123;
    hello("bob"); // note how hello() is declared below main(), but main() can still call hello().
    hello("jim");
&#125;

func hello(string name) &#123; // this declares a function called hello, with a string parameter called name. string is a built-in type
    io.Println("Hello, " + name + "!");
&#125;
</code>
				</pre>
