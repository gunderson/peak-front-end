var _ = require( 'lodash' );
var $ = require( 'jquery' );
var TaskModel = require( '_TASK/models/Model' );
var router = require( 'page' );

class AppModel extends TaskModel {
	constructor( options ) {
		super( options );

		// ---------------------------------------------------------
		// Local Props

		_.extend( this, {
			prevRoute: null,
			_route: {
				parts: [ 'bootstrap route' ]
			},
			serverAddress: this.ENV.address,
			serverPort: this.ENV.port
		} );

		// ---------------------------------------------------------
		// Bind Functions

		TaskModel.bindFunctions( this, [
			'setupRouter',
			'setupSocket',
			'onRoute'
		] );

		// ---------------------------------------------------------
		// Init chain

		// this.setupRouter();
		// this.setupSocket();

		// ---------------------------------------------------------
		// Event Listeners

		$( window )
			.on( 'resize', () => this.trigger( 'resize' ) );
	}

	// ---------------------------------------------------------
	// Controls

	play() {
		return $.get( `http://${this.deviceAddress}:${this.devicePort}/play` );
	}

	stop() {
		return $.get( `http://${this.deviceAddress}:${this.devicePort}/stop` );
	}

	setLed( id, state ) {
		return $.get( `http://${this.deviceAddress}:${this.devicePort}/led/${id}/${state}` );
	}

	// ---------------------------------------------------------
	// Routing

	setupSocket() {
		// this.socket = io( `http://${this.localAddress}` );
		// this.socket.on( 'connect', function() {} );
		// this.socket.on( 'event', function( data ) {} );
		// this.socket.on( 'disconnect', function() {} );
	}

	setupRouter( routes ) {
		router.base( '/#' );
		router( '/', `/${routes[0]}` );
		_.each( routes, ( route ) => {
			router( `/${route}`, this.onRoute );
		} );
		router( '*', `/${routes[0]}` );
		router();
	}

	onRoute( ctx ) {
		// console.log( ctx );
		this.route = ctx;
	}

	// ---------------------------------------------------------
	// Getters & Setters

	get route() {
		return this._route;
	}

	set route( ctx ) {
		// Get constituent parts for use in page-route handling
		ctx.parts = ctx.path
			.slice( 1 )
			.split( '/' );
		this.prevRoute = this._route;
		this._route = ctx;
		this._route.prevRoute = this.prevRoute;

		this.trigger( 'route', this._route );
		return ctx;
	}
}

module.exports = AppModel;
