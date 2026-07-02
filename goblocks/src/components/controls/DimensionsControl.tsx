/**
 * DimensionsControl — Width + height with min/max support.
 *
 * Used in SizingPanel. Renders UnitInputs for:
 *   width, min-width, max-width, height, min-height, max-height, aspect-ratio.
 */

import { __ } from '@wordpress/i18n';
import { UnitInput } from './UnitInput';
import type { UnitOption } from '../../types/controls';

// ── Types ─────────────────────────────────────────────────────────────────

export interface DimensionValues {
	width?: string;
	minWidth?: string;
	maxWidth?: string;
	height?: string;
	minHeight?: string;
	maxHeight?: string;
	aspectRatio?: string;
}

interface DimensionsControlProps {
	values: DimensionValues;
	onChange: ( property: keyof DimensionValues, value: string ) => void;
	inherited?: DimensionValues;
	disabled?: boolean;
	defaultUnit?: UnitOption;
	/** Show min/max inputs. Default: false (show only width/height). */
	showMinMax?: boolean;
	/** Show aspect-ratio input. Default: false. */
	showAspectRatio?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function DimensionsControl( {
	values,
	onChange,
	inherited,
	disabled = false,
	defaultUnit = 'px',
	showMinMax = false,
	showAspectRatio = false,
}: DimensionsControlProps ) {
	function field(
		property: keyof DimensionValues,
		label: string,
		unit: UnitOption = defaultUnit
	) {
		return (
			<UnitInput
				key={ property }
				label={ label }
				value={ values[ property ] }
				inheritedValue={ inherited?.[ property ] }
				onChange={ ( v ) => onChange( property, v ) }
				defaultUnit={ unit }
				disabled={ disabled }
				breakpoint="base"
				units={ [
					'px',
					'rem',
					'em',
					'%',
					'vw',
					'vh',
					'svh',
					'dvh',
					'auto',
					'none',
					'inherit',
				] }
			/>
		);
	}

	return (
		<div className="gb-dimensions-control">
			{ /* W / H row */ }
			<div className="gb-dimensions-control__row">
				{ field( 'width', __( 'W', 'goblocks' ) ) }
				{ field( 'height', __( 'H', 'goblocks' ) ) }
			</div>

			{ showMinMax && (
				<div className="gb-dimensions-control__minmax">
					<span className="gb-dimensions-control__section-label">
						{ __( 'Min / Max', 'goblocks' ) }
					</span>
					{ field( 'minWidth', __( 'Min W', 'goblocks' ) ) }
					{ field( 'maxWidth', __( 'Max W', 'goblocks' ) ) }
					{ field( 'minHeight', __( 'Min H', 'goblocks' ) ) }
					{ field( 'maxHeight', __( 'Max H', 'goblocks' ) ) }
				</div>
			) }

			{ showAspectRatio &&
				field(
					'aspectRatio',
					__( 'Ratio', 'goblocks' ),
					'' as UnitOption
				) }
		</div>
	);
}
