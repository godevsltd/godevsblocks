import { TabPanel, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesStore } from '@store/globalStylesStore';
import { ColorPaletteEditor } from './components/ColorPaletteEditor';
import { TypographyPresetEditor } from './components/TypographyPresetEditor';
import { GeneralSettings } from './components/GeneralSettings';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabName = 'colors' | 'typography' | 'settings';

interface TabDef {
	name: TabName;
	title: string;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: TabDef[] = [
	{ name: 'colors', title: __( 'Colors', 'goblocks' ) },
	{ name: 'typography', title: __( 'Typography', 'goblocks' ) },
	{ name: 'settings', title: __( 'Settings', 'goblocks' ) },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobalStylesApp() {
	const isDirty = useGlobalStylesStore( ( s ) => s.isDirty );
	const saveStatus = useGlobalStylesStore( ( s ) => s.saveStatus );
	const saveToServer = useGlobalStylesStore( ( s ) => s.saveToServer );

	return (
		<div className="gb-global-styles">
			{ /* ── Page header ── */ }
			<div className="gb-global-styles__header">
				<h1 className="gb-global-styles__title">
					{ __( 'GoBlocks — Global Styles', 'goblocks' ) }
				</h1>

				<div className="gb-global-styles__actions">
					{ saveStatus === 'saved' && (
						<span className="gb-global-styles__notice gb-global-styles__notice--saved">
							{ __( 'Saved!', 'goblocks' ) }
						</span>
					) }
					{ saveStatus === 'error' && (
						<span className="gb-global-styles__notice gb-global-styles__notice--error">
							{ __(
								'Save failed. Please try again.',
								'goblocks'
							) }
						</span>
					) }
					<Button
						variant="primary"
						onClick={ saveToServer }
						isBusy={ saveStatus === 'saving' }
						disabled={
							( ! isDirty && saveStatus !== 'error' ) ||
							saveStatus === 'saving'
						}
					>
						{ __( 'Save Changes', 'goblocks' ) }
					</Button>
				</div>
			</div>

			{ /* ── Tabbed content ── */ }
			<TabPanel className="gb-global-styles__tabs" tabs={ TABS }>
				{ ( tab ) => (
					<div className="gb-global-styles__panel">
						{ tab.name === 'colors' && <ColorPaletteEditor /> }
						{ tab.name === 'typography' && (
							<TypographyPresetEditor />
						) }
						{ tab.name === 'settings' && <GeneralSettings /> }
					</div>
				) }
			</TabPanel>
		</div>
	);
}
