<?php
/**
 * Social Share.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Social Share block — PHP render callback.
 *
 * Supports filled/outline/minimal/rounded button styles, popup window sharing,
 * copy-to-clipboard, and platforms: Facebook, X, LinkedIn, WhatsApp, Telegram,
 * Reddit, Pinterest, Email, Copy Link.
 */
class SocialShare extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'social-share';
	}

	private const ALLOWED_PLATFORMS = array( 'facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'reddit', 'pinterest', 'email', 'copy' );
	private const ALLOWED_SIZES     = array( 'sm', 'md', 'lg' );
	private const ALLOWED_LAYOUTS   = array( 'horizontal', 'vertical' );
	private const ALLOWED_STYLES    = array( 'filled', 'outline', 'minimal', 'rounded' );

	/**
	 * Build the share URL for a given platform.
	 *
	 * @param  string $platform Platform slug.
	 * @param  string $url      URL to share.
	 * @param  string $title    Post title to include in the share text.
	 * @return string           Share URL.
	 */
	private function get_share_url( string $platform, string $url, string $title ): string {
		$enc_url   = rawurlencode( $url );
		$enc_title = rawurlencode( $title );

		$map = array(
			'facebook'  => "https://www.facebook.com/sharer/sharer.php?u={$enc_url}",
			'twitter'   => "https://x.com/intent/tweet?url={$enc_url}&text={$enc_title}",
			'linkedin'  => "https://www.linkedin.com/sharing/share-offsite/?url={$enc_url}",
			'whatsapp'  => "https://wa.me/?text={$enc_title}+{$enc_url}",
			'telegram'  => "https://t.me/share/url?url={$enc_url}&text={$enc_title}",
			'reddit'    => "https://reddit.com/submit?url={$enc_url}&title={$enc_title}",
			'pinterest' => "https://pinterest.com/pin/create/button/?url={$enc_url}",
			'email'     => "mailto:?subject={$enc_title}&body={$enc_url}",
			'copy'      => '#',
		);

		return $map[ $platform ] ?? '#';
	}

	/**
	 * Return the human-readable label for a platform.
	 *
	 * @param  string $platform Platform slug.
	 * @return string           Platform label.
	 */
	private function get_platform_label( string $platform ): string {
		$labels = array(
			'facebook'  => 'Facebook',
			'twitter'   => 'X (Twitter)',
			'linkedin'  => 'LinkedIn',
			'whatsapp'  => 'WhatsApp',
			'telegram'  => 'Telegram',
			'reddit'    => 'Reddit',
			'pinterest' => 'Pinterest',
			'email'     => 'Email',
			'copy'      => 'Copy Link',
		);
		return $labels[ $platform ] ?? ucfirst( $platform );
	}

	/**
	 * Return the SVG icon markup for a platform.
	 *
	 * @param  string $platform Platform slug.
	 * @return string           SVG icon HTML.
	 */
	private function get_platform_icon( string $platform ): string {
		$icons = array(
			'facebook'  => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
			'twitter'   => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
			'linkedin'  => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
			'whatsapp'  => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>',
			'telegram'  => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z"/></svg>',
			'reddit'    => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="12"/><path fill="#fff" d="M20 12c0-1.1-.9-2-2-2a2 2 0 0 0-1.3.5A9.9 9.9 0 0 0 13 9.1l.7-3.3 2.3.5c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1.1.7l-2.6-.5c-.1 0-.3.1-.3.2l-.8 3.6A9.9 9.9 0 0 0 7.2 10.5 2 2 0 0 0 6 10a2 2 0 0 0 0 4c0 .2 0 .3.1.5C6 16.2 8.7 18 12 18s6-1.8 5.9-3.5c.1-.2.1-.3.1-.5A2 2 0 0 0 20 12zm-10 1.5c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1zm3.7 2.9c-.7.7-2.5.7-3.4 0-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 2 .5 2.6 0 .1-.1.3-.1.4 0 .1.1.1.3 0 .4zm.3-1.8c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/></svg>',
			'pinterest' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0"/></svg>',
			'email'     => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
			'copy'      => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
		);

		return $icons[ $platform ] ?? '';
	}

	/**
	 * Render the block.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner HTML content.
	 * @param  \WP_Block            $block      Block instance.
	 * @return string               Rendered HTML output.
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$platforms = isset( $attributes['platforms'] ) && is_array( $attributes['platforms'] )
			? $attributes['platforms']
			: array( 'facebook', 'twitter', 'linkedin', 'whatsapp' );

		$show_labels  = ! empty( $attributes['showLabels'] );
		$size         = isset( $attributes['size'] ) ? sanitize_key( $attributes['size'] ) : 'md';
		$layout       = isset( $attributes['layout'] ) ? sanitize_key( $attributes['layout'] ) : 'horizontal';
		$button_style = isset( $attributes['buttonStyle'] ) ? sanitize_key( $attributes['buttonStyle'] ) : 'filled';
		$custom_url   = isset( $attributes['customUrl'] ) ? esc_url_raw( (string) $attributes['customUrl'] ) : '';

		if ( ! in_array( $size, self::ALLOWED_SIZES, true ) ) {
			$size = 'md';
		}
		if ( ! in_array( $layout, self::ALLOWED_LAYOUTS, true ) ) {
			$layout = 'horizontal';
		}
		if ( ! in_array( $button_style, self::ALLOWED_STYLES, true ) ) {
			$button_style = 'filled';
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array( 'gb-social-share', "gb-social-share--{$layout}", "gb-social-share--{$size}", "gb-social-share--{$button_style}" )
		);

		$permalink  = get_permalink();
		$post_url   = $custom_url ? $custom_url : ( $permalink ? $permalink : '' );
		$raw_title  = (string) get_the_title();
		$post_title = '' !== $raw_title ? $raw_title : '';

		$buttons = '';
		foreach ( $platforms as $platform ) {
			$platform = sanitize_key( $platform );
			if ( ! in_array( $platform, self::ALLOWED_PLATFORMS, true ) ) {
				continue;
			}

			$href       = $this->get_share_url( $platform, $post_url, $post_title );
			$label      = $this->get_platform_label( $platform );
			$icon       = $this->get_platform_icon( $platform );
			$label_html = $show_labels
				? sprintf( '<span class="gb-social-share__label">%s</span>', esc_html( $label ) )
				: '';
			$icon_html  = sprintf( '<span class="gb-social-share__icon">%s</span>', $icon );
			$btn_class  = sprintf( 'gb-social-share__btn gb-social-share__btn--%s', esc_attr( $platform ) );

			if ( 'copy' === $platform ) {
				// Button element — copies URL to clipboard via view.ts.
				$buttons .= sprintf(
					'<button type="button" class="%s" data-copy-url="%s" data-orig-label="%s" aria-label="%s">%s%s</button>',
					esc_attr( $btn_class ),
					esc_attr( $post_url ),
					esc_attr( $label ),
					esc_attr( $label ),
					$icon_html,
					$label_html
				);
			} elseif ( 'email' === $platform ) {
				// Email opens mail client — no popup.
				$buttons .= sprintf(
					'<a class="%s" href="%s" aria-label="%s">%s%s</a>',
					esc_attr( $btn_class ),
					esc_url( $href ),
					esc_attr( $label ),
					$icon_html,
					$label_html
				);
			} else {
				// Social share — opens in popup via view.ts (target="_blank" fallback).
				$buttons .= sprintf(
					'<a class="%s" href="%s" data-popup="true" target="_blank" rel="noopener noreferrer" aria-label="%s">%s%s</a>',
					esc_attr( $btn_class ),
					esc_url( $href ),
					esc_attr( $label ),
					$icon_html,
					$label_html
				);
			}
		}

		return sprintf( '<div class="%s">%s</div>', esc_attr( $classes ), $buttons );
	}
}
