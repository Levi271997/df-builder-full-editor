<?php
/**
 * Dynamic data via the core Block Bindings API.
 *
 * Core resolves bindings for core/paragraph, core/heading, core/image and core/button.
 * DF Builder blocks are server-rendered and resolve their own bindings with
 * Bindings::resolve() inside render.php, using the same sources.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Bindings {

	public function register(): void {
		add_action( 'init', array( $this, 'register_sources' ) );
	}

	public function register_sources(): void {
		if ( ! function_exists( 'register_block_bindings_source' ) ) {
			return;
		}
		$ctx = array( 'postId', 'postType' );
		register_block_bindings_source(
			'dfb/post',
			array(
				'label'              => __( 'Post field', 'df-builder' ),
				'get_value_callback' => array( self::class, 'post_value' ),
				'uses_context'       => $ctx,
			)
		);
		register_block_bindings_source(
			'dfb/meta',
			array(
				'label'              => __( 'Custom field', 'df-builder' ),
				'get_value_callback' => array( self::class, 'meta_value' ),
				'uses_context'       => $ctx,
			)
		);
		if ( function_exists( 'get_field' ) ) {
			register_block_bindings_source(
				'dfb/acf',
				array(
					'label'              => __( 'ACF field', 'df-builder' ),
					'get_value_callback' => array( self::class, 'acf_value' ),
					'uses_context'       => $ctx,
				)
			);
		}
		register_block_bindings_source(
			'dfb/author',
			array(
				'label'              => __( 'Author', 'df-builder' ),
				'get_value_callback' => array( self::class, 'author_value' ),
				'uses_context'       => $ctx,
			)
		);
		register_block_bindings_source(
			'dfb/site',
			array(
				'label'              => __( 'Site', 'df-builder' ),
				'get_value_callback' => array( self::class, 'site_value' ),
			)
		);
	}

	private static function post_id( $block ): int {
		if ( $block instanceof \WP_Block && ! empty( $block->context['postId'] ) ) {
			return (int) $block->context['postId'];
		}
		return (int) get_the_ID();
	}

	public static function post_value( array $args, $block, string $attr = '' ) {
		$id = self::post_id( $block );
		if ( ! $id || ( ! is_post_publicly_viewable( $id ) && ! current_user_can( 'read_post', $id ) ) ) {
			return null;
		}
		switch ( $args['field'] ?? '' ) {
			case 'title':
				return esc_html( get_the_title( $id ) );
			case 'excerpt':
				return esc_html( get_the_excerpt( $id ) );
			case 'date':
				return esc_html( get_the_date( (string) ( $args['format'] ?? '' ), $id ) );
			case 'modified':
				return esc_html( get_the_modified_date( (string) ( $args['format'] ?? '' ), $id ) );
			case 'permalink':
				return esc_url( get_permalink( $id ) );
			case 'id':
				return (string) $id;
			case 'featured_image':
				$url = get_the_post_thumbnail_url( $id, (string) ( $args['size'] ?? 'large' ) );
				return $url ? esc_url( $url ) : null;
			case 'featured_image_alt':
				$thumb = get_post_thumbnail_id( $id );
				return $thumb ? esc_attr( (string) get_post_meta( $thumb, '_wp_attachment_image_alt', true ) ) : null;
			case 'comment_count':
				return (string) get_comments_number( $id );
		}
		return null;
	}

	public static function meta_value( array $args, $block, string $attr = '' ) {
		$id  = self::post_id( $block );
		$key = (string) ( $args['key'] ?? '' );
		if ( ! $id || '' === $key || is_protected_meta( $key, 'post' ) ) {
			return null;
		}
		$value = get_post_meta( $id, $key, true );
		return is_scalar( $value ) ? esc_html( (string) $value ) : null;
	}

	public static function acf_value( array $args, $block, string $attr = '' ) {
		$field = (string) ( $args['field'] ?? '' );
		if ( '' === $field || ! function_exists( 'get_field' ) ) {
			return null;
		}
		$value = get_field( $field, self::post_id( $block ) );
		if ( is_array( $value ) ) {
			// Image/file/link field arrays.
			if ( isset( $value['url'] ) ) {
				return esc_url( $value['url'] );
			}
			if ( isset( $value['title'] ) ) {
				return esc_html( (string) $value['title'] );
			}
			return null;
		}
		if ( is_numeric( $value ) && in_array( $attr, array( 'url', 'src' ), true ) ) {
			$url = wp_get_attachment_url( (int) $value );
			return $url ? esc_url( $url ) : null;
		}
		return is_scalar( $value ) ? wp_kses_post( (string) $value ) : null;
	}

	public static function author_value( array $args, $block, string $attr = '' ) {
		$post = get_post( self::post_id( $block ) );
		if ( ! $post ) {
			return null;
		}
		$uid = (int) $post->post_author;
		switch ( $args['field'] ?? '' ) {
			case 'name':
				return esc_html( get_the_author_meta( 'display_name', $uid ) );
			case 'description':
				return esc_html( get_the_author_meta( 'description', $uid ) );
			case 'url':
				return esc_url( get_author_posts_url( $uid ) );
			case 'avatar':
				$url = get_avatar_url( $uid, array( 'size' => 192 ) );
				return $url ? esc_url( $url ) : null;
		}
		return null;
	}

	public static function site_value( array $args, $block = null, string $attr = '' ) {
		switch ( $args['field'] ?? '' ) {
			case 'title':
				return esc_html( get_bloginfo( 'name' ) );
			case 'tagline':
				return esc_html( get_bloginfo( 'description' ) );
			case 'url':
				return esc_url( home_url( '/' ) );
			case 'year':
				return gmdate( 'Y' );
		}
		return null;
	}

	/**
	 * Resolve bindings for a DF Builder block's attributes (used by render.php files).
	 *
	 * @param array     $attributes Block attributes.
	 * @param \WP_Block $block      Block instance.
	 * @return array Attributes with bound values substituted.
	 */
	public static function resolve( array $attributes, $block ): array {
		$bindings = $attributes['metadata']['bindings'] ?? null;
		if ( ! is_array( $bindings ) || ! function_exists( 'get_block_bindings_source' ) ) {
			return $attributes;
		}
		foreach ( $bindings as $attr => $binding ) {
			if ( ! is_array( $binding ) || empty( $binding['source'] ) || 0 !== strpos( $binding['source'], 'dfb/' ) ) {
				continue;
			}
			$source = get_block_bindings_source( $binding['source'] );
			if ( ! $source ) {
				continue;
			}
			$value = $source->get_value( (array) ( $binding['args'] ?? array() ), $block, (string) $attr );
			if ( null !== $value ) {
				$attributes[ $attr ] = $value;
			}
		}
		return $attributes;
	}
}
