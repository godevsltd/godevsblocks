import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block' as const,
			blocks: [ 'core/image' ],
			transform( attributes: Record< string, unknown > ) {
				return createBlock( 'goblocks/image', {
					mediaId: attributes.id ?? 0,
					mediaUrl: attributes.url ?? '',
					mediaAlt: attributes.alt ?? '',
					sizeSlug: attributes.sizeSlug ?? 'large',
					caption: attributes.caption ?? '',
					showCaption: !! attributes.caption,
					href: attributes.href ?? '',
					target: attributes.linkTarget ?? '_self',
					rel: attributes.rel ?? '',
				} );
			},
		},
	],
	to: [
		{
			type: 'block' as const,
			blocks: [ 'core/image' ],
			transform( attributes: Record< string, unknown > ) {
				return createBlock( 'core/image', {
					id: attributes.mediaId ?? 0,
					url: attributes.mediaUrl ?? '',
					alt: attributes.mediaAlt ?? '',
					sizeSlug: attributes.sizeSlug ?? 'large',
					caption: attributes.caption ?? '',
					href: attributes.href ?? '',
					linkTarget: attributes.target ?? '_self',
					rel: attributes.rel ?? '',
				} );
			},
		},
	],
};

export default transforms;
