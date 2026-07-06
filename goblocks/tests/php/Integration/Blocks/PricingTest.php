<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\Pricing;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\Pricing.
 *
 * Covers: basic render, unique-ID class, empty-uniqueId early return,
 * global classes, and animation class pass-through.
 */
class PricingTest extends TestCase {

	private Pricing $block;

	protected function setUp(): void {
		parent::setUp();
		$this->block = new Pricing();
	}

	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name(): void {
		self::assertSame( 'pricing', $this->block->get_name() );
	}

	// ── Basic render ─────────────────────────────────────────────────────────

	public function test_render_outputs_block_class(): void {
		$attrs = array_merge(
			[ 'uniqueId' => 'test01' ],
			[
		'price' => '49',
		'currency' => '$',
		'planName' => 'Pro',
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-pricing', $html );
		self::assertStringContainsString( 'gb-pricing-test01', $html );
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
		'price' => '49',
		'currency' => '$',
		'planName' => 'Pro',
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
		'price' => '49',
		'currency' => '$',
		'planName' => 'Pro',
			]
		);

		$html = $this->block->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-anim-fade-in', $html );
	}
}