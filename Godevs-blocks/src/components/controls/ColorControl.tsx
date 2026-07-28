/**
 * ColorControl — Color picker with plugin + theme token support.
 *
 * Features:
 *  - Always-visible default color palette (13 base colors)
 *  - Plugin global palette (from globalStylesStore, shown when defined)
 *  - Hex text input
 *  - Passes CSS color string or var(--gb-color-*) as value
 *
 * Wraps @wordpress/components ColorPicker + a token grid popover.
 */

import { useState, useCallback } from '@wordpress/element';
import {
	Button,
	ColorPicker,
	Popover,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useColorPalette } from '../../store/globalStylesStore';
import { isValidCssColor, isCssVar } from '../../utils/color';
import type { ControlProps } from '../../types/controls';

// ── Global Style Badge Component ───────────────────────────────────────────

function GlobalStyleBadge() {
	return (
		<span className="gb-control__global-badge">
			<svg
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 2L2 7L12 12L22 7L12 2Z"
					fill="currentColor"
					opacity="0.7"
				/>
				<path
					d="M2 17L12 22L22 17"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M2 12L12 17L22 12"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			{ __( 'Global', 'goblocks' ) }
		</span>
	);
}

// ── Default palette — always available out of the box ─────────────────────

const DEFAULT_COLORS: Array< { label: string; color: string } > = [
	{ label: 'White', color: '#ffffff' },
	{ label: 'Black', color: '#000000' },
	{ label: 'Slate', color: '#475569' },
	{ label: 'Gray', color: '#9ca3af' },
	{ label: 'Red', color: '#ef4444' },
	{ label: 'Orange', color: '#f97316' },
	{ label: 'Yellow', color: '#eab308' },
	{ label: 'Green', color: '#22c55e' },
	{ label: 'Teal', color: '#14b8a6' },
	{ label: 'Blue', color: '#3b82f6' },
	{ label: 'Indigo', color: '#6366f1' },
	{ label: 'Purple', color: '#8b5cf6' },
	{ label: 'Pink', color: '#ec4899' },
];

// ── Types ─────────────────────────────────────────────────────────────────

type ColorControlProps = Omit< ControlProps, 'tokenOptions' >;

// ── Swatch ────────────────────────────────────────────────────────────────

function ColorSwatch( {
	color,
	label,
	active,
	onClick,
}: {
	color: string;
	label: string;
	active: boolean;
	onClick: () => void;
} ) {
	return (
		<button
			className={ `gb-color-swatch${ active ? ' is-active' : '' }` }
			style={ { background: color } }
			onClick={ onClick }
			title={ label }
			aria-label={ label }
			aria-pressed={ active }
		/>
	);
}

// ── Component ─────────────────────────────────────────────────────────────

export function ColorControl( {
	value,
	onChange,
	label,
	help,
	inheritedValue,
	resetable = true,
	disabled = false,
}: ColorControlProps ) {
	const [ pickerOpen, setPickerOpen ] = useState( false );
	const colorPalette = useColorPalette();

	const displayValue = value ?? '';
	const isVar = isCssVar( displayValue );

	const handleColorChange = useCallback(
		( color: string ) => {
			onChange( color );
			setPickerOpen( false );
		},
		[ onChange ]
	);

	function handleHexInput( hex: string ) {
		if ( '' === hex ) {
			onChange( '' );
			return;
		}
		if ( isValidCssColor( hex ) ) {
			onChange( hex );
		}
	}

	function handleReset() {
		onChange( '' );
		setPickerOpen( false );
	}

	return (
		<div className="gb-color-control">
			<div className="gb-color-control__header">
				{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
				<label className="gb-color-control__label">{ label }</label>
				<div className="gb-color-control__header-actions">
					{ isVar && <GlobalStyleBadge /> }
					{ resetable && displayValue && (
						<Button
							isSmall
							variant="tertiary"
							onClick={ handleReset }
							aria-label={ __( 'Reset', 'goblocks' ) }
							disabled={ disabled }
						>
							{ __( 'Reset', 'goblocks' ) }
						</Button>
					) }
				</div>
			</div>

			{ /* Plugin custom palette — shown when user has defined colors */ }
			{ colorPalette.length > 0 && (
				<>
					<span className="gb-color-control__palette-label">
						{ __( 'Custom Colors', 'goblocks' ) }
					</span>
					<div
						className="gb-color-control__palette"
						aria-label={ __( 'Custom color palette', 'goblocks' ) }
					>
						{ colorPalette.map( ( entry ) => {
							const varVal = `var(--gb-color-${ entry.slug })`;
							return (
								<ColorSwatch
									key={ entry.slug }
									color={ entry.color }
									label={ entry.name }
									active={
										displayValue === varVal ||
										displayValue === entry.color
									}
									onClick={ () => onChange( varVal ) }
								/>
							);
						} ) }
					</div>
				</>
			) }

			{ /* Default color palette — always visible */ }
			<span className="gb-color-control__palette-label">
				{ __( 'Default Colors', 'goblocks' ) }
			</span>
			<div
				className="gb-color-control__palette"
				aria-label={ __( 'Default color palette', 'goblocks' ) }
			>
				{ DEFAULT_COLORS.map( ( entry ) => (
					<ColorSwatch
						key={ entry.color }
						color={ entry.color }
						label={ entry.label }
						active={ displayValue === entry.color }
						onClick={ () => onChange( entry.color ) }
					/>
				) ) }
			</div>

			{ /* Color picker button */ }
			<div className="gb-color-control__row">
				<Button
					className="gb-color-control__preview"
					style={ {
						background: isVar
							? `var(${ displayValue.slice( 4, -1 ) })`
							: displayValue ||
							  ( inheritedValue ?? 'transparent' ),
					} }
					onClick={ () => setPickerOpen( ( o ) => ! o ) }
					aria-label={ __( 'Open color picker', 'goblocks' ) }
					disabled={ disabled }
				>
					<span className="screen-reader-text">
						{ __( 'Open color picker', 'goblocks' ) }
					</span>
				</Button>

				<TextControl
					className="gb-color-control__hex"
					value={ isVar ? displayValue : displayValue }
					placeholder={
						inheritedValue ?? __( 'Color or var()', 'goblocks' )
					}
					onChange={ handleHexInput }
					disabled={ disabled }
					label=""
					hideLabelFromVision
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ pickerOpen && (
					<Popover
						className="gb-color-control__popover"
						onClose={ () => setPickerOpen( false ) }
						placement="bottom-start"
					>
						<ColorPicker
							color={ isVar ? undefined : displayValue }
							onChange={ ( hex ) => handleColorChange( hex ) }
							enableAlpha
						/>
					</Popover>
				) }
			</div>

			{ help && <p className="gb-color-control__help">{ help }</p> }
		</div>
	);
}
