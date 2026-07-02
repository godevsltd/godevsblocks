/**
 * EffectsPanel — Opacity, box-shadow, transform, transition, filter, cursor.
 * Includes :hover state controls for opacity, shadow, and transform.
 */

import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { RangeControl } from '../controls/RangeControl';
import { ShadowControl } from '../controls/ShadowControl';
import { ToggleGroupControl } from '../controls/ToggleGroupControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';

// ── Types ─────────────────────────────────────────────────────────────────

interface EffectsPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Options ───────────────────────────────────────────────────────────────

const CURSOR_OPTIONS = [
	{ label: __( 'Auto', 'goblocks' ), value: 'auto' },
	{ label: __( 'Pointer', 'goblocks' ), value: 'pointer' },
	{ label: __( 'Default', 'goblocks' ), value: 'default' },
	{ label: __( 'None', 'goblocks' ), value: 'none' },
];

const BLEND_MODE_OPTIONS = [
	{ label: __( '— None —', 'goblocks' ),   value: '' },
	{ label: 'Normal',        value: 'normal' },
	{ label: 'Multiply',      value: 'multiply' },
	{ label: 'Screen',        value: 'screen' },
	{ label: 'Overlay',       value: 'overlay' },
	{ label: 'Darken',        value: 'darken' },
	{ label: 'Lighten',       value: 'lighten' },
	{ label: 'Color dodge',   value: 'color-dodge' },
	{ label: 'Color burn',    value: 'color-burn' },
	{ label: 'Hard light',    value: 'hard-light' },
	{ label: 'Soft light',    value: 'soft-light' },
	{ label: 'Difference',    value: 'difference' },
	{ label: 'Exclusion',     value: 'exclusion' },
	{ label: 'Hue',           value: 'hue' },
	{ label: 'Saturation',    value: 'saturation' },
	{ label: 'Color',         value: 'color' },
	{ label: 'Luminosity',    value: 'luminosity' },
];

const TRANSITION_EASING = [
	{ label: __( 'Ease', 'goblocks' ), value: 'ease' },
	{ label: __( 'Ease in', 'goblocks' ), value: 'ease-in' },
	{ label: __( 'Ease out', 'goblocks' ), value: 'ease-out' },
	{ label: __( 'Ease in-out', 'goblocks' ), value: 'ease-in-out' },
	{ label: __( 'Linear', 'goblocks' ), value: 'linear' },
];

const TRANSITION_PROPERTY = [
	{ label: __( 'All', 'goblocks' ), value: 'all' },
	{ label: __( 'Transform', 'goblocks' ), value: 'transform' },
	{ label: __( 'Background', 'goblocks' ), value: 'background' },
	{ label: __( 'Opacity', 'goblocks' ), value: 'opacity' },
	{ label: __( 'Border', 'goblocks' ), value: 'border' },
	{ label: __( 'Box shadow', 'goblocks' ), value: 'box-shadow' },
	{ label: __( 'Color', 'goblocks' ), value: 'color' },
];

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Parse a CSS transition shorthand into structured fields.
 * Handles: "all 0.2s ease" / "transform 300ms ease-in-out" etc.
 */
function parseTransition( css: string | undefined ): {
	property: string;
	duration: string;
	easing: string;
} {
	if ( ! css ) {
		return { property: 'all', duration: '300ms', easing: 'ease' };
	}
	const parts = css.trim().split( /\s+/ );
	return {
		property: parts[ 0 ] ?? 'all',
		duration: parts[ 1 ] ?? '300ms',
		easing: parts[ 2 ] ?? 'ease',
	};
}

function buildTransition(
	property: string,
	duration: string,
	easing: string
): string {
	return `${ property } ${ duration } ${ easing }`;
}

// ── Component ─────────────────────────────────────────────────────────────

