var browserOK = false;
var tapeReel;
var tapes = [];
var isPlaying = false;
var ejectTape = function(tape) {
	$('leftReelOuter').fade('out');
	$('rightReelOuter').fade('out');
	$('leftTapeStrip').setStyle('height', 0);
	$('rightTapeStrip').setStyle('height', 0);
	$('rightReelOuter').fade('out');
	$('playBtn').removeClass('active');
	$('info').empty();
	$('controls').setStyle('display','none');
}
var spooledTape = function(tape) {
	if(!tape) {return;}
	$('leftReelOuter').fade('in');
	$('rightReelOuter').fade('in');
}
var tapeReady = function(tape) {
	if(!tape) {return;}
	var infoList = $('info');
	infoList.empty();
	infoList.setStyle('opacity', 0);
	if(tape.title){createStrip('title', tape.title);}
	if(tape.artist){createStrip('artist', tape.artist);}
	if(tape.album){createStrip('album', tape.album);}
	$('leftTapeStrip').tween('height', 0, 260);
	$('rightTapeStrip').tween('height', 0, 260);
	$('controls').setStyle('display','block');
	infoList.fade('in');
	
	
	//Show Download Ribbon
	if(tape.download){
		var DLBtn = createDLBtn(tape.download);
		DLBtn.tween('height', 0, 38);
	}
}
var createStrip = function(label, content) {
	if(label && content) {
		var strip = new Element('li', {
			id: label, 
			'class': 'strip'
		}).inject($('info'));
		var label = new Element('label', {html: label+':'}).inject(strip);
		var span = new Element('span', {
			html: content,
			title: content
		}).inject(strip);
	}
}
var createDLBtn = function(link) {
	var li = new Element('li').inject($('info'));
	var DLLink = new Element('a', {
		id: 'downloadBtn',
		href: link,
		target: '_blank',
		title: 'Download Track'
	}).inject(li);
	return DLLink;
}
var populateTapes = function() {
	tapeList = $('tapes');
	for(var i=0; i<tapes.length; i++) {
		var title = tapes[i].title ? tapes[i].title : 'No Title';
		var li = new Element('li', {
			'class': 'tape-box',
			html: '<a href="javascript:tapeReel.spool(tapes['+i+']);" title="'+title+'"><span>'+title+'</span></a>'
		}).inject(tapeList);
	}
}
var showMessage = function() {
	var message = $('message');
	if(message) {
		if(message.getStyle('opacity')!= 1) {
			message.setStyle('left', '50%');
			message.fade('in');
		}
	}
}
window.addEvent('domready', function() {
	var tape1 = new Tape('audio/jazzology/jazzology-funky-ed', {
		preload: true,
		title: 'Funky Ed',
		artist: 'Jazzology',
		album: 'College Sessions',
		download: 'audio/jazzology/jazzology-funky-ed.mp3'
	});
	var tape2 = new Tape('audio/jazzology/jazzology-hall-of-the-mountain-king', {
		title: 'Hall of the Mountain King',
		artist: 'Jazzology',
		album: 'College Sessions',
		download: 'audio/jazzology/jazzology-hall-of-the-mountain-king.mp3'
	});
	tapes.push(tape1, tape2);
	tapeReel = new TapeMachine(tapes[0], {
		onEject: ejectTape,
		onSpool: spooledTape,
		onPause: function() {
			$('playBtn').removeClass('active');
		},
		onPlay: function() {
			$('playBtn').addClass('active');
		},
		onReady: tapeReady,
		onFailure: showMessage
	});
	populateTapes();
	
	// ADD EVENTS
	$('playBtn').addEvent('click', function() {
		if(tapeReel.playback != 'pause') {
			tapeReel.pause();
			this.removeClass('active');
		}
		else {
			this.addClass('active');
			tapeReel.play();
		}
	});
	$('rwBtn').addEvents({
		'mousedown': function() {
			isPlaying = tapeReel.playback == 'play' ? true : false;
			tapeReel.rewind();
		},
		'mouseup': function() {
			if(isPlaying){tapeReel.play();}
			else{tapeReel.pause();}
		}
	});
	$('ffBtn').addEvents({
		'mousedown': function() {
			isPlaying = tapeReel.playback == 'play' ? true : false;
			tapeReel.fastforward();
		},
		'mouseup': function() {
			if(isPlaying){tapeReel.play();}
			else{tapeReel.pause();}
		}
	});
	$('volUpBtn').addEvent('click', function() {
		if(tapeReel.volume <= 85) {
			tapeReel.setVolume(tapeReel.volume + 15);
		}
	});
	$('volDownBtn').addEvent('click', function() {
		if(tapeReel.volume >= 15) {
			tapeReel.setVolume(tapeReel.volume - 15);
		}
	});
	$('ejectBtn').addEvent('click', function() {
		tapeReel.eject();
	});
});
window.addEvent('load', function() {
	$('loading').fade('out');
});