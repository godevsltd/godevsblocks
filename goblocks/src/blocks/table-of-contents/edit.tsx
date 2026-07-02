import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
// @ts-ignore
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	CheckboxControl,
	ToggleControl,
	RangeControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import { ColorControl } from '../../components/controls/ColorControl';
import type { BlockStyles } from '../../types/styles';

interface TocBlockAttributes {
	uniqueId:       string;
	title:          string;
	headings:       string[];
	collapsible:    boolean;
	startCollapsed: boolean;
	smoothScroll:   boolean;
	scrollOffset:   number;
	listStyle:      string;
	showBackToTop:  boolean;
	linkColor:      string;
	activeColor:    string;
	styles:         BlockStyles;
	globalClasses:  string[];
	generatedCss:   string;
	blockVersion:   number;
}

interface HeadingBlock {
	name: string;
	attributes: { level: number; content: string };
	innerBlocks: HeadingBlock[];
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

function stripHtml( html: string ): string {
	return html.replace( /<[^>]+>/g, '' );
}

const HEADING_LEVELS = [
	{ value: 'h2', label: 'H2' },
	{ value: 'h3', label: 'H3' },
	{ value: 'h4', label: 'H4' },
	{ value: 'h5', label: 'H5' },
	{ value: 'h6', label: 'H6' },
];

function collectHeadings( blocks: HeadingBlock[] ): HeadingBlock[] {
	const result: HeadingBlock[] = [];
	for ( const block of blocks ) {
		if ( block.name === 'goblocks/heading' || block.name === 'core/heading' ) {
			result.push( block );
		}
		if ( block.innerBlocks?.length ) {
			result.push( ...collectHeadings( block.innerBlocks ) );
		}
	}
	return result;
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< TocBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, generatedCss,
		title, headings, collapsible, startCollapsed,
		smoothScroll, scrollOffset, listStyle, showBackToTop,
		linkColor, activeColor,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'table-of-contents',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< TocBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const allBlocks = useSelect(
		( select ) => ( select( blockEditorStore ) as any ).getBlocks() as HeadingBlock[],
		[]
	);
	const detectedHeadings = collectHeadings( allBlocks ).filter( ( b ) =>
		headings.includes( `h${ b.attributes.level }` )
	);

	const wrapperClass = clsx(
		'gb-toc',
		uniqueId && `gb-toc-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	const colorVars: Record< string, string > = {};
	if ( linkColor )   colorVars[ '--gb-toc-link' ]   = linkColor;
	if ( activeColor ) colorVars[ '--gb-toc-active' ] = activeColor;

	function toggleHeading( level: string, checked: boolean ) {
		setAttributes( {
			headings: checked
				? [ ...headings, level ].sort()
				: headings.filter( ( h ) => h !== level ),
		} );
	}

	function buildPreview( items: HeadingBlock[] ): JSX.Element {
		if ( ! items.length ) {
			return (
				<p style={ { fontStyle: 'italic', opacity: 0.5, fontSize: '0.8125rem', margin: 0 } }>
					{ __( 'No matching headings found on this page.', 'goblocks' ) }
				</p>
			);
		}

		const minLevel = Math.min( ...items.map( ( b ) => b.attributes.level ) );
		const ListTag = listStyle === 'unordered' ? 'ul' : 'ol';

		return (
			<ListTag className="gb-toc__list" style={ { pointerEvents: 'none' } }>
				{ items.map( ( b, i ) => {
					const indent = ( b.attributes.level - minLevel ) * 16;
					return (
						<li
							key={ i }
							className={ `gb-toc__item gb-toc__item--h${ b.attributes.level }` }
							style={ { paddingLeft: indent ? `${ indent }px` : undefined } }
						>
							<span className="gb-toc__link">
								{ stripHtml( b.attributes.content || '' ) || __( '(empty heading)', 'goblocks' ) }
							</span>
						</li>
					);
				} ) }
			</ListTag>
		);
	}

	/* ── Inspector: Style tab ──────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody title={ __( 'Link Colors', 'goblocks' ) } initialOpen>
				<ColorControl
					label={ __( 'Link color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ linkColor }
					onChange={ ( v ) => setAttributes( { linkColor: v || '' } ) }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Active / hover color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ activeColor }
					onChange={ ( v ) => setAttributes( { activeColor: v || '' } ) }
				/>
			</PanelBody>
			<TypographyPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel     styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel    styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	/* ── Inspector: Advanced tab ───────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'TOC Settings', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Title', 'goblocks' ) }
					value={ title }
					onChange={ ( v ) => setAttributes( { title: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'List style', 'goblocks' ) }
					value={ listStyle || 'ordered' }
					options={ [
						{ label: __( 'Numbered (1. 2. 3.)', 'goblocks' ), value: 'ordered' },
						{ label: __( 'Bulleted (• • •)',    'goblocks' ), value: 'unordered' },
					] }
					onChange={ ( v ) => setAttributes( { listStyle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Smooth scroll', 'goblocks' ) }
					checked={ smoothScroll }
					onChange={ ( v ) => setAttributes( { smoothScroll: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ smoothScroll && (
					<RangeControl
						label={ __( 'Scroll offset (px)', 'goblocks' ) }
						help={ __( 'Extra offset for sticky headers.', 'goblocks' ) }
						value={ scrollOffset }
						onChange={ ( v ) => setAttributes( { scrollOffset: v ?? 80 } ) }
						min={ 0 }
						max={ 300 }
						step={ 4 }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
				<ToggleControl
					label={ __( 'Show "Back to top" link', 'goblocks' ) }
					checked={ showBackToTop }
					onChange={ ( v ) => setAttributes( { showBackToTop: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Collapsible', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Enable collapse toggle', 'goblocks' ) }
					checked={ collapsible }
					onChange={ ( v ) => setAttributes( { collapsible: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ collapsible && (
					<>
						<div style={ { height: '8px' } } />
						<ToggleControl
							label={ __( 'Start collapsed', 'goblocks' ) }
							help={ __( 'TOC is hidden by default; user must click the title to expand.', 'goblocks' ) }
							checked={ startCollapsed }
							onChange={ ( v ) => setAttributes( { startCollapsed: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			<PanelBody title={ __( 'Include Heading Levels', 'goblocks' ) } initialOpen={ false }>
				{ HEADING_LEVELS.map( ( h ) => (
					<CheckboxControl
						key={ h.value }
						label={ h.label }
						checked={ headings.includes( h.value ) }
						onChange={ ( v ) => toggleHeading( h.value, v ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) ) }
			</PanelBody>

			<PanelBody title={ __( 'CSS Classes', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					onChange={ ( v ) =>
						setAttributes( { globalClasses: v.split( /\s+/ ).filter( Boolean ) } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs stylesContent={ stylesContent } advancedContent={ advancedContent } />
			</InspectorControls>

			<nav { ...blockProps } style={ { ...( blockProps.style as object ), ...colorVars } }>
				{ title && <p className="gb-toc__title">{ title }</p> }
				{ buildPreview( detectedHeadings ) }
				{ showBackToTop && (
					<a href="#" className="gb-toc__back-top" onClick={ ( e ) => e.preventDefault() }>
						{ __( '↑ Back to top', 'goblocks' ) }
					</a>
				) }
			</nav>
		</>
	);
}