import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	BlockControls,
	// No stable alternative yet; used by core blocks too.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToolbarButton,
	Popover,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { boundPlaceholder } from '../../editor/bindings/config';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit( { attributes, setAttributes } ) {
	const [ anchor, setAnchor ] = useState( null );
	const [ open, setOpen ] = useState( false );
	const boundText = boundPlaceholder( attributes, 'text' );
	const boundUrl = boundPlaceholder( attributes, 'url' );
	const variant = [ 'primary', 'secondary', 'outline', 'none' ].includes(
		attributes.variant
	)
		? attributes.variant
		: 'primary';
	const blockProps = useBlockProps( {
		className:
			'dfb-button' +
			( variant !== 'none' ? ' dfb-button--' + variant : '' ),
		ref: setAnchor,
	} );

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					icon="admin-links"
					label={ __( 'Link', 'df-builder' ) }
					onClick={ () => setOpen( ! open ) }
					isPressed={ !! attributes.url }
					disabled={ !! boundUrl }
				/>
			</BlockControls>
			{ open && ! boundUrl && (
				<Popover
					anchor={ anchor }
					onClose={ () => setOpen( false ) }
					placement="bottom"
				>
					<LinkControl
						value={ {
							url: attributes.url,
							opensInNewTab: attributes.opensInNewTab,
						} }
						onChange={ ( { url, opensInNewTab } ) =>
							setAttributes( {
								url: url || '',
								opensInNewTab: !! opensInNewTab,
							} )
						}
						onRemove={ () =>
							setAttributes( { url: '', opensInNewTab: false } )
						}
					/>
				</Popover>
			) }
			<InspectorControls>
				<PanelBody title={ __( 'Button', 'df-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Preset', 'df-builder' ) }
						value={ variant }
						options={ [
							{
								label: __( 'Primary', 'df-builder' ),
								value: 'primary',
							},
							{
								label: __( 'Secondary', 'df-builder' ),
								value: 'secondary',
							},
							{
								label: __( 'Outline', 'df-builder' ),
								value: 'outline',
							},
							{
								label: __(
									'None (style it yourself)',
									'df-builder'
								),
								value: 'none',
							},
						] }
						onChange={ ( v ) => setAttributes( { variant: v } ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Link rel', 'df-builder' ) }
						value={ attributes.rel }
						onChange={ ( rel ) => setAttributes( { rel } ) }
					/>
					{ boundUrl && (
						<p className="components-base-control__help">
							{ boundUrl }
						</p>
					) }
				</PanelBody>
			</InspectorControls>
			{ boundText ? (
				<span { ...blockProps }>{ boundText }</span>
			) : (
				<RichText
					{ ...blockProps }
					tagName="span"
					value={ attributes.text }
					onChange={ ( text ) => setAttributes( { text } ) }
					placeholder={ __( 'Button text…', 'df-builder' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
					withoutInteractiveFormatting
				/>
			) }
		</>
	);
}

registerDfbBlock( metadata, Edit );
