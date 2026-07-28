/**
 * RangeControl — Slider + number input with optional unit selector.
 *
 * Used for: opacity, border-width presets, overlay opacity, z-index, etc.
 * Wraps @wordpress/components RangeControl and adds unit support.
 */

import { RangeControl as WpRangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { parseValue } from '../../utils/css/units';
import type { UnitOption } from '../../types/controls';

// ── Types ─────────────────────────────────────────────────────────────────

interface RangeControlProps {
	label: string;
	value: string | undefined;
	onChange: ( value: string ) => void;
	min: number;
	max: number;
	step?: number;
	unit?: UnitOption;
	help?: string;
	disabled?: boolean;
	/** Show reset button when value is set. Default: true. */
	resetable?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function RangeControl( {
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	unit = '',
	help,
	disabled = false,
	resetable = true,
}: RangeControlProps ) {
	const parsed = value ? parseValue( value ) : null;
	const numeric = parsed ? parsed.number : undefined;

	function handleChange( next: number | undefined ) {
		if ( next === undefined || next === null ) {
			onChange( '' );
			return;
		}
		onChange( unit ? `${ next }${ unit }` : String( next ) );
	}

	return (
		<WpRangeControl
			label={ label }
			value={ numeric }
			onChange={ handleChange }
			min={ min }
			max={ max }
			step={ step }
			help={ help }
			disabled={ disabled }
			allowReset={ resetable }
			// @ts-ignore — WP components typing doesn't always expose all props
			__nextHasNoMarginBottom
		/>
	);
}
