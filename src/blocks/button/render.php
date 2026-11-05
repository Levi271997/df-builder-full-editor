<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$attributes  = \DFBuilder\Bindings::resolve( $attributes, $block );
$dfb_text    = (string) ( $attributes['text'] ?? '' );
$dfb_url     = (string) ( $attributes['url'] ?? '' );
$dfb_variant = in_array( $attributes['variant'] ?? '', array( 'primary', 'secondary', 'outline', 'none' ), true ) ? $attributes['variant'] : 'primary';

if ( '' === trim( $dfb_text ) ) {
	return;
}

$dfb_extra = array( 'class' => 'dfb-button' . ( 'none' !== $dfb_variant ? ' dfb-button--' . $dfb_variant : '' ) );
$dfb_rel   = trim( (string) ( $attributes['rel'] ?? '' ) );
if ( ! empty( $attributes['opensInNewTab'] ) ) {
	$dfb_rel = trim( $dfb_rel . ' noopener' );
}

if ( '' === $dfb_url ) {
	printf(
		'<span %1$s>%2$s</span>',
		get_block_wrapper_attributes( $dfb_extra ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		wp_kses_post( $dfb_text )
	);
	return;
}

printf(
	'<a href="%1$s"%2$s%3$s %4$s>%5$s</a>',
	esc_url( $dfb_url ),
	! empty( $attributes['opensInNewTab'] ) ? ' target="_blank"' : '',
	'' !== $dfb_rel ? ' rel="' . esc_attr( $dfb_rel ) . '"' : '',
	get_block_wrapper_attributes( $dfb_extra ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $dfb_text )
);
