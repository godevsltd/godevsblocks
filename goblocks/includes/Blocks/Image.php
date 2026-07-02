<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Image block — PHP render callback.
 *
 * Structure: <figure class="gb-image ..."><(?a>)<img>(</?a>)(<figcaption>)</figure>
 *
 * When mediaId is set, delegates to wp_get_attachment_image() for automatic
 * srcset, sizes, loading=lazy, and decoding=async attributes.
 * External URLs (mediaId = 0, mediaUrl set) fall back to a plain <img>.
 */
class Image extends BlockBase {

	/**
	 * Allowed kses tags for figcaption.
	 *
	 * @var array<string, array<string, bool>>
	 */
	private const CAPTION_KSES = array(
		'strong' => array(),
		'em'     => array(),
		'span'   => array(),
		'a'      => array(
			'href'   => true,
			'target' => true,
			'rel'    => true,
		),
		'br'     => array(),
	);

	/**
	 * Block slug (without namespace prefix).
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'image';
	}

	/**
	 * Render the Image block.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Inner blocks HTML (unused).
	 * @param \WP_Block            $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$media_id  = (int) ( $attributes['mediaId'] ?? 0 );
		$raw_url   = (string) ( $attributes['mediaUrl'] ?? '' );
		$media_url = sanitize_url( $raw_url );

		// Blob URLs are browser-only object URLs generated before upload completes.
		// They resolve on the client but are meaningless server-side. Skip render
		// so the block outputs nothing rather than a broken <img src="">.
		if ( str_starts_with( $raw_url, 'blob:' ) ) {
			return '';
		}

		if ( ! $media_id && ! $media_url ) {
			return '';
		}

		$block_class    = $this->get_block_class( $unique_id );   // gb-image-{uniqueId}
		$global_classes = $this->get_global_classes( $attributes );

		$hover_effect = sanitize_key( (string) ( $attributes['hoverEffect'] ?? 'none' ) );
		if ( ! in_array( $hover_effect, array( 'none', 'zoom', 'grayscale', 'darken', 'lift' ), true ) ) {
			$hover_effect = 'none';
		}

		$extra = array( 'gb-image' );
		if ( ! empty( $attributes['objectFit'] ) ) {
			$extra[] = 'gb-image--has-focal';
		}
		if ( 'none' !== $hover_effect ) {
			$extra[] = 'gb-image--hover-' . $hover_effect;
		}

		$classes = $this->build_class_string( $block_class, $global_classes, $extra );
		$html_attrs     = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		// Build the <img> element.
		$img_html = $this->build_img( $media_id, $media_url, $attributes );

		// Lightbox takes priority over regular link.
		$lightbox         = ! empty( $attributes['lightbox'] );
		$lightbox_caption = ! isset( $attributes['lightboxCaption'] ) || ! empty( $attributes['lightboxCaption'] );
		$lightbox_effect  = sanitize_key( (string) ( $attributes['lightboxEffect'] ?? 'zoom' ) );

		if ( $lightbox ) {
			// Full-size URL for the lightbox overlay.
			$full_url = $media_id > 0 ? wp_get_attachment_url( $media_id ) : $media_url;
			if ( ! $full_url ) $full_url = $media_url;

			$caption_text = $lightbox_caption && ! empty( $attributes['caption'] )
				? wp_strip_all_tags( (string) $attributes['caption'] )
				: '';

			$lb_attrs  = ' href="' . esc_url( (string) $full_url ) . '"';
			$lb_attrs .= ' data-gb-lightbox';
			$lb_attrs .= ' data-gb-alt="' . esc_attr( sanitize_text_field( (string) ( $attributes['mediaAlt'] ?? '' ) ) ) . '"';
			$lb_attrs .= ' data-gb-effect="' . esc_attr( $lightbox_effect ) . '"';
			if ( $caption_text ) {
				$lb_attrs .= ' data-gb-caption="' . esc_attr( $caption_text ) . '"';
			}

			$img_html = '<a class="gb-image__lightbox-trigger"' . $lb_attrs . '>' . $img_html . '</a>';
		} else {
			// Optional link wrapping: <a href="..."><img></a>
			$href = esc_url( (string) ( $attributes['href'] ?? '' ) );
			if ( $href ) {
				$img_html = $this->wrap_with_link( $img_html, $href, $attributes );
			}
		}

		// Optional figcaption.
		if ( ! empty( $attributes['showCaption'] ) && true === $attributes['showCaption'] ) {
			$caption_text = wp_kses( (string) ( $attributes['caption'] ?? '' ), self::CAPTION_KSES );
			if ( $caption_text ) {
				$img_html .= '<figcaption class="gb-image__caption">' . $caption_text . '</figcaption>';
			}
		}

		return sprintf(
			'<figure class="%1$s"%2$s>%3$s</figure>',
			$classes,
			$html_attrs,
			$img_html
		);
	}

	/**
	 * Build the <img> element.
	 *
	 * Uses wp_get_attachment_image() for library images (handles srcset, loading,
	 * decoding automatically). Falls back to a plain <img> for external URLs.
	 *
	 * @param int                  $media_id  Attachment ID (0 for external URL).
	 * @param string               $media_url Fallback URL (empty when mediaId is set).
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string
	 */
	private function build_img( int $media_id, string $media_url, array $attributes ): string {
		$alt    = sanitize_text_field( (string) ( $attributes['mediaAlt'] ?? '' ) );
		$size   = sanitize_key( (string) ( $attributes['sizeSlug'] ?? 'large' ) );
		$width  = (int) ( $attributes['mediaWidth'] ?? 0 );
		$height = (int) ( $attributes['mediaHeight'] ?? 0 );

		if ( $media_id > 0 ) {
			$img_attrs = array( 'class' => 'gb-image__img' );

			// Only override alt if explicitly set in block attributes.
			if ( '' !== $alt ) {
				$img_attrs['alt'] = $alt;
			}

			return wp_get_attachment_image( $media_id, $size, false, $img_attrs );
		}

		// External URL fallback.
		$src_attr    = ' src="' . esc_url( $media_url ) . '"';
		$alt_attr    = ' alt="' . esc_attr( $alt ) . '"';
		$width_attr  = $width > 0 ? ' width="' . $width . '"' : '';
		$height_attr = $height > 0 ? ' height="' . $height . '"' : '';

		return '<img class="gb-image__img" loading="lazy" decoding="async"'
			. $src_attr . $alt_attr . $width_attr . $height_attr . '>';
	}

	/**
	 * Wrap image HTML in an <a> link element.
	 *
	 * @param string               $img_html  Already-built <img> HTML.
	 * @param string               $href      Already-escaped URL.
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string
	 */
	private function wrap_with_link( string $img_html, string $href, array $attributes ): string {
		$target = (string) ( $attributes['target'] ?? '_self' );

		if ( ! in_array( $target, array( '_self', '_blank' ), true ) ) {
			$target = '_self';
		}

		$rel = sanitize_text_field( (string) ( $attributes['rel'] ?? '' ) );

		if ( '_blank' === $target ) {
			$rel_parts = array_unique(
				array_filter(
					array_merge( array( 'noopener', 'noreferrer' ), explode( ' ', $rel ) )
				)
			);
			$rel       = implode( ' ', $rel_parts );
		}

		$link_attrs  = ' href="' . $href . '"';
		$link_attrs .= ' target="' . esc_attr( $target ) . '"';

		if ( $rel ) {
			$link_attrs .= ' rel="' . esc_attr( $rel ) . '"';
		}

		return '<a' . $link_attrs . '>' . $img_html . '</a>';
	}
}
