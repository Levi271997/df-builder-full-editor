import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	TextControl,
	Button,
	Dropdown,
	ColorIndicator,
	ColorPalette,
	BaseControl,
} from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	useSettings,
} from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { sanitizeValue } from '../../shared/css-generator';

/**
 * Text input that commits on blur/Enter (so typing "1" → "10px" doesn't spam history),
 * and flags invalid values instead of silently dropping them.
 */
function CommitInput( { def, value, placeholder, onChange, hideLabel } ) {
	const [ draft, setDraft ] = useState( value ?? '' );
	useEffect( () => setDraft( value ?? '' ), [ value ] );
	const invalid = draft !== '' && sanitizeValue( def, draft ) === null;
	const commit = () => {
		if ( draft !== ( value ?? '' ) ) {
			onChange( draft );
		}
	};
	return (
		<TextControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize={ false }
			className={ 'dfb-control' + ( invalid ? ' is-invalid' : '' ) }
			label={ def.label }
			hideLabelFromVision={ hideLabel }
			value={ draft }
			placeholder={ placeholder ?? def.placeholder ?? '' }
			onChange={ setDraft }
			onBlur={ commit }
			onKeyDown={ ( e ) => e.key === 'Enter' && commit() }
			help={
				invalid
					? __( 'Invalid value — it will be ignored.', 'df-builder' )
					: undefined
			}
		/>
	);
}

function KeywordControl( { def, value, placeholder, onChange } ) {
	return (
		<SelectControl
			__nextHasNoMarginBottom
			className="dfb-control"
			label={ def.label }
			value={ value ?? '' }
			options={ [
				{
					label: placeholder ? `— (${ placeholder })` : '—',
					value: '',
				},
				...def.options.map( ( o ) => ( { label: o, value: o } ) ),
			] }
			onChange={ onChange }
		/>
	);
}

function ColorControl( { def, value, placeholder, onChange } ) {
	const id = useInstanceId( ColorControl, 'dfb-color' );
	const [ palette ] = useSettings( 'color.palette' );
	const colors = ( palette || [] ).map( ( c ) => ( {
		...c,
		// Prefer the preset variable so palette changes propagate.
		color: c.slug ? `var(--wp--preset--color--${ c.slug })` : c.color,
		swatch: c.color,
	} ) );
	const swatch = ( v ) =>
		colors.find( ( c ) => c.color === v )?.swatch || v || placeholder;

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id={ id }
			label={ def.label }
			className="dfb-control dfb-color"
		>
			<div className="dfb-color__row">
				<Dropdown
					popoverProps={ { placement: 'left-start' } }
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button
							className="dfb-color__toggle"
							onClick={ onToggle }
							aria-expanded={ isOpen }
							label={ __( 'Pick color', 'df-builder' ) }
						>
							<ColorIndicator colorValue={ swatch( value ) } />
						</Button>
					) }
					renderContent={ () => (
						<div className="dfb-color__popover">
							<ColorPalette
								colors={ colors.map( ( c ) => ( {
									name: c.name,
									color: c.swatch,
								} ) ) }
								value={ swatch( value ) }
								enableAlpha
								onChange={ ( v ) => {
									const preset = colors.find(
										( c ) => c.swatch === v
									);
									onChange( preset ? preset.color : v || '' );
								} }
							/>
						</div>
					) }
				/>
				<CommitInput
					def={ def }
					value={ value }
					placeholder={ placeholder }
					onChange={ onChange }
					hideLabel
				/>
			</div>
		</BaseControl>
	);
}

function UrlControl( { def, value, placeholder, onChange } ) {
	return (
		<div className="dfb-control dfb-url">
			<CommitInput
				def={ def }
				value={ value }
				placeholder={ placeholder }
				onChange={ onChange }
			/>
			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={ [ 'image' ] }
					onSelect={ ( media ) => onChange( media.url ) }
					render={ ( { open } ) => (
						<Button
							variant="secondary"
							size="small"
							onClick={ open }
						>
							{ __( 'Media library', 'df-builder' ) }
						</Button>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}

export function PropertyControl( props ) {
	switch ( props.def.type ) {
		case 'keyword':
			return <KeywordControl { ...props } />;
		case 'color':
			return <ColorControl { ...props } />;
		case 'url':
			return <UrlControl { ...props } />;
		default:
			return <CommitInput { ...props } />;
	}
}

const SIDES = [ 'Top', 'Right', 'Bottom', 'Left' ];

/**
 * Oxygen-like padding/margin box: four inputs.
 */
export function BoxControl( {
	box,
	defs,
	getValue,
	getPlaceholder,
	onChange,
} ) {
	const byKey = Object.fromEntries( defs.map( ( d ) => [ d.key, d ] ) );
	return (
		<fieldset className="dfb-box">
			<legend>
				{ box === 'padding'
					? __( 'Padding', 'df-builder' )
					: __( 'Margin', 'df-builder' ) }
			</legend>
			<div className="dfb-box__grid">
				{ SIDES.map( ( side ) => {
					const def = byKey[ box + side ];
					return def ? (
						<CommitInput
							key={ def.key }
							def={ { ...def, label: side } }
							value={ getValue( def.key ) }
							placeholder={ getPlaceholder( def.key ) }
							onChange={ ( v ) => onChange( def.key, v ) }
						/>
					) : null;
				} ) }
			</div>
		</fieldset>
	);
}
