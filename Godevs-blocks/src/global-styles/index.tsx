/**
 * GoBlocks Global Styles SPA — entry executed by src/global-styles.ts.
 *
 * 1. Hydrates the Zustand store from window.goblocksGlobalStyles.settings
 *    (localized by GlobalStyles::enqueue_admin_assets()).
 * 2. Mounts the React SPA into #goblocks-global-styles-root.
 */

import { render } from '@wordpress/element';
import { useGlobalStylesStore } from '@store/globalStylesStore';
import type { ColorPaletteEntry, TypographyPreset } from '../types/block';
import { GlobalStylesApp } from './App';

// ── Hydrate store from localized page data ────────────────────────────────────

const pageData = window.goblocksGlobalStyles;

if ( pageData?.settings ) {
	const s = pageData.settings as {
		global_color_palette?: ColorPaletteEntry[];
		global_typography?: TypographyPreset[];
		container_width?: number;
		enable_dark_mode?: boolean;
		disable_google_fonts?: boolean;
	};

	// setState bypasses action setters to avoid marking isDirty on initial load.
	useGlobalStylesStore.setState( {
		colorPalette: s.global_color_palette ?? [],
		typographyPresets: s.global_typography ?? [],
		containerWidth: s.container_width ?? 1200,
		enableDarkMode: s.enable_dark_mode ?? false,
		disableGoogleFonts: s.disable_google_fonts ?? false,
		isDirty: false,
		saveStatus: 'idle',
	} );
}

// ── Mount ─────────────────────────────────────────────────────────────────────

const root = document.getElementById( 'goblocks-global-styles-root' );

if ( root ) {
	render( <GlobalStylesApp />, root );
}
