/**
 * Top-bar "Switch" menu: jump to another page or template, or create one.
 * Leaving with unsaved changes triggers the browser's leave-page prompt (see useUnsavedGuard).
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import {
	Dropdown,
	Button,
	MenuGroup,
	MenuItem,
	Spinner,
} from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from '@wordpress/element';

const QUERY = {
	per_page: 20,
	status: [ 'publish', 'draft', 'pending', 'private' ],
	orderby: 'modified',
	order: 'desc',
	_fields: 'id,title,status',
};

const titleOf = ( p ) =>
	decodeEntities( p.title?.rendered || p.title?.raw || '' ) ||
	__( '(no title)', 'df-builder' );

export function goTo( config, id ) {
	window.location.href = addQueryArgs( config.editorUrl, { post: id } );
}

function List( { config, postType, label } ) {
	const { items, loading } = useSelect(
		( select ) => {
			const core = select( coreStore );
			return {
				items: core.getEntityRecords( 'postType', postType, QUERY ),
				loading: ! core.hasFinishedResolution( 'getEntityRecords', [
					'postType',
					postType,
					QUERY,
				] ),
			};
		},
		[ postType ]
	);
	return (
		<MenuGroup label={ label }>
			{ loading && <Spinner /> }
			{ ( items || [] ).map( ( p ) => (
				<MenuItem
					key={ p.id }
					isSelected={ p.id === config.postId }
					onClick={ () => goTo( config, p.id ) }
					info={ p.status !== 'publish' ? p.status : undefined }
				>
					{ titleOf( p ) }
				</MenuItem>
			) ) }
			{ ! loading && ! items?.length && (
				<MenuItem disabled>{ __( 'None yet', 'df-builder' ) }</MenuItem>
			) }
		</MenuGroup>
	);
}

export default function Switcher( { config } ) {
	const { saveEntityRecord } = useDispatch( coreStore );
	const { createErrorNotice } = useDispatch( noticesStore );
	const templateType = window.dfbData?.templatePostType;

	const create = async ( postType, title ) => {
		try {
			const rec = await saveEntityRecord(
				'postType',
				postType,
				{ title, status: 'draft' },
				{ throwOnError: true }
			);
			goTo( config, rec.id );
		} catch ( e ) {
			createErrorNotice(
				e?.message || __( 'Could not create it.', 'df-builder' ),
				{ type: 'snackbar' }
			);
		}
	};

	return (
		<Dropdown
			className="dfb-fe__switcher"
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon="arrow-down-alt2"
					iconPosition="right"
					onClick={ onToggle }
					aria-expanded={ isOpen }
					label={ __( 'Switch page or template', 'df-builder' ) }
					showTooltip
					size="small"
				/>
			) }
			renderContent={ () => (
				<div className="dfb-fe__switcher-menu">
					<List
						config={ config }
						postType="page"
						label={ __( 'Pages', 'df-builder' ) }
					/>
					{ templateType && (
						<List
							config={ config }
							postType={ templateType }
							label={ __( 'Templates', 'df-builder' ) }
						/>
					) }
					<MenuGroup>
						<MenuItem
							icon="plus"
							onClick={ () =>
								create( 'page', __( 'New page', 'df-builder' ) )
							}
						>
							{ __( 'New page', 'df-builder' ) }
						</MenuItem>
						{ templateType && (
							<MenuItem
								icon="plus"
								onClick={ () =>
									create(
										templateType,
										__( 'New template', 'df-builder' )
									)
								}
							>
								{ __( 'New template', 'df-builder' ) }
							</MenuItem>
						) }
					</MenuGroup>
				</div>
			) }
		/>
	);
}

export function PreviewButton( { config, doc } ) {
	const preview = async () => {
		// Open synchronously (popup blockers), then point it at the preview once saved.
		const win = window.open( 'about:blank', 'dfb-preview' );
		if ( doc.isDirty ) {
			await doc.save();
		}
		if ( win ) {
			win.location.href = config.previewUrl;
		}
	};
	return (
		<Button
			icon="visibility"
			label={ __( 'Preview (saves first)', 'df-builder' ) }
			showTooltip
			onClick={ preview }
			disabled={ ! config.previewUrl || doc.isSaving }
		/>
	);
}

/** Browser prompt when leaving with unsaved changes. */
export function useUnsavedGuard( isDirty ) {
	useEffect( () => {
		if ( ! isDirty ) {
			return;
		}
		const onBeforeUnload = ( e ) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener( 'beforeunload', onBeforeUnload );
		return () =>
			window.removeEventListener( 'beforeunload', onBeforeUnload );
	}, [ isDirty ] );
}
