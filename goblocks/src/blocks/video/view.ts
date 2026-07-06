( function () {
	'use strict';

	document
		.querySelectorAll< HTMLElement >( '.gb-video--lazy' )
		.forEach( ( el ) => {
			const btn =
				el.querySelector< HTMLButtonElement >( '.gb-video__facade' );
			if ( ! btn ) {
				return;
			}

			btn.addEventListener(
				'click',
				() => {
					const embedUrl = btn.dataset.embed;
					if ( ! embedUrl ) {
						return;
					}

					const iframe = document.createElement( 'iframe' );
					iframe.src = embedUrl;
					iframe.allow =
						'autoplay; encrypted-media; picture-in-picture';
					iframe.allowFullscreen = true;
					iframe.title = btn.getAttribute( 'aria-label' ) ?? 'Video';
					iframe.style.cssText =
						'width:100%;height:100%;border:0;position:absolute;inset:0;';

					el.innerHTML = '';
					el.appendChild( iframe );
					el.classList.remove( 'gb-video--lazy' );
				},
				{ once: true }
			);
		} );
} )();
