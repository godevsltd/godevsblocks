/**
 * Tab Panel block — Edit component.
 *
 * Renders the panel label (editable via RichText) and inner blocks.
 * The panel is always fully visible in the editor (tab switching is frontend-only).
 * The parent Tabs block reads `attributes.label` for the tab bar.
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
	TabPanelInspector,
	type TabPanelAttributes,
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
}: BlockEditProps< TabPanelAttributes > ) {
	const { uniqueId, label, globalClasses, styles } = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection.
	useCssEngine( {
		blockSlug: 'tab-panel',
		uniqueId,
		styles,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< TabPanelAttributes > ),
	} );

	const wrapperClass = clsx(
		'gb-tab-panel',
		uniqueId && `gb-tab-panel-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gb-tab-panel__content' },
		{
			template: [
				[
					'goblocks/text',
					{ placeholder: __( 'Tab content…', 'goblocks' ) },
				],
			],
		}
	);

	return (
		<>
			{ /* Inspector Controls */ }
			<TabPanelInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{ /* Editable label bar — visible only in editor */ }
				<div className="gb-tab-panel__label-bar">
					<RichText
						tagName="span"
						className="gb-tab-panel__label"
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
						placeholder={ __( 'Tab label', 'goblocks' ) }
						allowedFormats={ [] }
						keepPlaceholderOnFocus
					/>
				</div>

				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
