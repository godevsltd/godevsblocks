/**
 * GoBlocks — Custom block icons.
 *
 * All icons use createElement (no JSX) so this file stays .ts.
 * Each exported value is a ReactElement suitable for `registerBlockType` icon.
 *
 * Design: 24px viewport, 1.5px stroke, Heroicons outline style.
 */

import { createElement } from '@wordpress/element';
import type { ReactElement } from 'react';

type SVGProps = Record< string, string | number >;

function svg( props: SVGProps, ...children: ReactElement[] ): ReactElement {
	return createElement(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: '1.5',
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			width: 24,
			height: 24,
			...props,
		},
		...children
	);
}

function el( tag: string, props: SVGProps ): ReactElement {
	return createElement( tag, props );
}

/** Box / Container — rounded rect with a horizontal shelf line inside */
export const BoxIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '2', width: '20', height: '20', rx: '3' } ),
	el( 'line', { x1: '2', y1: '8', x2: '22', y2: '8' } )
);

/** Text / Paragraph — stacked lines of varying width */
export const TextIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '3', y1: '6', x2: '21', y2: '6' } ),
	el( 'line', { x1: '3', y1: '11', x2: '21', y2: '11' } ),
	el( 'line', { x1: '3', y1: '16', x2: '14', y2: '16' } )
);

/** Heading — bold "H" with serif serifs on stems */
export const HeadingIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '4', y1: '4', x2: '4', y2: '20' } ),
	el( 'line', { x1: '20', y1: '4', x2: '20', y2: '20' } ),
	el( 'line', { x1: '4', y1: '12', x2: '20', y2: '12' } )
);

/** Button — pill-shaped CTA */
export const ButtonIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '8', width: '20', height: '8', rx: '4' } ),
	el( 'line', { x1: '8', y1: '12', x2: '16', y2: '12' } )
);

/** Image — landscape frame with mountain + sun */
export const ImageIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' } ),
	el( 'path', { d: 'M2 15 l5-5 4 4 4-4 7 6' } ),
	el( 'circle', { cx: '16', cy: '8', r: '1.5' } )
);

/** Grid — 2×2 layout grid */
export const GridIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '2', width: '9', height: '9', rx: '1.5' } ),
	el( 'rect', { x: '13', y: '2', width: '9', height: '9', rx: '1.5' } ),
	el( 'rect', { x: '2', y: '13', width: '9', height: '9', rx: '1.5' } ),
	el( 'rect', { x: '13', y: '13', width: '9', height: '9', rx: '1.5' } )
);

/** Icon block — sparkle / star */
export const IconBlockIcon: ReactElement = svg(
	{},
	el( 'path', {
		d: 'M12 2 L14 9 L21 9 L15.5 13.5 L17.5 20.5 L12 16 L6.5 20.5 L8.5 13.5 L3 9 L10 9 Z',
	} )
);

/** Shape / Divider — wavy separator */
export const ShapeIcon: ReactElement = svg(
	{},
	el( 'path', {
		d: 'M2 12 Q5.5 6 9 12 Q12.5 18 16 12 Q19.5 6 23 12',
		strokeWidth: '2',
		fill: 'none',
	} ),
	el( 'line', {
		x1: '2',
		y1: '18',
		x2: '22',
		y2: '18',
		strokeDasharray: '4 3',
	} )
);

/** Tabs — folder tabs navigation */
export const TabsIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '8', width: '20', height: '13', rx: '2' } ),
	el( 'rect', { x: '2', y: '3', width: '7', height: '6', rx: '1.5' } ),
	el( 'rect', { x: '11', y: '3', width: '7', height: '6', rx: '1.5' } )
);

/** Accordion — stacked rows with a chevron */
export const AccordionIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '3', width: '20', height: '5', rx: '1.5' } ),
	el( 'rect', { x: '2', y: '10', width: '20', height: '5', rx: '1.5' } ),
	el( 'rect', { x: '2', y: '17', width: '20', height: '5', rx: '1.5' } ),
	el( 'polyline', { points: '18,5 20,5 16,8' } )
);

/** Separator — centered line with end caps */
export const SeparatorIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '2', y1: '12', x2: '22', y2: '12', strokeWidth: '2' } ),
	el( 'circle', { cx: '7', cy: '12', r: '1.5', fill: 'currentColor' } ),
	el( 'circle', { cx: '12', cy: '12', r: '1.5', fill: 'currentColor' } ),
	el( 'circle', { cx: '17', cy: '12', r: '1.5', fill: 'currentColor' } )
);

/** Spacer — bidirectional arrows with gap */
export const SpacerIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '12', y1: '3', x2: '12', y2: '9' } ),
	el( 'polyline', { points: '9,6 12,3 15,6' } ),
	el( 'line', { x1: '12', y1: '15', x2: '12', y2: '21' } ),
	el( 'polyline', { points: '9,18 12,21 15,18' } ),
	el( 'line', {
		x1: '6',
		y1: '12',
		x2: '18',
		y2: '12',
		strokeDasharray: '3 2',
	} )
);

