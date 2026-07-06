import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { ColorControl } from '../../../components/controls/ColorControl';
import { ToggleGroupControl } from '../../../components/controls/ToggleGroupControl';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface SliderAttributes {
	effect: string;
	arrowStyle: string;
	arrowVisibility: string;
	autoplay: boolean;
	autoplayDelay: number;
	loop: boolean;
	pauseOnHover: boolean;
	showArrows: boolean;
	showDots: boolean;
	showCounter: boolean;
	showProgressBar: boolean;
	showPauseButton: boolean;
	slidesPerView: number;
	slideGap: number;
	transitionDuration: number;
	transitionEasing: string;
	arrowColor: string;
	arrowHoverColor: string;
	arrowBgColor: string;
	arrowBgHoverColor: string;
	arrowSize: number;
	arrowRadius: number;
	arrowPosition: string;
	dotColor: string;
	dotActiveColor: string;
	dotSize: number;
	dotStyle: string;
	dotPosition: string;
	styles: BlockStyles;
	globalClasses: string[];
}

interface SliderInspectorProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

// ── Effect Presets ────────────────────────────────────────────────────────

const EFFECT_PRESETS = [
	{
		value: 'slide',
		label: __( 'Slide', 'goblocks' ),
		icon: (
			<svg
				width="40"
				height="26"
				viewBox="0 0 40 26"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="0"
					y="4"
					width="16"
					height="18"
					rx="3"
					fill="currentColor"
					opacity="0.2"
				/>
				<rect
					x="12"
					y="1"
					width="16"
					height="24"
					rx="4"
					fill="currentColor"
					opacity="0.9"
				/>
				<rect
					x="24"
					y="4"
					width="16"
					height="18"
					rx="3"
					fill="currentColor"
					opacity="0.2"
				/>
				<path
					d="M29 13h3.5M31 11l1.5 2-1.5 2"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					opacity="0.8"
				/>
			</svg>
		),
	},
	{
		value: 'fade',
		label: __( 'Fade', 'goblocks' ),
		icon: (
			<svg
				width="40"
				height="26"
				viewBox="0 0 40 26"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="4"
					y="4"
					width="32"
					height="18"
					rx="4"
					fill="currentColor"
					opacity="0.2"
				/>
				<rect
					x="4"
					y="4"
					width="32"
					height="18"
					rx="4"
					fill="currentColor"
					opacity="0.45"
				/>
				<rect
					x="4"
					y="4"
					width="32"
					height="18"
					rx="4"
					fill="currentColor"
					opacity="0.9"
				/>
				<rect
					x="14"
					y="10"
					width="12"
					height="2"
					rx="1"
					fill="white"
					opacity="0.7"
				/>
				<rect
					x="17"
					y="14"
					width="6"
					height="1.5"
					rx="0.75"
					fill="white"
					opacity="0.5"
				/>
			</svg>
		),
	},
	{
		value: 'zoom',
		label: __( 'Zoom', 'goblocks' ),
		icon: (
			<svg
				width="40"
				height="26"
				viewBox="0 0 40 26"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="4"
					y="4"
					width="32"
					height="18"
					rx="4"
					fill="currentColor"
					opacity="0.9"
				/>
				<rect
					x="9"
					y="9"
					width="22"
					height="8"
					rx="2"
					fill="currentColor"
					opacity="0.15"
				/>
				<circle
					cx="20"
					cy="13"
					r="5"
					fill="none"
					stroke="white"
					strokeWidth="1.5"
					opacity="0.8"
				/>
				<path
					d="M23.5 16.5l2.5 2.5"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					opacity="0.7"
				/>
			</svg>
		),
	},
	{
		value: 'cards',
		label: __( 'Cards', 'goblocks' ),
		icon: (
			<svg
				width="40"
				height="26"
				viewBox="0 0 40 26"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="6"
					width="14"
					height="14"
					rx="3"
					fill="currentColor"
					opacity="0.22"
				/>
				<rect
					x="25"
					y="6"
					width="14"
					height="14"
					rx="3"
					fill="currentColor"
					opacity="0.22"
				/>
				<rect
					x="10"
					y="2"
					width="20"
					height="22"
					rx="4"
					fill="currentColor"
					opacity="0.9"
				/>
				<rect
					x="15"
					y="9"
					width="10"
					height="2"
					rx="1"
					fill="white"
					opacity="0.7"
				/>
				<rect
					x="17"
					y="13"
					width="6"
					height="1.5"
					rx="0.75"
					fill="white"
					opacity="0.5"
				/>
			</svg>
		),
	},
];

// ── Arrow Style Presets ───────────────────────────────────────────────────

