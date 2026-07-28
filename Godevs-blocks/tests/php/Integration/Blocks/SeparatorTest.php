<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\Separator;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\Separator.
 *
 * Separator always renders an <hr>. When uniqueId is present it adds the
 * instance class (gb-separator-{id}); the base class gb-separator is always
 * present. Unlike container blocks, an empty uniqueId still produces output.
 */
class SeparatorTest extends TestCase {

	private Separator $separator;

	protected function setUp(): void {
		parent::setUp();
		$this->separator = new Separator();
	}

	/** @return \WP_Block */
	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── Basic rendering ───────────────────────────────────────────────────────

	public function test_render_outputs_hr_element(): void {
		$html = $this->separator->render( [ 'uniqueId' => 'sep01' ], '', $this->make_block() );

		self::assertStringContainsString( '<hr', $html );
		self::assertStringContainsString( '/>', $html );
	}

	public function test_render_always_includes_base_class(): void {
		$html = $this->separator->render( [ 'uniqueId' => 'sep02' ], '', $this->make_block() );

		self::assertStringContainsString( 'gb-separator', $html );
	}

	public function test_render_includes_instance_class_with_unique_id(): void {
		$html = $this->separator->render( [ 'uniqueId' => 'abc123' ], '', $this->make_block() );

		self::assertStringContainsString( 'gb-separator-abc123', $html );
	}

	public function test_render_still_produces_hr_when_unique_id_is_empty(): void {
		$html = $this->separator->render( [ 'uniqueId' => '' ], '', $this->make_block() );

		self::assertStringContainsString( '<hr', $html );
		self::assertStringContainsString( 'gb-separator', $html );
		self::assertStringNotContainsString( 'gb-separator-', $html );
	}

	public function test_render_still_produces_hr_when_unique_id_is_missing(): void {
		$html = $this->separator->render( [], '', $this->make_block() );

		self::assertStringContainsString( '<hr', $html );
	}

	// ── Global classes ────────────────────────────────────────────────────────

	public function test_render_includes_global_classes(): void {
		$attrs = [
			'uniqueId'      => 'gc01',
			'globalClasses' => [ 'my-divider', 'thick' ],
		];

		$html = $this->separator->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'my-divider', $html );
		self::assertStringContainsString( 'thick', $html );
	}

	// ── Content is ignored ────────────────────────────────────────────────────

	public function test_render_ignores_inner_content(): void {
		$html = $this->separator->render(
			[ 'uniqueId' => 'ic01' ],
			'<p>Ignored</p>',
			$this->make_block()
		);

		self::assertStringNotContainsString( 'Ignored', $html );
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name_returns_separator(): void {
		self::assertSame( 'separator', $this->separator->get_name() );
	}
}
