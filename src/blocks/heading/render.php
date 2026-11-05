<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$attributes = \DFBuilder\Bindings::resolve( $attributes, $block );
$dfb_level  = min( 6, max( 1, (int) ( $attributes['level'] ?? 2 ) ) );
$dfb_text   = (string) ( $attributes['content'] ?? '' );

if ( '' === trim( $dfb_text ) ) {
	return;
}

printf(
	'<h%1$d %2$s>%3$s</h%1$d>',
	(int) $dfb_level,
	get_block_wrapper_attributes( array( 'class' => 'dfb-heading' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $dfb_text )
);
