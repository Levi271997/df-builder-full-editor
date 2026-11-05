<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_cols  = min( 12, max( 1, (int) ( $attributes['columns'] ?? 2 ) ) );
$dfb_stack = in_array( $attributes['stackOn'] ?? '', array( 'none', 'tablet', 'landscape', 'phone' ), true ) ? $attributes['stackOn'] : 'landscape';

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		array(
			'class' => 'dfb-columns' . ( 'none' !== $dfb_stack ? ' dfb-stack-' . $dfb_stack : '' ),
			'style' => '--dfb-cols:' . $dfb_cols,
		)
	),
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
