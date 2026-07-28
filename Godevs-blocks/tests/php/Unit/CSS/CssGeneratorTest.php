<?php
namespace GoBlocks\Tests\Unit\CSS;

use GoBlocks\CSS\CssGenerator;
use GoBlocks\Tests\TestCase;

/**
 * Unit tests for CssGenerator.
 *
 * minify(), flip_rtl(), and collect_from_blocks() are pure PHP — no WP
 * functions are called, so these tests need no mocking beyond what the base
 * TestCase provides.
 */
class CssGeneratorTest extends TestCase {

	// ── minify() ─────────────────────────────────────────────────────────────

	public function test_minify_empty_string_returns_empty(): void {
		self::assertSame( '', CssGenerator::minify( '' ) );
	}

	public function test_minify_strips_comments(): void {
		$result = CssGenerator::minify( '/* This is a comment */ .foo { color: red; }' );
		self::assertStringNotContainsString( '/*', $result );
		self::assertStringContainsString( '.foo', $result );
	}

	public function test_minify_collapses_whitespace(): void {
		$result = CssGenerator::minify( ".foo   {   color :   red  ;   }\n" );
		self::assertStringContainsString( '.foo{', $result );
		self::assertStringContainsString( 'color:red', $result );
	}

	public function test_minify_removes_trailing_semicolons_before_brace(): void {
		$result = CssGenerator::minify( '.foo { color: red; }' );
		self::assertStringNotContainsString( ';}', $result );
		self::assertStringContainsString( 'color:red}', $result );
	}

	public function test_minify_removes_units_from_zero_values(): void {
		$result = CssGenerator::minify( '.foo { margin: 0px; padding: 0rem; }' );
		self::assertStringNotContainsString( '0px', $result );
		self::assertStringNotContainsString( '0rem', $result );
		self::assertStringContainsString( 'margin:0', $result );
	}

	public function test_minify_removes_leading_zeros(): void {
		$result = CssGenerator::minify( '.foo { opacity: 0.5; }' );
		self::assertStringContainsString( 'opacity:.5', $result );
	}

	public function test_minify_preserves_non_zero_values(): void {
		$result = CssGenerator::minify( '.foo { font-size: 16px; }' );
		self::assertStringContainsString( 'font-size:16px', $result );
	}

	// ── flip_rtl() ───────────────────────────────────────────────────────────

	public function test_flip_rtl_swaps_margin_left_right(): void {
		$css    = '.foo{margin-left:10px;margin-right:20px;}';
		$result = CssGenerator::flip_rtl( $css );
		self::assertStringContainsString( 'margin-right:10px', $result );
		self::assertStringContainsString( 'margin-left:20px', $result );
	}

	public function test_flip_rtl_swaps_padding_left_right(): void {
		$css    = '.foo{padding-left:8px;padding-right:4px;}';
		$result = CssGenerator::flip_rtl( $css );
		self::assertStringContainsString( 'padding-right:8px', $result );
		self::assertStringContainsString( 'padding-left:4px', $result );
	}

	public function test_flip_rtl_swaps_text_align_left_right(): void {
		$ltr = '.foo{text-align:left;}';
		self::assertStringContainsString( 'text-align:right', CssGenerator::flip_rtl( $ltr ) );

		$rtl_input = '.foo{text-align:right;}';
		self::assertStringContainsString( 'text-align:left', CssGenerator::flip_rtl( $rtl_input ) );
	}

	public function test_flip_rtl_swaps_position_left_right(): void {
		$css    = '.foo{left:0;right:auto;}';
		$result = CssGenerator::flip_rtl( $css );
		self::assertStringContainsString( 'right:0', $result );
		self::assertStringContainsString( 'left:auto', $result );
	}

	// ── collect_from_blocks() ─────────────────────────────────────────────────

	public function test_collect_from_blocks_returns_empty_for_no_blocks(): void {
		self::assertSame( '', CssGenerator::collect_from_blocks( [] ) );
	}

	public function test_collect_from_blocks_extracts_generated_css(): void {
		$blocks = [
			[
				'blockName'   => 'goblocks/box',
				'attrs'       => [ 'generatedCss' => '.gb-box-abc123{display:flex;}' ],
				'innerBlocks' => [],
			],
		];

		$result = CssGenerator::collect_from_blocks( $blocks );
		self::assertStringContainsString( '.gb-box-abc123', $result );
	}

	public function test_collect_from_blocks_skips_non_goblocks_blocks(): void {
		$blocks = [
			[
				'blockName'   => 'core/paragraph',
				'attrs'       => [ 'generatedCss' => '.should-not-appear{color:red;}' ],
				'innerBlocks' => [],
			],
		];

		$result = CssGenerator::collect_from_blocks( $blocks );
		self::assertSame( '', $result );
	}

	public function test_collect_from_blocks_recurses_into_inner_blocks(): void {
		$blocks = [
			[
				'blockName' => 'goblocks/grid',
				'attrs'     => [ 'generatedCss' => '.gb-grid-root{display:grid;}' ],
				'innerBlocks' => [
					[
						'blockName'   => 'goblocks/box',
						'attrs'       => [ 'generatedCss' => '.gb-box-inner{flex:1;}' ],
						'innerBlocks' => [],
					],
				],
			],
		];

		$result = CssGenerator::collect_from_blocks( $blocks );
		self::assertStringContainsString( '.gb-grid-root', $result );
		self::assertStringContainsString( '.gb-box-inner', $result );
	}

	public function test_collect_from_blocks_deduplicates_identical_selectors(): void {
		$css = '.gb-box-abc{color:red;} .gb-box-abc{color:blue;}';
		// Two blocks with the same selector but different values — later wins.
		$blocks = [
			[
				'blockName'   => 'goblocks/box',
				'attrs'       => [ 'generatedCss' => '.gb-box-abc{color:red;}' ],
				'innerBlocks' => [],
			],
			[
				'blockName'   => 'goblocks/box',
				'attrs'       => [ 'generatedCss' => '.gb-box-abc{color:blue;}' ],
				'innerBlocks' => [],
			],
		];

		$result = CssGenerator::collect_from_blocks( $blocks );
		// Only one .gb-box-abc block in output; later value wins.
		self::assertSame( 1, substr_count( $result, '.gb-box-abc' ) );
		self::assertStringContainsString( 'color:blue', $result );
	}

	public function test_collect_from_blocks_skips_empty_generated_css(): void {
		$blocks = [
			[
				'blockName'   => 'goblocks/box',
				'attrs'       => [ 'generatedCss' => '' ],
				'innerBlocks' => [],
			],
		];

		self::assertSame( '', CssGenerator::collect_from_blocks( $blocks ) );
	}

	public function test_collect_from_blocks_recurses_through_non_goblocks_parent(): void {
		$blocks = [
			[
				'blockName'   => 'core/group',
				'attrs'       => [],
				'innerBlocks' => [
					[
						'blockName'   => 'goblocks/text',
						'attrs'       => [ 'generatedCss' => '.gb-text-x{font-size:16px;}' ],
						'innerBlocks' => [],
					],
				],
			],
		];

		$result = CssGenerator::collect_from_blocks( $blocks );
		self::assertStringContainsString( '.gb-text-x', $result );
	}
}
