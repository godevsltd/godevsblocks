import { useEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { SeparatorInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Attribute type ────────────────────────────────────────────────────────

interface SeparatorBlockAttributes {
	uniqueId:      string;
	lineStyle:     string;
	label:         string;
	styles:        BlockStyles;
	globalClasses: string[];
	generatedCss:  string;
	blockVersion:  number;
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
}: BlockEditProps< SeparatorBlockAttributes > ) {
	const { uniqueId, styles, globalClasses, generatedCss, lineStyle, label } = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug:    'separator',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< SeparatorBlockAttributes > ),
	} );

	const baseClass  = clsx(
		'gb-separator',
		label && 'gb-separator--labeled',
		uniqueId && `gb-separator-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const hrStyle = lineStyle && lineStyle !== 'solid'
		? ( { borderStyle: lineStyle } as React.CSSProperties )
		: undefined;

	const blockProps = useBlockProps( { className: baseClass } );

	return (
		<>
			<SeparatorInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			{ label ? (
				<div { ...blockProps }>
					<hr style={ hrStyle } aria-hidden="true" />
					<span className="gb-separator__label">{ label }</span>
					<hr style={ hrStyle } aria-hidden="true" />
				</div>
			) : (
				<hr { ...blockProps } style={ hrStyle } />
			) }
		</>
	);
}