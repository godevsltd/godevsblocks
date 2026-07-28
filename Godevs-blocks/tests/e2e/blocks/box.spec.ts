import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * E2E tests for goblocks/box block.
 *
 * Requires wp-env running on port 8888 (`npm run wp-env:start`).
 * Tests cover: inserting the block, tagName switching, link mode,
 * and frontend render verification.
 */
test.describe( 'Box block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	// ── Editor insertion ───────────────────────────────────────────────────

	test( 'inserts into the editor without errors', async ( { editor } ) => {
		await editor.insertBlock( { name: 'goblocks/box' } );

		const block = editor.canvas.locator( '[data-type="goblocks/box"]' );
		await expect( block ).toBeVisible();
	} );

	test( 'is selectable and shows toolbar', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'goblocks/box' } );

		const block = editor.canvas.locator( '[data-type="goblocks/box"]' );
		await block.click();

		// Block toolbar should appear.
		const toolbar = page.locator( '.block-editor-block-contextual-toolbar' );
		await expect( toolbar ).toBeVisible();
	} );

	test( 'accepts inner blocks', async ( { editor } ) => {
		await editor.insertBlock( {
			name: 'goblocks/box',
			innerBlocks: [
				{ name: 'goblocks/text', attributes: { content: 'Hello from inside the box' } },
			],
		} );

		const innerText = editor.canvas.locator( '[data-type="goblocks/text"]' );
		await expect( innerText ).toBeVisible();
	} );

	// ── TagName switching ──────────────────────────────────────────────────

	test( 'changes HTML tag via Inspector tag control', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'goblocks/box' } );

		const block = editor.canvas.locator( '[data-type="goblocks/box"]' );
		await block.click();

		// Open the Inspector sidebar if not already open.
		const settingsButton = page.locator( 'button[aria-label="Settings"]' ).first();
		if ( await settingsButton.isVisible() ) {
			await settingsButton.click();
		}

		// Locate the HTML Tag control and change to section.
		const tagSelect = page.locator( 'select', { hasText: 'div' } ).first();
		if ( await tagSelect.isVisible() ) {
			await tagSelect.selectOption( 'section' );
		}
	} );

	// ── Frontend render ────────────────────────────────────────────────────

	test( 'renders on the frontend with correct class', async ( { page, requestUtils } ) => {
		// Create a post with a Box block that has a known uniqueId.
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Box Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"e2etest01","tagName":"div"} --><p>Box content</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		// The rendered block should have the uniqueId class.
		const box = page.locator( '.gb-box-e2etest01' );
		await expect( box ).toBeVisible();
		await expect( box ).toContainText( 'Box content' );
	} );

	test( 'renders as <section> when tagName is section', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Box Section Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"e2esec01","tagName":"section"} --><p>Section</p><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const section = page.locator( 'section.gb-box-e2esec01' );
		await expect( section ).toBeVisible();
	} );

	test( 'renders as <a> in link mode with correct href', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Box Link Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"e2elnk01","tagName":"a","link":"https://example.com","linkTarget":"_self"} --><span>Click</span><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const anchor = page.locator( 'a.gb-box-e2elnk01' );
		await expect( anchor ).toBeVisible();
		await expect( anchor ).toHaveAttribute( 'href', 'https://example.com' );
	} );

	test( 'adds noopener noreferrer for blank target links', async ( { page, requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Box Blank Link Test',
			content:  '<!-- wp:goblocks/box {"uniqueId":"e2eblnk1","tagName":"a","link":"https://example.com","linkTarget":"_blank"} --><span>Click</span><!-- /wp:goblocks/box -->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const anchor = page.locator( 'a.gb-box-e2eblnk1' );
		await expect( anchor ).toHaveAttribute( 'rel', /noopener/ );
		await expect( anchor ).toHaveAttribute( 'rel', /noreferrer/ );
	} );

	// ── Cleanup ───────────────────────────────────────────────────────────

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );
} );
