/**
 * DeviceIndicator — Small badge showing which breakpoint a value is inherited from.
 *
 * Displayed next to a control's placeholder text when the active breakpoint
 * has no explicit value set and the shown value is inherited from a smaller bp.
 */

import { __ } from '@wordpress/i18n';
import type { Breakpoint } from '../../types/styles';

interface DeviceIndicatorProps {
	/** The breakpoint key where the inherited value comes from. */
	from: Breakpoint;
}

const LABEL: Record< string, string > = {
	base: __( 'BASE', 'goblocks' ),
	xs: 'XS',
	sm: 'SM',
	md: 'MD',
	lg: 'LG',
	xl: 'XL',
	'2xl': '2XL',
};

export function DeviceIndicator( { from }: DeviceIndicatorProps ) {
	return (
		<span
			className="gb-device-indicator"
			title={ __( 'Inherited from', 'goblocks' ) + ` ${ from }` }
			aria-label={ __( 'Inherited from', 'goblocks' ) + ` ${ from }` }
		>
			{ LABEL[ from ] ?? from }
		</span>
	);
}
