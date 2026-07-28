import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { LottieIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: LottieIcon,
	edit: Edit,
	save,
} );
