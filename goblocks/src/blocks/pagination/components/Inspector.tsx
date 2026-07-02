/**
 * Pagination block — Inspector Controls.
 *
 * Styles tab: Pagination settings (showPrevNext, showFirstLast, labels) +
 *             SpacingPanel + BorderPanel.
 * Advanced tab: CSS Classes.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { BorderPanel } from '../../../components/panels/BorderPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PaginationAttributes {
	uniqueId: string;
	styles: BlockStyles;
	showPrevNext: boolean;
	showFirstLast: boolean;
	prevLabel: string;
	nextLabel: string;
	loadMoreLabel: string;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

interface PaginationInspectorProps {
	attributes: PaginationAttributes;
	setAttributes: ( attrs: Partial< PaginationAttributes > ) => void;
	paginationType: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaginationInspector( {
	attributes,
	setAttributes,
	paginationType,
}: PaginationInspectorProps ) {
	const {
		styles,
		showPrevNext,
		showFirstLast,
		prevLabel,
		nextLabel,
		loadMoreLabel,
		globalClasses,
	} = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const stylesContent = (
		<>
			{ paginationType === 'standard' && (
				<PanelBody
					title={ __( 'Standard Pagination', 'goblocks' ) }
					initialOpen
				>
					<ToggleControl
						label={ __( 'Show previous / next links', 'goblocks' ) }
						checked={ showPrevNext }
						onChange={ ( val ) =>
							setAttributes( { showPrevNext: val } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __(
							'Show first / last page links',
							'goblocks'
						) }
						checked={ showFirstLast }
						onChange={ ( val ) =>
							setAttributes( { showFirstLast: val } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					{ showPrevNext && (
						<>
							<TextControl
								label={ __( 'Previous label', 'goblocks' ) }
								value={ prevLabel }
								placeholder={ __( '← Previous', 'goblocks' ) }
								onChange={ ( val ) =>
									setAttributes( { prevLabel: val } )
								}
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Next label', 'goblocks' ) }
								value={ nextLabel }
								placeholder={ __( 'Next →', 'goblocks' ) }
								onChange={ ( val ) =>
									setAttributes( { nextLabel: val } )
								}
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
						</>
					) }
				</PanelBody>
			) }

			{ paginationType === 'load-more' && (
				<PanelBody title={ __( 'Load More', 'goblocks' ) } initialOpen>
					<TextControl
						label={ __( 'Button label', 'goblocks' ) }
						value={ loadMoreLabel }
						placeholder={ __( 'Load More', 'goblocks' ) }
						onChange={ ( val ) =>
							setAttributes( { loadMoreLabel: val } )
						}
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			) }

			{ paginationType === 'infinite' && (
				<PanelBody
					title={ __( 'Infinite Scroll', 'goblocks' ) }
					initialOpen
				>
					<p className="description">
						{ __(
							'Next page loads automatically when the user scrolls to the bottom of the list.',
							'goblocks'
						) }
					</p>
				</PanelBody>
			) }

			<SpacingPanel styles={ styles } responsive={ responsive } />
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
				onChange={ ( val ) =>
					setAttributes( {
						globalClasses: val.split( /\s+/ ).filter( Boolean ),
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
