import { useEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import {
	PaginationInspector,
	type PaginationAttributes,
} from './components/Inspector';

// ── Consumed context ───────────────────────────────────────────────────────────

// Block context values are passed as additional props by Gutenberg when
// declared via usesContext in block.json.
interface PaginationContext {
	'goblocks/paginationType'?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Edit component ────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
}: BlockEditProps< PaginationAttributes > & {
	context?: PaginationContext;
} ) {
	const { uniqueId, globalClasses, styles } = attributes;

	const paginationType = context?.[ 'goblocks/paginationType' ] ?? 'standard';

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection.
	useCssEngine( {
		blockSlug: 'pagination',
		uniqueId,
		styles,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< PaginationAttributes > ),
	} );

	const wrapperClass = clsx(
		'gb-pagination',
		uniqueId && `gb-pagination-${ uniqueId }`,
		`gb-pagination--${ paginationType }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	return (
		<>
			<PaginationInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				paginationType={ paginationType }
			/>

			<nav
				{ ...blockProps }
				aria-label={ __( 'Page navigation', 'goblocks' ) }
			>
				{ paginationType === 'standard' && (
					<ul className="gb-pagination__list">
						<li className="gb-pagination__item">
							{ /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
							<a className="gb-pagination__link is-prev" href="#">
								{ attributes.prevLabel ||
									__( '← Previous', 'goblocks' ) }
							</a>
						</li>
						<li className="gb-pagination__item">
							{ /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
							<a
								className="gb-pagination__link is-current"
								href="#"
							>
								1
							</a>
						</li>
						<li className="gb-pagination__item">
							{ /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
							<a className="gb-pagination__link" href="#">
								2
							</a>
						</li>
						<li className="gb-pagination__item">
							{ /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
							<a className="gb-pagination__link is-next" href="#">
								{ attributes.nextLabel ||
									__( 'Next →', 'goblocks' ) }
							</a>
						</li>
					</ul>
				) }

				{ paginationType === 'load-more' && (
					<button
						className="gb-pagination__load-more wp-element-button"
						type="button"
					>
						{ attributes.loadMoreLabel ||
							__( 'Load More', 'goblocks' ) }
					</button>
				) }

				{ paginationType === 'infinite' && (
					<p className="gb-pagination__infinite-hint">
						{ __(
							'Infinite scroll active — loads next page on scroll.',
							'goblocks'
						) }
					</p>
				) }
			</nav>
		</>
	);
}
