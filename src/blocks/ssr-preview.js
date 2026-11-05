import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

/**
 * Editor preview rendered by the block's render.php. Clicks are disabled so links/forms
 * inside the preview don't navigate away from the editor.
 *
 * @param {Object} props
 * @param {string} props.name       Block name.
 * @param {Object} props.attributes Attributes.
 * @param {Object} props.context    Block context (postId).
 */
export default function SsrPreview( { name, attributes, context } ) {
	const blockProps = useBlockProps( { className: 'dfb-ssr' } );
	// The style attribute is applied to this wrapper in the editor; don't send it to the server.
	const { dfb, metadata, ...rest } = attributes; // eslint-disable-line no-unused-vars
	return (
		<div { ...blockProps }>
			<div className="dfb-ssr__inner" inert="">
				<ServerSideRender
					block={ name }
					attributes={ rest }
					urlQueryArgs={
						context?.postId ? { post_id: context.postId } : {}
					}
					LoadingResponsePlaceholder={ Spinner }
				/>
			</div>
		</div>
	);
}
