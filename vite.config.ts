import { page_data } from '@mdsvex/plugin-page-data';
import { external_links } from '@mdsvex/plugin-external-links';
import { toc } from '@mdsvex/plugin-toc';
import { anchors } from '@mdsvex/plugin-anchors';
import { figures } from '@mdsvex/plugin-figures';
import { code_blocks } from '@mdsvex/plugin-code-blocks';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { mdsvex } from 'mdsvex';

export default defineConfig({
	plugins: [
		mdsvex({
			extensions: ['.svx', '.md'],
			heading_ids: true,
			unwrap_images: true,
			plugins: [
				code_blocks(),
				figures(),
				anchors(),
				toc(),
				external_links(),
				page_data()
			]
		}),
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]
});
