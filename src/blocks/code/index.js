import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextareaControl,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { registerDfbBlock } from '../shared';
import metadata from './block.json';

const TABS = [
	{ name: 'html', title: 'HTML' },
	{ name: 'css', title: 'CSS' },
	{ name: 'js', title: 'JavaScript' },
];

const HELP = {
	html: __( 'Markup output where the block is placed.', 'df-builder' ),
	css: __(
		'Printed in a <style> tag. Use %%SELECTOR%% to target this block only.',
		'df-builder'
	),
	js: __(
		'Printed in a <script> tag in the footer. Not run inside the editor.',
		'df-builder'
	),
};

function Edit( { attributes, setAttributes, isSelected } ) {
	const allowed = !! window.dfbData?.canUnfilteredHtml;
	const blockProps = useBlockProps( { className: 'dfb-code' } );

	const editor = ( tab ) => (
		<TextareaControl
			__nextHasNoMarginBottom
			className="dfb-code__editor"
			label={ tab.title }
			hideLabelFromVision
			help={ HELP[ tab.name ] }
			rows={ 14 }
			value={ attributes[ tab.name ] }
			onChange={ ( v ) => setAttributes( { [ tab.name ]: v } ) }
			spellCheck={ false }
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Code', 'df-builder' ) }>
					{ ! allowed && (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Your account is not allowed to add unfiltered HTML, so this code is removed when you save.',
								'df-builder'
							) }
						</Notice>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ isSelected && allowed ? (
					<div className="dfb-code__panel">
						<TabPanel tabs={ TABS }>{ editor }</TabPanel>
					</div>
				) : (
					<>
						{ attributes.html ? (
							<RawHTML>{ attributes.html }</RawHTML>
						) : (
							<div className="dfb-placeholder">
								<strong>
									{ __( 'Code Block', 'df-builder' ) }
								</strong>
								<p>
									{ __(
										'Select the block to edit its HTML, CSS and JavaScript.',
										'df-builder'
									) }
								</p>
							</div>
						) }
					</>
				) }
			</div>
		</>
	);
}

registerDfbBlock( metadata, Edit );
