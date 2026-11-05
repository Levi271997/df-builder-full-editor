import { __ } from '@wordpress/i18n';

/** Which attributes can be bound per block. Core list matches what core resolves server-side. */
export const BINDABLE = {
	'core/paragraph': [ 'content' ],
	'core/heading': [ 'content' ],
	'core/image': [ 'url', 'alt' ],
	'core/button': [ 'text', 'url' ],
	'dfb/heading': [ 'content' ],
	'dfb/text': [ 'content' ],
	'dfb/button': [ 'text', 'url' ],
	'dfb/image': [ 'url', 'alt' ],
	'dfb/link-wrapper': [ 'url' ],
};

export const ATTR_LABELS = {
	content: __( 'Text', 'df-builder' ),
	text: __( 'Text', 'df-builder' ),
	url: __( 'URL / image', 'df-builder' ),
	alt: __( 'Alt text', 'df-builder' ),
};

/**
 * Sources. `fields` → select; `arg` is the args key. `free` → text input instead of select.
 */
export const SOURCES = {
	'dfb/post': {
		label: __( 'Post field', 'df-builder' ),
		arg: 'field',
		fields: {
			title: __( 'Title', 'df-builder' ),
			excerpt: __( 'Excerpt', 'df-builder' ),
			date: __( 'Publish date', 'df-builder' ),
			modified: __( 'Modified date', 'df-builder' ),
			permalink: __( 'Permalink', 'df-builder' ),
			featured_image: __( 'Featured image URL', 'df-builder' ),
			featured_image_alt: __( 'Featured image alt', 'df-builder' ),
			comment_count: __( 'Comment count', 'df-builder' ),
			id: __( 'ID', 'df-builder' ),
		},
	},
	'dfb/meta': {
		label: __( 'Custom field', 'df-builder' ),
		arg: 'key',
		free: __( 'Meta key', 'df-builder' ),
	},
	'dfb/acf': {
		label: __( 'ACF field', 'df-builder' ),
		arg: 'field',
		free: __( 'Field name', 'df-builder' ),
		requiresAcf: true,
	},
	'dfb/author': {
		label: __( 'Author', 'df-builder' ),
		arg: 'field',
		fields: {
			name: __( 'Display name', 'df-builder' ),
			description: __( 'Bio', 'df-builder' ),
			url: __( 'Archive URL', 'df-builder' ),
			avatar: __( 'Avatar URL', 'df-builder' ),
		},
	},
	'dfb/site': {
		label: __( 'Site', 'df-builder' ),
		arg: 'field',
		fields: {
			title: __( 'Site title', 'df-builder' ),
			tagline: __( 'Tagline', 'df-builder' ),
			url: __( 'Home URL', 'df-builder' ),
			year: __( 'Current year', 'df-builder' ),
		},
	},
};

export function availableSources() {
	return Object.entries( SOURCES ).filter(
		( [ , s ] ) => ! s.requiresAcf || window.dfbData?.acfActive
	);
}

/**
 * Human label for a binding, e.g. "Post field: Title".
 * @param binding
 */
export function bindingLabel( binding ) {
	const src = SOURCES[ binding?.source ];
	if ( ! src ) {
		return null;
	}
	const v = binding.args?.[ src.arg ];
	const name = src.fields?.[ v ] || v || '?';
	return `${ src.label }: ${ name }`;
}

/**
 * For DF Builder blocks: placeholder text when an attribute is bound.
 * @param attributes
 * @param attr
 */
export function boundPlaceholder( attributes, attr ) {
	const binding = attributes?.metadata?.bindings?.[ attr ];
	return binding?.source?.startsWith( 'dfb/' )
		? `{ ${ bindingLabel( binding ) } }`
		: null;
}
