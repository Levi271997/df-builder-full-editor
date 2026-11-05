<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_tag   = in_array( $attributes['tagName'] ?? '', array( 'section', 'header', 'footer', 'div', 'main', 'aside' ), true ) ? $attributes['tagName'] : 'section';
$dfb_class = 'dfb-section' . ( ! empty( $attributes['contained'] ) ? ' dfb-section--contained' : '' );

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $dfb_tag ),
	get_block_wrapper_attributes( array( 'class' => $dfb_class ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
