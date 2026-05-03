/**
 * Identity constants — the core "who and what" copy.
 *
 * Single source of truth for identity strings used in the Hero, Contact
 * section, and `<svelte:head>` meta. Keep these in sync with:
 *   - GitHub bio (https://github.com/Abernaughty)
 *   - LinkedIn headline
 *   - Resume header
 *
 * Spec §1 lists the identity decisions; spec §3 Hero defines how each
 * line is presented. Phase 2 may expand the typed sequence per spec §9.2.
 */

export const NAME_FIRST = 'Mike';
export const NAME_LAST = 'Abernathy';
export const NAME = `${NAME_FIRST} ${NAME_LAST}`;

/** Primary tagline. Pinned across portfolio, GitHub bio, LinkedIn, resume. */
export const TAGLINE = 'Cloud & Platform Engineer · Azure · IaC · DevOps';

/** Stack line — six tools/frameworks I actually ship with. */
export const STACK_LINE =
	'azure · terraform · kubernetes · sveltekit · python · typescript';

/**
 * Narrative beat — Phase 2 addition (spec §9.2). Closes the typed sequence
 * with a single line of arc: where I came from, what I'm doing now.
 */
export const STORY_LINE =
	'built support muscle at microsoft. now shipping cloud infrastructure end to end.';

export const LOCATION = 'remote · colorado springs, co';

export const AVAILABILITY = 'open to work';
