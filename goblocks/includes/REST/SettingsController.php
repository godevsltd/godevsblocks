<?php
/**
 * Settings Controller.
 *
 * @package GoBlocks\REST
 */

namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Settings\SettingsStore;
use GoBlocks\Settings\Schema;

/**
 * REST controller for GoBlocks plugin settings.
 *
 * Routes:
 *   GET  /goblocks/v1/settings        → retrieve all settings
 *   POST /goblocks/v1/settings        → update one or more settings
 *   POST /goblocks/v1/settings/reset  → reset all settings to defaults
 */
class SettingsController extends RestController {

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'require_manage_options' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'require_manage_options' ),
					'args'                => $this->get_update_args(),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/reset',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'reset_settings' ),
				'permission_callback' => array( $this, 'require_manage_options' ),
			)
		);
	}

	/**
	 * GET /goblocks/v1/settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings(): \WP_REST_Response {
		return $this->success( SettingsStore::all() );
	}

	/**
	 * POST /goblocks/v1/settings
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_settings( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$body = $request->get_json_params();

		if ( ! is_array( $body ) ) {
			return $this->error(
				'goblocks_invalid_body',
				__( 'Request body must be a JSON object.', 'goblocks' )
			);
		}

		$result = SettingsStore::save( $body );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $this->success(
			array(
				'saved'    => true,
				'settings' => SettingsStore::all(),
			)
		);
	}

	/**
	 * POST /goblocks/v1/settings/reset
	 *
	 * @return \WP_REST_Response
	 */
	public function reset_settings(): \WP_REST_Response {
		SettingsStore::reset();

		return $this->success(
			array(
				'reset'    => true,
				'settings' => SettingsStore::all(),
			)
		);
	}

	/**
	 * Schema for POST /settings request args.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function get_update_args(): array {
		$schema = Schema::get();
		$args   = array();

		foreach ( $schema as $key => $definition ) {
			$arg = array(
				'required' => false,
			);

			if ( isset( $definition['type'] ) ) {
				$arg['type'] = $definition['type'];
			}
			if ( isset( $definition['enum'] ) ) {
				$arg['enum'] = $definition['enum'];
			}
			if ( isset( $definition['min'] ) ) {
				$arg['minimum'] = $definition['min'];
			}
			if ( isset( $definition['max'] ) ) {
				$arg['maximum'] = $definition['max'];
			}

			$args[ $key ] = $arg;
		}

		return $args;
	}
}
