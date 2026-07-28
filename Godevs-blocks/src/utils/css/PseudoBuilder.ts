/**
 * PseudoBuilder — Pipeline Stage 3
 *
 * Converts pseudo-state and overlay declarations from a RuleSet into
 * finalized CssRule objects with the correct CSS selector strings.
 *
 * Pseudo-selector mapping:
 *   hover  → :hover
 *   focus  → :focus-within  (covers keyboard focus on child elements)
 *   active → :active
 *   before → ::before
 *   after  → ::after
 */

import type { PseudoState } from '../../types/styles';
import type { CssRule } from './buildCss';
import type { RuleSet } from './RuleBuilder';

// ── Pseudo selector map ───────────────────────────────────────────────────

const PSEUDO_SELECTOR: Record< PseudoState, string > = {
	hover: ':hover',
	focus: ':focus-within',
	active: ':active',
	before: '::before',
	after: '::after',
};

// ── ::before requirements ─────────────────────────────────────────────────

/**
 * Required declarations to make ::before/::after pseudo-elements visible.
 * Injected only when the pseudo element has any declarations.
 */
const BEFORE_AFTER_BASE: Array< { property: string; value: string } > = [
	{ property: 'content', value: '""' },
	{ property: 'display', value: 'block' },
];

// ── Builder ───────────────────────────────────────────────────────────────

/**
 * Build CssRule objects for all pseudo-state declarations in the RuleSet.
 *
 * @param baseSelector The block's unique selector, e.g. `.gb-box-abc123`
 * @param ruleSet      Output from RuleBuilder.buildRuleSet()
 */
export function buildPseudoRules(
	baseSelector: string,
	ruleSet: RuleSet
): CssRule[] {
	const rules: CssRule[] = [];
	const { byPseudo, overlay } = ruleSet;

	// ── Standard pseudo-state rules ─────────────────────────────────────

	const pseudoKeys = Object.keys( byPseudo ) as PseudoState[];

	for ( const pseudo of pseudoKeys ) {
		const declarations = byPseudo[ pseudo ];
		if ( ! declarations || 0 === declarations.length ) {
			continue;
		}

		const suffix = PSEUDO_SELECTOR[ pseudo ];

		// Inject content + display for pseudo-elements.
		const extra =
			'before' === pseudo || 'after' === pseudo ? BEFORE_AFTER_BASE : [];

		rules.push( {
			selector: `${ baseSelector }${ suffix }`,
			declarations: [ ...extra, ...declarations ],
		} );
	}

	// ── Overlay ::before rule ────────────────────────────────────────────
	// Only emitted when overlayColor or overlayOpacity is set.
	// Base overlay declarations (no breakpoint).

	if ( overlay.base.length > 0 ) {
		rules.push( {
			selector: `${ baseSelector }::before`,
			declarations: [
				...BEFORE_AFTER_BASE,
				{ property: 'position', value: 'absolute' },
				{ property: 'inset', value: '0' },
				// z-index:-1 keeps the overlay behind the block's content while
				// remaining above the block background. Requires isolation:isolate
				// on the parent block (added by RuleBuilder when overlay is set)
				// to prevent the overlay from escaping the block's stacking context.
				{ property: 'z-index', value: '-1' },
				{ property: 'pointer-events', value: 'none' },
				...overlay.base,
			],
		} );
	}

	return rules;
}

/**
 * Build CssRule objects for overlay ::before declarations at a specific breakpoint.
 * Returns an empty array if no overlay declarations exist for that breakpoint.
 * @param baseSelector
 * @param ruleSet
 * @param breakpointKey
 */
export function buildOverlayBreakpointRule(
	baseSelector: string,
	ruleSet: RuleSet,
	breakpointKey: string
): CssRule | null {
	const decls =
		ruleSet.overlay.byBreakpoint[
			breakpointKey as Exclude<
				import('../../types/styles').Breakpoint,
				'base'
			>
		];
	if ( ! decls || 0 === decls.length ) {
		return null;
	}

	return {
		selector: `${ baseSelector }::before`,
		declarations: decls,
	};
}
