<?php
/**
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package DFBuilder
 */

defined( 'ABSPATH' ) || exit;

$dfb_crumbs = \DFBuilder\Breadcrumbs::trail( (string) ( $attributes['homeLabel'] ?? 'Home' ) );
if ( empty( $attributes['showCurrent'] ) && count( $dfb_crumbs ) > 1 && '' === end( $dfb_crumbs )['url'] ) {
	array_pop( $dfb_crumbs );
}
if ( count( $dfb_crumbs ) < 2 ) {
	return;
}

$dfb_sep   = (string) ( $attributes['separator'] ?? '›' );
$dfb_items = '';
foreach ( array_values( $dfb_crumbs ) as $dfb_i => $dfb_c ) {
	$dfb_pos   = $dfb_i + 1;
	$dfb_name  = '<span itemprop="name">' . esc_html( $dfb_c['label'] ) . '</span>';
	$dfb_inner = '' !== $dfb_c['url']
		? '<a itemprop="item" href="' . esc_url( $dfb_c['url'] ) . '">' . $dfb_name . '</a>'
		: '<span itemprop="item" aria-current="page">' . $dfb_name . '</span>';
	$dfb_items .= sprintf(
		'<li class="dfb-breadcrumbs__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">%1$s<meta itemprop="position" content="%2$d"></li>%3$s',
		$dfb_inner,
		$dfb_pos,
		$dfb_pos < count( $dfb_crumbs ) ? '<li class="dfb-breadcrumbs__sep" aria-hidden="true">' . esc_html( $dfb_sep ) . '</li>' : ''
	);
}

printf(
	'<nav %1$s aria-label="%2$s"><ol itemscope itemtype="https://schema.org/BreadcrumbList">%3$s</ol></nav>',
	get_block_wrapper_attributes( array( 'class' => 'dfb-breadcrumbs' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	esc_attr__( 'Breadcrumb', 'df-builder' ),
	$dfb_items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
);
