/**
 * GoBlocks — Universal Block Attribute Types
 *
 * Every GoBlocks block's attributes object conforms to BlockAttributes.
 * Block-specific attributes extend this with additional typed fields.
 */

import type { BlockStyles } from './styles';

// ── Global editor context type ────────────────────────────────────────────

/** Shape of window.goblocksEditor — set by wp_localize_script in PHP. */
export interface GoblocksEditorGlobals {
	breakpoints: Record< string, number >;
	containerWidth: number;
	syncResponsive: boolean;
	disableGoogleFonts: boolean;
	enableDarkMode: boolean;
	globalColorPalette: ColorPaletteEntry[];
	globalTypography: TypographyPreset[];
	cssPrintMethod: 'file' | 'inline';
	nonce: string;
	restUrl: string;
	version: string;
}

/** Shape of window.goblocksSettings — set by wp_localize_script in Admin.php. */
export interface GoblocksSettingsGlobals {
	settings: Record< string, unknown >;
	nonce: string;
	restUrl: string;
	version: string;
	adminUrl: string;
}

/** Shape of window.goblocksGlobalStyles — set by GlobalStyles::enqueue_admin_assets(). */
export interface GoblocksGlobalStylesGlobals {
	settings: Record< string, unknown >;
	nonce: string;
	restUrl: string;
	version: string;
}

declare global {
	interface Window {
		goblocksEditor: GoblocksEditorGlobals;
		goblocksSettings: GoblocksSettingsGlobals;
		goblocksGlobalStyles: GoblocksGlobalStylesGlobals;
	}
}

// ── Universal block attributes ────────────────────────────────────────────

/**
 * Attributes shared by every GoBlocks block.
 * Block-specific schemas extend this interface.
 */
export interface BlockAttributes {
	/** Unique CSS class suffix — set once on block insertion, never changes. */
	uniqueId: string;

	/** HTML element tag name. Allowed values defined per block in block.json. */
	tagName: string;

	/** Nested responsive style object. See BlockStyles. */
	styles: BlockStyles;

	/** Global CSS class slugs applied to the block wrapper. */
	globalClasses: string[];

	/**
	 * Additional HTML attributes applied to the block wrapper.
	 * e.g. { 'data-custom': 'value', 'aria-label': 'Section' }
	 */
	htmlAttributes: Record< string, string >;

	/**
	 * Dynamic content tag configuration.
	 * Maps attribute paths to dynamic tag strings.
	 * e.g. { 'content': '{post_title}', 'htmlAttributes.style': 'background-image:url({featured_image|size:full|attr:src})' }
	 */
	dynamicContent: Record< string, string >;

	/**
	 * Pre-compiled CSS string produced by the TypeScript CssEngine.
	 * Written on each attribute change in the editor.
	 * PHP reads this and caches it to a file — PHP never re-derives it from `styles`.
	 */
	generatedCss: string;

	/** Schema version for future migration support. */
	blockVersion: number;
}

// ── Global styles types ───────────────────────────────────────────────────

export interface ColorPaletteEntry {
	slug: string;
	name: string;
	color: string;
}

export interface TypographyPreset {
	slug: string;
	label: string;
	fontFamily: string;
	fontSize: string;
	fontWeight: string;
	lineHeight: string;
}

// ── Control prop helpers ──────────────────────────────────────────────────

/** setAttributes function shape from useBlockProps. */
export type SetAttributes< A extends BlockAttributes = BlockAttributes > = (
	attrs: Partial< A >
) => void;
