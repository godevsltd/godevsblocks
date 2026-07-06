import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	Button,
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
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface VideoBlockAttributes {
	uniqueId: string;
	url: string;
	mediaId: number;
	autoplay: boolean;
	muted: boolean;
	loop: boolean;
	controls: boolean;
	playsinline: boolean;
	poster: string;
	ratio: string;
	lazyLoad: boolean;
	youtubeRel: boolean;
	youtubeModestBranding: boolean;
	youtubeStart: number;
	vimeoHideBranding: boolean;
	caption: string;
	videoTitle: string;
	preload: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

function getEmbedUrl( url: string ): string {
	if ( /youtube\.com|youtu\.be/.test( url ) ) {
		const match = url.match(
			/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([a-zA-Z0-9_-]{11})/
		);
		if ( match ) {
			return `https://www.youtube.com/embed/${ match[ 1 ] }`;
		}
	}
	if ( /vimeo\.com/.test( url ) ) {
		const match = url.match( /vimeo\.com\/(?:[^/]+\/)*(\d+)/ );
		if ( match?.[ 1 ] ) {
			return `https://player.vimeo.com/video/${ match[ 1 ] }`;
		}
	}
	return '';
}

function getYouTubeId( url: string ): string {
	const match = url.match(
		/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([a-zA-Z0-9_-]{11})/
	);
	return match?.[ 1 ] ?? '';
}

function isSelfHostedUrl( url: string ): boolean {
	try {
		const path = new URL( url ).pathname;
		return /\.(mp4|webm|ogg|mov|m4v)$/i.test( path );
	} catch {
		return /\.(mp4|webm|ogg|mov|m4v)$/i.test( url );
	}
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< VideoBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		url,
		mediaId,
		autoplay,
		muted,
		loop,
		controls,
		playsinline,
		poster,
		ratio,
		lazyLoad,
		youtubeRel,
		youtubeModestBranding,
		youtubeStart,
		vimeoHideBranding,
		caption,
		videoTitle,
		preload,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'video',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< VideoBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const isYouTube = !! ( url && /youtube\.com|youtu\.be/.test( url ) );
	const isVimeo = !! ( url && /vimeo\.com/.test( url ) );
	const embedUrl = url ? getEmbedUrl( url ) : '';
	const isEmbed = !! embedUrl;
	const isSelfHosted = !! ( url && ! isEmbed && isSelfHostedUrl( url ) );

	const wrapperClass = clsx(
		'gb-video',
		uniqueId && `gb-video-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: { aspectRatio: ratio },
	} );

	function handleAutoplayChange( v: boolean ) {
		const patch: Partial< VideoBlockAttributes > = { autoplay: v };
		if ( v ) {
			patch.muted = true;
		}
		setAttributes( patch );
	}

	/* ── Style tab ─────────────────────────────────────────────────────────── */
	const stylesContent = (
		<>
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

	/* ── Advanced tab ──────────────────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'Video Source', 'goblocks' ) } initialOpen>
				{ /* ── Self-hosted: media library ── */ }
				<div style={ { marginBottom: '16px' } }>
					<p
						style={ {
							fontSize: '11px',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: '.04em',
							color: '#1e1e1e',
							marginBottom: '8px',
						} }
					>
						{ __( 'Self-hosted video', 'goblocks' ) }
					</p>
					{ mediaId > 0 && (
						<p
							style={ {
								fontSize: '12px',
								color: '#757575',
								fontStyle: 'italic',
								marginBottom: '8px',
							} }
						>
							{ __(
								'Video selected from media library.',
								'goblocks'
							) }
						</p>
					) }
					<MediaUpload
						onSelect={ ( media: { url: string; id: number } ) =>
							setAttributes( {
								url: media.url,
								mediaId: media.id,
							} )
						}
						allowedTypes={ [ 'video' ] }
						value={ mediaId }
						render={ ( { open }: { open: () => void } ) => (
							<div
								style={ {
									display: 'flex',
									gap: '8px',
									flexWrap: 'wrap',
								} }
							>
								<Button
									variant="secondary"
									isSmall
									onClick={ open }
								>
									{ mediaId
										? __( 'Replace video', 'goblocks' )
										: __(
												'Upload / select video',
												'goblocks'
										  ) }
								</Button>
								{ mediaId > 0 && (
									<Button
										variant="tertiary"
										isSmall
										isDestructive
										onClick={ () =>
											setAttributes( {
												url: '',
												mediaId: 0,
											} )
										}
									>
										{ __( 'Remove', 'goblocks' ) }
									</Button>
								) }
							</div>
						) }
					/>
				</div>

				{ /* ── External URL: YouTube / Vimeo / direct link ── */ }
				{ ! mediaId && (
					<>
						<div
							style={ {
								borderTop: '1px solid #e0e0e0',
								marginBottom: '12px',
							} }
						/>
						<TextControl
							label={ __(
								'Or paste URL (YouTube / Vimeo / direct link)',
								'goblocks'
							) }
							value={ url }
							onChange={ ( v ) => setAttributes( { url: v } ) }
							placeholder={ __(
								'https://youtube.com/… or https://vimeo.com/…',
								'goblocks'
							) }
							help={ __(
								'Paste a YouTube, Vimeo, or direct video file URL.',
								'goblocks'
							) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }

				<SelectControl
					label={ __( 'Aspect Ratio', 'goblocks' ) }
					value={ ratio }
					options={ [
						{ label: '16:9 (Widescreen)', value: '16/9' },
						{ label: '21:9 (Cinematic)', value: '21/9' },
						{ label: '4:3 (Classic)', value: '4/3' },
						{ label: '1:1 (Square)', value: '1/1' },
						{ label: '9:16 (Portrait)', value: '9/16' },
					] }
					onChange={ ( v ) => setAttributes( { ratio: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ isEmbed && (
					<>
						<div style={ { height: '8px' } } />
						<ToggleControl
							label={ __(
								'Lazy load (recommended)',
								'goblocks'
							) }
							help={
								isYouTube
									? __(
											'Shows a thumbnail with play button; loads the iframe only on click.',
											'goblocks'
									  )
									: __(
											'Lazy load applies to YouTube embeds only.',
											'goblocks'
									  )
							}
							checked={ lazyLoad }
							onChange={ ( v ) =>
								setAttributes( { lazyLoad: v } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
				<div style={ { height: '8px' } } />
				<TextControl
					label={ __( 'Video title (accessibility)', 'goblocks' ) }
					value={ videoTitle }
					placeholder={ __( 'Describe the video…', 'goblocks' ) }
					help={ __(
						'Used as the iframe title and visible caption. Leave blank for default.',
						'goblocks'
					) }
					onChange={ ( v ) => setAttributes( { videoTitle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '8px' } } />
				<TextControl
					label={ __( 'Caption', 'goblocks' ) }
					value={ caption }
					placeholder={ __(
						'Optional caption shown below the video…',
						'goblocks'
					) }
					onChange={ ( v ) => setAttributes( { caption: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ isYouTube && (
				<PanelBody
					title={ __( 'YouTube Settings', 'goblocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Hide related videos', 'goblocks' ) }
						help={ __(
							'Limits related videos after playback to the same channel (rel=0).',
							'goblocks'
						) }
						checked={ ! youtubeRel }
						onChange={ ( v ) =>
							setAttributes( { youtubeRel: ! v } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Modest branding', 'goblocks' ) }
						help={ __(
							'Minimises the YouTube logo in the player.',
							'goblocks'
						) }
						checked={ youtubeModestBranding }
						onChange={ ( v ) =>
							setAttributes( { youtubeModestBranding: v } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<div style={ { height: '8px' } } />
					<NumberControl
						label={ __( 'Start time (seconds)', 'goblocks' ) }
						value={ youtubeStart ?? 0 }
						min={ 0 }
						onChange={ ( v ) =>
							setAttributes( {
								youtubeStart:
									parseInt( String( v ?? 0 ), 10 ) || 0,
							} )
						}
						help={ __(
							'Video begins at this offset. Leave 0 to start from the beginning.',
							'goblocks'
						) }
						// @ts-ignore
						__next40pxDefaultSize
					/>
				</PanelBody>
			) }

			{ isVimeo && (
				<PanelBody
					title={ __( 'Vimeo Settings', 'goblocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Hide branding', 'goblocks' ) }
						help={ __(
							'Hides the Vimeo title, byline, and portrait from the player.',
							'goblocks'
						) }
						checked={ vimeoHideBranding }
						onChange={ ( v ) =>
							setAttributes( { vimeoHideBranding: v } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			) }

			<PanelBody
				title={ __( 'Playback Options', 'goblocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Autoplay', 'goblocks' ) }
					help={ __(
						'Automatically enables Muted (required by browsers).',
						'goblocks'
					) }
					checked={ autoplay }
					onChange={ handleAutoplayChange }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Muted', 'goblocks' ) }
					checked={ muted }
					onChange={ ( v ) => setAttributes( { muted: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Loop', 'goblocks' ) }
					checked={ loop }
					onChange={ ( v ) => setAttributes( { loop: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Controls', 'goblocks' ) }
					checked={ controls }
					onChange={ ( v ) => setAttributes( { controls: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Plays Inline', 'goblocks' ) }
					checked={ playsinline }
					onChange={ ( v ) => setAttributes( { playsinline: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ isSelfHosted && (
					<>
						<div style={ { height: '8px' } } />
						<SelectControl
							label={ __( 'Preload', 'goblocks' ) }
							value={ preload ?? 'metadata' }
							options={ [
								{
									label: __(
										'Metadata only (recommended)',
										'goblocks'
									),
									value: 'metadata',
								},
								{
									label: __(
										'None — load on play',
										'goblocks'
									),
									value: 'none',
								},
								{
									label: __(
										'Auto — preload entire video',
										'goblocks'
									),
									value: 'auto',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { preload: v } )
							}
							help={ __(
								'Controls how much data the browser fetches before the user plays.',
								'goblocks'
							) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
				<div className="gb-video-inspector__poster">
					<p className="gb-video-inspector__poster-label">
						{ __( 'Poster Image', 'goblocks' ) }
					</p>
					{ poster && (
						<img
							src={ poster }
							alt={ __( 'Poster preview', 'goblocks' ) }
							className="gb-video-inspector__poster-preview"
						/>
					) }
					<div className="gb-video-inspector__poster-actions">
						<MediaUpload
							onSelect={ ( media ) =>
								setAttributes( { poster: media.url } )
							}
							allowedTypes={ [ 'image' ] }
							value={ 0 }
							render={ ( { open } ) => (
								<Button
									variant="secondary"
									isSmall
									onClick={ open }
								>
									{ poster
										? __( 'Replace poster', 'goblocks' )
										: __( 'Select poster', 'goblocks' ) }
								</Button>
							) }
						/>
						{ poster && (
							<Button
								variant="tertiary"
								isSmall
								isDestructive
								onClick={ () =>
									setAttributes( { poster: '' } )
								}
							>
								{ __( 'Remove', 'goblocks' ) }
							</Button>
						) }
					</div>
				</div>
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

	/* ── Lazy thumbnail preview in editor ─────────────────────────────────── */
	const youTubeId = isYouTube ? getYouTubeId( url ) : '';
	const showLazyPreview = lazyLoad && !! youTubeId;

	const videoTitleText = videoTitle || __( 'Video embed', 'goblocks' );

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<figure style={ { margin: 0 } }>
				<div { ...blockProps }>
					{ showLazyPreview && (
						<div className="gb-video__facade gb-video__facade--editor">
							<img
								src={ `https://i.ytimg.com/vi/${ youTubeId }/hqdefault.jpg` }
								alt={ videoTitleText }
								style={ {
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									display: 'block',
								} }
							/>
							<span
								className="gb-video__play-btn"
								aria-hidden="true"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 68 48"
									width="68"
									height="48"
								>
									<path
										fill="#212121"
										fillOpacity=".8"
										d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
									/>
									<path fill="#fff" d="M 45,24 27,14 27,34" />
								</svg>
							</span>
						</div>
					) }
					{ ! showLazyPreview && isEmbed && (
						<iframe
							src={ embedUrl }
							allow="autoplay; encrypted-media; picture-in-picture"
							allowFullScreen
							style={ {
								width: '100%',
								height: '100%',
								border: 0,
							} }
							title={ videoTitleText }
						/>
					) }
					{ isSelfHosted && (
						<video
							src={ url }
							autoPlay={ autoplay }
							muted={ muted }
							loop={ loop }
							controls={ controls }
							playsInline={ playsinline }
							poster={ poster || undefined }
							style={ { width: '100%', height: '100%' } }
						/>
					) }
					{ ! url && (
						<div className="gb-video__placeholder">
							<span>
								{ __(
									'Enter a video URL in the Advanced panel.',
									'goblocks'
								) }
							</span>
						</div>
					) }
				</div>
				{ caption && (
					<figcaption className="gb-video__caption">
						{ caption }
					</figcaption>
				) }
			</figure>
		</>
	);
}
