import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { registerDfbBlock, tagOptions, safeTag } from '../shared';
import metadata from './block.json';

export const TAGS = [ 'section', 'header', 'footer', 'div', 'main', 'aside' ];

function Edit( { attributes, setAttributes } ) {
	const Tag = safeTag( attributes.tagName, TAGS, 'section' );
	const blockProps = useBlockProps( {
		className:
			'dfb-section' +
			( attributes.contained ? ' dfb-section--contained' : '' ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: [ [ 'dfb/div' ] ],
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Section', 'df-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'df-builder' ) }
						value={ Tag }
						options={ tagOptions( TAGS ) }
						onChange={ ( tagName ) => setAttributes( { tagName } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Contain content to page width',
							'df-builder'
						) }
						help={ __(
							'Background stays full width; content is limited to the page width set in DF Builder → Settings.',
							'df-builder'
						) }
						checked={ attributes.contained }
						onChange={ ( contained ) =>
							setAttributes( { contained } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<Tag { ...innerBlocksProps } />
		</>
	);
}

registerDfbBlock( metadata, Edit, true );
