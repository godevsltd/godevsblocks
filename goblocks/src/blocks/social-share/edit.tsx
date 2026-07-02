import { useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	CheckboxControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import type { BlockStyles } from '../../types/styles';

interface SocialShareBlockAttributes {
	uniqueId:     string;
	platforms:    string[];
	showLabels:   boolean;
	size:         string;
	layout:       string;
	buttonStyle:  string;
	customUrl:    string;
	styles:       BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

// Icon SVGs for editor preview — same paths as PHP side.
const ICON_MAP: Record< string, string > = {
	facebook:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
	twitter:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
	linkedin:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
	whatsapp:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>',
	pinterest: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0"/></svg>',
	email:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
	telegram:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z"/></svg>',
	reddit:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="12"/><path fill="#fff" d="M20 12c0-1.1-.9-2-2-2a2 2 0 0 0-1.3.5A9.9 9.9 0 0 0 13 9.1l.7-3.3 2.3.5c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1.1.7l-2.6-.5c-.1 0-.3.1-.3.2l-.8 3.6A9.9 9.9 0 0 0 7.2 10.5 2 2 0 0 0 6 10a2 2 0 0 0 0 4c0 .2 0 .3.1.5C6 16.2 8.7 18 12 18s6-1.8 5.9-3.5c.1-.2.1-.3.1-.5A2 2 0 0 0 20 12zm-10 1.5c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1zm3.7 2.9c-.7.7-2.5.7-3.4 0-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 2 .5 2.6 0 .1-.1.3-.1.4 0 .1.1.1.3 0 .4zm.3-1.8c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/></svg>',
	copy:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};

const PLATFORMS: { value: string; label: string }[] = [
	{ value: 'facebook',  label: 'Facebook'    },
	{ value: 'twitter',   label: 'X (Twitter)' },
	{ value: 'linkedin',  label: 'LinkedIn'    },
	{ value: 'whatsapp',  label: 'WhatsApp'    },
	{ value: 'telegram',  label: 'Telegram'    },
	{ value: 'reddit',    label: 'Reddit'      },
	{ value: 'pinterest', label: 'Pinterest'   },
	{ value: 'email',     label: 'Email'       },
	{ value: 'copy',      label: 'Copy Link'   },
];

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< SocialShareBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses,
		platforms, showLabels, size, layout, buttonStyle, customUrl,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'social-share',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< SocialShareBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-social-share',
		`gb-social-share--${ layout }`,
		`gb-social-share--${ size }`,
		`gb-social-share--${ buttonStyle }`,
		uniqueId && `gb-social-share-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	function togglePlatform( value: string, checked: boolean ) {
		const next = checked
			? [ ...platforms, value ]
			: platforms.filter( ( p ) => p !== value );
		setAttributes( { platforms: next } );
	}

	const stylesContent = (
		<>
			<SpacingPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			<PanelBody title={ __( 'Platforms', 'goblocks' ) } initialOpen>
				{ PLATFORMS.map( ( p ) => (
					<CheckboxControl
						key={ p.value }
						label={ p.label }
						checked={ platforms.includes( p.value ) }
						onChange={ ( v ) => togglePlatform( p.value, v ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) ) }
			</PanelBody>

			<PanelBody title={ __( 'Display', 'goblocks' ) } initialOpen={ false }>
				<SelectControl
					label={ __( 'Button Style', 'goblocks' ) }
					value={ buttonStyle ?? 'filled' }
					options={ [
						{ label: __( 'Filled (platform color)', 'goblocks' ), value: 'filled'   },
						{ label: __( 'Outline',                 'goblocks' ), value: 'outline'  },
						{ label: __( 'Minimal (text + icon)',   'goblocks' ), value: 'minimal'  },
						{ label: __( 'Rounded (icon badges)',   'goblocks' ), value: 'rounded'  },
					] }
					onChange={ ( v ) => setAttributes( { buttonStyle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<div style={ { height: '8px' } } />
				<SelectControl
					label={ __( 'Layout', 'goblocks' ) }
					value={ layout }
					options={ [
						{ label: __( 'Horizontal', 'goblocks' ), value: 'horizontal' },
						{ label: __( 'Vertical',   'goblocks' ), value: 'vertical'   },
					] }
					onChange={ ( v ) => setAttributes( { layout: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Button Size', 'goblocks' ) }
					value={ size }
					options={ [
						{ label: __( 'Small',  'goblocks' ), value: 'sm' },
						{ label: __( 'Medium', 'goblocks' ), value: 'md' },
						{ label: __( 'Large',  'goblocks' ), value: 'lg' },
					] }
					onChange={ ( v ) => setAttributes( { size: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Platform Labels', 'goblocks' ) }
					checked={ showLabels }
					onChange={ ( v ) => setAttributes( { showLabels: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Advanced', 'goblocks' ) } initialOpen={ false }>
				<TextControl
					label={ __( 'Custom share URL', 'goblocks' ) }
					value={ customUrl }
					placeholder={ __( 'Leave blank to use current page URL', 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { customUrl: v } ) }
					help={ __( 'Override the URL shared by all buttons.', 'goblocks' ) }
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
				{ PLATFORMS.filter( ( p ) => platforms.includes( p.value ) ).map( ( p ) => (
					<a
						key={ p.value }
						href="#"
						className={ `gb-social-share__btn gb-social-share__btn--${ p.value }` }
						aria-label={ p.label }
						onClick={ ( e ) => e.preventDefault() }
					>
						<span
							className="gb-social-share__icon"
							dangerouslySetInnerHTML={ { __html: ICON_MAP[ p.value ] ?? '' } }
						/>
						{ showLabels && (
							<span className="gb-social-share__label">{ p.label }</span>
						) }
					</a>
				) ) }
			</div>
		</>
	);
}