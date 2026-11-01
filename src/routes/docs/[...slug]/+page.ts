import { error } from '@sveltejs/kit';
import { docs } from '$lib/docs';
export function entries() { return docs.map(doc=>({slug:doc.slug})); }
export function load({ params }: {params: {slug: string}}) {
 const index = docs.findIndex(doc=>doc.slug===params.slug.replace(/\/+$/, ''));
 if(index===-1) error(404, 'This page is outside the chart.');
 return { doc: docs[index], previous: docs[index-1], next: docs[index+1] };
}
