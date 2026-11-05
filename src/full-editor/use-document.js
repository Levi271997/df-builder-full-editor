/**
 * Load / edit / save the post being built, through core-data entities (undo/redo included).
 */
import {
	useSelect,
	useDispatch,
	dispatch as wpDispatch,
} from '@wordpress/data';
import { store as coreStore, useEntityBlockEditor } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from '@wordpress/element';

export default function useDocument( postType, postId ) {
	const { record, isLoaded, isDirty, hasUndo, hasRedo } = useSelect(
		( select ) => {
			const core = select( coreStore );
			// Triggers the fetch; edited record = saved record + local edits.
			core.getEntityRecord( 'postType', postType, postId );
			const rec = core.getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			return {
				record: rec,
				isLoaded: core.hasFinishedResolution( 'getEntityRecord', [
					'postType',
					postType,
					postId,
				] ),
				isDirty: core.hasEditsForEntityRecord(
					'postType',
					postType,
					postId
				),
				hasUndo: core.hasUndo(),
				hasRedo: core.hasRedo(),
			};
		},
		[ postType, postId ]
	);
	const classesDirty = useSelect(
		( select ) => !! select( 'dfb/builder' )?.getDirtyClassIds?.().length,
		[]
	);

	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		'postType',
		postType,
		{
			id: postId,
		}
	);
	const { saveEditedEntityRecord, editEntityRecord, undo, redo } =
		useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );
	const [ isSaving, setSaving ] = useState( false );

	const edit = useCallback(
		( edits ) => editEntityRecord( 'postType', postType, postId, edits ),
		[ postType, postId, editEntityRecord ]
	);

	const save = useCallback(
		async ( extraEdits ) => {
			setSaving( true );
			try {
				if ( extraEdits ) {
					await editEntityRecord(
						'postType',
						postType,
						postId,
						extraEdits
					);
				}
				await Promise.all( [
					saveEditedEntityRecord( 'postType', postType, postId, {
						throwOnError: true,
					} ),
					wpDispatch( 'dfb/builder' )?.saveDirtyClasses?.(),
				] );
				createSuccessNotice( __( 'Saved.', 'df-builder' ), {
					type: 'snackbar',
					id: 'dfb-save',
				} );
			} catch ( e ) {
				createErrorNotice(
					e?.message || __( 'Saving failed.', 'df-builder' ),
					{
						type: 'snackbar',
						id: 'dfb-save',
					}
				);
			}
			setSaving( false );
		},
		[
			postType,
			postId,
			saveEditedEntityRecord,
			editEntityRecord,
			createSuccessNotice,
			createErrorNotice,
		]
	);

	return {
		record,
		isLoaded,
		isDirty: isDirty || classesDirty,
		isSaving,
		hasUndo,
		hasRedo,
		blocks,
		onInput,
		onChange,
		edit,
		save,
		undo,
		redo,
	};
}
