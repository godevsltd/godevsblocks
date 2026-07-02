import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { ShapeIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: ShapeIcon,
	edit: Edit,
	save,
} );
