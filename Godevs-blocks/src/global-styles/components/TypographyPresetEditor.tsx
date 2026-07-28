import { Button, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesStore } from '@store/globalStylesStore';
import type { TypographyPreset } from '../../types/block';

// ── Constants ─────────────────────────────────────────────────────────────────

const WEIGHT_OPTIONS = [
	{ label: __( '— default —', 'goblocks' ), value: '' },
	{ label: '100 — Thin', value: '100' },
	{ label: '200 — Extra Light', value: '200' },
	{ label: '300 — Light', value: '300' },
	{ label: '400 — Regular', value: '400' },
	{ label: '500 — Medium', value: '500' },
	{ label: '600 — Semibold', value: '600' },
	{ label: '700 — Bold', value: '700' },
	{ label: '800 — Extra Bold', value: '800' },
	{ label: '900 — Black', value: '900' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function TypographyPresetEditor() {
	const presets = useGlobalStylesStore( ( s ) => s.typographyPresets );
	const setTypographyPresets = useGlobalStylesStore(
		( s ) => s.setTypographyPresets
	);

	const updatePreset = (
		idx: number,
		field: keyof TypographyPreset,
		value: string
	) => {
		setTypographyPresets(
			presets.map( ( p, i ) =>
				i === idx ? { ...p, [ field ]: value } : p
			)
		);
	};

	const addPreset = () => {
		const n = presets.length + 1;
		setTypographyPresets( [
			...presets,
			{
				slug: `preset-${ n }`,
				label: `Preset ${ n }`,
				fontFamily: '',
				fontSize: '',
				fontWeight: '',
				lineHeight: '',
			},
		] );
	};

	const removePreset = ( idx: number ) => {
		setTypographyPresets( presets.filter( ( _, i ) => i !== idx ) );
	};

	return (
		<div className="gb-typography-editor">
			<p className="gb-typography-editor__description">
				{ __(
					'Create reusable typography presets that can be applied across text blocks.',
					'goblocks'
				) }
			</p>

			<div className="gb-typography-editor__list">
				{ presets.map( ( preset, idx ) => (
					<div key={ idx } className="gb-typography-editor__row">
						<div className="gb-typography-editor__fields">
							<TextControl
								label={ __( 'Slug', 'goblocks' ) }
								value={ preset.slug }
								onChange={ ( v ) =>
									updatePreset( idx, 'slug', v )
								}
								placeholder="body-large"
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Label', 'goblocks' ) }
								value={ preset.label }
								onChange={ ( v ) =>
									updatePreset( idx, 'label', v )
								}
								placeholder="Body Large"
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Font Family', 'goblocks' ) }
								value={ preset.fontFamily }
								onChange={ ( v ) =>
									updatePreset( idx, 'fontFamily', v )
								}
								placeholder="system-ui, sans-serif"
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Font Size', 'goblocks' ) }
								value={ preset.fontSize }
								onChange={ ( v ) =>
									updatePreset( idx, 'fontSize', v )
								}
								placeholder="1.125rem"
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={ __( 'Font Weight', 'goblocks' ) }
								value={ preset.fontWeight }
								options={ WEIGHT_OPTIONS }
								onChange={ ( v ) =>
									updatePreset( idx, 'fontWeight', v )
								}
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Line Height', 'goblocks' ) }
								value={ preset.lineHeight }
								onChange={ ( v ) =>
									updatePreset( idx, 'lineHeight', v )
								}
								placeholder="1.6"
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
						</div>

						<Button
							isDestructive
							variant="tertiary"
							onClick={ () => removePreset( idx ) }
							aria-label={ __( 'Remove preset', 'goblocks' ) }
						>
							{ __( 'Remove', 'goblocks' ) }
						</Button>
					</div>
				) ) }
			</div>

			<Button variant="secondary" onClick={ addPreset }>
				{ __( '+ Add Preset', 'goblocks' ) }
			</Button>
		</div>
	);
}
