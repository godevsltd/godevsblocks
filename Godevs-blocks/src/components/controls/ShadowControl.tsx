/**
 * ShadowControl — Box-shadow layer list builder.
 *
 * Each layer: x, y, blur, spread (UnitInputs) + color (ColorControl) + inset toggle.
 * Emits a complete CSS box-shadow string.
 *
 * @example output: "0px 4px 16px 0px rgba(0,0,0,0.1), inset 0px 1px 0px rgba(255,255,255,0.1)"
 */

import { useState, useCallback } from '@wordpress/element';
import { Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { UnitInput } from './UnitInput';
import { ColorControl } from './ColorControl';

// ── Types ─────────────────────────────────────────────────────────────────

interface ShadowLayer {
	x: string;
	y: string;
	blur: string;
	spread: string;
	color: string;
	inset: boolean;
}

interface ShadowControlProps {
	label: string;
	value: string | undefined;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

// ── Serializer / parser ───────────────────────────────────────────────────

function layerToString( layer: ShadowLayer ): string {
	const parts = [
		layer.inset ? 'inset' : '',
		layer.x || '0',
		layer.y || '0',
		layer.blur || '0',
		layer.spread || '0',
		layer.color || 'rgba(0,0,0,0.1)',
	].filter( Boolean );
	return parts.join( ' ' );
}

function layersToString( layers: ShadowLayer[] ): string {
	if ( 0 === layers.length ) {
		return 'none';
	}
	return layers.map( layerToString ).join( ', ' );
}

function defaultLayer(): ShadowLayer {
	return {
		x: '0px',
		y: '4px',
		blur: '16px',
		spread: '0px',
		color: 'rgba(0,0,0,0.1)',
		inset: false,
	};
}

// ── Component ─────────────────────────────────────────────────────────────

export function ShadowControl( {
	label,
	value,
	onChange,
	disabled = false,
}: ShadowControlProps ) {
	const [ layers, setLayers ] = useState< ShadowLayer[] >( () => {
		if ( ! value || 'none' === value ) {
			return [];
		}
		// Simple initialisation: start with one empty layer if value exists but unparsed.
		return [ defaultLayer() ];
	} );

	const emit = useCallback(
		( next: ShadowLayer[] ) => {
			onChange( layersToString( next ) );
		},
		[ onChange ]
	);

	function addLayer() {
		const next = [ ...layers, defaultLayer() ];
		setLayers( next );
		emit( next );
	}

	function removeLayer( idx: number ) {
		const next = layers.filter( ( _, i ) => i !== idx );
		setLayers( next );
		emit( next );
	}

	function updateLayer( idx: number, patch: Partial< ShadowLayer > ) {
		const next = layers.map( ( l, i ) =>
			i === idx ? { ...l, ...patch } : l
		);
		setLayers( next );
		emit( next );
	}

	return (
		<div className="gb-shadow-control">
			<div className="gb-shadow-control__header">
				<span className="gb-shadow-control__label">{ label }</span>
				<Button
					isSmall
					variant="secondary"
					onClick={ addLayer }
					disabled={ disabled }
					aria-label={ __( 'Add shadow layer', 'goblocks' ) }
				>
					{ __( '+ Add', 'goblocks' ) }
				</Button>
			</div>

			{ layers.map( ( layer, idx ) => (
				<div key={ idx } className="gb-shadow-control__layer">
					<div className="gb-shadow-control__layer-header">
						<span>
							{ __( 'Layer', 'goblocks' ) } { idx + 1 }
						</span>
						<Button
							isSmall
							variant="tertiary"
							isDestructive
							onClick={ () => removeLayer( idx ) }
							disabled={ disabled }
							aria-label={ __( 'Remove layer', 'goblocks' ) }
						>
							{ __( 'Remove', 'goblocks' ) }
						</Button>
					</div>

					<div className="gb-shadow-control__layer-grid">
						<UnitInput
							label={ __( 'X', 'goblocks' ) }
							value={ layer.x }
							onChange={ ( v ) => updateLayer( idx, { x: v } ) }
							defaultUnit="px"
							disabled={ disabled }
							breakpoint="base"
						/>
						<UnitInput
							label={ __( 'Y', 'goblocks' ) }
							value={ layer.y }
							onChange={ ( v ) => updateLayer( idx, { y: v } ) }
							defaultUnit="px"
							disabled={ disabled }
							breakpoint="base"
						/>
						<UnitInput
							label={ __( 'Blur', 'goblocks' ) }
							value={ layer.blur }
							onChange={ ( v ) =>
								updateLayer( idx, { blur: v } )
							}
							defaultUnit="px"
							min={ 0 }
							disabled={ disabled }
							breakpoint="base"
						/>
						<UnitInput
							label={ __( 'Spread', 'goblocks' ) }
							value={ layer.spread }
							onChange={ ( v ) =>
								updateLayer( idx, { spread: v } )
							}
							defaultUnit="px"
							disabled={ disabled }
							breakpoint="base"
						/>
					</div>

					<ColorControl
						label={ __( 'Color', 'goblocks' ) }
						value={ layer.color }
						onChange={ ( v ) => updateLayer( idx, { color: v } ) }
						breakpoint="base"
						disabled={ disabled }
					/>

					<ToggleControl
						label={ __( 'Inset', 'goblocks' ) }
						checked={ layer.inset }
						onChange={ ( v ) => updateLayer( idx, { inset: v } ) }
						disabled={ disabled }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</div>
			) ) }
		</div>
	);
}
