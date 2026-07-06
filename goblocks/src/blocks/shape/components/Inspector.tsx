import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	RangeControl,
	ColorPicker,
	ButtonGroup,
	Button,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '../../../components/ui/InspectorTabs';
import { SpacingPanel } from '../../../components/panels/SpacingPanel';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';
import type { BlockStyles } from '../../../types/styles';
import SHAPES, { buildShapePreview } from '../shapes';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShapeAttributes {
	uniqueId: string;
	styles: BlockStyles;
	shapeSlug: string;
	fillColor: string;
	fillType: string;
	gradientFrom: string;
	gradientTo: string;
	gradientAngle: number;
	shapeOpacity: number;
	shapeHeight: number;
	flipX: boolean;
	flipY: boolean;
	placement: string;
	globalClasses: string[];
	generatedCss: string;
	blockVersion: number;
}

interface ShapeInspectorProps {
	attributes: ShapeAttributes;
	setAttributes: ( attrs: Partial< ShapeAttributes > ) => void;
}

// ── Visual shape picker grid ───────────────────────────────────────────────────

function ShapePickerGrid( {
	value,
	onChange,
}: {
	value: string;
	onChange: ( slug: string ) => void;
} ) {
	return (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 1fr)',
				gap: '6px',
				marginBottom: '12px',
			} }
		>
			{ SHAPES.map( ( shape ) => {
				const isSelected = shape.slug === value;
				return (
					<button
						key={ shape.slug }
						title={ shape.label }
						onClick={ () => onChange( shape.slug ) }
						style={ {
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '4px',
							padding: '6px 4px 4px',
							border: isSelected
								? '2px solid #007cba'
								: '2px solid #ddd',
							borderRadius: '6px',
							background: isSelected ? '#e8f4fb' : '#f9f9f9',
							cursor: 'pointer',
							color: '#1e1e1e',
							overflow: 'hidden',
						} }
					>
						<div
							style={ {
								width: '100%',
								color: isSelected ? '#007cba' : '#555',
								lineHeight: 0,
							} }
							// Shape preview SVG.
							dangerouslySetInnerHTML={ {
								__html: buildShapePreview( shape ),
							} }
						/>
						<span
							style={ {
								fontSize: '9px',
								lineHeight: 1.2,
								textAlign: 'center',
								wordBreak: 'break-word',
							} }
						>
							{ shape.label }
						</span>
					</button>
				);
			} ) }
		</div>
	);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PLACEMENT_OPTIONS = [
	{ label: __( 'Bottom of section above', 'goblocks' ), value: 'bottom' },
	{ label: __( 'Top of section below', 'goblocks' ), value: 'top' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ShapeInspector( {
	attributes,
	setAttributes,
}: ShapeInspectorProps ) {
	const {
		styles,
		shapeSlug,
		fillColor,
		fillType,
		gradientFrom,
		gradientTo,
		gradientAngle,
		shapeOpacity,
		shapeHeight,
		flipX,
		flipY,
		placement,
		globalClasses,
	} = attributes;

	const responsive = useResponsiveStyles( styles, ( patch ) =>
		setAttributes( { styles: patch.styles as BlockStyles } )
	);

	const isGradient = fillType === 'gradient';

	const stylesContent = (
		<>
			<PanelBody title={ __( 'Shape', 'goblocks' ) } initialOpen>
				<ShapePickerGrid
					value={ shapeSlug }
					onChange={ ( slug ) =>
						setAttributes( { shapeSlug: slug } )
					}
				/>

				<NumberControl
					label={ __( 'Height (px)', 'goblocks' ) }
					value={ shapeHeight }
					min={ 10 }
					max={ 400 }
					onChange={ ( val ) =>
						setAttributes( {
							shapeHeight:
								parseInt( String( val ?? 80 ), 10 ) || 80,
						} )
					}
					// @ts-ignore
					__next40pxDefaultSize
				/>

				<div style={ { height: '8px' } } />

				<SelectControl
					label={ __( 'Placement', 'goblocks' ) }
					value={ placement }
					options={ PLACEMENT_OPTIONS }
					onChange={ ( val ) => setAttributes( { placement: val } ) }
					// @ts-ignore
					__nextHasNoMarginBottom
				/>

				<div style={ { height: '8px' } } />

				<div style={ { display: 'flex', gap: '16px' } }>
					<ToggleControl
						label={ __( 'Flip horizontal', 'goblocks' ) }
						checked={ flipX }
						onChange={ ( val ) => setAttributes( { flipX: val } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Flip vertical', 'goblocks' ) }
						checked={ flipY }
						onChange={ ( val ) => setAttributes( { flipY: val } ) }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</div>
			</PanelBody>

			<PanelBody title={ __( 'Fill', 'goblocks' ) } initialOpen={ false }>
				<div style={ { marginBottom: '12px' } }>
					<ButtonGroup>
						<Button
							variant={ ! isGradient ? 'primary' : 'secondary' }
							onClick={ () =>
								setAttributes( { fillType: 'solid' } )
							}
							size="compact"
						>
							{ __( 'Solid', 'goblocks' ) }
						</Button>
						<Button
							variant={ isGradient ? 'primary' : 'secondary' }
							onClick={ () =>
								setAttributes( { fillType: 'gradient' } )
							}
							size="compact"
						>
							{ __( 'Gradient', 'goblocks' ) }
						</Button>
					</ButtonGroup>
				</div>

				{ ! isGradient ? (
					<ColorPicker
						color={ fillColor }
						onChange={ ( val: string ) =>
							setAttributes( { fillColor: val } )
						}
						enableAlpha
						defaultValue="#ffffff"
					/>
				) : (
					<>
						<p
							style={ {
								margin: '0 0 6px',
								fontWeight: 600,
								fontSize: '11px',
							} }
						>
							{ __( 'From color', 'goblocks' ) }
						</p>
						<ColorPicker
							color={ gradientFrom || '#4f46e5' }
							onChange={ ( val: string ) =>
								setAttributes( { gradientFrom: val } )
							}
							enableAlpha
							defaultValue="#4f46e5"
						/>
						<p
							style={ {
								margin: '12px 0 6px',
								fontWeight: 600,
								fontSize: '11px',
							} }
						>
							{ __( 'To color', 'goblocks' ) }
						</p>
						<ColorPicker
							color={ gradientTo || '#7c3aed' }
							onChange={ ( val: string ) =>
								setAttributes( { gradientTo: val } )
							}
							enableAlpha
							defaultValue="#7c3aed"
						/>
						<div style={ { marginTop: '8px' } }>
							<RangeControl
								label={ __( 'Angle (°)', 'goblocks' ) }
								value={ gradientAngle }
								onChange={ ( val ) =>
									setAttributes( {
										gradientAngle: val ?? 90,
									} )
								}
								min={ 0 }
								max={ 360 }
								step={ 5 }
								// @ts-ignore
								__nextHasNoMarginBottom
							/>
						</div>
					</>
				) }

				<div style={ { marginTop: '12px' } }>
					<RangeControl
						label={ __( 'Opacity (%)', 'goblocks' ) }
						value={ shapeOpacity ?? 100 }
						onChange={ ( val ) =>
							setAttributes( { shapeOpacity: val ?? 100 } )
						}
						min={ 5 }
						max={ 100 }
						step={ 5 }
						// @ts-ignore
						__nextHasNoMarginBottom
					/>
				</div>
			</PanelBody>

			<SpacingPanel styles={ styles } responsive={ responsive } />
		</>
	);

	const advancedContent = (
		<PanelBody
			title={ __( 'CSS Classes', 'goblocks' ) }
			initialOpen={ false }
		>
			<TextControl
				label={ __( 'Additional CSS classes', 'goblocks' ) }
				value={ ( globalClasses ?? [] ).join( ' ' ) }
				help={ __(
					'Space-separated list of extra classes.',
					'goblocks'
				) }
				onChange={ ( val ) =>
					setAttributes( {
						globalClasses: val.split( /\s+/ ).filter( Boolean ),
					} )
				}
				// @ts-ignore
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);

	return (
		<InspectorControls>
			<InspectorTabs
				stylesContent={ stylesContent }
				advancedContent={ advancedContent }
			/>
		</InspectorControls>
	);
}
