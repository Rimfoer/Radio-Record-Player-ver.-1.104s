(function($) {
	$.fn.extend({
		play: function() {
			$(this).find('.play-button').trigger('click');
		},
		restart: function() {
			soundManager.destroySound(stationNames[currStation]);
			playStatus = 'connecting';
			currPlayerStatus('connecting');
			setTimeout($('.station.active').startPlay(url), 1000);
			showMessage('restart');
		},
		startPlay: function(link) {
			if(soundManager.soundIDs.length > 0) $('.station').stop();
			soundObject = soundManager.createSound({
				autoLoad: false,
				autoPlay: true,
				id: stationNames[currStation],
				onfinish: function() {
					$('.station.active').restart();
				},
				stream: true,
				url: link || url,
				useHtml5Audio: true,
				volume: smVolume,
				whileplaying: function() {
					if(localStorage.playSource !== 'current') $('.station.active').stop();
				}
			});
			if(soundManager.muted) {
				soundManager.unmute();
				$('.volume-click').animateSprite('frame', smVolume/10);
			}
			$('.watch').addClass('active');
			$('.station.active').children('.volume').addClass('active');
			localStorage.playSource = 'current';
			setMediaSession()
		},
		stop: function() {
			soundManager.destroySound(stationNames[currStation]);
			clearInterval(ctInterval);
			$('.station.active').children('.volume').removeClass('active');
			$('.station.active').find('.play-button').removeClass(['connecting','playing']);
			$('.watch').removeClass('active');
			ctInterval = undefined,
			currTime = 0,
			playStatus = 'stopped';
			setWatch(0);
			localStorage.playSource = '';
		}
	});
})(jQuery);
