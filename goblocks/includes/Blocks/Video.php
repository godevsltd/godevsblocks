<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Video block — PHP render callback.
 *
 * Supports YouTube/Vimeo embeds with configurable URL params and a
 * lazy-load facade (thumbnail + play button) for YouTube, plus self-hosted <video>.
 */
class Video extends BlockBase {

	public function get_name(): string {
		return 'video';
	}

	/** Extract the 11-char YouTube video ID from any recognised URL shape. */
	private function get_youtube_id( string $url ): string {
		if ( preg_match( '/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([a-zA-Z0-9_-]{11})/', $url, $m ) ) {
			return $m[1];
		}
		return '';
	}

	/** Build a YouTube embed URL, appending requested query params. */
	private function build_youtube_url( string $id, array $attributes ): string {
		$params = array();

		// rel=0 by default (hide unrelated recommendations).
		if ( empty( $attributes['youtubeRel'] ) ) {
			$params['rel'] = '0';
		}

		if ( ! empty( $attributes['youtubeModestBranding'] ) ) {
			$params['modestbranding'] = '1';
		}

		$start = isset( $attributes['youtubeStart'] ) ? intval( $attributes['youtubeStart'] ) : 0;
		if ( $start > 0 ) {
			$params['start'] = (string) $start;
		}

		$base = 'https://www.youtube.com/embed/' . $id;
		return $params ? $base . '?' . http_build_query( $params ) : $base;
	}

	/** Build a Vimeo embed URL, appending requested query params. */
	private function build_vimeo_url( string $id, array $attributes ): string {
		$params = array();

		if ( ! empty( $attributes['vimeoHideBranding'] ) ) {
			$params['title']    = '0';
			$params['byline']   = '0';
			$params['portrait'] = '0';
		}

		$base = 'https://player.vimeo.com/video/' . $id;
		return $params ? $base . '?' . http_build_query( $params ) : $base;
	}

	/**
	 * Convert a public video URL into a parameterised embed URL.
	 * Returns '' for self-hosted files.
	 */
	private function get_embed_url( string $url, array $attributes = array() ): string {
		if ( preg_match( '/youtube\.com|youtu\.be/i', $url ) ) {
			$id = $this->get_youtube_id( $url );
			if ( $id ) {
				return $this->build_youtube_url( $id, $attributes );
			}
		}

		if ( preg_match( '/vimeo\.com\/(?:[^\/]+\/)*(\d+)/i', $url, $m ) ) {
			return $this->build_vimeo_url( $m[1], $attributes );
		}

		return '';
	}

	/** Check whether the URL points to a self-hosted video file. */
	private function is_self_hosted( string $url ): bool {
		$path = wp_parse_url( $url, PHP_URL_PATH ) ?? '';
		return (bool) preg_match( '/\.(mp4|webm|ogg|mov|m4v)$/i', $path );
	}

