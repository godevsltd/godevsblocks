import { useEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { SpacerInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ────────────────────────────────────────────────────────

interface SpacerBlockAttributes {
	uniqueId: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

// ── Unique ID generator ───────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Edit component ────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< SpacerBlockAttributes > ) {
	const { uniqueId, styles, globalClasses } = attributes;

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation + injection.
	useCssEngine( {
		blockSlug: 'spacer',
		uniqueId,
		styles,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< SpacerBlockAttributes > ),
	} );

	const wrapperClass = clsx(
		'gb-spacer',
		uniqueId && `gb-spacer-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		role: 'presentation',
		'aria-hidden': 'true',
	} );

	return (
		<>
			<SpacerInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps } />
		</>
	);
}
