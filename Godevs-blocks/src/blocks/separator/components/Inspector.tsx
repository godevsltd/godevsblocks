import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

export interface SeparatorBlockAttributes {
	uniqueId: string;
	lineStyle: string;
	label: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

interface SeparatorInspectorProps {
	attributes: SeparatorBlockAttributes;
	setAttributes: ( attrs: Partial< SeparatorBlockAttributes > ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function SeparatorInspector( {
	attributes,
	setAttributes,
}: SeparatorInspectorProps ) {
	const { styles, globalClasses, lineStyle, label } = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			<PanelBody title={ __( 'Line Style', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Line style', 'goblocks' ) }
					value={ lineStyle ?? 'solid' }
					options={ [
						{ label: __( 'Solid', 'goblocks' ), value: 'solid' },
						{ label: __( 'Dashed', 'goblocks' ), value: 'dashed' },
						{ label: __( 'Dotted', 'goblocks' ), value: 'dotted' },
						{ label: __( 'Double', 'goblocks' ), value: 'double' },
					] }
					onChange={ ( v ) => setAttributes( { lineStyle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
			<SizingPanel styles={ styles } responsive={ responsive } />
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			<PanelBody title={ __( 'Label', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Center label', 'goblocks' ) }
					value={ label ?? '' }
					placeholder={ __( 'e.g. OR', 'goblocks' ) }
					help={ __(
						'Optional text centered on the line. Leave blank for a plain rule.',
						'goblocks'
					) }
					onChange={ ( v ) => setAttributes( { label: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
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
					onChange={ ( v ) =>
						setAttributes( {
							globalClasses: v.split( /\s+/ ).filter( Boolean ),
						} )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
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
