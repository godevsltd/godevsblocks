import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block' as const,
			blocks: [ 'core/heading' ],
			transform( attributes: Record< string, unknown > ) {
				const level =
					typeof attributes.level === 'number' ? attributes.level : 2;
				const styles: Record< string, unknown > = {};

				if ( attributes.textAlign ) {
					styles.typography = {
						textAlign: { base: attributes.textAlign as string },
					};
				}

				return createBlock( 'goblocks/heading', {
					tagName: `h${ level }`,
					content: attributes.content ?? '',
					anchor: attributes.anchor ?? '',
					styles,
				} );
			},
		},
		{
			type: 'block' as const,
			blocks: [ 'core/paragraph' ],
			transform( attributes: Record< string, unknown > ) {
				const styles: Record< string, unknown > = {};

				if ( attributes.textAlign ) {
					styles.typography = {
						textAlign: { base: attributes.textAlign as string },
					};
				}

				return createBlock( 'goblocks/heading', {
					tagName: 'h2',
					content: attributes.content ?? '',
					styles,
				} );
			},
		},
	],
	to: [
		{
			type: 'block' as const,
			blocks: [ 'core/heading' ],
			transform( attributes: Record< string, unknown > ) {
				const tag =
					typeof attributes.tagName === 'string'
						? attributes.tagName
						: 'h2';
				const level = parseInt( tag.slice( 1 ), 10 ) || 2;

				return createBlock( 'core/heading', {
					level,
					content: attributes.content ?? '',
					anchor: attributes.anchor ?? '',
				} );
			},
		},
	],
};

export default transforms;
