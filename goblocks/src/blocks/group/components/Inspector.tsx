/**
 * Group block — Inspector Controls.
 */

import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { FlexControl } from '../../../components/controls/FlexControl';
import { ToggleGroupControl } from '../../../components/controls/ToggleGroupControl';
import { UnitInput } from '../../../components/controls/UnitInput';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { deepMerge } from '../../../utils/deepMerge';
import { clsx } from '../../../utils/classNames';
import type { BlockAttributes } from '../../../types/block';
import type { BlockStyles } from '../../../types/styles';
import type { FlexValues } from '../../../components/controls/FlexControl';

// ── Types ─────────────────────────────────────────────────────────────────

interface GroupAttributes extends BlockAttributes {
	layout: string;
	columns: number;
	link: string;
	linkTarget: string;
	linkRel: string;
	ariaLabel: string;
	animationClass: string;
}

interface GroupInspectorProps {
	attributes: GroupAttributes;
	setAttributes: ( attrs: Partial< GroupAttributes > ) => void;
}

// ── Static options ────────────────────────────────────────────────────────

const TAG_OPTIONS = [
	{ label: 'div',     value: 'div' },
	{ label: 'section', value: 'section' },
	{ label: 'article', value: 'article' },
	{ label: 'aside',   value: 'aside' },
	{ label: 'header',  value: 'header' },
	{ label: 'footer',  value: 'footer' },
	{ label: 'nav',     value: 'nav' },
	{ label: 'main',    value: 'main' },
	{ label: 'figure',  value: 'figure' },
	{ label: 'ul',      value: 'ul' },
	{ label: 'ol',      value: 'ol' },
	{ label: 'a',       value: 'a' },
	{ label: 'form',    value: 'form' },
	{ label: 'span',    value: 'span' },
];

const ANIMATION_OPTIONS = [
	{ label: __( 'None',        'goblocks' ), value: '' },
	{ label: __( 'Fade in',     'goblocks' ), value: 'gb-anim-fade-in' },
	{ label: __( 'Slide up',    'goblocks' ), value: 'gb-anim-slide-up' },
	{ label: __( 'Slide left',  'goblocks' ), value: 'gb-anim-slide-left' },
	{ label: __( 'Slide right', 'goblocks' ), value: 'gb-anim-slide-right' },
	{ label: __( 'Zoom in',     'goblocks' ), value: 'gb-anim-zoom-in' },
];

const OVERFLOW_OPTIONS = [
	{ label: __( 'Visible', 'goblocks' ), value: 'visible' },
	{ label: __( 'Hidden',  'goblocks' ), value: 'hidden' },
	{ label: __( 'Auto',    'goblocks' ), value: 'auto' },
	{ label: __( 'Scroll',  'goblocks' ), value: 'scroll' },
];

const POSITION_OPTIONS = [
	{ label: __( 'Static',   'goblocks' ), value: 'static' },
	{ label: __( 'Relative', 'goblocks' ), value: 'relative' },
	{ label: __( 'Absolute', 'goblocks' ), value: 'absolute' },
	{ label: __( 'Fixed',    'goblocks' ), value: 'fixed' },
	{ label: __( 'Sticky',   'goblocks' ), value: 'sticky' },
];

// ── Quick Presets ─────────────────────────────────────────────────────────

interface Preset {
	label: string;
	icon: JSX.Element;
	layout: string;
	styles: Record< string, any >;
}

