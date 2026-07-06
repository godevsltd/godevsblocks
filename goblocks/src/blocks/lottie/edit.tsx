import { useEffect, useRef } from '@wordpress/element';
// @ts-ignore
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	Button,
	SelectControl,
	RangeControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SizingPanel } from '../../components/panels/SizingPanel';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

// Tell TypeScript about the lottie-player custom element.
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lottie-player': React.DetailedHTMLProps<
				React.HTMLAttributes< HTMLElement >,
				HTMLElement
			> & {
				src?: string;
				autoplay?: boolean | string;
				loop?: boolean | string;
				speed?: number | string;
				direction?: number | string;
				renderer?: string;
				mode?: string;
			};
		}
	}
}

const LOTTIE_CDN =
	'https://unpkg.com/@lottiefiles/lottie-player@2/dist/lottie-player.js';

function loadLottiePlayerScript(): void {
	if ( document.querySelector( `script[src="${ LOTTIE_CDN }"]` ) ) {
		return;
	}
	const s = document.createElement( 'script' );
	s.src = LOTTIE_CDN;
	s.type = 'module';
	document.head.appendChild( s );
}

interface LottieBlockAttributes {
	uniqueId: string;
	src: string;
	srcId: number;
	loop: boolean;
	speed: number;
	trigger: string;
	direction: number;
	renderer: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const TRIGGER_OPTIONS = [
	{ label: __( 'Auto play', 'goblocks' ), value: 'auto' },
	{ label: __( 'Play on hover', 'goblocks' ), value: 'hover' },
	{ label: __( 'Play on scroll into view', 'goblocks' ), value: 'scroll' },
	{ label: __( 'Play on click', 'goblocks' ), value: 'click' },
];

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< LottieBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		src,
		loop,
		speed,
		trigger,
		direction,
		renderer,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Load lottie-player web component in the editor for live preview.
	useEffect( () => {
		if ( src ) {
			loadLottiePlayerScript();
		}
	}, [ src ] );

	useCssEngine( {
		blockSlug: 'lottie',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< LottieBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-lottie',
		uniqueId && `gb-lottie-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	const stylesContent = (
		<>
			<SizingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SpacingPanel
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
			<PanelBody
				title={ __( 'Animation Source', 'goblocks' ) }
				initialOpen
			>
				<MediaUploadCheck>
					<MediaUpload
						title={ __( 'Select Lottie JSON', 'goblocks' ) }
						allowedTypes={ [ 'application/json' ] }
						value={ attributes.srcId }
						onSelect={ ( media: { id: number; url: string } ) => {
							setAttributes( {
								src: media.url,
								srcId: media.id,
							} );
						} }
						render={ ( { open }: { open: () => void } ) => (
							<div
								style={ {
									display: 'flex',
									flexDirection: 'column',
									gap: '8px',
								} }
							>
								<Button
									variant="secondary"
									onClick={ open }
									icon="upload"
								>
									{ attributes.srcId
										? __( 'Replace JSON file', 'goblocks' )
										: __(
												'Upload / Select JSON file',
												'goblocks'
										  ) }
								</Button>
								{ attributes.srcId && (
									<Button
										variant="link"
										isDestructive
										onClick={ () =>
											setAttributes( {
												src: '',
												srcId: 0,
											} )
										}
									>
										{ __( 'Remove file', 'goblocks' ) }
									</Button>
								) }
							</div>
						) }
					/>
				</MediaUploadCheck>

				<div style={ { marginTop: '12px' } }>
					<TextControl
						label={ __( 'Or enter URL (.json)', 'goblocks' ) }
						value={ src }
						onChange={ ( v ) =>
							setAttributes( { src: v, srcId: 0 } )
						}
						placeholder="https://example.com/animation.json"
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</div>
			</PanelBody>

			<PanelBody
				title={ __( 'Playback Settings', 'goblocks' ) }
				initialOpen
			>
				<SelectControl
					label={ __( 'Trigger', 'goblocks' ) }
					value={ trigger }
					options={ TRIGGER_OPTIONS }
					onChange={ ( v ) => setAttributes( { trigger: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '12px' } } />
				<ToggleControl
					label={ __( 'Loop', 'goblocks' ) }
					checked={ loop }
					onChange={ ( v ) => setAttributes( { loop: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Reverse direction', 'goblocks' ) }
					checked={ direction === -1 }
					onChange={ ( v ) =>
						setAttributes( { direction: v ? -1 : 1 } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Speed', 'goblocks' ) }
					value={ speed }
					onChange={ ( v ) => setAttributes( { speed: v ?? 1 } ) }
					min={ 0.1 }
					max={ 3 }
					step={ 0.1 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Renderer', 'goblocks' ) }
					value={ renderer }
					options={ [
						{
							label: __( 'SVG (best quality)', 'goblocks' ),
							value: 'svg',
						},
						{
							label: __(
								'Canvas (better performance)',
								'goblocks'
							),
							value: 'canvas',
						},
					] }
					onChange={ ( v ) => setAttributes( { renderer: v } ) }
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

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ src ? (
					/* Live preview — lottie-player web component loaded via CDN. */
					<lottie-player
						src={ src }
						{ ...( trigger === 'auto' ? { autoplay: true } : {} ) }
						{ ...( loop ? { loop: true } : {} ) }
						speed={ speed }
						direction={ direction }
						renderer={ renderer }
						style={ { width: '100%', height: '100%' } }
					/>
				) : (
					<div className="gb-lottie__empty">
						<svg
							width="48"
							height="48"
							viewBox="0 0 48 48"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="24"
								cy="24"
								r="22"
								stroke="#c5c5c5"
								strokeWidth="2"
							/>
							<path d="M18 16l14 8-14 8V16z" fill="#c5c5c5" />
						</svg>
						<p>
							{ __(
								'Upload a Lottie JSON file or enter a URL to preview.',
								'goblocks'
							) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
