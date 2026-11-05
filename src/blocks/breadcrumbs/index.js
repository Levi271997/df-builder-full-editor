import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( { className: 'dfb-breadcrumbs' } );
	// The real trail depends on the page being viewed, so the editor shows a sample.
	const sample = [
		attributes.homeLabel || __( 'Home', 'df-builder' ),
		__( 'Parent', 'df-builder' ),
		...( attributes.showCurrent
			? [ __( 'Current page', 'df-builder' ) ]
			: [] ),
	];
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Breadcrumbs', 'df-builder' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Home label', 'df-builder' ) }
						value={ attributes.homeLabel }
						onChange={ ( homeLabel ) =>
							setAttributes( { homeLabel } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Separator', 'df-builder' ) }
						value={ attributes.separator }
						onChange={ ( separator ) =>
							setAttributes( { separator } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show current page', 'df-builder' ) }
						checked={ attributes.showCurrent }
						onChange={ ( showCurrent ) =>
							setAttributes( { showCurrent } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<nav { ...blockProps }>
				<ol>
					{ sample.map( ( label, i ) => (
						<li key={ i } className="dfb-breadcrumbs__item">
							{ i < sample.length - 1 ? (
								// eslint-disable-next-line jsx-a11y/anchor-is-valid
								<a
									href="#"
									onClick={ ( e ) => e.preventDefault() }
								>
									{ label }
								</a>
							) : (
								<span>{ label }</span>
							) }
							{ i < sample.length - 1 && (
								<span
									className="dfb-breadcrumbs__sep"
									aria-hidden="true"
								>
									{ ' ' }
									{ attributes.separator }{ ' ' }
								</span>
							) }
						</li>
					) ) }
				</ol>
			</nav>
		</>
	);
}

registerDfbBlock( metadata, Edit );
