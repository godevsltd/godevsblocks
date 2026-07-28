import { useState } from '@wordpress/element';
import {
	Button,
	TextControl,
	Popover,
	ColorPicker,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesStore } from '@store/globalStylesStore';
import type { ColorPaletteEntry } from '../../types/block';

// ── Component ─────────────────────────────────────────────────────────────────

export function ColorPaletteEditor() {
	const palette = useGlobalStylesStore( ( s ) => s.colorPalette );
	const setColorPalette = useGlobalStylesStore( ( s ) => s.setColorPalette );

	const [ openPickerIdx, setOpenPickerIdx ] = useState< number | null >(
		null
	);

	const updateEntry = (
		idx: number,
		field: keyof ColorPaletteEntry,
		value: string
	) => {
		setColorPalette(
			palette.map( ( entry, i ) =>
				i === idx ? { ...entry, [ field ]: value } : entry
			)
		);
	};

	const addEntry = () => {
		const n = palette.length + 1;
		setColorPalette( [
			...palette,
			{ slug: `color-${ n }`, name: `Color ${ n }`, color: '#000000' },
		] );
	};

	const removeEntry = ( idx: number ) => {
		setColorPalette( palette.filter( ( _, i ) => i !== idx ) );
		if ( openPickerIdx === idx ) {
			setOpenPickerIdx( null );
		}
	};

	return (
		<div className="gb-palette-editor">
			<p className="gb-palette-editor__description">
				{ __(
					'Define a global color palette. Colors appear in the block editor color picker and are available as CSS custom properties (e.g., --gb-color-primary).',
					'goblocks'
				) }
			</p>

			{ palette.length > 0 && (
				<div className="gb-palette-editor__header-row">
					<span>{ __( 'Color', 'goblocks' ) }</span>
					<span>{ __( 'Slug', 'goblocks' ) }</span>
					<span>{ __( 'Name', 'goblocks' ) }</span>
					<span>{ __( 'Value', 'goblocks' ) }</span>
				</div>
			) }

			<div className="gb-palette-editor__list">
				{ palette.map( ( entry, idx ) => (
					<div key={ idx } className="gb-palette-editor__row">
						{ /* Color swatch — opens picker on click */ }
						<button
							type="button"
							className="gb-palette-editor__swatch"
							onClick={ () =>
								setOpenPickerIdx(
									openPickerIdx === idx ? null : idx
								)
							}
							aria-label={ __( 'Pick color', 'goblocks' ) }
							aria-pressed={ openPickerIdx === idx }
						>
							{ /* inline style here is a display necessity for a dynamic color swatch */ }
							<span
								className="gb-palette-editor__swatch-inner"
								style={ { backgroundColor: entry.color } } // eslint-disable-line react/forbid-component-props
							/>
						</button>

						{ openPickerIdx === idx && (
							<Popover
								placement="bottom-start"
								onClose={ () => setOpenPickerIdx( null ) }
							>
								<ColorPicker
									color={ entry.color }
									onChange={ ( color ) =>
										updateEntry( idx, 'color', color )
									}
									enableAlpha={ false }
								/>
							</Popover>
						) }

						<TextControl
							label={ __( 'Slug', 'goblocks' ) }
							hideLabelFromVision
							value={ entry.slug }
							onChange={ ( v ) => updateEntry( idx, 'slug', v ) }
							placeholder="primary"
							// @ts-ignore — prop available in WP 6.4+
							__nextHasNoMarginBottom
						/>

						<TextControl
							label={ __( 'Name', 'goblocks' ) }
							hideLabelFromVision
							value={ entry.name }
							onChange={ ( v ) => updateEntry( idx, 'name', v ) }
							placeholder="Primary"
							// @ts-ignore
							__nextHasNoMarginBottom
						/>

						<TextControl
							label={ __( 'Hex value', 'goblocks' ) }
							hideLabelFromVision
							value={ entry.color }
							onChange={ ( v ) => updateEntry( idx, 'color', v ) }
							placeholder="#000000"
							// @ts-ignore
							__nextHasNoMarginBottom
						/>

						<Button
							isDestructive
							variant="tertiary"
							onClick={ () => removeEntry( idx ) }
							aria-label={ __( 'Remove color', 'goblocks' ) }
						>
							{ __( 'Remove', 'goblocks' ) }
						</Button>
					</div>
				) ) }
			</div>

			<Button variant="secondary" onClick={ addEntry }>
				{ __( '+ Add Color', 'goblocks' ) }
			</Button>
		</div>
	);
}
