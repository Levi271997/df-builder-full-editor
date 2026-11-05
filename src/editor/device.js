/**
 * Keep the style panel's breakpoint in sync with the editor's device preview.
 */
import { useSelect, useDispatch, dispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { STORE } from './store';

const DEVICE_TO_STATE = { Desktop: 'base', Tablet: 'tablet', Mobile: 'phone' };
const STATE_TO_DEVICE = { base: 'Desktop', tablet: 'Tablet', phone: 'Mobile' };

function getDevice( select ) {
	const editor = select( 'core/editor' );
	if ( editor?.getDeviceType ) {
		return editor.getDeviceType();
	}
	return (
		select( 'core/edit-post' )?.__experimentalGetPreviewDeviceType?.() ||
		'Desktop'
	);
}

function setDevice( device ) {
	const editor = dispatch( 'core/editor' );
	if ( editor?.setDeviceType ) {
		editor.setDeviceType( device );
		return;
	}
	dispatch( 'core/edit-post' )?.__experimentalSetPreviewDeviceType?.(
		device
	);
}

/**
 * @return {[string, Function]} Current edit state and a setter that also moves the device preview.
 */
export function useEditState() {
	const { editState, device } = useSelect(
		( select ) => ( {
			editState: select( STORE ).getEditState(),
			device: getDevice( select ),
		} ),
		[]
	);
	const { setEditState } = useDispatch( STORE );

	const prevDevice = useRef( device );
	useEffect( () => {
		// Only react to real device switches, not to mount (keeps hover/landscape selected).
		if ( prevDevice.current === device ) {
			return;
		}
		prevDevice.current = device;
		const mapped = DEVICE_TO_STATE[ device ];
		if ( mapped && mapped !== editState ) {
			setEditState( mapped );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ device ] );

	const set = ( next ) => {
		setEditState( next );
		if ( STATE_TO_DEVICE[ next ] && STATE_TO_DEVICE[ next ] !== device ) {
			setDevice( STATE_TO_DEVICE[ next ] );
		}
	};
	return [ editState, set ];
}
