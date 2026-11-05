/**
 * DF Builder editor bootstrap. Loaded via enqueue_block_editor_assets, before core blocks register,
 * so the attribute filter reaches them.
 */
import { resolveSelect, select, subscribe, dispatch } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { STORE } from './store';
import './hooks';
import './templates';
import './open-full-editor';
import './copy-styles';
import { registerSources } from './bindings/sources';

// Load global classes once.
resolveSelect( STORE ).getClasses();

registerSources();

// Persist edited global classes whenever the post is saved (not on autosave).
domReady( () => {
	let wasSaving = false;
	subscribe( () => {
		const editor = select( 'core/editor' );
		if ( ! editor ) {
			return;
		}
		const saving = editor.isSavingPost() && ! editor.isAutosavingPost();
		if (
			saving &&
			! wasSaving &&
			select( STORE ).getDirtyClassIds().length
		) {
			dispatch( STORE ).saveDirtyClasses();
		}
		wasSaving = saving;
	} );
} );
