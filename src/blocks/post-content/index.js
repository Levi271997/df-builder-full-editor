import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit() {
	const blockProps = useBlockProps( {
		className: 'dfb-post-content dfb-placeholder',
	} );
	return (
		<div { ...blockProps }>
			<strong>{ __( 'Post Content', 'df-builder' ) }</strong>
			<p>
				{ __(
					'The content of the page or post being viewed appears here.',
					'df-builder'
				) }
			</p>
		</div>
	);
}

registerDfbBlock( metadata, Edit );
