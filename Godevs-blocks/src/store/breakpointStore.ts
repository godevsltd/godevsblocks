/**
 * GoBlocks Breakpoint Store (Zustand)
 *
 * Single source of truth for the active editing breakpoint and preview device.
 *
 * - `active`  → the breakpoint whose values are shown in Inspector controls
 * - `preview` → the Gutenberg preview device size (mirrors WP editor device toggle)
 *
 * `active` and `preview` are independent — you can edit "md" values while
 * previewing at "xl" to see context.
 */

import { create } from 'zustand';
import type {
	Breakpoint,
	BreakpointConfig,
	BREAKPOINT_ORDER,
} from '../types/styles';
import {
	DEFAULT_BREAKPOINTS,
	BREAKPOINT_ORDER as BP_ORDER,
} from '../types/styles';

// ── Store shape ───────────────────────────────────────────────────────────

interface BreakpointState {
	/** Breakpoint min-width values, loaded from plugin settings. */
	breakpoints: BreakpointConfig;

	/**
	 * Currently active breakpoint for the inspector controls.
	 * 'base' means no media query — the default mobile-first value.
	 */
	active: Breakpoint;

	/**
	 * Currently previewed breakpoint (mirrors Gutenberg preview device).
	 * null = not set independently (follows `active`).
	 */
	preview: Breakpoint | null;

	// ── Actions ───────────────────────────────────────────────────────────

	/** Set the active editing breakpoint. */
	setActive: ( key: Breakpoint ) => void;

	/** Set the preview breakpoint (independent of active). */
	setPreview: ( key: Breakpoint | null ) => void;

	/** Update breakpoint config (e.g. after settings save). */
	setBreakpoints: ( config: BreakpointConfig ) => void;

	/** Return breakpoints in ascending order (smallest first). */
	getOrderedBreakpoints: () => Array< {
		key: Exclude< Breakpoint, 'base' >;
		value: number;
	} >;

	/** Return the @media query string for a given breakpoint key. */
	getMediaQuery: ( key: Exclude< Breakpoint, 'base' > ) => string;
}

// ── Initial breakpoint config from localized plugin data ──────────────────

function getInitialBreakpoints(): BreakpointConfig {
	const localized = window.goblocksEditor?.breakpoints;
	if ( localized && typeof localized === 'object' ) {
		return localized as BreakpointConfig;
	}
	return { ...DEFAULT_BREAKPOINTS };
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useBreakpointStore = create< BreakpointState >( ( set, get ) => ( {
	breakpoints: getInitialBreakpoints(),
	active: 'base',
	preview: null,

	setActive: ( key ) => set( { active: key } ),

	setPreview: ( key ) => set( { preview: key } ),

	setBreakpoints: ( config ) => set( { breakpoints: config } ),

	getOrderedBreakpoints: () => {
		const { breakpoints } = get();
		return BP_ORDER.map( ( key ) => ( {
			key,
			value: breakpoints[ key ],
		} ) );
	},

	getMediaQuery: ( key ) => {
		const { breakpoints } = get();
		return `@media (min-width: ${ breakpoints[ key ] }px)`;
	},
} ) );

// ── Selector hooks (avoid subscribing to the full store) ─────────────────

/** Subscribe only to the active breakpoint. */
export const useActiveBreakpoint = (): Breakpoint =>
	useBreakpointStore( ( s ) => s.active );

/** Subscribe only to the breakpoint config. */
export const useBreakpointConfig = (): BreakpointConfig =>
	useBreakpointStore( ( s ) => s.breakpoints );

/** Subscribe to setActive action without re-rendering on state changes. */
export const useSetActiveBreakpoint = (): ( ( key: Breakpoint ) => void ) =>
	useBreakpointStore( ( s ) => s.setActive );
