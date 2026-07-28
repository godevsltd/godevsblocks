<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\Box;
use GoBlocks\Tests\TestCase;
use Brain\Monkey\Functions;

/**
 * Integration tests for Blocks\Box.
 *
 * Tests render() with a real Box instance and mocked WP escaping functions,
 * covering: basic rendering, empty uniqueId early return, tagName selection,
 * link mode (tagName=a), ARIA label, and animation class.
 */
class BoxTest extends TestCase {

	private Box $box;

	protected function setUp(): void {
		parent::setUp();
		$this->box = new Box();
	}

	/** @return \WP_Block */
	private function make_block(): \WP_Block {
		return new \WP_Block();
	}

	// ── Basic rendering ───────────────────────────────────────────────────────

	public function test_render_returns_div_wrapper_with_correct_classes(): void {
		$attrs   = [ 'uniqueId' => 'abc123' ];
		$content = '<p>Hello</p>';

		$html = $this->box->render( $attrs, $content, $this->make_block() );

		self::assertStringContainsString( '<div', $html );
		self::assertStringContainsString( 'gb-box-abc123', $html );
		self::assertStringContainsString( 'gb-box', $html );
		self::assertStringContainsString( $content, $html );
		self::assertStringContainsString( '</div>', $html );
	}

	public function test_render_returns_content_only_when_unique_id_empty(): void {
		$attrs   = [ 'uniqueId' => '' ];
		$content = '<p>Fallback</p>';

		$html = $this->box->render( $attrs, $content, $this->make_block() );

		self::assertSame( $content, $html );
	}

	public function test_render_returns_content_only_when_unique_id_missing(): void {
		$content = '<p>No ID</p>';

		$html = $this->box->render( [], $content, $this->make_block() );

		self::assertSame( $content, $html );
	}

	// ── tagName selection ─────────────────────────────────────────────────────

	public function test_render_uses_section_tag_when_specified(): void {
		$attrs = [ 'uniqueId' => 'sec01', 'tagName' => 'section' ];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringStartsWith( '<section', $html );
		self::assertStringContainsString( '</section>', $html );
	}

	public function test_render_falls_back_to_div_for_unknown_tag(): void {
		$attrs = [ 'uniqueId' => 'xx01', 'tagName' => 'script' ];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringStartsWith( '<div', $html );
	}

	public function test_render_falls_back_to_div_when_tag_name_missing(): void {
		$attrs = [ 'uniqueId' => 'xx02' ];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringStartsWith( '<div', $html );
	}

	// ── Global classes ────────────────────────────────────────────────────────

	public function test_render_includes_global_classes(): void {
		$attrs = [
			'uniqueId'      => 'gc01',
			'globalClasses' => [ 'my-custom-class', 'another-class' ],
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'my-custom-class', $html );
		self::assertStringContainsString( 'another-class', $html );
	}

	// ── Link mode ─────────────────────────────────────────────────────────────

	public function test_render_link_mode_outputs_anchor_element(): void {
		$attrs = [
			'uniqueId'   => 'lnk01',
			'tagName'    => 'a',
			'link'       => 'https://example.com',
			'linkTarget' => '_self',
		];

		$html = $this->box->render( $attrs, 'Click me', $this->make_block() );

		self::assertStringStartsWith( '<a', $html );
		self::assertStringContainsString( 'href="https://example.com"', $html );
		self::assertStringContainsString( 'target="_self"', $html );
		self::assertStringContainsString( '</a>', $html );
	}

	public function test_render_link_mode_blank_target_adds_noopener(): void {
		$attrs = [
			'uniqueId'   => 'lnk02',
			'tagName'    => 'a',
			'link'       => 'https://example.com',
			'linkTarget' => '_blank',
			'linkRel'    => '',
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'noopener', $html );
		self::assertStringContainsString( 'noreferrer', $html );
	}

	public function test_render_link_mode_invalid_target_falls_back_to_self(): void {
		$attrs = [
			'uniqueId'   => 'lnk03',
			'tagName'    => 'a',
			'link'       => 'https://example.com',
			'linkTarget' => '_top', // not in allowlist
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'target="_self"', $html );
	}

	// ── ARIA label ────────────────────────────────────────────────────────────

	public function test_render_outputs_aria_label_when_set(): void {
		$attrs = [
			'uniqueId'  => 'aria01',
			'ariaLabel' => 'Main content wrapper',
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'aria-label=', $html );
		self::assertStringContainsString( 'Main content wrapper', $html );
	}

	public function test_render_omits_aria_label_when_empty(): void {
		$attrs = [ 'uniqueId' => 'aria02', 'ariaLabel' => '' ];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringNotContainsString( 'aria-label', $html );
	}

	// ── Animation class ───────────────────────────────────────────────────────

	public function test_render_includes_animation_class_when_set(): void {
		$attrs = [
			'uniqueId'       => 'anim01',
			'animationClass' => 'gb-animate-fade-in',
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'gb-animate-fade-in', $html );
	}

	// ── Custom HTML attributes ────────────────────────────────────────────────

	public function test_render_outputs_custom_data_attribute(): void {
		$attrs = [
			'uniqueId'       => 'da01',
			'htmlAttributes' => [ 'data-section' => 'hero' ],
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringContainsString( 'data-section="hero"', $html );
	}

	public function test_render_strips_on_event_handler_from_html_attributes(): void {
		$attrs = [
			'uniqueId'       => 'ev01',
			'htmlAttributes' => [ 'onclick' => 'alert(1)' ],
		];

		$html = $this->box->render( $attrs, '', $this->make_block() );

		self::assertStringNotContainsString( 'onclick', $html );
		self::assertStringNotContainsString( 'alert(1)', $html );
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name_returns_box(): void {
		self::assertSame( 'box', $this->box->get_name() );
	}
}
