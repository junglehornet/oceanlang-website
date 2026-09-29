<script lang="ts">
	import { page } from '$app/state';
	import type { DocLink } from '$lib/navigation';
	let { link }: { link: DocLink } = $props();
</script>

<a class="navbar-link" class:current={page.url.pathname === link.href}
	href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>
	{#if link.number}<b>{link.number}</b>{/if} {link.title}
</a>
