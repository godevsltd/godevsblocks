/**
 * CssSerializer — Pipeline Stage 5
 *
 * Converts a CssRule[] array into a valid CSS string, emitting:
 *   1. Base rules (no @media)
 *   2. Pseudo-state rules (no @media)
 *   3. @media blocks in ascending breakpoint order
 *
 * Delegates to buildCss() from buildCss.ts.
 * This module is the named pipeline stage; components should import
 * from CssEngine rather than calling this directly.
 */

import type { CssRule } from './buildCss';
import { buildCss, deduplicateRules } from './buildCss';

export type { CssRule };

// ── Serializer ────────────────────────────────────────────────────────────

export interface SerializeOptions {
	/** Remove empty declarations before serializing. Default: true. */
	compact?: boolean;
	/** Skip the unit-addition step (useful when values are pre-formatted). Default: false. */
	rawUnits?: boolean;
}

/**
 * Serialize an array of CssRule objects to a CSS string.
 *
 * Rules with identical selector + media combinations are merged before
 * serialization (later declarations win).
 * @param rules
 * @param options
 */
export function serializeCss(
	rules: CssRule[],
	options: SerializeOptions = {}
): string {
	if ( 0 === rules.length ) {
		return '';
	}

	const { compact = true, rawUnits = false } = options;

	// Deduplicate same selector+media combos.
	const deduped = compact ? deduplicateRules( rules ) : rules;

	return buildCss( deduped, { addUnits: ! rawUnits } );
}
