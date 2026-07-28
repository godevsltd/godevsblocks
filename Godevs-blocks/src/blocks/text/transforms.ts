import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
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
				return createBlock( 'goblocks/text', {
					content: attributes.content ?? '',
					styles,
				} );
			},
		},
	],
	to: [
		{
			type: 'block' as const,
			blocks: [ 'core/paragraph' ],
			transform( attributes: Record< string, unknown > ) {
				return createBlock( 'core/paragraph', {
					content: attributes.content ?? '',
				} );
			},
		},
	],
};

export default transforms;
