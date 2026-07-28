import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { LayoutPanel } from '../../../components/panels/LayoutPanel';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface TextAttributes {
	tagName: string;
	styles: BlockStyles;
	globalClasses: string[];
	dropCap: boolean;
}

interface TextInspectorProps {
	attributes: TextAttributes;
	setAttributes: ( attrs: Partial< TextAttributes > ) => void;
}

// ── Tag name options ──────────────────────────────────────────────────────

const TAG_OPTIONS = [
	{ label: 'p', value: 'p' },
	{ label: 'span', value: 'span' },
	{ label: 'div', value: 'div' },
	{ label: 'figcaption', value: 'figcaption' },
	{ label: 'li', value: 'li' },
	{ label: 'dt', value: 'dt' },
	{ label: 'dd', value: 'dd' },
];

// ── Component ─────────────────────────────────────────────────────────────

export function TextInspector( {
	attributes,
	setAttributes,
}: TextInspectorProps ) {
	const { styles, tagName, dropCap, globalClasses } = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			<LayoutPanel styles={ styles } responsive={ responsive } />
			<TypographyPanel styles={ styles } responsive={ responsive } />
			<SizingPanel styles={ styles } responsive={ responsive } />
			<SpacingPanel styles={ styles } responsive={ responsive } />
			<BackgroundPanel styles={ styles } responsive={ responsive } />
			<BorderPanel styles={ styles } responsive={ responsive } />
			<EffectsPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			{ /* HTML tag */ }
			<PanelBody title={ __( 'HTML Element', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Tag name', 'goblocks' ) }
					value={ tagName }
					options={ TAG_OPTIONS }
					onChange={ ( value ) =>
						setAttributes( { tagName: value } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			{ /* Typography extras */ }
			<PanelBody
				title={ __( 'Typography Extras', 'goblocks' ) }
				initialOpen
			>
				<ToggleControl
					label={ __( 'Drop cap', 'goblocks' ) }
					help={ __(
						'Enlarges the first letter using ::first-letter CSS.',
						'goblocks'
					) }
					checked={ dropCap }
					onChange={ ( value ) =>
						setAttributes( { dropCap: value } )
					}
				/>
			</PanelBody>

			{ /* CSS classes */ }
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
							globalClasses: value
								.split( /\s+/ )
								.filter( Boolean ),
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
