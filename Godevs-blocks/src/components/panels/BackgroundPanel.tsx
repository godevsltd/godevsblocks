/**
 * BackgroundPanel — Background color, gradient, image, overlay, hover state.
 */

import {
	PanelBody,
	ToggleControl,
	SelectControl,
	Button,
} from '@wordpress/components';
import { MediaUpload } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { ColorControl } from '../controls/ColorControl';
import { GradientControl } from '../controls/GradientControl';
import { RangeControl } from '../controls/RangeControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';

// ── Option sets ───────────────────────────────────────────────────────────

const BG_SIZE_OPTIONS = [
	{ label: __( 'Cover', 'goblocks' ), value: 'cover' },
	{ label: __( 'Contain', 'goblocks' ), value: 'contain' },
	{ label: __( 'Auto', 'goblocks' ), value: 'auto' },
];

const BG_REPEAT_OPTIONS = [
	{ label: __( 'No repeat', 'goblocks' ), value: 'no-repeat' },
	{ label: __( 'Repeat', 'goblocks' ), value: 'repeat' },
	{ label: __( 'Repeat X', 'goblocks' ), value: 'repeat-x' },
	{ label: __( 'Repeat Y', 'goblocks' ), value: 'repeat-y' },
];

const BG_POSITION_OPTIONS = [
	{ label: __( '— Default —', 'goblocks' ), value: '' },
	{ label: __( 'Center', 'goblocks' ), value: 'center' },
	{ label: __( 'Top', 'goblocks' ), value: 'top' },
	{ label: __( 'Bottom', 'goblocks' ), value: 'bottom' },
	{ label: __( 'Left', 'goblocks' ), value: 'left' },
	{ label: __( 'Right', 'goblocks' ), value: 'right' },
	{ label: __( 'Top left', 'goblocks' ), value: 'top left' },
	{ label: __( 'Top right', 'goblocks' ), value: 'top right' },
	{ label: __( 'Bottom left', 'goblocks' ), value: 'bottom left' },
	{ label: __( 'Bottom right', 'goblocks' ), value: 'bottom right' },
];

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';

// ── Types ─────────────────────────────────────────────────────────────────

interface BackgroundPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Component ─────────────────────────────────────────────────────────────

