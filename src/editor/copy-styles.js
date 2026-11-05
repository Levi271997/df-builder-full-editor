/**
 * Copy / paste / clear DF Builder styles via the block "⋮" menu (Oxygen-style).
 * The clipboard is per-browser (localStorage), so it also works across pages and tabs.
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { MenuItem } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from '@wordpress/element';
import { isSupported } from './supported-blocks';
import { newUid } from '../shared/css-generator';

const KEY = 'dfb-style-clipboard';

function readClipboard() {
	try {
		const v = JSON.parse( window.localStorage.getItem( KEY ) || 'null' );
		return v && typeof v === 'object' ? v : null;
	} catch ( e ) {
		return null;
	}
}

function writeClipboard( value ) {
	try {
		window.localStorage.setItem( KEY, JSON.stringify( value ) );
		return true;
	} catch ( e ) {
		return false;
	}
}

function StyleMenu( { clientIds, onClose } ) {
	const blocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlocksByClientId( clientIds ),
		[ clientIds ]
	);
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ , rerender ] = useState( 0 );
	const supported = blocks.filter( ( b ) => b && isSupported( b.name ) );
	if ( ! supported.length ) {
		return null;
	}
	const clip = readClipboard();
	const first = supported[ 0 ].attributes.dfb || {};
	const hasStyles =
		!! ( first.styles && Object.keys( first.styles ).length ) ||
		!! first.classes?.length;

	const copy = () => {
		writeClipboard( {
			styles: first.styles || {},
			classes: first.classes || [],
		} );
		createSuccessNotice( __( 'Styles copied.', 'df-builder' ), {
			type: 'snackbar',
		} );
		rerender( ( n ) => n + 1 );
		onClose();
	};
	const apply = ( make ) => {
		for ( const b of supported ) {
			updateBlockAttributes( b.clientId, {
				dfb: make( b.attributes.dfb || {} ),
			} );
		}
	};
	const paste = () => {
		apply( ( dfb ) => {
			const next = {
				...dfb,
				uid: dfb.uid || newUid(),
				styles: clip.styles || {},
			};
			if ( clip.classes?.length ) {
				next.classes = clip.classes;
			} else {
				delete next.classes;
			}
			return next;
		} );
		createSuccessNotice(
			sprintf(
				/* translators: %d: number of elements */
				_n(
					'Styles pasted on %d element.',
					'Styles pasted on %d elements.',
					supported.length,
					'df-builder'
				),
				supported.length
			),
			{ type: 'snackbar' }
		);
		onClose();
	};
	const clear = () => {
		apply( ( dfb ) => {
			const next = { ...dfb };
			delete next.styles;
			delete next.classes;
			return next;
		} );
		onClose();
	};

	return (
		<>
			<MenuItem
				icon="admin-appearance"
				onClick={ copy }
				disabled={ ! hasStyles || supported.length > 1 }
			>
				{ __( 'Copy styles', 'df-builder' ) }
			</MenuItem>
			<MenuItem icon="clipboard" onClick={ paste } disabled={ ! clip }>
				{ __( 'Paste styles', 'df-builder' ) }
			</MenuItem>
			<MenuItem
				icon="editor-removeformatting"
				onClick={ clear }
				disabled={
					! supported.some(
						( b ) =>
							b.attributes.dfb?.styles ||
							b.attributes.dfb?.classes
					)
				}
			>
				{ __( 'Clear styles', 'df-builder' ) }
			</MenuItem>
		</>
	);
}

function CopyStyles() {
	return (
		<BlockSettingsMenuControls>
			{ ( { selectedClientIds, onClose } ) => (
				<StyleMenu
					clientIds={ selectedClientIds }
					onClose={ onClose }
				/>
			) }
		</BlockSettingsMenuControls>
	);
}

// Regular block editor (unscoped) and the full-screen builder (its own PluginArea scope).
registerPlugin( 'dfb-copy-styles', { render: CopyStyles } );
registerPlugin( 'dfb-copy-styles-builder', {
	render: CopyStyles,
	scope: 'dfb-full-editor',
} );
