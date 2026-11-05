/**
 * DF Builder Full Editor bootstrap.
 */
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import { addFilter } from '@wordpress/hooks';
import { registerCoreBlocks } from '@wordpress/block-library';
import { MediaUpload } from '@wordpress/media-utils';
import App from './app';
import './app.scss';

domReady( () => {
	const root = document.getElementById( 'dfb-full-editor' );
	const config = window.dfbFullEditor;
	if ( ! root || ! config ) {
		return;
	}
	// Media library modal for MediaUpload components (edit-post does the same).
	addFilter(
		'editor.MediaUpload',
		'dfb/full-editor/replace-media-upload',
		() => MediaUpload
	);
	registerCoreBlocks();
	createRoot( root ).render( <App { ...config } /> );
} );
