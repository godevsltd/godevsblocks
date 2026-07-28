<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\SocialShare;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\SocialShare.
 *
 * Covers: basic render, unique-ID class, empty-uniqueId early return,
 * global classes, and animation class pass-through.
 */
class SocialShareTest extends TestCase {

	private SocialShare $block;

	protected function setUp(): void {
		parent::setUp();
		$this->block = new SocialShare();
	}

	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name(): void {
		self::assertSame( 'social-share', $this->block->get_name() );
	}

	// ── Basic render ─────────────────────────────────────────────────────────

	public function test_render_outputs_block_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01' ],
			[
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-social-share', $html );
		self::assertStringContainsString( 'gb-social-share-test01', $html );
	}

	// ── Empty uniqueId early return ───────────────────────────────────────────

	public function test_render_returns_content_when_unique_id_empty(): void {
		$html = $this->block->render( [ 'uniqueId' => '' ], '', $this->make_block() );

		self::assertSame( '', $html );
	}

	public function test_render_returns_content_when_unique_id_missing(): void {
		$html = $this->block->render( [], '', $this->make_block() );

		self::assertSame( '', $html );
	}

	// ── Global classes ────────────────────────────────────────────────────────

	public function test_render_includes_global_classes(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01gc', 'globalClasses' => [ 'my-class' ] ],
			[
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'my-class', $html );
	}

	// ── Animation class ───────────────────────────────────────────────────────

	public function test_render_includes_animation_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01an', 'animationClass' => 'gb-anim-fade-in' ],
			[
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-anim-fade-in', $html );
	}
}