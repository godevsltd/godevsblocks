<?php
namespace GoBlocks\Tests\Unit\Settings;

use GoBlocks\Settings\Schema;
use GoBlocks\Tests\TestCase;

/**
 * Unit tests for Settings\Schema.
 *
 * Covers: key enumeration, integer range validation, string enum validation,
 * boolean coercion, unknown-key stripping, and the color-palette sanitizer.
 */
class SchemaTest extends TestCase {

	// ── Schema structure ─────────────────────────────────────────────────────

	public function test_get_returns_all_expected_keys(): void {
		$keys = array_keys( Schema::get() );

		$expected = [
			'container_width',
			'css_print_method',
			'breakpoints',
			'sync_responsive',
			'disable_google_fonts',
			'enable_dark_mode',
			'global_color_palette',
			'global_typography',
		];

		foreach ( $expected as $key ) {
			self::assertContains( $key, $keys, "Schema missing key: $key" );
		}
	}

	// ── validate() — unknown keys ─────────────────────────────────────────────

	public function test_validate_strips_unknown_keys(): void {
		$result = Schema::validate( [ 'unknown_key' => 'value', 'container_width' => 1000 ] );

		self::assertIsArray( $result );
		self::assertArrayNotHasKey( 'unknown_key', $result );
		self::assertArrayHasKey( 'container_width', $result );
	}

	public function test_validate_empty_array_returns_empty_array(): void {
		$result = Schema::validate( [] );
		self::assertIsArray( $result );
		self::assertEmpty( $result );
	}

	// ── validate() — integer type ─────────────────────────────────────────────

	public function test_validate_integer_within_range_passes(): void {
		$result = Schema::validate( [ 'container_width' => 1200 ] );

		self::assertIsArray( $result );
		self::assertSame( 1200, $result['container_width'] );
	}

	public function test_validate_integer_below_min_returns_wp_error(): void {
		$result = Schema::validate( [ 'container_width' => 100 ] );

		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_settings_range', $result->get_error_code() );
	}

	public function test_validate_integer_above_max_returns_wp_error(): void {
		$result = Schema::validate( [ 'container_width' => 99999 ] );

		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_settings_range', $result->get_error_code() );
	}

	public function test_validate_integer_at_boundary_min_passes(): void {
		$result = Schema::validate( [ 'container_width' => 320 ] );

		self::assertIsArray( $result );
		self::assertSame( 320, $result['container_width'] );
	}

	public function test_validate_integer_at_boundary_max_passes(): void {
		$result = Schema::validate( [ 'container_width' => 3840 ] );

		self::assertIsArray( $result );
		self::assertSame( 3840, $result['container_width'] );
	}

	public function test_validate_integer_coerces_numeric_string(): void {
		$result = Schema::validate( [ 'container_width' => '1440' ] );

		self::assertIsArray( $result );
		self::assertSame( 1440, $result['container_width'] );
	}

	// ── validate() — string enum ─────────────────────────────────────────────

	public function test_validate_string_enum_valid_value_passes(): void {
		$result = Schema::validate( [ 'css_print_method' => 'inline' ] );

		self::assertIsArray( $result );
		self::assertSame( 'inline', $result['css_print_method'] );
	}

	public function test_validate_string_enum_invalid_value_returns_wp_error(): void {
		$result = Schema::validate( [ 'css_print_method' => 'database' ] );

		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_settings_enum', $result->get_error_code() );
	}

	// ── validate() — boolean ─────────────────────────────────────────────────

	public function test_validate_boolean_true_passes(): void {
		$result = Schema::validate( [ 'enable_dark_mode' => true ] );

		self::assertIsArray( $result );
		self::assertTrue( $result['enable_dark_mode'] );
	}

	public function test_validate_boolean_false_passes(): void {
		$result = Schema::validate( [ 'enable_dark_mode' => false ] );

		self::assertIsArray( $result );
		self::assertFalse( $result['enable_dark_mode'] );
	}

	public function test_validate_boolean_truthy_string_coerced(): void {
		$result = Schema::validate( [ 'enable_dark_mode' => '1' ] );

		self::assertIsArray( $result );
		self::assertTrue( $result['enable_dark_mode'] );
	}

	public function test_validate_boolean_falsy_string_coerced(): void {
		$result = Schema::validate( [ 'enable_dark_mode' => '0' ] );

		self::assertIsArray( $result );
		self::assertFalse( $result['enable_dark_mode'] );
	}

	// ── validate() — color palette sanitizer ─────────────────────────────────

	public function test_validate_color_palette_valid_hex(): void {
		$result = Schema::validate( [
			'global_color_palette' => [
				[ 'slug' => 'primary', 'name' => 'Primary Blue', 'color' => '#0066cc' ],
			],
		] );

		self::assertIsArray( $result );
		self::assertCount( 1, $result['global_color_palette'] );
		self::assertSame( '#0066cc', $result['global_color_palette'][0]['color'] );
	}

	public function test_validate_color_palette_strips_entries_without_slug(): void {
		$result = Schema::validate( [
			'global_color_palette' => [
				[ 'slug' => '', 'name' => 'No Slug', 'color' => '#ff0000' ],
			],
		] );

		self::assertIsArray( $result );
		self::assertEmpty( $result['global_color_palette'] );
	}

	public function test_validate_color_palette_strips_invalid_color(): void {
		$result = Schema::validate( [
			'global_color_palette' => [
				[ 'slug' => 'bad', 'name' => 'Bad Color', 'color' => 'javascript:alert(1)' ],
			],
		] );

		self::assertIsArray( $result );
		self::assertEmpty( $result['global_color_palette'] );
	}

	public function test_validate_color_palette_non_array_becomes_empty(): void {
		$result = Schema::validate( [ 'global_color_palette' => 'not-an-array' ] );

		self::assertIsArray( $result );
		self::assertEmpty( $result['global_color_palette'] );
	}

	// ── validate() — breakpoints ─────────────────────────────────────────────

	public function test_validate_breakpoints_clamps_to_range(): void {
		$result = Schema::validate( [
			'breakpoints' => [
				'xs' => 100,   // below 320 — should clamp to 320
				'sm' => 576,
				'md' => 768,
				'lg' => 1024,
				'xl' => 1280,
				'2xl' => 1536,
			],
		] );

		self::assertIsArray( $result );
		self::assertSame( 320, $result['breakpoints']['xs'] );
		self::assertSame( 576, $result['breakpoints']['sm'] );
	}

	public function test_validate_breakpoints_non_array_returns_defaults(): void {
		$result = Schema::validate( [ 'breakpoints' => 'invalid' ] );

		self::assertIsArray( $result );
		self::assertIsArray( $result['breakpoints'] );
		self::assertArrayHasKey( 'xs', $result['breakpoints'] );
	}
}
