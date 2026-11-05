/**
 * Global builder shortcuts. Key events from the canvas iframe are re-dispatched on the parent
 * document by the block editor, so one document listener covers both.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { isAppleOS } from '@wordpress/keycodes';
import { useDispatch, useRegistry } from '@wordpress/data';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';

const isTextField = ( el ) =>
	!! el &&
	el.ownerDocument === document &&
	( el.tagName === 'INPUT' ||
		el.tagName === 'TEXTAREA' ||
		el.isContentEditable );

export const SHORTCUTS = [
	{ keys: 'Mod+S', label: __( 'Save', 'df-builder' ) },
	{ keys: 'Mod+Z', label: __( 'Undo', 'df-builder' ) },
	{ keys: 'Mod+Shift+Z / Mod+Y', label: __( 'Redo', 'df-builder' ) },
	{
		keys: 'Mod+Shift+D',
		label: __( 'Duplicate selected element', 'df-builder' ),
	},
	{
		keys: 'Shift+Alt+Z',
		label: __( 'Delete selected element', 'df-builder' ),
	},
	{
		keys: 'Mod+Alt+T / Mod+Alt+Y',
		label: __( 'Insert before / after selection', 'df-builder' ),
	},
	{
		keys: '1 – 4 (Alt+Shift)',
		label: __( 'Desktop / Tablet / Landscape / Phone', 'df-builder' ),
	},
	{ keys: 'Shift+?', label: __( 'Show this list', 'df-builder' ) },
];

/**
 * The block editor's own shortcuts (duplicate, remove, insert before/after…) are handled by its
 * BlockTools, but only once registered — normally the editor package does that. Register them
 * here if nobody has, with the same key combinations as core.
 */
const BLOCK_SHORTCUTS = [
	[
		'duplicate',
		__( 'Duplicate the selected block(s).', 'df-builder' ),
		{ modifier: 'primaryShift', character: 'd' },
	],
	[
		'remove',
		__( 'Remove the selected block(s).', 'df-builder' ),
		{ modifier: 'access', character: 'z' },
	],
	[
		'insert-before',
		__( 'Insert a new block before the selected block(s).', 'df-builder' ),
		{ modifier: 'primaryAlt', character: 't' },
	],
	[
		'insert-after',
		__( 'Insert a new block after the selected block(s).', 'df-builder' ),
		{ modifier: 'primaryAlt', character: 'y' },
	],
	[
		'delete-multi-selection',
		__( 'Delete selection.', 'df-builder' ),
		{ character: 'del' },
	],
	[
		'select-all',
		__(
			'Select all text when typing. Press again to select all blocks.',
			'df-builder'
		),
		{ modifier: 'primary', character: 'a' },
	],
	[
		'unselect',
		__( 'Clear selection.', 'df-builder' ),
		{ character: 'escape' },
	],
	[
		'move-up',
		__( 'Move the selected block(s) up.', 'df-builder' ),
		{ modifier: 'secondary', character: 't' },
	],
	[
		'move-down',
		__( 'Move the selected block(s) down.', 'df-builder' ),
		{ modifier: 'secondary', character: 'y' },
	],
	[
		'focus-toolbar',
		__( 'Navigate to the nearest toolbar.', 'df-builder' ),
		{ modifier: 'alt', character: 'F10' },
	],
];

export function useRegisterBlockShortcuts() {
	const { registerShortcut } = useDispatch( keyboardShortcutsStore );
	const select = useRegistry().select;
	useEffect( () => {
		const store = select( keyboardShortcutsStore );
		for ( const [ name, description, keyCombination ] of BLOCK_SHORTCUTS ) {
			const full = 'core/block-editor/' + name;
			if ( ! store.getShortcutKeyCombination( full ) ) {
				registerShortcut( {
					name: full,
					category: 'block',
					description,
					keyCombination,
				} );
			}
		}
	}, [ registerShortcut, select ] );
}

export function useBuilderShortcuts( { doc, setViewport, openHelp } ) {
	useRegisterBlockShortcuts();
	useEffect( () => {
		const onKey = ( e ) => {
			const mod = isAppleOS() ? e.metaKey : e.ctrlKey;
			const key = e.key.toLowerCase();

			if ( mod && ! e.altKey && key === 's' ) {
				e.preventDefault();
				if ( doc.isDirty && ! doc.isSaving ) {
					doc.save();
				}
				return;
			}
			// Leave native undo to sidebar text fields.
			if (
				mod &&
				! e.altKey &&
				( key === 'z' || key === 'y' ) &&
				! isTextField( e.target )
			) {
				e.preventDefault();
				if ( key === 'y' || e.shiftKey ) {
					doc.redo();
				} else {
					doc.undo();
				}
				return;
			}
			if (
				e.altKey &&
				e.shiftKey &&
				! mod &&
				[ '1', '2', '3', '4' ].includes( e.code.replace( 'Digit', '' ) )
			) {
				e.preventDefault();
				setViewport(
					[ 'base', 'tablet', 'landscape', 'phone' ][
						Number( e.code.replace( 'Digit', '' ) ) - 1
					]
				);
				return;
			}
			if (
				e.key === '?' &&
				e.shiftKey &&
				! mod &&
				! isTextField( e.target ) &&
				e.target.ownerDocument === document &&
				! e.target.closest?.( '[contenteditable]' )
			) {
				e.preventDefault();
				openHelp();
			}
		};
		document.addEventListener( 'keydown', onKey );
		return () => document.removeEventListener( 'keydown', onKey );
	}, [ doc, setViewport, openHelp ] );
}

export function ShortcutsHelp( { onClose } ) {
	const mod = isAppleOS() ? '⌘' : 'Ctrl';
	return (
		<Modal
			title={ __( 'Keyboard shortcuts', 'df-builder' ) }
			onRequestClose={ onClose }
			size="medium"
		>
			<table className="dfb-fe-shortcuts">
				<tbody>
					{ SHORTCUTS.map( ( s ) => (
						<tr key={ s.keys }>
							<td>{ s.label }</td>
							<td>
								<kbd>{ s.keys.replace( /Mod/g, mod ) }</kbd>
							</td>
						</tr>
					) ) }
				</tbody>
			</table>
		</Modal>
	);
}

export function ShortcutsButton() {
	const [ open, setOpen ] = useState( false );
	return (
		<>
			<Button
				icon="editor-help"
				label={ __( 'Keyboard shortcuts', 'df-builder' ) }
				showTooltip
				onClick={ () => setOpen( true ) }
			/>
			{ open && <ShortcutsHelp onClose={ () => setOpen( false ) } /> }
		</>
	);
}
