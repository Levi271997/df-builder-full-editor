/**
 * "Edit with DF Builder" button in the regular block editor's post sidebar.
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo, store as editorStore } from '@wordpress/editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';

function OpenFullEditor() {
	const { postId, postType, isNew, isDirty } = useSelect( ( select ) => {
		const ed = select( editorStore );
		return {
			postId: ed.getCurrentPostId(),
			postType: ed.getCurrentPostType(),
			isNew: ed.isEditedPostNew(),
			isDirty: ed.isEditedPostDirty(),
		};
	}, [] );
	const { savePost } = useDispatch( editorStore );
	const types = window.dfbData?.fullEditorTypes || [];
	if ( ! postId || ! types.includes( postType ) ) {
		return null;
	}
	const url = addQueryArgs( window.dfbData.fullEditorUrl, { post: postId } );
	const open = async () => {
		// Unsaved/new posts must exist on the server before the full editor can load them.
		if ( isNew || isDirty ) {
			await savePost();
		}
		window.location.href = url;
	};
	return (
		<PluginPostStatusInfo>
			<Button
				variant="primary"
				onClick={ open }
				style={ { width: '100%', justifyContent: 'center' } }
			>
				{ __( 'Edit with DF Builder', 'df-builder' ) }
			</Button>
		</PluginPostStatusInfo>
	);
}

registerPlugin( 'dfb-open-full-editor', { render: OpenFullEditor } );
