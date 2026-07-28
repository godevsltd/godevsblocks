( function () {
	'use strict';

	type Effect = 'slide' | 'fade' | 'zoom' | 'cards';

	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	document
		.querySelectorAll< HTMLElement >( '.gb-slider' )
		.forEach( ( slider ) => {
			const track =
				slider.querySelector< HTMLElement >( '.gb-slider__track' );

			if ( ! track ) {
				return;
			}

			const slides = Array.from( track.children ) as HTMLElement[];
			if ( ! slides.length ) {
				return;
			}

			const prevBtn =
				slider.querySelector< HTMLButtonElement >( '.gb-slider__prev' );
			const nextBtn =
				slider.querySelector< HTMLButtonElement >( '.gb-slider__next' );
			const pauseBtn =
				slider.querySelector< HTMLButtonElement >(
					'.gb-slider__pause'
				);
			const dotsEl =
				slider.querySelector< HTMLElement >( '.gb-slider__dots' );
			const counterCurrent = slider.querySelector< HTMLElement >(
				'.gb-slider__counter-current'
			);
			const counterTotal = slider.querySelector< HTMLElement >(
				'.gb-slider__counter-total'
			);
			const progressBar = slider.querySelector< HTMLElement >(
				'.gb-slider__progress-bar'
			);

			// ── Config from data attributes ─────────────────────────────────────

			const effect = ( slider.dataset.effect || 'slide' ) as Effect;
			const spv = Math.max(
				1,
				parseInt( slider.dataset.spv || '1', 10 ) || 1
			);
			const slideGap = Math.max(
				0,
				parseInt( slider.dataset.gap || '0', 10 ) || 0
			);
			const autoplay = slider.dataset.autoplay === 'true';
			const delay = parseInt( slider.dataset.delay || '3000', 10 );
			const loop = slider.dataset.loop === 'true';
			const pauseOnHover = slider.dataset.pauseHover !== 'false';
			const dur = reducedMotion
				? 0
				: parseInt( slider.dataset.duration || '450', 10 );
			const ease = reducedMotion
				? 'linear'
				: slider.dataset.easing || 'ease';

			let current = 0;
			let timer: ReturnType< typeof setInterval > | null = null;
			let paused = false;
			let dragging = false;
			let inView = false;

			const maxIndex =
				effect === 'slide' && spv > 1
					? Math.max( 0, slides.length - spv )
					: slides.length - 1;

			const slideTransition = `transform ${ dur }ms ${ ease }`;
			const fadeTransition = `opacity ${ dur }ms ${ ease }`;
			const zoomTransition = `opacity ${ dur }ms ${ ease }, transform ${ dur }ms ${ ease }`;

			// ── ARIA setup ──────────────────────────────────────────────────────

			slider.setAttribute( 'role', 'region' );
			slider.setAttribute( 'aria-roledescription', 'carousel' );
			if ( ! slider.hasAttribute( 'aria-label' ) ) {
				slider.setAttribute( 'aria-label', 'Image slider' );
			}

			slides.forEach( ( s, i ) => {
				s.setAttribute( 'role', 'group' );
				s.setAttribute( 'aria-roledescription', 'slide' );
				s.setAttribute(
					'aria-label',
					`${ i + 1 } of ${ slides.length }`
				);
			} );

			const liveRegion = document.createElement( 'div' );
			liveRegion.setAttribute( 'aria-live', 'polite' );
			liveRegion.setAttribute( 'aria-atomic', 'true' );
			liveRegion.className = 'gb-slider__live-region';
			liveRegion.style.cssText =
				'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
			slider.appendChild( liveRegion );

			// ── Counter setup ───────────────────────────────────────────────────

			if ( counterTotal ) {
				counterTotal.textContent = String( slides.length );
			}

			// ── Slide setup based on effect ─────────────────────────────────────

			if ( effect === 'fade' ) {
				track.style.display = 'grid';
				slides.forEach( ( s, i ) => {
					s.style.gridArea = '1 / 1';
					s.style.opacity = i === 0 ? '1' : '0';
					s.style.transition = fadeTransition;
					s.style.pointerEvents = i === 0 ? '' : 'none';
					s.style.zIndex = i === 0 ? '1' : '0';
				} );
			} else if ( effect === 'zoom' ) {
				track.style.display = 'grid';
				slides.forEach( ( s, i ) => {
					s.style.gridArea = '1 / 1';
					s.style.opacity = i === 0 ? '1' : '0';
					s.style.transform = i === 0 ? 'scale(1)' : 'scale(0.9)';
					s.style.transition = zoomTransition;
					s.style.pointerEvents = i === 0 ? '' : 'none';
					s.style.zIndex = i === 0 ? '1' : '0';
				} );
			} else if ( effect === 'cards' ) {
				track.style.display = 'flex';
				track.style.transition = slideTransition;
				slides.forEach( ( s ) => {
					s.style.flex = '0 0 100%';
					s.style.transition = `transform ${ dur }ms ${ ease }, opacity ${ dur }ms ${ ease }`;
				} );
			} else {
				// Slide (default) — handle gap-aware sizing.
				track.style.display = 'flex';
				track.style.transition = slideTransition;
				if ( slideGap > 0 ) {
					// Measure and set pixel flex-basis so the gap is accounted for.
					const clip = track.parentElement as HTMLElement;
					const avail = clip.offsetWidth || 0;
					const sw =
						spv > 1
							? ( avail - slideGap * ( spv - 1 ) ) / spv
							: avail;
					slides.forEach( ( s ) => {
						s.style.flex = `0 0 ${ sw }px`;
					} );
				} else {
					slides.forEach( ( s ) => {
						s.style.flex = `0 0 ${ 100 / spv }%`;
					} );
				}
			}

			// ── Dots ────────────────────────────────────────────────────────────

			const dots: HTMLButtonElement[] = [];
			if ( dotsEl ) {
				dotsEl.innerHTML = '';
				for ( let i = 0; i <= maxIndex; i++ ) {
					const dot = document.createElement( 'button' );
					dot.className = 'gb-slider__dot';
					dot.type = 'button';
					dot.setAttribute( 'aria-label', `Go to slide ${ i + 1 }` );
					dot.addEventListener(
						'click',
						( () => {
							const idx = i;
							return () => {
								goTo( idx );
								resetTimer();
								resetProgress();
							};
						} )()
					);
					dotsEl.appendChild( dot );
					dots.push( dot );
				}
			}

			function updateDots(): void {
				dots.forEach( ( d, i ) => {
					d.classList.toggle( 'is-active', i === current );
					d.setAttribute(
						'aria-current',
						i === current ? 'true' : 'false'
					);
				} );
			}

			function updateCounter(): void {
				if ( counterCurrent ) {
					counterCurrent.textContent = String( current + 1 );
				}
			}

			// ── Progress bar ─────────────────────────────────────────────────────

			function startProgress(): void {
				if ( ! progressBar || reducedMotion ) {
					return;
				}
				progressBar.style.transition = 'none';
				progressBar.style.width = '0%';
				// Double rAF ensures the transition reset is painted before starting.
				requestAnimationFrame( () => {
					requestAnimationFrame( () => {
						progressBar.style.transition = `width ${ delay }ms linear`;
						progressBar.style.width = '100%';
					} );
				} );
			}

			function resetProgress(): void {
				if ( ! progressBar ) {
					return;
				}
				progressBar.style.transition = 'none';
				progressBar.style.width = '0%';
			}

			// ── Effect rendering ─────────────────────────────────────────────────

			function getSlideStep(): number {
				if ( slideGap > 0 && slides[ 0 ] ) {
					return slides[ 0 ].offsetWidth + slideGap;
				}
				return 0;
			}

			function applyEffect( index: number ): void {
				if ( ! track ) {
					return;
				}

				if ( effect === 'fade' ) {
					slides.forEach( ( s, i ) => {
						const active = i === index;
						s.style.opacity = active ? '1' : '0';
						s.style.pointerEvents = active ? '' : 'none';
						s.style.zIndex = active ? '1' : '0';
					} );
				} else if ( effect === 'zoom' ) {
					slides.forEach( ( s, i ) => {
						const active = i === index;
						s.style.opacity = active ? '1' : '0';
						s.style.transform = active ? 'scale(1)' : 'scale(0.9)';
						s.style.pointerEvents = active ? '' : 'none';
						s.style.zIndex = active ? '1' : '0';
					} );
				} else if ( effect === 'cards' ) {
					const step = getSlideStep();
					track.style.transform =
						step > 0
							? `translateX(-${ index * step }px)`
							: `translateX(-${ index * 100 }%)`;
					slides.forEach( ( s, i ) => {
						const dist = Math.abs( i - index );
						if ( dist === 0 ) {
							s.style.transform = 'scale(1)';
							s.style.opacity = '1';
						} else if ( dist === 1 ) {
							s.style.transform = 'scale(0.87)';
							s.style.opacity = '0.6';
						} else {
							s.style.transform = 'scale(0.74)';
							s.style.opacity = '0.3';
						}
					} );
				} else {
					// Slide.
					const step = getSlideStep();
					track.style.transform =
						step > 0
							? `translateX(-${ index * step }px)`
							: `translateX(-${ index * ( 100 / spv ) }%)`;
				}
			}

			// ── Navigation ───────────────────────────────────────────────────────

			function goTo( index: number ): void {
				let next = index;
				if ( loop ) {
					next =
						( ( next % slides.length ) + slides.length ) %
						slides.length;
					if ( effect === 'slide' && spv > 1 ) {
						next = Math.max( 0, Math.min( maxIndex, next ) );
					}
				} else {
					next = Math.max( 0, Math.min( maxIndex, next ) );
				}
				current = next;
				applyEffect( current );
				updateDots();
				updateCounter();
				liveRegion.textContent = `Slide ${ current + 1 } of ${
					slides.length
				}`;
			}

			// Initialise.
			goTo( 0 );

			if ( prevBtn ) {
				prevBtn.addEventListener( 'click', () => {
					if ( ! dragging ) {
						goTo( current - 1 );
						resetTimer();
						resetProgress();
					}
				} );
			}
			if ( nextBtn ) {
				nextBtn.addEventListener( 'click', () => {
					if ( ! dragging ) {
						goTo( current + 1 );
						resetTimer();
						resetProgress();
					}
				} );
			}

			// Keyboard: Arrow keys + Home/End when slider or a child is focused.
			slider.setAttribute(
				'tabindex',
				slider.getAttribute( 'tabindex' ) || '0'
			);
			slider.addEventListener( 'keydown', ( e: KeyboardEvent ) => {
				switch ( e.key ) {
					case 'ArrowLeft':
						e.preventDefault();
						goTo( current - 1 );
						resetTimer();
						resetProgress();
						break;
					case 'ArrowRight':
						e.preventDefault();
						goTo( current + 1 );
						resetTimer();
						resetProgress();
						break;
					case 'Home':
						e.preventDefault();
						goTo( 0 );
						resetTimer();
						resetProgress();
						break;
					case 'End':
						e.preventDefault();
						goTo( maxIndex );
						resetTimer();
						resetProgress();
						break;
				}
			} );

			// ── Touch / pointer swipe ────────────────────────────────────────────

			let touchStartX = 0;
			let touchDeltaX = 0;
			let touchStartY = 0;
			let isScrolling: boolean | null = null;

			slider.addEventListener(
				'touchstart',
				( e: TouchEvent ) => {
					const t = e.changedTouches.item( 0 );
					if ( ! t ) {
						return;
					}
					touchStartX = t.clientX;
					touchStartY = t.clientY;
					touchDeltaX = 0;
					isScrolling = null;
					dragging = false;
				},
				{ passive: true }
			);

			slider.addEventListener(
				'touchmove',
				( e: TouchEvent ) => {
					const t = e.changedTouches.item( 0 );
					if ( ! t ) {
						return;
					}
					const dx = t.clientX - touchStartX;
					const dy = t.clientY - touchStartY;
					if ( isScrolling === null ) {
						isScrolling = Math.abs( dy ) > Math.abs( dx );
					}
					if ( ! isScrolling ) {
						touchDeltaX = dx;
						dragging = true;
					}
				},
				{ passive: true }
			);

			slider.addEventListener(
				'touchend',
				() => {
					if ( ! isScrolling && Math.abs( touchDeltaX ) > 40 ) {
						goTo( touchDeltaX < 0 ? current + 1 : current - 1 );
						resetTimer();
						resetProgress();
					}
					touchDeltaX = 0;
					setTimeout( () => {
						dragging = false;
					}, 60 );
				},
				{ passive: true }
			);

			// ── Autoplay ─────────────────────────────────────────────────────────

			function startTimer(): void {
				if ( timer ) {
					clearInterval( timer );
				}
				if ( ! inView ) {
					return;
				}
				timer = setInterval( () => {
					if ( ! paused ) {
						goTo( current + 1 );
						startProgress();
					}
				}, delay );
			}

			function stopTimer(): void {
				if ( timer ) {
					clearInterval( timer );
					timer = null;
				}
			}

			function resetTimer(): void {
				stopTimer();
				if ( autoplay && ! paused && inView ) {
					startTimer();
				}
			}

			if ( autoplay ) {
				if ( pauseOnHover ) {
					slider.addEventListener( 'mouseenter', () => {
						paused = true;
					} );
					slider.addEventListener( 'mouseleave', () => {
						paused = false;
						if ( inView ) {
							startTimer();
							startProgress();
						}
					} );
					slider.addEventListener( 'focusin', () => {
						paused = true;
					} );
					slider.addEventListener( 'focusout', ( e: FocusEvent ) => {
						if ( ! slider.contains( e.relatedTarget as Node ) ) {
							paused = false;
							if ( inView ) {
								startTimer();
								startProgress();
							}
						}
					} );
				}
			}

			// ── Pause/play button (WCAG 2.2.2) ─────────────────────────────────────
			// A persistent visible control to pause/resume autoplay.

			function syncPauseBtn(): void {
				if ( ! pauseBtn ) {
					return;
				}
				if ( paused ) {
					pauseBtn.setAttribute( 'aria-label', 'Play slideshow' );
					pauseBtn.setAttribute( 'aria-pressed', 'true' );
					pauseBtn.classList.add( 'is-paused' );
				} else {
					pauseBtn.setAttribute( 'aria-label', 'Pause slideshow' );
					pauseBtn.setAttribute( 'aria-pressed', 'false' );
					pauseBtn.classList.remove( 'is-paused' );
				}
			}

			if ( pauseBtn && autoplay ) {
				pauseBtn.addEventListener( 'click', () => {
					paused = ! paused;
					syncPauseBtn();
					if ( paused ) {
						stopTimer();
						resetProgress();
					} else if ( inView ) {
						startTimer();
						startProgress();
					}
				} );
			}

			// ── IntersectionObserver: autoplay only when visible ─────────────────

			if ( autoplay ) {
				if ( 'IntersectionObserver' in window ) {
					const io = new IntersectionObserver(
						( [ entry ] ) => {
							inView = entry!.isIntersecting;
							if ( inView && ! paused ) {
								startTimer();
								startProgress();
							} else {
								stopTimer();
								resetProgress();
							}
						},
						{ threshold: 0.3 }
					);
					io.observe( slider );
				} else {
					// Fallback: start immediately when IntersectionObserver is unavailable.
					inView = true;
					startTimer();
					startProgress();
				}
			}

			// ── Page visibility: stop when tab is hidden ─────────────────────────

			document.addEventListener( 'visibilitychange', () => {
				if ( document.hidden ) {
					stopTimer();
				} else if ( autoplay && inView && ! paused ) {
					startTimer();
					startProgress();
				}
			} );
		} );
} )();
