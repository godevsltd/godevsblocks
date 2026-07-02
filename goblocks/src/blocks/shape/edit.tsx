import { useEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import {
	ShapeInspector,
	type ShapeAttributes,
} from './components/Inspector';
import { SHAPE_MAP, buildShapeSvg } from './shapes';
import type { ShapeDefinition } from './shapes/index';

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< ShapeAttributes > ) {
	const {
		uniqueId,
		shapeSlug,
		fillColor,
		fillType,
		gradientFrom,
		gradientTo,
		gradientAngle,
		shapeOpacity,
		shapeHeight,
		flipX,
		flipY,
		placement,
		globalClasses,
		styles,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'shape',
		uniqueId,
		styles,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< ShapeAttributes > ),
	} );

	const shape = ( SHAPE_MAP[ shapeSlug ] ?? SHAPE_MAP.wave ) as ShapeDefinition;

	const wrapperClass = clsx(
		'gb-shape',
		uniqueId && `gb-shape-${ uniqueId }`,
		`gb-shape--${ placement }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	const gradId = uniqueId ? `gb-grad-${ uniqueId }` : '';

	const svgMarkup = buildShapeSvg(
		shape,
		fillColor,
		shapeHeight,
		flipX,
		flipY,
		fillType === 'gradient' ? gradientFrom : '',
		fillType === 'gradient' ? gradientTo   : '',
		gradientAngle,
		gradId
	);

	const opacityStyle = ( shapeOpacity ?? 100 ) < 100
		? { opacity: ( shapeOpacity ?? 100 ) / 100 }
		: undefined;

	return (
		<>
			<ShapeInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps } style={ { ...( blockProps.style as object ), ...opacityStyle } }>
				<div
					className="gb-shape__svg-wrapper"
					dangerouslySetInnerHTML={ { __html: svgMarkup } }
				/>
			</div>
		</>
	);
}