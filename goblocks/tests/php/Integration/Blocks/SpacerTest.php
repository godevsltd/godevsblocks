<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\Spacer;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\Spacer.
 *
 * Spacer renders a <div> with role="presentation" and aria-hidden="true".
 * Visual height is handled by the CssEngine; PHP outputs structure + classes.
 */
class SpacerTest extends TestCase {

	private Spacer $spacer;

	protected function setUp(): void {
		parent::setUp();
		$this->spacer = new Spacer();
	}

	/** @return \WP_Block */
	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── Basic rendering ───────────────────────────────────────────────────────

	public function test_render_outputs_div_element(): void {
		$html = $this->spacer->render( [ 'uniqueId' => 'sp01' ], '', $this->make_block() );

		self::assertStringContainsString( '<div', $html );
		self::assertStringContainsString( '</div>', $html );
	}

	public function test_render_includes_base_class(): void {
		$html = $this->spacer->render( [ 'uniqueId' => 'sp02' ], '', $this->make_block() );

		self::assertStringContainsString( 'gb-spacer', $html );
	}

	public function test_render_includes_instance_class_with_unique_id(): void {
		$html = $this->spacer->render( [ 'uniqueId' => 'xyz789' ], '', $this->make_block() );

		self::assertStringContainsString( 'gb-spacer-xyz789', $html );
	}

	// ── Accessibility attributes ──────────────────────────────────────────────

	public function test_render_has_presentation_role(): void {
		$html = $this->spacer->render( [ 'uniqueId' => 'a11y01' ], '', $this->make_block() );

		self::assertStringContainsString( 'role="presentation"', $html );
	}

	public function test_render_has_aria_hidden_true(): void {
		$html = $this->spacer->render( [ 'uniqueId' => 'a11y02' ], '', $this->make_block() );

		self::assertStringContainsString( 'aria-hidden="true"', $html );
	}

	// ── Empty uniqueId ────────────────────────────────────────────────────────

	public function test_render_still_produces_div_when_unique_id_is_empty(): void {
		$html = $this->spacer->render( [ 'uniqueId' => '' ], '', $this->make_block() );

		self::assertStringContainsString( '<div', $html );
		self::assertStringContainsString( 'gb-spacer', $html );
		self::assertStringNotContainsString( 'gb-spacer-', $html );
	}

	// ── Global classes ────────────────────────────────────────────────────────

	public function test_render_includes_global_classes(): void {
		$attrs = [
			'uniqueId'      => 'gc01',
			'globalClasses' => [ 'section-gap', 'large' ],
		];

		$html = $this->spacer->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'section-gap', $html );
		self::assertStringContainsString( 'large', $html );
	}

	// ── Content is ignored ────────────────────────────────────────────────────

	public function test_render_ignores_inner_content(): void {
		$html = $this->spacer->render(
			[ 'uniqueId' => 'ic01' ],
			'<p>Should not appear</p>',
			$this->make_block()
		);

		self::assertStringNotContainsString( 'Should not appear', $html );
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name_returns_spacer(): void {
		self::assertSame( 'spacer', $this->spacer->get_name() );
	}
}
