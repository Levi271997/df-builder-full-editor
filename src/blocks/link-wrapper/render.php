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
$dfb_url    = (string) ( $attributes['url'] ?? '' );
$dfb_wrap   = get_block_wrapper_attributes( array( 'class' => 'dfb-link-wrapper' ) );

if ( '' === $dfb_url ) {
	printf( '<div %1$s>%2$s</div>', $dfb_wrap, $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

printf(
	'<a href="%1$s"%2$s %3$s>%4$s</a>',
	esc_url( $dfb_url ),
	! empty( $attributes['opensInNewTab'] ) ? ' target="_blank" rel="noopener"' : '',
	$dfb_wrap, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
