( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	document.querySelectorAll< HTMLElement >( '.gb-star-rating[data-animate]' ).forEach( ( wrapper ) => {
		const stars = Array.from( wrapper.querySelectorAll< HTMLElement >( '.gb-star' ) );
		if ( ! stars.length ) return;

		// Mark so CSS pre-hides the stars.
		wrapper.setAttribute( 'data-gb-animated', '' );

		if ( reducedMotion ) {
			stars.forEach( ( s ) => s.classList.add( 'is-visible' ) );
			return;
		}

		if ( 'IntersectionObserver' in window ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( ! entry.isIntersecting ) return;
						observer.unobserve( entry.target );
						stars.forEach( ( star, i ) => {
							setTimeout( () => star.classList.add( 'is-visible' ), i * 90 );
						} );
					} );
				},
				{ threshold: 0.5 }
			);
			observer.observe( wrapper );
		} else {
			stars.forEach( ( s ) => s.classList.add( 'is-visible' ) );
		}
	} );
} )();