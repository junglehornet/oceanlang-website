<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import PageNavigation from '$lib/components/PageNavigation.svelte';
	let { children } = $props();
</script>

<a href="#content" class="skip-link">Skip to content</a>
<div class="container">
	<Sidebar />
	<div class="body-container">
		{#key page.url.pathname}
			<main id="content" class="body" tabindex="-1">{@render children()}</main>
		{/key}
		<PageNavigation />
	</div>
</div>
