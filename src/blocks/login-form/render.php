<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_wrapper = get_block_wrapper_attributes( array( 'class' => 'dfb-login-form' ) );
$dfb_current = home_url( add_query_arg( array() ) );

// The editor preview always shows the form, even though the editor user is logged in.
$dfb_preview = wp_is_json_request();

if ( is_user_logged_in() && ! $dfb_preview ) {
	printf(
		'<div %1$s><p class="dfb-login-form__status">%2$s <a href="%3$s">%4$s</a></p></div>',
		$dfb_wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		esc_html( (string) ( $attributes['loggedInText'] ?? '' ) ),
		esc_url( wp_logout_url( $dfb_current ) ),
		esc_html__( 'Log out', 'df-builder' )
	);
	return;
}

$dfb_redirect = trim( (string) ( $attributes['redirect'] ?? '' ) );
$dfb_form     = wp_login_form(
	array(
		'echo'           => false,
		'redirect'       => '' !== $dfb_redirect ? esc_url_raw( $dfb_redirect ) : $dfb_current,
		'remember'       => ! empty( $attributes['showRemember'] ),
		'form_id'        => 'dfb-loginform-' . \DFBuilder\Blocks::next_instance( 'login' ),
		'id_username'    => 'dfb-user-login-' . \DFBuilder\Blocks::next_instance( 'login-user' ),
		'id_password'    => 'dfb-user-pass-' . \DFBuilder\Blocks::next_instance( 'login-pass' ),
		'id_remember'    => 'dfb-rememberme-' . \DFBuilder\Blocks::next_instance( 'login-remember' ),
		'id_submit'      => 'dfb-wp-submit-' . \DFBuilder\Blocks::next_instance( 'login-submit' ),
		'value_remember' => false,
	)
);

if ( ! empty( $attributes['showLostPassword'] ) ) {
	$dfb_form .= '<p class="dfb-login-form__lost"><a href="' . esc_url( wp_lostpassword_url( $dfb_current ) ) . '">' . esc_html__( 'Lost your password?', 'df-builder' ) . '</a></p>';
}

printf(
	'<div %1$s>%2$s</div>',
	$dfb_wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_form // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core login form markup.
);
