import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { ProgressBarIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: ProgressBarIcon,
	edit: Edit,
	save,
} );
