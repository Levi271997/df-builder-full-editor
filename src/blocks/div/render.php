<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_tags = array( 'div', 'article', 'aside', 'nav', 'main', 'header', 'footer', 'figure', 'ul', 'ol', 'li', 'span' );
$dfb_tag  = in_array( $attributes['tagName'] ?? '', $dfb_tags, true ) ? $attributes['tagName'] : 'div';

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $dfb_tag ),
	get_block_wrapper_attributes( array( 'class' => 'dfb-div' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
