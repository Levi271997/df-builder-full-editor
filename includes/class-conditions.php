<?php
/**
 * Template condition rules.
 *
 * A rule is { mode: include|exclude, rule: <type>, value: string }.
 * A template matches when at least one include rule matches and no exclude rule matches.
 *
 * Evaluation runs against a plain "context" array so it can be unit-tested without WordPress;
 * Conditions::current_context() builds it from the main query.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Conditions {

	/** Rule types → whether they take a value. Keep in sync with src/editor/templates/rules.js. */
	const RULES = array(
		'entire_site'       => false,
		'front_page'        => false,
		'blog_home'         => false,
		'singular'          => true,  // value: post type, '' = any.
		'post_id'           => true,  // value: comma-separated ids.
		'in_term'           => true,  // value: taxonomy:term_id|slug (singular posts having the term).
		'archive'           => false,
		'post_type_archive' => true,  // value: post type.
		'taxonomy_archive'  => true,  // value: taxonomy, or taxonomy:term_id|slug.
		'author_archive'    => false,
		'date_archive'      => false,
		'search'            => false,
		'not_found'         => false,
		'logged_in'         => true,  // value: yes|no.
		'user_role'         => true,  // value: role slug.
	);

	/**
	 * Context keys:
	 *   front_page, home, singular, archive, post_type_archive, tax_archive, author, date, search, 404: bool
	 *   post_type: string (singular post type, or archive post type)
	 *   post_id: int
	 *   terms: list of "taxonomy:term_id" and "taxonomy:slug" for the singular post
	 *   queried_term: ["taxonomy" => string, "id" => int, "slug" => string] for term archives
	 *   logged_in: bool, roles: string[]
	 *
	 * @param array $rules Rules.
	 * @param array $ctx   Context.
	 */
	public static function matches( array $rules, array $ctx ): bool {
		$included = false;
		foreach ( $rules as $rule ) {
			if ( ! is_array( $rule ) || ! isset( self::RULES[ $rule['rule'] ?? '' ] ) ) {
				continue;
			}
			$hit = self::rule_matches( $rule['rule'], trim( (string) ( $rule['value'] ?? '' ) ), $ctx );
			if ( 'exclude' === ( $rule['mode'] ?? 'include' ) ) {
				if ( $hit ) {
					return false;
				}
			} elseif ( $hit ) {
				$included = true;
			}
		}
		return $included;
	}

	/**
	 * Specificity score, used to break priority ties (more specific rules win).
	 *
	 * @param array $rules Rules.
	 */
	public static function specificity( array $rules ): int {
		$weights = array(
			'post_id'           => 50,
			'front_page'        => 45,
			'in_term'           => 40,
			'taxonomy_archive'  => 35,
			'singular'          => 30,
			'post_type_archive' => 30,
			'not_found'         => 30,
			'search'            => 30,
			'blog_home'         => 30,
			'author_archive'    => 25,
			'date_archive'      => 25,
			'archive'           => 20,
			'user_role'         => 15,
			'logged_in'         => 10,
			'entire_site'       => 0,
		);
		$max = 0;
		foreach ( $rules as $rule ) {
			if ( 'exclude' !== ( $rule['mode'] ?? 'include' ) ) {
				$max = max( $max, $weights[ $rule['rule'] ?? '' ] ?? 0 );
			}
		}
		return $max;
	}

	private static function rule_matches( string $rule, string $value, array $ctx ): bool {
		switch ( $rule ) {
			case 'entire_site':
				return true;
			case 'front_page':
				return ! empty( $ctx['front_page'] );
			case 'blog_home':
				return ! empty( $ctx['home'] );
			case 'singular':
				return ! empty( $ctx['singular'] ) && ( '' === $value || ( $ctx['post_type'] ?? '' ) === $value );
			case 'post_id':
				$ids = array_filter( array_map( 'intval', explode( ',', $value ) ) );
				return ! empty( $ctx['singular'] ) && in_array( (int) ( $ctx['post_id'] ?? 0 ), $ids, true );
			case 'in_term':
				return ! empty( $ctx['singular'] ) && '' !== $value && in_array( $value, (array) ( $ctx['terms'] ?? array() ), true );
			case 'archive':
				return ! empty( $ctx['archive'] );
			case 'post_type_archive':
				return ! empty( $ctx['post_type_archive'] ) && ( '' === $value || ( $ctx['post_type'] ?? '' ) === $value );
			case 'taxonomy_archive':
				if ( empty( $ctx['tax_archive'] ) || empty( $ctx['queried_term'] ) ) {
					return false;
				}
				if ( '' === $value ) {
					return true;
				}
				$term  = $ctx['queried_term'];
				$parts = explode( ':', $value, 2 );
				if ( $parts[0] !== ( $term['taxonomy'] ?? '' ) ) {
					return false;
				}
				return ! isset( $parts[1] ) || '' === $parts[1] || (string) ( $term['id'] ?? '' ) === $parts[1] || ( $term['slug'] ?? '' ) === $parts[1];
			case 'author_archive':
				return ! empty( $ctx['author'] );
			case 'date_archive':
				return ! empty( $ctx['date'] );
			case 'search':
				return ! empty( $ctx['search'] );
			case 'not_found':
				return ! empty( $ctx['404'] );
			case 'logged_in':
				return ( 'no' === $value ) ? empty( $ctx['logged_in'] ) : ! empty( $ctx['logged_in'] );
			case 'user_role':
				return in_array( $value, (array) ( $ctx['roles'] ?? array() ), true );
		}
		return false;
	}

	/**
	 * Build context from the main WordPress query.
	 */
	public static function current_context(): array {
		$ctx = array(
			'front_page'        => is_front_page(),
			'home'              => is_home(),
			'singular'          => is_singular(),
			'archive'           => is_archive(),
			'post_type_archive' => is_post_type_archive(),
			'tax_archive'       => is_category() || is_tag() || is_tax(),
			'author'            => is_author(),
			'date'              => is_date(),
			'search'            => is_search(),
			'404'               => is_404(),
			'post_type'         => '',
			'post_id'           => 0,
			'terms'             => array(),
			'queried_term'      => null,
			'logged_in'         => is_user_logged_in(),
			'roles'             => is_user_logged_in() ? (array) wp_get_current_user()->roles : array(),
		);
		$obj = get_queried_object();
		if ( $ctx['singular'] && $obj instanceof \WP_Post ) {
			$ctx['post_type'] = $obj->post_type;
			$ctx['post_id']   = (int) $obj->ID;
			foreach ( get_object_taxonomies( $obj->post_type ) as $tax ) {
				$terms = get_the_terms( $obj, $tax );
				if ( is_array( $terms ) ) {
					foreach ( $terms as $t ) {
						$ctx['terms'][] = $tax . ':' . $t->term_id;
						$ctx['terms'][] = $tax . ':' . $t->slug;
					}
				}
			}
		} elseif ( $ctx['post_type_archive'] ) {
			$pt               = get_query_var( 'post_type' );
			$ctx['post_type'] = is_array( $pt ) ? (string) reset( $pt ) : (string) $pt;
		} elseif ( $ctx['tax_archive'] && $obj instanceof \WP_Term ) {
			$ctx['queried_term'] = array(
				'taxonomy' => $obj->taxonomy,
				'id'       => (int) $obj->term_id,
				'slug'     => $obj->slug,
			);
		}
		return $ctx;
	}
}