export function BackgroundPanel( { responsive }: BackgroundPanelProps ) {
	const {
		getStyle,
		getInheritedValue,
		setStyle,
		setStyleBatch,
		getStyleState,
		setStyleState,
	} = responsive;

	function get( prop: string ) {
		return getStyle( 'background', prop );
	}
	function inh( prop: string ) {
		return getInheritedValue( 'background', prop );
	}
	function set( prop: string ) {
		return ( v: string ) => setStyle( 'background', prop, v );
	}

	const bgImageUrl = inh( 'backgroundImage' ) ?? '';
	const hasImage = bgImageUrl.startsWith( 'url(' );
	const gradientVal = inh( 'gradient' ) ?? '';
	const hasGradient = Boolean( gradientVal );

	// Use inherited value so the toggle stays consistent across responsive breakpoints.
	// (overlayColor is always stored at base, but inh() walks the chain.)
	const hasOverlay = Boolean( inh( 'overlayColor' ) );

	function onSelectImage( media: { url: string } ) {
		setStyle( 'background', 'backgroundImage', `url(${ media.url })` );
	}

	function onRemoveImage() {
		setStyle( 'background', 'backgroundImage', '' );
	}

	return (
		<PanelBody
			title={ __( 'Background', 'goblocks' ) }
			initialOpen={ false }
		>
			{ /* ── Solid color ─────────────────────────────────────────── */ }
			<ColorControl
				label={ __( 'Background color', 'goblocks' ) }
				value={ get( 'backgroundColor' ) }
				inheritedValue={ inh( 'backgroundColor' ) }
				onChange={ set( 'backgroundColor' ) }
				breakpoint="base"
			/>

			{ /* ── Gradient ────────────────────────────────────────────── */ }
			<div className="gb-background-panel__gradient">
				<ToggleControl
					label={ __( 'Gradient background', 'goblocks' ) }
					help={
						hasGradient
							? __(
									'Gradient renders above background color.',
									'goblocks'
							  )
							: __(
									'Add a CSS gradient as background.',
									'goblocks'
							  )
					}
					checked={ hasGradient }
					onChange={ ( checked ) => {
						set( 'gradient' )( checked ? DEFAULT_GRADIENT : '' );
					} }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ hasGradient && (
					<GradientControl
						label={ __( 'Gradient', 'goblocks' ) }
						value={ inh( 'gradient' ) }
						onChange={ set( 'gradient' ) }
					/>
				) }
			</div>

			{ /* ── Background image ────────────────────────────────────── */ }
			<div className="gb-background-panel__image">
				<p className="gb-background-panel__image-label">
					{ __( 'Background image', 'goblocks' ) }
				</p>
				<MediaUpload
					onSelect={ onSelectImage }
					allowedTypes={ [ 'image' ] }
					render={ ( { open } ) => (
						<div className="gb-background-panel__image-row">
							{ hasImage && (
								<div
									className="gb-background-panel__image-preview"
									style={ { backgroundImage: bgImageUrl } }
								/>
							) }
							<div className="gb-background-panel__image-actions">
								<Button
									variant="secondary"
									isSmall
									onClick={ open }
								>
									{ hasImage
										? __( 'Replace image', 'goblocks' )
										: __( 'Select image', 'goblocks' ) }
								</Button>
								{ hasImage && (
									<Button
										variant="tertiary"
										isSmall
										isDestructive
										onClick={ onRemoveImage }
									>
										{ __( 'Remove', 'goblocks' ) }
									</Button>
								) }
							</div>
						</div>
					) }
				/>
			</div>

			{ /* Image options — shown when a background image is set */ }
			{ hasImage && (
				<>
					<SelectControl
						label={ __( 'Background size', 'goblocks' ) }
						value={ get( 'backgroundSize' ) ?? '' }
						options={ [
							{
								label: __( '— Default —', 'goblocks' ),
								value: '',
							},
							...BG_SIZE_OPTIONS,
						] }
						onChange={ set( 'backgroundSize' ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>

					<SelectControl
						label={ __( 'Background position', 'goblocks' ) }
						value={ get( 'backgroundPosition' ) ?? '' }
						options={ BG_POSITION_OPTIONS }
						onChange={ set( 'backgroundPosition' ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>

					<SelectControl
						label={ __( 'Background repeat', 'goblocks' ) }
						value={ get( 'backgroundRepeat' ) ?? '' }
						options={ [
							{
								label: __( '— Default —', 'goblocks' ),
								value: '',
							},
							...BG_REPEAT_OPTIONS,
						] }
						onChange={ set( 'backgroundRepeat' ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</>
			) }

			{ /* ── Overlay ─────────────────────────────────────────────── */ }
			<div className="gb-background-panel__overlay">
				<ToggleControl
					label={ __( 'Overlay', 'goblocks' ) }
					help={ __(
						'Add a color overlay via ::before pseudo-element.',
						'goblocks'
					) }
					checked={ hasOverlay }
					onChange={ ( checked ) => {
						// Use setStyleBatch so both values land in one setAttributes call.
						// Two separate setStyle() calls read the same stale `styles` snapshot
						// — the second clobbers the first, leaving overlayColor unset.
						setStyleBatch( 'background', {
							overlayColor: checked ? '#000000' : '',
							overlayOpacity: checked ? '0.5' : '',
						} );
					} }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ hasOverlay && (
					<>
						<ColorControl
							label={ __( 'Overlay color', 'goblocks' ) }
							value={ inh( 'overlayColor' ) }
							onChange={ set( 'overlayColor' ) }
							breakpoint="base"
						/>
						<RangeControl
							label={ __( 'Overlay opacity', 'goblocks' ) }
							value={ inh( 'overlayOpacity' ) }
							onChange={ set( 'overlayOpacity' ) }
							min={ 0 }
							max={ 1 }
							step={ 0.01 }
						/>
					</>
				) }
			</div>

			{ /* ── Hover / Focus state ──────────────────────────────────── */ }
			<div className="gb-panel-state-section">
				<p className="gb-panel-state-section__label">
					{ __( ':hover state', 'goblocks' ) }
				</p>
				<ColorControl
					label={ __( 'Hover background color', 'goblocks' ) }
					value={ getStyleState(
						'background',
						'backgroundColor',
						'hover'
					) }
					onChange={ ( v ) =>
						setStyleState(
							'background',
							'backgroundColor',
							'hover',
							v
						)
					}
					breakpoint="base"
				/>
				<ColorControl
					label={ __( 'Focus background color', 'goblocks' ) }
					value={ getStyleState(
						'background',
						'backgroundColor',
						'focus'
					) }
					onChange={ ( v ) =>
						setStyleState(
							'background',
							'backgroundColor',
							'focus',
							v
						)
					}
					breakpoint="base"
				/>
			</div>
		</PanelBody>
	);
}
