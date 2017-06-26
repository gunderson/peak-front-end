var _ = require( 'lodash' );
var Model = require( '_TASK/models/Model' );
var View = require( '_TASK/views/View' );

class TransportBar extends View {
	constructor( options ) {
		super( _.mergeWith( {

			// ---------------------------------------------------
			// Class Properties

			name: undefined,
			el: undefined,

			// ---------------------------------------------------
			// Local Properties

			target: undefined,
			model: new Model( {
				title: '',
				isPlaying: false,
				currentTime: 0,
				duration: 0,
				isFullscreen: false,
				isMuted: false,
				volume: 1
			} ),

			// ---------------------------------------------------
			// Event Listeners

			events: [ {
				eventName: 'click',
				selector: 'button.play',
				handler: 'onPlayButtonClick'
			}, {
				eventName: 'click',
				selector: 'button.stop',
				handler: 'onStopButtonClick'
			}, {
				eventName: 'click',
				selector: 'button.fullscreen',
				handler: 'onFullscreenButtonClick'
			} ],

			// ---------------------------------------------------
			// Function Bindings
			bindFunctions: [
				'onPlayButtonClick',
				'onStopButtonClick',
				'onFullscreenButtonClick',
				'onChangeVolume',
				'onClickToggleMute'
			]
		}, options, View.mergeRules ) );

	}

	// ---------------------------------------------------
	// Public Methods

	// ---------------------------------------------------
	// Event Handlers

	onPlayButtonClick() {
		if ( this.target ) this.target.play();
		this.trigger( 'play' );
	}

	// ---------------------------------------------------

	onStopButtonClick() {
		if ( this.target ) this.target.stop();
		this.trigger( 'stop' );
	}

	// ---------------------------------------------------

	onFullscreenButtonClick() {
		this.trigger( 'fullscreen' );
	}

	// ---------------------------------------------------

	onChangeVolume( e ) {
		if ( this.target ) this.target.volume = e.target.value;
		this.trigger( 'volume', {
			value: e.target.value
		} );
	}

	// ---------------------------------------------------

	onClickToggleMute() {

	}

	// ---------------------------------------------------

	// ---------------------------------------------------
	// Getters & Setters
}

module.exports = TransportBar;
