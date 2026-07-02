import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { ColorControl } from '../../components/controls/ColorControl';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface TimelineBlockAttributes {
	uniqueId:           string;
	layout:             string;
	alternating:        boolean;
	lineColor:          string;
	entranceAnimation:  string;
	styles:             BlockStyles;
	globalClasses:      string[];
	generatedCss:       string;
	blockVersion:       number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/timeline-item', { date: '2023', title: 'First Event',  content: 'Describe what happened during this milestone.' } ],
	[ 'goblocks/timeline-item', { date: '2024', title: 'Second Event', content: 'Another important milestone in the journey.' } ],
];

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< TimelineBlockAttributes > ) {
	const { uniqueId, styles, globalClasses, generatedCss, layout, alternating, lineColor, entranceAnimation } = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'timeline',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< TimelineBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const line = lineColor || '#4f46e5';

	const timelineVars = {
		'--gb-tl-line-color': line,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-timeline',
		`gb-timeline--${ layout }`,
		alternating && layout === 'vertical' && 'gb-timeline--alternating',
		uniqueId && `gb-timeline-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className:         wrapperClass,
		style:             timelineVars,
		'data-animation':  entranceAnimation ?? 'fade-up',
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'goblocks/timeline-item' ],
		template: DEFAULT_TEMPLATE,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody title={ __( 'Timeline Style', 'goblocks' ) } initialOpen>

				{ /* Live connector preview */ }
				<div
					style={ {
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						padding: '14px 12px',
						background: '#f8fafc',
						borderRadius: '10px',
						marginBottom: '16px',
						border: '1px solid #f1f5f9',
					} }
				>
					<div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }>
						{ [ 0, 1, 2 ].map( ( i ) => (
							<div
								key={ i }
								style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }
							>
								<div style={ { width: '10px', height: '10px', borderRadius: '50%', background: line, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${ line }`, transition: 'background 150ms, box-shadow 150ms' } } />
								{ i < 2 && <div style={ { width: '2px', height: '16px', background: line, opacity: 0.3, transition: 'background 150ms' } } /> }
							</div>
						) ) }
					</div>
					<div style={ { fontSize: '0.75rem', color: '#64748b' } }>
						{ __( 'Connector line & dot color', 'goblocks' ) }
					</div>
				</div>

				<ColorControl
					label={ __( 'Connector Line Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ line }
					onChange={ ( v ) => setAttributes( { lineColor: v || '#4f46e5' } ) }
				/>
			</PanelBody>

			<SpacingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel     styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel    styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	/* ── Inspector: Advanced tab ──────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'Timeline Settings', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Layout', 'goblocks' ) }
					value={ layout }
					options={ [
						{ label: __( 'Vertical',   'goblocks' ), value: 'vertical' },
						{ label: __( 'Horizontal', 'goblocks' ), value: 'horizontal' },
					] }
					onChange={ ( v ) => setAttributes( { layout: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ layout === 'vertical' && (
					<ToggleControl
						label={ __( 'Alternating layout', 'goblocks' ) }
						help={ alternating
							? __( 'Odd items left, even items right of the center line.', 'goblocks' )
							: __( 'All items on the right side of the connector line.', 'goblocks' ) }
						checked={ alternating }
						onChange={ ( v ) => setAttributes( { alternating: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
				<SelectControl
					label={ __( 'Entrance animation', 'goblocks' ) }
					value={ entranceAnimation ?? 'fade-up' }
					options={ [
						{ label: __( 'Fade up (default)', 'goblocks' ), value: 'fade-up' },
						{ label: __( 'Slide from sides',  'goblocks' ), value: 'slide'   },
						{ label: __( 'None',              'goblocks' ), value: 'none'    },
					] }
					onChange={ ( v ) => setAttributes( { entranceAnimation: v } ) }
					help={ __( 'Items animate in when scrolled into view. Slide from sides works best with alternating layout.', 'goblocks' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'CSS Classes', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					onChange={ ( v ) =>
						setAttributes( { globalClasses: v.split( /\s+/ ).filter( Boolean ) } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs stylesContent={ stylesContent } advancedContent={ advancedContent } />
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}