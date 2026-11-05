<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_text = trim( (string) ( $attributes['text'] ?? '' ) );
if ( '' === $dfb_text ) {
	return;
}

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-shortcode' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	do_shortcode( $dfb_text ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- shortcode output.
);
