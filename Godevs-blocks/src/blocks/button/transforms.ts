import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block' as const,
			blocks: [ 'core/button' ],
			transform( attributes: Record< string, unknown > ) {
				return createBlock( 'goblocks/button', {
					text: attributes.text ?? '',
					href: attributes.url ?? '',
					target: attributes.linkTarget ?? '_self',
					rel: attributes.rel ?? '',
				} );
			},
		},
	],
	to: [
		{
			type: 'block' as const,
			blocks: [ 'core/button' ],
			transform( attributes: Record< string, unknown > ) {
				return createBlock( 'core/button', {
					text: attributes.text ?? '',
					url: attributes.href ?? '',
					linkTarget: attributes.target ?? '_self',
					rel: attributes.rel ?? '',
				} );
			},
		},
	],
};

export default transforms;
