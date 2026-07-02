import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { IconBlockIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: IconBlockIcon,
	edit: Edit,
	save,
} );
