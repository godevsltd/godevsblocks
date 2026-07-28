export interface ShapeDefinition {
	slug: string;
	label: string;
	inner: string;
	width: number;
	height: number;
}

const SHAPES: ShapeDefinition[] = [
	{
		slug: 'wave',
		label: 'Wave',
		width: 1440,
		height: 80,
		inner: '<path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'wave-2',
		label: 'Double Wave',
		width: 1440,
		height: 80,
		inner: '<path d="M0,20 C180,60 360,-20 540,20 C720,60 900,-20 1080,20 C1260,60 1350,0 1440,20 L1440,80 L0,80 Z" fill="currentColor" opacity="0.4"/><path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'triangle',
		label: 'Triangle',
		width: 1440,
		height: 80,
		inner: '<path d="M720,0 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'triangle-asymmetric',
		label: 'Triangle Asym.',
		width: 1440,
		height: 80,
		inner: '<path d="M0,0 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'diagonal',
		label: 'Diagonal',
		width: 1440,
		height: 80,
		inner: '<path d="M0,80 L1440,0 L1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'curved',
		label: 'Curved',
		width: 1440,
		height: 80,
		inner: '<path d="M0,80 Q720,-40 1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'curved-up',
		label: 'Curved Up',
		width: 1440,
		height: 80,
		inner: '<path d="M0,0 Q720,120 1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'mountains',
		label: 'Mountains',
		width: 1440,
		height: 80,
		inner: '<path d="M0,80 L360,10 L720,55 L1080,10 L1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'staircase',
		label: 'Staircase',
		width: 1440,
		height: 80,
		inner: '<path d="M0,80 L0,60 L360,60 L360,40 L720,40 L720,20 L1080,20 L1080,0 L1440,0 L1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'tilt',
		label: 'Tilt',
		width: 1440,
		height: 80,
		inner: '<path d="M1440,0 L0,80 L0,0 Z" fill="currentColor" opacity="0.4"/><path d="M0,80 L1440,0 L1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'clouds',
		label: 'Clouds',
		width: 1440,
		height: 80,
		inner: '<path d="M0,60 C120,60 120,20 240,20 C360,20 360,60 480,60 C600,60 600,20 720,20 C840,20 840,60 960,60 C1080,60 1080,20 1200,20 C1320,20 1320,60 1440,60 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'zigzag',
		label: 'Zigzag',
		width: 1440,
		height: 80,
		inner: '<path d="M0,40 L120,0 L240,40 L360,0 L480,40 L600,0 L720,40 L840,0 L960,40 L1080,0 L1200,40 L1320,0 L1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'fan',
		label: 'Fan',
		width: 1440,
		height: 80,
		inner: '<path d="M0,80 C0,40 360,0 720,0 C1080,0 1440,40 1440,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'split',
		label: 'Split',
		width: 1440,
		height: 80,
		inner: '<path d="M0,0 L720,80 L1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
	{
		slug: 'arrow',
		label: 'Arrow Down',
		width: 1440,
		height: 80,
		inner: '<path d="M0,0 L720,80 L1440,0 L1440,0 L0,0 Z" fill="currentColor"/>',
	},
	{
		slug: 'swoosh',
		label: 'Swoosh',
		width: 1440,
		height: 80,
		inner: '<path d="M0,0 C400,80 1040,80 1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
	},
];

export default SHAPES;

export const SHAPE_MAP: Record< string, ShapeDefinition > = Object.fromEntries(
	SHAPES.map( ( s ) => [ s.slug, s ] )
);

/**
 * Build an SVG string from a shape definition with solid or gradient fill.
 * @param shape
 * @param color
 * @param height
 * @param flipX
 * @param flipY
 * @param gradientFrom
 * @param gradientTo
 * @param gradientAngle
 * @param gradId
 */
export function buildShapeSvg(
	shape: ShapeDefinition,
	color = 'currentColor',
	height = shape.height,
	flipX = false,
	flipY = false,
	gradientFrom = '',
	gradientTo = '',
	gradientAngle = 90,
	gradId = ''
): string {
	const transform =
		flipX || flipY
			? ` transform="scale(${ flipX ? -1 : 1 },${
					flipY ? -1 : 1
			  }) translate(${ flipX ? -shape.width : 0 },${
					flipY ? -height : 0
			  })"`
			: '';

	const useGradient = gradientFrom && gradientTo && gradId;

	let defs = '';
	let fillStyle: string;

	if ( useGradient ) {
		// Convert CSS angle (0° = up) to SVG x1/y1/x2/y2 coordinates.
		const rad = ( ( gradientAngle - 90 ) * Math.PI ) / 180;
		const x2 = 0.5 + 0.5 * Math.cos( rad );
		const y2 = 0.5 + 0.5 * Math.sin( rad );
		const x1 = 1 - x2;
		const y1 = 1 - y2;
		defs = `<defs><linearGradient id="${ gradId }" x1="${ x1.toFixed(
			4
		) }" y1="${ y1.toFixed( 4 ) }" x2="${ x2.toFixed(
			4
		) }" y2="${ y2.toFixed(
			4
		) }"><stop offset="0%" stop-color="${ gradientFrom }"/><stop offset="100%" stop-color="${ gradientTo }"/></linearGradient></defs>`;
		fillStyle = `color:url(#${ gradId })`;
	} else {
		fillStyle = `color:${ color }`;
	}

	// Replace fill="currentColor" in inner paths with gradient if needed.
	const innerHtml = useGradient
		? shape.inner.replace(
				/fill="currentColor"/g,
				`fill="url(#${ gradId })"`
		  )
		: shape.inner;

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ shape.width } ${ shape.height }" preserveAspectRatio="none" width="100%" height="${ height }" aria-hidden="true" style="${ fillStyle };display:block">${ defs }<g${ transform }>${ innerHtml }</g></svg>`;
}

/**
 * Build a tiny preview SVG for the shape picker grid (no color applied).
 * @param shape
 */
export function buildShapePreview( shape: ShapeDefinition ): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ shape.width } ${ shape.height }" preserveAspectRatio="none" width="100%" height="32" aria-hidden="true" style="display:block;color:currentColor">${ shape.inner }</svg>`;
}
