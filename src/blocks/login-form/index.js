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
				<PanelBody title={ __( 'Login form', 'df-builder' ) }>
					<TextControl
						__nextHasNoMarginBottom
						type="url"
						label={ __( 'Redirect after login', 'df-builder' ) }
						help={ __(
							'Leave empty to stay on the same page.',
							'df-builder'
						) }
						value={ attributes.redirect }
						onChange={ ( redirect ) =>
							setAttributes( { redirect } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( '“Remember me” checkbox', 'df-builder' ) }
						checked={ attributes.showRemember }
						onChange={ ( showRemember ) =>
							setAttributes( { showRemember } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'“Lost your password?” link',
							'df-builder'
						) }
						checked={ attributes.showLostPassword }
						onChange={ ( showLostPassword ) =>
							setAttributes( { showLostPassword } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Text when logged in', 'df-builder' ) }
						value={ attributes.loggedInText }
						onChange={ ( loggedInText ) =>
							setAttributes( { loggedInText } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<SsrPreview { ...props } />
		</>
	);
}

registerDfbBlock( metadata, Edit );
