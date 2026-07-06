import { useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	RangeControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
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

interface StarRatingBlockAttributes {
	uniqueId: string;
	rating: number;
	maxRating: number;
	showNumber: boolean;
	label: string;
	starColor: string;
	emptyColor: string;
	starSize: number;
	reviewCount: number;
	showCount: boolean;
	schemaEnabled: boolean;
	itemName: string;
	animateOnScroll: boolean;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const STAR_POINTS =
	'12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';

function StarIcon( { fill }: { fill: 'full' | 'half' | 'empty' } ) {
	if ( fill === 'half' ) {
		return (
			<>
				<svg
					className="gb-star__svg gb-star__bg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					aria-hidden="true"
				>
					<polygon points={ STAR_POINTS } />
				</svg>
				<svg
					className="gb-star__svg gb-star__fg"
					viewBox="0 0 24 24"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="1.5"
					aria-hidden="true"
				>
					<polygon points={ STAR_POINTS } />
				</svg>
			</>
		);
	}
	return (
		<svg
			className="gb-star__svg"
			viewBox="0 0 24 24"
			fill={ fill === 'full' ? 'currentColor' : 'none' }
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden="true"
		>
			<polygon points={ STAR_POINTS } />
		</svg>
	);
}

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< StarRatingBlockAttributes > ) {
	const {
		uniqueId,
		styles,
		globalClasses,
		rating,
		maxRating,
		showNumber,
		label,
		starColor,
		emptyColor,
		starSize,
		reviewCount,
		showCount,
		schemaEnabled,
		itemName,
		animateOnScroll,
		generatedCss,
	} = attributes;

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'star-rating',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< StarRatingBlockAttributes > ),
	} );

	const responsive = useResponsiveStyles( styles as BlockStyles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const wrapperClass = clsx(
		'gb-star-rating',
		uniqueId && `gb-star-rating-${ uniqueId }`,
		...( globalClasses ?? [] )
	);

	const starVars = {
		'--gb-star-color': starColor || '#f59e0b',
		'--gb-star-empty': emptyColor || '#d1d5db',
		'--gb-star-size': `${ starSize || 22 }px`,
	} as React.CSSProperties;

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: starVars,
	} );

	const stars = Array.from( { length: maxRating }, ( _, i ) => {
		const n = i + 1;
		if ( n <= Math.floor( rating ) ) {
			return 'full' as const;
		}
		if ( n - 0.5 <= rating ) {
			return 'half' as const;
		}
		return 'empty' as const;
	} );

	/* ── Inspector: Style tab ─────────────────────────────────────────────── */
	const stylesContent = (
		<>
			<PanelBody
				title={ __( 'Star Appearance', 'goblocks' ) }
				initialOpen
			>
				<RangeControl
					label={ __( 'Star Size', 'goblocks' ) }
					value={ starSize ?? 22 }
					onChange={ ( v ) => setAttributes( { starSize: v ?? 22 } ) }
					min={ 12 }
					max={ 64 }
					step={ 1 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ColorControl
					label={ __( 'Filled Star Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ starColor || '#f59e0b' }
					onChange={ ( v ) =>
						setAttributes( { starColor: v || '#f59e0b' } )
					}
				/>
				<ColorControl
					label={ __( 'Empty Star Color', 'goblocks' ) }
					breakpoint={ responsive.activeBreakpoint }
					value={ emptyColor || '#d1d5db' }
					onChange={ ( v ) =>
						setAttributes( { emptyColor: v || '#d1d5db' } )
					}
				/>
				<ToggleControl
					label={ __( 'Animate on scroll', 'goblocks' ) }
					help={ __(
						'Stars pop in one by one when scrolled into view.',
						'goblocks'
					) }
					checked={ animateOnScroll ?? true }
					onChange={ ( v ) =>
						setAttributes( { animateOnScroll: v } )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<TypographyPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<SpacingPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BackgroundPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<BorderPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
			<EffectsPanel
				styles={ styles as BlockStyles }
				responsive={ responsive }
			/>
		</>
	);

	/* ── Inspector: Advanced tab ──────────────────────────────────────────── */
	const advancedContent = (
		<>
			<PanelBody
				title={ __( 'Star Rating Settings', 'goblocks' ) }
				initialOpen
			>
				<RangeControl
					label={ __( 'Rating', 'goblocks' ) }
					value={ rating }
					onChange={ ( v ) => setAttributes( { rating: v ?? 4.5 } ) }
					min={ 0 }
					max={ maxRating }
					step={ 0.5 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Max Stars', 'goblocks' ) }
					value={ maxRating }
					onChange={ ( v ) => setAttributes( { maxRating: v ?? 5 } ) }
					min={ 1 }
					max={ 10 }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'Label', 'goblocks' ) }
					value={ label }
					placeholder={ __( 'e.g. Overall Rating', 'goblocks' ) }
					onChange={ ( v ) => setAttributes( { label: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={ __( 'Show Numeric Rating', 'goblocks' ) }
					checked={ showNumber }
					onChange={ ( v ) => setAttributes( { showNumber: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Review Count', 'goblocks' ) }
				initialOpen={ false }
			>
				<NumberControl
					label={ __( 'Number of reviews', 'goblocks' ) }
					value={ reviewCount ?? 1 }
					min={ 1 }
					onChange={ ( v ) =>
						setAttributes( {
							reviewCount: parseInt( String( v ?? 1 ), 10 ) || 1,
						} )
					}
					help={ __(
						'Used for schema.org markup and optional display.',
						'goblocks'
					) }
					// @ts-ignore
					__next40pxDefaultSize
				/>
				<ToggleControl
					label={ __( 'Show review count', 'goblocks' ) }
					help={ __(
						'Displays "(X reviews)" next to the rating.',
						'goblocks'
					) }
					checked={ showCount }
					onChange={ ( v ) => setAttributes( { showCount: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Schema.org Markup', 'goblocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Output structured data', 'goblocks' ) }
					help={ __(
						'Adds JSON-LD schema markup (AggregateRating) to help search engines display star ratings in results.',
						'goblocks'
					) }
					checked={ schemaEnabled }
					onChange={ ( v ) => setAttributes( { schemaEnabled: v } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
				{ schemaEnabled && (
					<TextControl
						label={ __( 'Item name', 'goblocks' ) }
						value={ itemName }
						placeholder={ __(
							'Defaults to the page/post title',
							'goblocks'
						) }
						onChange={ ( v ) => setAttributes( { itemName: v } ) }
						help={ __(
							'Name of the product, service, or entity being rated.',
							'goblocks'
						) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'CSS Classes', 'goblocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Additional CSS classes', 'goblocks' ) }
					value={ ( globalClasses ?? [] ).join( ' ' ) }
					onChange={ ( v ) =>
						setAttributes( {
							globalClasses: v.split( /\s+/ ).filter( Boolean ),
						} )
					}
					// @ts-ignore
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);

	const count = reviewCount ?? 1;

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					stylesContent={ stylesContent }
					advancedContent={ advancedContent }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ label && (
					<span className="gb-star-rating__label">{ label }</span>
				) }
				<div
					className="gb-star-rating__stars"
					role="img"
					aria-label={ `${ rating } ${ __(
						'out of',
						'goblocks'
					) } ${ maxRating } ${ __( 'stars', 'goblocks' ) }` }
				>
					{ stars.map( ( fill, i ) => (
						<span
							key={ i }
							className={ `gb-star gb-star--${ fill }` }
						>
							<StarIcon fill={ fill } />
						</span>
					) ) }
				</div>
				{ showNumber && (
					<span className="gb-star-rating__number">
						{ rating }/{ maxRating }
					</span>
				) }
				{ showCount && (
					<span className="gb-star-rating__count">
						({ count }{ ' ' }
						{ count === 1
							? __( 'review', 'goblocks' )
							: __( 'reviews', 'goblocks' ) }
						)
					</span>
				) }
			</div>
		</>
	);
}
