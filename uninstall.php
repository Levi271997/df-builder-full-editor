<?php
/**
 * Uninstall: remove options and the compiled stylesheet. Templates (posts) are kept on purpose so
 * a reinstall does not lose site layouts; delete them from the Templates screen first if wanted.
 *
 * @package DFBuilder
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'dfb_settings' );
delete_option( 'dfb_classes' );
delete_option( 'dfb_classes_version' );
delete_transient( 'dfb_templates_index' );

$dfb_upload = wp_upload_dir( null, false );
$dfb_file   = trailingslashit( $dfb_upload['basedir'] ) . 'df-builder/classes.css';
if ( file_exists( $dfb_file ) ) {
	wp_delete_file( $dfb_file );
	@rmdir( dirname( $dfb_file ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
}
