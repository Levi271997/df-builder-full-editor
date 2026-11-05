<?php
/**
 * @package DFBuilder
 */

use DFBuilder\Style_Engine;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class StyleEngineTest extends TestCase {

	public static function fixtures(): array {
		$list = json_decode( file_get_contents( dirname( __DIR__ ) . '/fixtures/css.json' ), true );
		$out  = array();
		foreach ( $list as $f ) {
			$out[ $f['name'] ] = array( $f );
		}
		return $out;
	}

	/**
	 * Same fixtures as src/shared/test/css-generator.test.js → JS and PHP output must match.
	 */
	#[DataProvider( 'fixtures' )]
	public function test_parity_with_js( array $f ): void {
		$bps = $f['breakpoints'] ?? Style_Engine::DEFAULT_BREAKPOINTS;
		$this->assertSame( $f['expected'], Style_Engine::generate( $f['selector'], $f['styles'], $bps ) );
	}

	public function test_clean_drops_unknown_and_invalid(): void {
		$clean = Style_Engine::clean(
			array(
				'base'   => array(
					'display' => 'flex',
					'bogus'   => '1',
					'color'   => 'red;}',
				),
				'evil'   => array( 'display' => 'flex' ),
				'mobile' => array( 'display' => 'flex' ),
				'phone'  => array( 'width' => 100 ),
			)
		);
		$this->assertSame(
			array(
				'base'  => array( 'display' => 'flex' ),
				'phone' => array( 'width' => '100' ),
			),
			$clean
		);
	}

	public function test_non_scalar_values_rejected(): void {
		$def = array(
			'type' => 'string',
			'prop' => 'x',
			'key'  => 'x',
		);
		$this->assertNull( Style_Engine::sanitize_value( $def, array( 'a' ) ) );
		$this->assertNull( Style_Engine::sanitize_value( $def, true ) );
	}

	public function test_identifiers(): void {
		$this->assertTrue( Style_Engine::is_valid_uid( 'babc123' ) );
		$this->assertFalse( Style_Engine::is_valid_uid( 'ABC' ) );
		$this->assertFalse( Style_Engine::is_valid_uid( "abcd\n" ) );
		$this->assertTrue( Style_Engine::is_valid_class_name( 'btn-primary' ) );
		$this->assertFalse( Style_Engine::is_valid_class_name( '1btn' ) );
		$this->assertFalse( Style_Engine::is_valid_class_name( 'a{b' ) );
	}
}
