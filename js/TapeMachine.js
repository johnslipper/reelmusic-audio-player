var TapeMachine = new Class({
	Implements: [Options, Events],
	tape: null,
	degrees: 0,
	direction: 'anti',
	playback: 'pause',
	position: 0,
	multiplier: null,
	duration: null,
	volume: 50,
	playbackTimer: null,
	leftReel: null,
	rightReel: null,
	leftTape: null,
	rightTape: null,
	spoolSound: null,
	startSound: null,
	moveSound: null,
	animate: false,
	options: {/*
		onPlay: function(),
		onPause: function(),
		onRewind: function(),
		onFastforward: function(),
		onSpool: function(tape),
		onReady: function(tape),
		onEject: function(tape),
		onFailure: function(),*/
		volume: null,
		leftReelID: 'leftReel',
		rightReelID: 'rightReel',
		leftTapeID: 'leftTape',
		rightTapeID: 'rightTape',
		leftStripID: 'leftTapeStrip',
		rightStripID: 'rightTapeStrip',
		reelSize: 234,
		tapeSize: 155,
		tapeOffset: 65,
		spinSpeed: 5,
		leftStripLimits: [-66, -29],
		rightStripLimits: [31, 69],
		spoolSound: 'audio/reel-load',
		startSound: 'audio/reel-start',
		fastSound: 'audio/reel-fast',
		fxVolume: 30,
		animate: true
	},
	initialize: function(tape, options) {
		this.setOptions(options);
		if(!buzz.isSupported()) {this.fireEvent('failure');}
		else {
			this.multiplier = this.options.spinSpeed;
			this.leftReel = $(this.options.leftReelID);
			this.rightReel = $(this.options.rightReelID);
			this.leftTape = $(this.options.leftTapeID);
			this.rightTape = $(this.options.rightTapeID);
			this.leftStrip = $(this.options.leftStripID);
			this.rightStrip = $(this.options.rightStripID);
			if(this.options.animate){
				this._animationTest();
			}
			else {this.animate = false;}
			this._setupFX();
			if(tape) {this.spool(tape);}
			if(this.options.volume){
				this.volume = this.options.volume;
				this.setVolume();
			}
		}
	},
	_animationTest: function() {
		var animation = false,
		    animationstring = 'animation',
		    keyframeprefix = '',
		    domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
		    pfx  = '';
		 
		if( this.leftReel.style.animationName ) { animation = true; }    
		 
		if( animation === false ) {
		  for( var i = 0; i < domPrefixes.length; i++ ) {
		    if( this.leftReel.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
		      pfx = domPrefixes[ i ];
		      animationstring = pfx + 'Animation';
		      keyframeprefix = '-' + pfx.toLowerCase() + '-';
		      animation = true;
		      break;
		    }
		  }
		}
		if(animation){this.animate = true;}
//		alert(this.animate);
	},
	_setupFX: function() {
		this.spoolSound = new Tape(this.options.spoolSound, {
			preload:true,
			volume:this.options.fxVolume
		});
		this.startSound = new Tape(this.options.startSound, {
			preload:true,
			volume:this.options.fxVolume
		});
		this.fastSound = new Tape(this.options.fastSound, {
			preload:true,
			volume:this.options.fxVolume,
			loop:true
		});
	},
	_rotateElement: function(elem, deg){
		if(elem) {
			if(deg == undefined) {deg = 0;}
			if(Browser.ie) {elem.style.msTransform = 'rotate('+deg+'deg)';}
			else {
				elem.setStyles({
					'-moz-transform': 'rotate('+deg+'deg)',
					'-ms-transform': 'rotate('+deg+'deg)',
					'-o-transform': 'rotate('+deg+'deg)',
					'-webkit-transform': 'rotate('+deg+'deg)',
					'transform': 'rotate('+deg+'deg)',
				});
			}
		}
	},
	_rotateReels: function(deg) {
		if(deg != undefined) {this.degress = deg;}
		if(this.degrees <= 0) {this.degrees = 360;}
		if(this.degrees >= 360 && this.direction == 'clock') {this.degrees = 0;}
		this._rotateElement(this.leftReel, this.degrees);
		this._rotateElement(this.rightReel, this.degrees);
		this.degrees = (this.direction == 'clock') ? this.degrees+this.multiplier : this.degrees-this.multiplier;
	},
	_rotateTapeStrips: function() {
		var lLimit = this.options.leftStripLimits;
		var rLimit = this.options.rightStripLimits;
		var lDeg = lLimit[0] + ((lLimit[1] - lLimit[0]) / 100) * this.position;
		var rDeg = rLimit[0] + ((rLimit[1] - rLimit[0]) / 100) * this.position;
		this._rotateElement(this.leftStrip, lDeg);
		this._rotateElement(this.rightStrip, rDeg);
	},
	_setElementSize: function(elem, size) {
		if(elem && size != undefined) {
			var margin = (this.options.reelSize - size) / 2;
			elem.setStyles({
				'height': size,
				'width': size,
				'margin-left': margin,
				'margin-top': margin
			});
		}
	},
	_setElementScale: function(elem, scale) {
		if(elem && scale != undefined) {
			elem.setStyles({
				'-moz-transform': 'scale('+scale+')',
				'-ms-transform': 'scale('+scale+')',
				'-o-transform': 'scale('+scale+')',
				'-webkit-transform': 'scale('+scale+')',
				'transform': 'scale('+scale+')'
			});
		}
	},
	_resizeTape: function() {
		var tapePercent = this.options.tapeSize / 100;
		var rightSize = (tapePercent * this.position) + this.options.tapeOffset;
		var leftSize = this.options.tapeSize - (tapePercent * this.position) + this.options.tapeOffset;
		this._setElementSize(this.leftTape, leftSize);
		this._setElementSize(this.rightTape, rightSize);
	},
	_beginPlayback: function() {
		if(this.playbackTimer) {return;}
		var self = this;
		this.playbackTimer = setInterval(function() {
			if(!self.animate){self._rotateReels();}
			self._setPosition();
			self._rotateTapeStrips();
			if(self.position >= 100 || self.position < 0) {self.pause();}
		}, 50);
	},
	_pausePlayback: function() {
		clearInterval(this.playbackTimer);
		this.playbackTimer = null;
	},
	_setPosition: function() {
		this._resizeTape();
		this._rotateTapeStrips();
		var seconds = (this.tape.getDuration() / 100) * this.position;
		if(this.playback == 'rw') {
			this.position -= 1;
			this.tape.setPosition(seconds);
		}
		else if(this.playback == 'ff') {
			this.position += 1;
			this.tape.setPosition(seconds);
		}
		else {this.position = this.tape.getPercent();}
	},
	_checkTape: function() {
		if(!this.tape) {
			alert('Please Load a Tape');
			return false;
		}
		else {return true;}
	},
	_animateReels: function(state) {
		var state = state || '';
		this.leftReel.setProperty('class', state);
		this.rightReel.setProperty('class', state);
	},
	eject: function() {
		this.pause();
		this.fireEvent('eject', this.tape);
		this.tape.stop();
		this.tape = null;
		this.position = 0;
	},
	spool: function(tape) {
		var self = this;
		if(!tape){
			this._checkTape();
			return;
		}
		if(this.tape === tape) {return;}
		if(this.tape) {this.eject();}
		this.tape = tape;
		this.tape.load();
		this.setVolume();
		this.spoolSound.play();
		this.fireEvent('spool', this.tape);
		this.tape.addEvent('ready', function() {
			self.fireEvent('ready', self.tape);
			self._setPosition();
		});
	},
	play: function() {
		if(!this._checkTape()) {return;}
		if(this.playback != 'play'){
			if(this.animate) {this._animateReels('reverse normal');}
			this.tape.play();
			this.direction = 'anti';
			this.multiplier = this.options.spinSpeed;
			this.playback = 'play';
			this._beginPlayback();
			this.startSound.play();
			this.fastSound.pause();
			this.fireEvent('play');
		}
	},
	pause: function() {
		if(!this._checkTape()) {return;}
		if(this.playback != 'pause') {
			if(this.animate) {this._animateReels('reverse stop');}
			this.tape.pause();
			this.playback = 'pause';
			this._pausePlayback();
			this.startSound.play();
			this.fastSound.pause();
			this.fireEvent('pause');
		}
	},
	rewind: function() {
		if(!this._checkTape()) {return;}
		if(this.playback != 'rw' && this.position != 0) {
			this.pause();
			this.multiplier = 20;
			this.direction = 'clock';
			this.tape.pause();
			if(this.playback != 'play') {
				if(this.animate) {this._animateReels('forward fast');}
				this.playback = 'rw';
				this._beginPlayback();
				this.fastSound.play();
			}
		}
	},
	fastforward: function() {
		if(!this._checkTape()) {return;}
		if(this.playback != 'ff' && this.position != 100) {
			this.pause();
			this.multiplier = 20;
			this.direction = 'anti';
			this.tape.pause();
			if(this.playback != 'play') {
				if(this.animate) {this._animateReels('reverse fast');}
				this.playback = 'ff';
				this._beginPlayback();
				this.fastSound.play();
			}
		}
	},
	setVolume: function(volume) {
		if(volume != undefined) {this.volume = volume;}
		if(this.tape) {this.tape.setVolume(this.volume);}
	}
});