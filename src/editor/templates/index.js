import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { useSelect } from '@wordpress/data';
import { useEntityProp, store as coreStore } from '@wordpress/core-data';
import {
	SelectControl,
	TextControl,
	Button,
	Notice,
} from '@wordpress/components';
import { RULES, TYPE_PRESETS } from './rules';

const NumberField = ( props ) => (
	<TextControl __nextHasNoMarginBottom type="number" { ...props } />
);

const META_TYPE = '_dfb_type';
const META_CONDITIONS = '_dfb_conditions';
const META_PRIORITY = '_dfb_priority';

function ValueInput( { rule, value, onChange } ) {
	const def = RULES[ rule.rule ];
	const postTypes = useSelect(
		( select ) =>
			def?.input === 'postType'
				? (
						select( coreStore ).getPostTypes( { per_page: -1 } ) ||
						[]
				  ).filter( ( pt ) => pt.viewable && pt.slug !== 'attachment' )
				: [],
		[ def?.input ]
	);
	if ( ! def || def.input === 'none' ) {
		return null;
	}
	if ( def.input === 'postType' ) {
		return (
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Post type', 'df-builder' ) }
				value={ value }
				options={ [
					{ label: __( 'Any', 'df-builder' ), value: '' },
					...postTypes.map( ( pt ) => ( {
						label: pt.name,
						value: pt.slug,
					} ) ),
				] }
				onChange={ onChange }
			/>
		);
	}
	if ( def.input === 'yesno' ) {
		return (
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Logged in?', 'df-builder' ) }
				value={ value || 'yes' }
				options={ [
					{ label: __( 'Yes', 'df-builder' ), value: 'yes' },
					{ label: __( 'No', 'df-builder' ), value: 'no' },
				] }
				onChange={ onChange }
			/>
		);
	}
	return (
		<TextControl
			__nextHasNoMarginBottom
			label={ __( 'Value', 'df-builder' ) }
			help={ def.help }
			value={ value }
			onChange={ onChange }
		/>
	);
}

function TemplateSettings() {
	const postType = useSelect(
		( select ) => select( editorStore ).getCurrentPostType(),
		[]
	);
	const [ meta, setMeta ] = useEntityProp( 'postType', postType, 'meta' );

	if ( postType !== window.dfbData?.templatePostType || ! meta ) {
		return null;
	}

	const type = meta[ META_TYPE ] || 'content';
	const rules = Array.isArray( meta[ META_CONDITIONS ] )
		? meta[ META_CONDITIONS ]
		: [];
	const priority = meta[ META_PRIORITY ] ?? 10;

	const set = ( patch ) => setMeta( { ...meta, ...patch } );
	const setRules = ( next ) => set( { [ META_CONDITIONS ]: next } );
	const updateRule = ( i, patch ) =>
		setRules(
			rules.map( ( r, j ) => ( j === i ? { ...r, ...patch } : r ) )
		);

	return (
		<PluginDocumentSettingPanel
			name="dfb-template"
			title={ __( 'Template settings', 'df-builder' ) }
			className="dfb-rules"
		>
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Template type', 'df-builder' ) }
				value={ type }
				options={ [
					{ label: __( 'Header', 'df-builder' ), value: 'header' },
					{
						label: __( 'Content (body)', 'df-builder' ),
						value: 'content',
					},
					{ label: __( 'Footer', 'df-builder' ), value: 'footer' },
				] }
				onChange={ ( v ) =>
					set( {
						[ META_TYPE ]: v,
						// Seed sensible conditions the first time.
						...( rules.length
							? {}
							: { [ META_CONDITIONS ]: TYPE_PRESETS[ v ] } ),
					} )
				}
			/>
			{ type === 'content' && (
				<p className="components-base-control__help">
					{ __(
						'Add a "Post Content" block where the page/post content should appear. For archives, use a Query Loop block.',
						'df-builder'
					) }
				</p>
			) }

			<h3>{ __( 'Display conditions', 'df-builder' ) }</h3>
			{ ! rules.some( ( r ) => r.mode !== 'exclude' ) && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'No "include" rule — this template is not used anywhere yet.',
						'df-builder'
					) }
				</Notice>
			) }

			{ rules.map( ( rule, i ) => (
				<div
					key={ i }
					className={
						'dfb-rule' +
						( rule.mode === 'exclude' ? ' is-exclude' : '' )
					}
				>
					<div className="dfb-rule__head">
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Mode', 'df-builder' ) }
							value={ rule.mode || 'include' }
							options={ [
								{
									label: __( 'Include', 'df-builder' ),
									value: 'include',
								},
								{
									label: __( 'Exclude', 'df-builder' ),
									value: 'exclude',
								},
							] }
							onChange={ ( mode ) => updateRule( i, { mode } ) }
						/>
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Rule', 'df-builder' ) }
							value={ rule.rule }
							options={ Object.entries( RULES ).map(
								( [ value, r ] ) => ( {
									value,
									label: r.label,
								} )
							) }
							onChange={ ( r ) =>
								updateRule( i, { rule: r, value: '' } )
							}
						/>
					</div>
					<ValueInput
						rule={ rule }
						value={ rule.value || '' }
						onChange={ ( value ) => updateRule( i, { value } ) }
					/>
					<Button
						variant="link"
						isDestructive
						onClick={ () =>
							setRules( rules.filter( ( _r, j ) => j !== i ) )
						}
					>
						{ __( 'Remove rule', 'df-builder' ) }
					</Button>
				</div>
			) ) }

			<Button
				variant="secondary"
				onClick={ () =>
					setRules( [
						...rules,
						{ mode: 'include', rule: 'entire_site', value: '' },
					] )
				}
			>
				{ __( 'Add rule', 'df-builder' ) }
			</Button>

			<div style={ { marginTop: 16 } }>
				<NumberField
					label={ __( 'Priority', 'df-builder' ) }
					help={ __(
						'When several templates of the same type match, the highest priority wins; ties go to the more specific rule.',
						'df-builder'
					) }
					value={ priority }
					onChange={ ( v ) =>
						set( { [ META_PRIORITY ]: parseInt( v, 10 ) || 0 } )
					}
				/>
			</div>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'dfb-template-settings', { render: TemplateSettings } );
