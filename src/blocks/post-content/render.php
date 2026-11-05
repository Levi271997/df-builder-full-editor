<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

use DFBuilder\Templates;

defined( 'ABSPATH' ) || exit;

$dfb_post_id = ! empty( $block->context['postId'] ) ? (int) $block->context['postId'] : (int) get_the_ID();
$dfb_post    = $dfb_post_id ? get_post( $dfb_post_id ) : null;

if ( ! $dfb_post || Templates::POST_TYPE === $dfb_post->post_type || Templates::is_rendering( $dfb_post_id ) ) {
	return;
}

Templates::push( $dfb_post_id );
$dfb_html = apply_filters( 'the_content', str_replace( ']]>', ']]&gt;', get_the_content( null, false, $dfb_post ) ) ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
Templates::pop();

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-post-content' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered post content.
);
