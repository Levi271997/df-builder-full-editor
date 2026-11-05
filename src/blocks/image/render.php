<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_bound   = ! empty( $attributes['metadata']['bindings']['url'] );
$attributes  = \DFBuilder\Bindings::resolve( $attributes, $block );
$dfb_id      = (int) ( $attributes['id'] ?? 0 );
$dfb_size    = (string) ( $attributes['sizeSlug'] ?? 'large' );
$dfb_alt     = (string) ( $attributes['alt'] ?? '' );
$dfb_loading = 'eager' === ( $attributes['loading'] ?? '' ) ? 'eager' : 'lazy';
$dfb_attrs   = array();

if ( $dfb_id && ! $dfb_bound ) {
	$dfb_src = wp_get_attachment_image_src( $dfb_id, $dfb_size );
	if ( ! $dfb_src ) {
		return;
	}
	$dfb_attrs['src']    = $dfb_src[0];
	$dfb_attrs['width']  = $dfb_src[1];
	$dfb_attrs['height'] = $dfb_src[2];
	$dfb_srcset          = wp_get_attachment_image_srcset( $dfb_id, $dfb_size );
	if ( $dfb_srcset ) {
		$dfb_attrs['srcset'] = $dfb_srcset;
		$dfb_attrs['sizes']  = (string) wp_get_attachment_image_sizes( $dfb_id, $dfb_size );
	}
	if ( '' === $dfb_alt ) {
		$dfb_alt = (string) get_post_meta( $dfb_id, '_wp_attachment_image_alt', true );
	}
} else {
	$dfb_attrs['src'] = (string) ( $attributes['url'] ?? '' );
}

if ( '' === $dfb_attrs['src'] ) {
	return;
}

$dfb_attrs['alt']      = $dfb_alt;
$dfb_attrs['loading']  = $dfb_loading;
$dfb_attrs['decoding'] = 'async';

$dfb_html = '';
foreach ( $dfb_attrs as $dfb_k => $dfb_v ) {
	$dfb_html .= ' ' . $dfb_k . '="' . ( in_array( $dfb_k, array( 'src' ), true ) ? esc_url( $dfb_v ) : esc_attr( (string) $dfb_v ) ) . '"';
}

printf(
	'<img %1$s%2$s>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-image' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
);
