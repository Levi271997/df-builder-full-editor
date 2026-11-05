import fixtures from '../../../tests/fixtures/css.json';
import {
	generateCss,
	sanitizeValue,
	inheritedValue,
	isValidClassName,
	isValidUid,
	newUid,
	SCHEMA,
} from '../css-generator';

describe( 'generateCss parity fixtures', () => {
	test.each( fixtures.map( ( f ) => [ f.name, f ] ) )( '%s', ( _name, f ) => {
		expect(
			generateCss( f.selector, f.styles, f.breakpoints || undefined )
		).toBe( f.expected );
	} );
} );

describe( 'sanitizeValue', () => {
	const def = ( key ) => SCHEMA.find( ( d ) => d.key === key );

	it( 'keeps unitless line-height', () => {
		expect( sanitizeValue( def( 'lineHeight' ), '1.5' ) ).toBe( '1.5' );
	} );
	it( 'adds px to bare numbers for lengths', () => {
		expect( sanitizeValue( def( 'width' ), 300 ) ).toBe( '300px' );
	} );
	it( 'accepts calc and var', () => {
		expect( sanitizeValue( def( 'width' ), 'calc(100% - 2rem)' ) ).toBe(
			'calc(100% - 2rem)'
		);
		expect(
			sanitizeValue( def( 'color' ), 'var(--wp--preset--color--primary)' )
		).toBe( 'var(--wp--preset--color--primary)' );
	} );
	it( 'rejects css injection', () => {
		expect(
			sanitizeValue( def( 'gridTemplateColumns' ), '1fr}a{color:red' )
		).toBeNull();
		expect(
			sanitizeValue( def( 'backgroundImage' ), 'https://x.com/a") ;' )
		).toBeNull();
	} );
} );

describe( 'inheritedValue', () => {
	const styles = { base: { gap: '20px' }, tablet: { gap: '10px' } };
	it( 'cascades from nearest larger breakpoint', () => {
		expect( inheritedValue( styles, 'phone', 'gap' ) ).toBe( '10px' );
		expect( inheritedValue( styles, 'tablet', 'gap' ) ).toBe( '20px' );
		expect( inheritedValue( styles, 'base', 'gap' ) ).toBeUndefined();
		expect( inheritedValue( styles, 'hover', 'gap' ) ).toBe( '20px' );
	} );
} );

describe( 'identifiers', () => {
	it( 'generates valid uids', () => {
		for ( let i = 0; i < 50; i++ ) {
			expect( isValidUid( newUid() ) ).toBe( true );
		}
	} );
	it( 'validates class names', () => {
		expect( isValidClassName( 'btn-primary' ) ).toBe( true );
		expect( isValidClassName( '1btn' ) ).toBe( false );
		expect( isValidClassName( 'a b' ) ).toBe( false );
	} );
} );
