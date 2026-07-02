import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
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

interface TimelineItemBlockAttributes {
	uniqueId:     string;
	date:         string;
	title:        string;
	content:      string;
	icon:         string;
	dotColor:     string;
	titleColor:   string;
	dateColor:    string;
	dateBg:       string;
	contentColor: string;
	styles:       BlockStyles;
	globalClasses: string[];
	generatedCss:  string;
	blockVersion:  number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< TimelineItemBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, generatedCss,
		date, title, content, icon,
		dotColor, titleColor, dateColor, dateBg, contentColor,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'timeline-item',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< TimelineItemBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const dot     = dotColor     || '#4f46e5';
	const ttl     = titleColor   || '#0f172a';
	const date_c  = dateColor    || '#4f46e5';
	const date_bg = dateBg       || '#ede9fe';
	const cnt     = contentColor || '#475569';

	const itemVars = {
		'--gb-ti-dot':      dot,
		'--gb-ti-title':    ttl,
		'--gb-ti-date':     date_c,
		'--gb-ti-date-bg':  date_bg,
		'--gb-ti-content':  cnt,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-timeline-item',
		icon && 'gb-timeline-item--has-icon',
		uniqueId && `gb-timeline-item-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass, style: itemVars } );

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody title={ __( 'Item Appearance', 'goblocks' ) } initialOpen>

				{ /* Live preview */ }
				<div
					style={ {
						display: 'flex',
						gap: '12px',
						padding: '14px 12px',
						background: '#f8fafc',
						borderRadius: '10px',
						marginBottom: '16px',
						border: '1px solid #f1f5f9',
						alignItems: 'flex-start',
					} }
				>
					{ /* Dot / Icon */ }
					<div
						style={ {
							width: '1.5rem',
							height: '1.5rem',
							borderRadius: '50%',
							background: dot,
							border: '2.5px solid #fff',
							boxShadow: `0 0 0 2px ${ dot }`,
							flexShrink: 0,
							marginTop: '3px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '0.75rem',
							transition: 'background 150ms, box-shadow 150ms',
						} }
					>
						{ icon && <span style={ { lineHeight: 1 } }>{ icon }</span> }
					</div>
					{ /* Content */ }
					<div style={ { flex: 1, minWidth: 0 } }>
						<span
							style={ {
								display: 'inline-block',
								fontSize: '0.6875rem',
								fontWeight: 700,
								color: date_c,
								background: date_bg,
								borderRadius: '100px',
								padding: '2px 8px',
								marginBottom: '5px',
								letterSpacing: '0.03em',
								transition: 'color 150ms, background 150ms',
							} }
						>
							{ date || '2024' }
						</span>
						<div style={ { fontSize: '0.8125rem', fontWeight: 700, color: ttl, marginBottom: '3px', transition: 'color 150ms' } }>
							{ title || 'Event Title' }
						</div>
						<div style={ { fontSize: '0.75rem', color: cnt, lineHeight: 1.5, transition: 'color 150ms' } }>
							{ __( 'Description text...', 'goblocks' ) }
						</div>
					</div>
				</div>

				<ColorControl
					label={ __( 'Dot Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ dot }
					onChange={ ( v ) => setAttributes( { dotColor: v || '#4f46e5' } ) }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Date Label Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ date_c }
					onChange={ ( v ) => setAttributes( { dateColor: v || '#4f46e5' } ) }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Date Label Background', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ date_bg }
					onChange={ ( v ) => setAttributes( { dateBg: v || '#ede9fe' } ) }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Title Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ ttl }
					onChange={ ( v ) => setAttributes( { titleColor: v || '#0f172a' } ) }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Content Text Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ cnt }
					onChange={ ( v ) => setAttributes( { contentColor: v || '#475569' } ) }
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
			<PanelBody title={ __( 'Item Settings', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Dot Icon / Emoji', 'goblocks' ) }
					help={ __( 'Paste an emoji or symbol to show inside the dot (e.g. ★ ✓ 🚀).', 'goblocks' ) }
					value={ icon }
					onChange={ ( v ) => setAttributes( { icon: v } ) }
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

			<div { ...blockProps }>
				<div className="gb-timeline-item__dot">
					{ icon && <span className="gb-timeline-item__dot-icon" aria-hidden="true">{ icon }</span> }
				</div>

				<div className="gb-timeline-item__content">
					<RichText
						tagName="span"
						className="gb-timeline-item__date"
						value={ date }
						onChange={ ( v ) => setAttributes( { date: v } ) }
						placeholder={ __( 'Date / Label', 'goblocks' ) }
						allowedFormats={ [] }
					/>
					<RichText
						tagName="h3"
						className="gb-timeline-item__title"
						value={ title }
						onChange={ ( v ) => setAttributes( { title: v } ) }
						placeholder={ __( 'Event title…', 'goblocks' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
					<RichText
						tagName="p"
						className="gb-timeline-item__body"
						value={ content }
						onChange={ ( v ) => setAttributes( { content: v } ) }
						placeholder={ __( 'Describe the event…', 'goblocks' ) }
					/>
				</div>
			</div>
		</>
	);
}