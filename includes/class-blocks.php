<?php
/**
 * Block registration + `dfb` attribute support for core blocks.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Blocks {

	/** Core blocks that receive the DF Builder style panel. Keep in sync with src/editor/supported-blocks.js. */
	const CORE_SUPPORTED = array(
		'core/group',
		'core/columns',
		'core/column',
		'core/paragraph',
		'core/heading',
		'core/image',
		'core/buttons',
		'core/button',
		'core/list',
		'core/cover',
	);

	public function register(): void {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_filter( 'register_block_type_args', array( $this, 'add_attribute' ), 10, 2 );
		add_filter( 'block_categories_all', array( $this, 'category' ) );
		add_filter( 'wp_insert_post_data', array( $this, 'strip_code_for_untrusted' ), 10, 1 );
	}

	/**
	 * Remove Code Block contents saved by users who may not post unfiltered HTML.
	 * kses strips tags from attributes but would leave raw JS/CSS text, so we clear them entirely.
	 *
	 * @param array $data Slashed post data.
	 */
	public function strip_code_for_untrusted( $data ) {
		if ( current_user_can( 'unfiltered_html' ) || empty( $data['post_content'] ) || false === strpos( $data['post_content'], 'wp:dfb/code' ) ) {
			return $data;
		}
		$strip = static function ( array $blocks ) use ( &$strip ): array {
			foreach ( $blocks as $i => $b ) {
				if ( 'dfb/code' === $b['blockName'] ) {
					unset( $blocks[ $i ]['attrs']['html'], $blocks[ $i ]['attrs']['css'], $blocks[ $i ]['attrs']['js'] );
				}
				if ( ! empty( $b['innerBlocks'] ) ) {
					$blocks[ $i ]['innerBlocks'] = $strip( $b['innerBlocks'] );
				}
			}
			return $blocks;
		};
		$blocks               = parse_blocks( wp_unslash( $data['post_content'] ) );
		$data['post_content'] = wp_slash( serialize_blocks( $strip( $blocks ) ) );
		return $data;
	}

	public function register_blocks(): void {
		$dirs = glob( DFB_DIR . 'build/blocks/*', GLOB_ONLYDIR ) ?: array();
		foreach ( $dirs as $dir ) {
			if ( is_readable( $dir . '/block.json' ) ) {
				register_block_type( $dir );
			}
		}
	}

	/**
	 * Per-request counter, e.g. for unique pagination params / element ids.
	 *
	 * @param string $key Counter name.
	 */
	public static function next_instance( string $key ): int {
		static $counters = array();
		$counters[ $key ] = ( $counters[ $key ] ?? 0 ) + 1;
		return $counters[ $key ];
	}

	/** @return array<string,string> icon name => SVG path data. */
	public static function icons(): array {
		static $icons = null;
		if ( null === $icons ) {
			$icons = json_decode( (string) file_get_contents( DFB_DIR . 'schema/icons.json' ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$icons = is_array( $icons ) ? $icons : array();
		}
		return $icons;
	}

	public static function is_supported( string $name ): bool {
		return 0 === strpos( $name, 'dfb/' ) || in_array( $name, self::CORE_SUPPORTED, true );
	}

	public function add_attribute( array $args, string $name ): array {
		if ( in_array( $name, self::CORE_SUPPORTED, true ) ) {
			$args['attributes']        = $args['attributes'] ?? array();
			$args['attributes']['dfb'] = array( 'type' => 'object' );
		}
		return $args;
	}

	public function category( array $categories ): array {
		array_unshift(
			$categories,
			array(
				'slug'  => 'dfb',
				'title' => __( 'DF Builder', 'df-builder' ),
				'icon'  => null,
			)
		);
		return $categories;
	}
}
