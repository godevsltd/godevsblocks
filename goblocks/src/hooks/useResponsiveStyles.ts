/**
 * useResponsiveStyles — primary hook for reading and writing block styles.
 *
 * Provides:
 *  - getStyle(category, property)           → value for the active breakpoint
 *  - getInheritedValue(category, property)  → resolved value walking down the breakpoint chain
 *  - setStyle(category, property, value)    → deep-merge into block attributes
 *  - resetStyle(category, property)         → clear the value at the active breakpoint
 *
 * Components call this hook and never touch `attributes.styles` directly.
 */

import { useCallback } from '@wordpress/element';
import type { BlockStyles, Breakpoint, PseudoState } from '../types/styles';
import { BREAKPOINT_ORDER } from '../types/styles';
import { useActiveBreakpoint } from './useBreakpoint';
import { deepMerge } from '../utils/deepMerge';

// ── Types ─────────────────────────────────────────────────────────────────

type StyleCategory = keyof BlockStyles;

/**
 * A subset of setAttributes accepted by useResponsiveStyles.
 * Block edit components pass their own setAttributes; this hook
 * never imports from @wordpress/blocks directly.
 */
type SetAttributesFn = ( attrs: { styles: BlockStyles } ) => void;

// ── Breakpoint inheritance chain ──────────────────────────────────────────

/**
 * Build the inheritance chain for a given active breakpoint.
 * Values fall back to narrower breakpoints, then to 'base'.
 *
 * @param active
 * @example  'lg' → ['base', 'xs', 'sm', 'md', 'lg']
 */
function inheritanceChain( active: Breakpoint ): Breakpoint[] {
	if ( 'base' === active ) {
		return [ 'base' ];
	}

	const idx = BREAKPOINT_ORDER.indexOf(
		active as Exclude< Breakpoint, 'base' >
	);
	const chain = BREAKPOINT_ORDER.slice( 0, idx + 1 );
	return [ 'base', ...chain ];
}

// ── Hook ──────────────────────────────────────────────────────────────────

export interface UseResponsiveStylesReturn {
	/**
	 * Get the raw value for (category, property) at the active breakpoint.
	 * Returns undefined if no value is set at exactly this breakpoint.
	 */
	getStyle( category: StyleCategory, property: string ): string | undefined;

	/**
	 * Get the resolved value for (category, property), walking up the
	 * inheritance chain until a set value is found.
	 * Returns undefined if no breakpoint in the chain has a value.
	 */
	getInheritedValue(
		category: StyleCategory,
		property: string
	): string | undefined;

	/**
	 * Get the raw value for (category, property) at a specific breakpoint,
	 * ignoring the active breakpoint entirely. Useful for displaying
	 * inheritance hints in the inspector.
	 */
	getStyleAt(
		category: StyleCategory,
		property: string,
		breakpoint: Breakpoint
	): string | undefined;

	/**
	 * Get the value for (category, property) at a specific pseudo-state.
	 * Used by panel hover/focus state controls.
	 */
	getStyleState(
		category: StyleCategory,
		property: string,
		state: PseudoState
	): string | undefined;

	/**
	 * Set a style value for (category, property) at the active breakpoint.
	 * Deep-merges into the existing styles object without clobbering other
	 * categories, properties, or breakpoints.
	 */
	setStyle( category: StyleCategory, property: string, value: string ): void;

	/**
	 * Set multiple style values for (category) at the active breakpoint in a
	 * single setAttributes call. Prevents the stale-closure clobber that occurs
	 * when calling setStyle() multiple times synchronously (e.g. linked spacing).
	 */
	setStyleBatch(
		category: StyleCategory,
		updates: Record< string, string >
	): void;

	/**
	 * Set a style value for (category, property) at a specific pseudo-state.
	 * The CSS engine outputs this as a :hover/:focus/:active/::before/::after rule.
	 */
	setStyleState(
		category: StyleCategory,
		property: string,
		state: PseudoState,
		value: string
	): void;

	/**
	 * Set multiple style values for (category) at a specific pseudo-state in a
	 * single setAttributes call. Prevents the stale-closure clobber in linked
	 * border-color hover updates.
	 */
	setStyleStateBatch(
		category: StyleCategory,
		updates: Record< string, string >,
		state: PseudoState
	): void;

	/**
	 * Clear the value for (category, property) at the active breakpoint.
	 * Other breakpoints are unaffected.
	 */
	resetStyle( category: StyleCategory, property: string ): void;

