<?php
/**
 * Plugin settings: breakpoints, page width, template toggle.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Settings {

	const OPTION = 'dfb_settings';

	public static function defaults(): array {
		return array(
			'breakpoints'      => Style_Engine::DEFAULT_BREAKPOINTS,
			'pageWidth'        => 1120,
			'gutter'           => 20,
			'templatesEnabled' => true,
		);
	}

	public static function get(): array {
		$saved = get_option( self::OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		$out   = array_merge( self::defaults(), $saved );
		$out['breakpoints'] = array_merge( Style_Engine::DEFAULT_BREAKPOINTS, (array) ( $saved['breakpoints'] ?? array() ) );
		return $out;
	}

	public static function breakpoints(): array {
		return self::get()['breakpoints'];
	}

	public static function sanitize( $value ): array {
		$value = is_array( $value ) ? $value : array();
		$d     = self::defaults();
		$bps   = array();
		foreach ( Style_Engine::DEFAULT_BREAKPOINTS as $key => $default ) {
			$n           = absint( $value['breakpoints'][ $key ] ?? $default );
			$bps[ $key ] = $n >= 200 && $n <= 4000 ? $n : $default;
		}
		// Keep the cascade ordered (tablet > landscape > phone).
		if ( ! ( $bps['tablet'] > $bps['landscape'] && $bps['landscape'] > $bps['phone'] ) ) {
			$bps = Style_Engine::DEFAULT_BREAKPOINTS;
		}
		$page_width = absint( $value['pageWidth'] ?? $d['pageWidth'] );
		$gutter     = absint( $value['gutter'] ?? $d['gutter'] );
		return array(
			'breakpoints'      => $bps,
			'pageWidth'        => $page_width >= 320 ? $page_width : $d['pageWidth'],
			'gutter'           => min( $gutter, 200 ),
			'templatesEnabled' => ! empty( $value['templatesEnabled'] ),
		);
	}

	public function register(): void {
		add_action( 'init', array( $this, 'register_setting' ) );
		add_action( 'admin_menu', array( $this, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'assets' ) );
		// Breakpoints feed the compiled class CSS.
		add_action( 'add_option_' . self::OPTION, array( Global_Classes::class, 'compile' ) );
		add_action( 'update_option_' . self::OPTION, array( Global_Classes::class, 'compile' ) );
	}

	public function register_setting(): void {
		$bp_schema = array(
			'type'       => 'object',
			'properties' => array(
				'tablet'    => array( 'type' => 'integer' ),
				'landscape' => array( 'type' => 'integer' ),
				'phone'     => array( 'type' => 'integer' ),
			),
		);
		register_setting(
			'dfb',
			self::OPTION,
			array(
				'type'              => 'object',
				'default'           => self::defaults(),
				'sanitize_callback' => array( self::class, 'sanitize' ),
				'show_in_rest'      => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => array(
							'breakpoints'      => $bp_schema,
							'pageWidth'        => array( 'type' => 'integer' ),
							'gutter'           => array( 'type' => 'integer' ),
							'templatesEnabled' => array( 'type' => 'boolean' ),
						),
					),
				),
			)
		);
	}

	public function menu(): void {
		add_menu_page(
			__( 'DF Builder', 'df-builder' ),
			__( 'DF Builder', 'df-builder' ),
			'edit_theme_options',
			'dfb',
			array( $this, 'render_page' ),
			'dashicons-layout',
			59
		);
		add_submenu_page( 'dfb', __( 'Settings', 'df-builder' ), __( 'Settings', 'df-builder' ), 'manage_options', 'dfb', array( $this, 'render_page' ) );
	}

	public function render_page(): void {
		echo '<div class="wrap"><h1>' . esc_html__( 'DF Builder', 'df-builder' ) . '</h1><div id="dfb-settings-root"></div></div>';
	}

	public function assets( $hook ): void {
		if ( 'toplevel_page_dfb' !== $hook ) {
			return;
		}
		Plugin::enqueue_build_script( 'dfb-settings', 'admin/settings' );
		wp_enqueue_style( 'wp-components' );
	}
}
