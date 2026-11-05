import { __, sprintf } from '@wordpress/i18n';
import {
	PanelBody,
	SelectControl,
	Button,
	Notice,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import { STORE } from '../store';
import { useEditState } from '../device';
import { defaultDisplay } from '../supported-blocks';
import {
	SCHEMA,
	GROUPS,
	STATES,
	newUid,
	inheritedValue,
} from '../../shared/css-generator';
import { setStyleValue, clearState, hasValues, countInGroup } from './utils';
import { PropertyControl, BoxControl } from './controls';
import ClassPicker from './class-picker';
import './panel.scss';

const STATE_LABELS = {
	base: __( 'Desktop', 'df-builder' ),
	tablet: __( 'Tablet', 'df-builder' ),
	landscape: __( 'Landscape', 'df-builder' ),
	phone: __( 'Phone', 'df-builder' ),
	hover: __( 'Hover', 'df-builder' ),
};

const bp = window.dfbData?.breakpoints || {};
const STATE_HINTS = {
	base: __( 'All screen sizes', 'df-builder' ),
	tablet: sprintf(
		/* translators: %d: px */ __( '≤ %dpx', 'df-builder' ),
		bp.tablet || 992
	),
	landscape: sprintf(
		/* translators: %d: px */ __( '≤ %dpx', 'df-builder' ),
		bp.landscape || 768
	),
	phone: sprintf(
		/* translators: %d: px */ __( '≤ %dpx', 'df-builder' ),
		bp.phone || 480
	),
	hover: __( 'On mouse hover', 'df-builder' ),
};

function isVisible( def, effective ) {
	if ( ! def.when ) {
		return true;
	}
	return Object.entries( def.when ).every( ( [ key, allowed ] ) =>
		allowed.includes( effective( key ) )
	);
}

export default function StylePanel( { name, attributes, setAttributes } ) {
	const dfb = attributes.dfb || {};
	const [ editState, setEditState ] = useEditState();
	const [ target, setTarget ] = useState( 'block' );

	const { blockClasses, targetClass, targetDirty } = useSelect(
		( select ) => {
			const s = select( STORE );
			return {
				blockClasses: ( dfb.classes || [] )
					.map( ( id ) => s.getClass( id ) )
					.filter( Boolean ),
				targetClass: target === 'block' ? null : s.getClass( target ),
				targetDirty:
					target === 'block' ? false : s.isClassDirty( target ),
			};
		},
		[ dfb.classes, target ]
	);
	const { setClassStyles, saveClass } = useDispatch( STORE );
	const canManage = !! window.dfbData?.canManageClasses;

	// Target went away (class removed from block) → fall back to the block.
	const editingClass = target !== 'block' && targetClass;
	const styles = editingClass ? targetClass.styles || {} : dfb.styles || {};

	const writeStyles = ( next ) => {
		if ( editingClass ) {
			setClassStyles( targetClass.id, next );
			return;
		}
		const nextDfb = { ...dfb, styles: next };
		if ( ! nextDfb.uid ) {
			nextDfb.uid = newUid();
		}
		setAttributes( { dfb: nextDfb } );
	};

	const getValue = ( key ) => styles?.[ editState ]?.[ key ];
	const getPlaceholder = ( key ) => inheritedValue( styles, editState, key );
	const effective = ( key ) =>
		getValue( key ) ??
		getPlaceholder( key ) ??
		( key === 'display' ? defaultDisplay( name ) : undefined );
	const onChange = ( key, value ) =>
		writeStyles( setStyleValue( styles, editState, key, value ) );

	const grouped = useMemo( () => {
		const out = {};
		for ( const def of SCHEMA ) {
			( out[ def.group ] = out[ def.group ] || [] ).push( def );
		}
		return out;
	}, [] );

	return (
		<div className="dfb-style-panel">
			<PanelBody title={ __( 'DF Builder', 'df-builder' ) } initialOpen>
				<ClassPicker dfb={ dfb } setAttributes={ setAttributes } />

				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Editing', 'df-builder' ) }
					value={ editingClass ? target : 'block' }
					options={ [
						{
							label: __( 'This block only', 'df-builder' ),
							value: 'block',
						},
						...blockClasses.map( ( c ) => ( {
							label: sprintf(
								/* translators: %s: class name */ __(
									'Class .%s (all blocks using it)',
									'df-builder'
								),
								c.name
							),
							value: c.id,
							disabled: ! canManage,
						} ) ),
					] }
					onChange={ setTarget }
				/>

				{ editingClass && (
					<Notice
						status="info"
						isDismissible={ false }
						className="dfb-class-notice"
					>
						{ sprintf(
							/* translators: %s: class name */ __(
								'Changes apply to every block with .%s.',
								'df-builder'
							),
							targetClass.name
						) }
						{ targetDirty && (
							<Button
								variant="primary"
								size="small"
								onClick={ () => saveClass( targetClass.id ) }
							>
								{ __( 'Save class', 'df-builder' ) }
							</Button>
						) }
					</Notice>
				) }

				<div
					className="dfb-states"
					role="tablist"
					aria-label={ __( 'Breakpoint / state', 'df-builder' ) }
				>
					{ STATES.map( ( s ) => (
						<Button
							key={ s }
							role="tab"
							size="small"
							aria-selected={ editState === s }
							isPressed={ editState === s }
							className={
								hasValues( styles, s ) ? 'has-values' : ''
							}
							onClick={ () => setEditState( s ) }
							title={ STATE_HINTS[ s ] }
						>
							{ STATE_LABELS[ s ] }
						</Button>
					) ) }
				</div>
				<div className="dfb-states__meta">
					<span>{ STATE_HINTS[ editState ] }</span>
					{ hasValues( styles, editState ) && (
						<Button
							variant="link"
							isDestructive
							onClick={ () =>
								writeStyles( clearState( styles, editState ) )
							}
						>
							{ __( 'Reset', 'df-builder' ) }
						</Button>
					) }
				</div>
			</PanelBody>

			{ GROUPS.map( ( group ) => {
				const defs = ( grouped[ group.key ] || [] ).filter( ( d ) =>
					isVisible( d, effective )
				);
				if ( ! defs.length ) {
					return null;
				}
				const count = countInGroup( styles, editState, defs );
				const boxes =
					group.key === 'spacing' ? [ 'padding', 'margin' ] : [];
				return (
					<PanelBody
						key={ group.key }
						title={
							count
								? `${ group.label } (${ count })`
								: group.label
						}
						initialOpen={
							group.key === 'layout' || group.key === 'spacing'
						}
					>
						{ boxes.map( ( box ) => (
							<BoxControl
								key={ box }
								box={ box }
								defs={ defs.filter( ( d ) => d.box === box ) }
								getValue={ getValue }
								getPlaceholder={ getPlaceholder }
								onChange={ onChange }
							/>
						) ) }
						<div className="dfb-grid">
							{ defs
								.filter( ( d ) => ! d.box )
								.map( ( def ) => (
									<PropertyControl
										key={ def.key }
										def={ def }
										value={ getValue( def.key ) }
										placeholder={ getPlaceholder(
											def.key
										) }
										onChange={ ( v ) =>
											onChange( def.key, v )
										}
									/>
								) ) }
						</div>
					</PanelBody>
				);
			} ) }
		</div>
	);
}
