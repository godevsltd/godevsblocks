import { InnerBlocks } from '@wordpress/block-editor';

export function save() {
	{
		/* @ts-ignore -- InnerBlocks.Content exists at runtime */
	}
	return <InnerBlocks.Content />;
}
