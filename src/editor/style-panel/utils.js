/**
 * Immutable helpers for the styles object { base, tablet, landscape, phone, hover }.
 * @param styles
 * @param state
 * @param key
 * @param value
 */
export function setStyleValue( styles, state, key, value ) {
	const next = { ...( styles || {} ) };
	const bucket = { ...( next[ state ] || {} ) };
	if (
		value === undefined ||
		value === null ||
		String( value ).trim() === ''
	) {
		delete bucket[ key ];
	} else {
		bucket[ key ] = String( value );
	}
	if ( Object.keys( bucket ).length ) {
		next[ state ] = bucket;
	} else {
		delete next[ state ];
	}
	return next;
}

export function clearState( styles, state ) {
	const next = { ...( styles || {} ) };
	delete next[ state ];
	return next;
}

export const hasValues = ( styles, state ) =>
	!! styles?.[ state ] && Object.keys( styles[ state ] ).length > 0;

/**
 * Number of values set in a group for the current state (badge in panel titles).
 * @param styles
 * @param state
 * @param defs
 */
export const countInGroup = ( styles, state, defs ) =>
	defs.filter( ( d ) => styles?.[ state ]?.[ d.key ] !== undefined ).length;
