/**
 * SpacingPanel — Padding, margin, and gap controls.
 *
 * Wraps all spacing controls per the active breakpoint via useResponsiveStyles.
 */

import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SpacingControl } from '../controls/SpacingControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';

// ── Types ─────────────────────────────────────────────────────────────────

interface SpacingPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Component ─────────────────────────────────────────────────────────────

export function SpacingPanel( { responsive }: SpacingPanelProps ) {
	const { getStyle, getInheritedValue, setStyle, setStyleBatch } = responsive;

	function spacingValues( prefix: 'padding' | 'margin' ) {
		return {
			top: getStyle( 'spacing', `${ prefix }Top` ),
			right: getStyle( 'spacing', `${ prefix }Right` ),
			bottom: getStyle( 'spacing', `${ prefix }Bottom` ),
			left: getStyle( 'spacing', `${ prefix }Left` ),
		};
	}

	function spacingInherited( prefix: 'padding' | 'margin' ) {
		return {
			top: getInheritedValue( 'spacing', `${ prefix }Top` ),
			right: getInheritedValue( 'spacing', `${ prefix }Right` ),
			bottom: getInheritedValue( 'spacing', `${ prefix }Bottom` ),
			left: getInheritedValue( 'spacing', `${ prefix }Left` ),
		};
	}

	function handleSpacingChange(
		prefix: 'padding' | 'margin',
		side: string,
		value: string
	) {
		const map: Record< string, string > = {
			top: `${ prefix }Top`,
			right: `${ prefix }Right`,
			bottom: `${ prefix }Bottom`,
			left: `${ prefix }Left`,
		};
		const property = map[ side ];
		if ( property ) {
			setStyle( 'spacing', property, value );
		}
	}

	function handleAllChange( prefix: 'padding' | 'margin', value: string ) {
		setStyleBatch( 'spacing', {
			[ `${ prefix }Top` ]: value,
			[ `${ prefix }Right` ]: value,
			[ `${ prefix }Bottom` ]: value,
			[ `${ prefix }Left` ]: value,
		} );
	}

	return (
		<PanelBody title={ __( 'Spacing', 'goblocks' ) } initialOpen={ false }>
			<SpacingControl
				label={ __( 'Padding', 'goblocks' ) }
				values={ spacingValues( 'padding' ) }
				inherited={ spacingInherited( 'padding' ) }
				onChange={ ( side, value ) =>
					handleSpacingChange( 'padding', side, value )
				}
				onChangeAll={ ( value ) => handleAllChange( 'padding', value ) }
			/>

			<SpacingControl
				label={ __( 'Margin', 'goblocks' ) }
				values={ spacingValues( 'margin' ) }
				inherited={ spacingInherited( 'margin' ) }
				onChange={ ( side, value ) =>
					handleSpacingChange( 'margin', side, value )
				}
				onChangeAll={ ( value ) => handleAllChange( 'margin', value ) }
			/>

			<SpacingControl
				label={ __( 'Gap', 'goblocks' ) }
				values={ {
					top: getStyle( 'spacing', 'rowGap' ),
					left: getStyle( 'spacing', 'columnGap' ),
				} }
				inherited={ {
					top: getInheritedValue( 'spacing', 'rowGap' ),
					left: getInheritedValue( 'spacing', 'columnGap' ),
				} }
				onChange={ ( side, value ) => {
					if ( 'top' === side ) {
						setStyle( 'spacing', 'rowGap', value );
					}
					if ( 'left' === side ) {
						setStyle( 'spacing', 'columnGap', value );
					}
				} }
				twoAxis
			/>
		</PanelBody>
	);
}
