/**
 * SizingPanel — Width, height, min/max dimensions, aspect ratio.
 */

import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DimensionsControl } from '../controls/DimensionsControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';
import type { DimensionValues } from '../controls/DimensionsControl';

// ── Types ─────────────────────────────────────────────────────────────────

interface SizingPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Component ─────────────────────────────────────────────────────────────

export function SizingPanel( { responsive }: SizingPanelProps ) {
	const { getStyle, getInheritedValue, setStyle } = responsive;

	const PROPS: Array< keyof DimensionValues > = [
		'width',
		'minWidth',
		'maxWidth',
		'height',
		'minHeight',
		'maxHeight',
		'aspectRatio',
	];

	const values: DimensionValues = Object.fromEntries(
		PROPS.map( ( p ) => [ p, getStyle( 'sizing', p ) ] )
	) as DimensionValues;

	const inherited: DimensionValues = Object.fromEntries(
		PROPS.map( ( p ) => [ p, getInheritedValue( 'sizing', p ) ] )
	) as DimensionValues;

	function handleChange( property: keyof DimensionValues, value: string ) {
		setStyle( 'sizing', property, value );
	}

	return (
		<PanelBody title={ __( 'Sizing', 'goblocks' ) } initialOpen={ false }>
			<DimensionsControl
				values={ values }
				inherited={ inherited }
				onChange={ handleChange }
				showMinMax
				showAspectRatio
			/>
		</PanelBody>
	);
}
