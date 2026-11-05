<?php
/**
 * @package DFBuilder
 */

use DFBuilder\Conditions;
use PHPUnit\Framework\TestCase;

final class ConditionsTest extends TestCase {

	private function single_post( array $extra = array() ): array {
		return array_merge(
			array(
				'singular'  => true,
				'post_type' => 'post',
				'post_id'   => 42,
				'terms'     => array( 'category:7', 'category:news' ),
				'logged_in' => false,
				'roles'     => array(),
			),
			$extra
		);
	}

	private function rule( string $rule, string $value = '', string $mode = 'include' ): array {
		return compact( 'mode', 'rule', 'value' );
	}

	public function test_no_include_rule_never_matches(): void {
		$this->assertFalse( Conditions::matches( array(), $this->single_post() ) );
		$this->assertFalse( Conditions::matches( array( $this->rule( 'front_page', '', 'exclude' ) ), $this->single_post() ) );
	}

	public function test_entire_site_with_exclusion(): void {
		$rules = array( $this->rule( 'entire_site' ), $this->rule( 'post_id', '42', 'exclude' ) );
		$this->assertFalse( Conditions::matches( $rules, $this->single_post() ) );
		$this->assertTrue( Conditions::matches( $rules, $this->single_post( array( 'post_id' => 43 ) ) ) );
	}

	public function test_singular_post_type(): void {
		$this->assertTrue( Conditions::matches( array( $this->rule( 'singular', 'post' ) ), $this->single_post() ) );
		$this->assertFalse( Conditions::matches( array( $this->rule( 'singular', 'page' ) ), $this->single_post() ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'singular' ) ), $this->single_post( array( 'post_type' => 'page' ) ) ) );
	}

	public function test_post_ids_list(): void {
		$this->assertTrue( Conditions::matches( array( $this->rule( 'post_id', '1, 42 ,7' ) ), $this->single_post() ) );
	}

	public function test_in_term_by_id_or_slug(): void {
		$this->assertTrue( Conditions::matches( array( $this->rule( 'in_term', 'category:7' ) ), $this->single_post() ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'in_term', 'category:news' ) ), $this->single_post() ) );
		$this->assertFalse( Conditions::matches( array( $this->rule( 'in_term', 'category:events' ) ), $this->single_post() ) );
	}

	public function test_taxonomy_archive(): void {
		$ctx = array(
			'archive'      => true,
			'tax_archive'  => true,
			'queried_term' => array(
				'taxonomy' => 'category',
				'id'       => 7,
				'slug'     => 'news',
			),
		);
		$this->assertTrue( Conditions::matches( array( $this->rule( 'taxonomy_archive', 'category' ) ), $ctx ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'taxonomy_archive', 'category:news' ) ), $ctx ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'taxonomy_archive', 'category:7' ) ), $ctx ) );
		$this->assertFalse( Conditions::matches( array( $this->rule( 'taxonomy_archive', 'post_tag' ) ), $ctx ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'archive' ) ), $ctx ) );
	}

	public function test_visitor_rules(): void {
		$ctx = array(
			'logged_in' => true,
			'roles'     => array( 'editor' ),
		);
		$this->assertTrue( Conditions::matches( array( $this->rule( 'logged_in', 'yes' ) ), $ctx ) );
		$this->assertFalse( Conditions::matches( array( $this->rule( 'logged_in', 'no' ) ), $ctx ) );
		$this->assertTrue( Conditions::matches( array( $this->rule( 'user_role', 'editor' ) ), $ctx ) );
	}

	public function test_unknown_rules_ignored(): void {
		$this->assertFalse( Conditions::matches( array( $this->rule( 'nope' ) ), $this->single_post() ) );
	}

	public function test_specificity_orders_rules(): void {
		$this->assertGreaterThan(
			Conditions::specificity( array( $this->rule( 'singular', 'post' ) ) ),
			Conditions::specificity( array( $this->rule( 'post_id', '42' ) ) )
		);
		$this->assertSame( 0, Conditions::specificity( array( $this->rule( 'entire_site' ) ) ) );
	}
}
