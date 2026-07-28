#!/usr/bin/env node
/**
 * Stage plugin files for distribution, respecting .distignore.
 * Windows-safe: pure Node.js, no rsync required.
 */

const fs   = require( 'fs' );
const path = require( 'path' );
const os   = require( 'os' );

const PLUGIN_ROOT  = path.resolve( __dirname, '..' );
const STAGING_ROOT = process.env.STAGING_DIR
	|| path.join( os.tmpdir(), 'goblocks-dist', 'goblocks' );
const DISTIGNORE   = fs.readFileSync( path.join( PLUGIN_ROOT, '.distignore' ), 'utf8' );

// Parse .distignore — strip comments and blank lines.
const rawPatterns = DISTIGNORE
	.split( '\n' )
	.map( ( l ) => l.replace( /#.*/, '' ).trim() )
	.filter( Boolean );

// Always exclude .distignore itself (rsync passes this as --exclude=".distignore")
const patterns = [ '.distignore', ...rawPatterns ];

function isIgnored( rel ) {
	const parts = rel.split( '/' );
	const base  = parts[ parts.length - 1 ];

	for ( const pat of patterns ) {
		// Strip trailing slash to normalise directory patterns.
		const norm = pat.replace( /\/$/, '' );

		// Wildcard extension (e.g. "*.zip", "*.log", "npm-debug.log*")
		if ( pat.startsWith( '*.' ) ) {
			const ext = pat.slice( 1 );
			if ( rel.endsWith( ext ) ) return true;
			continue;
		}
		if ( pat.endsWith( '*' ) ) {
			const prefix = pat.slice( 0, -1 );
			if ( base.startsWith( prefix ) ) return true;
			continue;
		}

		// Exact base-name match anywhere in path (e.g. "vendor", ".git", ".DS_Store")
		if ( parts.includes( norm ) ) return true;

		// Full relative-path prefix match (e.g. "bin/make-zip.js")
		if ( rel === norm || rel.startsWith( norm + '/' ) ) return true;
	}
	return false;
}

function copyDir( src, dest ) {
	fs.mkdirSync( dest, { recursive: true } );
	for ( const entry of fs.readdirSync( src, { withFileTypes: true } ) ) {
		const abs = path.join( src, entry.name );
		const rel = path.relative( PLUGIN_ROOT, abs ).replace( /\\/g, '/' );
		if ( isIgnored( rel ) ) continue;
		const out = path.join( dest, entry.name );
		if ( entry.isDirectory() ) {
			copyDir( abs, out );
		} else {
			fs.copyFileSync( abs, out );
		}
	}
}

// Clean staging dir and rebuild.
fs.rmSync( path.join( os.tmpdir(), 'goblocks-dist' ), { recursive: true, force: true } );
copyDir( PLUGIN_ROOT, STAGING_ROOT );

// Verify required distribution files.
const required = [ 'goblocks.php', 'readme.txt', 'build', 'includes', 'languages' ];
for ( const r of required ) {
	if ( ! fs.existsSync( path.join( STAGING_ROOT, r ) ) ) {
		console.error( 'MISSING required file/dir:', r );
		process.exit( 1 );
	}
}

const count = fs.readdirSync( STAGING_ROOT, { recursive: true } ).length;
console.log( 'Staged to:', STAGING_ROOT );
console.log( 'Entries:  ', count );
