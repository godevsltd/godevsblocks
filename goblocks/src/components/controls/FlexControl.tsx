/**
 * FlexControl — Flex layout sub-controls.
 *
 * Shown inside LayoutPanel only when display = flex | inline-flex.
 * Controls: direction, wrap, justify-content, align-items, align-content, gap.
 */

import {
	Icon,
	arrowRight,
	arrowLeft,
	arrowDown,
	arrowUp,
} from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { ToggleGroupControl } from './ToggleGroupControl';
import { UnitInput } from './UnitInput';

// ── Types ─────────────────────────────────────────────────────────────────

export interface FlexValues {
	flexDirection?: string | undefined;
	flexWrap?: string | undefined;
	justifyContent?: string | undefined;
	alignItems?: string | undefined;
	alignContent?: string | undefined;
	gap?: string | undefined;
	columnGap?: string | undefined;
	rowGap?: string | undefined;
}

interface FlexControlProps {
	values: FlexValues;
	onChange: ( property: keyof FlexValues, value: string ) => void;
	disabled?: boolean;
}

// ── Option sets ───────────────────────────────────────────────────────────

const DIRECTION_OPTIONS = [
	{
		label: 'Row',
		value: 'row',
		ariaLabel: __( 'Row', 'goblocks' ),
		icon: <Icon icon={ arrowRight } size={ 16 } />,
	},
	{
		label: 'Row ←',
		value: 'row-reverse',
		ariaLabel: __( 'Row reverse', 'goblocks' ),
		icon: <Icon icon={ arrowLeft } size={ 16 } />,
	},
	{
		label: 'Col',
		value: 'column',
		ariaLabel: __( 'Column', 'goblocks' ),
		icon: <Icon icon={ arrowDown } size={ 16 } />,
	},
	{
		label: 'Col ↑',
		value: 'column-reverse',
		ariaLabel: __( 'Column reverse', 'goblocks' ),
		icon: <Icon icon={ arrowUp } size={ 16 } />,
	},
];

const WRAP_OPTIONS = [
	{ label: __( 'Nowrap', 'goblocks' ), value: 'nowrap' },
	{ label: __( 'Wrap', 'goblocks' ), value: 'wrap' },
];

const JUSTIFY_OPTIONS = [
	{ label: '|←', value: 'flex-start', ariaLabel: __( 'Start', 'goblocks' ) },
	{ label: '→|', value: 'flex-end', ariaLabel: __( 'End', 'goblocks' ) },
	{ label: '|■|', value: 'center', ariaLabel: __( 'Center', 'goblocks' ) },
	{
		label: '←→',
		value: 'space-between',
		ariaLabel: __( 'Space between', 'goblocks' ),
	},
	{
		label: '|←→|',
		value: 'space-around',
		ariaLabel: __( 'Space around', 'goblocks' ),
	},
	{
		label: '⋯',
		value: 'space-evenly',
		ariaLabel: __( 'Space evenly', 'goblocks' ),
	},
];

const ALIGN_OPTIONS = [
	{ label: __( 'Start', 'goblocks' ), value: 'flex-start' },
	{ label: __( 'End', 'goblocks' ), value: 'flex-end' },
	{ label: __( 'Center', 'goblocks' ), value: 'center' },
	{ label: __( 'Stretch', 'goblocks' ), value: 'stretch' },
	{ label: __( 'Baseline', 'goblocks' ), value: 'baseline' },
];

// ── Component ─────────────────────────────────────────────────────────────

export function FlexControl( {
	values,
	onChange,
	disabled = false,
}: FlexControlProps ) {
	return (
		<div className="gb-flex-control">
			<ToggleGroupControl
				label={ __( 'Direction', 'goblocks' ) }
				value={ values.flexDirection }
				options={ DIRECTION_OPTIONS }
				onChange={ ( v ) => onChange( 'flexDirection', v ) }
				disabled={ disabled }
			/>

			<ToggleGroupControl
				label={ __( 'Wrap', 'goblocks' ) }
				value={ values.flexWrap }
				options={ WRAP_OPTIONS }
				onChange={ ( v ) => onChange( 'flexWrap', v ) }
				disabled={ disabled }
			/>

			<ToggleGroupControl
				label={ __( 'Justify', 'goblocks' ) }
				value={ values.justifyContent }
				options={ JUSTIFY_OPTIONS }
				onChange={ ( v ) => onChange( 'justifyContent', v ) }
				disabled={ disabled }
			/>

			<ToggleGroupControl
				label={ __( 'Align items', 'goblocks' ) }
				value={ values.alignItems }
				options={ ALIGN_OPTIONS }
				onChange={ ( v ) => onChange( 'alignItems', v ) }
				disabled={ disabled }
			/>

			<div className="gb-flex-control__gap">
				<UnitInput
					label={ __( 'Gap', 'goblocks' ) }
					value={ values.gap }
					onChange={ ( v ) => onChange( 'gap', v ) }
					defaultUnit="px"
					disabled={ disabled }
					breakpoint="base"
				/>
			</div>
		</div>
	);
}
