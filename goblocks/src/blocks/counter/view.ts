( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	// ── Easing functions ──────────────────────────────────────────────────────

	type EasingFn = ( t: number ) => number;

	function getEasing( key: string ): EasingFn {
		switch ( key ) {
			case 'linear':
				return ( t ) => t;
			case 'ease-in-out':
				return ( t ) => t < 0.5
					? 4 * t * t * t
					: 1 - Math.pow( -2 * t + 2, 3 ) / 2;
			case 'spring':
				return ( t ) => {
					if ( t === 0 ) return 0;
					if ( t === 1 ) return 1;
					const c4 = ( 2 * Math.PI ) / 3;
					return Math.pow( 2, -10 * t ) * Math.sin( ( t * 10 - 0.75 ) * c4 ) + 1;
				};
			default: // 'ease-out'
				return ( t ) => 1 - Math.pow( 1 - t, 3 );
		}
	}

	// ── Number formatter ──────────────────────────────────────────────────────

	function formatNumber( num: number, decimals: number, separator: string ): string {
		const fixed  = num.toFixed( decimals );
		if ( ! separator ) return fixed;
		const dotIdx  = fixed.indexOf( '.' );
		const intPart = dotIdx >= 0 ? fixed.slice( 0, dotIdx ) : fixed;
		const decPart = dotIdx >= 0 ? fixed.slice( dotIdx + 1 ) : '';
		const formatted = intPart.replace( /\B(?=(\d{3})+(?!\d))/g, separator );
		return decPart
			? formatted + ( separator === '.' ? ',' : '.' ) + decPart
			: formatted;
	}

	// ── Core animation ────────────────────────────────────────────────────────

	function animateCounter( el: HTMLElement ): void {
		const numberEl = el.querySelector< HTMLElement >( '.gb-counter__number' );
		if ( ! numberEl ) return;
		const numEl = numberEl;

		const target    = parseFloat( el.dataset.target    ?? '0' );
		const startFrom = parseFloat( el.dataset.startFrom ?? '0' );
		const duration  = parseInt(   el.dataset.duration  ?? '2000', 10 );
		const prefix    = el.dataset.prefix    ?? '';
		const suffix    = el.dataset.suffix    ?? '';
		const decimals  = parseInt( el.dataset.decimals  ?? '0',  10 );
		const separator = el.dataset.separator ?? '';
		const countDown = el.dataset.countDown === 'true';
		const easeFn    = getEasing( el.dataset.easing ?? 'ease-out' );

		const from = countDown ? Math.max( startFrom, target ) : startFrom;
		const to   = countDown ? Math.min( target, startFrom ) : target;

		// If reduced motion: PHP already rendered the final value — nothing to do.
		if ( reducedMotion ) return;

		// Reset the displayed number to the start value before animating.
		numberEl.textContent = prefix + formatNumber( from, decimals, separator ) + suffix;

		let startTime: number | null = null;

		function step( timestamp: number ): void {
			if ( ! startTime ) startTime = timestamp;
			const elapsed  = timestamp - startTime;
			const progress = Math.min( elapsed / duration, 1 );
			const current  = from + ( to - from ) * easeFn( progress );
			numEl.textContent = prefix + formatNumber( current, decimals, separator ) + suffix;
			if ( progress < 1 ) {
				requestAnimationFrame( step );
			} else {
				numEl.textContent = prefix + formatNumber( to, decimals, separator ) + suffix;
			}
		}

		requestAnimationFrame( step );
	}

	// ── Wire up IntersectionObserver ──────────────────────────────────────────

	const counters = document.querySelectorAll< HTMLElement >( '.gb-counter' );
	if ( ! counters.length ) return;

	if ( 'IntersectionObserver' in window ) {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						observer.unobserve( entry.target );
						animateCounter( entry.target as HTMLElement );
					}
				} );
			},
			{ threshold: 0.3 }
		);
		counters.forEach( ( el ) => observer.observe( el ) );
	} else {
		counters.forEach( animateCounter );
	}
} )();