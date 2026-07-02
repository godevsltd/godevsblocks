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
	RangeControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { SizingPanel } from '../../components/panels/SizingPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface ModalBlockAttributes {
	uniqueId:       string;
	triggerText:    string;
	triggerType:    string;
	closeOnOverlay: boolean;
	closeOnEscape:  boolean;
	animation:      string;
	autoOpen:       boolean;
	autoOpenDelay:  number;
	cookieName:     string;
	cookieDays:     number;
	showDismissBtn: boolean;
	styles:         BlockStyles;
	globalClasses:  string[];
	generatedCss:   string;
	blockVersion:   number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< ModalBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, generatedCss,
		triggerText, triggerType, closeOnOverlay, closeOnEscape,
		animation, autoOpen, autoOpenDelay, cookieName, cookieDays, showDismissBtn,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'modal',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< ModalBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-modal',
		uniqueId && `gb-modal-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gb-modal__content' },
		{ renderAppender: InnerBlocks.ButtonBlockAppender }
	);

	/* ── Inspector: Style tab ──────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<SizingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel   styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel   styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	/* ── Inspector: Advanced tab ───────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'Trigger', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Trigger Text', 'goblocks' ) }
					value={ triggerText }
					onChange={ ( v ) => setAttributes( { triggerText: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Trigger Type', 'goblocks' ) }
					value={ triggerType }
					options={ [
						{ label: __( 'Button', 'goblocks' ), value: 'button' },
						{ label: __( 'Link',   'goblocks' ), value: 'link' },
					] }
					onChange={ ( v ) => setAttributes( { triggerType: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Animation', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Open / close animation', 'goblocks' ) }
					value={ animation || 'fade' }
					options={ [
						{ label: __( 'Fade',     'goblocks' ), value: 'fade' },
						{ label: __( 'Slide up', 'goblocks' ), value: 'slide-up' },
						{ label: __( 'Zoom',     'goblocks' ), value: 'zoom' },
					] }
					onChange={ ( v ) => setAttributes( { animation: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Behavior', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Close on Overlay Click', 'goblocks' ) }
					checked={ closeOnOverlay }
					onChange={ ( v ) => setAttributes( { closeOnOverlay: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Close on Escape Key', 'goblocks' ) }
					checked={ closeOnEscape }
					onChange={ ( v ) => setAttributes( { closeOnEscape: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Auto-open', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Open automatically on page load', 'goblocks' ) }
					help={ __( 'Use with a cookie to avoid showing repeatedly.', 'goblocks' ) }
					checked={ autoOpen }
					onChange={ ( v ) => setAttributes( { autoOpen: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ autoOpen && (
					<>
						<div style={ { height: '8px' } } />
						<RangeControl
							label={ __( 'Delay (ms)', 'goblocks' ) }
							value={ autoOpenDelay ?? 2000 }
							onChange={ ( v ) => setAttributes( { autoOpenDelay: v ?? 2000 } ) }
							min={ 0 }
							max={ 10000 }
							step={ 500 }
							help={ __( 'How long to wait after page load before opening.', 'goblocks' ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			<PanelBody title={ __( '"Don\'t show again" Cookie', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Cookie key', 'goblocks' ) }
					value={ cookieName }
					placeholder={ __( 'e.g. promo-may-2025', 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { cookieName: v.replace( /[^a-z0-9_-]/gi, '' ) } ) }
					help={ __( 'Unique identifier. When set, the "Don\'t show again" button stores a cookie to suppress auto-open.', 'goblocks' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ cookieName && (
					<>
						<div style={ { height: '8px' } } />
						<NumberControl
							label={ __( 'Cookie duration (days)', 'goblocks' ) }
							value={ cookieDays ?? 30 }
							min={ 1 }
							onChange={ ( v ) => setAttributes( { cookieDays: parseInt( String( v ?? 30 ), 10 ) || 30 } ) }
							// @ts-ignore
							__next40pxDefaultSize
						/>
						<div style={ { height: '8px' } } />
						<ToggleControl
							label={ __( 'Show "Don\'t show again" button', 'goblocks' ) }
							help={ __( 'Renders a dismiss button inside the modal footer.', 'goblocks' ) }
							checked={ showDismissBtn }
							onChange={ ( v ) => setAttributes( { showDismissBtn: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
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
				{ triggerType === 'button' ? (
					<button className="gb-modal__trigger">{ triggerText }</button>
				) : (
					<a className="gb-modal__trigger" href="#modal">{ triggerText }</a>
				) }
				{ /* Always-visible dialog preview in the editor */ }
				<div className="gb-modal__overlay" aria-hidden="true" style={ { display: 'block', position: 'relative' } }>
					<div className="gb-modal__dialog" role="dialog" aria-modal="true">
						<button className="gb-modal__close" aria-label={ __( 'Close', 'goblocks' ) }>&times;</button>
						<div { ...innerBlocksProps } />
						{ showDismissBtn && (
							<div className="gb-modal__footer">
								<button type="button" className="gb-modal__dismiss">
									{ __( 'Don\'t show again', 'goblocks' ) }
								</button>
							</div>
						) }
					</div>
				</div>
			</div>
		</>
	);
}