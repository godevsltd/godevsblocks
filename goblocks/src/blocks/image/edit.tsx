import { useEffect } from '@wordpress/element';
import {
	MediaUpload,
	MediaPlaceholder,
	RichText,
	useBlockProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { ImageInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ────────────────────────────────────────────────────────

interface ImageBlockAttributes {
	uniqueId: string;
	mediaId: number;
	mediaUrl: string;
	mediaAlt: string;
	mediaWidth: number;
	mediaHeight: number;
	sizeSlug: string;
	caption: string;
	showCaption: boolean;
	href: string;
	target: string;
	rel: string;
	lightbox: boolean;
	lightboxCaption: boolean;
	lightboxEffect: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	objectFit?: string;
	focalPointX?: number;
	focalPointY?: number;
}

// ── Media object shape from MediaUpload / MediaPlaceholder ────────────────

interface WPMedia {
	id?: number;
	url?: string;
	alt?: string;
	width?: number;
	height?: number;
}

// ── Unique ID generator ───────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Edit component ────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< ImageBlockAttributes > ) {
	const {
		uniqueId,
		mediaId,
		mediaUrl,
		mediaAlt,
		mediaWidth,
		mediaHeight,
		caption,
		showCaption,
		lightbox,
		styles,
		globalClasses,
		generatedCss,
	} = attributes;

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection into editor <head>.
	useCssEngine( {
		blockSlug: 'image',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< ImageBlockAttributes > ),
	} );

	// Selector must match CssEngine: .gb-image-{uniqueId}
	const wrapperClass = clsx(
		'gb-image',
		uniqueId && `gb-image-${ uniqueId }`,
		attributes.objectFit && 'gb-image--has-focal',
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	// Blob URLs are transient upload previews — treat the block as empty until
	// a real media library URL (with mediaId) is confirmed.
	const hasMedia = !! (
		mediaId ||
		( mediaUrl && ! mediaUrl.startsWith( 'blob:' ) )
	);

	function onSelectMedia( media: WPMedia | WPMedia[] ) {
		// MediaPlaceholder can call onSelect with an array in some WP versions.
		const m = Array.isArray( media ) ? media[ 0 ] : media;
		if ( ! m?.url ) {
			return;
		}
		setAttributes( {
			mediaId: m.id ?? 0,
			mediaUrl: m.url,
			mediaAlt: m.alt ?? '',
			mediaWidth: m.width ?? 0,
			mediaHeight: m.height ?? 0,
		} );
	}

	function onSelectURL( url: string ) {
		if ( url.startsWith( 'blob:' ) ) {
			return;
		}
		setAttributes( { mediaUrl: url, mediaId: 0, mediaAlt: '' } );
	}

	return (
		<>
			{ /* Replace / link toolbar — only when an image is selected */ }
			{ hasMedia && (
				<BlockControls group="other">
					<ToolbarGroup>
						<MediaUpload
							onSelect={ onSelectMedia }
							allowedTypes={ [ 'image' ] }
							value={ mediaId }
							render={ ( { open } ) => (
								<ToolbarButton
									icon="edit"
									label={ __( 'Replace image', 'goblocks' ) }
									onClick={ open }
								/>
							) }
						/>
						{ mediaId ? (
							<ToolbarButton
								icon="trash"
								label={ __( 'Remove image', 'goblocks' ) }
								onClick={ () =>
									setAttributes( {
										mediaId: 0,
										mediaUrl: '',
										mediaAlt: '',
										mediaWidth: 0,
										mediaHeight: 0,
									} )
								}
							/>
						) : null }
					</ToolbarGroup>
				</BlockControls>
			) }

			{ /* Inspector Controls */ }
			<ImageInspector
				attributes={ attributes as any }
				setAttributes={ setAttributes as any }
			/>

			{ /* Block output */ }
			<figure { ...blockProps }>
				{ hasMedia && lightbox && (
					<span
						className="gb-image__lightbox-badge"
						aria-hidden="true"
						title={ __( 'Lightbox enabled', 'goblocks' ) }
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<rect
								x="2"
								y="2"
								width="20"
								height="20"
								rx="3"
								stroke="currentColor"
								strokeWidth="2"
							/>
							<circle
								cx="12"
								cy="12"
								r="4"
								stroke="currentColor"
								strokeWidth="2"
							/>
							<circle
								cx="17.5"
								cy="6.5"
								r="1.5"
								fill="currentColor"
							/>
						</svg>
					</span>
				) }
				{ hasMedia ? (
					<>
						<img
							className="gb-image__img"
							src={ mediaUrl }
							alt={ mediaAlt }
							width={ mediaWidth || undefined }
							height={ mediaHeight || undefined }
						/>
						{ showCaption && (
							<RichText
								tagName="figcaption"
								className="gb-image__caption"
								value={ caption }
								onChange={ ( value ) =>
									setAttributes( { caption: value } )
								}
								placeholder={ __( 'Caption…', 'goblocks' ) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
									'core/link',
								] }
							/>
						) }
					</>
				) : (
					<MediaPlaceholder
						icon="format-image"
						labels={ { title: __( 'Image', 'goblocks' ) } }
						onSelect={ onSelectMedia }
						onSelectURL={ onSelectURL }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
					/>
				) }
			</figure>
		</>
	);
}
