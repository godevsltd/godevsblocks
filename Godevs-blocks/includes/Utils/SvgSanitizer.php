<?php
/**
 * Svg Sanitizer.
 *
 * @package GoBlocks\Utils
 */

namespace GoBlocks\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Sanitize SVG markup via DOMDocument before it is saved or rendered.
 *
 * Allowlists known-safe SVG elements and attributes.
 * Any element or attribute not on the list is stripped.
 * JavaScript event handlers and javascript: URIs are always removed.
 */
final class SvgSanitizer {

	/**
	 * Allowed SVG element names (lowercase).
	 *
	 * @var string[]
	 */
	private const ALLOWED_ELEMENTS = array(
		'svg',
		'title',
		'desc',
		'defs',
		'use',
		'symbol',
		'g',
		'path',
		'rect',
		'circle',
		'ellipse',
		'line',
		'polyline',
		'polygon',
		'text',
		'tspan',
		'textpath',
		'lineargradient',
		'radialgradient',
		'stop',
		'clippath',
		'mask',
		'pattern',
		'filter',
		'feblend',
		'fecolormatrix',
		'fecomponenttransfer',
		'fecomposite',
		'feconvolvematrix',
		'fediffuselighting',
		'fedisplacementmap',
		'feflood',
		'fegaussianblur',
		'feimage',
		'femerge',
		'femergenode',
		'femorphology',
		'feoffset',
		'fespecularlighting',
		'fetile',
		'feturbulence',
	);

	/**
	 * Allowed attribute names (lowercase).
	 *
	 * @var string[]
	 */
	private const ALLOWED_ATTRIBUTES = array(
		// Core presentation.
		'class',
		'id',
		'style',
		'transform',
		'opacity',
		'fill',
		'fill-opacity',
		'fill-rule',
		'stroke',
		'stroke-width',
		'stroke-linecap',
		'stroke-linejoin',
		'stroke-opacity',
		'stroke-dasharray',
		'stroke-dashoffset',
		'clip-path',
		'clip-rule',
		'color',
		'display',
		'visibility',
		'overflow',
		'cursor',
		'pointer-events',
		'color-interpolation',
		'color-interpolation-filters',
		// Geometry.
		'd',
		'x',
		'y',
		'x1',
		'y1',
		'x2',
		'y2',
		'cx',
		'cy',
		'r',
		'rx',
		'ry',
		'width',
		'height',
		'points',
		'viewbox',
		'preserveaspectratio',
		// Text.
		'font-family',
		'font-size',
		'font-style',
		'font-weight',
		'text-anchor',
		'text-decoration',
		'letter-spacing',
		'word-spacing',
		'dominant-baseline',
		// References — href checked for javascript: below.
		'href',
		'xlink:href',
		// Gradient.
		'gradientunits',
		'gradienttransform',
		'spreadmethod',
		'fx',
		'fy',
		'offset',
		'stop-color',
		'stop-opacity',
		// Filter primitives.
		'in',
		'in2',
		'result',
		'type',
		'values',
		'mode',
		'stddeviation',
		'dx',
		'dy',
		'k1',
		'k2',
		'k3',
		'k4',
		'operator',
		'radius',
		'basefrequency',
		'numoctaves',
		'seed',
		'stitchtiles',
		// Clipping / masking.
		'clippathunits',
		'maskunits',
		'maskcontentunits',
		// Symbol / use.
		'refx',
		'refy',
		'markerwidth',
		'markerheight',
		'orient',
		// SVG root namespace attributes.
		'xmlns',
		'xmlns:xlink',
		'version',
		'baseprofile',
		// Pattern.
		'patternunits',
		'patterncontentunits',
		'patterntransform',
		// Accessibility.
		'role',
		'aria-hidden',
		'aria-label',
		'aria-labelledby',
		'aria-describedby',
		'tabindex',
		'focusable',
	);

