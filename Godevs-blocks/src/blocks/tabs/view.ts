/**
 * Tabs block — frontend view script (vanilla JS, no React).
 *
 * Handles:
 *  - Click on tab button → activate tab + panel + update URL hash
 *  - Arrow Left/Right (or Up/Down for vertical) → move focus + activate
 *  - Home / End → jump to first / last tab
 *  - Page load with URL hash → activate matching tab (slug, button id, or panel id)
 *  - Browser back/forward (hashchange) → re-activate matching tab
 *
 * Hash format: slugified tab label, e.g. "Pricing Plans" → #pricing-plans.
 * Also accepts the raw button id or panel id as fallback.
 */

( function () {
	'use strict';

	interface TabsEl extends HTMLElement {
		dataset: { orientation?: string };
	}

	/**
	 * Convert a label string to a URL-safe slug.
	 * @param text
	 */
	function slugify( text: string ): string {
		return text
			.toLowerCase()
			.trim()
			.replace( /[^a-z0-9]+/g, '-' )
			.replace( /^-|-$/g, '' );
	}

	/** Stored activate callbacks keyed by tabs element, for hashchange reuse. */
	const registry = new Map<
		HTMLElement,
		( btn: HTMLButtonElement, updateHash?: boolean ) => void
	>();

	function initTabs( tabsEl: TabsEl ): void {
		const tablist =
			tabsEl.querySelector< HTMLElement >( '[role="tablist"]' );
		if ( ! tablist ) {
			return;
		}

		const buttons = Array.from(
			tabsEl.querySelectorAll< HTMLButtonElement >( '[role="tab"]' )
		);
		if ( ! buttons.length ) {
			return;
		}

		const panels = Array.from(
			tabsEl.querySelectorAll< HTMLElement >( '[role="tabpanel"]' )
		);

		// Assign a stable hash slug derived from the button's visible label.
		buttons.forEach( ( btn ) => {
			const slug = slugify( btn.textContent ?? '' );
			if ( slug ) {
				btn.dataset.hashSlug = slug;
			}
		} );

		function activate( btn: HTMLButtonElement, updateHash = false ): void {
			buttons.forEach( ( b ) => {
				const active = b === btn;
				b.setAttribute( 'aria-selected', active ? 'true' : 'false' );
				b.setAttribute( 'tabindex', active ? '0' : '-1' );
				b.classList.toggle( 'is-active', active );
			} );
			panels.forEach( ( p ) => {
				const active = p.id === btn.getAttribute( 'aria-controls' );
				p.classList.toggle( 'is-active', active );
				if ( active ) {
					p.removeAttribute( 'hidden' );
				} else {
					p.setAttribute( 'hidden', '' );
				}
			} );

			// Keep the URL in sync so the active tab is shareable.
			// replaceState keeps history clean (back button = previous page, not previous tab).
			if ( updateHash ) {
				const slug = btn.dataset.hashSlug || btn.id;
				if ( slug ) {
					history.replaceState( null, '', '#' + slug );
				}
			}
		}

		/**
		 * Find the button matching the current location.hash and activate it.
		 * Accepts: slugified label, button id, or panel id.
		 */
		function activateFromHash(): boolean {
			const hash = window.location.hash.slice( 1 );
			if ( ! hash ) {
				return false;
			}
			const target = buttons.find(
				( b ) =>
					b.dataset.hashSlug === hash ||
					b.id === hash ||
					b.getAttribute( 'aria-controls' ) === hash
			);
			if ( target ) {
				activate( target ); // hash is already set, no replaceState needed
				return true;
			}
			return false;
		}

		// Initialise: honour URL hash first, then fall back to PHP default.
		if ( ! activateFromHash() ) {
			const initial =
				buttons.find(
					( b ) => b.getAttribute( 'aria-selected' ) === 'true'
				) ?? buttons[ 0 ];
			if ( initial ) {
				activate( initial );
			}
		}

		// Click.
		tablist.addEventListener( 'click', ( e ) => {
			const btn = (
				e.target as HTMLElement
			 ).closest< HTMLButtonElement >( '[role="tab"]' );
			if ( btn ) {
				activate( btn, true );
				btn.focus();
			}
		} );

		// Keyboard.
		tablist.addEventListener( 'keydown', ( e ) => {
			const idx = buttons.indexOf(
				tablist.ownerDocument.activeElement as HTMLButtonElement
			);
			if ( idx === -1 ) {
				return;
			}

			const vertical = tabsEl.dataset.orientation === 'vertical';
			const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
			const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
			let target = -1;

			switch ( e.key ) {
				case prevKey:
					target = ( idx - 1 + buttons.length ) % buttons.length;
					break;
				case nextKey:
					target = ( idx + 1 ) % buttons.length;
					break;
				case 'Home':
					target = 0;
					break;
				case 'End':
					target = buttons.length - 1;
					break;
				default:
					return;
			}

			e.preventDefault();
			const targetBtn = buttons[ target ];
			if ( targetBtn ) {
				targetBtn.focus();
				activate( targetBtn, true );
			}
		} );

		// Store activate for the hashchange handler below.
		registry.set( tabsEl, activate );
	}

	// ── Browser back/forward via hashchange ───────────────────────────────────
	//
	// replaceState doesn't add history entries, so back/forward changes the hash
	// only when the user navigated away then returned. We still handle it so
	// that inbound links (e.g. from other pages) activate the correct tab.

	window.addEventListener( 'hashchange', () => {
		const hash = window.location.hash.slice( 1 );
		if ( ! hash ) {
			return;
		}

		registry.forEach( ( activate, tabsEl ) => {
			const buttons = Array.from(
				tabsEl.querySelectorAll< HTMLButtonElement >( '[role="tab"]' )
			);
			const target = buttons.find(
				( b ) =>
					b.dataset.hashSlug === hash ||
					b.id === hash ||
					b.getAttribute( 'aria-controls' ) === hash
			);
			if ( target ) {
				activate( target );
			} // no hash update — hash is already correct
		} );
	} );

	document.querySelectorAll< TabsEl >( '.gb-tabs' ).forEach( initTabs );
} )();
