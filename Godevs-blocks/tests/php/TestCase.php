<?php
namespace GoBlocks\Tests;

use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;

/**
 * Base test case for all GoBlocks PHPUnit tests.
 *
 * Sets up Brain\Monkey (for WP function stubs) and registers a core set of
 * passthrough stubs for the sanitizers used across most classes.
 * Tests that need different behaviour can override per-function via
 * Functions\expect() or Functions\when() in their own setUp().
 */
abstract class TestCase extends \PHPUnit\Framework\TestCase {
	use MockeryPHPUnitIntegration;

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		$this->register_common_stubs();
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Register passthrough stubs for WP sanitization functions used throughout
	 * the plugin.  Tests that need specific return values must call
	 * Functions\when() for that function AFTER calling parent::setUp().
	 */
	private function register_common_stubs(): void {
		// Sanitizers — pass through the value unchanged for predictable test assertions.
		Functions\when( 'sanitize_text_field' )->returnArg();
		Functions\when( 'sanitize_html_class' )->returnArg();
		Functions\when( 'wp_strip_all_tags' )->alias( 'strip_tags' );
		Functions\when( 'absint' )->alias( 'abs' );

		// sanitize_key: lowercase + remove non-(a-z0-9_-).
		Functions\when( 'sanitize_key' )->alias(
			static function ( string $key ): string {
				return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $key ) ) ?? '';
			}
		);

		// Escaping — htmlspecialchars equivalents for readable assertions.
		Functions\when( 'esc_attr' )->alias(
			static function ( string $s ): string {
				return htmlspecialchars( $s, ENT_QUOTES, 'UTF-8' );
			}
		);
		Functions\when( 'esc_html' )->alias(
			static function ( string $s ): string {
				return htmlspecialchars( $s, ENT_QUOTES, 'UTF-8' );
			}
		);
		Functions\when( 'esc_url' )->returnArg();

		// i18n stubs — return the message string.
		Functions\when( 'esc_html__' )->returnArg();
		Functions\when( '__' )->returnArg();
		Functions\when( '_e' )->alias( static fn( string $s ) => print( esc_html( $s ) ) );

		// WP_Error detection.
		Functions\when( 'is_wp_error' )->alias(
			static function ( mixed $thing ): bool {
				return $thing instanceof \WP_Error;
			}
		);
	}
}