	/** Build the lazy-load facade: thumbnail image + YouTube play button overlay. */
	private function render_lazy_facade( string $embed_url, string $youtube_id ): string {
		$thumb_url = 'https://i.ytimg.com/vi/' . $youtube_id . '/hqdefault.jpg';
		// Append autoplay=1 so clicking the button starts playback immediately.
		$separator = str_contains( $embed_url, '?' ) ? '&' : '?';
		$click_url = $embed_url . $separator . 'autoplay=1';

		$play_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">'
			. '<path fill="#212121" fill-opacity=".8" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/>'
			. '<path fill="#fff" d="M 45,24 27,14 27,34"/>'
			. '</svg>';

		return sprintf(
			'<button class="gb-video__facade" data-embed="%s" aria-label="%s">'
			. '<img src="%s" alt="" loading="lazy" />'
			. '<span class="gb-video__play-btn">%s</span>'
			. '</button>',
			esc_attr( $click_url ),
			esc_attr__( 'Play video', 'goblocks' ),
			esc_url( $thumb_url ),
			$play_icon
		);
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$url = isset( $attributes['url'] ) ? esc_url_raw( (string) $attributes['url'] ) : '';
		if ( '' === $url ) {
			return '';
		}

		$unique_id = $this->get_unique_id( $attributes );

		$ratio = isset( $attributes['ratio'] ) ? sanitize_text_field( (string) $attributes['ratio'] ) : '16/9';
		if ( ! preg_match( '/^\d+\/\d+$/', $ratio ) ) {
			$ratio = '16/9';
		}

		$embed_url    = $this->get_embed_url( $url, $attributes );
		$caption      = isset( $attributes['caption'] ) ? wp_kses_post( (string) $attributes['caption'] ) : '';
		$video_title  = isset( $attributes['videoTitle'] ) ? sanitize_text_field( (string) $attributes['videoTitle'] ) : '';
		$iframe_title = $video_title ?: __( 'Video embed', 'goblocks' );

		$is_youtube = (bool) preg_match( '/youtube\.com|youtu\.be/i', $url );
		$youtube_id = $is_youtube ? $this->get_youtube_id( $url ) : '';
		$lazy_load  = ! empty( $attributes['lazyLoad'] );
		$use_facade = $lazy_load && $is_youtube && '' !== $youtube_id;

		$extra_classes = array_filter(
			array(
				'gb-video',
				$use_facade ? 'gb-video--lazy' : '',
			)
		);

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		if ( '' !== $embed_url ) {
			if ( $use_facade ) {
				$inner = $this->render_lazy_facade( $embed_url, $youtube_id );
			} else {
				$inner = sprintf(
					'<iframe src="%s" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" style="width:100%%;height:100%%;border:0;" title="%s"></iframe>',
					esc_url( $embed_url ),
					esc_attr( $iframe_title )
				);
			}
		} elseif ( $this->is_self_hosted( $url ) ) {
			$autoplay        = ! empty( $attributes['autoplay'] );
			$muted           = ! empty( $attributes['muted'] );
			$loop            = ! empty( $attributes['loop'] );
			$controls        = ! isset( $attributes['controls'] ) || (bool) $attributes['controls'];
			$playsinline     = ! isset( $attributes['playsinline'] ) || (bool) $attributes['playsinline'];
			$poster          = isset( $attributes['poster'] ) ? esc_url_raw( (string) $attributes['poster'] ) : '';
			$allowed_preload = array( 'none', 'metadata', 'auto' );
			$preload         = isset( $attributes['preload'] ) ? sanitize_key( (string) $attributes['preload'] ) : 'metadata';
			if ( ! in_array( $preload, $allowed_preload, true ) ) {
				$preload = 'metadata';
			}

			$video_attrs  = ' style="width:100%;height:100%;display:block;"';
			$video_attrs .= ' preload="' . esc_attr( $preload ) . '"';
			if ( $autoplay ) {
				$video_attrs .= ' autoplay';
			}
			if ( $muted ) {
				$video_attrs .= ' muted';
			}
			if ( $loop ) {
				$video_attrs .= ' loop';
			}
			if ( $controls ) {
				$video_attrs .= ' controls';
			}
			if ( $playsinline ) {
				$video_attrs .= ' playsinline';
			}
			if ( $poster ) {
				$video_attrs .= ' poster="' . esc_url( $poster ) . '"';
			}
			if ( $video_title ) {
				$video_attrs .= ' aria-label="' . esc_attr( $video_title ) . '"';
			}

			$inner = sprintf( '<video src="%s"%s></video>', esc_url( $url ), $video_attrs );
		} else {
			$inner = sprintf(
				'<iframe src="%s" allow="autoplay; encrypted-media" allowfullscreen loading="lazy" style="width:100%%;height:100%%;border:0;" title="%s"></iframe>',
				esc_url( $url ),
				esc_attr( $iframe_title )
			);
		}

		$wrapper = sprintf(
			'<div class="%s" style="aspect-ratio:%s;">%s</div>',
			esc_attr( $classes ),
			esc_attr( $ratio ),
			$inner
		);

		if ( $caption ) {
			return sprintf(
				'<figure class="gb-video-figure">%s<figcaption class="gb-video__caption">%s</figcaption></figure>',
				$wrapper,
				$caption
			);
		}

		return $wrapper;
	}
}
