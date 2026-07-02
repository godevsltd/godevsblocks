import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { NavigationIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: NavigationIcon,
	edit: Edit,
	save,
} );
