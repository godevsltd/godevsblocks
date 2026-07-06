import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RadioControl,
	TextControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { ColorControl } from '../../../components/controls/ColorControl';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TabsBlockAttributes {
	uniqueId: string;
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	orientation: 'horizontal' | 'vertical';
	tabStyle: string;
	tabsFullWidth: boolean;
	defaultTab: number;
}

interface TabsInspectorProps {
	attributes: TabsBlockAttributes;
	setAttributes: ( attrs: Partial< TabsBlockAttributes > ) => void;
}

// ── Visual style picker ───────────────────────────────────────────────────────

interface StyleOption {
	value: string;
	label: string;
	preview: JSX.Element;
}

const STYLE_OPTIONS: StyleOption[] = [
	{
		value: 'pill',
		label: __( 'Pill', 'goblocks' ),
		preview: (
			<svg
				width="60"
				height="28"
				viewBox="0 0 60 28"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="4"
					width="22"
					height="20"
					rx="10"
					fill="#4f46e5"
				/>
				<rect
					x="27"
					y="4"
					width="16"
					height="20"
					rx="8"
					fill="#f3f4f6"
				/>
				<rect
					x="47"
					y="4"
					width="12"
					height="20"
					rx="6"
					fill="#f3f4f6"
				/>
			</svg>
		),
	},
	{
		value: 'underline',
		label: __( 'Underline', 'goblocks' ),
		preview: (
			<svg
				width="60"
				height="28"
				viewBox="0 0 60 28"
				fill="none"
				aria-hidden="true"
			>
				<text
					x="1"
					y="18"
					fontSize="11"
					fill="#4f46e5"
					fontWeight="700"
				>
					Tab 1
				</text>
				<text x="35" y="18" fontSize="11" fill="#9ca3af">
					Tab 2
				</text>
				<rect
					x="1"
					y="22"
					width="30"
					height="2.5"
					rx="1.25"
					fill="#4f46e5"
				/>
			</svg>
		),
	},
	{
		value: 'bordered',
		label: __( 'Bordered', 'goblocks' ),
		preview: (
			<svg
				width="60"
				height="28"
				viewBox="0 0 60 28"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="2"
					width="24"
					height="18"
					rx="4 4 0 0"
					fill="white"
					stroke="#d1d5db"
					strokeWidth="1.5"
				/>
				<rect
					x="28"
					y="5"
					width="20"
					height="15"
					rx="4 4 0 0"
					fill="#f9fafb"
					stroke="#e5e7eb"
					strokeWidth="1.5"
				/>
				<line
					x1="0"
					y1="20"
					x2="60"
					y2="20"
					stroke="#d1d5db"
					strokeWidth="1.5"
				/>
			</svg>
		),
	},
	{
		value: 'boxed',
		label: __( 'Boxed', 'goblocks' ),
		preview: (
			<svg
				width="60"
				height="28"
				viewBox="0 0 60 28"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="2"
					width="58"
					height="24"
					rx="8"
					fill="#f1f5f9"
				/>
				<rect x="4" y="5" width="22" height="18" rx="6" fill="white" />
				<rect
					x="29"
					y="5"
					width="14"
					height="18"
					rx="5"
					fill="transparent"
				/>
				<rect
					x="46"
					y="5"
					width="10"
					height="18"
					rx="5"
					fill="transparent"
				/>
			</svg>
		),
	},
];

