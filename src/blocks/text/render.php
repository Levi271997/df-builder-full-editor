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
$dfb_tag    = in_array( $attributes['tagName'] ?? '', array( 'p', 'span', 'div', 'blockquote' ), true ) ? $attributes['tagName'] : 'p';
$dfb_text   = (string) ( $attributes['content'] ?? '' );

if ( '' === trim( $dfb_text ) ) {
	return;
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $dfb_tag ),
	get_block_wrapper_attributes( array( 'class' => 'dfb-text' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $dfb_text )
);
