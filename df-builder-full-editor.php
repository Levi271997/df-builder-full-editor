<?php
/**
 * Plugin Name:       DF Builder Full Editor
 * Description:       Oxygen-style full-screen page builder for WordPress, running on the block editor engine: element panel, structure tree, breakpoint canvas, per-breakpoint styles, global classes, conditional templates and dynamic data.
 * Version:           0.1.0
 * Requires at least: 6.6
 * Requires PHP:      8.1
 * Author:            Digitalfeet
 * License:           GPL-2.0-or-later
 * Text Domain:       df-builder
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

// Shares block names and classes with the original DF Builder plugin: only one may run.
// This plugin loads first alphabetically, so check the active list, not just the constant.
$dfb_original = 'df-builder/df-builder.php';
if (
	defined( 'DFB_VERSION' ) ||
	in_array( $dfb_original, (array) get_option( 'active_plugins', array() ), true ) ||
	( is_multisite() && isset( ( (array) get_site_option( 'active_sitewide_plugins', array() ) )[ $dfb_original ] ) )
) {
	add_action(
		'admin_notices',
		static function () {
			echo '<div class="notice notice-error"><p>' . esc_html__( 'DF Builder Full Editor cannot run while the original DF Builder plugin is active. Deactivate one of them.', 'df-builder' ) . '</p></div>';
		}
	);
	return;
}

define( 'DFB_VERSION', '0.1.0' );
define( 'DFB_FILE', __FILE__ );
define( 'DFB_DIR', plugin_dir_path( __FILE__ ) );
define( 'DFB_URL', plugin_dir_url( __FILE__ ) );

spl_autoload_register(
	static function ( $class ) {
		if ( 0 !== strpos( $class, 'DFBuilder\\' ) ) {
			return;
		}
		$name = strtolower( str_replace( '_', '-', substr( $class, strlen( 'DFBuilder\\' ) ) ) );
		$file = DFB_DIR . 'includes/class-' . $name . '.php';
		if ( is_readable( $file ) ) {
			require $file;
		}
	}
);

add_action( 'plugins_loaded', array( 'DFBuilder\\Plugin', 'instance' ) );

register_activation_hook( __FILE__, array( 'DFBuilder\\Plugin', 'activate' ) );
