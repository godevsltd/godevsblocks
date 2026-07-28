/**
 * BlockStyles object → CSS custom property declarations.
 *
 * Converts the GoBlocks nested attribute schema to CSS variable declarations
 * that are injected into the block's selector scope. This allows theme.json
 * and user-set values to coexist without specificity conflicts.
 *
 * Output format:  --gb-{category}-{property}: {value};
 *
 * These variables are consumed by the block's static CSS via `var(--gb-*)`.
 */

import type {
	BlockStyles,
	SpacingStyles,
	TypographyStyles,
	LayoutStyles,
	SizingStyles,
	BorderStyles,
	BackgroundStyles,
	EffectsStyles,
	PositionStyles,
	Breakpoint,
	PseudoState,
} from '../../types/styles';
import { withUnit } from './units';

// ── Token name mapping ────────────────────────────────────────────────────

/**
 * Maps a style category + property to a CSS custom property name.
 * Format: --gb-{category}-{kebab-property}
 * @param category
 * @param property
 */
function tokenName( category: string, property: string ): string {
	const kebab = property.replace( /([A-Z])/g, '-$1' ).toLowerCase();
	return `--gb-${ category }-${ kebab }`;
}

// ── Value key filter ──────────────────────────────────────────────────────

type ValueKey = Breakpoint | PseudoState;

const BREAKPOINTS: ReadonlyArray< Breakpoint > = [
	'base',
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
];
const PSEUDO_STATES: ReadonlyArray< PseudoState > = [
	'hover',
	'focus',
	'active',
	'before',
	'after',
];

function isBreakpoint( key: string ): key is Breakpoint {
	return ( BREAKPOINTS as ReadonlyArray< string > ).includes( key );
}

function isPseudoState( key: string ): key is PseudoState {
	return ( PSEUDO_STATES as ReadonlyArray< string > ).includes( key );
}

// ── Per-category extractors ───────────────────────────────────────────────

type FlatToken = {
	name: string;
	value: string;
	breakpoint: Breakpoint;
	pseudo?: PseudoState;
};

function extractCategory(
	category: string,
	obj: Record< string, Partial< Record< ValueKey, string > > > | undefined
): FlatToken[] {
	if ( ! obj ) {
		return [];
	}

	const tokens: FlatToken[] = [];

	for ( const [ property, responsive ] of Object.entries( obj ) ) {
		if ( ! responsive || typeof responsive !== 'object' ) {
			continue;
		}

		for ( const [ key, value ] of Object.entries( responsive ) ) {
			if ( ! value ) {
				continue;
			}

			const name = tokenName( category, property );

			if ( isBreakpoint( key ) ) {
				tokens.push( { name, value, breakpoint: key } );
			} else if ( isPseudoState( key ) ) {
				tokens.push( { name, value, breakpoint: 'base', pseudo: key } );
			}
		}
	}

	return tokens;
}

// ── Grouped token output ──────────────────────────────────────────────────

export interface TokenGroup {
	/** Breakpoint key ('base' means no @media wrapper). */
	breakpoint: Breakpoint;
	/** Optional pseudo-state (:hover, :focus, etc.) */
	pseudo?: PseudoState | undefined;
	/** CSS custom property name → value pairs. */
	declarations: Record< string, string >;
}

/**
 * Convert a BlockStyles object to grouped token declarations.
 *
 * The caller (CSS engine) groups these by breakpoint + pseudo to
 * build correctly-ordered media query blocks.
 * @param styles
 */
export function generateTokens( styles: BlockStyles ): TokenGroup[] {
	const raw: FlatToken[] = [
		...extractCategory(
			'spacing',
			styles.spacing as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'typography',
			styles.typography as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'layout',
			styles.layout as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'sizing',
			styles.sizing as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'border',
			styles.border as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'bg',
			styles.background as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'effects',
			styles.effects as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
		...extractCategory(
			'position',
			styles.position as Record<
				string,
				Partial< Record< ValueKey, string > >
			>
		),
	];

	// Group by breakpoint + pseudo key.
	const groupMap = new Map< string, TokenGroup >();

	for ( const token of raw ) {
		const groupKey = `${ token.breakpoint }|${ token.pseudo ?? '' }`;
		let group = groupMap.get( groupKey );

		if ( ! group ) {
			group = {
				breakpoint: token.breakpoint,
				pseudo: token.pseudo,
				declarations: {},
			};
			groupMap.set( groupKey, group! );
		}

		// Property-aware unit normalization: derive CSS property from token name.
		// e.g. --gb-spacing-padding-top → paddingTop
		const camelProp = token.name
			.replace( /^--gb-[^-]+-/, '' )
			.replace( /-([a-z])/g, ( _, c: string ) => c.toUpperCase() );

		group!.declarations[ token.name ] = withUnit( token.value, camelProp );
	}

	// Return in breakpoint order.
	const order: Array< Breakpoint > = [
		'base',
		'xs',
		'sm',
		'md',
		'lg',
		'xl',
		'2xl',
	];

	return order
		.flatMap( ( bp ) =>
			Array.from( groupMap.values() ).filter(
				( g ) => g.breakpoint === bp
			)
		)
		.filter( ( g ) => Object.keys( g.declarations ).length > 0 );
}

/**
 * Emit a TokenGroup as a CSS variable declaration block string.
 * For use in inline `<style>` output or serialization tests.
 * @param selector
 * @param group
 */
export function tokensToString( selector: string, group: TokenGroup ): string {
	const decls = Object.entries( group.declarations )
		.map( ( [ k, v ] ) => `  ${ k }: ${ v };` )
		.join( '\n' );

	if ( ! decls ) {
		return '';
	}

	const pseudo = group.pseudo ? `:${ group.pseudo }` : '';
	const fullSelector = `${ selector }${ pseudo }`;

	return `${ fullSelector } {\n${ decls }\n}`;
}
