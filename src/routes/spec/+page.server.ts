// The spec page is rendered at build time from the same file served at /SPEC.md.
import spec from '../../../static/SPEC.md?raw';
import { renderSpec } from '#lib/spec.ts';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = () => renderSpec(spec);
