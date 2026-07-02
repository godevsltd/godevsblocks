import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccordionBlockAttributes {
	uniqueId: string;
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	enableFaqSchema: boolean;
	allowMultiple: boolean;
}

interface AccordionInspectorProps {
	attributes: AccordionBlockAttributes;
	setAttributes: ( attrs: Partial< AccordionBlockAttributes > ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AccordionInspector( {
	attributes,
	setAttributes,
}: AccordionInspectorProps ) {
	const { enableFaqSchema, allowMultiple, globalClasses, styles } =
		attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			<PanelBody
				title={ __( 'Accordion Settings', 'goblocks' ) }
				initialOpen
			>
				<ToggleControl
					label={ __( 'Allow Multiple Open', 'goblocks' ) }
					help={
						allowMultiple
							? __(
									'Multiple panels can be open simultaneously.',
									'goblocks'
							  )
							: __(
									'Only one panel is open at a time.',
									'goblocks'
							  )
					}
					checked={ allowMultiple }
					onChange={ ( v ) =>
						setAttributes( { allowMultiple: v } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<ToggleControl
					label={ __( 'Enable FAQ Schema', 'goblocks' ) }
					help={ __(
						'Outputs schema.org/FAQPage markup for SEO rich results.',
						'goblocks'
					) }
					checked={ enableFaqSchema }
					onChange={ ( v ) =>
						setAttributes( { enableFaqSchema: v } )
					}
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
