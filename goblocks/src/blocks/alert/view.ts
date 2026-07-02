( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	// Shared live region for screen reader announcements — created once per page.
	const announceEl = ( () => {
		const existing = document.getElementById( 'gb-announcer' );
		if ( existing ) return existing;
		const el = document.createElement( 'div' );
		el.id = 'gb-announcer';
		el.setAttribute( 'aria-live', 'polite' );
		el.setAttribute( 'aria-atomic', 'true' );
		el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;margin:0;';
		document.body.appendChild( el );
		return el;
	} )();

	function announce( message: string ): void {
		// Clear first so repeating the same message still fires a new announcement.
		announceEl.textContent = '';
		requestAnimationFrame( () => { announceEl.textContent = message; } );
	}

	// ── Cookie helpers ──────────────────────────────────────────────────────

	function getCookie( name: string ): string {
		return document.cookie
			.split( '; ' )
			.find( ( row ) => row.startsWith( name + '=' ) )
			?.split( '=' )[ 1 ] ?? '';
	}

	function setCookie( name: string, days: number ): void {
		const maxAge = days * 86400;
		document.cookie = `${ name }=1; max-age=${ maxAge }; path=/; SameSite=Lax`;
	}

	function isDismissed( key: string, mode: string ): boolean {
		if ( ! key || mode === 'none' ) return false;
		if ( mode === 'session' ) return !! sessionStorage.getItem( key );
		if ( mode === 'local' )   return !! localStorage.getItem( key );
		if ( mode === 'cookie' )  return getCookie( key ) === '1';
		return false;
	}

	function persistDismissal( key: string, mode: string, days: number ): void {
		if ( ! key || mode === 'none' ) return;
		if ( mode === 'session' ) sessionStorage.setItem( key, '1' );
		if ( mode === 'local' )   localStorage.setItem( key, '1' );
		if ( mode === 'cookie' )  setCookie( key, days );
	}

	// ── Dismiss animation ───────────────────────────────────────────────────

	function animateDismiss( el: HTMLElement, onDone: () => void ): void {
		// Skip animation entirely when the user prefers reduced motion.
		if ( reducedMotion ) {
			onDone();
			return;
		}

		// Lock current height so the transition has a concrete start value.
		el.style.maxHeight = el.scrollHeight + 'px';
		el.style.overflow  = 'hidden';

		// Force a reflow so the browser registers the initial maxHeight.
		void el.offsetHeight;

		el.style.transition = [
			'max-height 0.3s ease',
			'opacity 0.25s ease',
			'padding-top 0.3s ease',
			'padding-bottom 0.3s ease',
			'margin-top 0.3s ease',
			'margin-bottom 0.3s ease',
		].join( ', ' );

		el.style.maxHeight     = '0';
		el.style.opacity       = '0';
		el.style.paddingTop    = '0';
		el.style.paddingBottom = '0';
		el.style.marginTop     = '0';
		el.style.marginBottom  = '0';

		// Guard against onDone being called twice (transitionend + fallback timeout).
		let settled = false;
		function finish() {
			if ( settled ) return;
			settled = true;
			onDone();
		}

		el.addEventListener( 'transitionend', finish, { once: true } );
		setTimeout( finish, 400 );
	}

	// ── Per-alert initialisation ─────────────────────────────────────────────

	document.querySelectorAll< HTMLElement >( '.gb-alert' ).forEach( ( alert ) => {
		const key  = alert.dataset.dismissKey  ?? '';
		const mode = alert.dataset.dismissMode ?? 'none';
		const days = parseInt( alert.dataset.dismissDays ?? '30', 10 ) || 30;

		// Hide immediately (no animation) if already dismissed in this session.
		if ( isDismissed( key, mode ) ) {
			alert.hidden = true;
			return;
		}

		const btn = alert.querySelector< HTMLButtonElement >( '.gb-alert__dismiss' );
		if ( ! btn ) return;

		btn.addEventListener( 'click', () => {
			persistDismissal( key, mode, days );

			// Announce before the element disappears so screen readers catch it.
			announce( 'Alert dismissed.' );

			animateDismiss( alert, () => {
				alert.hidden = true;
			} );
		} );
	} );
} )();