import { useEffect } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { IconInspector } from './components/Inspector';
import { iconToSvg } from './icons';
import type { BlockStyles } from '../../types/styles';

interface IconBlockAttributes {
	uniqueId:            string;
	iconSlug:            string;
	svgContent:          string;
	iconSize:            number;
	iconColor:           string;
	iconHoverColor:      string;
	iconBg:              string;
	iconBgColor:         string;
	iconBgHoverColor:    string;
	iconBgPadding:       number;
	animation:           string;
	animationTrigger:    string;
	animationDuration:   number;
	animationDelay:      number;
	animationIterations: string;
	ariaHidden:          boolean;
	ariaLabel:           string;
	link:                string;
	linkTarget:          string;
	linkRel:             string;
	styles:              BlockStyles;
	globalClasses:       string[];
	htmlAttributes:      Record< string, string >;
	generatedCss:        string;
	blockVersion:        number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

function buildCssVars( attrs: IconBlockAttributes ): React.CSSProperties {
	const vars: Record< string, string > = {};
	if ( attrs.iconColor )       vars['--gb-icon-color']          = attrs.iconColor;
	if ( attrs.iconHoverColor )  vars['--gb-icon-hover']          = attrs.iconHoverColor;
	if ( attrs.iconBgColor )     vars['--gb-icon-bg']             = attrs.iconBgColor;
	if ( attrs.iconBgHoverColor ) vars['--gb-icon-bg-hover']      = attrs.iconBgHoverColor;
	if ( attrs.iconBgPadding )   vars['--gb-icon-bg-pad']         = `${ attrs.iconBgPadding }px`;
	if ( attrs.animation !== 'none' ) {
		vars['--gb-anim-dur']   = `${ attrs.animationDuration }s`;
		vars['--gb-anim-delay'] = `${ attrs.animationDelay }s`;
		vars['--gb-anim-iter']  = attrs.animationIterations;
	}
	return vars as React.CSSProperties;
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< IconBlockAttributes > ) {
	const {
		uniqueId, iconSlug, svgContent, iconSize,
		iconBg, animation, animationTrigger,
		ariaHidden, ariaLabel, link,
		styles, globalClasses,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		if ( ! svgContent && iconSlug ) {
			setAttributes( { svgContent: iconToSvg( iconSlug, iconSize ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'icon',
		uniqueId,
		styles,
		setAttributes: ( patch ) => setAttributes( patch as Partial< IconBlockAttributes > ),
	} );

	const hasBg = iconBg !== 'none';
	const hasAnim = animation !== 'none';

	const wrapperClass = clsx(
		'gb-icon',
		uniqueId && `gb-icon-${ uniqueId }`,
		hasBg    && `gb-icon--bg-${ iconBg }`,
		hasAnim  && `gb-icon--anim-${ animation }`,
		hasAnim  && animationTrigger !== 'load' && `gb-icon--trigger-${ animationTrigger }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style:     buildCssVars( attributes ),
	} );

	const resolvedSvg = svgContent || iconToSvg( iconSlug || 'star', iconSize );

	const svgEl = (
		<span
			className="gb-icon__svg"
			aria-hidden={ ariaHidden ? 'true' : undefined }
			aria-label={ ! ariaHidden && ariaLabel ? ariaLabel : undefined }
			dangerouslySetInnerHTML={ { __html: resolvedSvg } }
		/>
	);

	return (
		<>
			<IconInspector attributes={ attributes } setAttributes={ setAttributes } />

			<div { ...blockProps }>
				{ link ? (
					<span className="gb-icon__link" style={ { cursor: 'pointer' } }>
						{ svgEl }
					</span>
				) : (
					svgEl
				) }
			</div>
		</>
	);
}