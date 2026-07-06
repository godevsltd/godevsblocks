import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { QueryInspector } from './components/Inspector';
import { QUERY_DEFAULTS, LAYOUT_DEFAULTS } from '../../types/query';
import type { QueryAttributes, QueryLayout } from '../../types/query';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ─────────────────────────────────────────────────────────────

interface QueryBlockAttributes {
	uniqueId: string;
	query: QueryAttributes;
	layout: QueryLayout;
	align: string;
	paginationType: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Default inner block template ───────────────────────────────────────────────

const INNER_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/query-loop', {} ],
	[ 'goblocks/query-no-results', {} ],
	[ 'goblocks/pagination', {} ],
];

// ── Edit component ────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< QueryBlockAttributes > ) {
	const {
		uniqueId,
		query,
		layout,
		align,
		paginationType,
		globalClasses,
		styles,
	} = attributes;

	const mergedQuery: QueryAttributes = { ...QUERY_DEFAULTS, ...query };
	const mergedLayout: QueryLayout = { ...LAYOUT_DEFAULTS, ...layout };

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection.
	useCssEngine( {
		blockSlug: 'query',
		uniqueId,
		styles,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< QueryBlockAttributes > ),
	} );

	const wrapperClass = clsx(
		'gb-query',
		uniqueId && `gb-query-${ uniqueId }`,
		align && `align${ align }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: INNER_TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<QueryInspector
				query={ mergedQuery }
				layout={ mergedLayout }
				paginationType={ paginationType ?? 'standard' }
				styles={ styles }
				globalClasses={ globalClasses ?? [] }
				setQuery={ ( patch ) =>
					setAttributes( { query: { ...mergedQuery, ...patch } } )
				}
				setLayout={ ( l ) => setAttributes( { layout: l } ) }
				setPagination={ ( type ) =>
					setAttributes( { paginationType: type } )
				}
				setStyles={ ( patch ) => setAttributes( { styles: patch } ) }
				setGlobalClasses={ ( classes ) =>
					setAttributes( { globalClasses: classes } )
				}
			/>

			<div { ...innerBlocksProps } />
		</>
	);
}
