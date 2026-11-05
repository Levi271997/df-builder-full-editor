import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import icons from '../../../schema/icons.json';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

const Svg = ( { name } ) => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path d={ icons[ name ] || icons[ 'arrow-right' ] } />
	</svg>
);

function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( { className: 'dfb-icon' } );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icon', 'df-builder' ) }>
					<div
						style={ {
							display: 'grid',
							gridTemplateColumns: 'repeat(6, 1fr)',
							gap: 4,
						} }
					>
						{ Object.keys( icons ).map( ( name ) => (
							<Button
								key={ name }
								label={ name }
								isPressed={ attributes.icon === name }
								onClick={ () =>
									setAttributes( { icon: name } )
								}
								style={ {
									justifyContent: 'center',
									fontSize: 20,
								} }
							>
								<span
									className="dfb-icon"
									style={ { fontSize: 20 } }
								>
									<Svg name={ name } />
								</span>
							</Button>
						) ) }
					</div>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Accessible label', 'df-builder' ) }
						help={ __(
							'Leave empty if the icon is decorative.',
							'df-builder'
						) }
						value={ attributes.label }
						onChange={ ( label ) => setAttributes( { label } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<span { ...blockProps }>
				<Svg name={ attributes.icon } />
			</span>
		</>
	);
}

registerDfbBlock( metadata, Edit );
