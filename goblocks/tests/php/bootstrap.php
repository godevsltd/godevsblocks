<?php
/**
 * PHPUnit bootstrap for GoBlocks tests.
 *
 * Loads the Composer autoloader (brings in Brain\Monkey, Mockery, and all
 * GoBlocks classes), defines WP constants, and stubs the minimal WP classes
 * that our code instantiates directly (WP_Error, WP_Block).
 *
 * WP functions are NOT stubbed here — each TestCase registers them via
 * Brain\Monkey in setUp(), so expectations can vary per test.
 */

require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

// ── WordPress constants ──────────────────────────────────────────────────────

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/tmp/wp-goblocks-tests/' );
}

define( 'WPINC',            'wp-includes' );
define( 'GOBLOCKS_DIR',     dirname( __DIR__, 2 ) . DIRECTORY_SEPARATOR );
define( 'GOBLOCKS_URL',     'https://example.org/wp-content/plugins/goblocks/' );
define( 'GOBLOCKS_BUILD_DIR', GOBLOCKS_DIR . 'build' . DIRECTORY_SEPARATOR );
define( 'GOBLOCKS_VERSION', '1.0.0-test' );

// ── Minimal WP class stubs ───────────────────────────────────────────────────

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		public string $code;
		public string $message;
		public mixed  $data;

		public function __construct(
			string $code    = '',
			string $message = '',
			mixed  $data    = ''
		) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}

		public function get_error_code(): string {
			return $this->code;
		}

		public function get_error_message(): string {
			return $this->message;
		}
	}
}

if ( ! class_exists( 'WP_Block' ) ) {
	class WP_Block {
		/** @var array<string, mixed> */
		public array $parsed_block = [];

		/** @var array<string, mixed> */
		public array $context = [];

		/** @var WP_Block[] */
		public array $inner_blocks = [];
	}
}

if ( ! class_exists( 'WP_REST_Response' ) ) {
	class WP_REST_Response {
		public mixed $data;
		public int   $status;

		public function __construct( mixed $data = null, int $status = 200 ) {
			$this->data   = $data;
			$this->status = $status;
		}

		public function get_data(): mixed {
			return $this->data;
		}

		public function get_status(): int {
			return $this->status;
		}
	}
}

if ( ! class_exists( 'WP_REST_Request' ) ) {
	class WP_REST_Request {
		/** @var array<string, mixed>|null */
		private ?array $json_params = array();

		/** @param array<string, mixed> $params */
		public function set_json_params( array $params ): void {
			$this->json_params = $params;
		}

		/** @return array<string, mixed>|null */
		public function get_json_params(): ?array {
			return $this->json_params;
		}
	}
}

if ( ! class_exists( 'WP_REST_Controller' ) ) {
	abstract class WP_REST_Controller {
		abstract public function register_routes(): void;
	}
}

if ( ! class_exists( 'WP_Query' ) ) {
	class WP_Query {
		public int $found_posts = 0;
	}
}
