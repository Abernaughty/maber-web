/**
 * Shiki server-side syntax highlighter.
 *
 * Used by the `/projects/[slug]` deep-dive route to pre-render code
 * snippets at SSR time. Output is plain HTML — the client receives
 * ready-to-paint markup with zero highlighting JS bundled. Spec §7 §5.
 *
 * Highlighter is a singleton — Shiki recommends caching it across
 * requests because loading languages and themes is the slow part.
 */

import {
	createHighlighter,
	type BundledLanguage,
	type Highlighter
} from 'shiki';

/** Languages used by deepdives.ts code snippets. */
const LANGS: BundledLanguage[] = [
	'typescript',
	'javascript',
	'terraform',
	'jsonc',
	'json',
	'bash',
	'svelte'
];

/** Shiki theme that pairs well with the Engineer's Desk dark surface. */
const THEME = 'github-dark-default';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: [THEME],
			langs: LANGS
		});
	}
	return highlighterPromise;
}

export async function highlight(code: string, language: string): Promise<string> {
	const highlighter = await getHighlighter();
	const lang = (LANGS as string[]).includes(language)
		? (language as BundledLanguage)
		: 'typescript';
	return highlighter.codeToHtml(code, { lang, theme: THEME });
}
