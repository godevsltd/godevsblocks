/**
 * LayoutPanel — Display mode, flex/grid sub-controls, position, z-index, overflow.
 */

import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ToggleGroupControl } from '../controls/ToggleGroupControl';
import { UnitInput } from '../controls/UnitInput';
import { FlexControl } from '../controls/FlexControl';
import type { BlockStyles } from '../../types/styles';
import type { UseResponsiveStylesReturn } from '../../hooks/useResponsiveStyles';
import type { FlexValues } from '../controls/FlexControl';

// ── Option sets ───────────────────────────────────────────────────────────

const DISPLAY_OPTIONS = [
	{ label: 'Block',        value: 'block' },
	{ label: 'Inline',       value: 'inline' },
	{ label: 'Inline-block', value: 'inline-block' },
	{ label: 'Flex',         value: 'flex' },
	{ label: 'Inline-flex',  value: 'inline-flex' },
	{ label: 'Grid',         value: 'grid' },
	{ label: 'Inline-grid',  value: 'inline-grid' },
	{ label: 'None',         value: 'none' },
];

const POSITION_OPTIONS = [
	{ label: __( 'Static', 'goblocks' ), value: 'static' },
	{ label: __( 'Relative', 'goblocks' ), value: 'relative' },
	{ label: __( 'Absolute', 'goblocks' ), value: 'absolute' },
	{ label: __( 'Fixed', 'goblocks' ), value: 'fixed' },
	{ label: __( 'Sticky', 'goblocks' ), value: 'sticky' },
];

const OVERFLOW_OPTIONS = [
	{ label: __( 'Visible', 'goblocks' ), value: 'visible' },
	{ label: __( 'Hidden', 'goblocks' ), value: 'hidden' },
	{ label: __( 'Auto', 'goblocks' ), value: 'auto' },
	{ label: __( 'Scroll', 'goblocks' ), value: 'scroll' },
];

// ── Types ─────────────────────────────────────────────────────────────────

interface LayoutPanelProps {
	styles: BlockStyles;
	responsive: UseResponsiveStylesReturn;
}

// ── Component ─────────────────────────────────────────────────────────────

export function LayoutPanel( { responsive }: LayoutPanelProps ) {
	const { getStyle, getInheritedValue, setStyle } = responsive;

	function get( prop: string ) {
		return getStyle( 'layout', prop );
	}
	function set( prop: string ) {
		return ( v: string ) => setStyle( 'layout', prop, v );
	}

	const display =
		get( 'display' ) ?? getInheritedValue( 'layout', 'display' );
	const position = get( 'position' ) ?? getStyle( 'position', 'position' );
	const isFlex   = display === 'flex' || display === 'inline-flex';
	const isGrid   = display === 'grid' || display === 'inline-grid';
	const isNotStatic = position && position !== 'static';

	const flexValues: FlexValues = {
		flexDirection: get( 'flexDirection' ),
		flexWrap: get( 'flexWrap' ),
		justifyContent: get( 'justifyContent' ),
		alignItems: get( 'alignItems' ),
		alignContent: get( 'alignContent' ),
		gap: getStyle( 'spacing', 'gap' ),
	};

	function handleFlexChange( property: keyof FlexValues, value: string ) {
		if ( 'gap' === property ) {
			setStyle( 'spacing', 'gap', value );
		} else {
			setStyle( 'layout', property, value );
		}
	}

	return (
		<PanelBody title={ __( 'Layout', 'goblocks' ) } initialOpen={ false }>
			<ToggleGroupControl
				label={ __( 'Display', 'goblocks' ) }
				value={ display }
				options={ DISPLAY_OPTIONS }
				onChange={ set( 'display' ) }
			/>

			{ isFlex && (
				<FlexControl
					values={ flexValues }
					onChange={ handleFlexChange }
				/>
			) }

			<ToggleGroupControl
				label={ __( 'Overflow', 'goblocks' ) }
				value={ get( 'overflow' ) }
				options={ OVERFLOW_OPTIONS }
				onChange={ set( 'overflow' ) }
				deselectable
			/>

			<ToggleGroupControl
				label={ __( 'Position', 'goblocks' ) }
				value={ getStyle( 'position', 'position' ) }
				options={ POSITION_OPTIONS }
				onChange={ ( v ) => setStyle( 'position', 'position', v ) }
				deselectable
			/>

			{ isNotStatic && (
				<div className="gb-layout-panel__offsets">
					{ ( [ 'top', 'right', 'bottom', 'left' ] as const ).map(
						( side ) => (
							<UnitInput
								key={ side }
								label={
									side.charAt( 0 ).toUpperCase() +
									side.slice( 1 )
								}
								value={ getStyle( 'position', side ) }
								inheritedValue={ getInheritedValue(
									'position',
									side
								) }
								onChange={ ( v ) =>
									setStyle( 'position', side, v )
								}
								defaultUnit="px"
								units={ [
									'px',
									'rem',
									'em',
									'%',
									'vw',
									'vh',
									'auto',
								] }
								breakpoint="base"
							/>
						)
					) }
				</div>
			) }

			<UnitInput
				label={ __( 'Z-index', 'goblocks' ) }
				value={ getStyle( 'position', 'zIndex' ) }
				inheritedValue={ getInheritedValue( 'position', 'zIndex' ) }
				onChange={ ( v ) => setStyle( 'position', 'zIndex', v ) }
				defaultUnit=""
				units={ [ '' as any, 'auto' ] }
				breakpoint="base"
			/>
		</PanelBody>
	);
}
