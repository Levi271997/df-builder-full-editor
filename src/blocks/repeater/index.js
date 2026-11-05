import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	RangeControl,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

const STACK = [ 'none', 'tablet', 'landscape', 'phone' ];

const CARD_TEMPLATE = [
	[
		'dfb/link-wrapper',
		{
			metadata: {
				bindings: {
					url: { source: 'dfb/post', args: { field: 'permalink' } },
				},
			},
		},
		[
			[
				'dfb/image',
				{
					metadata: {
						bindings: {
							url: {
								source: 'dfb/post',
								args: { field: 'featured_image' },
							},
						},
					},
				},
			],
			[
				'dfb/heading',
				{
					level: 3,
					metadata: {
						bindings: {
							content: {
								source: 'dfb/post',
								args: { field: 'title' },
							},
						},
					},
				},
			],
			[
				'dfb/text',
				{
					metadata: {
						bindings: {
							content: {
								source: 'dfb/post',
								args: { field: 'excerpt' },
							},
						},
					},
				},
			],
		],
	],
];

function Edit( { attributes: a, setAttributes } ) {
	const cols = Math.min( 6, Math.max( 1, parseInt( a.columns, 10 ) || 3 ) );
	const stack = STACK.includes( a.stackOn ) ? a.stackOn : 'landscape';

	const postTypes = useSelect(
		( select ) =>
			(
				select( coreStore ).getPostTypes( { per_page: -1 } ) || []
			).filter( ( pt ) => pt.viewable && pt.slug !== 'attachment' ),
		[]
	);
	const taxonomies = useSelect(
		( select ) =>
			(
				select( coreStore ).getTaxonomies( { per_page: -1 } ) || []
			).filter(
				( t ) =>
					t.types?.includes( a.postType ) &&
					t.visibility?.publicly_queryable !== false
			),
		[ a.postType ]
	);

	const blockProps = useBlockProps( {
		className:
			'dfb-repeater dfb-columns' +
			( stack !== 'none' ? ' dfb-stack-' + stack : '' ),
		style: { '--dfb-cols': cols },
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'dfb-repeater__item' },
		{ template: CARD_TEMPLATE }
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Query', 'df-builder' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use the page’s main query',
							'df-builder'
						) }
						help={ __(
							'Turn on in archive/search content templates.',
							'df-builder'
						) }
						checked={ a.inherit }
						onChange={ ( inherit ) => setAttributes( { inherit } ) }
					/>
					{ ! a.inherit && (
						<>
							<SelectControl
								__nextHasNoMarginBottom
								label={ __( 'Post type', 'df-builder' ) }
								value={ a.postType }
								options={ postTypes.map( ( pt ) => ( {
									label: pt.name,
									value: pt.slug,
								} ) ) }
								onChange={ ( postType ) =>
									setAttributes( {
										postType,
										taxonomy: '',
										terms: '',
									} )
								}
							/>
							<RangeControl
								__nextHasNoMarginBottom
								label={ __( 'Posts per page', 'df-builder' ) }
								min={ 1 }
								max={ 48 }
								value={ a.perPage }
								onChange={ ( perPage ) =>
									setAttributes( { perPage } )
								}
							/>
							<SelectControl
								__nextHasNoMarginBottom
								label={ __( 'Order by', 'df-builder' ) }
								value={ a.orderBy }
								options={ [
									{
										label: __( 'Date', 'df-builder' ),
										value: 'date',
									},
									{
										label: __( 'Title', 'df-builder' ),
										value: 'title',
									},
									{
										label: __(
											'Last modified',
											'df-builder'
										),
										value: 'modified',
									},
									{
										label: __( 'Menu order', 'df-builder' ),
										value: 'menu_order',
									},
									{
										label: __(
											'Comment count',
											'df-builder'
										),
										value: 'comment_count',
									},
									{
										label: __( 'Random', 'df-builder' ),
										value: 'rand',
									},
								] }
								onChange={ ( orderBy ) =>
									setAttributes( { orderBy } )
								}
							/>
							<SelectControl
								__nextHasNoMarginBottom
								label={ __( 'Order', 'df-builder' ) }
								value={ a.order }
								options={ [
									{
										label: __( 'Descending', 'df-builder' ),
										value: 'desc',
									},
									{
										label: __( 'Ascending', 'df-builder' ),
										value: 'asc',
									},
								] }
								onChange={ ( order ) =>
									setAttributes( { order } )
								}
							/>
							<SelectControl
								__nextHasNoMarginBottom
								label={ __(
									'Filter by taxonomy',
									'df-builder'
								) }
								value={ a.taxonomy }
								options={ [
									{
										label: __( 'None', 'df-builder' ),
										value: '',
									},
									...taxonomies.map( ( t ) => ( {
										label: t.name,
										value: t.slug,
									} ) ),
								] }
								onChange={ ( taxonomy ) =>
									setAttributes( { taxonomy } )
								}
							/>
							{ a.taxonomy && (
								<TextControl
									__nextHasNoMarginBottom
									label={ __(
										'Terms (slugs or IDs, comma-separated)',
										'df-builder'
									) }
									value={ a.terms }
									onChange={ ( terms ) =>
										setAttributes( { terms } )
									}
								/>
							) }
							<TextControl
								__nextHasNoMarginBottom
								type="number"
								label={ __( 'Offset', 'df-builder' ) }
								value={ a.offset }
								onChange={ ( v ) =>
									setAttributes( {
										offset: parseInt( v, 10 ) || 0,
									} )
								}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Exclude the current post',
									'df-builder'
								) }
								checked={ a.excludeCurrent }
								onChange={ ( excludeCurrent ) =>
									setAttributes( { excludeCurrent } )
								}
							/>
						</>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Pagination', 'df-builder' ) }
						checked={ a.pagination }
						onChange={ ( pagination ) =>
							setAttributes( { pagination } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __(
							'Text when nothing is found',
							'df-builder'
						) }
						value={ a.emptyText }
						onChange={ ( emptyText ) =>
							setAttributes( { emptyText } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Layout', 'df-builder' ) }>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'df-builder' ) }
						min={ 1 }
						max={ 6 }
						value={ cols }
						onChange={ ( columns ) => setAttributes( { columns } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __(
							'Stack into one column below',
							'df-builder'
						) }
						value={ stack }
						options={ [
							{
								label: __( 'Never', 'df-builder' ),
								value: 'none',
							},
							{
								label: __( 'Tablet', 'df-builder' ),
								value: 'tablet',
							},
							{
								label: __( 'Landscape', 'df-builder' ),
								value: 'landscape',
							},
							{
								label: __( 'Phone', 'df-builder' ),
								value: 'phone',
							},
						] }
						onChange={ ( stackOn ) => setAttributes( { stackOn } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
				<Notice
					status="info"
					isDismissible={ false }
					className="dfb-repeater__hint"
				>
					{ __(
						'This is the card design. It repeats for every post on the front end. Use “Dynamic data” on the blocks inside to show each post’s title, image, link and so on.',
						'df-builder'
					) }
				</Notice>
			</div>
		</>
	);
}

registerDfbBlock( metadata, Edit, true );
