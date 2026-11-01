# Ocean website

A responsive Ocean language website and source-backed documentation, built with SvelteKit and Svelte 5 for Cloudflare Workers.

## Development

```sh
npm ci
npm run gen
npm run dev
```

`npm run check` validates Cloudflare types and Svelte/TypeScript. `npm run build` generates runtime types, prerenders the site, and builds for Cloudflare. `npm run preview` runs the production build through Wrangler. Deployment remains an explicit `npm run deploy` action.

## Content and structure

- `src/lib/docs.ts` contains documentation content, section outlines, and reading order.
- `src/routes/docs/[...slug]` renders the documentation pages and supplies prerender entries.
- `src/routes/+page.svelte` contains the home page and switchable code examples.
- `src/routes/+layout.svelte` supplies navigation, document search, and a keyboard-accessible search dialog.
- `src/routes/layout.css` contains the responsive ocean-inspired themes.

Add a documentation entry to `docs.ts` to include it in navigation, search, prerendering, and previous/next links. Each section has plain text, an optional code example, an optional explanation after the example, an optional reference table, and an optional callout. Separate paragraphs with blank lines and use backticks for inline code. Content is rendered as text rather than injected HTML.

The theme follows the system preference initially; a visitor's explicit choice persists locally and is applied before rendering. Search opens with Ctrl/Cmd+K and closes with Escape.

## Documentation sources

Content reflects the adjacent `ocean-c/README.md` and the actual `ocean-src/io`, `ocean-src/os`, and `ocean-src/reflect` implementations. Recheck these sources when compiler behavior changes. Do not infer executable support from parser acceptance. Full examples have been validated with the local compiler's `ocean check` command.
