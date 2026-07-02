import { useEffect } from '@wordpress/element';
import {
	RichText,
	useBlockProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { HeadingInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ────────────────────────────────────────────────────────

interface HeadingBlockAttributes {
	uniqueId: string;
	tagName: string;
	content: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	anchor: string;
	link: string;
	linkTarget: string;
	linkRel: string;
	textGradient: string;
}

// ── Unique ID generator ───────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Anchor slug generator ─────────────────────────────────────────────────

function toAnchorSlug( html: string ): string {
	return html
		.replace( /<[^>]+>/g, '' ) // strip HTML tags
		.toLowerCase()
		.trim()
		.replace( /[^a-z0-9\s-]/g, '' ) // remove non-alphanumeric
		.replace( /\s+/g, '-' ) // spaces → hyphens
		.replace( /-+/g, '-' ) // collapse repeated hyphens
		.replace( /^-|-$/g, '' ) // trim leading/trailing hyphens
		.slice( 0, 60 );
}

// ── Heading level toolbar options ─────────────────────────────────────────

const LEVEL_OPTIONS = [ 1, 2, 3, 4, 5, 6 ].map( ( n ) => ( {
	title: `H${ n }`,
	value: `h${ n }`,
} ) );

// ── Allowed rich-text formats ─────────────────────────────────────────────

const ALLOWED_FORMATS = [
	'core/bold',
	'core/italic',
	'core/link',
	'core/code',
	'core/strikethrough',
];

// ── Edit component ────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< HeadingBlockAttributes > ) {
	const { uniqueId, tagName, content, styles, globalClasses, anchor, textGradient, generatedCss } =
		attributes;

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-populate anchor from content while anchor is empty.
	useEffect( () => {
		if ( content && ! anchor ) {
			const generated = toAnchorSlug( content );
			if ( generated ) {
				setAttributes( { anchor: generated } );
			}
		}
	}, [ content ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection into editor <head>.
	// Use a compound selector (.gb-heading.gb-heading-{uniqueId}, specificity 0,2,0)
	// so user-set color beats h6.gb-heading { color:... } in blocks.css (0,1,1).
	useCssEngine( {
		blockSlug: 'heading',
		uniqueId,
		styles,
		generatedCss,
		selectorOverride: `.gb-heading.gb-heading-${ uniqueId }`,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< HeadingBlockAttributes > ),
	} );

	// Selector must match CssEngine: .gb-heading-{uniqueId}
	const wrapperClass = clsx(
		'gb-heading',
		uniqueId && `gb-heading-${ uniqueId }`,
		textGradient && 'gb-heading--gradient',
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const Tag = ( tagName || 'h2' ) as string;
	const level = parseInt( Tag.slice( 1 ), 10 ) || 2;

	return (
		<>
			{ /* Heading level switcher */ }
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarDropdownMenu
						label={ __( 'Heading level', 'goblocks' ) }
						text={ Tag.toUpperCase() }
						controls={ LEVEL_OPTIONS.map( ( opt ) => ( {
							title: opt.title,
							isActive: opt.value === tagName,
							onClick: () =>
								setAttributes( { tagName: opt.value } ),
						} ) ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ /* Inspector Controls */ }
			<HeadingInspector
				attributes={ attributes as any }
				setAttributes={ setAttributes as any }
			/>

			{ /* Editable heading text */ }
			<RichText
				{ ...blockProps }
				tagName={ Tag }
				value={ content }
				onChange={ ( value ) => setAttributes( { content: value } ) }
				placeholder={ __( 'Heading…', 'goblocks' ) }
				allowedFormats={ ALLOWED_FORMATS }
				aria-level={ level }
			/>
		</>
	);
}
