import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
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
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AlertBlockAttributes {
	uniqueId: string;
	alertType: string;
	alertStyle: string;
	title: string;
	message: string;
	dismissible: boolean;
	dismissMode: string;
	dismissDays: number;
	icon: boolean;
	sticky: boolean;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

const ICON_SVGS: Record< string, JSX.Element > = {
	info: (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<circle cx="12" cy="16" r="1" fill="currentColor" />
		</svg>
	),
	success: (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="9,12 11,14 15,10" />
		</svg>
	),
	warning: (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<circle cx="12" cy="17" r="1" fill="currentColor" />
		</svg>
	),
	error: (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="15" y1="9" x2="9" y2="15" />
			<line x1="9" y1="9" x2="15" y2="15" />
		</svg>
	),
};

// ── Visual style picker ────────────────────────────────────────────────────────

const STYLE_OPTIONS = [
	{
		value: 'filled',
		label: __( 'Filled', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="30"
				viewBox="0 0 56 30"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="0"
					y="0"
					width="56"
					height="30"
					rx="5"
					fill="#eff6ff"
				/>
				<rect x="0" y="0" width="4" height="30" rx="2" fill="#1d4ed8" />
				<rect
					x="10"
					y="7"
					width="20"
					height="4"
					rx="2"
					fill="#1d4ed8"
				/>
				<rect
					x="10"
					y="15"
					width="32"
					height="3"
					rx="1.5"
					fill="#1d4ed8"
					opacity="0.5"
				/>
			</svg>
		),
	},
	{
		value: 'outline',
		label: __( 'Outline', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="30"
				viewBox="0 0 56 30"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="1"
					y="1"
					width="54"
					height="28"
					rx="5"
					stroke="#1d4ed8"
					strokeWidth="1.5"
				/>
				<rect x="9" y="7" width="20" height="4" rx="2" fill="#1d4ed8" />
				<rect
					x="9"
					y="15"
					width="32"
					height="3"
					rx="1.5"
					fill="#1d4ed8"
					opacity="0.5"
				/>
			</svg>
		),
	},
	{
		value: 'banner',
		label: __( 'Banner', 'goblocks' ),
		preview: (
			<svg
				width="56"
				height="30"
				viewBox="0 0 56 30"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="0"
					y="0"
					width="56"
					height="30"
					rx="5"
					fill="#eff6ff"
				/>
				<rect x="9" y="7" width="20" height="4" rx="2" fill="#1d4ed8" />
				<rect
					x="9"
					y="15"
					width="32"
					height="3"
					rx="1.5"
					fill="#1d4ed8"
					opacity="0.5"
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

// ── Edit component ─────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< AlertBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		alertType,
		alertStyle,
		title,
		message,
		dismissible,
		dismissMode,
		dismissDays,
		icon: showIcon,
		sticky,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'alert',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< AlertBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-alert',
		`gb-alert--${ alertType }`,
		`gb-alert--style-${ alertStyle ?? 'filled' }`,
		sticky && 'gb-alert--sticky',
		uniqueId && `gb-alert-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		role: 'alert',
	} );

	/* ── Inspector ─────────────────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody title={ __( 'Style', 'goblocks' ) } initialOpen>
				<StylePicker
					value={ alertStyle ?? 'filled' }
					onChange={ ( v ) => setAttributes( { alertStyle: v } ) }
				/>
			</PanelBody>
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

	const advancedContent = (
		<>
			<PanelBody title={ __( 'Alert Settings', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Alert Type', 'goblocks' ) }
					value={ alertType }
					options={ [
						{ label: __( 'Info', 'goblocks' ), value: 'info' },
						{
							label: __( 'Success', 'goblocks' ),
							value: 'success',
						},
						{
							label: __( 'Warning', 'goblocks' ),
							value: 'warning',
						},
						{ label: __( 'Error', 'goblocks' ), value: 'error' },
					] }
					onChange={ ( v ) => setAttributes( { alertType: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'Title', 'goblocks' ) }
					value={ title }
					onChange={ ( v ) => setAttributes( { title: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Icon', 'goblocks' ) }
					checked={ showIcon }
					onChange={ ( v ) => setAttributes( { icon: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Sticky top bar', 'goblocks' ) }
					help={ __(
						'Fix the alert to the top of the viewport (useful for site-wide notices).',
						'goblocks'
					) }
					checked={ sticky }
					onChange={ ( v ) => setAttributes( { sticky: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Dismiss', 'goblocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Dismissible', 'goblocks' ) }
					help={ __(
						'Show a close button on the alert.',
						'goblocks'
					) }
					checked={ dismissible }
					onChange={ ( v ) => setAttributes( { dismissible: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ dismissible && (
					<>
						<SelectControl
							label={ __( 'Remember dismissal', 'goblocks' ) }
							help={ __(
								'How long to remember that this alert was dismissed.',
								'goblocks'
							) }
							value={ dismissMode ?? 'none' }
							options={ [
								{
									label: __(
										'Never (show again on reload)',
										'goblocks'
									),
									value: 'none',
								},
								{
									label: __(
										'Until tab is closed (session)',
										'goblocks'
									),
									value: 'session',
								},
								{
									label: __(
										'Forever (localStorage)',
										'goblocks'
									),
									value: 'local',
								},
								{
									label: __(
										'For N days (cookie)',
										'goblocks'
									),
									value: 'cookie',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { dismissMode: v } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						{ dismissMode === 'cookie' && (
							<NumberControl
								label={ __( 'Days to remember', 'goblocks' ) }
								value={ dismissDays ?? 30 }
								min={ 1 }
								max={ 365 }
								onChange={ ( v ) =>
									setAttributes( {
										dismissDays: Math.max(
											1,
											parseInt( String( v ?? 30 ), 10 ) ||
												30
										),
									} )
								}
								// @ts-ignore
								__next40pxDefaultSize
							/>
						) }
					</>
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

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ showIcon && (
					<div className="gb-alert__icon" aria-hidden="true">
						{ ICON_SVGS[ alertType ] ?? ICON_SVGS.info }
					</div>
				) }
				<div className="gb-alert__body">
					{ title && (
						<strong className="gb-alert__title">{ title }</strong>
					) }
					<RichText
						tagName="p"
						className="gb-alert__message"
						value={ message }
						onChange={ ( v ) => setAttributes( { message: v } ) }
						placeholder={ __( 'Alert message…', 'goblocks' ) }
						allowedFormats={ [
							'core/bold',
							'core/italic',
							'core/link',
						] }
					/>
				</div>
				{ dismissible && (
					<button
						className="gb-alert__dismiss"
						aria-label={ __( 'Dismiss', 'goblocks' ) }
						onClick={ ( e ) => e.preventDefault() }
					>
						<svg
							viewBox="0 0 20 20"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							aria-hidden="true"
						>
							<line x1="3" y1="3" x2="17" y2="17" />
							<line x1="17" y1="3" x2="3" y2="17" />
						</svg>
					</button>
				) }
			</div>
		</>
	);
}
