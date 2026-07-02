import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NoResultsAttributes {}

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/text', { content: __( 'No posts were found.', 'goblocks' ) } ],
];

export function Edit( _props: BlockEditProps< NoResultsAttributes > ) {
	const blockProps = useBlockProps( { className: 'gb-query-no-results' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: DEFAULT_TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<p className="gb-editor-notice">
				{ __( 'No Results — shown only when query returns 0 posts', 'goblocks' ) }
			</p>
			<div { ...innerBlocksProps } />
		</>
	);
}