const ARROW_PRESETS = [
	{
		value: 'circle',
		label: __( 'Circle', 'goblocks' ),
		attrs: {
			arrowBgColor: 'rgba(0,0,0,0.35)',
			arrowBgHoverColor: 'rgba(0,0,0,0.65)',
			arrowRadius: 50,
			arrowColor: '#ffffff',
			arrowHoverColor: '#ffffff',
		},
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 28 28"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="14"
					cy="14"
					r="13"
					fill="currentColor"
					opacity="0.4"
				/>
				<path
					d="M11 10l4 4-4 4"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		value: 'square',
		label: __( 'Square', 'goblocks' ),
		attrs: {
			arrowBgColor: 'rgba(0,0,0,0.35)',
			arrowBgHoverColor: 'rgba(0,0,0,0.65)',
			arrowRadius: 10,
			arrowColor: '#ffffff',
			arrowHoverColor: '#ffffff',
		},
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 28 28"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="1"
					width="26"
					height="26"
					rx="6"
					fill="currentColor"
					opacity="0.4"
				/>
				<path
					d="M11 10l4 4-4 4"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		value: 'minimal',
		label: __( 'Minimal', 'goblocks' ),
		attrs: {
			arrowBgColor: 'transparent',
			arrowBgHoverColor: 'transparent',
			arrowRadius: 0,
			arrowColor: '#ffffff',
			arrowHoverColor: '#ffffff',
		},
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 28 28"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M11 8l6 6-6 6"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		value: 'outlined',
		label: __( 'Outlined', 'goblocks' ),
		attrs: {
			arrowBgColor: 'transparent',
			arrowBgHoverColor: 'rgba(255,255,255,0.15)',
			arrowRadius: 50,
			arrowColor: '#ffffff',
			arrowHoverColor: '#ffffff',
		},
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 28 28"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="14"
					cy="14"
					r="12.5"
					stroke="currentColor"
					strokeWidth="1.5"
					fill="none"
					opacity="0.6"
				/>
				<path
					d="M11 10l4 4-4 4"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
];

// ── Easing options ────────────────────────────────────────────────────────

const EASING_OPTIONS = [
	{ label: __( 'Ease (default)', 'goblocks' ), value: 'ease' },
	{ label: __( 'Ease In', 'goblocks' ), value: 'ease-in' },
	{ label: __( 'Ease Out', 'goblocks' ), value: 'ease-out' },
	{ label: __( 'Ease In-Out', 'goblocks' ), value: 'ease-in-out' },
	{ label: __( 'Linear', 'goblocks' ), value: 'linear' },
	{
		label: __( 'Spring (bouncy)', 'goblocks' ),
		value: 'cubic-bezier(0.34,1.56,0.64,1)',
	},
	{
		label: __( 'Smooth (soft)', 'goblocks' ),
		value: 'cubic-bezier(0.25,0.46,0.45,0.94)',
	},
	{
		label: __( 'Sharp (snappy)', 'goblocks' ),
		value: 'cubic-bezier(0.4,0,0.2,1)',
	},
];

// ── Component ─────────────────────────────────────────────────────────────

export function SliderInspector( {
	attributes,
	setAttributes,
}: SliderInspectorProps ) {
	const {
		effect,
		arrowStyle,
		arrowVisibility,
		autoplay,
		autoplayDelay,
		loop,
		pauseOnHover,
		showArrows,
		showDots,
		showCounter,
		showProgressBar,
		showPauseButton,
		slidesPerView,
		slideGap,
		transitionDuration,
		transitionEasing,
		arrowColor,
		arrowHoverColor,
		arrowBgColor,
		arrowBgHoverColor,
		arrowSize,
		arrowRadius,
		arrowPosition,
		dotColor,
		dotActiveColor,
		dotSize,
		dotStyle,
		dotPosition,
		styles,
		globalClasses,
	} = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			{ /* ── Transition Effect ──────────────────────────────────── */ }
			<div className="gb-slider-effects">
				<p className="gb-slider-effects__label">
					{ __( 'Transition Effect', 'goblocks' ) }
				</p>
				<div className="gb-slider-effects__grid gb-slider-effects__grid--4">
					{ EFFECT_PRESETS.map( ( preset ) => (
						<button
							key={ preset.value }
							type="button"
							className={
								'gb-slider-effects__btn' +
								( effect === preset.value ? ' is-active' : '' )
							}
							onClick={ () =>
								setAttributes( { effect: preset.value } )
							}
							title={ preset.label }
						>
							{ preset.icon }
							<span>{ preset.label }</span>
						</button>
					) ) }
				</div>
			</div>

			{ /* ── Transition Timing ────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Transition Timing', 'goblocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Duration (ms)', 'goblocks' ) }
					value={ transitionDuration ?? 450 }
					onChange={ ( v ) =>
						setAttributes( { transitionDuration: v ?? 450 } )
					}
					min={ 100 }
					max={ 1500 }
					step={ 50 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Easing', 'goblocks' ) }
					value={ transitionEasing ?? 'ease' }
					options={ EASING_OPTIONS }
					onChange={ ( v ) =>
						setAttributes( { transitionEasing: v } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── Layout ───────────────────────────────────────────────── */ }
			{ ( effect === 'slide' || effect === 'cards' ) && (
				<PanelBody
					title={ __( 'Layout', 'goblocks' ) }
					initialOpen={ false }
				>
					{ effect === 'slide' && (
						<RangeControl
							label={ __( 'Slides Per View', 'goblocks' ) }
							value={ slidesPerView ?? 1 }
							onChange={ ( v ) =>
								setAttributes( { slidesPerView: v ?? 1 } )
							}
							min={ 1 }
							max={ 4 }
							step={ 1 }
							help={ __(
								'How many slides are visible at once.',
								'goblocks'
							) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					) }
					<RangeControl
						label={ __( 'Gap Between Slides (px)', 'goblocks' ) }
						value={ slideGap ?? 0 }
						onChange={ ( v ) =>
							setAttributes( { slideGap: v ?? 0 } )
						}
						min={ 0 }
						max={ 80 }
						step={ 4 }
						help={ __( 'Space between slide panels.', 'goblocks' ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			) }

			{ /* ── Arrows ──────────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Arrows', 'goblocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Show Arrows', 'goblocks' ) }
					checked={ showArrows }
					onChange={ ( v ) => setAttributes( { showArrows: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ showArrows && (
					<>
						<ToggleGroupControl
							label={ __( 'Visibility', 'goblocks' ) }
							value={ arrowVisibility ?? 'always' }
							onChange={ ( v ) =>
								setAttributes( { arrowVisibility: v } )
							}
							options={ [
								{
									value: 'always',
									label: __( 'Always', 'goblocks' ),
								},
								{
									value: 'hover',
									label: __( 'On Hover', 'goblocks' ),
								},
							] }
						/>

						<p
							className="gb-slider-effects__label"
							style={ { marginTop: 12, marginBottom: 8 } }
						>
							{ __( 'Quick Style', 'goblocks' ) }
						</p>
						<div className="gb-sl-arrow-presets">
							{ ARROW_PRESETS.map( ( preset ) => (
								<button
									key={ preset.value }
									type="button"
									title={ preset.label }
									className={
										'gb-sl-arrow-preset-btn' +
										( arrowStyle === preset.value
											? ' is-active'
											: '' )
									}
									onClick={ () =>
										setAttributes( {
											arrowStyle: preset.value,
											...preset.attrs,
										} )
									}
								>
									{ preset.icon }
									<span>{ preset.label }</span>
								</button>
							) ) }
						</div>

						<ColorControl
							label={ __( 'Icon Color', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ arrowColor ?? '#ffffff' }
							onChange={ ( v ) =>
								setAttributes( { arrowColor: v || '#ffffff' } )
							}
						/>
						<ColorControl
							label={ __( 'Icon Color (hover)', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ arrowHoverColor ?? '#ffffff' }
							onChange={ ( v ) =>
								setAttributes( {
									arrowHoverColor: v || '#ffffff',
								} )
							}
						/>
						<ColorControl
							label={ __( 'Background', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ arrowBgColor ?? 'rgba(0,0,0,0.35)' }
							onChange={ ( v ) =>
								setAttributes( {
									arrowBgColor: v || 'rgba(0,0,0,0.35)',
								} )
							}
						/>
						<ColorControl
							label={ __( 'Background (hover)', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ arrowBgHoverColor ?? 'rgba(0,0,0,0.65)' }
							onChange={ ( v ) =>
								setAttributes( {
									arrowBgHoverColor: v || 'rgba(0,0,0,0.65)',
								} )
							}
						/>
						<RangeControl
							label={ __( 'Button Size (px)', 'goblocks' ) }
							value={ arrowSize ?? 44 }
							onChange={ ( v ) =>
								setAttributes( { arrowSize: v ?? 44 } )
							}
							min={ 28 }
							max={ 72 }
							step={ 2 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<RangeControl
							label={ __( 'Border Radius (%)', 'goblocks' ) }
							value={ arrowRadius ?? 50 }
							onChange={ ( v ) =>
								setAttributes( { arrowRadius: v ?? 50 } )
							}
							min={ 0 }
							max={ 50 }
							step={ 1 }
							help={ __( '0 = sharp · 50 = circle', 'goblocks' ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<ToggleGroupControl
							label={ __( 'Position', 'goblocks' ) }
							value={ arrowPosition ?? 'inside' }
							onChange={ ( v ) =>
								setAttributes( { arrowPosition: v } )
							}
							options={ [
								{
									value: 'inside',
									label: __( 'Inside', 'goblocks' ),
								},
								{
									value: 'outside',
									label: __( 'Outside', 'goblocks' ),
								},
								{
									value: 'edge',
									label: __( 'Edge', 'goblocks' ),
								},
							] }
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Dots & Counter ──────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Dots & Counter', 'goblocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Show Dot Indicators', 'goblocks' ) }
					checked={ showDots }
					onChange={ ( v ) => setAttributes( { showDots: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ showDots && (
					<>
						<ToggleGroupControl
							label={ __( 'Dot Style', 'goblocks' ) }
							value={ dotStyle ?? 'pill' }
							onChange={ ( v ) =>
								setAttributes( { dotStyle: v } )
							}
							options={ [
								{
									value: 'pill',
									label: __( 'Pill', 'goblocks' ),
								},
								{
									value: 'circle',
									label: __( 'Circle', 'goblocks' ),
								},
								{
									value: 'square',
									label: __( 'Square', 'goblocks' ),
								},
								{
									value: 'line',
									label: __( 'Line', 'goblocks' ),
								},
							] }
						/>
						<ColorControl
							label={ __( 'Dot Color', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ dotColor ?? 'rgba(255,255,255,0.45)' }
							onChange={ ( v ) =>
								setAttributes( {
									dotColor: v || 'rgba(255,255,255,0.45)',
								} )
							}
						/>
						<ColorControl
							label={ __( 'Active Dot Color', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ dotActiveColor ?? '#ffffff' }
							onChange={ ( v ) =>
								setAttributes( {
									dotActiveColor: v || '#ffffff',
								} )
							}
						/>
						<RangeControl
							label={ __( 'Dot Size (px)', 'goblocks' ) }
							value={ dotSize ?? 8 }
							onChange={ ( v ) =>
								setAttributes( { dotSize: v ?? 8 } )
							}
							min={ 4 }
							max={ 20 }
							step={ 1 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<ToggleGroupControl
							label={ __( 'Dot Position', 'goblocks' ) }
							value={ dotPosition ?? 'inside-bottom' }
							onChange={ ( v ) =>
								setAttributes( { dotPosition: v } )
							}
							options={ [
								{
									value: 'inside-bottom',
									label: __( 'In ↓', 'goblocks' ),
								},
								{
									value: 'inside-top',
									label: __( 'In ↑', 'goblocks' ),
								},
								{
									value: 'outside-bottom',
									label: __( 'Out ↓', 'goblocks' ),
								},
								{
									value: 'outside-top',
									label: __( 'Out ↑', 'goblocks' ),
								},
							] }
						/>
					</>
				) }

				<ToggleControl
					label={ __( 'Show Slide Counter', 'goblocks' ) }
					checked={ showCounter ?? false }
					onChange={ ( v ) => setAttributes( { showCounter: v } ) }
					help={ __(
						'Displays "1 / 5" in the top-right corner.',
						'goblocks'
					) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ autoplay && (
					<ToggleControl
						label={ __( 'Show Progress Bar', 'goblocks' ) }
						checked={ showProgressBar ?? false }
						onChange={ ( v ) =>
							setAttributes( { showProgressBar: v } )
						}
						help={ __(
							'Thin bar that fills during each autoplay interval.',
							'goblocks'
						) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
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
			{ /* ── Playback ────────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Playback', 'goblocks' ) } initialOpen>
				<ToggleControl
					label={ __( 'Autoplay', 'goblocks' ) }
					checked={ autoplay }
					onChange={ ( v ) => setAttributes( { autoplay: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ autoplay && (
					<>
						<RangeControl
							label={ __( 'Delay (ms)', 'goblocks' ) }
							value={ autoplayDelay }
							onChange={ ( v ) =>
								setAttributes( { autoplayDelay: v ?? 3000 } )
							}
							min={ 1000 }
							max={ 10000 }
							step={ 500 }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={ __( 'Pause on Hover', 'goblocks' ) }
							checked={ pauseOnHover ?? true }
							onChange={ ( v ) =>
								setAttributes( { pauseOnHover: v } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={ __( 'Show pause button', 'goblocks' ) }
							help={ __(
								'Adds a visible pause/play button (required for WCAG 2.2.2 compliance).',
								'goblocks'
							) }
							checked={ showPauseButton ?? true }
							onChange={ ( v ) =>
								setAttributes( { showPauseButton: v } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
				<ToggleControl
					label={ __( 'Loop Slides', 'goblocks' ) }
					checked={ loop }
					onChange={ ( v ) => setAttributes( { loop: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── CSS Classes ─────────────────────────────────────────── */ }
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

	return (
		<InspectorControls>
			<InspectorTabs
				stylesContent={ stylesContent }
				advancedContent={ advancedContent }
			/>
		</InspectorControls>
	);
}
