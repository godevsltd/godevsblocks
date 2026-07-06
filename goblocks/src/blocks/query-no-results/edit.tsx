import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useQueryPreview } from '../../hooks/useQueryPreview';
import { QUERY_DEFAULTS } from '../../types/query';
import type { QueryAttributes } from '../../types/query';

type NoResultsAttributes = Record< string, unknown >;

interface NoResultsContext {
	'goblocks/queryId'?: string;
	'goblocks/query'?: Partial< QueryAttributes >;
}

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/text', { content: __( 'No posts were found.', 'goblocks' ) } ],
];

export function Edit(
	props: BlockEditProps< NoResultsAttributes > & {
		context?: NoResultsContext;
	}
) {
	const { context } = props;

	const queryAttrs: Partial< QueryAttributes > = {
		...QUERY_DEFAULTS,
		...( context?.[ 'goblocks/query' ] ?? {} ),
	};

	const preview = useQueryPreview( queryAttrs );

	// When the query has results, render just a subtle collapsed indicator.
	// This prevents confusing users into thinking their query returned no posts.
	const hasResults = ! preview.isLoading && preview.total > 0;

	const blockProps = useBlockProps( { className: 'gb-query-no-results' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: DEFAULT_TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	if ( hasResults ) {
		return (
			<div
				{ ...blockProps }
				style={ {
					padding: '6px 12px',
					background: '#f6f7f7',
					borderLeft: '3px solid #ddd',
					borderRadius: '0 4px 4px 0',
					fontSize: '11px',
					color: '#8c8f94',
					fontStyle: 'italic',
				} }
			>
				{ __(
					'No Results Fallback — hidden (query has posts)',
					'goblocks'
				) }
			</div>
		);
	}

	// Query has no results or is loading — show the full editable template.
	return (
		<>
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					padding: '7px 12px',
					marginBottom: '6px',
					background: '#fef9ec',
					borderLeft: '3px solid #cc8800',
					borderRadius: '0 4px 4px 0',
					boxShadow: '0 1px 3px rgba(0,0,0,.06)',
				} }
			>
				<span
					style={ {
						fontSize: '10px',
						fontWeight: 700,
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
						color: '#cc8800',
					} }
				>
					{ __( 'No Results Fallback', 'goblocks' ) }
				</span>
				<span style={ { fontSize: '11.5px', color: '#8c8f94' } }>
					{ __(
						'— edit the message shown when query returns 0 posts',
						'goblocks'
					) }
				</span>
			</div>
			<div { ...innerBlocksProps } />
		</>
	);
}
