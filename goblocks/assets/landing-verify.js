/**
 * GoBlocks Landing Pages Verification
 * Screenshots both showcase pages, checks for errors, audits block/pattern rendering.
 *
 * Run: node assets/landing-verify.js
 */
const { chromium } = require( 'playwright' );
const path = require( 'path' );
const fs   = require( 'fs' );

const SHOTS_DIR = path.join( __dirname, 'landing-shots' );
if ( ! fs.existsSync( SHOTS_DIR ) ) fs.mkdirSync( SHOTS_DIR, { recursive: true } );

const WP    = 'http://localhost:8888';
const ADMIN = `${ WP }/wp-admin`;
const PAGE1 = `${ WP }/goblocks-all-blocks/`;
const PAGE2 = `${ WP }/goblocks-all-patterns/`;

async function ss( page, name ) {
	const file = path.join( SHOTS_DIR, `${ name }.png` );
	await page.screenshot( { path: file, fullPage: true } );
	console.log( `  📸 ${ name }.png` );
	return file;
}

async function scrollFull( page ) {
	await page.evaluate( async () => {
		await new Promise( resolve => {
			let dist = 0;
			const step = 800;
			const total = document.body.scrollHeight;
			const id = setInterval( () => {
				window.scrollBy( 0, step );
				dist += step;
				if ( dist >= total ) { clearInterval( id ); resolve(); }
			}, 100 );
		} );
	} );
	await page.waitForTimeout( 1500 );
	await page.evaluate( () => window.scrollTo( 0, 0 ) );
	await page.waitForTimeout( 500 );
}

async function auditPage( page, label, url, context ) {
	const errors = [];
	page.on( 'console', msg => {
		if ( msg.type() === 'error' ) errors.push( msg.text() );
	} );
	page.on( 'pageerror', err => errors.push( 'JS Exception: ' + err.message ) );

	await page.goto( url, { waitUntil: 'networkidle', timeout: 60000 } );
	await page.waitForTimeout( 1000 );

	// Trigger animations by scrolling
	await scrollFull( page );

	// Count GoBlocks elements
	const counts = await page.evaluate( () => {
		const blocks = document.querySelectorAll( '[class*="gb-"]' );
		const blockTypes = {};
		blocks.forEach( el => {
			const cls = [ ...el.classList ].find( c => c.match( /^gb-[a-z]/ ) );
			if ( cls ) {
				const type = cls.replace( /^gb-/, '' ).replace( /-[a-z0-9]+$/, '' );
				blockTypes[ type ] = ( blockTypes[ type ] || 0 ) + 1;
			}
		} );
		return {
			total: blocks.length,
			types: blockTypes,
		};
	} );

	// Check for empty/broken blocks
	const empties = await page.evaluate( () => {
		const warn = [];
		document.querySelectorAll( '[class*="gb-"]' ).forEach( el => {
			if ( el.children.length === 0 && el.textContent.trim() === '' ) {
				warn.push( el.className.split(' ')[0] );
			}
		} );
		return warn;
	} );

	// Find specific block classes to verify they rendered
	const present = await page.evaluate( () => {
		const check = [
			'gb-heading', 'gb-text', 'gb-button', 'gb-counter', 'gb-progress-bar',
			'gb-accordion', 'gb-tabs', 'gb-flip-card', 'gb-countdown', 'gb-timeline',
			'gb-pricing', 'gb-slider', 'gb-alert', 'gb-star-rating', 'gb-social-share',
			'gb-icon', 'gb-shape', 'gb-modal', 'gb-query', 'gb-toc',
			'gb-navigation', 'gb-separator', 'gb-spacer', 'gb-group', 'gb-container',
			'gb-video',
		];
		const found = {};
		check.forEach( cls => {
			const els = document.querySelectorAll( `[class*="${ cls }"]` );
			found[ cls ] = els.length;
		} );
		return found;
	} );

	const name = label.toLowerCase().replace( /\s+/g, '-' );
	const shotPath = await ss( page, name + '-full' );

	// Section shots
	await page.evaluate( () => window.scrollTo( 0, 0 ) );
	await ss( page, name + '-hero' );

	return {
		label,
		url,
		errors: [ ...new Set( errors ) ],
		counts,
		empties: [ ...new Set( empties ) ].slice( 0, 10 ),
		present,
		shotPath,
	};
}

