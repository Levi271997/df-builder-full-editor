/**
 * Style schema → CSS. This file is mirrored 1:1 by includes/class-style-engine.php.
 * Any change here MUST be made there too; tests/fixtures/css.json is the parity contract.
 */
import schema from '../../schema/style-properties.json';

export const SCHEMA = schema.properties;
export const GROUPS = schema.groups;

/** Breakpoint keys in cascade order (largest → smallest). `base` is desktop. */
export const BREAKPOINTS = [ 'tablet', 'landscape', 'phone' ];
export const STATES = [ 'base', ...BREAKPOINTS, 'hover' ];
export const DEFAULT_BREAKPOINTS = { tablet: 992, landscape: 768, phone: 480 };

const BLOCKLIST = /[;{}<>\\]|\/\*|@import|expression\s*\(|javascript:/i;
const NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;
const LENGTH =
	/^-?(\d+\.?\d*|\.\d+)(px|em|rem|%|vw|vh|svh|dvh|vmin|vmax|ch|ex|fr|deg|s|ms)$/;
const FUNC = /^(calc|clamp|min|max|var)\([a-zA-Z0-9%.,+\-*/ ()_]+\)$/;
const LENGTH_KEYWORDS = [
	'auto',
	'none',
	'fit-content',
	'min-content',
	'max-content',
	'normal',
	'inherit',
	'initial',
	'unset',
];
const HEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const COLOR_FUNC =
	/^(rgb|rgba|hsl|hsla|oklch|color-mix)\([a-zA-Z0-9.,%\s/#-]+\)$/;
const NAMED = /^[a-zA-Z]+$/;
const URL_RE = /^((https?:)?\/\/|\/)[^"'()\\\s]+$/;
const URL_FN = /url\s*\(/i;

/**
 * Validate/normalise one value for a schema property. Returns the CSS value or null.
 *
 * @param {Object} def Schema property definition.
 * @param {*}      raw Stored value.
 * @return {string|null} Safe CSS value.
 */
export function sanitizeValue( def, raw ) {
	if ( typeof raw !== 'string' && typeof raw !== 'number' ) {
		return null;
	}
	const v = String( raw ).trim();
	if ( v === '' || BLOCKLIST.test( v ) ) {
		return null;
	}
	switch ( def.type ) {
		case 'keyword':
			return ( def.options || [] ).includes( v ) ? v : null;
		case 'number':
			return NUMBER.test( v ) ? v : null;
		case 'length':
			if ( NUMBER.test( v ) ) {
				return def.unitless || v === '0' ? v : v + 'px';
			}
			if (
				LENGTH.test( v ) ||
				FUNC.test( v ) ||
				LENGTH_KEYWORDS.includes( v )
			) {
				return v;
			}
			return null;
		case 'color':
			return HEX.test( v ) ||
				COLOR_FUNC.test( v ) ||
				FUNC.test( v ) ||
				NAMED.test( v )
				? v
				: null;
		case 'url':
			return URL_RE.test( v ) ? 'url("' + v + '")' : null;
		case 'string':
			return URL_FN.test( v ) ? null : v;
		default:
			return null;
	}
}

/**
 * Declarations for a single state object, in schema order.
 *
 * @param {Object} values { key: value }.
 * @return {string} `prop:value;prop:value`
 */
export function declarations( values ) {
	if ( ! values || typeof values !== 'object' ) {
		return '';
	}
	const out = [];
	for ( const def of SCHEMA ) {
		if ( ! Object.prototype.hasOwnProperty.call( values, def.key ) ) {
			continue;
		}
		const v = sanitizeValue( def, values[ def.key ] );
		if ( v !== null ) {
			out.push( def.prop + ':' + v );
		}
	}
	return out.join( ';' );
}

/**
 * @param {string} selector    CSS selector (already validated).
 * @param {Object} styles      { base, tablet, landscape, phone, hover }.
 * @param {Object} breakpoints { tablet, landscape, phone } max-widths in px.
 * @return {string} CSS.
 */
export function generateCss(
	selector,
	styles,
	breakpoints = DEFAULT_BREAKPOINTS
) {
	if ( ! styles || typeof styles !== 'object' ) {
		return '';
	}
	let css = '';
	const base = declarations( styles.base );
	if ( base ) {
		css += selector + '{' + base + '}';
	}
	const hover = declarations( styles.hover );
	if ( hover ) {
		css += selector + ':hover{' + hover + '}';
	}
	for ( const bp of BREAKPOINTS ) {
		const d = declarations( styles[ bp ] );
		if ( d ) {
			const width = parseInt(
				( breakpoints && breakpoints[ bp ] ) ||
					DEFAULT_BREAKPOINTS[ bp ],
				10
			);
			css +=
				'@media (max-width:' +
				width +
				'px){' +
				selector +
				'{' +
				d +
				'}}';
		}
	}
	return css;
}

export const isValidUid = ( uid ) =>
	typeof uid === 'string' && /^[a-z0-9]{4,16}$/.test( uid );
export const isValidClassName = ( name ) =>
	typeof name === 'string' && /^-?[_a-zA-Z][_a-zA-Z0-9-]{0,63}$/.test( name );

export const blockSelector = ( uid ) => '.dfb-' + uid;

export function newUid() {
	let s = '';
	while ( s.length < 7 ) {
		s += Math.random().toString( 36 ).slice( 2 );
	}
	// Must start with a letter so `.dfb-<uid>` is always readable.
	return 'b' + s.slice( 0, 6 );
}

/**
 * The value a state inherits when it has none (for placeholders): nearest larger breakpoint.
 *
 * @param {Object} styles Styles object.
 * @param {string} state  State being edited.
 * @param {string} key    Property key.
 * @return {string|undefined} Inherited value.
 */
export function inheritedValue( styles, state, key ) {
	if ( ! styles ) {
		return undefined;
	}
	if ( state === 'hover' || state === 'base' ) {
		return state === 'hover' ? styles.base?.[ key ] : undefined;
	}
	const chain = [ 'base', ...BREAKPOINTS ];
	const idx = chain.indexOf( state );
	for ( let i = idx - 1; i >= 0; i-- ) {
		const v = styles[ chain[ i ] ]?.[ key ];
		if ( v !== undefined && v !== '' ) {
			return v;
		}
	}
	return undefined;
}
