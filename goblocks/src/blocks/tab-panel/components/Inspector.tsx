/**
 * Tab Panel block — Inspector Controls.
 *
 * Styles tab: SpacingPanel + BackgroundPanel + BorderPanel.
 * Advanced tab: CSS Classes.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

export interface TabPanelAttributes {
	uniqueId: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	label: string;
}

interface TabPanelInspectorProps {
	attributes: TabPanelAttributes;
	setAttributes: ( attrs: Partial< TabPanelAttributes > ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function TabPanelInspector( {
	attributes,
	setAttributes,
}: TabPanelInspectorProps ) {
	const { styles, globalClasses } = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<PanelBody
			title={ __( 'CSS Classes', 'goblocks' ) }
			initialOpen={ false }
		>
			<TextControl
				label={ __( 'Additional CSS classes', 'goblocks' ) }
				value={ ( globalClasses ?? [] ).join( ' ' ) }
				help={ __(
					'Space-separated list of extra classes.',
					'goblocks'
				) }
				onChange={ ( value ) =>
					setAttributes( {
						globalClasses: value.split( /\s+/ ).filter( Boolean ),
					} )
				}
				// @ts-ignore
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	return (
		<InspectorControls>
			<InspectorTabs
				stylesContent={ stylesContent }
				advancedContent={ advancedContent }
			/>
		</InspectorControls>
	);
}
