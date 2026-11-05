import { __ } from '@wordpress/i18n';
import { FormTokenField } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { STORE } from '../store';
import { isValidClassName } from '../../shared/css-generator';

/**
 * Add / remove global classes on a block. Typing an unknown name creates the class.
 */
export default function ClassPicker( { dfb, setAttributes } ) {
	const classes = useSelect( ( select ) => select( STORE ).getClasses(), [] );
	const { createClass } = useDispatch( STORE );
	const { createErrorNotice } = useDispatch( noticesStore );
	const canManage = !! window.dfbData?.canManageClasses;

	const byId = Object.fromEntries( classes.map( ( c ) => [ c.id, c ] ) );
	const byName = Object.fromEntries( classes.map( ( c ) => [ c.name, c ] ) );
	const ids = ( dfb.classes || [] ).filter( ( id ) => byId[ id ] );
	const tokens = ids.map( ( id ) => byId[ id ].name );

	const onChange = async ( nextTokens ) => {
		const nextIds = [];
		for ( const raw of nextTokens ) {
			const name = String( typeof raw === 'string' ? raw : raw.value )
				.trim()
				.replace( /^\./, '' );
			if ( byName[ name ] ) {
				nextIds.push( byName[ name ].id );
				continue;
			}
			if ( ! canManage || ! isValidClassName( name ) ) {
				createErrorNotice(
					canManage
						? __(
								'Class names must start with a letter and use only letters, numbers, - and _.',
								'df-builder'
						  )
						: __(
								'You are not allowed to create classes.',
								'df-builder'
						  ),
					{ type: 'snackbar' }
				);
				continue;
			}
			try {
				const cls = await createClass( name );
				nextIds.push( cls.id );
			} catch ( e ) {
				createErrorNotice(
					e?.message || __( 'Could not create class.', 'df-builder' ),
					{
						type: 'snackbar',
					}
				);
			}
		}
		const unique = [ ...new Set( nextIds ) ];
		const next = { ...dfb };
		if ( unique.length ) {
			next.classes = unique;
		} else {
			delete next.classes;
		}
		setAttributes( { dfb: next } );
	};

	return (
		<FormTokenField
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ __( 'Global classes', 'df-builder' ) }
			value={ tokens }
			suggestions={ classes.map( ( c ) => c.name ) }
			onChange={ onChange }
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			placeholder={ __( 'Add or create a class…', 'df-builder' ) }
		/>
	);
}
