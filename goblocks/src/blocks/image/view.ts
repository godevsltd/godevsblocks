( function () {
	'use strict';

	// ── Collect all lightbox-enabled images on the page ───────────────────────

	const lightboxItems = Array.from(
		document.querySelectorAll< HTMLAnchorElement >( 'a[data-gb-lightbox]' )
	);
	if ( ! lightboxItems.length ) return;

	// ── Shared lightbox overlay (one instance, reused for all images) ─────────

	let overlay:        HTMLElement | null         = null;
	let overlayImg:     HTMLImageElement | null    = null;
	let overlayCaption: HTMLElement | null         = null;
	let overlayClose:   HTMLButtonElement | null   = null;
	let overlayPrev:    HTMLButtonElement | null   = null;
	let overlayNext:    HTMLButtonElement | null   = null;
	let overlayCounter: HTMLElement | null         = null;
	let previousFocus:  HTMLElement | null         = null;
	let currentIndex    = 0;

	const SVG_CHEVRON_LEFT  = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><polyline points="13,4 7,10 13,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const SVG_CHEVRON_RIGHT = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><polyline points="7,4 13,10 7,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

	function buildOverlay(): void {
		if ( overlay ) return;

		overlay = document.createElement( 'div' );
		overlay.className = 'gb-lb';
		overlay.setAttribute( 'role', 'dialog' );
		overlay.setAttribute( 'aria-modal', 'true' );
		overlay.setAttribute( 'aria-label', 'Image lightbox' );
		overlay.setAttribute( 'hidden', '' );
		overlay.innerHTML = `
			<div class="gb-lb__backdrop"></div>
			<button class="gb-lb__nav gb-lb__prev" aria-label="Previous image">${ SVG_CHEVRON_LEFT }</button>
			<button class="gb-lb__nav gb-lb__next" aria-label="Next image">${ SVG_CHEVRON_RIGHT }</button>
			<div class="gb-lb__dialog">
				<div class="gb-lb__topbar">
					<p class="gb-lb__counter" aria-live="polite" aria-atomic="true"></p>
					<button class="gb-lb__close" aria-label="Close lightbox">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
							<line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>
				<div class="gb-lb__spinner" aria-hidden="true">
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
						<circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
						<path d="M16 4 A12 12 0 0 1 28 16" stroke="white" stroke-width="3" stroke-linecap="round"/>
					</svg>
				</div>
				<img class="gb-lb__img" src="" alt="" />
				<p class="gb-lb__caption"></p>
			</div>`;

		overlayImg     = overlay.querySelector< HTMLImageElement >( '.gb-lb__img' );
		overlayCaption = overlay.querySelector< HTMLElement >( '.gb-lb__caption' );
		overlayClose   = overlay.querySelector< HTMLButtonElement >( '.gb-lb__close' );
		overlayPrev    = overlay.querySelector< HTMLButtonElement >( '.gb-lb__prev' );
		overlayNext    = overlay.querySelector< HTMLButtonElement >( '.gb-lb__next' );
		overlayCounter = overlay.querySelector< HTMLElement >( '.gb-lb__counter' );

		document.body.appendChild( overlay );

		// Close on backdrop click.
		overlay.querySelector( '.gb-lb__backdrop' )!.addEventListener( 'click', close );
		overlayClose!.addEventListener( 'click', close );
		overlayPrev!.addEventListener( 'click', () => navigate( -1 ) );
		overlayNext!.addEventListener( 'click', () => navigate( 1 ) );

		// Keyboard: Escape closes; arrows navigate; Tab stays inside.
		overlay.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' )     { close();        return; }
			if ( e.key === 'ArrowLeft' )  { navigate( -1 ); return; }
			if ( e.key === 'ArrowRight' ) { navigate( 1 );  return; }
			if ( e.key === 'Tab' )        { trapFocus( e ); }
		} );

		// Touch/swipe navigation.
		let touchStartX = 0;
		overlay.addEventListener( 'touchstart', ( e: TouchEvent ) => {
			touchStartX = e.touches[ 0 ]?.clientX ?? 0;
		}, { passive: true } );
		overlay.addEventListener( 'touchend', ( e: TouchEvent ) => {
			const dx = ( e.changedTouches[ 0 ]?.clientX ?? 0 ) - touchStartX;
			if ( Math.abs( dx ) > 50 ) navigate( dx < 0 ? 1 : -1 );
		}, { passive: true } );
	}

	function updateNav(): void {
		const count  = lightboxItems.length;
		const single = count <= 1;
		if ( overlayPrev    ) overlayPrev.hidden    = single;
		if ( overlayNext    ) overlayNext.hidden    = single;
		if ( overlayCounter ) overlayCounter.textContent = single ? '' : `${ currentIndex + 1 } / ${ count }`;
		if ( overlay ) overlay.classList.toggle( 'gb-lb--single', single );
	}

	function loadImage( src: string, alt: string, caption: string, effect: string ): void {
		if ( ! overlay || ! overlayImg || ! overlayCaption ) return;

		overlay.dataset.effect = effect;
		overlayImg.src         = '';
		overlayImg.alt         = alt;
		overlayCaption.textContent = caption;
		overlayCaption.hidden  = ! caption;

		overlay.classList.remove( 'is-open' );

		const spinner = overlay.querySelector< HTMLElement >( '.gb-lb__spinner' );
		if ( spinner )   spinner.hidden  = false;
		overlayImg.style.opacity = '0';

		const img    = new Image();
		img.onload   = () => showImage( src, spinner );
		img.onerror  = () => showImage( src, spinner );
		img.src      = src;
	}

	function showImage( src: string, spinner: HTMLElement | null ): void {
		if ( overlayImg ) {
			overlayImg.src           = src;
			overlayImg.style.opacity = '1';
		}
		if ( spinner ) spinner.hidden = true;
		overlay!.classList.add( 'is-open' );
	}

	function openAt( index: number ): void {
		buildOverlay();
		currentIndex = index;
		updateNav();

		previousFocus = document.activeElement as HTMLElement;
		overlay!.removeAttribute( 'hidden' );
		document.body.style.overflow = 'hidden';

		const item    = lightboxItems[ index ];
		const src     = item?.getAttribute( 'href' ) ?? '';
		const alt     = item?.dataset.gbAlt          ?? '';
		const caption = item?.dataset.gbCaption      ?? '';
		const effect  = item?.dataset.gbEffect       ?? 'zoom';

		loadImage( src, alt, caption, effect );

		requestAnimationFrame( () => overlayClose!.focus() );
	}

	function navigate( delta: number ): void {
		const count = lightboxItems.length;
		if ( count <= 1 ) return;
		currentIndex = ( currentIndex + delta + count ) % count;
		updateNav();

		const item    = lightboxItems[ currentIndex ];
		const src     = item?.getAttribute( 'href' ) ?? '';
		const alt     = item?.dataset.gbAlt          ?? '';
		const caption = item?.dataset.gbCaption      ?? '';
		const effect  = item?.dataset.gbEffect       ?? 'zoom';

		loadImage( src, alt, caption, effect );
	}

	function close(): void {
		if ( ! overlay ) return;
		overlay.classList.remove( 'is-open' );

		const onEnd = () => {
			overlay!.setAttribute( 'hidden', '' );
			document.body.style.overflow = '';
			if ( previousFocus ) { previousFocus.focus(); previousFocus = null; }
			overlay!.removeEventListener( 'transitionend', onEnd );
		};
		overlay.addEventListener( 'transitionend', onEnd );
		setTimeout( () => {
			if ( overlay && ! overlay.hasAttribute( 'hidden' ) ) onEnd();
		}, 400 );
	}

	function trapFocus( e: KeyboardEvent ): void {
		const focusable = Array.from(
			overlay!.querySelectorAll< HTMLElement >( 'button:not([hidden]), [href], input, [tabindex]:not([tabindex="-1"])' )
		).filter( ( el ) => ! el.hasAttribute( 'disabled' ) );
		if ( ! focusable.length ) return;
		const first = focusable[ 0 ]!;
		const last  = focusable[ focusable.length - 1 ]!;
		if ( e.shiftKey && document.activeElement === first ) {
			e.preventDefault(); last.focus();
		} else if ( ! e.shiftKey && document.activeElement === last ) {
			e.preventDefault(); first.focus();
		}
	}

	// ── Wire up each lightbox trigger ─────────────────────────────────────────

	lightboxItems.forEach( ( trigger, index ) => {
		trigger.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			openAt( index );
		} );
	} );
} )();