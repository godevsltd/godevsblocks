<?php
namespace GoBlocks\Tests\Unit\DynamicContent;

use GoBlocks\DynamicContent\TagSecurity;
use GoBlocks\DynamicContent\TagInterface;
use GoBlocks\Tests\TestCase;
use Brain\Monkey\Functions;
use Mockery;

/**
 * Unit tests for DynamicContent\TagSecurity.
 *
 * Uses Mockery to build minimal TagInterface implementations, then exercises
 * all four validation gates: option allowlist, type checking, capability, context.
 */
class TagSecurityTest extends TestCase {

	/**
	 * Build a mock TagInterface with the given configuration.
	 *
	 * @param  string   $slug     Tag slug.
	 * @param  array[]  $options  Option declarations.
	 * @param  string[] $contexts Allowed contexts.
	 * @return TagInterface&\Mockery\MockInterface
	 */
	private function make_tag( string $slug, array $options = [], array $contexts = [ 'any' ] ): TagInterface {
		$tag = Mockery::mock( TagInterface::class );
		$tag->allows( 'get_slug' )->andReturn( $slug );
		$tag->allows( 'get_options' )->andReturn( $options );
		$tag->allows( 'get_contexts' )->andReturn( $contexts );
		return $tag;
	}

	// ── Happy path ───────────────────────────────────────────────────────────

	public function test_valid_tag_with_no_options_passes(): void {
		$tag = $this->make_tag( 'post_title' );

		self::assertTrue( TagSecurity::validate( $tag, [], [] ) );
	}

	public function test_valid_tag_with_declared_string_option_passes(): void {
		$tag = $this->make_tag( 'post_meta', [
			[ 'key' => 'key', 'type' => 'string', 'default' => '', 'description' => '' ],
		] );

		self::assertTrue( TagSecurity::validate( $tag, [ 'key' => 'my_field' ], [] ) );
	}

	public function test_valid_tag_with_declared_int_option_passes(): void {
		$tag = $this->make_tag( 'post_excerpt', [
			[ 'key' => 'words', 'type' => 'int', 'default' => 55, 'description' => '' ],
		] );

		self::assertTrue( TagSecurity::validate( $tag, [ 'words' => '100' ], [] ) );
	}

	public function test_valid_tag_with_bool_option_passes(): void {
		$tag = $this->make_tag( 'post_date', [
			[ 'key' => 'relative', 'type' => 'bool', 'default' => false, 'description' => '' ],
		] );

		foreach ( [ '0', '1', 'true', 'false', 'yes', 'no' ] as $value ) {
			self::assertTrue(
				TagSecurity::validate( $tag, [ 'relative' => $value ], [] ),
				"Bool value '$value' should be valid"
			);
		}
	}

	// ── Option allowlist gate ─────────────────────────────────────────────────

	public function test_unknown_option_key_is_rejected(): void {
		$tag = $this->make_tag( 'post_title' ); // declares no options

		self::assertFalse( TagSecurity::validate( $tag, [ 'evil_param' => 'value' ], [] ) );
	}

	public function test_undeclared_option_key_is_rejected_when_others_declared(): void {
		$tag = $this->make_tag( 'post_meta', [
			[ 'key' => 'key', 'type' => 'string', 'default' => '', 'description' => '' ],
		] );

		self::assertFalse( TagSecurity::validate( $tag, [ 'key' => 'ok', 'extra' => 'bad' ], [] ) );
	}

	// ── Type-check gate ───────────────────────────────────────────────────────

	public function test_non_numeric_int_option_is_rejected(): void {
		$tag = $this->make_tag( 'post_excerpt', [
			[ 'key' => 'words', 'type' => 'int', 'default' => 55, 'description' => '' ],
		] );

		self::assertFalse( TagSecurity::validate( $tag, [ 'words' => 'fifty' ], [] ) );
	}

	public function test_invalid_bool_string_is_rejected(): void {
		$tag = $this->make_tag( 'post_date', [
			[ 'key' => 'relative', 'type' => 'bool', 'default' => false, 'description' => '' ],
		] );

		self::assertFalse( TagSecurity::validate( $tag, [ 'relative' => 'maybe' ], [] ) );
	}

	public function test_null_byte_in_string_option_is_rejected(): void {
		$tag = $this->make_tag( 'post_meta', [
			[ 'key' => 'key', 'type' => 'string', 'default' => '', 'description' => '' ],
		] );

		self::assertFalse( TagSecurity::validate( $tag, [ 'key' => "my_\0field" ], [] ) );
	}

	// ── Capability gate ───────────────────────────────────────────────────────

	public function test_user_meta_tag_rejected_when_not_logged_in(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$tag = $this->make_tag( 'user_meta' );

		self::assertFalse( TagSecurity::validate( $tag, [], [] ) );
	}

	public function test_user_meta_tag_allowed_when_logged_in(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$tag = $this->make_tag( 'user_meta' );

		self::assertTrue( TagSecurity::validate( $tag, [], [ 'any' ] ) );
	}

	public function test_non_user_meta_tag_passes_capability_without_login_check(): void {
		// is_user_logged_in should NOT be called for a generic tag.
		$tag = $this->make_tag( 'post_title' );

		self::assertTrue( TagSecurity::validate( $tag, [], [] ) );
	}

	// ── Context gate ──────────────────────────────────────────────────────────

	public function test_any_context_always_passes(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'any' ] );

		self::assertTrue( TagSecurity::validate( $tag, [], [ 'is_loop' => false ] ) );
		self::assertTrue( TagSecurity::validate( $tag, [], [ 'is_loop' => true ] ) );
	}

	public function test_loop_context_required_fails_outside_loop(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'loop' ] );

		self::assertFalse( TagSecurity::validate( $tag, [], [ 'is_loop' => false ] ) );
	}

	public function test_loop_context_required_passes_inside_loop(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'loop' ] );

		self::assertTrue( TagSecurity::validate( $tag, [], [ 'is_loop' => true ] ) );
	}

	public function test_single_context_passes_with_post_id(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'single' ] );

		self::assertTrue( TagSecurity::validate( $tag, [], [ 'post_id' => 5, 'is_loop' => false ] ) );
	}

	public function test_single_context_fails_without_post_id(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'single' ] );

		self::assertFalse( TagSecurity::validate( $tag, [], [ 'post_id' => 0, 'is_loop' => false ] ) );
	}

	public function test_archive_context_passes_on_archive(): void {
		$tag = $this->make_tag( 'archive_title', [], [ 'archive' ] );

		self::assertTrue( TagSecurity::validate( $tag, [], [ 'is_archive' => true ] ) );
	}

	public function test_archive_context_fails_on_single(): void {
		$tag = $this->make_tag( 'archive_title', [], [ 'archive' ] );

		self::assertFalse( TagSecurity::validate( $tag, [], [ 'post_id' => 3, 'is_archive' => false ] ) );
	}

	public function test_tag_with_multiple_valid_contexts_passes_when_one_matches(): void {
		$tag = $this->make_tag( 'post_title', [], [ 'single', 'loop' ] );

		// Should pass in a loop even though single is also listed.
		self::assertTrue( TagSecurity::validate( $tag, [], [ 'is_loop' => true ] ) );
	}
}
