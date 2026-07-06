import { useEffect, Fragment } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
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

// ── Types ────────────────────────────────────────────────────────────────────

interface CountdownBlockAttributes {
	uniqueId: string;
	targetDate: string;
	timezone: string;
	countdownStyle: string;
	showSeparator: boolean;
	showDays: boolean;
	showHours: boolean;
	showMinutes: boolean;
	showSeconds: boolean;
	expiredText: string;
	expiredAction: string;
	expiredUrl: string;
	numberColor: string;
	labelColor: string;
	unitBg: string;
	unitBorder: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

// ── Timezone options ─────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
	{ label: __( '— Browser local time —', 'goblocks' ), value: '' },
	{ label: 'UTC', value: 'UTC' },
	// Americas
	{ label: 'US Eastern (New York)', value: 'America/New_York' },
	{ label: 'US Central (Chicago)', value: 'America/Chicago' },
	{ label: 'US Mountain (Denver)', value: 'America/Denver' },
	{ label: 'US Mountain — no DST (Phoenix)', value: 'America/Phoenix' },
	{ label: 'US Pacific (Los Angeles)', value: 'America/Los_Angeles' },
	{ label: 'US Alaska (Anchorage)', value: 'America/Anchorage' },
	{ label: 'US Hawaii (Honolulu)', value: 'Pacific/Honolulu' },
	{ label: 'Canada Eastern (Toronto)', value: 'America/Toronto' },
	{ label: 'Canada Pacific (Vancouver)', value: 'America/Vancouver' },
	{ label: 'Mexico (Mexico City)', value: 'America/Mexico_City' },
	{ label: 'Brazil (São Paulo)', value: 'America/Sao_Paulo' },
	{
		label: 'Argentina (Buenos Aires)',
		value: 'America/Argentina/Buenos_Aires',
	},
	{ label: 'Chile (Santiago)', value: 'America/Santiago' },
	{ label: 'Colombia (Bogotá)', value: 'America/Bogota' },
	// Europe
	{ label: 'UK (London)', value: 'Europe/London' },
	{ label: 'Central Europe (Paris)', value: 'Europe/Paris' },
	{ label: 'Central Europe (Berlin)', value: 'Europe/Berlin' },
	{ label: 'Central Europe (Rome)', value: 'Europe/Rome' },
	{ label: 'Central Europe (Madrid)', value: 'Europe/Madrid' },
	{ label: 'Central Europe (Amsterdam)', value: 'Europe/Amsterdam' },
	{ label: 'Eastern Europe (Helsinki)', value: 'Europe/Helsinki' },
	{ label: 'Eastern Europe (Bucharest)', value: 'Europe/Bucharest' },
	{ label: 'Moscow', value: 'Europe/Moscow' },
	// Africa
	{ label: 'Egypt (Cairo)', value: 'Africa/Cairo' },
	{ label: 'West Africa (Lagos)', value: 'Africa/Lagos' },
	{ label: 'East Africa (Nairobi)', value: 'Africa/Nairobi' },
	{ label: 'South Africa (Johannesburg)', value: 'Africa/Johannesburg' },
	// Asia
	{ label: 'Turkey (Istanbul)', value: 'Europe/Istanbul' },
	{ label: 'Israel (Jerusalem)', value: 'Asia/Jerusalem' },
	{ label: 'Saudi Arabia (Riyadh)', value: 'Asia/Riyadh' },
	{ label: 'UAE (Dubai)', value: 'Asia/Dubai' },
	{ label: 'Pakistan (Karachi)', value: 'Asia/Karachi' },
	{ label: 'India (Kolkata)', value: 'Asia/Kolkata' },
	{ label: 'Bangladesh (Dhaka)', value: 'Asia/Dhaka' },
	{ label: 'Thailand (Bangkok)', value: 'Asia/Bangkok' },
	{ label: 'Singapore', value: 'Asia/Singapore' },
	{ label: 'China (Shanghai)', value: 'Asia/Shanghai' },
	{ label: 'Japan (Tokyo)', value: 'Asia/Tokyo' },
	{ label: 'South Korea (Seoul)', value: 'Asia/Seoul' },
	{ label: 'Indonesia (Jakarta)', value: 'Asia/Jakarta' },
	{ label: 'Philippines (Manila)', value: 'Asia/Manila' },
	// Australia / Pacific
	{ label: 'Australia (Perth)', value: 'Australia/Perth' },
	{ label: 'Australia (Adelaide)', value: 'Australia/Adelaide' },
	{ label: 'Australia (Sydney)', value: 'Australia/Sydney' },
	{ label: 'Australia (Brisbane)', value: 'Australia/Brisbane' },
	{ label: 'New Zealand (Auckland)', value: 'Pacific/Auckland' },
];

