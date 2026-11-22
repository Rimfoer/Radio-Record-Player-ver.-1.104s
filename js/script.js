let ctInterval, currStation, mInterval, radio, tInterval, updIntrvl, url;
let currParser = currTime = getCurVolPos = smErrorCounter = 0;
let	playStatus = 'reading', smVolume = localStorage.currVolume || 75, stationText = [[],[],[],[]];

$(function() {
	soundManager.setup({
		preferFlash: false,
		useHighPerformance: true,
		onready: function() {
			checkLSItems();
			currColorScheme();
			playStatus = 'stopped';
			localStorage.playSource = '';
			$('.station').children('.play').removeClass('disabled');
			$('.volume-click, .volume-rollover').animateSprite(animParams);
			$('.volume-click').animateSprite('play', `${Math.round(smVolume/10)}`);
			updateTitle(0);
		}
	});

	soundManager.onerror = function() {
		smErrorCounter++;
		if(smErrorCounter < 10) setTimeout(() => soundManager.reboot(), 3000);
	};

	$(document).on('click', '.play-button', function(e) {
		e.preventDefault();
		if($(this).hasClass('playing') && playStatus === 'playing') {
			$(this).stop();
		} else if($(this).closest('.station').hasClass('active') && playStatus === 'stopped') {
			$(this).startPlay(url);
		} else if($(this).hasClass('playing') && playStatus === 'ended') {
			$(this).restart();
		} else {
			if(soundManager.soundIDs.length > 0 || $('.station').hasClass('active')) {
				$(this).stop();
				$('.station').find('.cover').animate({opacity: 0.4}, 300);
				$('.station, .volume').removeClass('active');
			}
			/*******************************************/
			$(this).closest('.station').addClass('active');
			$('.station.active').find('.cover').animate({opacity: 1}, 300);
			radio = $('.station.active').attr('id'),
			currStation = $('.station.active').index(),
			url = stream[currStation];
			$(this).startPlay(url);
		}
	});

	$(document).on('mousemove mousedown', '.volume.active', function(e) {
		let xpos = e.offsetX || e.pageX-$(this).offset().left;
		let	VolXMouse = Number(Math.round(xpos/25*10)*10).VolLimiter();
		$(this).children('.volume-rollover').animateSprite(getCurVolPos === 0 ? 'play' : 'frame', `${Math.round(VolXMouse/10)}`);
		if(e.buttons === 1) { // лкм
			$('.volume-click').animateSprite('frame', Math.round(VolXMouse/10));
			smVolume = VolXMouse;
			soundManager.setVolume(stationNames[currStation], VolXMouse);
			localStorage.currVolume = VolXMouse;
			if(soundManager.muted) soundManager.unmute();
		}
		setTimeout(() => getCurVolPos = Math.round(VolXMouse/10), 300);
		showMessage('volume', VolXMouse);
	}).on('mouseleave', '.volume.active', function() {
		$(this).children('.volume-rollover').animateSprite('play', `r${getCurVolPos}`);
		setTimeout(() => getCurVolPos = 0, 300);
		showMessage();
	});

	$(document).on('mouseenter mouseover', '.listen-player-button', function() {
		$(this).closest('.listen-player').children('.listen-player-selector').addClass('active');
	}).on('click', '.listen-player-selector a', function() {
		if($(this).closest('.station').hasClass('active') && playStatus === 'playing') {
			$('.station.active').stop();
			showMessage('played');
		}
		$('.listen-player-selector').removeClass('active');
		return this.href;
	}).on('mouseleave', '.listen-player', function() {
		$('.listen-player-selector').removeClass('active');
	});

	$('.link a').on('click', function(e) {
		e.preventDefault();
		window.open(this.href, '_blank').focus();
	});

	$(document).on('dblclick', '.station-text', function() {
		let cs = $(this).closest('.station').index();
		if(arrRadioShows.includes(stationText[cs][1]) || arrTitles.includes(stationText[cs][1])) {
			showMessage('nocopy');
		} else if(isEmpty(stationText[cs][0]) || arrArtists.includes(stationText[cs][0])) {
			showMessage('nocopy');
		} else {
			navigator.clipboard.writeText(stationText[cs][0] + ' - ' + stationText[cs][1].replace(' (Record Mix)', ''));
			showMessage('copy');
		}
	}).on('mouseenter', '.station-text span', function() {
		if(localStorage.copyTextTip === 'false') {
			$(this).css('pointer-events', 'none');
			showMessage('copytext');
			setTimeout(() => $(this).css('pointer-events', ''), 6000);
			localStorage.copyTextTip = 'true';
		}
	});

	$(document).on('click', function() {
		$('.context-menu').removeClass('active');
	}).on('oncontextmenu', function() {
		return false;
	}).on('contextmenu', function(e) {
		e.preventDefault();
		$('.context-menu').removeClass('active');
		let h = parseInt($('.context-menu').css('height')),
			w = parseInt($('.context-menu').css('width')),
			l = e.pageX+w >= window.innerWidth/100*99 ? e.pageX-(w+15) : e.pageX,
			t = e.pageY+h >= window.innerHeight/100*97 ? e.pageY-(h+15) : e.pageY;
		$('.context-menu').css({left: `${l}px`, top: `${t}px`});
		$('.context-menu').addClass('active');
	}).on('click', '.context-menu ul li a', function(e) {
		e.preventDefault();
		$('.context-menu').removeClass('active');
		if(!$(this).attr('target')) {
			openURL(this.name, this.href);
		} else {
			window.open(this.href, '_blank').focus();
		}
	}).on('mouseleave', function() {
		$('.context-menu').removeClass('active');
	});

	$('body').on('mousemove', function(e) {
		let ht = parseInt($('.tooltip').css('height')), // высота и ширина
			wt = parseInt($('.tooltip').css('width')),  // всплывающей подсказки
			lt = e.pageX+wt >= window.innerWidth/100*99 ? e.pageX-(wt+32) : e.pageX+10,
			tt = e.pageY+ht >= window.innerHeight/100*97 ? e.pageY-(ht+2) : e.pageY-2;
		$('.tooltip').css({left: `${lt}px`, top: `${tt}px`});
	}).on('keydown', function(e) {
		switch(e.which) {
			case 27: // esc
				$('.context-menu, .listen-player-selector').removeClass('active');
				break;
			case 32: // пробел
				isUndefined(radio) ? $('.station.active').play() : showMessage('noselect');
				break;
			case (e.which >= 49 && e.which <= 52 ? e.which : false): // 1, 2, 3, 4 (не numpad!)
				$(`.station:eq(${e.which-49})`).play();
				break;
			case (e.which>=97 && e.which<=100 ? e.which : false): // 1, 2, 3, 4 (numpad)
				$(`.station:eq(${e.which-97})`).play();
				break;
			case 77: // m
				if(soundManager.muted) {
					soundManager.unmute();
					$('.volume-click').animateSprite('frame', smVolume/10);
					showMessage('unmute');
				} else {
					soundManager.mute();
					$('.volume-click').animateSprite('frame', 0);
					showMessage('mute');
				}
				break;
			case 82: { // r
				if(playStatus === 'playing' || playStatus === 'connecting') {
					$('.station.active').restart();
				} else if(!$('.station').hasClass('active')) {
					showMessage('noselect');
				} else {
					showMessage('notplaying');
				}
				break;
			}
		}
	});
});
