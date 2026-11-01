<script lang="ts">
 import Inline from './Inline.svelte';
 let { text }: { text: string } = $props();
</script>

{#each text.split('\n\n') as paragraph}
 <p><Inline text={paragraph}/></p>
{/each}
