<?php
/**
 * Code Block. Content is only ever saved by users with `unfiltered_html`
 * (see Blocks::strip_code_for_untrusted()), so it is output as-is.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_html = (string) ( $attributes['html'] ?? '' );
$dfb_css  = (string) ( $attributes['css'] ?? '' );
$dfb_js   = (string) ( $attributes['js'] ?? '' );

if ( '' === trim( $dfb_html . $dfb_css . $dfb_js ) ) {
	return;
}

$dfb_uid      = $attributes['dfb']['uid'] ?? '';
$dfb_selector = \DFBuilder\Style_Engine::is_valid_uid( $dfb_uid ) ? '.dfb-' . $dfb_uid : '.dfb-code';

$dfb_out = '';
if ( '' !== trim( $dfb_css ) ) {
	// Prevent closing the style element early.
	$dfb_out .= '<style>' . str_ireplace( '</style', '<\/style', str_replace( '%%SELECTOR%%', $dfb_selector, $dfb_css ) ) . '</style>';
}
$dfb_out .= $dfb_html;

if ( '' !== trim( $dfb_js ) ) {
	$dfb_script = str_ireplace( '</script', '<\/script', $dfb_js );
	add_action(
		'wp_footer',
		static function () use ( $dfb_script ) {
			echo "<script>\n" . $dfb_script . "\n</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted (unfiltered_html) author content.
		},
		20
	);
}

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-code' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_out // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted (unfiltered_html) author content.
);
