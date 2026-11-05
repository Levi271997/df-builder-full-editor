import { __ } from '@wordpress/i18n';
import { createRoot, useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Notice,
	ToggleControl,
	TextControl,
	Spinner,
} from '@wordpress/components';

const NumberField = ( props ) => (
	<TextControl __nextHasNoMarginBottom type="number" { ...props } />
);

const BP_LABELS = {
	tablet: __( 'Tablet (max width, px)', 'df-builder' ),
	landscape: __( 'Phone landscape (max width, px)', 'df-builder' ),
	phone: __( 'Phone portrait (max width, px)', 'df-builder' ),
};

function SettingsCard() {
	const [ settings, setSettings ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/settings' } ).then( ( s ) =>
			setSettings( s.dfb_settings )
		);
	}, [] );

	if ( ! settings ) {
		return <Spinner />;
	}
	const set = ( patch ) => setSettings( { ...settings, ...patch } );
	const setBp = ( key, value ) =>
		set( {
			breakpoints: {
				...settings.breakpoints,
				[ key ]: parseInt( value, 10 ) || 0,
			},
		} );

	const save = async () => {
		setSaving( true );
		setNotice( null );
		try {
			const res = await apiFetch( {
				path: '/wp/v2/settings',
				method: 'POST',
				data: { dfb_settings: settings },
			} );
			setSettings( res.dfb_settings );
			setNotice( {
				status: 'success',
				text: __( 'Settings saved.', 'df-builder' ),
			} );
		} catch ( e ) {
			setNotice( { status: 'error', text: e.message } );
		}
		setSaving( false );
	};

	return (
		<Card>
			<CardHeader>
				<h2 style={ { margin: 0 } }>
					{ __( 'Layout & breakpoints', 'df-builder' ) }
				</h2>
			</CardHeader>
			<CardBody>
				{ notice && (
					<Notice
						status={ notice.status }
						onRemove={ () => setNotice( null ) }
					>
						{ notice.text }
					</Notice>
				) }
				<div style={ { display: 'grid', gap: 16, maxWidth: 420 } }>
					<NumberField
						label={ __( 'Page width (px)', 'df-builder' ) }
						help={ __(
							'Content width of contained Sections.',
							'df-builder'
						) }
						value={ settings.pageWidth }
						onChange={ ( v ) =>
							set( { pageWidth: parseInt( v, 10 ) || 0 } )
						}
					/>
					<NumberField
						label={ __( 'Side gutter (px)', 'df-builder' ) }
						value={ settings.gutter }
						onChange={ ( v ) =>
							set( { gutter: parseInt( v, 10 ) || 0 } )
						}
					/>
					{ Object.keys( BP_LABELS ).map( ( k ) => (
						<NumberField
							key={ k }
							label={ BP_LABELS[ k ] }
							value={ settings.breakpoints?.[ k ] }
							onChange={ ( v ) => setBp( k, v ) }
						/>
					) ) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use DF Builder templates on the front end',
							'df-builder'
						) }
						help={ __(
							'Turn off to fall back to the theme everywhere without deleting templates.',
							'df-builder'
						) }
						checked={ !! settings.templatesEnabled }
						onChange={ ( templatesEnabled ) =>
							set( { templatesEnabled } )
						}
					/>
				</div>
				<p style={ { marginTop: 24 } }>
					<Button
						variant="primary"
						onClick={ save }
						isBusy={ saving }
						disabled={ saving }
					>
						{ __( 'Save settings', 'df-builder' ) }
					</Button>
				</p>
			</CardBody>
		</Card>
	);
}

function RenameField( { cls, onCommit } ) {
	const [ name, setName ] = useState( cls.name );
	useEffect( () => setName( cls.name ), [ cls.name ] );
	return (
		<TextControl
			__nextHasNoMarginBottom
			label={ __( 'Name', 'df-builder' ) }
			hideLabelFromVision
			value={ name }
			onChange={ setName }
			onBlur={ () => onCommit( name.trim() ) }
		/>
	);
}

function ClassesCard() {
	const [ classes, setClasses ] = useState( null );
	const [ error, setError ] = useState( null );
	const load = () =>
		apiFetch( { path: '/dfb/v1/classes' } ).then( setClasses );
	useEffect( () => {
		load();
	}, [] );

	const rename = async ( c, name ) => {
		if ( ! name || name === c.name ) {
			return;
		}
		try {
			setError( null );
			await apiFetch( {
				path: `/dfb/v1/classes/${ c.id }`,
				method: 'PUT',
				data: { name },
			} );
		} catch ( e ) {
			setError( e.message );
		}
		load();
	};
	const remove = async ( c ) => {
		// eslint-disable-next-line no-alert
		if (
			// eslint-disable-next-line no-alert
			! window.confirm(
				__(
					'Delete this class? Blocks using it will lose its styles.',
					'df-builder'
				)
			)
		) {
			return;
		}
		await apiFetch( {
			path: `/dfb/v1/classes/${ c.id }`,
			method: 'DELETE',
		} );
		load();
	};

	return (
		<Card style={ { marginTop: 24 } }>
			<CardHeader>
				<h2 style={ { margin: 0 } }>
					{ __( 'Global classes', 'df-builder' ) }
				</h2>
			</CardHeader>
			<CardBody>
				{ error && (
					<Notice status="error" onRemove={ () => setError( null ) }>
						{ error }
					</Notice>
				) }
				{ ! classes && <Spinner /> }
				{ classes && ! classes.length && (
					<p>
						{ __(
							'No classes yet. Create them from the style panel in the editor.',
							'df-builder'
						) }
					</p>
				) }
				{ classes?.map( ( c ) => (
					<div
						key={ c.id }
						style={ {
							display: 'flex',
							gap: 8,
							alignItems: 'flex-end',
							marginBottom: 8,
						} }
					>
						<RenameField
							cls={ c }
							onCommit={ ( name ) => rename( c, name ) }
						/>
						<code>
							{ Object.values( c.styles || {} ).reduce(
								( n, s ) => n + Object.keys( s ).length,
								0
							) }{ ' ' }
							{ __( 'values', 'df-builder' ) }
						</code>
						<Button
							variant="link"
							isDestructive
							onClick={ () => remove( c ) }
						>
							{ __( 'Delete', 'df-builder' ) }
						</Button>
					</div>
				) ) }
			</CardBody>
		</Card>
	);
}

function App() {
	return (
		<div style={ { maxWidth: 760, marginTop: 16 } }>
			<SettingsCard />
			<ClassesCard />
		</div>
	);
}

const root = document.getElementById( 'dfb-settings-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
