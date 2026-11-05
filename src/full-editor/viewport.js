/**
 * Breakpoint switcher: drives both the canvas width and the style panel's edit state
 * (dfb/builder store), so picking "Tablet" shows tablet-width canvas and edits tablet styles.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';

const bps = () =>
	window.dfbData?.breakpoints || { tablet: 992, landscape: 768, phone: 480 };

export const VIEWPORTS = [
	{ state: 'base', label: __( 'Desktop', 'df-builder' ), icon: 'desktop' },
	{ state: 'tablet', label: __( 'Tablet', 'df-builder' ), icon: 'tablet' },
	{
		state: 'landscape',
		label: __( 'Landscape', 'df-builder' ),
		icon: 'smartphone',
		rotate: true,
	},
	{ state: 'phone', label: __( 'Phone', 'df-builder' ), icon: 'smartphone' },
];

export function useViewport() {
	const editState = useSelect(
		( select ) => select( 'dfb/builder' )?.getEditState?.() || 'base',
		[]
	);
	const { setEditState } = useDispatch( 'dfb/builder' );
	// Hover edits happen on the desktop canvas.
	const viewport = editState === 'hover' ? 'base' : editState;
	return { viewport, editState, setViewport: setEditState };
}

/** CSS width for the canvas frame. Desktop is at least one pixel wider than the tablet breakpoint. */
export function canvasWidth( viewport ) {
	const b = bps();
	if ( viewport === 'base' ) {
		return `max(100%, ${ b.tablet + 1 }px)`;
	}
	return `${ b[ viewport ] }px`;
}

export function ViewportSwitcher() {
	const { viewport, setViewport } = useViewport();
	const b = bps();
	return (
		<div
			className="dfb-fe__viewports"
			role="group"
			aria-label={ __( 'Breakpoint', 'df-builder' ) }
		>
			{ VIEWPORTS.map( ( v ) => (
				<Button
					key={ v.state }
					icon={ v.icon }
					className={ v.rotate ? 'is-rotated' : '' }
					isPressed={ viewport === v.state }
					onClick={ () => setViewport( v.state ) }
					label={
						v.state === 'base'
							? v.label
							: sprintf(
									/* translators: 1: breakpoint name, 2: px */
									__( '%1$s (≤ %2$dpx)', 'df-builder' ),
									v.label,
									b[ v.state ]
							  )
					}
					showTooltip
				/>
			) ) }
		</div>
	);
}
