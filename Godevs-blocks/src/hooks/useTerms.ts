import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface Term {
	id: number;
	slug: string;
	name: string;
	count: number;
}

export function useTerms( taxonomy: string, search = '' ): Term[] {
	const [ terms, setTerms ] = useState< Term[] >( [] );
	const debounceRef = useRef< ReturnType< typeof setTimeout > >();

	useEffect( () => {
		if ( ! taxonomy ) {
			setTerms( [] );
			return;
		}

		clearTimeout( debounceRef.current );

		debounceRef.current = setTimeout(
			() => {
				const params = new URLSearchParams( { taxonomy } );
				if ( search ) {
					params.set( 'search', search );
				}

				apiFetch< Term[] >( {
					path: `/goblocks/v1/query/terms?${ params }`,
				} )
					.then( setTerms )
					.catch( () => {} );
			},
			search ? 300 : 0
		);

		return () => clearTimeout( debounceRef.current );
	}, [ taxonomy, search ] );

	return terms;
}
