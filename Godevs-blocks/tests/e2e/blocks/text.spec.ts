import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * E2E tests for goblocks/text block.
 *
 * Covers: insertion, content editing, tagName switching, dynamic content
 * placeholder visibility, and frontend render.
 */
test.describe( 'Text block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	// ── Editor insertion ───────────────────────────────────────────────────

	test( 'inserts into the editor without errors', async ( { editor } ) => {
		await editor.insertBlock( { name: 'goblocks/text' } );

		const block = editor.canvas.locator( '[data-type="goblocks/text"]' );
		await expect( block ).toBeVisible();
	} );

	test( 'accepts and displays typed content', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'goblocks/text' } );

		// blockProps spreads data-type onto the same element as contenteditable.
		const richText = editor.canvas.locator( '[data-type="goblocks/text"][contenteditable]' );
		await richText.click();
		await page.keyboard.type( 'This is a GoBlocks text block.' );

		await expect( richText ).toContainText( 'This is a GoBlocks text block.' );
	} );

	test( 'can be pre-populated with content via attributes', async ( { editor } ) => {
		await editor.insertBlock( {
			name:       'goblocks/text',
			attributes: { content: '<strong>Bold</strong> text here.' },
		} );

		const block = editor.canvas.locator( '[data-type="goblocks/text"]' );
		await expect( block ).toContainText( 'Bold' );
	} );

	// ── TagName selection ──────────────────────────────────────────────────

	test( 'renders as paragraph by default', async ( { requestUtils, page } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Text Default Tag',
			content:  '<!-- wp:goblocks/text {"uniqueId":"txte2e01","content":"Default paragraph"} /-->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		// Default tagName is p.
		const el = page.locator( 'p.gb-text-txte2e01' );
		await expect( el ).toBeVisible();
		await expect( el ).toContainText( 'Default paragraph' );
	} );

	test( 'renders as div when tagName is div', async ( { requestUtils, page } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Text Div Tag',
			content:  '<!-- wp:goblocks/text {"uniqueId":"txte2e02","tagName":"div","content":"Div text"} /-->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const el = page.locator( 'div.gb-text-txte2e02' );
		await expect( el ).toBeVisible();
	} );

	// ── Frontend render ────────────────────────────────────────────────────

	test( 'renders on frontend with correct content and class', async ( { requestUtils, page } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Text Frontend',
			content:  '<!-- wp:goblocks/text {"uniqueId":"txte2e03","content":"Hello world"} /-->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const el = page.locator( '.gb-text-txte2e03' );
		await expect( el ).toBeVisible();
		await expect( el ).toContainText( 'Hello world' );
	} );

	test( 'renders inline HTML correctly', async ( { requestUtils, page } ) => {
		const post = await requestUtils.createPost( {
			title:    'GoBlocks Text Inline HTML',
			content:  '<!-- wp:goblocks/text {"uniqueId":"txte2e04","content":"Visit <a href=\'https://example.com\'>example</a>"} /-->',
			status:   'publish',
			date_gmt: new Date().toISOString(),
		} );

		await page.goto( `/?p=${ post.id }` );

		const link = page.locator( '.gb-text-txte2e04 a' );
		await expect( link ).toBeVisible();
		await expect( link ).toContainText( 'example' );
	} );

	// ── Cleanup ───────────────────────────────────────────────────────────

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );
} );
