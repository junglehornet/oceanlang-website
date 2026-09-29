export type DocLink = { href: string; title: string; number?: string };
export const docsHome: DocLink = { href: '/docs/', title: 'Docs Home' };
export const sections = [
	{
		href: '/docs/introduction/', title: 'Introduction', number: '1.0',
		children: [
			['hello-world', 'Hello, World!'],
			['program-structure', 'Basic Program Structure'],
			['basic-io', 'Basic I/O'],
			['variables-control-flow', 'Variables & Control Flow'],
			['basic-types', 'Basic Types'],
			['functions', 'Functions']
		].map(([slug, title], index) => ({ href: `/docs/introduction/${slug}/`, title, number: `1.${index + 1}` }))
	},
	{
		href: '/docs/advanced/', title: 'Advanced Concepts', number: '2.0',
		children: [
			['advanced-types', 'Advanced Types & Data Structures'],
			['imports', 'Import & Package System'],
			['memory', 'Memory Management'],
			['multi-threading', 'Multi Threading']
		].map(([slug, title], index) => ({ href: `/docs/advanced/${slug}/`, title, number: `2.${index + 1}` }))
	},
	{
		href: '/docs/stdlib/', title: 'Standard Library', number: '3.0',
		children: ['io', 'mem', 'strings', 'arrays', 'fmt', 'http', 'net', 'crypto', 'math', 'unicode', 'ws']
			.map((title) => ({ href: `/docs/stdlib/${title}/`, title }))
	}
];
export const docLinks: DocLink[] = [docsHome, ...sections.flatMap((section) => [section, ...section.children])];
