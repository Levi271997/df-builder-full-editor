<?php
/**
 * Full-screen DF Builder editor: a dedicated admin screen that boots the block editor engine
 * with an Oxygen-style interface (src/full-editor). Content is saved as normal block markup.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Full_Editor {

	const PAGE   = 'dfb-editor';
	const HANDLE = 'dfb-full-editor';

	/** @var string Admin page hook suffix. */
	private $hook = '';

	public function register(): void {
		add_action( 'admin_menu', array( $this, 'add_page' ) );
		add_filter( 'page_row_actions', array( $this, 'row_action' ), 10, 2 );
		add_filter( 'post_row_actions', array( $this, 'row_action' ), 10, 2 );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar' ), 90 );
	}

	/** Post types that can be opened in the full editor. */
	public static function post_types(): array {
		$types = array( 'page', 'post', Templates::POST_TYPE );
		return (array) apply_filters( 'dfb_full_editor_post_types', $types );
	}

	public static function url( int $post_id ): string {
		return add_query_arg(
			array(
				'page' => self::PAGE,
				'post' => $post_id,
			),
			admin_url( 'admin.php' )
		);
	}

	public static function can_edit( $post ): bool {
		return $post instanceof \WP_Post
			&& in_array( $post->post_type, self::post_types(), true )
			&& use_block_editor_for_post( $post )
			&& current_user_can( 'edit_post', $post->ID );
	}

	/* ---------------------------------------------------------- entry points */

	public function row_action( $actions, $post ) {
		if ( self::can_edit( $post ) && 'trash' !== $post->post_status ) {
			$actions = array_merge(
				array( 'dfb_edit' => '<a href="' . esc_url( self::url( $post->ID ) ) . '"><strong>' . esc_html__( 'Edit with DF Builder', 'df-builder' ) . '</strong></a>' ),
				$actions
			);
		}
		return $actions;
	}

	public function admin_bar( \WP_Admin_Bar $bar ): void {
		if ( is_admin() || ! is_singular() ) {
			return;
		}
		$post = get_queried_object();
		if ( self::can_edit( $post ) ) {
			$bar->add_node(
				array(
					'id'    => 'dfb-edit',
					'title' => esc_html__( 'Edit with DF Builder', 'df-builder' ),
					'href'  => self::url( $post->ID ),
				)
			);
		}
	}

	/* ------------------------------------------------------------ the screen */

	public function add_page(): void {
		// Hidden page (parent options.php): reachable only through our links.
		$this->hook = (string) add_submenu_page(
			'options.php',
			__( 'DF Builder', 'df-builder' ),
			__( 'DF Builder', 'df-builder' ),
			'edit_posts',
			self::PAGE,
			array( $this, 'render' )
		);
		add_action( 'load-' . $this->hook, array( $this, 'load' ) );
	}

	private function current_post(): ?\WP_Post {
		$id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return $id ? get_post( $id ) : null;
	}

	public function load(): void {
		$post = $this->current_post();
		if ( ! $post ) {
			wp_die( esc_html__( 'Choose a page, post or template to edit.', 'df-builder' ), '', array( 'back_link' => true ) );
		}
		if ( ! self::can_edit( $post ) ) {
			wp_die( esc_html__( 'You are not allowed to edit this item with DF Builder.', 'df-builder' ), '', array( 'response' => 403, 'back_link' => true ) );
		}
		add_filter( 'admin_body_class', static fn( $c ) => $c . ' dfb-full-editor-screen ' );
		add_action( 'admin_enqueue_scripts', fn() => $this->enqueue( $post ) );
		// Let other plugins' "is block editor" checks pass.
		get_current_screen()->is_block_editor( true );
	}

	public function render(): void {
		echo '<div id="dfb-full-editor" class="dfb-full-editor"></div>';
	}

	private function enqueue( \WP_Post $post ): void {
		$context = new \WP_Block_Editor_Context(
			array(
				'name' => 'dfb/full-editor',
				'post' => $post,
			)
		);

		// Same bootstrap core does in wp-admin/edit-form-blocks.php.
		wp_add_inline_script( 'wp-blocks', 'wp.blocks.setCategories( ' . wp_json_encode( get_block_categories( $context ) ) . ' );', 'after' );
		wp_add_inline_script( 'wp-blocks', 'wp.blocks.unstable__bootstrapServerSideBlockDefinitions( ' . wp_json_encode( get_block_editor_server_block_settings() ) . ' );', 'after' );

		$pto       = get_post_type_object( $post->post_type );
		$rest_base = ! empty( $pto->rest_base ) ? $pto->rest_base : $post->post_type;
		block_editor_rest_api_preload(
			array(
				'/wp/v2/types?context=view',
				'/wp/v2/types/' . $post->post_type . '?context=edit',
				'/wp/v2/' . $rest_base . '/' . $post->ID . '?context=edit',
				'/wp/v2/users/me',
				'/dfb/v1/classes',
				array( '/wp/v2/media', 'OPTIONS' ),
			),
			$context
		);

		$settings = get_block_editor_settings(
			array(
				'bodyPlaceholder'                  => __( 'Add elements from the left panel…', 'df-builder' ),
				'supportsLayout'                   => wp_theme_has_theme_json(),
				'__experimentalDiscussionSettings' => array(),
			),
			$context
		);

		wp_enqueue_script( 'wp-format-library' );
		wp_enqueue_style( 'wp-format-library' );
		wp_enqueue_style( 'wp-edit-blocks' );
		wp_enqueue_style( 'wp-block-editor' );
		wp_enqueue_style( 'wp-components' );
		wp_enqueue_media( array( 'post' => $post->ID ) );

		// Block editorScripts, DF Builder editor extensions (style panel, bindings…), other plugins.
		do_action( 'enqueue_block_editor_assets' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.

		Plugin::enqueue_build_script( self::HANDLE, 'full-editor/index' );
		// Must run after the DF Builder editor extensions so the attribute filters exist before core blocks register.
		$scripts = wp_scripts();
		if ( isset( $scripts->registered[ self::HANDLE ] ) && isset( $scripts->registered['dfb-editor'] ) ) {
			$scripts->registered[ self::HANDLE ]->deps[] = 'dfb-editor';
		}

		wp_add_inline_script(
			self::HANDLE,
			'window.dfbFullEditor = ' . wp_json_encode(
				array(
					'postId'     => (int) $post->ID,
					'postType'   => $post->post_type,
					'settings'   => $settings,
					'exitUrl'    => self::exit_url( $post ),
					'previewUrl' => Templates::POST_TYPE === $post->post_type ? home_url( '/' ) : get_preview_post_link( $post ),
					'adminUrl'   => admin_url(),
					'editorUrl'  => self::url( 0 ),
				)
			) . ';',
			'before'
		);
	}

	private static function exit_url( \WP_Post $post ): string {
		$ref = wp_get_referer();
		if ( $ref && false === strpos( $ref, 'page=' . self::PAGE ) ) {
			return $ref;
		}
		return admin_url( 'edit.php?post_type=' . $post->post_type );
	}
}
