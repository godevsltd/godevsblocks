import { useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SizingPanel } from '../../components/panels/SizingPanel';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface FlipCardBlockAttributes {
	uniqueId:       string;
	frontTitle:     string;
	frontContent:   string;
	frontIcon:      string;
	backTitle:      string;
	backContent:    string;
	backIcon:       string;
	backLinkText:   string;
	backLinkUrl:    string;
	flipDirection:  string;
	triggerOnClick: boolean;
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
}: BlockEditProps< FlipCardBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, generatedCss,
		frontTitle, frontContent, frontIcon,
		backTitle, backContent, backIcon, backLinkText, backLinkUrl,
		flipDirection, triggerOnClick,
	} = attributes;

	const [ showBack, setShowBack ] = useState( false );

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'flip-card',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< FlipCardBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-flip-card',
		uniqueId && `gb-flip-card-${ uniqueId }`,
		showBack && 'is-flipped',
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

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
			<PanelBody title={ __( 'Flip Settings', 'goblocks' ) } initialOpen>
				<SelectControl
					label={ __( 'Flip Direction', 'goblocks' ) }
					value={ flipDirection }
					options={ [
						{ label: __( 'Horizontal', 'goblocks' ), value: 'horizontal' },
						{ label: __( 'Vertical',   'goblocks' ), value: 'vertical' },
					] }
					onChange={ ( v ) => setAttributes( { flipDirection: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Trigger on Click', 'goblocks' ) }
					help={ triggerOnClick
						? __( 'Card flips on click / keyboard (keyboard-accessible)', 'goblocks' )
						: __( 'Card flips on hover', 'goblocks' ) }
					checked={ triggerOnClick }
					onChange={ ( v ) => setAttributes( { triggerOnClick: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Front Side', 'goblocks' ) } initialOpen>
				<TextControl
					label={ __( 'Icon / Emoji', 'goblocks' ) }
					help={ __( 'Paste an emoji or Unicode symbol (e.g. ⭐ 🚀 ✦).', 'goblocks' ) }
					value={ frontIcon }
					onChange={ ( v ) => setAttributes( { frontIcon: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '8px' } } />
				<TextControl
					label={ __( 'Title', 'goblocks' ) }
					value={ frontTitle }
					onChange={ ( v ) => setAttributes( { frontTitle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextareaControl
					label={ __( 'Content', 'goblocks' ) }
					value={ frontContent }
					onChange={ ( v ) => setAttributes( { frontContent: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Back Side', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Icon / Emoji', 'goblocks' ) }
					help={ __( 'Paste an emoji or Unicode symbol (e.g. ⭐ 🚀 ✦).', 'goblocks' ) }
					value={ backIcon }
					onChange={ ( v ) => setAttributes( { backIcon: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '8px' } } />
				<TextControl
					label={ __( 'Title', 'goblocks' ) }
					value={ backTitle }
					onChange={ ( v ) => setAttributes( { backTitle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextareaControl
					label={ __( 'Content', 'goblocks' ) }
					value={ backContent }
					onChange={ ( v ) => setAttributes( { backContent: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '8px' } } />
				<TextControl
					label={ __( 'CTA Button Text', 'goblocks' ) }
					placeholder={ __( 'Learn More', 'goblocks' ) }
					value={ backLinkText }
					onChange={ ( v ) => setAttributes( { backLinkText: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'CTA Button URL', 'goblocks' ) }
					type="url"
					placeholder="https://"
					value={ backLinkUrl }
					onChange={ ( v ) => setAttributes( { backLinkUrl: v } ) }
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

	/* ── Live preview ──────────────────────────────────────────────────────── */
	const activeFace = showBack ? 'back' : 'front';
	const icon       = showBack ? backIcon   : frontIcon;
	const title      = showBack ? backTitle  : frontTitle;
	const body       = showBack ? backContent : frontContent;

	return (
		<>
			<InspectorControls>
				<InspectorTabs stylesContent={ stylesContent } advancedContent={ advancedContent } />
			</InspectorControls>

			<div
				{ ...blockProps }
				data-direction={ flipDirection }
				data-trigger={ triggerOnClick ? 'click' : 'hover' }
				style={ { position: 'relative' } }
			>
				<div className="gb-flip-card__inner">
					<div className={ `gb-flip-card__${ activeFace }` }>
						{ icon    && <span className="gb-flip-card__icon">{ icon }</span> }
						{ title   && <h3 className="gb-flip-card__title">{ title }</h3> }
						{ body    && <p className="gb-flip-card__content">{ body }</p> }
						{ showBack && backLinkText && backLinkUrl && (
							<a className="gb-flip-card__cta" href={ backLinkUrl } onClick={ ( e ) => e.preventDefault() }>
								{ backLinkText }
							</a>
						) }
					</div>
				</div>

				<div className="gb-flip-card__preview-toggle">
					<Button
						variant="secondary"
						size="small"
						onClick={ () => setShowBack( ( v ) => ! v ) }
					>
						{ showBack ? __( 'Show Front', 'goblocks' ) : __( 'Preview Back', 'goblocks' ) }
					</Button>
				</div>
			</div>
		</>
	);
}