const QUICK_PRESETS: Preset[] = [
	{
		label: '2 Col',
		layout: 'row',
		styles: {
			layout: {
				display:             { base: 'flex' },
				flexDirection:       { base: 'row' },
				flexWrap:            { base: 'wrap' },
				alignItems:          { base: 'flex-start' },
				gridTemplateColumns: { base: '' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0" y="0" width="7" height="14" rx="1.5" fill="currentColor" />
				<rect x="11" y="0" width="7" height="14" rx="1.5" fill="currentColor" />
			</svg>
		),
	},
	{
		label: '3 Col',
		layout: 'row',
		styles: {
			layout: {
				display:             { base: 'flex' },
				flexDirection:       { base: 'row' },
				flexWrap:            { base: 'wrap' },
				alignItems:          { base: 'flex-start' },
				gridTemplateColumns: { base: '' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0"  y="0" width="4" height="14" rx="1" fill="currentColor" />
				<rect x="7"  y="0" width="4" height="14" rx="1" fill="currentColor" />
				<rect x="14" y="0" width="4" height="14" rx="1" fill="currentColor" />
			</svg>
		),
	},
	{
		label: '4 Col',
		layout: 'grid',
		styles: {
			layout: {
				display:             { base: 'grid' },
				gridTemplateColumns: { base: 'repeat(4, 1fr)' },
				flexDirection:       { base: '' },
				flexWrap:            { base: '' },
				alignItems:          { base: '' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0"  y="0" width="3" height="14" rx="1" fill="currentColor" />
				<rect x="5"  y="0" width="3" height="14" rx="1" fill="currentColor" />
				<rect x="10" y="0" width="3" height="14" rx="1" fill="currentColor" />
				<rect x="15" y="0" width="3" height="14" rx="1" fill="currentColor" />
			</svg>
		),
	},
	{
		label: 'Hero',
		layout: 'stack',
		styles: {
			layout: {
				display:             { base: 'flex' },
				flexDirection:       { base: 'column' },
				alignItems:          { base: 'center' },
				justifyContent:      { base: 'center' },
				gridTemplateColumns: { base: '' },
				flexWrap:            { base: '' },
			},
			sizing: {
				minHeight: { base: '400px' },
			},
			spacing: {
				paddingTop:    { base: '48px' },
				paddingBottom: { base: '48px' },
				paddingLeft:   { base: '24px' },
				paddingRight:  { base: '24px' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0" y="0" width="18" height="5" rx="1" fill="currentColor" opacity="0.5" />
				<rect x="4" y="7" width="10" height="3" rx="1" fill="currentColor" />
				<rect x="6" y="11" width="6" height="2" rx="1" fill="currentColor" opacity="0.5" />
			</svg>
		),
	},
	{
		label: 'Card',
		layout: 'stack',
		styles: {
			layout: {
				display:             { base: 'flex' },
				flexDirection:       { base: 'column' },
				flexWrap:            { base: '' },
				alignItems:          { base: '' },
				gridTemplateColumns: { base: '' },
			},
			border: {
				borderRadius: { base: '12px' },
			},
			spacing: {
				paddingTop:    { base: '24px' },
				paddingBottom: { base: '24px' },
				paddingLeft:   { base: '24px' },
				paddingRight:  { base: '24px' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0" y="0" width="18" height="14" rx="3" fill="currentColor" opacity="0.15" />
				<rect x="2" y="2" width="14" height="4" rx="1" fill="currentColor" />
				<rect x="2" y="8" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
				<rect x="2" y="11" width="6" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
			</svg>
		),
	},
	{
		label: 'Full',
		layout: 'default',
		styles: {
			layout: {
				display:             { base: 'block' },
				flexDirection:       { base: '' },
				flexWrap:            { base: '' },
				alignItems:          { base: '' },
				gridTemplateColumns: { base: '' },
			},
			sizing: {
				width: { base: '100vw' },
			},
		},
		icon: (
			<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
				<rect x="0" y="3" width="18" height="8" rx="1" fill="currentColor" />
			</svg>
		),
	},
];

// ── Layout selector icons (SVG) ───────────────────────────────────────────

const LAYOUT_OPTIONS = [
	{
		value: 'default',
		label: __( 'Block', 'goblocks' ),
		icon: (
			<svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
				<rect x="2" y="8" width="32" height="12" rx="2" fill="currentColor" />
			</svg>
		),
	},
	{
		value: 'row',
		label: __( 'Row', 'goblocks' ),
		icon: (
			<svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
				<rect x="2"  y="2" width="14" height="24" rx="2" fill="currentColor" />
				<rect x="20" y="2" width="14" height="24" rx="2" fill="currentColor" />
			</svg>
		),
	},
	{
		value: 'stack',
		label: __( 'Stack', 'goblocks' ),
		icon: (
			<svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
				<rect x="2" y="2"  width="32" height="6" rx="2" fill="currentColor" />
				<rect x="2" y="11" width="32" height="6" rx="2" fill="currentColor" />
				<rect x="2" y="20" width="32" height="6" rx="2" fill="currentColor" />
			</svg>
		),
	},
	{
		value: 'grid',
		label: __( 'Grid', 'goblocks' ),
		icon: (
			<svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
				<rect x="2"  y="2"  width="14" height="11" rx="2" fill="currentColor" />
				<rect x="20" y="2"  width="14" height="11" rx="2" fill="currentColor" />
				<rect x="2"  y="15" width="14" height="11" rx="2" fill="currentColor" />
				<rect x="20" y="15" width="14" height="11" rx="2" fill="currentColor" />
			</svg>
		),
	},
];

// ── Component ─────────────────────────────────────────────────────────────

export function GroupInspector( {
	attributes,
	setAttributes,
}: GroupInspectorProps ) {
	const {
		styles,
		tagName,
		layout   = 'default',
		columns  = 3,
		link,
		linkTarget,
		linkRel,
		ariaLabel,
		animationClass,
		globalClasses,
	} = attributes;

	const responsive = useResponsiveStyles(
		styles as BlockStyles,
		( patch ) => setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const { getStyle, getInheritedValue, setStyle } = responsive;

	const isLink   = 'a' === tagName;
	const isFlex   = layout === 'row' || layout === 'stack';
	const isGrid   = layout === 'grid';
	const position = getStyle( 'position', 'position' );
	const isNotStatic = position && position !== 'static';

	// ── Flex values ───────────────────────────────────────────────────────

	const flexValues: FlexValues = {
		flexDirection:  getStyle( 'layout', 'flexDirection' ),
		flexWrap:       getStyle( 'layout', 'flexWrap' ),
		justifyContent: getStyle( 'layout', 'justifyContent' ),
		alignItems:     getStyle( 'layout', 'alignItems' ),
		alignContent:   getStyle( 'layout', 'alignContent' ),
		gap:            getStyle( 'spacing', 'gap' ),
	};

	function handleFlexChange( property: keyof FlexValues, value: string ) {
		if ( 'gap' === property ) {
			setStyle( 'spacing', 'gap', value );
		} else {
			setStyle( 'layout', property, value );
		}
	}

	// ── Layout type change ────────────────────────────────────────────────

	function handleLayoutChange( newLayout: string ) {
		const bp = responsive.activeBreakpoint;

		const layoutProps: Record< string, string > = {
			display:             '',
			flexDirection:       '',
			flexWrap:            '',
			alignItems:          '',
			gridTemplateColumns: '',
		};

		if ( newLayout === 'row' ) {
			layoutProps.display       = 'flex';
			layoutProps.flexDirection = 'row';
			layoutProps.flexWrap      = 'wrap';
			layoutProps.alignItems    = 'flex-start';
		} else if ( newLayout === 'stack' ) {
			layoutProps.display       = 'flex';
			layoutProps.flexDirection = 'column';
		} else if ( newLayout === 'grid' ) {
			layoutProps.display             = 'grid';
			layoutProps.gridTemplateColumns = `repeat(${ columns }, 1fr)`;
		}

		setAttributes( {
			layout:  newLayout,
			styles:  deepMerge( styles as any, {
				layout: Object.fromEntries(
					Object.entries( layoutProps ).map( ( [ prop, val ] ) => [
						prop,
						{ [ bp ]: val },
					] )
				),
			} ) as BlockStyles,
		} );
	}

	function handleColumnsChange( n: number ) {
		const bp = responsive.activeBreakpoint;
		setAttributes( {
			columns: n,
			styles:  deepMerge( styles as any, {
				layout: {
					gridTemplateColumns: { [ bp ]: `repeat(${ n }, 1fr)` },
				},
			} ) as BlockStyles,
		} );
	}

	// ── Apply a quick preset ─────────────────────────────────────────────────

	function applyPreset( preset: Preset ) {
		setAttributes( {
			layout: preset.layout,
			styles: deepMerge( styles as any, preset.styles ) as BlockStyles,
		} );
	}

	const stylesContent = (
		<>
			{ /* Quick Presets strip */ }
			<div className="gb-presets-strip">
				{ QUICK_PRESETS.map( ( preset ) => (
					<button
						key={ preset.label }
						type="button"
						className={ clsx(
							'gb-presets-strip__btn',
							layout === preset.layout && 'is-active'
						) }
						onClick={ () => applyPreset( preset ) }
						title={ preset.label }
					>
						{ preset.icon }
						<span>{ preset.label }</span>
					</button>
				) ) }
			</div>

			{ /* Layout type + sub-controls */ }
			<PanelBody title={ __( 'Layout', 'goblocks' ) } initialOpen>
				<div className="gb-layout-selector">
					{ LAYOUT_OPTIONS.map( ( opt ) => (
						<button
							key={ opt.value }
							type="button"
							className={ clsx(
								'gb-layout-selector__option',
								layout === opt.value && 'is-active'
							) }
							onClick={ () => handleLayoutChange( opt.value ) }
							aria-pressed={ layout === opt.value }
						>
							{ opt.icon }
							<span>{ opt.label }</span>
						</button>
					) ) }
				</div>

				{ isFlex && (
					<FlexControl
						values={ flexValues }
						onChange={ handleFlexChange }
					/>
				) }

				{ isGrid && (
					<RangeControl
						label={ __( 'Columns', 'goblocks' ) }
						value={ columns }
						onChange={ ( v ) => handleColumnsChange( v ?? 3 ) }
						min={ 1 }
						max={ 6 }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
			</PanelBody>

			<SizingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel   styles={ styles as BlockStyles } responsive={ responsive } />
			<TypographyPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel   styles={ styles as BlockStyles } responsive={ responsive } />
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
					help={ __( "Overrides the element's accessible name.", 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { ariaLabel: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* Link settings — only when tagName = a */ }
			{ isLink && (
				<PanelBody title={ __( 'Link', 'goblocks' ) } initialOpen>
					<TextControl
						label={ __( 'URL', 'goblocks' ) }
						value={ link }
						type="url"
						onChange={ ( v ) => setAttributes( { link: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Target', 'goblocks' ) }
						value={ linkTarget }
						options={ [
							{ label: __( 'Same tab', 'goblocks' ), value: '_self' },
							{ label: __( 'New tab',  'goblocks' ), value: '_blank' },
						] }
						onChange={ ( v ) => setAttributes( { linkTarget: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ __( 'Rel attribute', 'goblocks' ) }
						value={ linkRel }
						help={ __( 'noopener noreferrer added automatically for _blank.', 'goblocks' ) }
						onChange={ ( v ) => setAttributes( { linkRel: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			) }

			{ /* Position & Overflow */ }
			<PanelBody title={ __( 'Position & Overflow', 'goblocks' ) } initialOpen={ false }>
				<ToggleGroupControl
					label={ __( 'Overflow', 'goblocks' ) }
					value={ getStyle( 'layout', 'overflow' ) }
					options={ OVERFLOW_OPTIONS }
					onChange={ ( v ) => setStyle( 'layout', 'overflow', v ) }
					deselectable
				/>
				<ToggleGroupControl
					label={ __( 'Position', 'goblocks' ) }
					value={ position }
					options={ POSITION_OPTIONS }
					onChange={ ( v ) => setStyle( 'position', 'position', v ) }
					deselectable
				/>
				{ isNotStatic && (
					<div className="gb-layout-panel__offsets">
						{ ( [ 'top', 'right', 'bottom', 'left' ] as const ).map( ( side ) => (
							<UnitInput
								key={ side }
								label={ side.charAt( 0 ).toUpperCase() + side.slice( 1 ) }
								value={ getStyle( 'position', side ) }
								inheritedValue={ getInheritedValue( 'position', side ) }
								onChange={ ( v ) => setStyle( 'position', side, v ) }
								defaultUnit="px"
								units={ [ 'px', 'rem', 'em', '%', 'vw', 'vh', 'auto' ] }
								breakpoint="base"
							/>
						) ) }
					</div>
				) }
				<UnitInput
					label={ __( 'Z-index', 'goblocks' ) }
					value={ getStyle( 'position', 'zIndex' ) }
					inheritedValue={ getInheritedValue( 'position', 'zIndex' ) }
					onChange={ ( v ) => setStyle( 'position', 'zIndex', v ) }
					defaultUnit=""
					units={ [ '' as any, 'auto' ] }
					breakpoint="base"
				/>
			</PanelBody>

			{ /* Entrance animation */ }
			<PanelBody title={ __( 'Animation', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Entrance animation', 'goblocks' ) }
					value={ animationClass }
					options={ ANIMATION_OPTIONS }
					onChange={ ( v ) => setAttributes( { animationClass: v } ) }
					help={ __( 'Plays when the block scrolls into the viewport.', 'goblocks' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* CSS classes */ }
			<PanelBody title={ __( 'CSS Classes', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					help={ __( 'Space-separated list of extra classes.', 'goblocks' ) }
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