( function () {
	'use strict';

	const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	document.querySelectorAll< HTMLElement >( '.gb-toc' ).forEach( ( tocEl ) => {
		const levelsAttr     = tocEl.dataset.headings      ?? 'h2,h3';
		const smooth         = tocEl.dataset.smoothScroll  !== 'false';
		const offset         = parseInt( tocEl.dataset.scrollOffset ?? '80', 10 ) || 0;
		const startCollapsed = tocEl.dataset.startCollapsed === 'true';
		const listStyle      = tocEl.dataset.listStyle     ?? 'ordered';
		const levels         = levelsAttr.split( ',' ).map( ( l ) => l.trim() ).filter( Boolean );
		const selector       = levels.join( ',' );

		if ( ! selector ) return;

		const headingEls = Array.from( document.querySelectorAll< HTMLElement >( selector ) );
		if ( ! headingEls.length ) return;

		// ── ARIA label on nav ─────────────────────────────────────────────────

		if ( ! tocEl.hasAttribute( 'aria-label' ) ) {
			const titleEl = tocEl.querySelector( '.gb-toc__title' );
			tocEl.setAttribute( 'aria-label', titleEl?.textContent?.trim() || 'Table of Contents' );
		}

		// ── Assign IDs with deduplication ─────────────────────────────────────

		// Collect IDs already in the DOM so we don't collide with them.
		const usedIds = new Set< string >();
		headingEls.forEach( ( h ) => { if ( h.id ) usedIds.add( h.id ); } );

		headingEls.forEach( ( h, i ) => {
			if ( h.id ) return;
			const base = ( h.textContent ?? '' )
				.toLowerCase()
				.replace( /[^a-z0-9]+/g, '-' )
				.replace( /^-|-$/g, '' )
				|| `gb-heading-${ i }`;
			let id = base;
			let n  = 2;
			while ( usedIds.has( id ) ) { id = `${ base }-${ n++ }`; }
			h.id = id;
			usedIds.add( id );
		} );

		// ── Smooth scroll with offset ─────────────────────────────────────────

		if ( smooth ) {
			tocEl.addEventListener( 'click', ( e ) => {
				const target = ( e.target as HTMLElement ).closest< HTMLAnchorElement >( 'a[href^="#"]' );
				if ( ! target ) return;
				const href = target.getAttribute( 'href' );
				if ( ! href ) return;
				if ( href === '#' ) {
					e.preventDefault();
					window.scrollTo( { top: 0, behavior: reducedMotion ? 'instant' : 'smooth' } );
					return;
				}
				const dest = document.getElementById( href.slice( 1 ) );
				if ( ! dest ) return;
				e.preventDefault();
				const top = dest.getBoundingClientRect().top + window.scrollY - offset;
				window.scrollTo( { top, behavior: reducedMotion ? 'instant' : 'smooth' } );
			} );
		}

		// ── Build nested list ─────────────────────────────────────────────────

		function buildList( headings: HTMLElement[] ): HTMLElement {
			const tag  = listStyle === 'unordered' ? 'ul' : 'ol';
			const root = document.createElement( tag ) as HTMLElement;
			root.className = 'gb-toc__list';

			const stack: Array< { level: number; el: HTMLElement; li: HTMLLIElement | null } > = [
				{ level: 0, el: root, li: null },
			];

			headings.forEach( ( h ) => {
				const level = parseInt( h.tagName.slice( 1 ), 10 );
				const li    = document.createElement( 'li' );
				li.className = `gb-toc__item gb-toc__item--${ h.tagName.toLowerCase() }`;

				const a       = document.createElement( 'a' );
				a.className   = 'gb-toc__link';
				a.href        = `#${ h.id }`;
				a.textContent = h.textContent ?? '';
				li.appendChild( a );

				while ( stack.length > 1 ) {
					const top = stack[ stack.length - 1 ];
					if ( top === undefined || top.level < level ) break;
					stack.pop();
				}
				const parent = stack[ stack.length - 1 ]!;
				parent.el.appendChild( li );

				const subEl     = document.createElement( tag ) as HTMLElement;
				subEl.className = 'gb-toc__list';
				stack.push( { level, el: subEl, li } );
				( li as any )._sub = subEl;
			} );

			function attachSubs( el: HTMLElement ) {
				Array.from( el.children ).forEach( ( li ) => {
					const sub = ( li as any )._sub as HTMLElement | undefined;
					if ( sub?.children.length ) {
						li.appendChild( sub );
						attachSubs( sub );
					}
					delete ( li as any )._sub;
				} );
			}
			attachSubs( root );
			return root;
		}

		const existingList = tocEl.querySelector( '.gb-toc__list' );
		const list         = buildList( headingEls );

		if ( existingList ) {
			tocEl.replaceChild( list, existingList );
		} else {
			const backBtn = tocEl.querySelector( '.gb-toc__back-top' );
			if ( backBtn ) {
				tocEl.insertBefore( list, backBtn );
			} else {
				tocEl.appendChild( list );
			}
		}

		// ── Active heading scroll-spy via IntersectionObserver ────────────────
		//
		// Strategy: mark each heading as 'above' when it exits the root from the top
		// (i.e., has scrolled past our offset line). The active link is the LAST
		// heading in DOM order that is 'above' — the section the user is currently in.

		function updateActiveLink( activeId: string | null ): void {
			tocEl.querySelectorAll< HTMLAnchorElement >( '.gb-toc__link' ).forEach( ( a ) => {
				const href     = a.getAttribute( 'href' );
				const isActive = activeId !== null && href === `#${ activeId }`;
				a.classList.toggle( 'is-active', isActive );
				a.setAttribute( 'aria-current', isActive ? 'true' : 'false' );
			} );
		}

		const hasIO: boolean = 'IntersectionObserver' in window;
		if ( hasIO ) {
			// posMap: 'above' = heading has scrolled above the offset threshold line.
			const posMap = new Map< string, 'above' | 'below' >();
			headingEls.forEach( ( h ) => posMap.set( h.id, 'below' ) );

			const io = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						const id  = ( entry.target as HTMLElement ).id;
						const top = entry.boundingClientRect.top;
						if ( ! entry.isIntersecting && top < offset ) {
							// Heading exited from the top — it's above our threshold.
							posMap.set( id, 'above' );
						} else {
							// Heading is visible or still below the viewport.
							posMap.set( id, 'below' );
						}
					} );

					// Active = last heading marked 'above' in DOM order.
					let activeId: string | null = null;
					for ( const h of headingEls ) {
						if ( posMap.get( h.id ) === 'above' ) {
							activeId = h.id;
						}
					}
					updateActiveLink( activeId );
				},
				{ rootMargin: `-${ offset }px 0px 0px 0px`, threshold: 0 }
			);

			headingEls.forEach( ( h ) => io.observe( h ) );

		} else {
			// Fallback: RAF-throttled scroll listener.
			let rafId: number | null = null;

			function updateActive(): void {
				let active: HTMLElement | null = null;
				headingEls.forEach( ( h ) => {
					if ( h.getBoundingClientRect().top <= offset + 10 ) active = h;
				} );
				updateActiveLink( ( active as HTMLElement | null )?.id ?? null );
			}

			function scheduleUpdate() {
				if ( rafId !== null ) return;
				rafId = requestAnimationFrame( () => { updateActive(); rafId = null; } );
			}

			window.addEventListener( 'scroll', scheduleUpdate, { passive: true } );
			updateActive();
		}

		// ── Collapsible toggle ────────────────────────────────────────────────

		if ( tocEl.dataset.collapsible === 'true' ) {
			const titleEl = tocEl.querySelector< HTMLElement >( '.gb-toc__title' );
			if ( titleEl ) {
				const listId = 'gb-toc-list-' + ( tocEl.id || Math.random().toString( 36 ).slice( 2 ) );
				titleEl.setAttribute( 'role', 'button' );
				titleEl.setAttribute( 'tabindex', '0' );
				titleEl.setAttribute( 'aria-expanded', startCollapsed ? 'false' : 'true' );
				titleEl.setAttribute( 'aria-controls', listId );
				titleEl.style.cursor = 'pointer';
				list.id = listId;

				if ( startCollapsed ) {
					tocEl.classList.add( 'is-collapsed' );
				}

				function toggle() {
					const collapsed = tocEl.classList.toggle( 'is-collapsed' );
					titleEl!.setAttribute( 'aria-expanded', String( ! collapsed ) );
				}

				titleEl.addEventListener( 'click', toggle );
				titleEl.addEventListener( 'keydown', ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); toggle(); }
				} );
			}
		}
	} );
} )();