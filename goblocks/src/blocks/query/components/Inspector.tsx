import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	RadioControl,
	CheckboxControl,
	Spinner,
	Notice,
	ButtonGroup,
	Button,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import { usePostTypes } from '../../../hooks/usePostTypes';
import { useTaxonomies } from '../../../hooks/useTaxonomies';
import { useTerms } from '../../../hooks/useTerms';
import { useAuthors } from '../../../hooks/useAuthors';
import { useQueryPreview } from '../../../hooks/useQueryPreview';
import type { QueryAttributes, QueryLayout } from '../../../types/query';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QueryInspectorProps {
	query: QueryAttributes;
	layout: QueryLayout;
	paginationType: string;
	styles: BlockStyles;
	globalClasses: string[];
	setQuery: ( patch: Partial< QueryAttributes > ) => void;
	setLayout: ( layout: QueryLayout ) => void;
	setPagination: ( type: string ) => void;
	setStyles: ( styles: BlockStyles ) => void;
	setGlobalClasses: ( classes: string[] ) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_BY_OPTIONS = [
	{ label: __( 'Date', 'goblocks' ), value: 'date' },
	{ label: __( 'Title', 'goblocks' ), value: 'title' },
	{ label: __( 'Menu Order', 'goblocks' ), value: 'menu_order' },
	{ label: __( 'Comment Count', 'goblocks' ), value: 'comment_count' },
	{ label: __( 'Random', 'goblocks' ), value: 'rand' },
	{ label: __( 'Meta Value', 'goblocks' ), value: 'meta_value' },
];

const ORDER_OPTIONS = [
	{ label: __( 'Newest first', 'goblocks' ), value: 'DESC' },
	{ label: __( 'Oldest first', 'goblocks' ), value: 'ASC' },
];

const STICKY_OPTIONS = [
	{ label: __( 'Include sticky posts', 'goblocks' ), value: 'include' },
	{ label: __( 'Exclude sticky posts', 'goblocks' ), value: 'exclude' },
	{ label: __( 'Sticky posts only', 'goblocks' ), value: 'only' },
];

const PAGINATION_OPTIONS = [
	{
		label: __( 'Standard — numbered pages', 'goblocks' ),
		value: 'standard',
	},
	{
		label: __( 'Load More — append via REST', 'goblocks' ),
		value: 'load-more',
	},
	{
		label: __( 'Infinite Scroll', 'goblocks' ),
		value: 'infinite',
	},
];

// ── Component ─────────────────────────────────────────────────────────────────

export function QueryInspector( {
	query,
	layout,
	paginationType,
	styles,
	globalClasses,
	setQuery,
	setLayout,
	setPagination,
	setStyles,
	setGlobalClasses,
}: QueryInspectorProps ) {
	const postTypes = usePostTypes();
	const taxonomies = useTaxonomies( query.postType[ 0 ] ?? 'post' );
	const authors = useAuthors();

	// Tax filter state — first taxonomy in taxQuery (simplified UI)
	const firstTax = query.taxQuery[ 0 ] ?? null;
	const terms = useTerms( firstTax?.taxonomy ?? '' );

	const preview = useQueryPreview( query );

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setStyles( patch.styles as BlockStyles )
	);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const setTaxFilter = (
		patch: Partial< NonNullable< typeof firstTax > >
	) => {
		const existing = firstTax ?? {
			taxonomy: taxonomies[ 0 ]?.slug ?? '',
			field: 'id' as const,
			terms: [],
			operator: 'IN' as const,
			includeChildren: true,
		};
		setQuery( { taxQuery: [ { ...existing, ...patch } ] } );
	};

	const toggleTermInFilter = ( termId: string ) => {
		const current = firstTax?.terms ?? [];
		const updated = current.includes( termId )
			? current.filter( ( t ) => t !== termId )
			: [ ...current, termId ];
		setTaxFilter( { terms: updated } );
	};

	const toggleAuthor = ( id: number ) => {
		const current = query.author ?? [];
		const updated = current.includes( id )
			? current.filter( ( a ) => a !== id )
			: [ ...current, id ];
		setQuery( { author: updated } );
	};

	// ── Query settings panels (Styles tab) ────────────────────────────────────

	const stylesContent = (
		<>
			{ /* ── Query Settings ──────────────────────────────────────── */ }
			<PanelBody title={ __( 'Query Settings', 'goblocks' ) } initialOpen>
				<ToggleControl
					label={ __( 'Inherit archive query', 'goblocks' ) }
					help={ __(
						"Use the current page's archive query (category, tag, author, etc.).",
						'goblocks'
					) }
					checked={ query.inherit }
					onChange={ ( val ) => setQuery( { inherit: val } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				{ ! query.inherit && (
					<>
						<SelectControl
							label={ __( 'Post type', 'goblocks' ) }
							value={ query.postType[ 0 ] ?? 'post' }
							options={ postTypes.map( ( pt ) => ( {
								label: pt.label,
								value: pt.slug,
							} ) ) }
							onChange={ ( val ) =>
								setQuery( { postType: [ val ] } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>

						<NumberControl
							label={ __( 'Posts per page', 'goblocks' ) }
							value={ query.perPage }
							min={ 1 }
							max={ 100 }
							onChange={ ( val ) =>
								setQuery( {
									perPage: Math.min(
										100,
										Math.max(
											1,
											parseInt(
												String( val ?? 10 ),
												10
											) || 10
										)
									),
								} )
							}
							// @ts-ignore
							__next40pxDefaultSize
						/>

						<SelectControl
							label={ __( 'Order by', 'goblocks' ) }
							value={ query.orderBy }
							options={ ORDER_BY_OPTIONS }
							onChange={ ( val ) =>
								setQuery( {
									orderBy:
										val as QueryAttributes[ 'orderBy' ],
								} )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>

						<SelectControl
							label={ __( 'Order', 'goblocks' ) }
							value={ query.order }
							options={ ORDER_OPTIONS }
							onChange={ ( val ) =>
								setQuery( { order: val as 'ASC' | 'DESC' } )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>

						<SelectControl
							label={ __( 'Sticky posts', 'goblocks' ) }
							value={ query.sticky }
							options={ STICKY_OPTIONS }
							onChange={ ( val ) =>
								setQuery( {
									sticky: val as QueryAttributes[ 'sticky' ],
								} )
							}
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Filters ─────────────────────────────────────────────── */ }
			{ ! query.inherit && (
				<PanelBody
					title={ __( 'Filters', 'goblocks' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Search keyword', 'goblocks' ) }
						value={ query.search }
						onChange={ ( val ) => setQuery( { search: val } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>

					{ /* Taxonomy filter */ }
					{ taxonomies.length > 0 && (
						<>
							<SelectControl
								label={ __( 'Taxonomy', 'goblocks' ) }
								value={ firstTax?.taxonomy ?? '' }
								options={ [
									{
										label: __( '— None —', 'goblocks' ),
										value: '',
									},
									...taxonomies.map( ( t ) => ( {
										label: t.label,
										value: t.slug,
									} ) ),
								] }
								onChange={ ( val ) => {
									if ( ! val ) {
										setQuery( { taxQuery: [] } );
									} else {
										setTaxFilter( {
											taxonomy: val,
											terms: [],
										} );
									}
								} }
								// @ts-ignore
								__nextHasNoMarginBottom
							/>

							{ firstTax?.taxonomy && terms.length > 0 && (
								<div className="gb-inspector-checklist">
									<p className="gb-inspector-checklist__label">
										{ __( 'Filter by terms', 'goblocks' ) }
									</p>
									{ terms.slice( 0, 30 ).map( ( term ) => {
										const strId = String( term.id );
										return (
											<CheckboxControl
												key={ term.id }
												label={ `${ term.name } (${ term.count })` }
												checked={ (
													firstTax?.terms ?? []
												).includes( strId ) }
												onChange={ () =>
													toggleTermInFilter( strId )
												}
												// @ts-ignore
												__nextHasNoMarginBottom
											/>
										);
									} ) }
								</div>
							) }
						</>
					) }

					{ /* Author filter */ }
					{ authors.length > 0 && (
						<div className="gb-inspector-checklist">
							<p className="gb-inspector-checklist__label">
								{ __( 'Filter by author', 'goblocks' ) }
							</p>
							{ authors.map( ( author ) => (
								<CheckboxControl
									key={ author.id }
									label={ author.name }
									checked={ ( query.author ?? [] ).includes(
										author.id
									) }
									onChange={ () => toggleAuthor( author.id ) }
									// @ts-ignore
									__nextHasNoMarginBottom
								/>
							) ) }
						</div>
					) }
				</PanelBody>
			) }

			{ /* ── Pagination ──────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Pagination', 'goblocks' ) }
				initialOpen={ false }
			>
				<RadioControl
					label={ __( 'Pagination type', 'goblocks' ) }
					selected={ paginationType }
					options={ PAGINATION_OPTIONS }
					onChange={ setPagination }
				/>
			</PanelBody>

			{ /* ── Query Preview ───────────────────────────────────────── */ }
			{ ! query.inherit && (
				<PanelBody
					title={ __( 'Query Preview', 'goblocks' ) }
					initialOpen={ false }
				>
					{ preview.isLoading && <Spinner /> }
					{ preview.error && (
						<Notice status="error" isDismissible={ false }>
							{ __( 'Preview failed.', 'goblocks' ) }
						</Notice>
					) }
					{ ! preview.isLoading && ! preview.error && (
						<p className="description">
							{ preview.total === 0
								? __( 'No posts match this query.', 'goblocks' )
								: `${ preview.total } ${ __(
										'posts found',
										'goblocks'
								  ) }` }
						</p>
					) }
					{ preview.posts.length > 0 && (
						<ul className="gb-inspector-preview-list">
							{ preview.posts.map( ( p ) => (
								<li key={ p.id }>
									{ p.title }
									<span className="gb-inspector-preview-list__date">
										{ p.date }
									</span>
								</li>
							) ) }
						</ul>
					) }
				</PanelBody>
			) }

			{ /* ── Layout ──────────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Layout', 'goblocks' ) }
				initialOpen={ false }
			>
				{ /* Display type */ }
				<div style={ { marginBottom: '12px' } }>
					<p
						style={ {
							fontSize: '11px',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: '0.05em',
							color: '#757575',
							margin: '0 0 8px',
						} }
					>
						{ __( 'Display', 'goblocks' ) }
					</p>
					<ButtonGroup>
						<Button
							size="compact"
							variant={
								layout.type === 'list' ? 'primary' : 'secondary'
							}
							onClick={ () =>
								setLayout( { ...layout, type: 'list' } )
							}
						>
							{ __( 'List', 'goblocks' ) }
						</Button>
						<Button
							size="compact"
							variant={
								layout.type === 'grid' ? 'primary' : 'secondary'
							}
							onClick={ () =>
								setLayout( { ...layout, type: 'grid' } )
							}
						>
							{ __( 'Grid', 'goblocks' ) }
						</Button>
					</ButtonGroup>
				</div>

				{ /* Column count — only for grid */ }
				{ layout.type === 'grid' && (
					<div>
						<p
							style={ {
								fontSize: '11px',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
								color: '#757575',
								margin: '0 0 8px',
							} }
						>
							{ __( 'Columns', 'goblocks' ) }
						</p>
						<ButtonGroup>
							{ ( [ 1, 2, 3, 4 ] as const ).map( ( n ) => (
								<Button
									key={ n }
									size="compact"
									variant={
										layout.columns === n
											? 'primary'
											: 'secondary'
									}
									onClick={ () =>
										setLayout( { ...layout, columns: n } )
									}
								>
									{ n }
								</Button>
							) ) }
						</ButtonGroup>
					</div>
				) }
			</PanelBody>

			{ /* ── Spacing / Background / Sizing ──────────────────────── */ }
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<SizingPanel styles={ styles } responsive={ responsive } />
		</>
	);

	// ── Advanced tab ──────────────────────────────────────────────────────────

	const advancedContent = (
		<PanelBody
			title={ __( 'CSS Classes', 'goblocks' ) }
			initialOpen={ false }
		>
			<TextControl
				label={ __( 'Additional CSS classes', 'goblocks' ) }
				value={ ( globalClasses ?? [] ).join( ' ' ) }
				help={ __(
					'Space-separated list of extra classes.',
					'goblocks'
				) }
				onChange={ ( val ) =>
					setGlobalClasses( val.split( /\s+/ ).filter( Boolean ) )
				}
				// @ts-ignore
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	return (
		<InspectorControls>
			<InspectorTabs
				stylesContent={ stylesContent }
				advancedContent={ advancedContent }
			/>
		</InspectorControls>
	);
}
