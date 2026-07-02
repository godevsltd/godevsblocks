( function () {
	'use strict';

	document.querySelectorAll< HTMLElement >( '.gb-icon--trigger-scroll' ).forEach( ( el ) => {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						el.classList.add( 'is-animated' );
						observer.disconnect();
					}
				} );
			},
			{ threshold: 0.3 }
		);
		observer.observe( el );
	} );
} )();