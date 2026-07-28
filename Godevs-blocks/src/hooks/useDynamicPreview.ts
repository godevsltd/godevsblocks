import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface TagPreviewResult {
	previews: Record< string, string >;
	isLoading: boolean;
	error: Error | null;
}

/**
 * Fetch editor preview values for a list of dynamic tags.
 *
 * Tags are serialized as `{slug}` or `{slug|key:val}` strings,
 * matching the tag syntax in DYNAMIC-CONTENT.md.
 *
 * Results are cached per postId+tags combination for 5 minutes.
 * @param postId
 * @param tags
 */
export function useDynamicPreview(
	postId: number,
	tags: string[]
): TagPreviewResult {
	const [ previews, setPreviews ] = useState< Record< string, string > >(
		{}
	);
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< Error | null >( null );
	const abortRef = useRef< AbortController >();

	useEffect( () => {
		if ( ! postId || tags.length === 0 ) {
			setPreviews( {} );
			return;
		}

		abortRef.current?.abort();
		abortRef.current = new AbortController();

		setIsLoading( true );
		setError( null );

		// Resolve each tag in parallel.
		Promise.all(
			tags.map( ( tagString ) => {
				// Parse `{slug|key:val|...}` → slug + options.
				const inner = tagString.replace( /^\{|\}$/g, '' );
				const parts = inner.split( '|' );
				const slug = parts[ 0 ] ?? '';
				const options: Record< string, string > = {};

				for ( let i = 1; i < parts.length; i++ ) {
					const part = parts[ i ];
					if ( ! part ) {
						continue;
					}
					const colonIdx = part.indexOf( ':' );
					if ( colonIdx > -1 ) {
						options[ part.slice( 0, colonIdx ) ] = part.slice(
							colonIdx + 1
						);
					}
				}

				return apiFetch< { preview: string } >( {
					path: '/goblocks/v1/dynamic-content/preview',
					method: 'POST',
					data: { tag: slug, post_id: postId, options },
				} ).then( ( res ) => ( {
					tag: tagString,
					preview: res.preview,
				} ) );
			} )
		)
			.then( ( results ) => {
				const map: Record< string, string > = {};
				for ( const r of results ) {
					map[ r.tag ] = r.preview;
				}
				setPreviews( map );
				setIsLoading( false );
			} )
			.catch( ( err: Error ) => {
				if ( err?.name !== 'AbortError' ) {
					setError( err );
					setIsLoading( false );
				}
			} );

		return () => abortRef.current?.abort();
	}, [ postId, JSON.stringify( tags ) ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return { previews, isLoading, error };
}