/** Query — stacked documents / database rows */
export const QueryIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '3', y: '3', width: '18', height: '5', rx: '1.5' } ),
	el( 'rect', { x: '3', y: '10', width: '18', height: '5', rx: '1.5' } ),
	el( 'rect', { x: '3', y: '17', width: '12', height: '4', rx: '1.5' } )
);

/** Query Loop — circular repeat arrow around a document */
export const QueryLoopIcon: ReactElement = svg(
	{},
	el( 'path', { d: 'M20 12a8 8 0 1 1-4.93-7.39' } ),
	el( 'polyline', { points: '21 3 21 9 15 9' } ),
	el( 'line', { x1: '10', y1: '12', x2: '14', y2: '12' } ),
	el( 'line', { x1: '10', y1: '15', x2: '13', y2: '15' } )
);

/** Pagination — chevrons + dots */
export const PaginationIcon: ReactElement = svg(
	{},
	el( 'polyline', { points: '8,6 3,12 8,18' } ),
	el( 'polyline', { points: '16,6 21,12 16,18' } ),
	el( 'circle', { cx: '10', cy: '12', r: '1.5', fill: 'currentColor' } ),
	el( 'circle', { cx: '14', cy: '12', r: '1.5', fill: 'currentColor' } )
);

/** Accordion Item — single row with an open chevron */
export const AccordionItemIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' } ),
	el( 'line', { x1: '6', y1: '10', x2: '18', y2: '10' } ),
	el( 'polyline', { points: '9,14 12,17 15,14' } )
);

/** Tab Panel — single panel with content lines */
export const TabPanelIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '6', width: '20', height: '15', rx: '2' } ),
	el( 'line', { x1: '6', y1: '12', x2: '18', y2: '12' } ),
	el( 'line', { x1: '6', y1: '16', x2: '14', y2: '16' } )
);

/** Query No Results — document with a ✕ */
export const QueryNoResultsIcon: ReactElement = svg(
	{},
	el( 'path', {
		d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
	} ),
	el( 'polyline', { points: '14 2 14 8 20 8' } ),
	el( 'line', { x1: '9', y1: '13', x2: '15', y2: '19' } ),
	el( 'line', { x1: '15', y1: '13', x2: '9', y2: '19' } )
);

/** Counter — number with up arrow */
export const CounterIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '3', y: '6', width: '18', height: '13', rx: '2' } ),
	el( 'line', { x1: '8', y1: '12', x2: '12', y2: '8' } ),
	el( 'line', { x1: '12', y1: '8', x2: '16', y2: '12' } ),
	el( 'line', { x1: '12', y1: '8', x2: '12', y2: '16' } )
);

/** Progress Bar — horizontal bar with partial fill */
export const ProgressBarIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '9', width: '20', height: '6', rx: '3' } ),
	el( 'rect', {
		x: '2',
		y: '9',
		width: '13',
		height: '6',
		rx: '3',
		fill: 'currentColor',
		stroke: 'none',
	} )
);

/** Alert — circle with exclamation */
export const AlertIcon: ReactElement = svg(
	{},
	el( 'circle', { cx: '12', cy: '12', r: '9' } ),
	el( 'line', { x1: '12', y1: '8', x2: '12', y2: '12' } ),
	el( 'circle', {
		cx: '12',
		cy: '16',
		r: '0.8',
		fill: 'currentColor',
		stroke: 'none',
	} )
);

/** Star Rating — single star */
export const StarRatingIcon: ReactElement = svg(
	{},
	el( 'polygon', {
		points: '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26',
	} )
);

/** Lottie — play button with motion lines */
export const LottieIcon: ReactElement = svg(
	{},
	el( 'circle', { cx: '12', cy: '12', r: '9' } ),
	el( 'polygon', { points: '10,8.5 10,15.5 16,12' } )
);

/** Flip Card — two overlapping cards */
export const FlipCardIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '4', y: '6', width: '14', height: '14', rx: '2' } ),
	el( 'rect', {
		x: '6',
		y: '4',
		width: '14',
		height: '14',
		rx: '2',
		fill: 'none',
	} )
);

/** Countdown — clock face */
export const CountdownIcon: ReactElement = svg(
	{},
	el( 'circle', { cx: '12', cy: '12', r: '9' } ),
	el( 'polyline', { points: '12,7 12,12 15,15' } )
);

/** Social Share — branch/share icon */
export const SocialShareIcon: ReactElement = svg(
	{},
	el( 'circle', { cx: '18', cy: '5', r: '2.5' } ),
	el( 'circle', { cx: '6', cy: '12', r: '2.5' } ),
	el( 'circle', { cx: '18', cy: '19', r: '2.5' } ),
	el( 'line', { x1: '8.4', y1: '10.85', x2: '15.6', y2: '6.15' } ),
	el( 'line', { x1: '8.4', y1: '13.15', x2: '15.6', y2: '17.85' } )
);

