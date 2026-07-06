/**
 * Column block — Inspector Controls.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { LayoutPanel } from '../../../components/panels/LayoutPanel';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { deepMerge } from '../../../utils/deepMerge';
import { clsx } from '../../../utils/classNames';
import type { BlockAttributes } from '../../../types/block';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface ColumnAttributes extends BlockAttributes {
	ariaLabel: string;
	animationClass: string;
}

interface ColumnInspectorProps {
	attributes: ColumnAttributes;
	setAttributes: ( attrs: Partial< ColumnAttributes > ) => void;
}

// ── Static options ────────────────────────────────────────────────────────

const TAG_OPTIONS = [
	{ label: 'div', value: 'div' },
	{ label: 'section', value: 'section' },
	{ label: 'article', value: 'article' },
	{ label: 'aside', value: 'aside' },
	{ label: 'header', value: 'header' },
	{ label: 'footer', value: 'footer' },
	{ label: 'nav', value: 'nav' },
	{ label: 'main', value: 'main' },
	{ label: 'figure', value: 'figure' },
	{ label: 'li', value: 'li' },
	{ label: 'span', value: 'span' },
];

const ANIMATION_OPTIONS = [
	{ label: __( 'None', 'goblocks' ), value: '' },
	{ label: __( 'Fade in', 'goblocks' ), value: 'gb-anim-fade-in' },
	{ label: __( 'Slide up', 'goblocks' ), value: 'gb-anim-slide-up' },
	{ label: __( 'Slide left', 'goblocks' ), value: 'gb-anim-slide-left' },
	{ label: __( 'Slide right', 'goblocks' ), value: 'gb-anim-slide-right' },
	{ label: __( 'Zoom in', 'goblocks' ), value: 'gb-anim-zoom-in' },
];

// Width presets — label / flex-basis value
const WIDTH_PRESETS = [
	{ label: __( 'Auto', 'goblocks' ), value: '' },
	{ label: '25%', value: '25%' },
	{ label: '33%', value: '33.333%' },
	{ label: '50%', value: '50%' },
	{ label: '66%', value: '66.667%' },
	{ label: '75%', value: '75%' },
	{ label: '100%', value: '100%' },
];

// ── Component ─────────────────────────────────────────────────────────────

export function ColumnInspector( {
	attributes,
	setAttributes,
}: ColumnInspectorProps ) {
	const { styles, tagName, ariaLabel, animationClass, globalClasses } =
		attributes;

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const { getStyle } = responsive;

	// ── Column width ─────────────────────────────────────────────────────

	// Active width = flex-basis from layout category (set by our presets)
	// or width from sizing category (set by SizingPanel manually)
	const flexBasis = getStyle( 'layout', 'flexBasis' ) ?? '';
	const sizingWidth = getStyle( 'sizing', 'width' ) ?? '';
	const activeWidth = flexBasis || sizingWidth;

	function handleWidthPreset( value: string ) {
		const bp = responsive.activeBreakpoint;
		const isAuto = ! value;
		setAttributes( {
			styles: deepMerge( styles as any, {
				layout: {
					flexGrow: { [ bp ]: isAuto ? '1' : '0' },
					flexShrink: { [ bp ]: isAuto ? '1' : '0' },
					flexBasis: { [ bp ]: isAuto ? '0%' : value },
				},
				sizing: {
					// Keep sizing.width in sync so SizingPanel reflects the value
					width: { [ bp ]: isAuto ? '' : value },
				},
			} ) as BlockStyles,
		} );
	}

	// ── Panels ────────────────────────────────────────────────────────────

	const stylesContent = (
		<>
			{ /* Column width quick-select */ }
			<PanelBody title={ __( 'Column', 'goblocks' ) } initialOpen>
				<p className="gb-column-width-label">
					{ __( 'Width', 'goblocks' ) }
				</p>
				<div className="gb-column-width-presets">
					{ WIDTH_PRESETS.map( ( preset ) => (
						<button
							key={ preset.label }
							type="button"
							className={ clsx(
								'gb-column-width-presets__btn',
								activeWidth === preset.value && 'is-active'
							) }
							onClick={ () => handleWidthPreset( preset.value ) }
						>
							{ preset.label }
						</button>
					) ) }
				</div>
			</PanelBody>

			<LayoutPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SizingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SpacingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<TypographyPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BackgroundPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BorderPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<EffectsPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
		</>
	);

	const advancedContent = (
		<>
			{ /* HTML element */ }
			<PanelBody title={ __( 'HTML Element', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Tag name', 'goblocks' ) }
					value={ tagName }
					options={ TAG_OPTIONS }
					onChange={ ( v ) => setAttributes( { tagName: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'ARIA label', 'goblocks' ) }
					value={ ariaLabel }
					help={ __(
						"Overrides the element's accessible name.",
						'goblocks'
					) }
					onChange={ ( v ) => setAttributes( { ariaLabel: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* Entrance animation */ }
			<PanelBody
				title={ __( 'Animation', 'goblocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Entrance animation', 'goblocks' ) }
					value={ animationClass }
					options={ ANIMATION_OPTIONS }
					onChange={ ( v ) => setAttributes( { animationClass: v } ) }
					help={ __(
						'CSS-only animation applied via class. No JS required.',
						'goblocks'
					) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* CSS classes */ }
			<PanelBody
				title={ __( 'CSS Classes', 'goblocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					help={ __(
						'Space-separated list of extra classes.',
						'goblocks'
					) }
					onChange={ ( v ) =>
						setAttributes( {
							globalClasses: v.split( /\s+/ ).filter( Boolean ),
						} )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	return (
		<InspectorControls>
			<InspectorTabs
				stylesContent={ stylesContent }
				advancedContent={ advancedContent }
			/>
		</InspectorControls>
	);
}
