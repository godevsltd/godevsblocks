/**
 * CssRule[] → CSS string serializer.
 *
 * Takes the structured rule objects produced by the CSS engine and emits
 * a valid CSS string. Handles at-rules, pseudo-selectors, and normal rules.
 */

import { withUnit } from './units';

// ── Data structures ───────────────────────────────────────────────────────

/** A single CSS property: value pair. */
export interface CssDeclaration {
	property: string;
	value: string;
}

/**
 * A resolved CSS rule ready for serialization.
 *
 * - `selector` may be a compound selector like `.gb-box--abc:hover`
 * - `media`    is an optional @media query string wrapping the rule
 */
export interface CssRule {
	selector: string;
	declarations: CssDeclaration[];
	media?: string;
}

// ── camelCase → kebab-case ────────────────────────────────────────────────

const VENDOR_PREFIXES = /^(webkit|moz|ms|o)([A-Z])/;

/**
 * Convert a camelCase CSS property to its kebab-case equivalent.
 * @param prop
 */
export function toKebabCase( prop: string ): string {
	// Handle vendor prefixes (webkitTransform → -webkit-transform).
	const vendor = VENDOR_PREFIXES.exec( prop );
	if ( vendor ) {
		prop = `-${ prop }`;
	}

	return prop.replace( /([A-Z])/g, '-$1' ).toLowerCase();
}

// ── Serializer ────────────────────────────────────────────────────────────

interface SerializeOptions {
	/** If true, output minified CSS with no whitespace. */
	minify?: boolean;

	/** If true, add property-aware default units to bare numbers. */
	addUnits?: boolean;
}

/**
 * Serialize an array of CssRule objects to a CSS string.
 *
 * Rules are grouped by @media query so the output is ordered as:
 *   1. Non-media rules (base styles)
 *   2. Each media query block (sorted by ascending breakpoint order)
 * @param rules
 * @param options
 */
export function buildCss(
	rules: CssRule[],
	options: SerializeOptions = {}
): string {
	const { minify = false, addUnits = true } = options;
	const nl = minify ? '' : '\n';
	const sp = minify ? '' : '  ';
	const sep = minify ? '' : ' ';

	if ( 0 === rules.length ) {
		return '';
	}

	// Partition into base and media rules, preserving insertion order.
	const baseRules: CssRule[] = [];
	const mediaMap: Map< string, CssRule[] > = new Map();

	for ( const rule of rules ) {
		if ( ! rule.declarations.length ) {
			continue;
		}

		if ( rule.media ) {
			let group = mediaMap.get( rule.media );
			if ( ! group ) {
				group = [];
				mediaMap.set( rule.media, group );
			}
			group.push( rule );
		} else {
			baseRules.push( rule );
		}
	}

	const chunks: string[] = [];

	// Emit base rules.
	for ( const rule of baseRules ) {
		chunks.push( serializeRule( rule, '', sp, nl, sep, addUnits ) );
	}

	// Emit @media blocks.
	for ( const [ media, mediaRules ] of mediaMap ) {
		const inner = mediaRules
			.map( ( r ) =>
				serializeRule(
					r,
					sp,
					minify ? '' : sp + '  ',
					nl,
					sep,
					addUnits
				)
			)
			.join( nl );

		if ( minify ) {
			chunks.push( `${ media }{${ inner }}` );
		} else {
			chunks.push( `${ media }${ sep }{${ nl }${ inner }${ nl }}` );
		}
	}

	return chunks.join( nl + ( minify ? '' : nl ) );
}

function serializeRule(
	rule: CssRule,
	indent: string,
	propIndent: string,
	nl: string,
	sep: string,
	addUnits: boolean
): string {
	const decls = rule.declarations
		.filter( ( d ) => '' !== d.value )
		.map( ( d ) => {
			const prop = toKebabCase( d.property );
			const value = addUnits ? withUnit( d.value, d.property ) : d.value;
			return `${ propIndent }${ prop }:${ sep }${ value };`;
		} )
		.join( nl );

	if ( ! decls ) {
		return '';
	}

	return `${ indent }${ rule.selector }${ sep }{${ nl }${ decls }${ nl }${ indent }}`;
}

// ── Minifier ──────────────────────────────────────────────────────────────

/**
 * Minify a raw CSS string.
 * Removes comments, collapses whitespace, strips unnecessary characters.
 * @param css
 */
export function minifyCss( css: string ): string {
	return (
		css
			// Strip /* */ comments.
			.replace( /\/\*[\s\S]*?\*\//g, '' )
			// Collapse whitespace to single space.
			.replace( /\s+/g, ' ' )
			// Remove spaces around structural characters.
			.replace( /\s*([{}:;,>~+])\s*/g, '$1' )
			// Remove trailing semicolons before closing brace.
			.replace( /;}/g, '}' )
			// Strip leading/trailing whitespace.
			.trim()
	);
}

// ── Deduplicator ─────────────────────────────────────────────────────────

/**
 * Deduplicate a list of CssRules by merging declarations for identical
 * selector + media combinations.
 *
 * Later rules win (standard CSS cascade).
 * @param rules
 */
export function deduplicateRules( rules: CssRule[] ): CssRule[] {
	const map = new Map< string, CssRule >();

	for ( const rule of rules ) {
		const key = `${ rule.media ?? '' }|||${ rule.selector }`;

		const existing = map.get( key );
		if ( existing ) {
			// Merge: later declarations override earlier for the same property.
			const propMap = new Map< string, string >();
			for ( const d of existing.declarations ) {
				propMap.set( d.property, d.value );
			}
			for ( const d of rule.declarations ) {
				propMap.set( d.property, d.value );
			}
			existing.declarations = Array.from(
				propMap,
				( [ property, value ] ) => ( { property, value } )
			);
		} else {
			map.set( key, { ...rule, declarations: [ ...rule.declarations ] } );
		}
	}

	return Array.from( map.values() );
}
