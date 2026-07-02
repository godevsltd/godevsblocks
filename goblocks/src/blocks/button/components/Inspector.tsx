// @ts-ignore
import { InspectorControls, URLInput } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { deepMerge } from '../../../utils/deepMerge';
import ICONS, { ICON_MAP } from '../../icon/icons/index';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface ButtonAttributes {
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	href: string;
	target: string;
	rel: string;
	download: boolean;
	buttonType: string;
	ariaLabel: string;
	iconSlug: string;
	iconSvg: string;
	iconPosition: string;
	iconSize: string;
}

interface ButtonInspectorProps {
	attributes: ButtonAttributes;
	setAttributes: ( attrs: Partial< ButtonAttributes > ) => void;
}

// ── Variant definitions ───────────────────────────────────────────────────

interface ButtonVariant {
	label: string;
	icon: JSX.Element;
	styles: Record< string, any >;
}

const BUTTON_VARIANTS: ButtonVariant[] = [
	{
		label: __( 'Solid', 'goblocks' ),
		styles: {
			background: { backgroundColor: { base: '#4f46e5' } },
			typography: { color: { base: '#ffffff' } },
			border: {
				borderTopWidth:     { base: '' },
				borderRightWidth:   { base: '' },
				borderBottomWidth:  { base: '' },
				borderLeftWidth:    { base: '' },
				borderTopColor:     { base: '' },
				borderRightColor:   { base: '' },
				borderBottomColor:  { base: '' },
				borderLeftColor:    { base: '' },
			},
		},
		icon: (
			<svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
				<rect x="0" y="0" width="28" height="18" rx="5" fill="currentColor" />
				<rect x="6" y="7" width="16" height="4" rx="1.5" fill="white" opacity="0.85" />
			</svg>
		),
	},
	{
		label: __( 'Outline', 'goblocks' ),
		styles: {
			background: { backgroundColor: { base: 'transparent' } },
			typography: { color: { base: '#4f46e5' } },
			border: {
				borderTopWidth:     { base: '2px' },
				borderRightWidth:   { base: '2px' },
				borderBottomWidth:  { base: '2px' },
				borderLeftWidth:    { base: '2px' },
				borderTopColor:     { base: '#4f46e5' },
				borderRightColor:   { base: '#4f46e5' },
				borderBottomColor:  { base: '#4f46e5' },
				borderLeftColor:    { base: '#4f46e5' },
				borderTopStyle:     { base: 'solid' },
				borderRightStyle:   { base: 'solid' },
				borderBottomStyle:  { base: 'solid' },
				borderLeftStyle:    { base: 'solid' },
			},
		},
		icon: (
			<svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
				<rect x="1" y="1" width="26" height="16" rx="4.5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="7" y="7" width="14" height="4" rx="1.5" fill="currentColor" opacity="0.7" />
			</svg>
		),
	},
	{
		label: __( 'Ghost', 'goblocks' ),
		styles: {
			background: { backgroundColor: { base: 'rgba(79,70,229,0.1)' } },
			typography: { color: { base: '#4f46e5' } },
			border: {
				borderTopWidth:    { base: '' },
				borderRightWidth:  { base: '' },
				borderBottomWidth: { base: '' },
				borderLeftWidth:   { base: '' },
				borderTopColor:    { base: '' },
				borderRightColor:  { base: '' },
				borderBottomColor: { base: '' },
				borderLeftColor:   { base: '' },
			},
		},
		icon: (
			<svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
				<rect x="0" y="0" width="28" height="18" rx="5" fill="currentColor" opacity="0.12" />
				<rect x="7" y="7" width="14" height="4" rx="1.5" fill="currentColor" opacity="0.75" />
			</svg>
		),
	},
	{
		label: __( 'Text', 'goblocks' ),
		styles: {
			background: { backgroundColor: { base: 'transparent' } },
			typography: { color: { base: '#4f46e5' } },
			border: {
				borderTopWidth:    { base: '' },
				borderRightWidth:  { base: '' },
				borderBottomWidth: { base: '' },
				borderLeftWidth:   { base: '' },
				borderTopColor:    { base: '' },
				borderRightColor:  { base: '' },
				borderBottomColor: { base: '' },
				borderLeftColor:   { base: '' },
			},
			spacing: {
				paddingLeft:  { base: '0.25rem' },
				paddingRight: { base: '0.25rem' },
			},
		},
		icon: (
			<svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
				<rect x="4" y="7" width="20" height="4" rx="1.5" fill="currentColor" opacity="0.75" />
				<line x1="4" y1="15" x2="24" y2="15" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
			</svg>
		),
	},
];

// ── Option lists ──────────────────────────────────────────────────────────

const TAG_OPTIONS = [
	{ label: __( '<a> Link', 'goblocks' ), value: 'a' },
	{ label: __( '<button>', 'goblocks' ), value: 'button' },
];

const TARGET_OPTIONS = [
	{ label: __( 'Same tab', 'goblocks' ), value: '_self' },
	{ label: __( 'New tab', 'goblocks' ), value: '_blank' },
];

const BUTTON_TYPE_OPTIONS = [
	{ label: __( 'button', 'goblocks' ), value: 'button' },
	{ label: __( 'submit', 'goblocks' ), value: 'submit' },
	{ label: __( 'reset',  'goblocks' ), value: 'reset' },
];

