<?php
/**
 * Conditional templates (header / footer / content), edited in the block editor.
 *
 * When any published template matches the current request, the theme's output is replaced by
 * templates/canvas.php, which renders: header template → content template (or the default loop)
 * → footer template.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Templates {

	const POST_TYPE = 'dfb_template';
	const TYPES     = array( 'header', 'footer', 'content' );

	const META_TYPE       = '_dfb_type';
	const META_CONDITIONS = '_dfb_conditions';
	const META_PRIORITY   = '_dfb_priority';

	/** @var array<string,\WP_Post|null>|null */
	private static $matches = null;

	/** @var int[] Post ids currently being rendered (recursion guard). */
	private static $stack = array();

	public function register(): void {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_meta' ) );
		add_filter( 'template_include', array( $this, 'template_include' ), 99 );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( $this, 'columns' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( $this, 'column' ), 10, 2 );
		add_action( 'save_post_' . self::POST_TYPE, array( $this, 'flush_cache' ) );
		// The block editor writes meta after save_post, so flush again once REST is done.
		add_action( 'rest_after_insert_' . self::POST_TYPE, array( $this, 'flush_cache' ) );
		add_action( 'updated_post_meta', array( $this, 'flush_on_meta' ), 10, 3 );
		add_action( 'added_post_meta', array( $this, 'flush_on_meta' ), 10, 3 );
		add_action( 'deleted_post', array( $this, 'flush_cache' ) );
	}

	public function register_post_type(): void {
		$cap = 'edit_theme_options';
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'          => array(
					'name'          => __( 'Templates', 'df-builder' ),
					'singular_name' => __( 'Template', 'df-builder' ),
					'add_new_item'  => __( 'Add template', 'df-builder' ),
					'edit_item'     => __( 'Edit template', 'df-builder' ),
					'all_items'     => __( 'Templates', 'df-builder' ),
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => 'dfb',
				'show_in_rest'    => true,
				'rest_base'       => 'dfb-templates',
				'supports'        => array( 'title', 'editor', 'custom-fields', 'revisions' ),
				'map_meta_cap'    => true,
				'capability_type' => 'dfb_template',
				'capabilities'    => array(
					'create_posts'           => $cap,
					'edit_posts'             => $cap,
					'edit_others_posts'      => $cap,
					'edit_published_posts'   => $cap,
					'edit_private_posts'     => $cap,
					'publish_posts'          => $cap,
					'read_private_posts'     => $cap,
					'delete_posts'           => $cap,
					'delete_others_posts'    => $cap,
					'delete_published_posts' => $cap,
					'delete_private_posts'   => $cap,
					'read'                   => 'read',
				),
			)
		);
	}

	public function register_meta(): void {
		$auth = static fn() => current_user_can( 'edit_theme_options' );
		register_post_meta(
			self::POST_TYPE,
			self::META_TYPE,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => 'content',
				'show_in_rest'      => array(
					'schema' => array(
						'type' => 'string',
						'enum' => self::TYPES,
					),
				),
				'auth_callback'     => $auth,
				'sanitize_callback' => static fn( $v ) => in_array( $v, self::TYPES, true ) ? $v : 'content',
			)
		);
		register_post_meta(
			self::POST_TYPE,
			self::META_PRIORITY,
			array(
				'type'          => 'integer',
				'single'        => true,
				'default'       => 10,
				'show_in_rest'  => true,
				'auth_callback' => $auth,
			)
		);
		register_post_meta(
			self::POST_TYPE,
			self::META_CONDITIONS,
			array(
				'type'              => 'array',
				'single'            => true,
				'default'           => array(),
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'mode'  => array(
									'type' => 'string',
									'enum' => array( 'include', 'exclude' ),
								),
								'rule'  => array(
									'type' => 'string',
									'enum' => array_keys( Conditions::RULES ),
								),
								'value' => array( 'type' => 'string' ),
							),
						),
					),
				),
				'auth_callback'     => $auth,
				'sanitize_callback' => array( self::class, 'sanitize_conditions' ),
			)
		);
	}

	public static function sanitize_conditions( $rules ): array {
		$out = array();
		foreach ( (array) $rules as $r ) {
			if ( ! is_array( $r ) || ! isset( Conditions::RULES[ $r['rule'] ?? '' ] ) ) {
				continue;
			}
			$out[] = array(
				'mode'  => 'exclude' === ( $r['mode'] ?? '' ) ? 'exclude' : 'include',
				'rule'  => $r['rule'],
				'value' => sanitize_text_field( (string) ( $r['value'] ?? '' ) ),
			);
		}
		return $out;
	}

	/* ------------------------------------------------------------ matching */

	public function flush_cache(): void {
		delete_transient( 'dfb_templates_index' );
	}

	public function flush_on_meta( $meta_id, $object_id, $meta_key ): void {
		if ( is_string( $meta_key ) && 0 === strpos( $meta_key, '_dfb_' ) ) {
			$this->flush_cache();
		}
	}

	/**
	 * Lightweight index of all published templates: id, type, priority, conditions.
	 */
	private static function index(): array {
		$index = get_transient( 'dfb_templates_index' );
		if ( is_array( $index ) ) {
			return $index;
		}
		$index = array();
		$ids   = get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => 'publish',
				'posts_per_page' => 200,
				'fields'         => 'ids',
				'no_found_rows'  => true,
			)
		);
		foreach ( $ids as $id ) {
			$index[] = array(
				'id'         => (int) $id,
				'type'       => get_post_meta( $id, self::META_TYPE, true ) ?: 'content',
				'priority'   => (int) get_post_meta( $id, self::META_PRIORITY, true ),
				'conditions' => (array) get_post_meta( $id, self::META_CONDITIONS, true ),
			);
		}
		set_transient( 'dfb_templates_index', $index, DAY_IN_SECONDS );
		return $index;
	}

	/**
	 * Pick the winning template per type for a context. Pure apart from the index.
	 *
	 * @param array $index Template index.
	 * @param array $ctx   Conditions context.
	 * @return array<string,int|null> type => template id.
	 */
	public static function pick( array $index, array $ctx ): array {
		$best = array_fill_keys( self::TYPES, null );
		$keys = array_fill_keys( self::TYPES, null );
		foreach ( $index as $t ) {
			if ( ! in_array( $t['type'], self::TYPES, true ) || ! Conditions::matches( $t['conditions'], $ctx ) ) {
				continue;
			}
			$key = array( $t['priority'], Conditions::specificity( $t['conditions'] ), $t['id'] );
			if ( null === $keys[ $t['type'] ] || $key > $keys[ $t['type'] ] ) {
				$keys[ $t['type'] ] = $key;
				$best[ $t['type'] ] = $t['id'];
			}
		}
		return $best;
	}

	/** @return array<string,\WP_Post|null> */
	public static function matches(): array {
		if ( null !== self::$matches ) {
			return self::$matches;
		}
		self::$matches = array_fill_keys( self::TYPES, null );
		if ( ! self::takeover_allowed() ) {
			return self::$matches;
		}
		foreach ( self::pick( self::index(), Conditions::current_context() ) as $type => $id ) {
			self::$matches[ $type ] = $id ? get_post( $id ) : null;
		}
		return self::$matches;
	}

	/** Templates in use for this request (for CSS collection). */
	public static function active_posts(): array {
		return array_values( array_filter( self::matches() ) );
	}

	private static function takeover_allowed(): bool {
		if ( is_admin() || is_feed() || is_embed() || is_robots() || is_favicon() || wp_is_json_request() ) {
			return false;
		}
		if ( is_singular( self::POST_TYPE ) ) {
			return false;
		}
		return (bool) Settings::get()['templatesEnabled'];
	}

	public function template_include( $template ) {
		return self::active_posts() ? DFB_DIR . 'templates/canvas.php' : $template;
	}

	/* ----------------------------------------------------------- rendering */

	/**
	 * Render block content the way core renders block templates.
	 *
	 * @param string $content Block markup.
	 */
	public static function render_blocks( string $content ): string {
		$content = do_blocks( $content );
		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );
		$content = wptexturize( $content );
		$content = convert_smilies( $content );
		return wp_filter_content_tags( $content, 'template' );
	}

	/**
	 * Render a matched template part. Returns false when there is no template of that type.
	 *
	 * @param string $type header|footer|content.
	 */
	public static function render( string $type ): bool {
		$post = self::matches()[ $type ] ?? null;
		if ( ! $post ) {
			return false;
		}
		self::$stack[] = (int) $post->ID;
		echo self::render_blocks( $post->post_content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered blocks.
		array_pop( self::$stack );
		return true;
	}

	/**
	 * Whether a post is already being rendered (prevents post-content loops).
	 *
	 * @param int $post_id Post id.
	 */
	public static function is_rendering( int $post_id ): bool {
		return in_array( $post_id, self::$stack, true );
	}

	public static function push( int $post_id ): void {
		self::$stack[] = $post_id;
	}

	public static function pop(): void {
		array_pop( self::$stack );
	}

	/* -------------------------------------------------------------- admin */

	public function columns( $cols ): array {
		$out = array();
		foreach ( $cols as $k => $v ) {
			$out[ $k ] = $v;
			if ( 'title' === $k ) {
				$out['dfb_type']       = __( 'Type', 'df-builder' );
				$out['dfb_conditions'] = __( 'Conditions', 'df-builder' );
				$out['dfb_priority']   = __( 'Priority', 'df-builder' );
			}
		}
		return $out;
	}

	public function column( $col, $post_id ): void {
		switch ( $col ) {
			case 'dfb_type':
				echo esc_html( ucfirst( (string) get_post_meta( $post_id, self::META_TYPE, true ) ?: 'content' ) );
				break;
			case 'dfb_priority':
				echo (int) get_post_meta( $post_id, self::META_PRIORITY, true );
				break;
			case 'dfb_conditions':
				$parts = array();
				foreach ( (array) get_post_meta( $post_id, self::META_CONDITIONS, true ) as $r ) {
					$parts[] = ( 'exclude' === ( $r['mode'] ?? '' ) ? '− ' : '+ ' ) . str_replace( '_', ' ', $r['rule'] ?? '' ) . ( ! empty( $r['value'] ) ? ': ' . $r['value'] : '' );
				}
				echo esc_html( $parts ? implode( ', ', $parts ) : '—' );
				break;
		}
	}
}
