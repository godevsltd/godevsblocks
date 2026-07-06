/**
 * RuleBuilder — Pipeline Stage 2
 *
 * Converts a normalized BlockStyles object into a map of CSS declarations
 * grouped by breakpoint and pseudo-state. The output is a flat bucket
 * structure that MediaQueryWrapper and PseudoBuilder consume.
 *
 * Does NOT produce strings — that is CssSerializer's job.
 */

import type { BlockStyles, Breakpoint, PseudoState } from '../../types/styles';
import { BREAKPOINT_ORDER } from '../../types/styles';
import type { CssDeclaration } from './buildCss';
import { toKebabCase } from './buildCss';
import { withUnit } from './units';
import { normalizeStyles } from './StyleNormalizer';

// ── Types ─────────────────────────────────────────────────────────────────

export type BreakpointBucket = Record< Breakpoint, CssDeclaration[] >;
export type PseudoBucket = Record< PseudoState, CssDeclaration[] >;

export interface RuleSet {
	/** Declarations for the base selector (no media query). */
	base: CssDeclaration[];
	/** Declarations grouped by breakpoint key (xs → 2xl). */
	byBreakpoint: Partial<
		Record< Exclude< Breakpoint, 'base' >, CssDeclaration[] >
	>;
	/** Declarations grouped by pseudo-state. */
	byPseudo: Partial< Record< PseudoState, CssDeclaration[] > >;
	/**
	 * ::before overlay declarations (from background.overlayColor / overlayOpacity).
	 * Keyed the same way as byBreakpoint + byPseudo.
	 */
	overlay: {
		base: CssDeclaration[];
		byBreakpoint: Partial<
			Record< Exclude< Breakpoint, 'base' >, CssDeclaration[] >
		>;
	};
}

// ── Constants ─────────────────────────────────────────────────────────────

const PSEUDO_STATES = new Set< PseudoState >( [
	'hover',
	'focus',
	'active',
	'before',
	'after',
] );
const BREAKPOINTS = new Set< string >( [ 'base', ...BREAKPOINT_ORDER ] );

/**
 * Properties skipped in the main loop because they are handled via the
 * overlay side-channel (overlayColor/overlayOpacity → ::before pseudo-element).
 * `gradient` is NOT skipped — it maps to `background-image` via PROPERTY_ALIAS.
 */
const SKIP_PROPERTIES = new Set( [ 'overlayColor', 'overlayOpacity' ] );

/**
 * `gradient` maps to `background-image` when it contains a CSS gradient.
 * `overlayColor` / `overlayOpacity` are extracted to the overlay channel.
 */
