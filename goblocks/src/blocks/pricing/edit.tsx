import { useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
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
import { TypographyPanel } from '../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface PricingBlockAttributes {
	uniqueId: string;
	planName: string;
	price: string;
	period: string;
	currency: string;
	description: string;
	features: string[];
	ctaText: string;
	ctaUrl: string;
	featured: boolean;
	featuredLabel: string;
	accentColor: string;
	btnTextColor: string;
	headingColor: string;
	textColor: string;
	checkColor: string;
	cardBg: string;
	priceAlt: string;
	periodAlt: string;
	savingsLabel: string;
	animateOnScroll: boolean;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< PricingBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, generatedCss,
		planName, price, period, currency, description,
		features, ctaText, ctaUrl, featured, featuredLabel,
		accentColor, btnTextColor, headingColor, textColor, checkColor, cardBg,
		priceAlt, periodAlt, savingsLabel, animateOnScroll,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'pricing',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< PricingBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const accent  = accentColor  || '#4f46e5';
	const btnText = btnTextColor || '#ffffff';
	const heading = headingColor || '#0f172a';
	const text    = textColor    || '#374151';
	const check   = checkColor   || '#059669';
	const bg      = cardBg       || '#ffffff';

	const pricingVars = {
		'--gb-pc-accent':   accent,
		'--gb-pc-btn-text': btnText,
		'--gb-pc-heading':  heading,
		'--gb-pc-text':     text,
		'--gb-pc-check':    check,
		'--gb-pc-bg':       bg,
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-pricing',
		featured && 'gb-pricing--featured',
		uniqueId && `gb-pricing-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass, style: pricingVars } );

	/* ── Inspector: Style tab ──────────────────────────────────────────────── */
	const stylesContent = (
		<>
			{ /* ── Card Appearance ─────────────────────────────────────── */ }
			<PanelBody title={ __( 'Card Appearance', 'goblocks' ) } initialOpen>

				{ /* Live mini preview */ }
				<div
					style={ {
						borderRadius: '14px',
						border: `2px solid ${ accent }22`,
						overflow: 'hidden',
						marginBottom: '16px',
						background: bg,
						transition: 'background 200ms, border-color 200ms',
					} }
				>
					{ /* Accent top bar */ }
					<div style={ { height: '4px', background: accent, transition: 'background 200ms' } } />
					<div style={ { padding: '14px 16px' } }>
						<div style={ { fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' } }>
							{ __( 'Plan', 'goblocks' ) }
						</div>
						<div style={ { fontSize: '0.875rem', fontWeight: 800, color: heading, marginBottom: '6px', transition: 'color 200ms' } }>
							{ planName || 'Pro Plan' }
						</div>
						<div style={ { display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '10px' } }>
							<span style={ { fontSize: '0.875rem', fontWeight: 700, color: accent, transition: 'color 200ms' } }>{ currency }</span>
							<span style={ { fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: accent, lineHeight: 1, transition: 'color 200ms' } }>{ price }</span>
							<span style={ { fontSize: '0.6875rem', color: '#94a3b8', marginLeft: '2px' } }>{ period }</span>
						</div>
						<div style={ { height: '1px', background: '#f1f5f9', margin: '0 0 10px' } } />
						{ [ 'First feature', 'Second feature' ].map( ( f ) => (
							<div key={ f } style={ { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' } }>
								<span style={ {
									width: '16px', height: '16px', borderRadius: '50%',
									background: check, display: 'inline-flex',
									alignItems: 'center', justifyContent: 'center',
									color: '#fff', fontSize: '9px', fontWeight: 900, flexShrink: 0,
									transition: 'background 200ms',
								} }>✓</span>
								<span style={ { fontSize: '0.75rem', color: text, transition: 'color 200ms' } }>{ f }</span>
							</div>
						) ) }
						<div style={ { marginTop: '12px' } }>
							<div style={ {
								background: accent, color: btnText,
								textAlign: 'center', borderRadius: '10px',
								padding: '8px 12px', fontSize: '0.75rem',
								fontWeight: 700, transition: 'background 200ms, color 200ms',
							} }>
								{ ctaText || 'Get Started' }
							</div>
						</div>
					</div>
				</div>

				<ColorControl
					label={ __( 'Accent / Brand Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ accent }
					onChange={ ( v ) => setAttributes( { accentColor: v || '#4f46e5' } ) }
				/>
				<ColorControl
					label={ __( 'Button Text Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ btnText }
					onChange={ ( v ) => setAttributes( { btnTextColor: v || '#ffffff' } ) }
				/>
				<ColorControl
					label={ __( 'Heading Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ heading }
					onChange={ ( v ) => setAttributes( { headingColor: v || '#0f172a' } ) }
				/>
				<ColorControl
					label={ __( 'Text & Features Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ text }
					onChange={ ( v ) => setAttributes( { textColor: v || '#374151' } ) }
				/>
				<ColorControl
					label={ __( 'Check Icon Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ check }
					onChange={ ( v ) => setAttributes( { checkColor: v || '#059669' } ) }
				/>
				<ColorControl
					label={ __( 'Card Background', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ bg }
					onChange={ ( v ) => setAttributes( { cardBg: v || '#ffffff' } ) }
				/>
				<ToggleControl
					label={ __( 'Animate on scroll', 'goblocks' ) }
					help={ __( 'Card slides up into view when scrolled into the viewport.', 'goblocks' ) }
					checked={ animateOnScroll ?? true }
					onChange={ ( v ) => setAttributes( { animateOnScroll: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<TypographyPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel    styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel     styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel    styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	/* ── Inspector: Advanced tab ───────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody title={ __( 'Plan Details', 'goblocks' ) } initialOpen>
				<TextControl label={ __( 'Plan Name', 'goblocks' ) } value={ planName } onChange={ ( v ) => setAttributes( { planName: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				<TextControl label={ __( 'Currency Symbol', 'goblocks' ) } value={ currency } onChange={ ( v ) => setAttributes( { currency: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				<TextControl label={ __( 'Price', 'goblocks' ) } value={ price } onChange={ ( v ) => setAttributes( { price: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				<TextControl label={ __( 'Billing Period', 'goblocks' ) } value={ period } onChange={ ( v ) => setAttributes( { period: v } ) } placeholder="/month" // @ts-ignore
					__nextHasNoMarginBottom />
				<TextareaControl label={ __( 'Description', 'goblocks' ) } value={ description } onChange={ ( v ) => setAttributes( { description: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				<TextareaControl
					label={ __( 'Features (one per line)', 'goblocks' ) }
					value={ features.join( '\n' ) }
					onChange={ ( v ) => setAttributes( { features: v.split( '\n' ).filter( Boolean ) } ) }
					help={ __( 'Prefix with - to cross out, * to bold/highlight.', 'goblocks' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Annual Pricing', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Annual price', 'goblocks' ) }
					value={ priceAlt }
					placeholder={ __( 'e.g. 19', 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { priceAlt: v } ) }
					help={ __( 'Set to enable the Monthly / Annual toggle. Leave blank to disable.', 'goblocks' ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ priceAlt && (
					<>
						<TextControl
							label={ __( 'Annual period label', 'goblocks' ) }
							value={ periodAlt }
							placeholder="/yr"
							onChange={ ( v ) => setAttributes( { periodAlt: v } ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Savings badge text', 'goblocks' ) }
							value={ savingsLabel }
							placeholder={ __( 'e.g. Save 20%', 'goblocks' ) }
							onChange={ ( v ) => setAttributes( { savingsLabel: v } ) }
							help={ __( 'Short label shown on the Annual button in the toggle.', 'goblocks' ) }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</PanelBody>

			<PanelBody title={ __( 'Call to Action', 'goblocks' ) } initialOpen={ false }>
				<TextControl label={ __( 'Button Text', 'goblocks' ) } value={ ctaText } onChange={ ( v ) => setAttributes( { ctaText: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				<TextControl label={ __( 'Button URL', 'goblocks' ) } value={ ctaUrl } onChange={ ( v ) => setAttributes( { ctaUrl: v } ) } type="url" // @ts-ignore
					__nextHasNoMarginBottom />
			</PanelBody>

			<PanelBody title={ __( 'Featured Badge', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl label={ __( 'Mark as Featured', 'goblocks' ) } checked={ featured } onChange={ ( v ) => setAttributes( { featured: v } ) } // @ts-ignore
					__nextHasNoMarginBottom />
				{ featured && (
					<TextControl label={ __( 'Badge Label', 'goblocks' ) } value={ featuredLabel } onChange={ ( v ) => setAttributes( { featuredLabel: v } ) } // @ts-ignore
						__nextHasNoMarginBottom />
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
				{ featured && <div className="gb-pricing__badge">{ featuredLabel }</div> }

				{ /* Accent top bar */ }
				<div className="gb-pricing__accent-bar" />

				<div className="gb-pricing__header">
					<div className="gb-pricing__plan-label">{ __( 'Plan', 'goblocks' ) }</div>
					<h3 className="gb-pricing__name">{ planName }</h3>
					<div className="gb-pricing__price">
						<span className="gb-pricing__currency">{ currency }</span>
						<span className="gb-pricing__amount">{ price }</span>
						<span className="gb-pricing__period">{ period }</span>
					</div>
					{ description && <p className="gb-pricing__desc">{ description }</p> }
				</div>

				<div className="gb-pricing__divider" />

				<ul className="gb-pricing__features">
					{ features.map( ( f, i ) => (
						<li key={ i } className="gb-pricing__feature">
							<span className="gb-pricing__check" aria-hidden="true" />
							{ f }
						</li>
					) ) }
				</ul>

				<div className="gb-pricing__footer">
					<a className="gb-pricing__cta" href={ ctaUrl }>{ ctaText }</a>
				</div>
			</div>
		</>
	);
}