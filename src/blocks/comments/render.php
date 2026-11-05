<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_post_id = ! empty( $block->context['postId'] ) ? (int) $block->context['postId'] : (int) get_the_ID();
// Editor preview passes ?post_id= to the block renderer.
if ( ! $dfb_post_id && wp_is_json_request() && isset( $_GET['post_id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$dfb_post_id = absint( $_GET['post_id'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}
$dfb_post = $dfb_post_id ? get_post( $dfb_post_id ) : null;
if ( ! $dfb_post || ( ! comments_open( $dfb_post ) && ! get_comments_number( $dfb_post ) ) ) {
	return;
}

$dfb_out   = '';
$dfb_title = trim( (string) ( $attributes['title'] ?? '' ) );
if ( '' !== $dfb_title ) {
	$dfb_out .= '<h2 class="dfb-comments__title">' . esc_html( $dfb_title ) . '</h2>';
}

if ( ! empty( $attributes['showList'] ) ) {
	$dfb_comments = get_comments(
		array(
			'post_id' => $dfb_post->ID,
			'status'  => 'approve',
			'order'   => 'ASC',
		)
	);
	if ( $dfb_comments ) {
		$dfb_out .= '<ol class="dfb-comments__list">' . wp_list_comments(
			array(
				'style'       => 'ol',
				'short_ping'  => true,
				'avatar_size' => 48,
				'echo'        => false,
				'max_depth'   => get_option( 'thread_comments' ) ? (int) get_option( 'thread_comments_depth' ) : -1,
			),
			$dfb_comments
		) . '</ol>';
	}
}

if ( ! empty( $attributes['showForm'] ) && comments_open( $dfb_post ) ) {
	if ( get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
	ob_start();
	comment_form( array(), $dfb_post->ID );
	$dfb_out .= ob_get_clean();
}

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-comments' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_out // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core comment markup.
);
