import { useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	RangeControl,
	SelectControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { ColorControl } from '../../components/controls/ColorControl';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface CounterBlockAttributes {
	uniqueId:     string;
	target:       number;
	startFrom:    number;
	prefix:       string;
	suffix:       string;
	label:        string;
	duration:     number;
	easing:       string;
	countDown:    boolean;
	separator:    string;
	decimals:     number;
	numberColor:  string;
	labelColor:   string;
	styles:       BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< CounterBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		target,
		startFrom,
		prefix,
		suffix,
		label,
		duration,
		easing,
		countDown,
		separator,
		decimals,
		numberColor,
		labelColor,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'counter',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< CounterBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const numColor  = numberColor || '#4f46e5';
	const lblColor  = labelColor  || '#9ca3af';

	const counterVars = {
		'--gb-counter-color': numColor,
		'--gb-counter-label': lblColor,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-counter',
		uniqueId && `gb-counter-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: counterVars,
	} );

	const previewValue = countDown ? ( startFrom || 0 ) : target;
	const displayNumber = decimals > 0
		? previewValue.toFixed( decimals )
		: String( previewValue );

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			{ /* ── Counter Appearance ──────────────────────────────────── */ }
			<PanelBody title={ __( 'Counter Appearance', 'goblocks' ) } initialOpen>

				{ /* Live preview */ }
				<div
					style={ {
						textAlign: 'center',
						padding: '16px 12px',
						background: '#f8fafc',
						borderRadius: '10px',
						marginBottom: '16px',
						border: '1px solid #f1f5f9',
					} }
				>
					<div
						style={ {
							fontSize: '2.5rem',
							fontWeight: 900,
							lineHeight: 1,
							letterSpacing: '-0.04em',
							color: numColor,
							transition: 'color 200ms',
						} }
					>
						{ prefix }{ displayNumber }{ suffix }
					</div>
					{ label && (
						<div
							style={ {
								marginTop: '6px',
								fontSize: '0.75rem',
								fontWeight: 700,
								letterSpacing: '0.08em',
								textTransform: 'uppercase',
								color: lblColor,
								transition: 'color 200ms',
							} }
						>
							{ label }
						</div>
					) }
				</div>

				<ColorControl
					label={ __( 'Number Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ numColor }
					onChange={ ( v ) => setAttributes( { numberColor: v || '#4f46e5' } ) }
				/>

				{ label && (
					<>
						<div style={ { height: '12px' } } />
						<ColorControl
							label={ __( 'Label Color', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ lblColor }
							onChange={ ( v ) => setAttributes( { labelColor: v || '#9ca3af' } ) }
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Standard style panels ──────────────────────────────────── */ }
			<TypographyPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel     styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel    styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	/* ── Inspector: Advanced tab ──────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'Counter Settings', 'goblocks' ) } initialOpen>
					<ToggleControl
					label={ __( 'Count down', 'goblocks' ) }
					help={ __( 'Count from start value down to target instead of up.', 'goblocks' ) }
					checked={ countDown }
					onChange={ ( v ) => setAttributes( { countDown: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<NumberControl
					label={ countDown ? __( 'Start value (counts down to target)', 'goblocks' ) : __( 'Start value', 'goblocks' ) }
					value={ startFrom ?? 0 }
					onChange={ ( v ) => setAttributes( { startFrom: parseFloat( String( v ?? 0 ) ) || 0 } ) }
					// @ts-ignore
					__next40pxDefaultSize
				/>
				<NumberControl
					label={ __( 'Target number', 'goblocks' ) }
					value={ target }
					onChange={ ( v ) => setAttributes( { target: parseFloat( String( v ?? 100 ) ) || 100 } ) }
					// @ts-ignore
					__next40pxDefaultSize
				/>
				<TextControl
					label={ __( 'Label', 'goblocks' ) }
					value={ label }
					placeholder={ __( 'e.g. Happy Customers', 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { label: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'Prefix', 'goblocks' ) }
					value={ prefix }
					placeholder="e.g. $"
					onChange={ ( v ) => setAttributes( { prefix: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'Suffix', 'goblocks' ) }
					value={ suffix }
					placeholder="e.g. +"
					onChange={ ( v ) => setAttributes( { suffix: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Decimal Places', 'goblocks' ) }
					value={ decimals }
					onChange={ ( v ) => setAttributes( { decimals: v ?? 0 } ) }
					min={ 0 }
					max={ 4 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Thousands Separator', 'goblocks' ) }
					value={ separator }
					options={ [
						{ label: __( 'None', 'goblocks' ),          value: '' },
						{ label: __( 'Comma (1,000)', 'goblocks' ),  value: ',' },
						{ label: __( 'Period (1.000)', 'goblocks' ), value: '.' },
						{ label: __( 'Space (1 000)', 'goblocks' ),  value: ' ' },
					] }
					onChange={ ( v ) => setAttributes( { separator: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Animation Duration (ms)', 'goblocks' ) }
					value={ duration }
					onChange={ ( v ) => setAttributes( { duration: v ?? 2000 } ) }
					min={ 500 }
					max={ 5000 }
					step={ 100 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Easing', 'goblocks' ) }
					value={ easing ?? 'ease-out' }
					options={ [
						{ label: __( 'Ease out (smooth decelerate)', 'goblocks' ), value: 'ease-out'    },
						{ label: __( 'Linear (constant speed)',       'goblocks' ), value: 'linear'      },
						{ label: __( 'Ease in-out (S-curve)',         'goblocks' ), value: 'ease-in-out' },
						{ label: __( 'Spring (elastic overshoot)',    'goblocks' ), value: 'spring'      },
					] }
					onChange={ ( v ) => setAttributes( { easing: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'CSS Classes', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					onChange={ ( v ) =>
						setAttributes( { globalClasses: v.split( /\s+/ ).filter( Boolean ) } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<span className="gb-counter__number">
					{ prefix }{ displayNumber }{ suffix }
				</span>
				{ label && (
					<span className="gb-counter__label">{ label }</span>
				) }
			</div>
		</>
	);
}