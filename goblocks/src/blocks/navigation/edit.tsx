import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	Spinner,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { useResponsiveStyles } from '../../hooks/useResponsiveStyles';
import { clsx } from '../../utils/classNames';
import { InspectorTabs } from '../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../components/panels/SpacingPanel';
import { TypographyPanel } from '../../components/panels/TypographyPanel';
import { BackgroundPanel } from '../../components/panels/BackgroundPanel';
import { BorderPanel } from '../../components/panels/BorderPanel';
import { EffectsPanel } from '../../components/panels/EffectsPanel';
import { ColorControl } from '../../components/controls/ColorControl';
import type { BlockStyles } from '../../types/styles';

interface WpMenu {
	id: number;
	name: string;
	slug: string;
}

interface NavigationBlockAttributes {
	uniqueId: string;
	menuId: number;
	layout: string;
	mobileBreakpoint: string;
	showMobileToggle: boolean;
	sticky: boolean;
	scrollHide: boolean;
	linkColor: string;
	hoverColor: string;
	activeColor: string;
	dropdownBg: string;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const BREAKPOINT_OPTIONS = [
	{ label: __( '640px  (sm)', 'goblocks' ),  value: '640px' },
	{ label: __( '768px  (md)', 'goblocks' ),  value: '768px' },
	{ label: __( '1024px (lg)', 'goblocks' ),  value: '1024px' },
	{ label: __( '1280px (xl)', 'goblocks' ),  value: '1280px' },
];

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< NavigationBlockAttributes > ) {
	const {
		uniqueId, styles, globalClasses, layout, mobileBreakpoint,
		showMobileToggle, menuId, linkColor, hoverColor, activeColor, dropdownBg,
		sticky, scrollHide, generatedCss,
	} = attributes;

	const [ menus, setMenus ]       = useState< WpMenu[] >( [] );
	const [ loadingMenus, setLoadingMenus ] = useState( true );

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Fetch WordPress registered nav menus.
	useEffect( () => {
		apiFetch< WpMenu[] >( { path: '/wp/v2/menus?per_page=100&_fields=id,name,slug' } )
			.then( ( data ) => {
				setMenus( Array.isArray( data ) ? data : [] );
				setLoadingMenus( false );
			} )
			.catch( () => setLoadingMenus( false ) );
	}, [] );

	useCssEngine( {
		blockSlug: 'navigation',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) => setAttributes( patch as Partial< NavigationBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-navigation',
		`gb-navigation--${ layout }`,
		sticky              && 'gb-navigation--sticky',
		sticky && scrollHide && 'gb-navigation--scroll-hide',
		uniqueId && `gb-navigation-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	const selectedMenu = menus.find( ( m ) => m.id === menuId );

	const menuOptions = [
		{ label: __( '— Select a menu —', 'goblocks' ), value: '0' },
		...menus.map( ( m ) => ( { label: m.name, value: String( m.id ) } ) ),
	];

	const stylesContent = (
		<>
			<PanelBody title={ __( 'Link Colors', 'goblocks' ) } initialOpen>
				<ColorControl
					label={ __( 'Link color', 'goblocks' ) }
					value={ linkColor }
					onChange={ ( v ) => setAttributes( { linkColor: v || '' } ) }
					breakpoint={ responsive.activeBreakpoint }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Hover color', 'goblocks' ) }
					value={ hoverColor }
					onChange={ ( v ) => setAttributes( { hoverColor: v || '' } ) }
					breakpoint={ responsive.activeBreakpoint }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Active / current page', 'goblocks' ) }
					value={ activeColor }
					onChange={ ( v ) => setAttributes( { activeColor: v || '' } ) }
					breakpoint={ responsive.activeBreakpoint }
				/>
				<div style={ { height: '12px' } } />
				<ColorControl
					label={ __( 'Dropdown background', 'goblocks' ) }
					value={ dropdownBg }
					onChange={ ( v ) => setAttributes( { dropdownBg: v || '' } ) }
					breakpoint={ responsive.activeBreakpoint }
				/>
			</PanelBody>
			<TypographyPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<SpacingPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BackgroundPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<BorderPanel styles={ styles as BlockStyles } responsive={ responsive } />
			<EffectsPanel styles={ styles as BlockStyles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<>
			<PanelBody title={ __( 'Navigation Settings', 'goblocks' ) } initialOpen>
				{ loadingMenus ? (
					<div style={ { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' } }>
						<Spinner />
						<span>{ __( 'Loading menus…', 'goblocks' ) }</span>
					</div>
				) : menus.length === 0 ? (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'No navigation menus found. Create one in Appearance → Menus.', 'goblocks' ) }
					</Notice>
				) : (
					<SelectControl
						label={ __( 'Menu', 'goblocks' ) }
						value={ String( menuId ) }
						options={ menuOptions }
						onChange={ ( v ) => setAttributes( { menuId: parseInt( v, 10 ) } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }

				<SelectControl
					label={ __( 'Layout', 'goblocks' ) }
					value={ layout }
					options={ [
						{ label: __( 'Horizontal', 'goblocks' ), value: 'horizontal' },
						{ label: __( 'Vertical',   'goblocks' ), value: 'vertical' },
					] }
					onChange={ ( v ) => setAttributes( { layout: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Mobile Breakpoint', 'goblocks' ) }
					value={ mobileBreakpoint }
					options={ BREAKPOINT_OPTIONS }
					onChange={ ( v ) => setAttributes( { mobileBreakpoint: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Mobile Hamburger Toggle', 'goblocks' ) }
					checked={ showMobileToggle }
					onChange={ ( v ) => setAttributes( { showMobileToggle: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody title={ __( 'Sticky Behavior', 'goblocks' ) } initialOpen={ false }>
				<ToggleControl
					label={ __( 'Sticky navigation', 'goblocks' ) }
					help={ __( 'Keep the nav fixed at the top of the viewport while scrolling.', 'goblocks' ) }
					checked={ sticky }
					onChange={ ( v ) => setAttributes( { sticky: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ sticky && (
					<ToggleControl
						label={ __( 'Hide on scroll down', 'goblocks' ) }
						help={ __( 'Slide the nav out of view when scrolling down; reveal it on scroll up.', 'goblocks' ) }
						checked={ scrollHide }
						onChange={ ( v ) => setAttributes( { scrollHide: v } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
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

			<nav { ...blockProps }>
				{ menuId && selectedMenu ? (
					<p style={ { padding: '10px 12px', margin: 0, fontSize: '0.875rem', opacity: 0.8 } }>
						{ __( 'Menu: ', 'goblocks' ) }
						<strong>{ selectedMenu.name }</strong>
						{ ' — ' }
						<em style={ { opacity: 0.6 } }>{ __( 'Rendered on the frontend.', 'goblocks' ) }</em>
					</p>
				) : (
					<p style={ { padding: '12px', fontStyle: 'italic', opacity: 0.6, margin: 0 } }>
						{ __( 'Select a navigation menu in the Settings panel →', 'goblocks' ) }
					</p>
				) }
			</nav>
		</>
	);
}