async function auditEditor( browser ) {
	const page = await browser.newPage();
	const errors = [];
	page.on( 'console', msg => {
		if ( msg.type() === 'error' ) errors.push( msg.text() );
	} );

	try {
		// Log in
		await page.goto( `${ ADMIN }/`, { waitUntil: 'domcontentloaded', timeout: 30000 } );
		await page.fill( '#user_login', 'admin' );
		await page.fill( '#user_pass', 'password' );
		await page.click( '#wp-submit' );
		await page.waitForURL( '**/wp-admin/**', { timeout: 20000 } );
		await page.waitForTimeout( 1000 );
		await ss( page, 'editor-admin-login' );

		// Open All Blocks page in editor — use domcontentloaded + long wait
		await page.goto( `${ ADMIN }/post.php?post=313&action=edit`, { waitUntil: 'domcontentloaded', timeout: 60000 } );
		await page.waitForTimeout( 6000 );
		await ss( page, 'editor-blocks-page' );

		// Open All Patterns page in editor
		await page.goto( `${ ADMIN }/post.php?post=314&action=edit`, { waitUntil: 'domcontentloaded', timeout: 60000 } );
		await page.waitForTimeout( 6000 );
		await ss( page, 'editor-patterns-page' );

		// Try opening block inserter
		try {
			const addBtn = page.locator( 'button[aria-label="Toggle block inserter"]' ).first();
			await addBtn.waitFor( { state: 'visible', timeout: 8000 } );
			await addBtn.click();
			await page.waitForTimeout( 2000 );
			const searchBox = page.locator( 'input[type="search"], input[placeholder*="Search"]' ).first();
			if ( await searchBox.isVisible( { timeout: 3000 } ) ) {
				await searchBox.fill( 'GoBlocks' );
				await page.waitForTimeout( 1500 );
				await ss( page, 'editor-inserter-goblocks' );
			}
		} catch ( e ) {
			console.log( '  ℹ️  Inserter:', e.message.slice( 0, 80 ) );
		}

		// Check Patterns tab in site editor
		try {
			await page.goto( `${ ADMIN }/site-editor.php?path=%2Fpatterns`, { waitUntil: 'domcontentloaded', timeout: 60000 } );
			await page.waitForTimeout( 5000 );
			await ss( page, 'site-editor-patterns-tab' );
		} catch ( e ) {
			console.log( '  ℹ️  Site editor patterns:', e.message.slice( 0, 80 ) );
		}

	} catch ( e ) {
		console.log( '  ⚠️  Editor audit error:', e.message.slice( 0, 120 ) );
	}

	await page.close();
	return { editorErrors: [ ...new Set( errors ) ] };
}

( async () => {
	const browser = await chromium.launch();
	const results = { page1: null, page2: null, editor: null };

	console.log( '\n── Auditing All Blocks Page ──────────────────────────────' );
	{
		const ctx  = await browser.newContext( { viewport: { width: 1400, height: 900 } } );
		const page = await ctx.newPage();
		results.page1 = await auditPage( page, 'all-blocks', PAGE1, ctx );
		// also mobile
		await page.setViewportSize( { width: 390, height: 844 } );
		await page.goto( PAGE1, { waitUntil: 'networkidle', timeout: 60000 } );
		await page.waitForTimeout( 800 );
		await ss( page, 'all-blocks-mobile' );
		await ctx.close();
	}

	console.log( '\n── Auditing All Patterns Page ────────────────────────────' );
	{
		const ctx  = await browser.newContext( { viewport: { width: 1400, height: 900 } } );
		const page = await ctx.newPage();
		results.page2 = await auditPage( page, 'all-patterns', PAGE2, ctx );
		// mobile
		await page.setViewportSize( { width: 390, height: 844 } );
		await page.goto( PAGE2, { waitUntil: 'networkidle', timeout: 60000 } );
		await page.waitForTimeout( 800 );
		await ss( page, 'all-patterns-mobile' );
		await ctx.close();
	}

	console.log( '\n── Auditing WordPress Editor ─────────────────────────────' );
	results.editor = await auditEditor( browser );

	await browser.close();

	// ── Print summary ───────────────────────────────────────────────────────
	console.log( '\n══ AUDIT SUMMARY ══════════════════════════════════════════\n' );

	for ( const key of [ 'page1', 'page2' ] ) {
		const r = results[ key ];
		console.log( `${r.label.toUpperCase()} — ${ r.url }` );
		console.log( `  GoBlocks elements: ${ r.counts.total }` );
		console.log( `  JS errors: ${ r.errors.length }` );
		if ( r.errors.length ) r.errors.forEach( e => console.log( `    ❌ ${ e }` ) );

		const missing = Object.entries( r.present ).filter( ( [, n] ) => n === 0 ).map( ( [k] ) => k );
		if ( missing.length ) {
			console.log( `  ⚠️  Not found: ${ missing.join( ', ' ) }` );
		} else {
			console.log( `  ✅ All tracked block types rendered` );
		}

		if ( r.empties.length ) {
			console.log( `  ⚠️  Empty blocks: ${ r.empties.join( ', ' ) }` );
		}
		console.log();
	}

	if ( results.editor.editorErrors.length ) {
		console.log( 'EDITOR ERRORS:' );
		results.editor.editorErrors.forEach( e => console.log( `  ❌ ${ e }` ) );
	} else {
		console.log( 'EDITOR: No JS errors detected' );
	}

	// Write JSON results for report generator
	fs.writeFileSync(
		path.join( SHOTS_DIR, 'results.json' ),
		JSON.stringify( results, null, 2 )
	);
	console.log( '\nResults saved to assets/landing-shots/results.json' );
} )();