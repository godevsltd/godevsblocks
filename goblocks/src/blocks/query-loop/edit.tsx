import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useQueryPreview } from '../../hooks/useQueryPreview';
import { QUERY_DEFAULTS, LAYOUT_DEFAULTS } from '../../types/query';
import type { QueryAttributes, QueryLayout } from '../../types/query';

// ── Attribute type ─────────────────────────────────────────────────────────────

interface QueryLoopBlockAttributes {
	blockVersion: number;
}

interface QueryLoopContext {
	'goblocks/queryId'?: string;
	'goblocks/query'?: Partial< QueryAttributes >;
	'goblocks/paginationType'?: string;
	'goblocks/layout'?: Partial< QueryLayout >;
}

// ── Default post template ──────────────────────────────────────────────────────
// Uses WordPress core post-template blocks — they consume postId/postType context
// injected by QueryLoop.php per post via new WP_Block($parsed, $merged_context).

const POST_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[
		'core/post-featured-image',
		{ isLink: true, aspectRatio: '16/9', scale: 'cover' },
	],
	[ 'core/post-title', { isLink: true, level: 3 } ],
	[ 'core/post-date', {} ],
	[ 'core/post-excerpt', { moreText: '' } ],
];

// ── Edit component ─────────────────────────────────────────────────────────────

export function Edit(
	props: BlockEditProps< QueryLoopBlockAttributes > & {
		context?: QueryLoopContext;
	}
) {
	const { context } = props;

	const queryAttrs: Partial< QueryAttributes > = {
		...QUERY_DEFAULTS,
		...( context?.[ 'goblocks/query' ] ?? {} ),
	};

	const layoutCtx: QueryLayout = {
		...LAYOUT_DEFAULTS,
		...( context?.[ 'goblocks/layout' ] ?? {} ),
	};

	const preview = useQueryPreview( queryAttrs );

	const isGrid = layoutCtx.type === 'grid';
	const columns = Math.max( 1, Math.min( 4, layoutCtx.columns ) );

	const hasResults = ! preview.isLoading && preview.total > 0;
	const noResults =
		! preview.isLoading && ! preview.error && preview.total === 0;

	let accentColor: string;
	if ( hasResults ) {
		accentColor = '#0073aa';
	} else if ( noResults ) {
		accentColor = '#cc8800';
	} else {
		accentColor = '#8c8f94';
	}
	let bgColor: string;
	if ( hasResults ) {
		bgColor = '#e8f3fa';
	} else if ( noResults ) {
		bgColor = '#fef9ec';
	} else {
		bgColor = '#f6f7f7';
	}
	let countText: string | null;
	if ( preview.isLoading ) {
		countText = null;
	} else if ( hasResults ) {
		countText = `${ preview.total } ${
			preview.total === 1
				? __( 'post found', 'goblocks' )
				: __( 'posts found', 'goblocks' )
		}`;
	} else if ( noResults ) {
		countText = __( 'No posts match this query', 'goblocks' );
	} else {
		countText = __( 'Preview unavailable', 'goblocks' );
	}

	// Apply grid layout to the inner blocks wrapper in the editor.
	const gridStyle: React.CSSProperties = isGrid
		? {
				display: 'grid',
				gridTemplateColumns: `repeat(${ columns }, 1fr)`,
				gap: '1.5rem',
		  }
		: { display: 'flex', flexDirection: 'column', gap: '1.5rem' };

	const blockProps = useBlockProps( {
		className: 'gb-query-loop',
		style: gridStyle,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: POST_TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			{ /* ── Preview bar ──────────────────────────────────────────────── */ }
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: '10px',
					padding: '7px 12px',
					marginBottom: '10px',
					background: bgColor,
					borderLeft: `3px solid ${ accentColor }`,
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
						color: accentColor,
					} }
				>
					{ __( 'Post Template', 'goblocks' ) }
				</span>

				{ isGrid && (
					<span
						style={ {
							fontSize: '10px',
							background: accentColor,
							color: '#fff',
							borderRadius: '3px',
							padding: '1px 6px',
							fontWeight: 600,
						} }
					>
						{ `${ columns } ${ __( 'col', 'goblocks' ) }` }
					</span>
				) }

				<span
					style={ {
						marginLeft: 'auto',
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						fontSize: '12px',
						fontWeight: 500,
						color: accentColor,
					} }
				>
					{ preview.isLoading && (
						<span
							style={ {
								display: 'inline-flex',
								alignItems: 'center',
							} }
						>
							<Spinner />
						</span>
					) }
					{ countText }
				</span>
			</div>

			{ /* ── Live post preview list ─────────────────────────────────── */ }
			{ preview.posts.length > 0 && (
				<div
					style={ {
						marginBottom: '10px',
						border: '1px solid #e2e4e7',
						borderRadius: '4px',
						overflow: 'hidden',
						fontSize: '11.5px',
					} }
				>
					{ preview.posts.slice( 0, 3 ).map( ( p, i ) => (
						<div
							key={ p.id }
							style={ {
								display: 'flex',
								alignItems: 'baseline',
								gap: '12px',
								padding: '6px 12px',
								background: i % 2 === 0 ? '#fff' : '#fafafa',
								borderBottom:
									i < Math.min( 2, preview.posts.length - 1 )
										? '1px solid #ebebeb'
										: 'none',
							} }
						>
							<span
								style={ {
									flex: 1,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									color: '#1e1e1e',
									fontWeight: 500,
								} }
							>
								{ p.title || __( '(no title)', 'goblocks' ) }
							</span>
							<span
								style={ {
									flexShrink: 0,
									color: '#757575',
									fontSize: '11px',
								} }
							>
								{ p.date }
							</span>
						</div>
					) ) }
					{ preview.total > 3 && (
						<div
							style={ {
								padding: '5px 12px',
								background: '#f6f7f7',
								color: '#757575',
								fontSize: '11px',
								textAlign: 'center',
							} }
						>
							{ `+${ preview.total - 3 } ${ __(
								'more posts',
								'goblocks'
							) }` }
						</div>
					) }
				</div>
			) }

			{ /* ── Editable post template (inner blocks) ───────────────────── */ }
			<div { ...innerBlocksProps } />
		</>
	);
}
