/**
 * Shared prop contracts for GoBlocks Inspector controls.
 */

import type { Breakpoint } from './styles';

// ── Token option ──────────────────────────────────────────────────────────

export interface TokenOption {
	label: string;
	value: string;
	preview?: string;
}

// ── Universal ControlProps ────────────────────────────────────────────────

/**
 * Base props shared by every GoBlocks control.
 * Generic T = the primitive type the control emits (string by default).
 */
export interface ControlProps< T = string > {
	value: T | undefined;
	onChange: ( value: T ) => void;
	label: string;
	help?: string;
	breakpoint: Breakpoint;
	inheritedValue?: string | undefined;
	resetable?: boolean;
	disabled?: boolean;
	tokenOptions?: TokenOption[];
}

// ── Unit types ────────────────────────────────────────────────────────────

export type CssLengthUnit =
	| 'px'
	| 'rem'
	| 'em'
	| '%'
	| 'vw'
	| 'vh'
	| 'svh'
	| 'dvh';
export type CssKeywordUnit = 'auto' | 'none' | 'inherit';
/** '' = unitless (e.g. z-index, opacity). 'deg'/'turn' = angle units for gradients. */
export type UnitOption = CssLengthUnit | CssKeywordUnit | 'deg' | 'turn' | '';

export const LENGTH_UNITS: CssLengthUnit[] = [
	'px',
	'rem',
	'em',
	'%',
	'vw',
	'vh',
	'svh',
	'dvh',
];
export const KEYWORD_UNITS: CssKeywordUnit[] = [ 'auto', 'none', 'inherit' ];
export const ALL_UNITS: UnitOption[] = [ ...LENGTH_UNITS, ...KEYWORD_UNITS ];

// ── Toggle group option ───────────────────────────────────────────────────

export interface ToggleOption< T = string > {
	label: string;
	value: T;
	icon?: React.ReactNode;
	ariaLabel?: string;
}
