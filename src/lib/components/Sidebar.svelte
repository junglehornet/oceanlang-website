<script lang="ts">
	import { page } from '$app/state';
	import { docsHome, sections } from '$lib/navigation';
	import DocLink from './DocLink.svelte';
</script>

<nav class="navbar" aria-label="Documentation">
	<div class="navbar-nest">
		<DocLink link={docsHome} />
		{#each sections as section}
			{#if section.number === '3.0'}
				<details open={page.url.pathname.startsWith(section.href)}>
					<summary><DocLink link={section} /></summary>
					<div class="navbar-nest">
						{#each section.children as link}<DocLink {link} />{/each}
					</div>
				</details>
			{:else}
				<DocLink link={section} />
				<div class="navbar-nest">
					{#each section.children as link}<DocLink {link} />{/each}
				</div>
			{/if}
		{/each}
	</div>
</nav>
