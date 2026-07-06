import { useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	RangeControl,
	SelectControl,
	ToggleControl,
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

interface ProgressBarBlockAttributes {
	uniqueId: string;
	label: string;
	value: number;
	showLabel: boolean;
	showValue: boolean;
	fillColor: string;
	fillColor2: string;
	trackColor: string;
	barHeight: number;
	striped: boolean;
	easing: string;
	duration: number;
	labelPosition: string;
	styles: BlockStyles;
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
}: BlockEditProps< ProgressBarBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		label,
		value,
		showLabel,
		showValue,
		fillColor,
		fillColor2,
		trackColor,
		barHeight,
		striped,
		easing,
		duration,
		labelPosition,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'progress-bar',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< ProgressBarBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const fill1 = fillColor || '#4f46e5';
	const fill2 = fillColor2 || '#7c3aed';
	const track = trackColor || '#e5e7eb';
	const height = barHeight || 10;

	const barVars = {
		'--gb-bar-fill': fill1,
		'--gb-bar-fill2': fill2,
		'--gb-bar-track': track,
		'--gb-bar-height': `${ height }px`,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-progress',
		uniqueId && `gb-progress-${ uniqueId }`,
		striped && 'gb-progress--striped',
		labelPosition === 'inside' && 'gb-progress--label-inside',
		labelPosition === 'bottom' && 'gb-progress--label-bottom',
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: barVars,
	} );

	const headerContent = (
		<>
			{ showLabel && (
				<span className="gb-progress__label">{ label }</span>
			) }
			{ showValue && (
				<span className="gb-progress__value">{ value }%</span>
			) }
		</>
	);
	const hasHeader = showLabel || showValue;

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody title={ __( 'Bar Style', 'goblocks' ) } initialOpen>
				<RangeControl
					label={ __( 'Bar Height', 'goblocks' ) }
					value={ height }
					onChange={ ( v ) =>
						setAttributes( { barHeight: v ?? 10 } )
					}
					min={ 4 }
					max={ 32 }
					step={ 1 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<div style={ { height: '16px' } } />

				{ /* Live gradient preview */ }
				<div style={ { marginBottom: '12px' } }>
					<div
						style={ {
							height: `${ height }px`,
							borderRadius: '999px',
							background:
								fill1 === fill2
									? fill1
									: `linear-gradient(90deg, ${ fill1 } 0%, ${ fill2 } 100%)`,
							transition: 'background 200ms',
						} }
					/>
					<p
						className="components-base-control__help"
						style={ { marginTop: '6px', marginBottom: 0 } }
					>
						{ __( 'Fill preview', 'goblocks' ) }
					</p>
				</div>

				<ColorControl
					label={ __( 'Fill Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ fill1 }
					onChange={ ( v ) =>
						setAttributes( { fillColor: v || '#4f46e5' } )
					}
				/>

				<div style={ { height: '12px' } } />

				<ColorControl
					label={ __( 'Fill Color End (gradient)', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ fill2 }
					onChange={ ( v ) =>
						setAttributes( { fillColor2: v || '#7c3aed' } )
					}
					help={ __(
						'Set same as Fill Color for a solid bar.',
						'goblocks'
					) }
				/>

				<div style={ { height: '12px' } } />

				<ColorControl
					label={ __( 'Track Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ track }
					onChange={ ( v ) =>
						setAttributes( { trackColor: v || '#e5e7eb' } )
					}
				/>

				<div style={ { height: '12px' } } />

				<ToggleControl
					label={ __( 'Striped Fill', 'goblocks' ) }
					help={
						striped
							? __( 'Diagonal stripe overlay is on.', 'goblocks' )
							: __(
									'Enable for a striped fill style.',
									'goblocks'
							  )
					}
					checked={ striped }
					onChange={ ( v ) => setAttributes( { striped: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<div style={ { height: '16px' } } />

				<RangeControl
					label={ __( 'Animation Duration (ms)', 'goblocks' ) }
					value={ duration ?? 800 }
					onChange={ ( v ) =>
						setAttributes( { duration: v ?? 800 } )
					}
					min={ 200 }
					max={ 3000 }
					step={ 100 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<div style={ { height: '12px' } } />

				<SelectControl
					label={ __( 'Animation Easing', 'goblocks' ) }
					value={ easing ?? 'ease-out' }
					options={ [
						{
							label: __(
								'Ease out (smooth decelerate)',
								'goblocks'
							),
							value: 'ease-out',
						},
						{
							label: __( 'Linear (constant speed)', 'goblocks' ),
							value: 'linear',
						},
						{
							label: __( 'Ease in-out (S-curve)', 'goblocks' ),
							value: 'ease-in-out',
						},
						{
							label: __(
								'Spring (slight overshoot)',
								'goblocks'
							),
							value: 'spring',
						},
					] }
					onChange={ ( v ) => setAttributes( { easing: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── Standard style panels ──────────────────────────────────── */ }
			<TypographyPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SpacingPanel
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

	/* ── Inspector: Advanced tab ──────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody
				title={ __( 'Progress Bar Settings', 'goblocks' ) }
				initialOpen
			>
				<RangeControl
					label={ __( 'Value (%)', 'goblocks' ) }
					value={ value }
					onChange={ ( v ) => setAttributes( { value: v ?? 75 } ) }
					min={ 0 }
					max={ 100 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '12px' } } />
				<TextControl
					label={ __( 'Label', 'goblocks' ) }
					value={ label }
					onChange={ ( v ) => setAttributes( { label: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Label', 'goblocks' ) }
					checked={ showLabel }
					onChange={ ( v ) => setAttributes( { showLabel: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Percentage', 'goblocks' ) }
					checked={ showValue }
					onChange={ ( v ) => setAttributes( { showValue: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '12px' } } />
				<SelectControl
					label={ __( 'Label Position', 'goblocks' ) }
					value={ labelPosition ?? 'top' }
					options={ [
						{ label: __( 'Above bar', 'goblocks' ), value: 'top' },
						{
							label: __( 'Inside bar', 'goblocks' ),
							value: 'inside',
						},
						{
							label: __( 'Below bar', 'goblocks' ),
							value: 'bottom',
						},
					] }
					onChange={ ( v ) => setAttributes( { labelPosition: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'CSS Classes', 'goblocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
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

	/* ── Editor preview ───────────────────────────────────────────────────── */
	const trackEl = (
		<div
			className="gb-progress__track"
			role="progressbar"
			aria-valuenow={ value }
			aria-valuemin={ 0 }
			aria-valuemax={ 100 }
			aria-label={ label ? `${ label }: ${ value }%` : `${ value }%` }
		>
			{ labelPosition === 'inside' ? (
				<div
					className="gb-progress__fill"
					style={ { width: `${ value }%` } }
				>
					{ hasHeader && headerContent }
				</div>
			) : (
				<div
					className="gb-progress__fill"
					style={ { width: `${ value }%` } }
				/>
			) }
		</div>
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
				{ labelPosition !== 'bottom' &&
					labelPosition !== 'inside' &&
					hasHeader && (
						<div className="gb-progress__header">
							{ headerContent }
						</div>
					) }
				{ trackEl }
				{ labelPosition === 'bottom' && hasHeader && (
					<div className="gb-progress__header">{ headerContent }</div>
				) }
			</div>
		</>
	);
}
