/**
 * TypographyPanel — Font, size, weight, line-height, alignment, transform, color.
 */

import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { Icon, alignLeft, alignCenter, alignRight, alignJustify } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { FontControl } from '../controls/FontControl';
import { UnitInput } from '../controls/UnitInput';
import { ToggleGroupControl } from '../controls/ToggleGroupControl';
import { ColorControl } from '../controls/ColorControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';

// ── Option sets ───────────────────────────────────────────────────────────

const WEIGHT_OPTIONS = [
	{ label: __( '— Default —', 'goblocks' ), value: '' },
	{ label: __( 'Thin (100)', 'goblocks' ), value: '100' },
	{ label: __( 'Extra Light (200)', 'goblocks' ), value: '200' },
	{ label: __( 'Light (300)', 'goblocks' ), value: '300' },
	{ label: __( 'Regular (400)', 'goblocks' ), value: '400' },
	{ label: __( 'Medium (500)', 'goblocks' ), value: '500' },
	{ label: __( 'SemiBold (600)', 'goblocks' ), value: '600' },
	{ label: __( 'Bold (700)', 'goblocks' ), value: '700' },
	{ label: __( 'Extra Bold (800)', 'goblocks' ), value: '800' },
	{ label: __( 'Black (900)', 'goblocks' ), value: '900' },
];

const ALIGN_OPTIONS = [
	{ label: 'Left',    value: 'left',    ariaLabel: __( 'Left', 'goblocks' ),    icon: <Icon icon={ alignLeft }    size={ 16 } /> },
	{ label: 'Center',  value: 'center',  ariaLabel: __( 'Center', 'goblocks' ),  icon: <Icon icon={ alignCenter }  size={ 16 } /> },
	{ label: 'Right',   value: 'right',   ariaLabel: __( 'Right', 'goblocks' ),   icon: <Icon icon={ alignRight }   size={ 16 } /> },
	{ label: 'Justify', value: 'justify', ariaLabel: __( 'Justify', 'goblocks' ), icon: <Icon icon={ alignJustify } size={ 16 } /> },
];

const TRANSFORM_OPTIONS = [
	{ label: __( 'None', 'goblocks' ), value: 'none' },
	{ label: __( 'UPPER', 'goblocks' ), value: 'uppercase' },
	{ label: __( 'lower', 'goblocks' ), value: 'lowercase' },
	{ label: __( 'Capitalize', 'goblocks' ), value: 'capitalize' },
];

const DECORATION_OPTIONS = [
	{ label: __( 'None', 'goblocks' ), value: 'none' },
	{ label: __( 'Underline', 'goblocks' ), value: 'underline' },
	{ label: __( 'Line-through', 'goblocks' ), value: 'line-through' },
];

const STYLE_OPTIONS = [
	{ label: __( 'Normal', 'goblocks' ), value: 'normal' },
	{ label: __( 'Italic', 'goblocks' ), value: 'italic' },
];

// ── Types ─────────────────────────────────────────────────────────────────

interface TypographyPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Component ─────────────────────────────────────────────────────────────

export function TypographyPanel( { responsive }: TypographyPanelProps ) {
	const { getStyle, getInheritedValue, setStyle, activeBreakpoint } = responsive;

	function get( prop: string ) {
		return getStyle( 'typography', prop );
	}
	function inh( prop: string ) {
		return getInheritedValue( 'typography', prop );
	}
	function set( prop: string ) {
		return ( v: string ) => setStyle( 'typography', prop, v );
	}

	return (
		<PanelBody
			title={ __( 'Typography', 'goblocks' ) }
			initialOpen={ false }
		>
			<FontControl
				label={ __( 'Font family', 'goblocks' ) }
				value={ get( 'fontFamily' ) }
				onChange={ set( 'fontFamily' ) }
			/>

			<UnitInput
				label={ __( 'Font size', 'goblocks' ) }
				value={ get( 'fontSize' ) }
				inheritedValue={ inh( 'fontSize' ) }
				onChange={ set( 'fontSize' ) }
				defaultUnit="rem"
				units={ [ 'rem', 'em', 'px', '%', 'vw' ] }
				breakpoint={ activeBreakpoint }
			/>

			<SelectControl
				label={ __( 'Font weight', 'goblocks' ) }
				value={ get( 'fontWeight' ) ?? '' }
				options={ WEIGHT_OPTIONS }
				onChange={ set( 'fontWeight' ) }
			/>

			<UnitInput
				label={ __( 'Line height', 'goblocks' ) }
				value={ get( 'lineHeight' ) }
				inheritedValue={ inh( 'lineHeight' ) }
				onChange={ set( 'lineHeight' ) }
				defaultUnit=""
				units={ [ '' as any, 'em', 'px' ] }
				breakpoint={ activeBreakpoint }
			/>

			<UnitInput
				label={ __( 'Letter spacing', 'goblocks' ) }
				value={ get( 'letterSpacing' ) }
				inheritedValue={ inh( 'letterSpacing' ) }
				onChange={ set( 'letterSpacing' ) }
				defaultUnit="em"
				units={ [ 'em', 'px', 'rem' ] }
				breakpoint={ activeBreakpoint }
			/>

			<ToggleGroupControl
				label={ __( 'Text align', 'goblocks' ) }
				value={ get( 'textAlign' ) }
				options={ ALIGN_OPTIONS }
				onChange={ set( 'textAlign' ) }
				deselectable
			/>

			<ToggleGroupControl
				label={ __( 'Text transform', 'goblocks' ) }
				value={ get( 'textTransform' ) }
				options={ TRANSFORM_OPTIONS }
				onChange={ set( 'textTransform' ) }
				deselectable
			/>

			<ToggleGroupControl
				label={ __( 'Text decoration', 'goblocks' ) }
				value={ get( 'textDecoration' ) }
				options={ DECORATION_OPTIONS }
				onChange={ set( 'textDecoration' ) }
				deselectable
			/>

			<ToggleGroupControl
				label={ __( 'Font style', 'goblocks' ) }
				value={ get( 'fontStyle' ) }
				options={ STYLE_OPTIONS }
				onChange={ set( 'fontStyle' ) }
				deselectable
			/>

			<ColorControl
				label={ __( 'Color', 'goblocks' ) }
				value={ get( 'color' ) }
				inheritedValue={ inh( 'color' ) }
				onChange={ set( 'color' ) }
				breakpoint={ activeBreakpoint }
			/>

			<TextControl
				label={ __( 'Text shadow', 'goblocks' ) }
				value={ get( 'textShadow' ) ?? '' }
				placeholder="0px 2px 8px rgba(0,0,0,0.25)"
				onChange={ set( 'textShadow' ) }
				help={ __( 'CSS text-shadow value', 'goblocks' ) }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ /* Hover state */ }
			<div className="gb-panel-state-section">
				<p className="gb-panel-state-section__label">
					{ __( ':hover state', 'goblocks' ) }
				</p>
				<ColorControl
					label={ __( 'Hover color', 'goblocks' ) }
					value={ responsive.getStyleState( 'typography', 'color', 'hover' ) }
					onChange={ ( v ) =>
						responsive.setStyleState( 'typography', 'color', 'hover', v )
					}
					breakpoint={ activeBreakpoint }
				/>
			</div>
		</PanelBody>
	);
}
