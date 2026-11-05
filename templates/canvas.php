<?php
/**
 * Full-page canvas used when a DF Builder template matches. Replaces the theme's output.
 *
 * @package DFBuilder
 */

use DFBuilder\Templates;

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'dfb-canvas' ); ?>>
<?php wp_body_open(); ?>
<?php Templates::render( 'header' ); ?>
<main id="dfb-main" class="dfb-main">
<?php
if ( is_singular() ) {
	while ( have_posts() ) {
		the_post();
		if ( ! Templates::render( 'content' ) ) {
			echo '<article class="dfb-default-content">';
			the_content();
			echo '</article>';
		}
	}
} elseif ( ! Templates::render( 'content' ) ) {
	if ( have_posts() ) {
		echo '<div class="dfb-default-archive">';
		while ( have_posts() ) {
			the_post();
			printf(
				'<article class="dfb-default-archive__item"><h2><a href="%s">%s</a></h2>%s</article>',
				esc_url( get_permalink() ),
				esc_html( get_the_title() ),
				wp_kses_post( get_the_excerpt() )
			);
		}
		the_posts_pagination();
		echo '</div>';
	} else {
		echo '<p class="dfb-default-empty">' . esc_html__( 'Nothing found.', 'df-builder' ) . '</p>';
	}
}
?>
</main>
<?php Templates::render( 'footer' ); ?>
<?php wp_footer(); ?>
</body>
</html>
