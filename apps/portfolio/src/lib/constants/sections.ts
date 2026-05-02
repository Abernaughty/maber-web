/**
 * Single source of truth for the page sections.
 *
 * Both the Nav (scroll-spy) and the CommandPalette (jump targets) consume
 * this list, so adding a new section means editing exactly one place.
 *
 * Order matters — it determines Nav rendering, ⌘K filter results, and the
 * scroll-spy preference when two sections are both visible.
 */

export interface Section {
	/** Anchor id used as both the DOM id and URL hash. */
	id: string;
	/** Display label in Nav and CommandPalette. Lowercase per terminal aesthetic. */
	label: string;
	/** Short hint for ⌘K result rows. */
	hint?: string;
}

export const SECTIONS: readonly Section[] = [
	{ id: 'about', label: 'about', hint: 'identity, stack, github proof' },
	{ id: 'work', label: 'work', hint: 'featured projects' },
	{ id: 'now', label: 'now', hint: "what i'm currently building" },
	{ id: 'skills', label: 'skills', hint: 'cloud, iac, ci/cd, observability' },
	{ id: 'contact', label: 'contact', hint: 'email, schedule, resume' }
] as const;

export const SECTION_IDS: readonly string[] = SECTIONS.map((s) => s.id);
