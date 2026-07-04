( function () {
	'use strict';

	function pad( n: number ): string {
		return String( n ).padStart( 2, '0' );
	}

	/**
	 * Convert a naive "YYYY-MM-DDTHH:mm" string into a UTC timestamp,
	 * interpreting it as a local time in the given IANA timezone.
	 *
	 * When no timezone is provided, falls back to browser-local interpretation
	 * (backward-compatible with blocks saved before the timezone attribute).
	 */
	function getTargetMs( targetStr: string, tz: string ): number {
		if ( ! tz ) {
			// No timezone: browser parses "YYYY-MM-DDTHH:mm" as local time.
			return new Date( targetStr ).getTime();
		}

		const match = targetStr.match( /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/ );
		if ( ! match ) return NaN;
		const [ , Y, Mo, D, h = '0', mi = '0' ] = match;

		// Treat the raw datetime as UTC to get an initial probe timestamp.
		const naive = Date.UTC( +Y!, +Mo! - 1, +D!, +h, +mi );
		const probe = new Date( naive );

		// Format the probe in the target timezone to read the tz-local wall time.
		const parts = new Intl.DateTimeFormat( 'en-CA', {
			timeZone:  tz,
			year:      'numeric',
			month:     '2-digit',
			day:       '2-digit',
			hour:      '2-digit',
			minute:    '2-digit',
			hour12:    false,
		} ).formatToParts( probe );

		const get = ( type: string ) =>
			parseInt( parts.find( ( p ) => p.type === type )?.value ?? '0', 10 );

		const hVal = get( 'hour' );

		// UTC equivalent of what the tz clock shows for the probe.
		const tzLocal = Date.UTC(
			get( 'year' ), get( 'month' ) - 1, get( 'day' ),
			hVal === 24 ? 0 : hVal, // handle midnight edge-case
			get( 'minute' )
		);

		// Shift: naive - tzLocal gives the UTC offset at that moment.
		return naive + ( naive - tzLocal );
	}

	// ── Human-readable time remaining ─────────────────────────────────────────

	function formatRemaining( diff: number, el: HTMLElement ): string {
		const days    = Math.floor( diff / 86400000 );
		const hours   = Math.floor( ( diff % 86400000 ) / 3600000 );
		const minutes = Math.floor( ( diff % 3600000  ) / 60000 );
		const seconds = Math.floor( ( diff % 60000    ) / 1000 );

		const hasDays    = !! el.querySelector( '.gb-countdown__days' );
		const hasHours   = !! el.querySelector( '.gb-countdown__hours' );
		const hasMinutes = !! el.querySelector( '.gb-countdown__minutes' );
		const hasSeconds = !! el.querySelector( '.gb-countdown__seconds' );

		const parts: string[] = [];
		if ( hasDays    && days    ) parts.push( `${ days } day${ days !== 1 ? 's' : '' }` );
		if ( hasHours   && hours   ) parts.push( `${ hours } hour${ hours !== 1 ? 's' : '' }` );
		if ( hasMinutes && minutes ) parts.push( `${ minutes } minute${ minutes !== 1 ? 's' : '' }` );
		// Include seconds only when under one minute so announcements aren't too granular.
		if ( hasSeconds && diff < 60000 ) parts.push( `${ seconds } second${ seconds !== 1 ? 's' : '' }` );

		return parts.length ? parts.join( ', ' ) + ' remaining' : 'Less than a minute remaining';
	}

	document.querySelectorAll< HTMLElement >( '.gb-countdown' ).forEach( ( el ) => {
		const targetStr     = el.dataset.target        ?? '';
		const tz            = el.dataset.tz            ?? '';
		const expiredMsg    = el.dataset.expired        ?? "Time's up!";
		const expiredAction = el.dataset.expiredAction  ?? 'message';
		const expiredUrl    = el.dataset.expiredUrl    ?? '';

		if ( ! targetStr ) return;

		const targetMs = getTargetMs( targetStr, tz );
		if ( isNaN( targetMs ) ) return;

		// ── Screen-reader live region ─────────────────────────────────────────

		const srEl = document.createElement( 'span' );
		srEl.setAttribute( 'role', 'status' );
		srEl.setAttribute( 'aria-live', 'polite' );
		srEl.setAttribute( 'aria-atomic', 'true' );
		// Visually hidden, accessible to screen readers.
		srEl.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
		el.appendChild( srEl );

		let srLastAnnounced = 0;

		function announce( text: string ): void {
			srLastAnnounced = Date.now();
			// Toggle textContent to force a re-announcement even for the same text.
			srEl.textContent = '';
			srEl.textContent = text;
		}

		function onExpired(): void {
			srEl.textContent = expiredMsg;

			if ( expiredAction === 'redirect' && expiredUrl ) {
				window.location.href = expiredUrl;
				return;
			}
			if ( expiredAction === 'hide' ) {
				el.style.display = 'none';
				return;
			}
			// 'message' (default)
			el.innerHTML = `<p class="gb-countdown__expired">${ expiredMsg }</p>`;
		}

		let firstTick = true;

		function update(): void {
			const diff = targetMs - Date.now();

			if ( diff <= 0 ) {
				clearInterval( timer );
				onExpired();
				return;
			}

			const days    = Math.floor( diff / 86400000 );
			const hours   = Math.floor( ( diff % 86400000 ) / 3600000 );
			const minutes = Math.floor( ( diff % 3600000  ) / 60000 );
			const seconds = Math.floor( ( diff % 60000    ) / 1000 );

			const daysEl    = el.querySelector< HTMLElement >( '.gb-countdown__days .gb-countdown__number' );
			const hoursEl   = el.querySelector< HTMLElement >( '.gb-countdown__hours .gb-countdown__number' );
			const minutesEl = el.querySelector< HTMLElement >( '.gb-countdown__minutes .gb-countdown__number' );
			const secondsEl = el.querySelector< HTMLElement >( '.gb-countdown__seconds .gb-countdown__number' );

			if ( daysEl    ) daysEl.textContent    = pad( days );
			if ( hoursEl   ) hoursEl.textContent   = pad( hours );
			if ( minutesEl ) minutesEl.textContent = pad( minutes );
			if ( secondsEl ) secondsEl.textContent = pad( seconds );

			// Announce at coarse intervals so screen readers aren't overwhelmed.
			// Interval: every 60 s normally; every 10 s when under a minute left;
			// always on the very first tick.
			const announceInterval = diff < 60000 ? 10000 : 60000;
			if ( firstTick || Date.now() - srLastAnnounced >= announceInterval ) {
				firstTick = false;
				announce( formatRemaining( diff, el ) );
			}
		}

		// Create the interval first so `timer` is defined inside the closure
		// before the initial `update()` call. If the target date has already
		// passed, `update()` calls clearInterval(timer) + onExpired() immediately.
		const timer = setInterval( update, 1000 );
		update();
	} );
} )();