( function () {
	'use strict';

	document.querySelectorAll< HTMLElement >( '.gb-social-share' ).forEach( ( el ) => {
		el.addEventListener( 'click', ( e ) => {
			const btn = ( e.target as HTMLElement ).closest< HTMLElement >( '.gb-social-share__btn' );
			if ( ! btn ) return;

			// ── Copy to clipboard ─────────────────────────────────────────────
			const copyUrl = btn.dataset.copyUrl;
			if ( copyUrl !== undefined ) {
				e.preventDefault();
				const url      = copyUrl || window.location.href;
				const origLabel = btn.dataset.origLabel ?? 'Copy link';
				const labelEl  = btn.querySelector< HTMLElement >( '.gb-social-share__label' );

				const markCopied = () => {
					btn.classList.add( 'gb-social-share__btn--copied' );
					if ( labelEl ) {
						const prev = labelEl.textContent ?? '';
						labelEl.textContent = 'Copied!';
						setTimeout( () => {
							labelEl.textContent = prev;
							btn.classList.remove( 'gb-social-share__btn--copied' );
						}, 2000 );
					} else {
						btn.setAttribute( 'aria-label', 'Copied!' );
						setTimeout( () => {
							btn.setAttribute( 'aria-label', origLabel );
							btn.classList.remove( 'gb-social-share__btn--copied' );
						}, 2000 );
					}
				};

				if ( navigator.clipboard ) {
					navigator.clipboard.writeText( url ).then( markCopied ).catch( () => fallbackCopy( url, markCopied ) );
				} else {
					fallbackCopy( url, markCopied );
				}
				return;
			}

			// ── Popup window ──────────────────────────────────────────────────
			if ( btn.dataset.popup === 'true' ) {
				e.preventDefault();
				const href = btn instanceof HTMLAnchorElement ? btn.href : ( btn.dataset.href ?? '' );
				if ( href ) {
					window.open( href, 'gb-share-popup', 'width=620,height=520,resizable=yes,scrollbars=yes' );
				}
			}
		} );
	} );

	function fallbackCopy( text: string, onDone: () => void ): void {
		const ta = document.createElement( 'textarea' );
		ta.value = text;
		ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
		document.body.appendChild( ta );
		ta.focus();
		ta.select();
		try { document.execCommand( 'copy' ); onDone(); } catch ( _e ) { /* silent */ }
		document.body.removeChild( ta );
	}
} )();