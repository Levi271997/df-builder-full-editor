import { __ } from '@wordpress/i18n';

/**
 * Keep keys in sync with Conditions::RULES (includes/class-conditions.php).
 * `input`: none | postType | yesno | text.
 */
export const RULES = {
	entire_site: { label: __( 'Entire site', 'df-builder' ), input: 'none' },
	front_page: { label: __( 'Front page', 'df-builder' ), input: 'none' },
	blog_home: { label: __( 'Blog posts page', 'df-builder' ), input: 'none' },
	singular: {
		label: __( 'Single (post type)', 'df-builder' ),
		input: 'postType',
	},
	post_id: {
		label: __( 'Specific posts / pages', 'df-builder' ),
		input: 'text',
		help: __( 'Comma-separated IDs, e.g. 12, 40', 'df-builder' ),
	},
	in_term: {
		label: __( 'Single in term', 'df-builder' ),
		input: 'text',
		help: __(
			'taxonomy:term — e.g. category:news or category:12',
			'df-builder'
		),
	},
	archive: { label: __( 'Any archive', 'df-builder' ), input: 'none' },
	post_type_archive: {
		label: __( 'Post type archive', 'df-builder' ),
		input: 'postType',
	},
	taxonomy_archive: {
		label: __( 'Taxonomy archive', 'df-builder' ),
		input: 'text',
		help: __(
			'taxonomy, or taxonomy:term — e.g. category or category:news',
			'df-builder'
		),
	},
	author_archive: {
		label: __( 'Author archive', 'df-builder' ),
		input: 'none',
	},
	date_archive: { label: __( 'Date archive', 'df-builder' ), input: 'none' },
	search: { label: __( 'Search results', 'df-builder' ), input: 'none' },
	not_found: { label: __( '404 page', 'df-builder' ), input: 'none' },
	logged_in: {
		label: __( 'Visitor logged in', 'df-builder' ),
		input: 'yesno',
	},
	user_role: {
		label: __( 'Visitor role', 'df-builder' ),
		input: 'text',
		help: __( 'Role slug, e.g. administrator, subscriber', 'df-builder' ),
	},
};

export const TYPE_PRESETS = {
	header: [ { mode: 'include', rule: 'entire_site', value: '' } ],
	footer: [ { mode: 'include', rule: 'entire_site', value: '' } ],
	content: [],
};
