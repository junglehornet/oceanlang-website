<script lang="ts">import { page } from '$app/state';</script>
<svelte:head><title>{page.status} — Ocean</title></svelte:head>
<main id="main" class="error-page"><p class="eyebrow">{page.status} / PAGE NOT FOUND</p><h1>Page not found.</h1><p>We couldn’t find this page. You can browse the documentation or return to the homepage.</p><a class="button primary" href="/docs/">Back to the docs →</a></main>
