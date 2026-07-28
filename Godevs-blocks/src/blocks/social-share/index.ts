import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { Edit } from './edit';
import { save } from './save';
import { SocialShareIcon } from '../../utils/blockIcons';

registerBlockType( metadata.name, {
	...metadata,
	icon: SocialShareIcon,
	edit: Edit,
	save,
} );
