/**
 * GoBlocks Editor Entry Point
 *
 * Loaded on every Gutenberg editor page. Responsible for:
 *  - Registering all GoBlocks block types
 *  - Injecting the BreakpointBar into the block toolbar
 *  - Wiring up the global styles sidebar panel
 *  - Registering block patterns
 *
 * Block registration is handled via each block's index.ts entry;
 * this file only registers editor-level UI extensions.
 *
 * Built to: build/editor.js + build/editor.asset.php
 */

// Global type augmentation — ensures window.goblocksEditor is typed.
import './types/block';

// @ts-ignore
import { updateCategory } from '@wordpress/blocks';
// @ts-ignore
import domReady from '@wordpress/dom-ready';
import { createElement } from '@wordpress/element';

// Register the GoBlocks category icon once the DOM is ready.
domReady( () => {
	updateCategory( 'goblocks', {
		icon: createElement(
			'svg',
			{
				viewBox: '0 0 24 24',
				xmlns: 'http://www.w3.org/2000/svg',
				width: 24,
				height: 24,
				fill: 'currentColor',
			},
			createElement( 'path', {
				d: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
			} )
		),
	} );
} );
