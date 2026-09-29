<script lang="ts">
	import { page } from '$app/state';
	import { docLinks } from '$lib/navigation';
	const index = $derived(docLinks.findIndex((link) => link.href === page.url.pathname));
	const previous = $derived(index > 0 ? docLinks[index - 1] : undefined);
	const next = $derived(index >= 0 ? docLinks[index + 1] : undefined);
</script>

<nav aria-label="Previous and next pages">
	{#if previous}
		<a class="navbutton navbutton-left" href={previous.href} aria-label={`Previous: ${previous.title}`} title={previous.title} rel="prev">&lt;</a>
	{/if}
	{#if next}
		<a class="navbutton navbutton-right" href={next.href} aria-label={`Next: ${next.title}`} title={next.title} rel="next">&gt;</a>
	{/if}
</nav>
