type LottiePlayerEl = HTMLElement & { play(): void; pause(): void; stop(): void };

( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	document.querySelectorAll< HTMLElement >( '.gb-lottie' ).forEach( ( wrapper ) => {
		const trigger = wrapper.dataset.trigger ?? 'auto';
		const player  = wrapper.querySelector< LottiePlayerEl >( 'lottie-player' );
		if ( ! player ) return;

		function withPlayer( fn: ( p: LottiePlayerEl ) => void ): void {
			if ( typeof player!.play === 'function' ) {
				fn( player! );
			} else {
				player!.addEventListener( 'ready', () => fn( player! ), { once: true } );
			}
		}

		// Reduced motion: stop auto-playing animations and disable motion triggers.
		// Click trigger is still honoured — the user explicitly requests it.
		if ( reducedMotion && trigger !== 'click' ) {
			if ( trigger === 'auto' ) {
				// The lottie-player element has `autoplay` from PHP — stop it once ready.
				withPlayer( ( p ) => p.stop() );
			}
			return;
		}

		// 'auto' — web component's own autoplay attribute handles it.
		if ( trigger === 'auto' ) return;

		if ( trigger === 'hover' ) {
			wrapper.addEventListener( 'mouseenter', () => withPlayer( ( p ) => p.play() ) );
			wrapper.addEventListener( 'mouseleave', () => withPlayer( ( p ) => p.stop() ) );
			// Also respond to keyboard focus so the animation is accessible without a mouse.
			wrapper.addEventListener( 'focusin',  () => withPlayer( ( p ) => p.play() ) );
			wrapper.addEventListener( 'focusout', () => withPlayer( ( p ) => p.stop() ) );
		}

		if ( trigger === 'scroll' ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							withPlayer( ( p ) => p.play() );
							observer.disconnect();
						}
					} );
				},
				{ threshold: 0.3 }
			);
			observer.observe( wrapper );
		}

		if ( trigger === 'click' ) {
			let playing = false;
			wrapper.style.cursor = 'pointer';
			wrapper.setAttribute( 'role', 'button' );
			wrapper.setAttribute( 'tabindex', '0' );
			wrapper.setAttribute( 'aria-pressed', 'false' );
			wrapper.setAttribute( 'aria-label', 'Play animation' );

			function toggle(): void {
				withPlayer( ( p ) => {
					if ( playing ) {
						p.pause();
						playing = false;
						wrapper.setAttribute( 'aria-pressed', 'false' );
						wrapper.setAttribute( 'aria-label', 'Play animation' );
					} else {
						p.play();
						playing = true;
						wrapper.setAttribute( 'aria-pressed', 'true' );
						wrapper.setAttribute( 'aria-label', 'Pause animation' );
					}
				} );
			}

			wrapper.addEventListener( 'click', toggle );
			wrapper.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					toggle();
				}
			} );
		}
	} );
} )();