#!/usr/bin/env node
/**
 * Build the distribution ZIP for WordPress.org.
 * Uses adm-zip (already in node_modules) so path separators are always
 * forward-slashes, which PHP's ZipArchive requires on the server.
 *
 * Usage: node bin/make-zip.js [output-path]
 */

const AdmZip  = require( 'adm-zip' );
const fs      = require( 'fs' );
const path    = require( 'path' );

const PLUGIN_SLUG  = 'goblocks';
const PLUGIN_ROOT  = path.resolve( __dirname, '..' );
const STAGING_ROOT = process.env.STAGING_DIR || path.join( require( 'os' ).tmpdir(), 'goblocks-dist', 'goblocks' );
const ZIP_OUT      = process.argv[ 2 ] || path.join( PLUGIN_ROOT, '..', 'goblocks.zip' );

if ( ! fs.existsSync( STAGING_ROOT ) ) {
	console.error( `Staging dir not found: ${ STAGING_ROOT }` );
	process.exit( 1 );
}

const zip = new AdmZip();

function addDir( dir, zipBase ) {
	for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
		const fullPath  = path.join( dir, entry.name );
		const entryPath = `${ zipBase }/${ entry.name }`;

		if ( entry.isDirectory() ) {
			addDir( fullPath, entryPath );
		} else {
			zip.addFile(
				entryPath,           // forward-slash path in ZIP
				fs.readFileSync( fullPath )
			);
		}
	}
}

addDir( STAGING_ROOT, PLUGIN_SLUG );

zip.writeZip( ZIP_OUT );

const sizeMB = ( fs.statSync( ZIP_OUT ).size / 1024 / 1024 ).toFixed( 2 );
console.log( `Built: ${ path.basename( ZIP_OUT ) } (${ sizeMB } MB)` );

// Spot-check: show first 6 entry names
const check = new AdmZip( ZIP_OUT );
check.getEntries().slice( 0, 6 ).forEach( e => console.log( ' ', e.entryName ) );
