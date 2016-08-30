/**
 * The *AudioSource object creates an analyzer node, sets up a repeating function with setInterval
 * which samples the input and turns it into an FFT array. The object has two properties:
 * streamData - this is the Uint8Array containing the FFT data
 * volume - cumulative value of all the bins of the streaData.
 *
 * The MicrophoneAudioSource uses the getUserMedia interface to get real-time data from the user's microphone. Not used currently but included for possible future use.
 */

var DataSource = require( '../Data-Source' );
var prefixMethod = require( '_TASK/lib/prefixmethod' );

prefixMethod( 'getUserMedia', {
	parent: navigator
} );
prefixMethod( 'AudioContext' );

class MicrophoneDataSource extends DataSource {
	constructor( options ) {
		super( options );
		this.startTime = Date.now();
		this.fftsize = 2048;
		this.volume = 0;
		this.analyser;

		navigator.getUserMedia( {
			audio: true
		}, ( stream ) => {
			this.audioCtx = new window.AudioContext();
			this.mic = this.audioCtx.createMediaStreamSource( stream );
			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = this.fftsize;
			this.mic.connect( this.analyser );
			this.streamData = new Uint8Array( this.analyser.frequencyBinCount );
			this.intervalId = setInterval( this.sampleAudioStream, 1000 / 60 );
		}, function() {
			alert( 'error getting microphone input.' );
		} );
	}

	sampleAudioStream() {
		this.analyser.getByteFrequencyData( this.streamData );
	};

	get currentTime() {
		return ( Date.now() - this.startTime ) / 1000;
	};

	destroy() {
		this.stopSampling();
		this.mic.disconnect();
		this.analyser.disconnect();
	};

}

module.exports = MicrophoneDataSource;
