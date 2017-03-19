/* Requires Mootools 1.3 & Buzz 1.0.5 */
var Tape = new Class({
	Implements: [Options, Events],
	audio: null,
	duration: null,
	title: null,
	artist: null,
	album: null,
	download: null,
	website: null,
	options: {/*
		onReady: function(),
		onfailure: function(),*/
		title: null,
		artist: null,
		album: null,
		download: null,
		preload: false,
		loop: false,
		volume: 100
	},
	initialize: function(audioPath, options) {
		if(!audioPath) {alert('Please Provide Audio Path');return;}
		this.setOptions(options);
		this.audioPath = audioPath;
		if(!buzz.isSupported()) {this.fireEvent('failure');}
		else {
			if(this.options.title) {this.title = this.options.title;}
			if(this.options.artist) {this.artist = this.options.artist;}
			if(this.options.album) {this.album = this.options.album;}
			if(this.options.download) {this.download = this.options.download;}
			this._makeAudio();
		}
	},
	_makeAudio: function() {
		var self = this;
		if(!this.audioPath) {alert('Error - No Audio Path');return;}
		var preload = 'metadata';
		if(this.options.preload){preload = true;}
		this.audio = new buzz.sound(this.audioPath, {
			formats: ["mp3", "ogg"],
			preload: preload,
			loop: this.options.loop
			
		});
		this.setVolume(this.options.volume);
		this.audio.bind('canplaythrough', function() {
			self.fireEvent('ready');
		});
	},
	load: function() {
		this.audio.load();
	},
	play: function() {
		this.audio.play();
	},
	pause: function() {
		this.audio.pause();
	},
	stop: function() {
		this.audio.stop();
	},
	loop: function() {
		this.audio.loop();
	},
	unloop: function() {
		this.audio.unloop();
	},
	setVolume: function(volume) {
		if(volume === undefined) {var volume = 50;}
		this.audio.setVolume(volume);
	},
	setPosition: function(seconds) {
		var seconds = seconds || 0;
		this.audio.setTime(seconds);
	},
	getPosition: function() {
		return this.audio.getTime();
	},
	getPercent: function() {
		return this.audio.getPercent();
	},
	setPercent: function(percent) {
		var percent = percent || 0;
		this.audio.setPercent(percent);
	},
	
	getDuration: function() {
		return this.audio.getDuration();
	}
});