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

- `content/docs/*.txt` contains the documentation pages in a plain-text format (see the "Working on the website" docs page). Files are read in name order, which sets the reading order.
- `scripts/build_docs.py` generates `src/lib/docs.ts` from those files; run `npm run docs` after editing them. Do not edit `docs.ts` by hand.
- `scripts/check_docs.py` compiles (and, where marked, runs) every complete Ocean example.
- `src/routes/docs/[...slug]` renders the documentation pages and supplies prerender entries.
- `src/routes/+page.svelte` contains the home page and switchable code examples.
- `src/routes/+layout.svelte` supplies navigation, document search, and a keyboard-accessible search dialog.
- `src/routes/layout.css` contains the responsive ocean-inspired themes.

A page added to `content/docs` appears in navigation, search, prerendering, and previous/next links after `npm run docs`. Each section has plain text, an optional code example, an optional explanation after the example, an optional reference table, and an optional callout. Separate paragraphs with blank lines and use backticks for inline code. Content is rendered as text rather than injected HTML.

The theme follows the system preference initially; a visitor's explicit choice persists locally and is applied before rendering. Search opens with Ctrl/Cmd+K and closes with Escape.

`/sitemap.xml` generates a sitemap from the home page, documentation index, and every entry in `docs.ts`. `/robots.txt` advertises the sitemap. Both endpoints use the request origin, so their absolute URLs follow the deployed domain without additional configuration.

## Documentation sources

Content is written against the sibling `ocean-c` compiler and `ocean-src` standard library: their READMEs, `skills/ocean/SKILL.md`, the package sources, and behavior observed by running the compiler. Recheck these sources when the compiler or library changes, and don't infer support from parser acceptance alone. Validate examples with:

```sh
OCEAN=../ocean-c/build/ocean OCEAN_SRC=../ocean-src python3 scripts/check_docs.py content/docs
```
