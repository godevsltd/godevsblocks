/**
 * FontControl — Font family selector.
 *
 * Shows:
 *  - Plugin global typography presets
 *  - System font stack options
 *  - Free-text input for custom values / var(--gb-font-*)
 *
 * Emits a CSS font-family string or var(--gb-font-*).
 */

import { useState } from '@wordpress/element';
import { Button, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTypographyPresets } from '../../store/globalStylesStore';

// ── System fonts ──────────────────────────────────────────────────────────

const SYSTEM_STACKS = [
	{ label: __( 'System UI', 'goblocks' ), value: 'var(--gb-font-sans)' },
	{ label: __( 'Monospace', 'goblocks' ), value: 'var(--gb-font-mono)' },
	{ label: __( 'Serif', 'goblocks' ), value: 'var(--gb-font-serif)' },
];

// ── Types ─────────────────────────────────────────────────────────────────

interface FontControlProps {
	label: string;
	value: string | undefined;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function FontControl( {
	label,
	value,
	onChange,
	disabled = false,
}: FontControlProps ) {
	const presets = useTypographyPresets();
	const [ showCustom, setShowCustom ] = useState( false );

	const presetOptions = [
		{ label: __( '— Select font —', 'goblocks' ), value: '' },
		...SYSTEM_STACKS,
		...presets.map( ( p ) => ( {
			label: p.label ?? p.slug,
			value: p.fontFamily,
		} ) ),
	];

	function handleSelect( next: string ) {
		if ( '' === next ) {
			return;
		}
		onChange( next );
	}

	return (
		<div className="gb-font-control">
			<div className="gb-font-control__header">
				{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
				<label className="gb-font-control__label">{ label }</label>
				<Button
					isSmall
					variant="tertiary"
					onClick={ () => setShowCustom( ( s ) => ! s ) }
					disabled={ disabled }
				>
					{ showCustom
						? __( 'Presets', 'goblocks' )
						: __( 'Custom', 'goblocks' ) }
				</Button>
			</div>

			{ showCustom ? (
				<TextControl
					value={ value ?? '' }
					placeholder={ __(
						"Georgia, 'Times New Roman', serif",
						'goblocks'
					) }
					onChange={ onChange }
					disabled={ disabled }
					label=""
					hideLabelFromVision
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			) : (
				<SelectControl
					value={ value ?? '' }
					options={ presetOptions }
					onChange={ handleSelect }
					disabled={ disabled }
					label=""
					hideLabelFromVision
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			) }
		</div>
	);
}
