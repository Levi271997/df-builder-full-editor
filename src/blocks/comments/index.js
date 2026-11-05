import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { registerDfbBlock } from '../shared';
import SsrPreview from '../ssr-preview';
import metadata from './block.json';

function Edit( props ) {
	const { attributes, setAttributes } = props;
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Comments', 'df-builder' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Title', 'df-builder' ) }
						value={ attributes.title }
						onChange={ ( title ) => setAttributes( { title } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show comment list', 'df-builder' ) }
						checked={ attributes.showList }
						onChange={ ( showList ) =>
							setAttributes( { showList } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show comment form', 'df-builder' ) }
						checked={ attributes.showForm }
						onChange={ ( showForm ) =>
							setAttributes( { showForm } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<SsrPreview { ...props } />
		</>
	);
}

registerDfbBlock( metadata, Edit );
