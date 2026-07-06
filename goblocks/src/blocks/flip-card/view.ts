( function () {
	'use strict';

	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	document
		.querySelectorAll< HTMLElement >( '.gb-flip-card' )
		.forEach( ( card ) => {
			const inner = card.querySelector< HTMLElement >(
				'.gb-flip-card__inner'
			);
			const direction = card.dataset.direction ?? 'horizontal';
			const onClick = card.dataset.trigger === 'click';

			if ( ! inner ) {
				return;
			}

			if ( 'vertical' === direction ) {
				card.classList.add( 'gb-flip-card--vertical' );
			}

			// Disable 3D animation for users who prefer reduced motion.
			if ( reducedMotion ) {
				card.classList.add( 'gb-flip-card--no-anim' );
			}

			// ── Click / keyboard interaction ──────────────────────────────────────

			if ( onClick ) {
				// Make the card focusable and expose it as a toggle button.
				card.setAttribute( 'role', 'button' );
				card.setAttribute( 'tabindex', '0' );
				card.setAttribute( 'aria-pressed', 'false' );
				card.setAttribute(
					'aria-label',
					card.dataset.ariaLabel ??
						'Flip card — press to reveal the back side'
				);

				function toggle() {
					const flipped = card.classList.toggle( 'is-flipped' );
					card.setAttribute( 'aria-pressed', String( flipped ) );
				}

				card.addEventListener( 'click', toggle );
				card.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						e.preventDefault();
						toggle();
					}
				} );
			} else {
				// Hover mode — add tabindex so sighted keyboard-only users can Tab
				// to the card. CSS :focus-within then shows the back face.
				card.setAttribute( 'tabindex', '0' );
			}

			// ── Prevent CTA link clicks from flipping the card (click mode) ───────

			const cta =
				card.querySelector< HTMLAnchorElement >( '.gb-flip-card__cta' );
			if ( cta ) {
				cta.addEventListener( 'click', ( e ) => e.stopPropagation() );
			}
		} );
} )();
