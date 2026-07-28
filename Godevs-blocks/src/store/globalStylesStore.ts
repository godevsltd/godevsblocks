/**
 * GoBlocks Global Styles Store (Zustand)
 *
 * Holds plugin-level design tokens and global presets.
 * Loaded once from wp_localize_script data; changes are saved via REST API.
 *
 * Keeps local state in sync until the REST save confirms,
 * then flushes to ensure consistency.
 */

import { create } from 'zustand';
import type { ColorPaletteEntry, TypographyPreset } from '../types/block';

// ── Store shape ───────────────────────────────────────────────────────────

interface GlobalStylesState {
	/** User-configured color palette entries (plugin-level). */
	colorPalette: ColorPaletteEntry[];

	/** User-configured typography presets (plugin-level). */
	typographyPresets: TypographyPreset[];

	/** Plugin container width in pixels. */
	containerWidth: number;

	/** Whether dark mode tokens are enabled on the frontend. */
	enableDarkMode: boolean;

	/** Whether Google Fonts loading is disabled. */
	disableGoogleFonts: boolean;

	/** Dirty flag — true when local state has unsaved changes. */
	isDirty: boolean;

	/** Save status for UI feedback. */
	saveStatus: 'idle' | 'saving' | 'saved' | 'error';

	// ── Actions ───────────────────────────────────────────────────────────

	setColorPalette: ( palette: ColorPaletteEntry[] ) => void;
	setTypographyPresets: ( presets: TypographyPreset[] ) => void;
	setContainerWidth: ( width: number ) => void;
	setEnableDarkMode: ( enabled: boolean ) => void;
	setDisableGoogleFonts: ( disabled: boolean ) => void;

	/** Persist current state to server via REST. */
	saveToServer: () => Promise< boolean >;

	/** Reset dirty flag (called after successful save). */
	markClean: () => void;
}

// ── Initial state from localized plugin data ──────────────────────────────

function getInitialState() {
	const data = window.goblocksEditor;
	return {
		colorPalette: ( data?.globalColorPalette ?? [] ) as ColorPaletteEntry[],
		typographyPresets: ( data?.globalTypography ??
			[] ) as TypographyPreset[],
		containerWidth: data?.containerWidth ?? 1200,
		enableDarkMode: data?.enableDarkMode ?? false,
		disableGoogleFonts: data?.disableGoogleFonts ?? false,
		isDirty: false,
		saveStatus: 'idle' as const,
	};
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useGlobalStylesStore = create< GlobalStylesState >(
	( set, get ) => ( {
		...getInitialState(),

		setColorPalette: ( palette ) =>
			set( { colorPalette: palette, isDirty: true } ),

		setTypographyPresets: ( presets ) =>
			set( { typographyPresets: presets, isDirty: true } ),

		setContainerWidth: ( width ) =>
			set( { containerWidth: width, isDirty: true } ),

		setEnableDarkMode: ( enabled ) =>
			set( { enableDarkMode: enabled, isDirty: true } ),

		setDisableGoogleFonts: ( disabled ) =>
			set( { disableGoogleFonts: disabled, isDirty: true } ),

		markClean: () => set( { isDirty: false } ),

		saveToServer: async (): Promise< boolean > => {
			const {
				colorPalette,
				typographyPresets,
				containerWidth,
				enableDarkMode,
				disableGoogleFonts,
			} = get();
			const restUrl =
				window.goblocksEditor?.restUrl ??
				window.goblocksGlobalStyles?.restUrl ??
				'';
			const nonce =
				window.goblocksEditor?.nonce ??
				window.goblocksGlobalStyles?.nonce ??
				'';

			set( { saveStatus: 'saving' } );

			try {
				const response = await fetch(
					restUrl + 'goblocks/v1/settings',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': nonce,
						},
						body: JSON.stringify( {
							global_color_palette: colorPalette,
							global_typography: typographyPresets,
							container_width: containerWidth,
							enable_dark_mode: enableDarkMode,
							disable_google_fonts: disableGoogleFonts,
						} ),
					}
				);

				if ( ! response.ok ) {
					set( { saveStatus: 'error' } );
					return false;
				}

				set( { saveStatus: 'saved', isDirty: false } );

				// Reset to idle after 2 seconds.
				setTimeout( () => set( { saveStatus: 'idle' } ), 2000 );

				return true;
			} catch {
				set( { saveStatus: 'error' } );
				return false;
			}
		},
	} )
);

// ── Selector hooks ────────────────────────────────────────────────────────

export const useColorPalette = (): ColorPaletteEntry[] =>
	useGlobalStylesStore( ( s ) => s.colorPalette );

export const useTypographyPresets = (): TypographyPreset[] =>
	useGlobalStylesStore( ( s ) => s.typographyPresets );

export const useContainerWidth = (): number =>
	useGlobalStylesStore( ( s ) => s.containerWidth );
