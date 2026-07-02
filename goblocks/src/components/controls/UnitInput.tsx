/**
 * UnitInput — Single value + unit selector control.
 *
 * Emits a combined string like "20px", "1.5rem", "auto".
 * Keyword units (auto/none/inherit) suppress the number input.
 * Shows inherited value as placeholder when active breakpoint has no value.
 */

import { useState, useCallback, useRef, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ControlProps, UnitOption } from '../../types/controls';
import { LENGTH_UNITS, KEYWORD_UNITS } from '../../types/controls';
import { parseValue } from '../../utils/css/units';

// ── Types ─────────────────────────────────────────────────────────────────

interface UnitInputProps extends Omit< ControlProps, 'tokenOptions' > {
	/** Default unit when value is a bare number. Default: 'px' */
	defaultUnit?: UnitOption;
	/** Minimum numeric value. */
	min?: number;
	/** Maximum numeric value. */
	max?: number;
	/** Step for numeric input. Default: 1 */
	step?: number;
	/** Allowed units. Defaults to all length + keyword units. */
	units?: UnitOption[];
	/** CSS property name — used to derive default unit. */
	property?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const KEYWORD_SET = new Set< string >( KEYWORD_UNITS );

function splitValue( raw: string ): { num: string; unit: UnitOption } {
	if ( ! raw ) {
		return { num: '', unit: 'px' };
	}
	if ( KEYWORD_SET.has( raw ) ) {
		return { num: '', unit: raw as UnitOption };
	}

	const parsed = parseValue( raw );
	if ( parsed ) {
		return {
			num: String( parsed.number ),
			unit: ( parsed.unit || 'px' ) as UnitOption,
		};
	}
	return { num: raw, unit: 'px' };
}

function joinValue( num: string, unit: UnitOption ): string {
	if ( KEYWORD_SET.has( unit ) ) {
		return unit;
	}
	if ( '' === num ) {
		return '';
	}
	return `${ num }${ unit }`;
}

// ── Component ─────────────────────────────────────────────────────────────

export function UnitInput( {
	value,
	onChange,
	label,
	help,
	inheritedValue,
	resetable = true,
	disabled = false,
	defaultUnit = 'px',
	min,
	max,
	step = 1,
	units = [ ...LENGTH_UNITS, ...KEYWORD_UNITS ],
}: UnitInputProps ) {
	const { num: initNum, unit: initUnit } = splitValue( value ?? '' );
	const [ localNum, setLocalNum ] = useState( initNum );
	const [ localUnit, setLocalUnit ] = useState< UnitOption >(
		initUnit || defaultUnit
	);
	const inputRef = useRef< HTMLInputElement >( null );

	// Sync when the controlled value prop changes (e.g. breakpoint switch).
	useEffect( () => {
		const { num, unit } = splitValue( value ?? '' );
		setLocalNum( num );
		setLocalUnit( unit || ( defaultUnit as UnitOption ) );
	}, [ value ] ); // defaultUnit is a stable prop default; only value drives sync

	const isKeyword = KEYWORD_SET.has( localUnit );
	// True when a value is explicitly set at the active breakpoint (not inherited).
	const hasValue = value !== undefined && value !== '';
	const placeholder = inheritedValue
		? splitValue( inheritedValue ).num
		: undefined;

	const emit = useCallback(
		( num: string, unit: UnitOption ) => {
			onChange( joinValue( num, unit ) );
		},
		[ onChange ]
	);

	function handleNumChange( e: React.ChangeEvent< HTMLInputElement > ) {
		const val = e.target.value;
		setLocalNum( val );
		emit( val, localUnit );
	}

	function handleUnitChange( unit: string ) {
		const u = unit as UnitOption;
		setLocalUnit( u );
		if ( KEYWORD_SET.has( u ) ) {
			onChange( u );
		} else {
			emit( localNum, u );
		}
	}

	function handleReset() {
		setLocalNum( '' );
		setLocalUnit( defaultUnit );
		onChange( '' );
	}

	const UNIT_LABELS: Partial< Record< string, string > > = {
		inherit: 'inh',
		svh: 'svh',
		dvh: 'dvh',
	};
	const unitOptions = units.map( ( u ) => ( {
		label: UNIT_LABELS[ u ] ?? u,
		value: u,
	} ) );

	return (
		<div className="gb-unit-input">
			<div className="gb-unit-input__header">
				{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
				<label className="gb-unit-input__label">
					{ label }
					{ hasValue && (
						<span
							className="gb-unit-input__bp-dot"
							aria-label="override set at this breakpoint"
						/>
					) }
				</label>
				{ resetable && hasValue && (
					<Button
						className="gb-unit-input__reset"
						isSmall
						variant="tertiary"
						onClick={ handleReset }
						aria-label={ __( 'Reset', 'goblocks' ) }
						disabled={ disabled }
					>
						{ __( 'Reset', 'goblocks' ) }
					</Button>
				) }
			</div>

			<div className="gb-unit-input__row">
				{ ! isKeyword && (
					<input
						ref={ inputRef }
						type="number"
						className="gb-unit-input__number"
						value={ localNum }
						placeholder={ placeholder }
						min={ min }
						max={ max }
						step={ step }
						disabled={ disabled }
						onChange={ handleNumChange }
						aria-label={ label }
					/>
				) }

				<select
					className="gb-unit-input__unit"
					value={ localUnit }
					onChange={ ( e ) => handleUnitChange( e.target.value ) }
					disabled={ disabled }
					aria-label={ __( 'Unit', 'goblocks' ) }
				>
					{ unitOptions.map( ( opt ) => (
						<option key={ opt.value } value={ opt.value }>
							{ opt.label }
						</option>
					) ) }
				</select>
			</div>

			{ help && <p className="gb-unit-input__help">{ help }</p> }
		</div>
	);
}
