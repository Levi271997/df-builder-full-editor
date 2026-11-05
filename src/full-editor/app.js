import { __ } from '@wordpress/i18n';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockInspector,
} from '@wordpress/block-editor';
import {
	SlotFillProvider,
	Popover,
	Spinner,
	SnackbarList,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import useDocument from './use-document';
import useEditorSettings from './use-editor-settings';
import TopBar from './top-bar';

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
				<div className="dfb-fe">
					<TopBar config={ config } doc={ doc } />
					<div className="dfb-fe__body">
						<main
							className="dfb-fe__canvas-wrap"
							aria-label={ __( 'Canvas', 'df-builder' ) }
						>
							<BlockCanvas
								height="100%"
								styles={ settings.styles }
							/>
						</main>
						<aside
							className="dfb-fe__right"
							aria-label={ __(
								'Element settings',
								'df-builder'
							) }
						>
							<BlockInspector />
						</aside>
					</div>
				</div>
				<Popover.Slot />
				<Notices />
			</BlockEditorProvider>
		</SlotFillProvider>
	);
}
