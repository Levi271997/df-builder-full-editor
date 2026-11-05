import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { registerDfbBlock, tagOptions, safeTag } from '../shared';
import metadata from './block.json';

export const TAGS = [
	'div',
	'article',
	'aside',
	'nav',
	'main',
	'header',
	'footer',
	'figure',
	'ul',
	'ol',
	'li',
	'span',
];

function Edit( { attributes, setAttributes, clientId } ) {
	const Tag = safeTag( attributes.tagName, TAGS, 'div' );
	const hasChildren = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ) > 0,
		[ clientId ]
	);
	const blockProps = useBlockProps( {
		className: 'dfb-div' + ( hasChildren ? '' : ' dfb-is-empty' ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: hasChildren
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Div', 'df-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'df-builder' ) }
						value={ Tag }
						options={ tagOptions( TAGS ) }
						onChange={ ( tagName ) => setAttributes( { tagName } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<Tag { ...innerBlocksProps } />
		</>
	);
}

registerDfbBlock( metadata, Edit, true );
