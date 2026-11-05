import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * All DF Builder blocks render on the server. Containers save their inner blocks only.
 *
 * @param {Object}   metadata    block.json.
 * @param {Function} edit        Edit component.
 * @param {boolean}  isContainer Has inner blocks.
 * @param {Object}   extra       Extra settings.
 */
export function registerDfbBlock(
	metadata,
	edit,
	isContainer = false,
	extra = {}
) {
	registerBlockType( metadata.name, {
		...metadata,
		edit,
		save: isContainer ? () => <InnerBlocks.Content /> : () => null,
		...extra,
	} );
}

export const tagOptions = ( tags ) =>
	tags.map( ( t ) => ( { label: `<${ t }>`, value: t } ) );

/**
 * Mirror of the PHP allow-list helper: returns tag if allowed else fallback.
 */
export const safeTag = ( tag, allowed, fallback ) =>
	allowed.includes( tag ) ? tag : fallback;
