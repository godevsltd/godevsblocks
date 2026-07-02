( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	document.querySelectorAll< HTMLElement >( '.gb-timeline' ).forEach( ( timeline ) => {
		const items = Array.from(
			timeline.querySelectorAll< HTMLElement >( ':scope > .gb-timeline-item' )
		);
		if ( ! items.length ) return;

		const animation     = timeline.dataset.animation    ?? 'fade-up';
		const isAlternating = timeline.classList.contains( 'gb-timeline--alternating' );

		if ( animation === 'none' ) return;

		// Mark container so CSS transitions activate.
		timeline.setAttribute( 'data-gb-animated', '' );

		if ( reducedMotion ) {
			items.forEach( ( item ) => item.classList.add( 'is-visible' ) );
			return;
		}

		// For 'slide' mode, set per-item direction before observing so CSS
		// can set the correct starting transform.
		if ( animation === 'slide' && isAlternating ) {
			items.forEach( ( item, i ) => {
				item.classList.add( i % 2 === 0 ? 'gb-tl-from-left' : 'gb-tl-from-right' );
			} );
		}

		if ( 'IntersectionObserver' in window ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							entry.target.classList.add( 'is-visible' );
							observer.unobserve( entry.target );
						}
					} );
				},
				{ threshold: 0.15 }
			);
			items.forEach( ( item ) => observer.observe( item ) );
		} else {
			items.forEach( ( item ) => item.classList.add( 'is-visible' ) );
		}
	} );
} )();