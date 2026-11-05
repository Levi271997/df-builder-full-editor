/**
 * Attach DF Builder to blocks: `dfb` attribute, live CSS, wrapper classes, style + data panels.
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect, useDispatch, select as wpSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { isSupported, CORE_SUPPORTED } from './supported-blocks';
import { STORE } from './store';
import {
	generateCss,
	blockSelector,
	isValidUid,
	isValidClassName,
	newUid,
	DEFAULT_BREAKPOINTS,
} from '../shared/css-generator';
import StylePanel from './style-panel';
import BindingsPanel from './bindings/panel';

const breakpoints = () => window.dfbData?.breakpoints || DEFAULT_BREAKPOINTS;

/* 1. Attribute on supported core blocks ------------------------------------------------- */
addFilter( 'blocks.registerBlockType', 'dfb/attribute', ( settings, name ) => {
	if ( CORE_SUPPORTED.includes( name ) && ! settings.attributes?.dfb ) {
		settings.attributes = {
			...settings.attributes,
			dfb: { type: 'object' },
		};
	}
	return settings;
} );

/* 2. Unique ids: regenerate when a block was duplicated / pasted ------------------------- */
const owners = new Map(); // uid → clientId

function useUniqueUid( clientId, dfb, setAttributes ) {
	const { __unstableMarkNextChangeAsNotPersistent: markNotPersistent } =
		useDispatch( blockEditorStore );
	const uid = dfb?.uid;
	useEffect( () => {
		if ( ! uid ) {
			return;
		}
		const owner = owners.get( uid );
		const clash =
			owner &&
			owner !== clientId &&
			!! wpSelect( blockEditorStore ).getBlock( owner );
		if ( clash || ! isValidUid( uid ) ) {
			const next = newUid();
			owners.set( next, clientId );
			markNotPersistent?.();
			setAttributes( { dfb: { ...dfb, uid: next } } );
			return;
		}
		owners.set( uid, clientId );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ uid, clientId ] );
}

/* 3. Live CSS + panels -------------------------------------------------------------------- */
function useBlockCss( dfb ) {
	const classCss = useSelect(
		( select ) => {
			const ids = dfb?.classes || [];
			return ids
				.map( ( id ) => select( STORE ).getClass( id ) )
				.filter( ( c ) => c && isValidClassName( c.name ) )
				.map( ( c ) =>
					generateCss( '.' + c.name, c.styles, breakpoints() )
				)
				.join( '' );
		},
		[ dfb?.classes ]
	);
	const own =
		dfb?.uid && isValidUid( dfb.uid )
			? generateCss( blockSelector( dfb.uid ), dfb.styles, breakpoints() )
			: '';
	// Classes first so block-level styles win (same specificity, later rule).
	return classCss + own;
}

const withDfbEdit = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const supported = isSupported( props.name );
		const dfb = supported ? props.attributes.dfb : undefined;
		useUniqueUid( props.clientId, dfb, props.setAttributes );
		const css = useBlockCss( dfb );

		if ( ! supported ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<>
				<BlockEdit { ...props } />
				{ css && <style>{ css }</style> }
				{ props.isSelected && (
					<>
						<InspectorControls group="styles">
							<StylePanel { ...props } />
						</InspectorControls>
						<InspectorControls>
							<BindingsPanel { ...props } />
						</InspectorControls>
					</>
				) }
			</>
		);
	},
	'withDfbEdit'
);
addFilter( 'editor.BlockEdit', 'dfb/edit', withDfbEdit );

/* 4. Wrapper classes in the canvas -------------------------------------------------------- */
const withDfbClassName = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const dfb = isSupported( props.name )
			? props.attributes?.dfb
			: undefined;
		const names = useSelect(
			( select ) =>
				dfb?.classes?.length
					? select( STORE ).getClassNames( dfb.classes )
					: '',
			[ dfb?.classes ]
		);
		if ( ! dfb ) {
			return <BlockListBlock { ...props } />;
		}
		const className = [
			props.className,
			dfb.uid && isValidUid( dfb.uid ) ? 'dfb-' + dfb.uid : '',
			names,
		]
			.filter( Boolean )
			.join( ' ' );
		return <BlockListBlock { ...props } className={ className } />;
	},
	'withDfbClassName'
);
addFilter( 'editor.BlockListBlock', 'dfb/class-name', withDfbClassName );
