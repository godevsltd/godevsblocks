import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface PostType {
	slug: string;
	label: string;
	icon: string | null;
}

// Module-level cache — survives re-renders, cleared on page unload.
let postTypesCache: PostType[] | null = null;

export function usePostTypes(): PostType[] {
	const [ postTypes, setPostTypes ] = useState< PostType[] >(
		postTypesCache ?? []
	);

	useEffect( () => {
		if ( postTypesCache ) {
			setPostTypes( postTypesCache );
			return;
		}

		apiFetch< PostType[] >( { path: '/goblocks/v1/query/post-types' } )
			.then( ( result ) => {
				postTypesCache = result;
				setPostTypes( result );
			} )
			.catch( () => {} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return postTypes;
}
