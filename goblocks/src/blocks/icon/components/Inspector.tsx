import { useState } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	TextareaControl,
	Button,
	RangeControl,
	ColorPicker,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { IconPicker } from './IconPicker';
import { iconToSvg } from '../icons';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IconAttributes {
	iconSlug:            string;
	svgContent:          string;
	iconSize:            number;
	iconColor:           string;
	iconHoverColor:      string;
	iconBg:              string;
	iconBgColor:         string;
	iconBgHoverColor:    string;
	iconBgPadding:       number;
	animation:           string;
	animationTrigger:    string;
	animationDuration:   number;
	animationDelay:      number;
	animationIterations: string;
	ariaHidden:          boolean;
	ariaLabel:           string;
	link:                string;
	linkTarget:          string;
	linkRel:             string;
	styles:              BlockStyles;
	globalClasses:       string[];
}

interface IconInspectorProps {
	attributes:    IconAttributes;
	setAttributes: ( attrs: Partial< IconAttributes > ) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TARGET_OPTIONS = [
	{ label: __( 'Same tab', 'goblocks' ), value: '_self' },
	{ label: __( 'New tab', 'goblocks' ),  value: '_blank' },
];

const ANIMATION_OPTIONS = [
	{ label: __( 'None', 'goblocks' ),   value: 'none' },
	{ label: __( 'Spin', 'goblocks' ),   value: 'spin' },
	{ label: __( 'Pulse', 'goblocks' ),  value: 'pulse' },
	{ label: __( 'Bounce', 'goblocks' ), value: 'bounce' },
	{ label: __( 'Tada', 'goblocks' ),   value: 'tada' },
	{ label: __( 'Swing', 'goblocks' ),  value: 'swing' },
	{ label: __( 'Shake', 'goblocks' ),  value: 'shake' },
];

const TRIGGER_OPTIONS = [
	{ label: __( 'On page load', 'goblocks' ),        value: 'load' },
	{ label: __( 'On hover', 'goblocks' ),             value: 'hover' },
	{ label: __( 'On scroll into view', 'goblocks' ),  value: 'scroll' },
];

const ITER_OPTIONS = [
	{ label: '1×',       value: '1' },
	{ label: '2×',       value: '2' },
	{ label: '3×',       value: '3' },
	{ label: __( 'Infinite', 'goblocks' ), value: 'infinite' },
];

const BG_OPTIONS = [
	{ label: __( 'None', 'goblocks' ),    value: 'none' },
	{ label: __( 'Circle', 'goblocks' ),  value: 'circle' },
	{ label: __( 'Square', 'goblocks' ),  value: 'square' },
	{ label: __( 'Rounded', 'goblocks' ), value: 'rounded' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function IconInspector( {
	attributes,
	setAttributes,
}: IconInspectorProps ) {
	const {
		iconSlug, svgContent, iconSize,
		iconColor, iconHoverColor,
		iconBg, iconBgColor, iconBgHoverColor, iconBgPadding,
		animation, animationTrigger, animationDuration, animationDelay, animationIterations,
		ariaHidden, ariaLabel,
		link, linkTarget, linkRel,
		styles, globalClasses,
	} = attributes;

	const [ showCustom, setShowCustom ] = useState( !! svgContent && ! iconSlug );

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const handleSelectIcon = ( slug: string ) => {
		setAttributes( { iconSlug: slug, svgContent: iconToSvg( slug, iconSize ) } );
	};

	const hasAnimation = animation !== 'none';
	const hasBg        = iconBg !== 'none';

	const stylesContent = (
		<>
			{ /* ── Icon Color ─────────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Color', 'goblocks' ) } initialOpen>
				<p style={ { margin: '0 0 6px', fontWeight: 600, fontSize: '11px' } }>
					{ __( 'Icon color', 'goblocks' ) }
				</p>
				<ColorPicker
					color={ iconColor || '#4f46e5' }
					onChange={ ( v: string ) => setAttributes( { iconColor: v } ) }
					enableAlpha
					defaultValue=""
				/>
				<p style={ { margin: '10px 0 6px', fontWeight: 600, fontSize: '11px' } }>
					{ __( 'Hover color', 'goblocks' ) }
				</p>
				<ColorPicker
					color={ iconHoverColor || '' }
					onChange={ ( v: string ) => setAttributes( { iconHoverColor: v } ) }
					enableAlpha
					defaultValue=""
				/>
			</PanelBody>

			{ /* ── Background shape ─────────────────────────────────────── */ }
			<PanelBody title={ __( 'Background Shape', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Shape', 'goblocks' ) }
					value={ iconBg }
					options={ BG_OPTIONS }
					onChange={ ( v ) => setAttributes( { iconBg: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ hasBg && (
					<>
						<div style={ { height: '8px' } } />
						<RangeControl
							label={ __( 'Padding (px)', 'goblocks' ) }
							value={ iconBgPadding }
							onChange={ ( v ) => setAttributes( { iconBgPadding: v ?? 16 } ) }
							min={ 4 }
							max={ 64 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<p style={ { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px' } }>
							{ __( 'Background color', 'goblocks' ) }
						</p>
						<ColorPicker
							color={ iconBgColor || '#e0e7ff' }
							onChange={ ( v: string ) => setAttributes( { iconBgColor: v } ) }
							enableAlpha
							defaultValue="#e0e7ff"
						/>
						<p style={ { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px' } }>
							{ __( 'Hover background color', 'goblocks' ) }
						</p>
						<ColorPicker
							color={ iconBgHoverColor || '' }
							onChange={ ( v: string ) => setAttributes( { iconBgHoverColor: v } ) }
							enableAlpha
							defaultValue=""
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Animation ────────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Animation', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Effect', 'goblocks' ) }
					value={ animation }
					options={ ANIMATION_OPTIONS }
					onChange={ ( v ) => setAttributes( { animation: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ hasAnimation && (
					<>
						<div style={ { height: '8px' } } />
						<SelectControl
							label={ __( 'Trigger', 'goblocks' ) }
							value={ animationTrigger }
							options={ TRIGGER_OPTIONS }
							onChange={ ( v ) => setAttributes( { animationTrigger: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={ __( 'Repeat', 'goblocks' ) }
							value={ animationIterations }
							options={ ITER_OPTIONS }
							onChange={ ( v ) => setAttributes( { animationIterations: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<RangeControl
							label={ __( 'Duration (s)', 'goblocks' ) }
							value={ animationDuration }
							onChange={ ( v ) => setAttributes( { animationDuration: v ?? 1 } ) }
							min={ 0.2 }
							max={ 5 }
							step={ 0.1 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<RangeControl
							label={ __( 'Delay (s)', 'goblocks' ) }
							value={ animationDelay }
							onChange={ ( v ) => setAttributes( { animationDelay: v ?? 0 } ) }
							min={ 0 }
							max={ 3 }
							step={ 0.1 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			{ /* ── Icon selection ────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Icon', 'goblocks' ) } initialOpen>
				<div className="gb-inspector-button-row">
					<Button
						variant={ ! showCustom ? 'primary' : 'secondary' }
						size="small"
						onClick={ () => setShowCustom( false ) }
					>
						{ __( 'Library', 'goblocks' ) }
					</Button>
					<Button
						variant={ showCustom ? 'primary' : 'secondary' }
						size="small"
						onClick={ () => setShowCustom( true ) }
					>
						{ __( 'Custom SVG', 'goblocks' ) }
					</Button>
				</div>

				{ ! showCustom && (
					<IconPicker selected={ iconSlug } onSelect={ handleSelectIcon } />
				) }

				{ showCustom && (
					<TextareaControl
						label={ __( 'Paste SVG markup', 'goblocks' ) }
						help={ __( 'SVG is sanitized before saving. Script tags and event handlers are removed.', 'goblocks' ) }
						value={ svgContent }
						onChange={ ( raw ) => setAttributes( { svgContent: raw, iconSlug: '' } ) }
						rows={ 6 }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }

				<NumberControl
					label={ __( 'Size (px)', 'goblocks' ) }
					value={ iconSize }
					min={ 8 }
					max={ 512 }
					onChange={ ( val ) => {
						const size = parseInt( String( val ?? 32 ), 10 ) || 32;
						setAttributes( { iconSize: size } );
						if ( iconSlug ) {
							setAttributes( { svgContent: iconToSvg( iconSlug, size ) } );
						}
					} }
					// @ts-ignore
					__next40pxDefaultSize
				/>
			</PanelBody>

			{ /* ── Link ─────────────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Link', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'URL', 'goblocks' ) }
					value={ link }
					type="url"
					onChange={ ( val ) => setAttributes( { link: val } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ link && (
					<>
						<SelectControl
							label={ __( 'Open in', 'goblocks' ) }
							value={ linkTarget }
							options={ TARGET_OPTIONS }
							onChange={ ( val ) => setAttributes( { linkTarget: val } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Rel', 'goblocks' ) }
							value={ linkRel }
							placeholder="noopener noreferrer"
							onChange={ ( val ) => setAttributes( { linkRel: val } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Accessibility ──────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Accessibility', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Hide from screen readers (aria-hidden)', 'goblocks' ) }
					help={ __( 'Decorative icons should be hidden. Meaningful icons need an aria-label.', 'goblocks' ) }
					checked={ ariaHidden }
					onChange={ ( val ) => setAttributes( { ariaHidden: val } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ ! ariaHidden && (
					<TextControl
						label={ __( 'Aria label', 'goblocks' ) }
						value={ ariaLabel }
						onChange={ ( val ) => setAttributes( { ariaLabel: val } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
			</PanelBody>

			{ /* ── CSS classes ──────────────────────────────────────────────── */ }
			<PanelBody title={ __( 'CSS Classes', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					help={ __( 'Space-separated list of extra classes.', 'goblocks' ) }
					onChange={ ( val ) =>
						setAttributes( { globalClasses: val.split( /\s+/ ).filter( Boolean ) } )
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