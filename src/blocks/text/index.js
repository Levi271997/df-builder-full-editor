import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { boundPlaceholder } from '../../editor/bindings/config';
import { registerDfbBlock, tagOptions, safeTag } from '../shared';
import metadata from './block.json';

const TAGS = [ 'p', 'span', 'div', 'blockquote' ];

function Edit( { attributes, setAttributes } ) {
	const Tag = safeTag( attributes.tagName, TAGS, 'p' );
	const bound = boundPlaceholder( attributes, 'content' );
	const blockProps = useBlockProps( { className: 'dfb-text' } );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Text', 'df-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'df-builder' ) }
						value={ Tag }
						options={ tagOptions( TAGS ) }
						onChange={ ( tagName ) => setAttributes( { tagName } ) }
					/>
				</PanelBody>
			</InspectorControls>
			{ bound ? (
				<Tag { ...blockProps }>{ bound }</Tag>
			) : (
				<RichText
					{ ...blockProps }
					tagName={ Tag }
					value={ attributes.content }
					onChange={ ( content ) => setAttributes( { content } ) }
					placeholder={ __( 'Write text…', 'df-builder' ) }
				/>
			) }
		</>
	);
}

registerDfbBlock( metadata, Edit );
