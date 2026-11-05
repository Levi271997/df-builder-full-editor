import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

export const STACK = [ 'none', 'tablet', 'landscape', 'phone' ];

function Edit( { attributes, setAttributes } ) {
	const cols = Math.min(
		12,
		Math.max( 1, parseInt( attributes.columns, 10 ) || 2 )
	);
	const stack = STACK.includes( attributes.stackOn )
		? attributes.stackOn
		: 'landscape';
	const blockProps = useBlockProps( {
		className:
			'dfb-columns' + ( stack !== 'none' ? ' dfb-stack-' + stack : '' ),
		style: { '--dfb-cols': cols },
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: [ [ 'dfb/div' ], [ 'dfb/div' ] ],
		orientation: 'horizontal',
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Grid columns', 'df-builder' ) }>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'df-builder' ) }
						min={ 1 }
						max={ 12 }
						value={ cols }
						onChange={ ( columns ) => setAttributes( { columns } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __(
							'Stack into one column below',
							'df-builder'
						) }
						help={ __(
							'Override per breakpoint with "Grid columns" in the style panel.',
							'df-builder'
						) }
						value={ stack }
						options={ [
							{
								label: __( 'Never', 'df-builder' ),
								value: 'none',
							},
							{
								label: __( 'Tablet', 'df-builder' ),
								value: 'tablet',
							},
							{
								label: __( 'Landscape', 'df-builder' ),
								value: 'landscape',
							},
							{
								label: __( 'Phone', 'df-builder' ),
								value: 'phone',
							},
						] }
						onChange={ ( stackOn ) => setAttributes( { stackOn } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}

registerDfbBlock( metadata, Edit, true );
