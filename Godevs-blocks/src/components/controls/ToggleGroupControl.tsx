/**
 * ToggleGroupControl — Segmented button group for enum CSS values.
 *
 * Used for: display, text-align, font-weight, flex-direction, etc.
 * Supports text labels, icon buttons, or both.
 */

import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ToggleOption } from '../../types/controls';

// ── Types ─────────────────────────────────────────────────────────────────

interface ToggleGroupControlProps< T extends string = string > {
	label: string;
	value: T | undefined;
	options: ToggleOption< T >[];
	onChange: ( value: T ) => void;
	help?: string;
	disabled?: boolean;
	/** Allow deselecting the active option (emits empty string). Default: false. */
	deselectable?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function ToggleGroupControl< T extends string = string >( {
	label,
	value,
	options,
	onChange,
	help,
	disabled = false,
	deselectable = false,
}: ToggleGroupControlProps< T > ) {
	function handleClick( optionValue: T ) {
		if ( deselectable && value === optionValue ) {
			onChange( '' as T );
		} else {
			onChange( optionValue );
		}
	}

	return (
		<fieldset className="gb-toggle-group" disabled={ disabled }>
			<legend className="gb-toggle-group__legend">{ label }</legend>

			<div
				className="gb-toggle-group__options"
				role="group"
				aria-label={ label }
			>
				{ options.map( ( opt ) => {
					const isActive = opt.value === value;
					return (
						<Button
							key={ String( opt.value ) }
							className={ `gb-toggle-group__btn${
								isActive ? ' is-active' : ''
							}` }
							variant="tertiary"
							onClick={ () => handleClick( opt.value ) }
							aria-pressed={ isActive }
							aria-label={ opt.ariaLabel ?? opt.label }
							disabled={ disabled }
						>
							{ opt.icon ?? opt.label }
						</Button>
					);
				} ) }
			</div>

			{ help && <p className="gb-toggle-group__help">{ help }</p> }
		</fieldset>
	);
}