export function EffectsPanel( { responsive }: EffectsPanelProps ) {
	const { getStyle, setStyle, getStyleState, setStyleState } = responsive;

	function get( prop: string ) {
		return getStyle( 'effects', prop );
	}
	function set( prop: string ) {
		return ( v: string ) => setStyle( 'effects', prop, v );
	}
	function getState( prop: string, state: 'hover' | 'focus' | 'active' ) {
		return getStyleState( 'effects', prop, state );
	}
	function setState( prop: string, state: 'hover' | 'focus' | 'active' ) {
		return ( v: string ) => setStyleState( 'effects', prop, state, v );
	}

	const transition = parseTransition( get( 'transition' ) );

	function onTransitionChange( patch: Partial< { property: string; duration: string; easing: string } > ) {
		const next = { ...transition, ...patch };
		setStyle( 'effects', 'transition', buildTransition( next.property, next.duration, next.easing ) );
	}

	return (
		<PanelBody title={ __( 'Effects', 'goblocks' ) } initialOpen={ false }>

			{ /* Opacity */ }
			<RangeControl
				label={ __( 'Opacity', 'goblocks' ) }
				value={ get( 'opacity' ) }
				onChange={ set( 'opacity' ) }
				min={ 0 }
				max={ 1 }
				step={ 0.01 }
			/>

			{ /* Box shadow */ }
			<ShadowControl
				label={ __( 'Box shadow', 'goblocks' ) }
				value={ get( 'boxShadow' ) }
				onChange={ set( 'boxShadow' ) }
			/>

			{ /* Transform */ }
			<TextControl
				label={ __( 'Transform', 'goblocks' ) }
				value={ get( 'transform' ) ?? '' }
				placeholder="translateY(-4px) scale(1.05)"
				onChange={ set( 'transform' ) }
				help={ __( 'CSS transform — translateX/Y, scale, rotate, skewX/Y', 'goblocks' ) }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ /* Transition — structured builder */ }
			<div className="gb-effects-panel__transition">
				<p className="gb-effects-panel__section-label">
					{ __( 'Transition', 'goblocks' ) }
				</p>
				<SelectControl
					label={ __( 'Property', 'goblocks' ) }
					value={ transition.property }
					options={ TRANSITION_PROPERTY }
					onChange={ ( v ) => onTransitionChange( { property: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div className="gb-effects-panel__transition-row">
					<TextControl
						label={ __( 'Duration', 'goblocks' ) }
						value={ transition.duration }
						placeholder="300ms"
						onChange={ ( v ) => onTransitionChange( { duration: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Easing', 'goblocks' ) }
						value={ transition.easing }
						options={ TRANSITION_EASING }
						onChange={ ( v ) => onTransitionChange( { easing: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</div>
			</div>

			{ /* Filter */ }
			<TextControl
				label={ __( 'Filter', 'goblocks' ) }
				value={ get( 'filter' ) ?? '' }
				placeholder="blur(4px) brightness(0.8)"
				onChange={ set( 'filter' ) }
				help={ __( 'CSS filter — blur, brightness, contrast, grayscale, etc.', 'goblocks' ) }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ /* Mix-blend-mode */ }
			<SelectControl
				label={ __( 'Mix blend mode', 'goblocks' ) }
				value={ get( 'mixBlendMode' ) ?? '' }
				options={ BLEND_MODE_OPTIONS }
				onChange={ set( 'mixBlendMode' ) }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ /* Cursor */ }
			<ToggleGroupControl
				label={ __( 'Cursor', 'goblocks' ) }
				value={ get( 'cursor' ) }
				options={ CURSOR_OPTIONS }
				onChange={ set( 'cursor' ) }
				deselectable
			/>

			{ /* ── Hover state section ─────────────────────────────────── */ }
			<div className="gb-panel-state-section">
				<p className="gb-panel-state-section__label">
					{ __( ':hover state', 'goblocks' ) }
				</p>

				<RangeControl
					label={ __( 'Hover opacity', 'goblocks' ) }
					value={ getState( 'opacity', 'hover' ) }
					onChange={ setState( 'opacity', 'hover' ) }
					min={ 0 }
					max={ 1 }
					step={ 0.01 }
				/>

				<ShadowControl
					label={ __( 'Hover box shadow', 'goblocks' ) }
					value={ getState( 'boxShadow', 'hover' ) }
					onChange={ setState( 'boxShadow', 'hover' ) }
				/>

				<TextControl
					label={ __( 'Hover transform', 'goblocks' ) }
					value={ getState( 'transform', 'hover' ) ?? '' }
					placeholder="translateY(-4px) scale(1.05)"
					onChange={ setState( 'transform', 'hover' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<TextControl
					label={ __( 'Hover filter', 'goblocks' ) }
					value={ getState( 'filter', 'hover' ) ?? '' }
					placeholder="brightness(1.1)"
					onChange={ setState( 'filter', 'hover' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</div>
		</PanelBody>
	);
}
