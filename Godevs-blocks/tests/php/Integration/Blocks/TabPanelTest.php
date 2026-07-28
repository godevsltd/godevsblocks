<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\TabPanel;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\TabPanel.
 *
 * Covers: basic render, unique-ID class, empty-uniqueId early return,
 * global classes, and animation class pass-through.
 */
class TabPanelTest extends TestCase {

	private TabPanel $block;

	protected function setUp(): void {
		parent::setUp();
		$this->block = new TabPanel();
	}

	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name(): void {
		self::assertSame( 'tab-panel', $this->block->get_name() );
	}

	// ── Basic render ─────────────────────────────────────────────────────────

	public function test_render_outputs_block_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01' ],
			[
			]
		);

		$html = $this->block->render( $attrs, '<p>Inner</p>', $this->make_block() );

		self::assertStringContainsString( 'gb-tab-panel', $html );
		self::assertStringContainsString( 'gb-tab-panel-test01', $html );
	}

	// ── Empty uniqueId early return ───────────────────────────────────────────

	public function test_render_returns_content_when_unique_id_empty(): void {
		$html = $this->block->render( [ 'uniqueId' => '' ], '<p>Inner</p>', $this->make_block() );

		self::assertSame( '<p>Inner</p>', $html );
	}

	public function test_render_returns_content_when_unique_id_missing(): void {
		$html = $this->block->render( [], '<p>Inner</p>', $this->make_block() );

		self::assertSame( '<p>Inner</p>', $html );
	}

	// ── Global classes ────────────────────────────────────────────────────────

	public function test_render_includes_global_classes(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01gc', 'globalClasses' => [ 'my-class' ] ],
			[
			]
		);

		$html = $this->block->render( $attrs, '<p>Inner</p>', $this->make_block() );

		self::assertStringContainsString( 'my-class', $html );
	}

	// ── Animation class ───────────────────────────────────────────────────────

	public function test_render_includes_animation_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01an', 'animationClass' => 'gb-anim-fade-in' ],
			[
			]
		);

		$html = $this->block->render( $attrs, '<p>Inner</p>', $this->make_block() );

		self::assertStringContainsString( 'gb-anim-fade-in', $html );
	}
}