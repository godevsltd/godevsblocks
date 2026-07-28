import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { QueryAttributes, PostSummary } from '../types/query';

export interface QueryPreviewResult {
	posts: PostSummary[];
	total: number;
	pages: number;
	isLoading: boolean;
	error: Error | null;
}

/**
 * Convert block QueryAttributes to the WP_Query-compatible body expected
 * by POST /goblocks/v1/query/preview.
 * @param attrs
 */
function toPreviewBody(
	attrs: Partial< QueryAttributes >
): Record< string, unknown > {
	const body: Record< string, unknown > = {};

	if ( attrs.postType?.length ) {
		body.post_type = attrs.postType;
	}
	if ( attrs.perPage ) {
		body.posts_per_page = Math.min( attrs.perPage, 12 );
	}
	if ( attrs.orderBy ) {
		body.orderby = attrs.orderBy;
	}
	if ( attrs.order ) {
		body.order = attrs.order;
	}
	if ( attrs.author?.length ) {
		body.author__in = attrs.author;
	}
	if ( attrs.search ) {
		body.s = attrs.search;
	}
	if ( attrs.offset ) {
		body.offset = attrs.offset;
	}

	if ( attrs.taxQuery?.length ) {
		body.tax_query = attrs.taxQuery.map( ( f ) => ( {
			taxonomy: f.taxonomy,
			field: f.field,
			terms: f.terms,
			operator: f.operator,
		} ) );
	}

	return body;
}

/**
 * Debounced query preview hook.
 *
 * Fires 600 ms after the last attribute change to avoid flooding the REST API
 * on every keystroke. Cancels in-flight requests when attrs change.
 * @param queryAttrs
 */
export function useQueryPreview(
	queryAttrs: Partial< QueryAttributes >
): QueryPreviewResult {
	const [ posts, setPosts ] = useState< PostSummary[] >( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ pages, setPages ] = useState( 0 );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< Error | null >( null );

	const debounceRef = useRef< ReturnType< typeof setTimeout > >();
	const abortRef = useRef< AbortController >();

	// Stringify attrs so useEffect dependency is stable across renders.
	const attrsKey = JSON.stringify( queryAttrs );

	useEffect( () => {
		clearTimeout( debounceRef.current );

		debounceRef.current = setTimeout( () => {
			abortRef.current?.abort();
			abortRef.current = new AbortController();

			setIsLoading( true );
			setError( null );

			apiFetch< {
				posts: PostSummary[];
				total: number;
				total_pages: number;
			} >( {
				path: '/goblocks/v1/query/preview',
				method: 'POST',
				data: toPreviewBody( queryAttrs ),
			} )
				.then( ( result ) => {
					setPosts( result.posts );
					setTotal( result.total );
					setPages( result.total_pages );
					setIsLoading( false );
				} )
				.catch( ( err: Error ) => {
					if ( err?.name !== 'AbortError' ) {
						setError( err );
						setIsLoading( false );
					}
				} );
		}, 600 );

		return () => {
			clearTimeout( debounceRef.current );
			abortRef.current?.abort();
		};
	}, [ attrsKey ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return { posts, total, pages, isLoading, error };
}
