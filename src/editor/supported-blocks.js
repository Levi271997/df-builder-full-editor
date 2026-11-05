/** Keep in sync with Blocks::CORE_SUPPORTED in includes/class-blocks.php. */
export const CORE_SUPPORTED = [
	'core/group',
	'core/columns',
	'core/column',
	'core/paragraph',
	'core/heading',
	'core/image',
	'core/buttons',
	'core/button',
	'core/list',
	'core/cover',
];

export const isSupported = ( name ) =>
	typeof name === 'string' &&
	( name.startsWith( 'dfb/' ) || CORE_SUPPORTED.includes( name ) );

/** Display value the block has before any DF Builder styles (drives which layout controls show). */
const DEFAULT_DISPLAY = {
	'dfb/section': 'flex',
	'dfb/div': 'flex',
	'dfb/link-wrapper': 'flex',
	'dfb/columns': 'grid',
	'dfb/repeater': 'grid',
	'dfb/breadcrumbs': 'block',
	'dfb/button': 'inline-flex',
	'dfb/icon': 'inline-flex',
	'core/group': 'block',
	'core/buttons': 'flex',
	'core/columns': 'flex',
};

export const defaultDisplay = ( name ) => DEFAULT_DISPLAY[ name ] || 'block';
