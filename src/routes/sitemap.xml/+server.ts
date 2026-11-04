import { docs } from '$lib/docs';
import type { RequestHandler } from './$types';

export const prerender = false;

function escapeXml(value: string): string {
	return value.replace(/[<>&"']/g, (character) => ({
		'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
	})[character]!);
}

export const GET: RequestHandler = ({ url }) => {
	const paths = ['/', '/docs/', ...docs.map((doc) => `/docs/${doc.slug}/`)];
	const entries = paths.map((path) =>
		`  <url><loc>${escapeXml(new URL(path, url.origin).href)}</loc></url>`
	);

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	);
};
