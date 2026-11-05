import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { boundPlaceholder } from '../../editor/bindings/config';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit( { attributes, setAttributes } ) {
	const boundUrl = boundPlaceholder( attributes, 'url' );
	const blockProps = useBlockProps( { className: 'dfb-link-wrapper' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: [ [ 'dfb/heading', { level: 3 } ], [ 'dfb/text' ] ],
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Link', 'df-builder' ) }>
					{ boundUrl ? (
						<p>{ boundUrl }</p>
					) : (
						<TextControl
							__nextHasNoMarginBottom
							type="url"
							label={ __( 'URL', 'df-builder' ) }
							value={ attributes.url }
							onChange={ ( url ) => setAttributes( { url } ) }
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Open in new tab', 'df-builder' ) }
						checked={ attributes.opensInNewTab }
						onChange={ ( v ) =>
							setAttributes( { opensInNewTab: v } )
						}
					/>
					<p className="components-base-control__help">
						{ __(
							'Do not put buttons or other links inside a link wrapper.',
							'df-builder'
						) }
					</p>
				</PanelBody>
			</InspectorControls>
			{ /* Rendered as a div in the editor so inner blocks stay editable. */ }
			<div { ...innerBlocksProps } />
		</>
	);
}

registerDfbBlock( metadata, Edit, true );
