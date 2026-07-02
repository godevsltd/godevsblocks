import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

// ── Attribute type ─────────────────────────────────────────────────────────────

interface QueryLoopBlockAttributes {
	blockVersion: number;
}

// ── Default post template ──────────────────────────────────────────────────────

const POST_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/group', {} ],
];

// ── Edit component ─────────────────────────────────────────────────────────────

export function Edit( _props: BlockEditProps< QueryLoopBlockAttributes > ) {
	const blockProps = useBlockProps( { className: 'gb-query-loop' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: POST_TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<p
				style={ {
					margin: '0 0 8px',
					padding: '4px 8px',
					background: '#f0f0f0',
					fontSize: '11px',
					fontWeight: 600,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
				} }
			>
				{ __( 'Post template — repeated per result', 'goblocks' ) }
			</p>
			<div { ...innerBlocksProps } />
		</>
	);
}
