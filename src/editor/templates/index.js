import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import TemplateFields from './fields';

function TemplateSettings() {
	const postType = useSelect(
		( select ) => select( editorStore ).getCurrentPostType(),
		[]
	);
	const [ meta, setMeta ] = useEntityProp( 'postType', postType, 'meta' );

	if ( postType !== window.dfbData?.templatePostType || ! meta ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name="dfb-template"
			title={ __( 'Template settings', 'df-builder' ) }
		>
			<TemplateFields meta={ meta } setMeta={ setMeta } />
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'dfb-template-settings', { render: TemplateSettings } );
