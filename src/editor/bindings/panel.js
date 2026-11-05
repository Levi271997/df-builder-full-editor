import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { BINDABLE, ATTR_LABELS, SOURCES, availableSources } from './config';

export default function BindingsPanel( { name, attributes, setAttributes } ) {
	const attrs = BINDABLE[ name ];
	if ( ! attrs ) {
		return null;
	}
	const bindings = attributes.metadata?.bindings || {};
	const activeCount = attrs.filter( ( a ) =>
		bindings[ a ]?.source?.startsWith( 'dfb/' )
	).length;

	const update = ( attr, binding ) => {
		const next = { ...bindings };
		if ( binding ) {
			next[ attr ] = binding;
		} else {
			delete next[ attr ];
		}
		const metadata = { ...( attributes.metadata || {} ) };
		if ( Object.keys( next ).length ) {
			metadata.bindings = next;
		} else {
			delete metadata.bindings;
		}
		setAttributes( { metadata } );
	};

	return (
		<PanelBody
			className="dfb-bindings"
			title={
				activeCount
					? `${ __(
							'Dynamic data',
							'df-builder'
					  ) } (${ activeCount })`
					: __( 'Dynamic data', 'df-builder' )
			}
			initialOpen={ activeCount > 0 }
		>
			{ attrs.map( ( attr ) => {
				const b = bindings[ attr ];
				// Leave bindings from other plugins alone.
				const foreign = b?.source && ! b.source.startsWith( 'dfb/' );
				const src = SOURCES[ b?.source ];
				return (
					<div className="dfb-bindings__row" key={ attr }>
						<SelectControl
							__nextHasNoMarginBottom
							label={ ATTR_LABELS[ attr ] || attr }
							value={ foreign ? '' : b?.source || '' }
							disabled={ foreign }
							help={ foreign ? b.source : undefined }
							options={ [
								{
									label: __(
										'Static (not bound)',
										'df-builder'
									),
									value: '',
								},
								...availableSources().map( ( [ key, s ] ) => ( {
									label: s.label,
									value: key,
								} ) ),
							] }
							onChange={ ( source ) => {
								if ( ! source ) {
									update( attr, null );
									return;
								}
								const s = SOURCES[ source ];
								const first = s.fields
									? Object.keys( s.fields )[ 0 ]
									: '';
								update( attr, {
									source,
									args: { [ s.arg ]: first },
								} );
							} }
						/>
						{ src && src.fields && (
							<SelectControl
								__nextHasNoMarginBottom
								label={ __( 'Field', 'df-builder' ) }
								value={ b.args?.[ src.arg ] || '' }
								options={ Object.entries( src.fields ).map(
									( [ value, label ] ) => ( {
										value,
										label,
									} )
								) }
								onChange={ ( v ) =>
									update( attr, {
										...b,
										args: { ...b.args, [ src.arg ]: v },
									} )
								}
							/>
						) }
						{ src && src.free && (
							<TextControl
								__nextHasNoMarginBottom
								label={ src.free }
								value={ b.args?.[ src.arg ] || '' }
								onChange={ ( v ) =>
									update( attr, {
										...b,
										args: {
											...b.args,
											[ src.arg ]: v.trim(),
										},
									} )
								}
							/>
						) }
					</div>
				);
			} ) }
		</PanelBody>
	);
}
