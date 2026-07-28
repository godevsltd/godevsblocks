import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { LayoutPanel } from '../../../components/panels/LayoutPanel';
import { SizingPanel } from '../../../components/panels/SizingPanel';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockAttributes } from '../../../types/block';
import type { BlockStyles } from '../../../types/styles';

interface ContainerAttributes extends BlockAttributes {
	ariaLabel: string;
}

interface ContainerInspectorProps {
	attributes: ContainerAttributes;
	setAttributes: ( attrs: Partial< ContainerAttributes > ) => void;
}

const TAG_OPTIONS = [
	{ label: 'div', value: 'div' },
	{ label: 'section', value: 'section' },
	{ label: 'article', value: 'article' },
	{ label: 'aside', value: 'aside' },
	{ label: 'header', value: 'header' },
	{ label: 'footer', value: 'footer' },
	{ label: 'nav', value: 'nav' },
	{ label: 'main', value: 'main' },
	{ label: 'span', value: 'span' },
];

const WIDTH_PRESETS = [
	{ label: 'XS', hint: '640px — Narrow reading', value: '640px' },
	{ label: 'S', hint: '780px — Comfortable read', value: '780px' },
	{ label: 'M', hint: '1024px — Mid layout', value: '1024px' },
	{ label: 'L', hint: '1200px — Standard full', value: '1200px' },
	{ label: 'XL', hint: '1440px — Wide layout', value: '1440px' },
	{ label: 'Full', hint: '100% — No constraint', value: '100%' },
];

export function ContainerInspector( {
	attributes,
	setAttributes,
}: ContainerInspectorProps ) {
	const { styles, tagName, ariaLabel, globalClasses } = attributes;

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const currentMaxWidth =
		responsive.getInheritedValue( 'sizing', 'maxWidth' ) ?? '1200px';

	const stylesContent = (
		<>
			{ /* ── Container Width Presets ─────────────────────────────── */ }
			<PanelBody
				title={ __( 'Container Width', 'goblocks' ) }
				initialOpen={ true }
			>
				<p
					className="components-base-control__help"
					style={ { marginTop: 0 } }
				>
					{ __( 'Quick-select a max-width preset.', 'goblocks' ) }
				</p>

				<ButtonGroup
					style={ { display: 'flex', flexWrap: 'wrap', gap: '4px' } }
				>
					{ WIDTH_PRESETS.map( ( preset ) => (
						<Button
							key={ preset.value }
							label={ preset.hint }
							showTooltip
							size="small"
							variant={
								currentMaxWidth === preset.value
									? 'primary'
									: 'secondary'
							}
							onClick={ () =>
								responsive.setStyle(
									'sizing',
									'maxWidth',
									preset.value
								)
							}
						>
							{ preset.label }
						</Button>
					) ) }
				</ButtonGroup>

				<p
					className="components-base-control__help"
					style={ { marginTop: '10px', marginBottom: 0 } }
				>
					{ __( 'Current: ', 'goblocks' ) }
					<strong>{ currentMaxWidth }</strong>
				</p>
			</PanelBody>

			{ /* ── Standard style panels ────────────────────────────────── */ }
			<LayoutPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SizingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SpacingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<TypographyPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BackgroundPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BorderPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<EffectsPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
		</>
	);

	const advancedContent = (
		<>
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
				<TextControl
					label={ __( 'ARIA label', 'goblocks' ) }
					value={ ariaLabel }
					help={ __(
						"Overrides the element's accessible name.",
						'goblocks'
					) }
					onChange={ ( value ) =>
						setAttributes( { ariaLabel: value } )
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
