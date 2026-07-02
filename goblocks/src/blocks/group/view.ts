( function () {
	'use strict';

	// Guard: both group/view and column/view may load on the same page.
	// Only run once regardless of how many blocks enqueue this script.
	if ( document.body.hasAttribute( 'data-gb-anim-init' ) ) return;
	document.body.setAttribute( 'data-gb-anim-init', '' );

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	const ANIM_CLASSES = [
		'gb-anim-fade-in',
		'gb-anim-slide-up',
		'gb-anim-slide-left',
		'gb-anim-slide-right',
		'gb-anim-zoom-in',
	];

	const selector = ANIM_CLASSES.map( ( c ) => `.${ c }` ).join( ',' );
	const elements = Array.from( document.querySelectorAll< HTMLElement >( selector ) );
	if ( ! elements.length ) return;

	// Mark as JS-controlled so CSS pauses the animation until .is-animating is added.
	elements.forEach( ( el ) => el.setAttribute( 'data-gb-animated', '' ) );

	if ( reducedMotion ) {
		// Skip animation entirely — jump straight to visible final state.
		elements.forEach( ( el ) => el.classList.add( 'is-animating' ) );
		return;
	}

	if ( 'IntersectionObserver' in window ) {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						( entry.target as HTMLElement ).classList.add( 'is-animating' );
						observer.unobserve( entry.target );
					}
				} );
			},
			{ threshold: 0.1 }
		);
		elements.forEach( ( el ) => observer.observe( el ) );
	} else {
		elements.forEach( ( el ) => el.classList.add( 'is-animating' ) );
	}
} )();