	/**
	 * Sanitize an SVG inner-content string (path/shape elements without the outer <svg> tag).
	 *
	 * Wraps the input in a temporary <svg> root, runs the full sanitiser, then
	 * extracts and returns only the serialised child nodes.
	 *
	 * @param  string $inner Raw inner SVG markup (no <svg> wrapper).
	 * @return string Sanitized inner markup, or empty string on parse failure.
	 */
	public static function sanitize_inner( string $inner ): string {
		$inner = trim( $inner );

		if ( '' === $inner ) {
			return '';
		}

		$wrapped = '<svg xmlns="http://www.w3.org/2000/svg">' . $inner . '</svg>';

		$dom = new \DOMDocument();
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$dom->formatOutput = false;

		$prev   = libxml_use_internal_errors( true );
		$loaded = $dom->loadXML( $wrapped, LIBXML_NONET | LIBXML_NOERROR );
		libxml_clear_errors();
		libxml_use_internal_errors( $prev );

		if ( ! $loaded ) {
			return '';
		}

		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$root = $dom->documentElement;

		if ( ! $root ) {
			return '';
		}

		self::clean_node( $root );

		$output = '';
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		foreach ( $root->childNodes as $child ) {
			$serialized = $dom->saveXML( $child );

			if ( $serialized ) {
				$output .= $serialized;
			}
		}

		return $output;
	}

	/**
	 * Sanitize an SVG string.
	 *
	 * @param  string $svg Raw SVG markup.
	 * @return string Sanitized SVG, or empty string on parse failure.
	 */
	public static function sanitize( string $svg ): string {
		$svg = trim( $svg );

		if ( '' === $svg ) {
			return '';
		}

		$dom = new \DOMDocument();
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$dom->formatOutput = false;

		$prev   = libxml_use_internal_errors( true );
		$loaded = $dom->loadXML( $svg, LIBXML_NONET | LIBXML_NOERROR );
		libxml_clear_errors();
		libxml_use_internal_errors( $prev );

		if ( ! $loaded ) {
			return '';
		}

		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$root = $dom->documentElement;

		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		if ( ! $root || 'svg' !== strtolower( $root->localName ) ) {
			return '';
		}

		self::clean_node( $root );

		$output = $dom->saveXML( $root );

		return $output ? $output : '';
	}

	/**
	 * Recursively remove disallowed elements and attributes.
	 *
	 * @param  \DOMNode $node Node to clean.
	 * @return void
	 */
	private static function clean_node( \DOMNode $node ): void {
		// Snapshot children before mutating the live NodeList.
		$children = array();
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		foreach ( $node->childNodes as $child ) {
			$children[] = $child;
		}

		foreach ( $children as $child ) {
			// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			if ( XML_ELEMENT_NODE === $child->nodeType ) {
				// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$local = strtolower( $child->localName ?? '' );

				if ( ! in_array( $local, self::ALLOWED_ELEMENTS, true ) ) {
					$node->removeChild( $child );
					continue;
				}

				if ( $child instanceof \DOMElement ) {
					self::clean_attributes( $child );
				}

				self::clean_node( $child );

			// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			} elseif ( XML_COMMENT_NODE === $child->nodeType ) {
				$node->removeChild( $child );
			}
		}
	}

	/**
	 * Remove disallowed attributes from a DOMElement.
	 *
	 * @param  \DOMElement $el Element to clean.
	 * @return void
	 */
	private static function clean_attributes( \DOMElement $el ): void {
		$to_remove = array();

		foreach ( $el->attributes as $attr ) {
			$name = strtolower( $attr->name );

			// Strip all on* event handlers.
			if ( str_starts_with( $name, 'on' ) ) {
				$to_remove[] = $attr->name;
				continue;
			}

			// Block javascript: URIs in href / xlink:href.
			if ( in_array( $name, array( 'href', 'xlink:href' ), true ) ) {
				if ( preg_match( '/^\s*javascript:/i', $attr->value ) ) {
					$to_remove[] = $attr->name;
					continue;
				}
			}

			// Allow data-* attributes.
			if ( str_starts_with( $name, 'data-' ) ) {
				continue;
			}

			if ( ! in_array( $name, self::ALLOWED_ATTRIBUTES, true ) ) {
				$to_remove[] = $attr->name;
			}
		}

		foreach ( $to_remove as $attr_name ) {
			$el->removeAttribute( $attr_name );
		}
	}
}
