import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { ViewportSwitcher } from './viewport';

export default function TopBar( { config, doc, extra } ) {
	const title =
		decodeEntities(
			typeof doc.record?.title === 'string'
				? doc.record.title
				: doc.record?.title?.raw || ''
		) || __( '(no title)', 'df-builder' );

	return (
		<header className="dfb-fe__top">
			<div className="dfb-fe__top-left">
				<Button
					className="dfb-fe__logo"
					href={ config.exitUrl }
					label={ __( 'Exit DF Builder', 'df-builder' ) }
					showTooltip
				>
					DF
				</Button>
				<span className="dfb-fe__title" title={ title }>
					{ title }
				</span>
				{ extra?.left }
			</div>
			<div className="dfb-fe__top-center">
				<ViewportSwitcher />
			</div>
			<div className="dfb-fe__top-right">
				{ extra?.right }
				<Button
					icon="undo"
					label={ __( 'Undo (Ctrl+Z)', 'df-builder' ) }
					showTooltip
					disabled={ ! doc.hasUndo }
					onClick={ doc.undo }
				/>
				<Button
					icon="redo"
					label={ __( 'Redo (Ctrl+Shift+Z)', 'df-builder' ) }
					showTooltip
					disabled={ ! doc.hasRedo }
					onClick={ doc.redo }
				/>
				<Button
					variant="primary"
					onClick={ () => doc.save() }
					isBusy={ doc.isSaving }
					disabled={ doc.isSaving || ! doc.isDirty }
				>
					{ doc.isDirty
						? __( 'Save', 'df-builder' )
						: __( 'Saved', 'df-builder' ) }
				</Button>
			</div>
		</header>
	);
}
