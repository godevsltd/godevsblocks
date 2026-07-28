import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface Taxonomy {
	slug: string;
	label: string;
}

const taxonomyCache: Record< string, Taxonomy[] > = {};

export function useTaxonomies( postType: string ): Taxonomy[] {
	const [ taxonomies, setTaxonomies ] = useState< Taxonomy[] >(
		taxonomyCache[ postType ] ?? []
	);

	useEffect( () => {
		if ( ! postType ) {
			setTaxonomies( [] );
			return;
		}

		if ( taxonomyCache[ postType ] ) {
			setTaxonomies( taxonomyCache[ postType ] );
			return;
		}

		apiFetch< Taxonomy[] >( {
			path: `/goblocks/v1/query/taxonomies?post_type=${ encodeURIComponent(
				postType
			) }`,
		} )
			.then( ( result ) => {
				taxonomyCache[ postType ] = result;
				setTaxonomies( result );
			} )
			.catch( () => {} );
	}, [ postType ] );

	return taxonomies;
}
