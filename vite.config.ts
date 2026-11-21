import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

// Serve static Markdown (e.g. /SPEC.md) as UTF-8 in dev and preview, matching
// the production _headers rule; Vite otherwise omits the charset.
function markdownCharset(): Plugin {
	const middleware = (req: { url?: string }, res: { setHeader(name: string, value: string): void }, next: () => void) => {
		if (req.url?.split('?')[0].endsWith('.md')) res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
		next();
	};
	return {
		name: 'markdown-charset',
		configureServer: (server) => { server.middlewares.use(middleware); },
		configurePreviewServer: (server) => { server.middlewares.use(middleware); }
	};
}

export default defineConfig({
	plugins: [
		markdownCharset(),
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
