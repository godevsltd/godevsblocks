/**
 * TagPicker — searchable list of available dynamic content tags.
 *
 * Fetches the tag list from GET /goblocks/v1/dynamic-content/tags and
 * renders a grouped, searchable picker. On selection it calls onSelect
 * with the full tag string e.g. `{post_title}` or `{post_date|format:Y}`.
 */

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl, Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagOption {
	slug: string;
	label: string;
	category: string;
	description: string;
	options: Array< {
		key: string;
		type: string;
		default: string;
		description: string;
	} >;
}

interface TagPickerProps {
	onSelect: ( tagString: string ) => void;
	onClose?: () => void;
}

// ── Category labels ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record< string, string > = {
	post: 'Post',
	author: 'Author',
	term: 'Taxonomy',
	user: 'User',
	site: 'Site',
	date: 'Date',
	query: 'Query',
};

const CATEGORY_ORDER = [
	'post',
	'author',
	'term',
	'user',
	'site',
	'date',
	'query',
];

// Module-level cache so we don't re-fetch on every mount.
let tagsCache: TagOption[] | null = null;

// ── Component ─────────────────────────────────────────────────────────────────

export function TagPicker( { onSelect, onClose }: TagPickerProps ) {
	const [ tags, setTags ] = useState< TagOption[] >( tagsCache ?? [] );
	const [ search, setSearch ] = useState( '' );
	const [ loading, setLoading ] = useState( ! tagsCache );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		if ( tagsCache ) {
			return;
		}

		apiFetch< TagOption[] >( { path: '/goblocks/v1/dynamic-content/tags' } )
			.then( ( result ) => {
				tagsCache = result;
				setTags( result );
				setLoading( false );
			} )
			.catch( () => {
				setError( __( 'Could not load tag list.', 'goblocks' ) );
				setLoading( false );
			} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Filter by search.
	const filtered = search
		? tags.filter(
				( t ) =>
					t.label.toLowerCase().includes( search.toLowerCase() ) ||
					t.slug.includes( search.toLowerCase() ) ||
					t.description.toLowerCase().includes( search.toLowerCase() )
		  )
		: tags;

	// Group by category.
	const grouped: Record< string, TagOption[] > = {};
	for ( const tag of filtered ) {
		( grouped[ tag.category ] ??= [] ).push( tag );
	}

	const handleSelect = ( tag: TagOption ) => {
		// Build tag string — use slug-only for tags with no required options.
		const hasRequired = tag.options.some( ( o ) => ! o.default );
		const tagString = `{${ tag.slug }}`;
		onSelect( tagString );
		onClose?.();
	};

	return (
		<div
			style={ {
				background: '#fff',
				border: '1px solid #e0e0e0',
				borderRadius: '4px',
				padding: '8px',
				minWidth: '280px',
			} }
		>
			{ /* Header */ }
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '8px',
				} }
			>
				<strong style={ { fontSize: '13px' } }>
					{ __( 'Insert Dynamic Tag', 'goblocks' ) }
				</strong>
				{ onClose && (
					<button
						type="button"
						onClick={ onClose }
						style={ {
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							fontSize: '16px',
							lineHeight: 1,
							color: '#666',
						} }
						aria-label={ __( 'Close tag picker', 'goblocks' ) }
					>
						×
					</button>
				) }
			</div>

			<TextControl
				placeholder={ __( 'Search tags…', 'goblocks' ) }
				value={ search }
				onChange={ setSearch }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			<div
				style={ {
					marginTop: '8px',
					maxHeight: '320px',
					overflowY: 'auto',
				} }
			>
				{ loading && <Spinner /> }

				{ error && (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				) }

				{ ! loading && ! error && filtered.length === 0 && (
					<p
						style={ {
							margin: '8px 0',
							color: '#888',
							fontSize: '12px',
						} }
					>
						{ __( 'No tags found.', 'goblocks' ) }
					</p>
				) }

				{ CATEGORY_ORDER.map( ( cat ) => {
					const group = grouped[ cat ];
					if ( ! group?.length ) {
						return null;
					}

					return (
						<div key={ cat } style={ { marginBottom: '8px' } }>
							<p
								style={ {
									margin: '0 0 4px',
									padding: '2px 4px',
									background: '#f5f5f5',
									fontSize: '10px',
									fontWeight: 700,
									textTransform: 'uppercase',
									letterSpacing: '0.08em',
									color: '#555',
								} }
							>
								{ CATEGORY_LABELS[ cat ] ?? cat }
							</p>

							{ group.map( ( tag ) => (
								<button
									key={ tag.slug }
									type="button"
									onClick={ () => handleSelect( tag ) }
									title={ tag.description }
									style={ {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'flex-start',
										width: '100%',
										padding: '4px 8px',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										textAlign: 'left',
										borderRadius: '3px',
									} }
									onMouseEnter={ ( e ) =>
										( (
											e.currentTarget as HTMLElement
										 ).style.background = '#f0f5ff' )
									}
									onMouseLeave={ ( e ) =>
										( (
											e.currentTarget as HTMLElement
										 ).style.background = 'none' )
									}
								>
									<span
										style={ {
											fontWeight: 500,
											fontSize: '13px',
										} }
									>
										{ tag.label }
									</span>
									<span
										style={ {
											fontSize: '11px',
											color: '#888',
											fontFamily: 'monospace',
										} }
									>
										{ `{${ tag.slug }}` }
									</span>
								</button>
							) ) }
						</div>
					);
				} ) }
			</div>
		</div>
	);
}