function StylePicker( {
	value,
	onChange,
}: {
	value: string;
	onChange: ( v: string ) => void;
} ) {
	return (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(4,1fr)',
				gap: '6px',
				marginBottom: '12px',
			} }
		>
			{ STYLE_OPTIONS.map( ( opt ) => {
				const active = opt.value === value;
				return (
					<button
						key={ opt.value }
						type="button"
						title={ opt.label }
						onClick={ () => onChange( opt.value ) }
						style={ {
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '4px',
							padding: '8px 4px 5px',
							border: active
								? '2px solid #007cba'
								: '2px solid #ddd',
							borderRadius: '6px',
							background: active ? '#e8f4fb' : '#f9f9f9',
							cursor: 'pointer',
							color: '#1e1e1e',
						} }
					>
						{ opt.preview }
						<span style={ { fontSize: '10px', lineHeight: 1.2 } }>
							{ opt.label }
						</span>
					</button>
				);
			} ) }
		</div>
	);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TabsInspector( {
	attributes,
	setAttributes,
}: TabsInspectorProps ) {
	const {
		orientation,
		tabStyle,
		tabsFullWidth,
		defaultTab,
		globalClasses,
		styles,
	} = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const activeColor =
		responsive.getStyle( 'variables', '--gb-tabs-active-color' ) ??
		'#4f46e5';
	const activeText =
		responsive.getStyle( 'variables', '--gb-tabs-active-text' ) ??
		'#ffffff';
	const btnColor =
		responsive.getStyle( 'variables', '--gb-tabs-btn-color' ) ?? '#6b7280';

	const stylesContent = (
		<>
			{ /* ── Style variant ──────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Tab Style', 'goblocks' ) } initialOpen>
				<StylePicker
					value={ tabStyle ?? 'pill' }
					onChange={ ( v ) => setAttributes( { tabStyle: v } ) }
				/>
				<ToggleControl
					label={ __( 'Full-width tabs', 'goblocks' ) }
					help={ __(
						'Tabs stretch to fill the full bar width.',
						'goblocks'
					) }
					checked={ tabsFullWidth ?? false }
					onChange={ ( v ) => setAttributes( { tabsFullWidth: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── Colors ───────────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Colors', 'goblocks' ) }
				initialOpen={ false }
			>
				{ /* Live mini-preview */ }
				<div
					style={ {
						display: 'flex',
						gap: '6px',
						padding: '12px',
						background: '#f8fafc',
						borderRadius: '8px',
						marginBottom: '12px',
						flexWrap: 'wrap',
					} }
				>
					{ [ 'Tab 1', 'Tab 2', 'Tab 3' ].map( ( label, idx ) => {
						const isActive = idx === 0;
						return (
							<span
								key={ label }
								style={ {
									padding: '5px 14px',
									borderRadius: '100px',
									fontSize: '0.78rem',
									fontWeight: 600,
									border: `1.5px solid ${
										isActive ? activeColor : '#d1d5db'
									}`,
									background: isActive
										? activeColor
										: 'transparent',
									color: isActive ? activeText : btnColor,
								} }
							>
								{ label }
							</span>
						);
					} ) }
				</div>

				<ColorControl
					label={ __( 'Active tab background', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ activeColor }
					onChange={ ( val ) =>
						responsive.setStyle(
							'variables',
							'--gb-tabs-active-color',
							val
						)
					}
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Active tab text', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ activeText }
					onChange={ ( val ) =>
						responsive.setStyle(
							'variables',
							'--gb-tabs-active-text',
							val
						)
					}
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Inactive tab text', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ btnColor }
					onChange={ ( val ) =>
						responsive.setStyle(
							'variables',
							'--gb-tabs-btn-color',
							val
						)
					}
				/>
			</PanelBody>

			<TypographyPanel styles={ styles } responsive={ responsive } />
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			<PanelBody title={ __( 'Tabs Settings', 'goblocks' ) } initialOpen>
				<RadioControl
					label={ __( 'Orientation', 'goblocks' ) }
					selected={ orientation }
					options={ [
						{
							label: __( 'Horizontal', 'goblocks' ),
							value: 'horizontal',
						},
						{
							label: __( 'Vertical', 'goblocks' ),
							value: 'vertical',
						},
					] }
					onChange={ ( v ) =>
						setAttributes( {
							orientation: v as 'horizontal' | 'vertical',
						} )
					}
				/>
				<NumberControl
					label={ __( 'Default Active Tab', 'goblocks' ) }
					help={ __(
						'Which tab is open by default (1 = first tab).',
						'goblocks'
					) }
					value={ defaultTab + 1 }
					min={ 1 }
					onChange={ ( v ) => {
						const display = parseInt( String( v ?? 1 ), 10 ) || 1;
						setAttributes( {
							defaultTab: Math.max( 0, display - 1 ),
						} );
					} }
					// @ts-ignore
					__next40pxDefaultSize
				/>
			</PanelBody>

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
