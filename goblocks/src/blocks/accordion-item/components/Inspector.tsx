/**
 * Accordion Item block — Inspector Controls.
 *
 * Styles tab: Accordion Appearance + Item Settings + SpacingPanel + BackgroundPanel + BorderPanel.
 * Advanced tab: CSS Classes.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { ColorControl } from '../../../components/controls/ColorControl';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

export interface AccordionItemAttributes {
	uniqueId: string;
	styles: BlockStyles;
	globalClasses: string[];
	htmlAttributes: Record< string, string >;
	dynamicContent: Record< string, string >;
	generatedCss: string;
	blockVersion: number;
	question: string;
	isOpen: boolean;
	headerColor: string;
	headerBg: string;
	contentColor: string;
	iconStyle: string;
}

interface AccordionItemInspectorProps {
	attributes: AccordionItemAttributes;
	setAttributes: ( attrs: Partial< AccordionItemAttributes > ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function AccordionItemInspector( {
	attributes,
	setAttributes,
}: AccordionItemInspectorProps ) {
	const { styles, globalClasses, isOpen, headerColor, headerBg, contentColor, iconStyle } = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const hdrColor  = headerColor  || '#111827';
	const hdrBg     = headerBg     || '#ffffff';
	const cntColor  = contentColor || '#374151';

	const stylesContent = (
		<>
			{ /* ── Accordion Appearance ──────────────────────────────────── */ }
			<PanelBody title={ __( 'Accordion Appearance', 'goblocks' ) } initialOpen>

				{ /* Live preview */ }
				<div
					style={ {
						borderRadius: '8px',
						overflow: 'hidden',
						border: '1px solid #e5e7eb',
						marginBottom: '16px',
					} }
				>
					{ /* Header preview */ }
					<div
						style={ {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: '12px 16px',
							background: hdrBg,
							borderBottom: '1px solid #f3f4f6',
							transition: 'background 200ms, color 200ms',
						} }
					>
						<span
							style={ {
								fontSize: '0.875rem',
								fontWeight: 600,
								color: hdrColor,
								transition: 'color 200ms',
							} }
						>
							{ __( 'Question / Header Text', 'goblocks' ) }
						</span>
						<span
							style={ {
								width: '18px',
								height: '18px',
								borderRadius: '50%',
								background: '#f3f4f6',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '10px',
								color: '#6b7280',
								flexShrink: 0,
							} }
						>
							▼
						</span>
					</div>
					{ /* Content preview */ }
					<div
						style={ {
							padding: '12px 16px',
							background: hdrBg,
							color: cntColor,
							fontSize: '0.8125rem',
							lineHeight: 1.6,
							transition: 'color 200ms',
						} }
					>
						{ __( 'Answer / content text preview…', 'goblocks' ) }
					</div>
				</div>

				<ColorControl
					label={ __( 'Header text color', 'goblocks' ) }
					value={ hdrColor }
					onChange={ ( v ) => setAttributes( { headerColor: v || '#111827' } ) }
					breakpoint="base"
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Header background', 'goblocks' ) }
					value={ hdrBg }
					onChange={ ( v ) => setAttributes( { headerBg: v || '#ffffff' } ) }
					breakpoint="base"
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Content text color', 'goblocks' ) }
					value={ cntColor }
					onChange={ ( v ) => setAttributes( { contentColor: v || '#374151' } ) }
					breakpoint="base"
				/>
			</PanelBody>

			{ /* ── Item Settings ──────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Item Settings', 'goblocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Icon style', 'goblocks' ) }
					value={ iconStyle ?? 'chevron' }
					options={ [
						{ label: __( 'Chevron (▼)', 'goblocks' ),  value: 'chevron' },
						{ label: __( 'Plus / Minus (+/−)', 'goblocks' ), value: 'plus' },
						{ label: __( 'Arrow (→)', 'goblocks' ),    value: 'arrow' },
						{ label: __( 'None', 'goblocks' ),         value: 'none' },
					] }
					onChange={ ( v ) => setAttributes( { iconStyle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Open by default', 'goblocks' ) }
					help={ __(
						'Panel starts expanded on page load.',
						'goblocks'
					) }
					checked={ isOpen }
					onChange={ ( v ) => setAttributes( { isOpen: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

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
