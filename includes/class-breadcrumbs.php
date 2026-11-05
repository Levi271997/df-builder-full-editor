<?php
/**
 * Breadcrumb trail for the current request.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Breadcrumbs {

	/**
	 * @param string $home_label Label for the first crumb.
	 * @return array<int,array{label:string,url:string}> Last item is the current page (url '').
	 */
	public static function trail( string $home_label ): array {
		$crumbs = array(
			array(
				'label' => $home_label,
				'url'   => home_url( '/' ),
			),
		);

		if ( is_front_page() ) {
			return $crumbs;
		}

		$blog_page = (int) get_option( 'page_for_posts' );

		if ( is_home() ) {
			$crumbs[] = self::current( $blog_page ? get_the_title( $blog_page ) : __( 'Blog', 'df-builder' ) );
			return $crumbs;
		}

		if ( is_singular() ) {
			$post = get_queried_object();
			if ( ! $post instanceof \WP_Post ) {
				return $crumbs;
			}
			if ( 'post' === $post->post_type && $blog_page ) {
				$crumbs[] = self::link( get_the_title( $blog_page ), get_permalink( $blog_page ) );
			} elseif ( 'page' !== $post->post_type ) {
				$pto = get_post_type_object( $post->post_type );
				if ( $pto && $pto->has_archive ) {
					$crumbs[] = self::link( $pto->labels->name, (string) get_post_type_archive_link( $post->post_type ) );
				}
			}
			if ( 'post' === $post->post_type ) {
				$cats = get_the_category( $post->ID );
				if ( $cats ) {
					$cat = $cats[0];
					foreach ( array_reverse( get_ancestors( $cat->term_id, 'category', 'taxonomy' ) ) as $ancestor ) {
						$t = get_term( $ancestor, 'category' );
						if ( $t && ! is_wp_error( $t ) ) {
							$crumbs[] = self::link( $t->name, (string) get_term_link( $t ) );
						}
					}
					$crumbs[] = self::link( $cat->name, (string) get_term_link( $cat ) );
				}
			}
			foreach ( array_reverse( get_post_ancestors( $post ) ) as $ancestor ) {
				$crumbs[] = self::link( get_the_title( $ancestor ), (string) get_permalink( $ancestor ) );
			}
			$crumbs[] = self::current( get_the_title( $post ) );
			return $crumbs;
		}

		if ( is_category() || is_tag() || is_tax() ) {
			$term = get_queried_object();
			if ( $term instanceof \WP_Term ) {
				foreach ( array_reverse( get_ancestors( $term->term_id, $term->taxonomy, 'taxonomy' ) ) as $ancestor ) {
					$t = get_term( $ancestor, $term->taxonomy );
					if ( $t && ! is_wp_error( $t ) ) {
						$crumbs[] = self::link( $t->name, (string) get_term_link( $t ) );
					}
				}
				$crumbs[] = self::current( $term->name );
			}
			return $crumbs;
		}

		if ( is_post_type_archive() ) {
			$crumbs[] = self::current( post_type_archive_title( '', false ) );
		} elseif ( is_author() ) {
			$crumbs[] = self::current( get_the_author_meta( 'display_name', (int) get_query_var( 'author' ) ) );
		} elseif ( is_search() ) {
			/* translators: %s: search query */
			$crumbs[] = self::current( sprintf( __( 'Search: %s', 'df-builder' ), get_search_query() ) );
		} elseif ( is_404() ) {
			$crumbs[] = self::current( __( 'Page not found', 'df-builder' ) );
		} elseif ( is_date() ) {
			$crumbs[] = self::current( get_the_archive_title() );
		}
		return $crumbs;
	}

	private static function link( string $label, string $url ): array {
		return array(
			'label' => wp_strip_all_tags( $label ),
			'url'   => $url,
		);
	}

	private static function current( string $label ): array {
		return array(
			'label' => wp_strip_all_tags( $label ),
			'url'   => '',
		);
	}
}
