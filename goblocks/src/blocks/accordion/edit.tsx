/**
 * Accordion block — Edit component.
 *
 * Renders InnerBlocks restricted to goblocks/accordion-item.
 * The view script handles single-open mode on the frontend.
 */

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
import { AccordionInspector } from './components/Inspector';
import type { AccordionBlockAttributes } from './components/Inspector';

// ── Unique ID ─────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Default template ──────────────────────────────────────────────────────────

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/accordion-item', { question: 'Question 1', isOpen: true } ],
	[ 'goblocks/accordion-item', { question: 'Question 2' } ],
];

// ── Edit component ────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< AccordionBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		enableFaqSchema,
		allowMultiple,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'accordion',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< AccordionBlockAttributes > ),
	} );

	const wrapperClass = clsx(
		'gb-accordion',
		uniqueId && `gb-accordion-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'goblocks/accordion-item' ],
		template: DEFAULT_TEMPLATE,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<AccordionInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			{ enableFaqSchema && (
				<div className="gb-accordion__schema-notice">
					{ __( 'FAQ Schema enabled', 'goblocks' ) }
				</div>
			) }

			<div { ...innerBlocksProps } />
		</>
	);
}