const PROPERTY_ALIAS: Record< string, string > = {
	gradient: 'background-image',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function pushDecl(
	bucket: CssDeclaration[],
	property: string,
	value: string
): void {
	const cssProp = toKebabCase( PROPERTY_ALIAS[ property ] ?? property );
	const cssVal = withUnit( value, property );
	bucket.push( { property: cssProp, value: cssVal } );
}

function getOrCreate< K extends string >(
	map: Partial< Record< K, CssDeclaration[] > >,
	key: K
): CssDeclaration[] {
	if ( ! map[ key ] ) {
		map[ key ] = [];
	}
	return map[ key ]!;
}

// ── Core builder ──────────────────────────────────────────────────────────

/**
 * Convert `attributes.styles` into a structured RuleSet.
 *
 * @param rawStyles The block's `attributes.styles` object (may be dirty/partial).
 */
export function buildRuleSet( rawStyles: BlockStyles ): RuleSet {
	const { styles, overlay: overlayChannels } = normalizeStyles( rawStyles );

	const ruleSet: RuleSet = {
		base: [],
		byBreakpoint: {},
		byPseudo: {},
		overlay: { base: [], byBreakpoint: {} },
	};

	// ── Iterate all style categories ───────────────────────────────────

	for ( const categoryKey of Object.keys( styles ) as Array<
		keyof BlockStyles
	> ) {
		const category = styles[ categoryKey ] as
			| Record< string, Partial< Record< string, string > > >
			| undefined;
		if ( ! category ) {
			continue;
		}

		for ( const [ property, responsiveMap ] of Object.entries(
			category
		) ) {
			if ( SKIP_PROPERTIES.has( property ) ) {
				continue;
			}
			if ( ! responsiveMap || 'object' !== typeof responsiveMap ) {
				continue;
			}

			for ( const [ key, value ] of Object.entries( responsiveMap ) ) {
				if ( ! value || '' === value ) {
					continue;
				}

				if ( 'base' === key ) {
					pushDecl( ruleSet.base, property, value );
				} else if (
					BREAKPOINT_ORDER.includes(
						key as Exclude< Breakpoint, 'base' >
					)
				) {
					const bucket = getOrCreate(
						ruleSet.byBreakpoint,
						key as Exclude< Breakpoint, 'base' >
					);
					pushDecl( bucket, property, value );
				} else if ( PSEUDO_STATES.has( key as PseudoState ) ) {
					const bucket = getOrCreate(
						ruleSet.byPseudo,
						key as PseudoState
					);
					pushDecl( bucket, property, value );
				}
			}
		}
	}

	// ── Clear inherited background-image when a solid color is set ────
	// When backgroundColor is set but gradient is not, emit background-image:none
	// so any gradient defined in base stylesheets (blocks.css) doesn't show through.
	const bgGroup = styles.background as
		| Record< string, Partial< Record< string, string > > >
		| undefined;
	if (
		bgGroup &&
		'backgroundColor' in bgGroup &&
		! ( 'gradient' in bgGroup )
	) {
		const bgColorMap = bgGroup.backgroundColor;
		if ( bgColorMap && 'object' === typeof bgColorMap ) {
			for ( const [ key, value ] of Object.entries( bgColorMap ) ) {
				if ( ! value ) {
					continue;
				}
				const clearDecl: CssDeclaration = {
					property: 'background-image',
					value: 'none',
				};
				if ( 'base' === key ) {
					ruleSet.base.push( clearDecl );
				} else if (
					BREAKPOINT_ORDER.includes(
						key as Exclude< Breakpoint, 'base' >
					)
				) {
					getOrCreate(
						ruleSet.byBreakpoint,
						key as Exclude< Breakpoint, 'base' >
					).push( clearDecl );
				} else if ( PSEUDO_STATES.has( key as PseudoState ) ) {
					getOrCreate( ruleSet.byPseudo, key as PseudoState ).push(
						clearDecl
					);
				}
			}
		}
	}

	// ── Overlay ::before declarations ──────────────────────────────────
	// overlayColor → background-color, overlayOpacity → opacity

	const overlayPairs: Array< [ string, Record< string, string > ] > = [
		[
			'background-color',
			overlayChannels.color as Record< string, string >,
		],
		[ 'opacity', overlayChannels.opacity as Record< string, string > ],
	];

	for ( const [ cssProp, responsiveMap ] of overlayPairs ) {
		if ( ! responsiveMap ) {
			continue;
		}
		for ( const [ key, value ] of Object.entries( responsiveMap ) ) {
			if ( ! value ) {
				continue;
			}

			if ( 'base' === key ) {
				ruleSet.overlay.base.push( { property: cssProp, value } );
			} else if ( BREAKPOINTS.has( key ) && 'base' !== key ) {
				const bucket = getOrCreate(
					ruleSet.overlay.byBreakpoint,
					key as Exclude< Breakpoint, 'base' >
				);
				bucket.push( { property: cssProp, value } );
			}
		}
	}

	// When an overlay is active, the block needs position:relative so that
	// ::before (position:absolute; inset:0) is contained within it.
	// isolation:isolate creates a stacking context so ::before with z-index:-1
	// stays above the block's background but below the block's content.
	if ( ruleSet.overlay.base.length > 0 ) {
		const hasPosition = ruleSet.base.some(
			( d ) => d.property === 'position'
		);
		if ( ! hasPosition ) {
			ruleSet.base.push( { property: 'position', value: 'relative' } );
		}
		ruleSet.base.push( { property: 'isolation', value: 'isolate' } );
	}

	return ruleSet;
}
