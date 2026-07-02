import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { SeparatorIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: SeparatorIcon,
	edit: Edit,
	save,
} );