/** Table of Contents — hierarchical list */
export const TocIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '3', y1: '6', x2: '21', y2: '6' } ),
	el( 'line', { x1: '6', y1: '10', x2: '21', y2: '10' } ),
	el( 'line', { x1: '6', y1: '14', x2: '21', y2: '14' } ),
	el( 'line', { x1: '3', y1: '18', x2: '21', y2: '18' } )
);

/** Slider — rectangle with left/right arrows */
export const SliderIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '4', y: '5', width: '16', height: '14', rx: '2' } ),
	el( 'polyline', { points: '1,12 4,9 4,15' } ),
	el( 'polyline', { points: '23,12 20,9 20,15' } )
);

/** Slide — single rectangle (child block) */
export const SlideIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' } ),
	el( 'line', { x1: '3', y1: '10', x2: '21', y2: '10' } )
);

/** Modal — window/dialog with overlay */
export const ModalIcon: ReactElement = svg(
	{},
	el( 'rect', {
		x: '2',
		y: '2',
		width: '20',
		height: '20',
		rx: '2',
		strokeDasharray: '4 2',
	} ),
	el( 'rect', { x: '5', y: '5', width: '14', height: '14', rx: '1' } ),
	el( 'line', { x1: '12', y1: '5', x2: '12', y2: '7' } ),
	el( 'line', { x1: '5', y1: '9', x2: '19', y2: '9' } )
);

/** Pricing — price tag */
export const PricingIcon: ReactElement = svg(
	{},
	el( 'path', {
		d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z',
	} ),
	el( 'circle', {
		cx: '7',
		cy: '7',
		r: '1.5',
		fill: 'currentColor',
		stroke: 'none',
	} )
);

/** Timeline — vertical dots connected by line */
export const TimelineIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '9', y1: '4', x2: '9', y2: '20' } ),
	el( 'circle', {
		cx: '9',
		cy: '7',
		r: '2',
		fill: 'currentColor',
		stroke: 'none',
	} ),
	el( 'circle', {
		cx: '9',
		cy: '12',
		r: '2',
		fill: 'currentColor',
		stroke: 'none',
	} ),
	el( 'circle', {
		cx: '9',
		cy: '17',
		r: '2',
		fill: 'currentColor',
		stroke: 'none',
	} ),
	el( 'line', { x1: '13', y1: '7', x2: '20', y2: '7' } ),
	el( 'line', { x1: '13', y1: '12', x2: '20', y2: '12' } ),
	el( 'line', { x1: '13', y1: '17', x2: '20', y2: '17' } )
);

/** Timeline Item — single dot with line */
export const TimelineItemIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '9', y1: '4', x2: '9', y2: '20' } ),
	el( 'circle', {
		cx: '9',
		cy: '12',
		r: '3',
		fill: 'currentColor',
		stroke: 'none',
	} ),
	el( 'line', { x1: '13', y1: '12', x2: '20', y2: '12' } )
);

/** Navigation — hamburger menu */
export const NavigationIcon: ReactElement = svg(
	{},
	el( 'line', { x1: '3', y1: '6', x2: '21', y2: '6' } ),
	el( 'line', { x1: '3', y1: '12', x2: '21', y2: '12' } ),
	el( 'line', { x1: '3', y1: '18', x2: '21', y2: '18' } )
);

/** Video — play button in rectangle */
export const VideoIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' } ),
	el( 'polygon', { points: '10,8 10,16 17,12' } )
);

/** Container — centered box with dashed margin guides */
export const ContainerIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' } ),
	el( 'line', {
		x1: '3',
		y1: '5',
		x2: '3',
		y2: '19',
		strokeDasharray: '2 2',
		strokeOpacity: '0.4',
	} ),
	el( 'line', {
		x1: '21',
		y1: '5',
		x2: '21',
		y2: '19',
		strokeDasharray: '2 2',
		strokeOpacity: '0.4',
	} ),
	el( 'line', { x1: '7', y1: '9', x2: '17', y2: '9', strokeWidth: '1' } ),
	el( 'line', { x1: '7', y1: '12', x2: '17', y2: '12', strokeWidth: '1' } ),
	el( 'line', { x1: '7', y1: '15', x2: '13', y2: '15', strokeWidth: '1' } )
);

/** Section — full-width horizontal band with inner content lines */
export const SectionIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '1', y: '3', width: '22', height: '18', rx: '2' } ),
	el( 'line', { x1: '1', y1: '9', x2: '23', y2: '9' } ),
	el( 'line', { x1: '1', y1: '15', x2: '23', y2: '15' } ),
	el( 'line', {
		x1: '5',
		y1: '12',
		x2: '19',
		y2: '12',
		strokeWidth: '1',
		strokeOpacity: '0.5',
	} )
);

/** Inner Section — two equal columns side by side */
export const InnerSectionIcon: ReactElement = svg(
	{},
	el( 'rect', { x: '2', y: '4', width: '9', height: '16', rx: '2' } ),
	el( 'rect', { x: '13', y: '4', width: '9', height: '16', rx: '2' } )
);
