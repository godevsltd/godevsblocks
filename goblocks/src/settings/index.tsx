/**
 * GoBlocks Settings Page — React SPA entry point.
 *
 * Mounts the settings UI into the #goblocks-settings-root element
 * rendered by Admin::render_settings_page().
 *
 * Data available via window.goblocksSettings (localised by Admin.php):
 *   { settings, nonce, restUrl, version, adminUrl }
 */

import { useState, useCallback } from '@wordpress/element';
import { ToggleControl, TextControl, SelectControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { render } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

// Register nonce middleware once at module load — not inside the save handler.
const _nonce = window.goblocksSettings?.nonce;
if ( _nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( _nonce ) );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Breakpoints {
	xs: number;
	sm: number;
	md: number;
	lg: number;
	xl: number;
	'2xl': number;
}

interface GoblocksSettings {
	container_width: number;
	css_print_method: 'file' | 'inline';
	breakpoints: Breakpoints;
	sync_responsive: boolean;
	disable_google_fonts: boolean;
	enable_dark_mode: boolean;
	global_color_palette: unknown[];
	global_typography: unknown[];
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Root component ─────────────────────────────────────────────────────────────

function SettingsApp() {
	const pageData = window.goblocksSettings;

	const [ settings, setSettings ] = useState< GoblocksSettings >( () => {
		const s = pageData?.settings as Partial< GoblocksSettings > | undefined;
		return {
			container_width:      s?.container_width      ?? 1200,
			css_print_method:     s?.css_print_method     ?? 'file',
			breakpoints:          s?.breakpoints          ?? { xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
			sync_responsive:      s?.sync_responsive      ?? true,
			disable_google_fonts: s?.disable_google_fonts ?? false,
			enable_dark_mode:     s?.enable_dark_mode     ?? false,
			global_color_palette: s?.global_color_palette ?? [],
			global_typography:    s?.global_typography    ?? [],
		};
	} );

	const [ saveStatus, setSaveStatus ] = useState< SaveStatus >( 'idle' );

	const patch = useCallback( < K extends keyof GoblocksSettings >( key: K, value: GoblocksSettings[ K ] ) => {
		setSettings( ( prev ) => ( { ...prev, [ key ]: value } ) );
		setSaveStatus( 'idle' );
	}, [] );

	const patchBreakpoint = useCallback( ( key: keyof Breakpoints, raw: string ) => {
		const num = parseInt( raw, 10 );
		if ( Number.isNaN( num ) ) return;
		setSettings( ( prev ) => ( {
			...prev,
			breakpoints: { ...prev.breakpoints, [ key ]: num },
		} ) );
		setSaveStatus( 'idle' );
	}, [] );

	const handleSave = useCallback( async () => {
		setSaveStatus( 'saving' );
		try {
			await apiFetch( {
				path: '/goblocks/v1/settings',
				method: 'POST',
				data: settings,
			} );
			setSaveStatus( 'saved' );
			setTimeout( () => setSaveStatus( 'idle' ), 3000 );
		} catch {
			setSaveStatus( 'error' );
		}
	}, [ settings, pageData?.nonce ] );

	const bpKeys: ( keyof Breakpoints )[] = [ 'xs', 'sm', 'md', 'lg', 'xl', '2xl' ];

	return (
		<div className="gb-admin-page">

			{ /* Header */ }
			<div className="gb-admin-header">
				<svg className="gb-admin-header__logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<rect x="3" y="3" width="8" height="8" rx="1" />
					<rect x="13" y="3" width="8" height="8" rx="1" />
					<rect x="3" y="13" width="8" height="8" rx="1" />
					<rect x="13" y="13" width="8" height="8" rx="1" />
				</svg>
				<h1 className="gb-admin-header__title">
					{ __( 'GoBlocks Settings', 'goblocks' ) }
				</h1>
				<span className="gb-admin-header__version">
					v{ pageData?.version ?? '' }
				</span>
			</div>

			{ /* Content */ }
			<div className="gb-admin-content">

				{ /* Layout card */ }
				<div className="gb-admin-card">
					<h2 className="gb-admin-card__title">
						{ __( 'Layout', 'goblocks' ) }
					</h2>

					<div className="gb-admin-field">
						<TextControl
							label={ __( 'Site container width (px)', 'goblocks' ) }
							type="number"
							min={ 600 }
							max={ 2400 }
							step={ 10 }
							value={ String( settings.container_width ) }
							onChange={ ( v ) => patch( 'container_width', parseInt( v, 10 ) || 1200 ) }
							help={ __( 'Sets --gb-container-site. Used by blocks as the maximum content width.', 'goblocks' ) }
							// @ts-ignore -- WP 6.6+ prop
							__nextHasNoMarginBottom
						/>
					</div>
				</div>

				{ /* Performance card */ }
				<div className="gb-admin-card">
					<h2 className="gb-admin-card__title">
						{ __( 'Performance', 'goblocks' ) }
					</h2>

					<div className="gb-admin-field">
						<SelectControl
							label={ __( 'CSS output method', 'goblocks' ) }
							value={ settings.css_print_method }
							options={ [
								{ label: __( 'File (recommended) — write to uploads/goblocks/', 'goblocks' ), value: 'file' },
								{ label: __( 'Inline — print <style> in <head>', 'goblocks' ), value: 'inline' },
							] }
							onChange={ ( v ) => patch( 'css_print_method', v as 'file' | 'inline' ) }
							help={ __( 'File mode caches per-post CSS to disk. Switch to inline if your server cannot write to the uploads directory.', 'goblocks' ) }
							// @ts-ignore -- WP 6.6+ prop
							__nextHasNoMarginBottom
						/>
					</div>

					<div className="gb-admin-field">
						<ToggleControl
							label={ __( 'Disable Google Fonts', 'goblocks' ) }
							help={ __( 'Prevents GoBlocks from loading any Google Fonts on the frontend.', 'goblocks' ) }
							checked={ settings.disable_google_fonts }
							onChange={ ( v ) => patch( 'disable_google_fonts', v ) }
						/>
					</div>
				</div>

				{ /* Editor card */ }
				<div className="gb-admin-card">
					<h2 className="gb-admin-card__title">
						{ __( 'Editor', 'goblocks' ) }
					</h2>

					<div className="gb-admin-field">
						<ToggleControl
							label={ __( 'Sync responsive preview', 'goblocks' ) }
							help={ __( 'Mirrors the WordPress block editor device preview (Desktop / Tablet / Mobile) to the active GoBlocks breakpoint tab.', 'goblocks' ) }
							checked={ settings.sync_responsive }
							onChange={ ( v ) => patch( 'sync_responsive', v ) }
						/>
					</div>

					<div className="gb-admin-field">
						<ToggleControl
							label={ __( 'Enable dark mode', 'goblocks' ) }
							help={ __( 'Adds the .gb-dark-mode class to <body>, activating the GoBlocks dark colour palette.', 'goblocks' ) }
							checked={ settings.enable_dark_mode }
							onChange={ ( v ) => patch( 'enable_dark_mode', v ) }
						/>
					</div>
				</div>

				{ /* Breakpoints card */ }
				<div className="gb-admin-card">
					<h2 className="gb-admin-card__title">
						{ __( 'Responsive Breakpoints', 'goblocks' ) }
					</h2>
					<p className="gb-admin-card__body" style={ { marginBottom: '1rem' } }>
						{ __( 'Minimum-width values (px) for each viewport tier. Controls appear in Inspector panels at these widths. Mobile-first.', 'goblocks' ) }
					</p>

					<div className="gb-admin-breakpoints">
						{ bpKeys.map( ( key ) => (
							<div key={ key } className="gb-admin-field">
								<div className="gb-admin-breakpoint__label">{ key }</div>
								<TextControl
									label=""
									hideLabelFromVision
									type="number"
									min={ 320 }
									max={ 3840 }
									step={ 10 }
									value={ String( settings.breakpoints[ key ] ) }
									onChange={ ( v ) => patchBreakpoint( key, v ) }
									// @ts-ignore -- WP 6.6+ prop
									__nextHasNoMarginBottom
								/>
							</div>
						) ) }
					</div>
				</div>

				{ /* Notices */ }
				{ saveStatus === 'saved' && (
					<div className="gb-admin-notice gb-admin-notice--success">
						{ __( 'Settings saved.', 'goblocks' ) }
					</div>
				) }

				{ saveStatus === 'error' && (
					<div className="gb-admin-notice gb-admin-notice--error">
						{ __( 'Could not save settings. Please try again.', 'goblocks' ) }
					</div>
				) }

			</div>

			{ /* Save bar */ }
			<div className="gb-admin-save-bar">
				{ saveStatus === 'saving' && (
					<span className="gb-admin-save-status">
						{ __( 'Saving…', 'goblocks' ) }
					</span>
				) }
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saveStatus === 'saving' }
					disabled={ saveStatus === 'saving' }
				>
					{ __( 'Save Settings', 'goblocks' ) }
				</Button>
			</div>

		</div>
	);
}

// ── Mount ──────────────────────────────────────────────────────────────────────

const root = document.getElementById( 'goblocks-settings-root' );

if ( root ) {
	render( <SettingsApp />, root );
}
