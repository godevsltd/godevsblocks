<?php
namespace GoBlocks\Tests\Integration\Blocks;

use GoBlocks\Blocks\QueryLoop;
use GoBlocks\Blocks\QueryNoResults;
use GoBlocks\Tests\TestCase;

/**
 * Integration tests for Blocks\QueryNoResults.
 *
 * QueryNoResults reads the WP_Query registered by the sibling QueryLoop block
 * via QueryLoop::$queries (private static). Tests inject into that static map
 * via reflection so QueryLoop itself does not need to run.
 *
 * Boundary cases:
 *  - No queryId in block context          → empty string
 *  - queryId present but no query stored  → empty string
 *  - Query has posts (found_posts > 0)    → empty string
 *  - Query has no posts (found_posts = 0) → wrapper div + inner content
 */
class QueryNoResultsTest extends TestCase {

	private QueryNoResults $block;

	/** @var \ReflectionProperty */
	private \ReflectionProperty $queries_prop;

	protected function setUp(): void {
		parent::setUp();
		$this->block = new QueryNoResults();

		$reflection         = new \ReflectionClass( QueryLoop::class );
		$this->queries_prop = $reflection->getProperty( 'queries' );
		$this->queries_prop->setAccessible( true );
	}

	protected function tearDown(): void {
		$this->queries_prop->setValue( null, [] );
		parent::tearDown();
	}

	/** @param array<string, mixed> $context */
	private function make_block( array $context = [] ): \WP_Block {
		$block          = new \WP_Block();
		$block->context = $context;
		return $block;
	}

	private function make_wp_query( int $found_posts ): \WP_Query {
		$q              = new \WP_Query();
		$q->found_posts = $found_posts;
		return $q;
	}

	// ── Missing / invalid context ─────────────────────────────────────────────

	public function test_render_returns_empty_without_query_id_in_context(): void {
		$html = $this->block->render( [], '', $this->make_block() );

		self::assertSame( '', $html );
	}

	public function test_render_returns_empty_with_empty_query_id(): void {
		$block = $this->make_block( [ 'goblocks/queryId' => '' ] );
		$html  = $this->block->render( [], '', $block );

		self::assertSame( '', $html );
	}

	public function test_render_returns_empty_when_query_not_registered(): void {
		$block = $this->make_block( [ 'goblocks/queryId' => 'unknown' ] );
		$html  = $this->block->render( [], '<p>No results</p>', $block );

		self::assertSame( '', $html );
	}

	// ── Query has results → suppress output ───────────────────────────────────

	public function test_render_returns_empty_when_query_found_posts(): void {
		$this->queries_prop->setValue( null, [ 'qid01' => $this->make_wp_query( 3 ) ] );

		$block = $this->make_block( [ 'goblocks/queryId' => 'qid01' ] );
		$html  = $this->block->render( [], '<p>No results</p>', $block );

		self::assertSame( '', $html );
	}

	public function test_render_returns_empty_when_exactly_one_post_found(): void {
		$this->queries_prop->setValue( null, [ 'qid02' => $this->make_wp_query( 1 ) ] );

		$block = $this->make_block( [ 'goblocks/queryId' => 'qid02' ] );
		$html  = $this->block->render( [], '<p>No results</p>', $block );

		self::assertSame( '', $html );
	}

	// ── Query has no results → render content ────────────────────────────────

	public function test_render_outputs_wrapper_div_when_no_posts(): void {
		$this->queries_prop->setValue( null, [ 'qid03' => $this->make_wp_query( 0 ) ] );

		$block = $this->make_block( [ 'goblocks/queryId' => 'qid03' ] );
		$html  = $this->block->render( [], '<p>Nothing here.</p>', $block );

		self::assertStringContainsString( '<div', $html );
		self::assertStringContainsString( '</div>', $html );
	}

	public function test_render_wrapper_has_correct_class(): void {
		$this->queries_prop->setValue( null, [ 'qid04' => $this->make_wp_query( 0 ) ] );

		$block = $this->make_block( [ 'goblocks/queryId' => 'qid04' ] );
		$html  = $this->block->render( [], '', $block );

		self::assertStringContainsString( 'gb-query-no-results', $html );
	}

	public function test_render_includes_inner_content_when_no_posts(): void {
		$this->queries_prop->setValue( null, [ 'qid05' => $this->make_wp_query( 0 ) ] );

		$block   = $this->make_block( [ 'goblocks/queryId' => 'qid05' ] );
		$content = '<p>Sorry, nothing matched your search.</p>';
		$html    = $this->block->render( [], $content, $block );

		self::assertStringContainsString( $content, $html );
	}

	public function test_render_wraps_content_in_single_div(): void {
		$this->queries_prop->setValue( null, [ 'qid06' => $this->make_wp_query( 0 ) ] );

		$block = $this->make_block( [ 'goblocks/queryId' => 'qid06' ] );
		$html  = $this->block->render( [], 'Inner', $block );

		self::assertSame( '<div class="gb-query-no-results">Inner</div>', $html );
	}

	// ── get_name() ───────────────────────────────────────────────────────────

	public function test_get_name_returns_query_no_results(): void {
		self::assertSame( 'query-no-results', $this->block->get_name() );
	}
}
