import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
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
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	ariaLabel: string;
	animationClass: string;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

/**
 * Find an element in the current document or inside any accessible iframe
 * (handles WordPress 6.3+ iframed editor canvas).
 * @param selector
 */
function findInEditorDocs( selector: string ): Element | null {
	const el = document.querySelector( selector );
	if ( el ) {
		return el;
	}
	for ( const frame of Array.from(
		document.querySelectorAll< HTMLIFrameElement >( 'iframe' )
	) ) {
		try {
			const found =
				frame.contentDocument?.querySelector( selector ) ?? null;
			if ( found ) {
				return found;
			}
		} catch {
			/* cross-origin */
		}
	}
	return null;
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< ColumnBlockAttributes > ) {
	const {
		uniqueId,
		tagName,
		styles,
		globalClasses,
		animationClass,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'column',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< ColumnBlockAttributes > ),
	} );

	// ── Editor wrapper flex sync ───────────────────────────────────────────
	// In the editor Gutenberg wraps every inner block in .wp-block-goblocks-column,
	// which is the ACTUAL flex/grid item. The block's own element (.gb-column) is
	// inside it, so custom flex-basis values from the inspector won't visually
	// apply unless we push them up to the Gutenberg wrapper.
	const layoutStyles = ( styles as any )?.layout ?? {};
	const flexGrow = String( layoutStyles?.flexGrow?.base ?? '1' );
	const flexShrink = String( layoutStyles?.flexShrink?.base ?? '1' );
	const flexBasis = String( layoutStyles?.flexBasis?.base ?? '0%' );

	useEffect( () => {
		if ( ! uniqueId ) {
			return;
		}

		const inner = findInEditorDocs( `.gb-column-${ uniqueId }` );
		const wrapper = inner?.closest< HTMLElement >(
			'.wp-block-goblocks-column'
		);
		if ( ! wrapper ) {
			return;
		}

		wrapper.style.setProperty( 'flex-grow', flexGrow, 'important' );
		wrapper.style.setProperty( 'flex-shrink', flexShrink, 'important' );
		wrapper.style.setProperty( 'flex-basis', flexBasis, 'important' );
		wrapper.style.setProperty( 'min-width', '0', 'important' );

		return () => {
			wrapper.style.removeProperty( 'flex-grow' );
			wrapper.style.removeProperty( 'flex-shrink' );
			wrapper.style.removeProperty( 'flex-basis' );
			wrapper.style.removeProperty( 'min-width' );
		};
	}, [ uniqueId, flexGrow, flexShrink, flexBasis ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const wrapperClass = clsx(
		'gb-column',
		uniqueId && `gb-column-${ uniqueId }`,
		...( globalClasses ?? [] ),
		animationClass || undefined
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: InnerBlocks.ButtonBlockAppender,
		template: [
			[
				'goblocks/text',
				{ placeholder: __( 'Start writing…', 'goblocks' ) },
			],
		],
	} );

	const Tag = ( tagName || 'div' ) as keyof JSX.IntrinsicElements;

	return (
		<>
			<ColumnInspector
				attributes={ attributes as any }
				setAttributes={ setAttributes as any }
			/>
			<Tag { ...innerBlocksProps } />
		</>
	);
}
