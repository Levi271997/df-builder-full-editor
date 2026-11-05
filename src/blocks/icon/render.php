<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_icons = \DFBuilder\Blocks::icons();
$dfb_name = (string) ( $attributes['icon'] ?? 'arrow-right' );
$dfb_path = $dfb_icons[ $dfb_name ] ?? ( $dfb_icons['arrow-right'] ?? '' );
// Path data only ever contains SVG path commands and numbers.
if ( ! preg_match( '/^[MmLlHhVvCcSsQqTtAaZz0-9 .,\-]+$/D', $dfb_path ) ) {
	return;
}
$dfb_label = trim( (string) ( $attributes['label'] ?? '' ) );
$dfb_a11y  = '' !== $dfb_label
	? array(
		'role'       => 'img',
		'aria-label' => $dfb_label,
	)
	: array( 'aria-hidden' => 'true' );

printf(
	'<span %1$s><svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="%2$s"/></svg></span>',
	get_block_wrapper_attributes( array_merge( array( 'class' => 'dfb-icon' ), $dfb_a11y ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	esc_attr( $dfb_path )
);
