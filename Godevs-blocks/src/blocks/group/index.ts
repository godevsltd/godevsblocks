// @ts-ignore
import {
	registerBlockType,
	registerBlockStyle,
	registerBlockVariation,
} from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';

registerBlockType( metadata.name, {
	...metadata,
	edit: Edit,
	save,
	// @ts-ignore
	deprecated: [
		{
			save: () => null,
		},
	],
} );

// ── Block styles — visual variants via is-style-* class ───────────────────

registerBlockStyle( 'goblocks/group', {
	name: 'default',
	label: __( 'Default', 'goblocks' ),
	isDefault: true,
} );
registerBlockStyle( 'goblocks/group', {
	name: 'card',
	label: __( 'Card', 'goblocks' ),
} );
registerBlockStyle( 'goblocks/group', {
	name: 'bordered',
	label: __( 'Bordered', 'goblocks' ),
} );
registerBlockStyle( 'goblocks/group', {
	name: 'shadow',
	label: __( 'Shadow', 'goblocks' ),
} );
registerBlockStyle( 'goblocks/group', {
	name: 'glass',
	label: __( 'Glass', 'goblocks' ),
} );
registerBlockStyle( 'goblocks/group', {
	name: 'pill',
	label: __( 'Pill', 'goblocks' ),
} );

// ── Block variations — layout presets in the block inserter ───────────────

registerBlockVariation( 'goblocks/group', {
	name: 'section',
	title: __( 'Section', 'goblocks' ),
	description: __(
		'Full-width page section with semantic <section> tag.',
		'goblocks'
	),
	attributes: { tagName: 'section', layout: 'default' },
	scope: [ 'inserter', 'block' ],
	isActive: [ 'tagName' ],
} );

registerBlockVariation( 'goblocks/group', {
	name: 'stack',
	title: __( 'Stack', 'goblocks' ),
	description: __( 'Vertical flex column for stacked content.', 'goblocks' ),
	attributes: { tagName: 'div', layout: 'stack' },
	scope: [ 'inserter', 'block' ],
	isActive: [ 'layout' ],
} );

// ── Column layout variations — auto-insert Column children on insert ───────

registerBlockVariation( 'goblocks/group', {
	name: 'two-columns',
	title: __( '2 Columns', 'goblocks' ),
	description: __( 'Two equal side-by-side columns.', 'goblocks' ),
	attributes: {
		tagName: 'div',
		layout: 'row',
		styles: {
			layout: {
				display: { base: 'flex' },
				flexDirection: { base: 'row' },
				flexWrap: { base: 'wrap' },
				alignItems: { base: 'stretch' },
			},
			spacing: { gap: { base: '24px' } },
		},
	},
	innerBlocks: [
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
	],
	scope: [ 'inserter', 'block' ],
	isActive: ( blockAttrs: Record< string, unknown > ) =>
		blockAttrs.layout === 'row',
} );

registerBlockVariation( 'goblocks/group', {
	name: 'three-columns',
	title: __( '3 Columns', 'goblocks' ),
	description: __( 'Three equal side-by-side columns.', 'goblocks' ),
	attributes: {
		tagName: 'div',
		layout: 'row',
		styles: {
			layout: {
				display: { base: 'flex' },
				flexDirection: { base: 'row' },
				flexWrap: { base: 'wrap' },
				alignItems: { base: 'stretch' },
			},
			spacing: { gap: { base: '20px' } },
		},
	},
	innerBlocks: [
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
	],
	scope: [ 'inserter', 'block' ],
} );

registerBlockVariation( 'goblocks/group', {
	name: 'four-columns',
	title: __( '4 Columns', 'goblocks' ),
	description: __( 'Four equal columns using CSS grid.', 'goblocks' ),
	attributes: {
		tagName: 'div',
		layout: 'grid',
		styles: {
			layout: {
				display: { base: 'grid' },
				gridTemplateColumns: { base: 'repeat(4, 1fr)' },
			},
			spacing: { gap: { base: '16px' } },
		},
	},
	innerBlocks: [
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
		[ 'goblocks/column', {} ],
	],
	scope: [ 'inserter', 'block' ],
	isActive: ( blockAttrs: Record< string, unknown > ) =>
		blockAttrs.layout === 'grid',
} );
