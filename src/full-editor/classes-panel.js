/**
 * Classes tab: every global class with usage on this page, create / rename / delete,
 * and "select" to jump to the first element using it.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as noticesStore } from '@wordpress/notices';
import { Button, TextControl, SearchControl } from '@wordpress/components';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { isValidClassName } from '../shared/css-generator';

function collectUsage( blocks, map = {} ) {
	for ( const b of blocks ) {
		for ( const id of b.attributes?.dfb?.classes || [] ) {
			( map[ id ] = map[ id ] || [] ).push( b.clientId );
		}
		collectUsage( b.innerBlocks || [], map );
	}
	return map;
}

function NameField( { cls, onCommit } ) {
	const [ name, setName ] = useState( cls.name );
	useEffect( () => setName( cls.name ), [ cls.name ] );
	return (
		<TextControl
			__nextHasNoMarginBottom
			label={ __( 'Class name', 'df-builder' ) }
			hideLabelFromVision
			value={ name }
			onChange={ setName }
			onBlur={ () => name.trim() !== cls.name && onCommit( name.trim() ) }
			onKeyDown={ ( e ) => e.key === 'Enter' && e.currentTarget.blur() }
		/>
	);
}

export default function ClassesPanel() {
	const classes = useSelect(
		( select ) => select( 'dfb/builder' ).getClasses(),
		[]
	);
	const blocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks(),
		[]
	);
	const usage = useMemo( () => collectUsage( blocks ), [ blocks ] );
	const { createClass, renameClass, deleteClass } =
		useDispatch( 'dfb/builder' );
	const { selectBlock } = useDispatch( blockEditorStore );
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ search, setSearch ] = useState( '' );
	const [ newName, setNewName ] = useState( '' );
	const canManage = !! window.dfbData?.canManageClasses;

	const fail = ( e ) =>
		createErrorNotice(
			e?.message || __( 'Something went wrong.', 'df-builder' ),
			{ type: 'snackbar' }
		);

	const create = async () => {
		const name = newName.trim().replace( /^\./, '' );
		if ( ! isValidClassName( name ) ) {
			fail( {
				message: __(
					'Class names must start with a letter and use only letters, numbers, - and _.',
					'df-builder'
				),
			} );
			return;
		}
		try {
			await createClass( name );
			setNewName( '' );
		} catch ( e ) {
			fail( e );
		}
	};

	const remove = async ( cls ) => {
		const n = usage[ cls.id ]?.length || 0;
		const msg = n
			? sprintf(
					/* translators: 1: class name, 2: count */
					__(
						'Delete .%1$s? %2$d element(s) on this page use it and will lose its styles (on other pages too).',
						'df-builder'
					),
					cls.name,
					n
			  )
			: sprintf(
					/* translators: %s: class name */
					__(
						'Delete .%s? Elements on other pages using it will lose its styles.',
						'df-builder'
					),
					cls.name
			  );
		// eslint-disable-next-line no-alert
		if ( window.confirm( msg ) ) {
			try {
				await deleteClass( cls.id );
			} catch ( e ) {
				fail( e );
			}
		}
	};

	const q = search.trim().toLowerCase();
	const list = classes.filter(
		( c ) => ! q || c.name.toLowerCase().includes( q )
	);

	return (
		<div className="dfb-fe-classes">
			{ canManage && (
				<div className="dfb-fe-classes__new">
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'New class', 'df-builder' ) }
						placeholder="card"
						value={ newName }
						onChange={ setNewName }
						onKeyDown={ ( e ) => e.key === 'Enter' && create() }
					/>
					<Button
						variant="secondary"
						onClick={ create }
						disabled={ ! newName.trim() }
					>
						{ __( 'Create', 'df-builder' ) }
					</Button>
				</div>
			) }
			<SearchControl
				__nextHasNoMarginBottom
				value={ search }
				onChange={ setSearch }
				placeholder={ __( 'Search classes', 'df-builder' ) }
			/>
			{ ! list.length && (
				<p className="dfb-fe-classes__empty">
					{ classes.length
						? __( 'No matching classes.', 'df-builder' )
						: __(
								'No classes yet. Create one here, or type a name in an element’s “Global classes” field.',
								'df-builder'
						  ) }
				</p>
			) }
			<ul className="dfb-fe-classes__list">
				{ list.map( ( c ) => {
					const used = usage[ c.id ] || [];
					return (
						<li key={ c.id }>
							{ canManage ? (
								<NameField
									cls={ c }
									onCommit={ ( name ) =>
										renameClass( c.id, name ).catch( fail )
									}
								/>
							) : (
								<code>.{ c.name }</code>
							) }
							<div className="dfb-fe-classes__meta">
								<Button
									variant="link"
									disabled={ ! used.length }
									onClick={ () => selectBlock( used[ 0 ] ) }
								>
									{ sprintf(
										/* translators: %d: number of elements */
										__( '%d on this page', 'df-builder' ),
										used.length
									) }
								</Button>
								{ canManage && (
									<Button
										variant="link"
										isDestructive
										onClick={ () => remove( c ) }
									>
										{ __( 'Delete', 'df-builder' ) }
									</Button>
								) }
							</div>
						</li>
					);
				} ) }
			</ul>
			<p className="dfb-fe-classes__hint">
				{ __(
					'To edit a class’s styles, select an element that uses it and switch “Editing” to the class in the style panel.',
					'df-builder'
				) }
			</p>
		</div>
	);
}