// ── Style options ────────────────────────────────────────────────────────────

const STYLE_OPTIONS = [
	{
		value: 'card',
		label: __( 'Card', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="36"
				viewBox="0 0 56 36"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="4"
					width="24"
					height="28"
					rx="5"
					fill="white"
					stroke="#e2e8f0"
					strokeWidth="1.5"
				/>
				<text
					x="13"
					y="22"
					textAnchor="middle"
					fontSize="12"
					fontWeight="900"
					fill="#4f46e5"
				>
					00
				</text>
				<rect
					x="30"
					y="4"
					width="24"
					height="28"
					rx="5"
					fill="white"
					stroke="#e2e8f0"
					strokeWidth="1.5"
				/>
				<text
					x="42"
					y="22"
					textAnchor="middle"
					fontSize="12"
					fontWeight="900"
					fill="#4f46e5"
				>
					00
				</text>
			</svg>
		),
	},
	{
		value: 'flat',
		label: __( 'Flat', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="36"
				viewBox="0 0 56 36"
				fill="none"
				aria-hidden="true"
			>
				<text
					x="13"
					y="22"
					textAnchor="middle"
					fontSize="14"
					fontWeight="900"
					fill="#4f46e5"
				>
					00
				</text>
				<text
					x="13"
					y="32"
					textAnchor="middle"
					fontSize="6"
					fontWeight="700"
					fill="#9ca3af"
					letterSpacing="1"
				>
					DAYS
				</text>
				<text
					x="42"
					y="22"
					textAnchor="middle"
					fontSize="14"
					fontWeight="900"
					fill="#4f46e5"
				>
					00
				</text>
				<text
					x="42"
					y="32"
					textAnchor="middle"
					fontSize="6"
					fontWeight="700"
					fill="#9ca3af"
					letterSpacing="1"
				>
					HRS
				</text>
			</svg>
		),
	},
	{
		value: 'bold',
		label: __( 'Bold', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="36"
				viewBox="0 0 56 36"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="1"
					width="24"
					height="34"
					rx="5"
					fill="#4f46e5"
				/>
				<text
					x="13"
					y="22"
					textAnchor="middle"
					fontSize="13"
					fontWeight="900"
					fill="white"
				>
					00
				</text>
				<rect
					x="30"
					y="1"
					width="24"
					height="34"
					rx="5"
					fill="#4f46e5"
				/>
				<text
					x="42"
					y="22"
					textAnchor="middle"
					fontSize="13"
					fontWeight="900"
					fill="white"
				>
					00
				</text>
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
				gridTemplateColumns: 'repeat(3,1fr)',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

function CountdownUnit( {
	value,
	label,
	style,
}: {
	value: string;
	label: string;
	style: string;
} ) {
	void style; // used via CSS class on wrapper
	return (
		<div className="gb-countdown__unit">
			<span className="gb-countdown__number">{ value }</span>
			<span className="gb-countdown__label">{ label }</span>
		</div>
	);
}

// ── Edit component ───────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< CountdownBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		targetDate,
		timezone,
		countdownStyle,
		showSeparator,
		showDays,
		showHours,
		showMinutes,
		showSeconds,
		expiredText,
		expiredAction,
		expiredUrl,
		numberColor,
		labelColor,
		unitBg,
		unitBorder,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'countdown',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< CountdownBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const numColor = numberColor || '#4f46e5';
	const lblColor = labelColor || '#9ca3af';
	const bgColor = unitBg || '#ffffff';
	const bdColor = unitBorder || '#e2e8f0';
	const cdStyle = countdownStyle || 'card';

	const countdownVars = {
		'--gb-cd-color': numColor,
		'--gb-cd-label': lblColor,
		'--gb-cd-bg': bgColor,
		'--gb-cd-border': bdColor,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-countdown',
		uniqueId && `gb-countdown-${ uniqueId }`,
		`gb-countdown--style-${ cdStyle }`,
		showSeparator && 'gb-countdown--sep',
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: countdownVars,
	} );

	// Which timezone label to show in the editor header
	const tzLabel = timezone
		? TIMEZONE_OPTIONS.find( ( o ) => o.value === timezone )?.label ??
		  timezone
		: __( 'Browser local time', 'goblocks' );

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			{ /* ── Display Style ──────────────────────────────────────────── */ }
			<PanelBody title={ __( 'Display Style', 'goblocks' ) } initialOpen>
				<StylePicker
					value={ cdStyle }
					onChange={ ( v ) => setAttributes( { countdownStyle: v } ) }
				/>
				<ToggleControl
					label={ __( 'Show colon separators', 'goblocks' ) }
					checked={ showSeparator }
					onChange={ ( v ) => setAttributes( { showSeparator: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* ── Colors ───────────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Colors', 'goblocks' ) }
				initialOpen={ false }
			>
				{ /* Live unit preview */ }
				<div
					style={ {
						display: 'flex',
						justifyContent: 'center',
						gap: '8px',
						padding: '16px 12px',
						background: '#f8fafc',
						borderRadius: '10px',
						marginBottom: '16px',
						border: '1px solid #f1f5f9',
					} }
				>
					{ [ 'Days', 'Hours', 'Min', 'Sec' ].map( ( lbl ) => (
						<div
							key={ lbl }
							style={ {
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: '4px',
								minWidth: '48px',
								background:
									cdStyle === 'bold' ? numColor : bgColor,
								border:
									cdStyle === 'flat'
										? 'none'
										: `1px solid ${ bdColor }`,
								borderRadius: '8px',
								padding: '8px 6px 6px',
							} }
						>
							<span
								style={ {
									fontSize: '1.25rem',
									fontWeight: 900,
									lineHeight: 1,
									color:
										cdStyle === 'bold'
											? '#ffffff'
											: numColor,
									fontVariantNumeric: 'tabular-nums',
								} }
							>
								00
							</span>
							<span
								style={ {
									fontSize: '0.5rem',
									fontWeight: 700,
									textTransform: 'uppercase',
									letterSpacing: '0.08em',
									color:
										cdStyle === 'bold'
											? 'rgba(255,255,255,0.75)'
											: lblColor,
								} }
							>
								{ lbl }
							</span>
						</div>
					) ) }
				</div>

				<ColorControl
					label={ __( 'Number Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ numColor }
					onChange={ ( v ) =>
						setAttributes( { numberColor: v || '#4f46e5' } )
					}
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Label Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ lblColor }
					onChange={ ( v ) =>
						setAttributes( { labelColor: v || '#9ca3af' } )
					}
				/>
				{ cdStyle !== 'bold' && (
					<>
						<div style={ { height: '12px' } } />
						<ColorControl
							label={ __( 'Unit Background', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ bgColor }
							onChange={ ( v ) =>
								setAttributes( { unitBg: v || '#ffffff' } )
							}
						/>
						<div style={ { height: '12px' } } />
						<ColorControl
							label={ __( 'Unit Border Color', 'goblocks' ) }
							breakpoint={ responsive.activeBreakpoint }
							value={ bdColor }
							onChange={ ( v ) =>
								setAttributes( { unitBorder: v || '#e2e8f0' } )
							}
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Standard style panels ────────────────────────────────── */ }
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
				title={ __( 'Countdown Settings', 'goblocks' ) }
				initialOpen
			>
				<TextControl
					label={ __( 'Target Date & Time', 'goblocks' ) }
					type="datetime-local"
					value={ targetDate }
					onChange={ ( v ) => setAttributes( { targetDate: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<SelectControl
					label={ __( 'Timezone', 'goblocks' ) }
					help={ __(
						'The timezone that the target date/time is set in.',
						'goblocks'
					) }
					value={ timezone }
					options={ TIMEZONE_OPTIONS }
					onChange={ ( v ) => setAttributes( { timezone: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ timezone && (
					<p
						style={ {
							margin: '4px 0 12px',
							fontSize: '11px',
							color: '#757575',
						} }
					>
						{ `⏰ ${ tzLabel }` }
					</p>
				) }

				<ToggleControl
					label={ __( 'Show Days', 'goblocks' ) }
					checked={ showDays }
					onChange={ ( v ) => setAttributes( { showDays: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Hours', 'goblocks' ) }
					checked={ showHours }
					onChange={ ( v ) => setAttributes( { showHours: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Minutes', 'goblocks' ) }
					checked={ showMinutes }
					onChange={ ( v ) => setAttributes( { showMinutes: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Seconds', 'goblocks' ) }
					checked={ showSeconds }
					onChange={ ( v ) => setAttributes( { showSeconds: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'After Expiry', 'goblocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Action when expired', 'goblocks' ) }
					value={ expiredAction }
					options={ [
						{
							label: __( 'Show message', 'goblocks' ),
							value: 'message',
						},
						{
							label: __( 'Redirect to URL', 'goblocks' ),
							value: 'redirect',
						},
						{
							label: __( 'Hide countdown', 'goblocks' ),
							value: 'hide',
						},
					] }
					onChange={ ( v ) => setAttributes( { expiredAction: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ ( expiredAction === 'message' || ! expiredAction ) && (
					<TextControl
						label={ __( 'Expired Message', 'goblocks' ) }
						value={ expiredText }
						onChange={ ( v ) =>
							setAttributes( { expiredText: v } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
				{ expiredAction === 'redirect' && (
					<TextControl
						label={ __( 'Redirect URL', 'goblocks' ) }
						value={ expiredUrl }
						type="url"
						help={ __(
							'Visitors are redirected here when the countdown expires.',
							'goblocks'
						) }
						onChange={ ( v ) => setAttributes( { expiredUrl: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
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

	const units: {
		show: boolean;
		value: string;
		label: string;
		key: string;
	}[] = [
		{
			show: showDays,
			value: '00',
			label: __( 'Days', 'goblocks' ),
			key: 'days',
		},
		{
			show: showHours,
			value: '00',
			label: __( 'Hours', 'goblocks' ),
			key: 'hours',
		},
		{
			show: showMinutes,
			value: '00',
			label: __( 'Minutes', 'goblocks' ),
			key: 'minutes',
		},
		{
			show: showSeconds,
			value: '00',
			label: __( 'Seconds', 'goblocks' ),
			key: 'seconds',
		},
	].filter( ( u ) => u.show );

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ units.map( ( u, idx ) => (
					<Fragment key={ u.key }>
						<div
							className={ `gb-countdown__unit gb-countdown__${ u.key }` }
						>
							<CountdownUnit
								value={ u.value }
								label={ u.label }
								style={ cdStyle }
							/>
						</div>
						{ showSeparator && idx < units.length - 1 && (
							<span
								className="gb-countdown__sep"
								aria-hidden="true"
							>
								:
							</span>
						) }
					</Fragment>
				) ) }
			</div>
		</>
	);
}
