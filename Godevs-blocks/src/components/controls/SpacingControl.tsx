/**
 * SpacingControl — Four-side dimension inputs (top/right/bottom/left).
 *
 * When linked (all sides locked together), renders a single input.
 * Auto-detects linked state if all four incoming values are equal.
 * Used for padding, margin.
 *
 * For gap (two-axis), use `twoAxis` prop which shows only top (row) + left (column).
 */

import { useState, useCallback, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { Icon, link, linkOff } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { UnitInput } from './UnitInput';
import type { UnitOption } from '../../types/controls';

// ── Icons ───────────────────────────────────────────────────────────────────

const LINK_ICON = <Icon icon={ link } size={ 16 } />;
const LINK_OFF_ICON = <Icon icon={ linkOff } size={ 16 } />;

// ── Types ─────────────────────────────────────────────────────────────────

export interface SpacingSides {
	top?: string | undefined;
	right?: string | undefined;
	bottom?: string | undefined;
	left?: string | undefined;
}

interface SpacingControlProps {
	label: string;
	values: Partial< SpacingSides >;
	onChange: ( side: keyof SpacingSides, value: string ) => void;
	/**
	 * Called instead of 4 separate onChange() calls when linked mode is active.
	 * Use this to write all 4 sides in a single setAttributes() to avoid the
	 * stale-closure clobber that occurs with multiple synchronous setStyle() calls.
	 */
	onChangeAll?: ( value: string ) => void;
	/** Inherited values from smaller breakpoints (shown as placeholders). */
	inherited?: Partial< SpacingSides >;
	disabled?: boolean;
	/** Default unit for the UnitInputs. Default: 'px'. */
	defaultUnit?: UnitOption;
	/** Show only row-gap and column-gap (for gap property). */
	twoAxis?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function allSidesEqual( v: Partial< SpacingSides > ): boolean {
	const { top, right, bottom, left } = v;
	// All four sides must be set and equal — a single set side must not trigger link.
	if ( ! top || ! right || ! bottom || ! left ) {
		return false;
	}
	return top === right && top === bottom && top === left;
}

// ── Component ─────────────────────────────────────────────────────────────

export function SpacingControl( {
	label,
	values,
	onChange,
	onChangeAll,
	inherited,
	disabled = false,
	defaultUnit = 'px',
	twoAxis = false,
}: SpacingControlProps ) {
	const [ linked, setLinked ] = useState( () => allSidesEqual( values ) );

	// Sync linked state when values change from outside (e.g. breakpoint switch).
	useEffect( () => {
		setLinked( allSidesEqual( values ) );
	}, [ values.top, values.right, values.bottom, values.left ] );

	const handleChange = useCallback(
		( side: keyof SpacingSides, value: string ) => {
			if ( linked ) {
				if ( onChangeAll ) {
					// Single setAttributes call — avoids stale-closure clobber.
					onChangeAll( value );
				} else {
					onChange( 'top', value );
					onChange( 'right', value );
					onChange( 'bottom', value );
					onChange( 'left', value );
				}
			} else {
				onChange( side, value );
			}
		},
		[ linked, onChange, onChangeAll ]
	);

	if ( twoAxis ) {
		return (
			<div className="gb-spacing-control gb-spacing-control--two-axis">
				<span className="gb-spacing-control__label">{ label }</span>
				<div className="gb-spacing-control__inputs">
					<UnitInput
						label={ __( 'Row gap', 'goblocks' ) }
						value={ values.top }
						inheritedValue={ inherited?.top }
						onChange={ ( v ) => onChange( 'top', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
					<UnitInput
						label={ __( 'Column gap', 'goblocks' ) }
						value={ values.left }
						inheritedValue={ inherited?.left }
						onChange={ ( v ) => onChange( 'left', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="gb-spacing-control">
			<div className="gb-spacing-control__header">
				<span className="gb-spacing-control__label">{ label }</span>
				<Button
					className="gb-spacing-control__link"
					isSmall
					variant={ linked ? 'primary' : 'tertiary' }
					onClick={ () => setLinked( ( l ) => ! l ) }
					aria-label={
						linked
							? __( 'Unlink sides', 'goblocks' )
							: __( 'Link all sides', 'goblocks' )
					}
					aria-pressed={ linked }
					disabled={ disabled }
				>
					{ linked ? LINK_ICON : LINK_OFF_ICON }
				</Button>
			</div>

			{ linked ? (
				<UnitInput
					label={ label }
					value={ values.top }
					inheritedValue={ inherited?.top }
					onChange={ ( v ) => handleChange( 'top', v ) }
					defaultUnit={ defaultUnit }
					disabled={ disabled }
					breakpoint="base"
				/>
			) : (
				<div className="gb-spacing-control__grid">
					<UnitInput
						label={ __( 'Top', 'goblocks' ) }
						value={ values.top }
						inheritedValue={ inherited?.top }
						onChange={ ( v ) => handleChange( 'top', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
					<UnitInput
						label={ __( 'Right', 'goblocks' ) }
						value={ values.right }
						inheritedValue={ inherited?.right }
						onChange={ ( v ) => handleChange( 'right', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
					<UnitInput
						label={ __( 'Bottom', 'goblocks' ) }
						value={ values.bottom }
						inheritedValue={ inherited?.bottom }
						onChange={ ( v ) => handleChange( 'bottom', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
					<UnitInput
						label={ __( 'Left', 'goblocks' ) }
						value={ values.left }
						inheritedValue={ inherited?.left }
						onChange={ ( v ) => handleChange( 'left', v ) }
						defaultUnit={ defaultUnit }
						disabled={ disabled }
						breakpoint="base"
					/>
				</div>
			) }
		</div>
	);
}
