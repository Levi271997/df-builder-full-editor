/**
 * Editor-side registration of binding sources, so bound core blocks show a preview value
 * instead of their static content. Requires WP 6.7+ (`registerBlockBindingsSource`); on 6.6
 * core falls back to showing the source label.
 */
import * as blocks from '@wordpress/blocks';
import { store as coreStore } from '@wordpress/core-data';
import { SOURCES, bindingLabel } from './config';

function postPreview( select, context, field ) {
	if ( ! context?.postId || ! context?.postType ) {
		return null;
	}
	const rec = select( coreStore ).getEditedEntityRecord(
		'postType',
		context.postType,
		context.postId
	);
	if ( ! rec ) {
		return null;
	}
	switch ( field ) {
		case 'title':
			return typeof rec.title === 'string' ? rec.title : rec.title?.raw;
		case 'excerpt':
			return typeof rec.excerpt === 'string'
				? rec.excerpt
				: rec.excerpt?.raw;
		case 'id':
			return String( context.postId );
		case 'permalink':
			return rec.link;
	}
	return null;
}

export function registerSources() {
	const register = blocks.registerBlockBindingsSource;
	if ( typeof register !== 'function' ) {
		return;
	}
	for ( const [ name, src ] of Object.entries( SOURCES ) ) {
		if ( src.requiresAcf && ! window.dfbData?.acfActive ) {
			continue;
		}
		try {
			register( {
				name,
				label: src.label,
				usesContext: [ 'postId', 'postType' ],
				getValues( { select, context, bindings } ) {
					const out = {};
					for ( const [ attr, binding ] of Object.entries(
						bindings
					) ) {
						const preview =
							name === 'dfb/post'
								? postPreview(
										select,
										context,
										binding.args?.field
								  )
								: null;
						out[ attr ] =
							preview ||
							( attr === 'url'
								? ''
								: `{ ${ bindingLabel( {
										source: name,
										args: binding.args,
								  } ) } }` );
					}
					return out;
				},
				canUserEditValue: () => false,
			} );
		} catch ( e ) {
			// Already registered (e.g. by server) — ignore.
		}
	}
}
