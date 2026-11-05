import { useMemo } from '@wordpress/element';
import { uploadMedia } from '@wordpress/media-utils';
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- same helper the core editor uses.
import { __experimentalFetchLinkSuggestions as fetchLinkSuggestions } from '@wordpress/core-data';

/**
 * Block editor settings from PHP + the client-side callbacks the editor package normally adds.
 *
 * @param {Object} serverSettings Output of get_block_editor_settings().
 * @param {number} postId         Post being edited (attached to uploads).
 */
export default function useEditorSettings( serverSettings, postId ) {
	return useMemo(
		() => ( {
			...serverSettings,
			mediaUpload( { filesList, onFileChange, allowedTypes, onError } ) {
				uploadMedia( {
					filesList,
					onFileChange,
					allowedTypes,
					onError: ( err ) => onError?.( err.message ),
					maxUploadFileSize: serverSettings.maxUploadFileSize,
					wpAllowedMimeTypes: serverSettings.allowedMimeTypes,
					additionalData: { post: postId },
				} );
			},
			__experimentalFetchLinkSuggestions: ( search, opts ) =>
				fetchLinkSuggestions( search, opts, serverSettings ),
			// Our own panels replace the editor's inserter/list chrome.
			hasFixedToolbar: false,
			focusMode: false,
		} ),
		[ serverSettings, postId ]
	);
}
