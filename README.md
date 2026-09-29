# Ocean website

The Ocean language website and documentation, built with SvelteKit and Svelte 5. The original site's content, dark palette, and documentation URLs are preserved.

- `npm run dev` starts the development server.
- `npm run check` checks Cloudflare types and Svelte/TypeScript.
- `npm run build` prerenders the pages and builds for Cloudflare Workers.
- `npm run preview` builds and previews through Wrangler.

Pages live in `src/routes`; the shared documentation layout is in `src/routes/docs/+layout.svelte`. Sidebar links and previous/next order are defined in `src/lib/navigation.ts`, with reusable components in `src/lib/components`. Global styles are in `src/routes/layout.css`.

To add a documentation page, create its `+page.svelte` and add its link to the navigation data. Pages marked under construction preserve the original site's unfinished content. Navigation and page content render on the server; the standard library disclosure also works without JavaScript.
