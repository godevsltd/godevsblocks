import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import transforms from './transforms';
import { ButtonIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: ButtonIcon,
	edit: Edit,
	save,
	transforms,
} );
