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
import { TextInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ────────────────────────────────────────────────────────

interface TextBlockAttributes {
	uniqueId: string;
	tagName: string;
	content: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	dropCap: boolean;
}

// ── Unique ID generator ───────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Allowed rich-text formats ─────────────────────────────────────────────

const ALLOWED_FORMATS = [
	'core/bold',
	'core/italic',
	'core/link',
	'core/code',
	'core/strikethrough',
	'core/subscript',
	'core/superscript',
	'core/keyboard',
];

// ── Tag toolbar options ───────────────────────────────────────────────────

const TAG_OPTIONS = [
	{ title: 'p', value: 'p' },
	{ title: 'span', value: 'span' },
	{ title: 'div', value: 'div' },
	{ title: 'figcaption', value: 'figcaption' },
	{ title: 'li', value: 'li' },
	{ title: 'dt', value: 'dt' },
	{ title: 'dd', value: 'dd' },
];

// ── Edit component ────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< TextBlockAttributes > ) {
	const { uniqueId, tagName, content, styles, globalClasses, dropCap, generatedCss } =
		attributes;

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection into editor <head>.
	useCssEngine( {
		blockSlug: 'text',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< TextBlockAttributes > ),
	} );

	// Selector must match CssEngine: .gb-text-{uniqueId}
	const wrapperClass = clsx(
		'gb-text',
		uniqueId && `gb-text-${ uniqueId }`,
		dropCap && 'gb-text--drop-cap',
		...( globalClasses ?? [] )
	);

	// blockProps flow into RichText — it IS the block's outermost element.
	const blockProps = useBlockProps( { className: wrapperClass } );

	const Tag = ( tagName || 'p' ) as string;

	return (
		<>
			{ /* Tag switcher toolbar */ }
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarDropdownMenu
						label={ __( 'Tag: ', 'goblocks' ) + ( tagName || 'p' ) }
						text={ tagName || 'p' }
						controls={ TAG_OPTIONS.map( ( t ) => ( {
							title: t.title,
							isActive: t.value === tagName,
							onClick: () =>
								setAttributes( { tagName: t.value } ),
						} ) ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ /* Inspector Controls */ }
			<TextInspector
				attributes={ attributes as any }
				setAttributes={ setAttributes as any }
			/>

			{ /* Editable rich text — spreads blockProps so Gutenberg tracks it */ }
			<RichText
				{ ...blockProps }
				tagName={ Tag }
				value={ content }
				onChange={ ( value ) => setAttributes( { content: value } ) }
				placeholder={ __( 'Start writing…', 'goblocks' ) }
				allowedFormats={ ALLOWED_FORMATS }
			/>
		</>
	);
}
