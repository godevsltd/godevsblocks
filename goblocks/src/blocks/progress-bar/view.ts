( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	function getTimingFunction( easing: string ): string {
		switch ( easing ) {
			case 'linear':      return 'linear';
			case 'ease-in-out': return 'cubic-bezier(0.4, 0, 0.6, 1)';
			case 'spring':      return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
			default:            return 'cubic-bezier(0, 0, 0.2, 1)'; // ease-out
		}
	}

	function animateBar( el: HTMLElement ): void {
		const fill = el.querySelector< HTMLElement >( '.gb-progress__fill' );
		if ( ! fill ) return;

		const targetWidth = fill.dataset.width    ?? '0%';
		const duration    = fill.dataset.duration ?? '800';
		const timingFn    = getTimingFunction( fill.dataset.easing ?? 'ease-out' );

		// If reduced motion: PHP already rendered the fill at the correct width.
		if ( reducedMotion ) {
			fill.style.width = targetWidth;
			return;
		}

		// Reset to 0 without transition (PHP rendered at target width).
		fill.style.transition = 'none';
		fill.style.width      = '0';

		// Double RAF: first frame commits the reset, second applies the transition.
		requestAnimationFrame( () => {
			requestAnimationFrame( () => {
				fill.style.transition = `width ${ duration }ms ${ timingFn }`;
				fill.style.width      = targetWidth;
			} );
		} );
	}

	const bars = document.querySelectorAll< HTMLElement >( '.gb-progress' );
	if ( ! bars.length ) return;

	if ( 'IntersectionObserver' in window ) {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						observer.unobserve( entry.target );
						animateBar( entry.target as HTMLElement );
					}
				} );
			},
			{ threshold: 0.2 }
		);
		bars.forEach( ( el ) => observer.observe( el ) );
	} else {
		// No IO support: animate all bars immediately (no scroll-trigger).
		bars.forEach( animateBar );
	}
} )();