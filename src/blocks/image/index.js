import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextareaControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { boundPlaceholder } from '../../editor/bindings/config';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit( { attributes, setAttributes } ) {
	const { id, url, alt, sizeSlug, loading } = attributes;
	const boundUrl = boundPlaceholder( attributes, 'url' );
	const blockProps = useBlockProps( { className: 'dfb-image' } );

	const media = useSelect(
		( select ) =>
			id ? select( coreStore ).getMedia( id, { context: 'view' } ) : null,
		[ id ]
	);
	const sizes = media?.media_details?.sizes || {};
	const src = sizes[ sizeSlug ]?.source_url || url;

	const onSelect = ( m ) =>
		setAttributes( { id: m.id, url: m.url, alt: alt || m.alt || '' } );

	const inspector = (
		<InspectorControls>
			<PanelBody title={ __( 'Image', 'df-builder' ) }>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Alternative text', 'df-builder' ) }
					value={ alt }
					onChange={ ( v ) => setAttributes( { alt: v } ) }
				/>
				{ id && Object.keys( sizes ).length > 0 && (
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Image size', 'df-builder' ) }
						value={ sizeSlug }
						options={ Object.keys( sizes ).map( ( s ) => ( {
							label: s,
							value: s,
						} ) ) }
						onChange={ ( v ) => setAttributes( { sizeSlug: v } ) }
					/>
				) }
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Loading', 'df-builder' ) }
					value={ loading }
					options={ [
						{ label: __( 'Lazy', 'df-builder' ), value: 'lazy' },
						{
							label: __( 'Eager (above the fold)', 'df-builder' ),
							value: 'eager',
						},
					] }
					onChange={ ( v ) => setAttributes( { loading: v } ) }
				/>
			</PanelBody>
		</InspectorControls>
	);

	if ( boundUrl ) {
		return (
			<>
				{ inspector }
				<div { ...blockProps }>
					<div className="dfb-image-bound">{ boundUrl }</div>
				</div>
			</>
		);
	}

	if ( ! src ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="format-image"
					labels={ { title: __( 'Image', 'df-builder' ) } }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					onSelect={ onSelect }
					onSelectURL={ ( u ) =>
						setAttributes( { id: undefined, url: u } )
					}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={ id }
					mediaURL={ url }
					allowedTypes={ [ 'image' ] }
					accept="image/*"
					onSelect={ onSelect }
					onSelectURL={ ( u ) =>
						setAttributes( { id: undefined, url: u } )
					}
				/>
			</BlockControls>
			{ inspector }
			<img { ...blockProps } src={ src } alt={ alt } />
		</>
	);
}

registerDfbBlock( metadata, Edit );
