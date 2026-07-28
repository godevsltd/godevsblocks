<?php
/**
 * Abstract Data Transfer Object base class.
 *
 * @package GoBlocks\Utils
 */

namespace GoBlocks\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Lightweight base for structured data bags.
 *
 * Subclasses declare public typed properties.
 * The constructor maps a plain array onto those properties,
 * ignoring keys that are not declared.
 *
 * Usage:
 *   class PatternDTO extends DTO {
 *       public string $slug  = '';
 *       public string $title = '';
 *       public string $html  = '';
 *   }
 *   $dto = new PatternDTO(['slug' => 'hero', 'title' => 'Hero', 'html' => '...']);
 */
abstract class DTO {

	/**
	 * Populate declared properties from the given array.
	 *
	 * Only keys whose names match declared public properties are applied;
	 * unknown keys are silently ignored.
	 *
	 * @param array<string, mixed> $data Key→value pairs.
	 */
	public function __construct( array $data = array() ) {
		foreach ( $data as $key => $value ) {
			if ( property_exists( $this, $key ) ) {
				$this->$key = $value; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
			}
		}
	}

	/**
	 * Serialize back to an associative array.
	 *
	 * @return array<string, mixed>
	 */
	public function to_array(): array {
		return get_object_vars( $this );
	}

	/**
	 * Serialize to JSON string.
	 *
	 * @return string
	 */
	public function to_json(): string {
		return (string) wp_json_encode( $this->to_array() );
	}
}
