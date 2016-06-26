var _ = require( 'lodash' );
var Events = require( 'backbone-events-standalone' );

class TASK {
	constructor( options ) {
		this.options = options;
	}
	static bindFunctions( context, funcNames ) {
		_.each( funcNames, ( funcName ) => {
			context[ funcName ] = context[ funcName ].bind( context );
		} );
		return context;
	}
}

Events.mixin( TASK.prototype );

module.exports = TASK;
