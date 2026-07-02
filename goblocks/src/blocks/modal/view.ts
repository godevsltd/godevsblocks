( function () {
	'use strict';

	const ALLOWED_ANIMATIONS = [ 'fade', 'slide-up', 'zoom' ] as const;

	document.querySelectorAll< HTMLElement >( '.gb-modal' ).forEach( ( modal ) => {
		const trigger     = modal.querySelector< HTMLElement >( '.gb-modal__trigger' );
		const overlay     = modal.querySelector< HTMLElement >( '.gb-modal__overlay' );
		const dialog      = modal.querySelector< HTMLElement >( '.gb-modal__dialog' );
		const closeBtn    = modal.querySelector< HTMLButtonElement >( '.gb-modal__close' );
		const dismissBtn  = modal.querySelector< HTMLButtonElement >( '.gb-modal__dismiss' );

		if ( ! trigger || ! overlay || ! dialog ) return;

		const closeOverlay  = modal.dataset.closeOverlay !== 'false';
		const closeEscape   = modal.dataset.closeEscape  !== 'false';
		const rawAnimation  = modal.dataset.animation ?? 'fade';
		const animation     = ( ALLOWED_ANIMATIONS as readonly string[] ).includes( rawAnimation ) ? rawAnimation : 'fade';
		const autoOpen      = modal.dataset.autoOpen === 'true';
		const autoDelay     = Math.max( 0, parseInt( modal.dataset.autoOpenDelay ?? '0', 10 ) );
		const cookieName    = modal.dataset.cookieName ?? '';
		const cookieDays    = Math.max( 1, parseInt( modal.dataset.cookieDays ?? '30', 10 ) );

		// Mark block as JS-initialized so CSS animation states apply.
		modal.setAttribute( 'data-gb-animated', '' );
		modal.setAttribute( 'data-animation', animation );

		// Ensure hidden on init.
		overlay.hidden = true;
		overlay.setAttribute( 'aria-hidden', 'true' );

		/* ── Cookie helpers ──────────────────────────────────────────────────── */

		function hasDismissedCookie(): boolean {
			if ( ! cookieName ) return false;
			return document.cookie.split( ';' ).some(
				( c ) => c.trim().startsWith( `gb_modal_${ cookieName }=` )
			);
		}

		function setDismissCookie(): void {
			if ( ! cookieName ) return;
			const expires = new Date();
			expires.setTime( expires.getTime() + cookieDays * 24 * 60 * 60 * 1000 );
			document.cookie = `gb_modal_${ cookieName }=1; expires=${ expires.toUTCString() }; path=/; SameSite=Lax`;
		}

		/* ── Open / close ────────────────────────────────────────────────────── */

		function openModal(): void {
			overlay!.hidden = false;
			overlay!.removeAttribute( 'aria-hidden' );
			document.body.style.overflow = 'hidden';
			// Two RAFs: first frame paints the element, second triggers the transition.
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					modal.setAttribute( 'data-open', '' );
					dialog!.focus();
				} );
			} );
		}

		function closeModal(): void {
			modal.removeAttribute( 'data-open' );
			document.body.style.overflow = '';

			// Hide after the CSS transition finishes.
			const onEnd = ( e: TransitionEvent ) => {
				if ( e.propertyName !== 'opacity' ) return;
				overlay!.hidden = true;
				overlay!.setAttribute( 'aria-hidden', 'true' );
				trigger!.focus();
				dialog!.removeEventListener( 'transitionend', onEnd );
			};
			dialog!.addEventListener( 'transitionend', onEnd );

			// Fallback: hide after 400 ms even if transitionend never fires.
			setTimeout( () => {
				if ( ! overlay!.hidden ) {
					overlay!.hidden = true;
					overlay!.setAttribute( 'aria-hidden', 'true' );
				}
			}, 400 );
		}

		/* ── Event listeners ─────────────────────────────────────────────────── */

		trigger.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			openModal();
		} );

		if ( closeBtn ) {
			closeBtn.addEventListener( 'click', closeModal );
		}

		if ( dismissBtn ) {
			dismissBtn.addEventListener( 'click', () => {
				setDismissCookie();
				closeModal();
			} );
		}

		if ( closeOverlay ) {
			overlay.addEventListener( 'click', ( e ) => {
				if ( e.target === overlay ) closeModal();
			} );
		}

		if ( closeEscape ) {
			document.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Escape' && ! overlay!.hidden ) closeModal();
			} );
		}

		// Focus trap: keep Tab/Shift+Tab cycling inside the dialog.
		dialog.addEventListener( 'keydown', ( e ) => {
			if ( e.key !== 'Tab' ) return;
			const focusable = Array.from(
				dialog!.querySelectorAll< HTMLElement >(
					'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
				)
			);
			if ( ! focusable.length ) return;
			const first = focusable[ 0 ]!;
			const last  = focusable[ focusable.length - 1 ]!;
			if ( e.shiftKey ) {
				if ( document.activeElement === first ) { e.preventDefault(); last!.focus(); }
			} else {
				if ( document.activeElement === last )  { e.preventDefault(); first!.focus(); }
			}
		} );

		/* ── Auto-open ───────────────────────────────────────────────────────── */

		if ( autoOpen && ! hasDismissedCookie() ) {
			setTimeout( openModal, autoDelay );
		}
	} );
} )();