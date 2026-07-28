/**
 * BreakpointTabs — Device breakpoint selector bar.
 *
 * Renders a row of clickable tabs for each breakpoint key.
 * Clicking a tab sets `breakpointStore.active` in Zustand.
 * Does NOT accept onChange — it manages the store directly.
 *
 * Usage:
 *   <BreakpointTabs />
 *   // Wrap any responsive controls inside.
 */

import { __ } from '@wordpress/i18n';
import { useBreakpointStore } from '../../store/breakpointStore';
import { useOrderedBreakpoints } from '../../hooks/useBreakpoint';
import type { Breakpoint } from '../../types/styles';
import { clsx } from '../../utils/classNames';

// ── Label + description map ───────────────────────────────────────────────

const BREAKPOINT_LABELS: Record< string, string > = {
	base: __( 'Base', 'goblocks' ),
	xs: 'XS',
	sm: 'SM',
	md: 'MD',
	lg: 'LG',
	xl: 'XL',
	'2xl': '2XL',
};

const BREAKPOINT_DESCRIPTIONS: Record< string, string > = {
	base: __( 'All screens (mobile-first)', 'goblocks' ),
	xs: __( '480px and up', 'goblocks' ),
	sm: __( '640px and up', 'goblocks' ),
	md: __( '768px and up', 'goblocks' ),
	lg: __( '1024px and up', 'goblocks' ),
	xl: __( '1280px and up', 'goblocks' ),
	'2xl': __( '1536px and up', 'goblocks' ),
};

// ── Component ─────────────────────────────────────────────────────────────

interface BreakpointTabsProps {
	/**
	 * If provided, only show these breakpoints.
	 * Useful for controls that only support a subset of breakpoints.
	 */
	only?: Breakpoint[];
}

export function BreakpointTabs( { only }: BreakpointTabsProps ) {
	const active = useBreakpointStore( ( s ) => s.active );
	const setActive = useBreakpointStore( ( s ) => s.setActive );
	const ordered = useOrderedBreakpoints();

	const allKeys: Breakpoint[] = [ 'base', ...ordered.map( ( b ) => b.key ) ];
	const visible = only
		? allKeys.filter( ( k ) => only.includes( k ) )
		: allKeys;

	return (
		<div
			className="gb-breakpoint-tabs"
			role="tablist"
			aria-label={ __( 'Responsive breakpoints', 'goblocks' ) }
		>
			{ visible.map( ( key ) => {
				const isActive = key === active;

				return (
					<button
						key={ key }
						role="tab"
						aria-selected={ isActive }
						aria-label={ BREAKPOINT_DESCRIPTIONS[ key ] }
						title={ BREAKPOINT_DESCRIPTIONS[ key ] }
						className={ clsx(
							'gb-breakpoint-tabs__tab',
							isActive && 'gb-breakpoint-tabs__tab--active'
						) }
						onClick={ () => setActive( key ) }
					>
						{ BREAKPOINT_LABELS[ key ] ?? key }
					</button>
				);
			} ) }
		</div>
	);
}
