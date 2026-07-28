<?php
/**
 * Abstract Singleton base class.
 *
 * @package GoBlocks\Utils
 */

namespace GoBlocks\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Provides a single shared instance per concrete subclass.
 *
 * Usage:
 *   class MyService extends Singleton {
 *       public function do_something(): void { ... }
 *   }
 *   MyService::get_instance()->do_something();
 */
abstract class Singleton {

	/**
	 * Map of class name → instance.
	 *
	 * @var array<string, static>
	 */
	private static array $instances = array();

	/**
	 * Prevent direct instantiation.
	 */
	protected function __construct() {}

	/**
	 * Prevent cloning.
	 */
	private function __clone() {}

	/**
	 * Prevent unserialization.
	 *
	 * @throws \RuntimeException Always.
	 */
	public function __wakeup(): void {
		throw new \RuntimeException( 'Cannot unserialize a singleton.' );
	}

	/**
	 * Return the single instance of the calling class.
	 *
	 * @return static
	 */
	final public static function get_instance(): static {
		$class = static::class;

		if ( ! isset( self::$instances[ $class ] ) ) {
			self::$instances[ $class ] = new static();
		}

		return self::$instances[ $class ];
	}
}
