import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- core list view; no stable equivalent.
	__experimentalListView as ListView,
} from '@wordpress/block-editor';
import Elements from './elements';

export const LEFT_TABS = [
	{ name: 'add', label: __( 'Add', 'df-builder' ), icon: 'plus-alt2' },
	{
		name: 'structure',
		label: __( 'Structure', 'df-builder' ),
		icon: 'list-view',
	},
];

export default function LeftPanel( { tab, setTab, extraTabs = {} } ) {
	const tabs = [
		...LEFT_TABS,
		...Object.values( extraTabs ).map( ( t ) => t.tab ),
	];
	return (
		<aside
			className="dfb-fe__left"
			aria-label={ __( 'Builder panel', 'df-builder' ) }
		>
			<div className="dfb-fe__left-tabs" role="tablist">
				{ tabs.map( ( t ) => (
					<Button
						key={ t.name }
						role="tab"
						icon={ t.icon }
						aria-selected={ tab === t.name }
						isPressed={ tab === t.name }
						onClick={ () => setTab( t.name ) }
						label={ t.label }
						showTooltip
						tooltipPosition="right"
					/>
				) ) }
			</div>
			<div className="dfb-fe__left-body">
				<h2 className="dfb-fe__panel-title">
					{ tabs.find( ( t ) => t.name === tab )?.label }
				</h2>
				{ tab === 'add' && <Elements /> }
				{ tab === 'structure' && (
					<div className="dfb-fe-structure">
						<ListView showBlockMovers />
					</div>
				) }
				{ extraTabs[ tab ]?.render() }
			</div>
		</aside>
	);
}
