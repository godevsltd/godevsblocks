/**
 * InspectorTabs — Tab layout for the GoBlocks block inspector.
 *
 * Three tabs:
 *   Styles  — all visual panels (Layout, Sizing, Spacing, Typography, Background, Border, Effects)
 *   Advanced — HTML attributes, CSS classes, custom CSS
 *   Dynamic  — block-specific dynamic content (optional; omitted if no children)
 *
 * Usage:
 *   <InspectorTabs
 *     stylesContent={ <><LayoutPanel .../><SpacingPanel .../></> }
 *     advancedContent={ <HtmlAttributesControl ... /> }
 *   />
 */

import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import { BreakpointTabs } from '../controls/BreakpointTabs';

// ── Types ─────────────────────────────────────────────────────────────────

interface InspectorTabsProps {
	stylesContent: ReactNode;
	advancedContent: ReactNode;
	dynamicContent?: ReactNode;
}

// ── Tab definitions ───────────────────────────────────────────────────────

const STYLES_TAB = {
	name: 'styles',
	title: __( 'Styles', 'goblocks' ),
	className: 'gb-inspector-tabs__tab',
};

const ADVANCED_TAB = {
	name: 'advanced',
	title: __( 'Advanced', 'goblocks' ),
	className: 'gb-inspector-tabs__tab',
};

const DYNAMIC_TAB = {
	name: 'dynamic',
	title: __( 'Dynamic', 'goblocks' ),
	className: 'gb-inspector-tabs__tab',
};

// ── Component ─────────────────────────────────────────────────────────────

export function InspectorTabs( {
	stylesContent,
	advancedContent,
	dynamicContent,
}: InspectorTabsProps ) {
	const tabs = [
		STYLES_TAB,
		ADVANCED_TAB,
		...( dynamicContent ? [ DYNAMIC_TAB ] : [] ),
	];

	return (
		<TabPanel className="gb-inspector-tabs" tabs={ tabs }>
			{ ( tab ) => {
				if ( 'styles' === tab.name ) {
					return (
						<div className="gb-inspector-tabs__panel">
							<BreakpointTabs />
							{ stylesContent }
						</div>
					);
				}
				if ( 'advanced' === tab.name ) {
					return (
						<div className="gb-inspector-tabs__panel">
							{ advancedContent }
						</div>
					);
				}
				if ( 'dynamic' === tab.name ) {
					return (
						<div className="gb-inspector-tabs__panel">
							{ dynamicContent }
						</div>
					);
				}
				return null;
			} }
		</TabPanel>
	);
}
