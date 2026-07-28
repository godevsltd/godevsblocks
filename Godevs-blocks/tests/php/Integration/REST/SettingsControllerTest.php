<?php
namespace GoBlocks\Tests\Integration\REST;

use GoBlocks\REST\SettingsController;
use GoBlocks\Tests\TestCase;
use Brain\Monkey\Functions;

/**
 * Integration tests for REST\SettingsController.
 *
 * Tests the controller logic (permission callbacks, request handling, response
 * shape) with WP infrastructure functions mocked via Brain\Monkey.
 * Full route dispatch requires a live WP environment; see E2E tests for that.
 */
class SettingsControllerTest extends TestCase {

	private SettingsController $controller;

	protected function setUp(): void {
		parent::setUp();
		$this->controller = new SettingsController();
	}

	// ── Permission callbacks ──────────────────────────────────────────────────

	public function test_require_manage_options_returns_true_for_admin(): void {
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'rest_authorization_required_code' )->justReturn( 401 );

		$result = $this->controller->require_manage_options();
		self::assertTrue( $result );
	}

	public function test_require_manage_options_returns_wp_error_for_non_admin(): void {
		Functions\when( 'current_user_can' )->justReturn( false );
		Functions\when( 'rest_authorization_required_code' )->justReturn( 401 );

		$result = $this->controller->require_manage_options();
		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_forbidden', $result->get_error_code() );
	}

	public function test_require_edit_posts_returns_true_for_editor(): void {
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'rest_authorization_required_code' )->justReturn( 401 );

		$result = $this->controller->require_edit_posts();
		self::assertTrue( $result );
	}

	public function test_require_edit_posts_returns_wp_error_for_subscriber(): void {
		Functions\when( 'current_user_can' )->justReturn( false );
		Functions\when( 'rest_authorization_required_code' )->justReturn( 401 );

		$result = $this->controller->require_edit_posts();
		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_forbidden', $result->get_error_code() );
	}

	// ── get_settings() ────────────────────────────────────────────────────────

	public function test_get_settings_returns_rest_response(): void {
		Functions\when( 'get_option' )->justReturn( [] );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		$response = $this->controller->get_settings();

		self::assertInstanceOf( \WP_REST_Response::class, $response );
		self::assertSame( 200, $response->get_status() );
	}

	public function test_get_settings_response_contains_default_keys(): void {
		Functions\when( 'get_option' )->justReturn( [] );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		$response = $this->controller->get_settings();
		$data     = $response->get_data();

		self::assertIsArray( $data );
		self::assertArrayHasKey( 'container_width', $data );
		self::assertArrayHasKey( 'css_print_method', $data );
		self::assertArrayHasKey( 'breakpoints', $data );
	}

	public function test_get_settings_merges_stored_values_over_defaults(): void {
		Functions\when( 'get_option' )->justReturn( [ 'container_width' => 1440 ] );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		$response = $this->controller->get_settings();
		$data     = $response->get_data();

		self::assertSame( 1440, $data['container_width'] );
	}

	// ── update_settings() ─────────────────────────────────────────────────────

	public function test_update_settings_with_invalid_body_returns_error(): void {
		$request = new \WP_REST_Request();
		$request->set_json_params( [] ); // valid but empty — no update

		Functions\when( 'get_option' )->justReturn( [] );
		Functions\when( 'update_option' )->justReturn( true );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		// Simulate null body (controller checks is_array).
		$reflection = new \ReflectionClass( $request );
		$prop = $reflection->getProperty( 'json_params' );
		$prop->setAccessible( true );
		$prop->setValue( $request, null );

		$result = $this->controller->update_settings( $request );

		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_invalid_body', $result->get_error_code() );
	}

	public function test_update_settings_with_valid_body_returns_success_response(): void {
		$request = new \WP_REST_Request();
		$request->set_json_params( [ 'container_width' => 1200 ] );

		Functions\when( 'get_option' )->justReturn( [] );
		Functions\when( 'update_option' )->justReturn( true );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		$response = $this->controller->update_settings( $request );

		self::assertInstanceOf( \WP_REST_Response::class, $response );
		self::assertSame( 200, $response->get_status() );
	}

	public function test_update_settings_with_out_of_range_value_returns_error(): void {
		$request = new \WP_REST_Request();
		$request->set_json_params( [ 'container_width' => 50 ] ); // below min 320

		Functions\when( 'get_option' )->justReturn( [] );
		Functions\when( 'apply_filters' )->returnArg( 2 );

		$result = $this->controller->update_settings( $request );

		self::assertInstanceOf( \WP_Error::class, $result );
		self::assertSame( 'goblocks_settings_range', $result->get_error_code() );
	}

	// ── Namespace ─────────────────────────────────────────────────────────────

	public function test_controller_uses_goblocks_v1_namespace(): void {
		$reflection = new \ReflectionClass( $this->controller );
		$prop       = $reflection->getProperty( 'namespace' );
		$prop->setAccessible( true );

		self::assertSame( 'goblocks/v1', $prop->getValue( $this->controller ) );
	}
}
