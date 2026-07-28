/**
 * MediaQueryWrapper — Pipeline Stage 4
 *
 * Takes the breakpoint-grouped declarations from a RuleSet and wraps each
 * group in the correct @media (min-width: Npx) query.
 *
 * Breakpoints are read from the plugin's runtime config so users can
 * customize them without needing to rebuild assets.
 *
 * Output is a flat CssRule[] where each rule carries its `media` string.
 * CssSerializer groups these into @media blocks in the final output.
 */

import type { Breakpoint, BreakpointConfig } from '../../types/styles';
import { BREAKPOINT_ORDER, DEFAULT_BREAKPOINTS } from '../../types/styles';
import type { CssRule } from './buildCss';
import type { RuleSet } from './RuleBuilder';
import { buildOverlayBreakpointRule } from './PseudoBuilder';

// ── Helpers ───────────────────────────────────────────────────────────────

function mediaQuery( px: number ): string {
	return `@media (min-width: ${ px }px)`;
}

// ── Builder ───────────────────────────────────────────────────────────────

/**
 * Build CssRule[] for all responsive (breakpoint) declarations.
 *
 * Rules are emitted in ascending breakpoint order (xs → sm → md → lg → xl → 2xl)
 * so the mobile-first cascade works correctly.
 *
 * @param baseSelector     The block's unique selector, e.g. `.gb-box-abc123`
 * @param ruleSet          Output from RuleBuilder.buildRuleSet()
 * @param breakpointConfig Plugin breakpoint values (px). Falls back to defaults.
 */
export function buildMediaRules(
	baseSelector: string,
	ruleSet: RuleSet,
	breakpointConfig: BreakpointConfig = DEFAULT_BREAKPOINTS
): CssRule[] {
	const rules: CssRule[] = [];

	for ( const key of BREAKPOINT_ORDER ) {
		const declarations = ruleSet.byBreakpoint[ key ];
		const px = breakpointConfig[ key ];

		if ( ! px ) {
			continue;
		}

		const media = mediaQuery( px );

		// Main selector rule for this breakpoint.
		if ( declarations && declarations.length > 0 ) {
			rules.push( {
				selector: baseSelector,
				declarations,
				media,
			} );
		}

		// Overlay ::before rule for this breakpoint (if any).
		const overlayRule = buildOverlayBreakpointRule(
			baseSelector,
			ruleSet,
			key
		);
		if ( overlayRule ) {
			rules.push( { ...overlayRule, media } );
		}
	}

	return rules;
}

/**
 * Return the @media string for a single breakpoint key, using the provided config.
 * Returns an empty string for 'base' (no media query needed for base styles).
 * @param key
 * @param config
 */
export function getMediaQueryString(
	key: Breakpoint,
	config: BreakpointConfig = DEFAULT_BREAKPOINTS
): string {
	if ( 'base' === key ) {
		return '';
	}
	const px = config[ key ];
	return px ? mediaQuery( px ) : '';
}
