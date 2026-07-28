import { TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesStore } from '@store/globalStylesStore';

// ── Component ─────────────────────────────────────────────────────────────────

export function GeneralSettings() {
	const containerWidth = useGlobalStylesStore( ( s ) => s.containerWidth );
	const enableDarkMode = useGlobalStylesStore( ( s ) => s.enableDarkMode );
	const disableGoogleFonts = useGlobalStylesStore(
		( s ) => s.disableGoogleFonts
	);
	const setContainerWidth = useGlobalStylesStore(
		( s ) => s.setContainerWidth
	);
	const setEnableDarkMode = useGlobalStylesStore(
		( s ) => s.setEnableDarkMode
	);
	const setDisableGoogleFonts = useGlobalStylesStore(
		( s ) => s.setDisableGoogleFonts
	);

	return (
		<div className="gb-general-settings">
			<div className="gb-general-settings__field">
				<TextControl
					label={ __( 'Container Width (px)', 'goblocks' ) }
					help={ __(
						'Default maximum width of content containers. Overrides --gb-container-site.',
						'goblocks'
					) }
					type="number"
					value={ String( containerWidth ) }
					onChange={ ( v ) => {
						const parsed = parseInt( v, 10 );
						if ( parsed >= 320 && parsed <= 2560 ) {
							setContainerWidth( parsed );
						}
					} }
					min={ 320 }
					max={ 2560 }
					step={ 10 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</div>

			<div className="gb-general-settings__field">
				<ToggleControl
					label={ __( 'Enable Dark Mode Support', 'goblocks' ) }
					help={ __(
						'Output dark mode token overrides. Requires the active theme to support prefers-color-scheme.',
						'goblocks'
					) }
					checked={ enableDarkMode }
					onChange={ setEnableDarkMode }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</div>

			<div className="gb-general-settings__field">
				<ToggleControl
					label={ __( 'Disable Google Fonts', 'goblocks' ) }
					help={ __(
						'Prevent GoBlocks from loading any Google Fonts. Useful for GDPR / privacy compliance.',
						'goblocks'
					) }
					checked={ disableGoogleFonts }
					onChange={ setDisableGoogleFonts }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</div>
		</div>
	);
}
