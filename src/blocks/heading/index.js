import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarDropdownMenu } from '@wordpress/components';
import { boundPlaceholder } from '../../editor/bindings/config';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit( { attributes, setAttributes } ) {
	const level = Math.min(
		6,
		Math.max( 1, parseInt( attributes.level, 10 ) || 2 )
	);
	const Tag = 'h' + level;
	const bound = boundPlaceholder( attributes, 'content' );
	const blockProps = useBlockProps( { className: 'dfb-heading' } );
	return (
		<>
			<BlockControls group="block">
				<ToolbarDropdownMenu
					icon={
						<strong style={ { fontSize: 13 } }>
							{ 'H' + level }
						</strong>
					}
					label={ __( 'Heading level', 'df-builder' ) }
					controls={ [ 1, 2, 3, 4, 5, 6 ].map( ( l ) => ( {
						title: 'H' + l,
						isActive: l === level,
						onClick: () => setAttributes( { level: l } ),
					} ) ) }
				/>
			</BlockControls>
			{ bound ? (
				<Tag { ...blockProps }>{ bound }</Tag>
			) : (
				<RichText
					{ ...blockProps }
					tagName={ Tag }
					value={ attributes.content }
					onChange={ ( content ) => setAttributes( { content } ) }
					placeholder={ __( 'Heading…', 'df-builder' ) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/link',
						'core/text-color',
					] }
				/>
			) }
		</>
	);
}

registerDfbBlock( metadata, Edit );
