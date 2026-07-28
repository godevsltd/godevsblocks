import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface Author {
	id: number;
	name: string;
	slug: string;
}

let authorsCache: Author[] | null = null;

export function useAuthors(): Author[] {
	const [ authors, setAuthors ] = useState< Author[] >( authorsCache ?? [] );

	useEffect( () => {
		if ( authorsCache ) {
			setAuthors( authorsCache );
			return;
		}

		apiFetch< Author[] >( { path: '/goblocks/v1/query/authors' } )
			.then( ( result ) => {
				authorsCache = result;
				setAuthors( result );
			} )
			.catch( () => {} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return authors;
}
