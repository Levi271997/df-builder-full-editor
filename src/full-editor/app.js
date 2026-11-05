import { __ } from '@wordpress/i18n';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockInspector,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	SlotFillProvider,
	Popover,
	Spinner,
	SnackbarList,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from '@wordpress/element';
import useDocument from './use-document';
import useEditorSettings from './use-editor-settings';
import TopBar from './top-bar';
import LeftPanel from './left-panel';
import { useViewport, canvasWidth } from './viewport';

function Notices() {
	const notices = useSelect(
		( select ) =>
			select( noticesStore )
				.getNotices()
				.filter( ( n ) => n.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( noticesStore );
	return (
		<SnackbarList
			className="dfb-fe__snackbars"
			notices={ notices }
			onRemove={ removeNotice }
		/>
	);
}

function RightPanel( { emptyContent } ) {
	const hasSelection = useSelect(
		( select ) => !! select( blockEditorStore ).getSelectedBlockClientId(),
		[]
	);
	return (
		<aside
			className="dfb-fe__right"
			aria-label={ __( 'Element settings', 'df-builder' ) }
		>
			{ hasSelection ? (
				<BlockInspector />
			) : (
				emptyContent || (
					<div className="dfb-fe__empty">
						<p>
							{ __(
								'Select an element on the canvas or in the Structure panel to edit it.',
								'df-builder'
							) }
						</p>
					</div>
				)
			) }
		</aside>
	);
}

function Canvas( { styles } ) {
	const { viewport } = useViewport();
	return (
		<main
			className={ 'dfb-fe__canvas-wrap is-' + viewport }
			aria-label={ __( 'Canvas', 'df-builder' ) }
		>
			<div
				className="dfb-fe__canvas"
				style={ { width: canvasWidth( viewport ) } }
			>
				<BlockCanvas height="100%" styles={ styles } />
			</div>
		</main>
	);
}

/**
 * @param {Object} props
 * @param {Object} props.config      window.dfbFullEditor.
 * @param {Object} props.doc         useDocument() result.
 * @param {Object} props.settings    Block editor settings.
 * @param {Object} props.extraTabs   Extra left-panel tabs { name: { tab, render } }.
 * @param {*}      props.rightEmpty  Right panel content when nothing is selected.
 * @param {*}      props.children    Extra UI (shortcuts, modals…) rendered inside the provider.
 * @param {*}      props.footer      Footer bar content.
 * @param {*}      props.topBarExtra Extra top-bar controls.
 */
export function Layout( {
	config,
	doc,
	settings,
	extraTabs,
	rightEmpty,
	footer,
	topBarExtra,
	children,
} ) {
	const [ tab, setTab ] = useState( 'add' );
	return (
		<div className="dfb-fe">
			<TopBar config={ config } doc={ doc } extra={ topBarExtra } />
			<div className="dfb-fe__body">
				<LeftPanel
					tab={ tab }
					setTab={ setTab }
					extraTabs={ extraTabs }
				/>
				<div className="dfb-fe__center">
					<Canvas styles={ settings.styles } />
					{ footer && (
						<footer className="dfb-fe__footer">{ footer }</footer>
					) }
				</div>
				<RightPanel emptyContent={ rightEmpty } />
			</div>
			{ children }
		</div>
	);
}

export default function App( config ) {
	const { postId, postType } = config;
	const doc = useDocument( postType, postId );
	const settings = useEditorSettings( config.settings, postId );

	if ( ! doc.isLoaded ) {
		return (
			<div className="dfb-fe dfb-fe--loading">
				<Spinner />
			</div>
		);
	}

	return (
		<SlotFillProvider>
			{ /* useSubRegistry=false: DF Builder's hooks read the global block-editor store. */ }
			<BlockEditorProvider
				value={ doc.blocks }
				onInput={ doc.onInput }
				onChange={ doc.onChange }
				settings={ settings }
				useSubRegistry={ false }
			>
				<Layout config={ config } doc={ doc } settings={ settings } />
				<Popover.Slot />
				<Notices />
			</BlockEditorProvider>
		</SlotFillProvider>
	);
}
