<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\Counter;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\Counter.
 *
 * Covers: basic render, unique-ID class, empty-uniqueId early return,
 * global classes, and animation class pass-through.
 */
class CounterTest extends TestCase {

	private Counter $block;

	protected function setUp(): void {
		parent::setUp();
		$this->block = new Counter();
	}

	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name(): void {
		self::assertSame( 'counter', $this->block->get_name() );
	}

	// ── Basic render ─────────────────────────────────────────────────────────

	public function test_render_outputs_block_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01' ],
			[
		'endNumber' => 100,
		'startNumber' => 0,
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-counter', $html );
		self::assertStringContainsString( 'gb-counter-test01', $html );
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
		'endNumber' => 100,
		'startNumber' => 0,
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
		'endNumber' => 100,
		'startNumber' => 0,
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-anim-fade-in', $html );
	}
}