import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { SliderInspector } from './components/Inspector';
import type { BlockStyles } from '../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

interface SliderBlockAttributes {
	uniqueId: string;
	effect: string;
	arrowStyle: string;
	arrowVisibility: string;
	autoplay: boolean;
	autoplayDelay: number;
	loop: boolean;
	pauseOnHover: boolean;
	showArrows: boolean;
	showDots: boolean;
	showCounter: boolean;
	showProgressBar: boolean;
	slidesPerView: number;
	slideGap: number;
	transitionDuration: number;
	transitionEasing: string;
	arrowColor: string;
	arrowHoverColor: string;
	arrowBgColor: string;
	arrowBgHoverColor: string;
	arrowSize: number;
	arrowRadius: number;
	arrowPosition: string;
	dotColor: string;
	dotActiveColor: string;
	dotSize: number;
	dotStyle: string;
	dotPosition: string;
	showPauseButton: boolean;
	styles: BlockStyles;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/slide', {} ],
	[ 'goblocks/slide', {} ],
	[ 'goblocks/slide', {} ],
];

const ICON_PREV = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M15 18l-6-6 6-6" />
	</svg>
);
const ICON_NEXT = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M9 18l6-6-6-6" />
	</svg>
);
const ICON_PLUS = (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		aria-hidden="true"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

// ── Edit component ────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< SliderBlockAttributes > ) {
	const {
		uniqueId,
		effect,
		showArrows,
		showDots,
		showCounter,
		showProgressBar,
		autoplay,
		slidesPerView,
		slideGap,
		styles,
		globalClasses,
		generatedCss,
		transitionDuration,
		arrowColor,
		arrowHoverColor,
		arrowBgColor,
		arrowBgHoverColor,
		arrowSize,
		arrowRadius,
		arrowPosition,
		arrowVisibility,
		dotColor,
		dotActiveColor,
		dotSize,
		dotStyle,
		dotPosition,
	} = attributes;

	// @ts-ignore
	const { insertBlock } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useCssEngine( {
		blockSlug: 'slider',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< SliderBlockAttributes > ),
	} );

	function addSlide() {
		// @ts-ignore
		const newSlide = createBlock( 'goblocks/slide', {} );
		insertBlock( newSlide, undefined, clientId );
	}

	const spv = effect === 'slide' ? slidesPerView ?? 1 : 1;
	const gap = slideGap ?? 0;

	const sliderVars = {
		'--gb-sl-arrow-color': arrowColor || '#ffffff',
		'--gb-sl-arrow-hover': arrowHoverColor || '#ffffff',
		'--gb-sl-arrow-bg': arrowBgColor || 'rgba(0,0,0,0.35)',
		'--gb-sl-arrow-bg-hover': arrowBgHoverColor || 'rgba(0,0,0,0.65)',
		'--gb-sl-arrow-size': `${ arrowSize ?? 44 }px`,
		'--gb-sl-arrow-r': `${ arrowRadius ?? 50 }%`,
		'--gb-sl-dot': dotColor || 'rgba(255,255,255,0.45)',
		'--gb-sl-dot-active': dotActiveColor || '#ffffff',
		'--gb-sl-dot-size': `${ dotSize ?? 8 }px`,
		'--gb-sl-dur': `${ transitionDuration ?? 450 }ms`,
		...( spv > 1 ? { '--gb-spv': String( spv ) } : {} ),
		...( gap > 0 ? { '--gb-sl-gap': `${ gap }px` } : {} ),
	} as React.CSSProperties;

	const wrapperClass = clsx(
		'gb-slider',
		uniqueId && `gb-slider-${ uniqueId }`,
		effect && `gb-slider--${ effect }`,
		showArrows && arrowPosition && `gb-slider--arrows-${ arrowPosition }`,
		showArrows &&
			arrowVisibility &&
			arrowVisibility !== 'always' &&
			`gb-slider--arrow-vis-${ arrowVisibility }`,
		showDots && dotPosition && `gb-slider--dots-${ dotPosition }`,
		showDots && dotStyle && `gb-slider--dot-style-${ dotStyle }`,
		...( globalClasses ?? [] )
	);

	const blockProps = useBlockProps( {
		className: wrapperClass,
		style: sliderVars,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gb-slider__track' },
		{
			allowedBlocks: [ 'goblocks/slide' ],
			template: DEFAULT_TEMPLATE,
			renderAppender: false as unknown as () => JSX.Element,
		}
	);

	return (
		<>
			{ /* Toolbar: Add Slide */ }
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add Slide', 'goblocks' ) }
						onClick={ addSlide }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ /* Inspector */ }
			<SliderInspector
				attributes={ attributes }
				setAttributes={
					setAttributes as (
						attrs: Partial< typeof attributes >
					) => void
				}
			/>

			{ /* Canvas */ }
			<div { ...blockProps }>
				<div className="gb-slider__clip">
					<div { ...innerBlocksProps } />
				</div>

				{ showArrows && (
					<>
						<button
							className="gb-slider__prev"
							aria-label={ __( 'Previous', 'goblocks' ) }
							type="button"
						>
							{ ICON_PREV }
						</button>
						<button
							className="gb-slider__next"
							aria-label={ __( 'Next', 'goblocks' ) }
							type="button"
						>
							{ ICON_NEXT }
						</button>
					</>
				) }

				{ showDots && (
					<div className="gb-slider__dots" aria-hidden="true">
						<span className="gb-slider__dot is-active" />
						<span className="gb-slider__dot" />
						<span className="gb-slider__dot" />
					</div>
				) }

				{ showCounter && (
					<div className="gb-slider__counter" aria-hidden="true">
						<span className="gb-slider__counter-current">1</span>
						<span className="gb-slider__counter-sep"> / </span>
						<span className="gb-slider__counter-total">3</span>
					</div>
				) }

				{ showProgressBar && autoplay && (
					<div className="gb-slider__progress" aria-hidden="true">
						<div className="gb-slider__progress-bar" />
					</div>
				) }

				{ /* Editor-only "Add Slide" hint button */ }
				<button
					type="button"
					className="gb-slider__add-slide"
					onClick={ addSlide }
				>
					{ ICON_PLUS }
					{ __( 'Add Slide', 'goblocks' ) }
				</button>
			</div>
		</>
	);
}
