/**
 * Accordion block — frontend view script (vanilla JS, no React).
 *
 * When `data-allow-multiple="false"`, listens for the native `toggle` event
 * on each <details> element and closes sibling items when one opens.
 *
 * <details>/<summary> handle open/close natively without JS; this script
 * is only needed for the single-open constraint.
 */

( function () {
	'use strict';

	document
		.querySelectorAll< HTMLElement >(
			'.gb-accordion[data-allow-multiple="false"]'
		)
		.forEach( ( accordion ) => {
			const items = Array.from(
				accordion.querySelectorAll< HTMLDetailsElement >(
					':scope > details'
				)
			);

			items.forEach( ( details ) => {
				details.addEventListener( 'toggle', () => {
					if ( details.open ) {
						items.forEach( ( other ) => {
							if ( other !== details && other.open ) {
								other.removeAttribute( 'open' );
							}
						} );
					}
				} );
			} );
		} );
} )();
