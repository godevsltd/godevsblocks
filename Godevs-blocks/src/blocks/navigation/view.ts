( function () {
	'use strict';

	document
		.querySelectorAll< HTMLElement >( '.gb-navigation' )
		.forEach( ( nav ) => {
			const toggle = nav.querySelector< HTMLButtonElement >(
				'.gb-navigation__toggle'
			);
			const menu = nav.querySelector< HTMLElement >(
				'.gb-navigation__menu'
			);

			// ── Mobile hamburger ──────────────────────────────────────────────────
			if ( toggle && menu ) {
				function openMenu(): void {
					toggle!.setAttribute( 'aria-expanded', 'true' );
					menu!.classList.add( 'is-open' );
					// Move focus to the first focusable link in the menu.
					menu!.querySelector< HTMLElement >( 'a, button' )?.focus();
				}
				function closeMenu(): void {
					toggle!.setAttribute( 'aria-expanded', 'false' );
					menu!.classList.remove( 'is-open' );
				}

				toggle.addEventListener( 'click', () => {
					if ( toggle.getAttribute( 'aria-expanded' ) === 'true' ) {
						closeMenu();
					} else {
						openMenu();
					}
				} );

				document.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
					if (
						e.key === 'Escape' &&
						menu.classList.contains( 'is-open' )
					) {
						closeMenu();
						toggle.focus();
					}
				} );

				document.addEventListener( 'click', ( e: MouseEvent ) => {
					if ( ! nav.contains( e.target as Node ) ) {
						closeMenu();
					}
				} );

				// Focus trap: cycle Tab within open mobile menu.
				menu.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
					if (
						e.key !== 'Tab' ||
						! menu.classList.contains( 'is-open' )
					) {
						return;
					}

					const focusable = Array.from(
						menu.querySelectorAll< HTMLElement >( 'a, button' )
					).filter( ( el ) => ! el.closest( '[hidden]' ) );

					if ( focusable.length === 0 ) {
						return;
					}

					const first = focusable[ 0 ]!;
					const last = focusable[ focusable.length - 1 ]!;

					if ( e.shiftKey ) {
						if ( menu.ownerDocument.activeElement === first ) {
							e.preventDefault();
							last.focus();
						}
					} else if ( menu.ownerDocument.activeElement === last ) {
						e.preventDefault();
						first.focus();
					}
				} );
			}

			// ── Dropdown submenus ─────────────────────────────────────────────────
			const subToggles = Array.from(
				nav.querySelectorAll< HTMLButtonElement >(
					'.gb-navigation__submenu-toggle'
				)
			);

			subToggles.forEach( ( btn ) => {
				const li = btn.closest< HTMLLIElement >(
					'li.menu-item-has-children'
				);
				const subMenu = li?.querySelector< HTMLElement >( '.sub-menu' );
				if ( ! li || ! subMenu ) {
					return;
				}

				function openSub(): void {
					btn.setAttribute( 'aria-expanded', 'true' );
					li!.classList.add( 'is-open' );
					subMenu!.removeAttribute( 'hidden' );
				}
				function closeSub(): void {
					btn.setAttribute( 'aria-expanded', 'false' );
					li!.classList.remove( 'is-open' );
					subMenu!.setAttribute( 'hidden', '' );
				}

				// Start closed.
				subMenu.setAttribute( 'hidden', '' );

				btn.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					if ( li.classList.contains( 'is-open' ) ) {
						closeSub();
					} else {
						openSub();
					}
				} );

				// Desktop hover (only when not in mobile mode).
				li.addEventListener( 'mouseenter', () => {
					if ( ! isMobile( nav ) ) {
						openSub();
					}
				} );
				li.addEventListener( 'mouseleave', () => {
					if ( ! isMobile( nav ) ) {
						closeSub();
					}
				} );

				// Close sub on Escape.
				li.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
					if ( e.key === 'Escape' ) {
						closeSub();
						li.querySelector< HTMLAnchorElement >( 'a' )?.focus();
					}
				} );

				// Close when clicking outside.
				document.addEventListener( 'click', ( e: MouseEvent ) => {
					if ( ! li.contains( e.target as Node ) ) {
						closeSub();
					}
				} );
			} );

			// Keyboard arrow navigation through top-level items.
			const topItems = Array.from(
				nav.querySelectorAll< HTMLAnchorElement >(
					'.gb-navigation__menu > li > a'
				)
			);
			topItems.forEach( ( a, i ) => {
				a.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
					if ( e.key === 'ArrowRight' || e.key === 'ArrowDown' ) {
						e.preventDefault();
						topItems[ ( i + 1 ) % topItems.length ]?.focus();
					}
					if ( e.key === 'ArrowLeft' || e.key === 'ArrowUp' ) {
						e.preventDefault();
						topItems[
							( i - 1 + topItems.length ) % topItems.length
						]?.focus();
					}
				} );
			} );

			// ── Scroll-hide behavior ──────────────────────────────────────────────
			if ( nav.dataset.scrollHide === 'true' ) {
				let lastY = window.scrollY;
				let ticking = false;

				function handleScroll(): void {
					const y = window.scrollY;
					// Only start hiding after scrolling past the nav's own height.
					if ( y > nav.offsetHeight ) {
						nav.classList.toggle( 'is-hidden', y > lastY );
					} else {
						nav.classList.remove( 'is-hidden' );
					}
					lastY = y;
					ticking = false;
				}

				window.addEventListener(
					'scroll',
					() => {
						if ( ! ticking ) {
							requestAnimationFrame( handleScroll );
							ticking = true;
						}
					},
					{ passive: true }
				);
			}
		} );

	function isMobile( nav: HTMLElement ): boolean {
		const bp = parseInt( nav.dataset.breakpoint ?? '768', 10 );
		return window.innerWidth <= bp;
	}
} )();
