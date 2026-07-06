( function () {
	'use strict';

	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	// ── Entrance animation ────────────────────────────────────────────────────

	const animateCards = Array.from(
		document.querySelectorAll< HTMLElement >( '.gb-pricing[data-animate]' )
	);

	if ( animateCards.length ) {
		// Group sibling cards so stagger delay is relative to index within each group.
		const groups = new Map< Element, HTMLElement[] >();
		animateCards.forEach( ( card ) => {
			const parent = card.parentElement;
			if ( ! parent ) {
				return;
			}
			if ( ! groups.has( parent ) ) {
				groups.set( parent, [] );
			}
			groups.get( parent )!.push( card );
		} );

		groups.forEach( ( group ) => {
			group.forEach( ( card, i ) => {
				card.setAttribute( 'data-gb-animated', '' );
				card.style.transitionDelay = `${ i * 80 }ms`;
			} );
		} );

		if ( reducedMotion ) {
			animateCards.forEach( ( c ) => c.classList.add( 'is-visible' ) );
		} else if ( 'IntersectionObserver' in window ) {
			const observer = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							const el = entry.target as HTMLElement;
							el.classList.add( 'is-visible' );
							el.style.transitionDelay = '';
							observer.unobserve( el );
						}
					} );
				},
				{ threshold: 0.15 }
			);
			animateCards.forEach( ( c ) => observer.observe( c ) );
		} else {
			animateCards.forEach( ( c ) => c.classList.add( 'is-visible' ) );
		}
	}

	// ── Monthly / Annual toggle ───────────────────────────────────────────────

	const cards = Array.from(
		document.querySelectorAll< HTMLElement >(
			'.gb-pricing[data-price-alt]'
		)
	);
	if ( ! cards.length ) {
		return;
	}

	const firstCard = cards[ 0 ];
	if ( ! firstCard ) {
		return;
	}
	const parent = firstCard.parentElement;
	if ( ! parent ) {
		return;
	}

	const savingsLabel = firstCard.dataset.savingsLabel || '';
	const savingsBadge = savingsLabel
		? ` <span class="gb-pricing-toggle__badge">${ savingsLabel }</span>`
		: '';

	const wrapper = document.createElement( 'div' );
	wrapper.className = 'gb-pricing-toggle';
	wrapper.setAttribute( 'role', 'group' );
	wrapper.setAttribute( 'aria-label', 'Billing period' );
	wrapper.innerHTML =
		`<button class="gb-pricing-toggle__btn gb-pricing-toggle__btn--active" data-period="monthly" aria-pressed="true">Monthly</button>` +
		`<button class="gb-pricing-toggle__btn" data-period="annual" aria-pressed="false">Annual${ savingsBadge }</button>`;

	parent.insertBefore( wrapper, firstCard );

	wrapper.addEventListener( 'click', ( e ) => {
		const btn = ( e.target as HTMLElement ).closest< HTMLButtonElement >(
			'[data-period]'
		);
		if ( ! btn ) {
			return;
		}

		const isAnnual = btn.dataset.period === 'annual';

		wrapper
			.querySelectorAll< HTMLButtonElement >( '[data-period]' )
			.forEach( ( b ) => {
				const active = b === btn;
				b.classList.toggle( 'gb-pricing-toggle__btn--active', active );
				b.setAttribute( 'aria-pressed', String( active ) );
			} );

		cards.forEach( ( card ) =>
			card.classList.toggle( 'gb-pricing--annual', isAnnual )
		);
	} );
} )();
