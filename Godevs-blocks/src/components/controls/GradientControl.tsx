/**
 * GradientControl — Visual CSS gradient builder.
 *
 * Supports: linear-gradient, radial-gradient, conic-gradient.
 * Color stops: add/remove/reorder with position inputs.
 * Emits a complete CSS gradient string.
 *
 * Parses the incoming `value` prop on mount so the UI reflects any
 * gradient that was previously saved.
 *
 * @example output: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
 */

import { useState, useCallback } from '@wordpress/element';
import { Button, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ColorControl } from './ColorControl';
import { UnitInput } from './UnitInput';

// ── Types ─────────────────────────────────────────────────────────────────

type GradientType = 'linear-gradient' | 'radial-gradient' | 'conic-gradient';

interface ColorStop {
	color: string;
	position: string;
}

interface GradientState {
	type: GradientType;
	angle: string;
	stops: ColorStop[];
}

interface GradientControlProps {
	label: string;
	value: string | undefined;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

// ── Parser ────────────────────────────────────────────────────────────────

/**
 * Parse a CSS gradient string into GradientState.
 * Supports hex, rgb/rgba, hsl/hsla, and named color stops.
 * Returns null when the format is unrecognised.
 * @param css
 */
function parseGradient( css: string ): GradientState | null {
	if ( ! css ) {
		return null;
	}

	// linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)
	const linearMatch = css.match(
		/^linear-gradient\(\s*([^,]+?)\s*,\s*(.+)\s*\)$/i
	);
	if ( linearMatch ) {
		const stops = parseStops( linearMatch[ 2 ]! );
		if ( stops ) {
			return {
				type: 'linear-gradient',
				angle: linearMatch[ 1 ]!.trim(),
				stops,
			};
		}
	}

	// conic-gradient(from 135deg, #3b82f6 0%, #8b5cf6 100%)
	const conicMatch = css.match(
		/^conic-gradient\(\s*from\s+([^,]+?)\s*,\s*(.+)\s*\)$/i
	);
	if ( conicMatch ) {
		const stops = parseStops( conicMatch[ 2 ]! );
		if ( stops ) {
			return {
				type: 'conic-gradient',
				angle: conicMatch[ 1 ]!.trim(),
				stops,
			};
		}
	}

	// radial-gradient(#3b82f6 0%, #8b5cf6 100%)
	const radialMatch = css.match( /^radial-gradient\(\s*(.+)\s*\)$/i );
	if ( radialMatch ) {
		const stops = parseStops( radialMatch[ 1 ]! );
		if ( stops ) {
			return { type: 'radial-gradient', angle: '0deg', stops };
		}
	}

	return null;
}

/**
 * Extract color stops from the stops portion of a gradient string.
 * Handles hex, rgb/rgba/hsl/hsla with parentheses (no nested parens), and named colors.
 * @param stopsStr
 */
function parseStops( stopsStr: string ): ColorStop[] | null {
	// Match: <color> <position>
	//   color: #hex | rgb/rgba/hsl/hsla(...) | word
	//   position: 0% or 0px
	const pattern =
		/(#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?)\([^)]+\)|[a-zA-Z]+)\s+(\d+(?:\.\d+)?(?:%|px))/g;

	const stops: ColorStop[] = [];
	let match: RegExpExecArray | null;

	while ( ( match = pattern.exec( stopsStr ) ) !== null ) {
		stops.push( { color: match[ 1 ]!, position: match[ 2 ]! } );
	}

	return stops.length >= 2 ? stops : null;
}

// ── Serializer ────────────────────────────────────────────────────────────

function serialize( state: GradientState ): string {
	const stops = state.stops
		.map( ( s ) => `${ s.color } ${ s.position }` )
		.join( ', ' );

	if ( 'linear-gradient' === state.type ) {
		return `linear-gradient(${ state.angle }, ${ stops })`;
	}
	if ( 'conic-gradient' === state.type ) {
		return `conic-gradient(from ${ state.angle }, ${ stops })`;
	}
	return `radial-gradient(${ stops })`;
}

function defaultState(): GradientState {
	return {
		type: 'linear-gradient',
		angle: '135deg',
		stops: [
			{ color: '#3b82f6', position: '0%' },
			{ color: '#8b5cf6', position: '100%' },
		],
	};
}

// ── Component ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS: Array< { label: string; value: GradientType } > = [
	{ label: __( 'Linear', 'goblocks' ), value: 'linear-gradient' },
	{ label: __( 'Radial', 'goblocks' ), value: 'radial-gradient' },
	{ label: __( 'Conic', 'goblocks' ), value: 'conic-gradient' },
];

export function GradientControl( {
	label,
	value,
	onChange,
	disabled = false,
}: GradientControlProps ) {
	// Lazy init: parse stored gradient string on first mount so controls
	// reflect the saved state when the inspector is reopened.
	const [ state, setState ] = useState< GradientState >( () => {
		if ( value ) {
			const parsed = parseGradient( value );
			if ( parsed ) {
				return parsed;
			}
		}
		return defaultState();
	} );

	const emit = useCallback(
		( next: GradientState ) => {
			onChange( serialize( next ) );
		},
		[ onChange ]
	);

	function update( patch: Partial< GradientState > ) {
		const next = { ...state, ...patch };
		setState( next );
		emit( next );
	}

	function updateStop( idx: number, patch: Partial< ColorStop > ) {
		const stops = state.stops.map( ( s, i ) =>
			i === idx ? { ...s, ...patch } : s
		);
		update( { stops } );
	}

	function addStop() {
		const stops = [ ...state.stops, { color: '#ffffff', position: '50%' } ];
		update( { stops } );
	}

	function removeStop( idx: number ) {
		if ( state.stops.length <= 2 ) {
			return;
		}
		const stops = state.stops.filter( ( _, i ) => i !== idx );
		update( { stops } );
	}

	const showAngle = 'radial-gradient' !== state.type;

	return (
		<div className="gb-gradient-control">
			<span className="gb-gradient-control__label">{ label }</span>

			{ /* Gradient preview */ }
			<div
				className="gb-gradient-control__preview"
				style={ { background: value || serialize( state ) } }
				aria-hidden
			/>

			<SelectControl
				label={ __( 'Type', 'goblocks' ) }
				value={ state.type }
				options={ TYPE_OPTIONS }
				onChange={ ( v ) => update( { type: v as GradientType } ) }
				disabled={ disabled }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ showAngle && (
				<UnitInput
					label={ __( 'Angle', 'goblocks' ) }
					value={ state.angle }
					onChange={ ( v ) => update( { angle: v } ) }
					defaultUnit="deg"
					units={ [ 'deg', 'turn' ] }
					min={ 0 }
					max={ 360 }
					disabled={ disabled }
					breakpoint="base"
				/>
			) }

			<div className="gb-gradient-control__stops">
				<div className="gb-gradient-control__stops-header">
					<span>{ __( 'Color stops', 'goblocks' ) }</span>
					<Button
						isSmall
						variant="secondary"
						onClick={ addStop }
						disabled={ disabled }
					>
						{ __( '+ Add', 'goblocks' ) }
					</Button>
				</div>

				{ state.stops.map( ( stop, idx ) => (
					<div key={ idx } className="gb-gradient-control__stop">
						<ColorControl
							label={ `${ __( 'Stop', 'goblocks' ) } ${
								idx + 1
							}` }
							value={ stop.color }
							onChange={ ( v ) =>
								updateStop( idx, { color: v } )
							}
							breakpoint="base"
							disabled={ disabled }
						/>
						<UnitInput
							label={ __( 'Position', 'goblocks' ) }
							value={ stop.position }
							onChange={ ( v ) =>
								updateStop( idx, { position: v } )
							}
							defaultUnit="%"
							units={ [ '%', 'px' ] }
							min={ 0 }
							max={ 100 }
							disabled={ disabled }
							breakpoint="base"
						/>
						{ state.stops.length > 2 && (
							<Button
								isSmall
								variant="tertiary"
								isDestructive
								onClick={ () => removeStop( idx ) }
								disabled={ disabled }
							>
								{ __( 'Remove', 'goblocks' ) }
							</Button>
						) }
					</div>
				) ) }
			</div>
		</div>
	);
}
