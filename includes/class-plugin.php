<?php
/**
 * Wiring.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Plugin {

	/** @var Plugin|null */
	private static $instance = null;

	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
			self::$instance->boot();
		}
		return self::$instance;
	}

	public static function activate(): void {
		( new Templates() )->register_post_type();
		flush_rewrite_rules();
		Global_Classes::compile();
	}

	private function boot(): void {
		load_plugin_textdomain( 'df-builder', false, dirname( plugin_basename( DFB_FILE ) ) . '/languages' );

		( new Settings() )->register();
		( new Blocks() )->register();
		( new Css_Collector() )->register();
		( new Global_Classes() )->register();
		( new Templates() )->register();
		( new Bindings() )->register();
		( new Full_Editor() )->register();

		add_action( 'enqueue_block_editor_assets', array( $this, 'editor_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'base_assets' ) );
	}

	/**
	 * Register + enqueue a script built by wp-scripts (uses the generated .asset.php).
	 *
	 * @param string $handle Handle.
	 * @param string $entry  Entry path inside build/, without extension.
	 */
	public static function enqueue_build_script( string $handle, string $entry ): void {
		$asset_file = DFB_DIR . 'build/' . $entry . '.asset.php';
		if ( ! is_readable( $asset_file ) ) {
			return;
		}
		$asset = require $asset_file;
		wp_enqueue_script( $handle, DFB_URL . 'build/' . $entry . '.js', $asset['dependencies'], $asset['version'], true );
		wp_set_script_translations( $handle, 'df-builder' );
		wp_add_inline_script( $handle, 'window.dfbData = ' . wp_json_encode( self::client_data() ) . ';', 'before' );
		if ( is_readable( DFB_DIR . 'build/' . $entry . '.css' ) ) {
			wp_enqueue_style( $handle, DFB_URL . 'build/' . $entry . '.css', array( 'wp-components' ), $asset['version'] );
		}
	}

	public static function client_data(): array {
		$settings = Settings::get();
		return array(
			'breakpoints'      => $settings['breakpoints'],
			'pageWidth'        => $settings['pageWidth'],
			'canManageClasses' => current_user_can( Global_Classes::CAP ),
			'acfActive'        => function_exists( 'get_field' ),
			'canUnfilteredHtml' => current_user_can( 'unfiltered_html' ),
			'templatePostType' => Templates::POST_TYPE,
			'fullEditorUrl'    => Full_Editor::url( 0 ),
			'fullEditorTypes'  => Full_Editor::post_types(),
		);
	}

	public function editor_assets(): void {
		// The widgets editor and Customizer must not load wp-editor.
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && in_array( $screen->base, array( 'widgets', 'customize' ), true ) ) {
			return;
		}
		self::enqueue_build_script( 'dfb-editor', 'editor/index' );
	}

	/**
	 * Base block CSS + settings-driven variables. Loads on the front end and inside the editor iframe.
	 */
	public function base_assets(): void {
		wp_enqueue_style( 'dfb-base', DFB_URL . 'assets/base.css', array(), DFB_VERSION );
		wp_add_inline_style( 'dfb-base', self::dynamic_base_css() );
		if ( is_admin() ) {
			wp_enqueue_style( 'dfb-editor-canvas', DFB_URL . 'assets/editor-canvas.css', array( 'dfb-base' ), DFB_VERSION );
		}
	}

	public static function dynamic_base_css(): string {
		$s   = Settings::get();
		$css = ':root{--dfb-page-width:' . (int) $s['pageWidth'] . 'px;--dfb-gutter:' . (int) $s['gutter'] . 'px}';
		foreach ( Style_Engine::BREAKPOINTS as $bp ) {
			$css .= '@media (max-width:' . (int) $s['breakpoints'][ $bp ] . 'px){.dfb-stack-' . $bp . '{grid-template-columns:minmax(0,1fr)}}';
		}
		return $css;
	}
}
