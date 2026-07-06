<?php
/**
 * Rest Controller.
 *
 * @package GoBlocks\REST
 */

namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

/**
 * Abstract base REST controller for GoBlocks endpoints.
 *
 * All REST controllers in GoBlocks extend this class rather than
 * WP_REST_Controller directly, so shared logic (namespace, version,
 * response helpers) lives in one place.
 */
abstract class RestController extends \WP_REST_Controller {

	/**
	 * REST API namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'goblocks/v1';

	// ── Response helpers ──────────────────────────────────────────────────.

	/**
	 * Return a success response.
	 *
	 * @param mixed $data    Response data.
	 * @param int   $status  HTTP status code. Default 200.
	 * @return \WP_REST_Response
	 */
	protected function success( $data, int $status = 200 ): \WP_REST_Response {
		return new \WP_REST_Response( $data, $status );
	}

	/**
	 * Return an error response.
	 *
	 * @param string $code    Error code slug.
	 * @param string $message Human-readable message.
	 * @param int    $status  HTTP status code.
	 * @return \WP_Error
	 */
	protected function error( string $code, string $message, int $status = 400 ): \WP_Error {
		return new \WP_Error(
			$code,
			$message,
			array( 'status' => $status )
		);
	}

	// ── Permission callbacks ──────────────────────────────────────────────.

	/**
	 * Permission callback: requires manage_options (admins only).
	 * Use for write endpoints that affect plugin-wide settings.
	 *
	 * @return bool|\WP_Error
	 */
	public function require_manage_options(): bool|\WP_Error {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'goblocks_forbidden',
				__( 'You do not have permission to perform this action.', 'goblocks' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}

	/**
	 * Permission callback: requires edit_posts.
	 * Use for read endpoints that expose draft / private content.
	 *
	 * @return bool|\WP_Error
	 */
	public function require_edit_posts(): bool|\WP_Error {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'goblocks_forbidden',
				__( 'You do not have permission to perform this action.', 'goblocks' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}
}
