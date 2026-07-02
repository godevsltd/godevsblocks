/**
 * Accordion Item block — Edit component.
 *
 * Renders a <details>/<summary> element. The question is editable inline via
 * RichText (no formats). Answer content is inner blocks.
 * Always rendered open in the editor for easy access to inner blocks.
 */

import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import {
	AccordionItemInspector,
	type AccordionItemAttributes,
} from './components/Inspector';

// ── Unique ID ─────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Edit component ────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< AccordionItemAttributes > ) {
	const {
		uniqueId,
		question,
		globalClasses,
		styles,
		generatedCss,
		headerColor,
		headerBg,
		contentColor,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection.
	useCssEngine( {
		blockSlug: 'accordion-item',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< AccordionItemAttributes > ),
	} );

	const hdrColor = headerColor  || '#111827';
	const hdrBg    = headerBg     || '#ffffff';
	const cntColor = contentColor || '#374151';

	const accordionVars = {
		'--gb-ai-header-color':  hdrColor,
		'--gb-ai-header-bg':     hdrBg,
		'--gb-ai-content-color': cntColor,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-accordion-item',
		uniqueId && `gb-accordion-item-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass, style: accordionVars } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gb-accordion-item__content' },
		{
			template: [
				[
					'goblocks/text',
					{ placeholder: __( 'Answer…', 'goblocks' ) },
				],
			],
		}
	);

	return (
		<>
			{ /* Inspector Controls */ }
			<AccordionItemInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			{ /* Always open in editor for inner-block access */ }
			<details { ...blockProps } open>
				<summary className="gb-accordion-item__trigger">
					<RichText
						tagName="span"
						className="gb-accordion-item__question"
						value={ question }
						onChange={ ( v ) => setAttributes( { question: v } ) }
						placeholder={ __( 'Question…', 'goblocks' ) }
						allowedFormats={ [] }
						keepPlaceholderOnFocus
					/>
					<span
						className="gb-accordion-item__icon"
						aria-hidden="true"
					/>
				</summary>

				<div { ...innerBlocksProps } />
			</details>
		</>
	);
}
