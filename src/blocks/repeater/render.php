<?php
/**
 * Posts Grid (Repeater): renders the inner "card" blocks once per post, with postId context.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_instance = \DFBuilder\Blocks::next_instance( 'repeater' );

$dfb_cols  = min( 6, max( 1, (int) ( $attributes['columns'] ?? 3 ) ) );
$dfb_stack = in_array( $attributes['stackOn'] ?? '', array( 'none', 'tablet', 'landscape', 'phone' ), true ) ? $attributes['stackOn'] : 'landscape';
$dfb_param = 'dfb-pg-' . $dfb_instance;
$dfb_paged = max( 1, isset( $_GET[ $dfb_param ] ) ? absint( $_GET[ $dfb_param ] ) : 1 ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only pagination.

if ( ! empty( $attributes['inherit'] ) ) {
	global $wp_query;
	$dfb_query  = $wp_query;
	$dfb_shared = true;
} else {
	$dfb_post_type = sanitize_key( $attributes['postType'] ?? 'post' );
	if ( ! post_type_exists( $dfb_post_type ) || ! is_post_type_viewable( $dfb_post_type ) ) {
		return;
	}
	$dfb_args = array(
		'post_type'           => $dfb_post_type,
		'post_status'         => 'publish',
		'posts_per_page'      => min( 48, max( 1, (int) ( $attributes['perPage'] ?? 6 ) ) ),
		'orderby'             => in_array( $attributes['orderBy'] ?? '', array( 'date', 'title', 'modified', 'menu_order', 'comment_count', 'rand' ), true ) ? $attributes['orderBy'] : 'date',
		'order'               => 'asc' === ( $attributes['order'] ?? '' ) ? 'ASC' : 'DESC',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => empty( $attributes['pagination'] ),
	);
	$dfb_offset = max( 0, (int) ( $attributes['offset'] ?? 0 ) );
	if ( $dfb_offset || $dfb_paged > 1 ) {
		$dfb_args['offset'] = $dfb_offset + ( $dfb_paged - 1 ) * $dfb_args['posts_per_page'];
	}
	$dfb_tax = sanitize_key( $attributes['taxonomy'] ?? '' );
	if ( $dfb_tax && taxonomy_exists( $dfb_tax ) && '' !== trim( (string) ( $attributes['terms'] ?? '' ) ) ) {
		$dfb_terms = array_filter( array_map( 'trim', explode( ',', (string) $attributes['terms'] ) ) );
		$dfb_ids   = array_filter( $dfb_terms, 'is_numeric' );
		$dfb_args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			array(
				'taxonomy' => $dfb_tax,
				'field'    => count( $dfb_ids ) === count( $dfb_terms ) ? 'term_id' : 'slug',
				'terms'    => count( $dfb_ids ) === count( $dfb_terms ) ? array_map( 'intval', $dfb_terms ) : array_map( 'sanitize_title', $dfb_terms ),
			),
		);
	}
	if ( ! empty( $attributes['excludeCurrent'] ) && is_singular() ) {
		$dfb_args['post__not_in'] = array( (int) get_queried_object_id() );
	}
	$dfb_query  = new WP_Query( $dfb_args );
	$dfb_shared = false;
}

$dfb_wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'dfb-repeater dfb-columns' . ( 'none' !== $dfb_stack ? ' dfb-stack-' . $dfb_stack : '' ),
		'style' => '--dfb-cols:' . $dfb_cols,
	)
);

if ( ! $dfb_query->have_posts() ) {
	$dfb_empty = trim( (string) ( $attributes['emptyText'] ?? '' ) );
	if ( '' !== $dfb_empty ) {
		printf( '<div %1$s><p class="dfb-repeater__empty">%2$s</p></div>', $dfb_wrapper, esc_html( $dfb_empty ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
	return;
}

$dfb_items = '';
while ( $dfb_query->have_posts() ) {
	$dfb_query->the_post();
	$dfb_html = '';
	foreach ( $block->parsed_block['innerBlocks'] as $dfb_inner ) {
		$dfb_html .= ( new WP_Block(
			$dfb_inner,
			array(
				'postId'   => get_the_ID(),
				'postType' => get_post_type(),
			)
		) )->render();
	}
	$dfb_items .= '<div class="dfb-repeater__item">' . $dfb_html . '</div>';
}

$dfb_pagination = '';
if ( ! empty( $attributes['pagination'] ) ) {
	if ( $dfb_shared ) {
		$dfb_pagination = (string) get_the_posts_pagination();
	} else {
		$dfb_per    = (int) $dfb_query->get( 'posts_per_page' );
		$dfb_total  = (int) ceil( max( 0, $dfb_query->found_posts - (int) ( $attributes['offset'] ?? 0 ) ) / max( 1, $dfb_per ) );
		$dfb_links  = paginate_links(
			array(
				'base'    => esc_url_raw( add_query_arg( $dfb_param, '%#%' ) ),
				'format'  => '',
				'current' => $dfb_paged,
				'total'   => $dfb_total,
				'type'    => 'list',
			)
		);
		$dfb_pagination = $dfb_links ? '<nav class="dfb-repeater__pagination" aria-label="' . esc_attr__( 'Pagination', 'df-builder' ) . '">' . $dfb_links . '</nav>' : '';
	}
}

if ( $dfb_shared ) {
	$dfb_query->rewind_posts();
}
wp_reset_postdata();

printf(
	'<div %1$s>%2$s</div>%3$s',
	$dfb_wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$dfb_items, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered blocks.
	$dfb_pagination // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core pagination markup.
);
