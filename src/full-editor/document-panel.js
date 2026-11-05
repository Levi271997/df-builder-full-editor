/**
 * Right panel when nothing is selected: page/post settings, or template settings for templates.
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ExternalLink,
} from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import TemplateFields from '../editor/templates/fields';

const STATUSES = [
	{ value: 'draft', label: __( 'Draft', 'df-builder' ) },
	{ value: 'pending', label: __( 'Pending review', 'df-builder' ) },
	{ value: 'private', label: __( 'Private', 'df-builder' ) },
	{ value: 'publish', label: __( 'Published', 'df-builder' ) },
];

export default function DocumentPanel( { config, doc } ) {
	const r = doc.record || {};
	const isTemplate = config.postType === window.dfbData?.templatePostType;
	const title = typeof r.title === 'string' ? r.title : r.title?.raw || '';
	const wpEditUrl = addQueryArgs( config.adminUrl + 'post.php', {
		post: config.postId,
		action: 'edit',
	} );

	return (
		<div className="dfb-fe-document">
			<PanelBody
				title={
					isTemplate
						? __( 'Template', 'df-builder' )
						: __( 'Page settings', 'df-builder' )
				}
			>
				<TextControl
					__nextHasNoMarginBottom
					label={ __( 'Title', 'df-builder' ) }
					value={ title }
					onChange={ ( v ) => doc.edit( { title: v } ) }
				/>
				{ ! isTemplate && (
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Slug', 'df-builder' ) }
						value={ r.slug || '' }
						onChange={ ( v ) => doc.edit( { slug: v } ) }
					/>
				) }
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Status', 'df-builder' ) }
					help={
						isTemplate
							? __(
									'Only published templates are used on the site.',
									'df-builder'
							  )
							: undefined
					}
					value={ r.status || 'draft' }
					options={ STATUSES }
					onChange={ ( v ) => doc.edit( { status: v } ) }
				/>
				{ r.link && ! isTemplate && (
					<p>
						<ExternalLink href={ r.link }>
							{ __( 'View on site', 'df-builder' ) }
						</ExternalLink>
					</p>
				) }
				<p>
					<a href={ wpEditUrl }>
						{ __( 'Open in the WordPress editor', 'df-builder' ) }
					</a>
				</p>
			</PanelBody>
			{ isTemplate && r.meta && (
				<PanelBody title={ __( 'Template settings', 'df-builder' ) }>
					<TemplateFields
						meta={ r.meta }
						setMeta={ ( meta ) => doc.edit( { meta } ) }
					/>
				</PanelBody>
			) }
			<p className="dfb-fe__empty">
				{ __(
					'Select an element to edit its settings and styles.',
					'df-builder'
				) }
			</p>
		</div>
	);
}
