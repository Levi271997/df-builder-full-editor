<?php
/**
 * Pure unit tests: Style_Engine and Conditions don't depend on WordPress.
 *
 * @package DFBuilder
 */

define( 'ABSPATH', __DIR__ . '/' );

require dirname( __DIR__, 2 ) . '/vendor/autoload.php';
require dirname( __DIR__, 2 ) . '/includes/class-style-engine.php';
require dirname( __DIR__, 2 ) . '/includes/class-conditions.php';
