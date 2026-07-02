import { useEffect } from '@wordpress/element';
import { useBlockProps, useInnerBlocksProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';
import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { ColumnInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

interface ColumnBlockAttributes {
	uniqueId: string;
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record<string, string>;
	dynamicContent: Record<string, string>;
	generatedCss: string;
	blockVersion: number;
	ariaLabel: string;
	animationClass: string;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( { attributes, setAttributes, clientId }: BlockEditProps<ColumnBlockAttributes> ) {
	const { uniqueId, tagName, styles, globalClasses, animationClass } = attributes;

	useEffect( () => {
		if ( ! uniqueId ) setAttributes( { uniqueId: makeUniqueId( clientId ) } );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'column',
		uniqueId,
		styles,
		setAttributes: ( patch ) => setAttributes( patch as Partial<ColumnBlockAttributes> ),
	} );

	const wrapperClass = clsx(
		'gb-column',
		uniqueId && `gb-column-${uniqueId}`,
		...( globalClasses ?? [] ),
		animationClass || undefined
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: InnerBlocks.ButtonBlockAppender,
		template: [ [ 'goblocks/text', { placeholder: __( 'Start writing…', 'goblocks' ) } ] ],
	} );

	const Tag = ( tagName || 'div' ) as keyof JSX.IntrinsicElements;

	return (
		<>
			<ColumnInspector attributes={ attributes as any } setAttributes={ setAttributes as any } />
			<Tag { ...innerBlocksProps } />
		</>
	);
}