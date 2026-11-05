/**
 * "Add" panel: DF Builder elements grouped Oxygen-style; click inserts into/after the selection.
 * "All blocks" switches to the core block library (search + drag and drop).
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blocksStore, createBlock } from '@wordpress/blocks';
import {
	store as blockEditorStore,
	BlockIcon,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- the core inserter library; no stable equivalent.
	__experimentalLibrary as Library,
} from '@wordpress/block-editor';
import { Button, SearchControl } from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element';

export const GROUPS = [
	{
		label: __( 'Layout', 'df-builder' ),
		blocks: [ 'dfb/section', 'dfb/div', 'dfb/columns', 'dfb/link-wrapper' ],
	},
	{
		label: __( 'Basic', 'df-builder' ),
		blocks: [
			'dfb/heading',
			'dfb/text',
			'dfb/button',
			'dfb/image',
			'dfb/icon',
		],
	},
	{
		label: __( 'Dynamic', 'df-builder' ),
		blocks: [
			'dfb/repeater',
			'dfb/post-content',
			'dfb/breadcrumbs',
			'dfb/comments',
		],
	},
	{
		label: __( 'Advanced', 'df-builder' ),
		blocks: [ 'dfb/code', 'dfb/shortcode', 'dfb/login-form' ],
	},
];

/**
 * Insert a block the way Oxygen does: inside the selected container if allowed,
 * otherwise right after the selected element, otherwise at the end of the document.
 */
export function useInsertElement() {
	const { insertBlock } = useDispatch( blockEditorStore );
	const sel = useSelect( ( select ) => select( blockEditorStore ), [] );
	return ( name ) => {
		const block = createBlock( name );
		const selected = sel.getSelectedBlockClientId();
		if ( selected && sel.canInsertBlockType( name, selected ) ) {
			insertBlock( block, undefined, selected );
			return;
		}
		if ( selected ) {
			const root = sel.getBlockRootClientId( selected ) || undefined;
			if ( sel.canInsertBlockType( name, root ) ) {
				insertBlock( block, sel.getBlockIndex( selected ) + 1, root );
				return;
			}
		}
		insertBlock( block );
	};
}

export default function Elements() {
	const [ mode, setMode ] = useState( 'elements' );
	const [ search, setSearch ] = useState( '' );
	const insert = useInsertElement();
	const types = useSelect( ( select ) => {
		const map = {};
		for ( const t of select( blocksStore ).getBlockTypes() ) {
			map[ t.name ] = t;
		}
		return map;
	}, [] );

	const groups = useMemo( () => {
		const q = search.trim().toLowerCase();
		return GROUPS.map( ( g ) => ( {
			...g,
			items: g.blocks
				.map( ( n ) => types[ n ] )
				.filter( Boolean )
				.filter(
					( t ) =>
						! q ||
						t.title.toLowerCase().includes( q ) ||
						( t.keywords || [] ).some( ( k ) =>
							k.toLowerCase().includes( q )
						)
				),
		} ) ).filter( ( g ) => g.items.length );
	}, [ types, search ] );

	return (
		<div className="dfb-fe-elements">
			<div className="dfb-fe-elements__switch" role="tablist">
				<Button
					role="tab"
					aria-selected={ mode === 'elements' }
					isPressed={ mode === 'elements' }
					onClick={ () => setMode( 'elements' ) }
					size="small"
				>
					{ __( 'DF Elements', 'df-builder' ) }
				</Button>
				<Button
					role="tab"
					aria-selected={ mode === 'all' }
					isPressed={ mode === 'all' }
					onClick={ () => setMode( 'all' ) }
					size="small"
				>
					{ __( 'All blocks', 'df-builder' ) }
				</Button>
			</div>

			{ mode === 'all' ? (
				<div className="dfb-fe-elements__library">
					<Library showInserterHelpPanel={ false } />
				</div>
			) : (
				<>
					<SearchControl
						__nextHasNoMarginBottom
						value={ search }
						onChange={ setSearch }
						placeholder={ __( 'Search elements', 'df-builder' ) }
					/>
					{ groups.map( ( g ) => (
						<section
							key={ g.label }
							className="dfb-fe-elements__group"
						>
							<h3>{ g.label }</h3>
							<div className="dfb-fe-elements__grid">
								{ g.items.map( ( t ) => (
									<Button
										key={ t.name }
										className="dfb-fe-elements__item"
										onClick={ () => insert( t.name ) }
										title={ t.description }
									>
										<BlockIcon icon={ t.icon } />
										<span>{ t.title }</span>
									</Button>
								) ) }
							</div>
						</section>
					) ) }
					<p className="dfb-fe-elements__hint">
						{ __(
							'Click to add inside the selected container, or after the selected element. Use “All blocks” to drag blocks onto the canvas.',
							'df-builder'
						) }
					</p>
				</>
			) }
		</div>
	);
}
