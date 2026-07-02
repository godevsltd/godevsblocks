import { InspectorControls } from '@wordpress/block-editor';
import {
	FocalPointPicker,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface ImageAttributes {
	mediaId:         number;
	mediaAlt:        string;
	mediaUrl:        string;
	sizeSlug:        string;
	caption:         string;
	showCaption:     boolean;
	href:            string;
	target:          string;
	rel:             string;
	objectFit:       string;
	focalPointX:     number;
	focalPointY:     number;
	lightbox:        boolean;
	lightboxCaption: boolean;
	lightboxEffect:  string;
	hoverEffect:     string;
	styles:          BlockStyles;
	globalClasses:   string[];
}

interface ImageInspectorProps {
	attributes: ImageAttributes;
	setAttributes: ( attrs: Partial< ImageAttributes > ) => void;
}

// ── Object-fit icon SVGs ──────────────────────────────────────────────────

const OBJECT_FIT_ICONS: Record< string, JSX.Element > = {
	'': (
		<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
			<rect x="1" y="1" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
			<text x="10" y="10" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="700">—</text>
		</svg>
	),
	cover: (
		<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
			<rect x="0" y="0" width="20" height="16" rx="1.5" fill="currentColor" opacity="0.18" />
			<rect x="2" y="2" width="16" height="12" rx="1" fill="currentColor" />
		</svg>
	),
	contain: (
		<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
			<rect x="1" y="1" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
			<rect x="5" y="3" width="10" height="10" rx="1" fill="currentColor" />
		</svg>
	),
	fill: (
		<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
			<rect x="0" y="0" width="20" height="16" rx="1.5" fill="currentColor" />
			<line x1="4" y1="4" x2="16" y2="12" stroke="white" strokeWidth="1.5" opacity="0.6" />
			<line x1="16" y1="4" x2="4" y2="12" stroke="white" strokeWidth="1.5" opacity="0.6" />
		</svg>
	),
	'scale-down': (
		<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
			<rect x="1" y="1" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
			<rect x="6" y="4" width="8" height="8" rx="1" fill="currentColor" />
			<path d="M14 2 L18 2 L18 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
			<path d="M6 14 L2 14 L2 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
		</svg>
	),
};

const OBJECT_FIT_BTNS = [
	{ value: '',           label: 'None' },
	{ value: 'cover',      label: 'Cover' },
	{ value: 'contain',    label: 'Contain' },
	{ value: 'fill',       label: 'Fill' },
	{ value: 'scale-down', label: 'Scale' },
];

// ── Option lists ──────────────────────────────────────────────────────────

const SIZE_OPTIONS = [
	{ label: __( 'Thumbnail', 'goblocks' ), value: 'thumbnail' },
	{ label: __( 'Medium', 'goblocks' ), value: 'medium' },
	{ label: __( 'Large', 'goblocks' ), value: 'large' },
	{ label: __( 'Full size', 'goblocks' ), value: 'full' },
];

const TARGET_OPTIONS = [
	{ label: __( 'Same tab', 'goblocks' ), value: '_self' },
	{ label: __( 'New tab', 'goblocks' ), value: '_blank' },
];

const LIGHTBOX_EFFECT_OPTIONS = [
	{ label: __( 'Zoom', 'goblocks' ),  value: 'zoom' },
	{ label: __( 'Fade', 'goblocks' ),  value: 'fade' },
];

// ── Component ─────────────────────────────────────────────────────────────

export function ImageInspector( {
	attributes,
	setAttributes,
}: ImageInspectorProps ) {
	const {
		styles,
		mediaUrl,
		mediaAlt,
		sizeSlug,
		showCaption,
		href,
		target,
		rel,
		objectFit,
		focalPointX,
		focalPointY,
		lightbox,
		lightboxCaption,
		lightboxEffect,
		hoverEffect,
		globalClasses,
	} = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const hasFocal = !! objectFit && objectFit !== 'none' && objectFit !== 'fill';

	function onObjectFitChange( value: string ) {
		setAttributes( { objectFit: value } );
		if ( value && value !== 'none' ) {
			responsive.setStyle( 'variables', '--gb-img-obj-fit', value );
		} else {
			responsive.setStyle( 'variables', '--gb-img-obj-fit', '' );
		}
	}

	function onFocalPointChange( fp: { x: number; y: number } ) {
		setAttributes( { focalPointX: fp.x, focalPointY: fp.y } );
		responsive.setStyle(
			'variables',
			'--gb-img-obj-pos',
			`${ Math.round( fp.x * 100 ) }% ${ Math.round( fp.y * 100 ) }%`
		);
	}

	const stylesContent = (
		<>
			{ /* Image header: thumbnail + quick-action pills */ }
			{ mediaUrl && (
				<div className="gb-image-inspector-header">
					<img
						className="gb-image-inspector-header__thumb"
						src={ mediaUrl }
						alt={ mediaAlt || '' }
					/>
					<div className="gb-image-inspector-header__pills">
						<span className="gb-image-inspector-header__pill">
							{ mediaAlt ? '✓' : '○' } Alt
						</span>
						<span className="gb-image-inspector-header__pill">
							{ showCaption ? '✓' : '○' } Caption
						</span>
						<span className="gb-image-inspector-header__pill">
							{ href ? '✓' : '○' } Link
						</span>
					</div>
				</div>
			) }

			{ /* Focal point + object-fit */ }
			<PanelBody title={ __( 'Focal Point', 'goblocks' ) } initialOpen={ false }>
				{ /* Object-fit icon grid */ }
				<p style={ { margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#757575' } }>
					{ __( 'Object fit', 'goblocks' ) }
				</p>
				<div className="gb-object-fit-grid">
					{ OBJECT_FIT_BTNS.map( ( btn ) => (
						<button
							key={ btn.value }
							type="button"
							className={ [
								'gb-object-fit-grid__btn',
								objectFit === btn.value ? 'is-active' : '',
							].filter( Boolean ).join( ' ' ) }
							onClick={ () => onObjectFitChange( btn.value ) }
							title={ btn.label }
							aria-pressed={ objectFit === btn.value }
						>
							{ OBJECT_FIT_ICONS[ btn.value ] }
							<span>{ btn.label }</span>
						</button>
					) ) }
				</div>
				{ hasFocal && (
					<FocalPointPicker
						label={ __( 'Focal point', 'goblocks' ) }
						url={ mediaUrl }
						value={ { x: focalPointX, y: focalPointY } }
						onChange={ onFocalPointChange }
					/>
				) }
			</PanelBody>

			<SizingPanel styles={ styles } responsive={ responsive } />
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			{ /* Image settings */ }
			<PanelBody title={ __( 'Image Settings', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Alt text', 'goblocks' ) }
					value={ mediaAlt }
					help={ __(
						'Describes the image for screen readers and search engines.',
						'goblocks'
					) }
					onChange={ ( value ) =>
						setAttributes( { mediaAlt: value } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Image size', 'goblocks' ) }
					value={ sizeSlug }
					options={ SIZE_OPTIONS }
					onChange={ ( value ) =>
						setAttributes( { sizeSlug: value } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show caption', 'goblocks' ) }
					checked={ showCaption }
					onChange={ ( value ) =>
						setAttributes( { showCaption: value } )
					}
				/>
				<SelectControl
					label={ __( 'Hover effect', 'goblocks' ) }
					value={ hoverEffect ?? 'none' }
					options={ [
						{ label: __( 'None', 'goblocks' ),     value: 'none' },
						{ label: __( 'Zoom', 'goblocks' ),     value: 'zoom' },
						{ label: __( 'Grayscale', 'goblocks' ), value: 'grayscale' },
						{ label: __( 'Darken', 'goblocks' ),   value: 'darken' },
						{ label: __( 'Lift', 'goblocks' ),     value: 'lift' },
					] }
					onChange={ ( v ) => setAttributes( { hoverEffect: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* Lightbox */ }
			<PanelBody title={ __( 'Lightbox', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Enable lightbox', 'goblocks' ) }
					help={ __( 'Opens full-size image in an overlay on click.', 'goblocks' ) }
					checked={ lightbox }
					onChange={ ( v ) => setAttributes( { lightbox: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ lightbox && (
					<>
						<SelectControl
							label={ __( 'Open animation', 'goblocks' ) }
							value={ lightboxEffect }
							options={ LIGHTBOX_EFFECT_OPTIONS }
							onChange={ ( v ) => setAttributes( { lightboxEffect: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={ __( 'Show caption in lightbox', 'goblocks' ) }
							checked={ lightboxCaption }
							onChange={ ( v ) => setAttributes( { lightboxCaption: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			{ /* Link wrapping */ }
			<PanelBody title={ __( 'Link', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'URL', 'goblocks' ) }
					value={ href }
					type="url"
					help={ __( 'Wraps the image in a link.', 'goblocks' ) }
					onChange={ ( value ) => setAttributes( { href: value } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ href && (
					<>
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
					</>
				) }
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
