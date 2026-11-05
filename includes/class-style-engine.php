<?php
/**
 * Style schema → CSS. Mirrors src/shared/css-generator.js exactly.
 * tests/fixtures/css.json is the parity contract between the two.
 *
 * This class is intentionally WordPress-free so it can be unit-tested in isolation.
 *
 * @package DFBuilder
 */

namespace DFBuilder;

defined( 'ABSPATH' ) || exit;

final class Style_Engine {

	const BREAKPOINTS         = array( 'tablet', 'landscape', 'phone' );
	const STATES              = array( 'base', 'tablet', 'landscape', 'phone', 'hover' );
	const DEFAULT_BREAKPOINTS = array(
		'tablet'    => 992,
		'landscape' => 768,
		'phone'     => 480,
	);

	const BLOCKLIST       = '/[;{}<>\\\\]|\/\*|@import|expression\s*\(|javascript:/i';
	const NUMBER          = '/^-?(\d+\.?\d*|\.\d+)$/D';
	const LENGTH          = '/^-?(\d+\.?\d*|\.\d+)(px|em|rem|%|vw|vh|svh|dvh|vmin|vmax|ch|ex|fr|deg|s|ms)$/D';
	const FUNC            = '/^(calc|clamp|min|max|var)\([a-zA-Z0-9%.,+\-*\/ ()_]+\)$/D';
	const HEX             = '/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/D';
	const COLOR_FUNC      = '/^(rgb|rgba|hsl|hsla|oklch|color-mix)\([a-zA-Z0-9.,%\s\/#-]+\)$/D';
	const NAMED           = '/^[a-zA-Z]+$/D';
	const URL_RE          = '/^((https?:)?\/\/|\/)[^"\'()\\\\\s]+$/D';
	const URL_FN          = '/url\s*\(/i';
	const LENGTH_KEYWORDS = array( 'auto', 'none', 'fit-content', 'min-content', 'max-content', 'normal', 'inherit', 'initial', 'unset' );

	/** @var array|null */
	private static $schema = null;

	/**
	 * Schema properties, in order.
	 */
	public static function schema(): array {
		if ( null === self::$schema ) {
			$file         = dirname( __DIR__ ) . '/schema/style-properties.json';
			$data         = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			self::$schema = is_array( $data['properties'] ?? null ) ? $data['properties'] : array();
		}
		return self::$schema;
	}

	/**
	 * Validate/normalise one value. Returns the CSS value or null.
	 *
	 * @param array $def Schema property definition.
	 * @param mixed $raw Stored value.
	 */
	public static function sanitize_value( array $def, $raw ): ?string {
		if ( ! is_string( $raw ) && ! is_int( $raw ) && ! is_float( $raw ) ) {
			return null;
		}
		$v = trim( (string) $raw );
		if ( '' === $v || preg_match( self::BLOCKLIST, $v ) ) {
			return null;
		}
		switch ( $def['type'] ?? '' ) {
			case 'keyword':
				return in_array( $v, (array) ( $def['options'] ?? array() ), true ) ? $v : null;
			case 'number':
				return preg_match( self::NUMBER, $v ) ? $v : null;
			case 'length':
				if ( preg_match( self::NUMBER, $v ) ) {
					return ( ! empty( $def['unitless'] ) || '0' === $v ) ? $v : $v . 'px';
				}
				if ( preg_match( self::LENGTH, $v ) || preg_match( self::FUNC, $v ) || in_array( $v, self::LENGTH_KEYWORDS, true ) ) {
					return $v;
				}
				return null;
			case 'color':
				return ( preg_match( self::HEX, $v ) || preg_match( self::COLOR_FUNC, $v ) || preg_match( self::FUNC, $v ) || preg_match( self::NAMED, $v ) ) ? $v : null;
			case 'url':
				return preg_match( self::URL_RE, $v ) ? 'url("' . $v . '")' : null;
			case 'string':
				return preg_match( self::URL_FN, $v ) ? null : $v;
			default:
				return null;
		}
	}

	/**
	 * Declarations for one state object, in schema order.
	 *
	 * @param mixed $values { key: value }.
	 */
	public static function declarations( $values ): string {
		if ( ! is_array( $values ) ) {
			return '';
		}
		$out = array();
		foreach ( self::schema() as $def ) {
			if ( ! array_key_exists( $def['key'], $values ) ) {
				continue;
			}
			$v = self::sanitize_value( $def, $values[ $def['key'] ] );
			if ( null !== $v ) {
				$out[] = $def['prop'] . ':' . $v;
			}
		}
		return implode( ';', $out );
	}

	/**
	 * @param string $selector    Already-validated selector.
	 * @param mixed  $styles      { base, tablet, landscape, phone, hover }.
	 * @param array  $breakpoints { tablet, landscape, phone } max-widths.
	 */
	public static function generate( string $selector, $styles, array $breakpoints = self::DEFAULT_BREAKPOINTS ): string {
		if ( ! is_array( $styles ) ) {
			return '';
		}
		$css  = '';
		$base = self::declarations( $styles['base'] ?? null );
		if ( '' !== $base ) {
			$css .= $selector . '{' . $base . '}';
		}
		$hover = self::declarations( $styles['hover'] ?? null );
		if ( '' !== $hover ) {
			$css .= $selector . ':hover{' . $hover . '}';
		}
		foreach ( self::BREAKPOINTS as $bp ) {
			$d = self::declarations( $styles[ $bp ] ?? null );
			if ( '' !== $d ) {
				$width = (int) ( ! empty( $breakpoints[ $bp ] ) ? $breakpoints[ $bp ] : self::DEFAULT_BREAKPOINTS[ $bp ] );
				$css  .= '@media (max-width:' . $width . 'px){' . $selector . '{' . $d . '}}';
			}
		}
		return $css;
	}

	/**
	 * Strip anything that is not a known state/property, sanitising values. Used before persisting.
	 *
	 * @param mixed $styles Raw styles.
	 */
	public static function clean( $styles ): array {
		$clean = array();
		if ( ! is_array( $styles ) ) {
			return $clean;
		}
		$defs = array();
		foreach ( self::schema() as $def ) {
			$defs[ $def['key'] ] = $def;
		}
		foreach ( self::STATES as $state ) {
			if ( empty( $styles[ $state ] ) || ! is_array( $styles[ $state ] ) ) {
				continue;
			}
			foreach ( $styles[ $state ] as $key => $value ) {
				if ( isset( $defs[ $key ] ) && null !== self::sanitize_value( $defs[ $key ], $value ) ) {
					$clean[ $state ][ $key ] = (string) $value;
				}
			}
		}
		return $clean;
	}

	public static function is_valid_uid( $uid ): bool {
		return is_string( $uid ) && (bool) preg_match( '/^[a-z0-9]{4,16}$/D', $uid );
	}

	public static function is_valid_class_name( $name ): bool {
		return is_string( $name ) && (bool) preg_match( '/^-?[_a-zA-Z][_a-zA-Z0-9-]{0,63}$/D', $name );
	}
}
