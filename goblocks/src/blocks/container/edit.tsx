import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	InnerBlocks,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { ContainerInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

interface ContainerBlockAttributes {
	uniqueId: string;
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	ariaLabel: string;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const SEMANTIC_TAGS = [
	{ title: 'div',     value: 'div' },
	{ title: 'section', value: 'section' },
	{ title: 'article', value: 'article' },
	{ title: 'aside',   value: 'aside' },
	{ title: 'header',  value: 'header' },
	{ title: 'footer',  value: 'footer' },
	{ title: 'nav',     value: 'nav' },
	{ title: 'main',    value: 'main' },
];

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< ContainerBlockAttributes > ) {
	const { uniqueId, tagName, styles, globalClasses, ariaLabel, generatedCss } = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'container',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< ContainerBlockAttributes > ),
	} );

	const currentMaxWidth =
		( styles as any )?.sizing?.maxWidth?.base ?? '1200px';

	const wrapperClass = clsx(
		'gb-container',
		uniqueId && `gb-container-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		...( ariaLabel ? { 'aria-label': ariaLabel } : {} ),
		'data-max-width': currentMaxWidth,
		'data-block-label': `Container · ${ currentMaxWidth }`,
		'data-tag': tagName || 'div',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: InnerBlocks.ButtonBlockAppender,
		template: [
			[ 'goblocks/heading', { placeholder: __( 'Section heading…', 'goblocks' ) } ],
			[ 'goblocks/text',    { placeholder: __( 'Add content…', 'goblocks' ) } ],
		],
	} );

	const Tag = ( tagName || 'div' ) as keyof JSX.IntrinsicElements;

	return (
		<>
			{ /* Toolbar: tag name quick-switch */ }
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarDropdownMenu
						label={ __( 'Tag: ', 'goblocks' ) + ( tagName || 'div' ) }
						text={ tagName || 'div' }
						controls={ SEMANTIC_TAGS.map( ( t ) => ( {
							title: t.title,
							isActive: t.value === tagName,
							onClick: () => setAttributes( { tagName: t.value } ),
						} ) ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ /* Inspector Controls */ }
			<ContainerInspector
				attributes={ attributes as any }
				setAttributes={ setAttributes as any }
			/>

			{ /* Block output */ }
			<Tag { ...innerBlocksProps } />
		</>
	);
}