/**
 * Active breakpoint hooks.
 *
 * Thin wrappers around the breakpointStore selectors so block components
 * never import from the store directly — they always go through hooks.
 */

import {
	useBreakpointStore,
	useActiveBreakpoint,
	useBreakpointConfig,
	useSetActiveBreakpoint,
} from '../store/breakpointStore';
import type { Breakpoint, BreakpointConfig } from '../types/styles';
import { BREAKPOINT_ORDER } from '../types/styles';

// ── Re-export simple selectors ────────────────────────────────────────────

export { useActiveBreakpoint, useBreakpointConfig, useSetActiveBreakpoint };

// ── Compound hooks ────────────────────────────────────────────────────────

/**
 * Returns all breakpoints ordered smallest → largest, suitable for the
 * BreakpointBar UI component.
 */
export function useOrderedBreakpoints(): Array< {
	key: Exclude< Breakpoint, 'base' >;
	value: number;
} > {
	return useBreakpointStore( ( s ) => s.getOrderedBreakpoints() );
}

/**
 * Returns the @media query string for the active breakpoint.
 * Returns an empty string for 'base' (no media query needed).
 */
export function useActiveMediaQuery(): string {
	return useBreakpointStore( ( s ) => {
		if ( 'base' === s.active ) {
			return '';
		}
		return s.getMediaQuery( s.active as Exclude< Breakpoint, 'base' > );
	} );
}

/**
 * Returns the @media query string for a specific breakpoint key.
 * @param key
 */
export function useMediaQuery( key: Exclude< Breakpoint, 'base' > ): string {
	return useBreakpointStore( ( s ) => s.getMediaQuery( key ) );
}

/**
 * Returns whether the given breakpoint key is currently active.
 * @param key
 */
export function useIsBreakpointActive( key: Breakpoint ): boolean {
	return useBreakpointStore( ( s ) => s.active === key );
}

/**
 * Returns the preview breakpoint (the Gutenberg device preview, not the
 * active editing breakpoint).
 */
export function usePreviewBreakpoint(): Breakpoint | null {
	return useBreakpointStore( ( s ) => s.preview );
}

/**
 * Returns all breakpoint keys in their canonical order, including 'base'.
 */
export function useBreakpointKeys(): ReadonlyArray< Breakpoint > {
	return [ 'base', ...BREAKPOINT_ORDER ];
}
