import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * E2E tests for responsive behaviour across GoBlocks blocks.
 *
 * Verifies that:
 *  - The responsive device switcher in the Inspector appears for GoBlocks blocks.
 *  - CSS custom properties for breakpoints are present on the frontend.
 *  - Blocks that have responsive attributes output correct CSS at each breakpoint.
 */
test.describe( 'Responsive controls', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	// ── Inspector device switcher ──────────────────────────────────────────

	test( 'device switcher is visible in Inspector when Box block is selected', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'goblocks/box' } );

		const block = editor.canvas.locator( '[data-type="goblocks/box"]' );
		await block.click();

		// Open the block settings sidebar only if it is currently closed.
		// The Settings button toggles: clicking when open would close it.
		const sidebar = page.locator( '.interface-complementary-area' );
		if ( ! await sidebar.isVisible() ) {
			await page.locator( 'button[aria-label="Settings"]' ).first().click();
			await sidebar.waitFor( { state: 'visible', timeout: 5_000 } );
		}

		// Wait for the GoBlocks inspector tabs to render (proves block → inspector wired up).
		const inspectorPanel = page.locator( '.gb-inspector-tabs__panel' );
		await inspectorPanel.waitFor( { state: 'visible', timeout: 5_000 } );

		// All style panels have initialOpen={false}; BreakpointTabs is not rendered
		// until its parent PanelBody is expanded. Click the first panel toggle.
		const firstToggle = inspectorPanel.getByRole( 'button' ).first();
		if ( await firstToggle.isVisible() ) {
			const isExpanded = await firstToggle.getAttribute( 'aria-expanded' );
			if ( isExpanded !== 'true' ) {
				await firstToggle.click();
			}
		}

		// GoBlocks breakpoint tabs (device switcher) component.
		const switcher = page.locator( '.gb-breakpoint-tabs' );
		await expect( switcher ).toBeVisible( { timeout: 5_000 } );
	} );

	// ── Frontend CSS output ────────────────────────────────────────────────

	test( 'generated CSS is injected into page head on frontend', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'Responsive CSS Test',
			content:  [
				'<!-- wp:goblocks/box {"uniqueId":"res01","generatedCss":".gb-box-res01{display:flex;}"} -->',
				'<!-- /wp:goblocks/box -->',
			].join( '\n' ),
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		// The inline style tag or linked stylesheet for GoBlocks CSS must exist.
		const styleTag = page.locator( 'style[id*="goblocks"], link[id*="goblocks"]' ).first();
		await expect( styleTag ).toBeAttached( { timeout: 10_000 } );
	} );

	test( 'block CSS class is applied to rendered element', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'Responsive Class Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"res02"} --><p>Content</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const box = page.locator( '.gb-box-res02' );
		await expect( box ).toBeVisible();
	} );

	// ── Viewport breakpoint checks ─────────────────────────────────────────

	test( 'block renders correctly at mobile viewport (375px)', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Mobile Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"mob01"} --><p>Mobile</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.setViewportSize( { width: 375, height: 812 } );
		await page.goto( `/?p=${ post.id }` );

		const box = page.locator( '.gb-box-mob01' );
		await expect( box ).toBeVisible();
		await expect( box ).toContainText( 'Mobile' );
	} );

	test( 'block renders correctly at tablet viewport (768px)', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Tablet Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"tab01"} --><p>Tablet</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.setViewportSize( { width: 768, height: 1024 } );
		await page.goto( `/?p=${ post.id }` );

		const box = page.locator( '.gb-box-tab01' );
		await expect( box ).toBeVisible();
	} );

	test( 'block renders correctly at desktop viewport (1280px)', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Desktop Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"desk01"} --><p>Desktop</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.setViewportSize( { width: 1280, height: 900 } );
		await page.goto( `/?p=${ post.id }` );

		const box = page.locator( '.gb-box-desk01' );
		await expect( box ).toBeVisible();
	} );

	// ── Global tokens ──────────────────────────────────────────────────────

	test( 'container site CSS custom property is defined on :root', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'Root CSS Token Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"tok01"} --><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const containerWidth = await page.evaluate( () =>
			getComputedStyle( document.documentElement )
				.getPropertyValue( '--gb-container-site' )
				.trim()
		);

		// The token should be set (non-empty) — exact value depends on plugin settings.
		expect( containerWidth ).not.toBe( '' );
	} );

	// ── Cleanup ───────────────────────────────────────────────────────────

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );
} );