	/** Active breakpoint key, for rendering responsive badges. */
	activeBreakpoint: Breakpoint;
}

/**
 * @param styles        The block's current `attributes.styles` object.
 * @param setAttributes The block's `setAttributes` function.
 */
export function useResponsiveStyles(
	styles: BlockStyles,
	setAttributes: SetAttributesFn
): UseResponsiveStylesReturn {
	const activeBreakpoint = useActiveBreakpoint();

	// ── Readers ─────────────────────────────────────────────────────────

	const getStyleAt = useCallback(
		(
			category: StyleCategory,
			property: string,
			breakpoint: Breakpoint
		): string | undefined => {
			const categoryObj = styles[ category ] as
				| Record<
						string,
						Partial< Record< Breakpoint | PseudoState, string > >
				  >
				| undefined;
			if ( ! categoryObj ) {
				return undefined;
			}
			const propObj = categoryObj[ property ];
			if ( ! propObj ) {
				return undefined;
			}
			return propObj[ breakpoint ];
		},
		[ styles ]
	);

	const getStyle = useCallback(
		( category: StyleCategory, property: string ): string | undefined => {
			return getStyleAt( category, property, activeBreakpoint );
		},
		[ getStyleAt, activeBreakpoint ]
	);

	const getInheritedValue = useCallback(
		( category: StyleCategory, property: string ): string | undefined => {
			const chain = inheritanceChain( activeBreakpoint );
			// Walk from most-specific down to base.
			for ( const bp of [ ...chain ].reverse() ) {
				const val = getStyleAt( category, property, bp );
				if ( val !== undefined && '' !== val ) {
					return val;
				}
			}
			return undefined;
		},
		[ getStyleAt, activeBreakpoint ]
	);

	// ── Writers ─────────────────────────────────────────────────────────

	const setStyle = useCallback(
		( category: StyleCategory, property: string, value: string ) => {
			const patch: BlockStyles = {
				[ category ]: {
					[ property ]: {
						[ activeBreakpoint ]: value,
					},
				},
			};
			setAttributes( { styles: deepMerge( styles, patch ) } );
		},
		[ styles, setAttributes, activeBreakpoint ]
	);

	const resetStyle = useCallback(
		( category: StyleCategory, property: string ) => {
			setStyle( category, property, '' );
		},
		[ setStyle ]
	);

	const getStyleState = useCallback(
		(
			category: StyleCategory,
			property: string,
			state: PseudoState
		): string | undefined => {
			const categoryObj = styles[ category ] as
				| Record< string, Partial< Record< string, string > > >
				| undefined;
			return categoryObj?.[ property ]?.[ state ];
		},
		[ styles ]
	);

	const setStyleBatch = useCallback(
		( category: StyleCategory, updates: Record< string, string > ) => {
			const categoryPatch = Object.fromEntries(
				Object.entries( updates ).map( ( [ prop, val ] ) => [
					prop,
					{ [ activeBreakpoint ]: val },
				] )
			);
			const patch: BlockStyles = { [ category ]: categoryPatch };
			setAttributes( { styles: deepMerge( styles, patch ) } );
		},
		[ styles, setAttributes, activeBreakpoint ]
	);

	const setStyleState = useCallback(
		(
			category: StyleCategory,
			property: string,
			state: PseudoState,
			value: string
		) => {
			const patch: BlockStyles = {
				[ category ]: {
					[ property ]: {
						[ state ]: value,
					},
				},
			};
			setAttributes( { styles: deepMerge( styles, patch ) } );
		},
		[ styles, setAttributes ]
	);

	const setStyleStateBatch = useCallback(
		(
			category: StyleCategory,
			updates: Record< string, string >,
			state: PseudoState
		) => {
			const categoryPatch = Object.fromEntries(
				Object.entries( updates ).map( ( [ prop, val ] ) => [
					prop,
					{ [ state ]: val },
				] )
			);
			const patch: BlockStyles = { [ category ]: categoryPatch };
			setAttributes( { styles: deepMerge( styles, patch ) } );
		},
		[ styles, setAttributes ]
	);

	return {
		getStyle,
		getInheritedValue,
		getStyleAt,
		getStyleState,
		setStyle,
		setStyleBatch,
		setStyleState,
		setStyleStateBatch,
		resetStyle,
		activeBreakpoint,
	};
}
