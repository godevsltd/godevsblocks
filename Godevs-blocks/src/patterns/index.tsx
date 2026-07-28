import { render } from '@wordpress/element';
import { PatternsApp } from './App';

const root = document.getElementById( 'goblocks-patterns-root' );

if ( root ) {
	render( <PatternsApp />, root );
}
