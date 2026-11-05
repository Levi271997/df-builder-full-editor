import { __ } from '@wordpress/i18n';
import { useBlockProps, PlainText } from '@wordpress/block-editor';
import { registerDfbBlock } from '../shared';
import SsrPreview from '../ssr-preview';
import metadata from './block.json';

function Edit( props ) {
	const { attributes, setAttributes, isSelected } = props;
	const blockProps = useBlockProps( { className: 'dfb-shortcode-editor' } );
	if ( isSelected || ! attributes.text ) {
		return (
			<div { ...blockProps }>
				<PlainText
					className="dfb-code__editor"
					value={ attributes.text }
					onChange={ ( text ) => setAttributes( { text } ) }
					placeholder={ __(
						'[your_shortcode id="1"]',
						'df-builder'
					) }
				/>
			</div>
		);
	}
	return <SsrPreview { ...props } />;
}

registerDfbBlock( metadata, Edit );