const ICON_SLUG_OPTIONS = [
	{ label: __( '— No icon —', 'goblocks' ), value: '' },
	...ICONS.map( ( icon ) => ( { label: icon.label, value: icon.slug } ) ),
];

const ICON_POSITION_OPTIONS = [
	{ label: __( 'Before text', 'goblocks' ), value: 'before' },
	{ label: __( 'After text',  'goblocks' ), value: 'after'  },
];

// ── Component ─────────────────────────────────────────────────────────────

export function ButtonInspector( {
	attributes,
	setAttributes,
}: ButtonInspectorProps ) {
	const {
		styles,
		tagName,
		href,
		target,
		rel,
		download,
		buttonType,
		ariaLabel,
		globalClasses,
		iconSlug,
		iconPosition,
		iconSize,
	} = attributes;

	function onIconSlugChange( slug: string ) {
		const iconDef = ICON_MAP[ slug ];
		setAttributes( {
			iconSlug: slug,
			iconSvg: iconDef ? iconDef.inner : '',
		} );
	}

	function applyVariant( variant: ButtonVariant ) {
		setAttributes( {
			styles: deepMerge( styles as Record< string, any >, variant.styles ) as BlockStyles,
		} );
	}

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const isLink = 'a' === tagName;

	const stylesContent = (
		<>
			{ /* ── Button Variant Strip ─────────────────────────────── */ }
			<div className="gb-button-variants">
				<p className="gb-button-variants__label">
					{ __( 'Style Preset', 'goblocks' ) }
				</p>
				<div className="gb-button-variants__grid">
					{ BUTTON_VARIANTS.map( ( variant ) => (
						<button
							key={ variant.label }
							type="button"
							className="gb-button-variants__btn"
							onClick={ () => applyVariant( variant ) }
							title={ variant.label }
						>
							{ variant.icon }
							<span>{ variant.label }</span>
						</button>
					) ) }
				</div>
			</div>

			<TypographyPanel styles={ styles } responsive={ responsive } />

			{ /* ── Icon ───────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Icon', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Icon', 'goblocks' ) }
					value={ iconSlug }
					options={ ICON_SLUG_OPTIONS }
					onChange={ onIconSlugChange }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ !! iconSlug && (
					<>
						<SelectControl
							label={ __( 'Position', 'goblocks' ) }
							value={ iconPosition }
							options={ ICON_POSITION_OPTIONS }
							onChange={ ( value ) =>
								setAttributes( { iconPosition: value } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Icon size', 'goblocks' ) }
							value={ iconSize }
							help={ __( 'CSS size value, e.g. 1em or 16px.', 'goblocks' ) }
							onChange={ ( value ) =>
								setAttributes( { iconSize: value } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			<SizingPanel   styles={ styles } responsive={ responsive } />
			<SpacingPanel  styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel   styles={ styles } responsive={ responsive } />
			<EffectsPanel  styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			{ /* ── Element type ───────────────────────────────────── */ }
			<PanelBody title={ __( 'Element Type', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'HTML element', 'goblocks' ) }
					value={ tagName }
					options={ TAG_OPTIONS }
					onChange={ ( value ) =>
						setAttributes( { tagName: value } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── Link settings — <a> element only ─────────────── */ }
			{ isLink && (
				<PanelBody title={ __( 'Link', 'goblocks' ) } initialOpen>
					<div className="gb-url-input-wrap">
						<p className="gb-url-input-wrap__label">
							{ __( 'URL', 'goblocks' ) }
						</p>
						<URLInput
							value={ href }
							onChange={ ( value: string ) =>
								setAttributes( { href: value } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</div>
					<SelectControl
						label={ __( 'Open in', 'goblocks' ) }
						value={ target }
						options={ TARGET_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { target: value } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					{ '_blank' === target && (
						<TextControl
							label={ __( 'Rel attribute', 'goblocks' ) }
							value={ rel }
							help={ __(
								'noopener noreferrer added automatically for new tab.',
								'goblocks'
							) }
							onChange={ ( value ) =>
								setAttributes( { rel: value } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					) }
					<ToggleControl
						label={ __( 'Download', 'goblocks' ) }
						help={ __(
							'Prompts browser to download the linked file.',
							'goblocks'
						) }
						checked={ download }
						onChange={ ( value ) =>
							setAttributes( { download: value } )
						}
					/>
				</PanelBody>
			) }

			{ /* ── Button settings — <button> element only ────────── */ }
			{ ! isLink && (
				<PanelBody title={ __( 'Button', 'goblocks' ) } initialOpen>
					<SelectControl
						label={ __( 'Button type', 'goblocks' ) }
						value={ buttonType }
						options={ BUTTON_TYPE_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { buttonType: value } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			) }

			{ /* ── Accessibility ────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Accessibility', 'goblocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'ARIA label', 'goblocks' ) }
					value={ ariaLabel }
					help={ __(
						"Overrides the button's accessible name for screen readers.",
						'goblocks'
					) }
					onChange={ ( value ) =>
						setAttributes( { ariaLabel: value } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── CSS classes ─────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'CSS Classes', 'goblocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					help={ __( 'Space-separated list of extra classes.', 'goblocks' ) }
					onChange={ ( value ) =>
						setAttributes( {
							globalClasses: value
								.split( /\s+/ )
								.filter( Boolean ),
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