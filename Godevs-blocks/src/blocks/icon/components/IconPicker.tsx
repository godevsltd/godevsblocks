import { useState } from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import ICONS, { ICON_CATEGORIES } from '../icons';
import type { IconDefinition } from '../icons';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IconPickerProps {
	selected: string;
	onSelect: ( slug: string ) => void;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const tabBarStyle: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: '4px',
	marginBottom: '8px',
};

const tabStyle = ( active: boolean ): React.CSSProperties => ( {
	padding: '3px 9px',
	borderRadius: '3px',
	border: '1px solid',
	borderColor: active ? '#007cba' : '#ddd',
	background: active ? '#007cba' : 'transparent',
	color: active ? '#fff' : '#444',
	cursor: 'pointer',
	fontSize: '11px',
	fontWeight: active ? 600 : 400,
	lineHeight: '1.6',
} );

const gridStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(7, 1fr)',
	gap: '2px',
	maxHeight: '220px',
	overflowY: 'auto',
	padding: '4px',
	border: '1px solid #e0e0e0',
	borderRadius: '4px',
};

const iconBtnStyle = ( selected: boolean ): React.CSSProperties => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '5px',
	border: '2px solid',
	borderColor: selected ? '#007cba' : 'transparent',
	borderRadius: '4px',
	background: selected ? '#e8f4fd' : 'transparent',
	cursor: 'pointer',
	color: 'currentColor',
	transition: 'background 0.1s, border-color 0.1s',
} );

// ── Component ─────────────────────────────────────────────────────────────────

export function IconPicker( { selected, onSelect }: IconPickerProps ) {
	const [ search, setSearch ] = useState( '' );
	const [ category, setCategory ] = useState< string >( 'all' );

	const filtered: IconDefinition[] = ICONS.filter( ( icon ) => {
		const matchesSearch = search
			? icon.label.toLowerCase().includes( search.toLowerCase() ) ||
			  icon.slug.includes( search.toLowerCase() )
			: true;
		const matchesCategory =
			category === 'all' || icon.category === category;
		return matchesSearch && matchesCategory;
	} );

	return (
		<div>
			<TextControl
				label={ __( 'Search icons', 'goblocks' ) }
				value={ search }
				onChange={ ( v ) => {
					setSearch( v );
					if ( v ) {
						setCategory( 'all' );
					}
				} }
				placeholder={ __( 'home, arrow, star…', 'goblocks' ) }
				// @ts-ignore
				__nextHasNoMarginBottom
			/>

			{ ! search && (
				<div style={ tabBarStyle }>
					{ Object.entries( ICON_CATEGORIES ).map(
						( [ key, label ] ) => (
							<button
								key={ key }
								type="button"
								style={ tabStyle( category === key ) }
								onClick={ () => setCategory( key ) }
							>
								{ label }
							</button>
						)
					) }
				</div>
			) }

			<div style={ gridStyle }>
				{ filtered.map( ( icon ) => (
					<button
						key={ icon.slug }
						type="button"
						title={ icon.label }
						aria-label={ icon.label }
						aria-pressed={ icon.slug === selected }
						onClick={ () => onSelect( icon.slug ) }
						style={ iconBtnStyle( icon.slug === selected ) }
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
							dangerouslySetInnerHTML={ { __html: icon.inner } }
						/>
					</button>
				) ) }

				{ filtered.length === 0 && (
					<p
						style={ {
							gridColumn: '1 / -1',
							textAlign: 'center',
							color: '#888',
							margin: '12px 0',
							fontSize: '12px',
						} }
					>
						{ __( 'No icons match your search.', 'goblocks' ) }
					</p>
				) }
			</div>

			<p style={ { margin: '4px 0 0', fontSize: '11px', color: '#888' } }>
				{ filtered.length }{ ' ' }
				{ filtered.length === 1
					? __( 'icon', 'goblocks' )
					: __( 'icons', 'goblocks' ) }
				{ selected && (
					<span style={ { marginLeft: '8px', color: '#007cba' } }>
						· { __( 'Selected:', 'goblocks' ) } { selected }
					</span>
				) }
			</p>
		</div>
	);
}
